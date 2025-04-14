import React, { useState, useEffect } from 'react';
import { FaTimes, FaWallet, FaExclamationTriangle, FaEthereum, FaExchangeAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { initWeb3, donateToCharity, isWalletConnected, switchToScroll } from '../utils/contractInteraction';
import { processDonation } from '../services/donationService';
import { testDonationAPI } from '../utils/testDonation';
import { SCROLL_CONFIG } from '../utils/scrollConfig';
import FiatToScrollPaymentWrapper from './FiatToScrollPaymentForm';
import FiatToScrollExplainer from './FiatToScrollExplainer';
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
  const [paymentMethod, setPaymentMethod] = useState('blockchain'); // 'blockchain' or 'fiat_to_scroll'
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const { chainId } = await initWeb3();
        setWalletConnected(isWalletConnected());
        setIsScrollNetwork(chainId === SCROLL_CONFIG.NETWORK.CHAIN_ID);
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };
    
    checkWalletConnection();
  }, []);
  
  // Add navigation debugging
  useEffect(() => {
    console.log('Current charity ID:', charityId);
    return () => {
      console.log('DonationForm unmounting, last charity ID:', charityId);
    };
  }, [charityId]);
  
  const connectWallet = async () => {
    try {
      await initWeb3();
      setWalletConnected(isWalletConnected());
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };
  
  const switchToScrollNetwork = async () => {
    try {
      const success = await switchToScroll();
      if (success) {
        setIsScrollNetwork(true);
      }
    } catch (error) {
      console.error('Error switching to Scroll network:', error);
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
    <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto h-[550px] overflow-y-auto">
      {/* Close Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Close"
      >
        <FaTimes size={20} />
      </button>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Make a Donation</h2>
      
      {/* Payment Method Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Choose Payment Method</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setPaymentMethod('blockchain')}
            className={`p-4 border rounded-lg flex items-center justify-center transition-all ${
              paymentMethod === 'blockchain'
                ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <FaEthereum className={`mr-2 ${paymentMethod === 'blockchain' ? 'text-indigo-600' : 'text-gray-400'}`} />
            <span className={`font-medium ${paymentMethod === 'blockchain' ? 'text-indigo-600' : 'text-gray-700'}`}>
              Blockchain
            </span>
          </button>
          <button
            onClick={() => setPaymentMethod('fiat_to_scroll')}
            className={`p-4 border rounded-lg flex items-center justify-center transition-all ${
              paymentMethod === 'fiat_to_scroll'
                ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <FaExchangeAlt className={`mr-2 ${paymentMethod === 'fiat_to_scroll' ? 'text-indigo-600' : 'text-gray-400'}`} />
            <span className={`font-medium ${paymentMethod === 'fiat_to_scroll' ? 'text-indigo-600' : 'text-gray-700'}`}>
              Fiat to Scroll
            </span>
          </button>
        </div>
      </div>

      {paymentMethod === 'blockchain' ? (
        <>
          {!walletConnected && (
            <div className="mb-5 p-4 bg-yellow-50 rounded-md border border-yellow-100">
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
            <div className="mb-5 p-4 bg-blue-50 rounded-md border border-blue-100">
              <div className="flex items-start">
                <FaEthereum className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-700 font-medium">
                    Switch to Scroll network
                  </p>
                  <p className="text-xs text-blue-600 mb-3">
                    Scroll network offers lower transaction fees and faster processing
                  </p>
                  <button 
                    onClick={switchToScrollNetwork}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Switch to Scroll
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="donationAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (ETH)
              </label>
              <input
                type="number"
                id="donationAmount"
                placeholder="0.1"
                step="0.01"
                min="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                disabled={processingDonation || !walletConnected}
              />
            </div>
            
            <div>
              <label htmlFor="donationMessage" className="block text-sm font-medium text-gray-700 mb-1">
                Message (Optional)
              </label>
              <textarea
                id="donationMessage"
                placeholder="Add a message with your donation"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                disabled={processingDonation || !walletConnected}
                rows="3"
              />
            </div>
            
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
                    I understand that my donation will be processed via blockchain
                  </label>
                  <p className="text-gray-500 text-xs mt-1">
                    Funds will be securely held in escrow and released based on milestone completion.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <button 
                type="submit" 
                className={`w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white shadow-sm transition-colors ${
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
            </div>
            
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
              <p className="mb-1">
                Your donation will be processed on the Scroll network with minimal gas fees.
                All transactions are transparent and verifiable on the blockchain.
              </p>
              <p>
                No personal information is stored on the blockchain, ensuring your privacy.
              </p>
            </div>
          </form>
        </>
      ) : (
        <div className="space-y-5">
          <FiatToScrollExplainer />
          
          <div>
            <label htmlFor="donationAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (USD)
            </label>
            <input
              type="number"
              id="donationAmount"
              placeholder="0.00"
              step="0.01"
              min="0.10"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            />
          </div>
          
          <div>
            <label htmlFor="donationMessage" className="block text-sm font-medium text-gray-700 mb-1">
              Message (Optional)
            </label>
            <textarea
              id="donationMessage"
              placeholder="Add a message with your donation"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              rows="3"
            />
          </div>

          <div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="isAnonymousFiat"
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="isAnonymousFiat" className="font-medium text-gray-700">
                  Make my donation anonymous
                </label>
                <p className="text-gray-500 text-xs mt-1">
                  Your identity will not be shown publicly with your donation.
                </p>
              </div>
            </div>
          </div>
          
          {amount && parseFloat(amount) > 0 && (
            <FiatToScrollPaymentWrapper
              amount={parseFloat(amount)}
              charityId={charityId}
              message={message}
              isAnonymous={isAnonymous}
              onSuccess={handleFiatToScrollSuccess}
              onError={handleFiatToScrollError}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default DonationForm;