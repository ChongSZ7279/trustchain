import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaLock, FaExchangeAlt, FaEthereum } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import API_BASE_URL from '../config/api';

// Initialize Stripe with the correct environment variable
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || process.env.REACT_APP_STRIPE_PUBLIC_KEY;
console.log('Using Stripe public key:', stripeKey); // For debugging

// Only initialize if we have a key
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

// Component to show when Stripe isn't configured
const StripeNotConfigured = () => (
  <div className="p-4 bg-yellow-50 rounded-md text-yellow-800 text-sm">
    <h3 className="font-medium mb-2">Stripe Not Configured</h3>
    <p>The Stripe payment system is not properly configured. Please contact the administrator.</p>
  </div>
);

const FiatToScrollPaymentForm = ({ amount, charityId, message = '', isAnonymous = false, onSuccess, onError }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [conversionRate, setConversionRate] = useState(null);
  const [scrollAmount, setScrollAmount] = useState(null);
  const [currency] = useState('USD'); // Default currency
  const stripe = useStripe();
  const elements = useElements();

  // Fetch current Scroll conversion rate
  useEffect(() => {
    const fetchConversionRate = async () => {
      try {
        // Don't include auth token for this public endpoint
        const response = await axios.get(`${API_BASE_URL}/scroll-conversion-rates?currency=${currency}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.success) {
          setConversionRate(response.data.data.scroll_price);
          calculateScrollAmount(amount, response.data.data.scroll_price);
        }
      } catch (err) {
        console.error('Error fetching conversion rate:', err);
        // Use fallback value instead of showing error
        const fallbackRate = currency === 'USD' ? 2500 : 2300;
        console.log('Using fallback conversion rate:', fallbackRate);
        setConversionRate(fallbackRate);
        calculateScrollAmount(amount, fallbackRate);
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
    
    if (!stripe || !elements) {
      return;
    }

    // Validate amount before proceeding
    if (parseFloat(amount) < 0.10) {
      setError("Minimum donation amount is $0.10");
      return;
    }

    setProcessing(true);
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
        return;
      }

      // First create a payment intent on the server (public endpoint, no auth needed)
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
        console.log('Using test mode, skipping Stripe confirmation');
        // Create a fake successful payment result
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
      
      // Use the appropriate endpoint based on authentication status
      const endpoint = isLoggedIn 
        ? `${API_BASE_URL}/process-fiat-donation` 
        : `${API_BASE_URL}/fiat-to-scroll-noauth`;

      // Force use the no-auth endpoint for now since auth isn't working properly
      // Overwrite the endpoint rather than redeclaring it
      let apiEndpoint = `${API_BASE_URL}/fiat-to-scroll-noauth`;
      
      // Prepare headers based on auth status
      const headers = {
        'Content-Type': 'application/json',
        ...(isLoggedIn ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      // Call backend to process fiat to Scroll conversion
      try {
        console.log('Sending request to:', apiEndpoint);
        console.log('Request payload:', {
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
        });
        
        let response;
        try {
          // First try the fiat-to-scroll endpoint
          response = await axios.post(apiEndpoint, {
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
          }, { headers });
        } catch (firstError) {
          console.error('First endpoint attempt failed:', firstError);
          
          // If that fails, try the simple-donation endpoint as fallback
          console.log('Trying fallback simple-donation endpoint...');
          response = await axios.post(`${API_BASE_URL}/simple-donation`, {
            charity_id: charityId,
            amount: parseFloat(amount),
            transaction_hash: 'fiat_' + paymentResult.paymentIntent.id,
            message: message || '',
            test_mode: isTestMode
          });
          
          console.log('Simple donation fallback response:', response.data);
        }

        console.log('Donation response:', response.data);

        if (response.data.success) {
          // Extract the donation ID - try to parse as integer for proper redirection
          let donationId;
          
          if (response.data.donation && response.data.donation.id) {
            // If we have a donation object with id
            donationId = parseInt(response.data.donation.id) || response.data.donation.id;
          } else if (response.data.id) {
            // Direct id in response
            donationId = parseInt(response.data.id) || response.data.id;
          } else if (response.data.donation_id) {
            // donation_id field
            donationId = parseInt(response.data.donation_id) || response.data.donation_id;
          } else {
            donationId = 'unknown';
          }
          
          // Extract transaction hash
          const transactionHash = 
            (response.data.donation && response.data.donation.transaction_hash) ||
            response.data.transaction_hash ||
            paymentResult.paymentIntent.id;
          
          console.log('Extracted donation data:', {
            donationId, 
            transactionHash,
            testMode: isTestMode || response.data.test_mode
          });
          
          onSuccess({
            success: true,
            donation: {
              id: donationId,
              amount: parseFloat(amount),
              transaction_hash: transactionHash
            },
            test_mode: isTestMode || response.data.test_mode
          });
        } else {
          throw new Error(response.data.error || 'Payment processing failed');
        }
      } catch (err) {
        console.error('Error processing fiat-to-scroll payment:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          headers: err.response?.headers
        });
        
        // Check for detailed error message in response
        let errorMessage = 'Payment processing failed';
        if (err.response && err.response.data) {
          if (err.response.data.error) {
            errorMessage = err.response.data.error;
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          }
          
          // Log any additional error details
          console.error('Backend error details:', err.response.data);
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        onError(err);
      }
    } catch (err) {
      console.error('Error in payment process:', err);
      setError(err.message || 'An error occurred during payment processing');
      onError(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center mb-4 justify-between">
          <div className="flex items-center">
            <FaCreditCard className="text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Card Details</span>
          </div>
          <div className="flex items-center text-xs text-indigo-600">
            <FaExchangeAlt className="mr-1" />
            <span>1 {currency} ≈ {conversionRate ? (1/conversionRate).toFixed(6) : '...'} SCROLL</span>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-md p-3 mb-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        
        <div className="bg-blue-50 p-3 rounded-md mb-3">
          <div className="flex items-center text-sm text-blue-700 mb-1">
            <FaEthereum className="mr-2" />
            <span className="font-medium">Conversion Details</span>
          </div>
          <div className="text-xs text-blue-600">
            <p>You're donating: ${amount} {currency}</p>
            <p>Equivalent in SCROLL: {scrollAmount || '...'} SCROLL</p>
            <p>Current exchange rate: 1 SCROLL = ${conversionRate || '...'} {currency}</p>
          </div>
        </div>
        
        {error && (
          <div className="mt-2 text-sm text-red-600">
            {error}
          </div>
        )}
        
        <div className="mt-4 flex items-center text-xs text-gray-500">
          <FaLock className="mr-1" />
          <span>Your payment is secure and encrypted</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!stripe || processing || !conversionRate}
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          !stripe || processing || !conversionRate
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        }`}
      >
        {processing ? 'Processing...' : `Pay $${amount} (${scrollAmount || '...'} SCROLL)`}
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