<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Organization;
use App\Models\Charity;
use App\Models\Task;
use App\Models\Donation;
use App\Models\TaskPicture;
use App\Models\Transaction;
use App\Models\CharityFollower;
use App\Models\OrganizationFollower;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Define wallet addresses from your Hardhat node
        $walletAddresses = [
            'admin' => '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Account #0
            'tech_org' => '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Account #1
            'green_org' => '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', // Account #2
            'john' => '0x90F79bf6EB2c4f870365E785982E1f101E93b906', // Account #3
            'jane' => '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'  // Account #4
        ];

        // Create admin user
        $admin = User::create([
            'ic_number' => 'A12345678',
            'name' => 'Admin User',
            'password' => Hash::make('password123'),
            'profile_picture' => null,
            'front_ic_picture' => 'ic/admin-front.jpg',
            'back_ic_picture' => 'ic/admin-back.jpg',
            'phone_number' => '+60123456789',
            'gmail' => 'admin@trustchain.com',
            'wallet_address' => $walletAddresses['admin'],
            'frame_color_code' => '#FF5733'
        ]);

        // Create organizations
        $organizations = [
            [
                'name' => 'Tech for Good',
                'logo' => 'organizations/tech-logo.jpg',
                'category' => 'Technology',
                'description' => 'Technology solutions for social impact',
                'objectives' => 'To leverage technology for social good and community development',
                'representative_id' => 'A12345678',
                'statutory_declaration' => 'documents/tech-statutory.pdf',
                'verified_document' => 'documents/tech-verified.pdf',
                'wallet_address' => $walletAddresses['tech_org'],
                'register_address' => '123 Tech Street, San Francisco, CA 94105',
                'gmail' => 'tech@trustchain.com',
                'phone_number' => '+60123456790',
                'website' => 'https://techforgood.org',
                'facebook' => 'https://facebook.com/techforgood',
                'instagram' => 'https://instagram.com/techforgood',
                'others' => null,
                'is_verified' => true,
                'password' => Hash::make('password123')
            ],
            [
                'name' => 'Green Earth Initiative',
                'logo' => 'organizations/green-logo.jpg',
                'category' => 'Environment',
                'description' => 'Environmental conservation organization',
                'objectives' => 'To protect and preserve our environment for future generations',
                'representative_id' => 'A12345678',
                'statutory_declaration' => 'documents/green-statutory.pdf',
                'verified_document' => 'documents/green-verified.pdf',
                'wallet_address' => $walletAddresses['green_org'],
                'register_address' => '456 Green Street, Seattle, WA 98101',
                'gmail' => 'green@trustchain.com',
                'phone_number' => '+60123456791',
                'website' => 'https://greenearth.org',
                'facebook' => 'https://facebook.com/greenearth',
                'instagram' => 'https://instagram.com/greenearth',
                'others' => null,
                'is_verified' => true,
                'password' => Hash::make('password123')
            ]
        ];

        foreach ($organizations as $org) {
            Organization::create($org);
        }

        // Create charities
        $charities = [
            [
                'organization_id' => 1,
                'name' => 'Children First',
                'category' => 'Education',
                'description' => 'Supporting children education',
                'objective' => 'To provide quality education to underprivileged children',
                'fund_targeted' => 50000.00,
                'picture_path' => 'charities/children-first.jpg',
                'verified_document' => 'documents/children-first-verified.pdf'
            ],
            [
                'organization_id' => 2,
                'name' => 'Food Bank Network',
                'category' => 'Food Security',
                'description' => 'Fighting hunger in communities',
                'objective' => 'To ensure no one goes to bed hungry',
                'fund_targeted' => 75000.00,
                'picture_path' => 'charities/food-bank.jpg',
                'verified_document' => 'documents/food-bank-verified.pdf'
            ]
        ];

        foreach ($charities as $charity) {
            Charity::create($charity);
        }

        // Create tasks
        $tasks = [
            [
                'charity_id' => 1,
                'name' => 'Website Development',
                'description' => 'Create a new website for charity organization',
                'fund_targeted' => 10000.00,
                'status' => 'in_progress',
                'proof' => null
            ],
            [
                'charity_id' => 2,
                'name' => 'Food Distribution',
                'description' => 'Organize food distribution event',
                'fund_targeted' => 5000.00,
                'status' => 'pending',
                'proof' => null
            ]
        ];

        foreach ($tasks as $task) {
            Task::create($task);
        }

        // Create regular users
        $users = [
            [
                'ic_number' => 'B12345678',
                'name' => 'John Doe',
                'password' => Hash::make('password123'),
                'front_ic_picture' => 'ic/john-front.jpg',
                'back_ic_picture' => 'ic/john-back.jpg',
                'phone_number' => '+60123456794',
                'gmail' => 'john@example.com',
                'wallet_address' => $walletAddresses['john']
            ],
            [
                'ic_number' => 'C12345678',
                'name' => 'Jane Smith',
                'password' => Hash::make('password123'),
                'front_ic_picture' => 'ic/jane-front.jpg',
                'back_ic_picture' => 'ic/jane-back.jpg',
                'phone_number' => '+60123456795',
                'gmail' => 'jane@example.com',
                'wallet_address' => $walletAddresses['jane']
            ]
        ];

        foreach ($users as $user) {
            User::create($user);
        }

        // Create donations
        $contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // Your deployed contract address
        
        $donations = [
            [
                'user_id' => 'B12345678',
                'transaction_hash' => '0xabc123def456',
                'amount' => 1.5,
                'currency_type' => 'ETH',
                'cause_id' => 1,
                'status' => 'completed',
                'smart_contract_data' => json_encode([
                    'contract_address' => $contractAddress,
                    'network' => 'Ethereum'
                ]),
                'donor_message' => 'Happy to help with education!',
                'is_anonymous' => false,
                'completed_at' => now()
            ],
            [
                'user_id' => 'C12345678',
                'transaction_hash' => '0xdef456abc789',
                'amount' => 2.0,
                'currency_type' => 'ETH',
                'cause_id' => 2,
                'status' => 'completed',
                'smart_contract_data' => json_encode([
                    'contract_address' => $contractAddress,
                    'network' => 'Ethereum'
                ]),
                'donor_message' => 'Supporting food security!',
                'is_anonymous' => false,
                'completed_at' => now()
            ]
        ];

        foreach ($donations as $donation) {
            Donation::create($donation);
        }

        // Create task pictures
        $taskPictures = [
            [
                'task_id' => 1,
                'path' => 'tasks/website-dev.jpg',
                'original_filename' => 'website-dev.jpg',
                'mime_type' => 'image/jpeg',
                'file_size' => 1024
            ],
            [
                'task_id' => 2,
                'path' => 'tasks/food-distribution.jpg',
                'original_filename' => 'food-distribution.jpg',
                'mime_type' => 'image/jpeg',
                'file_size' => 1024
            ]
        ];

        foreach ($taskPictures as $picture) {
            TaskPicture::create($picture);
        }

        // Create charity followers
        CharityFollower::create([
            'user_ic' => 'B12345678',
            'charity_id' => 1
        ]);

        // Create organization followers
        OrganizationFollower::create([
            'user_ic' => 'C12345678',
            'organization_id' => 1
        ]);

        // Create transactions
        $transactions = [
            [
                'user_ic' => 'B12345678',
                'charity_id' => 1,
                'amount' => 100.00,
                'type' => 'charity',
                'status' => 'completed',
                'transaction_hash' => '0xabc123def456',
                'contract_address' => $contractAddress,
                'message' => 'Happy to help with education!',
                'anonymous' => false
            ],
            [
                'user_ic' => 'C12345678',
                'charity_id' => 2,
                'amount' => 250.00,
                'type' => 'charity',
                'status' => 'completed',
                'transaction_hash' => '0xdef456abc789',
                'contract_address' => $contractAddress,
                'message' => 'Supporting food security!',
                'anonymous' => false
            ]
        ];

        foreach ($transactions as $transaction) {
            Transaction::create($transaction);
        }
    }
}
