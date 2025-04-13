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
            OrganizationSeeder::class,
            CharitySeeder::class,
            TaskSeeder::class,
            DonationSeeder::class,
            FollowerSeeder::class,
            TransactionSeeder::class,
        ]);
    }
}
