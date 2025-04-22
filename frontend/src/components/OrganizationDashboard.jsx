import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils/helpers';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import CharityCard from './CharityCard';
import { 
  FaBuilding, 
  FaChartBar, 
  FaHistory, 
  FaEdit, 
  FaUsers,
  FaFileAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWallet,
  FaFacebook,
  FaInstagram,
  FaLink,
  FaCalendarAlt,
  FaHandHoldingUsd,
  FaCertificate,
  FaEdit as FaEditAlt,
  FaExternalLinkAlt,
  FaSync,
  FaFilter,
  FaExchangeAlt,
  FaClock,
  FaTachometerAlt,
  FaListAlt,
  FaChevronDown,
  FaArrowDown,
  FaArrowUp,
  FaHourglass,
  FaTimes,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaMoneyBillWave,
  FaHandHoldingHeart
} from 'react-icons/fa';
import { PlusIcon, HeartIcon } from '@heroicons/react/24/outline';
import Pagination from './Pagination';

export default function OrganizationDashboard() {
  const { id } = useParams();
  const { currentUser, logout, accountType } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [charities, setCharities] = useState([]);
  const [activeTab, setActiveTab] = useState('charity');
  const [totalDonations, setTotalDonations] = useState(0);
  const [donations, setDonations] = useState([]);
  const [combinedTransactions, setCombinedTransactions] = useState([]);
  const [currentDataSource, setCurrentDataSource] = useState('combined');
  const [organizationId, setOrganizationId] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [charityFilter, setCharityFilter] = useState("all");
  const [filteredCharities, setFilteredCharities] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10 // Change to 10 items per page from 100
  });
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Set the organization ID
        setOrganizationId(currentUser.id);
        
        // Fetch charities associated with this organization
        const charitiesResponse = await axios.get(`/organizations/${currentUser.id}/charities`);
        setCharities(charitiesResponse.data);
        
        // Load data based on the current data source (default to combined)
        await loadDataBySource('combined');
        
      } catch (err) {
        console.error('Error in fetchOrganizationData:', err);
        setError('Failed to load some organization data');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationData();
  }, [currentUser]);

  const loadDataBySource = async (source = 'combined') => {
    if (!currentUser || !currentUser.id) return;
    
    try {
      setLoading(true);
      setCurrentDataSource(source); // Update the current data source state
      
      // First, fetch all charities belonging to this organization
      console.log("Fetching charities for organization:", currentUser.id);
      const charitiesResponse = await axios.get(`/organizations/${currentUser.id}/charities`);
      const organizationCharities = charitiesResponse.data;
      
      // Extract charity IDs
      const charityIds = organizationCharities.map(charity => charity.id);
      console.log("Charity IDs belonging to this organization:", charityIds);
      
      // If no charities found, return empty data
      if (charityIds.length === 0) {
        console.log("No charities found for this organization");
        setTransactions([]);
        setDonations([]);
        setCombinedTransactions([]);
        setLoading(false);
        return;
      }
      
      let data = [];
      let responseData = null;
      
      // Prepare pagination parameters
      const params = {
        page: pagination.currentPage,
        per_page: pagination.itemsPerPage
      };
      
      // Fetch data based on source type
      if (source === 'transactions') {
        // Use the organization transactions endpoint
        console.log("Fetching transactions for organization:", currentUser.id);
        const response = await axios.get(`/organizations/${currentUser.id}/transactions`, { params });
        responseData = response.data;
        data = responseData.data ? responseData.data : responseData;
        console.log("Organization transactions:", data);
        
        setTransactions(data || []);
        setCombinedTransactions(data || []);
        
      } else if (source === 'donations') {
        // Use the organization donations endpoint
        console.log("Fetching donations for organization:", currentUser.id);
        const response = await axios.get(`/organizations/${currentUser.id}/donations`, { params });
        responseData = response.data;
        data = responseData.data ? responseData.data : responseData;
        console.log("Organization donations:", data);
        
        setDonations(data || []);
        setCombinedTransactions(data || []);
        
      } else if (source === 'combined') {
        // For combined view, fetch both transactions and donations
        console.log("Fetching combined financial activities for organization:", currentUser.id);
        
        try {
          // First get transactions
          const txResponse = await axios.get(`/organizations/${currentUser.id}/transactions`, { params });
          const txData = txResponse.data.data || txResponse.data || [];
          
          // Then get donations
          const donResponse = await axios.get(`/organizations/${currentUser.id}/donations`, { params });
          const donData = donResponse.data.data || donResponse.data || [];
          
          // Combine the data
          const combined = [...txData, ...donData];
          console.log("Combined financial activities:", combined);
          
          // Sort by date (newest first)
          combined.sort((a, b) => {
            const dateA = new Date(a.created_at || a.completed_at || 0);
            const dateB = new Date(b.created_at || b.completed_at || 0);
            return dateB - dateA;
          });
          
          // Calculate total donations
          const total = combined.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
          setTotalDonations(total);
          
          // Set the combined data
          data = combined;
          responseData = { data: combined, total: combined.length };
          setCombinedTransactions(combined);
        } catch (err) {
          console.error("Error fetching combined data:", err);
          data = [];
          setCombinedTransactions([]);
        }
      }
      
      // Update pagination from response
      updatePaginationFromResponse(responseData, data);
      
      setLoading(false);
    } catch (error) {
      console.error(`Error loading ${source} data:`, error);
      setError(`Failed to load ${source} data: ${error.message}`);
      setCombinedTransactions([]); // Reset to empty array on error
      setLoading(false);
    }
  };

  // Helper function to update pagination from response
  const updatePaginationFromResponse = (response, extractedData) => {
    if (response && response.meta) {
      setPagination({
        currentPage: response.meta.current_page,
        totalPages: response.meta.last_page,
        totalItems: response.meta.total,
        itemsPerPage: response.meta.per_page
      });
    } else if (response && response.current_page) {
      setPagination({
        currentPage: response.current_page,
        totalPages: response.last_page,
        totalItems: response.total,
        itemsPerPage: response.per_page
      });
    } else {
      // If no pagination data, set the total items to the length of the data
      setPagination(prev => ({
        ...prev,
        totalItems: Array.isArray(extractedData) ? extractedData.length : 0,
        totalPages: Math.ceil((Array.isArray(extractedData) ? extractedData.length : 0) / prev.itemsPerPage),
      }));
    }
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    // Scroll to top of the list when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Reload the data for the new page
    loadDataBySource(currentDataSource);
  };

  useEffect(() => {
    if (currentUser && currentUser.id) {
      loadDataBySource(currentDataSource);
    }
  }, [currentDataSource, currentUser]);

  useEffect(() => {
    // Fetch data based on the selected organization and data source
    if (currentUser && currentUser.uid) {
      setLoading(true);
      setError(null);

      // Fetch organizations if not already loaded
      if (organizations.length === 0) {
        fetchUserOrganizations(currentUser.uid)
          .then((orgs) => {
            setOrganizations(orgs);
            if (orgs.length > 0 && !organizationId) {
              setOrganizationId(orgs[0].id);
            }
          })
          .catch((err) => setError('Failed to load organizations: ' + err.message));
      }

      // If organization is selected, fetch its related data
      if (organizationId) {
        if (currentDataSource === 'charities') {
          fetchOrganizationCharities(organizationId)
            .then((data) => {
              setCharities(data);
              setLoading(false);
            })
            .catch((err) => {
              setError('Failed to load charities: ' + err.message);
              setLoading(false);
            });
        } else if (currentDataSource === 'transactions') {
          fetchOrganizationTransactions(organizationId)
            .then((data) => {
              setTransactions(data);
              setLoading(false);
            })
            .catch((err) => {
              setError('Failed to load transactions: ' + err.message);
              setLoading(false);
            });
        }
      } else {
        setLoading(false);
      }
    }
  }, [currentUser, organizationId, currentDataSource, organizations.length]);

  // Update filtered transaction history when history filter changes
  useEffect(() => {
    if (transactions.length > 0) {
      if (historyFilter === 'all') {
        setFilteredHistory(transactions);
      } else {
        setFilteredHistory(transactions.filter(transaction => transaction.type === historyFilter));
      }
    } else {
      setFilteredHistory([]);
    }
  }, [transactions, historyFilter]);

  // Update data source based on active tab
  useEffect(() => {
    if (activeTab === 'overview') {
      setCurrentDataSource('transactions');
    } else if (activeTab === 'charities') {
      setCurrentDataSource('charities');
    } else if (activeTab === 'history') {
      setCurrentDataSource('transactions');
    }
  }, [activeTab]);

  // Effect to filter charities based on category
  useEffect(() => {
    if (!charities) return;
    
    if (charityFilter === "all") {
      setFilteredCharities(charities);
    } else {
      setFilteredCharities(charities.filter(charity => charity.category === charityFilter));
    }
  }, [charityFilter, charities]);

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

  
  const canEditOrganization = () => {
    return (accountType === 'organization' && currentUser?.id === currentUser?.id) || 
           (currentUser?.representative_id === currentUser?.ic_number);
  };

  // Format amount to display SCROLL with 3 decimal places
  const formatAmount = (amount) => {
    if (!amount) return '0.000 SCROLL';
    return `${parseFloat(amount).toFixed(3)} SCROLL`;
  };

  // Add a getCharityName function to display charity names in the transaction list
  const getCharityName = (item) => {
    if (!item) return 'Unknown Charity';
    
    // If charity object is included in the response
    if (item.charity && item.charity.name) {
      return item.charity.name;
    }
    
    // If only charity_id or cause_id is available
    const charityId = item.charity_id || item.cause_id;
    if (charityId && charities.length > 0) {
      const charity = charities.find(c => c.id === charityId);
      return charity ? charity.name : `Charity #${charityId}`;
    }
    
    return 'Unknown Charity';
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    loadDataBySource(currentDataSource);
  };

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

  // Add functions for consistent type styling
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

  if (loading && !currentUser) {
  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading dashboard...</p>
            <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
        </div>
        </motion.div>
      </div>
    );
  }

  if (error && !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg"
        >
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-medium text-red-800 mb-2">{error}</h3>
          <p className="text-gray-600 mb-6">We couldn't load your dashboard. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
            <FaSync className="mr-2" />
            Try Again
          </button>
      </motion.div>
      </div>
    );
  }

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
            {currentUser?.logo && (
              <div className="mr-6 h-20 w-20 rounded-lg overflow-hidden border-4 border-white/30 shadow-md bg-white/10">
                <img
                  src={formatImageUrl(currentUser.logo)}
                  alt={currentUser.name}
                  className="h-full w-full object-cover"
                />
              </div>
              )}
              <div>
              <h1 className="text-3xl font-bold mb-1">{currentUser?.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 backdrop-blur-sm text-white">
                  {currentUser?.category || 'Organization'}
                </span>
                {currentUser?.is_verified ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-400/20 backdrop-blur-sm text-white">
                    <FaCheckCircle className="mr-1" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-400/20 backdrop-blur-sm text-white">
                    <FaExclamationTriangle className="mr-1" />
                    Pending Verification
                  </span>
                )}
              </div>
              <p className="text-indigo-100 max-w-2xl">
                Manage your organization's charities, transactions, and information
              </p>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            {canEditOrganization() && (
              <Link
                to={`/organizations/${id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-500/30 hover:bg-indigo-500/50 backdrop-blur-sm transition-colors duration-200"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </Link>
            )}
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
                    <dd className="text-2xl font-semibold text-gray-900">${totalDonations.toFixed(2)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          <div className="bg-white overflow-hidden shadow-sm rounded-xl hover:shadow-md transition-shadow duration-200">
              <div className="p-5">
                <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
                  <FaChartBar className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Charities</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{charities.length}</dd>
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Followers</dt>
                    <dd className="text-2xl font-semibold text-gray-900">0</dd>
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed Projects</dt>
                    <dd className="text-2xl font-semibold text-gray-900">0</dd>
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
                onClick={() => setActiveTab('charity')}
                className={`${
                  activeTab === 'charity'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 rounded-t-lg mx-1`}
              >
              <FaChartBar className={`mr-2 h-4 w-4 ${activeTab === 'charity' ? 'text-indigo-500' : 'text-gray-400'}`} />
              Charities
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`${
                  activeTab === 'contact'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 rounded-t-lg mx-1`}
              >
              <FaPhone className={`mr-2 h-4 w-4 ${activeTab === 'contact' ? 'text-indigo-500' : 'text-gray-400'}`} />
                Contact
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`${
                  activeTab === 'documents'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 rounded-t-lg mx-1`}
              >
              <FaFileAlt className={`mr-2 h-4 w-4 ${activeTab === 'documents' ? 'text-indigo-500' : 'text-gray-400'}`} />
                Documents
              </button>
              <button
                onClick={() => setActiveTab('transaction')}
                className={`${
                  activeTab === 'transaction'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 rounded-t-lg mx-1`}
            >
              <FaHistory className={`mr-2 h-4 w-4 ${activeTab === 'transaction' ? 'text-indigo-500' : 'text-gray-400'}`} />
              Transactions
            </button>
            </nav>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
          {activeTab === 'charity' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
                <div className="mb-6 flex flex-col justify-between md:flex-row md:items-center">
                  <h2 className="text-2xl font-semibold text-gray-900">Your Charities</h2>
                  <div className="mt-3 flex items-center space-x-3 md:mt-0">
                    <select
                      value={charityFilter}
                      onChange={(e) => setCharityFilter(e.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-3 pr-10 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="education">Education</option>
                      <option value="health">Health</option>
                      <option value="environment">Environment</option>
                      <option value="humanitarian">Humanitarian</option>
                      <option value="animal">Animal Welfare</option>
                      <option value="other">Other</option>
                    </select>
                    <button
                      onClick={() => navigate("/charity-form")}
                      className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                      <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                      New Charity
                    </button>
                  </div>
              </div>

              {loading ? (
                  <div className="flex h-64 w-full items-center justify-center">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
                      <p className="text-sm text-gray-500">Loading charities...</p>
                    </div>
                </div>
              ) : error ? (
                  <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                    <p>Error loading charities. Please try again later.</p>
                </div>
                ) : filteredCharities.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex h-64 flex-col items-center justify-center space-y-2 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center"
                  >
                    <div className="rounded-full bg-gray-100 p-3">
                      <HeartIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No charities found</h3>
                    <p className="text-sm text-gray-500">
                      {charityFilter === "all" 
                        ? "You haven't registered any charities yet." 
                        : `No charities found in the ${charityFilter} category.`}
                    </p>
                    <div className="mt-2">
                      <button
                        onClick={() => navigate("/charity-form")}
                        type="button"
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                        Register New Charity
                      </button>
                    </div>
                  </motion.div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCharities.map((charity, index) => (
                      <motion.div 
                        key={charity.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <CharityCard charity={charity} inDashboard={true} />
                      </motion.div>
                  ))}
                </div>
              )}
              </motion.div>
          )}

          {activeTab === 'contact' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <FaPhone className="mr-2" />
                Contact Information
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Details</h3>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center">
                      <FaPhone className="text-gray-400 mr-2" />
                      <span className="text-gray-900">{currentUser.phone_number}</span>
                    </div>
                    <div className="flex items-center">
                      <FaEnvelope className="text-gray-400 mr-2" />
                      <span className="text-gray-900">{currentUser.gmail}</span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-gray-400 mr-2" />
                      <span className="text-gray-900">{currentUser.register_address}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Social Media</h3>
                  <div className="mt-4 space-y-4">
                    {currentUser.website && (
                      <a
                        href={currentUser.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-indigo-600 hover:text-indigo-900"
                      >
                        <FaGlobe className="mr-2" />
                        Website
                      </a>
                    )}
                    {currentUser.facebook && (
                      <a
                        href={currentUser.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-indigo-600 hover:text-indigo-900"
                      >
                        <FaFacebook className="mr-2" />
                        Facebook
                      </a>
                    )}
                    {currentUser.instagram && (
                      <a
                        href={currentUser.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-indigo-600 hover:text-indigo-900"
                      >
                        <FaInstagram className="mr-2" />
                        Instagram
                      </a>
                    )}
                  </div>
                </div>
              </div>
              </motion.div>
          )}

          {activeTab === 'documents' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <FaFileAlt className="mr-2" />
                Documents
              </h2>
              
              <div className="mb-8">
                  {currentUser.verified_document ? (
                    <div className="border border-gray-200 rounded-lg p-4 flex items-center">
                      <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                        <FaFileAlt className="text-indigo-600 text-xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">Verification Document</h3>
                        <p className="text-sm text-gray-500">Official verification document</p>
                      </div>
                      <a 
                        href={formatImageUrl(currentUser.verified_document)}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        View
                      </a>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <FaFileAlt className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Verification Document</h3>
                      <p className="text-gray-600">This organization hasn't uploaded a verification document yet.</p>
                    </div>
                  )}
                </div>

              <div>
                  {currentUser.statutory_declaration ? (
                    <div className="border border-gray-200 rounded-lg p-4 flex items-center">
                      <div className="bg-green-100 p-3 rounded-lg mr-4">
                        <FaFileAlt className="text-green-600 text-xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">Statutory Declaration</h3>
                        <p className="text-sm text-gray-500">Official statutory declaration document</p>
                      </div>
                      <a 
                        href={formatImageUrl(currentUser.statutory_declaration)}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        View
                      </a>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <FaFileAlt className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Statutory Declaration</h3>
                      <p className="text-gray-600">This organization hasn't uploaded a statutory declaration yet.</p>
                    </div>
                  )}
                </div>

              </motion.div>
          )}
          
          {activeTab === 'transaction' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FaHistory className="mr-2" />
                  Financial Transactions
                </h2>
                
                {/* Add filter dropdown */}
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">View:</span>
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={currentDataSource}
                    onChange={(e) => {
                      loadDataBySource(e.target.value);
                    }}
                  >
                    <option value="combined">All</option>
                    <option value="transactions">Transactions</option>
                    <option value="donations">Donations</option>
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
              ) : !Array.isArray(combinedTransactions) || combinedTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {currentDataSource === 'donations' 
                      ? "No donations have been received yet." 
                      : currentDataSource === 'combined'
                        ? "No financial activities have been recorded yet."
                        : "No transactions have been recorded yet."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-2" />
                            Date
                            <button onClick={() => handleSort('created_at')} className="ml-1">
                              {sortField === 'created_at' ? (
                                sortDirection === 'asc' ? 
                                  <FaSortUp className="h-4 w-4 text-indigo-600" /> : 
                                  <FaSortDown className="h-4 w-4 text-indigo-600" />
                              ) : (
                                <FaSort className="h-3 w-3 text-gray-400" />
                              )}
                            </button>
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
                            <FaChartBar className="mr-2" />
                            Amount
                            <button onClick={() => handleSort('amount')} className="ml-1">
                              {sortField === 'amount' ? (
                                sortDirection === 'asc' ? 
                                  <FaSortUp className="h-4 w-4 text-indigo-600" /> : 
                                  <FaSortDown className="h-4 w-4 text-indigo-600" />
                              ) : (
                                <FaSort className="h-3 w-3 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <FaUsers className="mr-2" />
                            From/To
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
                            <FaEdit className="mr-2" />
                            Actions
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {combinedTransactions.map(item => {
                        if (!item) return null; // Skip null or undefined items
                        
                        return (
                          <tr key={item.id || item.transaction_hash || Math.random()} className="hover:bg-gray-50">
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
                              {formatAmount(item.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getCharityName(item)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                {getStatusIcon(item.status)}
                                {formatStatus(item.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Link
                                to={item.source === 'Donation' ? `/donations/${item.id}` : `/transactions/${item.id}`}
                                className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                              >
                                <FaEdit className="mr-2" />
                                View Details
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="border-t border-gray-200 px-4 py-3">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-700">
                          Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> to{' '}
                          <span className="font-medium">
                            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                          </span>{' '}
                          of <span className="font-medium">{pagination.totalItems}</span> transactions
                        </div>
                        
                        <Pagination
                          currentPage={pagination.currentPage}
                          totalPages={pagination.totalPages}
                          onPageChange={handlePageChange}
                        />
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-700">Rows per page:</span>
                          <select
                            value={pagination.itemsPerPage}
                            onChange={(e) => {
                              setPagination(prev => ({
                                ...prev,
                                itemsPerPage: Number(e.target.value),
                                currentPage: 1
                              }));
                              loadDataBySource(currentDataSource);
                            }}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
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