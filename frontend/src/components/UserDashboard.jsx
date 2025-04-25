import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBlockchain } from '../context/BlockchainContext';
import { formatImageUrl } from '../utils/helpers';
import { AnimatePresence } from 'framer-motion'; // ← this is required
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  calculateRewardTier, 
  calculateNextTierProgress, 
  getAchievements, 
  calculateTotalDonationAmount,
  rewardTiers
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
  FaChevronDown,
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
  FaGift,
  FaAward,
  FaCaretRight,
  FaShieldAlt,
  FaGem,
  FaCrown,
  FaGlobe,
  FaHandHoldingHeart,
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
  const [rewards, setRewards] = useState([]);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [loadingRewards, setLoadingRewards] = useState(false);
  const [loadingClaim, setLoadingClaim] = useState(false);
  const [showRewardDetails, setShowRewardDetails] = useState(null);
  const [peopleHelped, setPeopleHelped] = useState(0);
  const [impactStats, setImpactStats] = useState({
    peopleHelped: 0,
    communitiesImpacted: 0,
    countriesReached: 0
  });
  
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
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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

  // Add this function to calculate impact statistics after the calculateTotalFromAllSources function
  const calculateImpactStats = () => {
    // Estimate impact based on total donation amount
    // These are example calculations - in a real app, this would be based on actual charity data
    const estimatedPeopleHelped = Math.floor(totalDonationAmount * 2.5); // Assuming $1 helps 2.5 people on average
    const communitiesImpacted = Math.ceil(totalDonationAmount / 500); // Assuming each $500 impacts one community
    const countriesReached = Math.min(Math.floor(totalDonationAmount / 1000), 15); // Cap at 15 countries

    return {
      peopleHelped: estimatedPeopleHelped,
      communitiesImpacted,
      countriesReached
    };
  };

  // Modify the calculateUserAchievements function to fix the mismatch
  const calculateUserAchievements = () => {
    // Create a comprehensive list of achievements
    const userAchievements = [];
    
    // Debug logging
    console.log('Calculating achievements with:');
    console.log('Transactions:', transactions);
    console.log('Donations:', donations);
    console.log('Combined transactions:', combinedTransactions);
    console.log('Total donation amount:', totalDonationAmount);
    
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
      if (transaction && transaction.charity_id) {
        uniqueCharityIds.add(transaction.charity_id);
      }
    });
    
    // Add charity IDs from donations
    donations.forEach(donation => {
      if (donation && donation.charity_id) {
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
    
    // Add donation amount achievements - make sure to use the total amount
    if (totalDonationAmount >= 100) {
      userAchievements.push({ 
        id: 'donate_100', 
        name: 'Century Club', 
        description: 'Donate a total of $100' 
      });
    }
    
    if (totalDonationAmount >= 500) {
      userAchievements.push({ 
        id: 'donate_500', 
        name: 'Major Contributor', 
        description: 'Donate a total of $500' 
      });
    }
    
    if (totalDonationAmount >= 1000) {
      userAchievements.push({ 
        id: 'donate_1000', 
        name: 'Platinum Donor', 
        description: 'Donate a total of $1,000' 
      });
    }

    // Diamond donor achievement
    if (totalDonationAmount >= 5000) {
      userAchievements.push({ 
        id: 'donate_5000', 
        name: 'Diamond Donor', 
        description: 'Donate a total of $5,000' 
      });
    }
    
    console.log('Final achievements:', userAchievements);
    
    // Update the achievements state
    setAchievements(userAchievements);
    
    // Calculate impact stats
    const stats = calculateImpactStats();
    setImpactStats(stats);
  };

  // Add this useEffect to update impact stats when totalDonationAmount changes
  useEffect(() => {
    if (totalDonationAmount > 0) {
      const stats = calculateImpactStats();
      setImpactStats(stats);
    }
  }, [totalDonationAmount]);

  // Add this useEffect to recalculate achievements when relevant data changes
  useEffect(() => {
    if (currentUser) {
      console.log('Data changed, recalculating achievements');
      calculateUserAchievements();
    }
  }, [transactions, donations, combinedTransactions, followedOrganizations, followedCharities, currentUser]);

  // Add this function after fetchUserData
  useEffect(() => {
    const fetchRewards = async () => {
      if (!currentUser) return;
      
      try {
        setLoadingRewards(true);
        
        // In a real app, this would be an API call to your backend
        // For now, we'll simulate the response
        const mockVouchers = [
          {
            id: 'coffee-voucher',
            name: 'Zeus Coffee Voucher',
            description: '15% off any coffee purchase',
            tier: 'Bronze',
            points: 100,
            merchant: 'Zus Coffee',
            expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            image: ZeusImg
          },
          {
            id: 'bubble-tea',
            name: 'Tealive Discount',
            description: 'Buy 1 Free 1 for any Boba Tea',
            tier: 'Silver',
            points: 250,
            merchant: 'Tealive',
            expiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
            image: TealiveImg
          },
          {
            id: 'movie-ticket',
            name: 'Movie Ticket Discount',
            description: '30% off any movie ticket',
            tier: 'Gold',
            points: 500,
            merchant: 'Golden Screen Cinemas',
            expiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
            image: 'https://img.freepik.com/free-vector/cinema-film-festival-background_1017-23786.jpg?w=826&t=st=1699021412~exp=1699022012~hmac=d1a5bcc8a27fad3cab2ed6ad6cddf2ffe276c26eca9a867a24516c12a6bed8db'
          },
          {
            id: 'charity-points',
            name: 'Extra Donation Points',
            description: '500 bonus points on your next donation',
            tier: 'Platinum',
            points: 1000,
            merchant: 'TrustChain',
            expiry: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
            image: 'https://img.freepik.com/free-vector/hand-drawn-charity-concept_23-2147550861.jpg?w=826&t=st=1699021459~exp=1699022059~hmac=ff6d5587dc3b2f75eaab4a3ef2d282d5842e61f8e7cc9e9e5a331b3f1a897acf'
          },
          {
            id: 'premium-upgrade',
            name: 'Premium User Upgrade',
            description: '3 months of Premium User status',
            tier: 'Diamond',
            points: 5000,
            merchant: 'TrustChain',
            expiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180
            image: 'https://img.freepik.com/free-vector/golden-royal-badge-design_1017-8055.jpg?w=826&t=st=1699021496~exp=1699022096~hmac=4b4e8b6e9c3f5b9c9c34b74a79a3a8b7ec2bc86e2f56d689cdb53daddc2f90b0'
          }
        ];
        
        // Calculate reward points based on donation amount (1 point per $1)
        const points = Math.floor(totalDonationAmount);
        setRewardPoints(points);
        
        // Filter vouchers based on user's tier
        setAvailableVouchers(mockVouchers);
        
        setLoadingRewards(false);
      } catch (error) {
        console.error('Error fetching rewards:', error);
        setLoadingRewards(false);
      }
    };
    
    if (currentUser && totalDonationAmount > 0) {
      fetchRewards();
    }
  }, [currentUser, totalDonationAmount]);

  // Update handleClaimVoucher function
  const handleClaimVoucher = async (voucher) => {
    if (!isVoucherClaimable(voucher.tier) || isVoucherClaimed(voucher.id)) {
      toast.error('This voucher is not available for your current tier');
      return;
    }

    try {
      setLoadingClaim(true);
      
      // In a real app, you would make an API call to claim the voucher
      // For now, we'll simulate a network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate deducting points (in a real app this would be handled by the backend)
      setRewardPoints(prev => Math.max(0, prev - voucher.points));
      
      // Add the voucher to claimed vouchers
      const newClaim = { 
        id: voucher.id, 
        name: voucher.name,
        description: voucher.description,
        tier: voucher.tier, 
        merchant: voucher.merchant,
        image: voucher.image,
        claimedAt: new Date(),
        redemptionCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        expiry: voucher.expiry
      };
      
      setClaimedVouchers(prev => [...prev, newClaim]);
      setLoadingClaim(false);
      
      toast.success(`Successfully claimed ${voucher.name}!`);
    } catch (error) {
      console.error('Error claiming voucher:', error);
      setLoadingClaim(false);
      toast.error('Failed to claim voucher. Please try again.');
    }
  };

  // Update isVoucherClaimable function
  const isVoucherClaimable = (tierName) => {
    // Check if the user's tier is high enough to claim this voucher
    const tierLevels = {
      'Bronze': 1,
      'Silver': 2,
      'Gold': 3,
      'Platinum': 4,
      'Diamond': 5
    };
    
    const userTierLevel = tierLevels[rewardTier?.name?.split(' ')[0]] || 0;
    const requiredTierLevel = tierLevels[tierName] || 999;
    
    // Also check if user has enough points
    const voucher = availableVouchers.find(v => v.tier === tierName);
    if (voucher && rewardPoints < voucher.points) {
      return false;
    }
    
    return userTierLevel >= requiredTierLevel;
  };

  // Add function to check if a voucher is already claimed
  const isVoucherClaimed = (voucherId) => {
    return claimedVouchers.some(voucher => voucher.id === voucherId);
  };

  // Add function to get tier color
  const getTierColor = (tierName) => {
    if (!tierName) return 'bg-gray-100 text-gray-800';
    
    switch (tierName.toLowerCase()) {
      case 'bronze':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'silver':
        return 'bg-gray-200 text-gray-800 border-gray-300';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'platinum':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'diamond':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Add function to get tier icon
  const getTierIcon = (tierName) => {
    if (!tierName) return FaMedal;
    
    switch (tierName.toLowerCase()) {
      case 'bronze':
        return FaMedal;
      case 'silver':
        return FaAward;
      case 'gold':
        return FaTrophy;
      case 'platinum':
        return FaShieldAlt;
      case 'diamond':
        return FaCrown;
      default:
        return FaMedal;
    }
  };

  // Add function to format points
  const formatPoints = (points) => {
    return new Intl.NumberFormat().format(points);
  };

  // Add functions for consistent type styling after the getStatusIcon function
  const getTransactionType = (item) => {
    // Simplify to only three possible types
    
    // Check if this is fund_release
    if (item.type === 'fund_release') {
      return 'Fund Release';
    }
    
    // Check donation types
    if (item.donation_type === 'subscription' || 
        (item.type === 'subscription') || 
        (item.source === 'Donation' && item.type === 'subscription')) {
      return 'Subscription Donation';
    }
    
    // Default to charity donation for all other donation types
    if (item.source === 'Donation' || 
        item.donor_message || 
        item.donor_id ||
        item.cause_id || 
        item.currency_type || 
        item.donation_type === 'charity' || 
        item.type === 'charity' || 
        item.type === 'donation') {
      return 'Charity Donation';
    }
    
    // If nothing else matches, default to Fund Release
    return 'Fund Release';
  };

  const getTypeClass = (item) => {
    // Get the transaction type
    const transactionType = getTransactionType(item);
    
    // Apply consistent colors
    switch (transactionType) {
      case 'Fund Release':
        return 'bg-green-100 text-green-800';
      case 'Charity Donation':
        return 'bg-purple-100 text-purple-800';
      case 'Subscription Donation':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (item) => {
    // Get the transaction type
    const transactionType = getTransactionType(item);
    
    // Apply consistent icons
    switch (transactionType) {
      case 'Fund Release':
        return <FaMoneyBillWave className="mr-1.5" />;
      case 'Charity Donation':
      case 'Subscription Donation':
        return <FaHandHoldingHeart className="mr-1.5" />;
      default:
        return <FaExchangeAlt className="mr-1.5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 pb-12"
    >
      {/* Header with gradient background */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative rounded-xl bg-gradient-to-r from-indigo-700 to-purple-700 text-white p-8 mb-8 shadow-lg overflow-hidden max-w-7xl mx-auto"
      >
        {/* Abstract background shapes */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white transform translate-x-1/3 translate-y-1/3"></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center">
            <div 
              className="mr-6 h-20 w-20 rounded-lg overflow-hidden border-4 border-white/30 shadow-md bg-white/10"
              style={{ borderColor: selectedFrame ? availableFrames.find(f => f.id === selectedFrame)?.color : 'rgba(255, 255, 255, 0.3)' }}
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
                <div className="h-full w-full bg-white/20 flex items-center justify-center">
                  <FaUser className="h-10 w-10 text-white" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">{currentUser?.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 backdrop-blur-sm text-white">
                  {rewardTier?.name || 'Bronze Donor'}
                </span>
                {totalDonationAmount > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-400/20 backdrop-blur-sm text-white">
                    <FaCheckCircle className="mr-1" />
                    Active Donor
                  </span>
                )}
              </div>
              <p className="text-indigo-100 max-w-2xl">
                Manage your donations, track achievements, and make a difference
              </p>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link
              to="/user/edit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-500/30 hover:bg-indigo-500/50 backdrop-blur-sm transition-colors duration-200"
            >
              <FaEdit className="mr-2" />
              Edit Profile
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-white/20 text-sm font-medium rounded-lg shadow-sm text-white hover:bg-white/10 backdrop-blur-sm transition-colors duration-200"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </motion.div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
        >
          <div className="bg-white overflow-hidden shadow-sm rounded-xl hover:shadow-md transition-shadow duration-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-lg">
                  <FaHandHoldingUsd className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Donations</dt>
                    <dd className="text-2xl font-semibold text-gray-900">${totalDonationAmount.toFixed(2)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded-xl hover:shadow-md transition-shadow duration-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
                  <FaTrophy className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Achievements</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{achievements.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded-xl hover:shadow-md transition-shadow duration-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 p-3 rounded-lg">
                  <FaUsers className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Following</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{followedOrganizations.length + followedCharities.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded-xl hover:shadow-md transition-shadow duration-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                  <FaCertificate className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tier Progress</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{nextTierProgress?.percentage || 0}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white shadow-sm rounded-xl overflow-hidden mb-8"
        >
          <nav className="px-4 border-b border-gray-200 flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`${
                activeTab === 'profile'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 rounded-t-lg mx-1`}
            >
              <FaUser className={`mr-2 h-4 w-4 ${activeTab === 'profile' ? 'text-indigo-500' : 'text-gray-400'}`} />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('followed')}
              className={`${
                activeTab === 'followed'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 rounded-t-lg mx-1`}
            >
              <FaThumbsUp className={`mr-2 h-4 w-4 ${activeTab === 'followed' ? 'text-indigo-500' : 'text-gray-400'}`} />
              Following
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`${
                activeTab === 'transactions'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 rounded-t-lg mx-1`}
            >
              <FaHistory className={`mr-2 h-4 w-4 ${activeTab === 'transactions' ? 'text-indigo-500' : 'text-gray-400'}`} />
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`${
                activeTab === 'achievements'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 rounded-t-lg mx-1`}
            >
              <FaTrophy className={`mr-2 h-4 w-4 ${activeTab === 'achievements' ? 'text-indigo-500' : 'text-gray-400'}`} />
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`${
                activeTab === 'rewards'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 rounded-t-lg mx-1`}
            >
              <FaGift className={`mr-2 h-4 w-4 ${activeTab === 'rewards' ? 'text-indigo-500' : 'text-gray-400'}`} />
              Rewards
            </button>
          </nav>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
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
                        <span className="text-lg font-bold text-indigo-600">${totalDonationAmount.toFixed(2)}</span>
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
                    
                    {/* Add the new impact section */}
                    <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">Your Impact</h3>
                    
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                          <FaUsers className="mx-auto h-8 w-8 text-indigo-500 mb-2" />
                          <h4 className="text-2xl font-bold text-gray-900">{formatPoints(impactStats.peopleHelped)}</h4>
                          <p className="text-sm text-gray-600">People Helped</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                          <FaHandHoldingUsd className="mx-auto h-8 w-8 text-green-500 mb-2" />
                          <h4 className="text-2xl font-bold text-gray-900">{impactStats.communitiesImpacted}</h4>
                          <p className="text-sm text-gray-600">Communities Impacted</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                          <FaGlobe className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                          <h4 className="text-2xl font-bold text-gray-900">{impactStats.countriesReached}</h4>
                          <p className="text-sm text-gray-600">Countries Reached</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-4 text-center">
                        Your generosity has made a significant difference in the lives of many people around the world.
                      </p>
                    </div>
                    
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'followed' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
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
                      : ["Looking for a charity recommendation"]} //  Default prompt if no followed charities
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
              </motion.div>
            )}

            {activeTab === 'transactions' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <FaHistory className="mr-2 text-indigo-600" />
                    Transaction History
                  </h2>
                  
                  {/* Add filter dropdown */}
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">View:</span>
                    <select
                      className="appearance-none bg-white border border-gray-300 rounded-lg py-2 px-4 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={currentDataSource}
                      onChange={(e) => {
                        setCurrentDataSource(e.target.value);
                      }}
                    >
                      <option value="transactions">Transactions</option>
                      <option value="donations">Donations</option>
                      <option value="combined">All</option>
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
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                  </div>
                ) : combinedTransactions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gray-100 rounded-lg p-6 text-center"
                  >
                    <FaHistory className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-md font-medium text-gray-900 mb-2">No transactions</h3>
                    <p className="text-gray-600">
                      {currentDataSource === 'donations' 
                        ? "You haven't made any donations yet." 
                        : currentDataSource === 'combined'
                          ? "No transaction history found."
                          : "You haven't made any transactions yet."}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="overflow-x-auto bg-white rounded-lg shadow"
                  >
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-2" />
                              Date
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <FaHandHoldingUsd className="mr-2" />
                              Type
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <FaChartLine className="mr-2" />
                              Amount
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <FaCertificate className="mr-2" />
                              Status
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <FaExternalLinkAlt className="mr-2" />
                              Details
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <FaFileInvoice className="mr-2" />
                              Actions
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {combinedTransactions.map((item, index) => {
                          if (!item) return null; // Skip null or undefined items
                          
                          // Determine if this is a donation or transaction
                          const isDonation = item.source === 'Donation' || item.donor_message;
                          
                          return (
                            <motion.tr
                              key={item.id || item.transaction_hash || Math.random()}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(item.created_at || item.completed_at || new Date())}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeClass(item)}`}>
                                  {getTypeIcon(item)}
                                  {getTransactionType(item)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.amount ? `$${item.amount}` : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                  {getStatusIcon(item.status)}
                                  {formatStatus(item.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {isDonation ? (
                                  <Link to={`/donations/${item.id}`} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center">
                                    <FaExternalLinkAlt className="mr-2" />
                                    View Donation
                                  </Link>
                                ) : item.type === 'charity' && item.charity_id ? (
                                  <Link to={`/charities/${item.charity_id}`} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center">
                                    <FaExternalLinkAlt className="mr-2" />
                                    View Charity
                                  </Link>
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {isDonation && item.status === 'completed' && (
                                  <button
                                    onClick={() => viewInvoice(item.id)}
                                    className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                                  >
                                    <FaFileInvoice className="mr-2" />
                                    View Invoice
                                  </button>
                                )}
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
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
              </motion.div>
            )}

            {activeTab === 'rewards' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
                <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-md">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2 flex items-center">
                        <FaGem className="mr-2" /> Reward Program
                      </h2>
                      <p className="text-indigo-100 mb-4">
                        Earn points and unlock exclusive rewards by donating to charities.
                      </p>
                      
                      <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="flex items-center font-medium">
                            <FaGift className="mr-2" /> Your Points
                          </span>
                          <span className="text-2xl font-bold">{formatPoints(rewardPoints)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center mb-2">
                          <span className="flex items-center font-medium">
                            <FaTrophy className="mr-2" /> Current Tier
                          </span>
                          <span className="flex items-center">
                            {React.createElement(getTierIcon(rewardTier?.name?.split(' ')[0]), { className: "mr-2" })}
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              getTierColor(rewardTier?.name?.split(' ')[0])
                            }`}>
                              {rewardTier?.name || 'Bronze Donor'}
                            </span>
                          </span>
                        </div>
                        
                        {nextTierProgress && nextTierProgress.nextTier && (
                          <div className="mt-4">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress to {nextTierProgress.nextTier}</span>
                              <span>${totalDonationAmount} / ${nextTierProgress.remaining + totalDonationAmount}</span>
                            </div>
                            <div className="w-full bg-white bg-opacity-30 rounded-full h-2.5">
                              <div 
                                className="bg-white h-2.5 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${nextTierProgress.percentage}%` }}
                              ></div>
                            </div>
                            <p className="text-xs mt-2">
                              ${nextTierProgress.remaining} more in donations to reach {nextTierProgress.nextTier}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 md:mt-0 md:ml-6 flex-shrink-0">
                      <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
                        <h3 className="text-lg font-medium mb-2">Benefits</h3>
                        <ul className="space-y-2">
                          {rewardTier?.benefits?.map((benefit, index) => (
                            <li key={index} className="flex items-start">
                              <FaCheck className="mt-1 mr-2 flex-shrink-0 text-green-300" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tier Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FaCrown className="mr-2 text-yellow-500" />
                    Reward Tiers
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    {rewardTiers.map((tier, index) => (
                      <div 
                        key={tier.id}
                        className={`border rounded-lg p-4 transition-all duration-300 ${
                          rewardTier?.id === tier.id 
                            ? 'ring-2 ring-indigo-500 shadow-md transform scale-105 z-10' 
                            : 'hover:shadow-md'
                        } ${getTierColor(tier.name.split(' ')[0])}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold flex items-center">
                            {React.createElement(getTierIcon(tier.name.split(' ')[0]), { className: "mr-2" })}
                            {tier.name}
                          </h4>
                          {rewardTier?.id === tier.id && (
                            <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">Current</span>
                          )}
                        </div>
                        
                        <div className="text-sm mb-2 font-medium">${tier.threshold}+ donated</div>
                        
                        <ul className="text-xs space-y-1 mt-2">
                          {tier.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start">
                              <FaCaretRight className="mr-1 mt-0.5 flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Available Vouchers */}
                <div className="mb-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <FaTicketAlt className="mr-2 text-green-500" />
                      Available Rewards
                    </h3>
                    
                    <div className="flex space-x-4 mt-2 md:mt-0">
                      <select
                        className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={tierFilter}
                        onChange={e => setTierFilter(e.target.value)}
                      >
                        <option value="all">All Tiers</option>
                        <option value="Bronze">Bronze</option>
                        <option value="Silver">Silver</option>
                        <option value="Gold">Gold</option>
                        <option value="Platinum">Platinum</option>
                        <option value="Diamond">Diamond</option>
                      </select>
                      
                      <button
                        onClick={() => setVoucherFilter(voucherFilter === 'available' ? 'all' : 'available')}
                        className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                          voucherFilter === 'available'
                            ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <FaFilter className="mr-2" />
                        {voucherFilter === 'available' ? 'Show All' : 'Show Available'}
                      </button>
                    </div>
                  </div>
                  
                  {loadingRewards ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : availableVouchers.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <FaTicketAlt className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No rewards available</h3>
                      <p className="text-gray-600 mb-4">Make more donations to unlock rewards.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {availableVouchers
                        .filter(voucher => tierFilter === 'all' || voucher.tier === tierFilter)
                        .filter(voucher => voucherFilter !== 'available' || isVoucherClaimable(voucher.tier))
                        .map(voucher => {
                          const isClaimable = isVoucherClaimable(voucher.tier);
                          const isClaimed = isVoucherClaimed(voucher.id);
                          
                          return (
                            <div 
                              key={voucher.id}
                              className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${
                                !isClaimable ? 'opacity-70' : ''
                              } ${isClaimed ? 'bg-gray-50' : 'bg-white'}`}
                            >
                              <div className="relative h-48 overflow-hidden">
                                {voucher.image ? (
                                  <img 
                                    src={voucher.image}
                                    alt={voucher.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                                    <FaTicketAlt className="h-12 w-12 text-indigo-300" />
                                  </div>
                                )}
                                
                                <div className="absolute top-0 right-0 m-2">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(voucher.tier)}`}>
                                    {React.createElement(getTierIcon(voucher.tier), { className: "mr-1 h-3 w-3" })}
                                    {voucher.tier}
                                  </span>
                                </div>
                                
                                {isClaimed && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <div className="bg-white text-gray-800 px-4 py-2 rounded-full font-medium transform rotate-12">
                                      Claimed
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="p-4">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-medium text-gray-900">{voucher.name}</h4>
                                  <span className="flex items-center text-indigo-600 font-medium">
                                    <FaGift className="mr-1" />
                                    {formatPoints(voucher.points)}
                                  </span>
                                </div>
                                
                                <p className="text-sm text-gray-600 mt-1 mb-3">{voucher.description}</p>
                                
                                <div className="flex items-center text-xs text-gray-500 mb-3">
                                  <span className="flex items-center">
                                    <FaShoppingBag className="mr-1" />
                                    {voucher.merchant}
                                  </span>
                                  <span className="mx-2">•</span>
                                  <span className="flex items-center">
                                    <FaClock className="mr-1" />
                                    Expires: {formatDate(voucher.expiry)}
                                  </span>
                                </div>
                                
                                <button
                                  onClick={() => handleClaimVoucher(voucher)}
                                  disabled={!isClaimable || isClaimed || loadingClaim}
                                  className={`w-full mt-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
                                    isClaimable && !isClaimed
                                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent'
                                      : 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                  }`}
                                >
                                  {loadingClaim ? (
                                    <span className="flex items-center justify-center">
                                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Processing...
                                    </span>
                                  ) : isClaimed ? (
                                    'Claimed'
                                  ) : !isClaimable ? (
                                    `Unlock at ${voucher.tier} Tier`
                                  ) : (
                                    'Claim Reward'
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
                
                {/* Claimed Vouchers */}
                {claimedVouchers.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <FaTicketAlt className="mr-2 text-green-500" />
                      Your Claimed Rewards
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {claimedVouchers.map(voucher => (
                        <div 
                          key={voucher.id}
                          className="border border-green-200 rounded-lg overflow-hidden shadow-sm bg-green-50"
                        >
                          <div className="relative h-48 overflow-hidden">
                            {voucher.image ? (
                              <img 
                                src={voucher.image}
                                alt={voucher.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-green-100 flex items-center justify-center">
                                <FaTicketAlt className="h-12 w-12 text-green-300" />
                              </div>
                            )}
                            
                            <div className="absolute top-0 right-0 m-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(voucher.tier)}`}>
                                {React.createElement(getTierIcon(voucher.tier), { className: "mr-1 h-3 w-3" })}
                                {voucher.tier}
                              </span>
                            </div>
                            
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                              <div className="text-center">
                                <div className="text-xs">Redemption Code</div>
                                <div className="font-mono font-bold tracking-wider">{voucher.redemptionCode}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h4 className="font-medium text-gray-900">{voucher.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{voucher.description}</p>
                            
                            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                              <span className="flex items-center">
                                <FaShoppingBag className="mr-1" />
                                {voucher.merchant}
                              </span>
                              
                              <span className="flex items-center">
                                <FaClock className="mr-1" />
                                Expires: {formatDate(voucher.expiry)}
                              </span>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-green-200 flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                Claimed on {formatDate(voucher.claimedAt)}
                              </span>
                              
                              <button
                                onClick={() => {
                                  // In a real app, this would show a QR code or allow download
                                  toast.success('Voucher details copied to clipboard!');
                                }}
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                              >
                                <FaDownload className="mr-1" />
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
} 