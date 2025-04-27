import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';
import { 
  CarbonCreditContractABI, 
  CarbonCreditContractAddress 
} from '../contracts/CarbonCreditContractABI';
import { SCROLL_CONFIG, addScrollNetwork } from '../utils/scrollConfig';
import { toast } from 'react-toastify';
import { getMockMarketData } from '../utils/carbonDataSeeder';

const CarbonMarketContext = createContext();

export const useCarbonMarket = () => useContext(CarbonMarketContext);

export const CarbonMarketProvider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isScrollNetwork, setIsScrollNetwork] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carbonCredits, setCarbonCredits] = useState(0);
  const [carbonCreditPool, setCarbonCreditPool] = useState(0);
  const [sellerListings, setSellerListings] = useState([]);
  const [buyerListings, setBuyerListings] = useState([]);
  const [connectionInProgress, setConnectionInProgress] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [projects, setProjects] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Helper function to safely convert timestamp to ISO string
  const safeTimestampToISOString = (timestamp) => {
    try {
      // Ensure timestamp is a valid number
      const timestampNum = parseInt(timestamp);
      if (isNaN(timestampNum)) {
        return new Date().toISOString(); // Fallback to current time
      }
      
      // Convert to milliseconds if needed (blockchain timestamps are in seconds)
      const timestampMs = timestampNum < 10000000000 ? timestampNum * 1000 : timestampNum;
      
      // Create date and check if valid
      const date = new Date(timestampMs);
      if (isNaN(date.getTime())) {
        return new Date().toISOString(); // Fallback to current time
      }
      
      return date.toISOString();
    } catch (error) {
      console.error('Error converting timestamp:', error);
      return new Date().toISOString(); // Fallback to current time
    }
  };

  // Refresh data
  const refreshData = async () => {
    setLoading(true);
    
    try {
      if (!contract || !account) {
        throw new Error('Contract or account not initialized');
      }

      // Get real data from the contract
      const pool = await contract.methods.carbonCreditPool().call();
      // Set hardcoded value of 100 when connected
      setCarbonCreditPool(isConnected ? 100 : pool);

      const credits = await contract.methods.getCarbonCreditsBalance(account).call();
      setCarbonCredits(BigInt(credits));

      // Get active listings from the contract
      const sellerIds = await contract.methods.getActiveSellerListings().call();
      const buyerIds = await contract.methods.getActiveBuyerListings().call();

      // Fetch seller listings
      const sellerListingsData = await Promise.all(
        sellerIds.map(async (id) => {
          const listing = await contract.methods.getSellerListing(id).call();
          return {
            id: listing.id,
            seller: listing.seller,
            company: listing.company,
            carbonTons: parseInt(listing.carbonTons),
            price: web3.utils.fromWei(listing.price, 'ether'),
            rate: web3.utils.fromWei(listing.rate, 'ether'),
            active: listing.active,
            timestamp: safeTimestampToISOString(listing.timestamp)
          };
        })
      );
      setSellerListings(sellerListingsData);

      // Fetch buyer listings
      const buyerListingsData = await Promise.all(
        buyerIds.map(async (id) => {
          const listing = await contract.methods.getBuyerListing(id).call();
          return {
            id: listing.id,
            buyer: listing.buyer,
            company: listing.company,
            carbonTons: parseInt(listing.carbonTons),
            price: web3.utils.fromWei(listing.price, 'ether'),
            rate: web3.utils.fromWei(listing.rate, 'ether'),
            active: listing.active,
            timestamp: safeTimestampToISOString(listing.timestamp)
          };
        })
      );
      setBuyerListings(buyerListingsData);

    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(err.message || 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Initialize Web3 and contract
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (window.ethereum) {
          // Create Web3 instance
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          
          // Check if already connected
          const accounts = await web3Instance.eth.getAccounts();
          const isConnected = accounts.length > 0;
          
          if (isConnected) {
            setAccount(accounts[0]);
            setIsConnected(true);
            
            // Get current chain ID
            const chainId = await web3Instance.eth.getChainId();
            setIsScrollNetwork(chainId === SCROLL_CONFIG.NETWORK.CHAIN_ID);
            
            // Initialize contract
            const contractInstance = new web3Instance.eth.Contract(
              CarbonCreditContractABI,
              CarbonCreditContractAddress
            );
            setContract(contractInstance);
            
            // Get carbon credit pool
            const pool = await contractInstance.methods.carbonCreditPool().call();
            setCarbonCreditPool(pool);
            
            // Get user's carbon credits
            const credits = await contractInstance.methods.getCarbonCreditsBalance(accounts[0]).call();
            setCarbonCredits(credits);
            
            // Load listings
            await loadListings(contractInstance);
          }
          
          // Set up event listeners
          setupEventListeners(web3Instance);
        }
      } catch (err) {
        console.error('Error initializing carbon market:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, [refreshTrigger]);
  
  // Load listings from the contract
  const loadListings = async (contractInstance) => {
    try {
      if (!contractInstance) return;
      
      // Get active seller listings
      const sellerListingIds = await contractInstance.methods.getActiveSellerListings().call();
      const sellerListingsData = await Promise.all(
        sellerListingIds.map(async (id) => {
          const listing = await contractInstance.methods.getSellerListing(id).call();
          
          // Convert Wei to ETH for display
          const priceInEth = web3.utils.fromWei(listing.price.toString(), 'ether');
          const rateInEth = web3.utils.fromWei(listing.rate.toString(), 'ether');
          
          return {
            id: parseInt(listing.id),
            company: listing.company,
            carbonTons: parseInt(listing.carbonTons),
            price: `${priceInEth} ETH`,
            rate: parseFloat(rateInEth),
            usdPrice: `$${(parseFloat(priceInEth) * 1000).toFixed(2)} USD`, // Simple conversion for demo
            seller: listing.seller,
            active: listing.active
          };
        })
      );
      setSellerListings(sellerListingsData);
      
      // Get active buyer listings
      const buyerListingIds = await contractInstance.methods.getActiveBuyerListings().call();
      const buyerListingsData = await Promise.all(
        buyerListingIds.map(async (id) => {
          const listing = await contractInstance.methods.getBuyerListing(id).call();
          
          // Convert Wei to ETH for display
          const priceInEth = web3.utils.fromWei(listing.price.toString(), 'ether');
          const rateInEth = web3.utils.fromWei(listing.rate.toString(), 'ether');
          
          return {
            id: parseInt(listing.id),
            company: listing.company,
            carbonTons: parseInt(listing.carbonTons),
            price: `${priceInEth} ETH`,
            rate: parseFloat(rateInEth),
            usdPrice: `$${(parseFloat(priceInEth) * 1000).toFixed(2)} USD`, // Simple conversion for demo
            buyer: listing.buyer,
            active: listing.active
          };
        })
      );
      setBuyerListings(buyerListingsData);
    } catch (err) {
      console.error('Error loading listings:', err);
      toast.error('Failed to load marketplace listings');
    }
  };
  
  // Set up event listeners for account and network changes
  const setupEventListeners = (web3Instance) => {
    if (window.ethereum) {
      // Listen for account changes
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          setIsConnected(false);
          setAccount(null);
          setCarbonCredits(BigInt(0));
        } else {
          // User switched accounts
          setAccount(accounts[0]);
          setIsConnected(true);
          
          // Refresh user data
          if (contract) {
            const credits = await contract.methods.getCarbonCreditsBalance(accounts[0]).call();
            setCarbonCredits(credits);
          }
        }
      });
      
      // Listen for network changes
      window.ethereum.on('chainChanged', async (chainId) => {
        // Convert chainId to decimal if it's in hex
        const chainIdDecimal = parseInt(chainId, 16);
        setIsScrollNetwork(chainIdDecimal === SCROLL_CONFIG.NETWORK.CHAIN_ID);
        
        // Refresh page to ensure everything is in sync
        window.location.reload();
      });
    }
  };
  
  // First, let's define the correct Scroll Sepolia network parameters
  const SCROLL_SEPOLIA_CONFIG = {
    chainId: '0x8274f', // 534351 in hex (Scroll Sepolia)
    chainName: 'Scroll Sepolia',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://sepolia-rpc.scroll.io'],
    blockExplorerUrls: ['https://sepolia.scrollscan.dev/']
  };

  // Add rate limiting to prevent spam
  let lastNetworkSwitchAttempt = 0;
  const NETWORK_SWITCH_COOLDOWN = 2000; // 2 seconds

  // Connect wallet
  const connectWallet = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      // Check if we're on Scroll network
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      
      if (parseInt(chainId, 16) !== SCROLL_CONFIG.NETWORK.CHAIN_ID) {
        await switchToScrollNetwork();
      }

      setAccount(accounts[0]);
      setIsConnected(true);

      // Initialize contract
      const web3Instance = new Web3(window.ethereum);
      const contractInstance = new web3Instance.eth.Contract(
        CarbonCreditContractABI,
        CarbonCreditContractAddress
      );
      setContract(contractInstance);

      // Get real carbon credits balance
      const credits = await contractInstance.methods
        .getCarbonCreditsBalance(accounts[0])
        .call();
      setCarbonCredits(BigInt(credits));

      toast.success('Wallet connected successfully!');
      return true;
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
      toast.error(`Failed to connect wallet: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Switch to Scroll network
  const switchToScrollNetwork = async () => {
    try {
      // Check if enough time has passed since last attempt
      const now = Date.now();
      if (now - lastNetworkSwitchAttempt < NETWORK_SWITCH_COOLDOWN) {
        throw new Error('Please wait a few seconds before trying again');
      }
      lastNetworkSwitchAttempt = now;

      // First try to switch to the network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SCROLL_SEPOLIA_CONFIG.chainId }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SCROLL_SEPOLIA_CONFIG],
          });
        } else {
          throw switchError;
        }
      }
      
      setIsScrollNetwork(true);
      return true;
    } catch (err) {
      console.error('Error switching to Scroll network:', err);
      toast.error(err.message || 'Failed to switch to Scroll network');
      return false;
    }
  };
  
  // Create seller listing
  const createSellerListing = async (company, carbonTons, rate) => {
    setLoading(true);
    
    try {
      if (!contract || !account) {
        throw new Error('Contract or account not initialized');
      }

      // Validate inputs
      if (carbonTons <= 0) {
        throw new Error('Carbon tons must be greater than 0');
      }
      if (rate <= 0) {
        throw new Error('Rate must be greater than 0');
      }
const balance = await contract.methods.carbonCredits(account).call();
const balanceBigInt = BigInt(balance);
const carbonTonsBigInt = BigInt(carbonTons);

if (balanceBigInt < carbonTonsBigInt) {

        throw new Error(`Insufficient carbon credits. You have ${balance} credits but trying to sell ${carbonTons}`);
      }

      console.log('Creating seller listing with params:', {
        company,
        carbonTons,
        rate
      });

      // Convert rate to Wei
      const rateInWei = web3.utils.toWei(rate.toString(), 'ether');

      // Estimate gas first
      const gasEstimate = await contract.methods
        .createSellerListing(company, carbonTons.toString(), rateInWei)
        .estimateGas({ from: account });

      // Call the actual contract method with estimated gas
      const transaction = await contract.methods
        .createSellerListing(company, carbonTons.toString(), rateInWei)
        .send({ 
          from: account,
          gas: gasEstimate + BigInt(gasEstimate / 5n) // Adds 20% buffer safely
        });

      console.log('Transaction hash:', transaction.transactionHash);
      
      // Add transaction to monitoring
      addTransaction({
        transactionHash: transaction.transactionHash,
        type: 'CREATE_SELLER_LISTING'
      });

      toast.success('Transaction submitted!');
      toast.info(
        <div>
          View on Scrollscan: 
          <a 
            href={`https://sepolia.scrollscan.dev/tx/${transaction.transactionHash}`} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            {transaction.transactionHash.substring(0, 10)}...
          </a>
        </div>
      );

      // Refresh data after transaction
      await refreshData();
      return true;
    } catch (err) {
      console.error('Error creating seller listing:', err);
      // Extract the revert reason if available
      const revertReason = err.message.match(/reason string "(.+?)"/)?.[1] || err.message;
      setError(revertReason || 'Failed to create listing');
      toast.error(`Transaction failed: ${revertReason}`);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Create buyer listing
  const createBuyerListing = async (company, carbonTons, rate) => {
    setLoading(true);
    
    try {
      if (!contract || !account) {
        throw new Error('Contract or account not initialized');
      }

      // Validate inputs
      if (carbonTons <= 0) {
        throw new Error('Carbon tons must be greater than 0');
      }
      if (rate <= 0) {
        throw new Error('Rate must be greater than 0');
      }

      // Convert rate to Wei
      const rateInWei = web3.utils.toWei(rate.toString(), 'ether');
      
      // Calculate total price in Wei
      const priceInWei = (BigInt(carbonTons.toString()) * BigInt(rateInWei)).toString();

      console.log('Creating buyer listing with params:', {
        company,
        carbonTons,
        rateInWei,
        priceInWei
      });

      // Estimate gas first
      const gasEstimate = await contract.methods
        .createBuyerListing(company, carbonTons.toString(), rateInWei)
        .estimateGas({ from: account, value: priceInWei });

      // Call the actual contract method with estimated gas
      const transaction = await contract.methods
        .createBuyerListing(company, carbonTons.toString(), rateInWei)
        .send({ 
          from: account,
          value: priceInWei,
          gas: gasEstimate + BigInt(gasEstimate / 5n) // Adds 20% buffer safely
        });

      console.log('Transaction hash:', transaction.transactionHash);
      
      // Add transaction to monitoring
      addTransaction({
        transactionHash: transaction.transactionHash,
        type: 'CREATE_BUYER_LISTING'
      });

      toast.success('Transaction submitted!');
      toast.info(
        <div>
          View on Scrollscan: 
          <a 
            href={`https://sepolia.scrollscan.dev/tx/${transaction.transactionHash}`} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            {transaction.transactionHash.substring(0, 10)}...
          </a>
        </div>
      );

      // Refresh data after transaction
      await refreshData();
      return true;
    } catch (err) {
      console.error('Error creating buyer listing:', err);
      // Extract the revert reason if available
      const revertReason = err.message.match(/reason string "(.+?)"/)?.[1] || err.message;
      setError(revertReason || 'Failed to create listing');
      toast.error(`Transaction failed: ${revertReason}`);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Buy carbon credits
  const buyCarbonCredits = async (listingId, priceInWei) => {
    setLoading(true);
    
    try {
      if (!contract || !account) {
        throw new Error('Contract or account not initialized');
      }

      // Call the actual smart contract method
      const transaction = await contract.methods
        .buyCarbonCredits(listingId)
        .send({ 
          from: account,
          value: priceInWei,
          gas: 300000 // Adjust gas as needed
        });

      console.log('Transaction hash:', transaction.transactionHash);
      toast.success(`Transaction submitted! Hash: ${transaction.transactionHash}`);

      // Add link to transaction
      toast.info(
        <div>
          View on Scrollscan: 
          <a 
            href={`https://sepolia.scrollscan.dev/tx/${transaction.transactionHash}`} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            {transaction.transactionHash.substring(0, 10)}...
          </a>
        </div>
      );

      // Refresh the data after successful transaction
      await refreshData();

      // Add to your contract interactions
      console.log('Contract address:', CarbonCreditContractAddress);
      console.log('Current network:', await web3.eth.net.getId());
      console.log('Gas price:', await web3.eth.getGasPrice());

      return true;
    } catch (err) {
      console.error('Error buying carbon credits:', err);
      setError(err.message || 'Failed to buy carbon credits');
      toast.error(`Transaction failed: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Sell carbon credits
  const sellCarbonCredits = async (listingId) => {
    setLoading(true);
    
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Find the listing
      const listing = buyerListings.find(item => item.id === listingId);
      
      if (!listing) {
        throw new Error('Listing not found');
      }
      
      if (carbonCredits < listing.carbonTons) {
        throw new Error('Not enough carbon credits');
      }
      
      // Update carbon credits
      setCarbonCredits(prev => prev - BigInt(listing.carbonTons));
      
      // Remove the listing
      setBuyerListings(prev => prev.filter(item => item.id !== listingId));
      
      toast.success(`Successfully sold ${listing.carbonTons} carbon credits!`);
      return true;
    } catch (err) {
      console.error('Error selling carbon credits:', err);
      setError(err.message || 'Failed to sell carbon credits');
      toast.error(`Transaction failed: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Check if an address is the current account
  const isCurrentAccount = (address) => {
    return address?.toLowerCase() === account?.toLowerCase();
  };
  
  // Format ETH amount with proper decimal places
  const formatEthAmount = (ethString) => {
    if (!ethString) return '0 ETH';
    return ethString;
  };
  
  // Convert Wei to ETH
  const weiToEth = (wei) => {
    return (parseInt(wei) / 1e18).toFixed(4);
  };
  
  // Convert ETH to Wei
  const ethToWei = (eth) => {
    return (parseFloat(eth) * 1e18).toString();
  };

  const addTransaction = (tx) => {
    setTransactions(prev => [...prev, {
      hash: tx.transactionHash,
      type: tx.type,
      timestamp: Date.now(),
      status: 'pending'
    }]);
  };

  // Update transaction status
  const updateTransactionStatus = (hash, status) => {
    setTransactions(prev => prev.map(tx => 
      tx.hash === hash ? { ...tx, status } : tx
    ));
  };

  // Add transaction monitoring
  useEffect(() => {
    transactions.forEach(async (tx) => {
      if (tx.status === 'pending') {
        try {
          const receipt = await web3.eth.getTransactionReceipt(tx.hash);
          if (receipt) {
            updateTransactionStatus(tx.hash, receipt.status ? 'success' : 'failed');
            if (receipt.status) {
              refreshData();
            }
          }
        } catch (err) {
          console.error('Error checking transaction:', err);
        }
      }
    });
  }, [transactions]);

  useEffect(() => {
    const logContractInfo = async () => {
      if (web3 && contract) {
        console.log('Contract Configuration:', {
          address: CarbonCreditContractAddress,
          network: await web3.eth.net.getId(),
          gasPrice: await web3.eth.getGasPrice(),
          account: account
        });
      }
    };
    
    logContractInfo();
  }, [web3, contract, account]);

  // Request test carbon credits
  const requestTestCredits = async (amount = 100) => {
    try {
      if (!contract || !account) {
        throw new Error('Contract or account not initialized');
      }

      // Check if we're the contract owner
      const contractOwner = await contract.methods.owner().call();
      if (contractOwner.toLowerCase() === account.toLowerCase()) {
        // We're the owner, mint directly
        const transaction = await contract.methods
          .mintCarbonCredits(account, amount)
          .send({ 
            from: account,
            gas: 100000
          });

        toast.success(`Successfully minted ${amount} test carbon credits!`);
        await refreshData();
        return true;
      } else {
        // We're not the owner, show instructions
        toast.info(`To get test carbon credits, please contact the contract owner at ${formatAddress(contractOwner)}`);
        return false;
      }
    } catch (err) {
      console.error('Error requesting test credits:', err);
      toast.error(`Failed to request test credits: ${err.message}`);
      return false;
    }
  };

  const value = {
    web3,
    contract,
    account,
    isConnected,
    isScrollNetwork,
    loading,
    error,
    carbonCredits,
    carbonCreditPool,
    sellerListings,
    buyerListings,
    projects,
    connectWallet,
    switchToScrollNetwork,
    createSellerListing,
    createBuyerListing,
    buyCarbonCredits,
    sellCarbonCredits,
    refreshData,
    formatAddress,
    isCurrentAccount,
    formatEthAmount,
    weiToEth,
    ethToWei,
    requestTestCredits
  };

  return (
    <CarbonMarketContext.Provider value={value}>
      {children}
    </CarbonMarketContext.Provider>
  );
}; 