<?php

namespace App\Http\Controllers;

use App\Models\Charity;
use App\Models\CharityFollower;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CharityFollowerController extends Controller
{
    /**
     * Toggle follow status for a charity.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $charityId
     * @return \Illuminate\Http\Response
     */
    public function toggleFollow(Request $request, $charityId)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }
            
            $charity = Charity::findOrFail($charityId);
            
            // Check if the user already follows this charity
            $existingFollow = CharityFollower::where('user_ic', $user->ic_number)
                ->where('charity_id', $charityId)
                ->first();
            
            if ($existingFollow) {
                // Unfollow
                $existingFollow->delete();
                $isFollowing = false;
                $message = 'Charity unfollowed successfully';
            } else {
                // Follow
                CharityFollower::create([
                    'user_ic' => $user->ic_number,
                    'charity_id' => $charityId
                ]);
                $isFollowing = true;
                $message = 'Charity followed successfully';
            }
            
            // Get updated follower count
            $followerCount = $charity->followers()->count();
            
            return response()->json([
                'message' => $message,
                'is_following' => $isFollowing,
                'follower_count' => $followerCount
            ]);
        } catch (\Exception $e) {
            Log::error('Error toggling charity follow: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update follow status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Check if the authenticated user follows a charity.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $charityId
     * @return \Illuminate\Http\Response
     */
    public function checkFollowStatus(Request $request, $charityId)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['is_following' => false, 'follower_count' => 0]);
            }
            
            $charity = Charity::findOrFail($charityId);
            
            $isFollowing = CharityFollower::where('user_ic', $user->ic_number)
                ->where('charity_id', $charityId)
                ->exists();
            
            $followerCount = $charity->followers()->count();
            
            return response()->json([
                'is_following' => $isFollowing,
                'follower_count' => $followerCount
            ]);
        } catch (\Exception $e) {
            Log::error('Error checking charity follow status: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to check follow status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get charities followed by the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function getFollowedCharities(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }
            
            $followedCharities = $user->followedCharities;
            
            return response()->json($followedCharities);
        } catch (\Exception $e) {
            Log::error('Error getting followed charities: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to get followed charities',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 