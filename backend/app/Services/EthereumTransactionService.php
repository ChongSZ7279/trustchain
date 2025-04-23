<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Web3\Web3;
use Web3\Providers\HttpProvider;
use Web3\RequestManagers\HttpRequestManager;
use Web3\Contract;

class EthereumTransactionService
{
    protected $providerUrl;
    protected $privateKey;
    protected $adminAddress;
    protected $contractAddress;
    protected $chainId;
    protected $web3;

    public function __construct()
    {
        $this->providerUrl = env('BLOCKCHAIN_PROVIDER_URL', 'https://sepolia-rpc.scroll.io/');
        $this->privateKey = env('BLOCKCHAIN_ADMIN_PRIVATE_KEY');
        $this->adminAddress = env('BLOCKCHAIN_ADMIN_ADDRESS');
        $this->contractAddress = env('CONTRACT_ADDRESS');
        $this->chainId = 534351; // Scroll Sepolia chain ID

        // Initialize Web3
        $provider = new HttpProvider(new HttpRequestManager($this->providerUrl));
        $this->web3 = new Web3($provider);
    }

    /**
     * Send funds to a charity wallet
     *
     * @param string $charityWallet The charity wallet address
     * @param float $amount The amount to send in ETH
     * @return array Response with transaction hash or error
     */
    public function sendFunds($charityWallet, $amount)
    {
        try {
            // Validate inputs
            if (empty($charityWallet)) {
                throw new \Exception('Charity wallet address is required');
            }

            if ($amount <= 0) {
                throw new \Exception('Amount must be greater than zero');
            }

            // Log the attempt
            Log::info('Attempting to send funds to charity wallet', [
                'charity_wallet' => $charityWallet,
                'amount' => $amount
            ]);

            // Convert amount to wei (1 ETH = 10^18 wei)
            $amountWei = bcmul((string)$amount, '1000000000000000000');

            $txHash = null;
            $eth = $this->web3->eth;

            // Send transaction
            $eth->sendTransaction([
                'from' => $this->adminAddress,
                'to' => $charityWallet,
                'value' => '0x' . dechex($amount * 1e18),
                'gas' => '0x' . dechex(21000),
                'gasPrice' => '0x' . dechex(20000000000), // 20 Gwei
                'chainId' => $this->chainId
            ], function ($err, $transaction) use (&$txHash) {
                if ($err !== null) {
                    throw new \Exception('Failed to send transaction: ' . $err->getMessage());
                }

                $txHash = $transaction;
                Log::info('Transaction sent successfully', ['hash' => $txHash]);
            });

            if (!$txHash) {
                throw new \Exception('Transaction failed to process');
            }

            return [
                'success' => true,
                'message' => 'Funds sent successfully',
                'transaction_hash' => $txHash,
                'explorer_url' => "https://sepolia.scrollscan.com/tx/{$txHash}"
            ];
        } catch (\Exception $e) {
            Log::error('Error sending funds', [
                'error' => $e->getMessage(),
                'charity_wallet' => $charityWallet,
                'amount' => $amount
            ]);

            return [
                'success' => false,
                'message' => 'Error sending funds: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Call a contract function to release funds
     *
     * @param string $charityWallet The charity wallet address
     * @param float $amount The amount to release in ETH
     * @return array Response with transaction hash or error
     */
    public function releaseFunds($charityWallet, $amount)
    {
        try {
            // Validate inputs
            if (empty($charityWallet)) {
                throw new \Exception('Charity wallet address is required');
            }

            if ($amount <= 0) {
                throw new \Exception('Amount must be greater than zero');
            }

            // Log the attempt
            Log::info('Attempting to release funds through contract', [
                'charity_wallet' => $charityWallet,
                'amount' => $amount,
                'contract' => $this->contractAddress
            ]);

            // Get contract ABI
            $contractAbi = json_decode(file_get_contents(base_path('resources/contracts/DonationContract.json')), true)['abi'];

            // Initialize contract
            $contract = new Contract($this->web3->provider, $contractAbi);

            // Convert amount to wei (1 ETH = 10^18 wei)
            $amountWei = bcmul((string)$amount, '1000000000000000000');

            $txHash = null;

            // Call the contract function
            $contract->at($this->contractAddress)->send(
                'withdrawFunds',
                $charityWallet,
                $amountWei,
                [
                    'from' => $this->adminAddress,
                    'gas' => '0x' . dechex(200000),
                    'gasPrice' => '0x' . dechex(20000000000), // 20 Gwei
                ],
                function ($err, $result) use (&$txHash) {
                    if ($err !== null) {
                        throw new \Exception('Failed to call contract: ' . $err->getMessage());
                    }

                    $txHash = $result;
                    Log::info('Contract function called successfully', ['hash' => $txHash]);
                }
            );

            if (!$txHash) {
                throw new \Exception('Contract transaction failed to process');
            }

            return [
                'success' => true,
                'message' => 'Funds released successfully through contract',
                'transaction_hash' => $txHash,
                'explorer_url' => "https://sepolia.scrollscan.com/tx/{$txHash}"
            ];
        } catch (\Exception $e) {
            Log::error('Error releasing funds through contract', [
                'error' => $e->getMessage(),
                'charity_wallet' => $charityWallet,
                'amount' => $amount
            ]);

            return [
                'success' => false,
                'message' => 'Error releasing funds: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get the nonce for an address
     *
     * @param string $address The address to get the nonce for
     * @return int The nonce
     */
    private function getNonce($address)
    {
        try {
            $response = Http::post($this->providerUrl, [
                'jsonrpc' => '2.0',
                'method' => 'eth_getTransactionCount',
                'params' => [$address, 'latest'],
                'id' => 1
            ]);

            $data = $response->json();
            if (isset($data['result'])) {
                return hexdec($data['result']);
            }

            return 0;
        } catch (\Exception $e) {
            Log::error('Error getting nonce: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get a link to view a transaction on the Scroll Sepolia explorer
     *
     * @param string $transactionHash The transaction hash
     * @return string The explorer URL
     */
    public function getExplorerUrl($transactionHash)
    {
        return "https://sepolia.scrollscan.com/tx/{$transactionHash}";
    }
}
