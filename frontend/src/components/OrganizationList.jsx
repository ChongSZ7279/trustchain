import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import OrganizationCard from './OrganizationCard';
import Pagination from './Pagination';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBuilding, 
  FaSearch, 
  FaFilter, 
  FaTimes, 
  FaExclamationTriangle,
  FaSync,
  FaPlus,
  FaSlidersH,
  FaChevronDown,
  FaTag,
  FaLayerGroup,
  FaBullseye
} from 'react-icons/fa';

export default function OrganizationList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [fundRange, setFundRange] = useState({ min: 0, max: 100000 });
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
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
    // Calculate active filters count
    const filtersCount = selectedCategories.length + selectedStatuses.length + 
      ((fundRange.min > 0 || fundRange.max < 100000) ? 1 : 0);
    setActiveFiltersCount(filtersCount);
    
    fetchOrganizations();
  }, [currentPage, selectedCategories, selectedStatuses, fundRange]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 12 // Consider reducing to 9 for initial load
      });
      
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
      
      const response = await axios.get(`/organizations?${params.toString()}`, {
        timeout: 15000, // Increase timeout for slower connections
      });
      
      // Process the response immediately
      setOrganizations(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
      setTotalItems(response.data.total || 0);
    } catch (err) {
      console.error('Error fetching organizations:', err.message);
      setError(
        err.response?.data?.message || 
        'Failed to fetch organizations. Please try again later.'
      );
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of the list when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1); // Reset to first page when filters change
  };

  const toggleStatus = (status) => {
    setSelectedStatuses(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleFundRangeChange = (e, type) => {
    const value = parseInt(e.target.value, 10) || 0;
    setFundRange(prev => ({
      ...prev,
      [type]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setFundRange({ min: 0, max: 100000 });
    setSelectedStatuses([]);
    setCurrentPage(1); // Reset to first page when filters are reset
  };
  
  const handleSearchSubmit = () => {
    fetchOrganizations();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading organizations...</p>
            <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
          </div>
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      {/* Header with gradient background */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative rounded-xl bg-gradient-to-r from-indigo-700 to-purple-700 text-white p-8 mb-8 shadow-lg overflow-hidden"
      >
        {/* Abstract background shapes */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white transform translate-x-1/3 translate-y-1/3"></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <FaBuilding className="mr-3" />
              Organizations
            </h1>
            <p className="mt-2 text-indigo-100 max-w-xl">
              Support organizations making a difference in communities around the world.
              Browse, follow, and connect with causes that matter to you.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-xl shadow-md mb-8"
      >
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-opacity ${searchFocus ? 'text-indigo-500' : 'text-gray-400'}`}>
                <FaSearch className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit();
                  }
                }}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
                placeholder="Search organizations by name, mission, or location..."
                className={`block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all ${searchFocus ? 'border-indigo-500 ring-2 ring-indigo-200' : ''}`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {searchTerm && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      handleSearchSubmit();
                    }}
                    className="text-gray-400 hover:text-gray-600 mr-2"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={handleSearchSubmit}
                  className="text-indigo-500 hover:text-indigo-700"
                  title="Search"
                >
                  <FaSearch className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-3 border shadow-sm text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${
                  activeFiltersCount > 0 || showFilters 
                    ? 'border-indigo-500 text-indigo-700 bg-indigo-50 hover:bg-indigo-100' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <FaSlidersH className="mr-2" />
                Filters 
                {activeFiltersCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-indigo-100 bg-indigo-600 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
                <FaChevronDown className={`ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
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
                      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <FaTag className="mr-2 text-indigo-500" />
                        Categories
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {categoryOptions.map(category => (
                          <button
                            key={category}
                            onClick={() => toggleCategory(category)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              selectedCategories.includes(category)
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            {category}
                            {selectedCategories.includes(category) && (
                              <FaTimes className="ml-1 h-3 w-3" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Status Filter */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <FaLayerGroup className="mr-2 text-indigo-500" />
                        Status
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {statusOptions.map(status => (
                          <button
                            key={status.value}
                            onClick={() => toggleStatus(status.value)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              selectedStatuses.includes(status.value)
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            {status.label}
                            {selectedStatuses.includes(status.value) && (
                              <FaTimes className="ml-1 h-3 w-3" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Fund Range Filter */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <FaBullseye className="mr-2 text-indigo-500" />
                        Donation Target Range
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="min-fund" className="block text-xs text-gray-500 mb-1">
                            Minimum: ${fundRange.min.toLocaleString()}
                          </label>
                          <input
                            id="min-fund"
                            type="range"
                            min="0"
                            max="100000"
                            step="5000"
                            value={fundRange.min}
                            onChange={(e) => handleFundRangeChange(e, 'min')}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                        <div>
                          <label htmlFor="max-fund" className="block text-xs text-gray-500 mb-1">
                            Maximum: ${fundRange.max.toLocaleString()}
                          </label>
                          <input
                            id="max-fund"
                            type="range"
                            min="0"
                            max="100000"
                            step="5000"
                            value={fundRange.max}
                            onChange={(e) => handleFundRangeChange(e, 'max')}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={resetFilters}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                    >
                      <FaTimes className="mr-2" />
                      Reset All Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Results Count with Active Filters Display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            {totalItems} {totalItems === 1 ? 'Organization' : 'Organizations'} Found
            {searchTerm && <span className="ml-2 text-gray-500 text-base font-normal">for "{searchTerm}"</span>}
          </h2>
          
          {/* Active filters */}
          {activeFiltersCount > 0 && (
            <div className="mt-2 sm:mt-0 flex items-center text-sm text-gray-500">
              <span className="mr-2">Active Filters:</span>
              {selectedCategories.length > 0 && (
                <span className="mr-2">{selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'}</span>
              )}
              {selectedStatuses.length > 0 && (
                <span className="mr-2">{selectedStatuses.length} {selectedStatuses.length === 1 ? 'status' : 'statuses'}</span>
              )}
              {(fundRange.min > 0 || fundRange.max < 100000) && (
                <span>Custom fund range</span>
              )}
              <button 
                onClick={resetFilters}
                className="ml-2 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Organizations Grid */}
      {organizations.length > 0 ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {organizations.map((organization, index) => (
              <motion.div
                key={organization.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <OrganizationCard organization={organization} />
              </motion.div>
            ))}
          </motion.div>
          
          {/* Enhanced Pagination */}
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-lg rounded-xl p-8 text-center"
        >
          <div className="py-12">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FaBuilding className="h-12 w-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No organizations found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              {searchTerm || activeFiltersCount > 0
                ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                : 'Organizations will appear here once they are created.'}
            </p>
            
            {(searchTerm || activeFiltersCount > 0) && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <FaTimes className="mr-2" />
                  Clear All Filters
                </button>
                
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}