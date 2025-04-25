import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useBlockchain } from '../context/BlockchainContext';
import { formatImageUrl, getFileType, setupGlobalImageErrorHandler } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import DonationForm from './DonationForm';
import BackButton from './BackToHistory';
import CharityTransactions from './CharityTransactions';
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
// Import the DonationContractABI instead of CharityContract
import { DonationContractABI } from '../contracts/DonationContractABI';
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

const formatCurrency = (amount, currencyType = 'SCROLL') => {
  if (!amount) return '0.000';

  // Format based on currency type
  if (currencyType === 'USD' || currencyType === 'MYR') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } else {
    // For cryptocurrency (SCROLL, ETH, etc.)
    return `${parseFloat(amount).toFixed(3)} ${currencyType}`;
  }
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

  // Convert donorCount to a number and apply a default of 0 if it's not a valid number
  const donors = typeof donorCount === 'number' ? donorCount : parseInt(donorCount) || 0;

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
              {parseFloat(current).toFixed(3)} / {parseFloat(target).toFixed(3)} <span className="text-indigo-600">SCROLL</span>
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
  const [activeTab, setActiveTab] = useState('about');
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
  const [currentDataSource, setCurrentDataSource] = useState('all');

  // Add a loading state for blockchain donations
  const [isLoadingBlockchainDonations, setIsLoadingBlockchainDonations] = useState(false);
  const [blockchainDonationsError, setBlockchainDonationsError] = useState(null);

  // Add a new state for tracking filter loading
  const [filterLoading, setFilterLoading] = useState(false);

  // Add a function to load data based on the current data source
  const loadDataBySource = async (source) => {
    try {
      setFilterLoading(true);
      let endpoint;

      // Set endpoint based on data source
      if (source === 'all' || source === 'transactions') {
        endpoint = `/charities/${id}/transactions`;
      } else if (source === 'donations') {
        endpoint = `/charities/${id}/donations`;
      } else if (source === 'combined') {
        // For combined, we'll fetch both transactions and blockchain data
        // and combine them manually instead of using a potentially non-existent endpoint
        console.log("Loading combined data from multiple sources");
        endpoint = `/charities/${id}/transactions`;
      }

      console.log(`Loading data from ${endpoint}`);
      const response = await axios.get(endpoint);
      console.log(`${source} data:`, response.data);

      // Handle both paginated and non-paginated responses
      const data = response.data.data || response.data;

      if (source === 'combined') {
        // If it's combined, we need to pull in blockchain data as well
        try {
          // Get blockchain donations if available
          if (blockchainDonations.length > 0) {
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

            // Combine with regular transactions
            const combinedData = [...data, ...formattedBlockchainDonations];

            // Sort by date (newest first)
            const sortedData = combinedData.sort((a, b) =>
              new Date(b.created_at) - new Date(a.created_at)
            );

            console.log("Combined data:", sortedData);
            setTransactionsList(sortedData);
          } else {
            // If no blockchain data, just use the transactions
            setTransactionsList(data);
          }
        } catch (err) {
          console.error('Error combining data:', err);
          // Fall back to just using transactions
          setTransactionsList(data);
        }
      } else {
        // For non-combined sources, just set the data directly
        setTransactionsList(data);
      }
    } catch (error) {
      console.error(`Error loading ${source} data:`, error);
      // If we get an error, don't clear the list - this helps maintain state
      // in case of temporary API issues
      if (transactionsList.length === 0) {
        toast.error(`Failed to load ${source} data. Please try again.`);
      }
    } finally {
      setFilterLoading(false);
    }
  };

  // Call this function when the component mounts or when the data source changes
  useEffect(() => {
    if (id) {
      loadDataBySource(currentDataSource);
    }
  }, [id, currentDataSource]);

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
      console.log("Donor count from response:", charityData.donor_count);

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

      // Fetch transactions (now public for all users)
      try {
        console.log("Fetching transactions for charity ID:", id);
        const transactionsRes = await axios.get(`/charities/${id}/transactions`);
        console.log("Transactions response:", transactionsRes.data);

        // Get the data properly, handling both array and paginated formats
        const transactionsData = transactionsRes.data.data || transactionsRes.data;
        setTransactions(transactionsData);

        // Also set the transactionsList state with the initial data
        setTransactionsList(transactionsData);

        // If we have transaction data, we can calculate the donor count
        const uniqueDonors = new Set();
        transactionsData.forEach(tx => {
          if (tx.donor_id) uniqueDonors.add(tx.donor_id);
          // Also count blockchain transactions by donor address
          if (tx.donor) uniqueDonors.add(tx.donor);
        });
        console.log(`Found ${uniqueDonors.size} unique donors in transactions`);

        // Always update the donor count if we found donors in transactions
        if (uniqueDonors.size > 0) {
          console.log("Updating charity donor count from transactions:", uniqueDonors.size);
          setCharity(prev => ({
            ...prev,
            donor_count: uniqueDonors.size
          }));
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setTransactions([]);
        setTransactionsList([]);
      }

      // Fetch donations (now public for all users)
      try {
        console.log("Fetching donations for charity ID:", id);

        // Use the service function that handles multiple endpoints
        const donationsData = await getCharityDonations(id);
        console.log("Donations response:", donationsData);

        setDonations(donationsData || []);

        // If we have donation data, we can cross-check the donor count
        if (Array.isArray(donationsData) && donationsData.length > 0) {
          const uniqueDonors = new Set();
          donationsData.forEach(donation => {
            if (donation.donor_id) uniqueDonors.add(donation.donor_id);
          });
          console.log(`Found ${uniqueDonors.size} unique donors in donations`);

          // Update donor count if we found more donors in donations than we already have
          if (uniqueDonors.size > (charity?.donor_count || 0)) {
            console.log("Updating charity donor count from donations:", uniqueDonors.size);
            setCharity(prev => ({
              ...prev,
              donor_count: uniqueDonors.size
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching donations:', err);
        setDonations([]);
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
    // Validate the donation amount
    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    // Close the modal
    setShowDonationModal(false);

    // Store the donation amount in localStorage for the donation page
    localStorage.setItem('pendingDonationAmount', amount);
    localStorage.setItem('pendingDonationCharityId', id);

    // If user is not logged in, show a friendly message and redirect to login page with return URL
    if (!currentUser) {
      // Show a more informative toast message
      toast(
        t => (
          <div className="flex items-start">
            <div className="ml-3">
              <p className="font-medium">Login required to complete donation</p>
              <p className="text-sm">You'll be redirected to login, then return to complete your donation.</p>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="ml-4 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ),
        { duration: 5000 }
      );

      // Redirect to login with return URL
      navigate(`/login?redirect=/charities/${id}/donate`);
      return;
    }

    // If user is logged in, go directly to donation page
    navigate(`/charities/${id}/donate?amount=${amount}`);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

        // Explicitly fetch donations again using the service function
        try {
          const donationsData = await getCharityDonations(id);
          console.log("Fetched donations:", donationsData);
          // Set the donations
          setDonations(donationsData || []);
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
    console.log("Combining transactions data...");
    console.log("Transactions:", transactions);
    console.log("Blockchain donations:", blockchainDonations);
    console.log("Current data source:", currentDataSource);

    // Don't auto-combine here if we're using the combined data source option
    // as that's now handled in loadDataBySource
    if (currentDataSource === 'combined') {
      console.log("Using pre-combined data from loadDataBySource");
      return;
    }

    // Filter transactions based on current data source
    let filteredTransactions = [];

    if (Array.isArray(transactions)) {
      if (currentDataSource === 'all') {
        filteredTransactions = transactions;
      } else if (currentDataSource === 'donations') {
        filteredTransactions = transactions.filter(tx => tx.type === 'donation');
      } else {
        filteredTransactions = transactions;
      }
    }

    if (filteredTransactions.length > 0 || blockchainDonations.length > 0) {
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
      const uniqueTransactions = [...filteredTransactions];

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
  }, [transactions, blockchainDonations, currentDataSource]);

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

          {/* Charity Info Section - Improved UI with status-based styling */}
          <div className={`p-8 relative rounded-xl shadow-lg ${charity?.is_verified ? 'bg-green-50/30' : 'bg-amber-50/30'}`} style={{ zIndex: 3 }}>
            {/* Status Banner */}
            <div className={`absolute top-0 right-0 left-0 h-2 rounded-t-xl ${charity?.is_verified ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-amber-400 to-yellow-300'}`}></div>

            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Charity Image - Enhanced with status-based styling */}
              <div className="relative flex-shrink-0 mx-auto lg:mx-0">
                <div className={`h-40 w-40 border-4 ${charity?.is_verified ? 'border-white' : 'border-amber-100'} rounded-xl overflow-hidden shadow-lg bg-white ${imageLoading.cover ? 'animate-pulse' : ''}`}>
                  {charity?.picture_path ? (
                    <img
                      src={formatImageUrl(charity.picture_path)}
                      alt={charity?.name}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                      onLoad={() => setImageLoading(prev => ({ ...prev, cover: false }))}
                      onError={(e) => {
                        console.error('Error loading charity image:', e);
                        e.target.src = 'https://placehold.co/128';
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
                      <FaImages className="h-16 w-16 text-indigo-300" />
                    </div>
                  )}
                </div>

                {/* Verification Badge - Positioned on image with enhanced styling */}
                <div className="absolute -bottom-4 -right-4">
                  {charity?.is_verified ? (
                    <div className="bg-green-100 text-green-800 p-3 rounded-full border-2 border-white shadow-lg">
                      <FaCheckCircle className="h-6 w-6" />
                    </div>
                  ) : (
                    <div className="bg-amber-100 text-amber-800 p-3 rounded-full border-2 border-white shadow-lg">
                      <FaExclamationTriangle className="h-6 w-6" />
                    </div>
                  )}
                </div>

                {/* Status Label */}
                <div className="absolute -top-3 -left-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${charity?.is_verified ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                    {charity?.is_verified ? 'VERIFIED' : 'PENDING'}
                  </div>
                </div>
              </div>

              {/* Charity Info - Improved layout */}
              <div className="flex-1 mt-6 lg:mt-0 text-center lg:text-left">
                {/* Category Badge */}
                <div className="mb-3">
                  <span className="px-4 py-1.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 inline-flex items-center">
                    <FaTag className="mr-1.5" />
                    {charity?.category || 'CATEGORY'}
                  </span>
                </div>

                {/* Charity Name - Larger and more prominent */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{charity?.name}</h1>

                {/* Organization Link - Enhanced */}
                {organization && (
                  <div className="flex items-center text-gray-600 text-sm mt-3 justify-center lg:justify-start">
                    <div className="bg-indigo-50 p-1.5 rounded-full mr-2">
                      <FaBuilding className="text-indigo-500" />
                    </div>
                    <Link
                      to={`/organizations/${organization.id}`}
                      className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 font-medium hover:underline flex items-center"
                    >
                      {organization.name}
                      <FaExternalLinkAlt className="ml-1.5 h-3 w-3" />
                    </Link>
                  </div>
                )}

                {/* People Helped - Enhanced */}
                <div className="flex items-center text-gray-700 mt-3 justify-center lg:justify-start">
                  <div className="bg-green-50 p-1.5 rounded-full mr-2">
                    <FaUsers className="text-green-600" />
                  </div>
                  <span className="font-medium">
                    Helping <span className="text-green-700 font-bold">{charity.people_affected ? parseInt(charity.people_affected).toLocaleString() : '0'}</span> people
                  </span>
                </div>

                {/* Fund Progress - Enhanced with status-based styling */}
                <div className="mt-6 max-w-xl mx-auto lg:mx-0">
                  <div className="mb-2 flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2">
                      <FaChartLine className={`${charity?.is_verified ? 'text-green-600' : 'text-amber-600'}`} />
                      <span className="font-medium text-gray-700">
                        {calculateProgress().toFixed(1)}% Funded
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaCoins className="text-yellow-600" />
                      <span className="font-medium text-gray-900">
                        {parseFloat(charity?.fund_received || 0).toFixed(3)} / {parseFloat(charity?.fund_targeted || 0).toFixed(3)} <span className="text-indigo-600">SCROLL</span>
                      </span>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${charity?.is_verified ? 'bg-green-600' : 'bg-amber-500'} transition-all duration-500 ease-in-out`}
                      style={{ width: `${calculateProgress()}%` }}
                    >
                      <div className="h-full w-full animate-pulse bg-white opacity-20"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions - Improved layout and styling with consistent button sizes */}
              <div className="flex flex-col gap-4 mt-6 lg:mt-0 w-full lg:w-auto self-center">
                {/* Donate button - Enhanced with more attractive styling */}
                <button
                  onClick={() => setShowDonationModal(true)}
                  className={`w-full lg:w-48 px-6 py-3.5 rounded-lg font-bold text-base text-white transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${charity?.is_verified ? 'bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500' : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500'}`}
                  style={{ animation: 'pulse 2s infinite' }}
                >
                  <FaHandHoldingHeart className="mr-2 text-lg" />
                  Donate Now
                </button>

                <div className="flex gap-2 justify-center">
                  {/* Share button - Consistent sizing */}
                  <div className="relative">
                    <button
                      onClick={handleShare}
                      className="w-24 h-10 rounded-lg font-medium text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow"
                    >
                      <FaShare className="mr-1.5" />
                      Share
                    </button>
                    {showShareTooltip && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 text-white text-xs py-2 px-3 rounded z-10 shadow-lg">
                        Link copied to clipboard!
                      </div>
                    )}
                  </div>

                  {/* Follow button - Consistent sizing */}
                  {currentUser && !isOrganizationUser() && (
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`w-24 h-10 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow ${
                        isFollowing
                          ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-300'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {followLoading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-current rounded-full border-t-transparent mr-1.5"></div>
                      ) : (
                        <FaThumbsUp className="mr-1.5" />
                      )}
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}

                  {/* Edit button - Consistent sizing */}
                  {canManageCharity() && (
                    <Link
                      to={`/charities/${id}/edit`}
                      className="w-24 h-10 rounded-lg font-medium text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow"
                    >
                      <FaEdit className="mr-1.5" />
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Description Summary - Enhanced with status-based styling */}
            <div className={`mt-8 p-6 rounded-xl shadow-sm ${charity?.is_verified ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100' : 'bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100'}`}>
              <div className="flex items-start">
                <div className="bg-white p-2 rounded-full shadow-sm mr-4 flex-shrink-0">
                  <FaInfoCircle className={`h-5 w-5 ${charity?.is_verified ? 'text-green-500' : 'text-amber-500'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">About This Charity</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {charity.description || 'No description provided for this charity.'}
                  </p>
                  {charity.description?.length > 300 && (
                    <button
                      onClick={() => setActiveTab('about')}
                      className={`mt-2 text-sm font-medium inline-flex items-center ${charity?.is_verified ? 'text-green-600 hover:text-green-800' : 'text-amber-600 hover:text-amber-800'}`}
                    >
                      Read more <FaChevronDown className="ml-1 h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row">
            <button
              onClick={() => setActiveTab('about')}
              className={`relative flex items-center justify-center py-4 px-6 font-medium text-sm transition-all duration-200 ${
                activeTab === 'about'
                  ? 'text-indigo-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              } flex-1 group`}
            >
              <div className={`mr-2 ${activeTab === 'about' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'} transition-colors duration-200`}>
                <FaInfoCircle />
              </div>
              <span>About</span>
              {activeTab === 'about' && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                  layoutId="activeTabIndicator"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`relative flex items-center justify-center py-4 px-6 font-medium text-sm transition-all duration-200 ${
                activeTab === 'milestones'
                  ? 'text-indigo-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              } flex-1 group`}
            >
              <div className={`mr-2 ${activeTab === 'milestones' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'} transition-colors duration-200`}>
                <FaTasks />
              </div>
              <span>Milestones</span>
              {tasks.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800">
                  {tasks.length}
                </span>
              )}
              {activeTab === 'milestones' && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                  layoutId="activeTabIndicator"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`relative flex items-center justify-center py-4 px-6 font-medium text-sm transition-all duration-200 ${
                activeTab === 'transactions'
                  ? 'text-indigo-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              } flex-1 group`}
            >
              <div className={`mr-2 ${activeTab === 'transactions' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'} transition-colors duration-200`}>
                <FaExchangeAlt />
              </div>
              <span>Transactions</span>
              {transactions.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                  {transactions.length}
                </span>
              )}
              {activeTab === 'transactions' && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                  layoutId="activeTabIndicator"
                />
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <AnimatePresence mode="wait">
          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-6">
                {/* Charity Overview Section */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FaInfoCircle className="mr-3 text-indigo-500" />
                    Charity Overview
                  </h2>

                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl shadow-sm">
                    {/* Charity Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                      {/* Category */}
                      <div className="bg-white p-4 rounded-lg shadow-sm flex items-start space-x-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <FaTag className="text-indigo-600 text-xl" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Category</h3>
                          <p className="text-gray-900 font-medium">{charity?.category || 'Not specified'}</p>
                        </div>
                      </div>

                      {/* People Affected */}
                      <div className="bg-white p-4 rounded-lg shadow-sm flex items-start space-x-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <FaUsers className="text-green-600 text-xl" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">People Helped</h3>
                          <p className="text-gray-900 font-medium">{charity.people_affected ? parseInt(charity.people_affected).toLocaleString() : '0'} people</p>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="bg-white p-4 rounded-lg shadow-sm flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <FaCalendarAlt className="text-blue-600 text-xl" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Created On</h3>
                          <p className="text-gray-900 font-medium">{charity.created_at ? formatDate(charity.created_at) : 'Unknown'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Charity Description */}
                    <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
                      <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                        <FaCommentAlt className="mr-2 text-indigo-500" />
                        About This Charity
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {charity.description || 'No description provided for this charity.'}
                      </p>
                    </div>

                    {/* Blockchain Verification */}
                    <div className="bg-white p-5 rounded-lg shadow-sm">
                      <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                        <FaCoins className="mr-2 text-yellow-500" />
                        Blockchain Verification
                      </h3>
                      <div className="flex items-center space-x-2">
                        <BlockchainVerificationBadge isVerified={charity.is_verified} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organization Information Section */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FaBuilding className="mr-3 text-indigo-500" />
                    Organization Information
                  </h2>

                  {organization ? (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                      {/* Organization Header */}
                      <div className="p-5 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center space-x-4">
                          {organization.logo_path ? (
                            <img
                              src={formatImageUrl(organization.logo_path)}
                              alt={organization.name}
                              className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                              onError={(e) => {
                                e.target.src = 'https://placehold.co/48?text=Org';
                              }}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                              <FaBuilding className="text-indigo-500 text-xl" />
                            </div>
                          )}
                          <div>
                            <Link
                              to={`/organizations/${organization.id}`}
                              className="text-lg font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-200 flex items-center"
                            >
                              {organization.name || 'Unknown Organization'}
                              <FaExternalLinkAlt className="ml-2 text-xs" />
                            </Link>
                            <p className="text-sm text-gray-500">{organization.description?.substring(0, 100) || 'No description available'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Organization Details */}
                      <div className="p-5">
                        <div className="space-y-6">
                          {/* Contact Email */}
                          <div className="flex items-start space-x-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <FaInfoCircle className="text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-500">Contact Email</h3>
                              {organization.gmail ? (
                                <a href={`mailto:${organization.gmail}`} className="text-blue-600 hover:underline">
                                  {organization.gmail}
                                </a>
                              ) : (
                                <p className="text-gray-500 italic">Not provided</p>
                              )}
                            </div>
                          </div>

                          {/* Phone Number */}
                          <div className="flex items-start space-x-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <FaInfoCircle className="text-green-600" />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                              {organization.phone_number ? (
                                <a href={`tel:${organization.phone_number}`} className="text-gray-900 hover:text-indigo-600">
                                  {organization.phone_number}
                                </a>
                              ) : (
                                <p className="text-gray-500 italic">Not provided</p>
                              )}
                            </div>
                          </div>

                          {/* Address */}
                          <div className="flex items-start space-x-3">
                            <div className="bg-red-100 p-2 rounded-lg">
                              <FaMapMarkerAlt className="text-red-600" />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-500">Address</h3>
                              {organization.register_address ? (
                                <p className="text-gray-900">{organization.register_address}</p>
                              ) : (
                                <p className="text-gray-500 italic">Not provided</p>
                              )}
                            </div>
                          </div>

                          {/* Wallet Address (if available) */}
                          {organization.wallet_address && (
                            <div className="flex items-start space-x-3">
                              <div className="bg-purple-100 p-2 rounded-lg">
                                <FaWallet className="text-purple-600" />
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">Wallet Address</h3>
                                <div className="flex items-center">
                                  <p className="text-xs font-mono bg-gray-100 p-2 rounded overflow-x-auto max-w-xs">
                                    {organization.wallet_address}
                                  </p>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(organization.wallet_address);
                                      toast.success('Wallet address copied to clipboard!');
                                    }}
                                    className="ml-2 text-gray-500 hover:text-indigo-600"
                                    title="Copy to clipboard"
                                  >
                                    <FaLink />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-6 rounded-xl shadow-sm text-center">
                      <FaExclamationTriangle className="mx-auto h-10 w-10 text-yellow-500 mb-3" />
                      <p className="text-gray-600 font-medium">Organization details not available</p>
                      <p className="text-gray-500 text-sm mt-1">This charity is not associated with any organization</p>
                    </div>
                  )}
                </div>

                {/* Document Verification Section */}
                {charity?.verified_document && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <FaFileContract className="mr-3 text-indigo-500" />
                      Verification Documents
                    </h2>

                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-gray-200 bg-green-50 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="bg-green-100 p-2 rounded-full">
                            <FaCheckCircle className="text-green-600" />
                          </div>
                          <h3 className="font-medium text-green-800">Verified Documentation</h3>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Official Record
                        </span>
                      </div>

                      <div className="p-5">
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                              {getFileIcon(getFileType(charity.verified_document))}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {charity.verified_document.split('/').pop()}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {getFileType(charity.verified_document)}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <a
                              href={formatImageUrl(charity.verified_document)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200"
                            >
                              <FaEye className="mr-2" />
                              View Document
                            </a>
                            <a
                              href={formatImageUrl(charity.verified_document)}
                              download
                              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            >
                              <FaFileAlt className="mr-2" />
                              Download
                            </a>
                          </div>
                        </div>

                        <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                          <div className="flex items-start">
                            <FaInfoCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                            <p className="text-sm text-blue-800">
                              This document has been verified by our team and confirms the legitimacy of this charity.
                              All verified charities undergo a thorough review process to ensure transparency and accountability.
                            </p>
                          </div>
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
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <FaTasks className="mr-3 text-indigo-500" />
                    Charity Milestones
                  </h2>

                  {/* Add Milestone Button - Always visible for charity managers */}
                  {canManageCharity() && (
                    <Link
                      to={`/charities/${id}/tasks/create`}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-200 shadow-sm"
                    >
                      <FaPlus className="mr-2" />
                      Add Milestone
                    </Link>
                  )}
                </div>

                {tasks.length > 0 ? (
                  <div className="relative">
                    {/* Timeline line - Enhanced */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-indigo-300 to-indigo-100 rounded-full"></div>

                    <div className="space-y-16">
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
                          {/* Timeline dot - Enhanced with status-based styling */}
                          <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
                            <div className={`w-8 h-8 rounded-full border-4 border-white shadow-md flex items-center justify-center ${
                              task.status === 'completed' ? 'bg-green-500' :
                              task.status === 'verified' ? 'bg-indigo-500' :
                              'bg-amber-500'
                            }`}>
                              {task.status === 'completed' ? (
                                <FaCheckCircle className="text-white text-xs" />
                              ) : task.status === 'verified' ? (
                                <FaCheckCircle className="text-white text-xs" />
                              ) : (
                                <FaExclamationTriangle className="text-white text-xs" />
                              )}
                            </div>
                            <div className="mt-2 px-2 py-1 rounded-full bg-white shadow-sm text-xs font-medium text-gray-700">
                              {formatDate(task.created_at)}
                            </div>
                          </div>

                          {/* Content box - Enhanced with status-based styling */}
                          <div className={`w-5/12 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 ${
                            index % 2 === 0 ? 'mr-auto' : 'ml-auto'
                          } ${
                            task.status === 'completed' ? 'bg-green-50/70 border border-green-200' :
                            task.status === 'verified' ? 'bg-indigo-50/70 border border-indigo-200' :
                            'bg-amber-50/70 border border-amber-200'
                          }`}>
                            <div className="p-0">
                              {/* Header with status */}
                              <div className={`p-4 border-b ${
                                task.status === 'completed' ? 'bg-green-100/80 border-green-200' :
                                task.status === 'verified' ? 'bg-indigo-100/80 border-indigo-200' :
                                'bg-amber-100/80 border-amber-200'
                              }`}>
                                <div className="flex justify-between items-center">
                                  <h3 className="text-lg font-semibold text-gray-900">{task.name}</h3>
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                    task.status === 'completed'
                                      ? 'bg-green-100 text-green-800'
                                      : task.status === 'verified'
                                      ? 'bg-indigo-100 text-indigo-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {task.status === 'completed' && <FaCheckCircle className="mr-1" />}
                                    {task.status === 'verified' && <FaCheckCircle className="mr-1" />}
                                    {task.status === 'pending' && <FaExclamationTriangle className="mr-1" />}
                                    {task.status ? (task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')) : 'Unknown'}
                                  </span>
                                </div>
                              </div>

                              <div className="p-5">
                                {/* Task Description - Enhanced */}
                                <div className="mb-5">
                                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <FaInfoCircle className="mr-2 text-indigo-500" />
                                    Description
                                  </h4>
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-700 leading-relaxed">{task.description}</p>
                                  </div>
                                </div>

                                {/* Task Pictures - Enhanced */}
                                {task.pictures && task.pictures.length > 0 && (
                                  <div className="mb-5">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                      <FaImages className="mr-2 text-indigo-500" />
                                      Progress Images
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {task.pictures.map((picture, picIndex) => (
                                        <div key={picIndex} className="relative h-40 rounded-lg overflow-hidden shadow-sm group">
                                          <img
                                            src={formatImageUrl(picture.path)}
                                            alt={`${task.name} - Image ${picIndex + 1}`}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                              console.error('Error loading task picture:', e);
                                              e.target.src = 'https://placehold.co/400x300?text=Image+Not+Found';
                                            }}
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                            <span className="text-white text-sm font-medium truncate w-full">
                                              Image {picIndex + 1}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Proof Document Preview - Enhanced */}
                                {task.proof && (
                                  <div className="mb-5">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                      <FaFileAlt className="mr-2 text-indigo-500" />
                                      Proof Document
                                    </h4>
                                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                          <div className="p-2 bg-white rounded-lg shadow-sm">
                                            {getFileIcon(getFileType(task.proof))}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
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
                                          className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200"
                                        >
                                          <FaEye className="mr-1.5" />
                                          View
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Funding Progress - Enhanced */}
                                {task.fund_targeted > 0 && (
                                  <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                      <FaChartBar className="mr-2 text-indigo-500" />
                                      Funding Progress
                                    </h4>
                                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                      <FundingProgress
                                        current={task.fund_received || 0}
                                        target={task.fund_targeted || 0}
                                        donorCount={task.donor_count}
                                        endDate={task.end_date}
                                      />
                                      {task.status === 'completed' && (
                                        <div className="mt-2 flex items-center justify-center text-green-600 text-sm bg-green-50 p-2 rounded-lg">
                                          <FaCheckCircle className="mr-1.5" />
                                          Funding goal achieved!
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Admin Actions - Enhanced */}
                                {canManageCharity() && (
                                  <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end gap-2">
                                    <Link
                                      to={`/charities/${id}/tasks/${task.id}/edit`}
                                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200"
                                    >
                                      <FaEdit className="mr-1.5" />
                                      Edit
                                    </Link>
                                    <button
                                      onClick={() => deleteTask(task.id)}
                                      disabled={taskDeleteLoading}
                                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors duration-200"
                                    >
                                      {taskDeleteLoading ? (
                                        <div className="animate-spin h-3 w-3 border-2 border-current rounded-full border-t-transparent mr-1.5"></div>
                                      ) : (
                                        <FaTrash className="mr-1.5" />
                                      )}
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-10 text-center mt-4 border border-indigo-100">
                    <div className="bg-white w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-sm mb-6">
                      <FaTasks className="text-indigo-400 text-3xl" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No Milestones Yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">This charity hasn't added any milestones yet. Milestones help track progress and show how donations are being used.</p>
                    {canManageCharity() && (
                      <Link
                        to={`/charities/${id}/tasks/create`}
                        className="inline-flex items-center px-5 py-2.5 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        <FaPlus className="mr-2" />
                        Create First Milestone
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FaExchangeAlt className="mr-3 text-indigo-500" />
                  Financial Transactions
                </h2>

                {/* Use the new CharityTransactions component */}
                <CharityTransactions charityId={id} />
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

    </motion.div>
  );
}