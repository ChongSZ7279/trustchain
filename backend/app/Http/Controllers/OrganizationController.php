<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Models\Charity;
use App\Models\Transaction;
use App\Models\Donation;
use Illuminate\Pagination\LengthAwarePaginator;


class OrganizationController extends Controller
{
    public function index(Request $request)
    {
        $query = Organization::query();

        // Apply search filter if provided
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        // Apply category filter if provided
        if ($request->has('categories')) {
            $categories = $request->categories;
            $query->whereIn('category', $categories);
        }

        // Apply status filter if provided
        if ($request->has('statuses')) {
            $statuses = $request->statuses;
            $query->where(function($q) use ($statuses) {
                foreach ($statuses as $status) {
                    if ($status === 'verified') {
                        $q->orWhere('is_verified', true);
                    } else if ($status === 'pending') {
                        $q->orWhere('is_verified', false);
                    }
                }
            });
        }

        // Get paginated results
        $perPage = $request->input('per_page', 12); // Default to 12 items per page
        $organizations = $query->paginate($perPage);

        // Add follower count and following status to each organization
        $organizations->each(function ($organization) {
            try {
                $organization->follower_count = $organization->followers()->count();
                
                $user = Auth::user();
                if ($user) {
                    $organization->is_following = $organization->followers()->where('user_ic', $user->ic_number)->exists();
                } else {
                    $organization->is_following = false;
                }
            } catch (\Exception $e) {
                $organization->follower_count = 0;
                $organization->is_following = false;
            }
        });

        return response()->json($organizations);
    }

    public function show($id)
    {
        $organization = Organization::findOrFail($id);
        
        // Add follower count
        $organization->follower_count = $organization->followers()->count();
        
        // Check if the authenticated user follows this organization
        $user = Auth::user();
        if ($user) {
            $organization->is_following = $organization->followers()->where('user_ic', $user->ic_number)->exists();
        } else {
            $organization->is_following = false;
        }
        
        return response()->json($organization);
    }

    public function update(Request $request, $id)
    {
        $organization = Organization::findOrFail($id);

        // Get authenticated user/organization
        $authenticatedOrg = Auth::user();

        // Debug information
        \Log::info('Organization update attempt:', [
            'organization_id' => $id,
            'organization_data' => $organization->toArray(),
            'authenticated_org' => $authenticatedOrg ? $authenticatedOrg->toArray() : null,
            'request_data' => $request->all()
        ]);

        // Check if organization is authenticated
        if (!$authenticatedOrg) {
            \Log::warning('Update attempt with no authenticated organization');
            return response()->json(['message' => 'Unauthorized - Not authenticated'], 403);
        }

        // Check if authenticated organization matches the one being updated
        if ($organization->id !== $authenticatedOrg->id) {
            \Log::warning('Update attempt by wrong organization', [
                'target_organization_id' => $organization->id,
                'authenticated_org_id' => $authenticatedOrg->id
            ]);
            return response()->json(['message' => 'Unauthorized - You can only update your own organization'], 403);
        }

        // Validate basic fields
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'required|string',
            'objectives' => 'required|string',
            'register_address' => 'required|string',
            'phone_number' => 'required|string',
            'website' => 'nullable|url',
            'facebook' => 'nullable|url',
            'instagram' => 'nullable|url',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'cover_image_path' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'statutory_declaration' => 'nullable|mimes:pdf,doc,docx,jpeg,png,jpg,gif|max:2048',
            'verified_document' => 'nullable|mimes:pdf,doc,docx,jpeg,png,jpg,gif|max:2048',
        ]);

        // Handle file uploads
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($organization->logo) {
                Storage::disk('public')->delete($organization->logo);
            }
            $validated['logo'] = $request->file('logo')->store('organization_logos', 'public');
        }

        if ($request->hasFile('cover_image_path')) {
            // Delete old cover image if exists
            if ($organization->cover_image_path) {
                Storage::disk('public')->delete($organization->cover_image_path);
            }
            $validated['cover_image_path'] = $request->file('cover_image_path')->store('organization_covers', 'public');
        }

        if ($request->hasFile('statutory_declaration')) {
            if ($organization->statutory_declaration) {
                Storage::disk('public')->delete($organization->statutory_declaration);
            }
            $validated['statutory_declaration'] = $request->file('statutory_declaration')
                ->store('organization_documents', 'public');
        }

        if ($request->hasFile('verified_document')) {
            if ($organization->verified_document) {
                Storage::disk('public')->delete($organization->verified_document);
            }
            $validated['verified_document'] = $request->file('verified_document')
                ->store('organization_documents', 'public');
        }

        try {
            $organization->update($validated);
            \Log::info('Organization updated successfully', [
                'organization_id' => $organization->id,
                'updated_data' => $validated
            ]);
            return response()->json($organization);
        } catch (\Exception $e) {
            \Log::error('Organization update error:', [
                'organization_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to update organization',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $organization = Organization::findOrFail($id);

        // Validate user has permission to delete
        if (Auth::user()->type !== 'organization' || Auth::user()->id !== $organization->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete associated files
        if ($organization->logo) {
            Storage::disk('public')->delete($organization->logo);
        }
        if ($organization->cover_image_path) {
            Storage::disk('public')->delete($organization->cover_image_path);
        }
        if ($organization->statutory_declaration) {
            Storage::disk('public')->delete($organization->statutory_declaration);
        }
        if ($organization->verified_document) {
            Storage::disk('public')->delete($organization->verified_document);
        }

        $organization->delete();

        return response()->json(['message' => 'Organization deleted successfully']);
    }

    /**
     * Get all transactions for charities under this organization
     */
    public function getOrganizationTransactions(Request $request, $organizationId)
    {
        // Get all charities for this organization
        $charities = Charity::where('organization_id', $organizationId)->pluck('id');
        
        if ($charities->isEmpty()) {
            return response()->json([]);
        }
        
        // Get transactions for these charities
        $transactions = Transaction::whereIn('charity_id', $charities)
            ->with(['user', 'charity'])
            ->orderBy('created_at', 'desc');
        
        // Apply filters if provided
        if ($request->has('search')) {
            $search = $request->input('search');
            $transactions->where(function($q) use ($search) {
                $q->where('transaction_hash', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }
        
        // Execute and return
        $result = $transactions->get();
        
        // Add source field to each transaction
        $result->transform(function ($transaction) {
            $transaction->source = 'Transaction';
            return $transaction;
        });
        
        return response()->json($result);
    }

    /**
     * Get all donations for charities under this organization
     */
    public function getOrganizationDonations(Request $request, $organizationId)
    {
        // Get all charities for this organization
        $charities = Charity::where('organization_id', $organizationId)->pluck('id');
        
        if ($charities->isEmpty()) {
            return response()->json([]);
        }
        
        // Get donations for these charities (note: cause_id in donations table maps to charity_id)
        $donations = Donation::whereIn('cause_id', $charities)
            ->with(['user', 'charity'])
            ->orderBy('created_at', 'desc');
        
        // Apply filters if provided
        if ($request->has('search')) {
            $search = $request->input('search');
            $donations->where(function($q) use ($search) {
                $q->where('transaction_hash', 'like', "%{$search}%")
                  ->orWhere('donor_message', 'like', "%{$search}%");
            });
        }
        
        // Execute and return
        $result = $donations->get();
        
        // Add source field to each donation
        $result->transform(function ($donation) {
            $donation->source = 'Donation';
            return $donation;
        });
        
        return response()->json($result);
    }

    /**
     * Get all financial activities (transactions and donations) for charities under this organization
     */
    public function getOrganizationFinancialActivities(Request $request, $organizationId)
    {
        // Get all charities for this organization
        $charities = Charity::where('organization_id', $organizationId)->pluck('id');
        
        if ($charities->isEmpty()) {
            return response()->json([]);
        }
        
        // Get transactions for these charities
        $transactions = Transaction::whereIn('charity_id', $charities)
            ->with(['user', 'charity'])
            ->get();
        
        // Add source field to each transaction
        $transactions->transform(function ($transaction) {
            $transaction->source = 'Transaction';
            return $transaction;
        });
        
        // Get donations for these charities (note: cause_id in donations table maps to charity_id)
        $donations = Donation::whereIn('cause_id', $charities)
            ->with(['user', 'charity'])
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
        
        return $paginator;
    }
} 

