import React from 'react';
import { Link, useRouteError } from 'react-router-dom';
import { FaExclamationTriangle, FaHome, FaArrowLeft, FaSyncAlt } from 'react-icons/fa';

export default function ErrorBoundary() {
  const error = useRouteError();
  console.error('Route error:', error);

  // Extract error message
  let errorMessage = error?.message || 'An unexpected error occurred';
  
  // Blockchain-specific errors
  const isBlockchainError = errorMessage.includes('useBlockchain') || 
                           errorMessage.includes('account') ||
                           errorMessage.includes('MetaMask') ||
                           errorMessage.includes('wallet');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaExclamationTriangle className="h-8 w-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
        
        <div className="bg-gray-50 p-4 rounded-md mb-6 mt-4 text-left">
          <p className="text-gray-700 font-medium mb-2">Error details:</p>
          <p className="text-sm text-gray-600 break-words">{errorMessage}</p>
        </div>

        {isBlockchainError && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
            <p className="text-yellow-700 font-medium">Blockchain connection issue detected</p>
            <p className="text-sm text-yellow-600 mt-1">
              This error might be related to your wallet connection. Please ensure MetaMask is installed,
              connected to the correct network, and you've granted permission to this site.
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <FaHome className="mr-2" />
            Go to Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" />
            Go Back
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <FaSyncAlt className="mr-2" />
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
} 