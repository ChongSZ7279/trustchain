import React, { useState, useEffect } from 'react';
import { FaSpinner, FaCreditCard, FaExchangeAlt } from 'react-icons/fa';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { toast } from 'react-hot-toast';
import MockTransakWidget from './MockTransakWidget';

const TransakIntegration = ({
  amount,
  charityId,
  message = '',
  isAnonymous = false,
  onSuccess,
  onError
}) => {
  const [visible, setVisible] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Use Transak's test API key from environment variables
  const [transakApiKey, setTransakApiKey] = useState(import.meta.env.VITE_TRANSAK_API_KEY || '1238a84e-561f-4595-a06b-03bd56572502');

  // Check if API key is valid
  const hasValidApiKey = transakApiKey && transakApiKey.length > 10 && transakApiKey !== 'your_transak_test_api_key';

  // Use mock widget if no valid API key or if explicitly set
  const [useMockWidget, setUseMockWidget] = useState(!hasValidApiKey);

  // Toggle for production vs staging environment
  const [useProductionEnv, setUseProductionEnv] = useState(true);

  // Show warning if using mock widget due to invalid API key
  useEffect(() => {
    if (!hasValidApiKey) {
      console.warn('No valid Transak API key found. Using mock widget instead.');
      toast.warning('Using simulated Transak widget (no API key found)');
    }
  }, [hasValidApiKey]);

  // Check if we're in development mode
  const isDevelopment = import.meta.env.MODE === 'development' || !import.meta.env.PROD;

  useEffect(() => {
    // Show the widget when the component mounts
    setVisible(true);
  }, []);

  // Handle successful transaction from Transak
  const handleTransakSuccess = async (data) => {
    console.log('Transak transaction successful:', data);
    setProcessing(true);

    try {
      // Extract transaction data
      const transactionHash = data.transactionId || `transak-${Date.now()}`;

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
        payment_method: 'transak',
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
      console.error('Error processing Transak donation:', error);
      if (onError) {
        onError(error);
      }
      toast.error('Failed to process donation. Please try again.');
    } finally {
      setProcessing(false);
      setVisible(false);
    }
  };

  // Handle errors from Transak
  const handleTransakError = (error) => {
    console.error('Transak error:', error);

    // More detailed error logging
    if (error && error.message) {
      console.error('Error message:', error.message);
    }

    if (error && error.code) {
      console.error('Error code:', error.code);
    }

    // Show more specific error message to user
    let errorMessage = 'Transak transaction failed. Please try again.';

    if (error && error.message) {
      errorMessage = `Transak error: ${error.message}`;
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
            <div className="mb-4 p-2 bg-gray-100 rounded-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">Widget Mode</span>
                <button
                  onClick={() => setUseMockWidget(!useMockWidget)}
                  className={`px-3 py-1 text-xs rounded-full ${useMockWidget ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}
                >
                  {useMockWidget ? 'Using Mock Widget' : 'Using Real Widget'}
                </button>
              </div>

              {!useMockWidget && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-700">Environment</span>
                  <button
                    onClick={() => setUseProductionEnv(!useProductionEnv)}
                    className={`px-3 py-1 text-xs rounded-full ${useProductionEnv ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                  >
                    {useProductionEnv ? 'Production' : 'Staging'}
                  </button>
                </div>
              )}
            </div>
          )}

          {useMockWidget ? (
            <MockTransakWidget
              amount={amount}
              baseCurrencyCode="usd"
              defaultCurrencyCode="eth"
              onSuccess={handleTransakSuccess}
              onError={handleTransakError}
            />
          ) : (
            <div className="p-6 border border-gray-200 rounded-lg bg-white">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Continue with Transak</h3>
                <p className="text-gray-600">
                  You'll be redirected to Transak to complete your purchase of ${amount} USD worth of ETH.
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
                  // Create Transak URL with proper parameters based on environment
                  const baseUrl = useProductionEnv ? 'https://global.transak.com/' : 'https://staging-global.transak.com/';
                  console.log(`Using Transak ${useProductionEnv ? 'production' : 'staging'} environment: ${baseUrl}`);
                  const transakUrl = new URL(baseUrl);
                  transakUrl.searchParams.append('apiKey', transakApiKey);
                  transakUrl.searchParams.append('defaultCryptoCurrency', 'ETH');
                  transakUrl.searchParams.append('fiatAmount', amount);
                  transakUrl.searchParams.append('fiatCurrency', 'USD');
                  transakUrl.searchParams.append('walletAddress', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
                  transakUrl.searchParams.append('exchangeScreenTitle', 'Donate to Charity');
                  transakUrl.searchParams.append('redirectURL', window.location.href);
                  transakUrl.searchParams.append('hostURL', window.location.origin);
                  transakUrl.searchParams.append('disableWalletAddressForm', 'true');
                  transakUrl.searchParams.append('hideExchangeScreen', 'true');
                  transakUrl.searchParams.append('themeColor', '6366F1');
                  transakUrl.searchParams.append('transactionId', `trustchain-${Date.now()}`);
                  transakUrl.searchParams.append('partnerOrderId', `charity-${charityId}-${Date.now()}`);
                  transakUrl.searchParams.append('email', localStorage.getItem('guest_email') || '');

                  try {
                    // Log the URL for debugging
                    console.log('Opening Transak URL:', transakUrl.toString());

                    // Open Transak in new window
                    const transakWindow = window.open(transakUrl.toString(), '_blank');

                    // Check if window opened successfully
                    if (!transakWindow) {
                      throw new Error('Popup blocked. Please allow popups for this site.');
                    }

                    // Show processing state
                    setProcessing(true);

                    // After 3 seconds, show a message about checking for the transaction
                    setTimeout(() => {
                      toast.success('Please complete your purchase on Transak. Return to this page after completion.');
                      setProcessing(false);
                    }, 3000);

                    // Add event listener for window close
                    const checkWindowClosed = setInterval(() => {
                      if (transakWindow.closed) {
                        clearInterval(checkWindowClosed);
                        toast.info('Transak window closed. If your purchase was successful, your donation will be processed.');
                      }
                    }, 1000);
                  } catch (error) {
                    console.error('Error opening Transak:', error);
                    toast.error(`Failed to open Transak: ${error.message}`);
                    setProcessing(false);
                  }
                }}
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Continue to Transak
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                You will be redirected to Transak's secure payment page in a new window.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransakIntegration;
