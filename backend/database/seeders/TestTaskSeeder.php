<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Task;

class TestTaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Task::create([
            'name' => 'Test Task for Verification',
            'description' => 'This is a test task created for testing the verification process',
            'charity_id' => 1,
            'status' => 'pending',
            'proof' => 'proof/default.jpg',
            'fund_targeted' => 1.0,
            'fund_received' => 0.0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
