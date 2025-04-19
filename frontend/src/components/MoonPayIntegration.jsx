import React, { useState, useEffect } from 'react';
import { MoonPayBuyWidget } from '@moonpay/moonpay-react';
import { FaSpinner } from 'react-icons/fa';
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
  // Use MoonPay's official test API key
  const [moonpayApiKey, setMoonpayApiKey] = useState('pk_test_GuiwqtgmYRgQrDui8ws97odTqUWj7');

  // Set to false to use the real MoonPay widget instead of the mock
  const [useMockWidget, setUseMockWidget] = useState(false);

  // Check if we're in development mode
  const isDevelopment = import.meta.env.MODE === 'development' || !import.meta.env.PROD;

  useEffect(() => {
    // Show the widget when the component mounts
    setVisible(true);
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
    if (onError) {
      onError(error);
    }
    toast.error('MoonPay transaction failed. Please try again.');
    setVisible(false);
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
            <MoonPayBuyWidget
              variant="embedded"
              baseCurrencyCode="usd"
              baseCurrencyAmount={amount}
              defaultCurrencyCode="eth" // Using ETH as Scroll might not be directly available in MoonPay sandbox
              colorCode="#6366F1" // Indigo color to match the app's theme
              showWalletAddressForm={true}
              onSuccess={handleMoonPaySuccess}
              onError={handleMoonPayError}
              visible={visible}
              apiKey={moonpayApiKey}
              testMode={true} // Force test mode
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MoonPayIntegration;
