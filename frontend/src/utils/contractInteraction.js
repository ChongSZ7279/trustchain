import Web3 from 'web3';
import { DonationContractABI, DonationContractAddress } from '../contracts/DonationContractABI';

let web3;
let contract;
let account;

// Initialize Web3 and contract
export const initWeb3 = async () => {
  if (window.ethereum) {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3 = new Web3(window.ethereum);
      
      // Get user account
      const accounts = await web3.eth.getAccounts();
      account = accounts[0];
      
      // Initialize contract with the ABI and address
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      console.log("Using contract address:", contractAddress);
      
      if (!contractAddress) {
        throw new Error("Contract address is not defined in environment variables");
      }
      
      contract = new web3.eth.Contract(
        DonationContractABI,
        contractAddress
      );
      
      return { web3, contract, account };
    } catch (error) {
      console.error("Error initializing Web3:", error);
      throw error;
    }
  } else {
    throw new Error('Please install MetaMask or another Web3 provider');
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
export const donateToCharity = async (charityId, amount, message = '') => {
  if (!contract || !account) {
    await initWeb3();
  }
  
  try {
    const amountInWei = web3.utils.toWei(amount.toString(), 'ether');
    
    const result = await contract.methods.donateToCharity(charityId, message).send({
      from: account,
      value: amountInWei
    });
    
    return result;
  } catch (error) {
    console.error("Error making charity donation:", error);
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