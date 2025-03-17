import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useBlockchain } from '../context/BlockchainContext';
import { ethers } from 'ethers';

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
  const [isBlockchainEnabled, setIsBlockchainEnabled] = useState(false);
  const [blockchainTxHash, setBlockchainTxHash] = useState('');
  const [showBlockchainInfo, setShowBlockchainInfo] = useState(false);
  const [currencyType, setCurrencyType] = useState('USD');
  const [ethPrice, setEthPrice] = useState(null);
  
  // ... existing code ...

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid donation amount');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      let finalAmount = amount;
      let txHash = null;
      
      if (isBlockchainEnabled) {
        if (!account) {
          setError('Please connect your wallet to make a blockchain donation');
          setLoading(false);
          return;
        }
        
        try {
          // Convert USD to ETH if needed
          if (currencyType === 'USD' && ethPrice) {
            finalAmount = (parseFloat(amount) / ethPrice).toFixed(8);
          }
          
          // Call the blockchain donation function
          const tx = await donateToCharity(id, ethers.utils.parseEther(finalAmount.toString()));
          await tx.wait(); // Wait for transaction confirmation
          txHash = tx.hash;
          setBlockchainTxHash(txHash);
          
          // Create donation record
          const donationResponse = await axios.post('/donations', {
            amount: finalAmount,
            currency_type: isBlockchainEnabled ? 'ETH' : currencyType,
            cause_id: id,
            donor_message: message,
            is_anonymous: anonymous,
            transaction_hash: txHash,
            smart_contract_data: {
              contract_address: tx.to,
              block_number: tx.blockNumber,
              gas_used: tx.gasUsed?.toString(),
              timestamp: new Date().toISOString()
            }
          });

          setSuccess(true);
          navigate(`/donations/${donationResponse.data.donation.id}`);
        } catch (error) {
          console.error('Blockchain transaction error:', error);
          setError('Failed to process blockchain transaction. Please try again.');
          setLoading(false);
          return;
        }
      } else {
        // Traditional payment processing
        // Create donation record
        const donationResponse = await axios.post('/donations', {
          amount: amount,
          currency_type: currencyType,
          cause_id: id,
          donor_message: message,
          is_anonymous: anonymous
        });

        setSuccess(true);
        navigate(`/donations/${donationResponse.data.donation.id}`);
      }
    } catch (error) {
      console.error('Error creating donation:', error);
      setError(error.response?.data?.message || 'Failed to process donation');
    } finally {
      setLoading(false);
    }
  };

  // ... existing code ...

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Make a Donation</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ... existing form fields ... */}

        {currencyType === 'ETH' && (
          <div className="bg-gray-100 p-4 rounded">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="isBlockchainEnabled"
                checked={isBlockchainEnabled}
                onChange={(e) => setIsBlockchainEnabled(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="isBlockchainEnabled">
                Use blockchain for transparent tracking
              </label>
            </div>
            {isBlockchainEnabled && !account && (
              <p className="text-yellow-600">
                Please connect your wallet to make a blockchain donation
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (isBlockchainEnabled && !account)}
          className={`w-full py-3 rounded-lg text-white font-semibold
            ${loading || (isBlockchainEnabled && !account)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
            }`}
        >
          {loading ? 'Processing...' : 'Donate Now'}
        </button>
      </form>
    </div>
  );
}