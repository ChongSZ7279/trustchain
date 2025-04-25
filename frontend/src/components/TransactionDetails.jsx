import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import TransactionVerifier from './TransactionVerifier';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaSync,
  FaExchangeAlt,
  FaUser,
  FaBuilding,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaFileAlt,
  FaExternalLinkAlt,
  FaCoins,
  FaChartLine,
  FaEthereum,
  FaCreditCard,
  FaDollarSign,
  FaFileInvoice,
  FaDownload,
  FaPrint,
  FaInfoCircle,
  FaShieldAlt,
  FaLock,
  FaUnlock,
  FaHistory,
  FaShareAlt,
  FaWallet,
  FaArrowRight,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaClipboardCheck,
  FaHandshake,
  FaLink,
  FaHandHoldingHeart
} from 'react-icons/fa';
import { ethers } from 'ethers';
import { DonationContractABI } from '../contracts/DonationContractABI';
import { formatImageUrl } from '../utils/helpers';
import BackButton from './BackToHistory';
import { SCROLL_CONFIG } from '../utils/scrollConfig';
import { getTransactionDetails, verifyTransaction } from '../services/transactionService';

export default function TransactionDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [relatedTask, setRelatedTask] = useState(null);
  const [loadingTask, setLoadingTask] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        // First try with /api prefix
        try {
        const data = await getTransactionDetails(id);
        setTransaction(data);
        
        // If this is a fund release transaction, try to fetch the related task
        if (data.type === 'fund_release' && data.task_id) {
          fetchRelatedTask(data.task_id);
          }
        } catch (apiError) {
          // If that fails, try without /api prefix
          const response = await axios.get(`/api/transactions/${id}`);
          const data = response.data;
          setTransaction(data);
          
          if (data.type === 'fund_release' && data.task_id) {
            fetchRelatedTask(data.task_id);
          }
        }
      } catch (err) {
        console.error('Error fetching transaction details:', err);
        setError(err.response?.data?.message || 'Failed to fetch transaction details. The transaction may have been deleted or you may not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  const fetchRelatedTask = async (taskId) => {
    setLoadingTask(true);
    try {
      // First try with /api prefix
      try {
        const response = await axios.get(`/api/tasks/${taskId}`);
        setRelatedTask(response.data);
      } catch (apiError) {
        // If that fails, try without /api prefix
      const response = await axios.get(`/tasks/${taskId}`);
      setRelatedTask(response.data);
      }
    } catch (err) {
      console.error('Error fetching related task:', err);
      // Don't set error state, just log it
    } finally {
      setLoadingTask(false);
    }
  };

  // Update how you connect to the contract using ethers.js v5 or v6
  const connectToContract = async () => {
    try {
      let provider;
      let signer;

      // Check ethers version by feature detection
      if (typeof ethers.BrowserProvider === 'function') {
        // ethers v6
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
      } else {
        // ethers v5
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
      }

      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

      const contract = new ethers.Contract(
        contractAddress,
        DonationContractABI,
        signer
      );
      return contract;
    } catch (error) {
      console.error("Error connecting to contract:", error);
      return null;
    }
  };

  const viewOnBlockExplorer = () => {
    if (transaction.transaction_hash) {
      window.open(`https://sepolia.scrollscan.com/tx/${transaction.transaction_hash}`, '_blank');
    } else {
      window.open(`https://sepolia.scrollscan.com/address/0x7867fC939F10377E309a3BF55bfc194F672B0E84`, '_blank');
    }
  };

  const getBlockExplorerLink = () => {
    if (transaction.transaction_hash) {
      return `${SCROLL_CONFIG.NETWORK.BLOCK_EXPLORER_URL}/tx/${transaction.transaction_hash}`;
    } else {
    return `${SCROLL_CONFIG.NETWORK.BLOCK_EXPLORER_URL}/address/0x7867fC939F10377E309a3BF55bfc194F672B0E84`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'confirmed':
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'confirmed':
      case 'verified':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <FaSync className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <FaExclamationCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FaInfoCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTransactionTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'donation':
        return <FaHandHoldingHeart className="h-5 w-5 text-purple-500" />;
      case 'fund_release':
        return <FaCoins className="h-5 w-5 text-green-500" />;
      case 'withdrawal':
        return <FaWallet className="h-5 w-5 text-blue-500" />;
      default:
        return <FaExchangeAlt className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type?.toLowerCase()) {
      case 'donation':
        return 'Donation';
      case 'fund_release':
        return 'Fund Release';
      case 'withdrawal':
        return 'Withdrawal';
      default:
        return type || 'Transaction';
    }
  };

  const getTransactionDirectionIcon = (fromAddress, toAddress) => {
    if (fromAddress === toAddress) {
      return <FaExchangeAlt className="h-5 w-5 text-gray-500" />;
    }
    return <FaArrowRight className="h-5 w-5 text-indigo-500" />;
  };

  const getTransactionDirectionLabel = (fromAddress, toAddress) => {
    if (fromAddress === toAddress) {
      return 'Internal Transfer';
    }
    return 'Outgoing Transfer';
  };

  // New function to render the flow visualization
  const renderFlowVisualization = () => {
    if (!transaction) return null;

    const getStepStatus = (step) => {
      if (transaction.type === 'donation') {
        return step === 'donation' || step === 'smart_contract';
      } else if (transaction.type === 'fund_release') {
        return step === 'task_verification' || step === 'fund_release';
      }
      return false;
    };

    const getStepDescription = (step) => {
      switch (step) {
        case 'donation':
          return 'User initiates donation through the platform';
        case 'smart_contract':
          return 'Funds are securely held in the smart contract';
        case 'task_verification':
          return 'Admin verifies the completion of the task';
        case 'fund_release':
          return 'Funds are released to the charity. Congratulations!';
        default:
          return '';
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FaLink className="mr-2 text-indigo-500" />
          Transaction Flow
        </h3>
        
        <div className="relative">
          {/* Flow steps */}
          <div className="flex items-center justify-between">
            {/* Step 1: Donation */}
            <div className="flex flex-col items-center w-1/4 group">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                  getStepStatus('donation') 
                    ? 'bg-indigo-100 text-indigo-600 ring-4 ring-indigo-100' 
                    : 'bg-green-100 text-green-500'
                }`}
              >
                <FaHandHoldingHeart className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">Donation</p>
                <p className="text-xs text-gray-500">{getStepDescription('donation')}</p>
                {transaction.type === 'donation' && (
                  <p className="text-xs text-indigo-600 mt-1 font-medium">Current Step</p>
                )}
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {getStepDescription('donation')}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
              </div>
            </div>
            
            {/* Arrow */}
            <div className="w-1/6 flex justify-center">
              <motion.div
                animate={{ 
                  x: getStepStatus('donation') ? [0, 5, 0] : 0,
                  opacity: getStepStatus('donation') ? 1 : 0.3
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <FaArrowRight className={`h-5 w-5 ${getStepStatus('donation') ? 'text-indigo-400' : 'text-gray-300'}`} />
              </motion.div>
            </div>
            
            {/* Step 2: Smart Contract */}
            <div className="flex flex-col items-center w-1/4 group">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                  getStepStatus('smart_contract') 
                    ? 'bg-indigo-100 text-indigo-600 ring-4 ring-indigo-100' 
                    : 'bg-green-100 text-green-500'
                }`}
              >
                <FaShieldAlt className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">Smart Contract</p>
                <p className="text-xs text-gray-500">{getStepDescription('smart_contract')}</p>
                {transaction.type === 'donation' && transaction.status === 'completed' && (
                  <p className="text-xs text-indigo-600 mt-1 font-medium">Completed</p>
                )}
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {getStepDescription('smart_contract')}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
              </div>
            </div>
            
            {/* Arrow */}
            <div className="w-1/6 flex justify-center">
              <motion.div
                animate={{ 
                  x: getStepStatus('smart_contract') ? [0, 5, 0] : 0,
                  opacity: getStepStatus('smart_contract') ? 1 : 0.3
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <FaArrowRight className={`h-5 w-5 ${getStepStatus('smart_contract') ? 'text-indigo-400' : 'text-gray-300'}`} />
              </motion.div>
            </div>
            
            {/* Step 3: Task Verification */}
            <div className="flex flex-col items-center w-1/4 group">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                  getStepStatus('task_verification') 
                    ? 'bg-green-100 text-green-600 ring-4 ring-green-100' 
                    : 'bg-green-100 text-green-500'
                }`}
              >
                <FaClipboardCheck className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">Task Verification</p>
                <p className="text-xs text-gray-500">{getStepDescription('task_verification')}</p>
                {transaction.type === 'fund_release' && relatedTask && (
                  <p className="text-xs text-green-600 mt-1 font-medium">Task #{relatedTask.id}</p>
                )}
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {getStepDescription('task_verification')}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
              </div>
            </div>
            
            {/* Arrow */}
            <div className="w-1/6 flex justify-center">
              <motion.div
                animate={{ 
                  x: getStepStatus('task_verification') ? [0, 5, 0] : 0,
                  opacity: getStepStatus('task_verification') ? 1 : 0.3
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <FaArrowRight className={`h-5 w-5 ${getStepStatus('task_verification') ? 'text-green-400' : 'text-gray-300'}`} />
              </motion.div>
            </div>
            
            {/* Step 4: Fund Release */}
            <div className="flex flex-col items-center w-1/4 group">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                  getStepStatus('fund_release') 
                    ? 'bg-green-100 text-green-600 ring-4 ring-green-100' 
                    : 'bg-green-100 text-green-500'
                }`}
              >
                <FaCoins className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">Fund Release</p>
                <p className="text-xs text-gray-500">{getStepDescription('fund_release')}</p>
                {transaction.type === 'fund_release' && (
                  <p className="text-xs text-green-600 mt-1 font-medium">Current Step</p>
                )}
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {getStepDescription('fund_release')}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full rounded-full bg-green-500"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, ease: "easeOut" }}
            ></motion.div>
          </div>

          {/* Additional info for fund release transactions */}
          {transaction.type === 'fund_release' && relatedTask && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-green-800">Related Task Details</h4>
                  <p className="text-xs text-green-600 mt-1">Task #{relatedTask.id} - {relatedTask.title}</p>
                </div>
                <Link 
                  to={`/tasks/${relatedTask.id}`}
                  className="text-xs text-green-600 hover:text-green-700 flex items-center group"
                >
                  View Task 
                  <FaExternalLinkAlt className="ml-1 h-3 w-3 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  // New function to render the task verification tab
  const renderTaskVerificationTab = () => {
    if (!transaction || transaction.type !== 'fund_release') {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <FaInfoCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Task Verification Data</h3>
          <p className="text-gray-500 mb-4">
            This transaction is not a fund release transaction, so there is no task verification data to display.
          </p>
          <Link 
            to="/transactions" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaArrowLeft className="mr-2" /> Back to Transactions
          </Link>
        </div>
      );
    }

    if (loadingTask) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <FaSpinner className="h-12 w-12 text-indigo-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500">Loading task verification data...</p>
        </div>
      );
    }

    if (!relatedTask) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <FaExclamationTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Task Not Found</h3>
          <p className="text-gray-500 mb-4">
            The task associated with this fund release transaction could not be found.
          </p>
          <Link 
            to="/transactions" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaArrowLeft className="mr-2" /> Back to Transactions
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Task Verification Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Task Verification Details</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(relatedTask.status)}`}>
                {getStatusIcon(relatedTask.status)}
                <span className="ml-1">{relatedTask.status.charAt(0).toUpperCase() + relatedTask.status.slice(1)}</span>
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Task Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-900">{relatedTask.name}</p>
                    <p className="text-sm text-gray-500">{relatedTask.description}</p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaCalendarAlt className="mr-2" />
                    <span>Created: {formatDate(relatedTask.created_at)}</span>
                  </div>
                  {relatedTask.updated_at && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <FaClock className="mr-2" />
                      <span>Updated: {formatDate(relatedTask.updated_at)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Charity Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    {relatedTask.charity?.logo ? (
                      <img 
                        src={formatImageUrl(relatedTask.charity.logo)} 
                        alt={relatedTask.charity.name} 
                        className="h-8 w-8 rounded-full mr-2"
                      />
                    ) : (
                      <FaBuilding className="h-8 w-8 text-gray-400 mr-2" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{relatedTask.charity.name}</p>
                      <p className="text-xs text-gray-500">ID: {relatedTask.charity.id}</p>
                    </div>
                  </div>
                  {relatedTask.charity?.organization?.wallet_address && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Wallet Address:</p>
                      <div className="flex items-center">
                        <code className="text-xs bg-gray-100 p-1 rounded">
                          {relatedTask.charity.organization.wallet_address.substring(0, 10)}...{relatedTask.charity.organization.wallet_address.substring(relatedTask.charity.organization.wallet_address.length - 8)}
                        </code>
                        <a
                          href={`https://sepolia.scrollscan.com/address/${relatedTask.charity.organization.wallet_address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                        >
                          <FaExternalLinkAlt className="mr-1" size={10} />
                          View
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Proof Section */}
            {relatedTask.proof && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Verification Proof</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <FaFileAlt className="h-5 w-5 text-gray-400 mr-2" />
                    <a 
                      href={relatedTask.proof} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      View Proof Document
                    </a>
                  </div>
                </div>
              </div>
            )}
            
            {/* Images Section */}
            {relatedTask.proof_images && relatedTask.proof_images.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Proof Images</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedTask.proof_images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={formatImageUrl(image)} 
                        alt={`Proof ${index + 1}`} 
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <a 
                        href={formatImageUrl(image)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                      >
                        <FaEye className="h-5 w-5 text-white" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Fund Release Details */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fund Release Details</h3>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount Released</p>
                  <p className="text-lg font-bold text-gray-900">{transaction.amount} {transaction.currency_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Release Date</p>
                  <p className="text-sm text-gray-900">{formatDate(transaction.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Transaction Hash</p>
                  <div className="flex items-center">
                    <code className="text-xs bg-gray-100 p-1 rounded">
                      {transaction.transaction_hash.substring(0, 10)}...{transaction.transaction_hash.substring(transaction.transaction_hash.length - 8)}
                    </code>
                    <a
                      href={`https://sepolia.scrollscan.com/tx/${transaction.transaction_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      <FaExternalLinkAlt className="mr-1" size={10} />
                      View
                    </a>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(transaction.status)}`}>
                    {getStatusIcon(transaction.status)}
                    <span className="ml-1">{transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-md">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <FaExclamationTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">{error || 'Transaction not found'}</h2>
          <p className="text-gray-600 mb-6">We couldn't find the transaction you're looking for. It may have been deleted or you may not have permission to view it.</p>
          <Link 
            to="/transactions" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaArrowLeft className="mr-2" /> Back to Transactions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <BackButton className="mb-6" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="relative">
            {/* Background Banner */}
            <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            
            {/* Status Badge - Positioned on the banner */}
            <div className="absolute top-4 right-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeClass(transaction.status)}`}>
                {getStatusIcon(transaction.status)}
                <span className="ml-1">{transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</span>
              </span>
            </div>

            {/* Main Content */}
            <div className="px-6 py-4 -mt-16">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between">
                <div className="flex items-center">
                  <div className="h-24 w-24 rounded-full bg-white p-1 shadow-md flex items-center justify-center">
                    <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
                      {getTransactionTypeIcon(transaction.type)}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h1 className="text-2xl font-bold text-white">Transaction #{transaction.id}</h1>
                    <p className="text-gray-700">{getTransactionTypeLabel(transaction.type)} • {formatDate(transaction.created_at)}</p>
            </div>
          </div>

                <div className="mt-4 md:mt-0 flex space-x-2">
                  {transaction.transaction_hash && (
                    <button
                      onClick={viewOnBlockExplorer}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FaExternalLinkAlt className="mr-2" /> View on Explorer
                    </button>
                  )}
                </div>
                </div>
              </div>
            </div>
          </div>

        {/* Flow Visualization */}
        {renderFlowVisualization()}
        
        {/* Transaction Details */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Transaction Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <FaExchangeAlt className="mr-2 text-indigo-500" />
                Transaction Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{transaction.id}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Transaction Hash</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm font-medium text-gray-900 font-mono">
                      {transaction.transaction_hash ? 
                        `${transaction.transaction_hash.substring(0, 10)}...${transaction.transaction_hash.substring(transaction.transaction_hash.length - 8)}` : 
                        'N/A'}
                    </p>
              {transaction.transaction_hash && (
                      <a
                        href={getBlockExplorerLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 flex items-center"
                      >
                        <FaExternalLinkAlt className="h-4 w-4" />
                      </a>
                    )}
              </div>
              </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{transaction.amount} {transaction.currency_type}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(transaction.created_at)}</p>
              </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">From</p>
                  <p className="text-sm font-medium text-gray-900 mt-1 font-mono">
                    {transaction.from_address ? 
                      `${transaction.from_address.substring(0, 10)}...${transaction.from_address.substring(transaction.from_address.length - 8)}` : 
                      'System'}
                  </p>
                    </div>
                    
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">To</p>
                  <p className="text-sm font-medium text-gray-900 mt-1 font-mono">
                    {transaction.to_address ? 
                      `${transaction.to_address.substring(0, 10)}...${transaction.to_address.substring(transaction.to_address.length - 8)}` : 
                      'System'}
                  </p>
                    </div>

                    {transaction.message && (
                  <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                    <p className="text-sm text-gray-500">Message</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{transaction.message}</p>
                        </div>
                    )}
                  </div>
            </motion.div>

            
            {/* Blockchain Verification */}
            {transaction.transaction_hash && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                  <FaShieldAlt className="mr-2 text-indigo-500" />
                  Blockchain Verification
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-indigo-600 font-medium">Transaction Hash</p>
                        <p className="text-sm font-mono text-indigo-900 mt-1">
                          {transaction.transaction_hash ? `${transaction.transaction_hash.substring(0, 10)}...${transaction.transaction_hash.substring(transaction.transaction_hash.length - 8)}` : 'N/A'}
                        </p>
                      </div>
                      <a
                        href={getBlockExplorerLink()}
                              target="_blank"
                              rel="noopener noreferrer"
                        className="p-2 text-indigo-600 hover:text-indigo-700 transition-colors duration-200 rounded-full hover:bg-indigo-100"
                        title="View on Explorer"
                            >
                        <FaExternalLinkAlt className="h-5 w-5" />
                            </a>
                    </div>
                  </div>
                  
                  </div>
              </motion.div>
            )}
            
            {/* Task Verification - Only for fund release transactions */}
            {transaction.type === 'fund_release' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                  <FaClipboardCheck className="mr-2 text-indigo-500" />
                  Task Verification
                </h3>
                
                {loadingTask ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-3 text-gray-500">Loading task information...</span>
                    </div>
                ) : relatedTask ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">Task #{relatedTask.id}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(relatedTask.status)}`}>
                          {getStatusIcon(relatedTask.status)}
                          <span className="ml-1">{relatedTask.status.charAt(0).toUpperCase() + relatedTask.status.slice(1)}</span>
                        </span>
                  </div>
                      <p className="text-sm text-gray-500">{relatedTask.description}</p>
                </div>

                    {relatedTask.proof && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-2">Proof</p>
                        <a 
                          href={relatedTask.proof} 
                      target="_blank"
                      rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                          <FaFileAlt className="mr-2" />
                          View Proof Document
                    </a>
                  </div>
                    )}
                </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>No task information available for this transaction.</p>
            </div>
          )}
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}