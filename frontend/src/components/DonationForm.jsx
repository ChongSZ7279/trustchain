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
  const [useBlockchain, setUseBlockchain] = useState(false);
  const [blockchainTxHash, setBlockchainTxHash] = useState('');
  const [showBlockchainInfo, setShowBlockchainInfo] = useState(false);
  const [currencyType, setCurrencyType] = useState('USD');
  const [ethPrice, setEthPrice] = useState(null);
  
  useEffect(() => {
    // Fetch current ETH price when component mounts
    const fetchEthPrice = async () => {
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        setEthPrice(response.data.ethereum.usd);
      } catch (error) {
        console.error('Error fetching ETH price:', error);
      }
    };
    
    fetchEthPrice();
  }, []);

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
      
      if (useBlockchain) {
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
          const donationResponse = await axios.post('/api/donations', {
            amount: finalAmount,
            currency_type: useBlockchain ? 'ETH' : currencyType,
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
        const donationResponse = await axios.post('/api/donations', {
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

  const handleAmountClick = (value) => {
    setAmount(value.toString());
  };

  const getEthEquivalent = () => {
    if (!ethPrice || !amount) return null;
    const ethAmount = (parseFloat(amount) / ethPrice).toFixed(6);
    return ethAmount;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Make a Donation</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">Currency Type</label>
          <div className="flex space-x-4">
            <button
              type="button"
              className={`px-4 py-2 rounded ${currencyType === 'USD' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setCurrencyType('USD')}
            >
              USD
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded ${currencyType === 'ETH' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => {
                setCurrencyType('ETH');
                setUseBlockchain(true);
              }}
            >
              ETH
            </button>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder={`Enter amount in ${currencyType}`}
            step={currencyType === 'ETH' ? '0.000001' : '0.01'}
          />
          {currencyType === 'USD' && ethPrice && (
            <p className="text-sm text-gray-500 mt-1">
              ≈ {getEthEquivalent()} ETH
            </p>
          )}
        </div>

        <div className="flex space-x-4">
          {[10, 25, 50, 100].map((value) => (
            <button
              key={value}
              type="button"
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => handleAmountClick(value)}
            >
              {currencyType === 'USD' ? '$' : ''}{value}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Message (Optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border rounded"
            rows="3"
            placeholder="Add a message with your donation"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="anonymous"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="anonymous">Make this donation anonymous</label>
        </div>

        {currencyType === 'ETH' && (
          <div className="bg-gray-100 p-4 rounded">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="useBlockchain"
                checked={useBlockchain}
                onChange={(e) => setUseBlockchain(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="useBlockchain">
                Use blockchain for transparent tracking
              </label>
            </div>
            {useBlockchain && !account && (
              <p className="text-yellow-600">
                Please connect your wallet to make a blockchain donation
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (useBlockchain && !account)}
          className={`w-full py-3 rounded-lg text-white font-semibold
            ${loading || (useBlockchain && !account)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
            }`}
        >
          {loading ? 'Processing...' : 'Donate Now'}
        </button>
      </form>

      {blockchainTxHash && (
        <div className="mt-6 p-4 bg-green-100 rounded">
          <h3 className="font-semibold text-green-800">Transaction Successful!</h3>
          <p className="text-sm mt-2">
            Transaction Hash:{' '}
            <a
              href={`https://etherscan.io/tx/${blockchainTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline break-all"
            >
              {blockchainTxHash}
            </a>
          </p>
        </div>
      )}
    </div>
  );
} 