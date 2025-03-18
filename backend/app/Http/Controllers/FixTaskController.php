<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\Charity;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class FixTaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            // Log the request data for debugging
            Log::info('Task update request received', [
                'task_id' => $id,
                'request_data' => $request->all(),
                'files' => $request->allFiles(),
                'headers' => $request->header(),
                'content' => $request->getContent(),
            ]);

            $task = Task::with('charity')->findOrFail($id);

            // Check if user is authenticated and owns the charity
            if (!Auth::user() || Auth::user()->getTable() !== 'organizations' || Auth::id() !== $task->charity->organization_id) {
                return response()->json(['message' => 'Unauthorized - Only charity owners can update tasks'], 403);
            }

            // Get the input data
            $data = $request->all();
            Log::info('Request data before validation', ['data' => $data]);

            // Handle validation separately to provide better debugging
            $validator = Validator::make($data, [
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'fund_targeted' => 'required|numeric|min:0',
                'status' => 'required|in:pending,in_progress,completed',
                'proof' => 'nullable|mimes:pdf,doc,docx,jpeg,png,jpg,gif|max:2048',
            ]);

            if ($validator->fails()) {
                Log::error('Task validation failed', [
                    'task_id' => $id,
                    'errors' => $validator->errors()->toArray()
                ]);
                
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();

            if ($request->hasFile('proof')) {
                if ($task->proof) {
                    Storage::disk('public')->delete($task->proof);
                }
                $validated['proof'] = $request->file('proof')->store('task_proofs', 'public');
            }

            // Log validation success and data to be saved
            Log::info('Task validation success, updating task', [
                'task_id' => $id,
                'validated_data' => $validated
            ]);

            $task->update($validated);
            
            // Return the updated task with a success message
            return response()->json([
                'message' => 'Task updated successfully',
                'task' => $task
            ]);
        } catch (\Exception $e) {
            // Log the exception
            Log::error('Task update failed', [
                'task_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return error response
            return response()->json([
                'message' => 'Failed to update task',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
