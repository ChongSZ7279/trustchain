import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
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
  FaGlobe
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
  const [showFilters, setShowFilters] = useState(false);
  const [viewType, setViewType] = useState(charityId ? 'charity' : 'system');
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

      // Add data source parameter to fetch combined data
      queryParams.append('source', dataSource);

      // Determine the appropriate endpoint based on the data source and context
      let endpoint;
      
      if (charityId) {
        // Charity-specific endpoints
        if (dataSource === 'donations') {
          endpoint = `/charities/${charityId}/donations`;
        } else if (dataSource === 'combined') {
          endpoint = `/charities/${charityId}/financial-activities`;
        } else {
          endpoint = `/charities/${charityId}/transactions`;
        }
      } else {
        // General endpoints
        if (dataSource === 'donations') {
          endpoint = '/donations';
        } else if (dataSource === 'combined') {
          endpoint = '/financial-activities';
        } else {
          endpoint = '/transactions';
        }
      }

      console.log(`Fetching data from endpoint: ${endpoint} with params:`, Object.fromEntries(queryParams));
      
      const response = await axios.get(endpoint, { params: queryParams });
      console.log('API Response:', response.data);
      
      setTransactions(response.data.data || response.data);
      
      // Update pagination if the response includes pagination data
      if (response.data.meta) {
        setPagination({
          currentPage: response.data.meta.current_page,
          totalPages: response.data.meta.last_page,
          totalItems: response.data.meta.total,
          itemsPerPage: response.data.meta.per_page
        });
      } else if (response.data.current_page) {
        setPagination({
          currentPage: response.data.current_page,
          totalPages: response.data.last_page,
          totalItems: response.data.total,
          itemsPerPage: response.data.per_page
        });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [pagination.currentPage, searchTerm, filters, viewType, charityId, dataSource]);

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
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
        return <FaCheckCircle className="text-green-500" />;
      case 'pending':
        return <FaExclamationCircle className="text-yellow-500" />;
      case 'failed':
        return <FaExclamationCircle className="text-red-500" />;
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
    if (item.source) {
      return item.source;
    } else if (item.donor_message || item.cause_id) {
      return 'Donation';
    } else {
      return 'Transaction';
    }
  };

  const getDetailsUrl = (item) => {
    const sourceType = getSourceLabel(item).toLowerCase();
    return `/${sourceType}s/${item.id}`;
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
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaHistory className="mr-3 text-indigo-600" />
            Transactions
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {viewType === 'charity' ? 'View charity-specific transactions' : 'View all system transactions'}
          </p>
        </div>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-xl shadow-sm mb-8 p-4"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <FaFilter className="mr-2" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Data Source Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Source
                </label>
                <select
                  value={dataSource}
                  onChange={(e) => setDataSource(e.target.value)}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="transactions">Transactions</option>
                  <option value="donations">Donations</option>
                  <option value="combined">Combined</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    name="dateRange.start"
                    value={filters.dateRange.start}
                    onChange={handleFilterChange}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <input
                    type="date"
                    name="dateRange.end"
                    value={filters.dateRange.end}
                    onChange={handleFilterChange}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Transactions Grid */}
      {transactions && transactions.length > 0 ? (
        <>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
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
                  {transactions.map((item) => (
                    <tr key={`${getSourceLabel(item)}-${item.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.created_at || item.completed_at || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        {item.transaction_hash?.slice(0, 8) || item.id}
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
                          {item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getSourceLabel(item)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => navigate(getDetailsUrl(item))}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-8">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <FaHistory className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
          <p className="text-gray-600">Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}
    </motion.div>
  );
} 