<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BlockchainService
{
    protected $providerUrl;
    protected $contractAddress;
    
    public function __construct()
    {
        $this->providerUrl = env('BLOCKCHAIN_PROVIDER_URL', 'http://127.0.0.1:8545');
        $this->contractAddress = env('CONTRACT_ADDRESS');
    }
    
    public function getDonationCount()
    {
        try {
            // Call the getDonationCount function on your contract
            $response = Http::post($this->providerUrl, [
                'jsonrpc' => '2.0',
                'method' => 'eth_call',
                'params' => [
                    [
                        'to' => $this->contractAddress,
                        'data' => '0x70a08231' // Function signature for getDonationCount()
                    ],
                    'latest'
                ],
                'id' => 1
            ]);
            
            $data = $response->json();
            if (isset($data['result'])) {
                // Convert hex result to decimal
                return hexdec($data['result']);
            }
            
            return 0;
        } catch (\Exception $e) {
            Log::error('Blockchain error: ' . $e->getMessage());
            return 0;
        }
    }
    
    public function verifyTransaction($txHash)
    {
        try {
            $response = Http::post($this->providerUrl, [
                'jsonrpc' => '2.0',
                'method' => 'eth_getTransactionReceipt',
                'params' => [$txHash],
                'id' => 1
            ]);
            
            $data = $response->json();
            if (isset($data['result']) && $data['result']) {
                return [
                    'success' => $data['result']['status'] === '0x1',
                    'blockNumber' => hexdec($data['result']['blockNumber']),
                    'from' => $data['result']['from'],
                    'to' => $data['result']['to']
                ];
            }
            
            return ['success' => false, 'message' => 'Transaction not found'];
        } catch (\Exception $e) {
            Log::error('Transaction verification error: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Error verifying transaction'];
        }
    }
} 