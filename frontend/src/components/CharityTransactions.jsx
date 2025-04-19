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
  FaSortDown
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
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalFundReleases: 0,
    totalTransactions: 0,
    verifiedTransactions: 0
  });

  // Fetch transactions when component mounts or when filters change
  useEffect(() => {
    const fetchTransactionsAndDonations = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const params = new URLSearchParams();
        if (filterType !== 'all') {
          params.append('type', filterType);
        }

        // Fetch transactions
        const transactionsUrl = `/charities/${charityId}/transactions${params.toString() ? `?${params.toString()}` : ''}`;
        console.log(`Fetching transactions from: ${transactionsUrl}`);

        // Fetch donations
        const donationsUrl = `/charities/${charityId}/donations`;
        console.log(`Fetching donations from: ${donationsUrl}`);

        // Make both requests in parallel
        const [transactionsResponse, donationsResponse] = await Promise.all([
          axios.get(transactionsUrl),
          axios.get(donationsUrl)
        ]);

        console.log('Transactions response:', transactionsResponse.data);
        console.log('Donations response:', donationsResponse.data);

        // Get the data properly, handling both array and paginated formats
        const transactionsData = transactionsResponse.data.data || transactionsResponse.data || [];
        const donationsData = donationsResponse.data.data || donationsResponse.data || [];

        // Convert donations to transaction format if they don't already exist in transactions
        const formattedDonations = donationsData.map(donation => ({
          id: donation.id,
          transaction_hash: donation.transaction_hash,
          amount: donation.amount,
          type: 'donation',
          status: donation.status,
          message: donation.donor_message,
          created_at: donation.created_at,
          currency_type: donation.currency_type || 'SCROLL',
          is_donation: true
        }));

        // Combine transactions and donations, avoiding duplicates
        const combinedData = [...transactionsData];

        // Only add donations that don't already exist in transactions (by transaction_hash)
        formattedDonations.forEach(donation => {
          if (donation.transaction_hash &&
              !combinedData.some(tx => tx.transaction_hash === donation.transaction_hash)) {
            combinedData.push(donation);
          } else if (!donation.transaction_hash &&
                     !combinedData.some(tx => tx.id === donation.id && tx.type === 'donation')) {
            combinedData.push(donation);
          }
        });

        console.log('Combined transactions and donations:', combinedData);
        setTransactions(combinedData);

        // Calculate statistics
        calculateStats(combinedData);
      } catch (err) {
        console.error('Error fetching transactions and donations:', err);
        setError('Failed to load transactions. Please try again.');
        toast.error('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionsAndDonations();
  }, [charityId, filterType]);

  // Calculate transaction statistics
  const calculateStats = (transactionsData) => {
    const stats = {
      totalDonations: 0,
      totalFundReleases: 0,
      totalTransactions: transactionsData.length,
      verifiedTransactions: 0
    };

    transactionsData.forEach(tx => {
      if (tx.type === 'donation') {
        stats.totalDonations += parseFloat(tx.amount || 0);
      } else if (tx.type === 'fund_release') {
        stats.totalFundReleases += parseFloat(tx.amount || 0);
      }

      if (tx.transaction_hash) {
        stats.verifiedTransactions++;
      }
    });

    setStats(stats);
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get sorted and filtered transactions
  const filteredAndSortedTransactions = () => {
    // First filter by type if needed
    let filtered = [...transactions];

    // Then filter by search term if provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(tx =>
        (tx.transaction_hash && tx.transaction_hash.toLowerCase().includes(term)) ||
        (tx.type && tx.type.toLowerCase().includes(term)) ||
        (tx.status && tx.status.toLowerCase().includes(term)) ||
        (tx.message && tx.message.toLowerCase().includes(term))
      );
    }

    // Then sort
    return filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle dates
      if (sortField === 'created_at') {
        aValue = new Date(a.created_at || 0).getTime();
        bValue = new Date(b.created_at || 0).getTime();
      }

      // Handle amounts
      if (sortField === 'amount') {
        aValue = parseFloat(a.amount || 0);
        bValue = parseFloat(b.amount || 0);
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Helper functions for rendering
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const formatAmount = (amount, currency) => {
    if (!amount) return '0.000';

    // Default to SCROLL for blockchain transactions
    const currencyType = currency || 'SCROLL';

    // Format based on currency type
    if (currencyType === 'USD' || currencyType === 'MYR') {
      return `$${parseFloat(amount).toFixed(2)} ${currencyType}`;
    } else {
      // For cryptocurrency (SCROLL, ETH, etc.)
      return `${parseFloat(amount).toFixed(3)} ${currencyType}`;
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';

    switch (status.toLowerCase()) {
      case 'completed':
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'pending_verification':
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
      case 'verified':
        return <FaCheckCircle className="mr-1.5 h-2 w-2 text-green-500" />;
      case 'pending':
      case 'pending_verification':
        return <FaClock className="mr-1.5 h-2 w-2 text-yellow-500" />;
      case 'failed':
        return <FaExclamationTriangle className="mr-1.5 h-2 w-2 text-red-500" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'donation':
        return 'Donation';
      case 'fund_release':
        return 'Fund Release';
      case 'withdrawal':
        return 'Withdrawal';
      default:
        return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Transaction';
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="ml-1 text-gray-400" />;
    return sortDirection === 'asc' ? <FaSortUp className="ml-1 text-indigo-500" /> : <FaSortDown className="ml-1 text-indigo-500" />;
  };

  return (
    <div className="w-full">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Donations Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-sm border border-green-200">
          <div className="flex items-center">
            <div className="bg-green-500 bg-opacity-20 p-3 rounded-full">
              <FaHandHoldingHeart className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-green-800">Total Donations</h3>
              <p className="text-2xl font-bold text-green-900">
                {formatAmount(stats.totalDonations)}
              </p>
            </div>
          </div>
        </div>

        {/* Fund Releases Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 shadow-sm border border-blue-200">
          <div className="flex items-center">
            <div className="bg-blue-500 bg-opacity-20 p-3 rounded-full">
              <FaExchangeAlt className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-blue-800">Fund Releases</h3>
              <p className="text-2xl font-bold text-blue-900">
                {formatAmount(stats.totalFundReleases)}
              </p>
            </div>
          </div>
        </div>

        {/* Total Transactions Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 shadow-sm border border-purple-200">
          <div className="flex items-center">
            <div className="bg-purple-500 bg-opacity-20 p-3 rounded-full">
              <FaChartBar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-purple-800">Total Transactions</h3>
              <p className="text-2xl font-bold text-purple-900">
                {stats.totalTransactions}
              </p>
            </div>
          </div>
        </div>

        {/* Blockchain Verified Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 shadow-sm border border-indigo-200">
          <div className="flex items-center">
            <div className="bg-indigo-500 bg-opacity-20 p-3 rounded-full">
              <FaGlobe className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-indigo-800">Blockchain Verified</h3>
              <p className="text-2xl font-bold text-indigo-900">
                {stats.verifiedTransactions}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-sm rounded-md ${filterType === 'all' ? 'bg-indigo-100 text-indigo-800 font-medium' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('donation')}
              className={`px-3 py-1 text-sm rounded-md ${filterType === 'donation' ? 'bg-green-100 text-green-800 font-medium' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              Donations
            </button>
            <button
              onClick={() => setFilterType('fund_release')}
              className={`px-3 py-1 text-sm rounded-md ${filterType === 'fund_release' ? 'bg-blue-100 text-blue-800 font-medium' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              Fund Releases
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredAndSortedTransactions().length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Transactions Found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? "No transactions match your search criteria."
              : filterType !== 'all'
                ? `No ${getTypeLabel(filterType).toLowerCase()} transactions found.`
                : "This charity hasn't processed any transactions yet."}
          </p>
          {(searchTerm || filterType !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-1 text-gray-400" />
                    Date
                    {getSortIcon('created_at')}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Hash
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center">
                    Type
                    {getSortIcon('type')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center">
                    <FaCoins className="mr-1 text-gray-400" />
                    Amount
                    {getSortIcon('amount')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {getSortIcon('status')}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedTransactions().map((transaction, index) => (
                <motion.tr
                  key={transaction.id || transaction.transaction_hash || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    {transaction.transaction_hash ? (
                      <a
                        href={`https://sepolia.scrollscan.com/tx/${transaction.transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150 flex items-center"
                      >
                        {transaction.transaction_hash.slice(0, 10)}...{transaction.transaction_hash.slice(-8)}
                        <FaExternalLinkAlt className="ml-1 h-3 w-3" />
                      </a>
                    ) : (
                      <span>
                        {transaction.id ? `ID: ${transaction.id}` : 'N/A'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.type === 'donation' ? 'bg-green-100 text-green-800' :
                      transaction.type === 'fund_release' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {transaction.type === 'donation' ? <FaHandHoldingHeart className="mr-1" /> :
                       transaction.type === 'fund_release' ? <FaExchangeAlt className="mr-1" /> :
                       <FaMoneyBillWave className="mr-1" />}
                      {getTypeLabel(transaction.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatAmount(transaction.amount, transaction.currency_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      {transaction.status ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1).replace('_', ' ') : 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {transaction.transaction_hash && (
                        <a
                          href={`https://sepolia.scrollscan.com/tx/${transaction.transaction_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150 flex items-center"
                        >
                          <FaGlobe className="mr-1" />
                          Explorer
                        </a>
                      )}
                      {transaction.task_id && (
                        <a
                          href={`/charities/${charityId}/tasks/${transaction.task_id}`}
                          className="text-green-600 hover:text-green-900 transition-colors duration-150 flex items-center"
                        >
                          <FaEye className="mr-1" />
                          View Task
                        </a>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CharityTransactions;
