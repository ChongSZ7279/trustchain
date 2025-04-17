import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUser,
  FaBuilding,
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaSync,
  FaHistory,
  FaHandHoldingHeart,
  FaGlobe,
  FaTimes,
  FaSlidersH,
  FaChevronDown,
  FaLayerGroup
} from 'react-icons/fa';
import Pagination from './Pagination';

export default function TransactionList() {
  const navigate = useNavigate();
  const { charityId } = useParams();
  const { currentUser, accountType } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewType, setViewType] = useState(charityId ? 'charity' : 'system');
  // No authentication check needed - transactions are now public
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [filters, setFilters] = useState({
    status: '',
    dateRange: {
      start: '',
      end: ''
    },
    amountRange: {
      min: '',
      max: ''
    }
  });
  const [dataSource, setDataSource] = useState('transactions');
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState({
    lastEndpoint: '',
    lastResponse: null,
    dataSourceType: ''
  });

  // Status options for filter
  const statusOptions = [
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' }
  ];

  // Data source options
  const dataSourceOptions = [
    { value: 'transactions', label: 'Transactions' },
    { value: 'donations', label: 'Donations' },
    { value: 'combined', label: 'All' }
  ];

  useEffect(() => {
    // Calculate active filters count
    let filtersCount = 0;
    if (filters.status) filtersCount++;
    if (filters.dateRange.start || filters.dateRange.end) filtersCount++;
    if (filters.amountRange.min || filters.amountRange.max) filtersCount++;
    if (dataSource !== 'transactions') filtersCount++;

    setActiveFiltersCount(filtersCount);

    fetchTransactions();
  }, [pagination.currentPage, searchTerm, filters, viewType, charityId, dataSource]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create query parameters object with only non-empty values
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        per_page: pagination.itemsPerPage
      });

      // Only add search term if it's not empty
      if (searchTerm.trim()) {
        queryParams.append('search', searchTerm.trim());
      }

      // Only add status if it's not empty
      if (filters.status) {
        queryParams.append('status', filters.status);
      }

      // Only add date range if either start or end is not empty
      if (filters.dateRange.start || filters.dateRange.end) {
        queryParams.append('dateRange[start]', filters.dateRange.start);
        queryParams.append('dateRange[end]', filters.dateRange.end);
      }

      // Only add amount range if either min or max is not empty
      if (filters.amountRange.min || filters.amountRange.max) {
        queryParams.append('amountRange[min]', filters.amountRange.min);
        queryParams.append('amountRange[max]', filters.amountRange.max);
      }

      // Fix the source parameter - we're getting a 405 error when we append the source=donations
      // So let's only add this for non-donation endpoints
      if (dataSource !== 'donations') {
        queryParams.append('source', dataSource);
      }

      // Determine the appropriate endpoint based on the data source and context
      let endpoint;

      if (charityId) {
        // Charity-specific endpoints
        if (dataSource === 'donations') {
          // For donations, use the standard charities/:id/donations endpoint
          endpoint = `/charities/${charityId}/donations`;
        } else if (dataSource === 'combined') {
          endpoint = `/charities/${charityId}/transactions`;
          setDebugInfo(prev => ({ ...prev, dataSourceType: 'combined' }));
        } else {
          endpoint = `/charities/${charityId}/transactions`;
          setDebugInfo(prev => ({ ...prev, dataSourceType: 'transactions' }));
        }
      } else {
        // General endpoints - this is where we're seeing the 405 error
        if (dataSource === 'donations') {
          // Try using a different endpoint or method to get donations
          // Option 1: Use transactions endpoint with a type filter
          endpoint = '/transactions';
          queryParams.append('type', 'donation');
          setDebugInfo(prev => ({ ...prev, dataSourceType: 'donations-via-transactions' }));
        } else if (dataSource === 'combined') {
          endpoint = '/transactions';
          setDebugInfo(prev => ({ ...prev, dataSourceType: 'combined' }));
        } else {
          endpoint = '/transactions';
          setDebugInfo(prev => ({ ...prev, dataSourceType: 'transactions' }));
        }
      }

      // Store the last endpoint for debugging
      setDebugInfo(prev => ({ ...prev, lastEndpoint: endpoint }));

      console.log(`Fetching data from endpoint: ${endpoint} with params:`, Object.fromEntries(queryParams));

      const response = await axios.get(endpoint, { params: queryParams });
      console.log('API Response:', response.data);

      // Store the response for debugging
      setDebugInfo(prev => ({ ...prev, lastResponse: response.data }));

      // Special handling for combined data source
      if (dataSource === 'combined' && !charityId) {
        // For global combined view without a charity ID, we'll just show transactions
        // since we're getting a 405 error when trying to access donations endpoint
        console.log('Using transactions data for combined view due to API limitations');
        const responseData = extractDataFromResponse(response.data);
        setTransactions(responseData);
        updatePaginationFromResponse(response.data, responseData);
        setLoading(false);
        return;
      } else if (dataSource === 'combined' && charityId) {
        try {
          // If we need to manually combine data from multiple sources
          const transactionsData = extractDataFromResponse(response.data);

          // Now fetch donations data
          const donationsEndpoint = `/charities/${charityId}/donations`;

          console.log(`Also fetching donations from: ${donationsEndpoint}`);
          // Don't pass the source parameter to donations endpoint
          const donationsParams = new URLSearchParams({
            page: pagination.currentPage,
            per_page: pagination.itemsPerPage
          });

          const donationsResponse = await axios.get(donationsEndpoint, { params: donationsParams });
          console.log('Donations API Response:', donationsResponse.data);

          const donationsData = extractDataFromResponse(donationsResponse.data);

          // Combine both datasets
          const combinedData = [...transactionsData, ...donationsData];
          console.log(`Combined ${transactionsData.length} transactions with ${donationsData.length} donations:`, combinedData);

          // Sort by date
          const sortedData = combinedData.sort((a, b) =>
            new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0)
          );

          setTransactions(sortedData);

          // Update pagination manually
          setPagination(prev => ({
            ...prev,
            totalItems: sortedData.length,
            totalPages: Math.ceil(sortedData.length / prev.itemsPerPage),
          }));

          setLoading(false);
          return;
        } catch (combineError) {
          console.error('Error combining data sources:', combineError);
          // Fall through to normal processing if combining fails
        }
      }

      // Normal processing for non-combined data sources
      // Improved data extraction with helper function
      const responseData = extractDataFromResponse(response.data);

      // Set the data
      setTransactions(responseData);

      // Update pagination if the response includes pagination data
      updatePaginationFromResponse(response.data, responseData);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        setError(`Failed to load data: ${err.response.status} ${err.response.statusText}`);

        // Special handling for 405 Method Not Allowed errors
        if (err.response.status === 405) {
          setError('The API endpoint does not support this request. Try a different filter option.');
        }
      } else if (err.request) {
        setError('Failed to load data: No response from server');
      } else {
        setError(`Failed to load data: ${err.message}`);
      }
      setLoading(false);
    }
  };

  // Helper function to extract data from API response
  const extractDataFromResponse = (responseData) => {
    if (!responseData) return [];

    // Handle paginated response
    if (responseData.data && Array.isArray(responseData.data)) {
      return responseData.data;
    }

    // Handle direct array response
    if (Array.isArray(responseData)) {
      return responseData;
    }

    // Try to find an array in the response object
    for (const key in responseData) {
      if (Array.isArray(responseData[key])) {
        return responseData[key];
      }
    }

    console.error('Could not extract data from response:', responseData);
    return [];
  };

  // Helper function to update pagination from response
  const updatePaginationFromResponse = (response, extractedData) => {
    if (response.meta) {
      setPagination({
        currentPage: response.meta.current_page,
        totalPages: response.meta.last_page,
        totalItems: response.meta.total,
        itemsPerPage: response.meta.per_page
      });
    } else if (response.current_page) {
      setPagination({
        currentPage: response.current_page,
        totalPages: response.last_page,
        totalItems: response.total,
        itemsPerPage: response.per_page
      });
    } else {
      // If no pagination data, set the total items to the length of the data
      setPagination(prev => ({
        ...prev,
        totalItems: extractedData.length,
        totalPages: Math.ceil(extractedData.length / prev.itemsPerPage),
      }));
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    // Scroll to top of the list when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    // For nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFilters(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }

    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      status: '',
      dateRange: {
        start: '',
        end: ''
      },
      amountRange: {
        min: '',
        max: ''
      }
    });
    setDataSource('transactions');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchTransactions();
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';

    switch (status.toLowerCase()) {
      case 'completed':
      case 'confirmed':
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return null;

    switch (status.toLowerCase()) {
      case 'completed':
      case 'confirmed':
      case 'verified':
        return <FaCheckCircle className="mr-1.5 text-green-500" />;
      case 'pending':
        return <FaExclamationCircle className="mr-1.5 text-yellow-500" />;
      case 'failed':
        return <FaExclamationCircle className="mr-1.5 text-red-500" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (item) => {
    if (item.type) {
      return item.type.charAt(0).toUpperCase() + item.type.slice(1);
    } else if (item.task_proof) {
      return 'Task';
    } else if (item.donor_message || item.cause_id) {
      return 'Donation';
    } else {
      return 'Transaction';
    }
  };

  const formatAmount = (amount, currencyType) => {
    if (!amount) return '$0.00';

    const formattedAmount = `$${parseFloat(amount).toFixed(2)}`;
    return currencyType ? `${formattedAmount} (${currencyType})` : formattedAmount;
  };

  const getSourceLabel = (item) => {
    if (!item) return 'Unknown';

    if (item.source) {
      return item.source;
    } else if (item.is_blockchain) {
      return 'Blockchain';
    } else if (item.donor_message || item.cause_id || item.donor_id) {
      return 'Donation';
    } else if (item.transaction_hash) {
      return 'Blockchain';
    } else {
      return 'Transaction';
    }
  };

  const getDetailsUrl = (item) => {
    if (!item || !item.id) {
      console.warn('Cannot generate details URL for item:', item);
      return '/transactions';
    }

    const sourceType = getSourceLabel(item).toLowerCase();

    // Handle special cases
    if (sourceType === 'blockchain') {
      return `/blockchain-transactions/${item.id}`;
    } else if (sourceType === 'donation') {
      return `/donations/${item.id}`;
    } else {
      return `/transactions/${item.id}`;
    }
  };

  // Add a debug panel that only shows in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

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
            <p className="text-gray-600 font-medium">Loading transactions...</p>
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
          <p className="text-gray-600 mb-6">We couldn't load the transactions. Please try again.</p>
          <button
            onClick={fetchTransactions}
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

        <div className="relative z-10">
          <h1 className="text-3xl font-bold flex items-center">
            <FaHistory className="mr-3" />
            Transactions
          </h1>
          <p className="mt-2 text-indigo-100 max-w-xl">
            {viewType === 'charity'
              ? 'View and manage charity-specific financial transactions.'
              : 'Track all transaction activities across the platform.'}
          </p>
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
            {/* Search Input */}
            <div className="relative flex-1">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-opacity ${searchFocus ? 'text-indigo-500' : 'text-gray-400'}`}>
                <FaSearch className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
                placeholder="Search transactions..."
                className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all ${searchFocus ? 'border-indigo-500 ring-2 ring-indigo-200' : ''}`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
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
                    {/* Data Source Filter */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <FaLayerGroup className="mr-2 text-indigo-500" />
                        Data Source
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {dataSourceOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => setDataSource(option.value)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              dataSource === option.value
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <FaCheckCircle className="mr-2 text-indigo-500" />
                        Status
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {statusOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => setFilters(prev => ({ ...prev, status: prev.status === option.value ? '' : option.value }))}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              filters.status === option.value
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            {option.label}
                            {filters.status === option.value && (
                              <FaTimes className="ml-1 h-3 w-3" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date Range Filter */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <FaCalendarAlt className="mr-2 text-indigo-500" />
                        Date Range
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">From</label>
                          <input
                            type="date"
                            name="dateRange.start"
                            value={filters.dateRange.start}
                            onChange={handleFilterChange}
                            className="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">To</label>
                          <input
                            type="date"
                            name="dateRange.end"
                            value={filters.dateRange.end}
                            onChange={handleFilterChange}
                            className="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
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
            {pagination.totalItems} {pagination.totalItems === 1 ? 'Transaction' : 'Transactions'} Found
            {searchTerm && <span className="ml-2 text-gray-500 text-base font-normal">for "{searchTerm}"</span>}
          </h2>

          {/* Active filters */}
          {activeFiltersCount > 0 && (
            <div className="mt-2 sm:mt-0 flex items-center text-sm text-gray-500">
              <span className="mr-2">Active Filters:</span>
              {filters.status && (
                <span className="mr-2">Status: {filters.status}</span>
              )}
              {(filters.dateRange.start || filters.dateRange.end) && (
                <span className="mr-2">Date range</span>
              )}
              {dataSource !== 'transactions' && (
                <span className="mr-2">Source: {dataSource}</span>
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

      {/* Transactions Grid */}
      {transactions && transactions.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-md rounded-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((item, index) => {
                  // Check if item is valid before rendering
                  if (!item || typeof item !== 'object') {
                    console.warn('Invalid transaction item:', item);
                    return null;
                  }

                  // Debug log to help track issues
                  console.log(`Rendering transaction ${index}:`, item);

                  // Generate a unique key that won't cause React warnings
                  const itemKey = item.id || item.transaction_hash || item.transaction_id || `transaction-${index}`;

                  return (
                    <motion.tr
                      key={itemKey}
                      className="hover:bg-gray-50 transition-colors duration-150"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        {item.transaction_hash ? item.transaction_hash.slice(0, 8) : item.id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getTypeLabel(item)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatAmount(item.amount, item.currency_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          {item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1)) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getSourceLabel(item)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            // Safely navigate to the details page based on item type
                            const detailsUrl = getDetailsUrl(item);
                            console.log('Navigating to:', detailsUrl);
                            navigate(detailsUrl);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                        >
                          View Details
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-200 px-4 py-3">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-lg rounded-xl p-8 text-center"
        >
          <div className="py-12">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FaHistory className="h-12 w-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Transactions Found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              {searchTerm || activeFiltersCount > 0
                ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                : 'Transactions will appear here once they are created.'}
            </p>

            {(searchTerm || activeFiltersCount > 0) && (
              <div className="flex justify-center">
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
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