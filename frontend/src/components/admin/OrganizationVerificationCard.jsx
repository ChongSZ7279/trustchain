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
  FaInfoCircle
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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaCheckCircle className="mr-1 h-3 w-3" />
          Verified
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <FaExclamationTriangle className="mr-1 h-3 w-3" />
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
        { label: 'Name', value: entity.name },
        { label: 'Email', value: entity.gmail || entity.email },
        { label: 'Phone', value: entity.phone_number || 'N/A' },
        { label: 'Registration Number', value: entity.register_address || 'N/A' },
        { label: 'Wallet Address', value: entity.wallet_address || 'N/A' },
        { label: 'Website', value: entity.website || 'N/A' },
        { label: 'Registered At', value: formatDate(entity.created_at) }
      ];
    } else {
      return [
        { label: 'Name', value: entity.name },
        { label: 'Category', value: entity.category || 'N/A' },
        { label: 'Organization', value: entity.organization?.name || 'N/A' },
        { label: 'Target Fund', value: `RM ${entity.fund_targeted || 0}` },
        { label: 'People Affected', value: entity.people_affected || 'N/A' },
        { label: 'Created At', value: formatDate(entity.created_at) }
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
    ? 'border-2 border-red-300'
    : 'border border-gray-200';

  return (
    <div className={`bg-white shadow rounded-lg overflow-hidden ${cardBorderClass}`}>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {entityType === 'organizations' ? (
                <div className="flex items-center">
                  <FaBuilding className="mr-2 text-indigo-500" />
                  {entity.name}
                </div>
              ) : (
                <div className="flex items-center">
                  <FaHandshake className="mr-2 text-indigo-500" />
                  {entity.name}
                </div>
              )}
            </h3>
            {entityType === 'charities' && entity.organization && (
              <div className="mt-1 flex items-center">
                <span className="text-sm text-gray-500">Organization:</span>
                <Link to={`/organizations/${entity.organization.id}`} className="ml-1 text-sm text-indigo-600 hover:text-indigo-900">
                  {entity.organization.name}
                </Link>
              </div>
            )}
            <div className="mt-2">
              {getStatusBadge(entity.is_verified)}
            </div>
          </div>

          <div className="mt-4 sm:mt-0 flex flex-col sm:items-end">
            {hasVerificationIssues && (
              <div className="mb-2 text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-md">
                {isMissingDocument && <div>⚠️ Missing verification document</div>}
              </div>
            )}
            <div className="text-sm text-gray-500">
              Last Updated: {formatDate(entity.updated_at)}
            </div>

            {!entity.is_verified && !verificationComplete && (
              <div className="mt-4">
                <button
                  onClick={handleVerify}
                  disabled={verifying || hasVerificationIssues}
                  title={hasVerificationIssues ? 'Cannot verify: Missing required information' : `Verify this ${entityType === 'organizations' ? 'organization' : 'charity'}`}
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
                      Verify
                    </>
                  )}
                </button>
              </div>
            )}

            {(entity.is_verified || verificationComplete) && (
              <div className="mt-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-800">
                      {entityType === 'organizations' ? 'Organization' : 'Charity'} verified successfully
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {expanded ? 'Hide Details' : 'View Details'}
          </button>
        </div>

        {expanded && (
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Entity Details</h4>
                <dl className="space-y-3">
                  {getEntityDetails().map((detail, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">{detail.label}:</dt>
                      <dd className="text-sm text-gray-900 col-span-2 break-words">
                        {detail.label === 'Wallet Address' && detail.value !== 'N/A' ? (
                          <div className="flex items-center">
                            <span className="truncate max-w-xs">{detail.value}</span>
                            <a
                              href={`https://sepolia.scrollscan.com/address/${detail.value}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-xs text-indigo-600 hover:text-indigo-800"
                            >
                              <FaExternalLinkAlt size={10} />
                            </a>
                          </div>
                        ) : detail.label === 'Website' && detail.value !== 'N/A' ? (
                          <a
                            href={detail.value.startsWith('http') ? detail.value : `https://${detail.value}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            {detail.value}
                          </a>
                        ) : (
                          detail.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Verification Documents</h4>
                {entity.verified_document ? (
                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaFilePdf className="h-8 w-8 text-red-500 mr-3" />
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
                          className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <FaEye className="mr-1" />
                          View
                        </button>
                        <a
                          href={getDocumentUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          download
                        >
                          <FaFileAlt className="mr-1" />
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 bg-gray-50 rounded-md border border-gray-200">
                    <div className="text-center">
                      <FaExclamationTriangle className="mx-auto h-6 w-6 text-yellow-400" />
                      <p className="mt-2 text-sm font-medium text-gray-500">
                        No verification documents uploaded
                      </p>
                    </div>
                  </div>
                )}

                {entityType === 'organizations' && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Verification Requirements</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li className="flex items-start">
                          <FaInfoCircle className="text-blue-500 mr-1 mt-0.5 flex-shrink-0" />
                          Valid registration with Companies Commission of Malaysia (SSM)
                        </li>
                        <li className="flex items-start">
                          <FaInfoCircle className="text-blue-500 mr-1 mt-0.5 flex-shrink-0" />
                          Registration with Registry of Societies (ROS) for non-profit organizations
                        </li>
                        <li className="flex items-start">
                          <FaInfoCircle className="text-blue-500 mr-1 mt-0.5 flex-shrink-0" />
                          Tax exemption certification (if applicable)
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {entityType === 'charities' && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Description</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-700">{entity.description || 'No description available'}</p>
                </div>
                
                {entity.objective && (
                  <div className="mt-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Objectives</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-700">{entity.objective}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg w-full max-w-4xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">Verification Document</h3>
              <button
                onClick={() => setViewingDocument(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 h-[80vh] overflow-auto">
              <iframe
                src={getDocumentUrl()}
                className="w-full h-full"
                title="Document Viewer"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 