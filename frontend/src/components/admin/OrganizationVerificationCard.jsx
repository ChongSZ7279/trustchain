import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import { formatImageUrl } from '../../utils/helpers';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaFileAlt,
  FaExternalLinkAlt,
  FaEye,
  FaBuilding,
  FaHandshake,
  FaSpinner,
  FaFilePdf,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
  FaDownload,
  FaGlobe,
  FaWallet,
  FaUser,
  FaPhone,
  FaIdCard,
  FaCalendarAlt,
  FaTimes,
  FaRegClock
} from 'react-icons/fa';

export default function OrganizationVerificationCard({ entity, entityType, onStatusUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get status badge
  const getStatusBadge = (isVerified) => {
    if (isVerified) {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm">
          <FaCheckCircle className="mr-1.5 h-3 w-3 text-green-500" aria-hidden="true" />
          Verified
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm">
          <FaExclamationTriangle className="mr-1.5 h-3 w-3 text-yellow-500" aria-hidden="true" />
          Pending Verification
        </span>
      );
    }
  };

  // Handle verification
  const handleVerify = async () => {
    const entityName = entityType === 'organizations' ? 'organization' : 'charity';
    
    if (!window.confirm(`Are you sure you want to verify this ${entityName}?`)) {
      return;
    }

    const verificationDocumentField = 'verified_document';
    if (!entity[verificationDocumentField]) {
      toast.error(`Cannot verify: No verification document uploaded for this ${entityName}`);
      return;
    }

    setVerifying(true);
    try {
      const toastId = toast.loading(`Verifying ${entityName}...`);
      
      const endpoint = entityType === 'organizations'
        ? `/admin/verification/organizations/${entity.id}/verify`
        : `/admin/verification/charities/${entity.id}/verify`;

      const response = await api.post(endpoint);

      toast.dismiss(toastId);
      if (response.data.success) {
        toast.success(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} verified successfully`);
        setVerificationComplete(true);
        onStatusUpdate(entity.id, 'verified');
      } else {
        toast.error(`Failed to verify ${entityName}: ${response.data.message}`);
      }
    } catch (error) {
      console.error(`Error verifying ${entityName}:`, error);
      toast.dismiss();
      toast.error(`Failed to verify ${entityName}: ${error.response?.data?.message || error.message}`);
    } finally {
      setVerifying(false);
    }
  };

  // Get entity details based on type
  const getEntityDetails = () => {
    if (entityType === 'organizations') {
      return [
        { label: 'Name', value: entity.name, icon: <FaBuilding className="text-indigo-500" aria-hidden="true" /> },
        { label: 'Email', value: entity.gmail || entity.email, icon: <FaUser className="text-indigo-500" aria-hidden="true" /> },
        { label: 'Phone', value: entity.phone_number || 'N/A', icon: <FaPhone className="text-indigo-500" aria-hidden="true" /> },
        { label: 'Registration Number', value: entity.register_address || 'N/A', icon: <FaIdCard className="text-indigo-500" aria-hidden="true" /> },
        { label: 'Wallet Address', value: entity.wallet_address || 'N/A', icon: <FaWallet className="text-indigo-500" aria-hidden="true" /> },
        { label: 'Website', value: entity.website || 'N/A', icon: <FaGlobe className="text-indigo-500" aria-hidden="true" /> },
        { label: 'Registered At', value: formatDate(entity.created_at), icon: <FaCalendarAlt className="text-indigo-500" aria-hidden="true" /> }
      ];
    } else {
      return [
        { label: 'Name', value: entity.name, icon: <FaHandshake className="text-indigo-500" aria-hidden="true" /> },
        { label: 'Category', value: entity.category || 'N/A', icon: <FaInfoCircle className="text-indigo-500" aria-hidden="true" /> },
        { label: 'Organization', value: entity.organization?.name || 'N/A', icon: <FaBuilding className="text-indigo-500" aria-hidden="true" /> },
        { label: 'Target Fund', value: `RM ${entity.fund_targeted || 0}`, icon: <FaWallet className="text-indigo-500" aria-hidden="true" /> },
        { label: 'People Affected', value: entity.people_affected || 'N/A', icon: <FaUser className="text-indigo-500" aria-hidden="true" /> },
        { label: 'Created At', value: formatDate(entity.created_at), icon: <FaCalendarAlt className="text-indigo-500" aria-hidden="true" /> }
      ];
    }
  };

  // Get verification document URL
  const getDocumentUrl = () => {
    if (!entity.verified_document) return null;
    return formatImageUrl(entity.verified_document);
  };

  // Determine if the entity is missing required verification items
  const isMissingDocument = !entity.verified_document;
  const hasVerificationIssues = isMissingDocument;

  // Determine card border color based on verification status
  const getCardClasses = () => {
    if (hasVerificationIssues) {
      return 'border-l-4 border-red-500 bg-white shadow rounded-lg overflow-hidden transition-all duration-300';
    }
    
    return entity.is_verified
      ? 'border-l-4 border-green-500 bg-white shadow rounded-lg overflow-hidden transition-all duration-300'
      : 'border-l-4 border-yellow-500 bg-white shadow rounded-lg overflow-hidden transition-all duration-300';
  };

  return (
    <div className={getCardClasses()}>
      {/* Card Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-5">
          {/* Entity Info */}
          <div className="flex-1">
            <div className="flex items-center mb-2">
              {getStatusBadge(entity.is_verified)}
              <h3 className="ml-3 text-xl font-semibold text-gray-900 truncate">
                {entity.name}
              </h3>
            </div>
            
            {entityType === 'charities' && entity.organization && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <FaBuilding className="mr-1.5 h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="mr-1">Organization:</span>
                <Link 
                  to={`/organizations/${entity.organization.id}`} 
                  className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 font-medium"
                >
                  {entity.organization.name}
                </Link>
              </div>
            )}
            
            <div className="mt-1.5 flex flex-wrap gap-3">
              <div className="flex items-center text-sm text-gray-500">
                <FaRegClock className="mr-1.5 h-4 w-4 text-gray-400 flex-shrink-0" />
                <span>Updated: {formatDate(entity.updated_at)}</span>
              </div>
              
              {entity.wallet_address && (
                <div className="flex items-center text-sm text-gray-500">
                  <FaWallet className="mr-1.5 h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate max-w-[180px]">{entity.wallet_address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Verification Actions */}
          <div className="flex flex-col items-end">
            {hasVerificationIssues && (
              <div className="mb-3 text-xs font-medium text-red-600 bg-red-50 px-4 py-2 rounded-md shadow-sm">
                <div className="flex items-center">
                  <FaExclamationTriangle className="mr-1.5 h-3 w-3" />
                  Missing verification document
                </div>
              </div>
            )}

            {!entity.is_verified && !verificationComplete && (
              <div>
                <button
                  onClick={handleVerify}
                  disabled={verifying || hasVerificationIssues}
                  title={hasVerificationIssues ? 'Cannot verify: Missing required information' : `Verify this ${entityType === 'organizations' ? 'organization' : 'charity'}`}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white ${hasVerificationIssues ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transform hover:-translate-y-0.5'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200`}
                >
                  {verifying ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" aria-hidden="true" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="mr-2" aria-hidden="true" />
                      Verify
                    </>
                  )}
                </button>
              </div>
            )}

            {(entity.is_verified || verificationComplete) && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 shadow-sm">
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2 h-5 w-5" aria-hidden="true" />
                  <span className="text-sm font-medium text-green-800">
                    {entityType === 'organizations' ? 'Organization' : 'Charity'} verified successfully
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expand Button */}
        <div className="mt-5 flex justify-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center px-5 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform hover:-translate-y-0.5 shadow-sm"
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

      {/* Expanded Details */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!expanded}
      >
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Entity Details Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <FaInfoCircle className="mr-2 text-indigo-500" aria-hidden="true" />
                {entityType === 'organizations' ? 'Organization' : 'Charity'} Details
              </h4>
              <div className="bg-white rounded-md border border-gray-200 p-5 shadow-sm hover:shadow transition-shadow duration-200">
                <dl className="space-y-3 text-sm">
                  {getEntityDetails().map((detail, index) => (
                    <div key={index} className="flex items-start">
                      <div className="h-5 w-5 mt-0.5 text-indigo-500 mr-3">
                        {detail.icon}
                      </div>
                      <dt className="text-gray-500 font-medium w-1/3">{detail.label}:</dt>
                      <dd className="text-gray-900 w-2/3 break-words">
                        {detail.label === 'Wallet Address' && detail.value !== 'N/A' ? (
                          <div className="flex items-center">
                            <span className="truncate max-w-[180px] font-mono text-xs">{detail.value}</span>
                            <a
                              href={`https://sepolia.scrollscan.com/address/${detail.value}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-indigo-600 hover:text-indigo-800 transition-colors duration-200 p-1 rounded-full hover:bg-indigo-50"
                              title="View on blockchain explorer"
                            >
                              <FaExternalLinkAlt size={10} aria-hidden="true" />
                            </a>
                          </div>
                        ) : detail.label === 'Website' && detail.value !== 'N/A' ? (
                          <a
                            href={detail.value.startsWith('http') ? detail.value : `https://${detail.value}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 flex items-center group"
                          >
                            <span className="group-hover:underline">{detail.value}</span>
                            <FaExternalLinkAlt className="ml-1.5 h-3 w-3 opacity-75" aria-hidden="true" />
                          </a>
                        ) : (
                          <span className={detail.value === 'N/A' ? 'text-gray-500 italic' : ''}>{detail.value}</span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              
              {entityType === 'charities' && (
                <div className="mt-5">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <FaInfoCircle className="mr-2 text-indigo-500" aria-hidden="true" />
                    About This Charity
                  </h4>
                  <div className="bg-white shadow-sm rounded-md border border-gray-200 p-5">
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Description</h5>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                        {entity.description || 'No description available'}
                      </p>
                    </div>
                    
                    {entity.objective && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Objectives</h5>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                          {entity.objective}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Verification Documents Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <FaFileAlt className="mr-2 text-indigo-500" aria-hidden="true" />
                Verification Documents
              </h4>
              {entity.verified_document ? (
                <div className="border border-gray-200 rounded-md p-5 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-50 rounded-full mr-3">
                        <FaFilePdf className="h-5 w-5 text-red-500 flex-shrink-0" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Verification Document</p>
                        <p className="text-xs text-gray-500">
                          Uploaded on {formatDate(entity.updated_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setViewingDocument(true)}
                        className="inline-flex items-center px-3 py-1.5 border border-indigo-300 shadow-sm text-xs font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                        aria-label="View document"
                      >
                        <FaEye className="mr-1.5" aria-hidden="true" />
                        View
                      </button>
                      <a
                        href={getDocumentUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 border border-indigo-300 shadow-sm text-xs font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                        download
                        aria-label="Download document"
                      >
                        <FaDownload className="mr-1.5" aria-hidden="true" />
                        Download
                      </a>
                    </div>
                  </div>
                  
                  {/* Document preview thumbnail */}
                  <div 
                    className="border border-gray-200 rounded-md overflow-hidden bg-gray-50 h-40 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors duration-200" 
                    onClick={() => setViewingDocument(true)}
                    role="button"
                    aria-label="Preview document"
                    tabIndex="0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setViewingDocument(true);
                      }
                    }}
                  >
                    <div className="text-center p-4">
                      <FaFilePdf className="h-12 w-12 text-red-500 mx-auto mb-2" aria-hidden="true" />
                      <p className="text-sm text-gray-600">Click to preview document</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 bg-white rounded-md border border-gray-200 shadow-sm p-6">
                  <div className="bg-red-100 p-3 rounded-full inline-flex items-center justify-center mb-3">
                    <FaExclamationTriangle className="h-6 w-6 text-red-500" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    No verification documents uploaded
                  </p>
                  <p className="mt-1 text-xs text-gray-500 text-center">
                    A valid document is required for verification
                  </p>
                </div>
              )}

              {entityType === 'organizations' && (
                <div className="mt-5">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <FaInfoCircle className="mr-2 text-indigo-500" aria-hidden="true" />
                    Verification Requirements
                  </h4>
                  <div className="bg-indigo-50 p-4 rounded-md shadow-sm">
                    <ul className="text-xs text-gray-700 space-y-2">
                      <li className="flex items-start">
                        <FaCheckCircle className="text-indigo-500 mr-1.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>Valid registration with Companies Commission of Malaysia (SSM)</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-indigo-500 mr-1.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>Registration with Registry of Societies (ROS) for non-profit organizations</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-indigo-500 mr-1.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>Tax exemption certification (if applicable)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4 animate-fadein"
          role="dialog"
          aria-modal="true"
          aria-labelledby="document-modal-title"
        >
          <div className="relative bg-white rounded-lg w-full max-w-4xl shadow-xl transform transition-all">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 id="document-modal-title" className="text-lg font-medium flex items-center">
                <FaFilePdf className="mr-2 text-red-500" aria-hidden="true" />
                Verification Document
              </h3>
              <button
                onClick={() => setViewingDocument(false)}
                className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                aria-label="Close"
              >
                <FaTimes className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="p-4 h-[70vh] overflow-auto bg-gray-100">
              <iframe
                src={getDocumentUrl()}
                className="w-full h-full border-0 rounded shadow bg-white"
                title="Document Viewer"
                loading="lazy"
              ></iframe>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t">
              <a
                href={getDocumentUrl()}
                download
                className="inline-flex justify-center items-center w-full sm:w-auto sm:ml-3 rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
              >
                <FaDownload className="mr-2" aria-hidden="true" /> Download Document
              </a>
              <button
                type="button"
                onClick={() => setViewingDocument(false)}
                className="mt-3 sm:mt-0 inline-flex justify-center items-center w-full sm:w-auto rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}