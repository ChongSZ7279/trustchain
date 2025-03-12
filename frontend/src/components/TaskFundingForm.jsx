import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useBlockchain } from '../context/BlockchainContext';
import { useLocalization } from '../context/LocalizationContext';
import MalaysianPaymentOptions from './MalaysianPaymentOptions';
import Web3 from 'web3';
import TaskABI from '../contracts/TaskABI.json';
import { 
  FaEthereum, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaSpinner, 
  FaExternalLinkAlt,
  FaArrowRight,
  FaUserSecret,
  FaClipboardCheck,
  FaReceipt,
  FaMoneyBillWave
} from 'react-icons/fa';

export default function TaskFundingForm({ taskId, taskName, charityId, onSuccess }) {
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
  const [transactionHash, setTransactionHash] = useState('');
  const [step, setStep] = useState(1); // 1: Form, 2: Processing, 3: Success
  const [showMilestones, setShowMilestones] = useState(false);
  
  // Task details
  const [taskDetails, setTaskDetails] = useState(null);
  const [milestones, setMilestones] = useState([]);
  
  // Smart contract configuration
  const contractAddress = process.env.REACT_APP_TASK_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  
  // Fetch task details and milestones
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const actualTaskId = taskId || id;
        if (!actualTaskId) return;
        
        const response = await axios.get(`/api/tasks/${actualTaskId}`);
        setTaskDetails(response.data);
        
        // In a real app, fetch milestones from API
        // For now, simulate milestone data
        setMilestones([
          {
            id: 1,
            title: 'Planning Phase',
            description: 'Initial research and project planning',
            percentage: 20,
            amount: '0.05',
            amount_myr: '675', // 0.05 ETH in MYR
            status: 'completed'
          },
          {
            id: 2,
            title: 'Development Phase',
            description: 'Implementation of core components',
            percentage: 40,
            amount: '0.1',
            amount_myr: '1350', // 0.1 ETH in MYR
            status: 'in_progress'
          },
          {
            id: 3,
            title: 'Testing Phase',
            description: 'Quality assurance and testing',
            percentage: 20,
            amount: '0.05',
            amount_myr: '675', // 0.05 ETH in MYR
            status: 'locked'
          },
          {
            id: 4,
            title: 'Deployment Phase',
            description: 'Final deployment and reporting',
            percentage: 20,
            amount: '0.05',
            amount_myr: '675', // 0.05 ETH in MYR
            status: 'locked'
          }
        ]);
      } catch (err) {
        console.error('Error fetching task details:', err);
        setError('Failed to load task details');
      }
    };
    
    fetchTaskDetails();
  }, [taskId, id]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid funding amount');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setStep(2);
      
      const actualTaskId = taskId || id;
      
      if (paymentMethod === 'blockchain') {
        // Handle blockchain funding
        if (!window.ethereum) {
          setError('Please install MetaMask to make blockchain donations');
          setStep(1);
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
          const taskContract = new web3.eth.Contract(TaskABI, contractAddress);
          
          // Convert MYR amount to ETH for display
          const ethAmount = convertMyrToEth(amount).toFixed(6);
          
          // Convert amount to wei
          const amountInWei = web3.utils.toWei(ethAmount, 'ether');
          
          // Make funding transaction
          const transaction = await taskContract.methods.fundTask(actualTaskId).send({
            from: userAccount,
            value: amountInWei,
            gas: 200000
          });
          
          setTransactionHash(transaction.transactionHash);
          
          // Record transaction in backend
          await axios.post('/api/transactions', {
            task_id: actualTaskId,
            charity_id: charityId,
            amount: ethAmount,
            amount_myr: amount,
            message: message,
            anonymous: anonymous,
            transaction_hash: transaction.transactionHash,
            contract_address: contractAddress,
            type: 'task_funding',
            payment_method: 'blockchain',
            user_id: anonymous ? null : user?.id,
            receipt_required: receiptRequired
          });
          
          setStep(3);
          
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
          setStep(1);
        }
      } else {
        // Handle Malaysian payment methods
        // This would typically integrate with a payment processor like Billplz, Stripe, etc.
        // For this example, we'll simulate a successful payment
        
        setTimeout(async () => {
          try {
            // Record transaction in backend
            await axios.post('/api/transactions', {
              task_id: actualTaskId,
              charity_id: charityId,
              amount: amount,
              currency: 'MYR',
              message: message,
              anonymous: anonymous,
              type: 'task_funding',
              payment_method: paymentMethod,
              user_id: anonymous ? null : user?.id,
              receipt_required: receiptRequired
            });
            
            setStep(3);
            
            if (onSuccess) {
              onSuccess({
                amount,
                currency: 'MYR',
                method: paymentMethod
              });
            }
          } catch (err) {
            console.error('Error recording transaction:', err);
            setError('Failed to process funding: ' + (err.response?.data?.message || err.message || 'Unknown error'));
            setStep(1);
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Error processing funding:', err);
      setError('Failed to process funding: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      setStep(1);
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
  
  const renderFundingForm = () => {
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
              <span className="mt-2 text-xs text-indigo-600 font-medium">Funding</span>
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
        
        {/* Milestone Funding Explanation */}
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaInfoCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Milestone-Based Funding</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Your contribution will fund specific milestones in this project. Funds are only released when each milestone is verified as completed.
                </p>
                <button
                  type="button"
                  onClick={() => setShowMilestones(!showMilestones)}
                  className="mt-2 text-blue-600 hover:text-blue-500 font-medium flex items-center"
                >
                  {showMilestones ? 'Hide Milestones' : 'View Milestones'} 
                  <FaArrowRight className={`ml-1 h-3 w-3 transform transition-transform ${showMilestones ? 'rotate-90' : ''}`} />
                </button>
              </div>
              
              {showMilestones && (
                <div className="mt-4 bg-white p-4 rounded-md border border-blue-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Project Milestones</h4>
                  <div className="space-y-3">
                    {milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-start">
                        <div className={`flex-shrink-0 h-5 w-5 rounded-full mr-3 ${
                          milestone.status === 'completed' ? 'bg-green-500' :
                          milestone.status === 'in_progress' ? 'bg-yellow-500' :
                          'bg-gray-300'
                        }`}></div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">{milestone.title} ({milestone.percentage}%)</h5>
                          <p className="text-xs text-gray-500">{milestone.description}</p>
                          <p className="text-xs text-gray-700 mt-1">
                            Funding: {formatCurrency(milestone.amount_myr)} ({paymentMethod === 'blockchain' ? `Ξ${milestone.amount}` : ''})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Funding Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Funding Amount {paymentMethod === 'blockchain' ? '(MYR → ETH)' : '(MYR)'}
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">
                RM
              </span>
            </div>
            <input
              type="text"
              name="amount"
              id="amount"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="100"
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
              placeholder="Add a message with your funding"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        
        {/* Anonymous funding */}
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
              Fund anonymously
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
                Fund with Ethereum
              </>
            ) : paymentMethod === 'fpx' ? (
              <>
                <FaMoneyBillWave className="mr-2 h-5 w-5" />
                Fund with FPX
              </>
            ) : (
              <>
                <FaClipboardCheck className="mr-2 h-5 w-5" />
                Fund This Task
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
        <h3 className="mt-4 text-lg font-medium text-gray-900">Processing Your Funding</h3>
        <p className="mt-2 text-gray-500">
          {paymentMethod === 'blockchain' 
            ? 'Please confirm the transaction in your wallet. Do not close this window.'
            : paymentMethod === 'fpx'
            ? 'You will be redirected to your bank\'s website to complete the payment.'
            : paymentMethod === 'tng' || paymentMethod === 'boost' || paymentMethod === 'grabpay'
            ? 'Please check your phone for a payment notification.'
            : 'Please wait while we process your funding.'}
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
        <h3 className="mt-4 text-lg font-medium text-gray-900">Terima Kasih! Thank You for Your Support!</h3>
        <p className="mt-2 text-gray-500">
          Your contribution of {paymentMethod === 'blockchain' 
            ? `RM${amount} (Ξ${convertMyrToEth(amount).toFixed(6)})` 
            : formatCurrency(amount)} to {taskDetails?.name || taskName} has been processed successfully.
        </p>
        
        {receiptRequired && (
          <div className="mt-4 p-4 bg-blue-50 rounded-md mx-auto max-w-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaReceipt className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3 text-sm text-blue-700">
                <p>Your tax receipt will be emailed to you within 3 business days.</p>
                <p className="mt-1">This contribution is tax-deductible in Malaysia under Section 44(6) of the Income Tax Act 1967.</p>
              </div>
            </div>
          </div>
        )}
        
        {transactionHash && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md mx-auto max-w-md">
            <p className="text-sm font-medium text-gray-700">Transaction Hash:</p>
            <p className="mt-1 font-mono text-xs break-all text-gray-500">{transactionHash}</p>
            <a
              href={`https://etherscan.io/tx/${transactionHash}`}
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
            to={`/tasks/${taskId || id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View Task Details
          </Link>
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setAmount('');
              setMessage('');
              setTransactionHash('');
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Fund Another Task
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
              Fund Task: {taskDetails?.name || taskName}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Your contribution will help fund this task's milestones and initiatives.
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
        {step === 1 && renderFundingForm()}
        {step === 2 && renderProcessingStep()}
        {step === 3 && renderSuccessStep()}
      </div>
      
      {taskDetails && step === 1 && (
        <div className="px-4 py-4 sm:px-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <FaInfoCircle className="h-5 w-5 text-gray-400" />
              <p className="ml-2 text-gray-500">
                Funds are only released when milestones are verified as completed
              </p>
            </div>
            <Link
              to="/milestone-funding"
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