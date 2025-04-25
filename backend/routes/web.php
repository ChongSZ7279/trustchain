<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TestImagesController;

Route::get('/', function () {
    return view('welcome');
});

// Add route for testing task images
Route::get('/test-task-images', [TestImagesController::class, 'listFilesInStorage']);
