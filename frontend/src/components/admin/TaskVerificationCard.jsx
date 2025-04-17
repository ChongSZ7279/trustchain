import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { formatImageUrl } from '../../utils/helpers';
import AdminFundReleaseButton from '../AdminFundReleaseButton';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaFileAlt,
  FaImages,
  FaExternalLinkAlt,
  FaEye,
  FaWallet
} from 'react-icons/fa';

export default function TaskVerificationCard({ task, onStatusUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [viewingProof, setViewingProof] = useState(false);
  const [viewingPictures, setViewingPictures] = useState(false);
  const [currentPictureIndex, setCurrentPictureIndex] = useState(0);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
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

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              <Link to={`/tasks/${task.id}`} className="hover:text-indigo-600">
                {task.name}
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
            <div className="text-sm text-gray-500">
              Last Updated: {formatDate(task.updated_at)}
            </div>
            
            {task.status === 'verified' && !task.funds_released && (
              <div className="mt-4">
                <AdminFundReleaseButton
                  type="task"
                  id={task.id}
                  onSuccess={(data) => {
                    onStatusUpdate(task.id, 'completed');
                    toast.success('Funds released successfully to charity wallet');
                  }}
                />
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
