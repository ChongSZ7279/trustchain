import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils/helpers';
import { 
  FaChartBar, 
  FaTasks, 
  FaHandHoldingHeart,
  FaExchangeAlt,
  FaFileAlt,
  FaEdit,
  FaTrash,
  FaImages,
  FaPlus,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaClock,
  FaTag,
  FaBullseye,
  FaHeart,
  FaUsers,
  FaExternalLinkAlt,
  FaChevronDown
} from 'react-icons/fa';

export default function CharityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  const [charity, setCharity] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [donations, setDonations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchCharityData();
  }, [id]);

  const fetchCharityData = async () => {
    try {
      setLoading(true);
      const [charityRes, tasksRes] = await Promise.all([
        axios.get(`/api/charities/${id}`),
        axios.get(`/api/charities/${id}/tasks`)
      ]);
      setCharity(charityRes.data);
      setTasks(tasksRes.data);
      
      // Set follower status
      if (charityRes.data.is_following !== undefined) {
        setIsFollowing(charityRes.data.is_following);
      }
      if (charityRes.data.follower_count !== undefined) {
        setFollowerCount(charityRes.data.follower_count);
      }
      
      // Try to fetch donations and transactions, but don't fail if they're not available
      try {
        const donationsRes = await axios.get(`/api/charities/${id}/donations`);
        setDonations(donationsRes.data);
      } catch (err) {
        console.log('Donations endpoint not available yet');
        setDonations([]);
      }

      try {
        const transactionsRes = await axios.get(`/api/charities/${id}/transactions`);
        setTransactions(transactionsRes.data);
      } catch (err) {
        console.log('Transactions endpoint not available yet');
        setTransactions([]);
      }
      
      // Check follow status if user is logged in
      if (user) {
        try {
          const followStatusRes = await axios.get(`/api/charities/${id}/follow-status`);
          setIsFollowing(followStatusRes.data.is_following);
          setFollowerCount(followStatusRes.data.follower_count);
        } catch (err) {
          console.error('Error checking follow status:', err);
        }
      }
    } catch (err) {
      setError('Failed to fetch charity details');
      console.error('Error fetching charity details:', err);
    } finally {
      setLoading(false);
    }
  };

  const canManageCharity = () => {
    return organization?.id === charity?.organization_id;
  };

  const calculateProgress = () => {
    if (!charity?.fund_targeted) return 0;
    return Math.min(100, (charity.fund_received / charity.fund_targeted) * 100);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleToggleFollow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const response = await axios.post(`/api/charities/${id}/follow`);
      setIsFollowing(response.data.is_following);
      setFollowerCount(response.data.follower_count);
    } catch (err) {
      console.error('Error toggling follow status:', err);
    }
  };

  const formatCurrency = (amount) => {
    return typeof amount === 'number' ? amount.toLocaleString() : '0';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !charity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-800">{error || 'Charity not found'}</h3>
          <button
            onClick={() => navigate('/charities')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Charities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section 1: Main Info */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Left Column - Details */}
            <div className="space-y-6">
              {/* Category */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                <FaTag className="mr-2" />
                {charity?.category || 'Uncategorized'}
              </div>

              {/* Project Name */}
              <h1 className="text-3xl font-bold text-gray-900">{charity?.name}</h1>

              {/* Description */}
              <p className="text-gray-600">{charity?.description}</p>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleToggleFollow}
                  className={`flex-1 inline-flex justify-center items-center px-6 py-3 border text-base font-medium rounded-lg transition-colors ${
                    isFollowing
                      ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      : 'border-transparent text-white bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <FaHeart className="mr-2 text-red-500" />
                      Following
                    </>
                  ) : (
                    <>
                      <FaHeart className="mr-2" />
                      Follow
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate(`/charities/${id}/donate`)}
                  className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  <FaHandHoldingHeart className="mr-2" />
                  Donate
                </button>
              </div>
            </div>

            {/* Right Column - Picture */}
            <div className="relative h-[400px] rounded-xl overflow-hidden">
              <img
                src={formatImageUrl(charity?.picture_path) || 'https://via.placeholder.com/800x600'}
                alt={charity?.name || 'Charity'}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Funding Progress Bar */}
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-between items-baseline mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    ${formatCurrency(charity?.fund_received)}
                    <span className="text-gray-500 text-lg font-normal"> raised of ${formatCurrency(charity?.fund_targeted)}</span>
                  </h2>
                  <p className="text-gray-500 mt-1">{calculateProgress()}% towards goal</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500">Total Donors</p>
                  <p className="text-2xl font-bold text-gray-900">{followerCount}</p>
                </div>
              </div>
              
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Find Out More Section - Expandable */}
          <div className="border-t border-gray-100">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg font-medium text-gray-900">Find Out More</span>
              <FaChevronDown className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>

            {showDetails && (
              <div className="px-6 pb-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Category</h3>
                    <p className="text-gray-600">{charity?.category}</p>
                  </div>

                  {/* Verification Status */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Verification Status</h3>
                    <div className="flex items-center">
                      {charity?.is_verified ? (
                        <>
                          <FaCheckCircle className="text-green-500 mr-2" />
                          <span className="text-green-700">Verified Organization</span>
                        </>
                      ) : (
                        <>
                          <FaExclamationTriangle className="text-yellow-500 mr-2" />
                          <span className="text-yellow-700">Pending Verification</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Extended Description */}
                  <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">About Us</h3>
                    <p className="text-gray-600">{charity?.extended_description || charity?.description}</p>
                  </div>

                  {/* Documents Section */}
                  {charity?.documents && charity.documents.length > 0 && (
                    <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-4">Verified Documents</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {charity.documents.map((doc, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                            <FaFileAlt className="text-blue-500" />
                            <span className="flex-1 text-gray-600">{doc.name}</span>
                            <a
                              href={formatImageUrl(doc.file_path)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('milestones')}
                className={`${
                  activeTab === 'milestones'
                    ? 'border-indigo-500 text-indigo-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex-1 py-4 px-8 text-center border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                <div className="flex items-center justify-center">
                  <FaTasks className="mr-2" />
                  Milestones
                </div>
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`${
                  activeTab === 'transactions'
                    ? 'border-indigo-500 text-indigo-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex-1 py-4 px-8 text-center border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                <div className="flex items-center justify-center">
                  <FaExchangeAlt className="mr-2" />
                  Transactions
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'milestones' && (
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-blue-200"></div>
                
                {/* Timeline Items */}
                <div className="space-y-12">
                  {tasks.map((task, index) => (
                    <div
                      key={task.id}
                      className={`flex items-center ${
                        index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                      }`}
                    >
                      {/* Content Side */}
                      <div className="w-5/12 relative">
                        {/* Main Task Content */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-blue-200">
                          <div className="space-y-4">
                            {/* Task Name and Completion Time */}
                            <div className="flex justify-between items-start">
                              <h3 className="text-xl font-semibold text-gray-900">{task.name}</h3>
                              {task.completed_at && (
                                <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                                  <FaCheckCircle className="mr-1" />
                                  Completed {new Date(task.completed_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {/* Task Description */}
                            <p className="text-gray-600">{task.description}</p>

                            {/* Task Image */}
                            {task.image && (
                              <div className="relative h-48 rounded-lg overflow-hidden">
                                <img
                                  src={formatImageUrl(task.image)}
                                  alt={task.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            {/* Progress Bar */}
                            {task.fund_targeted && (
                              <div className="mt-4">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-500">Progress</span>
                                  <span className="font-medium text-blue-600">
                                    ${formatCurrency(task.current_amount)} / ${formatCurrency(task.fund_targeted)}
                                  </span>
                                </div>
                                <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500"
                                    style={{
                                      width: `${Math.min(
                                        (task.current_amount / task.fund_targeted) * 100,
                                        100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            {/* Task Status */}
                            <div className="flex items-center justify-between text-sm">
                              <span className={`px-3 py-1 rounded-full ${
                                task.status === 'completed'
                                  ? 'bg-green-50 text-green-700'
                                  : task.status === 'in_progress'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-gray-50 text-gray-700'
                              }`}>
                                {task.status === 'completed' && <FaCheckCircle className="inline mr-1" />}
                                {task.status === 'in_progress' && <FaClock className="inline mr-1" />}
                                {task.status?.charAt(0).toUpperCase() + task.status?.slice(1).replace('_', ' ')}
                              </span>
                              
                              {/* Time Box */}
                              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg px-3 py-1">
                                <span className="text-blue-700 font-medium">
                                  {new Date(task.created_at).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Point */}
                      <div className="w-2/12 flex justify-center relative">
                        <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-[0_0_0_2px_rgba(59,130,246,0.5)]"></div>
                        {/* Date Box - Positioned opposite to the task card */}
                        <div className={`absolute top-0 ${
                          index % 2 === 0 ? 'left-full' : 'right-full'
                        } transform ${
                          index % 2 === 0 ? 'translate-x-4' : '-translate-x-4'
                        } -translate-y-1/2 bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-1 whitespace-nowrap`}>
                          <span className="text-sm text-blue-700 font-medium">
                            {new Date(task.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Empty Space for alignment */}
                      <div className="w-5/12"></div>
                    </div>
                  ))}

                  {tasks.length === 0 && (
                    <div className="text-center py-12">
                      <div className="bg-blue-50 rounded-lg p-8 max-w-md mx-auto">
                        <FaTasks className="mx-auto h-12 w-12 text-blue-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No milestones yet</h3>
                        <p className="mt-2 text-sm text-gray-500">
                          This charity hasn't added any milestones yet. Check back later for updates.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map(transaction => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                          {transaction.transaction_hash || transaction.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === 'donation' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            <FaCheckCircle className={`mr-1 ${
                              transaction.status === 'completed' ? 'text-green-500' : 'text-yellow-500'
                            }`} />
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {transactions.length === 0 && (
                  <div className="text-center py-12">
                    <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Transaction history will appear here once donations are made.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 