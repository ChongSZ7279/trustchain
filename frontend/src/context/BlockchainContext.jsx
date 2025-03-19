import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';
import CharityContract from '../contracts/CharityContract.json';

const BlockchainContext = createContext();

export const useBlockchain = () => useContext(BlockchainContext);

export const BlockchainProvider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Web3
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if MetaMask is installed
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          
          try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Get user account
            const accounts = await web3Instance.eth.getAccounts();
            setAccount(accounts[0]);
            
            // Get network ID
            const network = await web3Instance.eth.net.getId();
            setNetworkId(network);
            
            // Initialize contract
            const deployedNetwork = CharityContract.networks[network];
            if (deployedNetwork) {
              const contractInstance = new web3Instance.eth.Contract(
                CharityContract.abi,
                deployedNetwork.address
              );
              setContract(contractInstance);
            } else {
              setError(`Contract not deployed on network ${network}`);
            }
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
              setAccount(accounts[0]);
            });
            
            // Listen for network changes
            window.ethereum.on('chainChanged', () => {
              window.location.reload();
            });
          } catch (err) {
            console.error("User denied account access or error occurred:", err);
            setError("Please connect your wallet to use blockchain features");
          }
        } else {
          // Fallback to a read-only provider for users without MetaMask
          const provider = new Web3.providers.HttpProvider(
            'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'
          );
          const web3Instance = new Web3(provider);
          setWeb3(web3Instance);
          setError("Please install MetaMask to make donations via blockchain");
        }
      } catch (err) {
        console.error("Error initializing blockchain:", err);
        setError("Failed to initialize blockchain connection");
      } finally {
        setLoading(false);
      }
    };
    
    initWeb3();
    
    // Cleanup function
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Donate to charity function
  const donateToCharity = async (charityId, amount) => {
    if (!contract || !web3 || !account) {
      throw new Error('Blockchain not initialized or wallet not connected');
    }
    
    try {
      const amountInWei = web3.utils.toWei(amount.toString(), 'ether');
      const tx = await contract.methods.donate(charityId).send({
        from: account,
        value: amountInWei
      });
      
      return tx;
    } catch (error) {
      console.error('Error making donation:', error);
      throw error;
    }
  };

  // Verify milestone function
  const verifyMilestone = async (charityId, milestoneId) => {
    if (!contract || !web3 || !account) {
      throw new Error('Blockchain not initialized or wallet not connected');
    }
    
    try {
      const tx = await contract.methods.verifyMilestone(charityId, milestoneId).send({
        from: account
      });
      
      return tx;
    } catch (error) {
      console.error('Error verifying milestone:', error);
      throw error;
    }
  };

  // Get charity donations
  const getCharityDonations = async (charityId) => {
    if (!contract || !web3) {
      throw new Error('Blockchain not initialized');
    }
    
    try {
      const donationEvents = await contract.getPastEvents('DonationMade', {
        filter: { charityId: charityId },
        fromBlock: 0,
        toBlock: 'latest'
      });
      
      return donationEvents.map(event => ({
        donor: event.returnValues.donor,
        amount: web3.utils.fromWei(event.returnValues.amount, 'ether'),
        timestamp: new Date(event.returnValues.timestamp * 1000).toLocaleString(),
        transactionHash: event.transactionHash
      }));
    } catch (error) {
      console.error('Error fetching donations:', error);
      throw error;
    }
  };

  // Get all transactions
  const getAllTransactions = async () => {
    if (!contract || !web3) {
      throw new Error('Blockchain not initialized');
    }
    
    try {
      // Fetch donation events
      const donationEvents = await contract.getPastEvents('DonationMade', {
        fromBlock: 0,
        toBlock: 'latest'
      });
      
      // Fetch milestone events
      const milestoneEvents = await contract.getPastEvents('MilestoneCompleted', {
        fromBlock: 0,
        toBlock: 'latest'
      });
      
      // Format and combine events
      const donations = donationEvents.map(event => ({
        type: 'donation',
        charityId: event.returnValues.charityId,
        donor: event.returnValues.donor,
        amount: web3.utils.fromWei(event.returnValues.amount, 'ether'),
        timestamp: new Date(event.returnValues.timestamp * 1000),
        transactionHash: event.transactionHash
      }));
      
      const milestones = milestoneEvents.map(event => ({
        type: 'milestone',
        charityId: event.returnValues.charityId,
        milestoneId: event.returnValues.milestoneId,
        amount: web3.utils.fromWei(event.returnValues.amount, 'ether'),
        timestamp: new Date(event.returnValues.timestamp * 1000),
        transactionHash: event.transactionHash
      }));
      
      // Combine and sort by timestamp (newest first)
      return [...donations, ...milestones].sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  };

  const value = {
    web3,
    contract,
    account,
    networkId,
    loading,
    error,
    donateToCharity,
    verifyMilestone,
    getCharityDonations,
    getAllTransactions
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
}; 