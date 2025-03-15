<?php

namespace Database\Seeders;

use App\Models\Transaction;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create demo transactions
        $transactions = [
            // Charity donations
            [
                'user_ic' => '950101012345', // John Doe
                'charity_id' => 1, // Education for Rural Children
                'task_id' => null,
                'amount' => 500.00,
                'type' => 'charity',
                'status' => 'completed',
                'transaction_hash' => '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
                'contract_address' => '0xabcdef1234567890abcdef1234567890abcdef12',
                'message' => 'I believe in the power of education to transform lives!',
                'anonymous' => false,
                'created_at' => Carbon::now()->subDays(30),
                'updated_at' => Carbon::now()->subDays(30),
            ],
            [
                'user_ic' => '880202023456', // Jane Smith
                'charity_id' => 3, // Rainforest Conservation Project
                'task_id' => null,
                'amount' => 1000.00,
                'type' => 'charity',
                'status' => 'completed',
                'transaction_hash' => '0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1a',
                'contract_address' => '0xabcdef1234567890abcdef1234567890abcdef12',
                'message' => 'Let\'s protect our rainforests for future generations!',
                'anonymous' => false,
                'created_at' => Carbon::now()->subDays(25),
                'updated_at' => Carbon::now()->subDays(25),
            ],
            [
                'user_ic' => '770303034567', // Ahmad Bin Abdullah
                'charity_id' => 5, // Mobile Health Clinics
                'task_id' => null,
                'amount' => 750.00,
                'type' => 'charity',
                'status' => 'completed',
                'transaction_hash' => '0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1a2b',
                'contract_address' => '0xabcdef1234567890abcdef1234567890abcdef12',
                'message' => 'Healthcare should be accessible to everyone!',
                'anonymous' => false,
                'created_at' => Carbon::now()->subDays(20),
                'updated_at' => Carbon::now()->subDays(20),
            ],
            [
                'user_ic' => '660404045678', // Siti Binti Mohamed
                'charity_id' => 2, // Digital Learning Initiative
                'task_id' => null,
                'amount' => 300.00,
                'type' => 'charity',
                'status' => 'completed',
                'transaction_hash' => '0x4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1a2b3c',
                'contract_address' => '0xabcdef1234567890abcdef1234567890abcdef12',
                'message' => 'Digital literacy is essential in today\'s world!',
                'anonymous' => true,
                'created_at' => Carbon::now()->subDays(15),
                'updated_at' => Carbon::now()->subDays(15),
            ],
            [
                'user_ic' => '550505056789', // Raj Kumar
                'charity_id' => 6, // Mental Health Support Program
                'task_id' => null,
                'amount' => 250.00,
                'type' => 'charity',
                'status' => 'completed',
                'transaction_hash' => '0x5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1a2b3c4d',
                'contract_address' => '0xabcdef1234567890abcdef1234567890abcdef12',
                'message' => 'Mental health matters!',
                'anonymous' => false,
                'created_at' => Carbon::now()->subDays(10),
                'updated_at' => Carbon::now()->subDays(10),
            ],
            
            // Task funding
            [
                'user_ic' => '950101012345', // John Doe
                'charity_id' => 1, // Education for Rural Children
                'task_id' => 1, // Build Library in Kampung Selamat
                'amount' => 5000.00,
                'type' => 'task',
                'status' => 'completed',
                'transaction_hash' => '0x6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1a2b3c4d5e',
                'contract_address' => '0xabcdef1234567890abcdef1234567890abcdef12',
                'message' => 'Libraries are the foundation of education!',
                'anonymous' => false,
                'created_at' => Carbon::now()->subDays(28),
                'updated_at' => Carbon::now()->subDays(28),
            ],
            [
                'user_ic' => '880202023456', // Jane Smith
                'charity_id' => 3, // Rainforest Conservation Project
                'task_id' => 4, // Tree Planting in Belum Forest
                'amount' => 3000.00,
                'type' => 'task',
                'status' => 'completed',
                'transaction_hash' => '0x7g8h9i0j1k2l3m4n5o6p7q8r9s0t1a2b3c4d5e6f',
                'contract_address' => '0xabcdef1234567890abcdef1234567890abcdef12',
                'message' => 'Every tree planted makes a difference!',
                'anonymous' => false,
                'created_at' => Carbon::now()->subDays(22),
                'updated_at' => Carbon::now()->subDays(22),
            ],
            [
                'user_ic' => '770303034567', // Ahmad Bin Abdullah
                'charity_id' => 5, // Mobile Health Clinics
                'task_id' => 6, // Mobile Clinic for Orang Asli Communities
                'amount' => 10000.00,
                'type' => 'task',
                'status' => 'completed',
                'transaction_hash' => '0x8h9i0j1k2l3m4n5o6p7q8r9s0t1a2b3c4d5e6f7g',
                'contract_address' => '0xabcdef1234567890abcdef1234567890abcdef12',
                'message' => 'Supporting healthcare for indigenous communities!',
                'anonymous' => false,
                'created_at' => Carbon::now()->subDays(18),
                'updated_at' => Carbon::now()->subDays(18),
            ],
            [
                'user_ic' => '660404045678', // Siti Binti Mohamed
                'charity_id' => 2, // Digital Learning Initiative
                'task_id' => 3, // Computer Lab for SK Bukit Tinggi
                'amount' => 5000.00,
                'type' => 'task',
                'status' => 'completed',
                'transaction_hash' => '0x9i0j1k2l3m4n5o6p7q8r9s0t1a2b3c4d5e6f7g8h',
                'contract_address' => '0xabcdef1234567890abcdef1234567890abcdef12',
                'message' => 'Empowering students with technology!',
                'anonymous' => true,
                'created_at' => Carbon::now()->subDays(12),
                'updated_at' => Carbon::now()->subDays(12),
            ],
            [
                'user_ic' => '550505056789', // Raj Kumar
                'charity_id' => 4, // Clean Beaches Initiative
                'task_id' => 5, // Beach Cleanup at Pantai Cenang
                'amount' => 1000.00,
                'type' => 'task',
                'status' => 'completed',
                'transaction_hash' => '0x0j1k2l3m4n5o6p7q8r9s0t1a2b3c4d5e6f7g8h9i',
                'contract_address' => '0xabcdef1234567890abcdef1234567890abcdef12',
                'message' => 'Clean beaches for a cleaner ocean!',
                'anonymous' => false,
                'created_at' => Carbon::now()->subDays(8),
                'updated_at' => Carbon::now()->subDays(8),
            ],
            
            // Recent blockchain transactions
            [
                'user_ic' => '950101012345', // John Doe
                'charity_id' => 6, // Mental Health Support Program
                'task_id' => null,
                'amount' => 0.05, // ETH amount
                'type' => 'charity',
                'status' => 'completed',
                'transaction_hash' => '0x1k2l3m4n5o6p7q8r9s0t1a2b3c4d5e6f7g8h9i0j',
                'contract_address' => '0xabcdef1234567890abcdef1234567890abcdef12',
                'message' => 'Supporting mental health initiatives with blockchain!',
                'anonymous' => false,
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(3),
            ],
            [
                'user_ic' => '880202023456', // Jane Smith
                'charity_id' => 1, // Education for Rural Children
                'task_id' => 2, // School Supplies Distribution
                'amount' => 0.1, // ETH amount
                'type' => 'task',
                'status' => 'completed',
                'transaction_hash' => '0x2l3m4n5o6p7q8r9s0t1a2b3c4d5e6f7g8h9i0j1k',
                'contract_address' => '0xabcdef1234567890abcdef1234567890abcdef12',
                'message' => 'Blockchain for education!',
                'anonymous' => false,
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ],
            [
                'user_ic' => '770303034567', // Ahmad Bin Abdullah
                'charity_id' => 3, // Rainforest Conservation Project
                'task_id' => null,
                'amount' => 0.2, // ETH amount
                'type' => 'charity',
                'status' => 'completed',
                'transaction_hash' => '0x3m4n5o6p7q8r9s0t1a2b3c4d5e6f7g8h9i0j1k2l',
                'contract_address' => '0xabcdef1234567890abcdef1234567890abcdef12',
                'message' => 'Transparent conservation funding through blockchain!',
                'anonymous' => false,
                'created_at' => Carbon::now()->subDay(),
                'updated_at' => Carbon::now()->subDay(),
            ],
            [
                'user_ic' => '660404045678', // Siti Binti Mohamed
                'charity_id' => 5, // Mobile Health Clinics
                'task_id' => 6, // Mobile Clinic for Orang Asli Communities
                'amount' => 0.15, // ETH amount
                'type' => 'task',
                'status' => 'completed',
                'transaction_hash' => '0x4n5o6p7q8r9s0t1a2b3c4d5e6f7g8h9i0j1k2l3m',
                'contract_address' => '0xabcdef1234567890abcdef1234567890abcdef12',
                'message' => 'Healthcare on the blockchain!',
                'anonymous' => true,
                'created_at' => Carbon::now()->subHours(12),
                'updated_at' => Carbon::now()->subHours(12),
            ],
            [
                'user_ic' => '550505056789', // Raj Kumar
                'charity_id' => 2, // Digital Learning Initiative
                'task_id' => null,
                'amount' => 0.08, // ETH amount
                'type' => 'charity',
                'status' => 'completed',
                'transaction_hash' => '0x5o6p7q8r9s0t1a2b3c4d5e6f7g8h9i0j1k2l3m4n',
                'contract_address' => '0xabcdef1234567890abcdef1234567890abcdef12',
                'message' => 'Digital education powered by blockchain!',
                'anonymous' => false,
                'created_at' => Carbon::now()->subHours(6),
                'updated_at' => Carbon::now()->subHours(6),
            ],
        ];

        foreach ($transactions as $transactionData) {
            Transaction::create($transactionData);
        }
    }
} 