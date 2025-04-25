import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaExchangeAlt,
  FaHandHoldingHeart,
  FaMoneyBillWave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaFilter,
  FaExternalLinkAlt,
  FaEye,
  FaChartBar,
  FaCoins,
  FaGlobe,
  FaSearch,
  FaCalendarAlt,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const CharityTransactions = ({ charityId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalFundReleases: 0,
    totalTransactions: 0,
    verifiedTransactions: 0,
    donorCount: 0 // Add donor count to stats
  });

  // Fetch transactions when component mounts or when filters change
  useEffect(() => {
    const fetchTransactionsAndDonations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Always fetch both data sources regardless of filter
        // We'll apply the filter afterward
        const transactionsUrl = `/api/charities/${charityId}/transactions`;
        const donationsUrl = `/charities/${charityId}/donations`;
        
        console.log(`Fetching transactions from: ${transactionsUrl}`);
        console.log(`Fetching donations from: ${donationsUrl}`);

        // Make the API calls
        const [transactionsResponse, donationsResponse] = await Promise.all([
          axios.get(transactionsUrl),
          axios.get(donationsUrl)
        ]);

        // Extract data from responses
        const transactionsData = transactionsResponse.data.data || transactionsResponse.data || [];
        const donationsData = donationsResponse.data.data || donationsResponse.data || [];

        console.log('Transactions data:', transactionsData);
        console.log('Donations data:', donationsData);

        // Format donations data to match transaction structure
        const formattedDonations = donationsData.map(donation => ({
          ...donation,
          source: 'donations',
          // Use the donation_type if available, otherwise default to 'charity'
          type: donation.donation_type || 'charity', 
          currency_type: donation.currency_type || 'SCROLL'
        }));

        // Mark transactions with their source and ensure they are fund_release type
        const formattedTransactions = transactionsData.map(tx => ({
          ...tx,
          source: 'transactions',
          // Ensure all transactions are of type fund_release
          type: tx.type || 'fund_release'
        }));

        // Calculate donor count from donations
        const donorCount = calculateDonorCount(donationsData);

        // Combine data and apply filters based on filterType
        let combinedData = [];
        
        if (filterType === 'all') {
          combinedData = [...formattedDonations, ...formattedTransactions];
        } else if (filterType === 'donations') {
          // Only include records from the donations table
          combinedData = [...formattedDonations];
        } else if (filterType === 'fund_releases') {
          // Only include records from the transactions table
          combinedData = [...formattedTransactions];
        }

        // Calculate statistics - keep original calculation logic
        const totalDonations = formattedDonations.reduce((sum, tx) => {
          return sum + parseFloat(tx.amount || 0);
        }, 0);
        
        const totalFundReleases = formattedTransactions.reduce((sum, tx) => {
          return sum + parseFloat(tx.amount || 0);
        }, 0);
        
        const verifiedTransactions = [...formattedDonations, ...formattedTransactions].filter(
          tx => tx.status === 'verified' || tx.status === 'completed'
        ).length;
        
        // Update stats
        setStats({
          totalDonations: totalDonations,
          totalFundReleases: totalFundReleases,
          totalTransactions: formattedDonations.length + formattedTransactions.length,
          verifiedTransactions: verifiedTransactions,
          donorCount: donorCount
        });

        // Apply search filter if needed
        if (searchTerm) {
          combinedData = combinedData.filter(tx => {
            const searchLower = searchTerm.toLowerCase();
            return (
              (tx.transaction_hash && tx.transaction_hash.toLowerCase().includes(searchLower)) ||
              (tx.donor && tx.donor.toLowerCase().includes(searchLower)) ||
              (tx.description && tx.description.toLowerCase().includes(searchLower))
            );
          });
        }

        // Apply sorting
        combinedData.sort((a, b) => {
          if (sortField === 'amount') {
            return sortDirection === 'asc'
              ? parseFloat(a.amount || 0) - parseFloat(b.amount || 0)
              : parseFloat(b.amount || 0) - parseFloat(a.amount || 0);
          } else if (sortField === 'created_at') {
            return sortDirection === 'asc'
              ? new Date(a.created_at || 0) - new Date(b.created_at || 0)
              : new Date(b.created_at || 0) - new Date(a.created_at || 0);
          }
          return 0;
        });

        // Set total items for pagination
        setTotalItems(combinedData.length);
        
        // Calculate pagination
        const totalPages = Math.ceil(combinedData.length / itemsPerPage);
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        
        // Get current items for display
        const paginatedData = combinedData.slice(indexOfFirstItem, indexOfLastItem);

        // Update transactions state with paginated data
        setTransactions(paginatedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions. Please try again.');
        setLoading(false);
      }
    };

    fetchTransactionsAndDonations();
  }, [charityId, filterType, searchTerm, sortField, sortDirection, currentPage, itemsPerPage]);

  const handleRefresh = async () => {
    try {
      await fetchTransactionsAndDonations();
      toast.success('Transactions refreshed!');
    } catch (err) {
      toast.error('Failed to refresh transactions');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get appropriate label for transaction type
  const getTypeLabel = (type, transaction) => {
    // First check the source
    if (transaction.source === 'donations') {
      // For donations source
      switch (type) {
        case 'charity':
          return 'Charity Donation';
        case 'subscription':
          return 'Subscription Donation';
        default:
          return 'Donation';
      }
    } else {
      // For transactions source 
      return 'Fund Release';
    }
  };

  const getTypeClass = (type, transaction) => {
    // First check the source
    if (transaction.source === 'donations') {
      // For donations source
      switch (type) {
        case 'charity':
          return 'bg-purple-100 text-purple-800';
        case 'subscription':
          return 'bg-blue-100 text-blue-800';
        default:
          return 'bg-purple-100 text-purple-800';
      }
    } else {
      // For transactions source (only fund releases)
      return 'bg-green-100 text-green-800';
    }
  };

  const getTypeIcon = (type, transaction) => {
    // First check the source
    if (transaction.source === 'donations') {
      // For donations source (all types use donation icon)
      return <FaHandHoldingHeart />;
    } else {
      // For transactions source (only fund releases)
      return <FaMoneyBillWave />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
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
    switch (status) {
      case 'completed':
      case 'verified':
        return <FaCheckCircle />;
      case 'pending':
        return <FaClock />;
      case 'failed':
        return <FaExclamationTriangle />;
      default:
        return null;
    }
  };

  // Format date in a user-friendly way
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format transaction hash for display
  const formatTransactionHash = (hash) => {
    if (!hash) return 'N/A';
    if (hash.startsWith('0x')) {
      return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
    }
    return hash;
  };

  // Determine if the transaction has blockchain verification
  const isBlockchainVerified = (tx) => {
    return !!tx.transaction_hash || tx.is_blockchain || (tx.type && tx.type.includes('blockchain'));
  };

  // Format amount with currency symbol
  const formatAmount = (amount, currencyType = 'SCROLL') => {
    if (amount === null || amount === undefined) return '0 SCROLL';
    
    // Convert amount to number if it's a string
    const amountNumber = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Always format as SCROLL for consistency with donation form
    return `${amountNumber.toFixed(3)} SCROLL`;
  };

  // Calculate donor count separately
  const calculateDonorCount = (donationsData) => {
    // Extract unique donor IDs from donations
    const uniqueDonors = new Set();
    donationsData.forEach(donation => {
      if (donation.user_id) {
        uniqueDonors.add(donation.user_id);
      }
    });
    return uniqueDonors.size;
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Calculate totalPages from totalItems and itemsPerPage
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="overflow-hidden">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-xl p-4 shadow-sm border border-green-100">
          <div className="flex items-center mb-2">
            <div className="p-2 bg-green-100 rounded-full mr-3">
              <FaHandHoldingHeart className="text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-700">Total Donations</h3>
          </div>
          <div className="ml-12">
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalDonations.toFixed(3)}
            </p>
            <p className="text-xl font-semibold text-indigo-700">
              SCROLL
            </p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-100">
          <div className="flex items-center mb-2">
            <div className="p-2 bg-blue-100 rounded-full mr-3">
              <FaExchangeAlt className="text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-700">Fund Releases</h3>
          </div>
          <div className="ml-12">
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalFundReleases.toFixed(3)}
            </p>
            <p className="text-xl font-semibold text-indigo-700">
              SCROLL
            </p>
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl p-4 shadow-sm border border-purple-100">
          <div className="flex items-center mb-2">
            <div className="p-2 bg-purple-100 rounded-full mr-3">
              <FaChartBar className="text-purple-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-700">Total Transactions</h3>
          </div>
          <div className="ml-12">
            <p className="text-2xl font-bold text-gray-900">
                {stats.totalTransactions}
              </p>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-xl p-4 shadow-sm border border-indigo-100">
          <div className="flex items-center mb-2">
            <div className="p-2 bg-indigo-100 rounded-full mr-3">
              <FaGlobe className="text-indigo-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-700">Unique Donors</h3>
          </div>
          <div className="ml-12">
            <p className="text-2xl font-bold text-gray-900">
                {stats.donorCount}
              </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="text-gray-700 mr-3">
            <FaFilter />
          </div>
          <span className="text-gray-700 font-medium mr-3">Filter:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-md text-sm ${
                filterType === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('donations')}
              className={`px-4 py-2 rounded-md text-sm ${
                filterType === 'donations'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Donations Only
            </button>
            <button
              onClick={() => handleFilterChange('fund_releases')}
              className={`px-4 py-2 rounded-md text-sm ${
                filterType === 'fund_releases'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Fund Releases
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search transactions..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <button 
            onClick={handleRefresh}
            className="bg-indigo-100 text-indigo-700 p-2 rounded-lg hover:bg-indigo-200 transition-colors"
            title="Refresh transactions"
          >
            <FaSyncAlt />
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-1" />
                    DATE
                    {sortField === 'created_at' ? (
                      sortDirection === 'asc' ? 
                        <FaSortUp className="ml-1 h-4 w-4 text-indigo-600" /> : 
                        <FaSortDown className="ml-1 h-4 w-4 text-indigo-600" />
                    ) : (
                      <FaSort className="ml-1 h-3 w-3 text-gray-400" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TRANSACTION HASH
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TYPE
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SOURCE
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center">
                    <FaCoins className="mr-1" />
                    AMOUNT
                    {sortField === 'amount' ? (
                      sortDirection === 'asc' ? 
                        <FaSortUp className="ml-1 h-4 w-4 text-indigo-600" /> : 
                        <FaSortDown className="ml-1 h-4 w-4 text-indigo-600" />
                    ) : (
                      <FaSort className="ml-1 h-3 w-3 text-gray-400" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                    <span className="ml-2 text-gray-600">Loading transactions...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id || tx.transaction_hash} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(tx.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-indigo-600">
                    {tx.transaction_hash ? (
                      <div className="flex items-center">
                        {formatTransactionHash(tx.transaction_hash)}
                        {isBlockchainVerified(tx) && (
                        <a
                            href={`https://sepolia.scrollscan.com/tx/${tx.transaction_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                            className="ml-2 text-indigo-500 hover:text-indigo-700"
                            title="View on Scrollscan"
                        >
                            <FaExternalLinkAlt />
                        </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">ID: {tx.id || 'Unknown'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeClass(tx.type, tx)}`}
                    >
                      <span className="mr-1">{getTypeIcon(tx.type, tx)}</span>
                      {getTypeLabel(tx.type, tx)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.source === 'donations' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {tx.source === 'donations' ? 'Donations' : 'Transactions'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatAmount(tx.amount, tx.currency_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(tx.status)}`}
                    >
                      <span className="mr-1">{getStatusIcon(tx.status)}</span>
                      {tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tx.transaction_hash && (
                        <a
                        href={`https://sepolia.scrollscan.com/tx/${tx.transaction_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        >
                        <FaEye className="mr-1" />
                          Explorer
                        </a>
                      )}
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && transactions.length > 0 && (
          <div className="flex justify-between items-center mt-4 px-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{currentPage * itemsPerPage - itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, totalItems)}
              </span>{' '}
              of <span className="font-medium">{totalItems}</span> transactions
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
              >
                <FaChevronLeft />
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Logic to show appropriate page numbers
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
              >
                <FaChevronRight />
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Rows per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        )}
    </div>
  );
};

export default CharityTransactions;
