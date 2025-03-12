import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEthereum, FaExternalLinkAlt, FaFilter, FaSearch, FaCheckCircle, FaClock, FaExclamationCircle } from 'react-icons/fa';

export default function TransactionHistory({ userId, charityId, taskId, limit }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, blockchain, traditional
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, amount
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        let endpoint = '/api/transactions';
        
        if (userId) {
          endpoint = `/api/users/${userId}/transactions`;
        } else if (charityId) {
          endpoint = `/api/charities/${charityId}/transactions`;
        } else if (taskId) {
          endpoint = `/api/tasks/${taskId}/transactions`;
        }
        
        const response = await axios.get(endpoint);
        setTransactions(response.data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transaction history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [userId, charityId, taskId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <FaClock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <FaExclamationCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FaClock className="h-5 w-5 text-gray-400" />;
    }
  };

  const filteredTransactions = transactions
    .filter(transaction => {
      if (filter === 'all') return true;
      if (filter === 'blockchain') return transaction.payment_method === 'blockchain' || transaction.blockchain_tx_hash;
      if (filter === 'traditional') return transaction.payment_method !== 'blockchain' && !transaction.blockchain_tx_hash;
      return true;
    })
    .filter(transaction => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        (transaction.message && transaction.message.toLowerCase().includes(searchLower)) ||
        (transaction.blockchain_tx_hash && transaction.blockchain_tx_hash.toLowerCase().includes(searchLower)) ||
        (transaction.amount && transaction.amount.toString().includes(searchTerm)) ||
        (transaction.user && transaction.user.name && transaction.user.name.toLowerCase().includes(searchLower)) ||
        (transaction.charity && transaction.charity.name && transaction.charity.name.toLowerCase().includes(searchLower)) ||
        (transaction.task && transaction.task.name && transaction.task.name.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'amount') {
        return sortOrder === 'asc'
          ? parseFloat(a.amount) - parseFloat(b.amount)
          : parseFloat(b.amount) - parseFloat(a.amount);
      }
      return 0;
    });

  const displayedTransactions = limit ? filteredTransactions.slice(0, limit) : filteredTransactions;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaExclamationCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No transactions found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Transaction History</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          View and track all donations and their status
        </p>
      </div>
      
      <div className="px-4 py-3 sm:px-6 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Transactions</option>
              <option value="blockchain">Blockchain Only</option>
              <option value="traditional">Traditional Only</option>
            </select>
            
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
          
          <div className="relative rounded-md shadow-sm max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search transactions"
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
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
                Details
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(transaction.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {transaction.blockchain_tx_hash ? (
                      <FaEthereum className="h-5 w-5 text-indigo-600 mr-2" />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                        <span className="text-xs font-medium text-gray-500">$</span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {transaction.type === 'task' ? 'Task Funding' : 'Charity Donation'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.blockchain_tx_hash ? 'Ξ' : '$'}{parseFloat(transaction.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(transaction.status)}
                    <span className="ml-2 text-sm text-gray-900 capitalize">
                      {transaction.status || 'completed'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.charity && (
                    <div>
                      <span className="text-gray-500">Charity:</span>{' '}
                      <Link to={`/charities/${transaction.charity.id}`} className="text-indigo-600 hover:text-indigo-900">
                        {transaction.charity.name}
                      </Link>
                    </div>
                  )}
                  {transaction.task && (
                    <div>
                      <span className="text-gray-500">Task:</span>{' '}
                      <Link to={`/tasks/${transaction.task.id}`} className="text-indigo-600 hover:text-indigo-900">
                        {transaction.task.name}
                      </Link>
                    </div>
                  )}
                  {!transaction.anonymous && transaction.user && (
                    <div>
                      <span className="text-gray-500">Donor:</span>{' '}
                      <span className="text-gray-900">{transaction.user.name}</span>
                    </div>
                  )}
                  {transaction.anonymous && (
                    <div>
                      <span className="text-gray-500">Donor:</span>{' '}
                      <span className="text-gray-900">Anonymous</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {transaction.blockchain_tx_hash && (
                    <a
                      href={`https://etherscan.io/tx/${transaction.blockchain_tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end"
                    >
                      View on Etherscan
                      <FaExternalLinkAlt className="ml-1 h-3 w-3" />
                    </a>
                  )}
                  <Link
                    to={`/transactions/${transaction.id}`}
                    className="text-indigo-600 hover:text-indigo-900 mt-1 block"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {limit && transactions.length > limit && (
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <Link
            to={userId ? `/users/${userId}/transactions` : charityId ? `/charities/${charityId}/transactions` : taskId ? `/tasks/${taskId}/transactions` : '/transactions'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View All Transactions
          </Link>
        </div>
      )}
    </div>
  );
} 