import axios from 'axios';
import { donateToCharity } from '../utils/contractInteraction';
import API_BASE_URL from '../config/api';
import { ethers } from 'ethers';
import DonationContract from '../contracts/DonationContract.json';
import { sanitizeBigInt, safeStringify } from '../utils/serializationHelper';


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
export const processDonation = async (charityId, amount, message) => {
  try {
    console.log('Processing donation for charity:', charityId, 'amount:', amount);

    // Validate inputs before proceeding
    if (!charityId || isNaN(parseInt(charityId))) {
      throw new Error('Invalid charity ID');
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      throw new Error('Invalid donation amount');
    }

    // Make the blockchain donation
    const blockchainResult = await donateToCharity(charityId, amount, message);
    console.log('Blockchain donation result:', blockchainResult);

    // Sanitize the blockchain data to handle BigInt values
    const sanitizedBlockchainData = sanitizeBigInt(blockchainResult);
    console.log('Sanitized blockchain data:', sanitizedBlockchainData);

    try {
      // Get the current user from localStorage (adjust based on your auth implementation)
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      console.log('Current user data:', user);

      // Prepare donation data
      const donationData = {
        user_id: user?.ic_number || user?.id || 'anonymous', // Fallback to anonymous if no user ID
        transaction_hash: sanitizedBlockchainData.transactionHash,
        amount: parseFloat(amount),
        currency_type: 'ETH',
        cause_id: parseInt(charityId),
        status: 'completed', // Set to completed so impact section is visible
        donor_message: message || null,
        is_anonymous: !user?.ic_number, // Automatically mark as anonymous if no user
        smart_contract_data: safeStringify(sanitizedBlockchainData)
      };

      console.log('Sending donation data to backend:', donationData);

      // Get the base URL from the API_BASE_URL import or use the default
      const baseUrl = API_BASE_URL || '';

      let response;
      try {
        // First try the main endpoint
        console.log(`Trying main donation endpoint: ${baseUrl}/donations`);
        response = await axios.post(`${baseUrl}/donations`, donationData, {
          headers: {
            ...token ? { 'Authorization': `Bearer ${token}` } : {},
            'Content-Type': 'application/json'
          }
        });
      } catch (firstError) {
        console.warn('First endpoint attempt failed:', firstError.message);

        try {
          // Try alternate endpoint format
          console.log(`Trying alternate endpoint: ${baseUrl}/api/donations`);
          response = await axios.post(`${baseUrl}/api/donations`, donationData, {
            headers: {
              ...token ? { 'Authorization': `Bearer ${token}` } : {},
              'Content-Type': 'application/json'
            }
          });
        } catch (secondError) {
          console.warn('Second endpoint attempt failed:', secondError.message);

          try {
            // Try blockchain-specific endpoint
            console.log(`Trying blockchain endpoint: ${baseUrl}/blockchain-donations-noauth`);
            const blockchainData = {
              charity_id: parseInt(charityId),
              amount: parseFloat(amount),
              transaction_hash: sanitizedBlockchainData.transactionHash,
              message: message || ''
            };

            console.log('Sending blockchain-specific data:', blockchainData);

            response = await axios.post(`${baseUrl}/blockchain-donations-noauth`, blockchainData, {
              headers: {
                ...token ? { 'Authorization': `Bearer ${token}` } : {},
                'Content-Type': 'application/json'
              }
            });
          } catch (thirdError) {
            console.warn('Third endpoint attempt failed:', thirdError.message);
            console.warn('Error details:', thirdError.response?.data);

            // Last attempt - use the recordBlockchainDonation function
            try {
              console.log('Trying recordBlockchainDonation function as last resort');
              const recordResult = await recordBlockchainDonation(
                parseInt(charityId),
                parseFloat(amount),
                sanitizedBlockchainData.transactionHash,
                message
              );

              if (recordResult.success) {
                response = { data: recordResult.data };
                console.log('recordBlockchainDonation succeeded:', recordResult);
              } else {
                console.error('recordBlockchainDonation failed:', recordResult.error);
                throw new Error(recordResult.error);
              }
            } catch (finalError) {
              console.error('All endpoint attempts failed');
              throw finalError;
            }
          }
        }
      }

      console.log('Backend response:', response.data);

      // Store donation info in localStorage for anonymous users
      try {
        const donationInfo = {
          id: response.data.id || response.data.donation_id,
          transactionHash: sanitizedBlockchainData.transactionHash,
          amount: parseFloat(amount),
          charityId: parseInt(charityId),
          message: message || '',
          timestamp: new Date().toISOString()
        };

        // Get existing donations or initialize empty array
        const existingDonations = JSON.parse(localStorage.getItem('recentDonations') || '[]');

        // Add new donation to the beginning of the array
        existingDonations.unshift(donationInfo);

        // Keep only the 10 most recent donations
        const recentDonations = existingDonations.slice(0, 10);

        // Save back to localStorage
        localStorage.setItem('recentDonations', JSON.stringify(recentDonations));
        console.log('Saved donation info to localStorage:', donationInfo);
      } catch (storageError) {
        console.warn('Failed to save donation to localStorage:', storageError);
      }

      return {
        success: true,
        transactionHash: sanitizedBlockchainData.transactionHash,
        databaseId: response.data.id || response.data.donation_id,
        savedToDatabase: true,
        isBlockchain: true,
        blockchainData: sanitizedBlockchainData,
        amount,
        charityId
      };
    } catch (dbError) {
      console.error('Failed to record blockchain donation in database:', dbError);
      console.error('Database error details:', dbError.response?.data);

      // Return partial success - blockchain transaction worked but database save failed
      return {
        success: true,
        transactionHash: sanitizedBlockchainData.transactionHash,
        databaseError: true,
        savedToDatabase: false,
        error: dbError.message || 'Failed to save to database',
        errorDetails: dbError.response?.data,
        isBlockchain: true,
        blockchainData: sanitizedBlockchainData,
        amount,
        charityId
      };
    }
  } catch (error) {
    console.error('Error processing donation:', error);
    throw error;
  }
};

// Get all donations for a charity
export const getCharityDonations = async (charityId) => {
  try {
    try {
      // Try authenticated endpoint first
      const response = await api.get(`/charities/${charityId}/donations`);
      return response.data.data || response.data;
    } catch (authError) {
      // If unauthorized or error, try public endpoint
      console.log('Error with authenticated endpoint, trying public endpoint');
      try {
        const publicResponse = await axios.get(`${API_BASE_URL}/public/charities/${charityId}/donations`);
        return publicResponse.data.data || publicResponse.data;
      } catch (publicError) {
        console.warn('Public endpoint failed:', publicError.message);

        // Try blockchain-specific endpoint
        try {
          const blockchainResponse = await axios.get(`${API_BASE_URL}/blockchain-donations/${charityId}`);
          return blockchainResponse.data.data || blockchainResponse.data;
        } catch (blockchainError) {
          console.warn('Blockchain endpoint failed:', blockchainError.message);
          // Return empty array instead of throwing error
          return [];
        }
      }
    }
  } catch (error) {
    console.error('Error fetching charity donations:', error);
    // Return empty array instead of throwing error
    return [];
  }
};

// When recording the blockchain donation, make sure you're sending the right data
const recordBlockchainDonation = async (charityId, amount, transactionHash, message = '') => {
  try {
    console.log("Recording blockchain donation using dedicated endpoint");
    const token = localStorage.getItem('token');

    // Ensure charity_id is using the correct parameter name and format
    const donationData = {
      charity_id: parseInt(charityId),
      amount: parseFloat(amount),
      transaction_hash: transactionHash,
      message: message || '',
      status: 'completed', // Set to completed so impact section is visible
      is_anonymous: true // Explicitly set to true to help with constraints
    };

    console.log("Sending blockchain donation data:", donationData);

    let response;
    let endpoint = `${API_BASE_URL}/direct-donation`;

    // Try using the direct donation endpoint first (most reliable)
    try {
      console.log(`Attempting direct donation at: ${endpoint}`);
      response = await axios({
        method: 'post',
        url: endpoint,
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        },
        data: donationData
      });
    } catch (directError) {
      console.warn('Direct donation attempt failed:', directError.message);
      console.warn('Error details:', directError.response?.data);

      // Try the simplified endpoint next
      try {
        endpoint = `${API_BASE_URL}/simple-donation`;
        console.log(`Trying simplified donation endpoint: ${endpoint}`);
        response = await axios({
          method: 'post',
          url: endpoint,
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            'Content-Type': 'application/json'
          },
          data: donationData
        });
      } catch (simplifiedError) {
        console.error('Simplified donation endpoint failed:', simplifiedError.message);

        // Try the regular blockchain donation endpoint as a last resort
        try {
          endpoint = `${API_BASE_URL}/blockchain-donations-noauth`;
          console.log(`Trying regular blockchain endpoint: ${endpoint}`);
          response = await axios({
            method: 'post',
            url: endpoint,
            headers: {
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
              'Content-Type': 'application/json'
            },
            data: donationData
          });
        } catch (blockchainError) {
          console.error('All donation endpoints failed');
          throw blockchainError;
        }
      }
    }

    console.log("Blockchain donation recording response:", response.data);
    return {
      success: true,
      data: response.data,
      donationId: response.data.donation_id || response.data.id
    };
  } catch (error) {
    console.error('Blockchain donation recording error:', error);
    console.log('Error details:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.message || 'Failed to record donation in database'
    };
  }
};

export const verifyTransaction = async (transactionHash) => {
  try {
    // Import the verification function from blockchainUtils
    const { verifyTransaction: verifyTx } = await import('../utils/blockchainUtils');

    console.log('Verifying transaction hash:', transactionHash);

    // Check if it's a mock transaction hash
    if (transactionHash.startsWith('0x') && transactionHash.length !== 66) {
      console.warn('This appears to be a mock transaction hash that will not be found on Scrollscan');
      return {
        success: false,
        verified: false,
        isMockHash: true,
        message: 'This appears to be a test/mock transaction hash that does not exist on the blockchain',
        scrollscanUrl: `https://sepolia.scrollscan.com/tx/${transactionHash}`
      };
    }

    // Use the blockchain utils verification function
    const result = await verifyTx(transactionHash);
    console.log('Transaction verification result:', result);

    return {
      ...result,
      success: result.verified, // Ensure both success and verified properties exist
      verified: result.verified,
      scrollscanUrl: `https://sepolia.scrollscan.com/tx/${transactionHash}`
    };
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return {
      success: false,
      verified: false,
      error: error.message,
      message: error.message,
      scrollscanUrl: `https://sepolia.scrollscan.com/tx/${transactionHash}`
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

// Get donation details
export const getDonationDetails = async (donationId) => {
  try {
    console.log('Fetching donation details for ID:', donationId);

    // Special handling for test donations
    if (donationId === 'test' || donationId.toString().startsWith('test_')) {
      console.log('This is a test donation, returning mock data');
      return {
        id: donationId,
        user_id: 'test_user',
        amount: 0.1,
        currency_type: 'SCROLL',
        cause_id: 1,
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        transaction_hash: 'test_tx_' + Date.now(),
        donor_message: 'This is a test donation',
        is_anonymous: false,
        payment_method: 'test_payment',
        test_mode: true
      };
    }

    try {
      // Try to get the donation details with authentication
      const response = await api.get(`/donations/${donationId}`);
      console.log('Donation details response:', response.data);
      return response.data.donation || response.data;
    } catch (authError) {
      // If unauthorized, try the public endpoint
      if (authError.response?.status === 401) {
        console.log('Unauthorized, trying public donation endpoint');
        try {
          const publicResponse = await axios.get(`${API_BASE_URL}/public/donations/${donationId}`);
          console.log('Public donation details response:', publicResponse.data);
          return publicResponse.data.donation || publicResponse.data;
        } catch (publicError) {
          console.warn('Public donation endpoint failed:', publicError.message);

          // Try to get the donation amount from the blockchain
          try {
            console.log('Trying to get donation details from blockchain');
            // Check if we have a transaction hash in localStorage
            const recentDonations = JSON.parse(localStorage.getItem('recentDonations') || '[]');
            const donationInfo = recentDonations.find(d => d.id.toString() === donationId.toString());

            console.log('Found donation info in localStorage:', donationInfo);

            // Return donation object with actual amount if available
            return {
              id: donationId,
              user_id: 'anonymous',
              amount: donationInfo?.amount || 0,
              currency_type: 'SCROLL',
              cause_id: donationInfo?.charityId || 0,
              status: 'completed',
              created_at: donationInfo?.timestamp || new Date().toISOString(),
              updated_at: donationInfo?.timestamp || new Date().toISOString(),
              transaction_hash: donationInfo?.transactionHash || '',
              donor_message: donationInfo?.message || '',
              is_anonymous: true,
              payment_method: 'blockchain',
              anonymous_donation: true
            };
          } catch (blockchainError) {
            console.warn('Error getting donation from blockchain:', blockchainError);
            // Return a generic donation object for anonymous donations
            return {
              id: donationId,
              user_id: 'anonymous',
              amount: 0, // We don't know the amount
              currency_type: 'SCROLL',
              cause_id: 0, // We don't know the charity
              status: 'completed',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              transaction_hash: '',
              donor_message: '',
              is_anonymous: true,
              payment_method: 'blockchain',
              anonymous_donation: true
            };
          }
        }
      }
      throw authError;
    }
  } catch (error) {
    console.error('Error fetching donation details:', error);
    // Try to get donation info from localStorage as a last resort
    try {
      const recentDonations = JSON.parse(localStorage.getItem('recentDonations') || '[]');
      const donationInfo = recentDonations.find(d => d.id.toString() === donationId.toString());

      if (donationInfo) {
        console.log('Found donation in localStorage as last resort:', donationInfo);
        return {
          id: donationId,
          user_id: 'anonymous',
          amount: donationInfo.amount || 0,
          currency_type: 'SCROLL',
          cause_id: donationInfo.charityId || 0,
          status: 'completed',
          created_at: donationInfo.timestamp || new Date().toISOString(),
          updated_at: donationInfo.timestamp || new Date().toISOString(),
          transaction_hash: donationInfo.transactionHash || '',
          donor_message: donationInfo.message || '',
          is_anonymous: true,
          payment_method: 'blockchain',
          anonymous_donation: true,
          error: error.message
        };
      }
    } catch (localStorageError) {
      console.warn('Error reading from localStorage:', localStorageError);
    }

    // Return a generic donation object if all else fails
    return {
      id: donationId,
      user_id: 'anonymous',
      amount: 0,
      currency_type: 'SCROLL',
      cause_id: 0,
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      transaction_hash: '',
      donor_message: '',
      is_anonymous: true,
      payment_method: 'blockchain',
      anonymous_donation: true,
      error: error.message
    };
  }
};