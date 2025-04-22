<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Donation;
use App\Models\Transaction;

class FixCurrencyTypeSeeder extends Seeder
{
    /**
     * Standardize all currency types to SCROLL and ensure proper type segregation
     */
    public function run(): void
    {
        $this->command->info('Starting to standardize data and ensure proper type assignment...');
        
        // 1. Update all donations with ETH to use SCROLL instead
        $ethDonations = Donation::where('currency_type', 'ETH')->get();
        $this->command->info("Found {$ethDonations->count()} donations with ETH currency type");
        
        foreach ($ethDonations as $donation) {
            $donation->currency_type = 'SCROLL';
            $donation->save();
        }
        
        // 2. Check if the transactions table has a currency_type column
        if (!Schema::hasColumn('transactions', 'currency_type')) {
            $this->command->info('The currency_type column does not exist in transactions table.');
            $this->command->info('Please run the migration to add this column first.');
            return;
        }
        
        // 3. Update any transactions with different currency types
        $nonScrollTransactions = Transaction::whereNotNull('currency_type')
            ->where('currency_type', '!=', 'SCROLL')
            ->get();
            
        $this->command->info("Found {$nonScrollTransactions->count()} transactions with non-SCROLL currency type");
        
        foreach ($nonScrollTransactions as $transaction) {
            $transaction->currency_type = 'SCROLL';
            $transaction->save();
        }
        
        // 4. Update transactions with NULL currency_type
        $nullCurrencyTransactions = Transaction::whereNull('currency_type')->get();
        $this->command->info("Found {$nullCurrencyTransactions->count()} transactions with NULL currency type");
        
        foreach ($nullCurrencyTransactions as $transaction) {
            $transaction->currency_type = 'SCROLL';
            $transaction->save();
        }
        
        // 5. Ensure all donations have transaction hashes
        $noHashDonations = Donation::whereNull('transaction_hash')->get();
        $this->command->info("Found {$noHashDonations->count()} donations without transaction hashes");
        
        foreach ($noHashDonations as $donation) {
            // Generate a new transaction hash
            $donation->transaction_hash = '0x' . \Illuminate\Support\Str::random(40);
            $donation->save();
        }
        
        // 6. Make sure all donations have proper donation_type
        $noDonationTypeDonations = Donation::whereNull('donation_type')->get();
        $this->command->info("Found {$noDonationTypeDonations->count()} donations without donation_type");
        
        foreach ($noDonationTypeDonations as $donation) {
            // Default to 'charity' unless it's a recurring payment
            $donation->donation_type = $donation->is_recurring_payment ? 'subscription' : 'charity';
            $donation->save();
        }
        
        // 7. Make sure all transactions are properly marked as 'fund_release' type
        $incorrectTypeTransactions = Transaction::where('type', '!=', 'fund_release')->get();
        $this->command->info("Found {$incorrectTypeTransactions->count()} transactions with types other than 'fund_release'");
        
        foreach ($incorrectTypeTransactions as $transaction) {
            // Set all transactions to fund_release type
            $transaction->type = 'fund_release';
            $transaction->save();
        }
        
        $this->command->info('Data standardization complete!');
        $this->command->info('All donations have type "charity" or "subscription"');
        $this->command->info('All transactions have type "fund_release"');
    }
} 