import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaLeaf, 
  FaChartLine, 
  FaPlus, 
  FaTimes, 
  FaArrowRight, 
  FaEthereum, 
  FaInfoCircle,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaCheckCircle,
  FaGlobe,
  FaTree,
  FaRecycle
} from 'react-icons/fa';
import { useCarbonMarket } from '../context/CarbonMarketContext';
import CarbonWalletButton from './CarbonWalletButton';
import CarbonListingCard from './CarbonListingCard';
import CarbonLoadingOverlay from './CarbonLoadingOverlay';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CarbonMarket = () => {
  const tradingMarketRef = useRef(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [modalType, setModalType] = useState(''); // 'donate' or 'offer'
  const [processingTransaction, setProcessingTransaction] = useState(false);
  const [newListing, setNewListing] = useState({
    organization: '',
    carbonTons: '',
    price: '',
    rate: ''
  });
  
  const { 
    account,
    isConnected,
    isScrollNetwork,
    loading,
    carbonCreditPool,
    sellerListings,
    buyerListings,
    connectWallet,
    createSellerListing,
    createBuyerListing,
    buyCarbonCredits,
    sellCarbonCredits,
    refreshData,
    formatAddress,
    weiToEth,
    ethToWei
  } = useCarbonMarket();

  useEffect(() => {
    // Refresh data when component mounts
    if (isConnected) {
      refreshData();
    }
  }, [isConnected]);

  const handleGetStarted = () => {
    if (!isConnected) {
      connectWallet().then(success => {
        if (success) {
          tradingMarketRef.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    } else {
      tradingMarketRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleCreateListing = (type) => {
    if (!isConnected) {
      toast.info("Please connect your wallet first");
      return;
    }
    
    if (!isScrollNetwork) {
      toast.warning("Please switch to Scroll network before creating a listing");
      return;
    }

    setModalType(type);
    setNewListing({
      organization: '',
      carbonTons: '',
      rate: ''
    });
    setIsCreateModalOpen(true);
  };

  const handleSubmitListing = async (e) => {
    e.preventDefault();
    
    if (!newListing.organization || !newListing.carbonTons || !newListing.rate) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      setProcessingTransaction(true);
      
      let success = false;

      if (modalType === 'offer') {
        success = await createSellerListing(
          newListing.organization, 
          parseInt(newListing.carbonTons), 
          parseFloat(newListing.rate)
        );
      } else {
        success = await createBuyerListing(
          newListing.organization, 
          parseInt(newListing.carbonTons), 
          parseFloat(newListing.rate)
        );
      }
      
      if (success) {
        setIsCreateModalOpen(false);
        setNewListing({ organization: '', carbonTons: '', rate: '' });
        refreshData();
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      toast.error(`Failed to create listing: ${error.message}`);
    } finally {
      setProcessingTransaction(false);
    }
  };

  const handleBuySell = (listing, type) => {
    if (!isConnected) {
      toast.info("Please connect your wallet first");
      return;
    }
    
    if (!isScrollNetwork) {
      toast.warning("Please switch to Scroll network");
      return;
    }
    
    setSelectedListing(listing);
    setModalType(type);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmTransaction = async () => {
    try {
      setProcessingTransaction(true);
      
      let success = false;
      
      if (modalType === 'donate') {
        // Extract numeric part of price and convert to wei
        const priceString = selectedListing.price.replace(' ETH', '');
        const priceInWei = ethToWei(priceString);
        
        success = await buyCarbonCredits(selectedListing.id, priceInWei);
      } else {
        success = await sellCarbonCredits(selectedListing.id);
      }
      
      if (success) {
        setIsConfirmModalOpen(false);
        setSelectedListing(null);
        refreshData();
      }
    } catch (error) {
      console.error("Error processing transaction:", error);
      toast.error(`Transaction failed: ${error.message}`);
    } finally {
      setProcessingTransaction(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" />
      <CarbonLoadingOverlay isVisible={processingTransaction} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Carbon Reduction Marketplace</h1>
          <CarbonWalletButton />
        </div>
        
        {/* Hero Section */}
        <motion.div 
          className="bg-gradient-to-r from-green-50 via-indigo-50 to-blue-50 rounded-2xl p-8 mb-12 shadow-md overflow-hidden relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background decorative elements */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-green-100 opacity-40 z-0"></div>
          <div className="absolute right-24 top-16 w-24 h-24 rounded-full bg-indigo-100 opacity-40 z-0"></div>
          <div className="absolute left-16 bottom-8 w-32 h-32 rounded-full bg-blue-100 opacity-40 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="flex flex-col justify-center">
              <div className="flex items-center mb-2">
                <FaLeaf className="text-green-500 mr-2" />
                <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Powered by Scroll Network</span>
              </div>
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-indigo-700 mb-4">
                Support Carbon Reduction Projects
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Our platform connects companies with environmental charities. Companies can donate ETH to support carbon reduction projects, while charities provide verified carbon reduction services.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-center">
                  <FaGlobe className="mx-auto text-indigo-500 mb-1" />
                  <div className="text-sm font-semibold">Transparent</div>
                  <div className="text-xs text-gray-500">Blockchain Verified</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-center">
                  <FaRecycle className="mx-auto text-green-500 mb-1" />
                  <div className="text-sm font-semibold">Impactful</div>
                  <div className="text-xs text-gray-500">Real Carbon Reduction</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-center">
                  <FaTree className="mx-auto text-teal-500 mb-1" />
                  <div className="text-sm font-semibold">Efficient</div>
                  <div className="text-xs text-gray-500">Low Gas Fees</div>
                </div>
              </div>
              
              <div className="flex flex-wrap space-y-3 sm:space-y-0 sm:space-x-4">
                <motion.button 
                  onClick={handleGetStarted}
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                  <FaArrowRight className="ml-2" />
                </motion.button>
                
                <motion.a 
                  href="https://scroll.io/bridge" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto border border-indigo-200 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaEthereum className="mr-2" />
                  Scroll Bridge
                </motion.a>
              </div>
              
              <AnimatePresence>
                {isConnected && !isScrollNetwork && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 p-3 bg-orange-50 border border-orange-100 rounded-lg flex items-center"
                  >
                    <FaExclamationCircle className="text-orange-500 mr-2 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-orange-800">
                        Please switch to Scroll network to participate
                      </span>
                    </div>
                  </motion.div>
                )}
                
                {isConnected && isScrollNetwork && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center"
                  >
                    <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-green-800">
                        Connected to Scroll network! You're ready to participate.
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center justify-center">
              <motion.div 
                className="relative w-full max-w-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-indigo-300 rounded-3xl blur-xl opacity-20 transform -rotate-6"></div>
                <div className="relative bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <FaEthereum className="text-indigo-600 mr-2" />
                      <h3 className="font-bold text-gray-800">Carbon Reduction Market</h3>
                    </div>
                    <div className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Live</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-gray-600 text-sm">Total Carbon Reduction</div>
                      <div className="font-bold text-gray-900">{carbonCreditPool} TONS</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-indigo-50 rounded-lg text-center">
                        <div className="text-xs text-indigo-600 mb-1">Active Charities</div>
                        <div className="font-bold text-indigo-800">{sellerListings.length}</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg text-center">
                        <div className="text-xs text-green-600 mb-1">Active Donors</div>
                        <div className="font-bold text-green-800">{buyerListings.length}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <motion.button
                        onClick={handleGetStarted}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Start Participating
                        <FaArrowRight className="ml-2" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Trading Market Section */}
        <motion.div 
          ref={tradingMarketRef} 
          className="bg-white rounded-2xl shadow-lg p-8 mb-12 scroll-mt-24 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaChartLine className="text-indigo-600 mr-2" />
              Carbon Reduction Projects
            </h2>
            {isConnected && (
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center">
                <FaCheckCircle className="mr-1" /> Connected
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col items-center justify-center">
              <div className="text-center mb-8 w-full">
                <div className="w-32 h-32 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <FaLeaf className="w-16 h-16 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Total Carbon Reduction</h3>
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900 mr-2">{carbonCreditPool}</span>
                  <span className="text-gray-600 uppercase text-lg">TONS</span>
                </div>
                <div className="w-full max-w-xs mx-auto bg-gray-200 h-1 my-4 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-green-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <FaChartLine className="text-indigo-600 mr-2" />
                    Market Trends
                  </h3>
                  <div className="text-sm text-gray-500 flex items-center">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    Updated 24h ago
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 h-64 flex items-center justify-center border border-gray-100 shadow-inner">
                  <img 
                    src="/market-chart.svg" 
                    alt="Market Chart" 
                    className="w-full h-full object-contain" 
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/800x400/f8fafc/60a5fa?text=Carbon+Market+Trends';
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <motion.div 
                    className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200 shadow-sm"
                    whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  >
                    <div className="text-sm text-gray-500 mb-1">Price (AVG)</div>
                    <div className="font-bold text-green-700 flex items-center">
                      +12.3% 
                      <svg className="ml-1 w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                      </svg>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200 shadow-sm"
                    whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  >
                    <div className="text-sm text-gray-500 mb-1">Volume</div>
                    <div className="font-bold text-blue-700">234 tons</div>
                  </motion.div>
                  <motion.div 
                    className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200 shadow-sm"
                    whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  >
                    <div className="text-sm text-gray-500 mb-1">Projects</div>
                    <div className="font-bold text-purple-700">
                      {sellerListings.length + buyerListings.length}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Listings Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Charity Listings */}
          <motion.div 
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                  <FaLeaf className="text-green-600" />
                </div>
                Charity Projects
              </h3>
              <button 
                onClick={() => handleCreateListing('offer')}
                disabled={!isConnected || !isScrollNetwork}
                className={`
                  inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all
                  ${(!isConnected || !isScrollNetwork) 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-md'}
                `}
                title={!isConnected ? "Connect wallet first" : !isScrollNetwork ? "Switch to Scroll network" : "Create a charity project"}
              >
                <FaPlus className="mr-1" /> Create Project
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
              </div>
            ) : sellerListings.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FaLeaf className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-gray-500 mb-4">No seller listings available</p>
                {isConnected && carbonCredits > 0 && (
                  <motion.button
                    onClick={() => handleCreateListing('sell')}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md shadow-sm text-sm hover:bg-green-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaPlus className="mr-1" /> Create Sell Listing
                  </motion.button>
                )}
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    {sellerListings.length} active {sellerListings.length === 1 ? 'project' : 'projects'}
                  </div>
                  <div className="flex space-x-1">
                    <button className="p-1 rounded-md hover:bg-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                      </svg>
                    </button>
                    <button className="p-1 rounded-md hover:bg-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                  <AnimatePresence>
                    {sellerListings.map((listing) => (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CarbonListingCard
                          listing={listing}
                          type="offer"
                          onAction={(listing) => handleBuySell(listing, 'donate')}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </motion.div>

          {/* Donor Listings */}
          <motion.div 
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <FaEthereum className="text-blue-600" />
                </div>
                Donor Projects
              </h3>
              <button 
                onClick={() => handleCreateListing('donate')}
                disabled={!isConnected || !isScrollNetwork}
                className={`
                  inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all
                  ${(!isConnected || !isScrollNetwork) 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-md'}
                `}
                title={!isConnected ? "Connect wallet first" : !isScrollNetwork ? "Switch to Scroll network" : "Create a donor project"}
              >
                <FaPlus className="mr-1" /> Create Project
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
              </div>
            ) : buyerListings.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FaEthereum className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-gray-500 mb-4">No donor projects available</p>
                {isConnected && (
                  <motion.button
                    onClick={() => handleCreateListing('donate')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm hover:bg-blue-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaPlus className="mr-1" /> Create Donor Project
                  </motion.button>
                )}
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    {buyerListings.length} active {buyerListings.length === 1 ? 'project' : 'projects'}
                  </div>
                  <div className="flex space-x-1">
                    <button className="p-1 rounded-md hover:bg-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                      </svg>
                    </button>
                    <button className="p-1 rounded-md hover:bg-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                  <AnimatePresence>
                    {buyerListings.map((listing) => (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CarbonListingCard
                          listing={listing}
                          type="donate"
                          onAction={(listing) => handleBuySell(listing, 'offer')}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Create Listing Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl border border-gray-100"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-700 flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${modalType === 'offer' ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {modalType === 'offer' 
                    ? <FaLeaf className="text-green-600" /> 
                    : <FaEthereum className="text-blue-600" />
                  }
                </div>
                Create {modalType === 'offer' ? 'Charity' : 'Donor'} Project
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitListing}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {modalType === 'offer' ? 'Charity Name' : 'Company Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newListing.organization}
                    onChange={(e) => setNewListing({...newListing, organization: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder={`Enter ${modalType === 'offer' ? 'charity' : 'company'} name`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carbon Reduction (Tons)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newListing.carbonTons}
                    onChange={(e) => setNewListing({...newListing, carbonTons: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Enter amount in tons"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Per Ton (ETH)
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEthereum className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      required
                      min="0.0001"
                      step="0.0001"
                      value={newListing.rate}
                      onChange={(e) => setNewListing({...newListing, rate: e.target.value})}
                      className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="0.0"
                    />
                  </div>
                </div>
                
                {newListing.carbonTons && newListing.rate && (
                  <motion.div 
                    className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Price:</span>
                      <span className="font-bold text-indigo-700 flex items-center">
                        <FaEthereum className="mr-1" />
                        {(parseFloat(newListing.carbonTons) * parseFloat(newListing.rate)).toFixed(4)} ETH
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-600">Estimated USD:</span>
                      <span className="text-sm text-green-600">
                        ${(parseFloat(newListing.carbonTons) * parseFloat(newListing.rate) * 1000).toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                )}
                
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    w-full px-4 py-3 rounded-lg text-white font-medium flex justify-center items-center shadow-sm transition-all
                    ${modalType === 'offer'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:shadow-md'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-md'
                    }
                  `}
                >
                  Create {modalType === 'offer' ? 'Charity' : 'Donor'} Project
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Confirm Transaction Modal */}
      {isConfirmModalOpen && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl border border-gray-100"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-700 flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${modalType === 'donate' ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {modalType === 'donate' 
                    ? <FaLeaf className="text-green-600" /> 
                    : <FaEthereum className="text-blue-600" />
                  }
                </div>
                Confirm {modalType === 'donate' ? 'Donation' : 'Offer'}
              </h3>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
            
            <div className="mb-6 p-5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100 shadow-inner">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Organization</div>
                  <div className="font-medium">{selectedListing.organization}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Carbon Reduction</div>
                  <div className="font-medium flex items-center">
                    <FaTree className="text-green-500 mr-1" />
                    {selectedListing.carbonTons} tons
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Price</div>
                  <div className="font-medium flex items-center">
                    <FaEthereum className="text-indigo-500 mr-1" />
                    {selectedListing.price}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">USD Value</div>
                  <div className="font-medium text-green-600">{selectedListing.usdPrice}</div>
                </div>
              </div>
              
              <div className="p-3 bg-white rounded-lg border border-indigo-100 shadow-sm">
                <p className="text-sm text-gray-700">
                  You are about to {modalType === 'donate' ? 'donate' : 'offer'} <span className="font-semibold">{selectedListing.carbonTons}</span> tons of carbon reduction for <span className="font-semibold">{selectedListing.price}</span>. This transaction will be processed on the Scroll network and cannot be reversed.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <motion.button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleConfirmTransaction}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex-1 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all
                  ${modalType === 'donate' 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:shadow-md' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-md'
                  }
                `}
              >
                Confirm {modalType === 'donate' ? 'Donation' : 'Offer'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add custom scrollbar styles at the bottom of your component */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default CarbonMarket; 