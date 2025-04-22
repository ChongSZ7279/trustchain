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
  FaHandshake,
  FaChevronDown,
  FaArrowLeft,
  FaTimes,
  FaChartBar
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    pendingOrganizations: 0,
    verifiedOrganizations: 0,
    totalCharities: 0,
    pendingCharities: 0,
    verifiedCharities: 0
  });

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
          
          // Get stats
          try {
            const statsResp = await api.get('/check-verification-organizations');
            setStats(prev => ({
              ...prev,
              totalOrganizations: statsResp.data.organizations_count || 0,
              pendingOrganizations: statsResp.data.pending_organizations_sample?.length || 0,
              verifiedOrganizations: statsResp.data.verified_organizations_sample?.length || 0
            }));
          } catch (err) {
            console.error('Error fetching organization stats:', err);
          }
        } else {
          // Fetch charities that need verification
          const response = await api.get(`/admin/verification/charities`, {
            params: { status: filterStatus }
          });
          console.log('Charities API response:', response.data);
          setCharities(response.data);
          
          // Get stats
          try {
            const statsResp = await api.get('/check-verification-charities');
            setStats(prev => ({
              ...prev,
              totalCharities: statsResp.data.charities_count || 0,
              pendingCharities: statsResp.data.pending_charities_sample?.length || 0,
              verifiedCharities: statsResp.data.verified_charities_sample?.length || 0
            }));
          } catch (err) {
            console.error('Error fetching charity stats:', err);
          }
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
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You do not have permission to access this page.</p>
          <Link to="/" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5">
            <FaArrowLeft className="mr-2" />
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Get stats for current entity type and status
  const getCurrentStats = () => {
    if (entityType === 'organizations') {
      return {
        total: stats.totalOrganizations,
        pending: stats.pendingOrganizations,
        verified: stats.verifiedOrganizations
      };
    } else {
      return {
        total: stats.totalCharities,
        pending: stats.pendingCharities,
        verified: stats.verifiedCharities
      };
    }
  };

  const currentStats = getCurrentStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                {entityType === 'organizations' ? (
                  <div className="p-2 bg-indigo-100 rounded-full mr-3">
                    <FaBuilding className="h-8 w-8 text-indigo-600" />
                  </div>
                ) : (
                  <div className="p-2 bg-indigo-100 rounded-full mr-3">
                    <FaHandshake className="h-8 w-8 text-indigo-600" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {entityType === 'organizations' ? 'Organization' : 'Charity'} Verification
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Verify and approve {entityType === 'organizations' ? 'organizations' : 'charities'} to ensure platform integrity
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Link 
                  to="/admin/dashboard" 
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <FaArrowLeft className="mr-2" />
                  Back to Dashboard
                </Link>
                
                <button
                  onClick={handleDebugTest}
                  className="hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <FaChartBar className="mr-2" />
                  Fetch Stats
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Entity Type Toggle & Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Entity Type Tabs */}
            <div className="flex justify-center bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setEntityType('organizations')}
                className={`px-5 py-2.5 rounded-md flex items-center transition-all duration-200 ${
                  entityType === 'organizations'
                    ? 'bg-white text-indigo-700 font-medium shadow'
                    : 'bg-transparent text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FaBuilding className="mr-2" />
                Organizations
              </button>
              <button
                onClick={() => setEntityType('charities')}
                className={`px-5 py-2.5 rounded-md flex items-center transition-all duration-200 ${
                  entityType === 'charities'
                    ? 'bg-white text-indigo-700 font-medium shadow'
                    : 'bg-transparent text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FaHandshake className="mr-2" />
                Charities
              </button>
            </div>
            
            {/* Stats Cards */}
            <div className="flex flex-wrap gap-3">
              <div className="px-4 py-2 bg-indigo-50 rounded-md border border-indigo-100 flex items-center">
                <div className="p-1.5 bg-indigo-100 rounded-full mr-2">
                  <FaBuilding className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-indigo-700">Total: </span>
                <span className="ml-1 text-sm font-bold text-indigo-800">{currentStats.total || 0}</span>
              </div>
              
              <div className="px-4 py-2 bg-yellow-50 rounded-md border border-yellow-100 flex items-center">
                <div className="p-1.5 bg-yellow-100 rounded-full mr-2">
                  <FaExclamationTriangle className="h-4 w-4 text-yellow-600" />
                </div>
                <span className="text-sm font-medium text-yellow-700">Pending: </span>
                <span className="ml-1 text-sm font-bold text-yellow-800">{currentStats.pending || 0}</span>
              </div>
              
              <div className="px-4 py-2 bg-green-50 rounded-md border border-green-100 flex items-center">
                <div className="p-1.5 bg-green-100 rounded-full mr-2">
                  <FaCheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-700">Verified: </span>
                <span className="ml-1 text-sm font-bold text-green-800">{currentStats.verified || 0}</span>
              </div>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:-translate-y-0.5"
              disabled={loading}
            >
              <FaSyncAlt className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                placeholder={`Search by name or ${entityType === 'organizations' ? 'email' : 'organization'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)} 
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <FaFilter className="mr-2 text-gray-500" />
                  <span>Status: </span>
                  <span className="font-semibold ml-1">
                    {filterStatus === 'pending' ? 'Pending' : 
                     filterStatus === 'verified' ? 'Verified' : 'All'}
                  </span>
                  <FaChevronDown className="ml-2 h-4 w-4 text-gray-500" />
                </button>
                
                {isFilterOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 transition-all duration-200">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <button 
                        className={`block w-full text-left px-4 py-2 text-sm ${filterStatus === 'pending' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => {
                          setFilterStatus('pending');
                          setIsFilterOpen(false);
                        }}
                      >
                        <div className="flex items-center">
                          <FaExclamationTriangle className={`mr-2 ${filterStatus === 'pending' ? 'text-yellow-500' : 'text-gray-400'}`} />
                          Pending Verification
                        </div>
                      </button>
                      <button 
                        className={`block w-full text-left px-4 py-2 text-sm ${filterStatus === 'verified' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => {
                          setFilterStatus('verified');
                          setIsFilterOpen(false);
                        }}
                      >
                        <div className="flex items-center">
                          <FaCheckCircle className={`mr-2 ${filterStatus === 'verified' ? 'text-green-500' : 'text-gray-400'}`} />
                          Verified
                        </div>
                      </button>
                      <button 
                        className={`block w-full text-left px-4 py-2 text-sm ${filterStatus === 'all' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => {
                          setFilterStatus('all');
                          setIsFilterOpen(false);
                        }}
                      >
                        <div className="flex items-center">
                          <FaFilter className={`mr-2 ${filterStatus === 'all' ? 'text-indigo-500' : 'text-gray-400'}`} />
                          All 
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {searchTerm && (
            <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-100 text-sm text-blue-700 flex items-center">
              <FaSearch className="mr-2 text-blue-500" />
              <span>Showing results for "{searchTerm}"</span>
              <button 
                onClick={() => setSearchTerm('')}
                className="ml-auto text-blue-500 hover:text-blue-700 transition-colors duration-200"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow">
            <div className="flex items-center justify-center space-x-2 animate-pulse">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-lg text-gray-600">Loading {entityType}...</p>
              <p className="text-sm text-gray-400 mt-2">Please wait while we fetch the data</p>
            </div>
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
              <div className="bg-white shadow rounded-lg p-10 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  {entityType === 'organizations' ? (
                    <FaBuilding className="h-8 w-8 text-gray-300" />
                  ) : (
                    <FaHandshake className="h-8 w-8 text-gray-300" />
                  )}
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">
                  No {entityType} to verify
                </h3>
                <p className="mt-2 text-gray-500 max-w-md mx-auto">
                  {searchTerm
                    ? `No ${entityType} match your search criteria. Try using different keywords.`
                    : `No ${entityType} with status "${filterStatus}" found. Try selecting a different status filter.`}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      <FaSearch className="mr-2 text-gray-400" />
                      Clear Search
                    </button>
                  )}
                  <button
                    onClick={() => setFilterStatus('all')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    <FaFilter className="mr-2 text-gray-400" />
                    View All {entityType === 'organizations' ? 'Organizations' : 'Charities'}
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    <FaSyncAlt className="mr-2" />
                    Refresh Data
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 