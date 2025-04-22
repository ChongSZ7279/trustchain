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
  FaChartBar,
  FaClipboardCheck,
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
    setRefreshing(true);
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
          setCharities(response.data);
          console.log('Charities response:', response.data);
          
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
  const getCurrentStats = () => {
    if (entityType === 'organizations') {
      return {
        total: stats.totalOrganizations || 0,
        pending: stats.pendingOrganizations || 0,
        verified: stats.verifiedOrganizations || 0
      };
    } else {
      return {
        total: stats.totalCharities || 0,
        pending: stats.pendingCharities || 0,
        verified: stats.verifiedCharities || 0
      };
    }
  };

  const currentStats = getCurrentStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <FaBuilding className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold">Organization Verification</h1>
                  <p className="text-sm text-indigo-100 mt-1">Verify and approve organizations to ensure platform integrity</p>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center px-3 py-2 border border-white border-opacity-30 text-sm font-medium rounded-md text-white bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm"
                >
                  <FaSyncAlt className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh Data
                </button>
                <Link to="/admin/dashboard" className="inline-flex items-center px-3 py-2 border border-white border-opacity-30 text-sm font-medium rounded-md text-white bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 shadow-sm transform hover:-translate-y-0.5">
                  <FaArrowLeft className="mr-2" />
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Entity Type Selection Card */}
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-indigo-500 transform transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Entity Type</p>
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => setEntityType('organizations')}
                    className={`px-4 py-2 rounded-md flex items-center transition-all duration-200 ${
                      entityType === 'organizations'
                        ? 'bg-indigo-100 text-indigo-700 font-medium shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <FaBuilding className="mr-2" />
                    Organizations
                  </button>
                  <button
                    onClick={() => setEntityType('charities')}
                    className={`px-4 py-2 rounded-md flex items-center transition-all duration-200 ${
                      entityType === 'charities'
                        ? 'bg-indigo-100 text-indigo-700 font-medium shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <FaHandshake className="mr-2" />
                    Charities
                  </button>
                </div>
              </div>
              <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                {entityType === 'organizations' ? (
                  <FaBuilding className="h-6 w-6 text-indigo-600" />
                ) : (
                  <FaHandshake className="h-6 w-6 text-indigo-600" />
                )}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-500">
                Currently viewing {entityType === 'organizations' ? 'organizations' : 'charities'} for verification
              </p>
            </div>
          </div>
          
          {/* Stats Summary Card */}
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-500 transform transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Verification Stats</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-center">
                    <span className="text-xs text-gray-500">Total</span>
                    <p className="font-bold text-indigo-700">{currentStats.total}</p>
                  </div>
                  <div className="px-3 py-2 bg-yellow-50 rounded-md border border-yellow-200 text-center">
                    <span className="text-xs text-yellow-700">Pending</span>
                    <p className="font-bold text-yellow-700">{currentStats.pending}</p>
                  </div>
                  <div className="px-3 py-2 bg-green-50 rounded-md border border-green-200 text-center">
                    <span className="text-xs text-green-700">Verified</span>
                    <p className="font-bold text-green-700">{currentStats.verified}</p>
                  </div>
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaChartBar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-500">
                {currentStats.pending > 0 
                  ? `${currentStats.pending} ${entityType} awaiting verification` 
                  : `All ${entityType} have been processed`}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaInfoCircle className="h-5 w-5 text-blue-600" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">About Verification Process</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Please review all submitted documents carefully before verifying an organization or charity.</p>
                <p className="mt-1">Verification ensures that only legitimate entities can participate on the TrustChain platform.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white shadow-md rounded-lg mb-6 overflow-hidden">
          <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left Side: Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="flex items-center text-gray-700 font-medium">
                  <FaFilter className="mr-2 text-indigo-500" />
                  <span>Currently Viewing:</span>
                  <span className="ml-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                    {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} {entityType === 'organizations' ? 'Organizations' : 'Charities'}
                  </span>
                </div>
                
                {/* Status Filter Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)} 
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    aria-label="Filter by status"
                  >
                    <FaFilter className="mr-2 text-gray-500" />
                    <span>Change Filter</span>
                    <FaChevronDown className="ml-2 h-4 w-4 text-gray-500" />
                  </button>
                  
                  {isFilterOpen && (
                    <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 z-10 divide-y divide-gray-100">
                      <div className="py-1">
                        <button 
                          className={`w-full text-left px-4 py-2.5 text-sm ${filterStatus === 'pending' ? 'bg-indigo-50 text-indigo-800 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                          onClick={() => {
                            setFilterStatus('pending');
                            setIsFilterOpen(false);
                          }}
                        >
                          <div className="flex items-center">
                            <FaExclamationTriangle className={`mr-2 ${filterStatus === 'pending' ? 'text-yellow-500' : 'text-gray-400'}`} />
                            Pending Verification
                            <span className="ml-auto bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                              {currentStats.pending}
                            </span>
                          </div>
                        </button>
                        <button 
                          className={`w-full text-left px-4 py-2.5 text-sm ${filterStatus === 'verified' ? 'bg-indigo-50 text-indigo-800 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                          onClick={() => {
                            setFilterStatus('verified');
                            setIsFilterOpen(false);
                          }}
                        >
                          <div className="flex items-center">
                            <FaCheckCircle className={`mr-2 ${filterStatus === 'verified' ? 'text-green-500' : 'text-gray-400'}`} />
                            Verified
                            <span className="ml-auto bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                              {currentStats.verified}
                            </span>
                          </div>
                        </button>
                        <button 
                          className={`w-full text-left px-4 py-2.5 text-sm ${filterStatus === 'all' ? 'bg-indigo-50 text-indigo-800 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                          onClick={() => {
                            setFilterStatus('all');
                            setIsFilterOpen(false);
                          }}
                        >
                          <div className="flex items-center">
                            <FaListAlt className={`mr-2 ${filterStatus === 'all' ? 'text-indigo-500' : 'text-gray-400'}`} />
                            All {entityType === 'organizations' ? 'Organizations' : 'Charities'}
                            <span className="ml-auto bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                              {currentStats.total}
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right Side: Search Box */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                  placeholder={`Search ${entityType} by name or email...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label={`Search ${entityType}`}
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
            
            {/* Search Stats */}
            {searchTerm && (
              <div className="mt-4 px-4 py-2 bg-indigo-50 rounded-md border border-indigo-100 shadow-sm">
                <div className="flex items-center">
                  <FaInfoCircle className="text-indigo-500 mr-2" />
                  <span className="text-sm text-indigo-700">
                    Found {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for "{searchTerm}"
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
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-4 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-700 text-lg font-medium">Loading {entityType}...</p>
            <p className="mt-2 text-gray-500 text-sm">Retrieving the latest information</p>
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
              <div className="bg-white shadow-md rounded-lg p-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 text-gray-400 mb-4">
                  {searchTerm ? (
                    <FaSearch className="h-10 w-10" />
                  ) : (
                    <FaCheckCircle className="h-10 w-10" />
                  )}
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">No {entityType} found</h3>
                <p className="mt-3 text-gray-600 max-w-lg mx-auto">
                  {searchTerm
                    ? `No ${entityType} match your search criteria. Try using different keywords or clear your search.`
                    : `There are currently no ${entityType} with status "${filterStatus}". Try selecting a different status filter.`}
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
                      onClick={() => {
                        setFilterStatus('all');
                        setIsFilterOpen(false);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      <FaListAlt className="mr-2 text-gray-400" />
                      View All {entityType}
                    </button>
                  )}
                  {filterStatus === 'all' && filteredItems.length === 0 && (
                    <div className="inline-flex items-center px-4 py-3 bg-indigo-50 rounded-md text-sm text-indigo-700">
                      <FaInfoCircle className="mr-2" />
                      No {entityType} are currently available in the system
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