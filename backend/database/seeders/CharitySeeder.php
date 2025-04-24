<?php

namespace Database\Seeders;

use App\Models\Charity;
use App\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class CharitySeeder extends Seeder
{
    /**
     * Run the database seeds.
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
        
        // Get available images and documents from DatabaseSeeder
        $charityImages = DatabaseSeeder::$imagePaths['charity_pictures'];
        $charityDocuments = DatabaseSeeder::$imagePaths['charity_documents'];
        
        // Get organization IDs by name to avoid hardcoding IDs
        $orgMap = [];
        foreach ($organizations as $org) {
            $orgMap[$org->name] = $org->id;
        }
        
        // Fallback to direct IDs if specific organizations aren't found
        $techEduId = $orgMap['Tech for Education Malaysia'] ?? $organizations[0]->id;
        $greenEarthId = $orgMap['Green Earth Malaysia'] ?? $organizations[1]->id;
        $healthcareId = $orgMap['Healthcare For All'] ?? $organizations[2]->id;
        $feedHungryId = $orgMap['Feed The Hungry'] ?? $organizations[3]->id;
        $rebuildId = $orgMap['Rebuild Malaysia'] ?? $organizations[4]->id;

        // Create charities for each organization
        $charities = [
            // Tech for Education Malaysia
            [
                'organization_id' => $techEduId,
                'name' => 'Digital Classroom Initiative',
                'category' => 'Education',
                'description' => 'Equipping rural schools with computers, internet access, and digital learning tools to bridge the education gap.',
                'objective' => 'To provide digital resources to 50 rural schools across Malaysia by the end of 2023.',
                'fund_targeted' => 250.00,
                'people_affected' => 5000,
                'picture_path' => $this->getImagePath($charityImages, 0, 'charity_pictures/default-charity.jpg'),
                'verified_document' => $this->getDocumentPath($charityDocuments, 0, 'charity_documents/default-verified.pdf')
            ],
            [
                'organization_id' => $techEduId,
                'name' => 'Coding for Kids',
                'category' => 'Education',
                'description' => 'Teaching programming and computational thinking to children from disadvantaged backgrounds.',
                'objective' => 'To introduce 1000 children to coding basics and develop their problem-solving skills.',
                'fund_targeted' => 120.00,
                'people_affected' => 1000,
                'picture_path' => $this->getImagePath($charityImages, 1, 'charity_pictures/default-charity.jpg'),
                'verified_document' => $this->getDocumentPath($charityDocuments, 1, 'charity_documents/default-verified.pdf')
            ],
            
            // Green Earth Malaysia
            [
                'organization_id' => $greenEarthId,
                'name' => 'Mangrove Restoration Project',
                'category' => 'Environment',
                'description' => 'Restoring mangrove ecosystems along Malaysia\'s coastlines to protect against erosion and provide wildlife habitats.',
                'objective' => 'To plant 50,000 mangrove seedlings and create community stewardship programs in coastal areas.',
                'fund_targeted' => 180.00,
                'people_affected' => 15000,
                'picture_path' => $this->getImagePath($charityImages, 2, 'charity_pictures/default-charity.jpg'),
                'verified_document' => $this->getDocumentPath($charityDocuments, 2, 'charity_documents/default-verified.pdf')
            ],
            [
                'organization_id' => $greenEarthId,
                'name' => 'Zero Waste Communities',
                'category' => 'Environment',
                'description' => 'Implementing waste reduction and recycling programs in urban neighborhoods.',
                'objective' => 'To establish 20 community recycling centers and reduce landfill waste by 30% in participating areas.',
                'fund_targeted' => 95.00,
                'people_affected' => 25000,
                'picture_path' => $this->getImagePath($charityImages, 3, 'charity_pictures/default-charity.jpg'),
                'verified_document' => $this->getDocumentPath($charityDocuments, 3, 'charity_documents/default-verified.pdf')
            ],
            
            // Healthcare For All
            [
                'organization_id' => $healthcareId,
                'name' => 'Mobile Medical Clinics',
                'category' => 'Healthcare',
                'description' => 'Bringing healthcare services to remote and underserved communities via mobile medical units.',
                'objective' => 'To provide basic healthcare services to 10,000 people in rural areas who lack access to medical facilities.',
                'fund_targeted' => 350.00,
                'people_affected' => 10000,
                'picture_path' => $this->getImagePath($charityImages, 4, 'charity_pictures/default-charity.jpg'),
                'verified_document' => $this->getDocumentPath($charityDocuments, 4, 'charity_documents/default-verified.pdf')
            ],
            [
                'organization_id' => $healthcareId,
                'name' => 'Mental Health Awareness',
                'category' => 'Healthcare',
                'description' => 'Promoting mental health awareness and providing counseling services to those in need.',
                'objective' => 'To reduce stigma around mental health issues and provide support services to youth and vulnerable populations.',
                'fund_targeted' => 120.00,
                'people_affected' => 7500,
                'picture_path' => $this->getImagePath($charityImages, 5, 'charity_pictures/default-charity.jpg'),
                'verified_document' => $this->getDocumentPath($charityDocuments, 5, 'charity_documents/default-verified.pdf')
            ],
            
            // Feed The Hungry
            [
                'organization_id' => $feedHungryId,
                'name' => 'Community Food Banks',
                'category' => 'Poverty Relief',
                'description' => 'Establishing food banks in urban areas to provide nutritious food to families in need.',
                'objective' => 'To create a sustainable food distribution system that supports 5,000 families monthly.',
                'fund_targeted' => 200.00,
                'people_affected' => 20000,
                'picture_path' => $this->getImagePath($charityImages, 6, 'charity_pictures/default-charity.jpg'),
                'verified_document' => $this->getDocumentPath($charityDocuments, 6, 'charity_documents/default-verified.pdf')
            ],
            [
                'organization_id' => $feedHungryId,
                'name' => 'Urban Farming Initiative',
                'category' => 'Poverty Relief',
                'description' => 'Teaching urban communities to grow their own food using sustainable farming methods.',
                'objective' => 'To establish 30 community gardens and train 500 families in urban farming techniques.',
                'fund_targeted' => 150.00,
                'people_affected' => 2000,
                'picture_path' => $this->getImagePath($charityImages, 7, 'charity_pictures/default-charity.jpg'),
                'verified_document' => $this->getDocumentPath($charityDocuments, 7, 'charity_documents/default-verified.pdf')
            ],
            
            // Rebuild Malaysia
            [
                'organization_id' => $rebuildId,
                'name' => 'Flood Relief Fund',
                'category' => 'Disaster Relief',
                'description' => 'Providing immediate assistance to families affected by seasonal flooding in East Malaysia.',
                'objective' => 'To deliver emergency supplies, temporary shelter, and reconstruction support to flood victims.',
                'fund_targeted' => 300.00,
                'people_affected' => 12000,
                'picture_path' => $this->getImagePath($charityImages, 8, 'charity_pictures/default-charity.jpg'),
                'verified_document' => $this->getDocumentPath($charityDocuments, 8, 'charity_documents/default-verified.pdf')
            ],
            [
                'organization_id' => $rebuildId,
                'name' => 'Disaster Preparedness Training',
                'category' => 'Disaster Relief',
                'description' => 'Training communities in disaster-prone areas on emergency preparedness and response.',
                'objective' => 'To equip 100 communities with disaster management skills and early warning systems.',
                'fund_targeted' => 135.00,
                'people_affected' => 8000,
                'picture_path' => $this->getImagePath($charityImages, 9, 'charity_pictures/default-charity.jpg'),
                'verified_document' => $this->getDocumentPath($charityDocuments, 9, 'charity_documents/default-verified.pdf')
            ]
        ];

        // Default values for fund_received and is_verified
        $defaultValues = [
            'fund_received' => 0.00,
            'is_verified' => true
        ];

        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Delete existing charities 
        Charity::truncate();

        // Enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        foreach ($charities as $charityData) {
            // Create with varying timestamps
            $createdAt = now()->subDays(rand(7, 120));
            
            // Modify the fund received calculation to be more realistic
            $fundReceived = rand(0, min(70, $charityData['fund_targeted'])) / 100 * $charityData['fund_targeted'];
            
            // Merge with default values
            $charityData = array_merge($charityData, $defaultValues, [
                'fund_received' => round($fundReceived, 2)
            ]);
            
            // Add timestamps
            $charityData['created_at'] = $createdAt;
            $charityData['updated_at'] = $createdAt;
            
            // Create the charity
            Charity::create($charityData);
        }
        
        echo "Created " . count($charities) . " charities.\n";
    }
    
    /**
     * Get image path with fallback
     * 
     * @param array $images Available images
     * @param int $index Index of image to get
     * @param string $fallback Fallback path if image not available
     * @return string The image path
     */
    private function getImagePath(array $images, int $index, string $fallback): string
    {
        return !empty($images) && isset($images[$index]) ? $images[$index] : $fallback;
    }
    
    /**
     * Get document path with fallback
     * 
     * @param array $documents Available documents
     * @param int $index Index of document to get
     * @param string $fallback Fallback path if document not available
     * @return string The document path
     */
    private function getDocumentPath(array $documents, int $index, string $fallback): string
    {
        return !empty($documents) && isset($documents[$index]) ? $documents[$index] : $fallback;
    }
} 