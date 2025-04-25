import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { formatImageUrl } from '../../utils/helpers';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaFileAlt,
  FaImages,
  FaExternalLinkAlt,
  FaEye,
  FaWallet,
  FaSpinner,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaBuilding,
  FaMoneyCheckAlt,
  FaInfoCircle,
  FaRegClock,
  FaCalendarAlt
} from 'react-icons/fa';

export default function TaskVerificationCard({ task, onStatusUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [viewingPictures, setViewingPictures] = useState(false);
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

  // Map MySQL fields to component fields
  const taskData = {
    ...task,
    name: task.name || 'Unnamed Task',
    description: task.description || 'No description provided',
    amount: task.fund_targeted || task.amount || 0,
    updated_at: task.updated_at || task.updated || null,
    created_at: task.created_at || task.created || null,
    proof: task.proof || task.task_proofs || task.proof_document || null,
    proof_document: task.proof_document || task.task_proofs || task.proof || null,
    proof_images: task.pictures || task.proof_images || [],
    task_pictures: task.task_pictures || task.pictures || task.proof_images || [],
    pictures_count: task.pictures_count || (task.pictures?.length || 0) || (task.proof_images?.length || 0) || 0,
    status: task.status || 'pending',
    charity: {
      ...(task.charity || {}),
      name: (task.charity?.name || task.charity_name || 'Unknown Charity'),
      organization: {
        ...(task.charity?.organization || {}),
        wallet_address: task.charity?.organization?.wallet_address || task.wallet_address || null
      }
    }
  };

  // Function to get the correct image array
  const getTaskImages = () => {
    // First check for task_pictures array with path property
    if (taskData.task_pictures && taskData.task_pictures.length > 0) {
      return taskData.task_pictures.map(pic => pic.path || pic);
    }
    
    // Then check for proof_images array
    if (taskData.proof_images && taskData.proof_images.length > 0) {
      return taskData.proof_images.map(pic => pic.path || pic);
    }
    
    // Then check for pictures array
    if (taskData.pictures && taskData.pictures.length > 0) {
      return taskData.pictures.map(pic => pic.path || pic);
    }
    
    // No images found
    return [];
  };

  // Get the image array
  const taskImages = getTaskImages();

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm">
            <FaExclamationTriangle className="mr-1.5 h-3 w-3 text-yellow-500" />
            Pending Verification
          </span>
        );
      case 'verified':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">
            <FaCheckCircle className="mr-1.5 h-3 w-3 text-blue-500" />
            Verified
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm">
            <FaCheckCircle className="mr-1.5 h-3 w-3 text-green-500" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 shadow-sm">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
    }
  };

  // Handle verification of a pending task
  const handleVerify = async () => {
    toast.loading('Processing verification request...');

    if (!taskData.proof) {
      toast.dismiss();
      toast.error('Cannot verify task: No proof document uploaded');
      return;
    }

    if (!taskData.charity?.organization?.wallet_address) {
      toast.dismiss();
      toast.error('Cannot verify task: Charity does not have a wallet address');
      return;
    }

    if (window.confirm(`Are you sure you want to verify this task? This will release funds to the charity wallet.`)) {
      setVerifying(true);
      try {
        toast.dismiss(); // Dismiss the loading toast
        toast.loading('Sending verification request to server...');

        // Add explicit API URL and include token in headers
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        
        // Use actual task ID from MySQL
        const taskId = taskData.id || task.id;
        const fullUrl = `${apiUrl}/admin/verification/tasks/${taskId}/verify`;

        // Make the API request with a timeout
        const response = await axios.post(fullUrl, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        });

        toast.dismiss(); // Dismiss the loading toast

        if (response.data.success) {
          toast.success('Task verified and funds released to charity wallet');

          // Store transaction hash and explorer URL if available
          if (response.data.transaction_hash) {
            setTxHash(response.data.transaction_hash);
            setExplorerUrl(response.data.explorer_url || `https://sepolia.scrollscan.com/address/0x70997970C51812dc3A010C7d01b50e0d17dc79C8`);
            setVerificationComplete(true);
          }

          onStatusUpdate(taskId, 'verified');
        } else {
          toast.error(response.data.message || 'Failed to verify task');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;

        // Dismiss any loading toasts
        toast.dismiss();

        // Check if this is an 'already verified' error with transaction hash
        if (error.response?.data?.transaction_hash && error.response?.data?.message?.includes('already been verified')) {
          // Show success toast instead of error
          toast.success('Task was already verified');

          // Set the transaction hash and explorer URL
          setTxHash(error.response.data.transaction_hash);
          setExplorerUrl(error.response.data.explorer_url || `https://sepolia.scrollscan.com/tx/${error.response.data.transaction_hash}`);
          setVerificationComplete(true);

          // Update the task status
          onStatusUpdate(taskData.id, 'verified');
        } else if (error.code === 'ECONNABORTED') {
          // Handle timeout errors
          toast.error('Request timed out. The verification might still be processing in the background.');

          // Optimistically update the UI to show that verification might be in progress
          setVerificationComplete(true);
          setTxHash('Processing...');
          setExplorerUrl('https://sepolia.scrollscan.com/address/0x7867fC939F10377E309a3BF55bfc194F672B0E84');

          // Update the task status optimistically
          onStatusUpdate(taskData.id, 'verified');
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
  const isMissingProof = !taskData.proof;
  const isMissingWalletAddress = !taskData.charity?.organization?.wallet_address;
  const hasVerificationIssues = isMissingProof || isMissingWalletAddress;

  // Determine card color based on status and issues
  const getCardClasses = () => {
    if (hasVerificationIssues) {
      return 'border-l-4 border-red-500 bg-white shadow-md hover:shadow-lg rounded-lg overflow-hidden transition-all duration-300';
    }
    
    switch (taskData.status) {
      case 'pending':
        return 'border-l-4 border-yellow-500 bg-white shadow-md hover:shadow-lg rounded-lg overflow-hidden transition-all duration-300';
      case 'verified':
        return 'border-l-4 border-blue-500 bg-white shadow-md hover:shadow-lg rounded-lg overflow-hidden transition-all duration-300';
      case 'completed':
        return 'border-l-4 border-green-500 bg-white shadow-md hover:shadow-lg rounded-lg overflow-hidden transition-all duration-300';
      default:
        return 'border-l-4 border-gray-300 bg-white shadow-md hover:shadow-lg rounded-lg overflow-hidden transition-all duration-300';
    }
  };

  return (
    <div className={getCardClasses()}>
      {/* Task Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-5">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              {getStatusBadge(taskData.status)}
              <h3 className="ml-3 text-xl font-semibold text-gray-900 truncate">
                <Link to={`/tasks/${taskData.id}`} className="hover:text-indigo-600 transition-colors duration-200">
                  {taskData.name}
                </Link>
              </h3>
            </div>
            
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <FaBuilding className="mr-1.5 h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="mr-1">Charity:</span>
              {taskData.charity?.name ? (
                <Link to={`/charities/${taskData.charity_id}`} className="text-indigo-600 hover:text-indigo-900 truncate font-medium">
                  {taskData.charity.name}
                </Link>
              ) : (
                <span className="text-red-500">Unknown Charity</span>
              )}
            </div>
            
            <div className="mt-1.5 flex flex-wrap gap-3">
              <div className="flex items-center text-sm text-gray-500">
                <FaRegClock className="mr-1.5 h-4 w-4 text-gray-400 flex-shrink-0" />
                <span>Updated: {formatDate(taskData.updated_at)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            {hasVerificationIssues && (
              <div className="mb-3 text-xs font-medium text-red-600 bg-red-50 px-4 py-2 rounded-md shadow-sm">
                {isMissingProof && (
                  <div className="flex items-center mb-1.5">
                    <FaExclamationTriangle className="mr-1.5 h-3 w-3" />
                    Missing proof document
                  </div>
                )}
                {isMissingWalletAddress && (
                  <div className="flex items-center">
                    <FaExclamationTriangle className="mr-1.5 h-3 w-3" />
                    Missing charity wallet address
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            {taskData.status === 'pending' && !verificationComplete && (
              <button
                onClick={handleVerify}
                disabled={verifying || hasVerificationIssues}
                title={hasVerificationIssues ? 'Cannot verify: Missing required information' : 'Verify this task and release funds'}
                className={`inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-md text-white ${
                  hasVerificationIssues 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transform hover:-translate-y-0.5 transition-all duration-200'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
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
            )}

            {/* Transaction hash display */}
            {verificationComplete && txHash && (
              <div className="mt-2 bg-green-50 border border-green-200 rounded-md p-3 max-w-md shadow-sm">
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium text-green-800">Funds released successfully</span>
                </div>
                
                <div className="mt-2 text-xs text-gray-600 flex items-center">
                  <span className="font-medium mr-1">TX:</span> 
                  <a 
                    href={explorerUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 flex items-center"
                    title="View transaction on Scrollscan"
                  >
                    <span className="truncate max-w-[150px] font-mono">{txHash}</span>
                    <FaExternalLinkAlt className="ml-1 inline h-3 w-3 flex-shrink-0" />
                  </a>
                  
                  {/* Copy to clipboard button */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(txHash);
                      toast.success('Transaction hash copied to clipboard');
                    }}
                    className="ml-2 p-1 text-gray-500 hover:text-indigo-600 transition-colors duration-200 rounded-full hover:bg-gray-100"
                    title="Copy transaction hash"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
                
                {/* Real transaction note
                {txHash && txHash.length === 66 && (
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2 text-xs">
                    <div className="flex items-center">
                      <FaInfoCircle className="text-blue-500 mr-1.5 flex-shrink-0" />
                      <span className="text-blue-700 font-medium">Note</span>
                    </div>
                    <p className="mt-1 text-blue-600">
                      Make sure your admin wallet (0x760E788beE2321601eCe743A80854FE0B7519A7E) has sufficient Scroll Sepolia ETH for gas fees. 
                      You can get testnet ETH from the <a href="https://sepolia.scroll.io/faucet" target="_blank" rel="noopener noreferrer" className="underline">Scroll Sepolia Faucet</a>.
                    </p>
                  </div>
                )} */}
                
                {/* Mock transaction indicator
                {txHash && txHash.length !== 66 && (
                  <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2 text-xs">
                    <div className="flex items-center">
                      <FaInfoCircle className="text-yellow-500 mr-1.5 flex-shrink-0" />
                      <span className="text-yellow-700 font-medium">Development Mode</span>
                    </div>
                    <p className="mt-1 text-yellow-600">
                      This appears to be a mock transaction hash generated in test mode. 
                      It won't be found on Scrollscan.
                    </p>
                  </div>
                )} */}
              </div>
            )}
          </div>
        </div>

        {/* Expand/Collapse button */}
        <div className="mt-5 flex justify-center">
          <button
            className="inline-flex items-center px-5 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform hover:-translate-y-0.5 shadow-sm"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                <FaChevronUp className="mr-1.5 h-3 w-3" />
                Hide Details
              </>
            ) : (
              <>
                <FaChevronDown className="mr-1.5 h-3 w-3" />
                View Details
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Task Details */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <FaInfoCircle className="mr-2 text-indigo-500" />
                Task Details
              </h4>
              
              <div className="bg-white p-5 rounded-md border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500 font-medium mb-1">Description</dt>
                    <dd className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-100">{taskData.description || 'No description provided'}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-gray-500 font-medium mb-1">Amount</dt>
                    <dd className="text-gray-900 flex items-center">
                      <FaMoneyCheckAlt className="mr-1.5 text-gray-500" />
                      {taskData.amount ? `${taskData.amount} USDT` : 'Not specified'}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-gray-500 font-medium mb-1">Created</dt>
                    <dd className="text-gray-900 flex items-center">
                      <FaClock className="mr-1.5 text-gray-400" />
                      {formatDate(taskData.created_at)}
                    </dd>
                  </div>
                </dl>
              </div>
              
              {/* Wallet information */}
              <div className="mt-5">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <FaWallet className="mr-2 text-indigo-500" />
                  Wallet Information
                </h4>
                
                <div className="bg-white p-5 rounded-md border border-gray-200 shadow-sm">
                  {taskData.charity?.organization?.wallet_address ? (
                    <div>
                      <div className="text-sm text-gray-700 font-medium mb-2">Charity Wallet Address:</div>
                      <div className="text-xs font-mono bg-gray-50 p-3 rounded border border-gray-200 shadow-inner break-all">
                        {taskData.charity.organization.wallet_address}
                      </div>
                      <div className="mt-3 text-xs">
                        <a 
                          href={`https://sepolia.scrollscan.com/address/${taskData.charity.organization.wallet_address}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900 flex items-center transition-colors duration-200"
                        >
                          View on Explorer
                          <FaExternalLinkAlt className="ml-1.5 h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-500 text-sm flex items-center p-3 bg-red-50 rounded border border-red-100">
                      <FaExclamationTriangle className="mr-1.5" />
                      No wallet address provided
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Column - Proof and Images */}
            <div>
              {/* Proof Document */}
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <FaFileAlt className="mr-2 text-indigo-500" />
                Verification Documents
              </h4>
              
              <div className="bg-white p-5 rounded-md border border-gray-200 shadow-sm mb-5">
                {taskData.proof || taskData.proof_document ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-900">Proof of completion document</div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-md p-3 bg-gray-50 shadow-inner">
                      <div className="flex items-center justify-between">
                        <div className="text-sm truncate flex-grow font-mono bg-white py-2 px-3 rounded border border-gray-200">
                          {taskData.proof || taskData.proof_document}
                        </div>
                        
                        {/* View document button */}
                        <a 
                          href={formatImageUrl(taskData.proof || taskData.proof_document)} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 inline-flex items-center px-3 py-1.5 border border-blue-300 text-xs font-medium rounded-md shadow-sm text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 transition-all duration-200"
                        >
                          <FaEye className="mr-1.5 h-3 w-3" />
                          View
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-500 text-sm flex items-center p-3 bg-red-50 rounded border border-red-100">
                    <FaExclamationTriangle className="mr-1.5" />
                    No proof document uploaded
                  </div>
                )}
              </div>
              
              {/* Images */}
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <FaImages className="mr-2 text-indigo-500" />
                Supporting Images
              </h4>
              
              <div className="bg-white p-5 rounded-md border border-gray-200 shadow-sm">
                {taskImages.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-gray-900">
                        {taskImages.length} image(s) available
                      </div>
                      
                      {taskImages.length > 2 && (
                        <button
                          onClick={() => setViewingPictures(!viewingPictures)}
                          className="inline-flex items-center px-3 py-1.5 border border-indigo-300 text-xs font-medium rounded-full shadow-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-800 transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                          <FaEye className="mr-1.5" />
                          View {viewingPictures ? 'Less' : 'More'}
                        </button>
                      )}
                    </div>
                    
                    {/* Always display up to 2 images by default */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      {taskImages.slice(0, 2).map((image, index) => (
                        <div key={index} className="relative rounded-md overflow-hidden border border-gray-300 bg-gray-100 shadow-inner" style={{ height: '180px' }}>
                          <img 
                            src={formatImageUrl(image)}
                            alt={`Proof ${index + 1}`}
                            className="w-full h-full object-contain transition-opacity duration-300"
                            onError={(e) => {
                              console.error('Image failed to load:', e.target.src);
                              e.target.onerror = null;
                              e.target.src = '/fallback-image.png';
                            }}
                          />
                          
                          {/* Full screen button */}
                          <a 
                            href={formatImageUrl(image)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-2 right-2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-opacity duration-200"
                            title="View full size"
                          >
                            <FaExternalLinkAlt className="h-3 w-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                    
                    {/* Additional images expandable section */}
                    {taskImages.length > 2 && (
                      <div className={`transition-all duration-300 ease-in-out overflow-hidden mt-4 ${
                        viewingPictures ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {taskImages.slice(2).map((image, index) => (
                            <div key={index} className="relative rounded-md overflow-hidden border border-gray-300 bg-gray-100 shadow-inner" style={{ height: '180px' }}>
                              <img 
                                src={formatImageUrl(image)}
                                alt={`Proof ${index + 3}`}
                                className="w-full h-full object-contain transition-opacity duration-300"
                                onError={(e) => {
                                  console.error('Image failed to load:', e.target.src);
                                  e.target.onerror = null;
                                  e.target.src = '/fallback-image.png';
                                }}
                              />
                              
                              {/* Full screen button */}
                              <a 
                                href={formatImageUrl(image)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute top-2 right-2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-opacity duration-200"
                                title="View full size"
                              >
                                <FaExternalLinkAlt className="h-3 w-3" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm italic p-3 bg-gray-50 rounded border border-gray-200">No images uploaded</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
