import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import OrganizationCard from './OrganizationCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBuilding, 
  FaSearch, 
  FaFilter, 
  FaTimes, 
  FaExclamationTriangle,
  FaSync
} from 'react-icons/fa';

export default function OrganizationList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [fundRange, setFundRange] = useState({ min: 0, max: 100000 });
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  
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
    { value: 'verified', label: 'Verified' },
    { value: 'pending', label: 'Pending' }
  ];

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/organizations');
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

  const applyFilters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (selectedCategories.length > 0) {
        selectedCategories.forEach(category => {
          params.append('categories[]', category);
        });
      }
      
      if (selectedStatuses.length > 0) {
        selectedStatuses.forEach(status => {
          params.append('statuses[]', status);
        });
      }
      
      params.append('min_fund', fundRange.min);
      params.append('max_fund', fundRange.max);
      
      // Make API call with filters
      const response = await axios.get(`/organizations?${params.toString()}`);
      setOrganizations(response.data);
      setShowFilters(false);
    } catch (err) {
      console.error('Error applying filters:', err);
      setError(
        err.response?.data?.message || 
        'Failed to apply filters. Please try again.'
      );
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading organizations...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg"
        >
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-medium text-red-800 mb-2">{error}</h3>
          <p className="text-gray-600 mb-6">We couldn't load the organizations. Please try again.</p>
          <button
            onClick={fetchOrganizations}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <FaSync className="mr-2" />
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  // Render main content
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-8"
      >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaBuilding className="mr-3 text-indigo-600" />
              Organizations
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Support organizations and make a difference in the community
            </p>
          </div>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-xl shadow-sm mb-8 p-4"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search organizations..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <FaFilter className="mr-2" />
              Filters {selectedCategories.length > 0 || selectedStatuses.length > 0 ? `(${selectedCategories.length + selectedStatuses.length})` : ''}
            </button>
          </div>
        </div>
        
        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Category Filter */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
                    <div className="space-y-2">
                      {categoryOptions.map(category => (
                        <div key={category} className="flex items-center">
                          <input
                            id={`category-${category}`}
                            type="checkbox"
                            checked={selectedCategories.includes(category)}
                            onChange={() => toggleCategory(category)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Status Filter */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                    <div className="space-y-2">
                      {statusOptions.map(status => (
                        <div key={status.value} className="flex items-center">
                          <input
                            id={`status-${status.value}`}
                            type="checkbox"
                            checked={selectedStatuses.includes(status.value)}
                            onChange={() => toggleStatus(status.value)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`status-${status.value}`} className="ml-2 text-sm text-gray-700">
                            {status.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Fund Range Filter */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Fund Range</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="min-fund" className="block text-xs text-gray-500">
                          Minimum (RM)
                        </label>
                        <input
                          type="number"
                          id="min-fund"
                          value={fundRange.min}
                          onChange={(e) => handleFundRangeChange(e, 'min')}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="max-fund" className="block text-xs text-gray-500">
                          Maximum (RM)
                        </label>
                        <input
                          type="number"
                          id="max-fund"
                          value={fundRange.max}
                          onChange={(e) => handleFundRangeChange(e, 'max')}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FaTimes className="mr-2" />
                    Reset
                  </button>
                  <button
                    onClick={applyFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Organizations Grid */}
      {filteredOrganizations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.map(organization => (
            <OrganizationCard key={organization.id} organization={organization} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-8 text-center"
        >
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Organizations Found</h3>
          <p className="text-gray-600 mb-6">We couldn't find any organizations matching your criteria.</p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <FaTimes className="mr-2" />
            Clear Filters
          </button>
        </motion.div>
      )}
    </motion.div>
  );
} 