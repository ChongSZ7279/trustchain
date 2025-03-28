import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaClock, FaExclamationTriangle, FaFileAlt, FaLock, FaUnlock } from 'react-icons/fa';
import { useLocalization } from '../context/LocalizationContext';
import { useBlockchain } from '../context/BlockchainContext';
import axios from 'axios';

const MalaysianMilestoneTracker = ({ 
  taskId, 
  milestones = [], 
  currentMilestoneIndex = 0,
  onMilestoneComplete,
  isOrganization = false
}) => {
  const { formatCurrency, formatDate } = useLocalization();
  const { getTaskBalance } = useBlockchain();
  const [taskBalance, setTaskBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [verificationDocuments, setVerificationDocuments] = useState([]);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [picturesUploaded, setPicturesUploaded] = useState(0);
  const [proofUploaded, setProofUploaded] = useState(false);
  const [showTaxReceipt, setShowTaxReceipt] = useState(false);

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        setLoading(true);
        const [balance, taskData] = await Promise.all([
          getTaskBalance(taskId),
          axios.get(`/api/tasks/${taskId}`)
        ]);
        setTaskBalance(parseFloat(balance));
        setPicturesUploaded(taskData.data.pictures_count || 0);
        setProofUploaded(!!taskData.data.proof);
      } catch (error) {
        console.error('Error fetching task data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskData();
  }, [taskId, getTaskBalance]);

  const handleMilestoneAction = (milestone, index) => {
    if (!isOrganization) return;
    
    if (index === currentMilestoneIndex && milestone.status === 'in_progress') {
      setSelectedMilestone(milestone);
      setShowVerificationModal(true);
    }
  };

  const handlePictureUpload = async (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 5 - picturesUploaded;
    const filesToUpload = files.slice(0, remainingSlots);

    try {
      const formData = new FormData();
      filesToUpload.forEach(file => {
        formData.append('pictures[]', file);
      });

      const response = await axios.post(`/api/tasks/${taskId}/pictures`, formData);
      setPicturesUploaded(prev => prev + response.data.length);
    } catch (error) {
      console.error('Error uploading pictures:', error);
    }
  };

  const handleProofUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const formData = new FormData();
        formData.append('proof', e.target.files[0]);

        await axios.post(`/api/tasks/${taskId}/proof`, formData);
        setProofUploaded(true);
      } catch (error) {
        console.error('Error uploading proof:', error);
      }
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    
    if (picturesUploaded < 5 || !proofUploaded) {
      alert('Please upload 5 pictures and 1 proof document before submitting');
      return;
    }

    try {
      await axios.post(`/api/tasks/${taskId}/verify`);
      if (onMilestoneComplete) {
        onMilestoneComplete(selectedMilestone);
      }
      setShowVerificationModal(false);
      setShowTaxReceipt(true);
    } catch (error) {
      console.error('Error verifying milestone:', error);
    }
  };

  const handleDownloadTaxReceipt = async () => {
    try {
      const response = await axios.get(`/api/tasks/${taskId}/tax-receipt`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tax_receipt_${taskId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading tax receipt:', error);
    }
  };

  const getMilestoneStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <FaClock className="h-5 w-5 text-yellow-500" />;
      case 'pending':
        return <FaLock className="h-5 w-5 text-gray-400" />;
      case 'failed':
        return <FaExclamationTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <FaLock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getMilestoneStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const getMilestoneStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 bg-indigo-50">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Milestone Tracker
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Track the progress of this project through verified milestones
        </p>
        {!loading && (
          <p className="mt-2 text-sm font-medium text-indigo-600">
            Current Task Balance: {formatCurrency(taskBalance * 13500)} (≈ {taskBalance} ETH)
          </p>
        )}
      </div>
      
      {/* Verification Requirements Status */}
      {isOrganization && (
        <div className="px-4 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Verification Requirements</h3>
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Pictures ({picturesUploaded}/5)</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePictureUpload}
                  disabled={picturesUploaded >= 5}
                  className="hidden"
                  id="picture-upload"
                />
                <label
                  htmlFor="picture-upload"
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    picturesUploaded >= 5 ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {picturesUploaded >= 5 ? 'Complete' : 'Upload Pictures'}
                </label>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-indigo-600 rounded-full"
                  style={{ width: `${(picturesUploaded / 5) * 100}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Proof Document</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleProofUpload}
                  disabled={proofUploaded}
                  className="hidden"
                  id="proof-upload"
                />
                <label
                  htmlFor="proof-upload"
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    proofUploaded ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {proofUploaded ? 'Complete' : 'Upload Proof'}
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {milestones.map((milestone, index) => (
            <li 
              key={index}
              className={`px-4 py-4 sm:px-6 ${
                index === currentMilestoneIndex && milestone.status === 'in_progress' && isOrganization
                  ? 'cursor-pointer hover:bg-gray-50'
                  : ''
              }`}
              onClick={() => handleMilestoneAction(milestone, index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getMilestoneStatusIcon(milestone.status)}
                  <p className="ml-2 text-sm font-medium text-gray-900">{milestone.title}</p>
                  <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getMilestoneStatusClass(milestone.status)}`}>
                    {getMilestoneStatusText(milestone.status)}
                  </span>
                </div>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className="text-sm text-gray-500">
                    {formatCurrency(milestone.amount)}
                  </p>
                </div>
              </div>
              
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    <FaFileAlt className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    {milestone.description}
                  </p>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  {milestone.completedDate ? (
                    <p>
                      Completed on {formatDate(milestone.completedDate)}
                    </p>
                  ) : milestone.estimatedDate ? (
                    <p>
                      Estimated completion: {formatDate(milestone.estimatedDate)}
                    </p>
                  ) : null}
                </div>
              </div>
              
              {milestone.status === 'completed' && milestone.verificationDocument && (
                <div className="mt-2">
                  <a 
                    href={milestone.verificationDocument} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FaFileAlt className="mr-1.5 h-4 w-4" />
                    View Verification Document
                  </a>
                </div>
              )}
              
              {index === currentMilestoneIndex && milestone.status === 'in_progress' && isOrganization && (
                <div className="mt-3">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMilestone(milestone);
                      setShowVerificationModal(true);
                    }}
                  >
                    <FaUnlock className="mr-1.5 h-4 w-4" />
                    Complete Milestone
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Malaysian Regulatory Compliance Information */}
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6 bg-blue-50">
        <h4 className="text-sm font-medium text-gray-900">Malaysian Regulatory Compliance</h4>
        <p className="mt-1 text-sm text-gray-500">
          This milestone-based funding system complies with:
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>Companies Commission of Malaysia (SSM) regulations</li>
          <li>Bank Negara Malaysia (BNM) guidelines on digital currencies</li>
          <li>Malaysian Anti-Corruption Commission (MACC) transparency requirements</li>
          <li>Securities Commission Malaysia (SC) crowdfunding guidelines</li>
        </ul>
        <p className="mt-2 text-sm text-gray-500">
          All milestone verifications are recorded on the blockchain for permanent transparency and auditability.
        </p>
      </div>
      
      {/* Verification Modal */}
      {showVerificationModal && selectedMilestone && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                  <FaFileAlt className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Complete Milestone: {selectedMilestone.title}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Please upload verification documents to prove this milestone has been completed. 
                      This will release {formatCurrency(selectedMilestone.amount)} from the smart contract.
                    </p>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleVerificationSubmit} className="mt-5 sm:mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Verification Documents
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="verification-document-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="verification-document-upload"
                            name="verification-document-upload"
                            type="file"
                            className="sr-only"
                            onChange={(e) => {
                              const files = Array.from(e.target.files);
                              setVerificationDocuments(files);
                            }}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, PNG, JPG up to 10MB
                      </p>
                      {verificationDocuments.map((document, index) => (
                        <p key={index} className="text-xs text-green-500">
                          <FaCheckCircle className="inline mr-1" /> {document.name}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <label htmlFor="verification-notes" className="block text-sm font-medium text-gray-700">
                    Notes (Optional)
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="verification-notes"
                      name="verification-notes"
                      rows={3}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Add any additional information about this milestone completion..."
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                    disabled={verificationDocuments.length < 1 || loading}
                  >
                    {loading ? 'Processing...' : 'Complete Milestone'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setShowVerificationModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tax Receipt Modal */}
      {showTaxReceipt && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Download Tax Receipt</h3>
              <p className="text-sm text-gray-500 mb-4">
                Your donation has been processed. You can now download your tax receipt.
              </p>
              <button
                onClick={handleDownloadTaxReceipt}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Download Tax Receipt
              </button>
              <button
                onClick={() => setShowTaxReceipt(false)}
                className="mt-2 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MalaysianMilestoneTracker; 