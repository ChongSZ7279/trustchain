import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useBlockchain } from '../context/BlockchainContext';
import { ethers } from 'ethers';
import { 
  FaHandHoldingHeart, 
  FaLock, 
  FaCreditCard, 
  FaEthereum,
  FaUserSecret,
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa';

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
  const [currencyType, setCurrencyType] = useState('MYR');
  const [ethPrice, setEthPrice] = useState(null);
  const [charityInfo, setCharityInfo] = useState(null);
  const [step, setStep] = useState(1);
  const [donationAmount, setDonationAmount] = useState({
    MYR: '',
    ETH: ''
  });

  useEffect(() => {
    const fetchCharityInfo = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/charities/${id}`);
        setCharityInfo(response.data);
      } catch (error) {
        console.error('Error fetching charity info:', error);
        setError('Failed to load charity information');
      }
    };

    const fetchEthPrice = async () => {
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,myr');
        setEthPrice({
          usd: response.data.ethereum.usd,
          myr: response.data.ethereum.myr
        });
      } catch (error) {
        console.error('Error fetching ETH price:', error);
      }
    };

    fetchCharityInfo();
    fetchEthPrice();
  }, [id]);

  const handleAmountChange = (value, type) => {
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    
    const parts = sanitizedValue.split('.');
    if (parts[1]?.length > 2) {
      parts[1] = parts[1].slice(0, 2);
      value = parts.join('.');
    }

    setDonationAmount(prev => ({ ...prev, [type]: value }));
    
    if (type === 'MYR' && ethPrice) {
      setDonationAmount(prev => ({ 
        ...prev, 
        ETH: (parseFloat(value) / ethPrice.myr).toFixed(8)
      }));
    } else if (type === 'ETH' && ethPrice) {
      setDonationAmount(prev => ({ 
        ...prev, 
        MYR: (parseFloat(value) * ethPrice.myr).toFixed(2)
      }));
    }
    setAmount(value);
  };

  const validateForm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid donation amount');
      return false;
    }

    if (parseFloat(amount) < 1 && currencyType === 'MYR') {
      setError('Minimum donation amount is RM 1');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
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
          if (currencyType === 'MYR' && ethPrice) {
            finalAmount = (parseFloat(amount) / ethPrice.myr).toFixed(8);
          }
          
          const tx = await donateToCharity(id, ethers.utils.parseEther(finalAmount.toString()));
          await tx.wait();
          txHash = tx.hash;
          setBlockchainTxHash(txHash);
          
          const donationData = {
            amount: finalAmount,
            currency_type: 'ETH',
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
          };

          console.log('Submitting blockchain donation:', {
            data: donationData,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          const donationResponse = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/donations`,
            donationData,
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }
          );

          console.log('Blockchain donation response:', donationResponse);

          setSuccess(true);
          navigate(`/donations/${donationResponse.data.id}`);
        } catch (error) {
          console.error('Blockchain transaction error:', {
            error: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
          setError('Failed to process blockchain transaction. Please try again.');
          setLoading(false);
          return;
        }
      } else {
        const donationData = {
          amount: amount,
          currency_type: currencyType,
          cause_id: id,
          donor_message: message,
          is_anonymous: anonymous
        };

        console.log('Submitting regular donation:', {
          data: donationData,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const donationResponse = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/donations`,
          donationData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        console.log('Regular donation response:', donationResponse);

        setSuccess(true);
        navigate(`/donations/${donationResponse.data.id}`);
      }
    } catch (error) {
      console.error('Error creating donation:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      const errorMessage = error.response?.data?.message || 'Failed to process donation';
      const validationErrors = error.response?.data?.errors;
      
      if (validationErrors) {
        console.log('Validation errors:', validationErrors);
        setError(Object.values(validationErrors).flat().join(', '));
      } else {
        console.log('Error details:', error.response?.data);
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
  return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Select Amount</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount in {currencyType}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {currencyType === 'MYR' ? (
                        <span className="text-gray-400 font-medium">RM</span>
                      ) : (
                        <FaEthereum className="text-gray-400" />
                      )}
                    </div>
                    <input
                      type="text"
                      value={donationAmount[currencyType]}
                      onChange={(e) => handleAmountChange(e.target.value, currencyType)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
        </div>
                  {ethPrice && (
                    <p className="mt-1 text-sm text-gray-500">
                      ≈ {currencyType === 'MYR' ? 
                        `${donationAmount.ETH} ETH` : 
                        `RM ${(parseFloat(donationAmount.ETH || 0) * ethPrice.myr).toFixed(2)}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setCurrencyType('MYR')}
                    className={`px-4 py-2 rounded-md ${
                      currencyType === 'MYR'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    MYR
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrencyType('ETH')}
                    className={`px-4 py-2 rounded-md ${
                      currencyType === 'ETH'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    ETH
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                if (!validateForm()) return;
                setStep(2);
              }}
              className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Continue
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Donation Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Add a message to your donation..."
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                    Make this donation anonymous
                  </label>
                </div>
        {currencyType === 'ETH' && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center">
              <input
                type="checkbox"
                id="isBlockchainEnabled"
                checked={isBlockchainEnabled}
                onChange={(e) => setIsBlockchainEnabled(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
                      <label htmlFor="isBlockchainEnabled" className="ml-2 block text-sm text-gray-700">
                Use blockchain for transparent tracking
              </label>
            </div>
            {isBlockchainEnabled && !account && (
                      <p className="mt-2 text-sm text-yellow-600">
                Please connect your wallet to make a blockchain donation
              </p>
            )}
          </div>
        )}
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Review Donation</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">
                    {amount} {currencyType}
                    {ethPrice && (
                      <span className="text-sm text-gray-500 ml-2">
                        (≈ {currencyType === 'MYR' ? 
                          `${donationAmount.ETH} ETH` : 
                          `RM ${(parseFloat(donationAmount.ETH || 0) * ethPrice.myr).toFixed(2)}`}
                      </span>
                    )}
                  </span>
                </div>
                {message && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Message:</span>
                    <span className="font-semibold">{message}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Anonymous:</span>
                  <span className="font-semibold">{anonymous ? 'Yes' : 'No'}</span>
                </div>
                {isBlockchainEnabled && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Blockchain:</span>
                    <span className="font-semibold">Enabled</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Charity:</span>
                  <span className="font-semibold">{charityInfo?.name}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
        <button
                onClick={handleSubmit}
          disabled={loading || (isBlockchainEnabled && !account)}
                className={`flex-1 py-3 text-white rounded-md transition-colors ${
                  loading || (isBlockchainEnabled && !account)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
            }`}
        >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Processing...
                  </span>
                ) : (
                  'Confirm Donation'
                )}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
          <FaHandHoldingHeart className="mr-3 text-blue-600" />
          Make a Donation
        </h2>
        {charityInfo && (
          <p className="mt-2 text-gray-600">
            Supporting {charityInfo.name}
          </p>
        )}
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex items-center ${
                  stepNumber < 3 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= stepNumber
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > stepNumber ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {renderStep()}
      </div>

      {success && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <div className="text-center">
              <FaCheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Donation Successful!
              </h3>
              <p className="text-gray-600 mb-4">
                Thank you for your generous donation. Your contribution will make a difference.
              </p>
              <button
                onClick={() => navigate('/transactions')}
                className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                View Transaction
        </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}