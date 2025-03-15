<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create demo users
        $users = [
            [
                'ic_number' => '950101012345',
                'name' => 'John Doe',
                'password' => Hash::make('password123'),
                'profile_picture' => 'users/john_profile.jpg',
                'front_ic_picture' => 'users/john_ic_front.jpg',
                'back_ic_picture' => 'users/john_ic_back.jpg',
                'phone_number' => '0123456789',
                'gmail' => 'john.doe@example.com',
                'wallet_address' => '0x1234567890abcdef1234567890abcdef12345678',
                'frame_color_code' => '#4F46E5',
            ],
            [
                'ic_number' => '880202023456',
                'name' => 'Jane Smith',
                'password' => Hash::make('password123'),
                'profile_picture' => 'users/jane_profile.jpg',
                'front_ic_picture' => 'users/jane_ic_front.jpg',
                'back_ic_picture' => 'users/jane_ic_back.jpg',
                'phone_number' => '0123456788',
                'gmail' => 'jane.smith@example.com',
                'wallet_address' => '0x2345678901abcdef2345678901abcdef23456789',
                'frame_color_code' => '#10B981',
            ],
            [
                'ic_number' => '770303034567',
                'name' => 'Ahmad Bin Abdullah',
                'password' => Hash::make('password123'),
                'profile_picture' => 'users/ahmad_profile.jpg',
                'front_ic_picture' => 'users/ahmad_ic_front.jpg',
                'back_ic_picture' => 'users/ahmad_ic_back.jpg',
                'phone_number' => '0123456787',
                'gmail' => 'ahmad@example.com',
                'wallet_address' => '0x3456789012abcdef3456789012abcdef34567890',
                'frame_color_code' => '#F59E0B',
            ],
            [
                'ic_number' => '660404045678',
                'name' => 'Siti Binti Mohamed',
                'password' => Hash::make('password123'),
                'profile_picture' => 'users/siti_profile.jpg',
                'front_ic_picture' => 'users/siti_ic_front.jpg',
                'back_ic_picture' => 'users/siti_ic_back.jpg',
                'phone_number' => '0123456786',
                'gmail' => 'siti@example.com',
                'wallet_address' => '0x4567890123abcdef4567890123abcdef45678901',
                'frame_color_code' => '#EC4899',
            ],
            [
                'ic_number' => '550505056789',
                'name' => 'Raj Kumar',
                'password' => Hash::make('password123'),
                'profile_picture' => 'users/raj_profile.jpg',
                'front_ic_picture' => 'users/raj_ic_front.jpg',
                'back_ic_picture' => 'users/raj_ic_back.jpg',
                'phone_number' => '0123456785',
                'gmail' => 'raj@example.com',
                'wallet_address' => '0x5678901234abcdef5678901234abcdef56789012',
                'frame_color_code' => '#8B5CF6',
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }

        // Create placeholder images in storage
        $this->createPlaceholderImages();
    }

    /**
     * Create placeholder images in the storage directory
     */
    private function createPlaceholderImages(): void
    {
        $storagePath = storage_path('app/public');
        
        // Create directories if they don't exist
        if (!file_exists("$storagePath/users")) {
            mkdir("$storagePath/users", 0755, true);
        }
        
        // Create placeholder images for users
        $userImages = [
            'john_profile.jpg', 'john_ic_front.jpg', 'john_ic_back.jpg',
            'jane_profile.jpg', 'jane_ic_front.jpg', 'jane_ic_back.jpg',
            'ahmad_profile.jpg', 'ahmad_ic_front.jpg', 'ahmad_ic_back.jpg',
            'siti_profile.jpg', 'siti_ic_front.jpg', 'siti_ic_back.jpg',
            'raj_profile.jpg', 'raj_ic_front.jpg', 'raj_ic_back.jpg',
        ];
        
        foreach ($userImages as $image) {
            $path = "$storagePath/users/$image";
            if (!file_exists($path)) {
                // Create a simple colored image
                $img = imagecreatetruecolor(300, 300);
                $color = imagecolorallocate($img, rand(0, 255), rand(0, 255), rand(0, 255));
                imagefill($img, 0, 0, $color);
                imagejpeg($img, $path);
                imagedestroy($img);
            }
        }
    }
} 