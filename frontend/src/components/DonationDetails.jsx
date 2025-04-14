import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
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
  FaPrint
} from 'react-icons/fa';
import { ethers } from 'ethers';
import { DonationContractABI } from '../utils/contractABI';
import { formatImageUrl } from '../utils/helpers';
import BackButton from './BackToHistory';
import { SCROLL_CONFIG } from '../utils/scrollConfig';
import { getDonationDetails } from '../services/donationService';

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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const data = await getDonationDetails(id);
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

  const handleComplete = async () => {
    if (!window.confirm('Are you sure you want to release the funds?')) return;

    try {
      setStatusLoading(true);
      const response = await axios.post(`/donations/${donation.id}`, {
        action: 'complete'
      });
      setDonation(response.data.donation);
      toast.success('Funds released successfully');
    } catch (err) {
      console.error('Error releasing funds:', err);
      toast.error('Failed to release funds');
    } finally {
      setStatusLoading(false);
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
    // Update to use Sepolia block explorer
    window.open(`https://sepolia.etherscan.io/tx/${donation.transaction_hash}`, '_blank');
  };

  const getBlockExplorerLink = (hash) => {
    return `${SCROLL_CONFIG.NETWORK.BLOCK_EXPLORER_URL}/tx/${hash}`;
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
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const viewInvoice = () => {
    navigate(`/donations/${id}/invoice`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">{error || 'Donation not found'}</h2>
          <p className="mt-2">Please try again later</p>
          <Link to="/donations" className="mt-4 inline-block text-indigo-600 hover:text-indigo-900">
            Back to Donations
          </Link>
        </div>
      </div>
    );
  }

  // Check if this is a fiat-to-scroll donation
  const isFiatToScroll = donation.payment_method === 'fiat_to_scroll';

  return (
    <div className="min-h-screen">
        <BackButton className="mb-4" />
      <div className="max-w-4xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Donation Details</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Donation ID: {donation.id}
                </p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(donation.status)}`}>
                {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              {isFiatToScroll && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Payment Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Fiat to Scroll Conversion
                    </span>
                  </dd>
                </div>
              )}

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Amount</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {donation.amount} {donation.currency_type}
                  
                  {isFiatToScroll && donation.fiat_amount && (
                    <div className="mt-2 flex items-center text-sm text-gray-600">
                      <FaDollarSign className="mr-1 text-green-500" />
                      <span>Originally {donation.fiat_amount} {donation.fiat_currency}</span>
                    </div>
                  )}
                </dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(donation.created_at)}</dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                <dd className="mt-1 text-sm text-gray-900 flex items-center">
                  {donation.payment_method === 'blockchain' ? (
                    <>
                      <FaEthereum className="mr-1 text-indigo-600" />
                      <span>Blockchain</span>
                    </>
                  ) : (
                    <>
                      <FaCreditCard className="mr-1 text-gray-600" />
                      <span>Credit Card</span>
                    </>
                  )}
                </dd>
              </div>

              {isFiatToScroll && donation.exchange_rate && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Exchange Rate</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    1 SCROLL = {donation.exchange_rate} {donation.fiat_currency}
                    <div className="mt-1 text-xs text-gray-500">
                      Converted on {formatDate(donation.created_at)}
                    </div>
                  </dd>
                </div>
              )}

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">From</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {!donation.is_anonymous && donation.user ? (
                    <div className="flex items-center">
                      {donation.user.profile_picture && (
                        <img
                          src={formatImageUrl(donation.user.profile_picture)}
                          alt={donation.user.name}
                          className="h-8 w-8 rounded-full mr-2"
                        />
                      )}
                      <Link to={`/users/${donation.user.id}`} className="text-indigo-600 hover:text-indigo-900">
                        {donation.user.name}
                      </Link>
                    </div>
                  ) : (
                    'Anonymous Donor'
                  )}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">To</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex items-center">
                    {donation.charity?.logo && (
                      <img
                        src={formatImageUrl(donation.charity.logo)}
                        alt={donation.charity.name}
                        className="h-8 w-8 rounded-full mr-2"
                      />
                    )}
                    <Link to={`/charities/${donation.charity_id}`} className="text-indigo-600 hover:text-indigo-900">
                      {donation.charity?.name}
                    </Link>
                  </div>
                </dd>
              </div>

              {donation.donor_message && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Message</dt>
                  <dd className="mt-1 text-sm text-gray-900">{donation.donor_message}</dd>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Section */}
          <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Donation Receipt</h3>
            
            <div className="mt-4 bg-gray-50 p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaFileInvoice className="h-5 w-5 text-indigo-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Invoice #{donation.id}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={viewInvoice}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FaFileAlt className="mr-1" /> View Invoice
                  </button>
                  <button
                    onClick={() => navigate(`/donations/${id}/invoice?download=true`)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FaDownload className="mr-1" /> Download
                  </button>
                </div>
              </div>
              
              <div className="mt-3">
                <p className="text-xs text-gray-500">
                  This donation receipt serves as your official record for tax purposes. 
                  View or download the full invoice for detailed information.
                </p>
              </div>
            </div>
          </div>

          {/* Blockchain Verification Section */}
          {donation.payment_method === 'blockchain' && donation.transaction_hash && (
            <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Blockchain Verification</h3>
              
              <div className="mt-4">
                <div className="flex items-center mb-4">
                  <div className={`flex-shrink-0 h-5 w-5 rounded-full ${donation.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}></div>
                  <p className="text-sm font-medium text-gray-900">
                    {donation.status === 'completed' ? 'Verified on Blockchain' : 'Pending Verification'}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Transaction Hash</dt>
                      <dd className="mt-1 text-sm text-gray-900 break-all">{donation.transaction_hash}</dd>
                    </div>
                    
                    {donation.smart_contract_data && (
                      <>
                        <div>
                          <dt className="text-xs font-medium text-gray-500">From Address</dt>
                          <dd className="mt-1 text-sm text-gray-900 break-all">
                            {JSON.parse(donation.smart_contract_data).from}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-500">To Address (Contract)</dt>
                          <dd className="mt-1 text-sm text-gray-900 break-all">
                            {JSON.parse(donation.smart_contract_data).to}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Block Number</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {JSON.parse(donation.smart_contract_data).blockNumber}
                          </dd>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <a 
                      href={getBlockExplorerLink(donation.transaction_hash)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                    >
                      View on Scroll Explorer
                      <FaExternalLinkAlt className="ml-1 h-4 w-4" />
                    </a>
                  </div>
                </div>
                
                {donation.status === 'completed' && (
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
                            This donation has been verified on the blockchain, ensuring transparency and immutability.
                            The funds have been securely transferred according to the smart contract rules.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Impact Section */}
          {donation.status === 'completed' && (
            <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Your Impact</h3>
              <div className="mt-4">
                {donation.impact_metrics ? (
                  <div className="space-y-4">
                    <div className="bg-indigo-50 p-4 rounded-md">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <FaHandHoldingHeart className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-indigo-800">Thank You for Your Donation!</h3>
                          <div className="mt-2 text-sm text-indigo-700">
                            <p>Your donation is making a real difference. Here's how:</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Impact Metrics Dashboard */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      <div className="px-4 py-5 sm:p-6">
                        <h4 className="text-base font-semibold text-gray-900 flex items-center">
                          <FaChartLine className="mr-2 text-indigo-500" />
                          Impact Metrics
                        </h4>
                        
                        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                          {donation.impact_metrics.map((metric, index) => (
                            <div key={index} className="bg-gray-50 px-4 py-5 rounded-lg text-center">
                              <div className="text-3xl font-bold text-indigo-600">{metric.value}</div>
                              <div className="mt-1 text-sm font-medium text-gray-500">{metric.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Impact Stories */}
                    {donation.impact_stories && donation.impact_stories.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="px-4 py-5 sm:p-6">
                          <h4 className="text-base font-semibold text-gray-900 mb-4">Impact Stories</h4>
                          <div className="space-y-4">
                            {donation.impact_stories.map((story, index) => (
                              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                {story.image && (
                                  <img 
                                    src={formatImageUrl(story.image)} 
                                    alt={story.title} 
                                    className="h-48 w-full object-cover rounded-md mb-3"
                                  />
                                )}
                                <h5 className="font-medium text-gray-900">{story.title}</h5>
                                <p className="mt-1 text-sm text-gray-600">{story.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Progress Towards Goals */}
                    {donation.impact_goals && (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="px-4 py-5 sm:p-6">
                          <h4 className="text-base font-semibold text-gray-900 mb-4">Progress Towards Goals</h4>
                          <div className="space-y-4">
                            {donation.impact_goals.map((goal, index) => (
                              <div key={index}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium text-gray-700">{goal.label}</span>
                                  <span className="text-sm font-medium text-gray-700">
                                    {goal.current} / {goal.target} ({Math.round((goal.current / goal.target) * 100)}%)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-indigo-600 h-2.5 rounded-full" 
                                    style={{ width: `${Math.min(100, Math.round((goal.current / goal.target) * 100))}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Impact Update Timeline */}
                    {donation.impact_updates && donation.impact_updates.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="px-4 py-5 sm:p-6">
                          <h4 className="text-base font-semibold text-gray-900 mb-4">Impact Updates</h4>
                          <div className="flow-root">
                            <ul className="-mb-8">
                              {donation.impact_updates.map((update, index) => (
                                <li key={index}>
                                  <div className="relative pb-8">
                                    {index !== donation.impact_updates.length - 1 ? (
                                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                    ) : null}
                                    <div className="relative flex space-x-3">
                                      <div>
                                        <span className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white">
                                          <FaCalendarAlt className="h-4 w-4 text-white" />
                                        </span>
                                      </div>
                                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                        <div>
                                          <p className="text-sm text-gray-500">
                                            {update.title}
                                          </p>
                                          <p className="mt-1 text-sm text-gray-700">{update.description}</p>
                                        </div>
                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                          {formatDate(update.date)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FaExclamationCircle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Impact details coming soon</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>The organization is currently working on collecting impact data. Check back later for detailed information on how your donation is making a difference.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Share Impact */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      const shareText = `I just made a donation to ${donation.charity?.name} through TrustChain and it's making a real difference!`;
                      const shareUrl = window.location.href;
                      
                      // Use Web Share API if available
                      if (navigator.share) {
                        navigator.share({
                          title: 'My Donation Impact',
                          text: shareText,
                          url: shareUrl,
                        });
                      } else {
                        // Fallback to copying to clipboard
                        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                        toast.success('Share link copied to clipboard!');
                      }
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Share My Impact
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Task proof section (if applicable) */}
          {donation.task_proof && donation.task_proof.length > 0 && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Task Proof</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Evidence of task completion
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {donation.task_proof.map((proof, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      {proof.type.startsWith('image/') ? (
                        <img 
                          src={`${process.env.REACT_APP_API_URL}/storage/${proof.path}`} 
                          alt={`Proof ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="h-48 flex items-center justify-center bg-gray-100">
                          <FaFileAlt className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="p-4">
                        <p className="text-sm font-medium text-gray-900 truncate">{proof.name}</p>
                        <p className="text-xs text-gray-500">
                          Uploaded: {new Date(proof.uploaded_at).toLocaleDateString()}
                        </p>
                        <a 
                          href={`${process.env.REACT_APP_API_URL}/storage/${proof.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          View File
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Verification notes (if applicable) */}
          {donation.verification_notes && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Verification Notes</h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <p className="text-sm text-gray-700 whitespace-pre-line">{donation.verification_notes}</p>
              </div>
            </div>
          )}

          {/* Upload Task Proof Section */}
          {donation.status === 'confirmed' && user?.id === donation.charity?.organization_id && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Upload Task Proof</h3>
              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Proof Files</label>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleFileChange}
                    className="w-full"
                  />
                  {uploadError && (
                    <p className="text-red-500 text-sm mt-1">{uploadError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Verification Notes</label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    className="w-full p-2 border rounded"
                    rows="3"
                    placeholder="Describe how the funds were used and what was accomplished"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  Submit Verification
                </button>
              </form>
            </div>
          )}

          {/* Task Verification Section */}
          {donation.status === 'verified' && donation.task_proof && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Task Verification</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-600">Verification Notes:</span>
                  <p className="mt-1">{donation.verification_notes}</p>
                </div>
                <div>
                  <span className="text-gray-600">Proof Files:</span>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    {donation.task_proof.map((proof, index) => (
                      <a
                        key={index}
                        href={`/storage/${proof.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {proof.name}
                      </a>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Verified At:</span>
                  <p className="mt-1">{formatDate(donation.verified_at)}</p>
                </div>
              </div>

              {user?.is_admin && (
                <button
                  onClick={handleComplete}
                  className="mt-4 w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
                >
                  Release Funds
                </button>
              )}
            </div>
          )}

          {/* Donation Completed Section */}
          {donation.status === 'completed' && (
            <div className="mt-8 border-t">
              <div className="bg-green-50 p-4 rounded">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Donation Completed
                </h3>
                <p className="text-green-700">
                  Funds were released on {formatDate(donation.completed_at)}
                </p>
                
                {donation.transfer_transaction_hash && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Transfer Transaction:</span>
                    </p>
                    <p className="text-xs break-all mt-1">
                      <a
                        href={`${SCROLL_CONFIG.NETWORK.BLOCK_EXPLORER_URL}/tx/${donation.transfer_transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        {donation.transfer_transaction_hash.slice(0, 6)}...{donation.transfer_transaction_hash.slice(-4)}
                        <FaExternalLinkAlt className="ml-2" />
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 