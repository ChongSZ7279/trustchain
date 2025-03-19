import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Web3 from 'web3';
import CharityContract from '../contracts/CharityContract.json';

const GlobalTransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  
  // Initialize Web3
  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          
          // Initialize contract
          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = CharityContract.networks[networkId];
          const contractInstance = new web3Instance.eth.Contract(
            CharityContract.abi,
            deployedNetwork && deployedNetwork.address,
          );
          setContract(contractInstance);
        } catch (error) {
          console.error("Error initializing web3:", error);
        }
      } else {
        // Fallback to a read-only provider
        const provider = new Web3.providers.HttpProvider(
          'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'
        );
        const web3Instance = new Web3(provider);
        setWeb3(web3Instance);
      }
    };
    
    initWeb3();
  }, []);
  
  // Fetch all transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!contract) return;
      
      try {
        // Fetch donation events
        const donationEvents = await contract.getPastEvents('DonationMade', {
          fromBlock: 0,
          toBlock: 'latest'
        });
        
        // Fetch milestone completion events
        const milestoneEvents = await contract.getPastEvents('MilestoneCompleted', {
          fromBlock: 0,
          toBlock: 'latest'
        });
        
        // Format donation events
        const donationTransactions = await Promise.all(donationEvents.map(async event => {
          // Get charity details
          const charityResponse = await axios.get(`/api/charities/blockchain/${event.returnValues.charityId}`);
          
          return {
            type: 'donation',
            charityId: event.returnValues.charityId,
            charityName: charityResponse.data.name,
            from: event.returnValues.donor,
            amount: web3.utils.fromWei(event.returnValues.amount, 'ether'),
            timestamp: new Date(event.returnValues.timestamp * 1000).toLocaleString(),
            transactionHash: event.transactionHash
          };
        }));
        
        // Format milestone events
        const milestoneTransactions = await Promise.all(milestoneEvents.map(async event => {
          // Get charity and milestone details
          const charityResponse = await axios.get(`/api/charities/blockchain/${event.returnValues.charityId}`);
          const milestoneResponse = await axios.get(`/api/milestones/${event.returnValues.milestoneId}`);
          
          return {
            type: 'milestone',
            charityId: event.returnValues.charityId,
            charityName: charityResponse.data.name,
            milestoneId: event.returnValues.milestoneId,
            milestoneName: milestoneResponse.data.title,
            amount: web3.utils.fromWei(event.returnValues.amount, 'ether'),
            timestamp: new Date(event.returnValues.timestamp * 1000).toLocaleString(),
            transactionHash: event.transactionHash
          };
        }));
        
        // Combine and sort by timestamp (newest first)
        const allTransactions = [...donationTransactions, ...milestoneTransactions]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setTransactions(allTransactions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [contract, web3]);
  
  if (loading) {
    return <div className="container mt-5"><p>Loading transactions...</p></div>;
  }
  
  return (
    <div className="container mt-5">
      <h2>Global Transaction List</h2>
      <p className="text-muted">All blockchain transactions across the platform</p>
      
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Type</th>
                <th>Charity</th>
                <th>Details</th>
                <th>Amount (ETH)</th>
                <th>Date</th>
                <th>Transaction</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => (
                <tr key={index}>
                  <td>
                    {tx.type === 'donation' ? (
                      <span className="badge bg-primary">Donation</span>
                    ) : (
                      <span className="badge bg-success">Milestone Completed</span>
                    )}
                  </td>
                  <td>
                    <a href={`/charities/${tx.charityId}`}>{tx.charityName}</a>
                  </td>
                  <td>
                    {tx.type === 'donation' ? (
                      <span>
                        From: {tx.from.substring(0, 6)}...{tx.from.substring(tx.from.length - 4)}
                      </span>
                    ) : (
                      <span>Milestone: {tx.milestoneName}</span>
                    )}
                  </td>
                  <td>{tx.amount}</td>
                  <td>{tx.timestamp}</td>
                  <td>
                    <a 
                      href={`https://etherscan.io/tx/${tx.transactionHash}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-secondary"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GlobalTransactionList; 