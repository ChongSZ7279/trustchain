import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import { FaShieldAlt, FaBuilding, FaTasks, FaHandshake } from 'react-icons/fa';

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
      description: 'Verify task completion proofs and release funds to charities',
      icon: <FaTasks className="h-8 w-8 text-indigo-600" />,
      link: '/admin/verification',
      color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
    },
    {
      title: 'Organization Verification',
      description: 'Review and verify organization and charity registration documents',
      icon: <FaBuilding className="h-8 w-8 text-green-600" />,
      link: '/admin/verification/organizations',
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <FaShieldAlt className="mx-auto h-12 w-12 text-indigo-600" />
          <h1 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Admin Dashboard
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Manage and monitor TrustChain platform operations
          </p>
        </div>

        <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {adminFeatures.map((feature, index) => (
            <Link 
              key={index} 
              to={feature.link}
              className={`rounded-lg shadow-sm overflow-hidden border ${feature.color} transform transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}
            >
              <div className="p-6">
                <div className="flex items-center">
                  {feature.icon}
                  <h3 className="ml-4 text-xl font-medium text-gray-900">{feature.title}</h3>
                </div>
                <p className="mt-4 text-base text-gray-600">
                  {feature.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FaHandshake className="mr-2 text-indigo-500" />
              Quick Stats
            </h3>
          </div>
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <p className="text-sm font-medium text-green-800">Verified Organizations</p>
                <p className="mt-1 text-3xl font-semibold text-green-600">
                  {stats.organizations.verified}
                  <span className="text-sm text-green-500 ml-1">/ {stats.organizations.total}</span>
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-sm font-medium text-blue-800">Verified Charities</p>
                <p className="mt-1 text-3xl font-semibold text-blue-600">
                  {stats.charities.verified}
                  <span className="text-sm text-blue-500 ml-1">/ {stats.charities.total}</span>
                </p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                <p className="text-sm font-medium text-indigo-800">Completed Tasks</p>
                <p className="mt-1 text-3xl font-semibold text-indigo-600">
                  {stats.tasks.completed}
                  <span className="text-sm text-indigo-500 ml-1">/ {stats.tasks.total}</span>
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <p className="text-sm font-medium text-purple-800">Total Funds Released</p>
                <p className="mt-1 text-3xl font-semibold text-purple-600">{stats.funds.released} SCROLL</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 