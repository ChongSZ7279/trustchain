import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function DonationDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proofFiles, setProofFiles] = useState([]);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const response = await axios.get(`/api/donations/${id}`);
        setDonation(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch donation details');
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
      const response = await axios.post(`/api/donations/${donation.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDonation(response.data.donation);
      setProofFiles([]);
      setVerificationNotes('');
    } catch (error) {
      setUploadError(error.response?.data?.message || 'Failed to upload proof');
    }
  };

  const handleComplete = async () => {
    if (!window.confirm('Are you sure you want to release the funds?')) return;

    try {
      const response = await axios.post(`/api/donations/${donation.id}`, {
        action: 'complete'
      });
      setDonation(response.data.donation);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to complete donation');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Donation not found</p>
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
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'verified':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-800">Donation Details</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(donation.status)}`}>
              {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex justify-between border-b pb-4">
              <span className="text-gray-600">Amount</span>
              <span className="font-semibold">
                {donation.amount} {donation.currency_type}
              </span>
            </div>

            <div className="flex justify-between border-b pb-4">
              <span className="text-gray-600">Date</span>
              <span className="font-semibold">{formatDate(donation.created_at)}</span>
            </div>

            {donation.donor_message && (
              <div className="border-b pb-4">
                <span className="text-gray-600">Message</span>
                <p className="mt-2 text-gray-800">{donation.donor_message}</p>
              </div>
            )}

            <div className="flex justify-between border-b pb-4">
              <span className="text-gray-600">Donor</span>
              <span className="font-semibold">
                {donation.is_anonymous ? 'Anonymous' : donation.user?.name || 'Unknown'}
              </span>
            </div>

            {donation.transaction_hash && (
              <div className="border-b pb-4">
                <span className="text-gray-600">Blockchain Transaction</span>
                <div className="mt-2">
                  <a
                    href={`https://etherscan.io/tx/${donation.transaction_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all"
                  >
                    {donation.transaction_hash}
                  </a>
                </div>
              </div>
            )}

            {donation.smart_contract_data && (
              <div className="border-b pb-4">
                <span className="text-gray-600">Smart Contract Details</span>
                <div className="mt-2 space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Contract Address:</span>{' '}
                    <a
                      href={`https://etherscan.io/address/${donation.smart_contract_data.contract_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline break-all"
                    >
                      {donation.smart_contract_data.contract_address}
                    </a>
                  </p>
                  <p>
                    <span className="font-medium">Block Number:</span>{' '}
                    {donation.smart_contract_data.block_number}
                  </p>
                  <p>
                    <span className="font-medium">Gas Used:</span>{' '}
                    {donation.smart_contract_data.gas_used}
                  </p>
                  <p>
                    <span className="font-medium">Timestamp:</span>{' '}
                    {formatDate(donation.smart_contract_data.timestamp)}
                  </p>
                </div>
              </div>
            )}
          </div>

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
            <div className="mt-8 border-t pt-6">
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

          <div className="mt-8 flex justify-between">
            <Link
              to={`/charities/${donation.cause_id}`}
              className="text-blue-500 hover:text-blue-600"
            >
              ← Back to Charity
            </Link>
            {(user?.is_admin || user?.id === donation.user_id) && donation.status === 'pending' && (
              <button
                onClick={async () => {
                  if (window.confirm('Are you sure you want to cancel this donation?')) {
                    try {
                      await axios.delete(`/api/donations/${donation.id}`);
                      window.location.href = `/charities/${donation.cause_id}`;
                    } catch (error) {
                      alert(error.response?.data?.message || 'Failed to cancel donation');
                    }
                  }
                }}
                className="text-red-500 hover:text-red-600"
              >
                Cancel Donation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 