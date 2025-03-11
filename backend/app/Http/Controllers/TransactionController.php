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
        $transactions = Transaction::with(['user', 'charity', 'task'])
            ->orderBy('created_at', 'desc')
            ->get();

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
        $charity = Charity::findOrFail($charityId);
        
        $transactions = Transaction::with(['user', 'task'])
            ->where('charity_id', $charityId)
            ->orderBy('created_at', 'desc')
            ->get();
            
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
        $user = User::where('ic_number', $userId)->firstOrFail();
        
        $transactions = Transaction::with(['charity', 'task'])
            ->where('user_ic', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($transactions);
    }
}
