<?php

namespace Database\Seeders;

use App\Models\Charity;
use App\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FixCharityOrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds to fix charity organization relationships.
     * This will ensure all charities have valid organization_id references.
     */
    public function run(): void
    {
        // Get all organizations
        $organizations = Organization::all();
        
        // Check if we have organizations to work with
        if ($organizations->isEmpty()) {
            echo "No organizations found. Please run the OrganizationSeeder first.\n";
            return;
        }
        
        // Get a valid organization ID to use as fallback
        $fallbackOrgId = $organizations->first()->id;
        
        // Create an ID map for organization names to help match charities
        $orgMap = [];
        foreach ($organizations as $org) {
            $orgMap[strtolower($org->name)] = $org->id;
        }
        
        // Get charity name to expected organization name mapping
        $charityOrgMap = [
            'digital classroom' => 'tech for education',
            'coding for kids' => 'tech for education',
            'mangrove restoration' => 'green earth',
            'zero waste' => 'green earth',
            'mobile medical' => 'healthcare for all',
            'mental health' => 'healthcare for all',
            'food banks' => 'feed the hungry',
            'urban farming' => 'feed the hungry',
            'flood relief' => 'rebuild malaysia',
            'disaster preparedness' => 'rebuild malaysia',
        ];
        
        // Log initial state
        $beforeCount = Charity::count();
        $invalidCount = 0;
        $fixedCount = 0;
        
        echo "Starting charity organization fix...\n";
        echo "Found {$beforeCount} charities to check.\n";
        
        // Get all charities
        $charities = Charity::all();
        
        // Check each charity
        foreach ($charities as $charity) {
            // First see if the organization ID is valid
            $orgExists = $organizations->contains('id', $charity->organization_id);
            
            if (!$orgExists) {
                $invalidCount++;
                $assigned = false;
                
                // Try to match by charity name to organization
                $charityName = strtolower($charity->name);
                foreach ($charityOrgMap as $keyword => $orgName) {
                    if (str_contains($charityName, $keyword)) {
                        // Find the organization ID that matches
                        foreach ($orgMap as $mappedOrgName => $orgId) {
                            if (str_contains($mappedOrgName, $orgName)) {
                                $charity->organization_id = $orgId;
                                $charity->save();
                                $fixedCount++;
                                $assigned = true;
                                echo "Fixed charity '{$charity->name}' to organization ID {$orgId}\n";
                                break 2; // Break out of both loops
                            }
                        }
                    }
                }
                
                // If still not assigned, use fallback
                if (!$assigned) {
                    $charity->organization_id = $fallbackOrgId;
                    $charity->save();
                    $fixedCount++;
                    echo "Assigned charity '{$charity->name}' to fallback organization ID {$fallbackOrgId}\n";
                }
            }
        }
        
        // Add some random fund amounts if any charity has 0
        $zeroFundCharities = Charity::where('fund_received', 0)->get();
        foreach ($zeroFundCharities as $charity) {
            $fundReceived = rand(0, 70) / 100 * $charity->fund_targeted;
            $charity->fund_received = round($fundReceived, 2);
            $charity->save();
            echo "Updated charity '{$charity->name}' with fund received amount: {$charity->fund_received}\n";
        }
        
        // Check for missing people_affected field and add random values
        $noAffectedPeopleCharities = Charity::where('people_affected', 0)->get();
        foreach ($noAffectedPeopleCharities as $charity) {
            $charity->people_affected = rand(1000, 25000);
            $charity->save();
            echo "Updated charity '{$charity->name}' with people affected: {$charity->people_affected}\n";
        }
        
        $afterCount = Charity::count();
        echo "Charity fix complete.\n";
        echo "Before: {$beforeCount}, Invalid: {$invalidCount}, Fixed: {$fixedCount}, After: {$afterCount}\n";
    }
}
