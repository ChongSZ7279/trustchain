import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import { 
  FaShieldAlt, 
  FaBuilding, 
  FaTasks, 
  FaHandshake, 
  FaChartLine,
  FaExclamationTriangle,
  FaUser
} from 'react-icons/fa';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    organizations: {
      verified: '--',
      total: '--'
    },
    charities: {
      verified: '--',
      total: '--'
    },
    tasks: {
      completed: '--',
      total: '--'
    },
    funds: {
      released: '--'
    }
  });
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch stats data
  useEffect(() => {
    const fetchStats = async () => {
      if (!user || !user.is_admin) return;
      
      try {
        setLoading(true);
        
        const response = await api.get('/admin/verification/stats');
        
        console.log('Stats response:', response.data);
        
        if (response.data) {
          setStats({
            organizations: {
              verified: response.data.organizations?.verified || 0,
              total: response.data.organizations?.total || 0
            },
            charities: {
              verified: response.data.charities?.verified || 0,
              total: response.data.charities?.total || 0
            },
            tasks: {
              completed: response.data.tasks?.completed || 0,
              total: response.data.tasks?.total || 0
            },
            funds: {
              released: response.data.funds?.released || 0
            }
          });
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user]);

  if (!user || !user.is_admin) {
    return null;
  }

  const adminFeatures = [
    {
      title: 'Task Verification',
      description: 'Review and approve task completion proofs to release funds to charities',
      icon: <FaTasks className="h-6 w-6 text-white" />,
      link: '/admin/verification/tasks',
      color: 'from-indigo-600 to-indigo-700',
      hoverColor: 'from-indigo-700 to-indigo-800'
    },
    {
      title: 'Organization Verification',
      description: 'Verify organization registration documents for platform approval',
      icon: <FaBuilding className="h-6 w-6 text-white" />,
      link: '/admin/verification/organizations',
      color: 'from-emerald-600 to-emerald-700',
      hoverColor: 'from-emerald-700 to-emerald-800'
    },
    {
      title: 'Charity Verification',
      description: 'Verify charity registration documents and eligibility',
      icon: <FaHandshake className="h-6 w-6 text-white" />,
      link: '/admin/verification/charities',
      color: 'from-blue-600 to-blue-700',
      hoverColor: 'from-blue-700 to-blue-800'
    },
    {
      title: 'User Verification',
      description: 'Verify user identity and documentation for enhanced trust',
      icon: <FaUser className="h-6 w-6 text-white" />,
      link: '/admin/verification/users',
      color: 'from-purple-600 to-purple-700',
      hoverColor: 'from-purple-700 to-purple-800'
    }
  ];

  // Calculate percentages for progress bars
  const orgPercentage = stats.organizations.total > 0 
    ? Math.round((stats.organizations.verified / stats.organizations.total) * 100) 
    : 0;
    
  const charityPercentage = stats.charities.total > 0 
    ? Math.round((stats.charities.verified / stats.charities.total) * 100) 
    : 0;
    
  const taskPercentage = stats.tasks.total > 0 
    ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) 
    : 0;

  // Check for pending items that need attention
  const pendingOrgs = stats.organizations.total - stats.organizations.verified;
  const pendingCharities = stats.charities.total - stats.charities.verified;
  const pendingTasks = stats.tasks.total - stats.tasks.completed;
  const hasPendingItems = pendingOrgs > 0 || pendingCharities > 0 || pendingTasks > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-800 pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-white bg-opacity-20 mb-4">
              <FaShieldAlt className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-indigo-100 text-lg">
              Monitor and manage TrustChain platform operations
            </p>
          </div>
          
          {hasPendingItems && (
            <div className="mt-6 md:mt-0 bg-white bg-opacity-10 rounded-lg p-4 border border-white border-opacity-20">
              <div className="flex items-center">
                <FaExclamationTriangle className="h-6 w-6 text-yellow-300 mr-3" />
                <div>
                  <h3 className="text-white font-medium">Items Requiring Attention</h3>
                  <div className="text-indigo-100 text-sm mt-1">
                    {pendingOrgs > 0 && <p>{pendingOrgs} organizations pending verification</p>}
                    {pendingCharities > 0 && <p>{pendingCharities} charities pending verification</p>}
                    {pendingTasks > 0 && <p>{pendingTasks} tasks pending review</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Verified Organizations</p>
                  <div className="flex items-end mt-1">
                    <p className="text-2xl font-bold text-gray-900">{stats.organizations.verified}</p>
                    <p className="text-sm text-gray-600 ml-1 mb-1">/ {stats.organizations.total}</p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FaBuilding className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${orgPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{orgPercentage}% verified</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Verified Charities</p>
                  <div className="flex items-end mt-1">
                    <p className="text-2xl font-bold text-gray-900">{stats.charities.verified}</p>
                    <p className="text-sm text-gray-600 ml-1 mb-1">/ {stats.charities.total}</p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaHandshake className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${charityPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{charityPercentage}% verified</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completed Tasks</p>
                  <div className="flex items-end mt-1">
                    <p className="text-2xl font-bold text-gray-900">{stats.tasks.completed}</p>
                    <p className="text-sm text-gray-600 ml-1 mb-1">/ {stats.tasks.total}</p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <FaTasks className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${taskPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{taskPercentage}% completed</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Funds Released</p>
                  <div className="flex items-end mt-1">
                    <p className="text-2xl font-bold text-gray-900">{stats.funds.released}</p>
                    <p className="text-sm text-gray-600 ml-1 mb-1">SCROLL</p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FaChartLine className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full w-full"></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Total released funds</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Features */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Admin Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminFeatures.map((feature, index) => (
              <Link 
                key={index} 
                to={feature.link}
                className="group block"
              >
                <div className={`rounded-lg shadow-sm overflow-hidden bg-gradient-to-br ${feature.color} group-hover:${feature.hoverColor} transition-all duration-200 transform group-hover:-translate-y-1 group-hover:shadow-md`}>
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="bg-white bg-opacity-20 rounded-full p-3">
                        {feature.icon}
                      </div>
                      <h3 className="ml-4 text-xl font-medium text-white">{feature.title}</h3>
                    </div>
                    <p className="mt-4 text-base text-white text-opacity-90">
                      {feature.description}
                    </p>
                    <div className="mt-4 flex justify-end">
                      <span className="text-white text-sm font-medium">
                        Access {feature.title} →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}