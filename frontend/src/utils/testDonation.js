import axios from 'axios';
import API_BASE_URL from '../config/api';

// Function to test donation API directly
export const testDonationAPI = async (charityId) => {
  try {
    console.log("Testing donation API for charity ID:", charityId);
    
    // Get the auth token
    const token = localStorage.getItem('token');
    
    // Test with auth
    const response = await axios({
      method: 'post',
      url: `${API_BASE_URL}/charities/${charityId}/donations/test`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        amount: 0.01,
        payment_method: 'api',
        donor_message: 'Test donation'
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