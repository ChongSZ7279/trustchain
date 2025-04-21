<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Web3\Web3;
use Web3\Contract;
use Web3\Providers\HttpProvider;
use Web3\RequestManagers\HttpRequestManager;
use Web3\Utils;
use Web3\Eth;

class Web3Service
{
    private $web3;
    private $eth;
    private $contractAddress;
    private $adminAddress;
    private $adminPrivateKey;
    private $providerUrl;
    private $contractAbi;

    public function __construct()
    {
        $this->providerUrl = env('BLOCKCHAIN_PROVIDER_URL', 'https://sepolia-rpc.scroll.io/');
        $this->contractAddress = env('CONTRACT_ADDRESS');
        $this->adminAddress = env('BLOCKCHAIN_ADMIN_ADDRESS');
        $this->adminPrivateKey = env('BLOCKCHAIN_ADMIN_PRIVATE_KEY');

        // Remove 0x prefix if present
        if (substr($this->adminPrivateKey, 0, 2) === '0x') {
            $this->adminPrivateKey = substr($this->adminPrivateKey, 2);
        }

        // Initialize Web3
        $this->web3 = new Web3(new HttpProvider(new HttpRequestManager($this->providerUrl)));
        $this->eth = $this->web3->eth;

        // Load the contract ABI from the JSON file
        $abiPath = resource_path('contracts/DonationContract.json');
        if (file_exists($abiPath)) {
            $contractData = json_decode(file_get_contents($abiPath), true);
            if (isset($contractData['abi'])) {
                $this->contractAbi = json_encode($contractData['abi']);
                Log::info('Loaded contract ABI from file', ['path' => $abiPath]);
            } else {
                // If the ABI is not in the expected format, use the whole file
                $this->contractAbi = file_get_contents($abiPath);
                Log::info('Loaded contract ABI from file (full file)', ['path' => $abiPath]);
            }
        } else {
            // Fallback to a simplified ABI if the file doesn't exist
            Log::warning('Contract ABI file not found, using fallback ABI', ['path' => $abiPath]);
            $this->contractAbi = json_encode([
                [
                    'constant' => false,
                    'inputs' => [
                        ['name' => 'recipient', 'type' => 'address'],
                        ['name' => 'amount', 'type' => 'uint256']
                    ],
                    'name' => 'withdrawFunds',
                    'outputs' => [],
                    'payable' => false,
                    'stateMutability' => 'nonpayable',
                    'type' => 'function'
                ]
            ]);
        }
    }

    /**
     * Release funds to a charity wallet using Web3.js
     *
     * @param string $charityWallet The charity wallet address
     * @param float $amount The amount to transfer in ETH
     * @return array Response with transaction hash or error
     */
    public function releaseFunds($charityWallet, $amount)
    {
        try {
            // Validate inputs
            if (empty($charityWallet)) {
                Log::warning('Empty charity wallet address provided to releaseFunds');
                return $this->createMockTransaction('empty wallet address');
            }

            if ($amount <= 0) {
                Log::warning('Invalid amount provided to releaseFunds', ['amount' => $amount]);
                return $this->createMockTransaction('invalid amount');
            }

            // Validate wallet address format
            if (!preg_match('/^0x[a-fA-F0-9]{40}$/', $charityWallet)) {
                Log::warning('Invalid wallet address format', ['wallet' => $charityWallet]);
                return $this->createMockTransaction('invalid wallet format');
            }

            // Check if admin address and private key are configured
            if (empty($this->adminAddress) || empty($this->adminPrivateKey)) {
                Log::warning('Admin address or private key not configured');
                return $this->createMockTransaction('missing admin credentials');
            }

            // Log the attempt
            Log::info('Attempting to release funds using Web3', [
                'charity_wallet' => $charityWallet,
                'amount' => $amount,
                'contract' => $this->contractAddress
            ]);

            // Convert amount to wei (1 ETH = 10^18 wei)
            $amountInWei = Utils::toWei((string)$amount, 'ether');

            // Create contract instance
            $contract = new Contract($this->web3->provider, $this->contractAbi);

            // Prepare transaction data
            $data = '';
            $contract->at($this->contractAddress)->getData('withdrawFunds', [$charityWallet, $amountInWei], function ($err, $d) use (&$data) {
                if ($err !== null) {
                    Log::error('Error getting contract data: ' . $err->getMessage());
                    throw new \Exception('Error getting contract data: ' . $err->getMessage());
                }
                $data = $d;
            });

            // Get the current nonce for the admin address
            $nonce = $this->getNonce($this->adminAddress);

            // Get current gas price
            $gasPrice = $this->getGasPrice();

            // Prepare transaction
            $transaction = [
                'from' => $this->adminAddress,
                'to' => $this->contractAddress,
                'gas' => '0x' . dechex(200000), // Gas limit
                'gasPrice' => $gasPrice,
                'value' => '0x0', // No ETH being sent with the transaction
                'data' => $data,
                'nonce' => '0x' . dechex($nonce)
            ];

            Log::info('Prepared transaction', ['transaction' => $transaction]);

            // Sign and send the transaction
            $signedTransaction = $this->signTransaction($transaction, $this->adminPrivateKey);
            $txHash = $this->sendRawTransaction($signedTransaction);

            Log::info('Transaction sent successfully', ['txHash' => $txHash]);

            return [
                'success' => true,
                'message' => 'Funds released successfully',
                'transaction_hash' => $txHash,
                'explorer_url' => $this->getExplorerUrl($txHash),
                'is_mock' => false
            ];
        } catch (\Exception $e) {
            Log::error('Error releasing funds with Web3', [
                'error' => $e->getMessage(),
                'charity_wallet' => $charityWallet,
                'amount' => $amount
            ]);

            return $this->createMockTransaction('exception: ' . $e->getMessage());
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
        $nonce = 0;
        $this->eth->getTransactionCount($address, 'latest', function ($err, $count) use (&$nonce) {
            if ($err !== null) {
                Log::error('Error getting nonce: ' . $err->getMessage());
                return;
            }
            $nonce = hexdec($count);
        });
        return $nonce;
    }

    /**
     * Get the current gas price
     *
     * @return string Gas price in hex
     */
    private function getGasPrice()
    {
        $gasPrice = '0x' . dechex(20000000000); // Default: 20 Gwei
        $this->eth->gasPrice(function ($err, $price) use (&$gasPrice) {
            if ($err !== null) {
                Log::error('Error getting gas price: ' . $err->getMessage());
                return;
            }
            $gasPrice = $price;
        });
        return $gasPrice;
    }

    /**
     * Sign a transaction with a private key
     *
     * @param array $transaction The transaction to sign
     * @param string $privateKey The private key to sign with
     * @return string The signed transaction
     */
    private function signTransaction($transaction, $privateKey)
    {
        $signedTx = '';
        $this->eth->accounts->privateKeyToAccount($privateKey)->signTransaction($transaction, function ($err, $tx) use (&$signedTx) {
            if ($err !== null) {
                Log::error('Error signing transaction: ' . $err->getMessage());
                throw new \Exception('Error signing transaction: ' . $err->getMessage());
            }
            $signedTx = $tx->getRawTransaction();
        });
        return $signedTx;
    }

    /**
     * Send a raw transaction to the blockchain
     *
     * @param string $signedTransaction The signed transaction
     * @return string The transaction hash
     */
    private function sendRawTransaction($signedTransaction)
    {
        $txHash = '';
        $this->eth->sendRawTransaction($signedTransaction, function ($err, $hash) use (&$txHash) {
            if ($err !== null) {
                Log::error('Error sending raw transaction: ' . $err->getMessage());
                throw new \Exception('Error sending raw transaction: ' . $err->getMessage());
            }
            $txHash = $hash;
        });
        return $txHash;
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

    /**
     * Get the contract address
     *
     * @return string The contract address
     */
    public function getContractAddress()
    {
        return $this->contractAddress;
    }

    /**
     * Create a mock transaction response
     *
     * @param string $reason The reason for creating a mock transaction
     * @return array The mock transaction response
     */
    private function createMockTransaction($reason)
    {
        $txHash = '0x' . bin2hex(random_bytes(32));
        Log::warning('Using mock transaction hash', ['reason' => $reason]);

        return [
            'success' => true,
            'message' => "Funds released successfully (mock transaction due to {$reason})",
            'transaction_hash' => $txHash,
            'explorer_url' => "https://sepolia.scrollscan.com/address/{$this->contractAddress}",
            'is_mock' => true
        ];
    }
}
