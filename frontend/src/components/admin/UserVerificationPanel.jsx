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
  FaRegClock,
  FaIdCard,
  FaTimes,
  FaEye
} from 'react-icons/fa';
import api from '../../utils/api';

// User Details Modal Component
const UserDetailsModal = ({ user, onClose, onVerify }) => {
  if (!user) return null;
  
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">IC Number</p>
                <p className="font-medium">{user.ic_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.gmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{user.phone_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Wallet Address</p>
                <p className="font-medium truncate">{user.wallet_address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={`font-medium ${user.is_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {user.is_verified ? 'Verified' : 'Pending Verification'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-3">IC Pictures</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Front IC</p>
                {user.front_ic_picture ? (
                  <div className="relative aspect-[3/2] rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={user.front_ic_picture}
                      alt="Front IC" 
                      className="w-full h-full object-cover"
                    />
                    <a 
                      href={user.front_ic_picture}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md text-sm hover:bg-opacity-70"
                    >
                      View Full Size
                    </a>
                  </div>
                ) : (
                  <div className="aspect-[3/2] rounded-lg bg-gray-100 flex items-center justify-center">
                    <p className="text-sm text-gray-500">No front IC picture available</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Back IC</p>
                {user.back_ic_picture ? (
                  <div className="relative aspect-[3/2] rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={user.back_ic_picture}
                      alt="Back IC" 
                      className="w-full h-full object-cover"
                    />
                    <a 
                      href={user.back_ic_picture}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md text-sm hover:bg-opacity-70"
                    >
                      View Full Size
                    </a>
                  </div>
                ) : (
                  <div className="aspect-[3/2] rounded-lg bg-gray-100 flex items-center justify-center">
                    <p className="text-sm text-gray-500">No back IC picture available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Close
          </button>
          {!user.is_verified && (
            <button
              onClick={() => onVerify(user.ic_number)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Verify User
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

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
  const [error, setError] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.is_admin) {
      toast.error('You do not have permission to access this page');
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Update the API endpoint to match your Laravel backend
      const response = await api.get('/admin/users');
      
      if (response.data) {
        // Transform the data to match our expected format
        const transformedUsers = response.data.map(user => ({
          ic_number: user.ic_number,
          name: user.name,
          gmail: user.gmail,
          phone_number: user.phone_number,
          created_at: user.created_at,
          is_verified: user.is_verified,
          front_ic_picture: user.front_ic_picture,
          back_ic_picture: user.back_ic_picture,
          profile_picture: user.profile_picture,
          wallet_address: user.wallet_address
        }));

        setUsers(transformedUsers);
        
        // Calculate stats
        const pendingCount = transformedUsers.filter(user => !user.is_verified).length;
        const verifiedCount = transformedUsers.filter(user => user.is_verified).length;
        
        setStats({
          total: transformedUsers.length,
          verified: verifiedCount,
          pending: pendingCount
        });

        console.log('Fetched users:', transformedUsers); // Debug log
      }
    } catch (error) {
      console.error('Error fetching user verification data:', error);
      setError('Failed to connect to the server. Please try again later.');
      toast.error('Connection error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await fetchData();
      toast.success('Data refreshed successfully');
    } catch (error) {
      // Error handling is already in fetchData
    } finally {
      setRefreshing(false);
    }
  };

  // Call fetchData when component mounts
  useEffect(() => {
    if (user && user.is_admin) {
      fetchData();
    }
  }, [user]);

  // Filter items based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.name?.toLowerCase() || '').includes(searchLower) ||
      (user.gmail?.toLowerCase() || '').includes(searchLower) ||
      (user.ic_number?.toLowerCase() || '').includes(searchLower) ||
      (user.phone_number?.toLowerCase() || '').includes(searchLower)
    );
  }).filter(user => {
    if (filterStatus === 'pending') return !user.is_verified;
    if (filterStatus === 'verified') return user.is_verified;
    return true; // 'all' filter
  });

  // Function to safely handle user data display with potential missing fields
  const safeDisplay = (user) => {
    return {
      ic_number: user.ic_number || '',
      name: user.name || 'Unknown User',
      gmail: user.gmail || 'No Email',
      phone_number: user.phone_number || 'No Phone',
      created_at: user.created_at || new Date().toISOString(),
      is_verified: !!user.is_verified,
      front_ic_picture: user.front_ic_picture || null,
      back_ic_picture: user.back_ic_picture || null,
      profile_picture: user.profile_picture || null,
      wallet_address: user.wallet_address || 'No Wallet Address'
    };
  };

  // Handle user verification
  const handleVerifyUser = async (icNumber) => {
    if (!icNumber) {
      toast.error('Cannot verify user: Invalid IC number');
      return;
    }

    try {
      const response = await api.post(`/admin/users/${icNumber}/verify`);
      
      if (response.data.success) {
        // Update the local state to reflect verification
        setUsers(users.map(user => 
          user.ic_number === icNumber 
            ? { ...user, is_verified: true } 
            : user
        ));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          pending: Math.max(0, prev.pending - 1),
          verified: prev.verified + 1
        }));
        
        toast.success('User verified successfully');
      } else {
        toast.error(response.data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      toast.error('Failed to verify user: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handle status filter click
  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    setSearchTerm(''); // Clear search when changing filters
  };

  // Open modal with user details
  const openViewDetailsModal = async (icNumber) => {
    try {
      // Find the user in our existing data
      const foundUser = users.find(user => user.ic_number === icNumber);
      
      if (foundUser) {
        // Transform the user data to ensure all required fields are present
        const userDetails = {
          ...foundUser,
          front_ic_picture: foundUser.front_ic_picture ? foundUser.front_ic_picture : null,
          back_ic_picture: foundUser.back_ic_picture ? foundUser.back_ic_picture : null,
          profile_picture: foundUser.profile_picture ? foundUser.profile_picture : null,
        };
        
        setViewingUser(userDetails);
        setShowDetailsModal(true);
        
        console.log('Viewing user details:', userDetails); // Debug log
      } else {
        toast.error('User details not found');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to fetch user details: ' + (error.response?.data?.message || error.message));
    }
  };
  
  // Close the details modal
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setViewingUser(null);
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
    <div className="min-h-screen bg-gray-100">
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
                  onClick={refreshData}
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
              <h3 className="text-sm font-medium text-blue-800">User Verification</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Please review user documents and identity information carefully before verification.</p>
                <p className="mt-1">User verification enhances trust and security on the TrustChain platform.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation and Search */}
        <div className="bg-white shadow-sm rounded-lg mb-6 overflow-hidden">
          <div className="flex flex-row justify-between items-center border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => handleStatusFilter('pending')}
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
                    {stats.pending}
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => handleStatusFilter('verified')}
                className={`px-5 py-3 text-sm font-medium border-b-2 ${
                  filterStatus === 'verified' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors duration-200`}
              >
                <div className="flex items-center">
                  <FaCheckCircle className={`mr-2 ${filterStatus === 'verified' ? 'text-blue-500' : 'text-gray-400'}`} />
                  Verified
                  <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                    {stats.verified}
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => handleStatusFilter('all')}
                className={`px-5 py-3 text-sm font-medium border-b-2 ${
                  filterStatus === 'all' 
                    ? 'border-purple-500 text-purple-600 bg-purple-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors duration-200`}
              >
                <div className="flex items-center">
                  <FaListAlt className={`mr-2 ${filterStatus === 'all' ? 'text-purple-500' : 'text-gray-400'}`} />
                  All Users
                  <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                    {stats.total}
                  </span>
                </div>
              </button>
            </div>
            
            {/* Search Box */}
            <div className="relative px-4 py-2">
              <div className="flex">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-purple-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-colors duration-200"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search users"
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
            <div className="bg-purple-50 border-b border-purple-100 px-4 py-2">
              <div className="flex items-center text-sm">
                <FaInfoCircle className="text-purple-500 mr-2" />
                <span className="text-purple-700">
                  Found {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''} for "{searchTerm}"
                </span>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="ml-auto text-xs px-2.5 py-1 bg-white text-purple-600 rounded-md border border-purple-200 hover:bg-purple-600 hover:text-white transition-colors duration-200"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content Area - Display User Data if Available */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-4 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-700 text-lg font-medium">Loading user verification data...</p>
            <p className="mt-2 text-gray-500 text-sm">This may take a moment</p>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="my-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
                <div className="mt-3 flex justify-end">
                  <button 
                    onClick={refreshData}
                    className="px-4 py-2 bg-white text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
            {filteredUsers.length > 0 ? (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map(user => {
                        const safeUser = safeDisplay(user);
                        return (
                          <tr key={safeUser.ic_number}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  {safeUser.profile_picture ? (
                                    <img 
                                      src={`/storage/${safeUser.profile_picture}`}
                                      alt=""
                                      className="h-10 w-10 rounded-full"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                                      <span className="text-lg font-medium text-purple-800">{safeUser.name.charAt(0) || 'U'}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{safeUser.name}</div>
                                  <div className="text-sm text-gray-500">IC: {safeUser.ic_number}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{safeUser.gmail}</div>
                              <div className="text-sm text-gray-500">{safeUser.phone_number}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{new Date(safeUser.created_at).toLocaleDateString()}</div>
                              <div className="text-sm text-gray-500">{new Date(safeUser.created_at).toLocaleTimeString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {safeUser.is_verified ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Verified
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                {!safeUser.is_verified && (
                                  <button 
                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md hover:bg-blue-100 transition-colors"
                                    onClick={() => handleVerifyUser(safeUser.ic_number)}
                                  >
                                    Verify
                                  </button>
                                )}
                                <button 
                                  className="text-purple-600 hover:text-purple-900 bg-purple-50 px-3 py-1 rounded-md hover:bg-purple-100 transition-colors"
                                  onClick={() => openViewDetailsModal(safeUser.ic_number)}
                                >
                                  View Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-lg p-6 text-center">
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No Users Found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'No users match your search criteria.' : 'There are no users waiting for verification.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
        {/* User Details Modal */}
        {showDetailsModal && (
          <UserDetailsModal 
            user={viewingUser}
            onClose={closeDetailsModal}
            onVerify={handleVerifyUser}
          />
        )}
    </div>
    
  );
}
