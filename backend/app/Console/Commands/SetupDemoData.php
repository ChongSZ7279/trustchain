<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SetupDemoData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:setup-demo-data {--fresh : Wipe the database and start fresh}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set up demo data for the application including users, organizations, charities, tasks, and transactions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Setting up demo data for TrustChain...');
        
        // Check if we should refresh the database
        if ($this->option('fresh')) {
            if ($this->confirm('This will wipe your database. Are you sure?', false)) {
                $this->info('Refreshing database...');
                Artisan::call('migrate:fresh');
                $this->info('Database refreshed.');
            } else {
                $this->info('Skipping database refresh.');
            }
        } else {
            // Run migrations if they haven't been run yet
            $this->info('Running migrations...');
            Artisan::call('migrate');
            $this->info('Migrations completed.');
        }
        
        // Create storage link if it doesn't exist
        $this->info('Creating storage link...');
        Artisan::call('storage:link');
        $this->info('Storage link created.');
        
        // Run seeders
        $this->info('Seeding database with demo data...');
        Artisan::call('db:seed');
        $this->info('Database seeded successfully.');
        
        // Summary of created data
        $this->displaySummary();
        
        $this->info('Demo data setup completed successfully!');
        $this->info('You can now use the following credentials to log in:');
        $this->info('User: john.doe@example.com / password123');
        $this->info('Organization: contact@hopefoundation.org / password123');
        
        return Command::SUCCESS;
    }
    
    /**
     * Display a summary of the created data
     */
    private function displaySummary()
    {
        $this->info('Summary of created data:');
        
        $tables = [
            'users' => 'Users',
            'organizations' => 'Organizations',
            'charities' => 'Charities',
            'tasks' => 'Tasks',
            'task_pictures' => 'Task Pictures',
            'transactions' => 'Transactions',
        ];
        
        $headers = ['Table', 'Records'];
        $rows = [];
        
        foreach ($tables as $table => $label) {
            if (Schema::hasTable($table)) {
                $count = DB::table($table)->count();
                $rows[] = [$label, $count];
            } else {
                $rows[] = [$label, 'Table not found'];
            }
        }
        
        $this->table($headers, $rows);
    }
}
