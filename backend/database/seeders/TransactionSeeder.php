<?php

namespace Database\Seeders;

use App\Models\Transaction;
use App\Models\Task;
use App\Models\User;
use App\Models\Charity;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Smart contract address on Scroll Sepolia testnet
        $contractAddress = "0x7867fC939F10377E309a3BF55bfc194F672B0E84";

        // Only generate fund release transactions
        $this->command->info('Generating fund release transactions...');
        $this->generateFundReleaseTransactions($contractAddress);
    }

    /**
     * Generate fund release transactions after task verification
     */
    private function generateFundReleaseTransactions(string $contractAddress): void
    {
        // Get verified tasks with funds_released = true
        $verifiedTasks = Task::where('status', 'verified')
            ->where('funds_released', true)
            ->get();

        // If no verified tasks exist, create some for testing
        if ($verifiedTasks->isEmpty()) {
            $this->command->info("No verified tasks found. Creating some for testing...");
            
            // Get some completed tasks and mark them as verified with funds released
            $tasksToVerify = Task::where('status', 'completed')
                ->take(5)
                ->get();

            foreach ($tasksToVerify as $task) {
                $task->status = 'verified';
                $task->funds_released = true;
                $task->save();

                $verifiedTasks->push($task);
            }
        }

        $this->command->info("Found {$verifiedTasks->count()} verified tasks for fund release");

        // Admin user for fund releases
        $adminUser = User::where('ic_number', '991234567890')->first();

        if (!$adminUser) {
            // Use any user if admin not found
            $adminUser = User::first();
        }

        $fundReleaseCount = 0;
        $totalFunds = 0;

        foreach ($verifiedTasks as $task) {
            // Get the charity for this task
            $charity = Charity::find($task->charity_id);

            if (!$charity) continue;

            // Create a fund release transaction
            $releaseAmount = $task->fund_targeted * 0.8; // 80% of targeted funds as an example
            $totalFunds += $releaseAmount;
            
            $txHash = '0x' . Str::random(40);
            $createdAt = now()->subDays(rand(1, 30));

            $transactionData = [
                'user_ic' => $adminUser->ic_number,
                'charity_id' => $charity->id,
                'task_id' => $task->id,
                'amount' => $releaseAmount,
                'type' => 'fund_release', // Only use fund_release type
                'currency_type' => 'SCROLL',
                'status' => 'completed',
                'transaction_hash' => $txHash,
                'contract_address' => $contractAddress,
                'message' => 'Funds released after task verification',
                'anonymous' => false,
                'created_at' => $createdAt,
                'updated_at' => $createdAt
            ];
            
            Transaction::create($transactionData);
            $fundReleaseCount++;

            // Log for debugging
            $this->command->info("Created fund release transaction for task #{$task->id} to charity #{$charity->id}");
        }

        $this->command->info("Created $fundReleaseCount fund release transactions totaling $totalFunds SCROLL");
    }
}