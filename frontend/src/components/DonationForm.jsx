import React, { useState, useEffect } from 'react';
import { FaTimes, FaWallet, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { initWeb3, donateToCharity, isWalletConnected } from '../utils/contractInteraction';

const DonationForm = ({ charityId, onDonate, loading = false }) => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [processingDonation, setProcessingDonation] = useState(false);
  
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        await initWeb3();
        setWalletConnected(isWalletConnected());
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };
    
    checkWalletConnection();
  }, []);
  
  const connectWallet = async () => {
    try {
      await initWeb3();
      setWalletConnected(isWalletConnected());
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }
    
    if (!agreeTerms) {
      alert('Please agree to the terms');
      return;
    }
    
    try {
      setProcessingDonation(true);
      const result = await donateToCharity(charityId, parseFloat(amount), message);
      console.log('Donation result:', result);
      
      if (onDonate) {
        onDonate(parseFloat(amount), result.transactionHash);
      }
      
      setAmount('');
      setMessage('');
      setAgreeTerms(false);
    } catch (error) {
      console.error('Error processing donation:', error);
      alert('Error processing donation. Please try again.');
    } finally {
      setProcessingDonation(false);
    }
  };
  
  return (
    <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto">
      {/* Close Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
      >
        <FaTimes size={20} />
      </button>

      <h2 className="text-xl font-bold mb-4">Make a Blockchain Donation</h2>
      
      {!walletConnected && (
        <div className="mb-4 p-3 bg-yellow-50 rounded-md">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-yellow-500 mt-0.5 mr-2" />
            <div>
              <p className="text-sm text-yellow-700">
                You need to connect your wallet to make a blockchain donation.
              </p>
              <button 
                onClick={connectWallet}
                className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaWallet className="mr-1" />
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="donationAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (ETH)
          </label>
          <input
            type="number"
            id="donationAmount"
            placeholder="0.1"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={processingDonation || !walletConnected}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="donationMessage" className="block text-sm font-medium text-gray-700 mb-1">
            Message (Optional)
          </label>
          <textarea
            id="donationMessage"
            placeholder="Add a message with your donation"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={processingDonation || !walletConnected}
            rows="3"
          />
        </div>
        
        <div className="mb-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                required
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={processingDonation || !walletConnected}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agreeTerms" className="font-medium text-gray-700">
                I understand that my donation will be processed via blockchain
              </label>
              <p className="text-gray-500">
                Funds will be held in escrow and released based on milestone completion.
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <button 
            type="submit" 
            className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              processingDonation || !walletConnected
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
            disabled={processingDonation || !walletConnected}
          >
            {processingDonation ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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
        
        <div className="mt-4 text-xs text-gray-500">
          <p>
            Your donation will be processed on the Ethereum blockchain. Gas fees may apply.
            All transactions are transparent and can be verified on the blockchain.
          </p>
        </div>
      </form>
    </div>
  );
};

export default DonationForm;
