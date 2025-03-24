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
} from 'react-icons/fa';
import { ethers } from 'ethers';
import { DonationContractABI } from '../utils/contractABI';
import { formatImageUrl } from '../utils/helpers';
import BackButton from './BackToHistory';

export default function DonationDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proofFiles, setProofFiles] = useState([]);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDonationDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/donations/${id}`);
        setDonation(response.data);
      } catch (err) {
        console.error('Error fetching donation details:', err);
        setError('Failed to fetch donation details');
      } finally {
        setLoading(false);
      }
    };

    fetchDonationDetails();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-medium text-red-800 mb-2">{error}</h3>
          <p className="text-gray-600 mb-6">We couldn't load the donation details. Please try again.</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FaArrowLeft className="mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
          <FaExclamationCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">Donation Not Found</h3>
          <p className="text-gray-600 mb-6">The donation you're looking for doesn't exist or you don't have permission to view it.</p>
          <button
            onClick={() => navigate('/donations')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FaArrowLeft className="mr-2" />
            Back to Donations
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
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

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Donation Details</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Donation ID: {donation.id}
                </p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(donation.status)}`}>
                {getStatusIcon(donation.status)}
                <span className="ml-1">{donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}</span>
              </span>
            </div>
          </div>

          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Donation Type</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Charity Donation
                  </span>
                </dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Amount</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex items-center">
                    <FaCoins className="text-yellow-500 mr-1" />
                    ${parseFloat(donation.amount).toFixed(2)} {donation.currency_type}
                  </div>
                </dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(donation.created_at)}</dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                <dd className="mt-1 text-sm text-gray-900">{donation.payment_method || 'Credit Card'}</dd>
              </div>

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

          {/* Blockchain Verification Section */}
          {donation.transaction_hash && (
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900">Blockchain Verification</h3>
              <div className="mt-4">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 mr-2"></div>
                  <p className="text-sm font-medium text-gray-900">
                    Verified on Blockchain
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Transaction Hash</dt>
                      <dd className="mt-1 text-sm text-gray-900 break-all">{donation.transaction_hash}</dd>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <button onClick={viewOnBlockExplorer} className="text-sm text-indigo-600 hover:text-indigo-900">
                      View on Sepolia Explorer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Impact Section */}
          {donation.status === 'completed' && (
            <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Your Impact</h3>
              <div className="mt-4 bg-indigo-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaHandHoldingHeart className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-indigo-800">Thank You for Your Donation!</h3>
                    <div className="mt-2 text-sm text-indigo-700">
                      <p>Your donation helps provide essential support to those in need.</p>
                    </div>
                  </div>
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

          {donation.status === 'completed' && (
            <div className="mt-8 border-t">
              <div className="bg-green-50 p-4 rounded">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Donation Completed
                </h3>
                <p className="text-green-700">
                  Funds were released on {formatDate(donation.completed_at)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 