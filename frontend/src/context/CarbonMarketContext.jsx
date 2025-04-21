import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';
import { 
  CarbonCreditContractABI, 
  CarbonCreditContractAddress 
} from '../contracts/CarbonCreditContractABI';
import { SCROLL_CONFIG, addScrollNetwork } from '../utils/scrollConfig';
import { toast } from 'react-toastify';

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

  // Refresh data
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
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
          setCarbonCredits(0);
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
  
  // Connect wallet
  const connectWallet = async () => {
    if (connectionInProgress) {
      toast.info('Connection already in progress, please check MetaMask');
      return false;
    }
    
    try {
      setConnectionInProgress(true);
      
      if (!window.ethereum) {
        toast.error('MetaMask is not installed. Please install MetaMask to continue.');
        return false;
      }
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        // Check if we're on Scroll network
        const chainId = await web3.eth.getChainId();
        const isScroll = chainId === SCROLL_CONFIG.NETWORK.CHAIN_ID;
        setIsScrollNetwork(isScroll);
        
        // If not on Scroll network, try to switch
        if (!isScroll) {
          await switchToScrollNetwork();
        }
        
        // Get user's carbon credits
        if (contract) {
          const credits = await contract.methods.getCarbonCreditsBalance(accounts[0]).call();
          setCarbonCredits(parseInt(credits));
        }
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error connecting wallet:', err);
      
      // Handle specific error codes
      if (err.code === -32002) {
        toast.info('MetaMask request already pending. Please open MetaMask and confirm any pending requests.');
      } else {
        toast.error(`Failed to connect wallet: ${err.message}`);
      }
      
      return false;
    } finally {
      setConnectionInProgress(false);
    }
  };
  
  // Switch to Scroll network
  const switchToScrollNetwork = async () => {
    try {
      if (!window.ethereum) {
        toast.error('MetaMask is not installed');
        return false;
      }
      
      const chainIdHex = `0x${Number(SCROLL_CONFIG.NETWORK.CHAIN_ID).toString(16)}`;
      
      try {
        // First try to switch to the network if it already exists
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
        setIsScrollNetwork(true);
        return true;
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902 || 
            switchError.message.includes('Unrecognized chain ID') || 
            switchError.message.includes('chain must be added')) {
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
            setIsScrollNetwork(true);
            return true;
          } catch (addError) {
            console.error('Error adding Scroll network:', addError);
            toast.error(`Failed to add Scroll network: ${addError.message}`);
            return false;
          }
        }
        console.error('Error switching to Scroll network:', switchError);
        toast.error(`Failed to switch to Scroll network: ${switchError.message}`);
        return false;
      }
    } catch (err) {
      console.error('Error in switchToScrollNetwork:', err);
      toast.error(`Error switching to Scroll network: ${err.message}`);
      return false;
    }
  };
  
  // Create seller listing
  const createSellerListing = async (company, carbonTons, rate) => {
    try {
      if (!isConnected) {
        toast.error('Please connect your wallet first');
        return false;
      }
      
      if (!isScrollNetwork) {
        toast.error('Please switch to Scroll network');
        await switchToScrollNetwork();
        return false;
      }
      
      setLoading(true);
      
      // Convert ETH to Wei
      const rateInWei = web3.utils.toWei(rate.toString(), 'ether');
      
      // Create the listing
      await contract.methods.createSellerListing(company, carbonTons, rateInWei)
        .send({ from: account });
      
      // Refresh data
      refreshData();
      
      toast.success('Seller listing created successfully');
      return true;
    } catch (err) {
      console.error('Error creating seller listing:', err);
      toast.error(`Failed to create seller listing: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Create buyer listing
  const createBuyerListing = async (company, carbonTons, rate) => {
    try {
      if (!isConnected) {
        toast.error('Please connect your wallet first');
        return false;
      }
      
      if (!isScrollNetwork) {
        toast.error('Please switch to Scroll network');
        await switchToScrollNetwork();
        return false;
      }
      
      setLoading(true);
      
      // Convert ETH to Wei and calculate total price
      const rateInWei = web3.utils.toWei(rate.toString(), 'ether');
      const totalPriceInWei = web3.utils.toBN(rateInWei).mul(web3.utils.toBN(carbonTons));
      
      // Create the listing
      await contract.methods.createBuyerListing(company, carbonTons, rateInWei)
        .send({ from: account, value: totalPriceInWei });
      
      // Refresh data
      refreshData();
      
      toast.success('Buyer listing created successfully');
      return true;
    } catch (err) {
      console.error('Error creating buyer listing:', err);
      toast.error(`Failed to create buyer listing: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Buy carbon credits
  const buyCarbonCredits = async (listingId, priceInWei) => {
    try {
      if (!isConnected) {
        toast.error('Please connect your wallet first');
        return false;
      }
      
      if (!isScrollNetwork) {
        toast.error('Please switch to Scroll network');
        await switchToScrollNetwork();
        return false;
      }
      
      setLoading(true);
      
      // Buy the carbon credits
      await contract.methods.buyCarbonCredits(listingId)
        .send({ from: account, value: priceInWei });
      
      // Refresh data
      refreshData();
      
      toast.success('Carbon credits purchased successfully');
      return true;
    } catch (err) {
      console.error('Error buying carbon credits:', err);
      toast.error(`Failed to buy carbon credits: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Sell carbon credits
  const sellCarbonCredits = async (listingId) => {
    try {
      if (!isConnected) {
        toast.error('Please connect your wallet first');
        return false;
      }
      
      if (!isScrollNetwork) {
        toast.error('Please switch to Scroll network');
        await switchToScrollNetwork();
        return false;
      }
      
      setLoading(true);
      
      // Sell the carbon credits
      await contract.methods.sellCarbonCredits(listingId)
        .send({ from: account });
      
      // Refresh data
      refreshData();
      
      toast.success('Carbon credits sold successfully');
      return true;
    } catch (err) {
      console.error('Error selling carbon credits:', err);
      toast.error(`Failed to sell carbon credits: ${err.message}`);
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
    return address.toLowerCase() === account?.toLowerCase();
  };
  
  // Format ETH amount with proper decimal places
  const formatEthAmount = (amount) => {
    if (!amount) return '0 ETH';
    
    // Remove 'ETH' if present
    const numericPart = amount.replace(' ETH', '');
    
    return `${parseFloat(numericPart).toFixed(4)} ETH`;
  };
  
  // Convert Wei to ETH
  const weiToEth = (wei) => {
    if (!web3 || !wei) return '0';
    return web3.utils.fromWei(wei.toString(), 'ether');
  };
  
  // Convert ETH to Wei
  const ethToWei = (eth) => {
    if (!web3 || !eth) return '0';
    return web3.utils.toWei(eth.toString(), 'ether');
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
    ethToWei
  };

  return (
    <CarbonMarketContext.Provider value={value}>
      {children}
    </CarbonMarketContext.Provider>
  );
}; 