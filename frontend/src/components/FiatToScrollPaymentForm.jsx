import React, { useState, useEffect } from 'react';
import { 
  FaCreditCard, FaLock, FaExchangeAlt, FaEthereum, FaShieldAlt, 
  FaInfoCircle, FaCheckCircle, FaSpinner
} from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import API_BASE_URL from '../config/api';

// Initialize Stripe with the correct environment variable
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || process.env.REACT_APP_STRIPE_PUBLIC_KEY;

// Only initialize if we have a key
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

// Component to show when Stripe isn't configured
const StripeNotConfigured = () => (
  <div className="p-5 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-800">
    <div className="flex items-center mb-3">
      <FaInfoCircle className="text-yellow-600 mr-2 text-lg" />
      <h3 className="font-semibold">Stripe Payment Not Available</h3>
    </div>
    <p className="ml-6">
      The payment system is currently unavailable. Please try again later or contact support if this issue persists.
    </p>
  </div>
);

// Card element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      '::placeholder': {
        color: '#aab7c4',
      },
      padding: '10px 14px',
    },
    invalid: {
      color: '#e53e3e',
      iconColor: '#e53e3e',
    },
  },
  hidePostalCode: true,
};

const FiatToScrollPaymentForm = ({ amount, charityId, message = '', isAnonymous = false, onSuccess, onError }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [conversionRate, setConversionRate] = useState(null);
  const [scrollAmount, setScrollAmount] = useState(null);
  const [currency] = useState('USD'); // Default currency
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, error
  const [cardComplete, setCardComplete] = useState(false);
  
  const stripe = useStripe();
  const elements = useElements();

  // Fetch current Scroll conversion rate
  useEffect(() => {
    const fetchConversionRate = async () => {
      setPaymentStatus('loading_rate');
      try {
        const response = await axios.get(`${API_BASE_URL}/scroll-conversion-rates?currency=${currency}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.success) {
          setConversionRate(response.data.data.scroll_price);
          calculateScrollAmount(amount, response.data.data.scroll_price);
          setPaymentStatus('idle');
        }
      } catch (err) {
        console.error('Error fetching conversion rate:', err);
        // Use fallback value instead of showing error
        const fallbackRate = currency === 'USD' ? 2500 : 2300;
        setConversionRate(fallbackRate);
        calculateScrollAmount(amount, fallbackRate);
        setPaymentStatus('idle');
      }
    };

    fetchConversionRate();
  }, [currency, amount]);

  // Calculate equivalent Scroll amount based on fiat amount and conversion rate
  const calculateScrollAmount = (fiatAmount, rate) => {
    if (!fiatAmount || !rate) return;
    
    const scroll = parseFloat(fiatAmount) / parseFloat(rate);
    setScrollAmount(scroll.toFixed(6));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements || !cardComplete) {
      return;
    }

    // Validate amount before proceeding
    if (parseFloat(amount) < 0.10) {
      setError("Minimum donation amount is $0.10");
      return;
    }

    setProcessing(true);
    setPaymentStatus('processing');
    setError(null);

    try {
      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        setPaymentStatus('error');
        return;
      }

      // First create a payment intent on the server
      const createPaymentIntent = await axios.post(`${API_BASE_URL}/stripe/create-payment-intent`, {
        amount: parseFloat(amount),
        currency,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!createPaymentIntent.data.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Check if we're in test mode (our backend will indicate this)
      const isTestMode = createPaymentIntent.data.testMode === true;
      let paymentResult;
      
      if (!isTestMode) {
        // For real Stripe integration - confirm the payment with the client secret
        paymentResult = await stripe.confirmCardPayment(createPaymentIntent.data.clientSecret, {
          payment_method: paymentMethod.id
        });

        if (paymentResult.error) {
          throw new Error(paymentResult.error.message);
        }
      } else {
        // In test mode, we don't actually confirm with Stripe
        paymentResult = {
          paymentIntent: {
            id: createPaymentIntent.data.paymentIntentId,
            status: 'succeeded'
          }
        };
      }

      // Check if user is logged in
      const token = localStorage.getItem('token');
      const isLoggedIn = !!token;
      
      // Use the no-auth endpoint
      let apiEndpoint = `${API_BASE_URL}/fiat-to-scroll-noauth`;
      
      // Prepare headers based on auth status
      const headers = {
        'Content-Type': 'application/json',
        ...(isLoggedIn ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      // Prepare payload for API call
      const payload = {
        amount: parseFloat(amount),
        currency,
        charity_id: charityId,
        message,
        is_anonymous: isAnonymous,
        payment_intent_id: paymentResult.paymentIntent.id,
        test_mode: isTestMode,
        ...(!isLoggedIn ? { 
          user_email: localStorage.getItem('guest_email') || 'guest@example.com',
          user_name: localStorage.getItem('guest_name') || 'Guest User'
        } : {})
      };
      
      // Call backend to process fiat to Scroll conversion
      try {
        let response;
        try {
          // First try the fiat-to-scroll endpoint
          response = await axios.post(apiEndpoint, payload, { headers });
        } catch (firstError) {
          // If that fails, try the simple-donation endpoint as fallback
          response = await axios.post(`${API_BASE_URL}/simple-donation`, {
            charity_id: charityId,
            amount: parseFloat(amount),
            transaction_hash: 'fiat_' + paymentResult.paymentIntent.id,
            message: message || '',
            test_mode: isTestMode
          });
        }

        if (response.data.success) {
          // Extract donation data
          let donationId;
          
          if (response.data.donation && response.data.donation.id) {
            donationId = parseInt(response.data.donation.id) || response.data.donation.id;
          } else if (response.data.id) {
            donationId = parseInt(response.data.id) || response.data.id;
          } else if (response.data.donation_id) {
            donationId = parseInt(response.data.donation_id) || response.data.donation_id;
          } else {
            donationId = 'unknown';
          }
          
          // Extract transaction hash
          const transactionHash = 
            (response.data.donation && response.data.donation.transaction_hash) ||
            response.data.transaction_hash ||
            paymentResult.paymentIntent.id;
          
          setPaymentStatus('success');
          
          // Delay success callback slightly to show the success state
          setTimeout(() => {
            onSuccess({
              success: true,
              donation: {
                id: donationId,
                amount: parseFloat(amount),
                transaction_hash: transactionHash
              },
              test_mode: isTestMode || response.data.test_mode
            });
          }, 1000);
        } else {
          throw new Error(response.data.error || 'Payment processing failed');
        }
      } catch (err) {
        let errorMessage = 'Payment processing failed';
        if (err.response && err.response.data) {
          if (err.response.data.error) {
            errorMessage = err.response.data.error;
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        setPaymentStatus('error');
        onError(err);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during payment processing');
      setPaymentStatus('error');
      onError(err);
    } finally {
      setProcessing(false);
    }
  };

  // Handle card input changes
  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  // Render different content based on payment status
  if (paymentStatus === 'success') {
    return (
      <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 rounded-full p-3">
            <FaCheckCircle className="text-green-600 text-3xl" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-green-800 mb-2">Payment Successful!</h3>
        <p className="text-green-700 mb-4">
          Your donation of ${amount} (equivalent to {scrollAmount} SCROLL) has been processed successfully.
        </p>
        <div className="bg-white p-3 rounded-md text-sm text-green-700 inline-block">
          Thank you for your generosity!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        {/* Header with conversion info */}
        <div className="flex items-center mb-5 justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-2 rounded-full mr-3">
              <FaCreditCard className="text-indigo-600" />
            </div>
            <span className="text-gray-800 font-medium">Secure Card Payment</span>
          </div>
          <div className="flex items-center text-sm bg-blue-50 px-3 py-1 rounded-full text-blue-700">
            <FaExchangeAlt className="mr-2" />
            <span>{conversionRate ? `1 SCROLL ≈ $${conversionRate}` : 'Loading rates...'}</span>
          </div>
        </div>
        
        {/* Card input section */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Card Information</label>
          <div className={`border ${error ? 'border-red-300' : 'border-gray-300'} rounded-md p-4 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all`}>
            <CardElement
              options={cardElementOptions}
              onChange={handleCardChange}
            />
          </div>
          {error && (
            <div className="mt-2 text-sm text-red-600 flex items-center">
              <FaInfoCircle className="mr-1" />
              {error}
            </div>
          )}
        </div>
        
        {/* Conversion details */}
        <div className="bg-indigo-50 p-4 rounded-lg mb-5">
          <div className="flex items-center text-indigo-800 font-medium mb-3">
            <FaEthereum className="mr-2" />
            <span>Donation Details</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-indigo-700">
            <div className="flex justify-between">
              <span>You're donating:</span>
              <span className="font-medium">${amount} {currency}</span>
            </div>
            <div className="flex justify-between">
              <span>Equivalent in SCROLL:</span>
              <span className="font-medium">{scrollAmount || '...'} SCROLL</span>
            </div>
            <div className="flex justify-between col-span-2">
              <span>Current exchange rate:</span>
              <span className="font-medium">1 SCROLL = ${conversionRate || '...'} {currency}</span>
            </div>
          </div>
        </div>
        
        {/* Security and benefits section */}
        <div className="flex items-start mb-4 text-xs text-gray-600">
          <div className="bg-gray-100 p-1 rounded-full mr-2 mt-1">
            <FaShieldAlt className="text-gray-500" />
          </div>
          <div>
            <p className="leading-tight">
              Your donation is protected by blockchain technology. Your card details are securely processed by Stripe and never stored on our servers.
            </p>
          </div>
        </div>
      </div>

      {/* Payment button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!stripe || processing || !conversionRate || !cardComplete || paymentStatus === 'loading_rate'}
        className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white relative
          ${!stripe || processing || !conversionRate || !cardComplete || paymentStatus === 'loading_rate'
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
      >
        {processing ? (
          <span className="flex items-center justify-center">
            <FaSpinner className="animate-spin mr-2" />
            Processing Payment...
          </span>
        ) : (
          <>
            {paymentStatus === 'loading_rate' ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                Loading Exchange Rates...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <FaLock className="mr-2" />
                Pay ${amount} ({scrollAmount || '...'} SCROLL)
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
};

// Wrapper component to provide Stripe context
const FiatToScrollPaymentWrapper = ({ amount, charityId, message, isAnonymous, onSuccess, onError }) => {
  if (!stripePromise) {
    return <StripeNotConfigured />;
  }

  return (
    <Elements stripe={stripePromise}>
      <FiatToScrollPaymentForm 
        amount={amount}
        charityId={charityId}
        message={message}
        isAnonymous={isAnonymous}
        onSuccess={onSuccess} 
        onError={onError} 
      />
    </Elements>
  );
};

export default FiatToScrollPaymentWrapper;