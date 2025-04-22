import React from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

/**
 * A wrapper component that handles blockchain connection status and errors gracefully
 * Use this around components that require blockchain functionality
 */
export default function BlockchainWrapper({ children, requireWallet = true }) {
  const blockchainContext = useBlockchain();
  
  if (!blockchainContext) {
    return (
      <div className="w-full p-4 bg-yellow-50 rounded-md text-center">
        <div className="animate-spin mx-auto mb-3">
          <FaSpinner size={24} className="text-yellow-500" />
        </div>
        <p className="text-yellow-700">Loading blockchain connection...</p>
      </div>
    );
  }
  
  const { isLoading, error, isConnected, connectWallet } = blockchainContext;
  
  // Show loading spinner while initializing
  if (isLoading) {
    return (
      <div className="w-full p-4 bg-gray-50 rounded-md text-center">
        <div className="animate-spin mx-auto mb-3">
          <FaSpinner size={24} className="text-indigo-500" />
        </div>
        <p className="text-gray-700">Initializing blockchain connection...</p>
      </div>
    );
  }
  
  // Show blockchain error
  if (error) {
    return (
      <div className="w-full p-4 bg-red-50 rounded-md">
        <div className="flex items-start">
          <FaExclamationTriangle className="text-red-500 mr-3 mt-1" />
          <div>
            <p className="font-medium text-red-800">Blockchain connection error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={connectWallet}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Show wallet connection prompt if required but not connected
  if (requireWallet && !isConnected) {
    return (
      <div className="w-full p-6 bg-indigo-50 rounded-md">
        <div className="text-center">
          <p className="font-medium text-indigo-800 mb-3">Wallet Connection Required</p>
          <p className="text-sm text-indigo-700 mb-4">
            Please connect your wallet to access blockchain features.
          </p>
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }
  
  // Render the children with blockchain context available
  return children;
} 