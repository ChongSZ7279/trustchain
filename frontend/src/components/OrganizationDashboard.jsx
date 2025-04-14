import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils/helpers';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import BackToHistory from './BackToHistory';
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
  FaCogs,
  FaTachometerAlt,
  FaListAlt,
  FaChevronDown,
  FaArrowDown,
  FaArrowUp,
  FaHourglass,
  FaTimes
} from 'react-icons/fa';
import { PlusIcon, HeartIcon } from '@heroicons/react/24/outline';

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
  const [currentDataSource, setCurrentDataSource] = useState('transactions');
  const [organizationId, setOrganizationId] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [charityFilter, setCharityFilter] = useState("all");
  const [filteredCharities, setFilteredCharities] = useState([]);

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
        
        // Load data based on the current data source
        await loadDataBySource(currentDataSource);
        
      } catch (err) {
        console.error('Error in fetchOrganizationData:', err);
        setError('Failed to load some organization data');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationData();
  }, [currentUser]);

  const loadDataBySource = async (source) => {
    if (!currentUser || !currentUser.id) return;
    
    try {
      setLoading(true);
      
      let endpoint;
      if (source === 'transactions') {
        endpoint = `/organizations/${currentUser.id}/transactions`;
      } else if (source === 'donations') {
        endpoint = `/organizations/${currentUser.id}/donations`;
      } else if (source === 'combined') {
        endpoint = `/organizations/${currentUser.id}/financial-activities`;
      }
      
      console.log(`Loading data from ${endpoint}`);
      const response = await axios.get(endpoint);
      console.log(`${source} data:`, response.data);
      
      // Handle both paginated and non-paginated responses
      const data = response.data.data ? response.data.data : response.data;
      
      if (source === 'transactions') {
        setTransactions(data);
        // Calculate total donations from transactions
        const total = data.reduce((sum, transaction) => sum + parseFloat(transaction.amount || 0), 0);
        setTotalDonations(total);
      } else if (source === 'donations') {
        setDonations(data);
      }
      
      // Always update the combined transactions for display
      setCombinedTransactions(data);
      
      setLoading(false);
    } catch (error) {
      console.error(`Error loading ${source} data:`, error);
      setError(`Failed to load ${source} data`);
      setLoading(false);
    }
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
      <BackToHistory fallbackPath="/organizations" />
      
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
            <Link
              to={`/organizations/${id}`}
              className="inline-flex items-center px-4 py-2 border border-white/20 text-sm font-medium rounded-lg shadow-sm text-white hover:bg-white/10 backdrop-blur-sm transition-colors duration-200"
            >
              <FaExternalLinkAlt className="mr-2" />
              View Public Page
            </Link>
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
            <button
              onClick={() => setActiveTab('history')}
              className={`${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 rounded-t-lg mx-1`}
              >
              <FaHistory className={`mr-2 h-4 w-4 ${activeTab === 'history' ? 'text-indigo-500' : 'text-gray-400'}`} />
              Transaction History
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
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                        className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                      >
                        <div className="relative">
                          {charity.picture_path ? (
                        <img
                          src={formatImageUrl(charity.picture_path)}
                          alt={charity.name}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                          ) : (
                            <div className="w-full h-48 bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center">
                              <FaChartBar className="h-12 w-12 text-indigo-300" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            {charity.is_verified ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                <FaCheckCircle className="mr-1 text-xs" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                <FaExclamationTriangle className="mr-1 text-xs" />
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                        
                      <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{charity.name}</h3>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2 h-10">{charity.description}</p>
                          
                        <div className="mt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Progress</span>
                            <span className="text-gray-900 font-medium">
                                ${parseFloat(charity.fund_received || 0).toFixed(2)} / ${parseFloat(charity.fund_targeted || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="mt-2 relative">
                              <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                              <div
                                style={{
                                  width: `${Math.min(
                                      ((charity.fund_received || 0) / (charity.fund_targeted || 1)) * 100,
                                    100
                                  )}%`,
                                }}
                                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500 ease-in-out rounded-full"
                              ></div>
                            </div>
                          </div>
                        </div>
                          
                          <div className="mt-4 flex justify-between items-center pt-3 border-t border-gray-100">
                          <Link
                            to={`/charities/${charity.id}`}
                              className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium inline-flex items-center text-sm transition-colors duration-200"
                          >
                              <FaExternalLinkAlt className="mr-1.5 text-xs" />
                            View Details
                          </Link>
                          <Link
                            to={`/charities/${charity.id}/edit`}
                              className="text-gray-600 hover:text-indigo-600 inline-flex items-center text-sm transition-colors duration-200"
                          >
                              <FaEdit className="mr-1.5 text-xs" />
                            Edit
                          </Link>
                        </div>
                      </div>
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
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-600">{error}</div>
              ) : combinedTransactions.length === 0 ? (
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
                        
                        // Determine if this is a donation or transaction
                        const isDonation = item.source === 'Donation' || item.donor_message;
                        
                        return (
                          <tr key={item.id || item.transaction_hash || Math.random()} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(item.created_at || item.completed_at || new Date())}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                isDonation ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {isDonation ? 'Donation' : (item.type || 'Transaction')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.amount ? `${item.amount} ${item.currency_type || 'ETH'}` : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.user?.name || item.from_user?.name || (item.is_anonymous ? 'Anonymous' : 'Unknown')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                {getStatusIcon(item.status)}
                                {formatStatus(item.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Link
                                to={isDonation ? `/donations/${item.id}` : `/transactions/${item.id}`}
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
                </div>
              )}
              </motion.div>
            )}

            {activeTab === 'history' && (
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
                  <div className="relative">
                    <select
                      className="appearance-none bg-white border border-gray-300 rounded-lg py-2 px-4 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={historyFilter}
                      onChange={(e) => setHistoryFilter(e.target.value)}
                    >
                      <option value="all">All Transactions</option>
                      <option value="received">Donations Received</option>
                      <option value="sent">Donations Sent</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <FaChevronDown />
            </div>
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
                ) : filteredHistory.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gray-100 rounded-lg p-6 text-center"
                  >
                    <p className="text-gray-600">No transaction history found.</p>
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredHistory.map((transaction, index) => (
                          <motion.tr
                            key={transaction.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {transaction.type === 'received' ? (
                                  <FaArrowDown className="mr-2 text-green-500" />
                                ) : (
                                  <FaArrowUp className="mr-2 text-blue-500" />
                                )}
                                <span className="font-medium">
                                  {transaction.type === 'received' ? 'Received' : 'Sent'}
                                </span>
        </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`font-medium ${transaction.type === 'received' ? 'text-green-600' : 'text-blue-600'}`}>
                                ${transaction.amount.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {transaction.charityName || 'Unknown Charity'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(transaction.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                  transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'}`}>
                                {transaction.status === 'completed' ? (
                                  <>
                                    <span className="mr-1">✓</span> Completed
                                  </>
                                ) : transaction.status === 'pending' ? (
                                  <>
                                    <FaHourglass className="mr-1" /> Pending
                                  </>
                                ) : (
                                  <>
                                    <FaTimes className="mr-1" /> Failed
                                  </>
                                )}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        </div>
    </motion.div>
  );
} 