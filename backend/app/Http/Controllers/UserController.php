<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Models\Donation;
use App\Models\Transaction;
use Illuminate\Pagination\LengthAwarePaginator;

class UserController extends Controller
{
    public function update(Request $request, $ic_number)
    {
        // Find user by IC number
        $user = User::where('ic_number', $ic_number)->firstOrFail();

        // Validate user has permission to update
        if (Auth::user()->ic_number !== $ic_number) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Validate request data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone_number' => 'required|string',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'front_ic_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'back_ic_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Handle file uploads
        if ($request->hasFile('profile_picture')) {
            // Delete old profile picture if exists
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }
            $validated['profile_picture'] = $request->file('profile_picture')->store('profile_pictures', 'public');
        }

        if ($request->hasFile('front_ic_picture')) {
            // Delete old front IC picture if exists
            if ($user->front_ic_picture) {
                Storage::disk('public')->delete($user->front_ic_picture);
            }
            $validated['front_ic_picture'] = $request->file('front_ic_picture')->store('ic_pictures', 'public');
        }

        if ($request->hasFile('back_ic_picture')) {
            // Delete old back IC picture if exists
            if ($user->back_ic_picture) {
                Storage::disk('public')->delete($user->back_ic_picture);
            }
            $validated['back_ic_picture'] = $request->file('back_ic_picture')->store('ic_pictures', 'public');
        }

        try {
            $user->update($validated);
            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all donations for a user
     */
    public function getUserDonations(Request $request, $userId)
    {
        try {
            $user = User::where('ic_number', $userId)->firstOrFail();
            
            $donations = Donation::with(['charity'])
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->get();
            
            // Add source field to each donation
            $donations->transform(function ($donation) {
                $donation->source = 'Donation';
                return $donation;
            });
            
            \Log::info('Successfully retrieved donations', [
                'user_ic' => $userId,
                'count' => $donations->count()
            ]);
                
            return response()->json($donations);
        } catch (\Exception $e) {
            \Log::error('Error retrieving donations', [
                'user_ic' => $userId,
                'error' => $e->getMessage()
            ]);
            
            return response()->json(['message' => 'Error retrieving donations'], 500);
        }
    }

    /**
     * Get all financial activities for a user
     */
    public function getUserFinancialActivities(Request $request, $userId)
    {
        try {
            $user = User::where('ic_number', $userId)->firstOrFail();
            
            // Get transactions
            $transactions = Transaction::with(['charity', 'task'])
                ->where('user_ic', $userId)
                ->get();
            
            // Add source field to each transaction
            $transactions->transform(function ($transaction) {
                $transaction->source = 'Transaction';
                return $transaction;
            });
            
            // Get donations
            $donations = Donation::with(['charity'])
                ->where('user_id', $userId)
                ->get();
            
            // Add source field to each donation
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
            
            \Log::info('Successfully retrieved financial activities', [
                'user_ic' => $userId,
                'transactions_count' => $transactions->count(),
                'donations_count' => $donations->count(),
                'total_count' => $combined->count()
            ]);
                
            return $paginator;
        } catch (\Exception $e) {
            \Log::error('Error retrieving financial activities', [
                'user_ic' => $userId,
                'error' => $e->getMessage()
            ]);
            
            return response()->json(['message' => 'Error retrieving financial activities'], 500);
        }
    }
} 