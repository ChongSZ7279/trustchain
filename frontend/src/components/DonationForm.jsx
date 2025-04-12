import React, { useState, useEffect } from 'react';
import { FaTimes, FaWallet, FaExclamationTriangle, FaEthereum, FaCreditCard } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { initWeb3, donateToCharity, isWalletConnected, switchToScroll } from '../utils/contractInteraction';
import { processDonation } from '../services/donationService';
import { testDonationAPI } from '../utils/testDonation';
import { SCROLL_CONFIG } from '../utils/scrollConfig';
import CardPaymentWrapper from './CardPaymentForm';

const DonationForm = ({ charityId, onDonate, loading = false }) => {
  console.log("DonationForm received charityId:", charityId);
  
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [processingDonation, setProcessingDonation] = useState(false);
  const [isScrollNetwork, setIsScrollNetwork] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('blockchain'); // 'blockchain' or 'card'
  
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
  
  useEffect(() => {
    const handleImageErrors = () => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        img.onerror = function() {
          console.log('Image failed to load, using fallback');
          this.src = '/fallback-image.png';
          this.onerror = null;
        };
      });
    };
    
    handleImageErrors();
  }, []);
  
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
      alert('Please enter a valid donation amount');
      return;
    }
    
    if (!agreeTerms) {
      alert('Please agree to the terms');
      return;
    }
    
    console.log("Processing donation for charity ID:", charityId);
    
    try {
      setProcessingDonation(true);
      
      // Use the combined processDonation function with the correct charityId
      const result = await processDonation(charityId, parseFloat(amount), message);
      console.log('Donation result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }
      
      // Add detailed logging about the donation result
      console.log('Donation details:', {
        charityId,
        amount: parseFloat(amount),
        transactionHash: result.transactionHash,
        isBlockchain: result.isBlockchain,
        databaseId: result.donationId || 'Not provided',
        savedToDatabase: !result.databaseError,
        databaseError: result.databaseError
      });
      
      // Call the onDonate callback with the result
      if (onDonate) {
        onDonate(parseFloat(amount), result.transactionHash, result.isBlockchain, result.donationId);
      }
      
      // Reset form
      setAmount('');
      setMessage('');
      setAgreeTerms(false);
      
      // Show more detailed success message based on the actual response structure
      if (result.isBlockchain && result.databaseError) {
        alert(`Donation successful! Transaction hash: ${result.transactionHash}\nWarning: May not have been saved to database`);
      } else if (result.isBlockchain) {
        alert(`Donation successful! Transaction hash: ${result.transactionHash}\nSaved to database with ID: ${result.donationId || 'Unknown'}`);
      } else if (result.donationId) {
        alert(`Donation successful! Saved to database with ID: ${result.donationId}`);
      } else {
        alert('Donation processed, but status unclear. Please check your dashboard for confirmation.');
      }
      
      // Only redirect if we have a donation ID
      if (result.donationId) {
        navigate(`/donations/${result.donationId}`);
      }
    } catch (error) {
      console.error('Error processing donation:', error);
      alert(`Error processing donation: ${error.message}. Please check console for details.`);
    } finally {
      setProcessingDonation(false);
    }
  };
  
  const handleImageError = (e) => {
    e.target.src = "/fallback-image.png"; // Use a local fallback image
    // Or just hide the image
    // e.target.style.display = 'none';
  };
  
  const testDonation = async () => {
    try {
      console.log("Testing donation API...");
      const result = await testDonationAPI(charityId);
      if (result.success) {
        alert("Test donation successful! Check console for details.");
      } else {
        alert(`Test donation failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Error in test donation:", error);
      alert("Test donation error. Check console for details.");
    }
  };

  const handleCardPaymentSuccess = (result) => {
    console.log('Card payment successful:', result);
    if (onDonate) {
      onDonate(parseFloat(amount), null, false, result.donation.id);
    }
    navigate(`/donations/${result.donation.id}`);
  };

  const handleCardPaymentError = (error) => {
    console.error('Card payment error:', error);
    alert(`Payment failed: ${error.message}`);
  };

  return (
    <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto">
      {/* Close Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
      >
        <FaTimes size={20} />
      </button>

      <h2 className="text-xl font-bold mb-4">Make a Donation</h2>
      
      {/* Payment Method Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Payment Method</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setPaymentMethod('blockchain')}
            className={`p-4 border rounded-lg flex items-center justify-center ${
              paymentMethod === 'blockchain'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <FaEthereum className={`mr-2 ${paymentMethod === 'blockchain' ? 'text-indigo-600' : 'text-gray-400'}`} />
            <span className={paymentMethod === 'blockchain' ? 'text-indigo-600' : 'text-gray-700'}>
              Blockchain
            </span>
          </button>
          <button
            onClick={() => setPaymentMethod('card')}
            className={`p-4 border rounded-lg flex items-center justify-center ${
              paymentMethod === 'card'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <FaCreditCard className={`mr-2 ${paymentMethod === 'card' ? 'text-indigo-600' : 'text-gray-400'}`} />
            <span className={paymentMethod === 'card' ? 'text-indigo-600' : 'text-gray-700'}>
              Credit Card
            </span>
          </button>
        </div>
      </div>

      {paymentMethod === 'blockchain' ? (
        <>
          {!walletConnected && (
            <div className="mb-4 p-3 bg-yellow-50 rounded-md">
              <div className="flex items-start">
                <FaExclamationTriangle className="text-yellow-500 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm text-yellow-700">
                    You need to connect your wallet to make a blockchain donation.
                  </p>
                  <button 
                    onClick={connectWallet}
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FaWallet className="mr-1" />
                    Connect Wallet
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {walletConnected && !isScrollNetwork && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <div className="flex items-start">
                <FaEthereum className="text-blue-500 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm text-blue-700">
                    We recommend using Scroll network for lower transaction fees.
                  </p>
                  <button 
                    onClick={switchToScrollNetwork}
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Switch to Scroll
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="donationAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (ETH)
              </label>
              <input
                type="number"
                id="donationAmount"
                placeholder="0.1"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                disabled={processingDonation || !walletConnected}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="donationMessage" className="block text-sm font-medium text-gray-700 mb-1">
                Message (Optional)
              </label>
              <textarea
                id="donationMessage"
                placeholder="Add a message with your donation"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                disabled={processingDonation || !walletConnected}
                rows="3"
              />
            </div>
            
            <div className="mb-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agreeTerms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    disabled={processingDonation || !walletConnected}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeTerms" className="font-medium text-gray-700">
                    I understand that my donation will be processed via blockchain
                  </label>
                  <p className="text-gray-500">
                    Funds will be held in escrow and released based on milestone completion.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <button 
                type="submit" 
                className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                  processingDonation || !walletConnected
                    ? 'bg-indigo-400 cursor-not-allowed'
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
            
            <div className="mt-4 text-xs text-gray-500">
              <p>
                Your donation will be processed on the Scroll network. Gas fees may apply.
                All transactions are transparent and can be verified on the blockchain.
              </p>
            </div>
            
            <button 
              type="button"
              onClick={testDonation}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              Test API Connection
            </button>
          </form>
        </>
      ) : (
        <div className="space-y-4">
          <div className="mb-4">
            <label htmlFor="donationAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (USD)
            </label>
            <input
              type="number"
              id="donationAmount"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="donationMessage" className="block text-sm font-medium text-gray-700 mb-1">
              Message (Optional)
            </label>
            <textarea
              id="donationMessage"
              placeholder="Add a message with your donation"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              rows="3"
            />
          </div>
          
          {amount && parseFloat(amount) > 0 && (
            <CardPaymentWrapper
              amount={parseFloat(amount)}
              onSuccess={handleCardPaymentSuccess}
              onError={handleCardPaymentError}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default DonationForm;
