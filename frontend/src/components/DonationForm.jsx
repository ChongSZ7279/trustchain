import React, { useState, useEffect } from 'react';
import { FaTimes, FaWallet, FaExclamationTriangle, FaExchangeAlt, FaEthereum, FaCreditCard, FaDollarSign, FaHandHoldingHeart, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import Web3 from 'web3';
import { useNavigate } from 'react-router-dom';
import { initWeb3, donateToCharity, isWalletConnected, switchToScroll } from '../utils/contractInteraction';
import { processDonation } from '../services/donationService';
import { SCROLL_CONFIG } from '../utils/scrollConfig';
import AlchemyPayIntegration from './AlchemyPayIntegration';
import TransakIntegration from './TransakIntegration';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const DonationForm = ({ charityId, onDonate, loading = false }) => {
  console.log("DonationForm received charityId:", charityId);

  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [processingDonation, setProcessingDonation] = useState(false);
  const [isScrollNetwork, setIsScrollNetwork] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('blockchain'); // 'blockchain', 'transak', or 'alchemypay'
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        // Check if MetaMask is installed
        if (!window.ethereum) {
          console.log('MetaMask not detected');
          return;
        }

        const { chainId } = await initWeb3();
        const connected = isWalletConnected();
        console.log('Initial wallet check - Connected:', connected, 'Chain ID:', chainId);

        setWalletConnected(connected);
        const isScroll = chainId === SCROLL_CONFIG.NETWORK.CHAIN_ID;
        setIsScrollNetwork(isScroll);

        // If wallet is connected but not on Scroll network, automatically try to switch
        if (connected && !isScroll) {
          console.log('Wallet connected but not on Scroll network. Attempting to switch...');
          try {
            await switchToScrollNetwork();
          } catch (switchError) {
            console.error('Failed to auto-switch to Scroll network:', switchError);
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };

    // Set up event listeners for account and network changes
    const setupEventListeners = () => {
      if (window.ethereum) {
        // Listen for account changes
        window.ethereum.on('accountsChanged', async (accounts) => {
          console.log('accountsChanged event triggered:', accounts);
          if (accounts.length === 0) {
            // User disconnected their wallet
            setWalletConnected(false);
            console.log('Wallet disconnected');
          } else {
            // User switched accounts
            setWalletConnected(true);
            console.log('Wallet account changed to:', accounts[0]);

            // Check if we're on the correct network
            try {
              const web3 = new Web3(window.ethereum);
              const chainId = await web3.eth.getChainId();
              const isScroll = chainId === SCROLL_CONFIG.NETWORK.CHAIN_ID;
              setIsScrollNetwork(isScroll);
            } catch (error) {
              console.error('Error checking chain after account change:', error);
            }
          }
        });

        // Listen for network changes
        window.ethereum.on('chainChanged', async (chainIdHex) => {
          console.log('chainChanged event triggered:', chainIdHex);
          const chainId = parseInt(chainIdHex, 16);
          const isScroll = chainId === SCROLL_CONFIG.NETWORK.CHAIN_ID;
          setIsScrollNetwork(isScroll);
          console.log('Network changed to chain ID:', chainId, 'Is Scroll:', isScroll);
        });
      }
    };

    checkWalletConnection();
    setupEventListeners();

    // Cleanup function to remove event listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  // Add navigation debugging
  useEffect(() => {
    console.log('Current charity ID:', charityId);
    return () => {
      console.log('DonationForm unmounting, last charity ID:', charityId);
    };
  }, [charityId]);

  // Flag to track if a wallet connection is in progress
  const [connectionInProgress, setConnectionInProgress] = useState(false);

  const connectWallet = async () => {
    // Prevent multiple simultaneous connection attempts
    if (connectionInProgress) {
      console.log('Wallet connection already in progress, please wait...');
      toast.info('Wallet connection in progress. Please check MetaMask and respond to any pending requests.');
      return false;
    }

    try {
      setConnectionInProgress(true);
      console.log('Connecting wallet from DonationForm');

      // Check if already connected first
      if (isWalletConnected()) {
        console.log('Wallet already connected, checking network...');
        setWalletConnected(true);

        // Get chain ID directly
        const web3Instance = new Web3(window.ethereum);
        const chainId = await web3Instance.eth.getChainId();

        // Check if we're on Scroll network
        const isScroll = chainId === SCROLL_CONFIG.NETWORK.CHAIN_ID;
        setIsScrollNetwork(isScroll);

        // If not on Scroll network, try to switch
        if (!isScroll) {
          console.log('Connected but not on Scroll network. Attempting to switch...');
          await switchToScrollNetwork();
        }

        return true;
      }

      // If not already connected, initialize Web3
      const { chainId } = await initWeb3();
      const connected = isWalletConnected();
      console.log('Wallet connected:', connected, 'Chain ID:', chainId);

      setWalletConnected(connected);

      // Check if we're on Scroll network
      const isScroll = chainId === SCROLL_CONFIG.NETWORK.CHAIN_ID;
      setIsScrollNetwork(isScroll);

      // If not on Scroll network, try to switch
      if (connected && !isScroll) {
        console.log('Connected but not on Scroll network. Attempting to switch...');
        await switchToScrollNetwork();
      }

      return connected;
    } catch (error) {
      console.error('Error connecting wallet:', error);

      // Handle specific error codes
      if (error.code === -32002) {
        toast.info('MetaMask request already pending. Please open MetaMask and confirm any pending requests.');
      } else {
        toast.error(`Failed to connect wallet: ${error.message}`);
      }

      return false;
    } finally {
      setConnectionInProgress(false);
    }
  };

  const switchToScrollNetwork = async () => {
    try {
      console.log('Attempting to switch to Scroll network from DonationForm');
      const success = await switchToScroll();
      if (success) {
        setIsScrollNetwork(true);
        console.log('Successfully switched to Scroll network');
        // Force a re-check of the wallet connection
        setWalletConnected(isWalletConnected());
      } else {
        console.warn('Failed to switch to Scroll network');
      }
    } catch (error) {
      console.error('Error switching to Scroll network:', error);
      toast.error(`Failed to switch to Scroll network: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    if (!agreeTerms) {
      toast.error('Please agree to the terms');
      return;
    }

    try {
      setProcessingDonation(true);

      const donationAmount = parseFloat(amount);
      console.log("Processing donation for charity ID:", charityId, "amount:", donationAmount);

      // Ensure charity ID is valid
      if (!charityId || isNaN(parseInt(charityId))) {
        throw new Error('Invalid charity ID. Please try refreshing the page.');
      }

      const result = await processDonation(
        charityId,
        donationAmount,
        message
      );

      console.log('Donation result:', result);

      if (result.success) {
        if (result.databaseError) {
          // Show a warning to user that transaction was successful but not saved to database
          const errorMessage = result.error || 'Unknown database error';
          toast.warning(`Warning: Your donation was processed on the blockchain but our systems couldn't record it. Please contact support with your transaction hash.`);
        } else {
          // Everything went well
          toast.success(`Donation successful!`);
        }

        if (onDonate) {
          onDonate(donationAmount, result.transactionHash, true, result.databaseId);
        }

        // Redirect to donation details if ID is available
        if (result.databaseId) {
          navigate(`/donations/${result.databaseId}`);
        }
      } else {
        throw new Error(result.error || 'Failed to process donation');
      }
    } catch (error) {
      console.error('Error processing donation:', error);

      // Show a more user-friendly error message
      const errorMessage = error.message || 'Unknown error occurred';
      const isBlockchainError = errorMessage.includes('MetaMask') ||
                               errorMessage.includes('wallet') ||
                               errorMessage.includes('transaction');

      if (isBlockchainError) {
        toast.error(`Blockchain Error: Please check your wallet connection and try again.`);
      } else {
        toast.error(`Error: Please try again or contact support if the issue persists.`);
      }
    } finally {
      setProcessingDonation(false);
    }
  };


  const handleFiatToScrollSuccess = async (result) => {
    console.log('Fiat to Scroll payment successful:', result);

    // Extract donation ID from the response
    let donationId = result.donation?.id ||
                   (result.donation && typeof result.donation === 'object' ? result.donation.id : null) ||
                   result.id;

    // Extract transaction hash from the response
    const transactionHash =
      result.donation?.transaction_hash ||
      (result.transaction_hash || `fiat-${Date.now()}`);

    // If we received a fake ID, try to create a real donation via simple-donation endpoint
    if (typeof donationId === 'string' && donationId.startsWith('fake_')) {
      console.log('Detected fake donation ID, attempting to create real donation record');

      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

        // Call the simple-donation endpoint
        const response = await axios.post(`${API_BASE_URL}/simple-donation`, {
          charity_id: charityId,
          amount: parseFloat(amount),
          transaction_hash: transactionHash,
          message: message || '',
          test_mode: true,
          is_fiat: true,
          currency_type: 'SCROLL'
        });

        if (response.data.success) {
          // Update donation ID with the real one
          donationId = response.data.id;
        }
      } catch (err) {
        console.error('Failed to create real donation record:', err);
      }
    }

    if (onDonate) {
      onDonate(
        parseFloat(amount),
        transactionHash,
        true,
        donationId
      );
    }

    // For test mode or missing donation ID, show success toast and redirect to charity page
    if (result.test_mode && (!donationId || typeof donationId === 'string' && donationId.startsWith('fake_'))) {
      navigate(`/charities/${charityId}`);
      toast.success('Test donation successful!');
    }
    // For successful donations with ID, navigate to donation details page
    else if (donationId && (typeof donationId === 'number' || !isNaN(parseInt(donationId)))) {
      navigate(`/donations/${donationId}`);
      toast.success('Donation successful! Viewing details...');
    }
    // Fallback for any other case
    else {
      navigate(`/charities/${charityId}`);
      toast.success('Donation successful!');
    }
  };

  const handleFiatToScrollError = (error) => {
    console.error('Fiat to Scroll payment error:', error);

    // Extract more detailed error information
    let errorMessage = error.message || 'Payment failed';
    if (error.response && error.response.data) {
      if (error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    }

    toast.error(`Payment failed: ${errorMessage}`);
  };

  return (
    <div className="relative bg-white rounded-xl shadow-lg max-w-lg mx-auto h-[550px] overflow-y-auto">
      {/* Close Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors z-10"
        aria-label="Close"
      >
        <FaTimes size={20} />
      </button>

      {/* Improved Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white">
        <h2 className="text-xl font-bold flex items-center">
          <FaHandHoldingHeart className="mr-2" />
          Make a Donation
        </h2>
        <p className="mt-1 text-indigo-100">
          Your contribution makes a real difference
        </p>
      </div>

      <div className="p-6">
        {/* Payment Method Selection - Improved UI */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Choose Payment Method</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setPaymentMethod('blockchain')}
              className={`p-3 border rounded-lg flex flex-col items-center justify-center transition-all ${
                paymentMethod === 'blockchain'
                  ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center mb-1">
                <FaEthereum className={`mr-1 ${paymentMethod === 'blockchain' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className={`text-xs font-bold ${paymentMethod === 'blockchain' ? 'text-indigo-600' : 'text-gray-400'}`}>SCROLL</span>
              </div>
              <span className={`font-medium text-sm ${paymentMethod === 'blockchain' ? 'text-indigo-600' : 'text-gray-700'}`}>
                Wallet
              </span>
            </button>
            <button
              onClick={() => setPaymentMethod('transak')}
              className={`p-3 border rounded-lg flex flex-col items-center justify-center transition-all ${
                paymentMethod === 'transak'
                  ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <FaExchangeAlt className={`mb-1 ${paymentMethod === 'transak' ? 'text-indigo-600' : 'text-gray-400'}`} />
              <span className={`font-medium text-sm ${paymentMethod === 'transak' ? 'text-indigo-600' : 'text-gray-700'}`}>
                Transak
              </span>
            </button>
            <button
              onClick={() => setPaymentMethod('alchemypay')}
              className={`p-3 border rounded-lg flex flex-col items-center justify-center transition-all ${
                paymentMethod === 'alchemypay'
                  ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <FaCreditCard className={`mb-1 ${paymentMethod === 'alchemypay' ? 'text-indigo-600' : 'text-gray-400'}`} />
              <span className={`font-medium text-sm ${paymentMethod === 'alchemypay' ? 'text-indigo-600' : 'text-gray-700'}`}>
                Alchemy Pay
              </span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            We exclusively use Scroll for blockchain donations due to its lower fees and faster processing.
          </p>
        </div>

        {paymentMethod === 'blockchain' ? (
          <>
            {!walletConnected && (
              <div className="mb-5 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <div className="flex items-start">
                  <FaExclamationTriangle className="text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-700 font-medium">
                      Wallet connection required
                    </p>
                    <p className="text-xs text-yellow-600 mb-3">
                      Please connect your crypto wallet to make a blockchain donation
                    </p>
                    <button
                      onClick={connectWallet}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      <FaWallet className="mr-2" />
                      Connect Wallet
                    </button>
                  </div>
                </div>
              </div>
            )}

            {walletConnected && !isScrollNetwork && (
              <div className="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start">
                  <div className="flex items-center mr-3">
                    <FaEthereum className="text-blue-500 mr-1" />
                    <span className="text-xs font-bold text-blue-500">SCROLL</span>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 font-medium">
                      Switch to Scroll network required
                    </p>
                    <p className="text-xs text-blue-600 mb-3">
                      We exclusively use Scroll for donations due to its lower fees and faster processing
                    </p>
                    <button
                      onClick={switchToScrollNetwork}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Switch to Scroll Network
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Debug section - only visible when there are issues */}
            {walletConnected && isScrollNetwork && (
              <div className="mb-5 p-4 bg-green-50 rounded-lg border border-green-100">
                <p className="text-sm text-green-700 font-medium flex items-center">
                  <FaCheckCircle className="mr-2" /> Connected to Scroll network
                </p>
                <p className="text-xs text-green-600">
                  You can now make donations using Scroll
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Amount Field - Improved consistency */}
              <div>
                <label htmlFor="donationAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEthereum className="text-gray-500" />
                  </div>
                  <input
                    type="number"
                    id="donationAmount"
                    placeholder="0.001"
                    step="0.001"
                    min="0.001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="pl-10 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                    disabled={processingDonation || !walletConnected}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <div className="flex items-center text-gray-500 font-medium">
                      <span>SCROLL</span>
                    </div>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Minimum donation: 0.001 SCROLL</p>
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="donationMessage" className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  id="donationMessage"
                  placeholder="Add a message with your donation"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                  disabled={processingDonation || !walletConnected}
                  rows="3"
                />
              </div>

              {/* Anonymous Donation Option - Added for consistency */}
              <div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="isAnonymous"
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors"
                      disabled={processingDonation || !walletConnected}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="isAnonymous" className="font-medium text-gray-700">
                      Make my donation anonymous
                    </label>
                    <p className="text-gray-500 text-xs mt-1">
                      Your identity will not be shown publicly with your donation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms Agreement */}
              <div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="agreeTerms"
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      required
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors"
                      disabled={processingDonation || !walletConnected}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="agreeTerms" className="font-medium text-gray-700">
                      I understand that my donation will be processed via the Scroll blockchain
                    </label>
                    <p className="text-gray-500 text-xs mt-1">
                      Funds will be securely held in escrow and released based on milestone completion. Scroll provides lower fees than other networks.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button - Improved consistency */}
              <button
                type="submit"
                className={`w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white shadow-sm transition-colors ${
                  processingDonation || !walletConnected
                    ? 'bg-indigo-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
                disabled={processingDonation || !walletConnected}
              >
                {processingDonation ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Donate Now'
                )}
              </button>

              {/* Info Box - Improved styling */}
              <div className="text-xs text-gray-500 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-start">
                  <FaInfoCircle className="text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="mb-1 text-blue-700">
                      Your donation will be processed exclusively on the Scroll network with minimal gas fees.
                      All transactions are transparent and verifiable on the blockchain.
                    </p>
                    <p className="mb-1 text-blue-700">
                      No personal information is stored on the blockchain, ensuring your privacy.
                    </p>
                    <p className="text-blue-700 font-medium">
                      Why Scroll? Scroll offers significantly lower transaction fees compared to Ethereum, allowing more of your donation to reach the charity.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </>
        ) : paymentMethod === 'transak' ? (
          <div className="space-y-5">
            {/* Transak Information Box - Improved styling */}
            <div className="bg-indigo-50 p-4 rounded-lg mb-4 border border-indigo-100">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-indigo-800 flex items-center">
                  <FaExchangeAlt className="mr-2" />
                  Transak Integration
                </h3>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Test Mode
                </span>
              </div>
              <p className="text-indigo-700 text-sm">
                Transak allows you to easily purchase cryptocurrency using your credit card, debit card, or bank transfer.
                You'll be redirected to Transak's secure payment page to complete your purchase.
              </p>
              <p className="text-indigo-700 text-xs mt-2">
                <strong>Note:</strong> You'll purchase ETH which will be converted to SCROLL for donation purposes.
              </p>
            </div>

            {/* Amount Input - Consistent styling */}
            <div>
              <label htmlFor="donationAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaDollarSign className="text-gray-500" />
                </div>
                <input
                  type="number"
                  id="donationAmount"
                  placeholder="10.00"
                  step="0.01"
                  min="0.10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="pl-10 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <div className="flex items-center text-gray-500 font-medium">
                    <span>USD</span>
                  </div>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">Will be converted to SCROLL for donation</p>
            </div>

            {/* Message field - Consistent styling */}
            <div>
              <label htmlFor="donationMessage" className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                id="donationMessage"
                placeholder="Add a message with your donation"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                rows="3"
              />
            </div>

            {/* Anonymous option - Consistent styling */}
            <div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="isAnonymousTransak"
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="isAnonymousTransak" className="font-medium text-gray-700">
                    Make my donation anonymous
                  </label>
                  <p className="text-gray-500 text-xs mt-1">
                    Your identity will not be shown publicly with your donation.
                  </p>
                </div>
              </div>
            </div>

            {amount && parseFloat(amount) > 0 && (
              <TransakIntegration
                amount={parseFloat(amount)}
                charityId={charityId}
                message={message}
                isAnonymous={isAnonymous}
                onSuccess={handleFiatToScrollSuccess}
                onError={handleFiatToScrollError}
              />
            )}
          </div>
        ) : paymentMethod === 'alchemypay' ? (
          <div className="space-y-5">
            {/* AlchemyPay Information Box - Improved styling */}
            <div className="bg-indigo-50 p-4 rounded-lg mb-4 border border-indigo-100">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-indigo-800 flex items-center">
                  <FaCreditCard className="mr-2" />
                  Alchemy Pay Integration
                </h3>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Test Mode
                </span>
              </div>
              <p className="text-indigo-700 text-sm">
                Alchemy Pay allows you to easily purchase cryptocurrency using your credit card, debit card, or bank transfer.
                You'll be redirected to Alchemy Pay's secure payment page to complete your purchase.
              </p>
              <p className="text-indigo-700 text-xs mt-2">
                <strong>Note:</strong> You'll purchase ETH which will be converted to SCROLL for donation purposes.
              </p>
            </div>

            {/* Amount Input - Consistent styling */}
            <div>
              <label htmlFor="alchemypayDonationAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaDollarSign className="text-gray-500" />
                </div>
                <input
                  type="number"
                  id="alchemypayDonationAmount"
                  placeholder="10.00"
                  step="0.01"
                  min="5.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="pl-10 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <div className="flex items-center text-gray-500 font-medium">
                    <span>USD</span>
                  </div>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">Minimum donation: $5.00 USD</p>
            </div>

            {/* Message field - Consistent styling */}
            <div>
              <label htmlFor="alchemypayDonationMessage" className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                id="alchemypayDonationMessage"
                placeholder="Add a message with your donation"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                rows="3"
              />
            </div>

            {/* Anonymous option - Consistent styling */}
            <div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="isAnonymousAlchemypay"
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="isAnonymousAlchemypay" className="font-medium text-gray-700">
                    Make my donation anonymous
                  </label>
                  <p className="text-gray-500 text-xs mt-1">
                    Your identity will not be shown publicly with your donation.
                  </p>
                </div>
              </div>
            </div>

            {amount && parseFloat(amount) >= 5.0 && (
              <AlchemyPayIntegration
                amount={parseFloat(amount)}
                charityId={charityId}
                message={message}
                isAnonymous={isAnonymous}
                onSuccess={handleFiatToScrollSuccess}
                onError={handleFiatToScrollError}
              />
            )}

            {amount && parseFloat(amount) > 0 && parseFloat(amount) < 5.0 && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <div className="flex items-start">
                  <FaExclamationTriangle className="text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-yellow-700 text-sm">
                    Alchemy Pay requires a minimum donation of $5.00 USD. Please increase your donation amount to continue.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DonationForm;