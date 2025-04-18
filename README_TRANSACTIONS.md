# Testing Transactions with Small Amounts on Testnet

This document provides instructions on how to test the donation and transaction flow with small amounts on the Scroll Sepolia testnet.

## Overview of Transaction Flow

### Donation Flow
1. User donates to a charity
2. System stores the donation in both MySQL and blockchain
3. Donation appears in transaction lists (charity-specific and global)
4. Admin verifies the donation

### Task Verification Flow
1. Organization creates a charity
2. Organization uploads proof for tasks
3. Admin verifies the task
4. System transfers funds from verified donations to the charity wallet
5. Transactions are stored in both blockchain and MySQL
6. Transactions appear in transaction lists

## Testing with Small Amounts

To minimize costs while testing on the Scroll Sepolia testnet, we've configured the system to work with very small amounts:

- **Minimum Donation Amount**: 0.001 SCROLL
- **Task Funding Amount**: 0.01 SCROLL

These small amounts allow for comprehensive testing without requiring significant testnet funds.

## Prerequisites

1. **Admin Wallet**: The admin wallet should have at least 0.1 SCROLL on the Scroll Sepolia testnet
2. **Charity Wallet**: Each charity should have a valid Ethereum wallet address
3. **Environment Configuration**: Ensure your `.env` file has the correct blockchain settings:

```
BLOCKCHAIN_PROVIDER_URL=https://sepolia-rpc.scroll.io/
BLOCKCHAIN_ADMIN_ADDRESS=your_admin_wallet_address
BLOCKCHAIN_ADMIN_PRIVATE_KEY=your_admin_private_key
CONTRACT_ADDRESS=0x7867fC939F10377E309a3BF55bfc194F672B0E84
```

## Testing Steps

### 1. Make a Donation

1. Navigate to a charity details page
2. Click the "Donate" button
3. Enter a small amount (e.g., 0.001 SCROLL)
4. Complete the donation process
5. Verify the donation appears in:
   - The charity's transaction tab
   - The global transaction list

### 2. Verify a Task with Proof

1. Log in as an admin
2. Navigate to the admin verification panel
3. Find a task with uploaded proof
4. Click "Verify & Release Funds"
5. Confirm the verification
6. Verify the transaction appears in:
   - The charity's transaction tab
   - The global transaction list
   - The Scroll Sepolia explorer (using the transaction hash)

### 3. View Transaction Details

1. Navigate to the transaction list
2. Click on a transaction to view its details
3. For blockchain transactions, click the explorer link to view it on Scroll Sepolia

## Troubleshooting

### Transaction Not Found on Explorer

If a transaction hash doesn't appear on the Scroll Sepolia explorer:

1. **Check Mock Transactions**: The system may be using mock transaction hashes if real blockchain integration is not fully implemented
2. **Verify RPC Connection**: Ensure the Scroll Sepolia RPC endpoint is accessible
3. **Check Admin Wallet**: Verify the admin wallet has sufficient funds

### Donation Not Appearing in Lists

If a donation doesn't appear in transaction lists:

1. **Check Database**: Verify the donation was stored in the MySQL database
2. **Refresh the Page**: Sometimes the UI needs a refresh to show new transactions
3. **Check Filters**: Ensure you're not filtering out the transaction type

## Implementation Notes

- The system uses mock transaction hashes if real blockchain transactions fail
- For full blockchain integration, install the web3.php library and implement proper transaction signing
- The admin wallet needs to have sufficient funds on the Scroll Sepolia testnet
- Transaction hashes are stored in the `transaction_hash` column in the `transactions` table

## Future Improvements

- Implement real-time transaction updates using WebSockets
- Add transaction confirmation notifications
- Enhance transaction analytics with charts and graphs
- Improve mobile experience for transaction lists
