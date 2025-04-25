import React from 'react';
import { FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const BlockchainVerificationBadge = ({ verified = true, blockchainId }) => {
  return (
    <div className="blockchain-verified mb-3">
      {verified ? (
        <div className="flex items-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" />
            Blockchain Verified
          </span>
        </div>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Not Blockchain Verified
        </span>
      )}
      
      {blockchainId && (
        <div className="mt-1 text-xs text-gray-500">
          Blockchain ID: {blockchainId}
        </div>
      )}
    </div>
  );
};

export default BlockchainVerificationBadge; 