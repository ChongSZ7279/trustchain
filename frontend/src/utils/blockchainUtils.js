import Web3 from 'web3';

// Function to verify a transaction on the blockchain
export const verifyTransaction = async (transactionHash) => {
  try {
    // Connect to your blockchain provider
    const web3 = new Web3(window.ethereum || 'http://localhost:8545');
    
    // Get transaction details
    const transaction = await web3.eth.getTransaction(transactionHash);
    
    if (!transaction) {
      return { verified: false, message: 'Transaction not found on the blockchain' };
    }
    
    // Get transaction receipt to check if it was successful
    const receipt = await web3.eth.getTransactionReceipt(transactionHash);
    
    if (!receipt) {
      return { verified: false, message: 'Transaction is pending' };
    }
    
    // Check if transaction was successful (status = 1)
    if (receipt.status) {
      return { 
        verified: true, 
        message: 'Transaction verified on blockchain',
        details: {
          from: transaction.from,
          to: transaction.to,
          value: web3.utils.fromWei(transaction.value, 'ether'),
          blockNumber: transaction.blockNumber,
          gasUsed: receipt.gasUsed
        }
      };
    } else {
      return { verified: false, message: 'Transaction failed on the blockchain' };
    }
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return { verified: false, message: error.message };
  }
}; 