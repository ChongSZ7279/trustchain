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
        if ($request->has('search')) {
            $search = $request->input('search');
            $transactionQuery->where(function($q) use ($search) {
                $q->where('transaction_hash', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('status')) {
            $transactionQuery->where('status', $request->input('status'));
        }
        
        if ($request->has('dateRange')) {
            $dateRange = $request->input('dateRange');
            if (!empty($dateRange['start'])) {
                $transactionQuery->whereDate('created_at', '>=', $dateRange['start']);
            }
            if (!empty($dateRange['end'])) {
                $transactionQuery->whereDate('created_at', '<=', $dateRange['end']);
            }
        }
        
        if ($request->has('amountRange')) {
            $amountRange = $request->input('amountRange');
            if (!empty($amountRange['min'])) {
                $transactionQuery->where('amount', '>=', $amountRange['min']);
            }
            if (!empty($amountRange['max'])) {
                $transactionQuery->where('amount', '<=', $amountRange['max']);
            }
        }
        
        // Get donations
        $donationQuery = Donation::query();
        
        // Apply the same filters to donations
        if ($request->has('search')) {
            $search = $request->input('search');
            $donationQuery->where(function($q) use ($search) {
                $q->where('transaction_hash', 'like', "%{$search}%")
                  ->orWhere('donor_message', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('status')) {
            $donationQuery->where('status', $request->input('status'));
        }
        
        if ($request->has('dateRange')) {
            $dateRange = $request->input('dateRange');
            if (!empty($dateRange['start'])) {
                $donationQuery->whereDate('created_at', '>=', $dateRange['start']);
            }
            if (!empty($dateRange['end'])) {
                $donationQuery->whereDate('created_at', '<=', $dateRange['end']);
            }
        }
        
        if ($request->has('amountRange')) {
            $amountRange = $request->input('amountRange');
            if (!empty($amountRange['min'])) {
                $donationQuery->where('amount', '>=', $amountRange['min']);
            }
            if (!empty($amountRange['max'])) {
                $donationQuery->where('amount', '<=', $amountRange['max']);
            }
        }
        
        // Execute queries with relationships
        $transactions = $transactionQuery->with(['user', 'charity'])->get();
        $donations = $donationQuery->with(['user', 'charity'])->get();
        
        // Add source field to each record
        $transactions->transform(function ($transaction) {
            $transaction->source = 'Transaction';
            return $transaction;
        });
        
        $donations->transform(function ($donation) {
            $donation->source = 'Donation';
            return $donation;
        });
        
        // Log the counts for debugging
        \Log::info("Combined data counts:", [
            'transactions' => $transactions->count(),
            'donations' => $donations->count()
        ]);
        
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
        if ($request->has('search')) {
            $search = $request->input('search');
            $transactionQuery->where(function($q) use ($search) {
                $q->where('transaction_hash', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }
        
        // Get charity donations - note we use cause_id here
        $donationQuery = Donation::where('cause_id', $charityId);
        
        // Apply filters to donations
        if ($request->has('search')) {
            $search = $request->input('search');
            $donationQuery->where(function($q) use ($search) {
                $q->where('transaction_hash', 'like', "%{$search}%")
                  ->orWhere('donor_message', 'like', "%{$search}%");
            });
        }
        
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
} 