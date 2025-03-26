import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaArrowLeft } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="text-indigo-600 text-9xl font-extrabold mb-4">404</div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
          >
            <FaHome className="mr-2" /> Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            <FaArrowLeft className="mr-2" /> Go Back
          </button>
        </div>
      </div>
      
      <div className="mt-16 text-center">
        <p className="text-sm text-gray-500">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
} 