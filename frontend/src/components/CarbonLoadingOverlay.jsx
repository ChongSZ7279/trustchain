import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner, FaTree, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const CarbonLoadingOverlay = ({ 
  isVisible, 
  status = 'loading', 
  message = 'Processing your transaction...',
  onClose
}) => {
  
  const statusConfig = {
    loading: {
      icon: <FaSpinner className="animate-spin h-10 w-10 text-green-400" />,
      title: "Processing Transaction",
      bgColor: "from-indigo-900/90 to-blue-900/90"
    },
    success: {
      icon: <FaCheckCircle className="h-10 w-10 text-green-400" />,
      title: "Transaction Successful",
      bgColor: "from-green-900/90 to-emerald-900/90"
    },
    error: {
      icon: <FaExclamationCircle className="h-10 w-10 text-red-400" />,
      title: "Transaction Failed",
      bgColor: "from-red-900/90 to-rose-900/90"
    }
  };

  const config = statusConfig[status] || statusConfig.loading;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={status !== 'loading' ? onClose : undefined}
          />
          
          <motion.div
            className={`relative p-8 rounded-xl shadow-2xl bg-gradient-to-br ${config.bgColor} border border-white/10 max-w-md w-full mx-4`}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-xl opacity-10">
              <div className="absolute -right-16 -top-16 w-32 h-32 bg-white/20 rounded-full" />
              <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-white/20 rounded-full" />
              <div className="grid grid-cols-6 grid-rows-6 h-full gap-2 p-2">
                {[...Array(36)].map((_, i) => (
                  <div key={i} className="bg-white/5 rounded-md"></div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center text-center z-10 relative">
              <motion.div
                animate={status === 'loading' ? {
                  rotateY: [0, 180, 360],
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{ duration: 2, repeat: status === 'loading' ? Infinity : 0 }}
                className="mb-4 bg-white/10 rounded-full p-4"
              >
                {config.icon}
              </motion.div>
              
              <h3 className="text-xl font-semibold text-white mb-2">
                {config.title}
              </h3>
              
              <p className="text-gray-200 mb-4">{message}</p>
              
              {status === 'loading' && (
                <div className="w-full bg-white/10 rounded-full h-2 mb-6">
                  <motion.div 
                    className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
              )}
              
              {status !== 'loading' && (
                <motion.button
                  onClick={onClose}
                  className="mt-2 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              )}
              
              {status === 'loading' && (
                <div className="flex items-center mt-2">
                  <FaTree className="text-green-400 mr-2" />
                  <p className="text-sm text-gray-300">
                    <span className="text-white">Carbon Credits</span> are being processed on the Scroll network
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CarbonLoadingOverlay; 