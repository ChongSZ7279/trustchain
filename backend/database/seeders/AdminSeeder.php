<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds to create admin users.
     */
    public function run(): void
    {
        // Create a default admin user if it doesn't exist
        if (!User::where('gmail', 'admin@trustchain.com')->exists()) {
            User::create([
                'ic_number' => '991234567890',
                'name' => 'Admin User',
                'password' => Hash::make('admin123'),
                'front_ic_picture' => 'ic/default-front.jpg',
                'back_ic_picture' => 'ic/default-back.jpg',
                'phone_number' => '0123456789',
                'gmail' => 'admin@trustchain.com',
                'wallet_address' => '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                'is_admin' => true,
                'frame_color_code' => '#FF5733',
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // Create a second admin user for testing
        if (!User::where('gmail', 'admin2@trustchain.com')->exists()) {
            User::create([
                'ic_number' => '881234567891',
                'name' => 'Admin User 2',
                'password' => Hash::make('admin123'),
                'front_ic_picture' => 'ic/default-front.jpg',
                'back_ic_picture' => 'ic/default-back.jpg',
                'phone_number' => '0123456780',
                'gmail' => 'admin2@trustchain.com',
                'wallet_address' => '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
                'is_admin' => true,
                'frame_color_code' => '#3366FF',
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        $this->command->info('Admin users created successfully!');
    }
}
