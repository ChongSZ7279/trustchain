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
      
      const { web3: web3Instance, contract: contractInstance, account: currentAccount } = await initWeb3();
      
      setWeb3(web3Instance);
      setContract(contractInstance);
      setAccount(currentAccount);
      setIsConnected(!!currentAccount);
      
      return true;
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    web3,
    contract,
    account,
    isConnected,
    isLoading,
    error,
    connectWallet
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
}; 