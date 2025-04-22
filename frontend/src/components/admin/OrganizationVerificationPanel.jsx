import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaHandshake
} from 'react-icons/fa';

export default function OrganizationVerificationPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [charities, setCharities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [entityType, setEntityType] = useState('organizations'); // 'organizations' or 'charities'

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
        console.log(`Fetching ${entityType} verification data with status:`, filterStatus);
        
        if (entityType === 'organizations') {
          // Fetch organizations that need verification
          const response = await api.get(`/admin/verification/organizations`, {
            params: { status: filterStatus }
          });
          console.log('Organizations API response:', response.data);
          setOrganizations(response.data);
        } else {
          // Fetch charities that need verification
          const response = await api.get(`/admin/verification/charities`, {
            params: { status: filterStatus }
          });
          console.log('Charities API response:', response.data);
          setCharities(response.data);
        }
      } catch (error) {
        console.error(`Error fetching ${entityType} verification data:`, error);
        toast.error(`Failed to load ${entityType} verification data: ` + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, filterStatus, entityType]);

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // Re-fetch data
    const fetchData = async () => {
      try {
        if (entityType === 'organizations') {
          // Fetch organizations that need verification
          const response = await api.get(`/admin/verification/organizations`, {
            params: { status: filterStatus }
          });
          setOrganizations(response.data);
          console.log('Organizations response:', response.data);
        } else {
          // Fetch charities that need verification
          const response = await api.get(`/admin/verification/charities`, {
            params: { status: filterStatus }
          });
          setCharities(response.data);
          console.log('Charities response:', response.data);
        }

        toast.success('Data refreshed');
      } catch (error) {
        console.error('Error refreshing data:', error);
        toast.error('Failed to refresh data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  };

  // Debug function to test API directly
  const handleDebugTest = async () => {
    try {
      toast.success(`Testing ${entityType} API endpoints...`);
      
      // Determine the current API base URL
      const apiBaseUrl = api.defaults.baseURL || import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      console.log('Current API base URL:', apiBaseUrl);
      
      // Display current auth token
      const token = localStorage.getItem('token');
      console.log('Auth token exists:', !!token);
      if (token) {
        console.log('Auth token (first 10 chars):', token.substring(0, 10) + '...');
      }
      
      // Test the non-auth endpoint
      const endpoint = `/check-verification-${entityType}`;
      console.log('Testing endpoint:', endpoint);
      
      const testResponse = await api.get(endpoint);
      console.log('Test API response:', testResponse.data);

      // Show counts in toast
      if (entityType === 'organizations') {
        toast.success(
          `API Test Results: Organizations: ${testResponse.data.organizations_count}, Pending: ${testResponse.data.pending_organizations_sample.length}, Verified: ${testResponse.data.verified_organizations_sample.length}`
        );

        // Update state with the test data
        if (testResponse.data.pending_organizations_sample.length > 0) {
          setOrganizations(testResponse.data.pending_organizations_sample);
        }
      } else {
        toast.success(
          `API Test Results: Charities: ${testResponse.data.charities_count}, Pending: ${testResponse.data.pending_charities_sample.length}, Verified: ${testResponse.data.verified_charities_sample.length}`
        );

        // Update state with the test data
        if (testResponse.data.pending_charities_sample.length > 0) {
          setCharities(testResponse.data.pending_charities_sample);
        }
      }
    } catch (error) {
      console.error('Debug test error:', error);
      toast.error('Debug test failed: ' + (error.response?.data?.message || error.message));
    }
  };

  // Filter items based on search term
  const filteredItems = entityType === 'organizations' 
    ? organizations.filter(org => 
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : charities.filter(charity => 
        charity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        charity.organization?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Handle verification status update
  const handleStatusUpdate = (id, newStatus) => {
    if (entityType === 'organizations') {
      setOrganizations(organizations.map(org =>
        org.id === id ? { ...org, is_verified: newStatus === 'verified' } : org
      ));

      if (newStatus === 'verified' && filterStatus === 'pending') {
        setOrganizations(organizations.filter(org => org.id !== id));
      }
    } else {
      setCharities(charities.map(charity =>
        charity.id === id ? { ...charity, is_verified: newStatus === 'verified' } : charity
      ));

      if (newStatus === 'verified' && filterStatus === 'pending') {
        setCharities(charities.filter(charity => charity.id !== id));
      }
    }
  };

  if (!user || !user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h2>
          <p className="mt-1 text-sm text-gray-500">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {entityType === 'organizations' ? 'Organization' : 'Charity'} Verification Panel
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={handleDebugTest}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Debug Test
            </button>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              <FaSyncAlt className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Entity Type Toggle */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setEntityType('organizations')}
              className={`px-4 py-2 rounded-md flex items-center ${
                entityType === 'organizations'
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaBuilding className="mr-2" />
              Organizations
            </button>
            <button
              onClick={() => setEntityType('charities')}
              className={`px-4 py-2 rounded-md flex items-center ${
                entityType === 'charities'
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaHandshake className="mr-2" />
              Charities
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder={`Search by name or ${entityType === 'organizations' ? 'email' : 'organization'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FaFilter className="mr-2 text-gray-500" />
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="pending">Pending Verification</option>
                  <option value="verified">Verified</option>
                  <option value="all">All</option>
                </select>
              </div>

              <div className="flex space-x-2">
                <div className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700">
                  <FaBuilding className="inline mr-2" />
                  {entityType === 'organizations' ? 'Organizations' : 'Charities'} ({filteredItems.length})
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <OrganizationVerificationCard
                  key={item.id}
                  entity={item}
                  entityType={entityType}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))
            ) : (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <FaCheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No {entityType === 'organizations' ? 'organizations' : 'charities'} to verify
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm
                    ? "No items match your search criteria."
                    : `No ${entityType} with status "${filterStatus}" found.`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 