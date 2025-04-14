<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;

class RefreshSeedDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:refresh-seed {--fix : Also run the Fix Charity Organization seeder}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Refreshes the database and seeds it in the correct order, handling foreign key constraints';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting database refresh and seed process...');
        
        // Disable foreign key checks
        $this->info('Disabling foreign key checks...');
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Run fresh migrations
        $this->info('Running fresh migrations...');
        Artisan::call('migrate:fresh', [], $this->getOutput());
        
        // Seed users first
        $this->info('Seeding users...');
        Artisan::call('db:seed', ['--class' => 'UserSeeder'], $this->getOutput());
        
        // Seed organizations next
        $this->info('Seeding organizations...');
        Artisan::call('db:seed', ['--class' => 'OrganizationSeeder'], $this->getOutput());
        
        // Seed charities after organizations
        $this->info('Seeding charities...');
        Artisan::call('db:seed', ['--class' => 'CharitySeeder'], $this->getOutput());
        
        // Seed tasks after charities
        $this->info('Seeding tasks...');
        Artisan::call('db:seed', ['--class' => 'TaskSeeder'], $this->getOutput());
        
        // Seed the remaining entities
        $this->info('Seeding donations...');
        Artisan::call('db:seed', ['--class' => 'DonationSeeder'], $this->getOutput());
        
        $this->info('Seeding followers...');
        Artisan::call('db:seed', ['--class' => 'FollowerSeeder'], $this->getOutput());
        
        $this->info('Seeding transactions...');
        Artisan::call('db:seed', ['--class' => 'TransactionSeeder'], $this->getOutput());
        
        // Optionally run the fix seeder
        if ($this->option('fix')) {
            $this->info('Running Fix Charity Organization seeder...');
            Artisan::call('db:seed', ['--class' => 'FixCharityOrganizationSeeder'], $this->getOutput());
        }
        
        // Re-enable foreign key checks
        $this->info('Re-enabling foreign key checks...');
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        
        $this->info('Database refresh and seed completed successfully!');
        $this->info('You can now access your application with fresh data.');
        
        return Command::SUCCESS;
    }
}
