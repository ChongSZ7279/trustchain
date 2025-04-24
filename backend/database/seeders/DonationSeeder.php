<?php

namespace Database\Seeders;

use App\Models\Donation;
use App\Models\User;
use App\Models\Charity;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DonationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Smart contract address on your local chain
        $contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

        // Get all users except admin
        $users = User::where('ic_number', '!=', '991234567890')->get();

        // Get all charities
        $charities = Charity::all();

        // Positive donation messages
        $messages = [
            'Happy to support this important cause!',
            'Keep up the great work!',
            'Making a difference together.',
            'Proud to contribute to this initiative.',
            'Hope this helps achieve your goals!',
            'Wishing your charity much success.',
            'For a better future for all of us.',
            'Supporting your mission with this small contribution.',
            'Thank you for the amazing work you do!',
            'Together we can make a difference.',
            null, // Some donors leave no message
        ];

        // Generate multiple charity donations per user
        $donationsData = [];

        foreach ($users as $user) {
            // Each user makes 1-3 donations
            $donationCount = rand(1, 3);

            for ($i = 0; $i < $donationCount; $i++) {
                // Select random charity
                $charity = $charities->random();

                // Create donation
                $amount = round(rand(1, 50) / 10, 1); // Between 0.1 and 5.0 SCROLL
                $isAnonymous = (rand(0, 10) < 2); // 20% chance of anonymous donation

                // Create a unique hash-like transaction ID - ALWAYS provide a transaction hash
                $txHash = '0x' . Str::random(40);

                // Generate a timestamp between 1-180 days ago
                $completedAt = now()->subDays(rand(1, 180));

                $donationsData[] = [
                    'user_id' => $user->ic_number,
                    'transaction_hash' => $txHash, // All donations MUST have a transaction hash
                    'amount' => $amount,
                    'currency_type' => 'SCROLL',
                    'cause_id' => $charity->id,
                    'status' => 'completed',
                    'smart_contract_data' => json_encode([
                        'contract_address' => $contractAddress,
                        'network' => 'Ethereum',
                        'block_number' => rand(1000000, 9999999)
                    ]),
                    'donor_message' => $messages[array_rand($messages)],
                    'is_anonymous' => $isAnonymous,
                    'is_recurring_payment' => false,
                    'payment_method' => 'blockchain', // Add payment method
                    'donation_type' => 'charity', // Explicitly set donation type
                    'completed_at' => $completedAt,
                    'created_at' => $completedAt,
                    'updated_at' => $completedAt
                ];
            }
        }

        // Add some subscription donations (5-10)
        $subscriptionCount = rand(5, 10);
        for ($i = 0; $i < $subscriptionCount; $i++) {
            $user = $users->random();
            $charity = $charities->random();
            $createdAt = now()->subDays(rand(7, 90));
            
            // Create a unique hash-like transaction ID for the subscription donation
            $txHash = '0x' . Str::random(40);

            $donationsData[] = [
                'user_id' => $user->ic_number,
                'transaction_hash' => $txHash,
                'amount' => round(rand(1, 50) / 10, 1), // Between 0.1 and 5.0 SCROLL
                'currency_type' => 'SCROLL',
                'cause_id' => $charity->id,
                'status' => 'completed',
                'smart_contract_data' => json_encode([
                    'contract_address' => $contractAddress,
                    'network' => 'Ethereum',
                    'block_number' => rand(1000000, 9999999)
                ]),
                'donor_message' => 'Monthly subscription donation',
                'is_anonymous' => (rand(0, 10) < 2),
                'is_recurring_payment' => true, // Mark as recurring payment
                'payment_method' => 'blockchain', // Add payment method
                'donation_type' => 'subscription', // Explicitly set donation type
                'completed_at' => $createdAt,
                'created_at' => $createdAt,
                'updated_at' => $createdAt
            ];
        }

        // Add some pending donations (all with transaction hashes)
        for ($i = 0; $i < 5; $i++) {
            $user = $users->random();
            $charity = $charities->random();
            $createdAt = now()->subHours(rand(1, 48));
            
            // Even pending donations get a transaction hash
            $txHash = '0x' . Str::random(40);

            $donationsData[] = [
                'user_id' => $user->ic_number,
                'transaction_hash' => $txHash, // Add transaction hash to pending donations
                'amount' => round(rand(1, 50) / 10, 1),
                'currency_type' => 'SCROLL',
                'cause_id' => $charity->id,
                'status' => 'verified',
                'verified_at' => $createdAt,
                'smart_contract_data' => json_encode([
                    'contract_address' => $contractAddress, 
                    'network' => 'Ethereum',
                    'pending' => true
                ]),
                'donor_message' => $messages[array_rand($messages)],
                'is_anonymous' => (rand(0, 10) < 2),
                'is_recurring_payment' => false,
                'payment_method' => 'blockchain', // Add payment method
                'donation_type' => 'charity', // Explicitly set donation type
                'completed_at' => null,
                'created_at' => $createdAt,
                'updated_at' => $createdAt
            ];
        }

        // Create all donations
        foreach ($donationsData as $donationData) {
            Donation::create($donationData);
        }
        
        // Log info
        $this->command->info('Created ' . count($donationsData) . ' donations:');
        $this->command->info('- Charity donations: ' . count(array_filter($donationsData, fn($d) => $d['donation_type'] === 'charity')));
        $this->command->info('- Subscription donations: ' . count(array_filter($donationsData, fn($d) => $d['donation_type'] === 'subscription')));
    }
}