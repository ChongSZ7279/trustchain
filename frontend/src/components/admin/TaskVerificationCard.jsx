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
  FaSpinner
} from 'react-icons/fa';

export default function TaskVerificationCard({ task, onStatusUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [viewingProof, setViewingProof] = useState(false);
  const [viewingPictures, setViewingPictures] = useState(false);
  const [currentPictureIndex, setCurrentPictureIndex] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [explorerUrl, setExplorerUrl] = useState('');
  const [verificationComplete, setVerificationComplete] = useState(false);

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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1 h-3 w-3" />
            Verified
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <FaCheckCircle className="mr-1 h-3 w-3" />
            Completed
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

  // Handle verification of a pending task
  const handleVerify = async () => {
    console.log('Verify button clicked for task:', task);

    if (!task.proof) {
      console.warn('Task has no proof document');
      toast.error('Cannot verify task: No proof document uploaded');
      return;
    }

    if (!task.charity?.organization?.wallet_address) {
      console.warn('Charity has no wallet address:', task.charity);
      toast.error('Cannot verify task: Charity does not have a wallet address');
      return;
    }

    if (window.confirm(`Are you sure you want to verify this task? This will automatically release funds to the charity wallet.`)) {
      setVerifying(true);
      try {
        console.log(`Making API request to verify task ${task.id}...`);

        // Add explicit API URL and include token in headers
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const fullUrl = `${apiUrl}/admin/verification/tasks/${task.id}/verify`;

        console.log('Request URL:', fullUrl);
        console.log('Auth token exists:', !!token);

        const response = await axios.post(fullUrl, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log('Verification response:', response.data);

        if (response.data.success) {
          console.log('Task verification successful');
          toast.success('Task verified and funds automatically released to charity wallet');

          // Store transaction hash and explorer URL if available
          if (response.data.transaction_hash) {
            console.log('Transaction hash received:', response.data.transaction_hash);
            setTxHash(response.data.transaction_hash);
            setExplorerUrl(response.data.explorer_url || `https://sepolia.scrollscan.com/tx/${response.data.transaction_hash}`);
            setVerificationComplete(true);
          } else {
            console.warn('No transaction hash in response');
          }

          onStatusUpdate(task.id, 'verified');
        } else {
          console.error('Verification failed:', response.data.message);
          toast.error(response.data.message || 'Failed to verify task');
        }
      } catch (error) {
        console.error('Error verifying task:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        const errorMessage = error.response?.data?.message || error.message;
        console.error('Error response data:', error.response?.data);

        // Check if this is an 'already verified' error with transaction hash
        if (error.response?.data?.transaction_hash && error.response?.data?.message?.includes('already been verified')) {
          // Show success toast instead of error
          toast.success('Task was already verified');

          // Set the transaction hash and explorer URL
          setTxHash(error.response.data.transaction_hash);
          setExplorerUrl(error.response.data.explorer_url || `https://sepolia.scrollscan.com/tx/${error.response.data.transaction_hash}`);
          setVerificationComplete(true);

          // Update the task status
          onStatusUpdate(task.id, 'verified');
        } else {
          // Show regular error toast
          toast.error('Failed to verify task: ' + errorMessage);
        }
      } finally {
        setVerifying(false);
      }
    }
  };

  // Determine if the task is missing required verification items
  const isMissingProof = !task.proof;
  const isMissingWalletAddress = !task.charity?.organization?.wallet_address;
  const hasVerificationIssues = isMissingProof || isMissingWalletAddress;

  // Determine card border color based on verification status
  const cardBorderClass = hasVerificationIssues
    ? 'border-2 border-red-300'
    : 'border border-gray-200';

  return (
    <div className={`bg-white shadow rounded-lg overflow-hidden ${cardBorderClass}`}>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              <Link to={`/tasks/${task.id}`} className="hover:text-indigo-600">
                {verificationComplete ? `Verified Task for ${task.charity?.name}` : task.name}
              </Link>
            </h3>
            <div className="mt-1 flex items-center">
              <span className="text-sm text-gray-500">Charity:</span>
              <Link to={`/charities/${task.charity_id}`} className="ml-1 text-sm text-indigo-600 hover:text-indigo-900">
                {task.charity?.name}
              </Link>
            </div>
            <div className="mt-2">
              {getStatusBadge(task.status)}
            </div>
          </div>

          <div className="mt-4 sm:mt-0 flex flex-col sm:items-end">
            {hasVerificationIssues && (
              <div className="mb-2 text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-md">
                {isMissingProof && <div>⚠️ Missing proof document</div>}
                {isMissingWalletAddress && <div>⚠️ Missing charity wallet address</div>}
              </div>
            )}
            <div className="text-sm text-gray-500">
              Last Updated: {formatDate(task.updated_at)}
            </div>

            {task.status === 'pending' && !verificationComplete && (
              <div className="mt-4">
                <button
                  onClick={handleVerify}
                  disabled={verifying || hasVerificationIssues}
                  title={hasVerificationIssues ? 'Cannot verify: Missing required information' : 'Verify this task and release funds'}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${hasVerificationIssues ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {verifying ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="mr-2" />
                      Verify & Release Funds
                    </>
                  )}
                </button>
              </div>
            )}

            {verificationComplete && txHash && (
              <div className="mt-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-800">Initial funds released successfully</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Transaction Hash:</p>
                    <div className="flex items-center">
                      <code className="text-xs bg-gray-100 p-1 rounded">
                        {txHash}
                      </code>
                      <a
                        href={explorerUrl || `https://sepolia.scrollscan.com/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                      >
                        <FaExternalLinkAlt className="mr-1" size={10} />
                        View on Scroll Explorer
                      </a>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      <strong>Note:</strong> Additional funds may be released automatically as new donations are verified for this charity.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {task.status === 'verified' && !verificationComplete && (
              <div className="mt-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-800">Task verified</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Initial funds have been released to charity wallet
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    <strong>Note:</strong> Additional funds may be released automatically as new donations are verified for this charity.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transaction History - Always visible */}
        {task.transaction_hash && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <h5 className="text-sm font-medium text-gray-500">Transaction History</h5>
            <div className="mt-1 border border-gray-200 rounded-md overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-200">
                <div className="grid grid-cols-4">
                  <div>Date</div>
                  <div>Amount</div>
                  <div>Transaction</div>
                  <div>Status</div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                <div className="px-3 py-2 text-xs">
                  <div className="grid grid-cols-4">
                    <div>{formatDate(task.updated_at)}</div>
                    <div>{task.amount || '1.0'} SCROLL</div>
                    <div>
                      <a
                        href={explorerUrl || `https://sepolia.scrollscan.com/tx/${task.transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 flex items-center"
                      >
                        <span className="truncate">{task.transaction_hash.substring(0, 10)}...</span>
                        <FaExternalLinkAlt className="ml-1" size={8} />
                      </a>
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
                {/* Show additional transactions if available */}
                {task.transactions && task.transactions.length > 0 ? (
                  task.transactions.map((transaction, index) => (
                    <div key={index} className="px-3 py-2 text-xs">
                      <div className="grid grid-cols-4">
                        <div>{formatDate(transaction.created_at)}</div>
                        <div>{transaction.amount} SCROLL</div>
                        <div>
                          <a
                            href={`https://sepolia.scrollscan.com/tx/${transaction.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 flex items-center"
                          >
                            <span className="truncate">{transaction.transaction_hash.substring(0, 10)}...</span>
                            <FaExternalLinkAlt className="ml-1" size={8} />
                          </a>
                        </div>
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {transaction.status || 'Completed'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-gray-500 italic">
                    Additional transactions will appear here as more donations are verified
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="mt-1 text-sm text-gray-900">{task.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Verification Details</h4>
                <div className="mt-1 space-y-2">
                  <div className="flex items-center">
                    <FaImages className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {task.pictures_count || 0} of 5 required pictures uploaded
                    </span>
                    {task.pictures_count > 0 && (
                      <button
                        onClick={() => setViewingPictures(true)}
                        className="ml-2 text-xs text-indigo-600 hover:text-indigo-900 focus:outline-none"
                      >
                        <FaEye className="inline mr-1" />
                        View
                      </button>
                    )}
                  </div>

                  <div className="flex items-center">
                    <FaFileAlt className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {task.proof ? 'Proof document uploaded' : 'No proof document'}
                    </span>
                    {task.proof && (
                      <button
                        onClick={() => setViewingProof(true)}
                        className="ml-2 text-xs text-indigo-600 hover:text-indigo-900 focus:outline-none"
                      >
                        <FaEye className="inline mr-1" />
                        View
                      </button>
                    )}
                  </div>

                  <div className="flex items-center">
                    <FaWallet className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      Charity Wallet: {task.charity?.organization?.wallet_address ?
                        `${task.charity.organization.wallet_address.substring(0, 6)}...${task.charity.organization.wallet_address.substring(task.charity.organization.wallet_address.length - 4)}` :
                        'Not set'}
                    </span>
                  </div>

                  {/* Transaction History section moved outside of expanded view */}
                </div>
              </div>
            </div>

            <div className="mt-4 flex space-x-4">
              <Link
                to={`/tasks/${task.id}`}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaExternalLinkAlt className="mr-1.5 h-4 w-4 text-gray-400" />
                View Full Details
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Proof Document Modal */}
      {viewingProof && task.proof && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setViewingProof(false)}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Proof Document</h3>
                    <div className="mt-4">
                      <iframe
                        src={formatImageUrl(task.proof)}
                        className="w-full h-96 border border-gray-300 rounded"
                        title="Proof Document"
                      ></iframe>
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
                <a
                  href={formatImageUrl(task.proof)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Open in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pictures Modal */}
      {viewingPictures && task.pictures && task.pictures.length > 0 && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setViewingPictures(false)}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Task Pictures ({currentPictureIndex + 1}/{task.pictures.length})
                    </h3>
                    <div className="mt-4 relative">
                      <img
                        src={formatImageUrl(task.pictures[currentPictureIndex].path)}
                        alt={`Task picture ${currentPictureIndex + 1}`}
                        className="w-full h-96 object-contain border border-gray-300 rounded"
                      />

                      {task.pictures.length > 1 && (
                        <div className="absolute top-1/2 transform -translate-y-1/2 w-full flex justify-between px-4">
                          <button
                            onClick={() => setCurrentPictureIndex((currentPictureIndex - 1 + task.pictures.length) % task.pictures.length)}
                            className="bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-75 focus:outline-none"
                          >
                            &#10094;
                          </button>
                          <button
                            onClick={() => setCurrentPictureIndex((currentPictureIndex + 1) % task.pictures.length)}
                            className="bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-75 focus:outline-none"
                          >
                            &#10095;
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
                  onClick={() => setViewingPictures(false)}
                >
                  Close
                </button>
                <a
                  href={formatImageUrl(task.pictures[currentPictureIndex].path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Open in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
