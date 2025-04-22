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
  FaCalendarAlt
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
          <FaCheckCircle className="mr-1.5 h-3 w-3 text-green-500" />
          Verified
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">
          <FaExclamationTriangle className="mr-1.5 h-3 w-3 text-blue-500" />
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

    const verificationDocumentField = entityType === 'organizations' ? 'verified_document' : 'verified_document';
    if (!entity[verificationDocumentField]) {
      toast.error(`Cannot verify: No verification document uploaded for this ${entityName}`);
      return;
    }

    setVerifying(true);
    try {
      toast.loading(`Verifying ${entityName}...`);
      
      const endpoint = entityType === 'organizations'
        ? `/admin/verification/organizations/${entity.id}/verify`
        : `/admin/verification/charities/${entity.id}/verify`;

      const response = await api.post(endpoint);

      toast.dismiss();
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
        { label: 'Name', value: entity.name, icon: <FaBuilding className="text-indigo-500" /> },
        { label: 'Email', value: entity.gmail || entity.email, icon: <FaUser className="text-indigo-500" /> },
        { label: 'Phone', value: entity.phone_number || 'N/A', icon: <FaPhone className="text-indigo-500" /> },
        { label: 'Registration Number', value: entity.register_address || 'N/A', icon: <FaIdCard className="text-indigo-500" /> },
        { label: 'Wallet Address', value: entity.wallet_address || 'N/A', icon: <FaWallet className="text-indigo-500" /> },
        { label: 'Website', value: entity.website || 'N/A', icon: <FaGlobe className="text-indigo-500" /> },
        { label: 'Registered At', value: formatDate(entity.created_at), icon: <FaCalendarAlt className="text-indigo-500" /> }
      ];
    } else {
      return [
        { label: 'Name', value: entity.name, icon: <FaHandshake className="text-indigo-500" /> },
        { label: 'Category', value: entity.category || 'N/A', icon: <FaInfoCircle className="text-indigo-500" /> },
        { label: 'Organization', value: entity.organization?.name || 'N/A', icon: <FaBuilding className="text-indigo-500" /> },
        { label: 'Target Fund', value: `RM ${entity.fund_targeted || 0}`, icon: <FaWallet className="text-indigo-500" /> },
        { label: 'People Affected', value: entity.people_affected || 'N/A', icon: <FaUser className="text-indigo-500" /> },
        { label: 'Created At', value: formatDate(entity.created_at), icon: <FaCalendarAlt className="text-indigo-500" /> }
      ];
    }
  };

  // Get verification document URL
  const getDocumentUrl = () => {
    const documentField = entityType === 'organizations' ? 'verified_document' : 'verified_document';
    if (!entity[documentField]) return null;
    
    return formatImageUrl(entity[documentField]);
  };

  // Determine if the entity is missing required verification items
  const isMissingDocument = !entity.verified_document;
  const hasVerificationIssues = isMissingDocument;

  // Determine card border color based on verification status
  const cardBorderClass = hasVerificationIssues
    ? 'border-l-4 border-red-500'
    : entity.is_verified
      ? 'border-l-4 border-green-500'
      : 'border-l-4 border-blue-500';

  return (
    <div className={`bg-white shadow rounded-lg overflow-hidden ${cardBorderClass} transition-all duration-300`}>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <div className="flex items-center mb-2">
              {entityType === 'organizations' ? (
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-full mr-3">
                    <FaBuilding className="text-indigo-500 h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{entity.name}</h3>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-full mr-3">
                    <FaHandshake className="text-indigo-500 h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{entity.name}</h3>
                </div>
              )}
            </div>
            {entityType === 'charities' && entity.organization && (
              <div className="mt-1 flex items-center ml-12">
                <span className="text-sm text-gray-500">Organization:</span>
                <Link to={`/organizations/${entity.organization.id}`} className="ml-1 text-sm text-indigo-600 hover:text-indigo-900 font-medium transition-colors duration-200">
                  {entity.organization.name}
                </Link>
              </div>
            )}
            <div className="mt-3 ml-12">
              {getStatusBadge(entity.is_verified)}
            </div>
          </div>

          <div className="mt-4 sm:mt-0 flex flex-col sm:items-end">
            {hasVerificationIssues && (
              <div className="mb-3 text-sm font-medium text-red-600 bg-red-50 px-4 py-2 rounded-md shadow-sm">
                {isMissingDocument && <div className="flex items-center"><FaExclamationTriangle className="mr-2 text-red-500" /> Missing verification document</div>}
              </div>
            )}
            <div className="text-sm text-gray-500 flex items-center">
              <FaCalendarAlt className="mr-1.5 text-gray-400" />
              Last Updated: {formatDate(entity.updated_at)}
            </div>

            {!entity.is_verified && !verificationComplete && (
              <div className="mt-4">
                <button
                  onClick={handleVerify}
                  disabled={verifying || hasVerificationIssues}
                  title={hasVerificationIssues ? 'Cannot verify: Missing required information' : `Verify this ${entityType === 'organizations' ? 'organization' : 'charity'}`}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white ${hasVerificationIssues ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 transform hover:-translate-y-0.5 transition-all duration-200'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
                >
                  {verifying ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="mr-2" />
                      Verify
                    </>
                  )}
                </button>
              </div>
            )}

            {(entity.is_verified || verificationComplete) && (
              <div className="mt-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4 shadow-sm">
                  <div className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2 h-5 w-5" />
                    <span className="text-sm font-medium text-green-800">
                      {entityType === 'organizations' ? 'Organization' : 'Charity'} verified successfully
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center px-5 py-2 border border-gray-200 text-sm font-medium rounded-full text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? 'max-h-[2000px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'
        }`}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <FaInfoCircle className="mr-2 text-indigo-500" />
                Entity Details
              </h4>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm">
                <dl className="space-y-3">
                  {getEntityDetails().map((detail, index) => (
                    <div key={index} className="flex items-start py-2 border-b border-gray-100 last:border-b-0">
                      <div className="h-5 w-5 mt-0.5 mr-3">
                        {detail.icon}
                      </div>
                      <dt className="text-sm font-medium text-gray-700 w-1/3">{detail.label}:</dt>
                      <dd className="text-sm text-gray-900 w-2/3 break-words">
                        {detail.label === 'Wallet Address' && detail.value !== 'N/A' ? (
                          <div className="flex items-center">
                            <span className="truncate max-w-[180px]">{detail.value}</span>
                            <a
                              href={`https://sepolia.scrollscan.com/address/${detail.value}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-xs text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                              title="View on blockchain explorer"
                            >
                              <FaExternalLinkAlt size={10} />
                            </a>
                          </div>
                        ) : detail.label === 'Website' && detail.value !== 'N/A' ? (
                          <a
                            href={detail.value.startsWith('http') ? detail.value : `https://${detail.value}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 flex items-center"
                          >
                            {detail.value}
                            <FaExternalLinkAlt className="ml-1.5 h-3 w-3" />
                          </a>
                        ) : (
                          <span className={detail.value === 'N/A' ? 'text-gray-500 italic' : ''}>{detail.value}</span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <FaFileAlt className="mr-2 text-indigo-500" />
                Verification Documents
              </h4>
              {entity.verified_document ? (
                <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <FaFilePdf className="h-8 w-8 text-red-500 mr-3 flex-shrink-0" />
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
                        className="inline-flex items-center px-3 py-1.5 border border-indigo-300 shadow-sm text-xs font-medium rounded-full text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none transition-colors duration-200"
                      >
                        <FaEye className="mr-1.5" />
                        View
                      </button>
                      <a
                        href={getDocumentUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 border border-indigo-300 shadow-sm text-xs font-medium rounded-full text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none transition-colors duration-200"
                        download
                      >
                        <FaDownload className="mr-1.5" />
                        Download
                      </a>
                    </div>
                  </div>
                  
                  {/* Document preview thumbnail */}
                  <div className="border border-gray-200 rounded-md overflow-hidden bg-gray-50 h-40 flex items-center justify-center cursor-pointer" onClick={() => setViewingDocument(true)}>
                    <div className="text-center p-4">
                      <FaFilePdf className="h-12 w-12 text-red-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to preview document</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                  <div className="text-center p-6">
                    <div className="bg-red-100 p-3 rounded-full inline-flex items-center justify-center mb-3">
                      <FaExclamationTriangle className="h-6 w-6 text-red-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      No verification documents uploaded
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      A valid document is required for verification
                    </p>
                  </div>
                </div>
              )}

              {entityType === 'organizations' && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <FaInfoCircle className="mr-2 text-indigo-500" />
                    Verification Requirements
                  </h4>
                  <div className="bg-indigo-50 p-4 rounded-md shadow-sm">
                    <ul className="text-xs text-gray-700 space-y-2">
                      <li className="flex items-start">
                        <FaCheckCircle className="text-indigo-500 mr-1.5 mt-0.5 flex-shrink-0" />
                        <span>Valid registration with Companies Commission of Malaysia (SSM)</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-indigo-500 mr-1.5 mt-0.5 flex-shrink-0" />
                        <span>Registration with Registry of Societies (ROS) for non-profit organizations</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-indigo-500 mr-1.5 mt-0.5 flex-shrink-0" />
                        <span>Tax exemption certification (if applicable)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {entityType === 'charities' && (
              <div className="sm:col-span-2">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <FaInfoCircle className="mr-2 text-indigo-500" />
                  About This Charity
                </h4>
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 divide-y divide-gray-200">
                  <div className="p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Description</h5>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                      {entity.description || 'No description available'}
                    </p>
                  </div>
                  
                  {entity.objective && (
                    <div className="p-4">
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
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4 fade-in">
          <div className="relative bg-white rounded-lg w-full max-w-4xl shadow-xl transform transition-all">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium flex items-center">
                <FaFilePdf className="mr-2 text-red-500" />
                Verification Document
              </h3>
              <button
                onClick={() => setViewingDocument(false)}
                className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 h-[80vh] overflow-auto bg-gray-100">
              <iframe
                src={getDocumentUrl()}
                className="w-full h-full border-0 rounded shadow-sm"
                title="Document Viewer"
              ></iframe>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t">
              <a
                href={getDocumentUrl()}
                download
                className="inline-flex justify-center w-full sm:w-auto sm:ml-3 rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:text-sm transition-colors duration-200"
              >
                <FaDownload className="mr-2" /> Download Document
              </a>
              <button
                type="button"
                onClick={() => setViewingDocument(false)}
                className="mt-3 sm:mt-0 inline-flex justify-center w-full sm:w-auto rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm transition-colors duration-200"
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