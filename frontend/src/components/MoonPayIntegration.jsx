import React, { useState, useEffect } from 'react';
import { MoonPayBuyWidget, MoonPayProvider } from '@moonpay/moonpay-react';
import { FaSpinner, FaCreditCard } from 'react-icons/fa';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { toast } from 'react-hot-toast';
import MockMoonPayWidget from './MockMoonPayWidget';

const MoonPayIntegration = ({
  amount,
  charityId,
  message = '',
  isAnonymous = false,
  onSuccess,
  onError
}) => {
  const [visible, setVisible] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [widgetLoading, setWidgetLoading] = useState(true);
  // Use MoonPay's official test API key
  const [moonpayApiKey, setMoonpayApiKey] = useState('pk_test_GuiwqtgmYRgQrDui8ws97odTqUWj7');

  // Set to false to use the real MoonPay widget instead of the mock
  const [useMockWidget, setUseMockWidget] = useState(false);

  // Check if we're in development mode
  const isDevelopment = import.meta.env.MODE === 'development' || !import.meta.env.PROD;

  useEffect(() => {
    // Show the widget when the component mounts
    setVisible(true);

    // Set a timeout to hide the loading indicator after a reasonable time
    // This is a fallback in case the widget doesn't trigger onSuccess or onError
    const loadingTimer = setTimeout(() => {
      setWidgetLoading(false);
    }, 5000);

    return () => clearTimeout(loadingTimer);
  }, []);

  // Handle successful transaction from MoonPay
  const handleMoonPaySuccess = async (data) => {
    console.log('MoonPay transaction successful:', data);
    setProcessing(true);

    try {
      // Extract transaction data
      const transactionHash = data.transactionId || `moonpay-${Date.now()}`;

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
        currency_type: 'SCROLL',
        is_anonymous: isAnonymous,
        payment_method: 'moonpay',
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
      console.error('Error processing MoonPay donation:', error);
      if (onError) {
        onError(error);
      }
      toast.error('Failed to process donation. Please try again.');
    } finally {
      setProcessing(false);
      setVisible(false);
    }
  };

  // Handle errors from MoonPay
  const handleMoonPayError = (error) => {
    console.error('MoonPay error:', error);

    // More detailed error logging
    if (error && error.message) {
      console.error('Error message:', error.message);
    }

    if (error && error.code) {
      console.error('Error code:', error.code);
    }

    // Show more specific error message to user
    let errorMessage = 'MoonPay transaction failed. Please try again.';

    if (error && error.message) {
      errorMessage = `MoonPay error: ${error.message}`;
    }

    toast.error(errorMessage);

    if (onError) {
      onError(error);
    }

    // Don't hide the widget on all errors
    if (error && error.message && error.message.includes('widget closed')) {
      setVisible(false);
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
            <MockMoonPayWidget
              amount={amount}
              baseCurrencyCode="usd"
              defaultCurrencyCode="eth"
              onSuccess={handleMoonPaySuccess}
              onError={handleMoonPayError}
            />
          ) : (
            <div className="p-6 border border-gray-200 rounded-lg bg-white">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Continue with MoonPay</h3>
                <p className="text-gray-600">
                  You'll be redirected to MoonPay to complete your purchase of ${amount} USD worth of ETH.
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
                  // Create MoonPay URL
                  const moonpayUrl = new URL('https://buy-sandbox.moonpay.com');
                  moonpayUrl.searchParams.append('apiKey', moonpayApiKey);
                  moonpayUrl.searchParams.append('currencyCode', 'eth');
                  moonpayUrl.searchParams.append('baseCurrencyAmount', amount);
                  moonpayUrl.searchParams.append('walletAddress', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
                  moonpayUrl.searchParams.append('externalCustomerId', `trustchain-${Date.now()}`);
                  moonpayUrl.searchParams.append('redirectURL', window.location.href);

                  // Open MoonPay in new window
                  window.open(moonpayUrl.toString(), '_blank');

                  // Show processing state
                  setProcessing(true);

                  // After 3 seconds, show a message about checking for the transaction
                  setTimeout(() => {
                    toast.success('Please complete your purchase on MoonPay. Return to this page after completion.');
                    setProcessing(false);
                  }, 3000);
                }}
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Continue to MoonPay
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                You will be redirected to MoonPay's secure payment page in a new window.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MoonPayIntegration;
