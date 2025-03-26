import React from 'react';

export default function LoadingSpinner({ size = 'medium', fullScreen = false }) {
  // Size classes
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  // Container classes
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50'
    : 'flex items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      <div className="relative">
        <div className={`animate-spin rounded-full border-t-transparent border-solid border-indigo-600 border-4 ${sizeClasses[size]}`}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`h-3 w-3 rounded-full bg-indigo-600 ${size === 'small' ? 'h-1.5 w-1.5' : size === 'large' ? 'h-4 w-4' : ''}`}></div>
        </div>
      </div>
      {fullScreen && (
        <p className="ml-3 text-lg font-medium text-gray-700">Loading...</p>
      )}
    </div>
  );
} 