<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use App\Models\Task;
use App\Models\Donation;
use App\Models\Charity;
use App\Services\BlockchainService;

class AdminVerificationController extends Controller
{
    /**
     * Get tasks that need verification
     */
    public function getTasks(Request $request)
    {
        // Skip auth check for testing
        if (Auth::check() && !Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized - Only admins can access this resource'], 403);
        }

        $status = $request->input('status', 'pending'); // Default to pending instead of verified

        // Include transactions related to tasks
        $query = Task::with([
            'charity.organization',
            'pictures',
            'transactions' => function($query) {
                $query->orderBy('created_at', 'desc');
            }
        ]);

        // Filter by status
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // For verified tasks, only show those that haven't had funds released yet
        if ($status === 'verified') {
            $query->where('funds_released', false);
        }

        // Get tasks
        $tasks = $query->orderBy('updated_at', 'desc')->get();

        // Log for debugging
        \Log::info('Admin verification tasks request', [
            'status' => $status,
            'count' => $tasks->count(),
            'user_id' => Auth::id(),
        ]);

        return response()->json($tasks);
    }

    /**
     * Get donations that need verification
     */
    public function getDonations(Request $request)
    {
        // Skip auth check for testing
        if (Auth::check() && !Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized - Only admins can access this resource'], 403);
        }

        $status = $request->input('status', 'pending'); // Default to pending instead of verified

        $query = Donation::with(['user', 'charity.organization', 'transaction']);

        // Special case for pending verification
        if ($status === 'pending') {
            // Get donations that have a transaction hash but are still pending
            $query->where(function($q) {
                $q->where('status', 'pending')
                  ->whereNotNull('transaction_hash');
            });
        }
        // Filter by status for other cases
        elseif ($status !== 'all') {
            $query->where('status', $status);
        }

        // Get donations
        $donations = $query->orderBy('updated_at', 'desc')->get();

        // Log for debugging
        \Log::info('Admin verification donations request', [
            'status' => $status,
            'count' => $donations->count(),
            'user_id' => Auth::id(),
            'has_transaction_hash' => $donations->filter(function($d) { return !empty($d->transaction_hash); })->count(),
        ]);

        return response()->json($donations);
    }

    /**
     * Get verification statistics
     */
    public function getStats()
    {
        // Skip auth check for testing
        if (Auth::check() && !Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized - Only admins can access this resource'], 403);
        }

        // Count pending donations with transaction hash
        $pendingDonationsWithTxHash = Donation::where('status', 'pending')
            ->whereNotNull('transaction_hash')
            ->count();

        $stats = [
            'tasks' => [
                'pending' => Task::where('status', 'pending')->count(),
                'verified' => Task::where('status', 'verified')->where('funds_released', false)->count(),
                'completed' => Task::where('status', 'verified')->where('funds_released', true)->count(),
                'total' => Task::count()
            ],
            'donations' => [
                'pending' => Donation::where('status', 'pending')->count(),
                'pending_with_tx_hash' => $pendingDonationsWithTxHash,
                'verified' => Donation::where('status', 'verified')->count(),
                'completed' => Donation::where('status', 'completed')->count(),
                'total' => Donation::count()
            ],
            'charities' => [
                'total' => Charity::count(),
                'with_wallet' => Charity::whereHas('organization', function($query) {
                    $query->whereNotNull('wallet_address');
                })->count()
            ],
            'debug' => [
                'pending_donations_sample' => Donation::where('status', 'pending')
                    ->whereNotNull('transaction_hash')
                    ->take(3)
                    ->get(['id', 'transaction_hash', 'status', 'amount'])
            ]
        ];

        // Log for debugging
        \Log::info('Admin verification stats request', [
            'stats' => $stats,
            'user_id' => Auth::id(),
        ]);

        return response()->json($stats);
    }

    /**
     * Verify a donation
     */
    public function verifyDonation(Request $request, $id)
    {
        // Skip auth check for testing
        if (Auth::check() && !Auth::user()->is_admin) {
            return response()->json(['success' => false, 'message' => 'Unauthorized - Only admins can verify donations'], 403);
        }

        // Find the donation
        $donation = Donation::find($id);

        if (!$donation) {
            return response()->json(['success' => false, 'message' => 'Donation not found'], 404);
        }

        // Check if donation is in pending status
        if ($donation->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Only pending donations can be verified'], 400);
        }

        // Update donation status to verified
        $donation->status = 'verified';
        $donation->verified_at = now();
        $donation->save();

        // Note: Funds will be released when a task is verified

        return response()->json([
            'success' => true,
            'message' => 'Donation verified successfully',
            'donation' => $donation
        ]);
    }

    /**
     * Verify a task and automatically release funds
     */
    public function verifyTask(Request $request, $id)
    {
        // Log the request with detailed information
        Log::info('Task verification request received', [
            'task_id' => $id,
            'user_id' => Auth::id(),
            'is_admin' => Auth::check() ? Auth::user()->is_admin : false,
            'request_method' => $request->method(),
            'request_headers' => $request->headers->all(),
            'request_ip' => $request->ip(),
            'request_path' => $request->path(),
        ]);

        // Always allow verification for testing purposes
        // This is a temporary change for debugging
        $isAdmin = true;

        // Skip auth check for testing
        if (Auth::check() && !Auth::user()->is_admin && !$isAdmin) {
            Log::warning('Unauthorized task verification attempt', [
                'user_id' => Auth::id(),
                'task_id' => $id
            ]);
            return response()->json(['success' => false, 'message' => 'Unauthorized - Only admins can verify tasks'], 403);
        }

        // Find the task
        $task = Task::find($id);

        if (!$task) {
            return response()->json(['success' => false, 'message' => 'Task not found'], 404);
        }

        // Check if task is in pending status
        if ($task->status !== 'pending') {
            // If the task is already verified, return a more specific message
            if ($task->status === 'verified') {
                return response()->json([
                    'success' => false,
                    'message' => 'This task has already been verified',
                    'transaction_hash' => $task->transaction_hash ?? null,
                    'explorer_url' => $task->transaction_hash ? "https://sepolia.scrollscan.com/tx/{$task->transaction_hash}" : null
                ], 400);
            }

            return response()->json(['success' => false, 'message' => 'Only pending tasks can be verified'], 400);
        }

        // Check if the task has proof document
        if (!$task->proof) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot verify task: No proof document uploaded'
            ], 400);
        }

        // Check if the charity has a wallet address
        $charity = Charity::with('organization')->find($task->charity_id);
        if (!$charity || !$charity->organization || !$charity->organization->wallet_address) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot verify task: Charity does not have a wallet address'
            ], 400);
        }

        // Update task status to verified
        $task->status = 'verified';

        // Automatically release funds
        $task->funds_released = true;
        $task->save();

        try {
            // Call the blockchain service to transfer funds
            // Use the new EthereumTransactionService if available, otherwise fall back to BlockchainService
            if (class_exists('\App\Services\EthereumTransactionService')) {
                $transactionService = new \App\Services\EthereumTransactionService();
                Log::info('Using EthereumTransactionService for fund release');
            } else {
                $transactionService = new BlockchainService();
                Log::info('Using BlockchainService for fund release');
            }

            $amount = 1.0; // Amount in SCROLL - in a real implementation, this would be calculated based on verified donations
            $result = $transactionService->releaseFunds(
                $charity->organization->wallet_address,
                $amount
            );

            // Check if the result was successful
            if (!isset($result['success']) || !$result['success']) {
                Log::error('Failed to release funds', [
                    'task_id' => $task->id,
                    'charity_id' => $charity->id,
                    'error' => $result['message'] ?? 'Unknown error'
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to release funds: ' . ($result['message'] ?? 'Unknown error')
                ], 500);
            }

            // Get the transaction hash from the result
            $txHash = $result['transaction_hash'];

            // Log the transaction hash
            Log::info('Transaction hash received', [
                'task_id' => $task->id,
                'charity_id' => $charity->id,
                'transaction_hash' => $txHash,
                'explorer_url' => $result['explorer_url'] ?? null
            ]);
        } catch (\Exception $e) {
            Log::error('Exception when releasing funds', [
                'task_id' => $task->id,
                'charity_id' => $charity->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error releasing funds: ' . $e->getMessage()
            ], 500);
        }

        // Check if transaction_hash column exists before trying to set it
        if (Schema::hasColumn('tasks', 'transaction_hash')) {
            $task->transaction_hash = $txHash;
            $task->save();
        }

        try {
            // Create a transaction record
            $transaction = new \App\Models\Transaction([
                'task_id' => $task->id,
                'charity_id' => $charity->id,
                'amount' => $amount,
                'type' => 'fund_release',
                'status' => 'completed',
                'transaction_hash' => $txHash,
                'contract_address' => env('CONTRACT_ADDRESS'),
                'message' => 'Funds released after task verification',
                'user_ic' => Auth::check() ? Auth::user()->ic_number : '999999999999', // Use admin user or default
                'anonymous' => false,
            ]);
            $transaction->save();

            Log::info('Transaction record created successfully', [
                'transaction_id' => $transaction->id,
                'task_id' => $task->id,
                'transaction_hash' => $txHash
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating transaction record', [
                'error' => $e->getMessage(),
                'task_id' => $task->id,
                'transaction_hash' => $txHash
            ]);

            // Continue execution - we don't want to fail the whole process if just the transaction record fails
            // The task is already marked as verified and the funds are released
        }

        return response()->json([
            'success' => true,
            'message' => 'Task verified and initial funds released to charity wallet',
            'task' => $task,
            'transaction_hash' => $txHash,
            'explorer_url' => $result['explorer_url'] ?? "https://sepolia.scrollscan.com/tx/{$txHash}",
            'note' => 'Additional funds may be released automatically as new donations are verified for this charity.'
        ]);
    }
}
