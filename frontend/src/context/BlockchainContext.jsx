import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import CharityABI from '../contracts/CharityABI.json';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const BlockchainContext = createContext(null);

export const BlockchainProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [platformFee, setPlatformFee] = useState(1); // 1%
  const [minDonationAmount, setMinDonationAmount] = useState('0.001');
  const [transactionHistory, setTransactionHistory] = useState([]);
  const { user, organization } = useAuth();

  // Contract address from environment variable
  const contractAddress = process.env.REACT_APP_CHARITY_CONTRACT_ADDRESS;

  useEffect(() => {
    const initBlockchain = async () => {
      try {
        setLoading(true);
        setError(null);

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

          // Get platform fee and min donation amount
          const fee = await charityContract.PLATFORM_FEE();
          setPlatformFee(fee.toNumber());
          
          const minAmount = await charityContract.minDonationAmount();
          setMinDonationAmount(ethers.utils.formatEther(minAmount));

          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            setAccount(accounts[0]);
          });

          // Listen for chain changes
          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          });
        } else {
          setError('MetaMask is not installed. Please install it to use blockchain features.');
        }
      } catch (err) {
        console.error('Error initializing blockchain:', err);
        setError('Failed to connect to blockchain. Please make sure MetaMask is installed and connected.');
      } finally {
        setLoading(false);
      }
    };

    initBlockchain();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [contractAddress]);

  // Fetch transaction history for the current user or organization
  useEffect(() => {
    const fetchTransactionHistory = async () => {
      if (!contract || (!user && !organization)) return;

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
  }, [contract, user, organization]);

  // Calculate total amount including platform fee
  const calculateTotalAmount = (amount) => {
    const baseAmount = ethers.utils.parseEther(amount.toString());
    const fee = baseAmount.mul(platformFee).div(100);
    return {
      baseAmount,
      fee,
      total: baseAmount.add(fee)
    };
  };

  // Donate to a charity
  const donateToCharity = async (charityId, amount) => {
    if (!contract || !signer) {
      throw new Error('Blockchain not initialized');
    }

    try {
      setLoading(true);
      setError(null);

      const { total } = calculateTotalAmount(amount);

      // Call the donate function
      const tx = await contract.donate(charityId, { value: total });
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();

      // Get the DonationReceived event
      const event = receipt.events?.find(e => e.event === 'DonationReceived');
      if (event) {
        const [charityId, donor, amount, fee, timestamp] = event.args;
        toast.success(`Donation of ${ethers.utils.formatEther(amount)} ETH successful!`);
      }

      return tx;
    } catch (err) {
      console.error('Error donating to charity:', err);
      setError(err.message || 'Transaction failed. Please try again.');
      toast.error(err.message || 'Transaction failed. Please try again.');
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

      const { total } = calculateTotalAmount(amount);

      // Call the fundTask function
      const tx = await contract.fundTask(taskId, { value: total });
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();

      // Get the TaskFunded event
      const event = receipt.events?.find(e => e.event === 'TaskFunded');
      if (event) {
        const [taskId, donor, amount, fee, timestamp] = event.args;
        toast.success(`Task funding of ${ethers.utils.formatEther(amount)} ETH successful!`);
      }

      return tx;
    } catch (err) {
      console.error('Error funding task:', err);
      setError(err.message || 'Transaction failed. Please try again.');
      toast.error(err.message || 'Transaction failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add a milestone
  const addMilestone = async (taskId, description, amount, deadline) => {
    if (!contract || !signer) {
      throw new Error('Blockchain not initialized');
    }

    try {
      setLoading(true);
      setError(null);

      const tx = await contract.addMilestone(
        taskId,
        description,
        ethers.utils.parseEther(amount.toString()),
        Math.floor(deadline.getTime() / 1000)
      );
      
      await tx.wait();
      toast.success('Milestone added successfully!');

      return tx;
    } catch (err) {
      console.error('Error adding milestone:', err);
      setError(err.message || 'Failed to add milestone.');
      toast.error(err.message || 'Failed to add milestone.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Complete a milestone
  const completeMilestone = async (taskId, milestoneIndex, proofHash) => {
    if (!contract || !signer) {
      throw new Error('Blockchain not initialized');
    }

    try {
      setLoading(true);
      setError(null);

      const tx = await contract.completeMilestone(taskId, milestoneIndex, proofHash);
      await tx.wait();
      toast.success('Milestone completed successfully!');

      return tx;
    } catch (err) {
      console.error('Error completing milestone:', err);
      setError(err.message || 'Failed to complete milestone.');
      toast.error(err.message || 'Failed to complete milestone.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get milestone details
  const getMilestone = async (taskId, milestoneIndex) => {
    if (!contract) {
      throw new Error('Blockchain not initialized');
    }

    try {
      const milestone = await contract.getMilestone(taskId, milestoneIndex);
      return {
        description: milestone.description,
        amount: ethers.utils.formatEther(milestone.amount),
        completed: milestone.completed,
        fundsReleased: milestone.fundsReleased,
        deadline: new Date(milestone.deadline.toNumber() * 1000),
        proofHash: milestone.proofHash
      };
    } catch (err) {
      console.error('Error getting milestone:', err);
      throw err;
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

  return (
    <BlockchainContext.Provider value={{
      provider,
      signer,
      contract,
      account,
      loading,
      error,
      platformFee,
      minDonationAmount,
      transactionHistory,
      donateToCharity,
      fundTask,
      addMilestone,
      completeMilestone,
      getMilestone,
      getCharityBalance,
      getTaskBalance,
      calculateTotalAmount
    }}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
}; 