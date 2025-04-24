<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
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
// use App\Http\Controllers\TestController;
use App\Http\Controllers\FixTaskController;
use App\Http\Controllers\FinancialActivityController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\BlockchainController;
use App\Http\Controllers\StripePaymentController;
use App\Http\Controllers\FiatToScrollConverter;
use App\Http\Controllers\StripeController;
use App\Http\Controllers\BlockchainFundReleaseController;
use App\Http\Controllers\AdminVerificationController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/register/user', [AuthController::class, 'registerUser']);
Route::post('/register/organization', [AuthController::class, 'registerOrganization']);
Route::post('/login', [AuthController::class, 'login']);

// Fiat to Scroll public routes
Route::get('/scroll-conversion-rates', [FiatToScrollConverter::class, 'getConversionRates']);

// Stripe public routes
Route::post('/stripe/create-payment-intent', [StripeController::class, 'createPaymentIntent']);

// Organization routes
Route::get('/organizations', [OrganizationController::class, 'index']);
Route::get('/organizations/{id}', [OrganizationController::class, 'show']);

// Public charity routes
Route::get('/charities', [CharityController::class, 'index']);
Route::get('/charities/{id}', [CharityController::class, 'show']);
Route::get('/organizations/{id}/charities', [CharityController::class, 'organizationCharities']);
Route::get('/charities/{id}/donations', [DonationController::class, 'charityDonations']);
Route::post('/charities/{id}/donations', [DonationController::class, 'store'])->middleware('auth:sanctum');

// Public task routes
Route::get('/charities/{charityId}/tasks', [TaskController::class, 'index']);
Route::get('/tasks/{id}', [TaskController::class, 'show']);

// Public transaction routes
Route::get('/transactions', [TransactionController::class, 'index']);
Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);
Route::get('/charities/{charityId}/transactions', [TransactionController::class, 'getCharityTransactions']);
Route::get('/tasks/{taskId}/transactions', [TransactionController::class, 'getTaskTransactions']);

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

    // Protected transaction routes
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::get('/users/{userId}/transactions', [TransactionController::class, 'getUserTransactions']);

    // Protected donation routes
    Route::post('/charities/{id}/donations', [DonationController::class, 'store']);
    Route::get('/donations/{donation}', [DonationController::class, 'show']);

    // Other donation-related routes
    Route::post('/blockchain-donations', [DonationController::class, 'storeBlockchainDonation']);
    Route::get('/user/donations', [DonationController::class, 'userDonations']);

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

    // Fiat to Scroll conversion routes
    Route::post('/process-fiat-donation', [FiatToScrollConverter::class, 'convertAndDonate']);

    // Blockchain fund release routes (admin only)
    Route::post('/tasks/{taskId}/release-funds', [BlockchainFundReleaseController::class, 'releaseTaskFunds']);
    Route::post('/donations/{donationId}/release-funds', [BlockchainFundReleaseController::class, 'releaseDonationFunds']);

    // Admin verification routes (moved outside auth middleware)

    // Stripe routes
    // Moved outside auth middleware
    // Route::post('/stripe/create-payment-intent', [StripeController::class, 'createPaymentIntent']);
});

// Public endpoints for donations
Route::get('/donations', [DonationController::class, 'index']);
Route::post('/donations', [DonationController::class, 'store']);

// Public blockchain donation endpoint for unauthenticated donations
Route::post('/blockchain-donations-noauth', [DonationController::class, 'storeBlockchainDonationNoAuth']);

// Public fiat-to-scroll endpoint for unauthenticated donations
Route::post('/fiat-to-scroll-noauth', [FiatToScrollConverter::class, 'convertAndDonateNoAuth']);

// Simplified donation endpoint with minimal constraints
Route::post('/simple-donation', [DonationController::class, 'storeSimpleDonation']);

// Direct donation endpoint using raw SQL
Route::post('/direct-donation', [DonationController::class, 'directDonation']);

// Sync donations with transactions
Route::post('/sync-donations', [DonationController::class, 'syncDonations'])->middleware('auth:sanctum');

// Test route for donations without auth
Route::post('/charities/{id}/donations/test', [DonationController::class, 'testDonation']);

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

// Add test routes - commented out due to missing TestController
// Route::post('/test-login', [TestController::class, 'testLogin']);
// Route::get('/test-database', [TestController::class, 'testDatabase']);

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
// Commented out due to missing PDF class
/*
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
*/

// Add this outside of any middleware groups for testing
// Commented out due to missing PDF class
/*
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
*/

// Add this outside of any middleware groups for testing
Route::get('/test-invoice-html', function() {
    try {
        $html = '<html><body><h1>Test Invoice</h1><p>This is a test invoice.</p></body></html>';

        return response()->json([
            'html' => $html,
            'filename' => 'test-invoice.pdf'
        ]);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Test invoice HTML error', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        return response()->json(['error' => 'PDF generation failed: ' . $e->getMessage()], 500);
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
        $donation->fund_received = 0;
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

// Add this test route to check verification data
Route::get('/check-verification', function() {
    try {
        $pendingDonations = \App\Models\Donation::where('status', 'pending')
            ->whereNotNull('transaction_hash')
            ->with(['user', 'charity.organization', 'transaction'])
            ->get();

        $pendingTasks = \App\Models\Task::where('status', 'pending')
            ->with(['charity.organization', 'pictures'])
            ->get();

        $verifiedTasks = \App\Models\Task::where('status', 'verified')
            ->where('funds_released', false)
            ->with(['charity.organization', 'pictures'])
            ->get();

        return response()->json([
            'pending_donations' => $pendingDonations,
            'pending_tasks' => $pendingTasks,
            'verified_tasks' => $verifiedTasks,
            'pending_donations_count' => $pendingDonations->count(),
            'pending_tasks_count' => $pendingTasks->count(),
            'verified_tasks_count' => $verifiedTasks->count()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to check verification data',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Add this test route to check admin verification endpoints without auth
Route::get('/test-admin-verification', function() {
    try {
        // Get tasks that need verification
        $tasksQuery = \App\Models\Task::with(['charity.organization', 'pictures']);
        $tasksQuery->where('status', 'pending');
        $tasks = $tasksQuery->orderBy('updated_at', 'desc')->get();

        // Get donations that need verification
        $donationsQuery = \App\Models\Donation::with(['user', 'charity.organization', 'transaction']);
        $donationsQuery->where(function($q) {
            $q->where('status', 'pending')
              ->whereNotNull('transaction_hash');
        });
        $donations = $donationsQuery->orderBy('updated_at', 'desc')->get();

        return response()->json([
            'tasks' => $tasks,
            'donations' => $donations,
            'tasks_count' => $tasks->count(),
            'donations_count' => $donations->count()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to test admin verification',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Add this test route to check database tables directly
Route::get('/check-verification-tables', function() {
    try {
        // Check if the tasks table has the 'verified' status
        $taskStatusTypes = DB::select("SHOW COLUMNS FROM tasks WHERE Field = 'status'")[0]->Type ?? null;

        // Check if donations have transaction hashes
        $donationsWithTxHash = \App\Models\Donation::whereNotNull('transaction_hash')->count();
        $pendingDonationsWithTxHash = \App\Models\Donation::where('status', 'pending')
            ->whereNotNull('transaction_hash')
            ->count();

        // Get sample data
        $pendingTasks = \App\Models\Task::where('status', 'pending')->take(3)->get(['id', 'name', 'status']);
        $verifiedTasks = \App\Models\Task::where('status', 'verified')->take(3)->get(['id', 'name', 'status']);
        $pendingDonations = \App\Models\Donation::where('status', 'pending')
            ->whereNotNull('transaction_hash')
            ->take(3)
            ->get(['id', 'transaction_hash', 'status', 'amount']);

        return response()->json([
            'task_status_types' => $taskStatusTypes,
            'donations_with_tx_hash' => $donationsWithTxHash,
            'pending_donations_with_tx_hash' => $pendingDonationsWithTxHash,
            'pending_tasks_sample' => $pendingTasks,
            'verified_tasks_sample' => $verifiedTasks,
            'pending_donations_sample' => $pendingDonations,
            'tasks_table_exists' => Schema::hasTable('tasks'),
            'donations_table_exists' => Schema::hasTable('donations'),
            'tasks_count' => \App\Models\Task::count(),
            'donations_count' => \App\Models\Donation::count()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to check verification tables',
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

// Contact form route
Route::post('/contact', [ContactController::class, 'submit']);

// Test route for admin middleware
Route::get('/test-admin-middleware', function() {
    return response()->json(['message' => 'Admin middleware is working!']);
})->middleware(\App\Http\Middleware\AdminMiddleware::class);

// Admin routes
Route::middleware(['auth:sanctum', \App\Http\Middleware\AdminMiddleware::class])->prefix('admin')->group(function () {
    // User verification routes
    Route::get('/users', [\App\Http\Controllers\UserController::class, 'getAllUsers']);
    Route::post('/users/{ic_number}/verify', [\App\Http\Controllers\UserController::class, 'verifyUser']);
});

// Admin verification routes
Route::middleware(['auth:sanctum', \App\Http\Middleware\AdminMiddleware::class])->prefix('admin/verification')->group(function () {
    // Task verification routes
    Route::get('/tasks', [\App\Http\Controllers\AdminVerificationController::class, 'getTasks']);
    Route::post('/tasks/{id}/verify', [\App\Http\Controllers\AdminVerificationController::class, 'verifyTask']);
    
    // Organization verification routes
    Route::get('/organizations', [\App\Http\Controllers\AdminVerificationController::class, 'getOrganizations']);
    Route::post('/organizations/{id}/verify', [\App\Http\Controllers\AdminVerificationController::class, 'verifyOrganization']);
    
    // Charity verification routes
    Route::get('/charities', [\App\Http\Controllers\AdminVerificationController::class, 'getCharities']);
    Route::post('/charities/{id}/verify', [\App\Http\Controllers\AdminVerificationController::class, 'verifyCharity']);
    
    // User verification routes
    Route::get('/users', [\App\Http\Controllers\AdminVerificationController::class, 'getUsers']);
    Route::post('/users/{id}/verify', [\App\Http\Controllers\AdminVerificationController::class, 'verifyUser']);
    
    // Dashboard stats
    Route::get('/stats', [\App\Http\Controllers\AdminVerificationController::class, 'getStats']);
});

// Debug routes for verification
Route::get('/check-verification-tables', [\App\Http\Controllers\AdminVerificationController::class, 'checkVerificationTables']);
Route::get('/check-verification-organizations', [\App\Http\Controllers\AdminVerificationController::class, 'checkOrganizationVerification']);
Route::get('/check-verification-charities', [\App\Http\Controllers\AdminVerificationController::class, 'checkCharityVerification']);

// Add these routes
Route::get('/blockchain/donation-count', [BlockchainController::class, 'getDonationCount']);
Route::post('/blockchain/verify-transaction', [BlockchainController::class, 'verifyTransaction']);

// Add Stripe payment routes
Route::post('/process-card-payment', [StripePaymentController::class, 'processPayment'])->middleware('auth:sanctum');

// Add this test route to create a test charity
Route::get('/create-test-charity', function() {
    try {
        // Check if charity already exists
        $existingCharity = \App\Models\Charity::where('name', 'Test Charity')->first();

        if ($existingCharity) {
            return response()->json([
                'message' => 'Test charity already exists',
                'charity' => $existingCharity
            ]);
        }

        // Find or create an organization
        $organization = \App\Models\Organization::first();
        if (!$organization) {
            // Create a test organization if none exists
            $organization = \App\Models\Organization::create([
                'name' => 'Test Organization',
                'email' => 'test@example.com',
                'description' => 'This is a test organization',
                'registration_number' => 'TEST123456',
                'address' => '123 Test Street',
                'phone' => '123-456-7890',
                'website' => 'https://example.com',
                'verified' => true
            ]);
        }

        // Create a charity
        $charity = \App\Models\Charity::create([
            'name' => 'Test Charity',
            'description' => 'This is a test charity for donation testing',
            'organization_id' => $organization->id,
            'target_amount' => 10000,
            'current_amount' => 0,
            'start_date' => now(),
            'end_date' => now()->addMonths(3),
            'status' => 'active',
            'fund_received' => 0,
        ]);

        return response()->json([
            'message' => 'Test charity created successfully',
            'charity' => $charity
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to create test charity',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Debug route to check API accessibility
Route::get('/debug', function() {
    return response()->json([
        'status' => 'success',
        'message' => 'API is accessible',
        'time' => now()->toDateTimeString(),
        'environment' => app()->environment(),
    ]);
});