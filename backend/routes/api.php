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
use App\Http\Controllers\FinancialActivityController;

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
    Route::get('/charities/{charity}/donations', [DonationController::class, 'getCharityDonations']);

    // Combined financial activities routes
    Route::get('/financial-activities', [FinancialActivityController::class, 'index']);
    Route::get('/charities/{charity}/financial-activities', [FinancialActivityController::class, 'getCharityFinancialActivities']);

    // Organization financial activity routes
    Route::get('/organizations/{organization}/transactions', [OrganizationController::class, 'getOrganizationTransactions']);
    Route::get('/organizations/{organization}/donations', [OrganizationController::class, 'getOrganizationDonations']);
    Route::get('/organizations/{organization}/financial-activities', [OrganizationController::class, 'getOrganizationFinancialActivities']);

    // User financial activity routes
    Route::get('/users/{user}/donations', [UserController::class, 'getUserDonations']);
    Route::get('/users/{user}/financial-activities', [UserController::class, 'getUserFinancialActivities']);
    Route::get('/donations/{donation}/invoice', [DonationController::class, 'generateInvoice']);
    Route::get('/donations/{donation}/invoice-html', [DonationController::class, 'generateInvoiceHtml']);
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

// Add this outside of any middleware groups for testing
Route::get('/test-invoice', function() {
    try {
        $pdf = \PDF::loadView('invoices.test', [
            'title' => 'Test Invoice',
            'date' => now()->format('F j, Y')
        ]);
        
        return $pdf->download('test-invoice.pdf');
    } catch (\Exception $e) {
        \Log::error('Test invoice error', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Add this outside of any middleware groups for testing
Route::get('/simple-test-pdf', function() {
    try {
        // Create a very simple PDF with minimal content
        $html = '<html><body><h1>Test PDF</h1><p>This is a test.</p></body></html>';
        $pdf = \PDF::loadHTML($html);
        
        return $pdf->download('simple-test.pdf');
    } catch (\Exception $e) {
        \Log::error('Simple PDF test error', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Add this outside of any middleware groups for testing
Route::get('/test-invoice-html', function() {
    try {
        $html = '<html><body><h1>Test Invoice</h1><p>This is a test invoice.</p></body></html>';
        
        return response()->json([
            'html' => $html,
            'filename' => 'test-invoice.pdf'
        ]);
    } catch (\Exception $e) {
        \Log::error('Test invoice HTML error', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'message' => 'Failed to generate test invoice HTML',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Make sure this route is outside any middleware groups for testing
Route::get('/donations/{donation}/invoice-html', [App\Http\Controllers\DonationController::class, 'generateInvoiceHtml']);

// Add this test route to create a test donation
Route::get('/create-test-donation', function() {
    try {
        // Check if donation with ID 1 exists
        $existingDonation = \App\Models\Donation::find(1);
        
        if ($existingDonation) {
            return response()->json([
                'message' => 'Test donation already exists',
                'donation' => $existingDonation
            ]);
        }
        
        // Find a valid user and charity
        $user = \App\Models\User::first();
        $charity = \App\Models\Charity::first();
        
        if (!$user || !$charity) {
            return response()->json([
                'message' => 'Cannot create test donation - no users or charities found',
                'users_exist' => (bool)$user,
                'charities_exist' => (bool)$charity
            ], 500);
        }
        
        // Create a test donation
        $donation = new \App\Models\Donation();
        $donation->id = 1; // Force ID to be 1
        $donation->user_id = $user->ic_number;
        $donation->amount = 100.00;
        $donation->currency_type = 'USD';
        $donation->cause_id = $charity->id;
        $donation->status = 'completed';
        $donation->donor_message = 'This is a test donation';
        $donation->is_anonymous = false;
        $donation->save();
        
        return response()->json([
            'message' => 'Test donation created successfully',
            'donation' => $donation
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to create test donation',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Add this test route to directly return HTML for a donation
Route::get('/donations/{donation}/direct-html', function($donationId) {
    try {
        $donation = \App\Models\Donation::find($donationId);
        
        if (!$donation) {
            return response()->json([
                'message' => 'Donation not found',
                'error' => 'The requested donation does not exist'
            ], 404);
        }
        
        // Create a simple HTML directly
        $html = "
        <html>
        <head>
            <title>Simple Donation Receipt</title>
            <style>
                body { font-family: Arial, sans-serif; }
                .container { max-width: 800px; margin: 0 auto; padding: 20px; }
                h1 { color: #4f46e5; }
            </style>
        </head>
        <body>
            <div class='container'>
                <h1>Donation Receipt</h1>
                <p><strong>Receipt No:</strong> INV-" . str_pad($donation->id, 6, '0', STR_PAD_LEFT) . "</p>
                <p><strong>Date:</strong> " . now()->format('F j, Y') . "</p>
                <p><strong>Amount:</strong> $" . number_format($donation->amount, 2) . " " . $donation->currency_type . "</p>
                <p><strong>Status:</strong> " . ucfirst($donation->status) . "</p>
                <p>Thank you for your donation!</p>
            </div>
        </body>
        </html>
        ";
        
        return response()->json([
            'html' => $html,
            'filename' => "donation-invoice-{$donationId}.pdf"
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to generate direct HTML',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Add this test route to check database tables
Route::get('/check-database', function() {
    try {
        $tables = [
            'donations' => \App\Models\Donation::count(),
            'users' => \App\Models\User::count(),
            'charities' => \App\Models\Charity::count(),
            'transactions' => \App\Models\Transaction::count(),
        ];
        
        $donationSample = \App\Models\Donation::first();
        $userSample = \App\Models\User::first();
        $charitySample = \App\Models\Charity::first();
        
        return response()->json([
            'message' => 'Database check completed',
            'table_counts' => $tables,
            'donation_sample' => $donationSample ? $donationSample->toArray() : null,
            'user_sample' => $userSample ? $userSample->toArray() : null,
            'charity_sample' => $charitySample ? $charitySample->toArray() : null,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Database check failed',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Add this test route to use a simplified template
Route::get('/donations/{donation}/simple-html', function($donationId) {
    try {
        $donation = \App\Models\Donation::find($donationId);
        
        if (!$donation) {
            return response()->json([
                'message' => 'Donation not found',
                'error' => 'The requested donation does not exist'
            ], 404);
        }
        
        $data = [
            'donation' => $donation,
            'date' => now()->format('F j, Y'),
            'invoiceNumber' => 'INV-' . str_pad($donation->id, 6, '0', STR_PAD_LEFT)
        ];
        
        $html = view('invoices.simple', $data)->render();
        
        return response()->json([
            'html' => $html,
            'filename' => "donation-invoice-{$donationId}.pdf"
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to generate simple HTML',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
}); 