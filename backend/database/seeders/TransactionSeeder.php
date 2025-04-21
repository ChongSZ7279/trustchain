<?php

namespace Database\Seeders;

use App\Models\Transaction;
use App\Models\Donation;
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

        // Generate transactions based on donations
        $this->generateDonationTransactions($contractAddress);

        // Generate transactions for tasks
        $this->generateTaskTransactions($contractAddress);

        // Generate fund release transactions after task verification
        $this->generateFundReleaseTransactions($contractAddress);
    }

    /**
     * Generate transactions from completed donations
     */
    private function generateDonationTransactions(string $contractAddress): void
    {
        // Get all completed donations
        $donations = Donation::where('status', 'completed')->get();

        foreach ($donations as $donation) {
            // Create transaction record
            Transaction::create([
                'user_ic' => $donation->user_id,
                'charity_id' => $donation->cause_id,
                'amount' => $donation->amount,
                'type' => 'charity',
                'status' => 'completed',
                'transaction_hash' => $donation->transaction_hash,
                'contract_address' => $contractAddress,
                'message' => $donation->donor_message,
                'anonymous' => $donation->is_anonymous,
                'created_at' => $donation->completed_at,
                'updated_at' => $donation->completed_at
            ]);
        }
    }

    /**
     * Generate transactions for completed tasks
     */
    private function generateTaskTransactions(string $contractAddress): void
    {
        // Get completed tasks
        $completedTasks = Task::where('status', 'completed')->get();

        // Get users to assign as donors for task funding
        $users = User::where('ic_number', '!=', '991234567890')->get();

        foreach ($completedTasks as $task) {
            // Get the charity for this task
            $charity = Charity::find($task->charity_id);

            // Generate 3-5 transactions per completed task from different users
            $transactionCount = rand(3, 5);
            $totalAmount = $task->fund_targeted;

            // Generate random amounts that sum to the total
            $amounts = $this->generateRandomAmounts($totalAmount, $transactionCount);

            for ($i = 0; $i < $transactionCount; $i++) {
                // Select a random user
                $user = $users->random();

                // Generate a timestamp within the last 90 days
                $createdAt = now()->subDays(rand(7, 90));

                // Create unique transaction hash
                $txHash = '0x' . Str::random(40);

                // Determine if transaction is anonymous (15% chance)
                $isAnonymous = (rand(0, 100) < 15);

                // Task support messages
                $messages = [
                    'Supporting this important task!',
                    'Happy to help fund this task.',
                    'Great initiative, glad to contribute!',
                    'Looking forward to seeing this completed.',
                    'This task will make a real difference.',
                    null
                ];

                Transaction::create([
                    'user_ic' => $user->ic_number,
                    'charity_id' => $charity->id,
                    'task_id' => $task->id,
                    'amount' => $amounts[$i],
                    'type' => 'task',
                    'status' => 'completed',
                    'transaction_hash' => $txHash,
                    'contract_address' => $contractAddress,
                    'message' => $messages[array_rand($messages)],
                    'anonymous' => $isAnonymous,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt
                ]);
            }
        }
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
            // Get some completed tasks and mark them as verified with funds released
            $tasksToVerify = Task::where('status', 'completed')
                ->take(3)
                ->get();

            foreach ($tasksToVerify as $task) {
                $task->status = 'verified';
                $task->funds_released = true;
                $task->save();

                $verifiedTasks->push($task);
            }
        }

        // Admin user for fund releases
        $adminUser = User::where('ic_number', '991234567890')->first();

        if (!$adminUser) {
            // Use any user if admin not found
            $adminUser = User::first();
        }

        foreach ($verifiedTasks as $task) {
            // Get the charity for this task
            $charity = Charity::find($task->charity_id);

            if (!$charity) continue;

            // Create a fund release transaction
            $releaseAmount = $task->fund_targeted * 0.8; // 80% of targeted funds as an example
            $txHash = '0x' . Str::random(40);
            $createdAt = now()->subDays(rand(1, 30));

            Transaction::create([
                'user_ic' => $adminUser->ic_number,
                'charity_id' => $charity->id,
                'task_id' => $task->id,
                'amount' => $releaseAmount,
                'type' => 'charity', // Using 'charity' instead of 'fund_release' to avoid ENUM constraint issues
                'status' => 'completed',
                'transaction_hash' => $txHash,
                'contract_address' => $contractAddress,
                'message' => 'Funds released after task verification',
                'anonymous' => false,
                'created_at' => $createdAt,
                'updated_at' => $createdAt
            ]);

            // Log for debugging
            echo "Created fund release transaction for task #{$task->id} to charity #{$charity->id}\n";
        }
    }

    /**
     * Generate random amounts that sum to a target value
     */
    private function generateRandomAmounts(float $total, int $count): array
    {
        $amounts = [];
        $remainingTotal = $total;

        for ($i = 0; $i < $count - 1; $i++) {
            // Calculate a random portion of the remaining total
            $maxPortion = min(0.7, 1 - (($count - $i - 1) * 0.1)); // Ensure we leave enough for remaining transactions
            $portion = mt_rand(10, $maxPortion * 100) / 100; // Random between 0.1 and maxPortion

            $amount = round($remainingTotal * $portion, 2);
            $amounts[] = $amount;

            $remainingTotal -= $amount;
        }

        // Add the final amount to make sure they sum exactly to the total
        $amounts[] = round($remainingTotal, 2);

        // Shuffle the amounts
        shuffle($amounts);

        return $amounts;
    }
}