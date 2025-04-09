import axios from 'axios';

// Function to test donation API directly
export const testDonationAPI = async (charityId) => {
  try {
    console.log("Testing donation API for charity ID:", charityId);
    
    // Get the auth token
    const token = localStorage.getItem('token');
    
    // Test without auth
    const response = await axios({
      method: 'post',
      url: `http://localhost:8000/api/blockchain-donations-noauth`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        charity_id: charityId,
        amount: 0.01,
        transaction_hash: `test-${Date.now()}`,
        message: 'Test donation (no auth)'
      }
    });
    
    console.log("Test donation successful:", response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Test donation failed:", error);
    console.log("Error response:", error.response?.data);
    return {
      success: false,
      error: error.message,
      details: error.response?.data
    };
  }
}; 