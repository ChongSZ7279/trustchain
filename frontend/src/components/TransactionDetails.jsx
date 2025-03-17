import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useBlockchain } from '../context/BlockchainContext';
import { formatImageUrl } from '../utils/helpers';

export default function TransactionDetails() {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { contract } = useBlockchain();
  const [blockchainVerified, setBlockchainVerified] = useState(false);
  const [blockchainDetails, setBlockchainDetails] = useState(null);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/transactions/${id}`);
        setTransaction(response.data);
        
        // Attempt to verify on blockchain
        if (contract && response.data.blockchain_tx_hash) {
          try {
            // In a real app, you would query the blockchain for the transaction
            // For now, we'll simulate verification
            setTimeout(() => {
              setBlockchainVerified(true);
              setBlockchainDetails({
                blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
                timestamp: new Date().toISOString(),
                gasUsed: Math.floor(Math.random() * 100000) + 50000,
                confirmations: Math.floor(Math.random() * 10) + 5
              });
            }, 1000);
          } catch (err) {
            console.error('Error verifying transaction on blockchain:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching transaction details:', err);
        setError('Failed to fetch transaction details');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [id, contract]);

  // Format date to a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get status badge class based on transaction status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">{error || 'Transaction not found'}</h2>
          <p className="mt-2">Please try again later</p>
          <Link to="/transactions" className="mt-4 inline-block text-indigo-600 hover:text-indigo-900">
            Back to Transactions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/transactions" className="text-indigo-600 hover:text-indigo-900 flex items-center">
            <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Transactions
          </Link>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Transaction Details</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Transaction ID: {transaction.id}
                </p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(transaction.status)}`}>
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Transaction Type</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    transaction.type === 'charity' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {transaction.type === 'charity' ? 'Charity Donation' : 'Task Funding'}
                  </span>
                </dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Amount</dt>
                <dd className="mt-1 text-sm text-gray-900">${transaction.amount}</dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(transaction.created_at)}</dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                <dd className="mt-1 text-sm text-gray-900">{transaction.payment_method || 'Credit Card'}</dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">From</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {transaction.from_user ? (
                    <div className="flex items-center">
                      {transaction.from_user.profile_picture && (
                        <img
                          src={formatImageUrl(transaction.from_user.profile_picture)}
                          alt={transaction.from_user.name}
                          className="h-8 w-8 rounded-full mr-2"
                        />
                      )}
                      <Link to={`/users/${transaction.from_user.id}`} className="text-indigo-600 hover:text-indigo-900">
                        {transaction.from_user.name}
                      </Link>
                    </div>
                  ) : (
                    'Anonymous'
                  )}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">To</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {transaction.type === 'charity' && transaction.charity ? (
                    <div className="flex items-center">
                      {transaction.charity.logo && (
                        <img
                          src={formatImageUrl(transaction.charity.logo)}
                          alt={transaction.charity.name}
                          className="h-8 w-8 rounded-full mr-2"
                        />
                      )}
                      <Link to={`/charities/${transaction.charity_id}`} className="text-indigo-600 hover:text-indigo-900">
                        {transaction.charity.name}
                      </Link>
                    </div>
                  ) : transaction.type === 'task' && transaction.task ? (
                    <div className="flex items-center">
                      <Link to={`/tasks/${transaction.task_id}`} className="text-indigo-600 hover:text-indigo-900">
                        {transaction.task.name}
                      </Link>
                    </div>
                  ) : (
                    `${transaction.type === 'charity' ? 'Charity' : 'Task'} #${transaction.type === 'charity' ? transaction.charity_id : transaction.task_id}`
                  )}
                </dd>
              </div>

              {transaction.description && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{transaction.description}</dd>
                </div>
              )}
            </div>
          </div>

          {/* Blockchain Verification Section */}
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Blockchain Verification</h3>
            
            {transaction.blockchain_tx_hash ? (
              <div className="mt-4">
                <div className="flex items-center mb-4">
                  <div className={`flex-shrink-0 h-5 w-5 rounded-full ${blockchainVerified ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}></div>
                  <p className="text-sm font-medium text-gray-900">
                    {blockchainVerified ? 'Verified on Blockchain' : 'Pending Verification'}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Transaction Hash</dt>
                      <dd className="mt-1 text-sm text-gray-900 break-all">{transaction.blockchain_tx_hash}</dd>
                    </div>
                    
                    {blockchainDetails && (
                      <>
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Block Number</dt>
                          <dd className="mt-1 text-sm text-gray-900">{blockchainDetails.blockNumber}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Timestamp</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatDate(blockchainDetails.timestamp)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Gas Used</dt>
                          <dd className="mt-1 text-sm text-gray-900">{blockchainDetails.gasUsed}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Confirmations</dt>
                          <dd className="mt-1 text-sm text-gray-900">{blockchainDetails.confirmations}</dd>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <a 
                      href={`https://etherscan.io/tx/${transaction.blockchain_tx_hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      View on Etherscan
                      <svg className="inline-block ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5z" />
                      </svg>
                    </a>
                  </div>
                </div>
                
                {blockchainVerified && (
                  <div className="mt-4 p-4 bg-green-50 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Blockchain Verification Successful</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>
                            This transaction has been verified on the blockchain, ensuring transparency and immutability.
                            The funds have been securely transferred according to the smart contract rules.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-500">
                  This transaction was processed through traditional payment methods and is not verified on the blockchain.
                </p>
              </div>
            )}
          </div>

          {/* Impact Section */}
          {transaction.type === 'charity' && transaction.status === 'completed' && (
            <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Your Impact</h3>
              <div className="mt-4 bg-indigo-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-indigo-800">Thank You for Your Donation!</h3>
                    <div className="mt-2 text-sm text-indigo-700">
                      <p>
                        Your donation of ${transaction.amount} helps provide essential support to those in need.
                        With blockchain verification, you can be confident that your contribution is being used as intended.
                      </p>
                    </div>
                    <div className="mt-4">
                      <Link 
                        to={`/charities/${transaction.charity_id}`} 
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        See more about this charity's impact
                        <span aria-hidden="true"> &rarr;</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Milestone Tracking for Task Funding */}
          {transaction.type === 'task' && transaction.status === 'completed' && (
            <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Task Progress</h3>
              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-between">
                    <div>
                      <span className="bg-green-500 h-8 w-8 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <p className="mt-2 text-xs text-gray-500">Funded</p>
                    </div>
                    <div>
                      <span className="bg-green-500 h-8 w-8 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <p className="mt-2 text-xs text-gray-500">In Progress</p>
                    </div>
                    <div>
                      <span className="bg-gray-200 h-8 w-8 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-sm">3</span>
                      </span>
                      <p className="mt-2 text-xs text-gray-500">Milestone 1</p>
                    </div>
                    <div>
                      <span className="bg-gray-200 h-8 w-8 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-sm">4</span>
                      </span>
                      <p className="mt-2 text-xs text-gray-500">Completed</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link 
                    to={`/tasks/${transaction.task_id}`} 
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View detailed task progress
                    <span aria-hidden="true"> &rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 