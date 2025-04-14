<?php

namespace App\Http\Controllers;

use App\Models\Charity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CharityController extends Controller
{
    public function index(Request $request)
    {
        $query = Charity::with('organization');

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

        // Apply fund range filter if provided
        if ($request->has('min_fund')) {
            $query->where('fund_targeted', '>=', $request->min_fund);
        }
        if ($request->has('max_fund')) {
            $query->where('fund_targeted', '<=', $request->max_fund);
        }

        // Get paginated results
        $perPage = $request->input('per_page', 12); // Default to 12 items per page
        $charities = $query->paginate($perPage);
        
        // Add follower count to each charity
        $charities->each(function ($charity) {
            try {
                $charity->follower_count = $charity->followers()->count();
                
                $user = Auth::user();
                if ($user) {
                    $charity->is_following = $charity->followers()->where('user_ic', $user->ic_number)->exists();
                } else {
                    $charity->is_following = false;
                }
            } catch (\Exception $e) {
                $charity->follower_count = 0;
                $charity->is_following = false;
            }
        });
        
        return response()->json($charities);
    }

    public function show($id)
    {
        $charity = Charity::with(['organization', 'tasks'])->findOrFail($id);
        
        // Add follower count
        try {
            // Try to get follower count, but handle errors gracefully
            $charity->follower_count = $charity->followers()->count();
            
            // Check if the authenticated user follows this charity
            $user = Auth::user();
            if ($user) {
                $charity->is_following = $charity->followers()->where('user_ic', $user->ic_number)->exists();
            } else {
                $charity->is_following = false;
            }
        } catch (\Exception $e) {
            // If there's an error (like missing table), set default values
            $charity->follower_count = 0;
            $charity->is_following = false;
        }
        
        return response()->json($charity);
    }

    public function store(Request $request)
    {
        // Check if user is authenticated and is an organization
        if (!Auth::user() || Auth::user()->getTable() !== 'organizations') {
            return response()->json(['message' => 'Unauthorized - Only organizations can create charities'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'required|string',
            'objective' => 'required|string',
            'fund_targeted' => 'required|numeric|min:0',
            'people_affected' => 'nullable|integer|min:0',
            'picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'verified_document' => 'nullable|mimes:pdf,doc,docx|max:2048',
        ]);

        // Handle file uploads
        if ($request->hasFile('picture')) {
            $validated['picture_path'] = $request->file('picture')->store('charity_pictures', 'public');
        }

        if ($request->hasFile('verified_document')) {
            $validated['verified_document'] = $request->file('verified_document')
                ->store('charity_documents', 'public');
        }

        $validated['organization_id'] = Auth::id();

        $charity = Charity::create($validated);
        return response()->json($charity, 201);
    }

    public function update(Request $request, $id)
    {
        $charity = Charity::findOrFail($id);

        // Check if user is authenticated and owns the charity
        if (!Auth::user() || Auth::user()->getTable() !== 'organizations' || Auth::id() !== $charity->organization_id) {
            return response()->json(['message' => 'Unauthorized - You can only update your own charities'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'required|string',
            'objective' => 'required|string',
            'fund_targeted' => 'required|numeric|min:0',
            'people_affected' => 'nullable|integer|min:0',
            'picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'verified_document' => 'nullable|mimes:pdf,doc,docx|max:2048',
        ]);

        // Handle file uploads
        if ($request->hasFile('picture')) {
            if ($charity->picture_path) {
                Storage::disk('public')->delete($charity->picture_path);
            }
            $validated['picture_path'] = $request->file('picture')->store('charity_pictures', 'public');
        }

        if ($request->hasFile('verified_document')) {
            if ($charity->verified_document) {
                Storage::disk('public')->delete($charity->verified_document);
            }
            $validated['verified_document'] = $request->file('verified_document')
                ->store('charity_documents', 'public');
        }

        $charity->update($validated);
        return response()->json($charity);
    }

    public function destroy($id)
    {
        $charity = Charity::findOrFail($id);

        // Check if user is authenticated and owns the charity
        if (!Auth::user() || Auth::user()->getTable() !== 'organizations' || Auth::id() !== $charity->organization_id) {
            return response()->json(['message' => 'Unauthorized - You can only delete your own charities'], 403);
        }

        // Delete associated files
        if ($charity->picture_path) {
            Storage::disk('public')->delete($charity->picture_path);
        }
        if ($charity->verified_document) {
            Storage::disk('public')->delete($charity->verified_document);
        }

        $charity->delete();
        return response()->json(['message' => 'Charity deleted successfully']);
    }

    public function organizationCharities($organizationId)
    {
        $charities = Charity::where('organization_id', $organizationId)
            ->with('tasks')
            ->get();
            
        // Add follower count to each charity
        $charities->each(function ($charity) {
            try {
                // Try to get follower count, but handle errors gracefully
                $charity->follower_count = $charity->followers()->count();
                
                // Check if the authenticated user follows this charity
                $user = Auth::user();
                if ($user) {
                    $charity->is_following = $charity->followers()->where('user_ic', $user->ic_number)->exists();
                } else {
                    $charity->is_following = false;
                }
            } catch (\Exception $e) {
                // If there's an error (like missing table), set default values
                $charity->follower_count = 0;
                $charity->is_following = false;
            }
        });
        
        return response()->json($charities);
    }
} 