import axios from 'axios';
import { donateToCharity } from '../utils/contractInteraction';
import API_BASE_URL from '../config/api';
import { ethers } from 'ethers';
import DonationContract from '../contracts/DonationContract.json';

// Set up axios with base URL
const api = axios.create({
  baseURL: API_BASE_URL
});

// Set up axios interceptor to include auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Update network configuration to use Sepolia testnet
const getEthereumContract = async () => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    // Contract deployed on Sepolia testnet
    const contractAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Replace with your deployed contract address on testnet
    
    const donationContract = new ethers.Contract(
      contractAddress,
      DonationContract.abi,
      signer
    );
    
    return donationContract;
  } catch (error) {
    console.error("Error getting Ethereum contract:", error);
    throw error;
  }
};

export const connectWallet = async () => {
  try {
    if (!window.ethereum) throw new Error("Please install MetaMask");
    
    // Request account access and switch to Sepolia testnet
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: "0xaa36a7", // 11155111 in hex (Sepolia)
        chainName: "Sepolia Testnet",
        nativeCurrency: {
          name: "Sepolia ETH",
          symbol: "ETH",
          decimals: 18
        },
        rpcUrls: [`https://sepolia.infura.io/v3/${import.meta.env.REACT_APP_INFURA_PROJECT_ID || '7b6b2b41ec7246db9a517eef9aa00ae8'}`],
        blockExplorerUrls: ["https://sepolia.etherscan.io/"]
      }]
    });
    
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    return accounts[0];
  } catch (error) {
    console.error("Error connecting to wallet:", error);
    throw error;
  }
};

// Process donation through both blockchain and MySQL
export const processDonation = async (charityId, amount, message = '') => {
  try {
    // Check if charityId is valid
    if (!charityId) {
      console.error("Missing charity ID in processDonation");
      return { success: false, error: "Missing charity ID" };
    }
    
    console.log(`Processing donation: ${amount} ETH to charity ${charityId}`);
    
    // First attempt blockchain donation
    const blockchainResult = await donateToCharity(charityId, amount, message);
    console.log("Blockchain donation result:", blockchainResult);
    
    if (blockchainResult.success) {
      // If blockchain donation succeeds, record it in MySQL using the new endpoint
      try {
        console.log("Recording blockchain donation in database for charity ID:", charityId);
        
        // Use the new blockchain-donations endpoint
        const token = localStorage.getItem('token');
        const apiResponse = await axios({
          method: 'post',
          url: `${API_BASE_URL}/blockchain-donations`,  // Make sure this uses your API_BASE_URL
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: {
            charity_id: charityId,
            amount: amount,
            transaction_hash: blockchainResult.transactionHash,
            message: message || ''
          }
        });
        
        console.log("Database response:", apiResponse.data);
        
        return {
          success: true,
          data: apiResponse.data,
          transactionHash: blockchainResult.transactionHash,
          isBlockchain: true
        };
      } catch (apiError) {
        console.error('Error recording blockchain donation in database:', apiError);
        console.log("API error response:", apiError.response?.data);
        
        // Still return success since blockchain transaction worked
        return {
          success: true,
          transactionHash: blockchainResult.transactionHash,
          isBlockchain: true,
          databaseError: true
        };
      }
    } else {
      // If blockchain fails, try regular API donation
      console.log("Blockchain donation failed, trying API fallback...");
      return await processDonationViaAPI(charityId, amount, message);
    }
  } catch (error) {
    console.error('Donation processing error:', error);
    return { success: false, error: error.message || 'Error processing donation' };
  }
};

// Fallback API-only donation method
export const processDonationViaAPI = async (charityId, amount, message = '') => {
  try {
    const response = await axios.post(`http://localhost:8000/api/charities/${charityId}/donations`, {
      amount,
      message,
      blockchain_verified: false
    });
    
    return {
      success: true,
      data: response.data,
      transactionHash: response.data.donation?.id || `api-${Date.now()}`,
      isBlockchain: false
    };
  } catch (error) {
    console.error('API donation error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to process donation via API'
    };
  }
};

// Get all donations for a charity
export const getCharityDonations = async (charityId) => {
  try {
    const response = await axios.get(`http://localhost:8000/api/charities/${charityId}/donations`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching donations:', error);
    throw error;
  }
};

// When recording the blockchain donation, make sure you're sending the right data
const recordBlockchainDonation = async (charityId, amount, transactionHash, message = '') => {
  try {
    const response = await api.post('/api/blockchain-donations', {
      charity_id: charityId,
      amount: amount,
      transaction_hash: transactionHash,
      message: message
    });
    
    return {
      success: true,
      donationId: response.data.donation_id
    };
  } catch (error) {
    console.error('API error response:', error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to record donation in database'
    };
  }
};

export const verifyTransaction = async (transactionHash) => {
  try {
    const web3 = await initWeb3();
    const transaction = await web3.eth.getTransaction(transactionHash);
    const receipt = await web3.eth.getTransactionReceipt(transactionHash);
    
    return {
      success: true,
      transaction,
      receipt,
      confirmed: receipt && receipt.status === 1n,
      blockNumber: receipt ? receipt.blockNumber : null
    };
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const makeDonation = async (organizationId, amount, message) => {
  try {
    const contract = await getEthereumContract();
    const ethAmount = ethers.utils.parseEther(amount.toString());
    
    const transaction = await contract.donate(organizationId, message, {
      value: ethAmount,
      gasLimit: 300000 // Adjust gas limit as needed for testnet
    });
    
    return transaction;
  } catch (error) {
    console.error("Error making donation:", error);
    throw error;
  }
};

const initWeb3 = async () => {
  try {
    // For modern dapp browsers
    if (window.ethereum) {
      const Web3 = await import('web3');
      const web3Instance = new Web3.default(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        return web3Instance;
      } catch (error) {
        console.error("User denied account access");
        throw new Error("User denied account access");
      }
    }
    // Legacy dapp browsers
    else if (window.web3) {
      const Web3 = await import('web3');
      return new Web3.default(window.web3.currentProvider);
    }
    // Non-dapp browsers
    else {
      const provider = new ethers.providers.JsonRpcProvider(
        `https://sepolia.infura.io/v3/${import.meta.env.REACT_APP_INFURA_PROJECT_ID || '7b6b2b41ec7246db9a517eef9aa00ae8'}`
      );
      const Web3 = await import('web3');
      return new Web3.default(provider);
    }
  } catch (error) {
    console.error("Error initializing Web3:", error);
    throw error;
  }
}; 