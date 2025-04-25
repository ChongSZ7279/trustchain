import axios from 'axios';

/**
 * Get details for a specific transaction
 * @param {string|number} id - The transaction ID
 * @returns {Promise<Object>} Transaction details
 */
export const getTransactionDetails = async (id) => {
  try {
    const response = await axios.get(`/transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      switch (error.response.status) {
        case 404:
          throw new Error('Transaction not found. It may have been deleted.');
        case 403:
          throw new Error('You do not have permission to view this transaction.');
        case 401:
          throw new Error('Please log in to view this transaction.');
        default:
          throw new Error(error.response.data.message || 'Failed to fetch transaction details.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('Unable to connect to the server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error('An unexpected error occurred while fetching transaction details.');
    }
  }
};

/**
 * Verify a transaction
 * @param {string|number} id - The transaction ID
 * @param {Object} verificationData - Data needed for verification
 * @returns {Promise<Object>} Updated transaction data
 */
export const verifyTransaction = async (id, verificationData) => {
  try {
    const response = await axios.post(`/api/transactions/${id}/verify`, verificationData);
    return response.data;
  } catch (error) {
    console.error('Error verifying transaction:', error);
    throw error;
  }
};

/**
 * Get transaction history
 * @param {Object} params - Query parameters for filtering transactions
 * @returns {Promise<Array>} List of transactions
 */
export const getTransactionHistory = async (params = {}) => {
  try {
    const response = await axios.get('/api/transactions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
};

/**
 * Update transaction status
 * @param {string|number} id - The transaction ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated transaction data
 */
export const updateTransactionStatus = async (id, status) => {
  try {
    const response = await axios.patch(`/api/transactions/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
};

/**
 * Delete a transaction
 * @param {string|number} id - The transaction ID
 * @returns {Promise<void>}
 */
export const deleteTransaction = async (id) => {
  try {
    await axios.delete(`/api/transactions/${id}`);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}; 