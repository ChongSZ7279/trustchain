# Setting Up Real Blockchain Transactions

This document provides instructions on how to set up real blockchain transactions for the TrustChain application.

## Prerequisites

1. **Ethereum Wallet**: You need an Ethereum wallet with a private key. For testing, you can create a new wallet using MetaMask.

2. **Scroll Sepolia Testnet Funds**: Your wallet needs to have funds on the Scroll Sepolia testnet. You can get test ETH from the [Scroll Sepolia Faucet](https://sepolia.scroll.io/faucet).

3. **PHP Ethereum Library**: Install the web3.php library:

```bash
composer require web3p/web3.php
```

## Configuration

1. **Update .env File**: Make sure your `.env` file has the following settings:

```
BLOCKCHAIN_PROVIDER_URL=https://sepolia-rpc.scroll.io/
BLOCKCHAIN_ADMIN_PRIVATE_KEY=your_private_key_here
BLOCKCHAIN_ADMIN_ADDRESS=your_wallet_address_here
CONTRACT_ADDRESS=0x7867fC939F10377E309a3BF55bfc194F672B0E84
```

2. **Implement Transaction Signing**: Update the `EthereumTransactionService.php` file to use the web3.php library for transaction signing.

## Implementation Steps

### 1. Install Web3.php

```bash
composer require web3p/web3.php
```

### 2. Update the EthereumTransactionService

Update the `sendFunds` and `releaseFunds` methods in `EthereumTransactionService.php` to use the web3.php library for transaction signing:

```php
use Web3\Web3;
use Web3\Contract;
use Web3\Providers\HttpProvider;
use Web3\RequestManagers\HttpRequestManager;
use Web3\Utils;

// In the releaseFunds method:
$web3 = new Web3(new HttpProvider(new HttpRequestManager($this->providerUrl)));
$eth = $web3->eth;

// Sign the transaction
$transaction = new Transaction([
    'nonce' => '0x' . dechex($nonce),
    'gasPrice' => '0x' . dechex(20000000000),
    'gasLimit' => '0x' . dechex(200000),
    'to' => $this->contractAddress,
    'value' => '0x0',
    'data' => $data,
    'chainId' => $this->chainId
]);

$signedTransaction = $transaction->sign($this->privateKey);

// Send the transaction
$eth->sendRawTransaction('0x' . $signedTransaction, function ($err, $txHash) {
    if ($err) {
        throw new \Exception('Error sending transaction: ' . $err->getMessage());
    }
    
    return $txHash;
});
```

### 3. Test with Small Amounts

Always test with small amounts first to ensure everything is working correctly.

## Troubleshooting

### Transaction Not Found on Explorer

If your transaction hash doesn't appear on the Scroll Sepolia explorer, check:

1. **RPC Node**: Make sure the RPC node is working correctly. Try using a different node if necessary.

2. **Transaction Signing**: Ensure the transaction is being signed correctly with the private key.

3. **Gas Price**: The gas price might be too low. Try increasing it.

4. **Nonce**: Make sure the nonce is correct. If you've sent transactions from the wallet before, you need to use the next nonce.

### Contract Interaction Fails

If contract interaction fails, check:

1. **Contract Address**: Ensure the contract address is correct.

2. **Function Signature**: Verify the function signature is correct.

3. **Parameter Encoding**: Make sure the parameters are encoded correctly.

4. **Gas Limit**: Contract interactions require more gas. Try increasing the gas limit.

## Moving to Production

For production, you should:

1. **Use a Secure Key Management System**: Don't store private keys in the .env file.

2. **Implement Transaction Monitoring**: Monitor transactions to ensure they're confirmed.

3. **Add Retry Logic**: Add logic to retry failed transactions.

4. **Implement Proper Error Handling**: Handle all possible error cases.

5. **Use a Production-Ready RPC Node**: Use a reliable RPC node service like Infura or Alchemy.
