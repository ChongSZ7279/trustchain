import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import OrganizationVerificationCard from './OrganizationVerificationCard';
import api from '../../utils/api';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaFilter,
  FaSearch,
  FaSyncAlt,
  FaBuilding,
  FaArrowLeft,
  FaListAlt,
  FaInfoCircle,
  FaThumbsUp,
  FaRegClock
} from 'react-icons/fa';

export default function OrganizationVerificationPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    pendingOrganizations: 0,
    verifiedOrganizations: 0
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
        console.log(`Fetching organizations verification data with status:`, filterStatus);
        
        // Fetch organizations that need verification
        const response = await api.get(`/admin/verification/organizations`, {
          params: { status: filterStatus }
        });
        console.log('Organizations API response:', response.data);
        setOrganizations(response.data);
        
        // Get all organizations for accurate stats
        try {
          const allOrgsResponse = await api.get('/admin/verification/organizations', {
            params: { status: 'all' }
          });
          
          const allOrgs = allOrgsResponse.data;
          const pendingCount = allOrgs.filter(org => !org.is_verified).length;
          const verifiedCount = allOrgs.filter(org => org.is_verified).length;
          
          setStats({
            totalOrganizations: allOrgs.length || 0,
            pendingOrganizations: pendingCount || 0,
            verifiedOrganizations: verifiedCount || 0
          });
        } catch (err) {
          console.error('Error fetching organization stats:', err);
        }
      } catch (error) {
        console.error(`Error fetching organizations verification data:`, error);
        toast.error(`Failed to load organizations verification data: ` + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, filterStatus]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    // Re-fetch data
    const fetchData = async () => {
      try {
        // Fetch organizations that need verification
        const response = await api.get(`/admin/verification/organizations`, {
          params: { status: filterStatus }
        });
        setOrganizations(response.data);
        console.log('Organizations response:', response.data);
        
        // Get stats for all organizations
        try {
          const allOrgsResponse = await api.get('/admin/verification/organizations', {
            params: { status: 'all' }
          });
          
          const allOrgs = allOrgsResponse.data;
          const pendingCount = allOrgs.filter(org => !org.is_verified).length;
          const verifiedCount = allOrgs.filter(org => org.is_verified).length;
          
          setStats({
            totalOrganizations: allOrgs.length || 0,
            pendingOrganizations: pendingCount || 0,
            verifiedOrganizations: verifiedCount || 0
          });
        } catch (err) {
          console.error('Error fetching organization stats:', err);
        }

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
  const filteredItems = organizations.filter(org => 
    org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle verification status update
  const handleStatusUpdate = (id, newStatus) => {
    setOrganizations(organizations.map(org =>
      org.id === id ? { ...org, is_verified: newStatus === 'verified' } : org
    ));

    if (newStatus === 'verified' && filterStatus === 'pending') {
      setOrganizations(organizations.filter(org => org.id !== id));
    }
    
    // Update stats
    setStats(prev => ({
      ...prev,
      pendingOrganizations: Math.max(0, prev.pendingOrganizations - 1),
      verifiedOrganizations: prev.verifiedOrganizations + 1
    }));
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

  // Get stats for current entity type and status
  const currentStats = {
    total: stats.totalOrganizations || 0,
    pending: stats.pendingOrganizations || 0,
    verified: stats.verifiedOrganizations || 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-700 to-green-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 rounded-full p-3 shadow-lg">
                  <FaBuilding className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-3xl font-bold">Organization Verification</h1>
                  <p className="text-sm text-green-100 mt-1">Verify organization registration documents for platform approval</p>
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
                <p className="text-sm font-medium text-gray-500">Pending Organizations</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{currentStats.pending}</p>
              </div>
              <div className="h-14 w-14 bg-yellow-100 rounded-full flex items-center justify-center shadow-inner">
                <FaRegClock className="h-7 w-7 text-yellow-600" />
              </div>
            </div>
            <div className="mt-5 border-t border-gray-100 pt-4">
              <button 
                onClick={() => setFilterStatus('pending')}
                className={`w-full text-sm font-medium py-2 rounded-md border ${
                  filterStatus === 'pending' 
                    ? 'text-yellow-700 bg-yellow-50 border-yellow-200' 
                    : 'text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-yellow-600'
                } transition-colors duration-200`}
              >
                {filterStatus === 'pending' ? 'Currently Viewing' : 'View Pending Organizations'}
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500 transform transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Verified Organizations</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{currentStats.verified}</p>
              </div>
              <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center shadow-inner">
                <FaThumbsUp className="h-7 w-7 text-green-600" />
              </div>
            </div>
            <div className="mt-5 border-t border-gray-100 pt-4">
              <button 
                onClick={() => setFilterStatus('verified')}
                className={`w-full text-sm font-medium py-2 rounded-md border ${
                  filterStatus === 'verified' 
                    ? 'text-green-700 bg-green-50 border-green-200' 
                    : 'text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-green-600'
                } transition-colors duration-200`}
              >
                {filterStatus === 'verified' ? 'Currently Viewing' : 'View Verified Organizations'}
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-emerald-500 transform transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Organizations</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{currentStats.total}</p>
              </div>
              <div className="h-14 w-14 bg-emerald-100 rounded-full flex items-center justify-center shadow-inner">
                <FaBuilding className="h-7 w-7 text-emerald-600" />
              </div>
            </div>
            <div className="mt-5 border-t border-gray-100 pt-4">
              <button 
                onClick={() => setFilterStatus('all')}
                className={`w-full text-sm font-medium py-2 rounded-md border ${
                  filterStatus === 'all' 
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                    : 'text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-emerald-600'
                } transition-colors duration-200`}
              >
                {filterStatus === 'all' ? 'Currently Viewing' : 'View All Organizations'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-6 shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaInfoCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">About Organization Verification</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Please review all submitted documents carefully before verifying an organization.</p>
                <p className="mt-1">Verification ensures that only legitimate entities can participate on the TrustChain platform.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white shadow-md rounded-lg mb-6 overflow-hidden">
          <div className="flex flex-row justify-between items-center border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-5 py-3 text-sm font-medium border-b-2 ${
                  filterStatus === 'pending' 
                    ? 'border-yellow-500 text-yellow-600 bg-yellow-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors duration-200`}
              >
                <div className="flex items-center">
                  <FaExclamationTriangle className={`mr-2 ${filterStatus === 'pending' ? 'text-yellow-500' : 'text-gray-400'}`} />
                  Pending Verification
                  <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                    {stats.pendingOrganizations}
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => setFilterStatus('verified')}
                className={`px-5 py-3 text-sm font-medium border-b-2 ${
                  filterStatus === 'verified' 
                    ? 'border-green-500 text-green-600 bg-green-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors duration-200`}
              >
                <div className="flex items-center">
                  <FaCheckCircle className={`mr-2 ${filterStatus === 'verified' ? 'text-green-500' : 'text-gray-400'}`} />
                  Verified
                  <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                    {stats.verifiedOrganizations}
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-5 py-3 text-sm font-medium border-b-2 ${
                  filterStatus === 'all' 
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors duration-200`}
              >
                <div className="flex items-center">
                  <FaListAlt className={`mr-2 ${filterStatus === 'all' ? 'text-emerald-500' : 'text-gray-400'}`} />
                  All Organizations
                  <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                    {stats.totalOrganizations}
                  </span>
                </div>
              </button>
            </div>
            
            {/* Search Box */}
            <div className="relative px-4 py-2">
              <div className="flex">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-emerald-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors duration-200"
                    placeholder="Search organizations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search organizations"
                  />
                  {searchTerm && (
                    <button
                      className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                      onClick={() => setSearchTerm('')}
                      aria-label="Clear search"
                    >
                      <span className="h-5 w-5 text-gray-400 hover:text-gray-600 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-150">×</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Search Results Notification */}
          {searchTerm && (
            <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2">
              <div className="flex items-center text-sm">
                <FaInfoCircle className="text-emerald-500 mr-2" />
                <span className="text-emerald-700">
                  Found {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for "{searchTerm}"
                </span>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="ml-auto text-xs px-2.5 py-1 bg-white text-emerald-600 rounded-md border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-colors duration-200"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-4 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-700 text-lg font-medium">Loading organization verification data...</p>
            <p className="mt-2 text-gray-500 text-sm">Retrieving the latest information</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredItems.length > 0 ? (
              filteredItems.map(organization => (
                <OrganizationVerificationCard
                  key={organization.id}
                  entity={organization}
                  entityType="organizations"
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
                <h3 className="mt-4 text-xl font-medium text-gray-900">No organizations found</h3>
                <p className="mt-3 text-gray-600 max-w-lg mx-auto">
                  {searchTerm
                    ? "No organizations match your search criteria. Try using different keywords or clear your search."
                    : `There are currently no organizations with status "${filterStatus}". Try selecting a different status filter.`}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
                    >
                      <FaSearch className="mr-2 text-gray-400" />
                      Clear Search
                    </button>
                  )}
                  {filterStatus !== 'all' && (
                    <button
                      onClick={() => setFilterStatus('all')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
                    >
                      <FaListAlt className="mr-2 text-gray-400" />
                      View All Organizations
                    </button>
                  )}
                  {filterStatus === 'all' && filteredItems.length === 0 && (
                    <div className="inline-flex items-center px-4 py-3 bg-emerald-50 rounded-md text-sm text-emerald-700">
                      <FaInfoCircle className="mr-2" />
                      No organizations are currently available in the system
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