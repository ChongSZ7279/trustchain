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
  FaInfoCircle,
  FaThumbsUp,
  FaRegClock,
  FaChartBar,
  FaFileAlt,
  FaExternalLinkAlt
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
  const [refreshing, setRefreshing] = useState(false);

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
        } else {
          // Make another call to get all tasks for stats
          const allTasksResponse = await axios.get('/admin/verification/tasks', {
            params: { status: 'all' }
          });
          
          const pendingCount = allTasksResponse.data.filter(task => task.status === 'pending').length;
          const verifiedCount = allTasksResponse.data.filter(task => task.status === 'verified').length;
          const completedCount = allTasksResponse.data.filter(task => task.status === 'completed').length;
          
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
    setRefreshing(true);
    // Re-fetch data
    const fetchData = async () => {
      try {
        // Fetch tasks that need verification
        const tasksResponse = await axios.get('/admin/verification/tasks', {
          params: { status: filterStatus }
        });
        setTasks(tasksResponse.data);
        
        // Update stats
        const allTasksResponse = await axios.get('/admin/verification/tasks', {
          params: { status: 'all' }
        });
        
        const pendingCount = allTasksResponse.data.filter(task => task.status === 'pending').length;
        const verifiedCount = allTasksResponse.data.filter(task => task.status === 'verified').length;
        const completedCount = allTasksResponse.data.filter(task => task.status === 'completed').length;
        
        setStats({
          pending: pendingCount,
          verified: verifiedCount,
          completed: completedCount
        });
        
        toast.success('Data refreshed successfully');
      } catch (error) {
        console.error('Error refreshing data:', error);
        toast.error('Failed to refresh data');
      } finally {
        setRefreshing(false);
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

    // Update stats when a task status changes
    if (newStatus === 'verified') {
      setStats(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        verified: prev.verified + 1
      }));
    } else if (newStatus === 'completed') {
      setStats(prev => ({
        ...prev,
        verified: Math.max(0, prev.verified - 1),
        completed: prev.completed + 1
      }));
      
      // Remove from list if filtering by verified only
      if (filterStatus === 'verified') {
        setTasks(tasks.filter(task => task.id !== taskId));
      }
    }
  };

  // Handle status filter click
  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    setIsFilterOpen(false);
    setSearchTerm(''); // Clear search when changing filters
  };

  if (!user || !user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="bg-yellow-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto">
            <FaExclamationTriangle className="h-8 w-8 text-yellow-500" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-3 text-gray-600">You do not have permission to access this page.</p>
          <Link to="/" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5">
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
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${colors[status] || colors.all} border shadow-sm`}>
        {count}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <FaClipboardCheck className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold">Task Verification</h1>
                  <p className="text-sm text-indigo-100 mt-1">Review and approve task completion proofs</p>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center px-3 py-2 border border-white border-opacity-30 text-sm font-medium rounded-md text-white bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm"
                >
                  <FaSyncAlt className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh Data
                </button>
                <Link to="/admin/dashboard" className="inline-flex items-center px-3 py-2 border border-white border-opacity-30 text-sm font-medium rounded-md text-white bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 shadow-sm transform hover:-translate-y-0.5">
                  <FaArrowLeft className="mr-2" />
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-yellow-500 transform transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <FaRegClock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <button 
                onClick={() => handleStatusFilter('pending')}
                className={`text-sm font-medium ${filterStatus === 'pending' ? 'text-yellow-600' : 'text-gray-500 hover:text-yellow-600'}`}
              >
                {filterStatus === 'pending' ? 'Currently Viewing' : 'View Pending Tasks →'}
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-500 transform transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Verified Tasks</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.verified}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaThumbsUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <button 
                onClick={() => handleStatusFilter('verified')}
                className={`text-sm font-medium ${filterStatus === 'verified' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
              >
                {filterStatus === 'verified' ? 'Currently Viewing' : 'View Verified Tasks →'}
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-green-500 transform transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed Tasks</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <button 
                onClick={() => handleStatusFilter('completed')}
                className={`text-sm font-medium ${filterStatus === 'completed' ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}
              >
                {filterStatus === 'completed' ? 'Currently Viewing' : 'View Completed Tasks →'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaInfoCircle className="h-5 w-5 text-blue-600" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">About Transaction Hashes</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>When verifying tasks in development/testing mode, the system generates mock transaction hashes that won't appear on Scrollscan.</p>
                <p className="mt-1">In production, actual blockchain transactions will be generated and viewable on the blockchain explorer.</p>
                <div className="mt-3">
                  <button 
                    onClick={() => window.open("https://sepolia.scrollscan.com/address/0x7867fC939F10377E309a3BF55bfc194F672B0E84", "_blank")}
                    className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <FaExternalLinkAlt className="mr-2 h-4 w-4" />
                    View Contract on Scrollscan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white shadow-md rounded-lg mb-6 overflow-hidden">
          <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left Side: Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="flex items-center text-gray-700 font-medium">
                  <FaFileAlt className="mr-2 text-indigo-500" />
                  <span>Currently Viewing:</span>
                  <span className="ml-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                    {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Tasks
                  </span>
                </div>
                
                {/* Status Filter Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)} 
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    aria-label="Filter tasks by status"
                  >
                    <FaFilter className="mr-2 text-gray-500" />
                    <span>Change Filter</span>
                    <FaChevronDown className="ml-2 h-4 w-4 text-gray-500" />
                  </button>
                  
                  {isFilterOpen && (
                    <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 z-10 divide-y divide-gray-100">
                      <div className="py-1">
                        <button 
                          className={`w-full text-left px-4 py-2.5 text-sm ${filterStatus === 'pending' ? 'bg-indigo-50 text-indigo-800 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                          onClick={() => handleStatusFilter('pending')}
                        >
                          <div className="flex items-center">
                            <FaExclamationTriangle className={`mr-2 ${filterStatus === 'pending' ? 'text-yellow-500' : 'text-gray-400'}`} />
                            Pending Verification
                            <span className="ml-auto bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                              {stats.pending}
                            </span>
                          </div>
                        </button>
                        <button 
                          className={`w-full text-left px-4 py-2.5 text-sm ${filterStatus === 'verified' ? 'bg-indigo-50 text-indigo-800 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                          onClick={() => handleStatusFilter('verified')}
                        >
                          <div className="flex items-center">
                            <FaCheckCircle className={`mr-2 ${filterStatus === 'verified' ? 'text-blue-500' : 'text-gray-400'}`} />
                            Verified (Ready for Fund Release)
                            <span className="ml-auto bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                              {stats.verified}
                            </span>
                          </div>
                        </button>
                        <button 
                          className={`w-full text-left px-4 py-2.5 text-sm ${filterStatus === 'completed' ? 'bg-indigo-50 text-indigo-800 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                          onClick={() => handleStatusFilter('completed')}
                        >
                          <div className="flex items-center">
                            <FaCheckCircle className={`mr-2 ${filterStatus === 'completed' ? 'text-green-500' : 'text-gray-400'}`} />
                            Completed (Funds Released)
                            <span className="ml-auto bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                              {stats.completed}
                            </span>
                          </div>
                        </button>
                        <button 
                          className={`w-full text-left px-4 py-2.5 text-sm ${filterStatus === 'all' ? 'bg-indigo-50 text-indigo-800 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                          onClick={() => handleStatusFilter('all')}
                        >
                          <div className="flex items-center">
                            <FaListAlt className={`mr-2 ${filterStatus === 'all' ? 'text-indigo-500' : 'text-gray-400'}`} />
                            All Tasks
                            <span className="ml-auto bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                              {stats.pending + stats.verified + stats.completed}
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right Side: Search Box */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                  placeholder="Search tasks or charities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search tasks or charities"
                />
                {searchTerm && (
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                    onClick={() => setSearchTerm('')}
                    aria-label="Clear search"
                  >
                    <span className="h-5 w-5 text-gray-400 hover:text-gray-600 flex items-center justify-center rounded-full bg-gray-100">×</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Search Stats */}
            {searchTerm && (
              <div className="mt-4 px-4 py-2 bg-indigo-50 rounded-md border border-indigo-100 shadow-sm">
                <div className="flex items-center">
                  <FaInfoCircle className="text-indigo-500 mr-2" />
                  <span className="text-sm text-indigo-700">
                    Found {filteredTasks.length} result{filteredTasks.length !== 1 ? 's' : ''} for "{searchTerm}"
                  </span>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="ml-auto text-xs px-2 py-1 bg-white text-indigo-600 rounded-md border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-colors duration-200"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-4 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-700 text-lg font-medium">Loading verification tasks...</p>
            <p className="mt-2 text-gray-500 text-sm">Retrieving the latest task information</p>
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
              <div className="bg-white shadow-md rounded-lg p-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 text-gray-400 mb-4">
                  {searchTerm ? (
                    <FaSearch className="h-10 w-10" />
                  ) : (
                    <FaCheckCircle className="h-10 w-10" />
                  )}
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">No tasks found</h3>
                <p className="mt-3 text-gray-600 max-w-lg mx-auto">
                  {searchTerm
                    ? "No tasks match your search criteria. Try using different keywords or clear your search."
                    : `There are currently no tasks with status "${filterStatus}". Try selecting a different status filter.`}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      <FaSearch className="mr-2 text-gray-400" />
                      Clear Search
                    </button>
                  )}
                  {filterStatus !== 'all' && (
                    <button
                      onClick={() => handleStatusFilter('all')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      <FaListAlt className="mr-2 text-gray-400" />
                      View All Tasks
                    </button>
                  )}
                  {filterStatus === 'all' && tasks.length === 0 && (
                    <div className="inline-flex items-center px-4 py-3 bg-indigo-50 rounded-md text-sm text-indigo-700">
                      <FaInfoCircle className="mr-2" />
                      No tasks are currently available in the system
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Pagination Placeholder - Can be implemented with real pagination */}
        {filteredTasks.length > 10 && (
          <div className="mt-8 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-indigo-50 text-sm font-medium text-indigo-600">1</a>
              <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">2</a>
              <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </a>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}