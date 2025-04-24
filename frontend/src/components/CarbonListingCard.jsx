import React from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaBuilding, FaTree, FaEthereum, FaArrowRight, FaShieldAlt, FaClock } from 'react-icons/fa';
import { useCarbonMarket } from '../context/CarbonMarketContext';

const CarbonListingCard = ({ 
  listing, 
  type, 
  onAction,
  showOwned = false
}) => {
  const { formatAddress, isCurrentAccount, formatEthAmount } = useCarbonMarket();
  const isOwner = type === 'sell' 
    ? isCurrentAccount(listing.seller) 
    : isCurrentAccount(listing.buyer);

  // Action button text
  const actionText = type === 'sell' ? 'Buy' : 'Sell';
  
  // Determine the owner address
  const ownerAddress = type === 'sell' ? listing.seller : listing.buyer;
  
  return (
    <motion.div 
      className={`
        border rounded-lg overflow-hidden shadow-sm transition-all
        ${isOwner 
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' 
          : 'bg-white border-gray-200'} 
        hover:shadow-md
      `}
      whileHover={{ y: -3, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-5">
        {/* Card header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${type === 'sell' ? 'bg-green-100' : 'bg-blue-100'}`}>
              {type === 'sell' 
                ? <FaTree className="text-green-600" /> 
                : <FaEthereum className="text-blue-600" />
              }
            </div>
            <div>
              <h3 className="font-medium text-gray-900 flex items-center">
                {listing.company}
                {isOwner && (
                  <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                    Yours
                  </span>
                )}
              </h3>
              <div className="text-xs text-gray-500 flex items-center mt-0.5">
                <FaUser className="mr-1 text-gray-400" />
                {isOwner ? 'Your listing' : formatAddress(ownerAddress)}
              </div>
            </div>
          </div>
          
          <div className="text-xs px-2 py-0.5 rounded-full flex items-center bg-green-100 text-green-800">
            <FaShieldAlt className="mr-1" />
            Verified
          </div>
        </div>
        
        {/* Card body */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Carbon</div>
            <div className="flex items-center">
              <FaTree className="text-green-500 mr-2" />
              <span className="font-semibold">{listing.carbonTons} tons</span>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Rate</div>
            <div className="flex items-center">
              <FaEthereum className="text-indigo-500 mr-1" />
              <span className="font-semibold">{listing.rate} </span>
            </div>
          </div>
        </div>
        
        {/* Card footer */}
        <div className="flex justify-between items-end">
          <div>
            <div className="text-xs text-gray-500 mb-1 flex items-center">
              <FaEthereum className="mr-1 text-gray-400" />
              Total Price
            </div>
            <div className="font-bold text-lg text-gray-900 flex items-center">
              <FaEthereum className="text-indigo-600 mr-1" />
              {formatEthAmount(listing.price)}
            </div>
            <div className="text-xs text-green-600 flex items-center">
              <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
              {listing.usdPrice}
            </div>
          </div>
          
          {!isOwner && (
            <motion.button 
              onClick={() => onAction(listing)}
              className={`
                flex items-center justify-center px-4 py-2 rounded-lg shadow-sm
                ${type === 'sell' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'}
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {actionText}
              <FaArrowRight className="ml-1.5" />
            </motion.button>
          )}
          
          {isOwner && (
            <div className="flex flex-col items-end">
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center">
                <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></span>
                Your Active Listing
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center">
                <FaClock className="mr-1" />
                Created 2h ago
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CarbonListingCard; 