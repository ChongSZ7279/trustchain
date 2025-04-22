import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  initWeb3, 
  isWalletConnected, 
  getCurrentAccount,
  setupAccountChangeListener
} from '../utils/contractInteraction';

const BlockchainContext = createContext();

export const useBlockchain = () => useContext(BlockchainContext);

export const BlockchainProvider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { web3: web3Instance, contract: contractInstance, account: currentAccount } = await initWeb3();
        
        setWeb3(web3Instance);
        setContract(contractInstance);
        setAccount(currentAccount);
        setIsConnected(!!currentAccount);
        
        // Set up listener for account changes
        setupAccountChangeListener((newAccount) => {
          setAccount(newAccount);
          setIsConnected(!!newAccount);
        });
      } catch (err) {
        console.error('Error initializing blockchain connection:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Attempting to connect wallet...");
      
      const { web3: web3Instance, contract: contractInstance, account: currentAccount } = await initWeb3();
      
      console.log("Connection successful:", { 
        web3: !!web3Instance, 
        contract: !!contractInstance, 
        account: currentAccount 
      });
      
      setWeb3(web3Instance);
      setContract(contractInstance);
      setAccount(currentAccount);
      setIsConnected(!!currentAccount);
      
      console.log("State updated with wallet information");
      
      return true;
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getCharityDonations = async (charityId) => {
    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const donations = await contract.methods.getCharityDonations(charityId).call();
      return donations.map(donation => ({
        transactionHash: donation.transactionHash,
        amount: web3.utils.fromWei(donation.amount, 'ether'),
        donor: donation.donor,
        timestamp: new Date(donation.timestamp * 1000).toISOString()
      }));
    } catch (err) {
      console.error('Error getting charity donations:', err);
      throw err;
    }
  };

  const getDonorTotalAmount = async (address) => {
    try {
      if (!contract) {
        console.warn('Contract not initialized, returning 0 for donation amount');
        return '0';
      }
      
      // Call the contract method to get total donation amount
      const amountWei = await contract.methods.getDonorTotalAmount(address).call();
      return web3.utils.fromWei(amountWei, 'ether');
    } catch (err) {
      console.error('Error getting donor total amount:', err);
      return '0';
    }
  };

  const value = {
    web3,
    contract,
    account,
    isConnected,
    isLoading,
    error,
    connectWallet,
    getCharityDonations,
    getDonorTotalAmount
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
}; 