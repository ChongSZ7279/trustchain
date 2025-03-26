<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Charity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use PDF;

class TaskController extends Controller
{
    public function index($charityId)
    {
        $tasks = Task::with('pictures')->where('charity_id', $charityId)->get();
        return response()->json($tasks);
    }

    public function show($id)
    {
        $task = Task::with(['charity.organization', 'pictures'])->findOrFail($id);
        return response()->json($task);
    }

    public function store(Request $request, $charityId)
    {
        $charity = Charity::findOrFail($charityId);

        // Log the incoming request data
        \Log::info('Task creation request:', [
            'charity_id' => $charityId,
            'request_data' => $request->all(),
            'files' => $request->allFiles()
        ]);

        // Check if user is authenticated and owns the charity
        if (!Auth::user() || Auth::user()->getTable() !== 'organizations' || Auth::id() !== $charity->organization_id) {
            return response()->json(['message' => 'Unauthorized - Only charity owners can create tasks'], 403);
        }

        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'fund_targeted' => 'required|numeric|min:0',
                'proof' => 'nullable|mimes:pdf,doc,docx,jpeg,png,jpg,gif|max:2048',
                'pictures.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            if ($request->hasFile('proof')) {
                $validated['proof'] = $request->file('proof')->store('task_proofs', 'public');
            }

            $validated['charity_id'] = $charityId;
            $validated['status'] = 'pending';

            // Create the task
            $task = Task::create($validated);

            // Handle picture uploads
            if ($request->hasFile('pictures')) {
                $uploadedPictures = [];
                foreach ($request->file('pictures') as $picture) {
                    $path = $picture->store('task_pictures', 'public');
                    $uploadedPictures[] = [
                        'task_id' => $task->id,
                        'path' => $path,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                
                // Insert new pictures
                if (!empty($uploadedPictures)) {
                    \DB::table('task_pictures')->insert($uploadedPictures);
                }
            }

            // Load the pictures relationship
            $task->load('pictures');
            
            return response()->json($task, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Task validation failed:', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            throw $e;
        }
    }

    public function update(Request $request, $id)
    {
        $task = Task::with('charity')->findOrFail($id);

        // Check if user is authenticated and owns the charity
        if (!Auth::user() || Auth::user()->getTable() !== 'organizations' || Auth::id() !== $task->charity->organization_id) {
            return response()->json(['message' => 'Unauthorized - Only charity owners can update tasks'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'fund_targeted' => 'required|numeric|min:0',
            'status' => 'required|in:pending,in_progress,completed,verified',
            'proof' => 'nullable|mimes:pdf,doc,docx,jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('proof')) {
            if ($task->proof) {
                Storage::disk('public')->delete($task->proof);
            }
            $validated['proof'] = $request->file('proof')->store('task_proofs', 'public');
        }

        // Check verification requirements
        $picturesCount = $task->pictures()->count();
        if ($validated['status'] === Task::STATUS_VERIFIED) {
            if ($picturesCount < Task::REQUIRED_PICTURES || !$task->proof) {
                return response()->json([
                    'message' => 'Verification requirements not met',
                    'required' => [
                        'pictures' => Task::REQUIRED_PICTURES,
                        'current_pictures' => $picturesCount,
                        'proof' => $task->proof ? 'Uploaded' : 'Required'
                    ]
                ], 422);
            }
        }

        // Update verification status
        $validated['verification_status'] = $task->verificationComplete() ? 'complete' : 'incomplete';
        
        // If verification is complete and status is verified, release funds
        if ($task->verificationComplete() && $validated['status'] === Task::STATUS_VERIFIED) {
            $validated['funds_released'] = true;
            // Trigger blockchain transaction for fund release
            event(new TaskFundsReleased($task));
        }

        $task->update($validated);
        return response()->json($task);
    }

    public function verifyMilestone(Request $request, $id)
    {
        $task = Task::with('charity')->findOrFail($id);

        // Check if user is authenticated and owns the charity
        if (!Auth::user() || Auth::user()->getTable() !== 'organizations' || Auth::id() !== $task->charity->organization_id) {
            return response()->json(['message' => 'Unauthorized - Only charity owners can verify milestones'], 403);
        }

        // Check verification requirements
        if (!$task->verificationComplete()) {
            return response()->json([
                'message' => 'Verification requirements not met',
                'required' => [
                    'pictures' => Task::REQUIRED_PICTURES,
                    'current_pictures' => $task->pictures()->count(),
                    'proof' => $task->proof ? 'Uploaded' : 'Required'
                ]
            ], 422);
        }

        $task->update([
            'status' => Task::STATUS_VERIFIED,
            'verification_status' => 'complete',
            'funds_released' => true
        ]);

        // Trigger blockchain transaction for fund release
        event(new TaskFundsReleased($task));

        return response()->json($task);
    }

    public function downloadTaxReceipt($id)
    {
        $task = Task::with(['charity.organization'])->findOrFail($id);
        
        // Check if user has donated to this task
        if (!Auth::check() || !$task->donations()->where('user_id', Auth::id())->exists()) {
            return response()->json(['message' => 'Unauthorized - Only donors can download tax receipts'], 403);
        }

        // Generate tax receipt
        $pdf = PDF::loadView('tax_receipts.donation', [
            'task' => $task,
            'donor' => Auth::user(),
            'donation' => $task->donations()->where('user_id', Auth::id())->first(),
            'organization' => $task->charity->organization
        ]);

        return $pdf->download('tax_receipt_' . $task->id . '.pdf');
    }

    public function destroy($id)
    {
        $task = Task::with('charity')->findOrFail($id);

        // Check if user is authenticated and owns the charity
        if (!Auth::user() || Auth::user()->getTable() !== 'organizations' || Auth::id() !== $task->charity->organization_id) {
            return response()->json(['message' => 'Unauthorized - Only charity owners can delete tasks'], 403);
        }

        if ($task->proof) {
            Storage::disk('public')->delete($task->proof);
        }

        $task->delete();
        return response()->json(['message' => 'Task deleted successfully']);
    }
} 