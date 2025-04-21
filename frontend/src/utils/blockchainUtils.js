import Web3 from 'web3';

// Function to get the appropriate RPC URL for Scroll Sepolia
const getScrollRpcUrl = () => {
  // First try the environment variable
  const envRpcUrl = import.meta.env.VITE_SCROLL_RPC_URL;
  if (envRpcUrl) return envRpcUrl;

  // Fallback to the default Scroll Sepolia RPC URL
  return 'https://sepolia-rpc.scroll.io';
};

// Function to check if a transaction hash is a mock/fake hash
const isMockTransactionHash = (hash) => {
  // Check if it's a hash generated from MD5 (32 characters after 0x)
  if (hash && hash.startsWith('0x') && hash.length === 34) {
    return true;
  }

  // Real Ethereum transaction hashes are 0x + 64 hex characters
  return !(hash && hash.startsWith('0x') && hash.length === 66 && /^0x[0-9a-fA-F]{64}$/.test(hash));
};

// Function to verify a transaction on the blockchain
export const verifyTransaction = async (transactionHash) => {
  try {
    // Check if it's a mock transaction hash
    if (isMockTransactionHash(transactionHash)) {
      console.warn('Mock transaction hash detected:', transactionHash);
      return {
        verified: false,
        message: 'This appears to be a test/mock transaction hash that does not exist on the blockchain',
        isMockHash: true
      };
    }

    // Connect to Scroll Sepolia RPC
    const rpcUrl = getScrollRpcUrl();
    console.log('Connecting to Scroll Sepolia RPC:', rpcUrl);
    const web3 = new Web3(window.ethereum || rpcUrl);

    // Get transaction details
    console.log('Fetching transaction details for hash:', transactionHash);
    const transaction = await web3.eth.getTransaction(transactionHash);

    if (!transaction) {
      console.warn('Transaction not found on blockchain:', transactionHash);
      return { verified: false, message: 'Transaction not found on the blockchain' };
    }

    // Get transaction receipt to check if it was successful
    const receipt = await web3.eth.getTransactionReceipt(transactionHash);

    if (!receipt) {
      return { verified: false, message: 'Transaction is pending' };
    }

    // Check if transaction was successful (status = 1)
    if (receipt.status) {
      console.log('Transaction verified successfully:', transactionHash);
      return {
        verified: true,
        message: 'Transaction verified on blockchain',
        details: {
          from: transaction.from,
          to: transaction.to,
          value: web3.utils.fromWei(transaction.value, 'ether'),
          blockNumber: transaction.blockNumber,
          gasUsed: receipt.gasUsed,
          scrollscanUrl: `https://sepolia.scrollscan.com/tx/${transactionHash}`
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

// Function to get a Scrollscan URL for a transaction hash
export const getScrollscanUrl = (transactionHash) => {
  if (!transactionHash) return null;
  return `https://sepolia.scrollscan.com/tx/${transactionHash}`;
};
