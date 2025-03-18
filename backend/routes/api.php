<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\CharityController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskPictureController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\OrganizationFollowerController;
use App\Http\Controllers\CharityFollowerController;
use App\Http\Controllers\DonationController;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\TestController;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\FixTaskController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
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

// Public task routes
Route::get('/charities/{charityId}/tasks', [TaskController::class, 'index']);
Route::get('/tasks/{id}', [TaskController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Protected user routes
    Route::match(['put', 'patch'], '/users/{id}', [UserController::class, 'update']);
    
    // Protected organization routes
    Route::match(['put', 'patch'], '/organizations/{id}', [OrganizationController::class, 'update']);
    Route::delete('/organizations/{id}', [OrganizationController::class, 'destroy']);

    // Organization follower routes
    Route::post('/organizations/{organizationId}/follow', [OrganizationFollowerController::class, 'toggleFollow']);
    Route::get('/organizations/{organizationId}/follow-status', [OrganizationFollowerController::class, 'checkFollowStatus']);
    Route::get('/user/followed-organizations', [OrganizationFollowerController::class, 'getFollowedOrganizations']);

    // Charity follower routes
    Route::post('/charities/{charityId}/follow', [CharityFollowerController::class, 'toggleFollow']);
    Route::get('/charities/{charityId}/follow-status', [CharityFollowerController::class, 'checkFollowStatus']);
    Route::get('/user/followed-charities', [CharityFollowerController::class, 'getFollowedCharities']);

    // Protected charity routes
    Route::post('/charities', [CharityController::class, 'store']);
    Route::match(['put', 'patch'], '/charities/{id}', [CharityController::class, 'update']);
    Route::delete('/charities/{id}', [CharityController::class, 'destroy']);

    // Protected task routes
    Route::post('/charities/{charityId}/tasks', [TaskController::class, 'store']);
    Route::match(['put', 'patch'], '/tasks/{id}', [TaskController::class, 'update']);
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
    
    // Debug fix task route
    Route::put('/fix-tasks/{id}', [FixTaskController::class, 'update']);
    
    // Task Pictures routes
    Route::get('/tasks/{taskId}/pictures', [TaskPictureController::class, 'index']);
    Route::post('/tasks/{taskId}/pictures', [TaskPictureController::class, 'store']);
    Route::delete('/tasks/{taskId}/pictures/{pictureId}', [TaskPictureController::class, 'destroy']);
    
    // Transaction routes
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::get('/charities/{charityId}/transactions', [TransactionController::class, 'getCharityTransactions']);
    Route::get('/tasks/{taskId}/transactions', [TransactionController::class, 'getTaskTransactions']);
    Route::get('/users/{userId}/transactions', [TransactionController::class, 'getUserTransactions']);

    // Donation routes
    Route::apiResource('donations', DonationController::class);
    Route::get('/user/donations', [DonationController::class, 'userDonations']);
    Route::get('/charity/{charityId}/donations', [DonationController::class, 'charityDonations']);
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

// Add test routes
Route::post('/test-login', [TestController::class, 'testLogin']);
Route::get('/test-database', [TestController::class, 'testDatabase']);

// Debug route for file uploads
Route::post('/test-upload', function (Request $request) {
    Log::info('Test upload request received', [
        'all_data' => $request->all(),
        'has_files' => $request->hasFile('test_file'),
        'files' => $request->allFiles(),
        'headers' => $request->header(),
        'content_type' => $request->header('Content-Type'),
    ]);
    
    if ($request->hasFile('test_file')) {
        $file = $request->file('test_file');
        $path = $file->store('test_uploads', 'public');
        return response()->json([
            'message' => 'File uploaded successfully',
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mime' => $file->getMimeType(),
        ]);
    }
    
    return response()->json([
        'message' => 'No file uploaded',
        'data' => $request->all(),
    ]);
}); 