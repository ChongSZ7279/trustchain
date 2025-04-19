import Web3 from 'web3';
import { DonationContractABI, DonationContractAddress } from '../contracts/DonationContractABI';
import { SCROLL_CONFIG, addScrollNetwork } from './scrollConfig';

let web3;
let contract;
let account;
let contractInstance;

// Flag to track if a wallet connection is in progress
let connectionInProgress = false;

// Function to detect and handle pending MetaMask requests
const handlePendingMetaMaskRequests = async () => {
  if (!window.ethereum) return false;

  try {
    // Try to get accounts without prompting - this can help "unstick" MetaMask
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
      params: []
    });

    // If we have accounts, we're already connected
    if (accounts && accounts.length > 0) {
      console.log('Already connected to account:', accounts[0]);
      account = accounts[0];
      return true;
    }

    return false;
  } catch (error) {
    console.warn('Error checking MetaMask state:', error);
    return false;
  }
};

// Initialize Web3 and contract
export const initWeb3 = async () => {
  if (window.ethereum) {
    try {
      console.log("initWeb3: Web3 provider detected");

      // Check if a connection request is already pending
      if (connectionInProgress) {
        console.warn("initWeb3: Connection already in progress, waiting for user response");

        // Try to recover from a stuck state
        const recovered = await handlePendingMetaMaskRequests();
        if (recovered) {
          console.log("initWeb3: Successfully recovered from pending state");
        } else {
          throw new Error("MetaMask connection already in progress. Please check MetaMask and respond to any pending requests.");
        }
      }

      // Set flag to prevent multiple simultaneous requests
      connectionInProgress = true;

      // Try to handle any pending requests first
      const alreadyConnected = await handlePendingMetaMaskRequests();

      if (!alreadyConnected) {
        // Request account access
        console.log("initWeb3: Requesting account access");
        try {
          // Use a timeout to prevent getting stuck
          const accountPromise = window.ethereum.request({ method: 'eth_requestAccounts' });

          // Set a timeout to detect stuck requests
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error("MetaMask request timed out. Please check MetaMask and try again."));
            }, 3000); // 3 second timeout
          });

          // Race the account request against the timeout
          const newAccounts = await Promise.race([accountPromise, timeoutPromise]);
          account = newAccounts[0];
          console.log("initWeb3: Connected to account:", account);
        } catch (requestError) {
          if (requestError.code === -32002) {
            console.warn("initWeb3: Request already pending in MetaMask");

            // Try to recover from the pending state
            const recovered = await handlePendingMetaMaskRequests();
            if (!recovered) {
              throw new Error("Request already pending in MetaMask. Please open MetaMask, check for pending requests, or reload the page.");
            }
          } else {
            throw requestError;
          }
        }
      }

      // Create Web3 instance
      console.log("initWeb3: Creating Web3 instance");
      web3 = new Web3(window.ethereum);

      // Get current chain ID
      console.log("initWeb3: Getting chain ID");
      let chainId = await web3.eth.getChainId();
      // Convert chainId to number for consistent comparison
      let chainIdNum = typeof chainId === 'bigint' ? Number(chainId) : chainId;
      console.log("initWeb3: Current chain ID:", chainId, "(as number:", chainIdNum, ")");

      // Check if we're on Scroll network, if not, try to switch
      if (chainIdNum !== SCROLL_CONFIG.NETWORK.CHAIN_ID) {
        console.log("initWeb3: Not on Scroll network, attempting to switch...");
        try {
          await switchToScroll();
          // Get updated chain ID after switch
          chainId = await web3.eth.getChainId();
          chainIdNum = typeof chainId === 'bigint' ? Number(chainId) : chainId;
          console.log("initWeb3: Updated chain ID after switch:", chainId, "(as number:", chainIdNum, ")");
        } catch (switchError) {
          console.warn("initWeb3: Failed to auto-switch to Scroll network:", switchError.message);
          // Continue anyway, the UI will prompt the user to switch
        }
      } else {
        console.log("initWeb3: Already on Scroll network with chain ID:", chainIdNum);
      }

      // Initialize contract with the ABI and address
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || DonationContractAddress;
      console.log("initWeb3: Using contract address:", contractAddress);

      if (!contractAddress) {
        console.error("initWeb3: Contract address is not defined in environment variables");
        throw new Error("Contract address is not defined in environment variables");
      }

      console.log("initWeb3: Creating contract instance with ABI:", !!DonationContractABI);
      try {
        contract = new web3.eth.Contract(
          DonationContractABI,
          contractAddress
        );

        // Verify contract by calling a view function
        try {
          await contract.methods.getContractBalance().call();
          console.log("initWeb3: Contract successfully initialized and verified");
        } catch (viewError) {
          console.warn("initWeb3: Could not verify contract with view function:", viewError.message);
          console.warn("initWeb3: The contract at the specified address may not be compatible with the ABI");
          console.warn("initWeb3: Please deploy a new contract using the deployment guide");
        }

        // Store the contract instance globally
        console.log("initWeb3: Storing contract instance globally");
        contractInstance = contract;
      } catch (contractError) {
        console.error("initWeb3: Error initializing contract:", contractError);
        contract = null;
        contractInstance = null;
      }

      // Return the initialized objects
      return { web3, contract, account, chainId };
    } catch (error) {
      console.error("Error initializing Web3:", error);
      // Add more descriptive error message
      let errorMessage = error.message;
      if (error.code === 4001) {
        errorMessage = "You rejected the connection request. Please approve the MetaMask connection.";
      } else if (error.code === -32002) {
        errorMessage = "MetaMask request already pending. Please check MetaMask and respond to any pending requests.";
      } else if (window.ethereum && !window.ethereum.isConnected()) {
        errorMessage = "MetaMask is not connected to the network. Please check your connection.";
      }
      throw new Error(errorMessage);
    } finally {
      // Always reset the connection flag when done
      connectionInProgress = false;
    }
  } else {
    console.error("initWeb3: No Ethereum provider detected. Please install MetaMask");
    throw new Error('Please install MetaMask or another Web3 provider');
  }
};

// Flag to track if a network switch is in progress
let networkSwitchInProgress = false;

// Switch to Scroll network
export const switchToScroll = async () => {
  // Prevent multiple simultaneous switch requests
  if (networkSwitchInProgress) {
    console.warn('Network switch already in progress, waiting for user response');
    throw new Error('Network switch already in progress. Please check MetaMask and respond to any pending requests.');
  }

  try {
    // Set flag to prevent multiple simultaneous requests
    networkSwitchInProgress = true;

    console.log('Attempting to switch to Scroll network...');

    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    const chainIdHex = `0x${Number(SCROLL_CONFIG.NETWORK.CHAIN_ID).toString(16)}`;
    console.log('Target chain ID:', chainIdHex);

    // First try to switch to the network if it already exists
    try {
      console.log('Attempting to switch to existing Scroll network...');
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
      console.log('Successfully switched to existing Scroll network');
      return true;
    } catch (switchError) {
      console.log('Switch error:', switchError);

      // Handle pending request error
      if (switchError.code === -32002) {
        console.warn('Network switch request already pending in MetaMask');
        throw new Error('Network switch request already pending. Please check MetaMask and respond to any pending requests.');
      }

      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902 ||
          switchError.message.includes('Unrecognized chain ID') ||
          switchError.message.includes('chain must be added')) {
        console.log('Scroll network not found, attempting to add it...');
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: chainIdHex,
              chainName: SCROLL_CONFIG.NETWORK.NAME,
              nativeCurrency: {
                name: SCROLL_CONFIG.NETWORK.CURRENCY.NAME,
                symbol: SCROLL_CONFIG.NETWORK.CURRENCY.SYMBOL,
                decimals: SCROLL_CONFIG.NETWORK.CURRENCY.DECIMALS
              },
              rpcUrls: [SCROLL_CONFIG.NETWORK.RPC_URL],
              blockExplorerUrls: [SCROLL_CONFIG.NETWORK.BLOCK_EXPLORER_URL]
            }]
          });
          console.log('Successfully added Scroll network');
          return true;
        } catch (addError) {
          // Handle pending request error for adding network
          if (addError.code === -32002) {
            console.warn('Network add request already pending in MetaMask');
            throw new Error('Network add request already pending. Please check MetaMask and respond to any pending requests.');
          }

          console.error('Error adding Scroll network:', addError);
          throw new Error(`Failed to add Scroll network: ${addError.message}`);
        }
      }
      console.error('Error switching to Scroll network:', switchError);
      throw new Error(`Failed to switch to Scroll network: ${switchError.message}`);
    }
  } catch (error) {
    console.error('Error in switchToScroll:', error);
    throw error;
  } finally {
    // Always reset the network switch flag when done
    networkSwitchInProgress = false;
  }
};

// Make a donation
export const donate = async (amount, message = '') => {
  if (!contract || !account) {
    await initWeb3();
  }

  try {
    const amountInWei = web3.utils.toWei(amount.toString(), 'ether');

    const result = await contract.methods.donate(message).send({
      from: account,
      value: amountInWei
    });

    return result;
  } catch (error) {
    console.error("Error making donation:", error);
    throw error;
  }
};

// Donate to a specific charity using Scroll network
export const donateToCharity = async (charityId, amount, message) => {
  try {
    console.log('Starting Scroll blockchain donation...', { charityId, amount, message });

    // Check if wallet is connected
    if (!window.ethereum) {
      throw new Error('Please install MetaMask to make a blockchain donation');
    }

    // Initialize Web3 and get the contract instance
    await initWeb3();

    // Get the current account
    const accounts = await web3.eth.getAccounts();
    const currentAccount = accounts[0];

    if (!currentAccount) {
      throw new Error('No account found. Please connect your wallet');
    }

    console.log('Connected account:', currentAccount);

    // Check if we're on Scroll network
    const chainId = await web3.eth.getChainId();
    // Convert chainId to number for consistent comparison
    const chainIdNum = typeof chainId === 'bigint' ? Number(chainId) : chainId;

    if (chainIdNum !== SCROLL_CONFIG.NETWORK.CHAIN_ID) {
      console.log('Not on Scroll network. Attempting to switch...');
      await switchToScroll();

      // Verify chain ID again after switch
      const newChainId = await web3.eth.getChainId();
      const newChainIdNum = typeof newChainId === 'bigint' ? Number(newChainId) : newChainId;

      console.log('After switch, chain ID:', newChainIdNum, 'Expected:', SCROLL_CONFIG.NETWORK.CHAIN_ID);

      if (newChainIdNum !== SCROLL_CONFIG.NETWORK.CHAIN_ID) {
        throw new Error('Failed to switch to Scroll network. Please switch manually in MetaMask.');
      }
    } else {
      console.log('Already on Scroll network with chain ID:', chainIdNum);
    }

    // Convert amount to wei
    const amountInWei = web3.utils.toWei(amount.toString(), 'ether');
    console.log('Amount in wei:', amountInWei);

    // Get contract instance
    const contract = await getContractInstance();
    if (!contract) {
      throw new Error('Failed to initialize contract. Please check the contract deployment.');
    }

    // Verify contract has the donate method
    if (!contract.methods.donate) {
      throw new Error('Contract does not have the donate method. Please check the contract deployment.');
    }

    console.log('Contract methods:', contract.methods);

    // Call donate with the correct parameter order
    console.log('Calling donate(uint256,string) with params:', {
      charityId: Number(charityId),
      message: message || '',
      value: amountInWei
    });

    // Try to use the donate method with proper error handling
    try {
      const result = await contract.methods.donate(
        Number(charityId),
        message || ''
      ).send({
        from: currentAccount,
        value: amountInWei
      });

      // If we get here, the transaction was successful
      console.log('Donation transaction successful!');
      return {
        success: true,
        transactionHash: result.transactionHash,
        from: result.from,
        to: result.to,
        blockNumber: typeof result.blockNumber === 'bigint' ? result.blockNumber.toString() : result.blockNumber,
        gasUsed: typeof result.gasUsed === 'bigint' ? result.gasUsed.toString() : result.gasUsed,
        status: result.status,
        events: result.events ? JSON.parse(JSON.stringify(result.events, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        )) : null
      };
    } catch (txError) {
      console.error('Transaction failed:', txError);

      // Check if this is a contract compatibility issue
      if (txError.message.includes('execution reverted') ||
          txError.message.includes('invalid opcode')) {
        throw new Error('The contract is not compatible with the donation function. Please deploy a new contract using the deployment guide.');
      }

      // Re-throw the original error
      throw txError;
    }
  } catch (error) {
    console.error('Error in donateToCharity:', error);
    throw error;
  }
};

// Execute a transaction
export const executeTransaction = async (recipient, amount, description = '') => {
  if (!contract || !account) {
    await initWeb3();
  }

  try {
    const amountInWei = web3.utils.toWei(amount.toString(), 'ether');

    const result = await contract.methods.executeTransaction(recipient, description).send({
      from: account,
      value: amountInWei
    });

    return result;
  } catch (error) {
    console.error("Error executing transaction:", error);
    throw error;
  }
};

// Get all donations
export const getAllDonations = async () => {
  if (!contract) {
    await initWeb3();
  }

  try {
    const count = await contract.methods.getDonationCount().call();
    const donations = [];

    // Get donations in batches of 50 to avoid gas limits
    const batchSize = 50;
    for (let i = 0; i < count; i += batchSize) {
      const batchCount = Math.min(batchSize, count - i);
      const batch = await contract.methods.getDonationBatch(i, batchCount).call();

      for (let j = 0; j < batch.donors.length; j++) {
        donations.push({
          donor: batch.donors[j],
          amount: web3.utils.fromWei(batch.amounts[j], 'ether'),
          timestamp: new Date(batch.timestamps[j] * 1000),
          message: batch.messages[j]
        });
      }
    }

    return donations;
  } catch (error) {
    console.error("Error getting donations:", error);
    throw error;
  }
};

// Get all transactions
export const getAllTransactions = async () => {
  if (!contract) {
    await initWeb3();
  }

  try {
    const count = await contract.methods.getTransactionCount().call();
    const transactions = [];

    // Get transactions in batches of 50 to avoid gas limits
    const batchSize = 50;
    for (let i = 0; i < count; i += batchSize) {
      const batchCount = Math.min(batchSize, count - i);
      const batch = await contract.methods.getTransactionBatch(i, batchCount).call();

      for (let j = 0; j < batch.senders.length; j++) {
        transactions.push({
          sender: batch.senders[j],
          recipient: batch.recipients[j],
          amount: web3.utils.fromWei(batch.amounts[j], 'ether'),
          timestamp: new Date(batch.timestamps[j] * 1000),
          description: batch.descriptions[j]
        });
      }
    }

    return transactions;
  } catch (error) {
    console.error("Error getting transactions:", error);
    throw error;
  }
};

// Get contract balance
export const getContractBalance = async () => {
  if (!contract) {
    await initWeb3();
  }

  try {
    const balanceWei = await contract.methods.getContractBalance().call();
    return web3.utils.fromWei(balanceWei, 'ether');
  } catch (error) {
    console.error("Error getting contract balance:", error);
    throw error;
  }
};

// Check if wallet is connected
export const isWalletConnected = () => {
  return !!account;
};

// Get current account
export const getCurrentAccount = () => {
  return account;
};

// Listen for account changes
export const setupAccountChangeListener = (callback) => {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      account = accounts[0];
      callback(account);
    });
  }
};

// Add this function to your contractInteraction.js file
export const getContractInstance = async () => {
  if (!contractInstance) {
    console.warn('Contract not initialized. Attempting to initialize Web3...');
    try {
      await initWeb3();
      return contractInstance;
    } catch (error) {
      console.error('Failed to initialize contract:', error);
      return null;
    }
  }
  return contractInstance;
};