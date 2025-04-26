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
  const context = useCarbonMarket();
  
  // If context is not yet initialized, show loading state
  if (!context) {
    return (
      <div className="min-h-screen bg-gray-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
      </div>
    );
  }

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
    ethToWei,
    requestTestCredits,
    contract
  } = context;

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

      if (modalType === 'donate') {
        // Convert values to appropriate types
        const carbonTonsNumber = parseInt(newListing.carbonTons);
        const rateInEther = newListing.rate.toString();

        success = await createSellerListing(
          newListing.organization,
          carbonTonsNumber,
          rateInEther
        );
      } else {
        // For buyer listing
        const carbonTonsNumber = parseInt(newListing.carbonTons);
        const rateInEther = newListing.rate.toString();
        
        success = await createBuyerListing(
          newListing.organization,
          carbonTonsNumber,
          rateInEther
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

      if (modalType === 'offer') {
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

  // Add this debug function
  const debugMintCredits = async () => {
    try {
      if (!contract || !account) {
        toast.error("Contract or account not initialized");
        return;
      }

      const owner = await contract.methods.owner().call();
      console.log("Contract owner:", owner);
      console.log("Current account:", account);

      if (owner.toLowerCase() !== account.toLowerCase()) {
        toast.error("Only the contract owner can mint credits");
        return;
      }

      const tx = await contract.methods.mintCarbonCredits(account, "100").send({
        from: account,
        gas: 200000
      });

      console.log("Mint transaction:", tx);
      toast.success("Successfully minted 100 credits!");
      
      // Check new balance
      const newBalance = await contract.methods.getCarbonCreditsBalance(account).call();
      toast.info(`New balance: ${newBalance} credits`);
      
      refreshData();
    } catch (err) {
      console.error("Error minting credits:", err);
      toast.error(`Failed to mint credits: ${err.message}`);
    }
  };

  // Add the debug section to your JSX where appropriate
  // For example, add it after the hero section:
  // {isConnected && debugSection}

  return (
    <div className="min-h-screen bg-gray-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" />
      <CarbonLoadingOverlay isVisible={processingTransaction} />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-3xl font-bold text-gray-900">Carbon Marketplace</h1>
          <CarbonWalletButton />
        </div>

        {/* Debug Section */}
        {isConnected && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
            <h4 className="font-semibold mb-2">Debug Controls:</h4>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    const balance = await contract.methods.getCarbonCreditsBalance(account).call();
                    toast.info(`Current balance: ${balance} credits`);
                    
                    const owner = await contract.methods.owner().call();
                    if (owner.toLowerCase() === account.toLowerCase()) {
                      toast.success("You are the contract owner!");
                    } else {
                      toast.warning("You are not the contract owner");
                    }
                  } catch (err) {
                    toast.error(`Error: ${err.message}`);
                  }
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Check Balance
              </button>
              <button
                onClick={debugMintCredits}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                Mint Test Credits
              </button>
              <button
                onClick={refreshData}
                className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
              >
                Refresh Data
              </button>
            </div>
          </div>
        )}

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
                Offset Carbon. Fund Impact.
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Donate to verified charities and reduce your footprint—securely on the Scroll network.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-center">
                  <FaGlobe className="mx-auto text-indigo-500 mb-1" />
                  <div className="text-sm font-semibold">Eco-Friendly</div>
                  <div className="text-xs text-gray-500">Layer 2 Solution</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-center">
                  <FaRecycle className="mx-auto text-green-500 mb-1" />
                  <div className="text-sm font-semibold">Sustainable</div>
                  <div className="text-xs text-gray-500">Low Gas Fees</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-center">
                  <FaTree className="mx-auto text-teal-500 mb-1" />
                  <div className="text-sm font-semibold">Transparent</div>
                  <div className="text-xs text-gray-500">Blockchain-based</div>
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
                {!isConnected && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 text-sm text-indigo-800 flex items-center bg-indigo-50 p-3 rounded-lg border border-indigo-100"
                  >
                    <FaInfoCircle className="text-indigo-600 mr-2 flex-shrink-0" />
                    <span>Connect your wallet to start trading carbon on the Scroll network</span>
                  </motion.div>
                )}

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
                        Please switch to Scroll network to trade carbon
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
                        Connected to Scroll network! You're ready to trade.
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
                      <h3 className="font-bold text-gray-800">Carbon Credit Market</h3>
                    </div>
                    <div className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Live</div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-gray-600 text-sm">Total Carbon Reduction Pool</div>
                      <div className="font-bold text-gray-900">{carbonCreditPool} TONS</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-indigo-50 rounded-lg text-center">
                        <div className="text-xs text-indigo-600 mb-1">Active Charities</div>
                        <div className="font-bold text-indigo-800">{sellerListings.length}</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg text-center">
                        <div className="text-xs text-green-600 mb-1">Active Companies</div>
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
                        Start Trading
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
              Market Analysis
            </h2>
            {isConnected && (
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center">
                <FaCheckCircle className="mr-1" /> Connected
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col items-center justify-center">
              <div className="text-center mb-5 w-full">
                <div className="w-32 h-32 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner mt-5">
                  <FaLeaf className="w-16 h-16 text-green-500" />
                </div>
                {/* Debug Information */}
                {isConnected && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left text-sm">
                    <h4 className="font-semibold mb-2">Debug Information:</h4>
                    <div className="space-y-1">
                      <p>Connected Account: {account}</p>
                      <p>Is Owner: {account && contract ? "Checking..." : "Not Connected"}</p>
                      <p>Network: {isScrollNetwork ? "Scroll Network" : "Wrong Network"}</p>
                      <p>Carbon Credits: {carbonCreditPool} TONS</p>
                      <p>Contract Address: {contract ? contract._address : "Not Connected"}</p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const owner = await contract.methods.owner().call();
                            toast.info(`Contract owner is: ${owner}`);
                            if (owner.toLowerCase() === account.toLowerCase()) {
                              toast.success("You are the contract owner!");
                              // Check balance
                              const balance = await contract.methods.getCarbonCreditsBalance(account).call();
                              toast.info(`Your current balance: ${balance} credits`);
                            } else {
                              toast.warning("You are not the contract owner");
                            }
                          } catch (err) {
                            toast.error(`Error checking owner: ${err.message}`);
                          }
                        }}
                        className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Check Owner & Balance
                      </button>
                      <button
                        onClick={debugMintCredits}
                        className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Mint Credits (Owner Only)
                      </button>
                      <button
                        onClick={refreshData}
                        className="text-xs bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600"
                      >
                        Refresh Data
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-center">
                  <span className="text-6xl font-bold text-gray-900 mr-2 mb-6 mt-4">{carbonCreditPool}</span>
                  <span className="text-gray-800 uppercase text-lg mb-6 mt-4">TONS</span>
                </div>
                <h3 className="text-xl font-semibold mb-6">Total Carbon Reduction Pool</h3>
                <p className="text-m mb-6">Since July 2025</p>
                {isConnected && carbonCreditPool === 0 && (
                  <motion.button
                    onClick={() => requestTestCredits(100)}
                    className="mt-2 text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center mx-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaPlus className="mr-2" />
                    Mint 100 Test Credits
                  </motion.button>
                )}
              </div>

              {/* {isConnected && carbonCreditPool === 0 && (
                <motion.div
                  className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg w-full max-w-md shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <div className="flex items-start">
                    <FaExclamationTriangle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">No carbon</h4>
                      <p className="text-sm text-yellow-700">
                        You don't have any carbon yet. For testing purposes,
                        the contract owner can mint credits to your account.
                      </p>
                      {isConnected && isScrollNetwork && (
                        <motion.button
                          onClick={() => toast.info("Please contact the admin to get test carbon")}
                          className="mt-2 text-xs bg-yellow-200 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-300 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Request Test Credits
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )} */}
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
                <div className="bg-white-50 rounded-lg p-0.5 h-64 flex items-center justify-center border border-gray-100 shadow-inner overflow-hidden">
                    <img 
                      src="/images/stock-performance-card.png"
                      alt="Market Chart" 
                      className="w-full h-full rounded-md" 
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
                    <div className="text-sm text-gray-500 mb-1">Listings</div>
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
          {/* Seller Listings */}
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
                Charity Listings
              </h3>
              <button
                onClick={() => handleCreateListing('donate')}
                disabled={!isConnected || !isScrollNetwork || (isConnected && carbonCreditPool <= 0)}
                className={`
                  inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all
                  ${(!isConnected || !isScrollNetwork || (isConnected && carbonCreditPool <= 0))
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-md'}
                `}
                title={!isConnected ? "Connect wallet first" : !isScrollNetwork ? "Switch to Scroll network" : carbonCreditPool <= 0 ? "You need carbon to sell" : "Create a sell listing"}
              >
                <FaPlus className="mr-1" /> Create Listing
              </button>
            </div>

            {
            loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
              </div>
            ) : sellerListings.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FaLeaf className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-gray-500 mb-4">No seller listings available</p>
                {isConnected && carbonCreditPool > 0 && (
                  <motion.button
                    onClick={() => handleCreateListing('donate')}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md shadow-sm text-sm hover:bg-green-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaPlus className="mr-1" /> Create Listing
                  </motion.button>
                )}
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    {sellerListings.length} active {sellerListings.length === 1 ? 'listing' : 'listings'}
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

          {/* Buyer Listings */}
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
                Company Listings
              </h3>
              <button
                onClick={() => handleCreateListing('offer')}
                disabled={!isConnected || !isScrollNetwork}
                className={`
                  inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all
                  ${(!isConnected || !isScrollNetwork)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-md'}
                `}
                title={!isConnected ? "Connect wallet first" : !isScrollNetwork ? "Switch to Scroll network" : "Create a buy listing"}
              >
                <FaPlus className="mr-1" /> Create Listing
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
                <p className="text-gray-500 mb-4">No buyer listings available</p>
                {isConnected && (
                  <motion.button
                    onClick={() => handleCreateListing('offer')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm hover:bg-blue-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaPlus className="mr-1" /> Create Listing
                  </motion.button>
                )}
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    {buyerListings.length} active {buyerListings.length === 1 ? 'listing' : 'listings'}
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${modalType === 'donate' ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {modalType === 'donate'
                    ? <FaLeaf className="text-green-600" />
                    : <FaEthereum className="text-blue-600" />
                  }
                </div>
                Create {modalType === 'donate' ? 'Charity' : 'Company'} Listing
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            {/* {modalType === 'donate' && carbonCreditPool <= 0 && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-start">
                  <FaExclamationTriangle className="text-red-500 mr-2 mt-1" />
                  <div>
                    <p className="text-sm text-red-800 font-medium">
                      You don't have any carbon to sell
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      You need to have carbon in your wallet to create a sell listing.
                      <br />
                      Please contact the contract owner to mint some credits for testing.
                    </p>
                  </div>
                </div>
              </div>
            )} */}
            
            {/* listing form */}
            <form onSubmit={handleSubmitListing}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {modalType === 'donate' ? 'Organization Name' : 'Company Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newListing.organization}
                    onChange={(e) => setNewListing({ ...newListing, organization: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder={modalType === 'donate' ? "Enter your organization name" : "Enter your company name"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carbon (Tons)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newListing.carbonTons}
                    onChange={(e) => setNewListing({ ...newListing, carbonTons: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder={modalType === 'donate' ? "Enter amount of carbon you can reduce" : "Enter amount of carbon you wish to reduce"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Per Ton (Scroll)
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
                      onChange={(e) => setNewListing({ ...newListing, rate: e.target.value })}
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
                        {(parseFloat(newListing.carbonTons) * parseFloat(newListing.rate)).toFixed(4)} Scroll
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
                  disabled={modalType === 'donate' && carbonCreditPool <= 0}
                  whileHover={modalType === 'donate' && carbonCreditPool <= 0 ? {} : { scale: 1.02 }}
                  whileTap={modalType === 'donate' && carbonCreditPool <= 0 ? {} : { scale: 0.98 }}
                  className={`
                    w-full px-4 py-3 rounded-lg text-white font-medium flex justify-center items-center shadow-sm transition-all
                    ${modalType === 'donate' && carbonCreditPool <= 0
                      ? 'bg-gray-300 cursor-not-allowed'
                      : modalType === 'donate'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:shadow-md'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-md'
                    }
                  `}
                >
                  Create {modalType === 'donate' ? 'Charity' : 'Company'} Listing
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${modalType === 'offer' ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {modalType === 'offer'
                    ? <FaLeaf className="text-green-600" />
                    : <FaEthereum className="text-blue-600" />
                  }
                </div>
                Confirm {modalType === 'offer' ? 'Purchase' : 'Sale'}
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
                  <div className="text-xs text-gray-500 mb-1">Company</div>
                  <div className="font-medium">{selectedListing.organization}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Carbon Reduction Target</div>
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
                  You are about to {modalType === 'offer' ? 'buy' : 'reduce'} <span className="font-semibold">{selectedListing.carbonTons}</span> tons of carbon for <span className="font-semibold">{selectedListing.price}</span>. This transaction will be processed on the Scroll network and cannot be reversed.
                </p>
              </div>
            </div>

            {modalType === 'donate' && carbonCreditPool < selectedListing.carbonTons && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-start">
                  <FaExclamationTriangle className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-red-800 font-medium">
                      Insufficient carbon
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      You need {selectedListing.carbonTons} carbon to complete this sale.
                      You currently have {carbonCreditPool} credits.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                disabled={modalType === 'donate' && carbonCreditPool < selectedListing.carbonTons}
                whileHover={modalType === 'donate' && carbonCreditPool < selectedListing.carbonTons ? {} : { scale: 1.02 }}
                whileTap={modalType === 'donate' && carbonCreditPool < selectedListing.carbonTons ? {} : { scale: 0.98 }}
                className={`
                  flex-1 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all
                  ${modalType === 'donate' && carbonCreditPool < selectedListing.carbonTons
                    ? 'bg-gray-300 cursor-not-allowed'
                    : modalType === 'offer'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:shadow-md'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-md'
                  }
                `}
              >
                Confirm {modalType === 'offer' ? 'Purchase' : 'Sale'}
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