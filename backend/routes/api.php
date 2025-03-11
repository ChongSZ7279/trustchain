<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\CharityController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Storage;

// Public routes
Route::post('/register/user', [AuthController::class, 'registerUser']);
Route::post('/register/organization', [AuthController::class, 'registerOrganization']);
Route::post('/login', [AuthController::class, 'login']);

// Organization routes
Route::get('/organizations', [OrganizationController::class, 'index']);
Route::get('/organizations/{id}', [OrganizationController::class, 'show']);

// Public charity routes
Route::get('/charities', [CharityController::class, 'index']);
Route::get('/charities/{id}', [CharityController::class, 'show']);
Route::get('/organizations/{id}/charities', [CharityController::class, 'organizationCharities']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Protected user routes
    Route::match(['put', 'patch'], '/users/{id}', [UserController::class, 'update']);
    
    // Protected organization routes
    Route::match(['put', 'patch'], '/organizations/{id}', [OrganizationController::class, 'update']);
    Route::delete('/organizations/{id}', [OrganizationController::class, 'destroy']);

    // Protected charity routes
    Route::post('/charities', [CharityController::class, 'store']);
    Route::match(['put', 'patch'], '/charities/{id}', [CharityController::class, 'update']);
    Route::delete('/charities/{id}', [CharityController::class, 'destroy']);

    // Task routes
    Route::get('/charities/{charityId}/tasks', [TaskController::class, 'index']);
    Route::get('/tasks/{id}', [TaskController::class, 'show']);
    Route::post('/charities/{charityId}/tasks', [TaskController::class, 'store']);
    Route::match(['put', 'patch'], '/tasks/{id}', [TaskController::class, 'update']);
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
});

// Add a test route to check storage configuration
Route::get('/storage-test', function () {
    $disk = config('filesystems.disks.public');
    $files = Storage::disk('public')->files();
    
    return response()->json([
        'disk_config' => $disk,
        'files' => $files,
        'storage_path' => storage_path('app/public'),
        'public_path' => public_path('storage'),
        'app_url' => config('app.url')
    ]);
}); 