import React, { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaFileAlt, FaBuilding, FaSearch } from 'react-icons/fa';

const MalaysianCharityVerification = ({ 
  organization = {}, 
  verificationStatus = 'verified' // 'verified', 'pending', 'rejected'
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Malaysian government verification authorities
  const verificationAuthorities = [
    {
      name: 'Companies Commission of Malaysia (SSM)',
      status: organization.ssmStatus || 'verified',
      registrationNumber: organization.ssmRegistrationNumber || 'TC123456-A',
      verificationDate: organization.ssmVerificationDate || '2023-05-15',
      expiryDate: organization.ssmExpiryDate || '2024-05-15',
    },
    {
      name: 'Registry of Societies (ROS)',
      status: organization.rosStatus || 'verified',
      registrationNumber: organization.rosRegistrationNumber || 'PPM-012-14-15052023',
      verificationDate: organization.rosVerificationDate || '2023-06-10',
      expiryDate: organization.rosExpiryDate || '2024-06-10',
    },
    {
      name: 'Inland Revenue Board (LHDN)',
      status: organization.lhdnStatus || 'verified',
      registrationNumber: organization.lhdnRegistrationNumber || 'LHDN/01/35/42/51/179-6.5621',
      verificationDate: organization.lhdnVerificationDate || '2023-04-20',
      expiryDate: organization.lhdnExpiryDate || '2024-04-20',
    }
  ];
  
  // Required documents for Malaysian charity verification
  const requiredDocuments = [
    {
      name: 'Certificate of Incorporation (Form 9)',
      status: 'submitted',
      submissionDate: '2023-03-10',
    },
    {
      name: 'Constitution/Memorandum and Articles of Association',
      status: 'submitted',
      submissionDate: '2023-03-10',
    },
    {
      name: 'Annual Returns (Form 24A)',
      status: 'submitted',
      submissionDate: '2023-03-15',
    },
    {
      name: 'Audited Financial Statements',
      status: 'submitted',
      submissionDate: '2023-03-15',
    },
    {
      name: 'Tax Exemption Certificate',
      status: 'submitted',
      submissionDate: '2023-03-20',
    },
    {
      name: 'Board of Directors/Trustees Information',
      status: 'submitted',
      submissionDate: '2023-03-10',
    },
    {
      name: 'Bank Account Information',
      status: 'submitted',
      submissionDate: '2023-03-10',
    }
  ];
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1 h-3 w-3" />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaExclamationTriangle className="mr-1 h-3 w-3" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaTimesCircle className="mr-1 h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 bg-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaBuilding className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Malaysian Charity Verification
            </h3>
          </div>
          <div>
            {getStatusBadge(verificationStatus)}
          </div>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Verification status with Malaysian government authorities
        </p>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {/* Verification Summary */}
        <div className="mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {verificationStatus === 'verified' ? (
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <FaCheckCircle className="h-6 w-6 text-green-600" />
                </div>
              ) : verificationStatus === 'pending' ? (
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <FaExclamationTriangle className="h-6 w-6 text-yellow-600" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <FaTimesCircle className="h-6 w-6 text-red-600" />
                </div>
              )}
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-medium text-gray-900">
                {organization.name || 'TrustChain Organization'}
              </h4>
              <p className="text-sm text-gray-500">
                {verificationStatus === 'verified' 
                  ? 'This organization has been verified by Malaysian government authorities and is authorized to collect donations.'
                  : verificationStatus === 'pending'
                  ? 'This organization is currently undergoing verification with Malaysian government authorities.'
                  : 'This organization has not been verified by Malaysian government authorities.'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Verification Authorities */}
        <div className="mt-6">
          <h4 className="text-base font-medium text-gray-900 mb-4">Verification with Malaysian Authorities</h4>
          
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Authority</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Registration Number</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Expiry Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {verificationAuthorities.map((authority, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{authority.name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{authority.registrationNumber}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{getStatusBadge(authority.status)}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(authority.expiryDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Verification Details Toggle */}
        <div className="mt-6">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show Verification Details'}
          </button>
        </div>
        
        {/* Detailed Verification Information */}
        {showDetails && (
          <div className="mt-6 space-y-6">
            {/* Required Documents */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Required Documents</h5>
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Document</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Submission Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {requiredDocuments.map((document, index) => (
                      <tr key={index}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          <div className="flex items-center">
                            <FaFileAlt className="mr-2 h-4 w-4 text-gray-400" />
                            {document.name}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {document.status === 'submitted' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FaCheckCircle className="mr-1 h-3 w-3" />
                              Submitted
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <FaTimesCircle className="mr-1 h-3 w-3" />
                              Missing
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(document.submissionDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Verification Process */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Malaysian Charity Verification Process</h5>
              <div className="bg-gray-50 p-4 rounded-md">
                <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-2">
                  <li>Registration with Companies Commission of Malaysia (SSM) or Registry of Societies (ROS)</li>
                  <li>Submission of required documents and constitution</li>
                  <li>Background check of organization and board members</li>
                  <li>Verification of financial records and bank accounts</li>
                  <li>Approval for tax exemption status from Inland Revenue Board (LHDN)</li>
                  <li>Annual compliance and reporting requirements</li>
                </ol>
              </div>
            </div>
            
            {/* Verify Yourself */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Verify This Organization Yourself</h5>
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-gray-600 mb-3">
                  You can verify this organization's registration status directly with Malaysian authorities:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                  <li>
                    <a 
                      href="https://www.ssm.com.my/Pages/Home.aspx" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <FaSearch className="mr-1 h-3 w-3" />
                      Companies Commission of Malaysia (SSM)
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.ros.gov.my/index.php/en/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <FaSearch className="mr-1 h-3 w-3" />
                      Registry of Societies (ROS)
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.hasil.gov.my/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <FaSearch className="mr-1 h-3 w-3" />
                      Inland Revenue Board (LHDN)
                    </a>
                  </li>
                </ul>
                <p className="mt-3 text-xs text-gray-500">
                  Use the registration numbers provided above to verify the organization's status.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MalaysianCharityVerification; 