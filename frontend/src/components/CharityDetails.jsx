import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils/helpers';

export default function CharityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  const [charity, setCharity] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCharityAndTasks = async () => {
      try {
        const [charityRes, tasksRes] = await Promise.all([
          axios.get(`/api/charities/${id}`),
          axios.get(`/api/charities/${id}/tasks`)
        ]);
        setCharity(charityRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        setError('Failed to fetch charity details');
        console.error('Error fetching charity details:', err);
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

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 text-red-600">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{charity.name}</h2>
              {isOwner && (
                <div className="space-x-4">
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
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-gray-200">
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
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Tasks</h3>
            {isOwner && (
              <Link
                to={`/charities/${charity.id}/tasks/create`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add Task
              </Link>
            )}
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {tasks.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <li key={task.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">{task.name}</h4>
                        <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Target: ${task.fund_targeted}
                          </span>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      {isOwner && (
                        <div className="ml-4 flex items-center space-x-4">
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
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                No tasks available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 