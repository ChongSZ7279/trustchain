<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Charity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

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
            'status' => 'required|in:pending,in_progress,completed',
            'proof' => 'nullable|mimes:pdf,doc,docx,jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('proof')) {
            if ($task->proof) {
                Storage::disk('public')->delete($task->proof);
            }
            $validated['proof'] = $request->file('proof')->store('task_proofs', 'public');
        }

        $task->update($validated);
        return response()->json($task);
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