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

  // Refresh data
  const refreshData = async () => {
    setLoading(true);
    
    try {
      // Simulate data refresh with new mock data
      const mockData = getMockMarketData();
      setCarbonCreditPool(mockData.carbonCreditPool);
      setSellerListings(mockData.sellerListings);
      setBuyerListings(mockData.buyerListings);
      setCarbonCredits(mockData.carbonCredits);
      setProjects(mockData.projects);
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
    setLoading(true);
    setError(null);
    
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock account address
      const mockAccount = '0x' + Math.random().toString(16).substr(2, 40);
      setAccount(mockAccount);
      setIsConnected(true);
      setIsScrollNetwork(true);
      
      // Set mock user carbon credits from seeder
      const { carbonCredits } = getMockMarketData();
      setCarbonCredits(carbonCredits);
      
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
    setLoading(true);
    
    try {
      // Simulate network switch
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsScrollNetwork(true);
      toast.success('Switched to Scroll network!');
      return true;
    } catch (err) {
      setError(err.message || 'Failed to switch network');
      toast.error(`Failed to switch network: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Create seller listing
  const createSellerListing = async (company, carbonTons, rate) => {
    setLoading(true);
    
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate new listing
      const newListing = {
        id: `seller-${sellerListings.length + 1}`,
        company,
        carbonTons,
        rate: `${rate} ETH/ton`,
        price: `${(carbonTons * rate).toFixed(4)} ETH`,
        usdPrice: `$${(carbonTons * rate * 2000).toFixed(2)}`,
        seller: account,
        timestamp: new Date().toISOString(),
        status: 'active'
      };
      
      // Update state
      setSellerListings(prev => [...prev, newListing]);
      setCarbonCredits(prev => prev - carbonTons);
      
      toast.success('Seller listing created successfully!');
      return true;
    } catch (err) {
      console.error('Error creating seller listing:', err);
      setError(err.message || 'Failed to create listing');
      toast.error(`Transaction failed: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Create buyer listing
  const createBuyerListing = async (company, carbonTons, rate) => {
    setLoading(true);
    
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate new listing
      const newListing = {
        id: `buyer-${buyerListings.length + 1}`,
        company,
        carbonTons,
        rate: `${rate} ETH/ton`,
        price: `${(carbonTons * rate).toFixed(4)} ETH`,
        usdPrice: `$${(carbonTons * rate * 2000).toFixed(2)}`,
        buyer: account,
        timestamp: new Date().toISOString(),
        status: 'active'
      };
      
      // Update state
      setBuyerListings(prev => [...prev, newListing]);
      
      toast.success('Buyer listing created successfully!');
      return true;
    } catch (err) {
      console.error('Error creating buyer listing:', err);
      setError(err.message || 'Failed to create listing');
      toast.error(`Transaction failed: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Buy carbon credits
  const buyCarbonCredits = async (listingId, priceInWei) => {
    setLoading(true);
    
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Find the listing
      const listing = sellerListings.find(item => item.id === listingId);
      
      if (!listing) {
        throw new Error('Listing not found');
      }
      
      // Update carbon credits
      setCarbonCredits(prev => prev + listing.carbonTons);
      
      // Remove the listing
      setSellerListings(prev => prev.filter(item => item.id !== listingId));
      
      toast.success(`Successfully purchased ${listing.carbonTons} carbon credits!`);
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
      setCarbonCredits(prev => prev - listing.carbonTons);
      
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
    ethToWei
  };

  return (
    <CarbonMarketContext.Provider value={value}>
      {children}
    </CarbonMarketContext.Provider>
  );
}; 