import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCarbonMarket } from '../context/CarbonMarketContext';
import { FaWallet, FaExclamationTriangle, FaEthereum, FaSpinner, FaTree, FaUserCircle } from 'react-icons/fa';

const CarbonWalletButton = () => {
  const { 
    account, 
    isConnected, 
    isScrollNetwork,
    loading, 
    error, 
    connectWallet, 
    switchToScrollNetwork,
    formatAddress,
    carbonCredits
  } = useCarbonMarket();

  if (loading) {
    return (
      <motion.button 
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 opacity-80 cursor-not-allowed shadow-sm"
        disabled
        animate={{ 
          scale: [1, 1.02, 1],
          transition: { duration: 1.5, repeat: Infinity }
        }}
      >
        <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
        Loading...
      </motion.button>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center">
        {!isScrollNetwork && (
          <motion.button
            onClick={switchToScrollNetwork}
            className="mr-3 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaEthereum className="mr-1" />
            Switch to Scroll
          </motion.button>
        )}
        
        <div className="flex flex-col items-end">
          <motion.div 
            className={`
              inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm
              ${isScrollNetwork 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white'}
            `}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mr-2 bg-white bg-opacity-20 rounded-full p-1">
              <FaUserCircle className="text-white" />
            </div>
            {formatAddress(account)}
            {isScrollNetwork && (
              <div className="ml-2 bg-green-400 w-2 h-2 rounded-full"></div>
            )}
          </motion.div>
          
          <AnimatePresence>
            {carbonCredits > 0 && (
              <motion.div 
                className="text-xs mt-1.5 flex items-center bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <FaTree className="text-green-500 mr-1.5" />
                <span className="font-medium text-indigo-800">{carbonCredits}</span>
                <span className="text-gray-600 ml-1">Carbon Credits</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <motion.button
      onClick={connectWallet}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-sm"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <FaWallet className="mr-2" />
      Connect Wallet
    </motion.button>
  );
};

export default CarbonWalletButton;