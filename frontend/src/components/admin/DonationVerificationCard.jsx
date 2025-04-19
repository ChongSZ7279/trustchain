import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { formatImageUrl } from '../../utils/helpers';
import AdminFundReleaseButton from '../AdminFundReleaseButton';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaFileAlt,
  FaImages,
  FaExternalLinkAlt,
  FaEye,
  FaWallet,
  FaEthereum,
  FaUser,
  FaBuilding
} from 'react-icons/fa';

export default function DonationVerificationCard({ donation, onStatusUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [viewingProof, setViewingProof] = useState(false);
  const [currentProofIndex, setCurrentProofIndex] = useState(0);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <FaExclamationTriangle className="mr-1 h-3 w-3" />
            Pending Verification
          </span>
        );
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaExclamationTriangle className="mr-1 h-3 w-3" />
            Verified (Awaiting Fund Release)
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1 h-3 w-3" />
            Completed (Funds Released)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
    }
  };

  // Handle verification of a pending donation
  const handleVerify = async () => {
    try {
      const response = await axios.post(`/admin/verification/donations/${donation.id}/verify`);
      if (response.data.success) {
        toast.success('Donation verified successfully');
        onStatusUpdate(donation.id, 'verified');
      } else {
        toast.error(response.data.message || 'Failed to verify donation');
      }
    } catch (error) {
      console.error('Error verifying donation:', error);
      toast.error('Failed to verify donation: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              <Link to={`/donations/${donation.id}`} className="hover:text-indigo-600">
                Donation #{donation.id}
              </Link>
            </h3>
            <div className="mt-1 flex items-center">
              <span className="text-sm text-gray-500">Charity:</span>
              <Link to={`/charities/${donation.cause_id}`} className="ml-1 text-sm text-indigo-600 hover:text-indigo-900">
                {donation.charity?.name}
              </Link>
            </div>
            <div className="mt-2 flex items-center">
              <FaEthereum className="text-indigo-600 mr-1" />
              <span className="text-sm font-medium text-gray-900">
                {donation.amount} {donation.currency_type}
              </span>
            </div>
            <div className="mt-2">
              {getStatusBadge(donation.status)}
            </div>
          </div>

          <div className="mt-4 sm:mt-0 flex flex-col sm:items-end">
            <div className="text-sm text-gray-500">
              Donation Date: {formatDate(donation.created_at)}
            </div>
            <div className="text-sm text-gray-500">
              Verified At: {formatDate(donation.verified_at)}
            </div>

            {donation.status === 'pending' && (
              <div className="mt-4">
                <button
                  onClick={handleVerify}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaCheckCircle className="mr-2" />
                  Verify Donation
                </button>
              </div>
            )}

            {donation.status === 'verified' && (
              <div className="mt-4">
                <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600">
                  <FaExclamationTriangle className="mr-2" />
                  Awaiting Task Verification
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Funds will be released when a task is verified
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-indigo-600 hover:text-indigo-900 focus:outline-none"
          >
            {expanded ? 'Show Less' : 'Show More Details'}
          </button>
        </div>

        {expanded && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Donor Information</h4>
                <div className="mt-1 space-y-2">
                  <div className="flex items-center">
                    <FaUser className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {donation.is_anonymous ? 'Anonymous Donor' : donation.user?.name || 'Unknown'}
                    </span>
                  </div>

                  {donation.donor_message && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Message:</span>
                      <p className="mt-1 text-sm text-gray-900">{donation.donor_message}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Verification Details</h4>
                <div className="mt-1 space-y-2">
                  {donation.task_proof && donation.task_proof.length > 0 && (
                    <div className="flex items-center">
                      <FaFileAlt className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {donation.task_proof.length} proof file(s) uploaded
                      </span>
                      <button
                        onClick={() => setViewingProof(true)}
                        className="ml-2 text-xs text-indigo-600 hover:text-indigo-900 focus:outline-none"
                      >
                        <FaEye className="inline mr-1" />
                        View
                      </button>
                    </div>
                  )}

                  {donation.verification_notes && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Verification Notes:</span>
                      <p className="mt-1 text-sm text-gray-900">{donation.verification_notes}</p>
                    </div>
                  )}

                  <div className="flex items-center">
                    <FaWallet className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      Charity Wallet: {donation.charity?.organization?.wallet_address ?
                        `${donation.charity.organization.wallet_address.substring(0, 6)}...${donation.charity.organization.wallet_address.substring(donation.charity.organization.wallet_address.length - 4)}` :
                        'Not set'}
                    </span>
                  </div>

                  {donation.transaction_hash && (
                    <div className="flex items-center">
                      <FaEthereum className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        Transaction: {`${donation.transaction_hash.substring(0, 6)}...${donation.transaction_hash.substring(donation.transaction_hash.length - 4)}`}
                      </span>
                      <a
                        href={`https://sepolia.scrollscan.com/tx/${donation.transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-xs text-indigo-600 hover:text-indigo-900"
                      >
                        <FaExternalLinkAlt className="inline mr-1" />
                        View
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex space-x-4">
              <Link
                to={`/donations/${donation.id}`}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaExternalLinkAlt className="mr-1.5 h-4 w-4 text-gray-400" />
                View Full Details
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Proof Files Modal */}
      {viewingProof && donation.task_proof && donation.task_proof.length > 0 && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setViewingProof(false)}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Proof Files ({currentProofIndex + 1}/{donation.task_proof.length})
                    </h3>
                    <div className="mt-4">
                      {donation.task_proof[currentProofIndex].type && donation.task_proof[currentProofIndex].type.includes('image') ? (
                        <img
                          src={`/storage/${donation.task_proof[currentProofIndex].path}`}
                          alt={`Proof file ${currentProofIndex + 1}`}
                          className="w-full h-96 object-contain border border-gray-300 rounded"
                        />
                      ) : (
                        <div className="w-full h-96 flex items-center justify-center border border-gray-300 rounded bg-gray-50">
                          <div className="text-center">
                            <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">
                              {donation.task_proof[currentProofIndex].name || `File ${currentProofIndex + 1}`}
                            </p>
                            <a
                              href={`/storage/${donation.task_proof[currentProofIndex].path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-4 font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Open File
                            </a>
                          </div>
                        </div>
                      )}

                      {donation.task_proof.length > 1 && (
                        <div className="mt-4 flex justify-between">
                          <button
                            onClick={() => setCurrentProofIndex((currentProofIndex - 1 + donation.task_proof.length) % donation.task_proof.length)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => setCurrentProofIndex((currentProofIndex + 1) % donation.task_proof.length)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setViewingProof(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
