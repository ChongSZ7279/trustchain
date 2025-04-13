import axios from 'axios';
import { sanitizeBigInt, safeStringify } from './serializationHelper';

/**
 * Test function to verify the donation API and BigInt serialization
 * @param {string} charityId - The ID of the charity
 * @returns {Promise} - Test result
 */
export const testDonationAPI = async (charityId) => {
  try {
    console.log("Testing donation API for charity ID:", charityId);
    
    // Create a mock blockchain result with a BigInt value
    const mockBlockchainResult = {
      success: true,
      transactionHash: "0x" + Math.random().toString(16).substring(2, 34) + Date.now().toString(16),
      from: "0x" + Math.random().toString(16).substring(2, 42),
      to: "0x" + Math.random().toString(16).substring(2, 42),
      blockNumber: BigInt(Math.floor(Math.random() * 10000000)),
      gasUsed: BigInt(Math.floor(Math.random() * 1000000)),
      status: true,
      events: {
        DonationMade: {
          returnValues: {
            amount: BigInt(Math.floor(Math.random() * 1000000000000000))
          }
        }
      }
    };
    
    console.log("Original mock data with BigInt:", mockBlockchainResult);
    
    // Test the sanitizeBigInt function
    const sanitizedData = sanitizeBigInt(mockBlockchainResult);
    console.log("Sanitized data:", sanitizedData);
    
    // Test the safeStringify function
    const jsonString = safeStringify(mockBlockchainResult);
    console.log("JSON string with BigInt handled:", jsonString);
    
    // Test parsing the JSON string back
    const parsedData = JSON.parse(jsonString);
    console.log("Parsed data from safe JSON:", parsedData);
    
    // Try to use the API with the test data
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user) {
        console.warn("No user found in localStorage, test might fail");
      }
      
      const testDonationData = {
        user_id: user?.ic_number || user?.id || "test_user",
        transaction_hash: sanitizedData.transactionHash,
        amount: 0.0001,
        currency_type: 'ETH',
        cause_id: parseInt(charityId),
        status: 'pending',
        donor_message: "This is a test donation",
        is_anonymous: false,
        smart_contract_data: safeStringify(sanitizedData)
      };
      
      console.log("Sending test donation data to backend:", testDonationData);
      
      const response = await axios.post('/test-donation', testDonationData, {
        headers: {
          'Authorization': `Bearer ${token || 'test_token'}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Test API response:", response.data);
      
      return {
        success: true,
        message: "Donation API test successful",
        details: response.data
      };
    } catch (apiError) {
      console.error("API test failed:", apiError);
      return {
        success: false,
        error: apiError.message,
        details: apiError.response?.data
      };
    }
  } catch (error) {
    console.error("Error in test donation:", error);
    return {
      success: false,
      error: error.message
    };
  }
}; 