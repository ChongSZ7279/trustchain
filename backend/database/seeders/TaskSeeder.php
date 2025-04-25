<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\TaskPicture;
use App\Models\Charity;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Task statuses: 'pending', 'in_progress', 'completed'
        $statuses = ['pending', 'in_progress', 'completed'];
        
        // Setup storage directories and copy seed files
        $this->prepareStorageDirectories();
        
        // Create tasks for each charity
        $tasks = [
            // Digital Classroom Initiative (Charity 1)
            [
                'charity_id' => 1,
                'name' => 'Computer Lab Setup',
                'description' => 'Set up a fully equipped computer lab with 20 desktops, networking, and educational software at SK Kampung Dato Abu Bakar Baginda in Selangor.',
                'fund_targeted' => 45.00,
                'fund_received' => 32.00,
                'status' => 'in_progress',
                'proof' => 'task_proofs/1.pdf',
                'pictures' => [
                    [
                        'path' => 'task_pictures/1.jpg',
                        'original_filename' => 'computer-lab-setup.jpg',
                        'mime_type' => 'image/jpeg',
                        'file_size' => 1024 * 5 // 5KB
                    ],
                    [
                        'path' => 'task_pictures/2.jpg',
                        'original_filename' => 'computer-lab-progress.jpg',
                        'mime_type' => 'image/jpeg',
                        'file_size' => 1024 * 6 // 6KB
                    ]
                ]
            ],
            [
                'charity_id' => 1,
                'name' => 'Teacher Training Workshop',
                'description' => 'Conduct a 3-day digital literacy workshop for 30 teachers from rural schools to enhance their tech skills and digital teaching methods.',
                'fund_targeted' => 12.00,
                'fund_received' => 12.00,
                'status' => 'completed',
                'proof' => 'task_proofs/2.pdf',
                'pictures' => [
                    [
                        'path' => 'task_pictures/3.jpg',
                        'original_filename' => 'teacher-workshop.jpg',
                        'mime_type' => 'image/jpeg',
                        'file_size' => 1024 * 4 // 4KB
                    ]
                ]
            ],
            
            // Coding for Kids (Charity 2)
            [
                'charity_id' => 2,
                'name' => 'Laptop Distribution',
                'description' => 'Purchase and distribute 50 laptops to underprivileged children for the coding program.',
                'fund_targeted' => 60.00,
                'fund_received' => 15.00,
                'status' => 'pending',
                'proof' => null,
                'pictures' => [
                    [
                        'path' => 'task_pictures/4.jpg',
                        'original_filename' => 'laptops.jpg',
                        'mime_type' => 'image/jpeg',
                        'file_size' => 1024 * 3 // 3KB
                    ]
                ]
            ],
            
            // Mangrove Restoration Project (Charity 3)
            [
                'charity_id' => 3,
                'name' => 'Mangrove Planting Event',
                'description' => 'Organize a community mangrove planting event in Kuala Selangor involving 100 volunteers to plant 5,000 mangrove seedlings.',
                'fund_targeted' => 25.00,
                'fund_received' => 18.00,
                'status' => 'in_progress',
                'proof' => null,
                'pictures' => [
                    [
                        'path' => 'task_pictures/5.jpg',
                        'original_filename' => 'mangrove-event.jpg',
                        'mime_type' => 'image/jpeg',
                        'file_size' => 1024 * 7 // 7KB
                    ],
                    [
                        'path' => 'task_pictures/6.jpg',
                        'original_filename' => 'seedlings.jpg',
                        'mime_type' => 'image/jpeg',
                        'file_size' => 1024 * 5 // 5KB
                    ]
                ]
            ],
            
            // Mobile Medical Clinics (Charity 5)
            [
                'charity_id' => 5,
                'name' => 'Purchase Medical Vehicle',
                'description' => 'Purchase and outfit a mobile medical van with basic equipment to serve as a traveling clinic.',
                'fund_targeted' => 180.00,
                'fund_received' => 180.00,
                'status' => 'completed',
                'proof' => 'task_proofs/3.pdf',
                'pictures' => [
                    [
                        'path' => 'task_pictures/7.jpg',
                        'original_filename' => 'medical-vehicle.jpg',
                        'mime_type' => 'image/jpeg',
                        'file_size' => 1024 * 8 // 8KB
                    ]
                ]
            ],
            
            // Community Food Banks (Charity 7)
            [
                'charity_id' => 7,
                'name' => 'Food Distribution Center',
                'description' => 'Establish a central food distribution center in Klang Valley to coordinate food bank operations.',
                'fund_targeted' => 85.00,
                'fund_received' => 45.00,
                'status' => 'in_progress',
                'proof' => null,
                'pictures' => [
                    [
                        'path' => 'task_pictures/8.jpg',
                        'original_filename' => 'distribution-center.jpg',
                        'mime_type' => 'image/jpeg',
                        'file_size' => 1024 * 6 // 6KB
                    ]
                ]
            ],
            
            // Flood Relief Fund (Charity 9)
            [
                'charity_id' => 9,
                'name' => 'Emergency Supply Kits',
                'description' => 'Assemble and distribute 500 emergency supply kits to families in flood-prone areas of Kelantan.',
                'fund_targeted' => 45.00,
                'fund_received' => 20.00,
                'status' => 'pending',
                'proof' => null,
                'pictures' => [
                    [
                        'path' => 'task_pictures/9.jpg',
                        'original_filename' => 'emergency-supplies.jpg',
                        'mime_type' => 'image/jpeg',
                        'file_size' => 1024 * 4 // 4KB
                    ]
                ]
            ],
            // Verified tasks (for testing fund release)
            [
                'charity_id' => 1,
                'name' => 'Verified Task for Digital Classroom Initiative',
                'description' => 'This task has been verified and is ready for fund release.',
                'fund_targeted' => 42.76,
                'fund_received' => 42.76,
                'status' => 'verified',
                'proof' => 'proofs/verified-task-proof.pdf',
                'pictures' => []
            ],
            [
                'charity_id' => 2,
                'name' => 'Verified Task for Coding for Kids',
                'description' => 'This task has been verified and is ready for fund release.',
                'fund_targeted' => 46.58,
                'fund_received' => 46.58,
                'status' => 'verified',
                'proof' => 'proofs/verified-task-proof.pdf',
                'pictures' => []
            ],
            [
                'charity_id' => 3,
                'name' => 'Verified Task for Mangrove Restoration Project',
                'description' => 'This task has been verified and is ready for fund release.',
                'fund_targeted' => 10.81,
                'fund_received' => 10.81,
                'status' => 'verified',
                'proof' => 'proofs/verified-task-proof.pdf',
                'pictures' => []
            ]
        ];

        foreach ($tasks as $taskData) {
            // Get pictures from task data
            $pictures = $taskData['pictures'];
            unset($taskData['pictures']);
            
            // Create with varying timestamps
            $createdAt = now()->subDays(rand(5, 90));
            
            // Add timestamps 
            $taskData['created_at'] = $createdAt;
            $taskData['updated_at'] = $createdAt;
            
            // Create task
            $task = Task::create($taskData);
            
            // Create task pictures
            foreach ($pictures as $pictureData) {
                $pictureData['task_id'] = $task->id;
                $pictureData['created_at'] = $createdAt;
                $pictureData['updated_at'] = $createdAt;
                
                TaskPicture::create($pictureData);
            }
        }
        
        $this->command->info('Tasks and task pictures created successfully');
    }

    /**
     * Prepare storage directories and copy seed files to storage
     */
    private function prepareStorageDirectories(): void
    {
        // Create storage directories if they don't exist
        $directories = ['task_pictures', 'task_proofs', 'proofs'];
        foreach ($directories as $dir) {
            if (!Storage::disk('public')->exists($dir)) {
                Storage::disk('public')->makeDirectory($dir);
            }
        }

        // Copy or create placeholder task images
        $this->createPlaceholderImages('task_pictures', 10);
        
        // Copy or create placeholder task proofs
        $this->createPlaceholderProofs('task_proofs', 5);
        
        // Create verified task proofs
        $this->createVerifiedTaskProof();
    }

    /**
     * Create placeholder images in storage
     * 
     * @param string $directory The directory name within storage/public
     * @param int $count Number of placeholder images to create
     */
    private function createPlaceholderImages(string $directory, int $count): void
    {
        $seedDir = base_path('resources/seed-data/task_pictures');
        
        for ($i = 1; $i <= $count; $i++) {
            $targetPath = "{$directory}/{$i}.jpg";
            
            // Check if file already exists in storage
            if (!Storage::disk('public')->exists($targetPath)) {
                // Check if we have a seed file
                $seedFile = "{$seedDir}/{$i}.jpg";
                if (File::exists($seedFile)) {
                    $content = File::get($seedFile);
                } else {
                    // Create a placeholder
                    $content = "This is a placeholder for task image #{$i}.\n";
                    $content .= "Created for testing purposes only.\n";
                    $content .= "Date: " . date('Y-m-d H:i:s');
                }
                
                Storage::disk('public')->put($targetPath, $content);
            }
        }
    }

    /**
     * Create placeholder proofs in storage
     * 
     * @param string $directory The directory name within storage/public
     * @param int $count Number of placeholder proofs to create
     */
    private function createPlaceholderProofs(string $directory, int $count): void
    {
        $seedDir = base_path('resources/seed-data/task_proofs');
        
        for ($i = 1; $i <= $count; $i++) {
            $targetPath = "{$directory}/{$i}.pdf";
            
            // Check if file already exists in storage
            if (!Storage::disk('public')->exists($targetPath)) {
                // Check if we have a seed file
                $seedFile = "{$seedDir}/{$i}.pdf";
                if (File::exists($seedFile)) {
                    $content = File::get($seedFile);
                } else {
                    // Create a placeholder
                    $content = "This is a placeholder for task proof #{$i}.\n";
                    $content .= "Created for testing purposes only.\n";
                    $content .= "Date: " . date('Y-m-d H:i:s');
                }
                
                Storage::disk('public')->put($targetPath, $content);
            }
        }
    }
    
    /**
     * Create verified task proof file
     */
    private function createVerifiedTaskProof(): void
    {
        $targetPath = "proofs/verified-task-proof.pdf";
        
        // Check if file already exists in storage
        if (!Storage::disk('public')->exists($targetPath)) {
            // Create a placeholder
            $content = "This is a verified task proof document.\n";
            $content .= "Created for testing purposes only.\n";
            $content .= "Date: " . date('Y-m-d H:i:s');
            
            Storage::disk('public')->put($targetPath, $content);
        }
        
        // Create pending task proof
        $pendingPath = "proofs/pending-task-proof.pdf";
        if (!Storage::disk('public')->exists($pendingPath)) {
            $content = "This is a pending task proof document.\n";
            $content .= "Created for testing purposes only.\n";
            $content .= "Date: " . date('Y-m-d H:i:s');
            
            Storage::disk('public')->put($pendingPath, $content);
        }
    }
} 