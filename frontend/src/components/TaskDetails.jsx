import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useBlockchain } from '../context/BlockchainContext';
import { formatImageUrl } from '../utils/helpers';
import MilestoneTracker from './MilestoneTracker';
import TransactionHistory from './TransactionHistory';
import TaskFundingForm from './TaskFundingForm';
import AdminFundReleaseButton from './AdminFundReleaseButton';
import {
  FaArrowLeft,
  FaChartBar,
  FaCheckCircle,
  FaClock,
  FaEthereum,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaHandHoldingHeart,
  FaInfoCircle,
  FaLock,
  FaMoneyBillWave,
  FaTag
} from 'react-icons/fa';

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  const { account, getTaskBalance } = useBlockchain();

  const [task, setTask] = useState(null);
  const [charity, setCharity] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [blockchainBalance, setBlockchainBalance] = useState(null);
  const [showFundingForm, setShowFundingForm] = useState(false);
  const [pictures, setPictures] = useState([]);
  const [currentPictureIndex, setCurrentPictureIndex] = useState(0);

  useEffect(() => {
    fetchTaskData();
  }, [id]);

  useEffect(() => {
    // Fetch blockchain balance if account is connected
    const fetchBlockchainBalance = async () => {
      if (account && task) {
        try {
          const balance = await getTaskBalance(id);
          setBlockchainBalance(balance);
        } catch (err) {
          console.error('Error fetching blockchain balance:', err);
        }
      }
    };

    fetchBlockchainBalance();
  }, [account, task, id, getTaskBalance]);

  const fetchTaskData = async () => {
    try {
      setLoading(true);

      // Fetch task details
      const taskRes = await axios.get(`/api/tasks/${id}`);
      setTask(taskRes.data);

      // Fetch charity details
      if (taskRes.data.charity_id) {
        const charityRes = await axios.get(`/api/charities/${taskRes.data.charity_id}`);
        setCharity(charityRes.data);
      }

      // Fetch task pictures
      try {
        const picturesRes = await axios.get(`/api/tasks/${id}/pictures`);
        setPictures(picturesRes.data);
      } catch (err) {
        console.log('Pictures endpoint not available yet');
        setPictures([]);
      }

      // Mock milestones data (in a real app, this would come from the API)
      setMilestones([
        {
          id: 1,
          title: 'Planning Phase',
          description: 'Initial research and project planning',
          status: 'completed',
          amount: '0.05',
          percentage: 20,
          start_date: '2023-01-15',
          completion_date: '2023-02-01',
          blockchain_tx_hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          deliverables: [
            {
              type: 'document',
              name: 'Project Plan.pdf',
              file_path: '/documents/project_plan.pdf'
            }
          ]
        },
        {
          id: 2,
          title: 'Development Phase',
          description: 'Implementation of core components',
          status: 'in_progress',
          amount: '0.1',
          percentage: 40,
          start_date: '2023-02-02',
          completion_date: null,
          deliverables: []
        },
        {
          id: 3,
          title: 'Testing Phase',
          description: 'Quality assurance and testing',
          status: 'locked',
          amount: '0.05',
          percentage: 20,
          start_date: null,
          completion_date: null,
          deliverables: []
        },
        {
          id: 4,
          title: 'Deployment Phase',
          description: 'Final deployment and reporting',
          status: 'locked',
          amount: '0.05',
          percentage: 20,
          start_date: null,
          completion_date: null,
          deliverables: []
        }
      ]);

    } catch (err) {
      setError('Failed to fetch task details');
      console.error('Error fetching task details:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!task?.fund_targeted) return 0;
    return Math.min(100, (task.fund_received / task.fund_targeted) * 100);
  };

  const canManageTask = () => {
    return organization?.id === charity?.organization_id;
  };

  const handleVerifyMilestone = async (milestoneId) => {
    // In a real app, this would call the API to verify the milestone
    try {
      // Mock API call
      // await axios.post(`/api/milestones/${milestoneId}/verify`);

      // Update local state
      setMilestones(milestones.map(m =>
        m.id === milestoneId
          ? { ...m, status: 'completed', completion_date: new Date().toISOString().split('T')[0] }
          : m
      ));

      // Show next milestone as in_progress if it exists
      const currentIndex = milestones.findIndex(m => m.id === milestoneId);
      if (currentIndex < milestones.length - 1) {
        setMilestones(milestones.map((m, index) =>
          index === currentIndex + 1
            ? { ...m, status: 'in_progress', start_date: new Date().toISOString().split('T')[0] }
            : m
        ));
      }
    } catch (err) {
      console.error('Error verifying milestone:', err);
    }
  };

  const handleFundingSuccess = (data) => {
    setTask(prevTask => ({
      ...prevTask,
      fund_received: parseFloat(prevTask.fund_received) + parseFloat(data.amount)
    }));
    setShowFundingForm(false);
    toast.success('Funding successful!');
  };

  const nextPicture = () => {
    setCurrentPictureIndex((currentPictureIndex + 1) % pictures.length);
  };

  const prevPicture = () => {
    setCurrentPictureIndex((currentPictureIndex - 1 + pictures.length) % pictures.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-800">{error || 'Task not found'}</h3>
          <button
            onClick={() => navigate('/tasks')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-gray-500 mb-6">
          {charity && (
            <>
              <Link to="/charities" className="hover:text-gray-700">
                Charities
              </Link>
              <span className="mx-2">/</span>
              <Link to={`/charities/${charity.id}`} className="hover:text-gray-700">
                {charity.name}
              </Link>
              <span className="mx-2">/</span>
            </>
          )}
          <Link to="/tasks" className="hover:text-gray-700 flex items-center">
            <FaArrowLeft className="mr-2" />
            Back to Tasks
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{task.name}</span>
        </nav>

        {/* Task Header */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
          {/* Task Image Carousel */}
          {pictures.length > 0 && (
            <div className="relative h-96">
              <img
                src={formatImageUrl(pictures[currentPictureIndex].picture_path)}
                alt={`Task image ${currentPictureIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {pictures.length > 1 && (
                <>
                  <button
                    onClick={prevPicture}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-75"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextPicture}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-75"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {pictures.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPictureIndex(index)}
                        className={`h-2 w-2 rounded-full ${
                          index === currentPictureIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                <h1 className="text-3xl font-bold text-white">{task.name}</h1>
                {charity && (
                  <div className="mt-2 flex items-center text-white">
                    <FaTag className="mr-2" />
                    <span>Charity: {charity.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-6">
            {!pictures.length > 0 && (
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{task.name}</h1>
                  {charity && (
                    <div className="mt-2 flex items-center text-gray-600">
                      <FaTag className="mr-2 text-gray-400" />
                      <span>Charity: {charity.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">Description</h3>
                <p className="mt-2 text-gray-600 whitespace-pre-line">{task.description}</p>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <FaMoneyBillWave className="text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {parseFloat(task.fund_received).toFixed(3)} <span className="text-indigo-600">SCROLL</span> raised of {parseFloat(task.fund_targeted).toFixed(3)} <span className="text-indigo-600">SCROLL</span> goal
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-500">
                      {Math.round(calculateProgress())}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                </div>

                {blockchainBalance !== null && (
                  <div className="mt-4 flex items-center">
                    <FaEthereum className="text-indigo-600 mr-2" />
                    <span className="text-gray-900">Blockchain Balance: Ξ{blockchainBalance}</span>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    <FaEthereum className="mr-1 h-3 w-3" />
                    Blockchain Funded
                  </span>
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <FaCheckCircle className="mr-1 h-3 w-3" />
                    Verified
                  </span>
                  {task.status === 'in_progress' && (
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      <FaClock className="mr-1 h-3 w-3" />
                      In Progress
                    </span>
                  )}
                </div>
              </div>

              <div className="md:w-64 flex flex-col gap-4">
                {!showFundingForm ? (
                  <button
                    onClick={() => setShowFundingForm(true)}
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FaHandHoldingHeart className="mr-2" />
                    Fund This Task
                  </button>
                ) : (
                  <button
                    onClick={() => setShowFundingForm(false)}
                    className="w-full flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                )}

                {charity && (
                  <Link
                    to={`/charities/${charity.id}`}
                    className="w-full flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View Charity
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Funding Form (conditionally rendered) */}
        {showFundingForm && (
          <div className="mb-6">
            <TaskFundingForm
              taskId={id}
              taskName={task.name}
              charityId={charity?.id}
              onSuccess={handleFundingSuccess}
            />
          </div>
        )}

        {/* Tabs Section */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('details')}
                className={`${
                  activeTab === 'details'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-center inline-flex items-center justify-center`}
              >
                <FaInfoCircle className="mr-2" />
                Details
              </button>
              <button
                onClick={() => setActiveTab('milestones')}
                className={`${
                  activeTab === 'milestones'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-center inline-flex items-center justify-center`}
              >
                <FaCheckCircle className="mr-2" />
                Milestones
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`${
                  activeTab === 'transactions'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-center inline-flex items-center justify-center`}
              >
                <FaChartBar className="mr-2" />
                Transactions
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Task Details</h2>

                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">{task.start_date || 'Not specified'}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">End Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">{task.end_date || 'Not specified'}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status === 'completed' ? (
                          <FaCheckCircle className="mr-1 h-3 w-3" />
                        ) : task.status === 'in_progress' ? (
                          <FaClock className="mr-1 h-3 w-3" />
                        ) : (
                          <FaLock className="mr-1 h-3 w-3" />
                        )}
                        {task.status?.charAt(0).toUpperCase() + task.status?.slice(1) || 'Not specified'}
                      </span>
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Funding Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span className="inline-flex items-center">
                        <FaEthereum className="mr-1 h-3 w-3 text-indigo-600" />
                        Milestone-based Blockchain Funding
                      </span>
                    </dd>
                  </div>

                  {task.blockchain_address && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Blockchain Address</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="font-mono text-xs truncate">{task.blockchain_address}</span>
                          <a
                            href="https://sepolia.scrollscan.com/address/0x7867fC939F10377E309a3BF55bfc194F672B0E84"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-indigo-600 hover:text-indigo-500"
                          >
                            <FaExternalLinkAlt className="h-3 w-3" />
                          </a>
                        </div>
                      </dd>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Blockchain Transparency</dt>
                    <dd className="mt-1 text-sm text-gray-900 bg-indigo-50 p-4 rounded-md">
                      <p className="text-indigo-700">
                        This task uses blockchain-based milestone funding to ensure transparency and accountability.
                        Funds are held in a smart contract and released only when milestones are verified as completed.
                      </p>
                      <div className="mt-3 flex items-center">
                        <FaLock className="text-indigo-600 mr-2" />
                        <span className="text-xs text-indigo-900">Smart Contract:</span>
                        <span className="ml-2 text-xs font-mono text-indigo-700 truncate">
                          0x5FbDB2315678afecb367f032d93F642f64180aa3
                        </span>
                        <a
                          href="https://sepolia.scrollscan.com/address/0x7867fC939F10377E309a3BF55bfc194F672B0E84"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-indigo-600 hover:text-indigo-500"
                        >
                          <FaExternalLinkAlt className="h-3 w-3" />
                        </a>
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Milestones Tab */}
            {activeTab === 'milestones' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Task Milestones</h2>
                  {user?.is_admin && task.verificationComplete && task.status === 'verified' && !task.funds_released && (
                    <AdminFundReleaseButton
                      type="task"
                      id={id}
                      onSuccess={(data) => {
                        setTask({...task, funds_released: true, transaction_hash: data.transaction_hash});
                        toast.success('Funds released successfully to charity wallet');
                      }}
                    />
                  )}
                </div>
                <MilestoneTracker
                  milestones={milestones}
                  taskId={id}
                  canVerify={canManageTask()}
                  onVerify={handleVerifyMilestone}
                />
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Transactions</h2>
                <TransactionHistory taskId={id} limit={10} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}