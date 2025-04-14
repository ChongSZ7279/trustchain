<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\TaskPicture;
use App\Models\Charity;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Task statuses: 'pending', 'in_progress', 'completed'
        $statuses = ['pending', 'in_progress', 'completed'];
        
        // Create tasks for each charity
        $tasks = [
            // Digital Classroom Initiative (Charity 1)
            [
                'charity_id' => 1,
                'name' => 'Computer Lab Setup',
                'description' => 'Set up a fully equipped computer lab with 20 desktops, networking, and educational software at SK Kampung Dato Abu Bakar Baginda in Selangor.',
                'fund_targeted' => 45000.00,
                'status' => 'in_progress',
                'proof' => null,
                'pictures' => [
                    [
                        'path' => 'tasks/computer-lab-1.jpg',
                        'original_filename' => 'computer-lab-setup.jpg',
                        'mime_type' => 'image/jpeg',
                        'file_size' => 1024 * 5 // 5KB
                    ],
                    [
                        'path' => 'tasks/computer-lab-2.jpg',
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
                'fund_targeted' => 12000.00,
                'status' => 'completed',
                'proof' => 'proofs/teacher-workshop-completion.pdf',
                'pictures' => [
                    [
                        'path' => 'tasks/teacher-workshop.jpg',
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
                'fund_targeted' => 60000.00,
                'status' => 'pending',
                'proof' => null,
                'pictures' => [
                    [
                        'path' => 'tasks/laptop-distribution.jpg',
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
                'fund_targeted' => 25000.00,
                'status' => 'in_progress',
                'proof' => null,
                'pictures' => [
                    [
                        'path' => 'tasks/mangrove-planting-1.jpg',
                        'original_filename' => 'mangrove-event.jpg',
                        'mime_type' => 'image/jpeg',
                        'file_size' => 1024 * 7 // 7KB
                    ],
                    [
                        'path' => 'tasks/mangrove-planting-2.jpg',
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
                'fund_targeted' => 180000.00,
                'status' => 'completed',
                'proof' => 'proofs/medical-van-purchase.pdf',
                'pictures' => [
                    [
                        'path' => 'tasks/medical-van.jpg',
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
                'fund_targeted' => 85000.00,
                'status' => 'in_progress',
                'proof' => null,
                'pictures' => [
                    [
                        'path' => 'tasks/food-center-1.jpg',
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
                'fund_targeted' => 45000.00,
                'status' => 'pending',
                'proof' => null,
                'pictures' => [
                    [
                        'path' => 'tasks/emergency-kits.jpg',
                        'original_filename' => 'emergency-supplies.jpg',
                        'mime_type' => 'image/jpeg',
                        'file_size' => 1024 * 4 // 4KB
                    ]
                ]
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
    }
} 