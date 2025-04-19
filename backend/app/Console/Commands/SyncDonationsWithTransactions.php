<?php

namespace App\Console\Commands;

use App\Helpers\DonationSyncHelper;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncDonationsWithTransactions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'donations:sync-transactions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync all donations with the transactions table';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting donation sync with transactions...');
        Log::info('Starting donation sync with transactions command');

        try {
            $stats = DonationSyncHelper::syncAllDonations();
            
            $this->info('Donation sync completed:');
            $this->table(
                ['Total', 'Success', 'Failed'],
                [[$stats['total'], $stats['success'], $stats['failed']]]
            );
            
            Log::info('Donation sync completed', $stats);
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Donation sync failed: ' . $e->getMessage());
            Log::error('Donation sync command failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return Command::FAILURE;
        }
    }
}
