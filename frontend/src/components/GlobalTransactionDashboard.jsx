import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import axios from 'axios';
import { 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaWallet, 
  FaHandHoldingHeart,
  FaExchangeAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa';
import { CSVLink } from 'react-csv';
import { formatDate } from '../utils/helpers';

const GlobalTransactionDashboard = () => {
  const { getAllTransactions } = useBlockchain();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: {
      start: '',
      end: ''
    }
  });
  
  useEffect(() => {
    const fetchAllTransactions = async () => {
      setLoading(true);
      try {
        // Fetch blockchain transactions
        const blockchainTxs = await getAllTransactions();
        
        // Fetch database transactions
        const response = await axios.get('/api/transactions');
        const dbTxs = response.data;
        
        // Format blockchain transactions to match database structure
        const formattedBlockchainTxs = blockchainTxs.map(tx => ({
          id: tx.transactionHash,
          transaction_hash: tx.transactionHash,
          type: tx.type === 'donation' ? 'blockchain_donation' : 'milestone_payment',
          amount: tx.amount,
          status: 'completed',
          created_at: new Date(tx.timestamp).toISOString(),
          charity_id: tx.charityId,
          donor: tx.donor || tx.from,
          is_blockchain: true
        }));
        
        // Combine and sort by date (newest first)
        const allTxs = [...dbTxs, ...formattedBlockchainTxs]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        setTransactions(allTxs);
        setFilteredTransactions(allTxs);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllTransactions();
  }, [getAllTransactions]);
  
  useEffect(() => {
    // Apply filters and search
    let result = [...transactions];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(tx => 
        (tx.id && tx.id.toLowerCase().includes(term)) ||
        (tx.transaction_hash && tx.transaction_hash.toLowerCase().includes(term)) ||
        (tx.charity && tx.charity.name && tx.charity.name.toLowerCase().includes(term)) ||
        (tx.donor && tx.donor.toLowerCase().includes(term))
      );
    }
    
    // Apply type filter
    if (filters.type !== 'all') {
      if (filters.type === 'blockchain') {
        result = result.filter(tx => tx.is_blockchain);
      } else if (filters.type === 'standard') {
        result = result.filter(tx => !tx.is_blockchain);
      } else {
        result = result.filter(tx => tx.type === filters.type);
      }
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(tx => tx.status === filters.status);
    }
    
    // Apply date range filter
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start);
      result = result.filter(tx => new Date(tx.created_at) >= startDate);
    }
    
    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end);
      endDate.setHours(23, 59, 59, 999); // End of day
      result = result.filter(tx => new Date(tx.created_at) <= endDate);
    }
    
    setFilteredTransactions(result);
  }, [transactions, searchTerm, filters]);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };
  
  const handleDateRangeChange = (rangeType, value) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [rangeType]: value
      }
    }));
  };
  
  const resetFilters = () => {
    setFilters({
      type: 'all',
      status: 'all',
      dateRange: {
        start: '',
        end: ''
      }
    });
    setSearchTerm('');
  };
  
  // Prepare data for CSV export
  const csvData = filteredTransactions.map(tx => ({
    ID: tx.id,
    Type: tx.is_blockchain ? 'Blockchain' : 'Standard',
    TransactionType: tx.type,
    Amount: tx.is_blockchain ? `${tx.amount} ETH` : `$${tx.amount}`,
    Status: tx.status,
    Date: formatDate(tx.created_at),
    Charity: tx.charity?.name || 'N/A',
    Donor: tx.donor || 'N/A',
    TransactionHash: tx.transaction_hash || 'N/A'
  }));
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Transaction Dashboard</h2>
        <CSVLink 
          data={csvData} 
          filename={"transactions.csv"}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <FaDownload className="mr-2" />
          Export CSV
        </CSVLink>
      </div>
      
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
          <div className="relative flex-1 mb-4 md:mb-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search transactions..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div className="flex items-center">
            <FaFilter className="text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type
            </label>
            <select
              id="type-filter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="blockchain">Blockchain Transactions</option>
              <option value="standard">Standard Transactions</option>
              <option value="donation">Donations</option>
              <option value="blockchain_donation">Blockchain Donations</option>
              <option value="milestone_payment">Milestone Payments</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <button
            onClick={resetFilters}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reset Filters
          </button>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row sm:space-x-4">
          <div>
            <label htmlFor="date-start" className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              id="date-start"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filters.dateRange.start}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="date-end" className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              id="date-end"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filters.dateRange.end}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading transactions...</p>
        </div>
      ) : filteredTransactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID/Hash
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
                  Charity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    {transaction.transaction_hash 
                      ? `${transaction.transaction_hash.substring(0, 8)}...` 
                      : transaction.id.substring(0, 8)
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.is_blockchain 
                        ? 'bg-indigo-100 text-indigo-800'
                        : transaction.type === 'donation' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.is_blockchain ? (
                        <>
                          <FaWallet className="mr-1" />
                          Blockchain {transaction.type === 'blockchain_donation' ? 'Donation' : 'Payment'}
                        </>
                      ) : (
                        <>
                          {transaction.type === 'donation' ? (
                            <FaHandHoldingHeart className="mr-1" />
                          ) : (
                            <FaExchangeAlt className="mr-1" />
                          )}
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.is_blockchain 
                      ? `${transaction.amount} ETH`
                      : `$${parseFloat(transaction.amount).toFixed(2)}`
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status === 'completed' && <FaCheckCircle className="mr-1" />}
                      {transaction.status === 'pending' && <FaClock className="mr-1" />}
                      {transaction.status === 'failed' && <FaExclamationTriangle className="mr-1" />}
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.charity?.name || `Charity #${transaction.charity_id}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.is_blockchain ? (
                      <a 
                        href={`https://etherscan.io/tx/${transaction.transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View on Etherscan
                      </a>
                    ) : (
                      <a
                        href={`/transactions/${transaction.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
          <p className="text-gray-600">Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
};

export default GlobalTransactionDashboard; 