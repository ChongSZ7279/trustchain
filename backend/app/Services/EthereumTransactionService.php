<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class EthereumTransactionService
{
    protected $providerUrl;
    protected $privateKey;
    protected $adminAddress;
    protected $contractAddress;
    protected $chainId;

    public function __construct()
    {
        $this->providerUrl = env('BLOCKCHAIN_PROVIDER_URL', 'https://sepolia-rpc.scroll.io/');
        $this->privateKey = env('BLOCKCHAIN_ADMIN_PRIVATE_KEY');
        $this->adminAddress = env('BLOCKCHAIN_ADMIN_ADDRESS');
        $this->contractAddress = env('CONTRACT_ADDRESS');
        $this->chainId = 534351; // Scroll Sepolia chain ID
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

            // Get the current nonce for the admin address
            $nonce = $this->getNonce($this->adminAddress);

            // Create the raw transaction
            $rawTransaction = [
                'nonce' => '0x' . dechex($nonce),
                'gasPrice' => '0x' . dechex(20000000000), // 20 Gwei
                'gasLimit' => '0x' . dechex(21000), // Standard gas limit for ETH transfer
                'to' => $charityWallet,
                'value' => '0x' . dechex($amount * 1e18), // Convert to wei
                'data' => '',
                'chainId' => $this->chainId
            ];

            // For demonstration purposes, we'll log what would be sent
            // In a real implementation, you would sign this transaction with the private key
            Log::info('Transaction prepared', ['transaction' => $rawTransaction]);

            // For testing purposes, we'll use a mock transaction hash
            // In a real implementation, you would sign and send the transaction
            $txHash = '0x' . bin2hex(random_bytes(32));

            return [
                'success' => true,
                'message' => 'Funds sent successfully (mock)',
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

            // Prepare the function call data for the contract
            // Function: withdrawFunds(address recipient, uint256 amount)
            $functionSignature = '0x' . substr(hash('sha256', 'withdrawFunds(address,uint256)'), 0, 8);
            $encodedRecipient = str_pad(substr($charityWallet, 2), 64, '0', STR_PAD_LEFT);
            $encodedAmount = str_pad(dechex($amount * 1e18), 64, '0', STR_PAD_LEFT); // Convert to wei
            $data = $functionSignature . $encodedRecipient . $encodedAmount;

            // Get the current nonce for the admin address
            $nonce = $this->getNonce($this->adminAddress);

            // Create the raw transaction
            $rawTransaction = [
                'nonce' => '0x' . dechex($nonce),
                'gasPrice' => '0x' . dechex(20000000000), // 20 Gwei
                'gasLimit' => '0x' . dechex(200000), // Higher gas limit for contract interaction
                'to' => $this->contractAddress,
                'value' => '0x0', // No ETH sent directly
                'data' => $data,
                'chainId' => $this->chainId
            ];

            // For demonstration purposes, we'll log what would be sent
            // In a real implementation, you would sign this transaction with the private key
            Log::info('Contract transaction prepared', ['transaction' => $rawTransaction]);

            // For testing purposes, we'll use a mock transaction hash
            // In a real implementation, you would sign and send the transaction
            $txHash = '0x' . bin2hex(random_bytes(32));

            return [
                'success' => true,
                'message' => 'Funds released successfully through contract (mock)',
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
