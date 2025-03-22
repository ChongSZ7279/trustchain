<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\TaskPicture;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create demo tasks
        $tasks = [
            // Education for Rural Children tasks
            [
                'charity_id' => 1,
                'name' => 'Build Library in Kampung Selamat',
                'description' => 'This task involves building a small library in Kampung Selamat, a rural village in Kedah. The library will be stocked with books, educational materials, and computers to support the education of local children.',
                'fund_targeted' => 20000.00,
                'status' => 'in_progress',
                'proof' => 'tasks/library_proof.pdf',
                'pictures_count' => 5,
                'verification_status' => 'pending',
                'milestone_status' => 'in_progress',
                'funds_released' => false,
            ],
            [
                'charity_id' => 1,
                'name' => 'School Supplies Distribution',
                'description' => 'This task involves purchasing and distributing school supplies (notebooks, textbooks, stationery, etc.) to 500 underprivileged students in rural areas of Pahang.',
                'fund_targeted' => 10000.00,
                'status' => 'completed',
                'proof' => 'tasks/supplies_proof.pdf',
                'pictures_count' => 5,
                'verification_status' => 'verified',
                'milestone_status' => 'completed',
                'funds_released' => true,
            ],
            
            // Digital Learning Initiative tasks
            [
                'charity_id' => 2,
                'name' => 'Computer Lab for SK Bukit Tinggi',
                'description' => 'This task involves setting up a computer lab with 20 computers at SK Bukit Tinggi, a primary school in a low-income area. The lab will provide students with access to digital learning resources and computer literacy training.',
                'fund_targeted' => 30000.00,
                'status' => 'pending',
                'proof' => null,
                'pictures_count' => 0,
                'verification_status' => 'pending',
                'milestone_status' => 'pending',
                'funds_released' => false,
            ],
            
            // Rainforest Conservation Project tasks
            [
                'charity_id' => 3,
                'name' => 'Tree Planting in Belum Forest',
                'description' => 'This task involves planting 5,000 native tree species in deforested areas of the Belum Forest Reserve. The project will help restore the forest ecosystem and provide habitat for endangered wildlife.',
                'fund_targeted' => 25000.00,
                'status' => 'in_progress',
                'proof' => 'tasks/tree_planting_proof.pdf',
                'pictures_count' => 3,
                'verification_status' => 'pending',
                'milestone_status' => 'in_progress',
                'funds_released' => false,
            ],
            
            // Clean Beaches Initiative tasks
            [
                'charity_id' => 4,
                'name' => 'Beach Cleanup at Pantai Cenang',
                'description' => 'This task involves organizing a large-scale beach cleanup at Pantai Cenang, Langkawi. The project will remove plastic waste and other debris from the beach and raise awareness about marine pollution.',
                'fund_targeted' => 5000.00,
                'status' => 'completed',
                'proof' => 'tasks/beach_cleanup_proof.pdf',
                'pictures_count' => 5,
                'verification_status' => 'verified',
                'milestone_status' => 'completed',
                'funds_released' => true,
            ],
            
            // Mobile Health Clinics tasks
            [
                'charity_id' => 5,
                'name' => 'Mobile Clinic for Orang Asli Communities',
                'description' => 'This task involves operating a mobile health clinic to provide basic healthcare services to Orang Asli communities in remote areas of Perak. The clinic will offer health screenings, vaccinations, and basic medical treatment.',
                'fund_targeted' => 40000.00,
                'status' => 'in_progress',
                'proof' => 'tasks/mobile_clinic_proof.pdf',
                'pictures_count' => 4,
                'verification_status' => 'pending',
                'milestone_status' => 'in_progress',
                'funds_released' => false,
            ],
            
            // Mental Health Support Program tasks
            [
                'charity_id' => 6,
                'name' => 'Mental Health Workshops in Schools',
                'description' => 'This task involves conducting mental health awareness workshops in 20 secondary schools across Kuala Lumpur and Selangor. The workshops will educate students about mental health issues, coping strategies, and available support resources.',
                'fund_targeted' => 15000.00,
                'status' => 'pending',
                'proof' => null,
                'pictures_count' => 0,
                'verification_status' => 'pending',
                'milestone_status' => 'pending',
                'funds_released' => false,
            ],
        ];

        foreach ($tasks as $taskData) {
            $task = Task::create($taskData);
            
            // Create task pictures for tasks with pictures
            if ($taskData['pictures_count'] > 0) {
                $this->createTaskPictures($task->id, $taskData['pictures_count']);
            }
        }

        // Create placeholder files in storage
        $this->createPlaceholderFiles();
    }

    /**
     * Create task pictures for a task
     */
    private function createTaskPictures(int $taskId, int $count): void
    {
        for ($i = 1; $i <= $count; $i++) {
            TaskPicture::create([
                'task_id' => $taskId,
                'path' => "tasks/task_{$taskId}_picture_{$i}.jpg",
                'original_filename' => "task_picture_{$i}.jpg",
                'mime_type' => 'image/jpeg',
                'file_size' => rand(100000, 500000),
            ]);
        }
    }

    /**
     * Create placeholder files in the storage directory
     */
    private function createPlaceholderFiles(): void
    {
        $storagePath = storage_path('app/public');
        
        // Create directories if they don't exist
        if (!file_exists("$storagePath/tasks")) {
            mkdir("$storagePath/tasks", 0755, true);
        }
        
        // Create placeholder PDFs for task proofs
        $taskProofs = [
            'library_proof.pdf',
            'supplies_proof.pdf',
            'tree_planting_proof.pdf',
            'beach_cleanup_proof.pdf',
            'mobile_clinic_proof.pdf',
        ];
        
        foreach ($taskProofs as $proof) {
            $path = "$storagePath/tasks/$proof";
            if (!file_exists($path)) {
                // Create a simple text file with .pdf extension
                $taskName = pathinfo($proof, PATHINFO_FILENAME);
                $taskName = str_replace('_', ' ', $taskName);
                $taskName = ucwords($taskName);
                
                $content = "This is a placeholder proof document for $taskName.\n";
                $content .= "In a real application, this would be a properly formatted PDF document.\n";
                $content .= "Created for demo purposes.";
                
                file_put_contents($path, $content);
            }
        }
        
        // Create placeholder images for task pictures
        $tasks = Task::all();
        foreach ($tasks as $task) {
            $picturesCount = $task->pictures_count;
            
            for ($i = 1; $i <= $picturesCount; $i++) {
                $path = "$storagePath/tasks/task_{$task->id}_picture_{$i}.jpg";
                
                if (!file_exists($path)) {
                    // Create a simple colored image
                    $img = imagecreatetruecolor(800, 600);
                    $color = imagecolorallocate($img, rand(0, 255), rand(0, 255), rand(0, 255));
                    imagefill($img, 0, 0, $color);
                    
                    // Add some text
                    $textColor = imagecolorallocate($img, 255, 255, 255);
                    $text = "Task {$task->id} - Picture {$i}";
                    
                    // Center the text
                    $fontSize = 5;
                    $textWidth = imagefontwidth($fontSize) * strlen($text);
                    $textX = (imagesx($img) - $textWidth) / 2;
                    $textY = (imagesy($img) / 2) - (imagefontheight($fontSize) / 2);
                    
                    imagestring($img, $fontSize, $textX, $textY, $text, $textColor);
                    
                    imagejpeg($img, $path);
                    imagedestroy($img);
                }
            }
        }
    }
} 