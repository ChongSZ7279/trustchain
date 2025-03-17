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
  FaChevronDown,
  FaShare,
  FaCalendarAlt,
  FaInfoCircle,
  FaCommentAlt
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function CharityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, accountType } = useAuth();
  const [charity, setCharity] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [donations, setDonations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('milestones');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [taskDeleteLoading, setTaskDeleteLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [showDonationModal, setShowDonationModal] = useState(false);

  useEffect(() => {
    fetchCharityData();
    // Reset scroll position when viewing a new charity
    window.scrollTo(0, 0);
  }, [id]);

  const fetchCharityData = async () => {
    try {
      setLoading(true);
      
      // First fetch the charity and tasks data
      try {
        const charityResponse = await axios.get(`/charities/${id}`);
        setCharity(charityResponse.data);
        
        // Set follower status
        if (charityResponse.data.is_following !== undefined) {
          setIsFollowing(charityResponse.data.is_following);
        }
        if (charityResponse.data.follower_count !== undefined) {
          setFollowerCount(charityResponse.data.follower_count);
        }
      } catch (err) {
        console.error('Error fetching charity:', err);
        setError('Failed to fetch charity details');
        setLoading(false);
        return;
      }
      
      try {
        const tasksResponse = await axios.get(`/charities/${id}/tasks`);
        setTasks(tasksResponse.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        // Don't set error here, just log it and continue
        setTasks([]);
      }
      
      // Fetch donations if user is authorized
      if (currentUser && (accountType === 'admin' || currentUser.ic_number === charity?.representative_id)) {
        try {
          const donationsRes = await axios.get(`/charity/${id}/donations`);
          setDonations(donationsRes.data);
        } catch (err) {
          console.error('Error fetching donations:', err);
          // Don't set error here, just log it and continue
          setDonations([]);
        }
      }

      // Fetch transactions if user is authorized
      if (currentUser && (accountType === 'admin' || currentUser.ic_number === charity?.representative_id)) {
        try {
          console.log(`Fetching transactions from: /charities/${id}/transactions`);
          const transactionsRes = await axios.get(`/charities/${id}/transactions`);
          console.log('Transactions response:', transactionsRes.data);
          setTransactions(transactionsRes.data);
        } catch (err) {
          console.error('Error fetching transactions:', err);
          if (err.response) {
            console.error('Error response status:', err.response.status);
            console.error('Error response data:', err.response.data);
          }
          // Don't set error here, just log it and continue
          setTransactions([]);
        }
      }
      
      // Get follow status
      if (currentUser) {
        try {
          console.log(`Fetching follow status from: /charities/${id}/follow-status`);
          const followStatusRes = await axios.get(`/charities/${id}/follow-status`);
          console.log('Follow status response:', followStatusRes.data);
          setIsFollowing(followStatusRes.data.is_following);
          setFollowerCount(followStatusRes.data.follower_count);
        } catch (err) {
          console.error('Error fetching follow status:', err);
          if (err.response) {
            console.error('Error response status:', err.response.status);
            console.error('Error response data:', err.response.data);
          }
          // Don't set error here, just log it and continue
        }
      }
    } catch (err) {
      console.error('Error fetching charity details:', err);
      setError('Failed to fetch charity details');
    } finally {
      setLoading(false);
    }
  };

  const canManageCharity = () => {
    return accountType === charity?.organization_id;
  };

  const calculateProgress = () => {
    if (!charity?.fund_targeted) return 0;
    return Math.min(100, (charity.fund_received / charity.fund_targeted) * 100);
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      setTaskDeleteLoading(true);
      await axios.delete(`/tasks/${taskId}`);
      // Remove the deleted task from the tasks array
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setTaskDeleteLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setFollowLoading(true);
      const response = await axios.post(`/charities/${id}/follow`);
      setIsFollowing(response.data.is_following);
      setFollowerCount(response.data.follower_count);
      toast.success(isFollowing ? 'Unfollowed successfully' : 'Following this charity');
    } catch (error) {
      console.error('Error toggling follow status:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: charity?.name,
        text: `Check out ${charity?.name} on our platform!`,
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback - copy URL to clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success('URL copied to clipboard!'))
        .catch(err => console.error('Error copying to clipboard:', err));
    }
  };

  const handleQuickDonate = (amount) => {
    setDonationAmount(amount);
    setShowDonationModal(true);
  };

  const submitDonation = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Validate the donation amount
    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }
    
    // Close the modal and navigate to the donation page
    setShowDonationModal(false);
    navigate(`/charities/${id}/donate?amount=${amount}`);
  };

  const formatCurrency = (amount) => {
    return typeof amount === 'number' ? amount.toLocaleString() : '0';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTimeRemaining = () => {
    if (!charity?.end_date) return null;
    
    const endDate = new Date(charity.end_date);
    const now = new Date();
    const timeRemaining = endDate - now;
    
    if (timeRemaining <= 0) return 'Ended';
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    return `${days} days left`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading charity details...</p>
        </div>
      </div>
    );
  }

  if (error || !charity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-md max-w-md">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">{error || 'Charity not found'}</h3>
          <p className="mt-2 text-gray-600">We couldn't find the charity you're looking for. It may have been removed or the URL might be incorrect.</p>
          <button
            onClick={() => navigate('/charities')}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Charities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <div>
                  <Link to="/charities" className="text-gray-400 hover:text-gray-500">
                    All Charities
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-700 truncate max-w-xs">
                    {charity?.name}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="relative h-80 lg:h-96">
            <img
              src={formatImageUrl(charity?.picture_path) || 'https://via.placeholder.com/800x600'}
              alt={charity?.name || 'Charity'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6 lg:p-8 w-full">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 mb-4">
                  <FaTag className="mr-2" />
                  {charity?.category || 'Uncategorized'}
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{charity?.name}</h1>
                
                {/* Verification Badge */}
                <div className="flex items-center mb-4">
                  {charity?.is_verified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FaCheckCircle className="mr-1" />
                      Verified Organization
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <FaExclamationTriangle className="mr-1" />
                      Pending Verification
                    </span>
                  )}
                  
                  {/* Time remaining */}
                  {getTimeRemaining() && (
                    <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <FaClock className="mr-1" />
                      {getTimeRemaining()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">About this charity</h2>
                <p className="text-gray-600 leading-relaxed">{charity?.description}</p>
              </div>

              {/* Quick Donate Buttons */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Donate</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[10, 25, 50, 100, 250, 500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleQuickDonate(amount)}
                      className="bg-white border border-gray-200 rounded-lg py-3 px-4 hover:bg-indigo-50 hover:border-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <span className="block text-lg font-semibold text-gray-900">${amount}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex items-center">
                  <div className="flex-1 mr-3">
                    <input
                      type="number"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      placeholder="Custom amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <button
                    onClick={() => navigate(`/charities/${id}/donate?amount=${donationAmount}`)}
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    disabled={!donationAmount}
                  >
                    Donate Now
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className={`flex-1 inline-flex justify-center items-center px-6 py-3 border text-base font-medium rounded-lg transition-colors ${
                    followLoading ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    isFollowing
                      ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      : 'border-transparent text-white bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {followLoading ? (
                    <div className="mr-2 h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  ) : isFollowing ? (
                    <FaHeart className="mr-2 text-red-500" />
                  ) : (
                    <FaHeart className="mr-2" />
                  )}
                  {isFollowing ? 'Following' : 'Follow'}
                </button>

                <button
                  onClick={handleShare}
                  className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <FaShare className="mr-2" />
                  Share
                </button>
              </div>

              {/* Tabs */}
              <div className="mt-8">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8">
                    <button
                      onClick={() => setActiveTab('milestones')}
                      className={`${
                        activeTab === 'milestones'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                      <div className="flex items-center">
                        <FaTasks className="mr-2" />
                        Milestones
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('transactions')}
                      className={`${
                        activeTab === 'transactions'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                      <div className="flex items-center">
                        <FaExchangeAlt className="mr-2" />
                        Transactions
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('about')}
                      className={`${
                        activeTab === 'about'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                      <div className="flex items-center">
                        <FaInfoCircle className="mr-2" />
                        About
                      </div>
                    </button>
                  </nav>
                </div>

                <div className="py-6">
                  {activeTab === 'milestones' && (
                    <div className="relative">
                      {tasks.length > 0 && (
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200"></div>
                      )}
                      
                      {/* Timeline Items */}
                      <div className="space-y-8">
                        {tasks.map((task, index) => (
                          <div key={task.id} className="relative pl-10">
                            {/* Timeline Point */}
                            <div className="absolute left-0 top-0 flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                task.status === 'completed' 
                                  ? 'bg-green-100 border-green-500 text-green-600' 
                                  : 'bg-blue-100 border-blue-500 text-blue-600'
                              }`}>
                                {task.status === 'completed' ? (
                                  <FaCheckCircle className="h-4 w-4" />
                                ) : (
                                  <FaClock className="h-4 w-4" />
                                )}
                              </div>
                            </div>
                            
                            {/* Task Content */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                              {/* Task header */}
                              <div className="p-4 border-b border-gray-100">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{task.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                                      <FaCalendarAlt className="mr-1" />
                                      {formatDate(task.created_at)}
                                    </p>
                                  </div>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    task.status === 'completed'
                                      ? 'bg-green-100 text-green-800'
                                      : task.status === 'in_progress'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {task.status === 'completed' && <FaCheckCircle className="mr-1" />}
                                    {task.status === 'in_progress' && <FaClock className="mr-1" />}
                                    {task.status?.charAt(0).toUpperCase() + task.status?.slice(1).replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Task body */}
                              <div className="p-4">
                                <p className="text-gray-600">{task.description}</p>
                                
                                {/* Task Image */}
                                {task.image && (
                                  <div className="mt-4 relative h-48 rounded-lg overflow-hidden">
                                    <img
                                      src={formatImageUrl(task.image)}
                                      alt={task.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                
                                {/* Progress Bar */}
                                {task.fund_targeted > 0 && (
                                  <div className="mt-4">
                                    <div className="flex justify-between text-sm mb-2">
                                      <span className="text-gray-500">Funding Progress</span>
                                      <span className="font-medium text-blue-600">
                                        ${formatCurrency(task.current_amount)} / ${formatCurrency(task.fund_targeted)}
                                      </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
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
                                
                                {/* Task Completion */}
                                {task.completed_at && (
                                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                    <div className="flex items-center">
                                      <FaCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                      <div>
                                        <span className="font-medium text-green-700">Completed</span>
                                        <span className="text-sm text-green-600 ml-2">
                                          {formatDate(task.completed_at)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {tasks.length === 0 && (
                          <div className="text-center py-8">
                            <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                              <FaTasks className="mx-auto h-12 w-12 text-gray-400" />
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
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      {transactions.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
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
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.map(transaction => (
                              <tr key={transaction.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(transaction.created_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                  {transaction.transaction_hash?.slice(0, 8) || transaction.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    transaction.type === 'donation' 
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {transaction.type === 'donation' ? (
                                      <FaHandHoldingHeart className="mr-1" />
                                    ) : (
                                      <FaExchangeAlt className="mr-1" />
                                    )}
                                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  ${formatCurrency(transaction.amount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    transaction.status === 'completed'
                                      ? 'bg-green-100 text-green-800'
                                      : transaction.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {transaction.status === 'completed' && <FaCheckCircle className="mr-1" />}
                                    {transaction.status === 'pending' && <FaClock className="mr-1" />}
                                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center py-8">
                          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                            <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No transactions yet</h3>
                            <p className="mt-2 text-sm text-gray-500">
                              This charity hasn't received any donations yet. Be the first to contribute!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'about' && (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Charity Details</h3>
                            <div className="space-y-4">
                              <div>
                                <span className="text-sm font-medium text-gray-500 block">Category</span>
                                <span className="text-gray-900">{charity.category || 'Not specified'}</span>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-500 block">Created On</span>
                                <span className="text-gray-900">{formatDate(charity.created_at)}</span>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-500 block">End Date</span>
                                <span className="text-gray-900">
                                  {charity.end_date ? formatDate(charity.end_date) : 'Ongoing'}
                                </span>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-500 block">Status</span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  charity.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : charity.status === 'completed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {charity.status === 'active' && <FaCheckCircle className="mr-1" />}
                                  {charity.status === 'completed' && <FaCheckCircle className="mr-1" />}
                                  {charity.status?.charAt(0).toUpperCase() + charity.status?.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Organization</h3>
                            <div className="space-y-4">
                              <div>
                                <span className="text-sm font-medium text-gray-500 block">Organization Name</span>
                                <Link to={`/organizations/${charity.organization_id}`} className="text-indigo-600 hover:text-indigo-800">
                                  {charity.organization_name || 'Unknown Organization'}
                                </Link>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-500 block">Representative</span>
                                <span className="text-gray-900">{charity.representative_name || 'Not specified'}</span>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-500 block">Contact Email</span>
                                <span className="text-gray-900">{charity.contact_email || 'Not provided'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Donation Progress */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Funding Progress</h3>
                
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-500">
                      {calculateProgress()}% Complete
                    </span>
                    <span className="font-medium text-gray-900">
                      ${formatCurrency(charity.fund_received)} / ${formatCurrency(charity.fund_targeted)}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500 mb-1">Donors</div>
                    <div className="text-2xl font-bold text-gray-900">{charity.donor_count || 0}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500 mb-1">Followers</div>
                    <div className="text-2xl font-bold text-gray-900">{followerCount}</div>
                  </div>
                </div>
                
                {/* CTA Button */}
                <button
                  onClick={() => navigate(`/charities/${id}/donate`)}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 flex items-center justify-center"
                >
                  <FaHandHoldingHeart className="mr-2" />
                  Donate Now
                </button>
                
                {/* Organization Link */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Organized by</h4>
                  <Link to={`/organizations/${charity.organization_id}`} className="flex items-center group">
                    <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                      <img
                        src={formatImageUrl(charity.organization_logo) || 'https://via.placeholder.com/40'}
                        alt={charity.organization_name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {charity.organization_name}
                      </span>
                      {charity.organization_verified && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <FaCheckCircle className="mr-1" />
                          Verified
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Donation</h3>
            <p className="text-gray-600 mb-4">
              You are about to donate ${donationAmount} to {charity.name}.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDonationModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitDonation}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Actions */}
      {canManageCharity() && (
        <div className="fixed bottom-6 right-6">
          <div className="flex flex-col space-y-3">
            <Link
              to={`/charities/${id}/edit`}
              className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
              title="Edit Charity"
            >
              <FaEdit className="h-6 w-6" />
            </Link>
            <Link
              to={`/charities/${id}/tasks/create`}
              className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
              title="Add Milestone"
            >
              <FaPlus className="h-6 w-6" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}