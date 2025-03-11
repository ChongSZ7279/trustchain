<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskPicture extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'path',
        'original_filename',
        'mime_type',
        'file_size',
    ];

    /**
     * Get the task that owns the picture.
     */
    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
