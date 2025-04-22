import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  FaArrowLeft,
  FaClipboardCheck,
  FaListAlt,
  FaChevronDown,
  FaBell,
  FaInfoCircle
} from 'react-icons/fa';

export default function AdminVerificationPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    completed: 0
  });

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
        // Fetch tasks that need verification
        const tasksResponse = await axios.get('/admin/verification/tasks', {
          params: { status: filterStatus }
        });
        setTasks(tasksResponse.data);
        
        // Calculate stats if we get full data
        if (filterStatus === 'all') {
          const pendingCount = tasksResponse.data.filter(task => task.status === 'pending').length;
          const verifiedCount = tasksResponse.data.filter(task => task.status === 'verified').length;
          const completedCount = tasksResponse.data.filter(task => task.status === 'completed').length;
          
          setStats({
            pending: pendingCount,
            verified: verifiedCount,
            completed: completedCount
          });
        }
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

  // Filter items based on search term
  const filteredTasks = tasks.filter(task =>
    task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.charity?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You do not have permission to access this page.</p>
          <Link to="/" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5">
            <FaArrowLeft className="mr-2" />
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (count, status) => {
    let colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      verified: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      all: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${colors[status] || colors.all} border shadow-sm`}>
        {count}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaClipboardCheck className="h-10 w-10 text-indigo-600" />
                <div className="ml-3">
                  <h1 className="text-2xl font-bold text-gray-900">Task Verification</h1>
                  <p className="text-sm text-gray-500 mt-1">Review and verify task completion proofs</p>
                </div>
              </div>
              <Link to="/admin/dashboard" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm transform hover:-translate-y-0.5">
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls Section */}
        <div className="bg-white shadow rounded-lg mb-8 overflow-hidden transition-all duration-300">
          <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <FaListAlt className="mr-2 text-indigo-600" />
              Verification Queue
            </h2>
            <p className="mt-1 text-sm text-gray-500">Review and verify task completion proofs to release funds to charities.</p>
          </div>
          
          <div className="p-5 bg-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Search Box */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                  placeholder="Search tasks or charities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Dropdown */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)} 
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    <FaFilter className="mr-2 text-gray-500" />
                    <span>Status: </span>
                    <span className="font-semibold ml-1">{filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}</span>
                    <FaChevronDown className="ml-2 h-4 w-4 text-gray-500" />
                  </button>
                  
                  {isFilterOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 z-10 divide-y divide-gray-100">
                      <div className="py-1">
                        <button 
                          className={`w-full text-left px-4 py-2 text-sm ${filterStatus === 'pending' ? 'bg-indigo-50 text-indigo-800 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                          onClick={() => {
                            setFilterStatus('pending');
                            setIsFilterOpen(false);
                          }}
                        >
                          <div className="flex items-center">
                            <FaExclamationTriangle className={`mr-2 ${filterStatus === 'pending' ? 'text-yellow-500' : 'text-gray-400'}`} />
                            Pending Verification
                          </div>
                        </button>
                        <button 
                          className={`w-full text-left px-4 py-2 text-sm ${filterStatus === 'verified' ? 'bg-indigo-50 text-indigo-800 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                          onClick={() => {
                            setFilterStatus('verified');
                            setIsFilterOpen(false);
                          }}
                        >
                          <div className="flex items-center">
                            <FaCheckCircle className={`mr-2 ${filterStatus === 'verified' ? 'text-blue-500' : 'text-gray-400'}`} />
                            Verified (Ready for Fund Release)
                          </div>
                        </button>
                        <button 
                          className={`w-full text-left px-4 py-2 text-sm ${filterStatus === 'completed' ? 'bg-indigo-50 text-indigo-800 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                          onClick={() => {
                            setFilterStatus('completed');
                            setIsFilterOpen(false);
                          }}
                        >
                          <div className="flex items-center">
                            <FaCheckCircle className={`mr-2 ${filterStatus === 'completed' ? 'text-green-500' : 'text-gray-400'}`} />
                            Completed (Funds Released)
                          </div>
                        </button>
                        <button 
                          className={`w-full text-left px-4 py-2 text-sm ${filterStatus === 'all' ? 'bg-indigo-50 text-indigo-800 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                          onClick={() => {
                            setFilterStatus('all');
                            setIsFilterOpen(false);
                          }}
                        >
                          <div className="flex items-center">
                            <FaListAlt className={`mr-2 ${filterStatus === 'all' ? 'text-indigo-500' : 'text-gray-400'}`} />
                            All
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:-translate-y-0.5"
                  disabled={loading}
                >
                  <FaSyncAlt className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
            
            {/* Stats Bar */}
            <div className="mt-5 flex flex-wrap gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="px-4 py-2 bg-white rounded-md border border-gray-200 shadow-sm flex items-center">
                <FaTasks className="mr-2 text-indigo-500" />
                <span className="text-sm font-medium text-gray-700">Tasks in Queue:</span>
                <span className="ml-2">{getStatusBadge(tasks.length, filterStatus)}</span>
              </div>
              <div className="px-4 py-2 bg-white rounded-md border border-gray-200 shadow-sm flex items-center">
                <FaSearch className="mr-2 text-indigo-500" />
                <span className="text-sm font-medium text-gray-700">Search Results:</span>
                <span className="ml-2">{getStatusBadge(filteredTasks.length, 'all')}</span>
              </div>
              
              {searchTerm && (
                <div className="px-4 py-2 bg-white rounded-md border border-indigo-200 shadow-sm flex items-center ml-auto">
                  <FaInfoCircle className="mr-2 text-indigo-500" />
                  <span className="text-sm text-indigo-700">Filtering by: "{searchTerm}"</span>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-indigo-500 hover:text-indigo-700 focus:outline-none"
                  >
                    <span className="text-xs">×</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="mt-4 text-gray-500 text-lg">Loading verification tasks...</p>
            <p className="mt-2 text-gray-400 text-sm">This may take a moment</p>
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
              <div className="bg-white shadow rounded-lg p-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-300 mb-4">
                  <FaCheckCircle className="h-10 w-10" />
                </div>
                <h3 className="mt-2 text-xl font-medium text-gray-900">No tasks to verify</h3>
                <p className="mt-2 text-gray-500 max-w-md mx-auto">
                  {searchTerm
                    ? "No tasks match your search criteria. Try using different keywords or clear your search."
                    : `No tasks with status "${filterStatus}" found. Try selecting a different status filter.`}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      <FaSearch className="mr-2 text-gray-400" />
                      Clear Search
                    </button>
                  )}
                  <button
                    onClick={() => setFilterStatus('all')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    <FaFilter className="mr-2 text-gray-400" />
                    View All Tasks
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    <FaSyncAlt className="mr-2" />
                    Refresh Data
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
