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

## Project Structure

The project consists of three main components:

- **Frontend**: React application built with Vite
- **Backend**: Laravel PHP application
- **Smart Contracts**: Ethereum smart contracts using Hardhat

## Prerequisites

- Node.js (16+) and npm/yarn
- PHP 8.1+ and Composer
- MySQL or SQLite database
- MetaMask or another Ethereum wallet
- XAMPP (for local development)

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   composer install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. Configure your database in the `.env` file:
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=charity
   DB_USERNAME=root
   DB_PASSWORD=
   ```

5. Run migrations and seed the database:
   ```bash
   php artisan migrate --seed
   ```

6. Create a storage link:
   ```bash
   php artisan storage:link
   ```

7. Start the Laravel server:
   ```bash
   php artisan serve
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Configure the frontend `.env` file:
   ```
   VITE_API_URL=http://localhost:8000
   VITE_CHARITY_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Access the application at `http://localhost:5173`

### Smart Contract Setup

1. Navigate to the smart contract directory:
   ```bash
   cd mycontract
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Compile the contracts:
   ```bash
   npm run build
   # or
   yarn build
   ```

4. Deploy to a local network (for development):
   ```bash
   npx hardhat node
   npx hardhat run scripts/deploy.js --network localhost
   ```

5. For testnet deployment:
   ```bash
   npm run deploy -- -k <your-secret-key>
   # or
   yarn deploy -k <your-secret-key>
   ```

## Demo Data Setup

TrustChain comes with a set of demo data to help you explore the platform's features:

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

### Demo Credentials

After setting up the demo data, you can log in with the following credentials:

**User Account:**
- Email: john.doe@example.com
- Password: password123

**Organization Account:**
- Email: tech@trustchain.com
- Password: password123

## Smart Contract Details

### Donation Flow

1. Users connect their MetaMask wallet to the platform
2. When making a donation, the funds are sent directly to the smart contract
3. The transaction is recorded on the Ethereum blockchain
4. The donation details are stored in the platform's database with the transaction hash
5. The charity can view all donations and their status

### Key Smart Contract Functions

- `donate(uint256 charityId)`: Donate to a specific charity
- `fundTask(uint256 taskId)`: Fund a specific task within a charity
- `withdrawTaskFunds(uint256 taskId, address payable recipient)`: Withdraw funds for a completed task
- `getCharityBalance(uint256 charityId)`: Check the balance of a charity
- `getTaskBalance(uint256 taskId)`: Check the balance of a task

### Security Features

- **ReentrancyGuard**: Protection against reentrancy attacks
- **Ownable**: Access control for administrative functions
- **Pausable**: Ability to pause the contract in case of emergencies
- **Minimum Donation**: Configurable minimum donation amount to prevent dust attacks

## Transaction Transparency

All transactions are recorded both on the blockchain and in the platform's database, providing:

- Transaction hash for verification on Etherscan
- Timestamp of the donation
- Donor information (unless anonymous)
- Recipient charity/task details
- Amount donated
- Current status of the transaction

## Technical Stack

- **Frontend**: React.js with Vite and Tailwind CSS
- **Backend**: Laravel PHP framework
- **Blockchain**: Ethereum (Solidity smart contracts)
- **Web3 Integration**: ethers.js for blockchain interaction
- **Smart Contract Development**: Hardhat and thirdweb

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
