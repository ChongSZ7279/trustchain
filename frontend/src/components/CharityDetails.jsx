import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils/helpers';
import TaskMediaDisplay from './TaskMediaDisplay';
import DonationForm from './DonationForm';
import TaskFundingForm from './TaskFundingForm';

export default function CharityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  const [charity, setCharity] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskPictures, setTaskPictures] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [selectedTaskForFunding, setSelectedTaskForFunding] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'tasks', 'transactions'

  useEffect(() => {
    const fetchCharityAndTasks = async () => {
      try {
        setLoading(true);
        const charityResponse = await axios.get(`/api/charities/${id}`);
        setCharity(charityResponse.data);

        const tasksResponse = await axios.get(`/api/charities/${id}/tasks`);
        setTasks(tasksResponse.data);

        // Fetch pictures for each task
        const picturesData = {};
        for (const task of tasksResponse.data) {
          try {
            const picturesResponse = await axios.get(`/api/tasks/${task.id}/pictures`);
            picturesData[task.id] = picturesResponse.data || [];
          } catch (err) {
            console.error(`Error fetching pictures for task ${task.id}:`, err);
            picturesData[task.id] = [];
          }
        }
        setTaskPictures(picturesData);
        
        // Fetch transactions for this charity
        const transactionsResponse = await axios.get(`/api/charities/${id}/transactions`);
        setTransactions(transactionsResponse.data);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load charity details');
      } finally {
        setLoading(false);
      }
    };

    fetchCharityAndTasks();
  }, [id]);

  const canManageCharity = () => {
    if (!charity || !user) return false;
    return organization?.id === charity.organization_id || 
           charity.organization.representative_id === user.ic_number;
  };

  const calculateProgress = () => {
    if (!charity) return 0;
    return (charity.fund_received / charity.fund_targeted) * 100;
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this charity?')) {
      return;
    }

    try {
      await axios.delete(`/api/charities/${id}`);
      navigate('/charities');
    } catch (err) {
      setError('Failed to delete charity');
      console.error('Error deleting charity:', err);
    }
  };

  const handleDonationSuccess = (transaction) => {
    setTransactions([transaction, ...transactions]);
    setShowDonationForm(false);
    // Update charity fund received
    setCharity({
      ...charity,
      fund_received: parseFloat(charity.fund_received) + parseFloat(transaction.amount)
    });
  };

  const handleTaskFundingSuccess = (transaction) => {
    setTransactions([transaction, ...transactions]);
    setSelectedTaskForFunding(null);
    // Update task fund received
    const updatedTasks = tasks.map(task => {
      if (task.id === transaction.task_id) {
        return {
          ...task,
          fund_received: parseFloat(task.fund_received) + parseFloat(transaction.amount)
        };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  // Format date to a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!charity) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Charity not found</h2>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = organization && organization.id === charity.organization_id;

  // Helper function to determine file type
  const getFileType = (path) => {
    if (!path) return 'unknown';
    const extension = path.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['pdf'].includes(extension)) return 'pdf';
    if (['doc', 'docx'].includes(extension)) return 'document';
    return 'unknown';
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 text-red-600">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{charity.name}</h2>
              <div className="space-x-4">
                {user && (
                  <button
                    onClick={() => setShowDonationForm(!showDonationForm)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    {showDonationForm ? 'Cancel Donation' : 'Donate Now'}
                  </button>
                )}
                {isOwner && (
                  <>
                    <Link
                      to={`/charities/${charity.id}/edit`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {showDonationForm && (
            <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
              <DonationForm 
                charityId={charity.id} 
                charityName={charity.name} 
                onSuccess={handleDonationSuccess} 
              />
            </div>
          )}

          <div className="border-t border-gray-200">
            <div className="px-4 py-3 bg-gray-50">
              <nav className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'details'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'tasks'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Tasks
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'transactions'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Transactions
                </button>
              </nav>
            </div>

            {activeTab === 'details' && (
              <dl>
                {charity.picture_path && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Picture</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <img
                        src={formatImageUrl(charity.picture_path)}
                        alt={charity.name}
                        className="h-48 w-auto object-cover rounded-lg"
                      />
                    </dd>
                  </div>
                )}
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Category</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{charity.category}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{charity.description}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Objective</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{charity.objective}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Target Fund</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${charity.fund_targeted}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Funds Raised</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center">
                      <span className="mr-2">${charity.fund_received} of ${charity.fund_targeted}</span>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full" 
                          style={{ width: `${Math.min(calculateProgress(), 100)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2">{Math.round(calculateProgress())}%</span>
                    </div>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Organization</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <Link
                      to={`/organizations/${charity.organization.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {charity.organization.name}
                    </Link>
                  </dd>
                </div>
              </dl>
            )}

            {activeTab === 'tasks' && (
              <div className="px-4 py-5 sm:px-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Tasks</h3>
                  {isOwner && (
                    <Link
                      to={`/charities/${charity.id}/tasks/create`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Add Task
                    </Link>
                  )}
                </div>

                {tasks.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {tasks.map((task) => (
                      <li key={task.id} className="py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-gray-900">{task.name}</h4>
                              <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                              <div className="mt-2 flex items-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                  Target: ${task.fund_targeted}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                                  Raised: ${task.fund_received || 0}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4 flex items-center space-x-4">
                              {user && (
                                <button
                                  onClick={() => setSelectedTaskForFunding(task)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                >
                                  Fund Task
                                </button>
                              )}
                              {isOwner && (
                                <>
                                  <Link
                                    to={`/tasks/${task.id}/pictures`}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    Manage Pictures
                                  </Link>
                                  <Link
                                    to={`/tasks/${task.id}/edit`}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    Edit
                                  </Link>
                                  <button
                                    onClick={async () => {
                                      if (window.confirm('Are you sure you want to delete this task?')) {
                                        try {
                                          await axios.delete(`/api/tasks/${task.id}`);
                                          setTasks(tasks.filter(t => t.id !== task.id));
                                        } catch (err) {
                                          console.error('Error deleting task:', err);
                                          setError('Failed to delete task');
                                        }
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {selectedTaskForFunding && selectedTaskForFunding.id === task.id && (
                            <div className="mt-4">
                              <TaskFundingForm 
                                taskId={task.id} 
                                taskName={task.name} 
                                charityId={charity.id}
                                onSuccess={handleTaskFundingSuccess} 
                              />
                            </div>
                          )}
                          
                          <div className="mt-4">
                            <TaskMediaDisplay taskId={task.id} proof={task.proof_document_path} />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No tasks found for this charity</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Transaction History</h3>
                
                {transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            From
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(transaction.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                transaction.type === 'charity' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {transaction.type === 'charity' ? 'Charity Donation' : 'Task Funding'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${transaction.amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {transaction.from_user ? (
                                <Link to={`/users/${transaction.from_user.id}`} className="text-indigo-600 hover:text-indigo-900">
                                  {transaction.from_user.name}
                                </Link>
                              ) : (
                                'Anonymous'
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                                transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Link to={`/transactions/${transaction.id}`} className="text-indigo-600 hover:text-indigo-900">
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No transactions found for this charity</p>
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