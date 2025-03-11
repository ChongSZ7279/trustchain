# TrustChain - Blockchain-Powered Charity Platform

TrustChain is a transparent charity platform that leverages blockchain technology to ensure trust, transparency, and accountability in charitable donations.

## Features

- **Blockchain-Based Donations**: Secure and transparent donations using Ethereum smart contracts
- **Organization Verification**: Verified charity organizations with proper documentation
- **Task-Based Funding**: Support specific tasks within charities
- **Transaction History**: Complete transparency with all transactions recorded on the blockchain
- **User Dashboard**: Track your donations and see their impact
- **Organization Dashboard**: Manage charities and view donation statistics

## Smart Contract Integration

The platform uses Ethereum smart contracts to handle donations and task funding. The main contract (`CharityContract.sol`) provides the following functionality:

### Donation Flow

1. Users connect their MetaMask wallet to the platform
2. When making a donation, the funds are sent directly to the smart contract
3. The transaction is recorded on the Ethereum blockchain
4. The donation details are stored in the platform's database with the transaction hash
5. The charity can view all donations and their status

### Smart Contract Functions

- `donate(uint256 charityId)`: Donate to a specific charity
- `fundTask(uint256 taskId)`: Fund a specific task within a charity
- `withdrawTaskFunds(uint256 taskId, address payable recipient)`: Withdraw funds for a completed task
- `getCharityBalance(uint256 charityId)`: Check the balance of a charity
- `getTaskBalance(uint256 taskId)`: Check the balance of a task

### Transaction Transparency

All transactions are recorded both on the blockchain and in the platform's database, providing:

- Transaction hash for verification on Etherscan
- Timestamp of the donation
- Donor information (unless anonymous)
- Recipient charity/task details
- Amount donated
- Current status of the transaction

## Technical Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Laravel PHP framework
- **Blockchain**: Ethereum (Solidity smart contracts)
- **Web3 Integration**: Web3.js for blockchain interaction

## Getting Started

### Prerequisites

- Node.js and npm
- MetaMask browser extension
- Ethereum testnet account with test ETH (for development)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/trustchain.git
   cd trustchain
   ```

2. Install frontend dependencies
   ```
   cd frontend
   npm install
   ```

3. Set up environment variables
   ```
   cp .env.example .env
   ```
   
   Update the `.env` file with your Ethereum contract address:
   ```
   REACT_APP_CHARITY_CONTRACT_ADDRESS=0xYourContractAddress
   ```

4. Start the development server
   ```
   npm start
   ```

### Deploying the Smart Contract

1. Install Truffle
   ```
   npm install -g truffle
   ```

2. Compile the contract
   ```
   truffle compile
   ```

3. Deploy to a testnet (e.g., Goerli)
   ```
   truffle migrate --network goerli
   ```

4. Update the contract address in your `.env` file

## Security Considerations

- The smart contract has been designed with security best practices
- Only the contract owner can withdraw task funds
- All functions include proper validation and error handling
- The contract uses the latest Solidity version (0.8.0+) which includes overflow protection

## License

This project is licensed under the MIT License - see the LICENSE file for details. 