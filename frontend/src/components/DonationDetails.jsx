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
  FaInfoCircle
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
    // Update to use Scroll Sepolia contract address
    window.open('https://sepolia.scrollscan.com/address/0x7867fC939F10377E309a3BF55bfc194F672B0E84', '_blank');
  };

  const getBlockExplorerLink = () => {
    return `${SCROLL_CONFIG.NETWORK.BLOCK_EXPLORER_URL}/address/0x7867fC939F10377E309a3BF55bfc194F672B0E84`;
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

  // Add this function near your other permission check functions
  const isOwner = () => {
    return user?.id === donation.user_id;
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
          {isOwner() && (
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
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
          )}

          {/* Blockchain Verification Section */}
          {donation.transaction_hash && (
            <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Blockchain Verification</h3>
              
              <div className="mb-3 bg-blue-50 rounded-md p-3">
                <p className="text-sm text-blue-700">
                  <FaInfoCircle className="inline-block mr-1" />
                  This section verifies your original donation transaction on the blockchain. This ensures your donation was recorded transparently and immutably.
                </p>
              </div>

              {/* Use the TransactionVerifier component */}
              <TransactionVerifier
                transactionHash={donation.transaction_hash}
                autoVerify={true}
                onVerificationComplete={(result) => {
                  console.log('Transaction verification result:', result);
                  if (result.verified || result.success) {
                    toast.success('Transaction verified on blockchain!');
                  } else if (result.isMockHash) {
                    toast.warning('This appears to be a test transaction that does not exist on the blockchain');
                  } else {
                    toast.error('Could not verify transaction on blockchain. It may be pending or not found.');
                  }
                }}
              />

              <div className="mt-4 bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Transaction Hash</dt>
                    <dd className="mt-1 text-sm text-gray-900 break-all">
                      {donation.transaction_hash}
                      <a
                        href="https://sepolia.scrollscan.com/address/0x7867fC939F10377E309a3BF55bfc194F672B0E84"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                      >
                        <FaExternalLinkAlt className="h-3 w-3 mr-1" />
                        View Contract on Scrollscan
                      </a>
                    </dd>
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
              </div>

              {donation.status === 'completed' && (
                <div className="mt-4 p-4 bg-green-50 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaCheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Funds Successfully Transferred</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>
                          This donation has been verified and the funds have been securely transferred to the charity's wallet.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Impact Section */}
          {(donation.status === 'completed' || donation.status === 'pending' || donation.status === 'confirmed' || donation.status === 'verified') && (
            <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Your Impact</h3>
              <div className="mt-4">
                <div className="bg-indigo-50 p-4 rounded-md mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaHandHoldingHeart className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-indigo-800">Thank You for Your Donation!</h3>
                      <div className="mt-2 text-sm text-indigo-700">
                        <p>
                          Your donation of {donation.amount} {donation.currency_type} helps provide essential support to those in need.
                          {donation.payment_method === 'blockchain' && ' With blockchain verification, you can be confident that your contribution is being used as intended.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Impact Metrics */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Real Impact of Your Donation</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                      <span className="text-2xl font-bold text-indigo-600">
                        {donation.charity?.people_affected ?
                          Math.floor((donation.amount / donation.charity.fund_targeted) * donation.charity.people_affected) :
                          Math.floor(donation.amount * 2.5)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">People Directly Helped</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                      <span className="text-2xl font-bold text-green-600">
                        {donation.charity?.people_affected ?
                          Math.floor((donation.amount / donation.charity.fund_targeted) * donation.charity.people_affected * 0.4) :
                          Math.floor(donation.amount / 10)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">Children Supported</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                      <span className="text-2xl font-bold text-blue-600">
                        {donation.charity?.people_affected ?
                          Math.floor((donation.amount / donation.charity.fund_targeted) * donation.charity.people_affected * 0.2) :
                          Math.floor(donation.amount / 20)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">Families Assisted</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                      <span className="text-2xl font-bold text-purple-600">
                        {donation.charity?.people_affected ?
                          Math.floor((donation.amount / donation.charity.fund_targeted) * donation.charity.people_affected * 3) :
                          Math.floor(donation.amount / 5)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">Meals Provided</p>
                    </div>
                  </div>
                  {donation.charity?.people_affected && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      This charity aims to help {donation.charity.people_affected.toLocaleString()} people in total.
                      Your donation contributes to {((donation.amount / donation.charity.fund_targeted) * 100).toFixed(2)}% of their funding goal.
                    </p>
                  )}
                </div>

                {/* Donation Flow Visualization */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Donation Journey</h4>
                  <div className="relative">
                    {/* Progress bar */}
                    <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gray-200"></div>

                    {/* Steps */}
                    <div className="relative space-y-8">
                      {/* Step 1: Donation Made */}
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-4 sm:mr-8">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${donation.status ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            <FaHandHoldingHeart className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                          <div>
                            <div className="text-sm font-medium text-gray-900">Donation Made</div>
                            <p className="mt-1 text-sm text-gray-500">
                              You donated {donation.amount} {donation.currency_type} to {donation.charity?.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">{formatDate(donation.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Step 2: Verification */}
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-4 sm:mr-8">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${donation.status === 'verified' || donation.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            <FaCheckCircle className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                          <div>
                            <div className="text-sm font-medium text-gray-900">Task Verification</div>
                            <p className="mt-1 text-sm text-gray-500">
                              {donation.status === 'verified' || donation.status === 'completed'
                                ? 'The charity has verified task completion with proof documents'
                                : 'Waiting for the charity to verify task completion'}
                            </p>
                            {donation.verified_at && (
                              <p className="mt-1 text-xs text-gray-400">{formatDate(donation.verified_at)}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Step 3: Fund Transfer */}
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-4 sm:mr-8">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${donation.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            <FaExchangeAlt className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                          <div>
                            <div className="text-sm font-medium text-gray-900">Funds Released</div>
                            <p className="mt-1 text-sm text-gray-500">
                              {donation.status === 'completed'
                                ? 'Funds have been transferred to the charity wallet'
                                : 'Funds will be transferred to the charity after admin verification'}
                            </p>
                            {donation.completed_at && (
                              <p className="mt-1 text-xs text-gray-400">{formatDate(donation.completed_at)}</p>
                            )}
                            {donation.transfer_transaction_hash && (
                              <a
                                href={`${SCROLL_CONFIG.NETWORK.BLOCK_EXPLORER_URL}/tx/${donation.transfer_transaction_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800"
                              >
                                View transfer transaction
                                <FaExternalLinkAlt className="ml-1 h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Task Pictures */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Charity Projects & Activities</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {donation.charity?.tasks && donation.charity.tasks.length > 0 ? (
                      // Show actual task pictures if available
                      donation.charity.tasks.slice(0, 2).map((task, index) => (
                        <div key={index} className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                          <img
                            src={task.pictures && task.pictures.length > 0
                              ? formatImageUrl(task.pictures[0].path)
                              : `https://source.unsplash.com/random/600x400/?charity,${index}`}
                            alt={task.name}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-3 bg-white">
                            <h5 className="text-sm font-medium text-gray-800">{task.name}</h5>
                            <p className="text-xs text-gray-500 mt-1">{task.description.substring(0, 60)}...</p>
                            <Link
                              to={`/tasks/${task.id}`}
                              className="mt-2 inline-block text-xs text-indigo-600 hover:text-indigo-800"
                            >
                              View task details
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      // Fallback to placeholder images
                      <>
                        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                          <img
                            src={`https://source.unsplash.com/random/600x400/?charity,help,${donation.charity?.name?.split(' ')[0]}`}
                            alt="Charity Project"
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-3 bg-white">
                            <h5 className="text-sm font-medium text-gray-800">Food Distribution Program</h5>
                            <p className="text-xs text-gray-500 mt-1">Providing essential nutrition to families in need</p>
                          </div>
                        </div>
                        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                          <img
                            src={`https://source.unsplash.com/random/600x400/?volunteer,${donation.charity?.name?.split(' ')[0]}`}
                            alt="Charity Project"
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-3 bg-white">
                            <h5 className="text-sm font-medium text-gray-800">Community Support Initiative</h5>
                            <p className="text-xs text-gray-500 mt-1">Building stronger communities through education and support</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Charity Goal Progress</h4>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700">Fundraising Goal</span>
                      <span className="text-xs font-medium text-gray-700">
                        {donation.amount} {donation.currency_type} of {donation.charity?.fund_targeted || 10} {donation.currency_type}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${Math.min(100, ((donation.amount) / (donation.charity?.fund_targeted || 10)) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Your donation helps us reach our funding goal to serve more people in need.</p>
                  </div>
                </div>

                <div className="text-center">
                  <Link
                    to={`/charities/${donation.charity_id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Learn More About {donation.charity?.name || 'This Charity'}
                    <span className="ml-2" aria-hidden="true">→</span>
                  </Link>
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
                <AdminFundReleaseButton
                  type="donation"
                  id={id}
                  onSuccess={(data) => {
                    setDonation({...donation, status: 'completed', completed_at: new Date().toISOString(), transfer_transaction_hash: data.transaction_hash});
                  }}
                />
              )}
              
              {/* Add explanation about fund release vs donation */}
              <div className="mt-4 bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  <FaInfoCircle className="inline-block mr-1 text-gray-500" />
                  <strong>How fund release works:</strong> The original donation transaction records your contribution to the smart contract. After task verification, a separate fund release transaction transfers funds from the contract to the charity's wallet.
                </p>
                {donation.transfer_transaction_hash && (
                  <div className="mt-2">
                    <Link 
                      to={`/transactions/${donation.transfer_transaction_id || donation.id}`}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      View fund release transaction details →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Donation Completed Section - Now handled in the Donation Journey visualization */}
        </div>
      </div>
    </div>
  );
}
