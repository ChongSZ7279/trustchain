import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useBlockchain } from '../context/BlockchainContext';

export default function DonationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { account, donateToCharity, loading: blockchainLoading } = useBlockchain();
  
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [useBlockchain, setUseBlockchain] = useState(false);
  const [blockchainTxHash, setBlockchainTxHash] = useState('');
  const [showBlockchainInfo, setShowBlockchainInfo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid donation amount');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      if (useBlockchain) {
        if (!account) {
          setError('Please connect your wallet to make a blockchain donation');
          setLoading(false);
          return;
        }
        
        try {
          // Call the blockchain donation function
          const tx = await donateToCharity(id, amount);
          setBlockchainTxHash(tx.hash);
          
          // Save the donation in the database
          await axios.post('/api/donations', {
            charity_id: id,
            amount,
            message,
            anonymous,
            payment_method: 'blockchain',
            blockchain_tx_hash: tx.hash
          });
          
          setSuccess(true);
          setTimeout(() => {
            navigate(`/charities/${id}`);
          }, 3000);
        } catch (err) {
          console.error('Blockchain donation error:', err);
          setError('Blockchain transaction failed. Please try again or use a different payment method.');
        }
      } else {
        // Traditional payment processing
        await axios.post('/api/donations', {
          charity_id: id,
          amount,
          message,
          anonymous,
          payment_method: paymentMethod
        });
        
        setSuccess(true);
        setTimeout(() => {
          navigate(`/charities/${id}`);
        }, 3000);
      }
    } catch (err) {
      console.error('Donation error:', err);
      setError('Failed to process donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountClick = (value) => {
    setAmount(value);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Make a Donation</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Your support makes a difference
            </p>
          </div>

          {success ? (
            <div className="px-4 py-5 sm:p-6">
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Donation Successful!</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Thank you for your generous donation. Your contribution will help make a difference.</p>
                      {blockchainTxHash && (
                        <p className="mt-2">
                          Transaction Hash: <span className="font-mono text-xs break-all">{blockchainTxHash}</span>
                        </p>
                      )}
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => navigate(`/charities/${id}`)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Return to Charity
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Donation Amount (USD)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      min="1"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {[10, 25, 50, 100].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleAmountClick(value)}
                        className={`py-2 px-4 border rounded-md text-sm font-medium ${
                          amount === value.toString()
                            ? 'bg-indigo-600 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        ${value}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message (Optional)
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="message"
                      name="message"
                      rows="3"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Add a message to your donation"
                    ></textarea>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="anonymous"
                      name="anonymous"
                      type="checkbox"
                      checked={anonymous}
                      onChange={(e) => setAnonymous(e.target.checked)}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="anonymous" className="font-medium text-gray-700">
                      Make donation anonymous
                    </label>
                    <p className="text-gray-500">Your name will not be displayed publicly</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <div className="mt-2 space-y-4">
                    <div className="flex items-center">
                      <input
                        id="blockchain"
                        name="payment_method"
                        type="radio"
                        checked={useBlockchain}
                        onChange={() => setUseBlockchain(true)}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                      <label htmlFor="blockchain" className="ml-3 block text-sm font-medium text-gray-700">
                        Blockchain (Ethereum)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowBlockchainInfo(!showBlockchainInfo)}
                        className="ml-2 text-indigo-600 hover:text-indigo-500 text-sm"
                      >
                        {showBlockchainInfo ? 'Hide Info' : 'Info'}
                      </button>
                    </div>
                    
                    {showBlockchainInfo && (
                      <div className="ml-7 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                        <p>Blockchain donations are processed through Ethereum smart contracts, providing:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>Complete transparency - track your donation on the blockchain</li>
                          <li>Immutable record of your contribution</li>
                          <li>Lower transaction fees compared to traditional payment processors</li>
                          <li>Requires a Web3 wallet like MetaMask</li>
                        </ul>
                        {!account && (
                          <p className="mt-2 text-yellow-600">
                            You need to connect your wallet to use this option.
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <input
                        id="credit_card"
                        name="payment_method"
                        type="radio"
                        checked={!useBlockchain && paymentMethod === 'credit_card'}
                        onChange={() => {
                          setUseBlockchain(false);
                          setPaymentMethod('credit_card');
                        }}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                      <label htmlFor="credit_card" className="ml-3 block text-sm font-medium text-gray-700">
                        Credit Card
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="paypal"
                        name="payment_method"
                        type="radio"
                        checked={!useBlockchain && paymentMethod === 'paypal'}
                        onChange={() => {
                          setUseBlockchain(false);
                          setPaymentMethod('paypal');
                        }}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                      <label htmlFor="paypal" className="ml-3 block text-sm font-medium text-gray-700">
                        PayPal
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate(`/charities/${id}`)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || blockchainLoading}
                    className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      (loading || blockchainLoading) ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading || blockchainLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 