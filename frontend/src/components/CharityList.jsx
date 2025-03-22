import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { formatImageUrl } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHandHoldingHeart,
  FaPlus,
  FaMoneyBillWave,
  FaTag,
  FaCalendarAlt,
  FaChartBar,
  FaExternalLinkAlt,
  FaEdit,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHeart,
  FaUsers,
  FaSearch,
  FaFilter,
  FaTimes,
  FaSync
} from 'react-icons/fa';
import CharityCard from './CharityCard';
import Pagination from './Pagination';

export default function CharityList() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { organization } = useAuth();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
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
    fetchCharities();
  }, [currentPage, searchTerm, selectedCategories, selectedStatuses, fundRange]);

  const fetchCharities = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 12
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
      
      console.log('Fetching charities with params:', params.toString());
      
      // Make API call with filters
      const response = await axios.get(`/charities?${params.toString()}`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Charities response:', response.data);
      setCharities(response.data.data);
      setTotalPages(response.data.last_page);
      setTotalItems(response.data.total);
    } catch (err) {
      console.error('Error fetching charities:', err);
      
      // More detailed error logging
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
        
        setError(`Failed to fetch charities: ${err.response.status} ${err.response.statusText}`);
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('Failed to fetch charities: No response from server');
      } else {
        console.error('Error message:', err.message);
        setError(`Failed to fetch charities: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
          <p className="text-gray-600 mb-6">We couldn't load the charities. Please try again.</p>
          <button
            onClick={fetchCharities}
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
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaHandHoldingHeart className="mr-3 text-indigo-600" />
            Charities
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Support charitable causes and make a difference in the community
          </p>
        </div>
        {organization && (
          <Link
            to="/charities/create"
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors duration-200"
          >
            <FaPlus className="mr-2" />
            Create Charity
          </Link>
        )}
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when search changes
              }}
              placeholder="Search charities..."
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
            
            {(selectedCategories.length > 0 || selectedStatuses.length > 0 || searchTerm) && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <FaTimes className="mr-2" />
                Clear
              </button>
            )}
          </div>
        </div>
        
        {/* Expandable Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Categories */}
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
                  
                  {/* Status */}
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

                  {/* Fund Range */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Fund Range</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="min-fund" className="block text-xs text-gray-500">
                          Min: ${fundRange.min}
                        </label>
                        <input
                          id="min-fund"
                          type="range"
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
                          id="max-fund"
                          type="range"
                          min="0"
                          max="100000"
                          step="1000"
                          value={fundRange.max}
                          onChange={(e) => handleFundRangeChange(e, 'max')}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Results Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <h2 className="text-xl font-bold text-gray-900">
          {totalItems} {totalItems === 1 ? 'Charity' : 'Charities'} Found
        </h2>
      </motion.div>

      {/* Charities Grid */}
      {charities.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {charities.map((charity, index) => (
              <motion.div
                key={charity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-white overflow-hidden shadow-sm hover:shadow-lg rounded-xl transition-all duration-200"
              >
                <CharityCard charity={charity} />
              </motion.div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-full bg-white shadow-lg rounded-xl p-8"
        >
          <div className="text-center py-8">
            <FaHandHoldingHeart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No charities found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm || selectedCategories.length > 0 || selectedStatuses.length > 0
                ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                : 'Charities will appear here once they are created.'}
            </p>
            
            {(searchTerm || selectedCategories.length > 0 || selectedStatuses.length > 0) && (
              <button
                onClick={resetFilters}
                className="mt-6 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <FaTimes className="mr-2" />
                Clear Filters
              </button>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}