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
  FaLayerGroup,
  FaExternalLinkAlt,
  FaEye,
  FaExchangeAlt,
  FaSort,
  FaArrowUp,
  FaArrowDown,
  FaSortUp,
  FaSortDown
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
    itemsPerPage: 10 // Set to 10 results per page
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
  // Default to combined view to show all transactions and donations
  const [dataSource, setDataSource] = useState('combined');
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState({
    lastEndpoint: '',
    lastResponse: null,
    dataSourceType: ''
  });

  // Exchange rate state variables
  const [exchangeRates, setExchangeRates] = useState({
    ethToScroll: 1,    // 1 ETH = 1 SCROLL (initial value)
    usdToScroll: 1578.39, // 1 SCROLL = $1578.39 USD (initial value)
    myrToUsd: 4.2,     // 1 USD = 4.2 MYR (initial value)
  });
  const [loadingRates, setLoadingRates] = useState(false);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'desc'
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

  // Fetch conversion rates from API
  useEffect(() => {
    const fetchConversionRates = async () => {
      setLoadingRates(true);
      try {
        // Get base API URL from environment variables or use default
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        
        // Fetch USD rate for Scroll
        const usdResponse = await axios.get(`${API_BASE_URL}/scroll-conversion-rates?currency=USD`);
        
        // If successful, update the exchange rates
        if (usdResponse.data.success) {
          const scrollPriceUSD = usdResponse.data.data.scroll_price;
          
          // For simplicity, we'll assume ETH to Scroll is 1:1 (they're close in value)
          // In production, you'd want to fetch this from an API that compares both assets
          const ethToScrollRate = 1;
          
          // Update exchange rates state
          setExchangeRates({
            ethToScroll: ethToScrollRate,
            usdToScroll: scrollPriceUSD,
            myrToUsd: 4.2 // Using fixed rate for MYR
          });
        }
      } catch (error) {
        console.error('Failed to fetch conversion rates:', error);
        // Keep using default values if API call fails
      } finally {
        setLoadingRates(false);
      }
    };
    
    fetchConversionRates();
    
    // Refresh rates every 5 minutes
    const ratesInterval = setInterval(fetchConversionRates, 5 * 60 * 1000);
    
    return () => clearInterval(ratesInterval);
  }, []);

  // Function to refresh only the transaction data
  const refreshTransactionData = () => {
    setLoading(true);
    fetchTransactions();
  };

  useEffect(() => {
    // Calculate active filters count
    let filtersCount = 0;
    if (filters.status) filtersCount++;
    if (filters.dateRange.start || filters.dateRange.end) filtersCount++;
    if (filters.amountRange.min || filters.amountRange.max) filtersCount++;
    if (dataSource !== 'transactions') filtersCount++;

    setActiveFiltersCount(filtersCount);

    fetchTransactions();
  }, [pagination.currentPage, filters, viewType, charityId, dataSource]);

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
          // Use the donations endpoint directly
          endpoint = '/donations';
          setDebugInfo(prev => ({ ...prev, dataSourceType: 'donations-direct' }));
        } else if (dataSource === 'combined') {
          endpoint = '/api/transactions';
          setDebugInfo(prev => ({ ...prev, dataSourceType: 'combined' }));
        } else {
          endpoint = '/api/transactions';
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
      if (dataSource === 'combined') {
        // For combined view (global or charity-specific), use a consistent approach
        try {
          // First get transactions data
          const transactionsData = extractDataFromResponse(response.data);

          // Now fetch donations data
          const donationsEndpoint = charityId ? `/charities/${charityId}/donations` : '/donations';
          console.log(`Also fetching donations from: ${donationsEndpoint}`);

          // Use the same pagination parameters for both requests
          const donationsParams = new URLSearchParams({
            page: pagination.currentPage,
            per_page: pagination.itemsPerPage
          });

          const donationsResponse = await axios.get(donationsEndpoint, { params: donationsParams });
          console.log('Donations API Response:', donationsResponse.data);

          const donationsData = extractDataFromResponse(donationsResponse.data);

          // Process donations data to ensure it has the right format
          const processedDonations = donationsData.map(donation => {
            // Make sure each donation has a source field
            if (!donation.source) {
              donation.source = 'Donation';
            }
            return donation;
          });

          // Get total counts from both responses for accurate pagination
          const transactionsTotalItems = response.data.total || transactionsData.length;
          const donationsTotalItems = donationsResponse.data.total || donationsData.length;
          const totalItems = transactionsTotalItems + donationsTotalItems;

          // Calculate how many items to take from each source to maintain consistent pagination
          const itemsPerPage = pagination.itemsPerPage;
          const totalPages = Math.ceil(totalItems / itemsPerPage);

          console.log('Pagination info:', {
            transactionsTotalItems,
            donationsTotalItems,
            totalItems,
            itemsPerPage,
            totalPages,
            currentPage: pagination.currentPage
          });

          // Combine both datasets
          const combinedData = [...transactionsData, ...processedDonations];
          console.log(`Combined ${transactionsData.length} transactions with ${processedDonations.length} donations:`, combinedData);

          // Sort by date
          const sortedData = combinedData.sort((a, b) =>
            new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0)
          );

          // Take only the items for the current page
          const startIndex = 0;
          const endIndex = Math.min(sortedData.length, itemsPerPage);
          const paginatedData = sortedData.slice(startIndex, endIndex);

          setTransactions(paginatedData);

          // Update pagination with accurate counts
          setPagination(prev => ({
            ...prev,
            totalItems: totalItems,
            totalPages: totalPages,
          }));

          setLoading(false);
          return;
        } catch (combineError) {
          console.error('Error combining data sources:', combineError);
          // Fall back to just showing transactions if combining fails
          const responseData = extractDataFromResponse(response.data);
          setTransactions(responseData);
          updatePaginationFromResponse(response.data, responseData);
          setLoading(false);
          return;
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
      console.log('Extracted paginated data:', responseData.data.length, 'items');
      return responseData.data;
    }

    // Handle direct array response
    if (Array.isArray(responseData)) {
      console.log('Extracted array data:', responseData.length, 'items');
      return responseData;
    }

    // Try to find an array in the response object
    for (const key in responseData) {
      if (Array.isArray(responseData[key])) {
        console.log(`Extracted data from key '${key}':`, responseData[key].length, 'items');
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
    setDataSource('combined');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Add function for search submission
  const handleSearchSubmit = () => {
    fetchTransactions();
  };

  // Handle sorting when a column header is clicked
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    // Sort the transactions based on the selected key and direction
    const sortedTransactions = [...transactions].sort((a, b) => {
      // Handle different data types appropriately
      if (key === 'created_at') {
        return direction === 'asc'
          ? new Date(a.created_at || 0) - new Date(b.created_at || 0)
          : new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }

      if (key === 'amount') {
        return direction === 'asc'
          ? parseFloat(a.amount || 0) - parseFloat(b.amount || 0)
          : parseFloat(b.amount || 0) - parseFloat(a.amount || 0);
      }

      // For string comparisons (type, status, etc.)
      const aValue = a[key] || '';
      const bValue = b[key] || '';

      if (direction === 'asc') {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });

    setTransactions(sortedTransactions);
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

  // Add these helper functions for consistent transaction type formatting
  const getTypeClass = (item) => {
    // First check the source
    if (item.source === 'Donation' || item.source === 'donations') {
      // For donations source
      if (item.donation_type === 'subscription' || item.type === 'subscription') {
        return 'bg-blue-100 text-blue-800';
      } else if (item.donation_type === 'charity' || 
                 item.type === 'charity' || 
                 item.type === 'donation') {
        return 'bg-purple-100 text-purple-800';
      } else {
        return 'bg-purple-100 text-purple-800';
      }
    } else {
      // For transactions source (only fund releases)
      return 'bg-green-100 text-green-800';
    }
  };

  const getTypeIcon = (item) => {
    // Get the transaction type first
    const transactionType = getTypeLabel(item);
    
    // Then assign icons based on type
    switch (transactionType) {
      case 'Fund Release':
        return <FaMoneyBillWave className="mr-1.5" />;
      case 'Charity Donation':
      case 'Subscription Donation':
        return <FaHandHoldingHeart className="mr-1.5" />;
      default:
        return <FaExchangeAlt className="mr-1.5" />;
    }
  };

  const getTypeLabel = (item) => {
    // First check the source
    if (item.source === 'Donation' || item.source === 'donations') {
      // For donations source
      if (item.donation_type === 'subscription' || 
          item.type === 'subscription') {
        return 'Subscription Donation';
      } else if (item.donation_type === 'charity' || 
                 item.type === 'charity' || 
                 item.type === 'donation') {
        return 'Charity Donation';
      } else {
        return 'Donation';
      }
    } else {
      // For transactions source (only fund releases)
      return 'Fund Release';
    }
  };

  const formatAmount = (amount, currencyType) => {
    if (!amount) return '0.000';

    // Always format as SCROLL for consistency with donation form
    return `${parseFloat(amount).toFixed(3)} SCROLL`;
  };

  const getSourceLabel = (item) => {
    if (!item) return 'Unknown';

    // Explicitly check for donation source
    if (item.source === 'Donation') {
      return 'Donation';
    }

    // Check other source indicators
    if (item.source) {
      return item.source;
    } else if (item.is_blockchain) {
      return 'Blockchain';
    } else if (item.donor_message || item.cause_id || item.donor_id || item.currency_type) {
      return 'Donation';
    } else if (item.transaction_hash) {
      return 'Blockchain';
    } else {
      return 'Transaction';
    }
  };

  const getDetailsUrl = (item) => {
    if (!item) {
      console.warn('Cannot generate details URL for undefined item');
      return '/transactions';
    }

    // Check if this is a donation record
    if (item.source === 'Donation') {
      // Use the donation ID if available
      const donationId = item.id || (item.donation ? item.donation.id : null);
      if (donationId) {
        return `/donations/${donationId}`;
      }
    }

    // Handle blockchain transactions - use regular transaction URL with ID
    if (getSourceLabel(item).toLowerCase() === 'blockchain' && item.transaction_hash) {
      // Use the transaction ID if available, otherwise use the hash
      return `/transactions/${item.id || item.transaction_hash}`;
    }

    // Default to transaction details if we have an ID
    if (item.id) {
      return `/transactions/${item.id}`;
    }

    // Fallback
    console.warn('Could not determine details URL for item:', item);
    return '/transactions';
  };

  // Get the appropriate details button text based on item type
  const getDetailsButtonText = (item) => {
    // Check if this is a donation
    if (item.source === 'Donation') {
      return 'Donation';
    }

    // Check if this is a blockchain transaction
    if (getSourceLabel(item).toLowerCase() === 'blockchain' && item.transaction_hash) {
      return 'Transaction';
    }

    // Check for fund release transactions
    if (item.type === 'fund_release') {
      return 'Fund Transfer Details';
    }

    // Default
    return 'Transaction';
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
            {viewType === 'charity' ? 'Charity Transactions' : 'All Transactions'}
          </h1>
          <p className="mt-2 text-indigo-100 max-w-xl">
            {viewType === 'charity'
              ? 'View all financial transactions for this specific charity.'
              : 'Track all donation and verification transactions across the platform.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://coinmarketcap.com/currencies/ethereum/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm rounded-lg px-4 py-2 flex items-center hover:bg-opacity-30 transition-all duration-200"
            >
              <FaExchangeAlt className="text-white mr-2" />
              <span className="text-white font-medium">1 SCROLL ≈ ${exchangeRates.usdToScroll.toFixed(2)} USD ≈ RM{(exchangeRates.usdToScroll * exchangeRates.myrToUsd).toFixed(2)} MYR</span>
              <FaExternalLinkAlt className="text-white ml-2 h-3 w-3" />
            </a>
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
            {/* Search Input */}
            <div className="relative flex-1">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-opacity ${searchFocus ? 'text-indigo-500' : 'text-gray-400'}`}>
                <FaSearch className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit();
                  }
                }}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
                placeholder="Search transactions..."
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
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              {pagination.totalItems} {pagination.totalItems === 1 ? 'Transaction' : 'Transactions'} Found
              {searchTerm && <span className="ml-2 text-gray-500 text-base font-normal">for "{searchTerm}"</span>}
            </h2>
            <button
              onClick={refreshTransactionData}
              className={`ml-4 px-3 py-2 rounded-md transition-colors duration-200 flex items-center justify-center ${loading ? 'bg-gray-200 text-gray-600' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
              title="Refresh data"
              disabled={loading}
            >
              <FaSync className={`${loading ? "animate-spin" : ""} mr-1`} />
              <span className="text-sm">{loading ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>

          {/* Active filters removed for cleaner UI */}
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
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('created_at')}>
                      <span>Date</span>
                      {sortConfig.key === 'created_at' ? (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? 
                            <FaSortUp className="h-4 w-4 text-indigo-600" /> : 
                            <FaSortDown className="h-4 w-4 text-indigo-600" />}
                        </span>
                      ) : (
                        <FaSort className="ml-1 h-3 w-3 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('transaction_hash')}>
                      <span>Transaction Hash</span>
                      {sortConfig.key === 'transaction_hash' ? (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? 
                            <FaSortUp className="h-4 w-4 text-indigo-600" /> : 
                            <FaSortDown className="h-4 w-4 text-indigo-600" />}
                        </span>
                      ) : (
                        <FaSort className="ml-1 h-3 w-3 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('type')}>
                      <span>Type</span>
                      {sortConfig.key === 'type' ? (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? 
                            <FaSortUp className="h-4 w-4 text-indigo-600" /> : 
                            <FaSortDown className="h-4 w-4 text-indigo-600" />}
                        </span>
                      ) : (
                        <FaSort className="ml-1 h-3 w-3 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('amount')}>
                      <span>Amount</span>
                      {sortConfig.key === 'amount' ? (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? 
                            <FaSortUp className="h-4 w-4 text-indigo-600" /> : 
                            <FaSortDown className="h-4 w-4 text-indigo-600" />}
                        </span>
                      ) : (
                        <FaSort className="ml-1 h-3 w-3 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('status')}>
                      <span>Status</span>
                      {sortConfig.key === 'status' ? (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? 
                            <FaSortUp className="h-4 w-4 text-indigo-600" /> : 
                            <FaSortDown className="h-4 w-4 text-indigo-600" />}
                        </span>
                      ) : (
                        <FaSort className="ml-1 h-3 w-3 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('charity_id')}>
                      <span>Charity</span>
                      {sortConfig.key === 'charity_id' ? (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? 
                            <FaSortUp className="h-4 w-4 text-indigo-600" /> : 
                            <FaSortDown className="h-4 w-4 text-indigo-600" />}
                        </span>
                      ) : (
                        <FaSort className="ml-1 h-3 w-3 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
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
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() + ' ' + new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        {item.transaction_hash ? (
                          <div className="flex items-center">
                            <span className="mr-2">{item.transaction_hash.slice(0, 10)}...{item.transaction_hash.slice(-8)}</span>
                            <a
                              href="https://sepolia.scrollscan.com/address/0x7867fC939F10377E309a3BF55bfc194F672B0E84"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150 flex items-center"
                              title="View contract on Scrollscan"
                            >
                              <FaExternalLinkAlt className="h-3 w-3" />
                            </a>
                          </div>
                        ) : (item.id ? `ID: ${item.id}` : 'N/A')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeClass(item)}`}>
                          {getTypeIcon(item)}
                          {getTypeLabel(item)}
                        </span>
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
                        {item.charity ? (
                          <a
                            href={`/charities/${item.charity_id}`}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                          >
                            {item.charity.name || `Charity #${item.charity_id}`}
                          </a>
                        ) : item.charity_id ? (
                          <a
                            href={`/charities/${item.charity_id}`}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                          >
                            Charity #{item.charity_id}
                          </a>
                        ) : item.cause_id ? (
                          <a
                            href={`/charities/${item.cause_id}`}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                          >
                            Charity #{item.cause_id}
                          </a>
                        ) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              // Safely navigate to the details page based on item type
                              const detailsUrl = getDetailsUrl(item);
                              console.log('Navigating to:', detailsUrl);
                              navigate(detailsUrl);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150 flex items-center"
                          >
                            <FaEye className="mr-1" />
                            {getDetailsButtonText(item)}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-200 px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                </span>{' '}
                of <span className="font-medium">{pagination.totalItems}</span> transactions
              </div>
              
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Rows per page:</span>
                <select
                  value={pagination.itemsPerPage}
                  onChange={(e) => {
                    setPagination(prev => ({
                      ...prev,
                      itemsPerPage: Number(e.target.value),
                      currentPage: 1
                    }));
                  }}
                  className="border border-gray-300 rounded px-3 py-1 text-sm min-w-[80px]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
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
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

    </motion.div>
  );
}
