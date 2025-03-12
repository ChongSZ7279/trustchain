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

export default function DonationForm({ charityId, charityName, onSuccess }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { account, connectWallet } = useBlockchain();
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
  const [paymentMethod, setPaymentMethod] = useState('fpx'); // Default to FPX (Malaysian online banking)
  const [receiptRequired, setReceiptRequired] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isBlockchainEnabled, setIsBlockchainEnabled] = useState(false);
  const [blockchainTxHash, setBlockchainTxHash] = useState('');
  const [showBlockchainInfo, setShowBlockchainInfo] = useState(false);
  
  // Charity details
  const [charityDetails, setCharityDetails] = useState(null);
  const [charityBalance, setCharityBalance] = useState(null);
  
  // Multi-step form
  const [currentStep, setCurrentStep] = useState(1); // 1: Form, 2: Processing, 3: Success
  
  // Smart contract configuration
  const contractAddress = import.meta.env.VITE_CHARITY_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  
  // Fetch charity details and blockchain balance
  useEffect(() => {
    const fetchCharityDetails = async () => {
      try {
        const actualCharityId = charityId || id;
        if (!actualCharityId) return;
        
        const response = await axios.get(`/api/charities/${actualCharityId}`);
        setCharityDetails(response.data);
        
        // If blockchain is selected and account is connected, fetch blockchain balance
        if (isBlockchainEnabled && account) {
          try {
            const web3 = new Web3(window.ethereum);
            const charityContract = new web3.eth.Contract(CharityABI, contractAddress);
            const balance = await charityContract.methods.getCharityBalance(actualCharityId).call();
            setCharityBalance(web3.utils.fromWei(balance, 'ether'));
          } catch (err) {
            console.error('Error fetching blockchain balance:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching charity details:', err);
        setError('Failed to load charity details');
      }
    };
    
    fetchCharityDetails();
  }, [charityId, id, isBlockchainEnabled, account]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid donation amount');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setCurrentStep(2);
      
      const actualCharityId = charityId || id;
      
      if (paymentMethod === 'blockchain') {
        // Handle blockchain donation
        if (!window.ethereum) {
          setError('Please install MetaMask to make blockchain donations');
          setCurrentStep(1);
          return;
        }
        
        try {
          // Request account access if needed
          if (!account) {
            await connectWallet();
          }
          
          const web3 = new Web3(window.ethereum);
          const accounts = await web3.eth.getAccounts();
          const userAccount = accounts[0];
          
          // Create contract instance
          const charityContract = new web3.eth.Contract(CharityABI, contractAddress);
          
          // Convert MYR amount to ETH for display
          const ethAmount = convertMyrToEth(amount).toFixed(6);
          
          // Convert amount to wei
          const amountInWei = web3.utils.toWei(ethAmount, 'ether');
          
          // Make donation transaction
          const transaction = await charityContract.methods.donate(actualCharityId).send({
            from: userAccount,
            value: amountInWei,
            gas: 200000
          });
          
          setBlockchainTxHash(transaction.transactionHash);
          
          // Record transaction in backend
          await axios.post('/api/transactions', {
            charity_id: actualCharityId,
            amount: ethAmount,
            amount_myr: amount,
            message: message,
            anonymous: anonymous,
            transaction_hash: transaction.transactionHash,
            contract_address: contractAddress,
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
              txHash: transaction.transactionHash,
              method: 'blockchain'
            });
          }
        } catch (err) {
          console.error('Blockchain transaction error:', err);
          setError('Transaction failed: ' + (err.message || 'Unknown error'));
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
      setError('Failed to process donation: ' + (err.response?.data?.message || err.message || 'Unknown error'));
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
    if (method === 'blockchain') {
      setIsBlockchainEnabled(true);
    } else {
      setIsBlockchainEnabled(false);
    }
  };
  
  const renderDonationStep = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
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
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full text-white">
                1
              </div>
              <span className="mt-2 text-xs text-indigo-600 font-medium">Donation</span>
            </div>
            <div className="flex-1 h-1 mx-2 bg-gray-200">
              <div className="h-1 bg-indigo-600" style={{ width: '0%' }}></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full text-gray-500">
                2
              </div>
              <span className="mt-2 text-xs text-gray-500 font-medium">Processing</span>
            </div>
            <div className="flex-1 h-1 mx-2 bg-gray-200">
              <div className="h-1 bg-indigo-600" style={{ width: '0%' }}></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full text-gray-500">
                3
              </div>
              <span className="mt-2 text-xs text-gray-500 font-medium">Confirmation</span>
            </div>
          </div>
        </div>
        
        {/* Donation Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Donation Amount {paymentMethod === 'blockchain' ? '(MYR → ETH)' : '(MYR)'}
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">
                {paymentMethod === 'blockchain' ? 'RM' : 'RM'}
              </span>
            </div>
            <input
              type="text"
              name="amount"
              id="amount"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder={paymentMethod === 'blockchain' ? '50' : '50'}
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
          
          {/* Quick amount buttons - Malaysian amounts */}
          <div className="mt-2 grid grid-cols-4 gap-2">
            {[10, 50, 100, 500].map((value) => (
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
        </div>
        
        {/* Message */}
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
              placeholder="Add a message with your donation"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        
        {/* Anonymous donation */}
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
            <label htmlFor="anonymous" className="font-medium text-gray-700 flex items-center">
              <FaUserSecret className="mr-2 text-gray-500" />
              Donate anonymously
            </label>
            <p className="text-gray-500">Your name will not be displayed publicly</p>
          </div>
        </div>
        
        {/* Receipt for tax deduction */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="receipt"
              name="receipt"
              type="checkbox"
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              checked={receiptRequired}
              onChange={(e) => setReceiptRequired(e.target.checked)}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="receipt" className="font-medium text-gray-700 flex items-center">
              <FaReceipt className="mr-2 text-gray-500" />
              I need a receipt for tax deduction
            </label>
            <p className="text-gray-500">
              Get an official receipt for tax deduction under LHDN Malaysia
            </p>
          </div>
        </div>
        
        {/* Malaysian Payment Methods */}
        <MalaysianPaymentOptions 
          selectedMethod={paymentMethod}
          onSelectMethod={handlePaymentMethodChange}
          showBlockchain={true}
        />
        
        {/* Blockchain Info */}
        {paymentMethod === 'blockchain' && (
          <div className="rounded-md bg-indigo-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaInfoCircle className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-indigo-800">Blockchain Donation</h3>
                <div className="mt-2 text-sm text-indigo-700">
                  <p>
                    Your donation will be processed through the Ethereum blockchain, providing complete transparency and traceability.
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>You'll need a wallet like MetaMask to proceed</li>
                    <li>Your donation will be recorded on the blockchain</li>
                    <li>Transaction fees (gas) will apply</li>
                    <li>Your MYR amount will be converted to ETH at current rates</li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => setShowBlockchainInfo(!showBlockchainInfo)}
                    className="mt-2 text-indigo-600 hover:text-indigo-500 font-medium flex items-center"
                  >
                    {showBlockchainInfo ? 'Hide Details' : 'Learn More'} 
                    <FaArrowRight className={`ml-1 h-3 w-3 transform transition-transform ${showBlockchainInfo ? 'rotate-90' : ''}`} />
                  </button>
                </div>
                
                {showBlockchainInfo && (
                  <div className="mt-4 bg-white p-4 rounded-md border border-indigo-100">
                    <h4 className="text-sm font-medium text-gray-900">How Blockchain Donations Work</h4>
                    <p className="mt-2 text-sm text-gray-600">
                      When you donate using blockchain:
                    </p>
                    <ol className="list-decimal pl-5 mt-2 space-y-2 text-sm text-gray-600">
                      <li>Your Ethereum wallet (like MetaMask) will open to confirm the transaction</li>
                      <li>Funds are sent directly to a smart contract (no intermediaries)</li>
                      <li>The transaction is permanently recorded on the Ethereum blockchain</li>
                      <li>The charity can only access funds according to predefined rules</li>
                      <li>You can track your donation's impact through our platform</li>
                    </ol>
                    <div className="mt-3 flex items-center">
                      <FaLock className="text-indigo-600 mr-2" />
                      <span className="text-xs text-gray-900">Contract Address:</span>
                      <span className="ml-2 text-xs font-mono text-gray-700 truncate">
                        {contractAddress}
                      </span>
                    </div>
                  </div>
                )}
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
            ) : paymentMethod === 'fpx' ? (
              <>
                <FaMoneyBillWave className="mr-2 h-5 w-5" />
                Donate with FPX
              </>
            ) : paymentMethod === 'card' ? (
              <>
                <FaCreditCard className="mr-2 h-5 w-5" />
                Donate with Card
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
