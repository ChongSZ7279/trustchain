<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
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

        // Common password for all test users
        $password = Hash::make('password123');

        // Create admin user
        User::create([
            'ic_number' => '991234567890',
            'name' => 'Admin User',
            'password' => $password,
            'front_ic_picture' => 'ic/default-front.jpg',
            'back_ic_picture' => 'ic/default-back.jpg',
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
                'ic_number' => '881234567890',
                'name' => 'Ahmad Bin Abdullah',
                'wallet_address' => $walletAddresses['user1'],
                'gmail' => 'ahmad@example.com',
                'phone_number' => '01123456789',
                'frame_color_code' => '#3399FF'
            ],
            [
                'ic_number' => '790512145678',
                'name' => 'Siti Nur Aisyah',
                'wallet_address' => $walletAddresses['user2'],
                'gmail' => 'siti@example.com',
                'phone_number' => '01223456789',
                'frame_color_code' => '#FF99CC'
            ],
            [
                'ic_number' => '850623789012',
                'name' => 'Raj Kumar',
                'wallet_address' => $walletAddresses['user3'],
                'gmail' => 'raj@example.com',
                'phone_number' => '01323456789',
                'frame_color_code' => '#66CC99'
            ],
            [
                'ic_number' => '920415678901',
                'name' => 'Lee Wei Ling',
                'wallet_address' => $walletAddresses['user4'],
                'gmail' => 'lee@example.com',
                'phone_number' => '01423456789',
                'frame_color_code' => '#FFCC00'
            ],
            [
                'ic_number' => '860708123456',
                'name' => 'Noor Fatimah',
                'wallet_address' => $walletAddresses['user5'],
                'gmail' => 'noor@example.com',
                'phone_number' => '01523456789',
                'frame_color_code' => '#CC66FF'
            ],
            [
                'ic_number' => '900230456789',
                'name' => 'David Wong',
                'wallet_address' => $walletAddresses['user6'],
                'gmail' => 'david@example.com',
                'phone_number' => '01623456789',
                'frame_color_code' => '#33CC33'
            ],
            [
                'ic_number' => '781115678901',
                'name' => 'Amir Ismail',
                'wallet_address' => $walletAddresses['user7'],
                'gmail' => 'amir@example.com',
                'phone_number' => '01723456789',
                'frame_color_code' => '#FF6600'
            ],
            [
                'ic_number' => '950628901234',
                'name' => 'Grace Tan',
                'wallet_address' => $walletAddresses['user8'],
                'gmail' => 'grace@example.com',
                'phone_number' => '01823456789',
                'frame_color_code' => '#9966CC'
            ],
            [
                'ic_number' => '830519345678',
                'name' => 'Mohd Faisal',
                'wallet_address' => $walletAddresses['user9'],
                'gmail' => 'faisal@example.com',
                'phone_number' => '01923456789',
                'frame_color_code' => '#CC3300'
            ]
        ];

        foreach ($users as $index => $userData) {
            // Create with varying timestamps to simulate users joining over time
            $createdAt = now()->subDays(rand(7, 180));

            User::create([
                'ic_number' => $userData['ic_number'],
                'name' => $userData['name'],
                'password' => $password,
                'front_ic_picture' => 'ic/user' . ($index + 1) . '-front.jpg',
                'back_ic_picture' => 'ic/user' . ($index + 1) . '-back.jpg',
                'phone_number' => $userData['phone_number'],
                'gmail' => $userData['gmail'],
                'wallet_address' => $userData['wallet_address'],
                'frame_color_code' => $userData['frame_color_code'],
                'created_at' => $createdAt,
                'updated_at' => $createdAt
            ]);
        }
    }
}