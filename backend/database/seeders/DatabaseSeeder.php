<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    // Storage paths to be shared across seeders
    public static $imagePaths = [
        'organization_logos' => [],
        'organization_covers' => [],
        'organization_documents' => [],
        'charity_pictures' => [],
        'charity_documents' => [],
        'ic_pictures' => [],
        'profile_pictures' => [],
        'task_proofs' => [],
        'task_pictures' => []
    ];
    
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Prepare seed data from resources
        $this->prepareSeedData();
        
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
    
    /**
     * Prepare seed data from resources directory
     */
    private function prepareSeedData(): void
    {
        $sourceDir = base_path('resources/seed-data');
        
        // Create symbolic link if it doesn't exist
        if (!file_exists(public_path('storage'))) {
            $this->command->info('Creating storage symbolic link...');
            try {
                symlink(storage_path('app/public'), public_path('storage'));
            } catch (\Exception $e) {
                $this->command->warn('Could not create symlink: ' . $e->getMessage());
            }
        }
        
        // Process seed data if source exists
        if (File::exists($sourceDir)) {
            $this->command->info('Processing seed data from resources/seed-data...');
            
            // Process different types of files
            self::$imagePaths['ic_pictures'] = $this->processFiles($sourceDir . '/ic_pictures', 'ic_pictures');
            self::$imagePaths['profile_pictures'] = $this->processFiles($sourceDir . '/profile_pictures', 'profile_pictures');
            self::$imagePaths['organization_logos'] = $this->processFiles($sourceDir . '/organization_logos', 'organization_logos');
            self::$imagePaths['organization_covers'] = $this->processFiles($sourceDir . '/organization_covers', 'organization_covers');
            self::$imagePaths['organization_documents'] = $this->processFiles($sourceDir . '/organization_documents', 'organization_documents');
            self::$imagePaths['charity_pictures'] = $this->processFiles($sourceDir . '/charity_pictures', 'charity_pictures');
            self::$imagePaths['charity_documents'] = $this->processFiles($sourceDir . '/charity_documents', 'charity_documents');
            
            // Process task files
            $taskFiles = $this->processFiles($sourceDir . '/task_proofs', 'task_proofs');
            
            // Separate images and PDFs for task proofs
            foreach ($taskFiles as $file) {
                $extension = pathinfo($file, PATHINFO_EXTENSION);
                if (in_array(strtolower($extension), ['jpg', 'jpeg', 'png', 'gif'])) {
                    self::$imagePaths['task_pictures'][] = $file;
                } else {
                    self::$imagePaths['task_proofs'][] = $file;
                }
            }
            
            $this->command->info('Seed data processing completed.');
        } else {
            $this->command->warn('Seed data directory not found: ' . $sourceDir);
        }
    }
    
    /**
     * Process files from source directory, store them and return the paths
     * 
     * @param string $sourceDir Source directory path
     * @param string $diskPath Path within the public disk
     * @return array Array of stored file paths relative to the disk
     */
    private function processFiles(string $sourceDir, string $diskPath): array
    {
        $storedPaths = [];
        
        if (!File::exists($sourceDir)) {
            $this->command->warn('Source directory not found: ' . $sourceDir);
            return $storedPaths;
        }
        
        $files = File::files($sourceDir);
        foreach ($files as $file) {
            $filename = $file->getFilename();
            $extension = $file->getExtension();
            
            // Generate a unique filename similar to how Laravel does it
            $uniqueFilename = Str::random(40) . '.' . $extension;
            $path = $diskPath . '/' . $uniqueFilename;
            
            // Store the file
            $fileContents = File::get($file->getPathname());
            Storage::disk('public')->put($path, $fileContents);
            
            $storedPaths[] = $path;
        }
        
        return $storedPaths;
    }
}
