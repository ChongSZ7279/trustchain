<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run seeders in order of dependency
        $this->call([
            // Create base users
            UserSeeder::class,
            AdminSeeder::class, 
            
            // Create organizations and charities
            OrganizationSeeder::class,
            CharitySeeder::class,
            
            // Create tasks for charities
            TaskSeeder::class,
            
            // Create donations (charity and subscription donations only)
            DonationSeeder::class,
            
            // Create followers
            FollowerSeeder::class,
            
            // Create transactions (task payments and fund releases only)
            TransactionSeeder::class,

            // Add verification test data
            VerificationTestSeeder::class,
        ]);
        
        // Only run the currency type fixer if the column exists
        if (Schema::hasColumn('transactions', 'currency_type')) {
            $this->command->info('Running FixCurrencyTypeSeeder to ensure data consistency...');
            $this->call(FixCurrencyTypeSeeder::class);
        }
        
        $this->command->info('Database seeding completed successfully!');
        $this->command->info('- Donations table contains only charity and subscription donations');
        $this->command->info('- Transactions table contains only task payments and fund releases');
        $this->command->info('- All donations have transaction hashes');
    }
}
