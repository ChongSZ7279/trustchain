<?php

namespace App\Helpers;

use App\Models\Donation;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DonationSyncHelper
{
    /**
     * Sync a donation with the transactions table
     * 
     * @param Donation|int $donation The donation model or ID
     * @return bool Success status
     */
    public static function syncDonationWithTransaction($donation)
    {
        try {
            // Get donation if ID was passed
            if (!($donation instanceof Donation)) {
                $donation = Donation::find($donation);
                if (!$donation) {
                    Log::error('Donation sync failed: Donation not found', ['donation_id' => $donation]);
                    return false;
                }
            }

            Log::info('Syncing donation with transaction', [
                'donation_id' => $donation->id,
                'transaction_hash' => $donation->transaction_hash,
                'amount' => $donation->amount,
                'cause_id' => $donation->cause_id
            ]);

            // Check if a transaction with this hash already exists
            $existingTransaction = Transaction::where('transaction_hash', $donation->transaction_hash)->first();
            if ($existingTransaction) {
                Log::info('Transaction already exists for this donation', [
                    'transaction_id' => $existingTransaction->id,
                    'donation_id' => $donation->id
                ]);
                return true;
            }

            // Start a database transaction
            DB::beginTransaction();

            // Create a new transaction record
            $transaction = new Transaction();
            $transaction->user_ic = $donation->user_id;
            $transaction->charity_id = $donation->cause_id;
            $transaction->amount = $donation->amount;
            $transaction->type = 'donation';
            $transaction->status = $donation->status;
            $transaction->transaction_hash = $donation->transaction_hash;
            $transaction->message = $donation->donor_message;
            $transaction->anonymous = $donation->is_anonymous;
            $transaction->save();

            Log::info('Created transaction for donation', [
                'transaction_id' => $transaction->id,
                'donation_id' => $donation->id
            ]);

            // Commit the transaction
            DB::commit();
            return true;
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollBack();
            Log::error('Failed to sync donation with transaction', [
                'donation_id' => $donation->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Sync all donations that don't have corresponding transactions
     * 
     * @return array Result statistics
     */
    public static function syncAllDonations()
    {
        $stats = [
            'total' => 0,
            'success' => 0,
            'failed' => 0
        ];

        try {
            // Get all donations
            $donations = Donation::all();
            $stats['total'] = $donations->count();

            foreach ($donations as $donation) {
                // Skip if no transaction hash
                if (!$donation->transaction_hash) {
                    continue;
                }

                // Check if a transaction with this hash already exists
                $existingTransaction = Transaction::where('transaction_hash', $donation->transaction_hash)->first();
                if ($existingTransaction) {
                    $stats['success']++;
                    continue;
                }

                // Sync the donation
                $result = self::syncDonationWithTransaction($donation);
                if ($result) {
                    $stats['success']++;
                } else {
                    $stats['failed']++;
                }
            }

            return $stats;
        } catch (\Exception $e) {
            Log::error('Failed to sync all donations', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return $stats;
        }
    }
}
