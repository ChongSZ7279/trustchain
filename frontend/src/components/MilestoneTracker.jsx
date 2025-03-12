import React, { useState } from 'react';
import { 
  FaCheckCircle, 
  FaClock, 
  FaLock, 
  FaUnlock, 
  FaFileAlt, 
  FaImage, 
  FaExternalLinkAlt,
  FaEthereum,
  FaInfoCircle
} from 'react-icons/fa';
import { formatImageUrl } from '../utils/helpers';

const MilestoneTracker = ({ milestones, taskId, canVerify, onVerify }) => {
  const [expandedMilestone, setExpandedMilestone] = useState(null);
  
  // Calculate overall progress
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const totalMilestones = milestones.length;
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  
  const toggleMilestone = (id) => {
    if (expandedMilestone === id) {
      setExpandedMilestone(null);
    } else {
      setExpandedMilestone(id);
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'in_progress':
        return 'bg-yellow-500 text-white';
      case 'locked':
        return 'bg-gray-500 text-white';
      case 'pending_verification':
        return 'bg-indigo-500 text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="h-5 w-5" />;
      case 'in_progress':
        return <FaClock className="h-5 w-5" />;
      case 'locked':
        return <FaLock className="h-5 w-5" />;
      case 'pending_verification':
        return <FaFileAlt className="h-5 w-5" />;
      default:
        return <FaLock className="h-5 w-5" />;
    }
  };
  
  const handleVerify = (milestoneId) => {
    if (onVerify) {
      onVerify(milestoneId);
    }
  };
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Milestone Progress</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {completedMilestones} of {totalMilestones} milestones completed
            </p>
          </div>
          <div className="flex items-center">
            <div className="mr-2 text-sm font-medium text-gray-700">{Math.round(progressPercentage)}%</div>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-200"></div>
        
        {/* Milestones */}
        <ul className="relative">
          {milestones.map((milestone, index) => (
            <li key={milestone.id} className="relative">
              <div 
                className={`px-4 py-5 sm:px-6 border-b border-gray-200 ${
                  expandedMilestone === milestone.id ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 relative z-10">
                    <div className={`flex items-center justify-center h-16 w-16 rounded-full ${getStatusColor(milestone.status)}`}>
                      {getStatusIcon(milestone.status)}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-gray-900">{milestone.title}</h4>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                          milestone.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          milestone.status === 'pending_verification' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {milestone.status === 'completed' ? 'Completed' :
                           milestone.status === 'in_progress' ? 'In Progress' :
                           milestone.status === 'pending_verification' ? 'Pending Verification' :
                           'Locked'}
                        </span>
                        <button
                          onClick={() => toggleMilestone(milestone.id)}
                          className="ml-2 text-gray-400 hover:text-gray-500"
                        >
                          <FaInfoCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="mt-1 text-sm text-gray-500">
                      {milestone.description}
                    </p>
                    
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <FaEthereum className="flex-shrink-0 mr-1.5 h-4 w-4 text-indigo-600" />
                      <span>Funding: {milestone.amount} ETH ({milestone.percentage}% of total)</span>
                    </div>
                    
                    {expandedMilestone === milestone.id && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                            <dd className="mt-1 text-sm text-gray-900">{milestone.start_date || 'Not started'}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Completion Date</dt>
                            <dd className="mt-1 text-sm text-gray-900">{milestone.completion_date || 'Not completed'}</dd>
                          </div>
                          
                          {milestone.deliverables && (
                            <div className="sm:col-span-2">
                              <dt className="text-sm font-medium text-gray-500">Deliverables</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                                  {milestone.deliverables.map((deliverable, i) => (
                                    <li key={i} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                      <div className="w-0 flex-1 flex items-center">
                                        {deliverable.type === 'document' ? (
                                          <FaFileAlt className="flex-shrink-0 h-5 w-5 text-gray-400" />
                                        ) : (
                                          <FaImage className="flex-shrink-0 h-5 w-5 text-gray-400" />
                                        )}
                                        <span className="ml-2 flex-1 w-0 truncate">
                                          {deliverable.name}
                                        </span>
                                      </div>
                                      <div className="ml-4 flex-shrink-0">
                                        <a
                                          href={formatImageUrl(deliverable.file_path)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
                                        >
                                          View <FaExternalLinkAlt className="ml-1 h-3 w-3" />
                                        </a>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </dd>
                            </div>
                          )}
                          
                          {milestone.blockchain_tx_hash && (
                            <div className="sm:col-span-2">
                              <dt className="text-sm font-medium text-gray-500">Blockchain Transaction</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                <div className="flex items-center">
                                  <FaEthereum className="flex-shrink-0 mr-1.5 h-4 w-4 text-indigo-600" />
                                  <span className="font-mono text-xs truncate">{milestone.blockchain_tx_hash}</span>
                                  <a
                                    href={`https://etherscan.io/tx/${milestone.blockchain_tx_hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-indigo-600 hover:text-indigo-500"
                                  >
                                    <FaExternalLinkAlt className="h-3 w-3" />
                                  </a>
                                </div>
                              </dd>
                            </div>
                          )}
                          
                          {canVerify && milestone.status === 'pending_verification' && (
                            <div className="sm:col-span-2 mt-2">
                              <button
                                onClick={() => handleVerify(milestone.id)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <FaCheckCircle className="mr-2 h-4 w-4" />
                                Verify Milestone
                              </button>
                            </div>
                          )}
                        </dl>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {milestones.length === 0 && (
        <div className="text-center py-12">
          <FaClock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No milestones</h3>
          <p className="mt-1 text-sm text-gray-500">
            This task doesn't have any milestones defined yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default MilestoneTracker; 