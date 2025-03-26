<?php

namespace App\Http\Controllers;

use App\Services\BlockchainService;
use Illuminate\Http\Request;

class BlockchainController extends Controller
{
    protected $blockchainService;
    
    public function __construct(BlockchainService $blockchainService)
    {
        $this->blockchainService = $blockchainService;
    }
    
    public function getDonationCount()
    {
        $count = $this->blockchainService->getDonationCount();
        return response()->json(['count' => $count]);
    }
    
    public function verifyTransaction(Request $request)
    {
        $request->validate([
            'transaction_hash' => 'required|string'
        ]);
        
        $result = $this->blockchainService->verifyTransaction($request->transaction_hash);
        return response()->json($result);
    }
} 