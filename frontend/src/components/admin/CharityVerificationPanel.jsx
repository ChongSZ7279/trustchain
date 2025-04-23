import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import OrganizationVerificationCard from './OrganizationVerificationCard';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaFilter,
  FaSearch,
  FaSyncAlt,
  FaHandshake,
  FaArrowLeft,
  FaListAlt,
  FaChevronDown,
  FaInfoCircle,
  FaThumbsUp,
  FaRegClock
} from 'react-icons/fa';

export default function CharityVerificationPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [charities, setCharities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    total: 0
  });
  const [refreshing, setRefreshing] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.is_admin) {
      toast.error('You do not have permission to access this page');
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.is_admin) return;

      setLoading(true);
      try {
        // Fetch charities that need verification
        const response = await axios.get('/admin/verification/charities', {
          params: { status: filterStatus }
        });
        
        console.log('Charities API response:', response.data);
        setCharities(response.data);
        
        // Calculate stats
        const pendingCount = response.data.filter(charity => !charity.is_verified).length;
        const verifiedCount = response.data.filter(charity => charity.is_verified).length;
        
        setStats({
          pending: pendingCount,
          verified: verifiedCount,
          total: response.data.length
        });
        
      } catch (error) {
        console.error('Error fetching charity verification data:', error);
        toast.error('Failed to load charity verification data: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, filterStatus]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    const fetchData = async () => {
      try {
        // Fetch charities that need verification
        const response = await axios.get('/admin/verification/charities', {
          params: { status: filterStatus }
        });
        
        setCharities(response.data);
        
        // Calculate stats
        const pendingCount = response.data.filter(charity => !charity.is_verified).length;
        const verifiedCount = response.data.filter(charity => charity.is_verified).length;
        
        setStats({
          pending: pendingCount,
          verified: verifiedCount,
          total: response.data.length
        });
        
        toast.success('Data refreshed successfully');
      } catch (error) {
        console.error('Error refreshing data:', error);
        toast.error('Failed to refresh data');
      } finally {
        setRefreshing(false);
      }
    };

    fetchData();
  };

  // Filter items based on search term
  const filteredCharities = charities.filter(charity =>
    charity.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    charity.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle charity verification status update
  const handleStatusUpdate = (id, newStatus) => {
    setCharities(charities.map(charity =>
      charity.id === id ? { ...charity, is_verified: newStatus === 'verified' } : charity
    ));

    if (newStatus === 'verified' && filterStatus === 'pending') {
      setCharities(charities.filter(charity => charity.id !== id));
    }
    
    // Update stats
    setStats(prev => ({
      ...prev,
      pending: prev.pending - 1,
      verified: prev.verified + 1
    }));
  };

  // Handle status filter click
  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    setSearchTerm(''); // Clear search when changing filters
  };

  if (!user || !user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="bg-yellow-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto">
            <FaExclamationTriangle className="h-8 w-8 text-yellow-500" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-3 text-gray-600">You do not have permission to access this page.</p>
          <Link to="/" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5">
            <FaArrowLeft className="mr-2" />
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 rounded-full p-3 shadow-lg">
                  <FaHandshake className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-3xl font-bold">Charity Verification</h1>
                  <p className="text-sm text-blue-100 mt-1">Verify charity registration documents and eligibility</p>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center px-4 py-2.5 border border-white border-opacity-30 text-sm font-medium rounded-md text-white bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm"
                >
                  <FaSyncAlt className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh Data
                </button>
                <Link to="/admin/dashboard" className="inline-flex items-center px-4 py-2.5 border border-white border-opacity-30 text-sm font-medium rounded-md text-white bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 shadow-sm transform hover:-translate-y-0.5">
                  <FaArrowLeft className="mr-2" />
                  Back to Verification Hub
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-yellow-500 transform transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Charities</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="h-14 w-14 bg-yellow-100 rounded-full flex items-center justify-center shadow-inner">
                <FaRegClock className="h-7 w-7 text-yellow-600" />
              </div>
            </div>
            <div className="mt-5 border-t border-gray-100 pt-4">
              <button 
                onClick={() => handleStatusFilter('pending')}
                className={`w-full text-sm font-medium py-2 rounded-md border ${
                  filterStatus === 'pending' 
                    ? 'text-yellow-700 bg-yellow-50 border-yellow-200' 
                    : 'text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-yellow-600'
                } transition-colors duration-200`}
              >
                {filterStatus === 'pending' ? 'Currently Viewing' : 'View Pending Charities'}
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500 transform transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Verified Charities</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stats.verified}</p>
              </div>
              <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center shadow-inner">
                <FaThumbsUp className="h-7 w-7 text-blue-600" />
              </div>
            </div>
            <div className="mt-5 border-t border-gray-100 pt-4">
              <button 
                onClick={() => handleStatusFilter('verified')}
                className={`w-full text-sm font-medium py-2 rounded-md border ${
                  filterStatus === 'verified' 
                    ? 'text-blue-700 bg-blue-50 border-blue-200' 
                    : 'text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-blue-600'
                } transition-colors duration-200`}
              >
                {filterStatus === 'verified' ? 'Currently Viewing' : 'View Verified Charities'}
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-indigo-500 transform transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Charities</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-14 w-14 bg-indigo-100 rounded-full flex items-center justify-center shadow-inner">
                <FaHandshake className="h-7 w-7 text-indigo-600" />
              </div>
            </div>
            <div className="mt-5 border-t border-gray-100 pt-4">
              <button 
                onClick={() => handleStatusFilter('all')}
                className={`w-full text-sm font-medium py-2 rounded-md border ${
                  filterStatus === 'all' 
                    ? 'text-indigo-700 bg-indigo-50 border-indigo-200' 
                    : 'text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-indigo-600'
                } transition-colors duration-200`}
              >
                {filterStatus === 'all' ? 'Currently Viewing' : 'View All Charities'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6 shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaInfoCircle className="h-5 w-5 text-blue-600" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">About Charity Verification</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Please review all submitted documents carefully before verifying a charity.</p>
                <p className="mt-1">Verification ensures that only legitimate charities can receive funds on the TrustChain platform.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white shadow-md rounded-lg mb-6 overflow-hidden">
          <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left Side: Filter Status */}
              <div className="flex items-center text-gray-700 font-medium">
                <FaFilter className="mr-2 text-indigo-500" />
                <span>Status Filter:</span>
                <span className="ml-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Charities
                </span>
              </div>
              
              {/* Right Side: Search Box */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                  placeholder="Search charities by name or organization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search charities"
                />
                {searchTerm && (
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                    onClick={() => setSearchTerm('')}
                    aria-label="Clear search"
                  >
                    <span className="h-5 w-5 text-gray-400 hover:text-gray-600 flex items-center justify-center rounded-full bg-gray-100">×</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Search Results Notification */}
            {searchTerm && (
              <div className="mt-4 px-4 py-2 bg-indigo-50 rounded-md border border-indigo-100 shadow-sm">
                <div className="flex items-center">
                  <FaInfoCircle className="text-indigo-500 mr-2" />
                  <span className="text-sm text-indigo-700">
                    Found {filteredCharities.length} result{filteredCharities.length !== 1 ? 's' : ''} for "{searchTerm}"
                  </span>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="ml-auto text-xs px-2 py-1 bg-white text-indigo-600 rounded-md border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-colors duration-200"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-4 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-700 text-lg font-medium">Loading charity verification data...</p>
            <p className="mt-2 text-gray-500 text-sm">Retrieving the latest information</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCharities.length > 0 ? (
              filteredCharities.map(charity => (
                <OrganizationVerificationCard
                  key={charity.id}
                  entity={charity}
                  entityType="charities"
                  onStatusUpdate={handleStatusUpdate}
                />
              ))
            ) : (
              <div className="bg-white shadow-md rounded-lg p-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 text-gray-400 mb-4">
                  {searchTerm ? (
                    <FaSearch className="h-10 w-10" />
                  ) : (
                    <FaCheckCircle className="h-10 w-10" />
                  )}
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">No charities found</h3>
                <p className="mt-3 text-gray-600 max-w-lg mx-auto">
                  {searchTerm
                    ? "No charities match your search criteria. Try using different keywords or clear your search."
                    : `There are currently no charities with status "${filterStatus}". Try selecting a different status filter.`}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      <FaSearch className="mr-2 text-gray-400" />
                      Clear Search
                    </button>
                  )}
                  {filterStatus !== 'all' && (
                    <button
                      onClick={() => handleStatusFilter('all')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      <FaListAlt className="mr-2 text-gray-400" />
                      View All Charities
                    </button>
                  )}
                  {filterStatus === 'all' && filteredCharities.length === 0 && (
                    <div className="inline-flex items-center px-4 py-3 bg-indigo-50 rounded-md text-sm text-indigo-700">
                      <FaInfoCircle className="mr-2" />
                      No charities are currently available in the system
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 