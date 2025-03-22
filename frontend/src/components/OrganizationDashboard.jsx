import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils/helpers';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  FaBuilding, 
  FaChartBar, 
  FaHistory, 
  FaEdit, 
  FaSignOutAlt,
  FaPlus,
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
  FaUsers,
  FaCertificate,
  FaEdit as FaEditAlt,
  FaExternalLinkAlt,
  FaSync,
  FaFilter,
  FaExchangeAlt,
  FaClock
} from 'react-icons/fa';

export default function OrganizationDashboard() {
  const { currentUser, logout } = useAuth();
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
            <FaBuilding className="mr-3 text-indigo-600" />
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
              {currentUser.logo && (
                <img
                  src={formatImageUrl(currentUser.logo)}
                  alt={currentUser.name}
                  className="h-20 w-20 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentUser.name}</h1>
                <p className="text-gray-500">{currentUser.category}</p>
                {currentUser.is_verified ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FaCheckCircle className="mr-1" />
                    Verified Organization
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <FaExclamationTriangle className="mr-1" />
                    Pending Verification
                  </span>
                )}
              </div>
            </div>
          </div>
      </div>
      </header>
          
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
                      <dd className="text-lg font-semibold text-gray-900">${totalDonations.toFixed(2)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaChartBar className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Charities</dt>
                      <dd className="text-lg font-semibold text-gray-900">{charities.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaUsers className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Followers</dt>
                      <dd className="text-lg font-semibold text-gray-900">0</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaCertificate className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed Projects</dt>
                      <dd className="text-lg font-semibold text-gray-900">0</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('charity')}
                className={`${
                  activeTab === 'charity'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center transition-colors duration-200`}
              >
                <FaChartBar className="mr-2 h-4 w-4" />
                Charity
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`${
                  activeTab === 'contact'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center transition-colors duration-200`}
              >
                <FaPhone className="mr-2 h-4 w-4" />
                Contact
              </button>
              <button
                onClick={() => setActiveTab('transaction')}
                className={`${
                  activeTab === 'transaction'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center transition-colors duration-200`}
              >
                <FaHistory className="mr-2 h-4 w-4" />
                Transaction
              </button>
            </nav>
          </div>

          {/* Charity Tab */}
          {activeTab === 'charity' && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FaChartBar className="mr-2" />
                  My Charities
                </h2>
                <Link
                  to="/charities/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <FaPlus className="mr-2" />
                  Create Charity
                </Link>
              </div>

              {loading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-600">{error}</div>
              ) : charities.length === 0 ? (
                <div className="text-center py-12">
                  <FaChartBar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No charities yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new charity.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {charities.map(charity => (
                    <div key={charity.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {charity.picture_path && (
                        <img
                          src={formatImageUrl(charity.picture_path)}
                          alt={charity.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900">{charity.name}</h3>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{charity.description}</p>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Progress</span>
                            <span className="text-gray-900 font-medium">
                              ${charity.fund_received} / ${charity.fund_targeted}
                            </span>
                          </div>
                          <div className="mt-2 relative">
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                              <div
                                style={{
                                  width: `${Math.min(
                                    (charity.fund_received / charity.fund_targeted) * 100,
                                    100
                                  )}%`,
                                }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <Link
                            to={`/charities/${charity.id}`}
                            className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                          >
                            <FaExternalLinkAlt className="mr-2" />
                            View Details
                          </Link>
                          <Link
                            to={`/charities/${charity.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                          >
                            <FaEdit className="mr-2" />
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="bg-white shadow rounded-lg p-6">
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
            </div>
          )}

          {/* Transaction Tab */}
          {activeTab === 'transaction' && (
            <div className="bg-white shadow rounded-lg p-6">
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
            </div>
          )}
          </main>
        </div>
        </div>
  );
} 