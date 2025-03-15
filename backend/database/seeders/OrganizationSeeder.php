<?php

namespace Database\Seeders;

use App\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create demo organizations
        $organizations = [
            [
                'name' => 'Hope Foundation Malaysia',
                'logo' => 'organizations/hope_foundation_logo.jpg',
                'category' => 'Education',
                'description' => 'Hope Foundation Malaysia is dedicated to providing educational opportunities to underprivileged children across Malaysia.',
                'objectives' => 'To provide scholarships, build schools, and develop educational programs for children in need.',
                'representative_id' => '950101012345', // John Doe
                'statutory_declaration' => 'organizations/hope_foundation_statutory.pdf',
                'verified_document' => 'organizations/hope_foundation_verified.pdf',
                'wallet_address' => '0xabcdef1234567890abcdef1234567890abcdef12',
                'register_address' => 'No. 123, Jalan Bukit Bintang, 55100 Kuala Lumpur, Malaysia',
                'gmail' => 'contact@hopefoundation.org',
                'phone_number' => '0312345678',
                'website' => 'https://www.hopefoundation.org',
                'facebook' => 'https://www.facebook.com/hopefoundationmy',
                'instagram' => 'https://www.instagram.com/hopefoundationmy',
                'others' => null,
                'is_verified' => true,
                'password' => Hash::make('password123'),
            ],
            [
                'name' => 'Green Earth Malaysia',
                'logo' => 'organizations/green_earth_logo.jpg',
                'category' => 'Environment',
                'description' => 'Green Earth Malaysia works to protect and restore Malaysia\'s natural environment through conservation and sustainable practices.',
                'objectives' => 'To conserve forests, protect wildlife, reduce pollution, and promote sustainable living.',
                'representative_id' => '880202023456', // Jane Smith
                'statutory_declaration' => 'organizations/green_earth_statutory.pdf',
                'verified_document' => 'organizations/green_earth_verified.pdf',
                'wallet_address' => '0xbcdef1234567890abcdef1234567890abcdef123',
                'register_address' => 'No. 456, Jalan Ampang, 50450 Kuala Lumpur, Malaysia',
                'gmail' => 'info@greenearth.org.my',
                'phone_number' => '0312345679',
                'website' => 'https://www.greenearth.org.my',
                'facebook' => 'https://www.facebook.com/greenearthmy',
                'instagram' => 'https://www.instagram.com/greenearthmy',
                'others' => null,
                'is_verified' => true,
                'password' => Hash::make('password123'),
            ],
            [
                'name' => 'Care For All',
                'logo' => 'organizations/care_for_all_logo.jpg',
                'category' => 'Healthcare',
                'description' => 'Care For All provides healthcare services and support to underserved communities throughout Malaysia.',
                'objectives' => 'To provide medical care, health education, and support for those who cannot afford healthcare services.',
                'representative_id' => '770303034567', // Ahmad Bin Abdullah
                'statutory_declaration' => 'organizations/care_for_all_statutory.pdf',
                'verified_document' => 'organizations/care_for_all_verified.pdf',
                'wallet_address' => '0xcdef1234567890abcdef1234567890abcdef1234',
                'register_address' => 'No. 789, Jalan Tun Razak, 50400 Kuala Lumpur, Malaysia',
                'gmail' => 'support@careforall.my',
                'phone_number' => '0312345680',
                'website' => 'https://www.careforall.my',
                'facebook' => 'https://www.facebook.com/careforallmy',
                'instagram' => 'https://www.instagram.com/careforallmy',
                'others' => null,
                'is_verified' => true,
                'password' => Hash::make('password123'),
            ],
        ];

        foreach ($organizations as $orgData) {
            Organization::create($orgData);
        }

        // Create placeholder images and PDFs in storage
        $this->createPlaceholderFiles();
    }

    /**
     * Create placeholder files in the storage directory
     */
    private function createPlaceholderFiles(): void
    {
        $storagePath = storage_path('app/public');
        
        // Create directories if they don't exist
        if (!file_exists("$storagePath/organizations")) {
            mkdir("$storagePath/organizations", 0755, true);
        }
        
        // Create placeholder images for organizations
        $orgLogos = [
            'hope_foundation_logo.jpg',
            'green_earth_logo.jpg',
            'care_for_all_logo.jpg',
        ];
        
        foreach ($orgLogos as $logo) {
            $path = "$storagePath/organizations/$logo";
            if (!file_exists($path)) {
                // Create a simple colored image
                $img = imagecreatetruecolor(300, 300);
                $color = imagecolorallocate($img, rand(0, 255), rand(0, 255), rand(0, 255));
                imagefill($img, 0, 0, $color);
                
                // Add some text
                $textColor = imagecolorallocate($img, 255, 255, 255);
                $orgName = pathinfo($logo, PATHINFO_FILENAME);
                $orgName = str_replace('_', ' ', $orgName);
                $orgName = ucwords($orgName);
                
                // Center the text
                $fontSize = 5;
                $textWidth = imagefontwidth($fontSize) * strlen($orgName);
                $textX = (imagesx($img) - $textWidth) / 2;
                $textY = (imagesy($img) / 2) - (imagefontheight($fontSize) / 2);
                
                imagestring($img, $fontSize, $textX, $textY, $orgName, $textColor);
                
                imagejpeg($img, $path);
                imagedestroy($img);
            }
        }
        
        // Create placeholder PDFs for organizations
        $orgPdfs = [
            'hope_foundation_statutory.pdf',
            'hope_foundation_verified.pdf',
            'green_earth_statutory.pdf',
            'green_earth_verified.pdf',
            'care_for_all_statutory.pdf',
            'care_for_all_verified.pdf',
        ];
        
        foreach ($orgPdfs as $pdf) {
            $path = "$storagePath/organizations/$pdf";
            if (!file_exists($path)) {
                // Create a simple text file with .pdf extension
                // In a real app, you'd use a PDF generation library
                $orgName = pathinfo($pdf, PATHINFO_FILENAME);
                $orgName = str_replace('_', ' ', $orgName);
                $orgName = ucwords($orgName);
                
                $content = "This is a placeholder PDF for $orgName.\n";
                $content .= "In a real application, this would be a properly formatted PDF document.\n";
                $content .= "Created for demo purposes.";
                
                file_put_contents($path, $content);
            }
        }
    }
} 