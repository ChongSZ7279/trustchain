import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils/helpers';
import { 
  FaBuilding, 
  FaSearch, 
  FaFilter,
  FaEdit,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaTimes,
  FaUndo
} from 'react-icons/fa';

export default function OrganizationList() {
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [fundRange, setFundRange] = useState({ min: 0, max: 100000 });
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Available filter options
  const categoryOptions = [
    'Education',
    'Healthcare',
    'Environment',
    'Youth Development',
    'Disaster Relief',
    'Other'
  ];
  
  const statusOptions = [
    { value: 'verified', label: 'Verified', icon: <FaCheckCircle className="text-green-500" /> },
    { value: 'pending', label: 'Pending', icon: <FaExclamationTriangle className="text-yellow-500" /> }
  ];

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/organizations');
      setOrganizations(response.data);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError(
        err.response?.data?.message || 
        'Failed to fetch organizations. Please try again later.'
      );
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleStatus = (status) => {
    setSelectedStatuses(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleFundRangeChange = (e, type) => {
    const value = parseInt(e.target.value, 10) || 0;
    setFundRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setFundRange({ min: 0, max: 100000 });
    setSelectedStatuses([]);
  };

  const applyFilters = () => {
    // This function would typically make an API call with filters
    // For now, we'll just log the filter values
    console.log('Applied filters:', {
      search: searchTerm,
      categories: selectedCategories,
      fundRange,
      statuses: selectedStatuses
    });
  };

  const filteredOrganizations = organizations.filter(org => {
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(org.category);
    
    // Fund range filter (assuming org.target_fund exists)
    const targetFund = org.target_fund || 0;
    const matchesFundRange = targetFund >= fundRange.min && targetFund <= fundRange.max;
    
    // Status filter
    const isVerified = org.is_verified;
    const matchesStatus = selectedStatuses.length === 0 || 
      (selectedStatuses.includes('verified') && isVerified) ||
      (selectedStatuses.includes('pending') && !isVerified);
    
    return matchesSearch && matchesCategory && matchesFundRange && matchesStatus;
  });

  const canEditOrganization = (org) => {
    return organization?.id === org.id || org.representative_id === user?.ic_number;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-800">{error}</h3>
          <button
            onClick={fetchOrganizations}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaBuilding className="mr-3" />
              Organizations
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Browse and discover organizations making a difference in the community
            </p>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isSidebarOpen ? <FaTimes className="mr-2" /> : <FaFilter className="mr-2" />}
            {isSidebarOpen ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Filter */}
          <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-white shadow-sm rounded-lg p-4 h-fit sticky top-20`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <FaFilter className="mr-2" />
                Filters
              </h2>
              <button 
                onClick={resetFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <FaUndo className="mr-1" />
                Reset
              </button>
            </div>
            
            {/* Search */}
            <div className="mb-6">
              <label htmlFor="sidebar-search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Organizations
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  id="sidebar-search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full rounded-md border-gray-300 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Search by name or description"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            
            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
              <div className="space-y-2">
                {categoryOptions.map(category => (
                  <div key={category} className="flex items-center">
                    <input
                      id={`category-${category}`}
                      name={`category-${category}`}
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`category-${category}`} className="ml-2 block text-sm text-gray-700">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Target Fund Range */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaMoneyBillWave className="mr-2 text-green-600" />
                Target Fund Range
              </h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="min-fund" className="block text-xs text-gray-500">
                    Min: ${fundRange.min}
                  </label>
                  <input
                    type="range"
                    id="min-fund"
                    min="0"
                    max="100000"
                    step="1000"
                    value={fundRange.min}
                    onChange={(e) => handleFundRangeChange(e, 'min')}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label htmlFor="max-fund" className="block text-xs text-gray-500">
                    Max: ${fundRange.max}
                  </label>
                  <input
                    type="range"
                    id="max-fund"
                    min="0"
                    max="100000"
                    step="1000"
                    value={fundRange.max}
                    onChange={(e) => handleFundRangeChange(e, 'max')}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>$0</span>
                  <span>$100,000</span>
                </div>
              </div>
            </div>
            
            {/* Status */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
              <div className="space-y-2">
                {statusOptions.map(status => (
                  <div key={status.value} className="flex items-center">
                    <input
                      id={`status-${status.value}`}
                      name={`status-${status.value}`}
                      type="checkbox"
                      checked={selectedStatuses.includes(status.value)}
                      onChange={() => toggleStatus(status.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`status-${status.value}`} className="ml-2 flex items-center text-sm text-gray-700">
                      {status.icon}
                      <span className="ml-1">{status.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Apply Filters Button */}
            <button
              onClick={applyFilters}
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaTimes className="mr-2" />
              Apply Filters
            </button>
          </div>

          {/* Organizations Grid */}
          <div className="flex-1">
            {filteredOrganizations.length === 0 ? (
              <div className="bg-white shadow-sm rounded-lg">
                <div className="text-center py-12">
                  <FaBuilding className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No organizations found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || selectedCategories.length > 0 || selectedStatuses.length > 0
                      ? 'Try adjusting your search or filter criteria'
                      : 'Organizations will appear here once they are registered'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {filteredOrganizations.map(org => (
                  <div
                    key={org.id}
                    className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            className="h-16 w-16 rounded-lg object-cover bg-gray-100"
                            src={formatImageUrl(org.logo)}
                            alt={org.name}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/64?text=Logo';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {org.name}
                            </h3>
                            {org.is_verified ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <FaCheckCircle className="mr-1" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <FaExclamationTriangle className="mr-1" />
                                Pending
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{org.category}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {org.description}
                        </p>
                      </div>

                      {/* Target Fund Display */}
                      {org.target_fund && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 flex items-center">
                              <FaMoneyBillWave className="mr-1 text-green-600" />
                              Target Fund:
                            </span>
                            <span className="font-medium">${org.target_fund.toLocaleString()}</span>
                          </div>
                          {org.current_fund && (
                            <div className="mt-1">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-green-600 h-2.5 rounded-full" 
                                  style={{ width: `${Math.min(100, (org.current_fund / org.target_fund) * 100)}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>${org.current_fund.toLocaleString()} raised</span>
                                <span>{Math.round((org.current_fund / org.target_fund) * 100)}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-4 space-y-2">
                        {org.phone_number && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <FaPhone className="mr-2 text-gray-400" />
                            {org.phone_number}
                          </p>
                        )}
                        {org.gmail && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <FaEnvelope className="mr-2 text-gray-400" />
                            {org.gmail}
                          </p>
                        )}
                        {org.register_address && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <FaMapMarkerAlt className="mr-2 text-gray-400" />
                            {org.register_address}
                          </p>
                        )}
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <Link
                          to={`/organizations/${org.id}`}
                          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900"
                        >
                          <FaExternalLinkAlt className="mr-2" />
                          View Details
                        </Link>
                        {canEditOrganization(org) && (
                          <button
                            onClick={() => navigate(`/organizations/${org.id}/edit`)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                          >
                            <FaEdit className="mr-2" />
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}