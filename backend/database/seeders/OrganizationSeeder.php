<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get stored paths from DatabaseSeeder
        $logoImages = DatabaseSeeder::$imagePaths['organization_logos'];
        $coverImages = DatabaseSeeder::$imagePaths['organization_covers'];
        $documents = DatabaseSeeder::$imagePaths['organization_documents'];
        
        // Define wallet addresses
        $walletAddresses = [
            'org1' => '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
            'org2' => '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
            'org3' => '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
            'org4' => '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
            'org5' => '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
            'org6' => '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        ];

        // Common password for all test organizations
        $password = Hash::make('password123');

        // Organization categories
        $categories = ['Education', 'Environment', 'Healthcare', 'Poverty Relief', 'Animal Welfare', 'Disaster Relief', 'Community Development','Technology'];

        // Check for existing users to link as representatives
        $users = User::all();
        
        // Use existing users if possible, or use the ICs defined below
        $userRepresentatives = [];
        if ($users->isNotEmpty()) {
            foreach ($users->take(6) as $index => $user) {
                $userRepresentatives[$index] = $user->ic_number;
            }
        }
        
        // Fallback representative ICs (if not enough users)
        $defaultRepresentatives = [
            '991234567890', // Admin's IC
            '781115678901', // Ahmad Bin Abdullah
            '790512145678', // Siti Nur Aisyah
            '850623789012', // Raj Kumar
            '920415678901', // Lee Wei Ling
            '860708123456', // Noor Fatimah
        ];
        
        // Ensure we have 6 representatives (use defaults for missing ones)
        for ($i = 0; $i < 6; $i++) {
            if (!isset($userRepresentatives[$i])) {
                $userRepresentatives[$i] = $defaultRepresentatives[$i];
            }
        }

        // Create organizations
        $organizations = [
            [
                'name' => 'Tech for Education Malaysia',
                'logo' => $this->getImagePath($logoImages, 0, 'organization_logos/default-logo.jpg'),
                'cover_photo' => $this->getImagePath($coverImages, 0, 'organization_covers/default-cover.jpg'),
                'category' => 'Education',
                'description' => 'We leverage technology to enhance educational opportunities for underprivileged children across Malaysia. Through partnerships with schools, tech companies, and community centers, we provide digital resources, training for educators, and hands-on learning experiences for students.',
                'objectives' => 'To bridge the digital divide in education and empower students with tech skills for the future. We aim to reach 100 schools and impact 50,000 students by 2025, focusing on rural and underserved urban areas.',
                'representative_id' => $userRepresentatives[0],
                'wallet_address' => $walletAddresses['org1'],
                'register_address' => '123 Jalan Teknologi, Cyberjaya, Selangor 63000, Malaysia',
                'gmail' => 'techedu@trustchain.com',
                'phone_number' => '+60123456001',
                'website' => 'https://techedu.org.my',
                'facebook' => 'https://facebook.com/techedumalaysia',
                'instagram' => 'https://instagram.com/techedumalaysia',
                'twitter' => 'https://twitter.com/techedumalaysia'
            ],
            [
                'name' => 'Green Earth Malaysia',
                'logo' => $this->getImagePath($logoImages, 1, 'organization_logos/1.jpg'),
                'cover_photo' => $this->getImagePath($coverImages, 1, 'organization_covers/1.jpg'),
                'category' => 'Environment',
                'description' => 'Dedicated to environmental conservation and sustainability initiatives throughout Malaysia. We work with local communities, government agencies, and international partners to protect natural habitats, reduce pollution, and promote eco-friendly practices.',
                'objectives' => 'To protect Malaysian biodiversity, promote sustainable practices, and combat climate change effects. Our goals include planting 1 million trees by 2030, establishing 20 community conservation areas, and reducing plastic waste by 50% in target communities.',
                'representative_id' => $userRepresentatives[1],
                'wallet_address' => $walletAddresses['org2'],
                'register_address' => '45 Jalan Hijau, Petaling Jaya, Selangor 46000, Malaysia',
                'gmail' => 'greenearth@trustchain.com',
                'phone_number' => '+60123456002',
                'website' => 'https://greenearth.org.my',
                'facebook' => 'https://facebook.com/greenearthmalaysia',
                'instagram' => 'https://instagram.com/greenearthmalaysia',
                'twitter' => 'https://twitter.com/greenearthmy'
            ],
            [
                'name' => 'Healthcare For All',
                'logo' => $this->getImagePath($logoImages, 2, 'organization_logos/2.jpg'),
                'cover_photo' => $this->getImagePath($coverImages, 2, 'organization_covers/2.jpg'),
                'category' => 'Healthcare',
                'description' => 'Working to ensure access to quality healthcare services for all Malaysians, especially in rural areas. Our programs include mobile clinics, telemedicine services, health screenings, and medical training for community health workers.',
                'objectives' => 'To improve healthcare accessibility, provide medical resources, and health education to underserved communities. We aim to reach 500,000 individuals with basic healthcare services and establish sustainable healthcare solutions in 200 rural villages.',
                'representative_id' => $userRepresentatives[2],
                'wallet_address' => $walletAddresses['org3'],
                'register_address' => '78 Jalan Medik, Kuala Lumpur 50200, Malaysia',
                'gmail' => 'healthcare@trustchain.com',
                'phone_number' => '+60123456003',
                'website' => 'https://healthcareforall.org.my',
                'facebook' => 'https://facebook.com/healthcareforallmy',
                'instagram' => 'https://instagram.com/healthcareforallmy',
                'linkedin' => 'https://linkedin.com/company/healthcareforallmy'
            ],
            [
                'name' => 'Feed The Hungry',
                'logo' => $this->getImagePath($logoImages, 3, 'organization_logos/3.jpg'),
                'cover_photo' => $this->getImagePath($coverImages, 3, 'organization_covers/3.jpg'),
                'category' => 'Poverty Relief',
                'description' => 'Combating hunger and food insecurity across Malaysian communities. We operate food banks, community kitchens, meal delivery services, and urban farming projects to provide nutritious food to those in need.',
                'objectives' => 'To eliminate hunger through food distribution programs, community kitchens, and sustainable food systems. Our goals include providing 10 million meals annually, establishing 50 food banks nationwide, and teaching 10,000 families to grow their own food.',
                'representative_id' => $userRepresentatives[3],
                'wallet_address' => $walletAddresses['org4'],
                'register_address' => '35 Jalan Makanan, George Town, Penang 10450, Malaysia',
                'gmail' => 'feedhungry@trustchain.com',
                'phone_number' => '+60123456004',
                'website' => 'https://feedthehungry.org.my',
                'facebook' => 'https://facebook.com/feedhungrymy',
                'instagram' => 'https://instagram.com/feedhungrymy',
                'youtube' => 'https://youtube.com/feedhungrymalaysia'
            ],
            [
                'name' => 'Rebuild Malaysia',
                'logo' => $this->getImagePath($logoImages, 4, 'organization_logos/4.jpg'),
                'cover_photo' => $this->getImagePath($coverImages, 4, 'organization_covers/4.jpg'),
                'category' => 'Disaster Relief',
                'description' => 'Providing immediate assistance and long-term recovery support for communities affected by natural disasters. We specialize in emergency response, shelter construction, infrastructure rehabilitation, and disaster preparedness training.',
                'objectives' => 'To build resilience, provide emergency relief, and support reconstruction after disasters. We aim to respond to every major disaster in Malaysia within 24 hours, help rebuild 5,000 homes, and train 100,000 Malaysians in disaster preparedness by 2025.',
                'representative_id' => $userRepresentatives[4],
                'wallet_address' => $walletAddresses['org5'],
                'register_address' => '90 Jalan Banjir, Kota Kinabalu, Sabah 88000, Malaysia',
                'gmail' => 'rebuild@trustchain.com',
                'phone_number' => '+60123456005',
                'website' => 'https://rebuildmalaysia.org',
                'facebook' => 'https://facebook.com/rebuildmalaysia',
                'instagram' => 'https://instagram.com/rebuildmalaysia',
                'tiktok' => 'https://tiktok.com/@rebuildmalaysia'
            ],
            [
                'name' => 'Trustchain',
                'logo' => $this->getImagePath($logoImages, 5, 'organization_logos/5.jpg'),
                'cover_photo' => $this->getImagePath($coverImages, 5, 'organization_covers/5.jpg'),
                'category' => 'Technology',
                'description' => 'A blockchain-powered platform designed to restore trust in charitable giving.',
                'objectives' => 'Your subscription helps us maintain and improve the platform, ensuring we can continue to connect donors with meaningful causes. Funds are used for: platform maintenance and updates, server and hosting costs, development of new features, support and customer service.',
                'representative_id' => $userRepresentatives[5],
                'wallet_address' => $walletAddresses['org6'],
                'register_address' => '123 Jalan Ilmu, Skudai 53530 Johor , Malaysia.',
                'gmail' => 'admin@trustchain.com',
                'phone_number' => '+60123455001',
                'website' => 'https://trustchain.org.my',
                'facebook' => 'https://facebook.com/trustchain',
                'instagram' => 'https://instagram.com/trustchain',
                'tiktok' => 'https://tiktok.com/@trustchain'
            ]
        ];

        // Clear existing organizations safely (disabling foreign key checks)
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Organization::query()->delete();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        foreach ($organizations as $index => $orgData) {
            // Create with varying timestamps
            $createdAt = now()->subMonths(rand(1, 12));
            
            // Calculate document indices
            $statutoryIndex = $index % count($documents);
            $verifiedIndex = ($index + 1) % count($documents);
            
            // Additional social media fields
            $others = [];
            if (isset($orgData['twitter'])) $others['twitter'] = $orgData['twitter'];
            if (isset($orgData['linkedin'])) $others['linkedin'] = $orgData['linkedin'];
            if (isset($orgData['youtube'])) $others['youtube'] = $orgData['youtube'];
            if (isset($orgData['tiktok'])) $others['tiktok'] = $orgData['tiktok'];
            
            Organization::create([
                'name' => $orgData['name'],
                'logo' => $orgData['logo'],
                'cover_image_path' => $orgData['cover_photo'] ?? null,
                'category' => $orgData['category'],
                'description' => $orgData['description'],
                'objectives' => $orgData['objectives'],
                'representative_id' => $orgData['representative_id'],
                'statutory_declaration' => $this->getDocumentPath($documents, $statutoryIndex, 'organization_documents/default-statutory.pdf'),
                'verified_document' => $this->getDocumentPath($documents, $verifiedIndex, 'organization_documents/default-verified.pdf'),
                'wallet_address' => $orgData['wallet_address'],
                'register_address' => $orgData['register_address'],
                'gmail' => $orgData['gmail'],
                'phone_number' => $orgData['phone_number'],
                'website' => $orgData['website'],
                'facebook' => $orgData['facebook'],
                'instagram' => $orgData['instagram'],
                'others' => !empty($others) ? json_encode($others) : null,
                'is_verified' => true,
                'password' => $password,
                'created_at' => $createdAt,
                'updated_at' => $createdAt
            ]);
        }
        
        echo "Created " . count($organizations) . " organizations.\n";
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