import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import TaskVerificationCard from './TaskVerificationCard';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaFilter,
  FaSearch,
  FaSyncAlt,
  FaTasks,
  FaDatabase
} from 'react-icons/fa';

export default function AdminVerificationPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.is_admin) {
      toast.error('You do not have permission to access this page');
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.is_admin) return;

      setLoading(true);
      try {
        console.log('Fetching verification data with status:', filterStatus);

        // Fetch tasks that need verification
        const tasksResponse = await axios.get('/admin/verification/tasks', {
          params: { status: filterStatus }
        });
        console.log('Tasks API response:', tasksResponse.data);
        setTasks(tasksResponse.data);
      } catch (error) {
        console.error('Error fetching verification data:', error);
        toast.error('Failed to load verification data: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, filterStatus]);

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // Re-fetch data
    const fetchData = async () => {
      try {
        // Fetch tasks that need verification
        const tasksResponse = await axios.get('/admin/verification/tasks', {
          params: { status: filterStatus }
        });
        setTasks(tasksResponse.data);
        console.log('Tasks response:', tasksResponse.data);

        toast.success('Data refreshed');
      } catch (error) {
        console.error('Error refreshing data:', error);
        toast.error('Failed to refresh data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  };



  // Debug function to test API directly
  const handleDebugTest = async () => {
    try {
      // Use toast.success instead of toast.info which might not be available
      toast.success('Testing API endpoints...');

      // Test the non-auth endpoint
      const testResponse = await axios.get('/check-verification-tables');
      console.log('Test API response:', testResponse.data);

      // Show counts in toast
      toast.success(
        `API Test Results: Tasks: ${testResponse.data.tasks_count}, Pending Tasks: ${testResponse.data.pending_tasks_sample.length}, Verified Tasks: ${testResponse.data.verified_tasks_sample.length}`
      );

      // Update state with the test data
      if (testResponse.data.pending_tasks_sample.length > 0) {
        setTasks(testResponse.data.pending_tasks_sample);
      }

    } catch (error) {
      console.error('Debug test error:', error);
      toast.error('Debug test failed: ' + (error.response?.data?.message || error.message));
    }
  };

  // Filter items based on search term
  const filteredTasks = tasks.filter(task =>
    task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.charity?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle task verification status update
  const handleTaskStatusUpdate = (taskId, newStatus) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));

    if (newStatus === 'completed') {
      // Remove from list if filtering by verified only
      if (filterStatus === 'verified') {
        setTasks(tasks.filter(task => task.id !== taskId));
      }
    }
  };

  if (!user || !user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h2>
          <p className="mt-1 text-sm text-gray-500">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Verification Panel</h1>
          <div className="flex space-x-2">
            <button
              onClick={handleDebugTest}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Debug Test
            </button>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              <FaSyncAlt className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search by name or charity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FaFilter className="mr-2 text-gray-500" />
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="pending">Pending Verification</option>
                  <option value="verified">Verified (Ready for Fund Release)</option>
                  <option value="completed">Completed (Funds Released)</option>
                  <option value="all">All</option>
                </select>
              </div>

              <div className="flex space-x-2">
                <div className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700">
                  <FaTasks className="inline mr-2" />
                  Tasks ({tasks.length})
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <TaskVerificationCard
                  key={task.id}
                  task={task}
                  onStatusUpdate={handleTaskStatusUpdate}
                />
              ))
            ) : (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <FaCheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No tasks to verify</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm
                    ? "No tasks match your search criteria."
                    : `No tasks with status "${filterStatus}" found.`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
