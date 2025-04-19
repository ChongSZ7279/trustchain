import React, { useState } from 'react';
import { FaCreditCard, FaLock, FaCheckCircle, FaSpinner } from 'react-icons/fa';

const MockAlchemyPayWidget = ({
  amount,
  baseCurrencyCode = 'usd',
  defaultCurrencyCode = 'eth',
  onSuccess,
  onError
}) => {
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: payment details, 2: processing, 3: success

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Simple validation rules
    if (!cardNumber) newErrors.cardNumber = 'Card number is required';
    else if (!/^\d{13,19}$/.test(cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Invalid card number';
    }

    if (!expiryDate) newErrors.expiryDate = 'Expiry date is required';
    else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = 'Use MM/YY format';
    }

    if (!cvv) newErrors.cvv = 'CVV is required';
    else if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = 'Invalid CVV';
    }

    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form before proceeding
    if (!validateForm()) return;

    setProcessing(true);
    setStep(2);

    // Simulate processing time
    setTimeout(() => {
      setStep(3);

      // Simulate successful transaction
      if (onSuccess) {
        onSuccess({
          transactionId: `mock-alchemypay-${Date.now()}`,
          amount: parseFloat(amount),
          currency: defaultCurrencyCode,
          status: 'completed'
        });
      }
    }, 2000);
  };

  if (step === 3) {
    return (
      <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 rounded-full p-3">
            <FaCheckCircle className="text-green-600 text-3xl" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-green-800 mb-2">Payment Successful!</h3>
        <p className="text-green-700 mb-4">
          Your donation of {amount} {baseCurrencyCode.toUpperCase()} has been processed successfully.
        </p>
        <div className="bg-white p-3 rounded-md text-sm text-green-700 inline-block">
          Thank you for your generosity!
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
        <div className="flex justify-center mb-4">
          <FaSpinner className="animate-spin text-indigo-600 text-3xl" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Processing Payment</h3>
        <p className="text-gray-600 mb-4">
          Please wait while we process your payment...
        </p>
        <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 inline-block">
          This is a simulated transaction in test mode.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center">
          <div className="bg-indigo-100 p-2 rounded-full mr-2">
            <FaCreditCard className="text-indigo-600" />
          </div>
          <span className="font-medium text-gray-800">Alchemy Pay Test Mode</span>
        </div>
        <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
          Simulated
        </div>
      </div>

      <div className="mb-4">
        <div className="bg-blue-50 p-3 rounded-md mb-4">
          <p className="text-blue-700 text-sm">
            <strong>Test Mode:</strong> This is a simulated Alchemy Pay widget for development. No real transactions will be processed.
          </p>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between text-sm text-indigo-700 mb-2">
            <span>Amount:</span>
            <span className="font-medium">{amount} {baseCurrencyCode.toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-sm text-indigo-700">
            <span>Cryptocurrency:</span>
            <span className="font-medium">{defaultCurrencyCode.toUpperCase()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Information</label>
            <input
              type="text"
              placeholder="Card Number (e.g., 4111 1111 1111 1111)"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className={`w-full px-3 py-2 border ${errors.cardNumber ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              required
            />
            {errors.cardNumber && (
              <p className="mt-1 text-xs text-red-600">{errors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className={`w-full px-3 py-2 border ${errors.expiryDate ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                required
              />
              {errors.expiryDate && (
                <p className="mt-1 text-xs text-red-600">{errors.expiryDate}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className={`w-full px-3 py-2 border ${errors.cvv ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                required
              />
              {errors.cvv && (
                <p className="mt-1 text-xs text-red-600">{errors.cvv}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              required
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              required
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="flex items-center text-xs text-gray-600 mb-4">
            <FaLock className="text-gray-500 mr-2" />
            <span>Your payment information is secure. This is a simulated transaction.</span>
          </div>

          <div className="bg-blue-50 p-3 rounded-md mb-4 text-xs">
            <p className="font-medium text-blue-700 mb-1">Test Card Information:</p>
            <ul className="text-blue-600 space-y-1">
              <li><span className="font-medium">Card Number:</span> 4111 1111 1111 1111</li>
              <li><span className="font-medium">Expiry:</span> Any future date (MM/YY)</li>
              <li><span className="font-medium">CVV:</span> Any 3 digits</li>
              <li><span className="font-medium">Name:</span> Any name</li>
            </ul>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Pay {amount} {baseCurrencyCode.toUpperCase()}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MockAlchemyPayWidget;
