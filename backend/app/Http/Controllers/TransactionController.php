<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Charity;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

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
            ] : null,
            'request' => request()->all()
        ]);

        // Check if user is authenticated
        if (!Auth::check()) {
            \Log::warning('Unauthenticated user trying to access transactions');
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

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

        // Get paginated results
        $transactions = $query->latest()->paginate(request('per_page', 10));
        
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
        // Check if user is authenticated
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $user = Auth::user();
        
        // Check if the charity exists
        $charity = Charity::findOrFail($charityId);
        
        // Check if the user has permission to view this charity's transactions
        // User must be either the organization representative or the charity owner
        $hasPermission = $user->organizations()->whereHas('charities', function($query) use ($charityId) {
            $query->where('id', $charityId);
        })->exists();

        if (!$hasPermission) {
            return response()->json(['message' => 'Unauthorized to view these transactions'], 403);
        }
        
        $query = Transaction::with(['user', 'task'])
            ->where('charity_id', $charityId);

        // Apply search filter if provided
        if (request()->has('search')) {
            $searchTerm = request('search');
            $query->where(function($q) use ($searchTerm) {
                $q->where('id', 'like', "%{$searchTerm}%")
                  ->orWhere('transaction_hash', 'like', "%{$searchTerm}%")
                  ->orWhereHas('user', function($q) use ($searchTerm) {
                      $q->where('name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        // Apply status filter if provided
        if (request()->has('status')) {
            $query->where('status', request('status'));
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

        $transactions = $query->orderBy('created_at', 'desc')
            ->paginate(request('per_page', 12));
            
        return response()->json($transactions);
    }

    /**
     * Get transactions for a specific task.
     */
    public function getTaskTransactions($taskId)
    {
        $task = Task::findOrFail($taskId);
        
        $transactions = Transaction::with(['user', 'charity'])
            ->where('task_id', $taskId)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($transactions);
    }

    /**
     * Get transactions for a specific user.
     */
    public function getUserTransactions($userId)
    {
        // Debug logging
        \Log::info('getUserTransactions request', [
            'requested_user_id' => $userId,
            'auth_user' => Auth::user(),
            'headers' => request()->headers->all()
        ]);

        // Check if user is authenticated
        if (!Auth::check()) {
            \Log::warning('Unauthenticated user trying to access transactions');
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Check if the authenticated user is trying to access their own transactions
        if (Auth::user()->ic_number !== $userId) {
            \Log::warning('User trying to access unauthorized transactions', [
                'auth_user_ic' => Auth::user()->ic_number,
                'requested_user_ic' => $userId
            ]);
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        try {
            $user = User::where('ic_number', $userId)->firstOrFail();
            
            $transactions = Transaction::with(['charity', 'task'])
                ->where('user_ic', $userId)
                ->orderBy('created_at', 'desc')
                ->get();
            
            \Log::info('Successfully retrieved transactions', [
                'user_ic' => $userId,
                'count' => $transactions->count()
            ]);
                
            return response()->json($transactions);
        } catch (\Exception $e) {
            \Log::error('Error retrieving transactions', [
                'user_ic' => $userId,
                'error' => $e->getMessage()
            ]);
            
            return response()->json(['message' => 'Error retrieving transactions'], 500);
        }
    }
}
