import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import AdminFundReleaseButton from './AdminFundReleaseButton';
import TransactionVerifier from './TransactionVerifier';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaSync,
  FaHandHoldingHeart,
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
  FaExchangeAlt,
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
  FaHeart,
  FaPlus,
  FaCheck,
  FaClipboardCheck,
  FaEye
} from 'react-icons/fa';
import { ethers } from 'ethers';
import { DonationContractABI } from '../contracts/DonationContractABI';
import { formatImageUrl } from '../utils/helpers';
import BackButton from './BackToHistory';
import { SCROLL_CONFIG } from '../utils/scrollConfig';
import { getDonationDetails, verifyTransaction } from '../services/donationService';

export default function DonationDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [proofFiles, setProofFiles] = useState([]);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const data = await getDonationDetails(id);

        // Check if this is an anonymous donation with amount 0
        if (data.anonymous_donation && data.amount === 0) {
          // Try to get the amount from localStorage
          try {
            const recentDonations = JSON.parse(localStorage.getItem('recentDonations') || '[]');
            const donationInfo = recentDonations.find(d => d.id.toString() === id.toString());

            if (donationInfo && donationInfo.amount) {
              console.log('Found donation amount in localStorage:', donationInfo.amount);
              // Update the amount from localStorage
              data.amount = donationInfo.amount;
            }
          } catch (localStorageError) {
            console.warn('Error reading donation from localStorage:', localStorageError);
          }
        }

        setDonation(data);
      } catch (err) {
        console.error('Error fetching donation details:', err);
        setError('Failed to fetch donation details');
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [id]);

  const handleFileChange = (e) => {
    setProofFiles(Array.from(e.target.files));
    setUploadError('');
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    if (!proofFiles.length) {
      setUploadError('Please select at least one file as proof');
      return;
    }

    const formData = new FormData();
    formData.append('action', 'verify');
    formData.append('verification_notes', verificationNotes);
    proofFiles.forEach((file, index) => {
      formData.append(`proof[${index}][file]`, file);
    });

    try {
      setSubmitting(true);
      const response = await axios.post(`/donations/${donation.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDonation(response.data.donation);
      setProofFiles([]);
      setVerificationNotes('');
      toast.success('Verification submitted successfully');
    } catch (err) {
      console.error('Error submitting verification:', err);
      toast.error(err.response?.data?.message || 'Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusLoading(true);
      const response = await axios.post(`/donations/${donation.id}`, {
        status: newStatus
      });

      setDonation(response.data);
      toast.success(`Donation marked as ${newStatus}`);
    } catch (err) {
      console.error('Error updating donation status:', err);
      toast.error('Failed to update donation status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this donation? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(true);
      await axios.delete(`/donations/${donation.id}`);
      toast.success('Donation deleted successfully');
      navigate('/donations');
    } catch (err) {
      console.error('Error deleting donation:', err);
      toast.error('Failed to delete donation');
    } finally {
      setDeleteLoading(false);
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
    if (donation.transaction_hash) {
      window.open(`https://sepolia.scrollscan.com/tx/${donation.transaction_hash}`, '_blank');
    } else {
      window.open(`https://sepolia.scrollscan.com/address/0x7867fC939F10377E309a3BF55bfc194F672B0E84`, '_blank');
    }
  };

  const getBlockExplorerLink = () => {
    if (donation.transaction_hash) {
      return `${SCROLL_CONFIG.NETWORK.BLOCK_EXPLORER_URL}/tx/${donation.transaction_hash}`;
    } else {
      return `${SCROLL_CONFIG.NETWORK.BLOCK_EXPLORER_URL}/address/0x7867fC939F10377E309a3BF55bfc194F672B0E84`;
    }
  };

  // Format date to a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get status badge class based on donation status
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

  // Get status icon based on donation status
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

  const viewInvoice = () => {
    navigate(`/donations/${id}/invoice`);
  };

  // Add this function near your other permission check functions
  const isOwner = () => {
    return user?.ic_number === donation.user_id;
  };

  const renderDonationInfo = () => {
    if (!donation) return null;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-sm p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
              {donation.charity?.picture_path ? (
                <img 
                  src={`/storage/${donation.charity.picture_path}`}
                  alt={donation.charity?.name || 'Charity'}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.target.parentNode.innerHTML = '<div class="w-12 h-12 flex items-center justify-center"><svg class="w-8 h-8 text-indigo-500" /></div>';
                    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    icon.setAttribute("viewBox", "0 0 24 24");
                    icon.setAttribute("fill", "currentColor");
                    icon.setAttribute("class", "w-8 h-8 text-indigo-500");
                    icon.innerHTML = '<path d="M3 19V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2zm2-2h14V7H5v10z"/>';
                    e.target.parentNode.firstChild.appendChild(icon);
                  }}
                />
              ) : (
                <FaBuilding className="w-8 h-8 text-indigo-500" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{donation.charity?.name || 'Charity Organization'}</h3>
              <p className="text-sm text-gray-500">Donation #{donation.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {donation.transaction_hash && (
              <button
                onClick={() => window.open(`${SCROLL_CONFIG.NETWORK.BLOCK_EXPLORER_URL}/tx/${donation.transaction_hash}`, '_blank')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaExternalLinkAlt className="mr-2" /> View on Explorer
              </button>
            )}
            <button 
              className="p-2 text-gray-400 hover:text-indigo-500 transition-colors duration-200 rounded-full hover:bg-indigo-50"
              title="Share Donation"
            >
              <FaShareAlt className="h-5 w-5" />
            </button>
            <button 
              className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200 rounded-full hover:bg-red-50"
              title="Save to Favorites"
            >
              <FaHeart className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-600 font-medium">Donation Amount</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {typeof donation.amount === 'number' ? 
                      `${donation.currency_type === 'SCROLL' ? 'Ξ' : '$'}${donation.amount.toFixed(2)}` : 
                      donation.amount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <FaCoins className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(donation.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Payment Method</span>
                  <span className="text-sm font-medium text-gray-900 flex items-center">
                    {donation.payment_method === 'blockchain' ? (
                      <>
                        <FaEthereum className="mr-2 text-gray-400" />
                        Blockchain (Scroll)
                      </>
                    ) : (
                      <>
                        <FaCreditCard className="mr-2 text-gray-400" />
                        {donation.payment_method || 'Standard Payment'}
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Transaction Hash</span>
                  <span className="text-sm font-medium text-gray-900 font-mono">
                    {donation.transaction_hash ? 
                      <a 
                        href={`${SCROLL_CONFIG.NETWORK.BLOCK_EXPLORER_URL}/tx/${donation.transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        {`${donation.transaction_hash.slice(0, 8)}...`}
                      </a> : 
                      'N/A'
                    }
                  </span>
                </div>
                {donation.donor_message && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Message</span>
                    <span className="text-sm font-medium text-gray-900">
                      {donation.donor_message}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Status</p>
                  <p className="text-2xl font-bold text-green-900 capitalize">
                    {donation.status || 'Pending'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  {getStatusIcon(donation.status)}
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Additional Information</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Anonymous</span>
                  <span className="text-sm font-medium text-gray-900">
                    {donation.is_anonymous ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(donation.updated_at).toLocaleDateString()}
                  </span>
                </div>
                {donation.verified_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Verified At</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(donation.verified_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderDonationTimeline = () => {
    if (!donation) return null;

    const getStepClasses = (step) => {
      const baseClasses = "w-12 h-12 rounded-full flex items-center justify-center z-10 transition-colors duration-300";
      if (step.isCompleted) {
        return `${baseClasses} ${
          step.color === 'green' ? 'bg-green-100 ring-4 ring-green-50' : 
          step.color === 'indigo' ? 'bg-indigo-100 ring-4 ring-indigo-50' : 
          'bg-gray-100'
        }`;
      }
      return `${baseClasses} bg-gray-100`;
    };

    const getIconClasses = (step) => {
      const baseClasses = "h-6 w-6";
      if (step.isCompleted) {
        return `${baseClasses} ${
          step.color === 'green' ? 'text-green-600' : 
          step.color === 'indigo' ? 'text-indigo-600' : 
          'text-gray-400'
        }`;
      }
      return `${baseClasses} text-gray-400`;
    };

    const timelineSteps = [
      {
        icon: FaHandHoldingHeart,
        title: 'Donation Created',
        date: donation.created_at,
        description: 'Donation was successfully initiated',
        isCompleted: true,
        color: 'green'
      },
      {
        icon: FaLock,
        title: 'Smart Contract Locked',
        date: donation.transaction_hash ? donation.created_at : null,
        description: 'Funds are securely held in the smart contract',
        isCompleted: !!donation.transaction_hash,
        color: 'indigo'
      },
      {
        icon: FaCheckCircle,
        title: 'Donation Completed',
        date: donation.completed_at,
        description: 'Funds have been transferred to the charity',
        isCompleted: donation.status === 'completed',
        color: 'green'
      }
    ];

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-sm p-6 mb-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
          <FaHistory className="mr-2 text-indigo-500" />
          Transaction Flow
        </h3>

        <div className="relative">
          {/* Progress bar */}
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 transform -translate-y-1/2">
            <div 
              className="h-full bg-green-500 transition-all duration-500"
              style={{ 
                width: donation.status === 'completed' ? '100%' : 
                       donation.transaction_hash ? '66%' : '33%' 
              }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {timelineSteps.map((step, index) => (
              <div key={step.title} className="flex flex-col items-center">
                <div className={getStepClasses(step)}>
                  <step.icon className={getIconClasses(step)} />
                </div>
                <div className="mt-3 text-center">
                  <p className={`text-sm font-medium ${
                    step.isCompleted ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                  {step.date && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(step.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderBlockchainVerification = () => {
    if (!donation) return null;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
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
                  {donation.transaction_hash ? `${donation.transaction_hash.slice(0, 8)}...` : 'N/A'}
                </p>
              </div>
                      <a
                href={`https://etherscan.io/tx/${donation.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                className="p-2 text-indigo-600 hover:text-indigo-700 transition-colors duration-200 rounded-full hover:bg-indigo-100"
                title="View on Etherscan"
                      >
                <FaExternalLinkAlt className="h-5 w-5" />
                      </a>
            </div>
                  </div>

          
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading donation details...</p>
        </div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-md">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <FaExclamationTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">{error || 'Donation not found'}</h2>
          <p className="text-gray-600 mb-6">We couldn't find the donation you're looking for. It may have been deleted or you may not have permission to view it.</p>
          <Link 
            to="/donations" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaArrowLeft className="mr-2" /> Back to Donations
          </Link>
        </div>
      </div>
    );
  }

  // Check if this is a fiat-to-scroll donation
  const isFiatToScroll = donation.payment_method === 'fiat_to_scroll';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton className="mb-6" />
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="relative">
            {/* Background Banner */}
            <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            
            {/* Status Badge - Positioned on the banner */}
            <div className="absolute top-4 right-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeClass(donation.status)}`}>
                {getStatusIcon(donation.status)}
                <span className="ml-1">{donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}</span>
              </span>
            </div>

            {/* Main Content */}
            <div className="px-6 py-4 -mt-16">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between">
                <div className="flex items-center">
                  <div className="h-24 w-24 rounded-full bg-white p-1 shadow-md flex items-center justify-center">
                    <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
                      <FaHandHoldingHeart className="h-10 w-10 text-indigo-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h1 className="text-2xl font-bold text-white">Donation #{donation.id}</h1>
                    <p className="text-gray-700">Created on {formatDate(donation.created_at)}</p>
                  </div>
                </div>

                {isOwner() && (
                  <div className="mt-4 md:mt-0 flex space-x-2">
                    <button
                      onClick={viewInvoice}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      <FaFileInvoice className="mr-2" /> View Invoice
                    </button>
                    <button
                      onClick={() => navigate(`/donations/${id}/invoice?download=true`)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      <FaDownload className="mr-2" /> Download Invoice
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Donation Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
              <FaCoins className="mr-2 text-indigo-500" />
              Donation Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-600 font-medium">Amount</p>
                    <p className="text-2xl font-bold text-indigo-900">
                      {typeof donation.amount === 'number' ? 
                        `${donation.currency_type === 'SCROLL' ? 'Ξ' : '$'}${donation.amount.toFixed(2)} ${donation.currency_type}` : 
                        donation.amount}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <FaCoins className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Date</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(donation.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Payment Method</span>
                    <span className="text-sm font-medium text-gray-900 flex items-center">
                      {donation.payment_method === 'blockchain' ? (
                        <>
                          <FaEthereum className="mr-2 text-gray-400" />
                          Blockchain (Scroll)
                        </>
                      ) : (
                        <>
                          <FaCreditCard className="mr-2 text-gray-400" />
                          {donation.payment_method || 'Standard Payment'}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">From</h3>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    {!donation.is_anonymous && user?.ic_number === donation.user_id && user?.profile_picture ? (
                      <img 
                        src={`/storage/${user.profile_picture}`}
                        alt={donation.is_anonymous ? 'Anonymous' : (donation.donor?.name || 'Anonymous')}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.parentNode.innerHTML = '<div class="w-6 h-6 text-gray-500"><svg viewBox="0 0 24 24" fill="currentColor" /></div>';
                          const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                          icon.setAttribute("viewBox", "0 0 24 24");
                          icon.setAttribute("fill", "currentColor");
                          icon.setAttribute("class", "w-6 h-6 text-gray-500");
                          icon.innerHTML = '<path d="M12 12a5 5 0 110-10 5 5 0 010 10zm0 2a10 10 0 00-10 10h20a10 10 0 00-10-10z"/>';
                          e.target.parentNode.firstChild.appendChild(icon);
                        }}
                      />
                    ) : (
                      <FaUser className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {donation.is_anonymous ? 'Anonymous Donor' : (donation.donor?.name || 'Anonymous')}
                    </p>
                    {donation.donor?.wallet_address && !donation.is_anonymous && (
                      <p className="text-xs text-gray-500 font-mono mt-1">
                        {`${donation.donor.wallet_address.slice(0, 6)}...${donation.donor.wallet_address.slice(-4)}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">To</h3>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    {donation.charity?.picture_path ? (
                      <img 
                        src={`/storage/${donation.charity.picture_path}`}
                        alt={donation.charity?.name || 'Charity'}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.parentNode.innerHTML = '<div class="w-6 h-6 text-indigo-500"><svg viewBox="0 0 24 24" fill="currentColor" /></div>';
                          const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                          icon.setAttribute("viewBox", "0 0 24 24");
                          icon.setAttribute("fill", "currentColor");
                          icon.setAttribute("class", "w-6 h-6 text-indigo-500");
                          icon.innerHTML = '<path d="M3 19V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2zm2-2h14V7H5v10z"/>';
                          e.target.parentNode.firstChild.appendChild(icon);
                        }}
                      />
                    ) : (
                      <FaBuilding className="w-6 h-6 text-indigo-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {donation.charity?.name || 'Charity Organization'}
                    </p>
                    {donation.charity?.wallet_address && (
                      <p className="text-xs text-gray-500 font-mono mt-1">
                        {`${donation.charity.wallet_address.slice(0, 6)}...${donation.charity.wallet_address.slice(-4)}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {donation.donor_message && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Message</h3>
                <p className="text-sm text-gray-600 italic">"{donation.donor_message}"</p>
              </div>
            )}
          </div>

          {/* Blockchain Verification */}
          {donation.transaction_hash && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <FaShieldAlt className="mr-2 text-indigo-500" />
                Blockchain Details
              </h2>
              <div className="space-y-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                        <div>
                      <p className="text-sm text-indigo-600 font-medium">Transaction Hash</p>
                      <p className="text-sm font-mono text-indigo-900 mt-1">
                        {donation.transaction_hash ? 
                              <a
                            href={`${SCROLL_CONFIG.NETWORK.BLOCK_EXPLORER_URL}/tx/${donation.transaction_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800"
                              >
                            {`${donation.transaction_hash.slice(0, 8)}...${donation.transaction_hash.slice(-8)}`}
                          </a> : 
                          'N/A'
                        }
                      </p>
                        </div>
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <FaShieldAlt className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                </div>

                
              </div>
            </div>
          )}

          {/* Impact Section */}
          {donation.status === 'completed' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <FaHandHoldingHeart className="mr-2 text-indigo-500" />
                Your Impact
              </h2>

              <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                <div className="flex">
                  <FaHandHoldingHeart className="h-8 w-8 text-indigo-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-indigo-800">Thank You for Your Donation!</h3>
                    <p className="text-indigo-700 mt-2">
                      Your donation of {donation.amount} {donation.currency_type} helps provide essential support to those in need.
                      {donation.payment_method === 'blockchain' && ' With blockchain verification, you can be confident that your contribution is being used as intended.'}
                    </p>
                </div>
              </div>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <FaUser className="h-6 w-6 text-blue-600" />
                </div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {donation.charity?.people_affected ?
                      Math.floor((donation.amount / donation.charity.fund_targeted) * donation.charity.people_affected) :
                      Math.floor(donation.amount * 2.5)}
                  </h4>
                  <p className="text-sm text-gray-500">People Directly Helped</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <FaHandHoldingHeart className="h-6 w-6 text-green-600" />
            </div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {donation.charity?.people_affected ? 
                      Math.floor((donation.amount / donation.charity.fund_targeted) * donation.charity.people_affected * 0.4) : 
                      Math.floor(donation.amount / 10)}
                  </h4>
                  <p className="text-sm text-gray-500">Children Supported</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                    <FaBuilding className="h-6 w-6 text-purple-600" />
                </div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {donation.charity?.people_affected ? 
                      Math.floor((donation.amount / donation.charity.fund_targeted) * donation.charity.people_affected * 0.2) : 
                      Math.floor(donation.amount / 20)}
                  </h4>
                  <p className="text-sm text-gray-500">Families Assisted</p>
                  </div>
                </div>

              {donation.charity?.people_affected && (
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Charity Goal Progress</h4>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-700">Fundraising Goal</span>
                    <span className="text-xs font-medium text-gray-700">
                      {donation.amount} {donation.currency_type} of {donation.charity.fund_targeted} {donation.currency_type}
                    </span>
                </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${Math.min(100, ((donation.amount) / donation.charity.fund_targeted) * 100)}%` }}
                    ></div>
              </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This charity aims to help {donation.charity.people_affected.toLocaleString()} people in total.
                    Your donation contributes to {((donation.amount / donation.charity.fund_targeted) * 100).toFixed(2)}% of their funding goal.
                </p>
                </div>
              )}

              <div className="text-center">
                    <Link 
                  to={`/charities/${donation.cause_id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                  Learn More About This Charity
                  <span className="ml-2" aria-hidden="true">→</span>
                    </Link>
              </div>
            </div>
          )}

          {/* Invoice Section - Only visible to owner */}
          {isOwner() && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <FaFileInvoice className="mr-2 text-indigo-500" />
                Donation Receipt
              </h2>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Receipt #{donation.id}</h3>
                      <p className="text-xs text-gray-500 mt-1">Generated on {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={viewInvoice}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <FaEye className="mr-2 text-gray-400" />
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/donations/${id}/invoice?download=true`)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <FaDownload className="mr-2 text-gray-400" />
                        Download
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <FaPrint className="mr-2 text-gray-400" />
                        Print
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-xs text-gray-500">Transaction ID</dt>
                        <dd className="text-sm font-medium text-gray-900 font-mono mt-1">
                          {donation.transaction_hash ? 
                            `${donation.transaction_hash.slice(0, 8)}...${donation.transaction_hash.slice(-8)}` : 
                            'N/A'
                          }
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Payment Method</dt>
                        <dd className="text-sm font-medium text-gray-900 mt-1">
                          {donation.payment_method === 'blockchain' ? 'Blockchain (Scroll)' : 'Standard Payment'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Amount</dt>
                        <dd className="text-sm font-medium text-gray-900 mt-1">
                          {typeof donation.amount === 'number' ? 
                            `${donation.currency_type === 'SCROLL' ? 'Ξ' : '$'}${donation.amount.toFixed(2)} ${donation.currency_type}` : 
                            donation.amount}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Status</dt>
                        <dd className="text-sm font-medium text-gray-900 mt-1 capitalize">
                          {donation.status}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

