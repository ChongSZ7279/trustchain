import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Web3 from 'web3';
import CharityABI from '../contracts/CharityABI.json';

export default function DonationForm({ charityId, charityName, onSuccess }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [step, setStep] = useState(1); // 1: Form, 2: Processing, 3: Success

  // Smart contract configuration
  const contractAddress = process.env.REACT_APP_CHARITY_CONTRACT_ADDRESS;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setStep(2);

      // Check if Web3 is available
      if (window.ethereum) {
        try {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3 = new Web3(window.ethereum);
          
          // Get the current account
          const accounts = await web3.eth.getAccounts();
          const account = accounts[0];
          
          // Create contract instance
          const charityContract = new web3.eth.Contract(
            CharityABI,
            contractAddress
          );
          
          // Convert amount to wei
          const amountInWei = web3.utils.toWei(amount, 'ether');
          
          // Make donation transaction
          const transaction = await charityContract.methods.donate(charityId).send({
            from: account,
            value: amountInWei,
            gas: 200000
          });
          
          setTransactionHash(transaction.transactionHash);
          
          // Record transaction in backend
          const response = await axios.post('/api/transactions', {
            charity_id: charityId,
            amount: amount,
            message: message,
            anonymous: anonymous,
            transaction_hash: transaction.transactionHash,
            contract_address: contractAddress,
            user_id: anonymous ? null : user.id
          });
          
          setStep(3);
          
          if (onSuccess) {
            onSuccess(response.data);
          }
        } catch (err) {
          console.error('Blockchain transaction error:', err);
          setError('Transaction failed: ' + (err.message || 'Unknown error'));
          setStep(1);
        }
      } else {
        setError('Please install MetaMask to make blockchain transactions');
        setStep(1);
      }
    } catch (err) {
      console.error('Error making donation:', err);
      setError('Failed to process donation: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    // Only allow numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      {step === 1 && (
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Donate to {charityName}</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Your donation will be processed securely using blockchain technology.</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-5 sm:flex sm:flex-col sm:items-start">
            <div className="w-full sm:max-w-xs">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (ETH)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">Ξ</span>
                </div>
                <input
                  type="text"
                  name="amount"
                  id="amount"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                  required
                />
              </div>
            </div>
            
            <div className="w-full mt-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message (Optional)
              </label>
              <div className="mt-1">
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Add a message with your donation"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="anonymous"
                    name="anonymous"
                    type="checkbox"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="anonymous" className="font-medium text-gray-700">
                    Donate anonymously
                  </label>
                  <p className="text-gray-500">Your name will not be displayed publicly</p>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 text-sm text-red-600">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="mt-5 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Donate Now
            </button>
          </form>
        </div>
      )}
      
      {step === 2 && (
        <div className="px-4 py-5 sm:p-6 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Processing Your Donation</h3>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Please confirm the transaction in your wallet. Do not close this window.
          </p>
        </div>
      )}
      
      {step === 3 && (
        <div className="px-4 py-5 sm:p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="mt-2 text-lg leading-6 font-medium text-gray-900">Donation Successful!</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500 mx-auto">
            <p>Thank you for your donation of Ξ{amount} to {charityName}.</p>
            {transactionHash && (
              <p className="mt-2">
                Transaction Hash: 
                <a 
                  href={`https://etherscan.io/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-indigo-600 hover:text-indigo-900 break-all"
                >
                  {transactionHash}
                </a>
              </p>
            )}
          </div>
          <div className="mt-5">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setAmount('');
                setMessage('');
                setTransactionHash('');
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Make Another Donation
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 