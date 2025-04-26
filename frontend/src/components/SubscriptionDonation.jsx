import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  FaCalendarAlt,
  FaCreditCard,
  FaInfoCircle,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaAngleDown,
  FaDollarSign,
  FaShieldAlt,
  FaRegCalendarCheck,
  FaEthereum,
  FaExchangeAlt,
  FaWallet,
  FaThumbsUp,
  FaHandHoldingHeart
} from 'react-icons/fa';

const SubscriptionDonation = ({ organizationId, organizationName, onClose }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // States for form management
  const [amount, setAmount] = useState('10');
  const [frequency, setFrequency] = useState('monthly');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('transak');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  
  // Exchange rate state variables
  const [exchangeRates, setExchangeRates] = useState({
    ethToScroll: 1,    // 1 ETH = 1 SCROLL (initial value)
    usdToScroll: 2000, // 1 SCROLL = $2000 USD (initial value)
    myrToUsd: 4.2,     // 1 USD = 4.2 MYR (initial value)
  });
  const [loadingRates, setLoadingRates] = useState(false);
  
  // Fetch conversion rates from API
  useEffect(() => {
    const fetchConversionRates = async () => {
      setLoadingRates(true);
      try {
        // Get base API URL from environment variables or use default
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        
        // Fetch USD rate for Scroll
        const usdResponse = await axios.get(`${API_BASE_URL}/scroll-conversion-rates?currency=USD`);
        
        // If successful, update the exchange rates
        if (usdResponse.data.success) {
          const scrollPriceUSD = usdResponse.data.data.scroll_price;
          
          // For simplicity, we'll assume ETH to Scroll is 1:1 (they're close in value)
          // In production, you'd want to fetch this from an API that compares both assets
          const ethToScrollRate = 1;
          
          // Update exchange rates state
          setExchangeRates({
            ethToScroll: ethToScrollRate,
            usdToScroll: scrollPriceUSD,
            myrToUsd: 4.2 // Using fixed rate for MYR
          });
        }
      } catch (error) {
        console.error('Failed to fetch conversion rates:', error);
        // Keep using default values if API call fails
      } finally {
        setLoadingRates(false);
      }
    };
    
    fetchConversionRates();
    
    // Refresh rates every 5 minutes
    const ratesInterval = setInterval(fetchConversionRates, 5 * 60 * 1000);
    
    return () => clearInterval(ratesInterval);
  }, []);
  
  const frequencyOptions = [
    { value: 'weekly', label: 'Weekly', description: 'Donate every week' },
    { value: 'biweekly', label: 'Bi-weekly', description: 'Donate every two weeks' },
    { value: 'monthly', label: 'Monthly', description: 'Donate once a month' },
    { value: 'quarterly', label: 'Quarterly', description: 'Donate every three months' }
  ];
  
  // Get selected frequency object
  const selectedFrequency = frequencyOptions.find(option => option.value === frequency);
  
  // Currency conversion section component
  const CurrencyConversionInfo = () => (
    <div className="mt-4 mb-6 bg-gray-50 rounded-lg border border-gray-200 p-3">
      <div className="flex items-center mb-2">
        <FaExchangeAlt className="text-indigo-500 mr-2" />
        <h3 className="text-sm font-medium text-gray-700">Currency Conversion {loadingRates && "(Loading...)"}</h3>
      </div>
      <div className="text-xs text-gray-600 space-y-1">
        <p>1 SCROLL = {1/exchangeRates.ethToScroll} ETH</p>
        <p>1 SCROLL ≈ ${exchangeRates.usdToScroll.toFixed(2)} USD</p>
        <p>1 SCROLL ≈ RM {(exchangeRates.usdToScroll * exchangeRates.myrToUsd).toFixed(2)} MYR</p>
      </div>
    </div>
  );
  
  // Handle subscription creation
  const handleCreateSubscription = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/organizations/${organizationId}` } });
      return;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSuccess(true);
      setShowConfirmation(false);
    } catch (err) {
      setError('Failed to create subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const validateForm = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid donation amount');
      return false;
    }
    
    setError(null);
    return true;
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };
  
  // Success screen component
  const SuccessScreen = () => (
    <div className="p-8 text-center">
      <div className="bg-green-100 rounded-full p-5 w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <FaCheckCircle className="text-green-600 text-4xl" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Subscription Activated!</h2>
      <p className="text-gray-600 mb-4">
        Thank you for your ${amount} {selectedFrequency?.label} donation to {organizationName}.
        Your first payment has been processed, and future donations will be automatic.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
        >
          Close
        </button>
        
      </div>
    </div>
  );

  // Confirmation modal component
  const ConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <FaCalendarAlt className="text-indigo-600 text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Confirm Recurring Donation</h3>
          <p className="text-gray-600 mt-2">
            You're setting up a {frequency} donation of ${amount} to {organizationName}.
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold">${amount}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Frequency:</span>
            <span className="font-semibold">{selectedFrequency?.label}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Payment Method:</span>
            <span className="font-semibold">
              {paymentMethod === 'scroll' ? 'Scroll Wallet' : 
               paymentMethod === 'transak' ? 'Transak' : 'Alchemy Pay'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">First Charge:</span>
            <span className="font-semibold">Tomorrow</span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setShowConfirmation(false)}
            disabled={isProcessing}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreateSubscription}
            disabled={isProcessing}
            className={`flex-1 py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isProcessing ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              'Confirm Subscription'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Payment method card component
  const PaymentMethodCard = ({ method, icon, label }) => (
    <button
      onClick={() => setPaymentMethod(method)}
      className={`p-3 border rounded-lg flex flex-col items-center justify-center transition-all ${
        paymentMethod === method
          ? 'border-indigo-500 bg-indigo-50 shadow-sm'
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span className={`font-medium text-sm ${paymentMethod === method ? 'text-indigo-600' : 'text-gray-700'}`}>
        {label}
      </span>
    </button>
  );

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg">
      {isSuccess ? (
        <SuccessScreen />
      ) : (
        <>
          {/* Form Header */}
          <div className="bg-indigo-600 px-6 py-5 text-white">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center">
                <FaRegCalendarCheck className="mr-2" />
                Set Up Regular Support
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:text-indigo-100 transition-colors"
                aria-label="Close"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <p className="mt-1 text-indigo-100">
              Support {organizationName} with a recurring donation.
            </p>
          </div>
          
          {/* Form Content */}
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
                <FaExclamationTriangle className="mr-2 flex-shrink-0" />
                <span>{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <FaTimes />
                </button>
              </div>
            )}
            
            {/* Payment Method Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Choose Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                <PaymentMethodCard 
                  method="scroll" 
                  icon={<FaEthereum className={`mb-1 ${paymentMethod === 'scroll' ? 'text-indigo-600' : 'text-gray-400'}`} />}
                  label="Scroll" 
                />
                
                <PaymentMethodCard 
                  method="transak" 
                  icon={<FaExchangeAlt className={`mb-1 ${paymentMethod === 'transak' ? 'text-indigo-600' : 'text-gray-400'}`} />}
                  label="Transak" 
                />
              </div>
            </div>
            
            {/* Wallet Connect Banner (only for Scroll) */}
            {paymentMethod === 'scroll' && !walletConnected && (
              <div className="mb-5 p-4 bg-blue-50 rounded-md border border-blue-100">
                <div className="flex items-start">
                  <FaWallet className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium">
                      Connect your wallet
                    </p>
                    <p className="text-xs text-blue-600 mb-3">
                      Connect your crypto wallet to make a donation via Scroll
                    </p>
                    <button
                      onClick={() => setWalletConnected(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                    >
                      Connect Wallet
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-5">
                {/* Amount Selection */}
                <div>
                  <label htmlFor="donationAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Donation Amount
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
                      min="5.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={isProcessing}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Minimum donation: $5.00</p>
                </div>
                
                {/* Frequency Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Donation Frequency
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      className="bg-white relative w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 text-left flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      onClick={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
                      disabled={isProcessing}
                    >
                      <span className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-indigo-500" />
                        <span>{selectedFrequency?.label}</span>
                      </span>
                      <FaAngleDown className={`transition-transform duration-200 ${showFrequencyDropdown ? 'transform rotate-180' : ''}`} />
                    </button>
                    
                    {showFrequencyDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg py-1 border border-gray-200 max-h-60 overflow-auto">
                        {frequencyOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={`w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center ${frequency === option.value ? 'bg-indigo-50 text-indigo-700' : ''}`}
                            onClick={() => {
                              setFrequency(option.value);
                              setShowFrequencyDropdown(false);
                            }}
                          >
                            <div>
                              <span className="block font-medium">{option.label}</span>
                              <span className="block text-sm text-gray-500">{option.description}</span>
                            </div>
                            {frequency === option.value && (
                              <FaCheckCircle className="ml-auto text-indigo-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Add Currency Conversion Information */}
                <CurrencyConversionInfo />
                
                {/* Donation Message */}
                <div>
                  <label htmlFor="donationMessage" className="block text-sm font-medium text-gray-700 mb-2">
                    Add a Message (Optional)
                  </label>
                  <textarea
                    id="donationMessage"
                    rows="2"
                    placeholder="Share why you're supporting this organization..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={isProcessing}
                  ></textarea>
                </div>
                
                {/* Anonymous Donation Option */}
                <div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="anonymousDonation"
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="anonymousDonation" className="font-medium text-gray-700">
                        Make my donation anonymous
                      </label>
                      <p className="text-gray-500">
                        Your name won't be displayed publicly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Side Benefits Panel */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 h-fit">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                  <FaInfoCircle className="text-indigo-500 mr-2" />
                  Benefits of Regular Support
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-green-100 rounded-full p-2 mt-1 mr-3">
                      <FaRegCalendarCheck className="text-green-600 h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm">Sustainable Impact</h4>
                      <p className="text-xs text-gray-600">
                        Reliable funding helps plan for the future.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-2 mt-1 mr-3">
                      <FaThumbsUp className="text-blue-600 h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm">Convenient Giving</h4>
                      <p className="text-xs text-gray-600">
                        Set it once and your support continues automatically.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-purple-100 rounded-full p-2 mt-1 mr-3">
                      <FaHandHoldingHeart className="text-purple-600 h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm">Special Updates</h4>
                      <p className="text-xs text-gray-600">
                        Receive exclusive updates on your impact.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="rounded-lg p-2 text-xs text-gray-600">
                    <p>
                      <strong>Your Control:</strong> Modify or cancel anytime from your account settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isProcessing}
                className={`flex-1 flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isProcessing ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>Set Up ${amount} {selectedFrequency?.label} Donation</>
                )}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="py-3 px-4 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            </div>
            
            {/* Security Notice */}
            <div className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center">
              <FaShieldAlt className="mr-1" />
              <span>Your payment information is secure and encrypted</span>
            </div>
          </div>
          
          {/* Confirmation Modal */}
          {showConfirmation && <ConfirmationModal />}
        </>
      )}
    </div>
  );
};

export default SubscriptionDonation;