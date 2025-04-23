import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaFilter,
  FaSearch,
  FaSyncAlt,
  FaUser,
  FaArrowLeft,
  FaListAlt,
  FaChevronDown,
  FaInfoCircle,
  FaThumbsUp,
  FaRegClock
} from 'react-icons/fa';

export default function UserVerificationPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
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
        // This endpoint doesn't exist yet - you'll need to implement it in the backend
        const response = await axios.get('/admin/verification/users', {
          params: { status: filterStatus }
        });
        
        setUsers(response.data);
        
        // Calculate stats
        if (response.data) {
          const pendingCount = response.data.filter(u => !u.is_verified).length;
          const verifiedCount = response.data.filter(u => u.is_verified).length;
          
          setStats({
            pending: pendingCount,
            verified: verifiedCount,
            total: response.data.length
          });
        }
      } catch (error) {
        console.error('Error fetching user verification data:', error);
        toast.error('Failed to load user verification data: ' + (error.response?.data?.message || error.message));
        
        // Set empty data as fallback
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, filterStatus]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    // Re-fetch data - implementation similar to the useEffect above
    setRefreshing(false);
    toast.success('Feature coming soon');
  };

  // Filter items based on search term
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 rounded-full p-3 shadow-lg">
                  <FaUser className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-3xl font-bold">User Verification</h1>
                  <p className="text-sm text-purple-100 mt-1">Verify user identity and documentation</p>
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
                <p className="text-sm font-medium text-gray-500">Pending Users</p>
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
                {filterStatus === 'pending' ? 'Currently Viewing' : 'View Pending Users'}
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500 transform transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Verified Users</p>
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
                {filterStatus === 'verified' ? 'Currently Viewing' : 'View Verified Users'}
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500 transform transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-14 w-14 bg-purple-100 rounded-full flex items-center justify-center shadow-inner">
                <FaUser className="h-7 w-7 text-purple-600" />
              </div>
            </div>
            <div className="mt-5 border-t border-gray-100 pt-4">
              <button 
                onClick={() => handleStatusFilter('all')}
                className={`w-full text-sm font-medium py-2 rounded-md border ${
                  filterStatus === 'all' 
                    ? 'text-purple-700 bg-purple-50 border-purple-200' 
                    : 'text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-purple-600'
                } transition-colors duration-200`}
              >
                {filterStatus === 'all' ? 'Currently Viewing' : 'View All Users'}
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
              <h3 className="text-sm font-medium text-blue-800">User Verification Coming Soon</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>This feature is under development. Soon you'll be able to verify users' identity documents and KYC information here.</p>
                <p className="mt-1">User verification will enhance trust and security on the TrustChain platform.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-4 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-700 text-lg font-medium">Loading user verification data...</p>
            <p className="mt-2 text-gray-500 text-sm">This may take a moment</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 text-purple-500 mb-4">
              <FaUser className="h-10 w-10" />
            </div>
            <h3 className="mt-4 text-xl font-medium text-gray-900">User Verification Module</h3>
            <p className="mt-3 text-gray-600 max-w-lg mx-auto">
              The User Verification feature is currently in development and will be available soon. This will allow admins to verify user identity documents and enhance platform security.
            </p>
            <div className="mt-8">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
              >
                <FaArrowLeft className="mr-2" />
                Back to Verification Hub
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 