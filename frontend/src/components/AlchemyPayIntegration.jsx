import React, { useState, useEffect } from 'react';
import { FaSpinner, FaCreditCard, FaExchangeAlt, FaEthereum } from 'react-icons/fa';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { toast } from 'react-hot-toast';
import MockAlchemyPayWidget from './MockAlchemyPayWidget';

const AlchemyPayIntegration = ({
  amount,
  charityId,
  message = '',
  isAnonymous = false,
  onSuccess,
  onError
}) => {
  const [visible, setVisible] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Use Alchemy Pay's test API key
  const [alchemyPayApiKey, setAlchemyPayApiKey] = useState('your_alchemy_pay_test_api_key');
  
  // Set to true to use the mock widget during development
  const [useMockWidget, setUseMockWidget] = useState(true);
  
  // Check if we're in development mode
  const isDevelopment = import.meta.env.MODE === 'development' || !import.meta.env.PROD;

  useEffect(() => {
    // Show the widget when the component mounts
    setVisible(true);
  }, []);

  // Handle successful transaction from Alchemy Pay
  const handleAlchemyPaySuccess = async (data) => {
    console.log('Alchemy Pay transaction successful:', data);
    setProcessing(true);

    try {
      // Extract transaction data
      const transactionHash = data.transactionId || `alchemypay-${Date.now()}`;

      // Create a donation record in the database
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

      // Check if user is logged in
      const token = localStorage.getItem('token');
      const isLoggedIn = !!token;

      // Prepare headers based on auth status
      const headers = {
        'Content-Type': 'application/json',
        ...(isLoggedIn ? { 'Authorization': `Bearer ${token}` } : {})
      };

      // Call the simple-donation endpoint
      const response = await axios.post(`${API_BASE_URL}/simple-donation`, {
        charity_id: charityId,
        amount: parseFloat(amount),
        transaction_hash: transactionHash,
        message: message || '',
        test_mode: true,
        is_fiat: true,
        currency_type: 'ETH', // Initially ETH, will be bridged to SCROLL
        is_anonymous: isAnonymous,
        payment_method: 'alchemypay',
        ...(!isLoggedIn ? {
          user_email: localStorage.getItem('guest_email') || 'guest@example.com',
          user_name: localStorage.getItem('guest_name') || 'Guest User'
        } : {})
      }, { headers });

      if (response.data.success) {
        // Extract donation ID
        const donationId = response.data.id || 'unknown';

        // Call the success callback
        if (onSuccess) {
          onSuccess({
            success: true,
            donation: {
              id: donationId,
              amount: parseFloat(amount),
              transaction_hash: transactionHash
            },
            test_mode: true
          });
        }
      } else {
        throw new Error(response.data.error || 'Failed to record donation');
      }
    } catch (error) {
      console.error('Error processing Alchemy Pay donation:', error);
      if (onError) {
        onError(error);
      }
      toast.error('Failed to process donation. Please try again.');
    } finally {
      setProcessing(false);
      setVisible(false);
    }
  };

  // Handle errors from Alchemy Pay
  const handleAlchemyPayError = (error) => {
    console.error('Alchemy Pay error:', error);

    // More detailed error logging
    if (error && error.message) {
      console.error('Error message:', error.message);
    }

    if (error && error.code) {
      console.error('Error code:', error.code);
    }

    // Show more specific error message to user
    let errorMessage = 'Alchemy Pay transaction failed. Please try again.';

    if (error && error.message) {
      errorMessage = `Alchemy Pay error: ${error.message}`;
    }

    toast.error(errorMessage);

    if (onError) {
      onError(error);
    }
  };

  return (
    <div className="space-y-5">
      {processing ? (
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-center">
          <div className="flex justify-center mb-4">
            <FaSpinner className="animate-spin text-indigo-600 text-3xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Processing Your Donation</h3>
          <p className="text-gray-600 mb-4">
            Please wait while we process your donation...
          </p>
        </div>
      ) : (
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          {/* Development mode toggle - only visible during development */}
          {isDevelopment && (
            <div className="mb-4 p-2 bg-gray-100 rounded-md flex items-center justify-between">
              <span className="text-xs text-gray-700">Development Mode</span>
              <button
                onClick={() => setUseMockWidget(!useMockWidget)}
                className={`px-3 py-1 text-xs rounded-full ${useMockWidget ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}
              >
                {useMockWidget ? 'Using Mock Widget' : 'Using Real Widget'}
              </button>
            </div>
          )}

          {useMockWidget ? (
            <MockAlchemyPayWidget
              amount={amount}
              baseCurrencyCode="usd"
              defaultCurrencyCode="eth"
              onSuccess={handleAlchemyPaySuccess}
              onError={handleAlchemyPayError}
            />
          ) : (
            <div className="p-6 border border-gray-200 rounded-lg bg-white">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Continue with Alchemy Pay</h3>
                <p className="text-gray-600">
                  You'll be redirected to Alchemy Pay to complete your purchase of ${amount} USD worth of ETH.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center mb-2">
                  <FaCreditCard className="text-indigo-600 mr-2" />
                  <span className="font-medium">Transaction Details</span>
                </div>
                <div className="text-sm text-gray-700">
                  <p><span className="font-medium">Amount:</span> ${amount} USD</p>
                  <p><span className="font-medium">Currency:</span> ETH (Ethereum)</p>
                  <p><span className="font-medium">Mode:</span> Test Transaction</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  // Create Alchemy Pay URL - this is a placeholder, replace with actual implementation
                  const alchemyPayUrl = new URL('https://checkout-test.alchemypay.org');
                  alchemyPayUrl.searchParams.append('apiKey', alchemyPayApiKey);
                  alchemyPayUrl.searchParams.append('fiatAmount', amount);
                  alchemyPayUrl.searchParams.append('fiatCurrency', 'USD');
                  alchemyPayUrl.searchParams.append('cryptoCurrency', 'ETH');
                  alchemyPayUrl.searchParams.append('walletAddress', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
                  alchemyPayUrl.searchParams.append('orderId', `trustchain-${Date.now()}`);
                  alchemyPayUrl.searchParams.append('redirectUrl', window.location.href);
                  
                  // Open Alchemy Pay in new window
                  window.open(alchemyPayUrl.toString(), '_blank');
                  
                  // Show processing state
                  setProcessing(true);
                  
                  // After 3 seconds, show a message about checking for the transaction
                  setTimeout(() => {
                    toast.success('Please complete your purchase on Alchemy Pay. Return to this page after completion.');
                    setProcessing(false);
                  }, 3000);
                }}
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Continue to Alchemy Pay
              </button>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                You will be redirected to Alchemy Pay's secure payment page in a new window.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlchemyPayIntegration;
