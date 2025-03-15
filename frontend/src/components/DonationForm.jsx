import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useBlockchain } from '../context/BlockchainContext';
import { useLocalization } from '../context/LocalizationContext';
import MalaysianPaymentOptions from './MalaysianPaymentOptions';
import Web3 from 'web3';
import CharityABI from '../contracts/CharityABI.json';
import { 
  FaEthereum, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaCreditCard, 
  FaLock, 
  FaSpinner, 
  FaExternalLinkAlt,
  FaArrowRight,
  FaUserSecret,
  FaMoneyBillWave,
  FaReceipt
} from 'react-icons/fa';
import { ethers } from 'ethers';

export default function DonationForm({ charityId, charityName, onSuccess }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { 
    account, 
    connectWallet, 
    platformFee, 
    minDonationAmount,
    calculateTotalAmount 
  } = useBlockchain();
  const { 
    formatCurrency, 
    convertMyrToEth, 
    convertEthToMyr, 
    formatDate 
  } = useLocalization();
  
  // Form state
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('fpx');
  const [receiptRequired, setReceiptRequired] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [blockchainTxHash, setBlockchainTxHash] = useState('');
  const [showBlockchainInfo, setShowBlockchainInfo] = useState(false);
  
  // Multi-step form
  const [currentStep, setCurrentStep] = useState(1);
  
  // Smart contract configuration
  const contractAddress = import.meta.env.VITE_CHARITY_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  
  // Calculate fees and total
  const calculateFees = () => {
    if (!amount || paymentMethod !== 'blockchain') return null;
    
    const ethAmount = convertMyrToEth(amount);
    const { baseAmount, fee, total } = calculateTotalAmount(ethAmount);
    
    return {
      baseAmount: ethers.utils.formatEther(baseAmount),
      fee: ethers.utils.formatEther(fee),
      total: ethers.utils.formatEther(total)
    };
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid donation amount');
      return;
    }
    
    // Check minimum amount for blockchain donations
    if (paymentMethod === 'blockchain') {
      const ethAmount = convertMyrToEth(amount);
      if (parseFloat(ethAmount) < parseFloat(minDonationAmount)) {
        setError(`Minimum donation amount is ${minDonationAmount} ETH`);
        return;
      }
    }
    
    try {
      setLoading(true);
      setError('');
      setCurrentStep(2);
      
      const actualCharityId = charityId || id;
      
      if (paymentMethod === 'blockchain') {
        if (!window.ethereum) {
          setError('Please install MetaMask to make blockchain donations');
          setCurrentStep(1);
          return;
        }
        
        try {
          if (!account) {
            await connectWallet();
          }
          
          const ethAmount = convertMyrToEth(amount).toString();
          
          // Donate using the contract
          const tx = await donateToCharity(actualCharityId, ethAmount);
          setBlockchainTxHash(tx.hash);
          
          // Record in backend
          await axios.post('/api/transactions', {
            charity_id: actualCharityId,
            amount: ethAmount,
            amount_myr: amount,
            message: message,
            anonymous: anonymous,
            transaction_hash: tx.hash,
            type: 'donation',
            payment_method: 'blockchain',
            user_id: anonymous ? null : user?.id,
            receipt_required: receiptRequired
          });
          
          setSuccess(true);
          setCurrentStep(3);
          
          if (onSuccess) {
            onSuccess({
              amount: ethAmount,
              amountMyr: amount,
              txHash: tx.hash,
              method: 'blockchain'
            });
          }
        } catch (err) {
          console.error('Blockchain transaction error:', err);
          setError(err.message || 'Transaction failed. Please try again.');
          setCurrentStep(1);
        }
      } else {
        // Handle Malaysian payment methods
        // This would typically integrate with a payment processor like Billplz, Stripe, etc.
        // For this example, we'll simulate a successful payment
        
        setTimeout(async () => {
          try {
            // Record transaction in backend
            await axios.post('/api/transactions', {
              charity_id: actualCharityId,
              amount: amount,
              currency: 'MYR',
              message: message,
              anonymous: anonymous,
              type: 'donation',
              payment_method: paymentMethod,
              user_id: anonymous ? null : user?.id,
              receipt_required: receiptRequired
            });
            
            setSuccess(true);
            setCurrentStep(3);
            
            if (onSuccess) {
              onSuccess({
                amount,
                currency: 'MYR',
                method: paymentMethod
              });
            }
          } catch (err) {
            console.error('Error recording transaction:', err);
            setError('Failed to process donation: ' + (err.response?.data?.message || err.message || 'Unknown error'));
            setCurrentStep(1);
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Error processing donation:', err);
      setError(err.message || 'Failed to process donation');
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAmountClick = (value) => {
    setAmount(value.toString());
  };
  
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };
  
  const renderDonationStep = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Selection */}
        <MalaysianPaymentOptions
          selectedMethod={paymentMethod}
          onSelectMethod={handlePaymentMethodChange}
          showBlockchain={true}
        />
        
        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Donation Amount {paymentMethod === 'blockchain' ? '(MYR → ETH)' : '(MYR)'}
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">RM</span>
            </div>
            <input
              type="text"
              name="amount"
              id="amount"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="50"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              required
            />
            {paymentMethod === 'blockchain' && amount && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">
                  ≈ Ξ{convertMyrToEth(amount).toFixed(6)}
                </span>
              </div>
            )}
          </div>
          
          {/* Quick amount buttons */}
          <div className="mt-2 grid grid-cols-4 gap-2">
            {[50, 100, 500, 1000].map((value) => (
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
                RM{value}
              </button>
            ))}
          </div>
          
          {/* Show fees for blockchain donations */}
          {paymentMethod === 'blockchain' && amount && (
            <div className="mt-2 text-sm text-gray-500">
              {(() => {
                const fees = calculateFees();
                if (!fees) return null;
                
                return (
                  <div className="space-y-1">
                    <p>Base amount: Ξ{fees.baseAmount}</p>
                    <p>Platform fee ({platformFee}%): Ξ{fees.fee}</p>
                    <p className="font-medium">Total: Ξ{fees.total}</p>
                    <p className="text-xs">
                      Minimum donation: Ξ{minDonationAmount}
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
        
        {/* Message Input */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Message (Optional)
          </label>
          <div className="mt-1">
            <textarea
              id="message"
              name="message"
              rows={3}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Add a message of support..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        
        {/* Anonymous Donation */}
        <div className="flex items-center">
          <input
            id="anonymous"
            name="anonymous"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
          />
          <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-900">
            Make this donation anonymous
          </label>
        </div>
        
        {/* Tax Receipt */}
        {!anonymous && (
          <div className="flex items-center">
            <input
              id="receipt"
              name="receipt"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={receiptRequired}
              onChange={(e) => setReceiptRequired(e.target.checked)}
            />
            <label htmlFor="receipt" className="ml-2 block text-sm text-gray-900">
              Request tax receipt
            </label>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}
        
        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {paymentMethod === 'blockchain' ? (
              <>
                <FaEthereum className="mr-2 h-5 w-5" />
                Donate with Ethereum
              </>
            ) : (
              <>
                <FaMoneyBillWave className="mr-2 h-5 w-5" />
                Donate Now
              </>
            )}
          </button>
        </div>
      </form>
    );
  };
  
  const renderProcessingStep = () => {
    return (
      <div className="text-center py-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100">
          <FaSpinner className="h-10 w-10 text-indigo-600 animate-spin" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Processing Your Donation</h3>
        <p className="mt-2 text-gray-500">
          {paymentMethod === 'blockchain' 
            ? 'Please confirm the transaction in your wallet. Do not close this window.'
            : paymentMethod === 'fpx'
            ? 'You will be redirected to your bank\'s website to complete the payment.'
            : paymentMethod === 'tng' || paymentMethod === 'boost' || paymentMethod === 'grabpay'
            ? 'Please check your phone for a payment notification.'
            : 'Please wait while we process your donation.'}
        </p>
      </div>
    );
  };
  
  const renderSuccessStep = () => {
    return (
      <div className="text-center py-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
          <FaCheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Terima Kasih! Thank You for Your Donation!</h3>
        <p className="mt-2 text-gray-500">
          Your donation of {paymentMethod === 'blockchain' 
            ? `RM${amount} (Ξ${convertMyrToEth(amount).toFixed(6)})` 
            : formatCurrency(amount)} to {charityDetails?.name || charityName} has been processed successfully.
        </p>
        
        {receiptRequired && (
          <div className="mt-4 p-4 bg-blue-50 rounded-md mx-auto max-w-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaReceipt className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3 text-sm text-blue-700">
                <p>Your tax receipt will be emailed to you within 3 business days.</p>
                <p className="mt-1">This donation is tax-deductible in Malaysia under Section 44(6) of the Income Tax Act 1967.</p>
              </div>
            </div>
          </div>
        )}
        
        {blockchainTxHash && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md mx-auto max-w-md">
            <p className="text-sm font-medium text-gray-700">Transaction Hash:</p>
            <p className="mt-1 font-mono text-xs break-all text-gray-500">{blockchainTxHash}</p>
            <a
              href={`https://etherscan.io/tx/${blockchainTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
            >
              View on Etherscan <FaExternalLinkAlt className="ml-1 h-3 w-3" />
            </a>
          </div>
        )}
        
        <div className="mt-6 flex flex-col sm:flex-row sm:justify-center space-y-3 sm:space-y-0 sm:space-x-3">
          <Link
            to={`/charities/${charityId || id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View Charity Details
          </Link>
          <button
            type="button"
            onClick={() => {
              setCurrentStep(1);
              setAmount('');
              setMessage('');
              setBlockchainTxHash('');
              setSuccess(false);
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Make Another Donation
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Donate to: {charityDetails?.name || charityName}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Your donation will help support this charity's mission and initiatives.
            </p>
          </div>
          <div className="flex-shrink-0">
            {paymentMethod === 'blockchain' ? (
              <FaEthereum className="h-6 w-6 text-indigo-600" />
            ) : (
              <FaMoneyBillWave className="h-6 w-6 text-indigo-600" />
            )}
          </div>
        </div>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        {currentStep === 1 && renderDonationStep()}
        {currentStep === 2 && renderProcessingStep()}
        {currentStep === 3 && renderSuccessStep()}
      </div>
      
      {charityDetails && currentStep === 1 && (
        <div className="px-4 py-4 sm:px-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <FaLock className="h-5 w-5 text-gray-400" />
              <p className="ml-2 text-gray-500">
                Your donation is secure and will directly support this charity
              </p>
            </div>
            <Link
              to="/blockchain-transparency"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Learn More
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 
