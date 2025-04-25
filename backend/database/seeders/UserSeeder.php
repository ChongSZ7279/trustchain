<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define wallet addresses from your Hardhat node
        $walletAddresses = [
            'admin' => '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Account #0
            'user1' => '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Account #1
            'user2' => '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', // Account #2
            'user3' => '0x90F79bf6EB2c4f870365E785982E1f101E93b906', // Account #3
            'user4' => '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', // Account #4
            'user5' => '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', // Account #5
            'user6' => '0x976EA74026E726554dB657fA54763abd0C3a0aa9', // Account #6
            'user7' => '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955', // Account #7
            'user8' => '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f', // Account #8
            'user9' => '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720', // Account #9
        ];

        // Setup storage directories and copy seed files
        $this->prepareStorageDirectories();

        // Common password for all test users
        $password = Hash::make('password123');

        // Create admin user
        User::create([
            'ic_number' => '991234567890',
            'name' => 'Admin User',
            'password' => $password,
            'front_ic_picture' => 'ic_pictures/front1.jpg',
            'back_ic_picture' => 'ic_pictures/back1.jpg',
            'profile_picture' => 'profile_pictures/1.jpg',
            'phone_number' => '0123456789',
            'gmail' => 'admin@trustchain.com',
            'wallet_address' => $walletAddresses['admin'],
            'is_admin' => true,
            'frame_color_code' => '#FF5733',
            'created_at' => now()->subMonths(6),
            'updated_at' => now()->subMonths(6)
        ]);

        // Create regular users with Malaysian-style IC numbers
        $users = [
            [
                'ic_number' => '781115678901', // This specific IC as requested
                'name' => 'Ahmad Bin Abdullah',
                'wallet_address' => $walletAddresses['user1'],
                'gmail' => 'ahmad@example.com',
                'phone_number' => '01123456789',
                'frame_color_code' => '#3399FF',
                'profile_picture' => 'profile_pictures/1.jpg',
                'front_ic_picture' => 'ic_pictures/front1.jpg',
                'back_ic_picture' => 'ic_pictures/back1.jpg'
            ],
            [
                'ic_number' => '790512145678',
                'name' => 'Siti Nur Aisyah',
                'wallet_address' => $walletAddresses['user2'],
                'gmail' => 'siti@example.com',
                'phone_number' => '01223456789',
                'frame_color_code' => '#FF99CC',
                'profile_picture' => 'profile_pictures/2.jpg',
                'front_ic_picture' => 'ic_pictures/front2.jpg',
                'back_ic_picture' => 'ic_pictures/back2.jpg'
            ],
            [
                'ic_number' => '850623789012',
                'name' => 'Raj Kumar',
                'wallet_address' => $walletAddresses['user3'],
                'gmail' => 'raj@example.com',
                'phone_number' => '01323456789',
                'frame_color_code' => '#66CC99',
                'profile_picture' => 'profile_pictures/3.jpg',
                'front_ic_picture' => 'ic_pictures/front3.jpg',
                'back_ic_picture' => 'ic_pictures/back3.jpg'
            ],
            [
                'ic_number' => '920415678901',
                'name' => 'Lee Wei Ling',
                'wallet_address' => $walletAddresses['user4'],
                'gmail' => 'lee@example.com',
                'phone_number' => '01423456789',
                'frame_color_code' => '#FFCC00',
                'profile_picture' => 'profile_pictures/4.jpg',
                'front_ic_picture' => 'ic_pictures/front4.jpg',
                'back_ic_picture' => 'ic_pictures/back4.jpg'
            ],
            [
                'ic_number' => '860708123456',
                'name' => 'Noor Fatimah',
                'wallet_address' => $walletAddresses['user5'],
                'gmail' => 'noor@example.com',
                'phone_number' => '01523456789',
                'frame_color_code' => '#CC66FF',
                'profile_picture' => 'profile_pictures/5.jpg',
                'front_ic_picture' => 'ic_pictures/front5.jpg',
                'back_ic_picture' => 'ic_pictures/back5.jpg'
            ],
            [
                'ic_number' => '900230456789',
                'name' => 'David Wong',
                'wallet_address' => $walletAddresses['user6'],
                'gmail' => 'david@example.com',
                'phone_number' => '01623456789',
                'frame_color_code' => '#33CC33',
                'profile_picture' => 'profile_pictures/6.jpg',
                'front_ic_picture' => 'ic_pictures/front6.jpg',
                'back_ic_picture' => 'ic_pictures/back6.jpg'
            ],
            [
                'ic_number' => '881115678901',
                'name' => 'Amir Ismail',
                'wallet_address' => $walletAddresses['user7'],
                'gmail' => 'amir@example.com',
                'phone_number' => '01723456789',
                'frame_color_code' => '#FF6600',
                'profile_picture' => 'profile_pictures/7.jpg',
                'front_ic_picture' => 'ic_pictures/front7.jpg',
                'back_ic_picture' => 'ic_pictures/back7.jpg'
            ],
            [
                'ic_number' => '950628901234',
                'name' => 'Grace Tan',
                'wallet_address' => $walletAddresses['user8'],
                'gmail' => 'grace@example.com',
                'phone_number' => '01823456789',
                'frame_color_code' => '#9966CC',
                'profile_picture' => 'profile_pictures/8.jpg',
                'front_ic_picture' => 'ic_pictures/front8.jpg',
                'back_ic_picture' => 'ic_pictures/back8.jpg'
            ],
            [
                'ic_number' => '830519345678',
                'name' => 'Mohd Faisal',
                'wallet_address' => $walletAddresses['user9'],
                'gmail' => 'faisal@example.com',
                'phone_number' => '01923456789',
                'frame_color_code' => '#CC3300',
                'profile_picture' => 'profile_pictures/9.jpg',
                'front_ic_picture' => 'ic_pictures/front9.jpg',
                'back_ic_picture' => 'ic_pictures/back9.jpg'
            ]
        ];

        foreach ($users as $userData) {
            // Create with varying timestamps to simulate users joining over time
            $createdAt = now()->subDays(rand(7, 180));

            // Add timestamps
            $userData['created_at'] = $createdAt;
            $userData['updated_at'] = $createdAt;
            $userData['password'] = $password;

            User::create($userData);
        }

        $this->command->info('Users created successfully');
    }

    /**
     * Prepare storage directories and copy seed files to storage
     */
    private function prepareStorageDirectories(): void
    {
        // Create storage directories if they don't exist
        $directories = ['profile_pictures', 'ic_pictures'];
        foreach ($directories as $dir) {
            if (!Storage::disk('public')->exists($dir)) {
                Storage::disk('public')->makeDirectory($dir);
            }
        }

        // Create profile pictures
        $this->createPlaceholderProfilePictures('profile_pictures', 10);
        
        // Create IC pictures (front and back)
        $this->createPlaceholderIcPictures('ic_pictures', 10);
    }

    /**
     * Create placeholder profile pictures in storage
     * 
     * @param string $directory The directory name within storage/public
     * @param int $count Number of placeholder images to create
     */
    private function createPlaceholderProfilePictures(string $directory, int $count): void
    {
        $seedDir = base_path('resources/seed-data/profile_pictures');
        
        for ($i = 1; $i <= $count; $i++) {
            $targetPath = "{$directory}/{$i}.jpg";
            
            // Check if file already exists in storage
            if (!Storage::disk('public')->exists($targetPath)) {
                // Check if we have a seed file
                $seedFile = "{$seedDir}/{$i}.jpg";
                if (File::exists($seedFile)) {
                    $content = File::get($seedFile);
                } else {
                    // Create a placeholder
                    $content = "This is a placeholder for profile picture #{$i}.\n";
                    $content .= "Created for testing purposes only.\n";
                    $content .= "Date: " . date('Y-m-d H:i:s');
                }
                
                Storage::disk('public')->put($targetPath, $content);
            }
        }
    }

    /**
     * Create placeholder IC pictures in storage (front and back)
     * 
     * @param string $directory The directory name within storage/public
     * @param int $count Number of placeholder images to create
     */
    private function createPlaceholderIcPictures(string $directory, int $count): void
    {
        $seedDir = base_path('resources/seed-data/ic_pictures');
        
        for ($i = 1; $i <= $count; $i++) {
            // Front IC
            $frontTargetPath = "{$directory}/front{$i}.jpg";
            
            // Check if file already exists in storage
            if (!Storage::disk('public')->exists($frontTargetPath)) {
                // Check if we have a seed file
                $frontSeedFile = "{$seedDir}/front{$i}.jpg";
                if (File::exists($frontSeedFile)) {
                    $content = File::get($frontSeedFile);
                } else {
                    // Create a placeholder
                    $content = "This is a placeholder for front IC image #{$i}.\n";
                    $content .= "Created for testing purposes only.\n";
                    $content .= "Date: " . date('Y-m-d H:i:s');
                }
                
                Storage::disk('public')->put($frontTargetPath, $content);
            }
            
            // Back IC
            $backTargetPath = "{$directory}/back{$i}.jpg";
            
            // Check if file already exists in storage
            if (!Storage::disk('public')->exists($backTargetPath)) {
                // Check if we have a seed file
                $backSeedFile = "{$seedDir}/back{$i}.jpg";
                if (File::exists($backSeedFile)) {
                    $content = File::get($backSeedFile);
                } else {
                    // Create a placeholder
                    $content = "This is a placeholder for back IC image #{$i}.\n";
                    $content .= "Created for testing purposes only.\n";
                    $content .= "Date: " . date('Y-m-d H:i:s');
                }
                
                Storage::disk('public')->put($backTargetPath, $content);
            }
        }
    }
}