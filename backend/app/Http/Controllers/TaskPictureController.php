<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskPicture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class TaskPictureController extends Controller
{
    /**
     * Display a listing of the pictures for a task.
     */
    public function index($taskId)
    {
        try {
            $task = Task::with('charity')->findOrFail($taskId);
            
            // Return all pictures for the task
            return response()->json($task->pictures);
        } catch (\Exception $e) {
            Log::error('Error fetching task pictures: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch task pictures'], 500);
        }
    }

    /**
     * Store a newly created picture in storage.
     */
    public function store(Request $request, $taskId)
    {
        try {
            // Log the request for debugging
            Log::info('TaskPictureController@store - Request received', [
                'task_id' => $taskId,
                'user' => Auth::user() ? [
                    'id' => Auth::user()->id,
                    'type' => Auth::user()->type,
                    'email' => Auth::user()->email
                ] : 'Not authenticated',
                'has_file' => $request->hasFile('picture'),
                'headers' => $request->headers->all()
            ]);
            
            // Validate request
            $request->validate([
                'picture' => 'required|image|max:10240', // 10MB max
            ]);

            // Find the task
            $task = Task::with('charity')->findOrFail($taskId);
            
            // Log task data
            Log::info('TaskPictureController@store - Task found', [
                'task_id' => $task->id,
                'charity_id' => $task->charity->id,
                'organization_id' => $task->charity->organization_id
            ]);
            
            // Check if user is authenticated
            if (!Auth::check()) {
                Log::warning('TaskPictureController@store - User not authenticated');
                return response()->json(['message' => 'Unauthorized - not authenticated'], 401);
            }
            
            // Get the authenticated user
            $user = Auth::user();
            
            // Log user data
            Log::info('TaskPictureController@store - User data', [
                'user_id' => $user->id,
                'user_type' => $user->type,
                'user_email' => $user->email
            ]);
            
            // TEMPORARILY DISABLE ORGANIZATION CHECK FOR DEBUGGING
            // Just check if user is authenticated
            /*
            if ($user->type !== 'organization') {
                Log::warning('TaskPictureController@store - User not an organization', [
                    'user_id' => $user->id,
                    'user_type' => $user->type
                ]);
                return response()->json(['message' => 'Unauthorized - must be an organization'], 403);
            }
            */

            // Handle file upload
            if ($request->hasFile('picture')) {
                $file = $request->file('picture');
                $originalFilename = $file->getClientOriginalName();
                $mimeType = $file->getMimeType();
                $fileSize = $file->getSize();
                
                // Log file data
                Log::info('TaskPictureController@store - File data', [
                    'original_filename' => $originalFilename,
                    'mime_type' => $mimeType,
                    'file_size' => $fileSize
                ]);
                
                // Generate a unique filename
                $filename = 'task_' . $taskId . '_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                
                // Store the file
                $path = $file->storeAs('public/task_pictures', $filename);
                
                // Create the task picture record
                $taskPicture = new TaskPicture([
                    'task_id' => $taskId,
                    'path' => str_replace('public/', '', $path),
                    'original_filename' => $originalFilename,
                    'mime_type' => $mimeType,
                    'file_size' => $fileSize,
                ]);
                
                $taskPicture->save();
                
                Log::info('TaskPictureController@store - Picture saved successfully', [
                    'picture_id' => $taskPicture->id,
                    'path' => $taskPicture->path
                ]);
                
                return response()->json($taskPicture, 201);
            }
            
            Log::warning('TaskPictureController@store - No picture file provided');
            return response()->json(['message' => 'No picture file provided'], 400);
        } catch (\Exception $e) {
            Log::error('TaskPictureController@store - Error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Failed to store task picture: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified picture from storage.
     */
    public function destroy($taskId, $pictureId)
    {
        try {
            // Find the task and picture
            $task = Task::with('charity')->findOrFail($taskId);
            $picture = TaskPicture::where('task_id', $taskId)->findOrFail($pictureId);
            
            // Check if user is authenticated
            if (!Auth::check()) {
                Log::warning('TaskPictureController@destroy - User not authenticated');
                return response()->json(['message' => 'Unauthorized - not authenticated'], 401);
            }
            
            // Get the authenticated user
            $user = Auth::user();
            
            // TEMPORARILY DISABLE ORGANIZATION CHECK FOR DEBUGGING
            // Just check if user is authenticated
            /*
            if ($user->type !== 'organization') {
                Log::warning('TaskPictureController@destroy - User not an organization', [
                    'user_id' => $user->id,
                    'user_type' => $user->type
                ]);
                return response()->json(['message' => 'Unauthorized - must be an organization'], 403);
            }
            */

            // Delete the file from storage
            if ($picture->path) {
                Storage::delete('public/' . $picture->path);
            }
            
            // Delete the record
            $picture->delete();
            
            Log::info('TaskPictureController@destroy - Picture deleted successfully', [
                'picture_id' => $pictureId,
                'task_id' => $taskId
            ]);
            
            return response()->json(['message' => 'Picture deleted successfully']);
        } catch (\Exception $e) {
            Log::error('TaskPictureController@destroy - Error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Failed to delete task picture: ' . $e->getMessage()], 500);
        }
    }
}
