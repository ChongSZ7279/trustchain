import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBlockchain } from '../context/BlockchainContext';
import { formatImageUrl } from '../utils/helpers';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  calculateRewardTier, 
  calculateNextTierProgress, 
  getAchievements, 
  calculateTotalDonationAmount 
} from '../utils/rewardSystem';
import { motion } from 'framer-motion';
import { 
  FaUser, 
  FaTrophy, 
  FaHistory, 
  FaEdit, 
  FaSignOutAlt,
  FaHeart,
  FaStar,
  FaMedal,
  FaCertificate,
  FaChartLine,
  FaHandHoldingUsd,
  FaUsers,
  FaCalendarAlt,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaPhone,
  FaEnvelope,
  FaThumbsUp,
  FaMoneyBillWave,
  FaLock,
  FaCheck,
  FaSync,
  FaFilter,
  FaExchangeAlt,
  FaFileInvoice,
  FaDownload,
  FaClock,
  FaExclamationTriangle,
  FaShoppingBag,
  FaUtensils,
  FaEllipsisH,
  FaCocktail,
  FaTicketAlt,
} from 'react-icons/fa';
import CharityCard from './CharityCard';
import OrganizationCard from './OrganizationCard';
import AIGenerator from "./Recommendation";
import { toast } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

// Import additional images
import BronzeImg from '../assets/image/Bronze.png';
import SilverImg from '../assets/image/Silver.png';
import GoldImg from '../assets/image/Gold.png';
import ZeusImg from '../assets/image/coffe-4951985_1280.jpg';
import TealiveImg from '../assets/image/tea-750850_1280.jpg';

export default function UserDashboard() {
  const { currentUser, logout } = useAuth();
  const { account, getDonorTotalAmount } = useBlockchain();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalDonationAmount, setTotalDonationAmount] = useState(0);
  const [rewardTier, setRewardTier] = useState(null);
  const [nextTierProgress, setNextTierProgress] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [completedCharities, setCompletedCharities] = useState([]);
  const [inProgressCharities, setInProgressCharities] = useState([]);
  const [followedOrganizations, setFollowedOrganizations] = useState([]);
  const [followedCharities, setFollowedCharities] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [recommendedCharity, setRecommendedCharity] = useState(null);
  const [donations, setDonations] = useState([]);
  const [combinedTransactions, setCombinedTransactions] = useState([]);
  const [currentDataSource, setCurrentDataSource] = useState('transactions');
  const [claimedVouchers, setClaimedVouchers] = useState([]);
  const [voucherFilter, setVoucherFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  
  // Define available frames based on REWARD_TIERS from rewardSystem.js
  const availableFrames = [
    { id: 'default', color: '#E5E7EB', name: 'Default Frame', requirement: null },
    { id: 'bronze', color: '#CD7F32', name: 'Bronze Frame', requirement: 'Donate to 3 charities', tierName: 'Bronze' },
    { id: 'silver', color: '#C0C0C0', name: 'Silver Frame', requirement: 'Donate $100 total', tierName: 'Silver' },
    { id: 'gold', color: '#FFD700', name: 'Gold Frame', requirement: 'Donate to 10 charities', tierName: 'Gold' },
    { id: 'platinum', color: '#E5E4E2', name: 'Platinum Frame', requirement: 'Donate $500 total', tierName: 'Platinum' },
    { id: 'diamond', color: '#B9F2FF', name: 'Diamond Frame', requirement: 'Donate $1000 total', tierName: 'Diamond' },
  ];

  // Function to check if a frame is unlocked
  const isFrameUnlocked = (frameId) => {
    const frame = availableFrames.find(f => f.id === frameId);
    if (!frame.requirement) return true; // Default is always unlocked
    
    // Check achievement-based requirements
    switch (frameId) {
      case 'bronze':
        return achievements.some(a => a.id === 'donate_3_charities');
      case 'silver':
        return totalDonationAmount >= 100;
      case 'gold':
        return achievements.some(a => a.id === 'donate_10_charities');
      case 'platinum':
        return totalDonationAmount >= 500;
      case 'diamond':
        return totalDonationAmount >= 1000;
      default:
        return false;
    }
  };

  // Get unlocked frames
  const unlockedFrames = availableFrames.filter(frame => isFrameUnlocked(frame.id));

  // Set default selected frame if none is selected
  useEffect(() => {
    if (!selectedFrame && unlockedFrames.length > 0) {
      setSelectedFrame(unlockedFrames[0].id);
    }
  }, [unlockedFrames, selectedFrame]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Load data based on the current data source
        await loadDataBySource(currentDataSource);
        
        // Fetch user's charities
        try {
          const charitiesRes = await axios.get(`/users/${currentUser.ic_number}/charities`);
          const charities = charitiesRes.data;
          
          // Split charities into completed and in progress
          setCompletedCharities(charities.filter(charity => 
            charity.fund_received >= charity.fund_targeted
          ));
          setInProgressCharities(charities.filter(charity => 
            charity.fund_received < charity.fund_targeted
          ));
        } catch (err) {
          console.error('Error fetching charities:', err);
          setCompletedCharities([]);
          setInProgressCharities([]);
        }
        
        // Fetch followed organizations
        try {
          const followedOrgsRes = await axios.get('/user/followed-organizations');
          console.log('Followed organizations response:', followedOrgsRes.data);
          setFollowedOrganizations(followedOrgsRes.data);
        } catch (err) {
          console.error('Error fetching followed organizations:', err);
          setFollowedOrganizations([]);
        }
        
        // Fetch followed charities
        try {
          const followedCharitiesRes = await axios.get('/user/followed-charities');
          console.log('Followed charities response:', followedCharitiesRes.data);
          setFollowedCharities(followedCharitiesRes.data);
        } catch (err) {
          console.error('Error fetching followed charities:', err);
          setFollowedCharities([]);
        }
        
        // Calculate achievements based on all available data
        calculateUserAchievements();
        
      } catch (err) {
        console.error('Error in fetchUserData:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser]);
  
  // Add this useEffect to reload data when the data source changes
  useEffect(() => {
    if (currentUser) {
      loadDataBySource(currentDataSource);
    }
  }, [currentDataSource, currentUser]);
  
  // Add a function to download e-invoice
  const downloadInvoice = async (donationId) => {
    try {
      console.log(`Downloading invoice for donation ${donationId}`);
      
      // Get the PDF directly instead of HTML
      const response = await axios.get(`/api/donations/${donationId}/invoice`, {
        responseType: 'blob', // Important: Set responseType to blob
      });
      
      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${donationId}.pdf`; // Set the download filename
      
      // Append link to body, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice. Please try again.');
    }
  };
  
  // Add a function to view e-invoice
  const viewInvoice = (donationId) => {
    navigate(`/donations/${donationId}/invoice`);
  };

  // Fetch blockchain donation amount if wallet is connected
  useEffect(() => {
    const fetchBlockchainDonations = async () => {
      if (!account) return;
      
      try {
        const amount = await getDonorTotalAmount(account);
        console.log('Blockchain donation amount:', amount);
        // In a real app, you would update the total donation amount with this value
      } catch (err) {
        console.error('Error fetching blockchain donations:', err);
      }
    };
    
    fetchBlockchainDonations();
  }, [account, getDonorTotalAmount]);

  // Add this useEffect to debug image paths
  useEffect(() => {
    if (currentUser) {
      console.log('User profile picture path:', currentUser.profile_picture);
      console.log('Formatted profile picture URL:', formatImageUrl(currentUser.profile_picture));
    }
    
    // Log followed organizations and charities image paths
    followedOrganizations.forEach(org => {
      console.log(`Organization ${org.id} logo path:`, org.logo);
      console.log(`Organization ${org.id} formatted logo URL:`, formatImageUrl(org.logo));
    });
    
    followedCharities.forEach(charity => {
      console.log(`Charity ${charity.id} picture path:`, charity.picture_path);
      console.log(`Charity ${charity.id} formatted picture URL:`, formatImageUrl(charity.picture_path));
    });
  }, [currentUser, followedOrganizations, followedCharities]);

  useEffect(() => {
    // After calculating reward tier and progress
    console.log('Total donation amount:', totalDonationAmount);
    console.log('Reward tier:', rewardTier);
    console.log('Next tier progress:', nextTierProgress);
  }, [totalDonationAmount, rewardTier, nextTierProgress]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Format date to a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Update the formatImageUrl function to handle all types of image paths
  const formatImageUrl = (path) => {
    if (!path) return null;
    
    // If it's already a full URL
    if (path.startsWith('http')) return path;
    
    // For storage paths like "profile_pictures/filename.jpg"
    if (path.includes('profile_pictures/') || 
        path.includes('ic_pictures/') || 
        path.includes('organization_covers/') || 
        path.includes('organization_logos/') || 
        path.includes('charity_pictures/')) {
      return `/storage/${path}`;
    }
    
    // If path starts with a slash, it's already a relative path
    if (path.startsWith('/')) return path;
    
    // Otherwise, add a slash to make it a relative path from the root
    return `/${path}`;
  };

  // Add a function to calculate the total donation amount from all sources
  const calculateTotalFromAllSources = () => {
    let total = 0;
    
    // Add amounts from transactions
    transactions.forEach(transaction => {
      if (transaction && transaction.amount) {
        total += parseFloat(transaction.amount) || 0;
      }
    });
    
    // Add amounts from donations
    donations.forEach(donation => {
      if (donation && donation.amount) {
        total += parseFloat(donation.amount) || 0;
      }
    });
    
    // Add amounts from combined transactions if they're not already counted
    if (currentDataSource === 'combined') {
      combinedTransactions.forEach(item => {
        if (item && item.amount) {
          total += parseFloat(item.amount) || 0;
        }
      });
    }
    
    console.log('Calculated total donation amount:', total);
    return total;
  };

  // Update the loadDataBySource function to use the new calculation
  const loadDataBySource = async (source) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError('');
      
      let endpoint;
      if (source === 'transactions') {
        endpoint = `/users/${currentUser.ic_number}/transactions`;
      } else if (source === 'donations') {
        endpoint = `/users/${currentUser.ic_number}/donations`;
      } else if (source === 'combined') {
        endpoint = `/users/${currentUser.ic_number}/financial-activities`;
      }
      
      console.log(`Loading data from ${endpoint}`);
      const response = await axios.get(endpoint);
      console.log(`${source} data:`, response.data);
      
      // Handle both paginated and non-paginated responses
      const data = response.data.data ? response.data.data : response.data;
      
      if (source === 'transactions') {
        setTransactions(data);
      } else if (source === 'donations') {
        setDonations(data);
      }
      
      // Always update the combined transactions for display
      setCombinedTransactions(data);
      
      // Calculate total donation amount from all sources
      const totalAmount = calculateTotalFromAllSources();
      setTotalDonationAmount(totalAmount);
      
      // Calculate reward tier based on the total
      const tier = calculateRewardTier(totalAmount);
      setRewardTier(tier);
      
      // Calculate progress to next tier
      const progress = calculateNextTierProgress(totalAmount);
      setNextTierProgress(progress);
      
      // Calculate achievements after loading data
      calculateUserAchievements();
      
      setLoading(false);
    } catch (error) {
      console.error(`Error loading ${source} data:`, error);
      setError(`Failed to load ${source} data`);
      setLoading(false);
    }
  };

  // Add a useEffect to update the total donation amount when any data changes
  useEffect(() => {
    if (currentUser) {
      const totalAmount = calculateTotalFromAllSources();
      console.log('Updating total donation amount:', totalAmount);
      setTotalDonationAmount(totalAmount);
      
      // Update reward tier and progress
      const tier = calculateRewardTier(totalAmount);
      setRewardTier(tier);
      
      const progress = calculateNextTierProgress(totalAmount);
      setNextTierProgress(progress);
    }
  }, [transactions, donations, combinedTransactions, currentDataSource]);

  // Add these helper functions
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

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

  // Add a new function to calculate achievements based on all data
  const calculateUserAchievements = () => {
    // Create a comprehensive list of achievements
    const userAchievements = [];
    
    // Debug logging
    console.log('Calculating achievements with:');
    console.log('Transactions:', transactions);
    console.log('Donations:', donations);
    console.log('Combined transactions:', combinedTransactions);
    
    // First donation achievement
    if (transactions.length > 0 || donations.length > 0 || combinedTransactions.length > 0) {
      console.log('Adding first donation achievement');
      userAchievements.push({ 
        id: 'first_donation', 
        name: 'First Steps', 
        description: 'Make your first donation' 
      });
    }
    
    // Count unique charities donated to
    const uniqueCharityIds = new Set();
    
    // Add charity IDs from transactions
    transactions.forEach(transaction => {
      if (transaction.charity_id) {
        uniqueCharityIds.add(transaction.charity_id);
      }
    });
    
    // Add charity IDs from donations
    donations.forEach(donation => {
      if (donation.charity_id) {
        uniqueCharityIds.add(donation.charity_id);
      }
    });
    
    // Add charity IDs from combined transactions
    combinedTransactions.forEach(item => {
      if (item && item.charity_id) {
        uniqueCharityIds.add(item.charity_id);
      }
    });
    
    const uniqueCharityCount = uniqueCharityIds.size;
    console.log('Unique charity count:', uniqueCharityCount);
    console.log('Unique charity IDs:', Array.from(uniqueCharityIds));
    
    // Donate to 3 different charities
    if (uniqueCharityCount >= 3) {
      console.log('Adding 3 charities achievement');
      userAchievements.push({ 
        id: 'donate_3_charities', 
        name: 'Generous Heart', 
        description: 'Donate to 3 different charities' 
      });
    }
    
    // Donate to 10 different charities
    if (uniqueCharityCount >= 10) {
      console.log('Adding 10 charities achievement');
      userAchievements.push({ 
        id: 'donate_10_charities', 
        name: 'Community Pillar', 
        description: 'Donate to 10 different charities' 
      });
    }
    
    // Complete profile achievement
    if (currentUser?.profile_picture) {
      userAchievements.push({ 
        id: 'complete_profile', 
        name: 'Identity', 
        description: 'Complete your profile information' 
      });
    }
    
    // Following achievements
    if (followedOrganizations.length >= 5) {
      userAchievements.push({ 
        id: 'follow_5_orgs', 
        name: 'Connected', 
        description: 'Follow 5 organizations' 
      });
    }
    
    if (followedCharities.length >= 5) {
      userAchievements.push({ 
        id: 'follow_5_charities', 
        name: 'Charity Supporter', 
        description: 'Follow 5 charities' 
      });
    }
    
    console.log('Final achievements:', userAchievements);
    
    // Update the achievements state
    setAchievements(userAchievements);
  };

  // Add this useEffect to recalculate achievements when relevant data changes
  useEffect(() => {
    if (currentUser) {
      console.log('Data changed, recalculating achievements');
      calculateUserAchievements();
    }
  }, [transactions, donations, combinedTransactions, followedOrganizations, followedCharities, currentUser]);

  // Add this function to handle voucher claims
  const handleClaimVoucher = async (voucherId, tierName) => {
    try {
      // In a real app, you would make an API call to claim the voucher
      // For now, we'll just simulate it
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1000)),
        {
          loading: 'Claiming voucher...',
          success: () => {
            // Add the voucher to claimed vouchers
            setClaimedVouchers([...claimedVouchers, { id: voucherId, tier: tierName, claimedAt: new Date() }]);
            return `Successfully claimed ${tierName} tier voucher!`;
          },
          error: 'Failed to claim voucher. Please try again.',
        }
      );
    } catch (error) {
      console.error('Error claiming voucher:', error);
      toast.error('Failed to claim voucher. Please try again.');
    }
  };
  
  // Add this function to check if a voucher is claimable
  const isVoucherClaimable = (tierName) => {
    // Check if the user's tier is high enough to claim this voucher
    const tierLevels = {
      'Bronze': 1,
      'Silver': 2,
      'Gold': 3,
      'Platinum': 4,
      'Diamond': 5
    };
    
    const userTierLevel = tierLevels[rewardTier?.name] || 0;
    const requiredTierLevel = tierLevels[tierName] || 999;
    
    return userTierLevel >= requiredTierLevel;
  };
  
  // Add this function to check if a voucher is already claimed
  const isVoucherClaimed = (voucherId) => {
    return claimedVouchers.some(voucher => voucher.id === voucherId);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaUser className="mr-3 text-indigo-600" />
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back!
          </p>
        </div>
      </motion.div>
      
      <div className="bg-gray-50 shadow-sm rounded-lg overflow-hidden">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {currentUser?.profile_picture && (
                <img
                  src={formatImageUrl(currentUser.profile_picture)}
                  alt={currentUser.name}
                  className="h-12 w-12 rounded-full object-cover"
                  onError={(e) => {
                    console.error('Failed to load profile image:', currentUser.profile_picture);
                    e.target.src = 'https://via.placeholder.com/48?text=Profile';
                  }}
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentUser?.name}</h1>
                <p className="text-sm text-gray-500">Member since {new Date(currentUser?.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/user/edit')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <FaEdit className="mr-2" /> Edit Profile
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FaUser className="mr-2" />
                  <span>Menu</span>
                </button>
                {showUserMenu && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Settings
                      </Link>
              <button
                onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                        <FaSignOutAlt className="inline mr-2" /> Sign Out
              </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaHandHoldingUsd className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Donations</dt>
                    <dd className="text-lg font-semibold text-gray-900">${totalDonationAmount.toFixed(2)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaHeart className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Charities Supported</dt>
                    <dd className="text-lg font-semibold text-gray-900">{completedCharities.length + inProgressCharities.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaThumbsUp className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Following</dt>
                    <dd className="text-lg font-semibold text-gray-900">{followedOrganizations.length + followedCharities.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaMedal className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Achievements</dt>
                    <dd className="text-lg font-semibold text-gray-900">{achievements.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress to next tier */}
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Progress to {nextTierProgress?.nextTier || 'Next Tier'}
          </h2>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                  {nextTierProgress?.percentage || 0}%
              </span>
            </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-indigo-600">
                  ${totalDonationAmount || 0} / ${nextTierProgress?.nextTier ? (rewardTier?.threshold + nextTierProgress?.remaining) : rewardTier?.threshold}
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
              <div style={{ width: `${nextTierProgress?.percentage || 0}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
          </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-4 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('profile')}
            className={`px-3 py-2 font-medium text-sm rounded-md ${
                activeTab === 'profile'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaUser className="inline mr-2" /> Profile
            </button>
            <button
            onClick={() => setActiveTab('followed')}
            className={`px-3 py-2 font-medium text-sm rounded-md ${
              activeTab === 'followed'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaThumbsUp className="inline mr-2" /> Following
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
            className={`px-3 py-2 font-medium text-sm rounded-md ${
                activeTab === 'transactions'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaHistory className="inline mr-2" /> Transactions
            </button>
            <button
            onClick={() => setActiveTab('achievements')}
            className={`px-3 py-2 font-medium text-sm rounded-md ${
              activeTab === 'achievements'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaTrophy className="inline mr-2" /> Achievements
            </button>
          </nav>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-start">
              <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
                <div 
                  className="relative h-32 w-32 rounded-full overflow-hidden border-4 mb-4"
                  style={{ borderColor: selectedFrame ? availableFrames.find(f => f.id === selectedFrame)?.color : '#E5E7EB' }}
                >
                  {currentUser?.profile_picture ? (
                    <img
                      src={formatImageUrl(currentUser.profile_picture)}
                      alt={currentUser.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/128?text=Profile';
                      }}
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <FaUser className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <h2 className="text-xl font-bold text-gray-900">{currentUser?.name}</h2>
                <p className="text-sm text-gray-500 mb-2">{currentUser?.gmail}</p>
                
                <div className="w-full bg-gray-100 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500">Total Donated</span>
                    <span className="text-lg font-bold text-indigo-600">${totalDonationAmount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Achievements</span>
                    <span className="text-lg font-bold text-indigo-600">{achievements.length}</span>
                  </div>
                </div>
              </div>
              
              <div className="md:w-2/3 md:pl-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
                    <label className="block text-sm font-medium text-gray-500">Full Name</label>
                    <p className="mt-1 text-gray-900">{currentUser?.name}</p>
                  </div>
                  
                <div>
                  <label className="block text-sm font-medium text-gray-500">IC Number</label>
                    <p className="mt-1 text-gray-900">{currentUser?.ic_number}</p>
                </div>
                  
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-gray-900">{currentUser?.gmail}</p>
                </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone</label>
                    <p className="mt-1 text-gray-900">{currentUser?.phone_number || 'Not provided'}</p>
            </div>

                <div>
                    <label className="block text-sm font-medium text-gray-500">Address</label>
                    <p className="mt-1 text-gray-900">{currentUser?.wallet_address || 'Not provided'}</p>
                </div>
                  
                <div>
                    <label className="block text-sm font-medium text-gray-500">Member Since</label>
                    <p className="mt-1 text-gray-900">{new Date(currentUser?.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/user/edit')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <FaEdit className="mr-2" /> Edit Profile
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FaTrophy className="mr-2 text-yellow-500" />
              Your Achievements
            </h2>
            
            {/* Profile Frames Section */}
            <div className="mb-8">
              <h3 className="text-md font-medium text-gray-700 mb-4 border-b pb-2">Profile Frames</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Current Frame</h4>
                  <div className="flex items-center justify-center">
                    <div 
                      className="relative h-32 w-32 rounded-full overflow-hidden border-4"
                      style={{ borderColor: selectedFrame ? availableFrames.find(f => f.id === selectedFrame)?.color : '#E5E7EB' }}
                    >
                      {currentUser?.profile_picture ? (
                        <img
                          src={formatImageUrl(currentUser.profile_picture)}
                          alt={currentUser.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/128?text=Profile';
                          }}
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          <FaUser className="h-16 w-16 text-gray-400" />
                    </div>
                      )}
                    </div>
                  </div>
                      </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Available Frames</h4>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {availableFrames.map(frame => (
                      <button
                        key={frame.id}
                        onClick={() => isFrameUnlocked(frame.id) && setSelectedFrame(frame.id)}
                        className={`relative h-16 w-16 rounded-full overflow-hidden border-4 ${
                          selectedFrame === frame.id ? 'ring-2 ring-indigo-500' : ''
                        }`}
                          style={{ 
                          borderColor: frame.color,
                          opacity: isFrameUnlocked(frame.id) ? 1 : 0.5,
                          cursor: isFrameUnlocked(frame.id) ? 'pointer' : 'not-allowed'
                        }}
                        title={isFrameUnlocked(frame.id) ? frame.name : `Locked: ${frame.requirement}`}
                      >
                        {currentUser?.profile_picture ? (
                          <img
                            src={formatImageUrl(currentUser.profile_picture)}
                            alt={frame.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                            <FaUser className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                        {!isFrameUnlocked(frame.id) && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <FaLock className="text-white" />
                </div>
              )}
                      </button>
                    ))}
                  </div>
                </div>
            </div>
            
              {/* Achievement List */}
              <h3 className="text-md font-medium text-gray-700 mb-4 border-b pb-2">Achievement List</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'first_donation', icon: FaHandHoldingUsd, name: 'First Steps', description: 'Make your first donation', completed: achievements.some(a => a.id === 'first_donation') },
                  { id: 'donate_3_charities', icon: FaHeart, name: 'Generous Heart', description: 'Donate to 3 different charities', completed: achievements.some(a => a.id === 'donate_3_charities') },
                  { id: 'donate_10_charities', icon: FaUsers, name: 'Community Pillar', description: 'Donate to 10 different charities', completed: achievements.some(a => a.id === 'donate_10_charities') },
                  { id: 'donate_100', icon: FaMoneyBillWave, name: 'Century Club', description: 'Donate a total of $100', completed: totalDonationAmount >= 100 },
                  { id: 'donate_500', icon: FaChartLine, name: 'Major Contributor', description: 'Donate a total of $500', completed: totalDonationAmount >= 500 },
                  { id: 'donate_1000', icon: FaStar, name: 'Platinum Donor', description: 'Donate a total of $1,000', completed: totalDonationAmount >= 1000 },
                  { id: 'follow_5_orgs', icon: FaThumbsUp, name: 'Connected', description: 'Follow 5 organizations', completed: followedOrganizations.length >= 5 },
                  { id: 'follow_5_charities', icon: FaHeart, name: 'Charity Supporter', description: 'Follow 5 charities', completed: followedCharities.length >= 5 },
                  { id: 'complete_profile', icon: FaUser, name: 'Identity', description: 'Complete your profile information', completed: true },
                ].map(achievement => (
                  <div 
                    key={achievement.id}
                    className={`border rounded-lg p-4 ${
                      achievement.completed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`p-2 rounded-full ${
                        achievement.completed ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
                      }`}>
                        <achievement.icon className="h-5 w-5" />
                        </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-900">{achievement.name}</h4>
                          <p className="text-xs text-gray-500">{achievement.description}</p>
                        </div>
                      {achievement.completed && (
                        <FaCheckCircle className="ml-auto text-green-500" />
                      )}
                      </div>
                    </div>
                  ))}
                </div>
            </div>
            
            {/* Reward Tier Section */}
            <div className="mt-8">
              <h3 className="text-md font-medium text-gray-700 mb-4 border-b pb-2">Reward Tier</h3>
              
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold">{rewardTier?.name || 'Bronze Donor'}</h4>
                    <p className="text-indigo-100">${totalDonationAmount || 0} total donated</p>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                    {rewardTier?.icon === 'bronze' && <FaMedal className="h-8 w-8 text-yellow-600" />}
                    {rewardTier?.icon === 'silver' && <FaMedal className="h-8 w-8 text-gray-300" />}
                    {rewardTier?.icon === 'gold' && <FaMedal className="h-8 w-8 text-yellow-400" />}
                    {rewardTier?.icon === 'platinum' && <FaTrophy className="h-8 w-8 text-gray-200" />}
                    {rewardTier?.icon === 'diamond' && <FaStar className="h-8 w-8 text-blue-300" />}
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress to next tier</span>
                    <span>{nextTierProgress?.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-2.5">
                    <div 
                      className="bg-white h-2.5 rounded-full" 
                      style={{ width: `${nextTierProgress?.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <p className="text-sm text-indigo-100">
                  {nextTierProgress?.nextTier 
                    ? `$${nextTierProgress.remaining || 0} more to reach ${nextTierProgress.nextTier}` 
                    : 'You have reached the highest tier!'}
                </p>
                
                <div className="mt-4 p-3 bg-white bg-opacity-10 rounded-lg">
                  <h5 className="font-medium mb-2">Your Benefits:</h5>
                  <ul className="text-sm space-y-1">
                    {rewardTier?.benefits?.map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <FaCheckCircle className="text-green-300 mr-2 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    )) || (
                      <li className="flex items-center">
                        <FaCheckCircle className="text-green-300 mr-2 flex-shrink-0" />
                        <span>Access to donor-only updates</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* New Voucher Claim Section - Improved UI */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FaTicketAlt className="mr-2 text-indigo-600" />
                  Your Reward Vouchers
                </h3>
                
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  {/* Header with title and description */}
                  <div className="p-5 bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
                    <h4 className="text-lg font-medium text-gray-900">Exclusive Rewards for Your Generosity</h4>
                    <p className="text-sm text-gray-600 mt-1">Unlock special offers as you reach higher donation tiers</p>
                  </div>
                  
                  {/* Filter Buttons - Styled as circles with icons */}
                  <div className="p-6 flex justify-center space-x-8 bg-white">
                    <button 
                      onClick={() => setVoucherFilter('all')}
                      className="w-20 h-20 rounded-full flex flex-col items-center justify-center bg-blue-100 text-blue-700 shadow-sm transition-all hover:shadow-md"
                    >
                      <FaEllipsisH className="text-xl mb-1" />
                      <span className="text-xs font-medium">All</span>
                    </button>
                    
                    <button 
                      onClick={() => setVoucherFilter('shopping')}
                      className="w-20 h-20 rounded-full flex flex-col items-center justify-center bg-blue-100 text-blue-700 shadow-sm transition-all hover:shadow-md"
                    >
                      <FaShoppingBag className="text-xl mb-1" />
                      <span className="text-xs font-medium">Shopping</span>
                    </button>
                    
                    <button 
                      onClick={() => setVoucherFilter('food')}
                      className="w-20 h-20 rounded-full flex flex-col items-center justify-center bg-blue-100 text-blue-700 shadow-sm transition-all hover:shadow-md"
                    >
                      <FaCocktail className="text-xl mb-1" />
                      <span className="text-xs font-medium">Food & Beverage</span>
                    </button>
                  </div>
                  
                  {/* Voucher Cards - Styled as horizontal cards in a grid */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Zeus Voucher */}
                    <div className="rounded-xl overflow-hidden shadow-md transition-all hover:shadow-lg transform hover:-translate-y-1">
                      <div className="p-5 bg-blue-50 flex items-center">
                        <div className="flex-none">
                          <img src={ZeusImg} alt="Zeus" className="h-16 w-16 rounded-lg object-cover" />
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-xl font-medium text-blue-800">Buy 1 Free 1 Voucher</p>
                          <p className="text-xs text-blue-600">*Terms & Conditions apply</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Tealive Voucher 1 */}
                    <div className="rounded-xl overflow-hidden shadow-md transition-all hover:shadow-lg transform hover:-translate-y-1">
                      <div className="p-5 bg-blue-50 flex items-center">
                        <div className="flex-none">
                          <img src={TealiveImg} alt="Tealive" className="h-16 w-16 rounded-lg object-cover" />
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-xl font-medium text-blue-800">Buy 1 Free 1 Voucher</p>
                          <p className="text-xs text-blue-600">*Terms & Conditions apply</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Tealive Voucher 2 - Locked */}
                    <div className="rounded-xl overflow-hidden shadow-md bg-gray-300 relative">
                      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                      <div className="p-5 flex items-center relative">
                        <div className="flex-none">
                          <img src={TealiveImg} alt="Tealive" className="h-16 w-16 rounded-lg object-cover filter grayscale" />
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-xl font-medium text-gray-700">Buy 1 Free 1 Voucher</p>
                          <p className="text-sm text-gray-600 flex items-center justify-end gap-2">
                            <FaLock className="text-gray-500" /> Unlocked at Silver Tier
                          </p>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-400 to-gray-500"></div>
                    </div>
                    
                    {/* Tealive Voucher 3 */}
                    <div className="rounded-xl overflow-hidden shadow-md transition-all hover:shadow-lg transform hover:-translate-y-1">
                      <div className="p-5 bg-blue-50 flex items-center">
                        <div className="flex-none">
                          <img src={TealiveImg} alt="Tealive" className="h-16 w-16 rounded-lg object-cover" />
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-xl font-medium text-blue-800">Buy 1 Free 1 Voucher</p>
                          <p className="text-xs text-blue-600">*Terms & Conditions apply</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Completed Charities Tab */}
        {activeTab === 'completed' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FaCheckCircle className="mr-2 text-green-500" />
              Completed Charities
            </h2>
            
            {completedCharities.length === 0 ? (
              <div className="text-center py-8">
                <FaCheckCircle className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No completed charities</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You haven't completed any charities yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {completedCharities.map(charity => (
                  <div key={charity.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {charity.picture_path && (
                      <img
                        src={formatImageUrl(charity.picture_path)}
                        alt={charity.name}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900">{charity.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{charity.category}</p>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                        {charity.description}
                      </p>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Funded</span>
                          <span className="font-medium">${charity.fund_received} / ${charity.fund_targeted}</span>
                        </div>
                        <div className="mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-green-600 h-2.5 rounded-full" 
                              style={{ width: '100%' }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link
                          to={`/charities/${charity.id}`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Followed Organizations Tab */}
        {activeTab === 'followed' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FaThumbsUp className="mr-2 text-indigo-500" />
              Organizations & Charities You Follow
            </h2>
            
            {/* Organizations Section */}
            <div className="mb-8">
              <h3 className="text-md font-medium text-gray-700 mb-4 border-b pb-2">Organizations</h3>
            
            {followedOrganizations.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <FaUsers className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                  <h3 className="text-md font-medium text-gray-900 mb-2">No followed organizations</h3>
                  <p className="text-gray-600 mb-4">You haven't followed any organizations yet.</p>
                  <Link
                    to="/organizations"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FaUsers className="mr-2" />
                    Browse Organizations
                  </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {followedOrganizations.map(org => (
                    <OrganizationCard key={org.id} organization={{...org, is_following: true}} inDashboard={true} />
                ))}
              </div>
            )}
          </div>
            
            {/* Charities Section */}
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-4 border-b pb-2">Charities</h3>
            
            {followedCharities.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <FaHeart className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                  <h3 className="text-md font-medium text-gray-900 mb-2">No followed charities</h3>
                  <p className="text-gray-600 mb-4">You haven't followed any charities yet.</p>
                  <Link
                    to="/charities"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FaHandHoldingUsd className="mr-2" />
                    Browse Charities
                  </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {followedCharities.map(charity => (
                    <CharityCard key={charity.id} charity={{...charity, is_following: true}} inDashboard={true} />
                ))}
              </div>
            )}
            </div>
            {/* Recommended Charity Section */}
            <div>
              <br />
              <br />

              <AIGenerator 
                userHistory={followedCharities && followedCharities.length > 0 
                  ? followedCharities.map(charity => `Supports ${charity.category}`) 
                  : ["Looking for a charity recommendation"]} // ✅ Default prompt if no followed charities
                followedCharityNames={followedCharities ? followedCharities.map(charity => charity.name.toLowerCase()) : []} 
                onRecommendation={setRecommendedCharity} 
              />

              <h3 className="text-md font-medium text-gray-700 mb-4 border-b pb-2">Recommended Charity</h3>

              {recommendedCharity ? (
                <div className="grid grid-cols-1 gap-6">
                  <CharityCard key={recommendedCharity.id} charity={{ ...recommendedCharity, is_following: false }} inDashboard={false} />
                </div>
              ) : (
                <p className="text-gray-600">No recommendations available.</p>
              )}
            </div>

          </div>

            

          
        )}

        {/* Transaction History Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <FaHistory className="mr-2" />
                Transaction History
              </h2>
              
              {/* Add filter dropdown */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">View:</span>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={currentDataSource}
                  onChange={(e) => {
                    setCurrentDataSource(e.target.value);
                  }}
                >
                  <option value="transactions">Transactions</option>
                  <option value="donations">Donations</option>
                  <option value="combined">Combined</option>
                </select>
                
                <button
                  onClick={() => loadDataBySource(currentDataSource)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaSync className="mr-2" />
                  Refresh
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-600">{error}</div>
            ) : combinedTransactions.length === 0 ? (
              <div className="text-center py-8">
                <FaHistory className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {currentDataSource === 'donations' 
                    ? "You haven't made any donations yet." 
                    : currentDataSource === 'combined'
                      ? "You haven't made any financial activities yet."
                      : "You haven't made any transactions yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {combinedTransactions.map(item => {
                      if (!item) return null; // Skip null or undefined items
                      
                      // Determine if this is a donation or transaction
                      const isDonation = item.source === 'Donation' || item.donor_message;
                      
                      return (
                        <tr key={item.id || item.transaction_hash || Math.random()} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.created_at || item.completed_at || new Date())}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              isDonation ? 'bg-purple-100 text-purple-800' : 
                              item.type === 'charity' ? 'bg-blue-100 text-blue-800' : 
                              'bg-green-100 text-green-800'
                            }`}>
                              {isDonation ? 'Donation' : 
                               item.type === 'charity' ? 'Charity Donation' : 
                               'Task Funding'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {item.amount ? `$${item.amount}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 items-center inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                              {getStatusIcon(item.status)}
                              {formatStatus(item.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 items-center whitespace-nowrap text-sm text-gray-500">
                            {isDonation ? (
                              <Link to={`/donations/${item.id}`} className="text-indigo-600 hover:text-indigo-900">
                                View Donation
                              </Link>
                            ) : item.type === 'charity' && item.charity_id ? (
                              <Link to={`/charities/${item.charity_id}`} className="text-indigo-600 hover:text-indigo-900">
                                View Charity
                              </Link>
                            ) : item.type === 'task' && item.task_id ? (
                              <Link to={`/tasks/${item.task_id}`} className="text-indigo-600 hover:text-indigo-900">
                                View Task
                              </Link>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {isDonation && item.status === 'completed' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => viewInvoice(item.id)}
                                  className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                  title="View Invoice"
                                >
                                  View Invoice
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
    </div>
  );
} 