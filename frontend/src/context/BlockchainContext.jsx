import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import CharityABI from '../contracts/CharityABI.json';
import { useAuth } from './AuthContext';

const BlockchainContext = createContext(null);

export const BlockchainProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const { currentUser, accountType } = useAuth();

  // Contract address - should be stored in an environment variable in production
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Example address

  useEffect(() => {
    const initBlockchain = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if MetaMask is installed
        if (window.ethereum) {
          // Create a new provider
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(web3Provider);

          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);

          // Create a signer
          const web3Signer = web3Provider.getSigner();
          setSigner(web3Signer);

          // Create a contract instance
          const charityContract = new ethers.Contract(contractAddress, CharityABI, web3Signer);
          setContract(charityContract);

          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            setAccount(accounts[0]);
          });
        } else {
          setError('MetaMask is not installed. Please install it to use this application.');
        }
      } catch (err) {
        console.error('Error initializing blockchain:', err);
        setError('Failed to connect to blockchain. Please make sure MetaMask is installed and connected.');
      } finally {
        setLoading(false);
      }
    };

    initBlockchain();

    // Cleanup function
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  // Fetch transaction history for the current user or organization
  useEffect(() => {
    const fetchTransactionHistory = async () => {
      if (!contract || (!currentUser && !accountType)) return;

      try {
        setLoading(true);
        
        // This is a simplified example - in a real application, you would query events from the blockchain
        // For example: const events = await contract.queryFilter(contract.filters.DonationReceived());
        
        // For now, we'll use a mock implementation
        const mockTransactions = [];
        setTransactionHistory(mockTransactions);
      } catch (err) {
        console.error('Error fetching transaction history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionHistory();
  }, [contract, currentUser, accountType]);

  // Donate to a charity
  const donateToCharity = async (charityId, amount) => {
    if (!contract || !signer) {
      throw new Error('Blockchain not initialized');
    }

    try {
      setLoading(true);
      setError(null);

      // Convert amount to wei (1 ether = 10^18 wei)
      const amountInWei = ethers.utils.parseEther(amount.toString());

      // Call the donate function on the smart contract
      const tx = await contract.donate(charityId, { value: amountInWei });
      
      // Wait for the transaction to be mined
      await tx.wait();

      return tx;
    } catch (err) {
      console.error('Error donating to charity:', err);
      setError('Transaction failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fund a task
  const fundTask = async (taskId, amount) => {
    if (!contract || !signer) {
      throw new Error('Blockchain not initialized');
    }

    try {
      setLoading(true);
      setError(null);

      // Convert amount to wei
      const amountInWei = ethers.utils.parseEther(amount.toString());

      // Call the fundTask function on the smart contract
      const tx = await contract.fundTask(taskId, { value: amountInWei });
      
      // Wait for the transaction to be mined
      await tx.wait();

      return tx;
    } catch (err) {
      console.error('Error funding task:', err);
      setError('Transaction failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get charity balance
  const getCharityBalance = async (charityId) => {
    if (!contract) {
      throw new Error('Blockchain not initialized');
    }

    try {
      const balance = await contract.getCharityBalance(charityId);
      return ethers.utils.formatEther(balance);
    } catch (err) {
      console.error('Error getting charity balance:', err);
      throw err;
    }
  };

  // Get task balance
  const getTaskBalance = async (taskId) => {
    if (!contract) {
      throw new Error('Blockchain not initialized');
    }

    try {
      const balance = await contract.getTaskBalance(taskId);
      return ethers.utils.formatEther(balance);
    } catch (err) {
      console.error('Error getting task balance:', err);
      throw err;
    }
  };

  const value = {
    provider,
    signer,
    contract,
    account,
    loading,
    error,
    transactionHistory,
    donateToCharity,
    fundTask,
    getCharityBalance,
    getTaskBalance
  };

  return <BlockchainContext.Provider value={value}>{children}</BlockchainContext.Provider>;
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
}; 