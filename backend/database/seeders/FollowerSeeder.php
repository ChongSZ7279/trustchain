<?php

namespace Database\Seeders;

use App\Models\CharityFollower;
use App\Models\OrganizationFollower;
use App\Models\User;
use App\Models\Charity;
use App\Models\Organization;
use Illuminate\Database\Seeder;

class FollowerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users except admin
        $users = User::where('ic_number', '!=', '991234567890')->get();
        
        // Get all charities and organizations
        $charities = Charity::all();
        $organizations = Organization::all();
        
        // Create charity followers - each user follows 1-4 charities
        $charityFollowersData = [];
        $existingCharityFollowers = []; // To track existing followers and avoid duplicates
        
        foreach ($users as $user) {
            // Determine how many charities this user will follow (1-4)
            $followCount = rand(1, min(4, $charities->count()));
            
            // Shuffle charities to get random ones
            $shuffledCharities = $charities->shuffle();
            
            for ($i = 0; $i < $followCount; $i++) {
                $charity = $shuffledCharities[$i];
                
                // Create a unique key to check for duplicates
                $key = $user->ic_number . '_' . $charity->id;
                
                // Only add if not already following
                if (!in_array($key, $existingCharityFollowers)) {
                    $existingCharityFollowers[] = $key;
                    
                    // Create timestamp between 1-90 days ago
                    $createdAt = now()->subDays(rand(1, 90));
                    
                    $charityFollowersData[] = [
                        'user_ic' => $user->ic_number,
                        'charity_id' => $charity->id,
                        'created_at' => $createdAt,
                        'updated_at' => $createdAt
                    ];
                }
            }
        }
        
        // Create organization followers - each user follows 1-3 organizations
        $organizationFollowersData = [];
        $existingOrgFollowers = []; // To track existing followers and avoid duplicates
        
        foreach ($users as $user) {
            // Determine how many organizations this user will follow (1-3)
            $followCount = rand(1, min(3, $organizations->count()));
            
            // Shuffle organizations to get random ones
            $shuffledOrgs = $organizations->shuffle();
            
            for ($i = 0; $i < $followCount; $i++) {
                $organization = $shuffledOrgs[$i];
                
                // Create a unique key to check for duplicates
                $key = $user->ic_number . '_' . $organization->id;
                
                // Only add if not already following
                if (!in_array($key, $existingOrgFollowers)) {
                    $existingOrgFollowers[] = $key;
                    
                    // Create timestamp between 1-90 days ago
                    $createdAt = now()->subDays(rand(1, 90));
                    
                    $organizationFollowersData[] = [
                        'user_ic' => $user->ic_number,
                        'organization_id' => $organization->id,
                        'created_at' => $createdAt,
                        'updated_at' => $createdAt
                    ];
                }
            }
        }
        
        // Create all charity followers
        foreach ($charityFollowersData as $followerData) {
            CharityFollower::create($followerData);
        }
        
        // Create all organization followers
        foreach ($organizationFollowersData as $followerData) {
            OrganizationFollower::create($followerData);
        }
    }
} 