<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class FinancialActivityController extends Controller
{
    public function index(Request $request)
    {
        // Get transactions
        $transactionQuery = Transaction::query();
        
        // Apply filters to transactions
        // ...
        
        // Get donations
        $donationQuery = Donation::query();
        
        // Apply filters to donations
        // ...
        
        // Execute queries
        $transactions = $transactionQuery->get();
        $donations = $donationQuery->get();
        
        // Add source field to each record
        $transactions->transform(function ($transaction) {
            $transaction->source = 'Transaction';
            return $transaction;
        });
        
        $donations->transform(function ($donation) {
            $donation->source = 'Donation';
            return $donation;
        });
        
        // Combine and sort by date
        $combined = $transactions->concat($donations)
            ->sortByDesc('created_at');
        
        // Manual pagination
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 10);
        $items = $combined->forPage($page, $perPage);
        
        $paginator = new LengthAwarePaginator(
            $items,
            $combined->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );
        
        return $paginator;
    }
    
    public function getCharityFinancialActivities(Request $request, $charityId)
    {
        // Get charity transactions
        $transactionQuery = Transaction::where('charity_id', $charityId);
        
        // Apply filters to transactions
        // ...
        
        // Get charity donations
        $donationQuery = Donation::where('cause_id', $charityId);
        
        // Apply filters to donations
        // ...
        
        // Execute queries and combine as in index method
        // ...
        
        return $paginator;
    }
} 