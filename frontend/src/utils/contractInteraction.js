import Web3 from 'web3';
import { DonationContractABI, DonationContractAddress } from '../contracts/DonationContractABI';
import { SCROLL_CONFIG, addScrollNetwork } from './scrollConfig';

let web3;
let contract;
let account;
let contractInstance;

// Initialize Web3 and contract
export const initWeb3 = async () => {
  if (window.ethereum) {
    try {
      console.log("initWeb3: Web3 provider detected");
      
      // Request account access
      console.log("initWeb3: Requesting account access");
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create Web3 instance
      console.log("initWeb3: Creating Web3 instance");
      web3 = new Web3(window.ethereum);
      
      // Get user account
      console.log("initWeb3: Getting accounts");
      const accounts = await web3.eth.getAccounts();
      account = accounts[0];
      console.log("initWeb3: Current account:", account);
      
      // Get current chain ID
      console.log("initWeb3: Getting chain ID");
      const chainId = await web3.eth.getChainId();
      console.log("initWeb3: Current chain ID:", chainId);
      
      // Initialize contract with the ABI and address
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      console.log("initWeb3: Using contract address:", contractAddress);
      
      if (!contractAddress) {
        console.error("initWeb3: Contract address is not defined in environment variables");
        throw new Error("Contract address is not defined in environment variables");
      }
      
      console.log("initWeb3: Creating contract instance with ABI:", !!DonationContractABI);
      contract = new web3.eth.Contract(
        DonationContractABI,
        contractAddress
      );
      
      // Store the contract instance globally
      console.log("initWeb3: Storing contract instance globally");
      contractInstance = contract;
      
      return { web3, contract, account, chainId };
    } catch (error) {
      console.error("Error initializing Web3:", error);
      // Add more descriptive error message
      let errorMessage = error.message;
      if (error.code === 4001) {
        errorMessage = "You rejected the connection request. Please approve the MetaMask connection.";
      } else if (!window.ethereum.isConnected()) {
        errorMessage = "MetaMask is not connected to the network. Please check your connection.";
      }
      throw new Error(errorMessage);
    }
  } else {
    console.error("initWeb3: No Ethereum provider detected. Please install MetaMask");
    throw new Error('Please install MetaMask or another Web3 provider');
  }
};

// Switch to Scroll network
export const switchToScroll = async () => {
  try {
    console.log('Attempting to switch to Scroll network...');
    
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    const chainIdHex = `0x${Number(SCROLL_CONFIG.NETWORK.CHAIN_ID).toString(16)}`;
    console.log('Target chain ID:', chainIdHex);

    // First try to switch to the network if it already exists
    try {
      console.log('Attempting to switch to existing Scroll network...');
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
      console.log('Successfully switched to existing Scroll network');
      return true;
    } catch (switchError) {
      console.log('Switch error:', switchError);
      
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902 || 
          switchError.message.includes('Unrecognized chain ID') || 
          switchError.message.includes('chain must be added')) {
        console.log('Scroll network not found, attempting to add it...');
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: chainIdHex,
              chainName: SCROLL_CONFIG.NETWORK.NAME,
              nativeCurrency: {
                name: SCROLL_CONFIG.NETWORK.CURRENCY.NAME,
                symbol: SCROLL_CONFIG.NETWORK.CURRENCY.SYMBOL,
                decimals: SCROLL_CONFIG.NETWORK.CURRENCY.DECIMALS
              },
              rpcUrls: [SCROLL_CONFIG.NETWORK.RPC_URL],
              blockExplorerUrls: [SCROLL_CONFIG.NETWORK.BLOCK_EXPLORER_URL]
            }]
          });
          console.log('Successfully added Scroll network');
          return true;
        } catch (addError) {
          console.error('Error adding Scroll network:', addError);
          throw new Error(`Failed to add Scroll network: ${addError.message}`);
        }
      }
      console.error('Error switching to Scroll network:', switchError);
      throw new Error(`Failed to switch to Scroll network: ${switchError.message}`);
    }
  } catch (error) {
    console.error('Error in switchToScroll:', error);
    throw error;
  }
};

// Make a donation
export const donate = async (amount, message = '') => {
  if (!contract || !account) {
    await initWeb3();
  }
  
  try {
    const amountInWei = web3.utils.toWei(amount.toString(), 'ether');
    
    const result = await contract.methods.donate(message).send({
      from: account,
      value: amountInWei
    });
    
    return result;
  } catch (error) {
    console.error("Error making donation:", error);
    throw error;
  }
};

// Donate to a specific charity
export const donateToCharity = async (charityId, amount, message) => {
  try {
    console.log('Starting blockchain donation...', { charityId, amount, message });
    
    // Check if wallet is connected
    if (!window.ethereum) {
      throw new Error('Please install MetaMask to make a blockchain donation');
    }

    // Initialize Web3
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    
    if (!account) {
      throw new Error('No account found. Please connect your wallet');
    }
    
    console.log('Connected account:', account);

    // Convert amount to wei
    const amountInWei = web3.utils.toWei(amount.toString(), 'ether');
    console.log('Amount in wei:', amountInWei);

    // Get contract instance
    const contract = await getContractInstance();
    if (!contract) {
      throw new Error('Failed to initialize contract');
    }
    
    console.log('Contract methods:', contract.methods);

    // Call donate with the correct parameter order
    console.log('Calling donate(uint256,string) with params:', {
      charityId: Number(charityId),
      message: message || '',
      value: amountInWei
    });

    const result = await contract.methods.donate(
      Number(charityId),
      message || ''
    ).send({
      from: account,
      value: amountInWei
    });

    console.log('Transaction successful:', result);

    return {
      success: true,
      transactionHash: result.transactionHash,
      from: result.from,
      to: result.to,
      blockNumber: result.blockNumber,
      gasUsed: result.gasUsed,
      status: result.status,
      events: result.events
    };
  } catch (error) {
    console.error('Error in donateToCharity:', error);
    throw error;
  }
};

// Execute a transaction
export const executeTransaction = async (recipient, amount, description = '') => {
  if (!contract || !account) {
    await initWeb3();
  }
  
  try {
    const amountInWei = web3.utils.toWei(amount.toString(), 'ether');
    
    const result = await contract.methods.executeTransaction(recipient, description).send({
      from: account,
      value: amountInWei
    });
    
    return result;
  } catch (error) {
    console.error("Error executing transaction:", error);
    throw error;
  }
};

// Get all donations
export const getAllDonations = async () => {
  if (!contract) {
    await initWeb3();
  }
  
  try {
    const count = await contract.methods.getDonationCount().call();
    const donations = [];
    
    // Get donations in batches of 50 to avoid gas limits
    const batchSize = 50;
    for (let i = 0; i < count; i += batchSize) {
      const batchCount = Math.min(batchSize, count - i);
      const batch = await contract.methods.getDonationBatch(i, batchCount).call();
      
      for (let j = 0; j < batch.donors.length; j++) {
        donations.push({
          donor: batch.donors[j],
          amount: web3.utils.fromWei(batch.amounts[j], 'ether'),
          timestamp: new Date(batch.timestamps[j] * 1000),
          message: batch.messages[j]
        });
      }
    }
    
    return donations;
  } catch (error) {
    console.error("Error getting donations:", error);
    throw error;
  }
};

// Get all transactions
export const getAllTransactions = async () => {
  if (!contract) {
    await initWeb3();
  }
  
  try {
    const count = await contract.methods.getTransactionCount().call();
    const transactions = [];
    
    // Get transactions in batches of 50 to avoid gas limits
    const batchSize = 50;
    for (let i = 0; i < count; i += batchSize) {
      const batchCount = Math.min(batchSize, count - i);
      const batch = await contract.methods.getTransactionBatch(i, batchCount).call();
      
      for (let j = 0; j < batch.senders.length; j++) {
        transactions.push({
          sender: batch.senders[j],
          recipient: batch.recipients[j],
          amount: web3.utils.fromWei(batch.amounts[j], 'ether'),
          timestamp: new Date(batch.timestamps[j] * 1000),
          description: batch.descriptions[j]
        });
      }
    }
    
    return transactions;
  } catch (error) {
    console.error("Error getting transactions:", error);
    throw error;
  }
};

// Get contract balance
export const getContractBalance = async () => {
  if (!contract) {
    await initWeb3();
  }
  
  try {
    const balanceWei = await contract.methods.getContractBalance().call();
    return web3.utils.fromWei(balanceWei, 'ether');
  } catch (error) {
    console.error("Error getting contract balance:", error);
    throw error;
  }
};

// Check if wallet is connected
export const isWalletConnected = () => {
  return !!account;
};

// Get current account
export const getCurrentAccount = () => {
  return account;
};

// Listen for account changes
export const setupAccountChangeListener = (callback) => {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      account = accounts[0];
      callback(account);
    });
  }
};

// Add this function to your contractInteraction.js file
export const getContractInstance = async () => {
  if (!contractInstance) {
    console.warn('Contract not initialized. Attempting to initialize Web3...');
    try {
      await initWeb3();
      return contractInstance;
    } catch (error) {
      console.error('Failed to initialize contract:', error);
      return null;
    }
  }
  return contractInstance;
}; 