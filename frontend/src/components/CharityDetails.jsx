import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
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
  FaSync
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Web3 from 'web3';
import CharityContract from '../contracts/CharityContract.json';
import MilestoneTracker from './MilestoneTracker';
import TransactionHistory from './TransactionHistory';
import { useBlockchain } from '../context/BlockchainContext';
import BlockchainVerificationBadge from './BlockchainVerificationBadge';
import WalletConnectButton from './WalletConnectButton';
import { verifyTransaction } from '../utils/blockchainUtils';
import { getCharityDonations } from '../services/donationService';

// Add this helper function at the top of the file, after imports
const getFileIcon = (fileType) => {
  if (fileType?.includes('pdf')) return <FaFilePdf className="text-red-500 text-xl" />;
  if (fileType?.includes('word') || fileType?.includes('doc')) return <FaFileWord className="text-blue-500 text-xl" />;
  if (fileType?.includes('image')) return <FaImages className="text-green-500 text-xl" />;
  return <FaFileAlt className="text-gray-500 text-xl" />;
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

export default function CharityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, accountType } = useAuth();
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
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
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

  const { 
    account: blockchainAccount, 
    donateToCharity, 
    getCharityDonations, 
    loading: blockchainLoading, 
    error: blockchainError 
  } = useBlockchain();
  
  const [blockchainDonations, setBlockchainDonations] = useState([]);
  const [donationLoading, setDonationLoading] = useState(false);

  // Add a new state for combined transactions
  const [transactionsList, setTransactionsList] = useState([]);

  // Add a state for the current data source
  const [currentDataSource, setCurrentDataSource] = useState('transactions');

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

  useEffect(() => {
    // Add code to check if user is following this charity
    const checkFollowStatus = async () => {
      if (!userToken) return;
      
      try {
        const response = await axios.get(`/api/charities/${id}/follow-status`, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        setIsFollowing(response.data.isFollowing);
        setFollowerCount(response.data.followerCount);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };
    
    checkFollowStatus();
  }, [id, userToken]);

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
          const donationsRes = await axios.get(`/charities/${id}/donations`);
          console.log("Donations response:", donationsRes.data);
          setDonations(donationsRes.data);
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

  const formatCurrency = (amount) => {
    return typeof amount === 'number' ? amount.toLocaleString() : '0';
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
          const donationsResponse = await axios.get(`http://localhost:8000/api/charities/${id}/donations`);
          console.log("Fetched donations:", donationsResponse.data);
          // Handle paginated response
          setDonations(donationsResponse.data.data || donationsResponse.data);
        } catch (donationError) {
          console.error("Error fetching donations:", donationError);
        }
        
        // Also refresh blockchain donations if the function is available
        try {
          if (typeof getCharityDonations === 'function') {
            const blockchainDonations = await getCharityDonations(id);
            console.log("Fetched blockchain donations:", blockchainDonations);
            setBlockchainDonations(blockchainDonations);
          } else {
            console.warn("getCharityDonations is not a function");
          }
        } catch (blockchainError) {
          console.error("Error fetching blockchain donations:", blockchainError);
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

  // Add a new useEffect to fetch blockchain donations
  useEffect(() => {
    const fetchBlockchainDonations = async () => {
      if (!charity?.blockchain_id) return;
      
      try {
        const donations = await getCharityDonations(charity.blockchain_id);
        setBlockchainDonations(donations);
      } catch (error) {
        console.error('Error fetching blockchain donations:', error);
      }
    };
    
    fetchBlockchainDonations();
  }, [charity, getCharityDonations]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
      className="min-h-screen"
    >
      <BackButton />

      {/* Charity Profile Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Charity Image */}
              <div className="relative flex-shrink-0">
                <div className={`h-24 w-24 md:h-28 md:w-28 border-2 border-blue-100 rounded-lg overflow-hidden transition-opacity duration-300 ${imageLoading.cover ? 'animate-pulse bg-gray-200' : ''}`}>
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
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-800">
                    {charity?.category || 'CATEGORY'}
                  </span>
                  {charity?.is_verified ? (
                    <span className="px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                      <FaCheckCircle className="inline-block mr-1" />
                      VERIFIED
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                      <FaExclamationTriangle className="inline-block mr-1" />
                      PENDING
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-1">{charity?.name.toUpperCase()}</h1>

                {/* Fund Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-500">
                      {calculateProgress()}% Complete
                    </span>
                    <span className="font-medium text-gray-900">
                      ${formatCurrency(charity.fund_received)} / ${formatCurrency(charity.fund_targeted)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4 md:mt-0">
                {currentUser && (
                  <>
                    <button
                      onClick={handleFollowToggle}
                      className={`px-4 py-2 rounded-md flex items-center ${
                        isFollowing 
                          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Following
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                            <path d="M16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                          </svg>
                          Follow
                        </>
                      )}
                    </button>

                    {/* Donate button - only visible to logged-in users */}
                    <button
                      onClick={() => setShowDonationModal(true)}
                      className="px-4 py-2 rounded-md font-medium text-sm bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
                    >
                      <FaHandHoldingHeart className="inline-block mr-2" />
                      Donate
                    </button>

                    <div className="relative">
                      <button
                        onClick={handleShare}
                        className="px-4 py-2 rounded-md font-medium text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                      >
                        <FaShare className="inline-block mr-2" />
                        Share
                      </button>
                      {showShareTooltip && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 text-white text-xs py-1 px-2 rounded z-10">
                          Link copied to clipboard!
                        </div>
                      )}
                    </div>
                  </>
                )}

                {canManageCharity() && (
                  <Link
                    to={`/charities/${id}/edit`}
                    className="px-4 py-2 rounded-md font-medium text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 text-center"
                  >
                    <FaEdit className="inline-block mr-2" />
                    Edit
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between border-b border-gray-200">
          <button
            onClick={() => setActiveTab('about')}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'about'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'milestones'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Milestones
          </button>
          <button
            onClick={() => setActiveTab('blockchain')}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'blockchain'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Blockchain
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'transactions'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Transactions
          </button>
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
              className="bg-white rounded-xl shadow-sm overflow-hidden mt-4"
            >
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Charity Details</h3>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500 block">Category</span>
                        <span className="text-gray-900">{charity.category || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 block">Created On</span>
                        <span className="text-gray-900">{formatDate(charity.created_at)}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 block">End Date</span>
                        <span className="text-gray-900">
                          {charity.end_date ? formatDate(charity.end_date) : 'Ongoing'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 block">Status</span>
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
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Organization</h3>
                    {organization ? (
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500 block">Organization Name</span>
                          <Link to={`/organizations/${organization.id}`} className="text-indigo-600 hover:text-indigo-800">
                            {organization.name || 'Unknown Organization'}
                          </Link>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 block">Contact Email</span>
                          <span className="text-gray-900">{organization.gmail || 'Not provided'}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 block">Phone Number</span>
                          <span className="text-gray-900">{organization.phone_number || 'Not provided'}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 block">Address</span>
                          <span className="text-gray-900">{organization.register_address || 'Not provided'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">Organization details not available</div>
                    )}

                    {/* Document Preview Section */}
                    {charity?.verified_document && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Verification Document</h3>
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
                              className="inline-flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                            >
                              <FaEye className="mr-1" />
                              View
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'milestones' && (
            <motion.div
              key="milestones"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4"
            >
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
                        <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white shadow-lg"></div>
                        
                        {/* Content box */}
                        <div className={`w-5/12 bg-white rounded-xl shadow-sm overflow-hidden ${
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
                                {task.status ? (task.status.charAt(0).toUpperCase() + task.status.slice(1)) : 'Unknown'}
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
                                    <FaTrash className="mr-1" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            {/* Task Description */}
                            <p className="text-gray-600 mb-6">{task.description}</p>
                            
                            {/* Task Pictures */}
                            {task.pictures && task.pictures.length > 0 && (
                              <div className="mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {task.pictures.map((picture, picIndex) => (
                                    <div key={picIndex} className="relative h-64 rounded-lg overflow-hidden shadow-md">
                                      <img
                                        src={formatImageUrl(picture.path)}
                                        alt={`${task.name} - Image ${picIndex + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          console.error('Error loading task picture:', e);
                                          e.target.src = 'https://placehold.co/400x300?text=Image+Not+Found';
                                        }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Funding Progress */}
                            {task.fund_targeted > 0 && (
                              <div className="mt-4">
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-gray-500">Funding Progress</span>
                                  <span className="font-medium text-blue-600">
                                    ${formatCurrency(task.current_amount)} / ${formatCurrency(task.fund_targeted)}
                                  </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                    style={{
                                      width: `${Math.min(
                                        (task.current_amount / task.fund_targeted) * 100,
                                        100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            {/* Proof Document Preview */}
                            {task.proof && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Proof Document</h4>
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
                                      className="inline-flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                                    >
                                      <FaEye className="mr-1" />
                                      View
                                    </a>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <FaInfoCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Milestones Found</h3>
                  <p className="text-gray-600">This charity hasn't added any milestones yet.</p>
                </div>
              )}

              {/* Add Milestone Button */}
              {canManageCharity() && (
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

          {activeTab === 'blockchain' && (
            <motion.div
              key="blockchain"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4"
            >
              <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Blockchain Verification</h3>
                  <p className="text-gray-600">
                    This charity uses blockchain technology to ensure transparency and accountability.
                    All donations are tracked on the blockchain and funds are only released when milestones are verified.
                  </p>
                  
                  <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-indigo-800">Blockchain ID</h4>
                        <p className="mt-1 text-sm text-indigo-700">
                          {charity?.blockchain_id || 'Not available'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Wallet Connection</h3>
                  {blockchainAccount ? (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-green-800">Wallet Connected</h4>
                          <p className="mt-1 text-sm text-green-700">
                            {blockchainAccount.substring(0, 6)}...{blockchainAccount.substring(blockchainAccount.length - 4)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 10-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-yellow-800">Wallet Not Connected</h4>
                          <p className="mt-1 text-sm text-yellow-700">
                            Connect your wallet to make blockchain donations and verify milestones.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <WalletConnectButton />
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Blockchain Donations</h3>
                  {blockchainDonations.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Transaction Hash
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Donor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount (ETH)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {blockchainDonations.map((donation, index) => (
                            <tr key={donation.transactionHash || index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {donation.timestamp ? new Date(donation.timestamp).toLocaleString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                <a 
                                  href={`https://etherscan.io/tx/${donation.transactionHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  {donation.transactionHash.substring(0, 10)}...
                                </a>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <a 
                                  href={`https://etherscan.io/address/${donation.donor}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  {donation.donor.substring(0, 6)}...{donation.donor.substring(donation.donor.length - 4)}
                                </a>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {donation.amount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaInfoCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Blockchain Donations Yet</h3>
                      <p className="text-gray-600">This charity hasn't received any blockchain donations yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden mt-4"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">All Transactions</h3>
                  <BlockchainVerificationBadge 
                    verified={charity?.blockchain_id ? true : false} 
                    blockchainId={charity?.blockchain_id}
                  />
                </div>
                
                {/* Add this filter dropdown */}
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">View:</span>
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    onChange={(e) => {
                      const newDataSource = e.target.value;
                      setCurrentDataSource(newDataSource);
                    }}
                  >
                    <option value="transactions">Transactions</option>
                    <option value="donations">Donations</option>
                    <option value="combined">Combined</option>
                  </select>
                </div>
                
                {currentUser ? (
                  transactionsList.length > 0 ? (
                    <div className="overflow-x-auto">
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
                              Details
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(Array.isArray(transactionsList) ? transactionsList : []).map(transaction => {
                            if (!transaction) return null; // Skip null or undefined transactions
                            
                            return (
                              <tr key={transaction.id || transaction.transaction_hash || Math.random()} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(transaction.created_at || new Date())}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                  {(transaction.transaction_hash || transaction.id || 'Unknown')?.slice(0, 8)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm text-gray-500">
                                    {transaction.type || 'Transaction'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {transaction.amount ? `${transaction.amount} ${transaction.currency_type || 'ETH'}` : 'N/A'}
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
                                    className="text-indigo-600 hover:text-indigo-900"
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
                    <div className="text-center py-8">
                      <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
                      <p className="text-gray-600">This charity hasn't received any donations yet.</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Login Required</h3>
                    <p className="text-gray-600 mb-4">Please log in to view transaction details for this charity.</p>
                    <Link
                      to="/login"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
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