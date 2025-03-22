<?php

namespace Database\Seeders;

use App\Models\Charity;
use Illuminate\Database\Seeder;

class CharitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create demo charities
        $charities = [
            // Hope Foundation Malaysia charities
            [
                'organization_id' => 1, // Hope Foundation Malaysia
                'name' => 'Education for Rural Children',
                'category' => 'Education',
                'description' => 'This charity aims to provide educational resources and support to children in rural areas of Malaysia who lack access to quality education.',
                'objective' => 'To build libraries, provide school supplies, and offer tutoring programs to children in rural communities.',
                'fund_targeted' => 50000.00,
                'fund_received' => 25000.00,
                'picture_path' => 'charities/rural_education.jpg',
                'verified_document' => 'charities/rural_education_verified.pdf',
                'is_verified' => true,
            ],
            [
                'organization_id' => 1, // Hope Foundation Malaysia
                'name' => 'Digital Learning Initiative',
                'category' => 'Education',
                'description' => 'This charity focuses on bridging the digital divide by providing computers, internet access, and digital literacy training to underprivileged students.',
                'objective' => 'To equip 1,000 students with computers and digital skills by the end of the year.',
                'fund_targeted' => 75000.00,
                'fund_received' => 30000.00,
                'picture_path' => 'charities/digital_learning.jpg',
                'verified_document' => 'charities/digital_learning_verified.pdf',
                'is_verified' => true,
            ],
            
            // Green Earth Malaysia charities
            [
                'organization_id' => 2, // Green Earth Malaysia
                'name' => 'Rainforest Conservation Project',
                'category' => 'Environment',
                'description' => 'This charity works to protect Malaysia\'s rainforests from deforestation and promote sustainable forest management practices.',
                'objective' => 'To conserve 5,000 hectares of rainforest and plant 10,000 native trees in deforested areas.',
                'fund_targeted' => 100000.00,
                'fund_received' => 45000.00,
                'picture_path' => 'charities/rainforest_conservation.jpg',
                'verified_document' => 'charities/rainforest_conservation_verified.pdf',
                'is_verified' => true,
            ],
            [
                'organization_id' => 2, // Green Earth Malaysia
                'name' => 'Clean Beaches Initiative',
                'category' => 'Environment',
                'description' => 'This charity organizes beach cleanup activities and raises awareness about marine pollution and plastic waste.',
                'objective' => 'To clean 20 beaches across Malaysia and reduce plastic waste through education and advocacy.',
                'fund_targeted' => 30000.00,
                'fund_received' => 15000.00,
                'picture_path' => 'charities/clean_beaches.jpg',
                'verified_document' => 'charities/clean_beaches_verified.pdf',
                'is_verified' => true,
            ],
            
            // Care For All charities
            [
                'organization_id' => 3, // Care For All
                'name' => 'Mobile Health Clinics',
                'category' => 'Healthcare',
                'description' => 'This charity provides mobile health clinics to remote and underserved communities, offering basic healthcare services and health education.',
                'objective' => 'To operate 5 mobile clinics serving 50 remote communities and provide healthcare to 10,000 individuals.',
                'fund_targeted' => 120000.00,
                'fund_received' => 60000.00,
                'picture_path' => 'charities/mobile_clinics.jpg',
                'verified_document' => 'charities/mobile_clinics_verified.pdf',
                'is_verified' => true,
            ],
            [
                'organization_id' => 3, // Care For All
                'name' => 'Mental Health Support Program',
                'category' => 'Healthcare',
                'description' => 'This charity focuses on mental health awareness, education, and support services for individuals struggling with mental health issues.',
                'objective' => 'To provide counseling services to 2,000 individuals and conduct mental health workshops in 50 schools and communities.',
                'fund_targeted' => 80000.00,
                'fund_received' => 35000.00,
                'picture_path' => 'charities/mental_health.jpg',
                'verified_document' => 'charities/mental_health_verified.pdf',
                'is_verified' => true,
            ],
        ];

        foreach ($charities as $charityData) {
            Charity::create($charityData);
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
        if (!file_exists("$storagePath/charities")) {
            mkdir("$storagePath/charities", 0755, true);
        }
        
        // Create placeholder images for charities
        $charityImages = [
            'rural_education.jpg',
            'digital_learning.jpg',
            'rainforest_conservation.jpg',
            'clean_beaches.jpg',
            'mobile_clinics.jpg',
            'mental_health.jpg',
        ];
        
        foreach ($charityImages as $image) {
            $path = "$storagePath/charities/$image";
            if (!file_exists($path)) {
                // Create a simple colored image
                $img = imagecreatetruecolor(800, 400);
                $color = imagecolorallocate($img, rand(0, 255), rand(0, 255), rand(0, 255));
                imagefill($img, 0, 0, $color);
                
                // Add some text
                $textColor = imagecolorallocate($img, 255, 255, 255);
                $charityName = pathinfo($image, PATHINFO_FILENAME);
                $charityName = str_replace('_', ' ', $charityName);
                $charityName = ucwords($charityName);
                
                // Center the text
                $fontSize = 5;
                $textWidth = imagefontwidth($fontSize) * strlen($charityName);
                $textX = (imagesx($img) - $textWidth) / 2;
                $textY = (imagesy($img) / 2) - (imagefontheight($fontSize) / 2);
                
                imagestring($img, $fontSize, $textX, $textY, $charityName, $textColor);
                
                imagejpeg($img, $path);
                imagedestroy($img);
            }
        }
        
        // Create placeholder PDFs for charities
        $charityPdfs = [
            'rural_education_verified.pdf',
            'digital_learning_verified.pdf',
            'rainforest_conservation_verified.pdf',
            'clean_beaches_verified.pdf',
            'mobile_clinics_verified.pdf',
            'mental_health_verified.pdf',
        ];
        
        foreach ($charityPdfs as $pdf) {
            $path = "$storagePath/charities/$pdf";
            if (!file_exists($path)) {
                // Create a simple text file with .pdf extension
                $charityName = pathinfo($pdf, PATHINFO_FILENAME);
                $charityName = str_replace('_', ' ', $charityName);
                $charityName = ucwords($charityName);
                
                $content = "This is a placeholder verification document for $charityName.\n";
                $content .= "In a real application, this would be a properly formatted PDF document.\n";
                $content .= "Created for demo purposes.";
                
                file_put_contents($path, $content);
            }
        }
    }
} 