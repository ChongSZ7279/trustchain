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
    // Clean the hash - remove any whitespace and ensure it's properly formatted
    let cleanHash = transactionHash.trim();

    // Ensure the hash has the 0x prefix
    if (!cleanHash.startsWith('0x')) {
      cleanHash = '0x' + cleanHash;
    }

    // Check if it's a mock transaction hash
    if (isMockTransactionHash(cleanHash)) {
      console.warn('Mock transaction hash detected:', cleanHash);
      return {
        verified: false,
        message: 'This appears to be a test/mock transaction hash that does not exist on the blockchain',
        isMockHash: true
      };
    }

    // Connect to Scroll Sepolia RPC
    const rpcUrl = getScrollRpcUrl();
    console.log('Connecting to Scroll Sepolia RPC:', rpcUrl);

    // Try to use window.ethereum if available, otherwise use the RPC URL
    let web3;
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        web3 = new Web3(window.ethereum);
      } catch (err) {
        console.warn('User denied account access or MetaMask not available, falling back to RPC');
        web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
      }
    } else {
      web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
    }

    // Get transaction details
    console.log('Fetching transaction details for hash:', cleanHash);
    const transaction = await web3.eth.getTransaction(cleanHash);

    if (!transaction) {
      console.warn('Transaction not found on blockchain:', cleanHash);

      // Try to check if the transaction exists on Scrollscan directly
      try {
        const response = await fetch(`https://sepolia.scrollscan.com/api?module=transaction&action=gettxinfo&txhash=${cleanHash}`);
        const data = await response.json();

        if (data.status === '1' && data.result) {
          console.log('Transaction found on Scrollscan API:', data.result);
          return {
            verified: true,
            message: 'Transaction verified via Scrollscan API',
            details: {
              from: data.result.from,
              to: data.result.to,
              value: web3.utils.fromWei(data.result.value, 'ether'),
              blockNumber: data.result.blockNumber,
              scrollscanUrl: `https://sepolia.scrollscan.com/address/0x7867fC939F10377E309a3BF55bfc194F672B0E84`
            }
          };
        }
      } catch (apiError) {
        console.warn('Error checking Scrollscan API:', apiError);
      }

      return { verified: false, message: 'Transaction not found on the blockchain' };
    }

    // Get transaction receipt to check if it was successful
    const receipt = await web3.eth.getTransactionReceipt(cleanHash);

    if (!receipt) {
      return { verified: false, message: 'Transaction is pending' };
    }

    // Check if transaction was successful (status = 1)
    if (receipt.status) {
      console.log('Transaction verified successfully:', cleanHash);
      return {
        verified: true,
        message: 'Transaction verified on blockchain',
        details: {
          from: transaction.from,
          to: transaction.to,
          value: web3.utils.fromWei(transaction.value, 'ether'),
          blockNumber: transaction.blockNumber,
          gasUsed: receipt.gasUsed,
          scrollscanUrl: `https://sepolia.scrollscan.com/address/0x7867fC939F10377E309a3BF55bfc194F672B0E84`
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

// Function to get a Scrollscan URL for the contract
export const getScrollscanUrl = () => {
  return 'https://sepolia.scrollscan.com/address/0x7867fC939F10377E309a3BF55bfc194F672B0E84';
};
