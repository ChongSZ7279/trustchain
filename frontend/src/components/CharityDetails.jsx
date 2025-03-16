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
  FaUsers
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
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-gray-500 mb-6">
          <Link to="/charities" className="hover:text-gray-700 flex items-center">
            <FaArrowLeft className="mr-2" />
            Back to Charities
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{charity.name}</span>
        </nav>

        {/* Activity Image and Details Section */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
          {charity.picture_path && (
            <div className="w-full h-96 relative">
              <img
                src={formatImageUrl(charity.picture_path)}
                alt={charity.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{charity.name}</h1>
                <div className="mt-2 flex items-center">
                  <FaTag className="text-gray-400 mr-2" />
                  <span className="text-gray-600">{charity.category}</span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <FaUsers className="mr-1.5" />
                  <span>{followerCount} {followerCount === 1 ? 'Follower' : 'Followers'}</span>
                </div>
              </div>
              <div className="flex space-x-3">
                {user && (
                  <button
                    onClick={handleToggleFollow}
                    className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                      isFollowing
                        ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        : 'border-transparent text-white bg-indigo-600 hover:bg-indigo-700'
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
                )}
                {canManageCharity() && (
                  <Link
                    to={`/charities/${id}/edit`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <FaEdit className="mr-2" />
                    Edit Charity
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FaBullseye className="mr-2 text-gray-400" />
                Description
              </h3>
              <p className="mt-2 text-gray-600 whitespace-pre-line">{charity.description}</p>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <FaMoneyBillWave className="text-gray-400 mr-2" />
                  <span className="text-gray-900 font-medium">
                    ${charity.fund_received} raised of ${charity.fund_targeted} goal
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {calculateProgress()}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`${
                  activeTab === 'tasks'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-center inline-flex items-center justify-center`}
              >
                <FaTasks className="mr-2" />
                Tasks
              </button>
              <button
                onClick={() => setActiveTab('donations')}
                className={`${
                  activeTab === 'donations'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-center inline-flex items-center justify-center`}
              >
                <FaHandHoldingHeart className="mr-2" />
                Donations
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`${
                  activeTab === 'transactions'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-center inline-flex items-center justify-center`}
              >
                <FaExchangeAlt className="mr-2" />
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`${
                  activeTab === 'documents'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-center inline-flex items-center justify-center`}
              >
                <FaFileAlt className="mr-2" />
                Documents
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
                  {canManageCharity() && (
                    <Link
                      to={`/charities/${id}/tasks/create`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <FaPlus className="mr-2" />
                      Create Task
                    </Link>
                  )}
                </div>

                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <FaTasks className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating a new task.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {tasks.map(task => (
                      <div key={task.id} className="bg-white border rounded-lg overflow-hidden shadow-sm">
                        {task.image && (
                          <img
                            src={formatImageUrl(task.image)}
                            alt={task.name}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h3 className="text-lg font-medium text-gray-900">{task.name}</h3>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
                          
                          <div className="mt-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Progress</span>
                              <span className="text-gray-900 font-medium">
                                ${task.current_amount} / ${task.fund_targeted}
                              </span>
                            </div>
                            <div className="mt-2 relative">
                              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                                <div
                                  style={{
                                    width: `${Math.min(
                                      (task.current_amount / task.fund_targeted) * 100,
                                      100
                                    )}%`,
                                  }}
                                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                                ></div>
                              </div>
                            </div>
                          </div>

                          {canManageCharity() && (
                            <div className="mt-4 flex items-center justify-between">
                              <Link
                                to={`/tasks/${task.id}/pictures`}
                                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900"
                              >
                                <FaImages className="mr-1" />
                                Manage Pictures
                              </Link>
                              <div className="flex items-center space-x-2">
                                <Link
                                  to={`/tasks/${task.id}/edit`}
                                  className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900"
                                >
                                  <FaEdit className="mr-1" />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-900"
                                >
                                  <FaTrash className="mr-1" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Donations Tab */}
            {activeTab === 'donations' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Donations</h2>
                {donations.length === 0 ? (
                  <div className="text-center py-12">
                    <FaHandHoldingHeart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No donations yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Be the first to support this charity.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Donor
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
                        {donations.map(donation => (
                          <tr key={donation.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {donation.donor_name || 'Anonymous'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${donation.amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(donation.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                donation.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {donation.status === 'completed' ? (
                                  <FaCheckCircle className="mr-1" />
                                ) : (
                                  <FaClock className="mr-1" />
                                )}
                                {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Transactions</h2>
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Transaction history will appear here.
                    </p>
                  </div>
                ) : (
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
                          <tr key={transaction.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                              {transaction.transaction_hash || transaction.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${transaction.amount}
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
                                {transaction.status === 'completed' ? (
                                  <FaCheckCircle className="mr-1" />
                                ) : (
                                  <FaClock className="mr-1" />
                                )}
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Documents</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {charity.documents?.map((doc, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <FaFileAlt className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {doc.name || `Document ${index + 1}`}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <a
                            href={formatImageUrl(doc.file_path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                          >
                            View
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!charity.documents || charity.documents.length === 0) && (
                    <div className="sm:col-span-2 text-center py-12">
                      <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        No documents have been uploaded yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 