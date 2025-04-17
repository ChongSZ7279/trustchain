<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Donation;
use App\Models\Task;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Charity;
use App\Models\Organization;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class VerificationTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // First, modify the tasks table to include 'verified' status if needed
        $this->updateTasksTable();

        // Create donations and tasks that need verification
        $this->createPendingDonations();
        $this->createVerifiedTasks();
        $this->createPendingTasks();
    }

    /**
     * Update the tasks table to include 'verified' status
     */
    private function updateTasksTable(): void
    {
        // Check if the tasks table exists
        if (!Schema::hasTable('tasks')) {
            return;
        }

        // Check if the enum already includes 'verified'
        $columnType = DB::select("SHOW COLUMNS FROM tasks WHERE Field = 'status'")[0]->Type ?? null;

        if ($columnType && !str_contains($columnType, "'verified'")) {
            // Modify the enum to include 'verified'
            DB::statement("ALTER TABLE tasks MODIFY COLUMN status ENUM('pending', 'in_progress', 'completed', 'verified') DEFAULT 'pending'");

            echo "Added 'verified' status to tasks table\n";
        }

        // Add funds_released column if it doesn't exist
        if (!Schema::hasColumn('tasks', 'funds_released')) {
            Schema::table('tasks', function ($table) {
                $table->boolean('funds_released')->default(false)->after('proof');
            });

            echo "Added 'funds_released' column to tasks table\n";
        }
    }

    /**
     * Create pending donations with blockchain transaction hashes
     */
    private function createPendingDonations(): void
    {
        // Get users and charities
        $users = User::where('is_admin', false)->take(3)->get();
        $charities = Charity::take(3)->get();

        // Smart contract address on Scroll Sepolia
        $contractAddress = "0x7867fC939F10377E309a3BF55bfc194F672B0E84";

        // Create 5 pending donations with transaction hashes
        for ($i = 0; $i < 5; $i++) {
            $user = $users->random();
            $charity = $charities->random();
            $amount = rand(10, 100) / 100; // 0.1 to 1.0 ETH

            // Create a unique transaction hash
            $txHash = '0x' . Str::random(40);

            // Create transaction record first
            $transaction = Transaction::create([
                'user_ic' => $user->ic_number,
                'charity_id' => $charity->id,
                'amount' => $amount,
                'type' => 'charity',
                'status' => 'completed', // Transaction is completed on blockchain
                'transaction_hash' => $txHash,
                'contract_address' => $contractAddress,
                'message' => 'Test donation for verification',
                'anonymous' => false,
            ]);

            // Create donation with pending status
            $donation = Donation::create([
                'user_id' => $user->ic_number,
                'transaction_id' => $transaction->id,
                'transaction_hash' => $txHash,
                'amount' => $amount,
                'currency_type' => 'ETH',
                'cause_id' => $charity->id,
                'status' => 'pending', // Pending verification
                'payment_method' => 'blockchain',
                'donor_message' => 'This donation needs verification',
                'is_anonymous' => false,
                'created_at' => now()->subHours(rand(1, 24)),
                'updated_at' => now()->subHours(rand(1, 24)),
            ]);

            echo "Created pending donation #{$donation->id} with transaction hash {$txHash}\n";
        }
    }

    /**
     * Create tasks that are verified and ready for fund release
     */
    private function createVerifiedTasks(): void
    {
        // Get charities
        $charities = Charity::take(3)->get();

        // Create 3 verified tasks
        foreach ($charities as $charity) {
            // Make sure the organization has a wallet address
            $organization = Organization::find($charity->organization_id);
            if (!$organization->wallet_address) {
                $organization->wallet_address = '0x' . Str::random(40);
                $organization->save();
            }

            // Create task with verified status
            $task = Task::create([
                'charity_id' => $charity->id,
                'name' => 'Verified Task for ' . $charity->name,
                'description' => 'This task has been verified and is ready for fund release',
                'fund_targeted' => rand(1000, 5000),
                'status' => 'verified', // Task is verified
                'proof' => 'proofs/verified-task-proof.pdf',
                'funds_released' => false, // Funds not released yet
                'created_at' => now()->subDays(rand(10, 30)),
                'updated_at' => now()->subDays(rand(1, 5)),
            ]);

            echo "Created verified task #{$task->id} for charity {$charity->name}\n";
        }
    }

    /**
     * Create tasks that have proof uploaded but need verification
     */
    private function createPendingTasks(): void
    {
        // Get charities
        $charities = Charity::take(3)->get();

        // Create 3 pending tasks with proof
        foreach ($charities as $charity) {
            // Create task with pending status but with proof
            $task = Task::create([
                'charity_id' => $charity->id,
                'name' => 'Pending Task for ' . $charity->name,
                'description' => 'This task has proof uploaded but needs verification',
                'fund_targeted' => rand(1000, 5000),
                'status' => 'pending', // Task is pending verification
                'proof' => 'proofs/pending-task-proof.pdf',
                'funds_released' => false,
                'created_at' => now()->subDays(rand(10, 30)),
                'updated_at' => now()->subHours(rand(1, 12)),
            ]);

            echo "Created pending task #{$task->id} for charity {$charity->name}\n";
        }
    }
}
