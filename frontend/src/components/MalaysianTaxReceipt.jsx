import React, { useState } from 'react';
import { FaFileInvoice, FaDownload, FaEnvelope, FaPrint, FaCheckCircle } from 'react-icons/fa';
import { useLocalization } from '../context/LocalizationContext';

const MalaysianTaxReceipt = ({ 
  donation = {}, 
  organization = {}, 
  user = {} 
}) => {
  const { formatCurrency, formatDate, formatMyKad } = useLocalization();
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async () => {
    setLoading(true);
    
    // In a real application, you would call your backend API to send the email
    // Simulate API call
    setTimeout(() => {
      setEmailSent(true);
      setLoading(false);
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real application, you would generate a PDF and trigger a download
    alert('Tax receipt PDF download started');
  };

  // Format the reference number for LHDN (Inland Revenue Board of Malaysia)
  const formatLhdnReference = (donationId) => {
    if (!donationId) return 'N/A';
    
    // Format as TC-YYYYMMDD-XXXXX
    const date = new Date(donation.date || new Date());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `TC-${year}${month}${day}-${donationId.toString().padStart(5, '0')}`;
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg print:shadow-none">
      <div className="px-4 py-5 sm:px-6 bg-green-50 print:bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaFileInvoice className="h-6 w-6 text-green-600 mr-3" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Tax Receipt for Donation
            </h3>
          </div>
          <div className="flex space-x-2 print:hidden">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FaDownload className="mr-1.5 h-4 w-4" />
              Download
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaPrint className="mr-1.5 h-4 w-4" />
              Print
            </button>
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={loading || emailSent}
              className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${
                emailSent
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {emailSent ? (
                <>
                  <FaCheckCircle className="mr-1.5 h-4 w-4" />
                  Sent
                </>
              ) : (
                <>
                  <FaEnvelope className="mr-1.5 h-4 w-4" />
                  {loading ? 'Sending...' : 'Email Receipt'}
                </>
              )}
            </button>
          </div>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          This receipt can be used for tax deduction purposes under Section 44(6) of the Income Tax Act 1967.
        </p>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* Organization Logo and Details */}
          <div className="sm:col-span-6 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{organization.name || 'TrustChain Organization'}</h2>
              <p className="text-sm text-gray-500">{organization.address || 'Level 25, Menara TrustChain, Jalan Sultan Ismail, 50250 Kuala Lumpur'}</p>
              <p className="text-sm text-gray-500">SSM Registration: {organization.registration || 'TC123456-A'}</p>
              <p className="text-sm text-gray-500">Tax Exemption Ref: {organization.taxExemptionRef || 'LHDN.01/35/42/51/179-6.5621'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Receipt No: {formatLhdnReference(donation.id || '12345')}</p>
              <p className="text-sm text-gray-500">Date: {formatDate(donation.date || new Date())}</p>
            </div>
          </div>
          
          <div className="sm:col-span-6">
            <hr className="border-gray-200" />
          </div>
          
          {/* Donor Information */}
          <div className="sm:col-span-6">
            <h4 className="text-sm font-medium text-gray-900">Donor Information</h4>
            <div className="mt-2 bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 gap-y-2 gap-x-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">Name:</p>
                  <p className="text-sm font-medium">{user.name || 'Ahmad bin Abdullah'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Identification Number:</p>
                  <p className="text-sm font-medium">
                    {user.icNumber ? formatMyKad(user.icNumber) : (user.passportNumber || '901231-14-5678')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email:</p>
                  <p className="text-sm">{user.email || 'ahmad@example.com'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone:</p>
                  <p className="text-sm">{user.phone || '012-345-6789'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-500">Address:</p>
                  <p className="text-sm">{user.address || 'No. 123, Jalan Bunga Raya, Taman Merdeka, 56000 Kuala Lumpur, Malaysia'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Donation Details */}
          <div className="sm:col-span-6">
            <h4 className="text-sm font-medium text-gray-900">Donation Details</h4>
            <div className="mt-2 border border-gray-200 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {donation.description || 'Donation to Charity Project'}
                      {donation.projectName && <span className="block text-xs text-gray-500">Project: {donation.projectName}</span>}
                      {donation.transactionHash && (
                        <span className="block text-xs text-gray-500">
                          Transaction Hash: {donation.transactionHash.substring(0, 10)}...{donation.transactionHash.substring(donation.transactionHash.length - 10)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      {formatCurrency(donation.amount || 500)}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Total
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                      {formatCurrency(donation.amount || 500)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Tax Information */}
          <div className="sm:col-span-6">
            <div className="bg-yellow-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-900">Tax Deduction Information</h4>
              <p className="mt-1 text-sm text-gray-600">
                This receipt is issued in accordance with Section 44(6) of the Income Tax Act 1967. 
                Individual donors may claim tax deductions of up to 7% of aggregate income, 
                while corporate donors may claim up to 10% of aggregate income.
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Please retain this receipt for your tax filing purposes with Lembaga Hasil Dalam Negeri (LHDN).
              </p>
            </div>
          </div>
          
          {/* Verification */}
          <div className="sm:col-span-6">
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500">This is a computer-generated receipt. No signature is required.</p>
                  <p className="text-xs text-gray-500">
                    Verify this receipt at: <span className="text-blue-600">https://trustchain.my/verify/{donation.id || '12345'}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Issued by TrustChain</p>
                  <p className="text-xs text-gray-500">{formatDate(new Date())}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MalaysianTaxReceipt; 