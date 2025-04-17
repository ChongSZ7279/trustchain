<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Task;
use App\Models\Charity;
use App\Models\Donation;
use Web3\Web3;
use Web3\Contract;
use Web3\Providers\HttpProvider;
use Web3\RequestManagers\HttpRequestManager;

class BlockchainFundReleaseController extends Controller
{
    /**
     * Release funds for a verified task
     */
    public function releaseTaskFunds(Request $request, $taskId)
    {
        // Check if user is admin
        if (!Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized - Only admins can release funds'], 403);
        }

        // Find the task
        $task = Task::with('charity.organization')->findOrFail($taskId);

        // Check if task is verified and ready for fund release
        if (!$task->canReleaseFunds()) {
            return response()->json([
                'success' => false,
                'message' => 'Task is not ready for fund release. Verification must be complete and status must be verified.'
            ], 400);
        }

        // Get charity wallet address
        $walletAddress = $task->charity->organization->wallet_address;
        if (!$walletAddress) {
            return response()->json([
                'success' => false,
                'message' => 'Charity does not have a wallet address configured'
            ], 400);
        }

        // Calculate amount to release (for this implementation, we'll use the task's fund_targeted)
        $amount = $task->fund_targeted;

        try {
            // Call the blockchain to release funds
            $result = $this->transferFundsOnBlockchain(
                $walletAddress,
                $amount
            );

            if (!$result['success']) {
                Log::error('Failed to transfer funds on blockchain', $result);
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to transfer funds: ' . $result['error']
                ], 500);
            }

            // Update task status
            $task->update([
                'funds_released' => true,
                'transaction_hash' => $result['transactionHash']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Funds released successfully',
                'transaction_hash' => $result['transactionHash'],
                'task' => $task
            ]);
        } catch (\Exception $e) {
            Log::error('Error releasing funds for task', [
                'error' => $e->getMessage(),
                'task_id' => $taskId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to release funds: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Release funds for a verified donation
     */
    public function releaseDonationFunds(Request $request, $donationId)
    {
        // Check if user is admin
        if (!Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized - Only admins can release funds'], 403);
        }

        // Find the donation
        $donation = Donation::with('cause.organization')->findOrFail($donationId);

        // Check if donation is verified
        if (!$donation->isVerified()) {
            return response()->json([
                'success' => false,
                'message' => 'Donation is not verified yet'
            ], 400);
        }

        // Get charity wallet address
        $walletAddress = $donation->cause->organization->wallet_address;
        if (!$walletAddress) {
            return response()->json([
                'success' => false,
                'message' => 'Charity does not have a wallet address configured'
            ], 400);
        }

        try {
            // Call the blockchain to release funds
            $result = $this->transferFundsOnBlockchain(
                $walletAddress,
                $donation->amount
            );

            if (!$result['success']) {
                Log::error('Failed to transfer funds on blockchain', $result);
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to transfer funds: ' . $result['error']
                ], 500);
            }

            // Update donation status
            $donation->complete();
            $donation->transfer_transaction_hash = $result['transactionHash'];
            $donation->save();

            // Update charity fund progress
            $this->updateCharityFundProgress($donation->cause);

            return response()->json([
                'success' => true,
                'message' => 'Funds released successfully',
                'transaction_hash' => $result['transactionHash'],
                'donation' => $donation
            ]);
        } catch (\Exception $e) {
            Log::error('Error releasing funds for donation', [
                'error' => $e->getMessage(),
                'donation_id' => $donationId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to release funds: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Transfer funds on blockchain using the contract's withdrawFunds function
     */
    private function transferFundsOnBlockchain($recipientAddress, $amount)
    {
        try {
            // Get contract address from .env
            $contractAddress = env('VITE_CONTRACT_ADDRESS');
            if (!$contractAddress) {
                throw new \Exception('Contract address not configured in .env');
            }

            // Get admin wallet private key from .env
            $privateKey = env('BLOCKCHAIN_ADMIN_PRIVATE_KEY');
            if (!$privateKey) {
                throw new \Exception('Admin private key not configured in .env');
            }

            // Remove 0x prefix if present
            if (substr($privateKey, 0, 2) === '0x') {
                $privateKey = substr($privateKey, 2);
            }

            // Get admin wallet address from .env
            $adminAddress = env('BLOCKCHAIN_ADMIN_ADDRESS');
            if (!$adminAddress) {
                throw new \Exception('Admin address not configured in .env');
            }

            // Initialize Web3
            $web3 = new Web3(new HttpProvider(new HttpRequestManager(env('BLOCKCHAIN_PROVIDER_URL'), 10)));
            
            // Get contract ABI
            $contractABI = $this->getContractABI();
            
            // Create contract instance
            $contract = new Contract($web3->provider, $contractABI);
            
            // Convert amount to wei (assuming amount is in ETH)
            $amountInWei = $this->toWei($amount);
            
            // Call withdrawFunds function
            $txHash = null;
            $contract->at($contractAddress)->send(
                'withdrawFunds',
                $recipientAddress,
                $amountInWei,
                [
                    'from' => $adminAddress,
                    'gas' => '200000',
                    'privateKey' => $privateKey
                ],
                function ($err, $result) use (&$txHash) {
                    if ($err) {
                        throw new \Exception("Contract error: " . $err->getMessage());
                    }
                    
                    // Store transaction hash
                    $txHash = $result;
                }
            );
            
            Log::info('Blockchain fund transfer successful', [
                'transaction_hash' => $txHash,
                'recipient' => $recipientAddress,
                'amount' => $amount
            ]);
            
            return [
                'success' => true,
                'transactionHash' => $txHash
            ];
        } catch (\Exception $e) {
            Log::error('Blockchain fund transfer error', [
                'error' => $e->getMessage(),
                'recipient' => $recipientAddress,
                'amount' => $amount
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Convert ETH to Wei
     */
    private function toWei($amount)
    {
        // 1 ETH = 10^18 Wei
        return bcmul($amount, '1000000000000000000');
    }

    /**
     * Update charity fund progress
     */
    private function updateCharityFundProgress($charity)
    {
        // Calculate total completed donations
        $totalCompleted = Donation::where('cause_id', $charity->id)
            ->where('status', 'completed')
            ->sum('amount');
        
        // Update charity fund progress
        $charity->funds_raised = $totalCompleted;
        
        // Check if target is reached
        if ($charity->funds_raised >= $charity->funding_goal) {
            $charity->is_fully_funded = true;
        }
        
        $charity->save();
        
        return $charity;
    }

    /**
     * Get contract ABI
     */
    private function getContractABI()
    {
        return json_decode(file_get_contents(base_path('resources/contracts/DonationContract.json')), true)['abi'];
    }
}
