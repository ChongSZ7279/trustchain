# Charity Donation Contract Deployment Guide

This guide will help you deploy the DonationContract to the Scroll Sepolia testnet and configure the frontend to use it.

## Prerequisites

1. MetaMask wallet with Scroll Sepolia network added
2. Some Scroll Sepolia ETH for gas fees (get from [Scroll Sepolia Faucet](https://sepolia.scrollscan.com/faucet))
3. Node.js and npm installed

## Step 1: Configure Environment Variables

1. Navigate to the `mycontract` directory
2. Create a `.env` file with the following content:
   ```
   # Your private key (without 0x prefix)
   PRIVATE_KEY=your_private_key_here_without_0x_prefix
   
   # Scroll Sepolia RPC URL (optional, hardcoded in config)
   SCROLL_SEPOLIA_RPC_URL=https://sepolia-rpc.scroll.io
   
   # Contract address after deployment
   DONATION_CONTRACT_ADDRESS=
   ```
3. Replace `your_private_key_here_without_0x_prefix` with your MetaMask private key (without the 0x prefix)

## Step 2: Deploy the Contract

1. Install dependencies:
   ```
   cd mycontract
   npm install
   ```

2. Deploy the contract to Scroll Sepolia:
   ```
   npx hardhat run scripts/deploy-scroll.js --network scrollSepolia
   ```

3. After successful deployment, you'll see a message with the contract address:
   ```
   DonationContract deployed to: 0xYourContractAddressHere
   ```

4. Copy this address and update your `.env` file:
   ```
   DONATION_CONTRACT_ADDRESS=0xYourContractAddressHere
   ```

## Step 3: Configure the Frontend

1. Navigate to the `frontend` directory
2. Update the `.env` file with your contract address:
   ```
   VITE_API_URL=http://localhost:8000/api
   REACT_APP_CONTRACT_ADDRESS=0xYourContractAddressHere
   VITE_CONTRACT_ADDRESS=0xYourContractAddressHere
   REACT_APP_INFURA_PROJECT_ID=your_infura_project_id_here
   REACT_APP_NETWORK=scroll_sepolia
   ```

3. Restart your frontend development server:
   ```
   npm run dev
   ```

## Step 4: Test the Donation Flow

1. Make sure your MetaMask is connected to the Scroll Sepolia network
2. Navigate to a charity page
3. Click the "Donate" button
4. Enter an amount and complete the donation
5. The transaction should be processed on the Scroll network

## Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Verify that your MetaMask is connected to Scroll Sepolia
3. Ensure you have enough Scroll Sepolia ETH for gas fees
4. Confirm that the contract address is correctly set in the frontend environment variables

## Contract Functions

The DonationContract includes the following key functions:

- `donate(uint256 charityId, string memory message)`: Make a donation to a specific charity
- `getContractBalance()`: Get the total balance of the contract
- `getCharityDonations(uint256 charityId)`: Get total donations for a specific charity
- `withdrawFunds(address payable recipient, uint256 amount)`: Withdraw funds (only owner)

## Charity Proof Upload Flow

After a user donates to a charity:

1. The charity can upload proof of how the funds were used
2. Once the proof is verified, the charity can withdraw the funds
3. The withdrawal is processed through the `withdrawFunds` function
4. All transactions are transparent and visible on the Scroll blockchain
