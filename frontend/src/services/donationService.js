import axios from 'axios';
import { donateToCharity } from '../utils/contractInteraction';
import API_BASE_URL from '../config/api';

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
          url: `http://localhost:8000/api/blockchain-donations`,
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