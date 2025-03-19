import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Web3 from 'web3';
import CharityContract from '../contracts/CharityContract.json';
import { toast } from 'react-hot-toast';

const GlobalTransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [rewardPoints, setRewardPoints] = useState(0);
  
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
  
  useEffect(() => {
    // Fetch user's reward points
    const fetchRewardPoints = async () => {
      try {
        const response = await axios.get('/api/users/rewards', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setRewardPoints(response.data.points);
        setRewards(response.data.rewardHistory || []);
      } catch (error) {
        console.error('Error fetching reward points:', error);
      }
    };
    
    fetchRewardPoints();
  }, []);
  
  // Add a function to redeem rewards
  const redeemReward = async (rewardId, pointsCost) => {
    if (rewardPoints < pointsCost) {
      toast.error("You don't have enough points to redeem this reward");
      return;
    }
    
    try {
      const response = await axios.post('/api/users/rewards/redeem', 
        { rewardId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      
      setRewardPoints(response.data.updatedPoints);
      toast.success("Reward redeemed successfully!");
      
      // Refresh rewards history
      const historyResponse = await axios.get('/api/users/rewards', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRewards(historyResponse.data.rewardHistory || []);
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to redeem reward");
    }
  };
  
  // Add a rewards section to the component
  const renderRewardsSection = () => {
    return (
      <div className="rewards-section mt-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Your Rewards</h2>
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <p className="font-medium">Current Points: <span className="text-blue-600">{rewardPoints}</span></p>
        </div>
        
        <h3 className="text-lg font-medium mb-2">Available Rewards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            { id: 1, name: "5% Discount on Next Donation", points: 100 },
            { id: 2, name: "Exclusive Charity Event Access", points: 250 },
            { id: 3, name: "Charity Partner Certificate", points: 500 },
            { id: 4, name: "Featured Donor Status", points: 1000 }
          ].map(reward => (
            <div key={reward.id} className="border rounded-md p-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{reward.name}</p>
                <p className="text-sm text-gray-600">{reward.points} points</p>
              </div>
              <button
                onClick={() => redeemReward(reward.id, reward.points)}
                disabled={rewardPoints < reward.points}
                className={`px-3 py-1 rounded-md ${
                  rewardPoints >= reward.points 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Redeem
              </button>
            </div>
          ))}
        </div>
        
        <h3 className="text-lg font-medium mb-2">Reward History</h3>
        {rewards.length > 0 ? (
          <div className="border rounded-md divide-y">
            {rewards.map((reward, index) => (
              <div key={index} className="p-3">
                <p className="font-medium">{reward.name}</p>
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">{reward.points} points</p>
                  <p className="text-gray-600">{new Date(reward.redeemedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No rewards redeemed yet</p>
        )}
      </div>
    );
  };
  
  if (loading) {
    return <div className="container mt-5"><p>Loading transactions...</p></div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
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
      
      {/* Add the rewards section */}
      {renderRewardsSection()}
    </div>
  );
};

export default GlobalTransactionList; 