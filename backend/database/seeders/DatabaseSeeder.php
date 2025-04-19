<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run seeders in order of dependency
        $this->call([
            UserSeeder::class,
            AdminSeeder::class, // Add AdminSeeder to create admin users
            OrganizationSeeder::class,
            CharitySeeder::class,
            TaskSeeder::class,
            DonationSeeder::class,
            FollowerSeeder::class,
            TransactionSeeder::class,

            // Add verification test data
            VerificationTestSeeder::class,

            // Uncomment this line if you need to fix issues with charity-organization relationships
            // FixCharityOrganizationSeeder::class,
        ]);
    }
}
