<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\OrganizationFollower;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class OrganizationFollowerController extends Controller
{
    /**
     * Toggle follow status for an organization.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $organizationId
     * @return \Illuminate\Http\Response
     */
    public function toggleFollow(Request $request, $organizationId)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }
            
            $organization = Organization::findOrFail($organizationId);
            
            // Check if the user already follows this organization
            $existingFollow = OrganizationFollower::where('user_ic', $user->ic_number)
                ->where('organization_id', $organizationId)
                ->first();
            
            if ($existingFollow) {
                // Unfollow
                $existingFollow->delete();
                $isFollowing = false;
                $message = 'Organization unfollowed successfully';
            } else {
                // Follow
                OrganizationFollower::create([
                    'user_ic' => $user->ic_number,
                    'organization_id' => $organizationId
                ]);
                $isFollowing = true;
                $message = 'Organization followed successfully';
            }
            
            // Get updated follower count
            $followerCount = $organization->followers()->count();
            
            return response()->json([
                'message' => $message,
                'is_following' => $isFollowing,
                'follower_count' => $followerCount
            ]);
        } catch (\Exception $e) {
            Log::error('Error toggling organization follow: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update follow status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Check if the authenticated user follows an organization.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $organizationId
     * @return \Illuminate\Http\Response
     */
    public function checkFollowStatus(Request $request, $organizationId)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['is_following' => false, 'follower_count' => 0]);
            }
            
            $organization = Organization::findOrFail($organizationId);
            
            $isFollowing = OrganizationFollower::where('user_ic', $user->ic_number)
                ->where('organization_id', $organizationId)
                ->exists();
            
            $followerCount = $organization->followers()->count();
            
            return response()->json([
                'is_following' => $isFollowing,
                'follower_count' => $followerCount
            ]);
        } catch (\Exception $e) {
            Log::error('Error checking organization follow status: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to check follow status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get organizations followed by the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function getFollowedOrganizations(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }
            
            $followedOrganizations = $user->followedOrganizations;
            
            return response()->json($followedOrganizations);
        } catch (\Exception $e) {
            Log::error('Error getting followed organizations: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to get followed organizations',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
