# TrustChain - Blockchain-Powered Charity Platform

TrustChain is a transparent charity platform that leverages blockchain technology to ensure trust, transparency, and accountability in charitable donations.

## Features

- **Blockchain-Based Donations**: Secure and transparent donations using Ethereum smart contracts
- **Organization Verification**: Verified charity organizations with proper documentation
- **Task-Based Funding**: Support specific tasks within charities
- **Transaction History**: Complete transparency with all transactions recorded on the blockchain
- **User Dashboard**: Track your donations and see their impact
- **Organization Dashboard**: Manage charities and view donation statistics
- **Milestone Verification**: Verify task milestones
- **Smart Contract Integration**: Ethereum smart contracts for transparency and accountability
- **Transparent Fund Allocation**: Funds are allocated transparently
- **Tax Receipt Generation**: Generate tax receipts for donations

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

## Setup Instructions

### Prerequisites

- PHP 8.1+
- Composer
- Node.js 16+
- npm or yarn
- MySQL or SQLite
- XAMPP (for local development)
- MetaMask or another Ethereum wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/trustchain.git
cd trustchain
```

2. Set up the backend:
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

3. Configure your database in the `.env` file:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=trustchain
DB_USERNAME=root
DB_PASSWORD=
```

4. Set up the frontend:
```bash
cd ../frontend
npm install
cp .env.example .env
```

5. Configure the frontend `.env` file:
```
VITE_API_URL=http://localhost:8000
VITE_CHARITY_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Running the Application

1. Start the backend server:
```bash
cd backend
php artisan serve
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Access the application at `http://localhost:5173`

## Demo Data Setup

TrustChain comes with a set of demo data to help you explore the platform's features. To set up the demo data:

1. Navigate to the backend directory:
```bash
cd backend
```

2. Run the setup command:
```bash
php artisan app:setup-demo-data
```

This will:
- Run database migrations
- Create a storage link
- Seed the database with demo users, organizations, charities, tasks, and transactions
- Generate placeholder images and documents

If you want to start with a fresh database, use the `--fresh` option:
```bash
php artisan app:setup-demo-data --fresh
```

### Demo Credentials

After setting up the demo data, you can log in with the following credentials:

**User Account:**
- Email: john.doe@example.com
- Password: password123

**Organization Account:**
- Email: contact@hopefoundation.org
- Password: password123

## Smart Contract Integration

TrustChain uses Ethereum smart contracts to ensure transparency and accountability. The main contract is located at `frontend/src/contracts/CharityContract.sol`.

### Key Features of the Smart Contract

- **Secure Donation Processing**: All donations are processed through the smart contract with a small platform fee (1%)
- **Milestone-based Fund Release**: Funds for tasks are released only when milestones are verified
- **Transparent Transaction History**: All transactions are recorded on the blockchain and can be verified
- **Proof Verification**: Completed tasks require proof documents and verification before funds are released
- **Platform Fee Management**: A small fee is collected to support platform maintenance

### Contract Security Features

- **ReentrancyGuard**: Protection against reentrancy attacks
- **Ownable**: Access control for administrative functions
- **Pausable**: Ability to pause the contract in case of emergencies
- **Minimum Donation**: Configurable minimum donation amount to prevent dust attacks

### Blockchain Interaction

To interact with the blockchain features:

1. Install MetaMask or another Ethereum wallet browser extension
2. Connect your wallet to the application when prompted
3. Make sure you have some test ETH in your wallet (for testnet usage)
4. When making a donation or funding a task, select "Blockchain" as the payment method

### Local Blockchain Development

For local development, you can use Hardhat or Ganache:

1. Install Hardhat:
```bash
npm install --save-dev hardhat
```

2. Start a local blockchain:
```bash
npx hardhat node
```

3. Deploy the contract:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

4. Update the contract address in your `.env` file

## License

This project is licensed under the MIT License - see the LICENSE file for details. 