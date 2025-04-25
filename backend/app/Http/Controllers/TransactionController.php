<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Charity;
use App\Models\Task;
use App\Models\User;
use App\Models\Donation;
use App\Helpers\DonationSyncHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Debug logging
        \Log::info('Transaction index request received', [
            'user' => Auth::user() ? [
                'id' => Auth::id(),
                'ic_number' => Auth::user()->ic_number,
                'type' => get_class(Auth::user())
            ] : 'guest',
            'request' => request()->all()
        ]);

        // Transactions are now public - no authentication check needed

        $query = Transaction::with(['user', 'charity', 'task']);

        // Apply search filter if provided
        if (request()->has('search')) {
            $searchTerm = request('search');
            $query->where(function($q) use ($searchTerm) {
                $q->where('id', 'like', "%{$searchTerm}%")
                  ->orWhere('transaction_hash', 'like', "%{$searchTerm}%")
                  ->orWhereHas('charity', function($q) use ($searchTerm) {
                      $q->where('name', 'like', "%{$searchTerm}%");
                  })
                  ->orWhereHas('user', function($q) use ($searchTerm) {
                      $q->where('name', 'like', "%{$searchTerm}%");
                  });
            });
            \Log::info('Applied search filter:', ['search_term' => $searchTerm]);
        }

        // Apply status filter if provided
        if (request()->has('status')) {
            $query->where('status', request('status'));
            \Log::info('Applied status filter:', ['status' => request('status')]);
        }

        // Apply date range filter if provided
        if (request()->has('dateRange')) {
            $dateRange = request('dateRange');
            if (!empty($dateRange['start'])) {
                $query->whereDate('created_at', '>=', $dateRange['start']);
            }
            if (!empty($dateRange['end'])) {
                $query->whereDate('created_at', '<=', $dateRange['end']);
            }
        }

        // Apply amount range filter if provided
        if (request()->has('amountRange')) {
            $amountRange = request('amountRange');
            if (!empty($amountRange['min'])) {
                $query->where('amount', '>=', $amountRange['min']);
            }
            if (!empty($amountRange['max'])) {
                $query->where('amount', '<=', $amountRange['max']);
            }
        }

        // Get paginated results with consistent per_page value
        $perPage = request('per_page', 10);
        $transactions = $query->latest()->paginate($perPage);

        // Log pagination details
        \Log::info('Transaction pagination details:', [
            'requested_per_page' => $perPage,
            'actual_per_page' => $transactions->perPage(),
            'total' => $transactions->total(),
            'current_page' => $transactions->currentPage(),
            'last_page' => $transactions->lastPage()
        ]);

        \Log::info('Transaction query results:', [
            'total' => $transactions->total(),
            'current_page' => $transactions->currentPage(),
            'per_page' => $transactions->perPage(),
            'last_page' => $transactions->lastPage(),
            'has_data' => $transactions->isNotEmpty()
        ]);

        return response()->json($transactions);
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
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:charity,task',
            'charity_id' => 'required_if:type,charity|exists:charities,id',
            'task_id' => 'required_if:type,task|exists:tasks,id',
            'transaction_hash' => 'nullable|string',
            'contract_address' => 'nullable|string',
            'message' => 'nullable|string',
            'anonymous' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Set user_ic if not anonymous
        if (!($request->anonymous ?? false)) {
            $data['user_ic'] = Auth::user() ? Auth::user()->ic_number : $request->user_ic;
        }

        // Set default status
        $data['status'] = 'completed';

        // Create transaction
        $transaction = Transaction::create($data);

        // Update charity or task fund_received
        if ($request->type === 'charity' && $request->charity_id) {
            $charity = Charity::find($request->charity_id);
            if ($charity) {
                $charity->fund_received = $charity->fund_received + $request->amount;
                $charity->save();
            }
        } elseif ($request->type === 'task' && $request->task_id) {
            $task = Task::find($request->task_id);
            if ($task) {
                $task->fund_received = $task->fund_received + $request->amount;
                $task->save();
            }
        }

        // Load relationships
        $transaction->load(['user', 'charity', 'task']);

        return response()->json($transaction, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $transaction)
    {
        $transaction->load(['user', 'charity', 'task']);
        return response()->json($transaction);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Transaction $transaction)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Transaction $transaction)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transaction $transaction)
    {
        //
    }

    /**
     * Get transactions for a specific charity.
     */
    public function getCharityTransactions($charityId)
    {
        // Add logging to debug
        \Log::info("Fetching transactions for charity: $charityId");

        // Validate charity exists
        $charity = Charity::findOrFail($charityId);

        // Get transactions with relationships
        $transactions = Transaction::where('charity_id', $charityId)
            ->with(['user', 'task']) // Include all needed relationships
            ->orderBy('created_at', 'desc');

        // Apply filters if provided
        if (request()->has('type')) {
            $transactions->where('type', request('type'));
        }

        if (request()->has('status')) {
            $transactions->where('status', request('status'));
        }

        // Get results
        $results = $transactions->get();

        // Add charity name to each transaction for easier display
        $results->each(function($transaction) use ($charity) {
            $transaction->charity_name = $charity->name;
        });

        // Also get donations that might not be in the transactions table
        try {
            // First, ensure all donations are synced with transactions
            $donations = Donation::where('cause_id', $charityId)->get();

            // Sync each donation with transactions
            foreach ($donations as $donation) {
                DonationSyncHelper::syncDonationWithTransaction($donation);
            }

            // Get any donations that might not have been synced properly
            $donationsNotInTransactions = Donation::where('cause_id', $charityId)
                ->whereNotExists(function($query) {
                    $query->select(DB::raw(1))
                          ->from('transactions')
                          ->whereRaw('transactions.transaction_hash = donations.transaction_hash');
                })
                ->get();

            // Convert donations to transaction format
            $formattedDonations = $donationsNotInTransactions->map(function($donation) use ($charity) {
                return [
                    'id' => 'donation-' . $donation->id,
                    'charity_id' => $donation->cause_id,
                    'amount' => $donation->amount,
                    'type' => 'charity', // Using 'charity' type for donations as per the enum constraint
                    'status' => $donation->status,
                    'transaction_hash' => $donation->transaction_hash,
                    'message' => $donation->donor_message,
                    'created_at' => $donation->created_at,
                    'updated_at' => $donation->updated_at,
                    'charity_name' => $charity->name,
                    'currency_type' => $donation->currency_type,
                    'is_donation' => true
                ];
            });

            // Add formatted donations to results
            $results = $results->concat($formattedDonations);

            // Sort by date (newest first)
            $results = $results->sortByDesc('created_at')->values();

            \Log::info("Added {$formattedDonations->count()} donations to transactions for charity: {$charity->name}");
        } catch (\Exception $e) {
            \Log::error("Error adding donations to transactions: {$e->getMessage()}");
        }

        \Log::info("Found " . $results->count() . " transactions for charity: {$charity->name}");

        return response()->json($results);
    }

    /**
     * Get transactions for a specific task.
     */
    public function getTaskTransactions($taskId)
    {
        // Validate task exists
        $task = Task::findOrFail($taskId);

        // Get transactions with relationships
        $transactions = Transaction::with(['user', 'charity'])
            ->where('task_id', $taskId)
            ->orderBy('created_at', 'desc');

        // Apply filters if provided
        if (request()->has('type')) {
            $transactions->where('type', request('type'));
        }

        if (request()->has('status')) {
            $transactions->where('status', request('status'));
        }

        // Get results
        $results = $transactions->get();

        // Add task name to each transaction for easier display
        $results->each(function($transaction) use ($task) {
            $transaction->task_name = $task->name;
            if ($transaction->charity_id) {
                $transaction->charity_name = $transaction->charity->name ?? 'Unknown Charity';
            }
        });

        \Log::info("Found " . $results->count() . " transactions for task: {$task->name}");

        return response()->json($results);
    }

    /**
     * Get transactions for a specific user.
     */
    public function getUserTransactions($userId)
    {
        try {
            // Log the request
            \Log::info('Fetching transactions for user', ['user_ic' => $userId]);

            // Get transactions with relationships
            $transactions = Transaction::with(['charity', 'task'])
                ->where('user_ic', $userId)
                ->orderBy('created_at', 'desc')
                ->get();

            // Enhance transaction data
            $transactions->each(function($transaction) {
                if ($transaction->charity) {
                    $transaction->charity_name = $transaction->charity->name;
                }
                if ($transaction->task) {
                    $transaction->task_name = $transaction->task->name;
                }
            });

            \Log::info('Found transactions', ['count' => $transactions->count()]);

            return response()->json($transactions);
        } catch (\Exception $e) {
            \Log::error('Error fetching user transactions', [
                'user_ic' => $userId,
                'error' => $e->getMessage()
            ]);
            return response()->json(['message' => 'Error fetching transactions'], 500);
        }
    }
}


