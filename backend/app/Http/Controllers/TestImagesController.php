<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\TaskPicture;
use Illuminate\Support\Facades\Storage;

class TestImagesController extends Controller
{
    public function listFilesInStorage()
    {
        // List files in task directories
        $taskPictures = Storage::disk('public')->files('task_pictures');
        $taskProofs = Storage::disk('public')->files('task_proofs');
        
        // Get task data from database
        $tasks = Task::with('taskPictures')->get()->map(function($task) {
            return [
                'id' => $task->id,
                'name' => $task->name,
                'proof' => $task->proof,
                'pictures' => $task->taskPictures->map(function($pic) {
                    return [
                        'id' => $pic->id,
                        'path' => $pic->path
                    ];
                })
            ];
        });
        
        return response()->json([
            'task_pictures_in_storage' => $taskPictures,
            'task_proofs_in_storage' => $taskProofs,
            'tasks_in_database' => $tasks
        ]);
    }
}
