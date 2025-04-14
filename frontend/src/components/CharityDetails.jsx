import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useBlockchain } from '../context/BlockchainContext';
import { formatImageUrl, getFileType, setupGlobalImageErrorHandler } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import DonationForm from './DonationForm';
import BackButton from './BackToHistory';
import { 
  FaChartBar, 
  FaTasks, 
  FaHandHoldingHeart,
  FaExchangeAlt,
  FaFileAlt,
  FaEdit,
  FaTrash,
  FaImages,
  FaPlus,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaClock,
  FaTag,
  FaBullseye,
  FaHeart,
  FaUsers,
  FaExternalLinkAlt,
  FaChevronDown,
  FaShare,
  FaCalendarAlt,
  FaInfoCircle,
  FaCommentAlt,
  FaMapMarkerAlt,
  FaGlobe,
  FaFacebook,
  FaInstagram,
  FaLink,
  FaWallet,
  FaThumbsUp,
  FaBookmark,
  FaFileContract,
  FaFilePdf,
  FaFileWord,
  FaEye,
  FaSync,
  FaCoins,
  FaChartLine,
  FaBuilding,
  FaFilter
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Web3 from 'web3';
import CharityContract from '../contracts/CharityContract.json';
import MilestoneTracker from './MilestoneTracker';
import TransactionHistory from './TransactionHistory';
import BlockchainVerificationBadge from './BlockchainVerificationBadge';
import WalletConnectButton from './WalletConnectButton';
import { verifyTransaction } from '../utils/blockchainUtils';
import { getCharityDonations } from '../services/donationService';
import API_BASE_URL from '../config/api';

// Add this helper function at the top of the file, after imports
const getFileIcon = (fileType) => {
  if (fileType?.includes('pdf')) return <FaFilePdf className="text-red-500 text-xl" />;
  if (fileType?.includes('word') || fileType?.includes('doc')) return <FaFileWord className="text-blue-500 text-xl" />;
  if (fileType?.includes('image')) return <FaImages className="text-green-500 text-xl" />;
  return <FaFileAlt className="text-gray-500 text-xl" />;
};

const formatCurrency = (amount) => {
  if (!amount) return '0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Add this helper function at the top of your file
const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Update these functions to handle undefined values
const getStatusColor = (status) => {
  if (!status) return 'bg-gray-100 text-gray-800';
  
  switch (status.toLowerCase()) {
    case 'completed':
    case 'verified':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status) => {
  if (!status) return null;
  
  switch (status.toLowerCase()) {
    case 'completed':
    case 'verified':
      return <FaCheckCircle className="mr-1.5 h-2 w-2 text-green-500" />;
    case 'pending':
      return <FaClock className="mr-1.5 h-2 w-2 text-yellow-500" />;
    case 'failed':
      return <FaExclamationTriangle className="mr-1.5 h-2 w-2 text-red-500" />;
    default:
      return null;
  }
};

// Add this helper function at the top of your file
const FundingProgress = ({ current, target, donorCount, endDate, className = "" }) => {
  const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const statusColor = progress >= 100 ? 'green' : progress >= 75 ? 'blue' : 'indigo';
  
  try {
    return (
      <div className={`funding-progress ${className}`}>
        <div className="flex justify-between items-center text-sm mb-2">
          <div className="flex items-center space-x-2">
            <FaChartLine className={`text-${statusColor}-600`} />
            <span className="font-medium text-gray-700">
              {progress.toFixed(1)}% Funded
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FaCoins className="text-yellow-600" />
            <span className="font-medium text-gray-900">
              {formatCurrency(current)} / {formatCurrency(target)}
            </span>
          </div>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full bg-${statusColor}-600 transition-all duration-500 ease-in-out`}
            style={{ width: `${progress}%` }}
          >
            <div className="h-full w-full animate-pulse bg-white opacity-20"></div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <FaUsers className="text-gray-400" />
            <span>{donorCount || 0} Donors</span>
          </div>
          <span>{getRemainingDays(endDate)} days left</span>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in FundingProgress:', error);
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-600 text-sm">Error displaying funding progress</p>
      </div>
    );
  }
};

// Add this helper function
const getRemainingDays = (endDate) => {
  if (!endDate) return 0;
  const end = new Date(endDate);
  const now = new Date();
  const diff = end - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export default function CharityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const { currentUser, accountType } = auth;
  
  // Debug auth context
  console.log("CharityDetails - Full Auth Context:", auth);
  console.log("CharityDetails - User Type:", accountType);

  const [charity, setCharity] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [donations, setDonations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('milestones');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [taskDeleteLoading, setTaskDeleteLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [account, setAccount] = useState('');
  const [milestones, setMilestones] = useState([]);
  const [userToken, setUserToken] = useState(localStorage.getItem('token'));

  // Add new loading states
  const [imageLoading, setImageLoading] = useState({
    cover: true
  });

  // Add new state for document preview
  const [documentPreview, setDocumentPreview] = useState({
    type: null,
    url: null,
    name: null
  });

  const blockchainContext = useBlockchain() || {};
  const { 
    account: blockchainAccount, 
    isLoading: blockchainLoading, 
    error: blockchainError,
    contract,
    web3,
    isConnected,
    connectWallet
  } = blockchainContext;
  
  const [blockchainDonations, setBlockchainDonations] = useState([]);
  const [donationLoading, setDonationLoading] = useState(false);

  // Add a new state for combined transactions
  const [transactionsList, setTransactionsList] = useState([]);

  // Add a state for the current data source
  const [currentDataSource, setCurrentDataSource] = useState('transactions');

  // Add a loading state for blockchain donations
  const [isLoadingBlockchainDonations, setIsLoadingBlockchainDonations] = useState(false);
  const [blockchainDonationsError, setBlockchainDonationsError] = useState(null);

  // Add a function to load data based on the current data source
  const loadDataBySource = async (source) => {
    try {
      let endpoint;
      if (source === 'transactions') {
        endpoint = `/charities/${id}/transactions`;
      } else if (source === 'donations') {
        endpoint = `/charities/${id}/donations`;
      } else if (source === 'combined') {
        endpoint = `/charities/${id}/financial-activities`;
      }
      
      console.log(`Loading data from ${endpoint}`);
      const response = await axios.get(endpoint);
      console.log(`${source} data:`, response.data);
      
      // Handle both paginated and non-paginated responses
      const data = response.data.data ? response.data.data : response.data;
      setTransactionsList(data);
    } catch (error) {
      console.error(`Error loading ${source} data:`, error);
      setTransactionsList([]);
    }
  };

  // Call this function when the component mounts or when the data source changes
  useEffect(() => {
    if (currentUser && id) {
      loadDataBySource(currentDataSource);
    }
  }, [currentUser, id, currentDataSource]);

  // Initialize Web3 and smart contract
  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          
          // Get user account
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
          
          // Initialize contract
          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = CharityContract.networks[networkId];
          const contractInstance = new web3Instance.eth.Contract(
            CharityContract.abi,
            deployedNetwork && deployedNetwork.address,
          );
          setContract(contractInstance);
        } catch (error) {
          console.error("User denied account access or error occurred:", error);
        }
      } else {
        console.log('Please install MetaMask or another Web3 provider');
      }
    };
    
    initWeb3();
  }, []);

  useEffect(() => {
    fetchCharityData();
    // Reset scroll position when viewing a new charity
    window.scrollTo(0, 0);
  }, [id]);

  // Check follow status when the component mounts
  useEffect(() => {
    // Only check follow status if user is logged in and not an organization
    if (currentUser && !isOrganizationUser()) {
      const checkFollowStatus = async () => {
        try {
          setFollowLoading(true);
          console.log(`Checking follow status for charity ${id}`);
          const response = await axios.get(`/charities/${id}/follow-status`);
          console.log('Follow status response:', response.data);
          
          if (response.data && response.data.is_following !== undefined) {
            setIsFollowing(response.data.is_following);
            if (response.data.follower_count !== undefined) {
              setFollowerCount(response.data.follower_count);
            }
          }
        } catch (error) {
          console.error('Error checking follow status:', error);
        } finally {
          setFollowLoading(false);
        }
      };
      
      checkFollowStatus();
    }
  }, [currentUser, id]);

  // Add a function to check if the current user is an organization
  const isOrganizationUser = () => {
    // Add debugging logs
    console.log("CharityDetails - isOrganizationUser check:", { 
      currentUser: currentUser ? 'exists' : 'null', 
      accountType,
      userAccountType: currentUser?.account_type,
      isUserOrganization: currentUser?.is_organization,
      charityOrgId: charity?.organization_id,
      currentUserId: currentUser?.id,
    });
    
    // More thorough check for organization status
    const isOrg = 
      // Check context accountType
      accountType === 'organization' || 
      // Check user's account_type property
      currentUser?.account_type === 'organization' ||
      // Check is_organization flag
      currentUser?.is_organization === true ||
      // Check if current user ID matches the charity's organization ID
      (currentUser?.id && charity?.organization_id && currentUser.id.toString() === charity.organization_id.toString());
    
    console.log("CharityDetails - isOrganizationUser result:", isOrg);
    
    return isOrg;
  };

  const fetchCharityData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching charity data for ID:", id);
      
      const response = await axios.get(`/charities/${id}`);
      const charityData = response.data;
      
      console.log("Charity data received:", charityData);
      
      setCharity(charityData);
      
      if (charityData.organization_id) {
        try {
          const orgResponse = await axios.get(`/organizations/${charityData.organization_id}`);
          setOrganization(orgResponse.data);
        } catch (err) {
          console.error('Error fetching organization:', err);
        }
      }
      
      try {
        const tasksRes = await axios.get(`/charities/${id}/tasks`);
        console.log("Tasks response:", tasksRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setTasks([]);
      }
      
      // Fetch transactions only if user is authorized
      if (currentUser) {
        try {
          console.log("Fetching transactions for charity ID:", id);
          const transactionsRes = await axios.get(`/charities/${id}/transactions`);
          console.log("Transactions response:", transactionsRes.data);
          setTransactions(transactionsRes.data);
          
          // Also set the transactionsList state with the initial data
          setTransactionsList(transactionsRes.data);
        } catch (err) {
          console.error('Error fetching transactions:', err);
          setTransactions([]);
          setTransactionsList([]);
        }
        
        try {
          console.log("Fetching donations for charity ID:", id);
          const donationsRes = await axios.get(`${API_BASE_URL}/charities/${id}/donations`);
          console.log("Donations response:", donationsRes.data);
          setDonations(donationsRes.data.data || donationsRes.data);
        } catch (err) {
          console.error('Error fetching donations:', err);
          setDonations([]);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching charity:', err);
      setError('Failed to load charity details. Please try again.');
      setLoading(false);
    }
  };

  const canManageCharity = () => {
    const canEdit = currentUser && currentUser.id === charity?.organization_id;
    return canEdit;
  };

  const calculateProgress = () => {
    if (!charity?.fund_targeted) return 0;
    return Math.min(100, (charity.fund_received / charity.fund_targeted) * 100);
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      setTaskDeleteLoading(true);
      await axios.delete(`/tasks/${taskId}`);
      // Remove the deleted task from the tasks array
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setTaskDeleteLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!userToken) {
      toast.error("Please log in to follow charities");
      // Redirect to login or show login modal
      return;
    }
    
    // Prevent organization users from following charities
    if (isOrganizationUser()) {
      toast.error("Organizations cannot follow charities");
      return;
    }
    
    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const response = await axios.post(`/api/charities/${id}/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      setIsFollowing(!isFollowing);
      setFollowerCount(response.data.updatedFollowerCount);
      
      toast.success(isFollowing ? 
        "You've unfollowed this charity" : 
        "You're now following this charity! You'll receive updates about their activities."
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update follow status");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: charity?.name,
        text: `Check out ${charity?.name} on our platform!`,
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback - copy URL to clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          toast.success('URL copied to clipboard!');
          setShowShareTooltip(true);
        })
        .catch(err => console.error('Error copying to clipboard:', err));
    }
  };

  const handleQuickDonate = (amount) => {
    setDonationAmount(amount);
    setShowDonationModal(true);
  };

  const submitDonation = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Validate the donation amount
    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }
    
    // Close the modal and navigate to the donation page
    setShowDonationModal(false);
    navigate(`/charities/${id}/donate?amount=${amount}`);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTimeRemaining = () => {
    if (!charity?.end_date) return null;
    
    const endDate = new Date(charity.end_date);
    const now = new Date();
    const timeRemaining = endDate - now;
    
    if (timeRemaining <= 0) return 'Ended';
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    return `${days} days left`;
  };

  const handleDonation = async (amount, transactionHash, isBlockchain) => {
    try {
      setDonationLoading(true);
      
      if (transactionHash) {
        toast.success(
          isBlockchain 
            ? 'Donation successful! Transaction has been recorded on the blockchain.' 
            : 'Donation successful! Thank you for your contribution.'
        );
        setShowDonationModal(false);
        
        // Add console logs to debug
        console.log("Donation successful, refreshing data...");
        
        // Refresh charity data
        await fetchCharityData();
        
        // Explicitly fetch donations again
        try {
          const donationsResponse = await axios.get(`${API_BASE_URL}/charities/${id}/donations`);
          console.log("Fetched donations:", donationsResponse.data);
          // Handle paginated response
          setDonations(donationsResponse.data.data || donationsResponse.data);
        } catch (donationError) {
          console.error("Error fetching donations:", donationError);
        }
        
        // Also refresh blockchain donations if the contract is available
        try {
          if (contract && charity?.blockchain_id) {
            const donations = await contract.methods.getCharityDonations(charity.blockchain_id).call();
            const formattedDonations = donations.map(donation => ({
              transactionHash: donation.transactionHash,
              amount: web3.utils.fromWei(donation.amount, 'ether'),
              donor: donation.donor,
              timestamp: new Date(donation.timestamp * 1000).toISOString()
            }));
            console.log("Fetched blockchain donations:", formattedDonations);
            setBlockchainDonations(formattedDonations);
          }
        } catch (blockchainError) {
          console.error("Error fetching blockchain donations:", blockchainError);
          // Only show error toast if it's not a "Contract not initialized" error
          if (blockchainError.message !== 'Contract not initialized') {
            toast.error('Failed to fetch blockchain donations');
          }
        }
      } else {
        toast.error('Donation process was incomplete. Please try again.');
      }
    } catch (error) {
      console.error('Error processing donation:', error);
      toast.error('There was an error processing your donation.');
    } finally {
      setDonationLoading(false);
    }
  };

  // Update the useEffect for fetching blockchain donations
  useEffect(() => {
    const fetchBlockchainDonations = async () => {
      if (!charity?.blockchain_id || !contract || !web3) {
        setBlockchainDonations([]);
        return;
      }

      try {
        setIsLoadingBlockchainDonations(true);
        setBlockchainDonationsError(null);
        
        const donations = await contract.methods.getCharityDonations(charity.blockchain_id).call();
        const formattedDonations = donations.map(donation => ({
          transactionHash: donation.transactionHash,
          amount: web3.utils.fromWei(donation.amount, 'ether'),
          donor: donation.donor,
          timestamp: new Date(donation.timestamp * 1000).toISOString()
        }));
        setBlockchainDonations(formattedDonations);
      } catch (error) {
        console.error('Error fetching blockchain donations:', error);
        setBlockchainDonationsError(error.message);
        setBlockchainDonations([]);
      } finally {
        setIsLoadingBlockchainDonations(false);
      }
    };
    
    fetchBlockchainDonations();
  }, [charity, contract, web3]);

  // Update the useEffect for combining transactions
  useEffect(() => {
    // Add console logs to debug
    console.log("Transactions:", transactions);
    console.log("Blockchain donations:", blockchainDonations);
    
    if (transactions.length > 0 || blockchainDonations.length > 0) {
      // Format blockchain donations to match transaction structure
      const formattedBlockchainDonations = blockchainDonations.map(donation => ({
        id: donation.transactionHash || `blockchain-${Math.random().toString(36).substr(2, 9)}`,
        transaction_hash: donation.transactionHash,
        type: 'blockchain_donation',
        amount: donation.amount,
        status: 'completed',
        created_at: donation.timestamp ? new Date(donation.timestamp).toISOString() : new Date().toISOString(),
        donor: donation.donor,
        is_blockchain: true
      }));
      
      // Get unique transactions by transaction_hash to avoid duplicates
      const uniqueTransactions = [...transactions];
      
      // Only add blockchain transactions that aren't already in the database
      formattedBlockchainDonations.forEach(blockchainTx => {
        if (!uniqueTransactions.some(tx => tx.transaction_hash === blockchainTx.transaction_hash)) {
          uniqueTransactions.push(blockchainTx);
        }
      });
      
      // Sort by date (newest first)
      const combined = uniqueTransactions.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      console.log("Combined transactions:", combined);
      setTransactionsList(combined);
    } else {
      setTransactionsList([]);
    }
  }, [transactions, blockchainDonations]);

  // Keep the useMemo for the comprehensive combined transactions
  const combinedTransactions = useMemo(() => {
    const formattedTransactions = transactions.data?.map(tx => ({
      ...tx,
      is_blockchain: false,
      type: tx.type || 'transaction'
    })) || [];
    
    const formattedDonations = donations.data?.map(donation => ({
      ...donation,
      is_blockchain: false,
      type: 'donation',
      // Map cause_id to charity_id for consistency
      charity_id: donation.cause_id
    })) || [];
    
    const formattedBlockchainDonations = blockchainDonations.map(tx => ({
      ...tx,
      is_blockchain: true,
      type: 'donation',
      status: 'completed'
    }));
    
    return [...formattedTransactions, ...formattedDonations, ...formattedBlockchainDonations]
      .sort((a, b) => new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp));
  }, [transactions, donations, blockchainDonations]);

  // Add this at the beginning of your component
  useEffect(() => {
    // Set up global image error handling
    setupGlobalImageErrorHandler();
  }, []);

  // Add this function to your component
  const verifyBlockchainTransaction = async (transactionHash) => {
    try {
      const result = await verifyTransaction(transactionHash);
      
      if (result.verified) {
        toast.success('Transaction verified on blockchain!');
        console.log('Transaction details:', result.details);
        
        // You could display these details in a modal or tooltip
        setVerificationDetails(result.details);
        setShowVerificationModal(true);
      } else {
        toast.error(`Verification failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Error during verification:', error);
      toast.error('Could not verify transaction');
    }
  };

  // Add a function to handle wallet connection with feedback
  const handleConnectWallet = async () => {
    try {
      toast.loading('Connecting to wallet...', { id: 'wallet-connect' });
      
      console.log("Attempting wallet connection from CharityDetails");
      const success = await connectWallet();
      
      if (success) {
        toast.success('Wallet connected successfully!', { id: 'wallet-connect' });
        console.log("Wallet connected successfully");
      } else {
        toast.error('Failed to connect wallet', { id: 'wallet-connect' });
        console.log("Wallet connection failed");
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast.error(`Wallet connection error: ${error.message}`, { id: 'wallet-connect' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading charity details...</p>
            <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !charity) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-gray-50"
      >
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md mx-4">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">{error || 'Charity not found'}</h3>
          <p className="text-gray-600 mb-6">We couldn't find the charity you're looking for. Please try again later.</p>
          <button
            onClick={() => navigate('/charities')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" />
            Back to Charities
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      <BackButton />

      {/* Charity Profile Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          {/* Cover Image */}
          <div className="relative h-64 w-full overflow-hidden">
            <div className={`absolute inset-0 bg-gray-200 ${imageLoading.cover ? 'animate-pulse' : ''}`}></div>
            {charity?.picture_path ? (
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${formatImageUrl(charity.picture_path)})`,
                  zIndex: 1 
                }}
                onLoad={() => setImageLoading(prev => ({ ...prev, cover: false }))}
              ></div>
            ) : (
              <div className="absolute inset-0 bg-gray-300 flex items-center justify-center" style={{ zIndex: 1 }}>
                <FaImages className="h-16 w-16 text-gray-400" />
              </div>
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" style={{ zIndex: 2 }}></div>
          </div>
          
          {/* Charity Info Section */}
          <div className="p-6 relative -mt-20" style={{ zIndex: 3 }}>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Charity Image */}
              <div className="relative">
                <div className={`h-24 w-24 md:h-28 md:w-28 border-4 border-white rounded-xl overflow-hidden shadow-md transition-opacity duration-300 bg-white ${imageLoading.cover ? 'animate-pulse' : ''}`}>
                  {charity?.picture_path ? (
                    <img
                      src={formatImageUrl(charity.picture_path)}
                      alt={charity?.name}
                      className="h-full w-full object-cover"
                      onLoad={() => setImageLoading(prev => ({ ...prev, cover: false }))}
                      onError={(e) => {
                        console.error('Error loading charity image:', e);
                        e.target.src = 'https://placehold.co/128';
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-200">
                      <FaImages className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Charity Info */}
              <div className="flex-1 mt-4 md:mt-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-800 flex items-center">
                    <FaTag className="mr-1" />
                    {charity?.category || 'CATEGORY'}
                  </span>
                  {charity?.is_verified ? (
                    <span className="px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 flex items-center">
                      <FaCheckCircle className="mr-1" />
                      VERIFIED
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      PENDING
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-1">{charity?.name}</h1>

                {organization && (
                  <div className="flex items-center text-gray-600 text-sm mt-2">
                    <FaBuilding className="mr-2 text-gray-500" />
                    <Link to={`/organizations/${organization.id}`} className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200">
                      {organization.name}
                    </Link>
                  </div>
                )}

                <div className="flex items-center text-gray-600 text-sm mt-2">
                  <FaUsers className="mr-2 text-gray-500" />
                  <span>Helping {charity.people_affected ? parseInt(charity.people_affected).toLocaleString() : '0'} people</span>
                </div>
                
                <div className="flex items-center text-gray-600 text-sm mt-2">
                  <FaCalendarAlt className="mr-2 text-gray-500" />
                  <span>{getTimeRemaining()}</span>
                </div>

                {/* Fund Progress */}
                <div className="mt-4">
                  <FundingProgress 
                    current={charity?.fund_received || 0}
                    target={charity?.fund_targeted || 0}
                    donorCount={charity?.donor_count}
                    endDate={charity?.end_date}
                    className="mb-4"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4 md:mt-0 self-end md:self-center">
                {currentUser && (
                  <>
                    {/* Only show follow button for non-organization users */}
                    {!isOrganizationUser() && (
                      <button
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center ${
                          isFollowing 
                            ? 'bg-gray-100 text-indigo-600 hover:bg-gray-200 border border-indigo-600' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {followLoading ? (
                          <div className="animate-spin h-4 w-4 border-2 border-current rounded-full border-t-transparent mr-2"></div>
                        ) : (
                          <FaThumbsUp className="mr-2" />
                        )}
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}

                    {/* Donate button */}
                    <button
                      onClick={() => setShowDonationModal(true)}
                      className="px-4 py-2 rounded-lg font-medium text-sm bg-green-600 text-white hover:bg-green-700 transition-all duration-200 flex items-center"
                    >
                      <FaHandHoldingHeart className="mr-2" />
                      Donate
                    </button>

                    <div className="relative">
                      <button
                        onClick={handleShare}
                        className="px-4 py-2 rounded-lg font-medium text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center"
                      >
                        <FaShare className="mr-2" />
                        Share
                      </button>
                      {showShareTooltip && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 text-white text-xs py-2 px-3 rounded z-10 shadow-lg">
                          Link copied to clipboard!
                        </div>
                      )}
                    </div>
                  </>
                )}

                {canManageCharity() && (
                  <Link
                    to={`/charities/${id}/edit`}
                    className="px-4 py-2 rounded-lg font-medium text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 text-center flex items-center"
                  >
                    <FaEdit className="mr-2" />
                    Edit
                  </Link>
                )}
              </div>
            </div>
            
            {/* Description Summary */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                {charity.description?.substring(0, 200) + (charity.description?.length > 200 ? '...' : '') || 'No description provided.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-t-xl shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('about')}
              className={`py-4 px-6 font-medium text-sm flex items-center transition-colors duration-200 ${
                activeTab === 'about'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaInfoCircle className={`mr-2 ${activeTab === 'about' ? 'text-indigo-500' : 'text-gray-400'}`} />
              About
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`py-4 px-6 font-medium text-sm flex items-center transition-colors duration-200 ${
                activeTab === 'milestones'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaTasks className={`mr-2 ${activeTab === 'milestones' ? 'text-indigo-500' : 'text-gray-400'}`} />
              Milestones
              {tasks.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800">
                  {tasks.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-6 font-medium text-sm flex items-center transition-colors duration-200 ${
                activeTab === 'transactions'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaExchangeAlt className={`mr-2 ${activeTab === 'transactions' ? 'text-indigo-500' : 'text-gray-400'}`} />
              Transactions
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <AnimatePresence mode="wait">
          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-b-xl shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <FaInfoCircle className="mr-3 text-indigo-500" />
                  Charity Information
                </h2>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <FaBullseye className="mr-2 text-indigo-500" />
                    Description & Details
                  </h3>
                  <div className="bg-gray-50 p-5 rounded-lg shadow-inner">
                    <div className="mb-5">
                      <span className="text-sm font-medium text-gray-500 block mb-2">Description</span>
                      <p className="text-gray-900">{charity.description || 'No description provided.'}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500 block mb-2">Category</span>
                        <span className="text-gray-900">{charity.category || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 block mb-2">Status</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          charity.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : charity.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {charity.status === 'active' && <FaCheckCircle className="mr-1" />}
                          {charity.status === 'completed' && <FaCheckCircle className="mr-1" />}
                          {charity.status ? (charity.status.charAt(0).toUpperCase() + charity.status.slice(1)) : 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 block mb-2">Created On</span>
                        <span className="text-gray-900">{formatDate(charity.created_at)}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 block mb-2">End Date</span>
                        <span className="text-gray-900">
                          {charity.end_date ? formatDate(charity.end_date) : 'Ongoing'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <FaBuilding className="mr-2 text-indigo-500" />
                    Organization Information
                  </h3>
                  {organization ? (
                    <div className="bg-gray-50 p-5 rounded-lg shadow-inner">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500 block mb-2">Organization Name</span>
                          <Link to={`/organizations/${organization.id}`} className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200">
                            {organization.name || 'Unknown Organization'}
                          </Link>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 block mb-2">Contact Email</span>
                          <span className="text-gray-900">{organization.gmail || 'Not provided'}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 block mb-2">Phone Number</span>
                          <span className="text-gray-900">{organization.phone_number || 'Not provided'}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 block mb-2">Address</span>
                          <span className="text-gray-900">{organization.register_address || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-5 rounded-lg shadow-inner text-gray-500 italic">
                      Organization details not available
                    </div>
                  )}
                </div>

                {/* Document Verification Section */}
                {charity?.verified_document && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <FaFileContract className="mr-2 text-indigo-500" />
                      Verification Documents
                    </h3>
                    <div className="bg-gray-50 p-5 rounded-lg shadow-inner">
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(getFileType(charity.verified_document))}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 truncate">
                                {charity.verified_document.split('/').pop()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {getFileType(charity.verified_document)}
                              </p>
                            </div>
                          </div>
                          <a 
                            href={formatImageUrl(charity.verified_document)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 rounded-md text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                          >
                            <FaEye className="mr-1" />
                            View
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'milestones' && (
            <motion.div
              key="milestones"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-b-xl shadow-sm overflow-hidden p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FaTasks className="mr-3 text-indigo-500" />
                Charity Milestones
              </h2>
              
              {tasks.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-indigo-200"></div>
                  
                  <div className="space-y-12">
                    {[...tasks].reverse().map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        className={`relative flex items-center ${
                          index % 2 === 0 ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        {/* Timeline dot */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 w-5 h-5 bg-indigo-600 rounded-full border-4 border-white shadow-md z-10"></div>
                        
                        {/* Content box */}
                        <div className={`w-5/12 bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 ${
                          index % 2 === 0 ? 'mr-auto' : 'ml-auto'
                        }`}>
                          <div className="p-6">
                            {/* Status Badge */}
                            <div className="flex justify-end mb-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                task.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : task.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {task.status === 'completed' && <FaCheckCircle className="mr-1" />}
                                {task.status === 'in_progress' && <FaClock className="mr-1" />}
                                {task.status ? (task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')) : 'Unknown'}
                              </span>
                            </div>

                            {/* Task Title and Date */}
                            <div className="mb-4 flex justify-between items-start">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900">{task.name}</h3>
                                <p className="text-sm text-gray-500 mt-1 flex items-center">
                                  <FaCalendarAlt className="mr-1" />
                                  {formatDate(task.created_at)}
                                </p>
                              </div>
                              {canManageCharity() && (
                                <div className="flex gap-2">
                                  <Link
                                    to={`/charities/${id}/tasks/${task.id}/edit`}
                                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors duration-200"
                                  >
                                    <FaEdit className="mr-1" />
                                    Edit
                                  </Link>
                                  <button
                                    onClick={() => deleteTask(task.id)}
                                    disabled={taskDeleteLoading}
                                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors duration-200"
                                  >
                                    {taskDeleteLoading ? (
                                      <div className="animate-spin h-3 w-3 border-2 border-current rounded-full border-t-transparent mr-1"></div>
                                    ) : (
                                      <FaTrash className="mr-1" />
                                    )}
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            {/* Task Description */}
                            <div className="bg-gray-50 p-3 rounded-lg mb-6">
                              <p className="text-gray-700">{task.description}</p>
                            </div>
                            
                            {/* Task Pictures */}
                            {task.pictures && task.pictures.length > 0 && (
                              <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                  <FaImages className="mr-1 text-indigo-500" />
                                  Progress Images
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {task.pictures.map((picture, picIndex) => (
                                    <div key={picIndex} className="relative h-48 rounded-lg overflow-hidden shadow-md group">
                                      <img
                                        src={formatImageUrl(picture.path)}
                                        alt={`${task.name} - Image ${picIndex + 1}`}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                          console.error('Error loading task picture:', e);
                                          e.target.src = 'https://placehold.co/400x300?text=Image+Not+Found';
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Proof Document Preview */}
                            {task.proof && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                  <FaFileAlt className="mr-1 text-indigo-500" />
                                  Proof Document
                                </h4>
                                <div className="p-3 bg-white rounded-lg border border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      {getFileIcon(getFileType(task.proof))}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900 truncate">
                                          {task.proof.split('/').pop()}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {getFileType(task.proof)}
                                        </p>
                                      </div>
                                    </div>
                                    <a 
                                      href={formatImageUrl(task.proof)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-3 py-1 rounded-md text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                                    >
                                      <FaEye className="mr-1" />
                                      View
                                    </a>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Funding Progress */}
                            {task.fund_targeted > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                  <FaChartBar className="mr-1 text-indigo-500" />
                                  Funding Progress
                                </h4>
                                <FundingProgress 
                                  current={task.current_amount || 0}
                                  target={task.fund_targeted || 0}
                                  donorCount={task.donor_count}
                                  endDate={task.end_date}
                                  className="border border-gray-100 rounded-lg p-4"
                                />
                                {task.status === 'completed' && (
                                  <div className="mt-2 flex items-center justify-center text-green-600 text-sm">
                                    <FaCheckCircle className="mr-1" />
                                    Funding goal achieved!
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center mt-4">
                  <FaInfoCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Milestones Found</h3>
                  <p className="text-gray-600 mb-4">This charity hasn't added any milestones yet.</p>
                  {canManageCharity() && (
                    <Link
                      to={`/charities/${id}/tasks/create`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                    >
                      <FaPlus className="mr-2" />
                      Add First Milestone
                    </Link>
                  )}
                </div>
              )}

              {/* Add Milestone Button - only show if there are milestones and user can manage */}
              {canManageCharity() && tasks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 flex justify-center"
                >
                  <Link
                    to={`/charities/${id}/tasks/create`}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    <FaPlus className="mr-2" />
                    Add New Milestone
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-b-xl shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <FaExchangeAlt className="mr-3 text-indigo-500" />
                  Financial Transactions
                </h2>
                
                {/* Data source filter */}
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="font-medium text-gray-700 flex items-center">
                      <FaFilter className="mr-2 text-indigo-500" />
                      <span>View:</span>
                    </div>
                    <div className="flex-grow">
                      <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
                        onChange={(e) => {
                          const newDataSource = e.target.value;
                          setCurrentDataSource(newDataSource);
                        }}
                        value={currentDataSource}
                      >
                        <option value="transactions">All Transactions</option>
                        <option value="donations">Donations Only</option>
                        <option value="combined">Combined Activities</option>
                      </select>
                    </div>
                    {currentUser && (
                      <button
                        onClick={() => loadDataBySource(currentDataSource)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors duration-200"
                      >
                        <FaSync className="mr-2" />
                        Refresh
                      </button>
                    )}
                  </div>
                </div>
                
                {currentUser ? (
                  transactionsList.length > 0 ? (
                    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Transaction ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(Array.isArray(transactionsList) ? transactionsList : []).map(transaction => {
                            if (!transaction) return null; // Skip null or undefined transactions
                            
                            return (
                              <tr key={transaction.id || transaction.transaction_hash || Math.random()} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(transaction.created_at || new Date())}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                  {(() => {
                                    const id = transaction.transaction_hash || transaction.id;
                                    if (!id) return 'N/A';
                                    return typeof id === 'string' ? id.slice(0, 8) + '...' : `#${id}`;
                                  })()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                    ${transaction.type === 'donation' ? 'bg-green-100 text-green-800' : 
                                      transaction.type === 'withdrawal' ? 'bg-red-100 text-red-800' : 
                                      'bg-blue-100 text-blue-800'}`}>
                                    {transaction.type === 'donation' && <FaHandHoldingHeart className="mr-1" />}
                                    {transaction.type === 'withdrawal' && <FaMoneyBillWave className="mr-1" />}
                                    {(!transaction.type || transaction.type === 'transaction') && <FaExchangeAlt className="mr-1" />}
                                    {transaction.type?.charAt(0).toUpperCase() + transaction.type?.slice(1) || 'Transaction'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {transaction.amount ? 
                                    <span className="font-mono">
                                      {transaction.amount} {transaction.currency_type || transaction.is_blockchain ? 'ETH' : 'USD'}
                                    </span> : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                    {getStatusIcon(transaction.status)}
                                    {formatStatus(transaction.status)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <button
                                    onClick={() => {
                                      // Navigate to the appropriate details page based on transaction type
                                      const path = transaction.type === 'donation' 
                                        ? `/donations/${transaction.id}` 
                                        : `/transactions/${transaction.id}`;
                                      navigate(path);
                                    }}
                                    className="text-indigo-600 hover:text-indigo-900 font-medium transition-colors duration-200"
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-8 text-center mt-4">
                      <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
                      <p className="text-gray-600 mb-4">This charity hasn't received any donations or processed any transactions yet.</p>
                      <button
                        onClick={() => setShowDonationModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                      >
                        <FaHandHoldingHeart className="mr-2" />
                        Make First Donation
                      </button>
                    </div>
                  )
                ) : (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Login Required</h3>
                    <p className="text-gray-600 mb-4">Please log in to view transaction details for this charity.</p>
                    <Link
                      to="/login"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors duration-200"
                    >
                      <FaUsers className="mr-2" />
                      Log In
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Donation Modal */}
      {showDonationModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
          >
            <DonationForm 
              charityId={id}
              onDonate={handleDonation} 
              loading={donationLoading} 
            />
          </motion.div>
        </motion.div>
      )}

      {/* Admin Actions */}
      {canManageCharity() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-6 right-6"
        >
          <div className="flex flex-col space-y-3">
            <Link
              to={`/charities/${id}/edit`}
              className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
              title="Edit Charity"
            >
              <FaEdit className="h-6 w-6" />
            </Link>
            <Link
              to={`/charities/${id}/tasks/create`}
              className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
              title="Add Milestone"
            >
              <FaPlus className="h-6 w-6" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Add section for charity updates if user is following */}
      {isFollowing && (
        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Latest Updates</h3>
          <p className="text-sm text-gray-600 mb-4">
            You're following this charity. You'll receive notifications about their activities and campaigns.
          </p>
          <button 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={() => {
              // Navigate to user dashboard with charity updates
              window.location.href = '/dashboard/following';
            }}
          >
            View all updates in your dashboard →
          </button>
        </div>
      )}
    </motion.div>
  );
}