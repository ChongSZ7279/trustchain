import React, { useState } from 'react';
import { FaImages } from 'react-icons/fa';

const FallbackImage = ({ src, alt, className, ...props }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    console.log('Image failed to load:', src);
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <FaImages className="h-8 w-8 text-gray-400" />
        </div>
      )}
      
      {error ? (
        <div className="h-full w-full flex items-center justify-center bg-gray-200">
          <FaImages className="h-8 w-8 text-gray-400" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={handleError}
          onLoad={handleLoad}
          className={`${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${className}`}
          {...props}
        />
      )}
    </div>
  );
};

export default FallbackImage; 