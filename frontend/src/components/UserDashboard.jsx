import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBlockchain } from '../context/BlockchainContext';
import { formatImageUrl } from '../utils/helpers';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  calculateRewardTier, 
  calculateNextTierProgress, 
  getAchievements, 
  calculateTotalDonationAmount 
} from '../utils/rewardSystem';
import { 
  FaUser, 
  FaTrophy, 
  FaHistory, 
  FaEdit, 
  FaSignOutAlt,
  FaHeart,
  FaStar,
  FaMedal,
  FaCertificate,
  FaChartLine,
  FaHandHoldingUsd,
  FaUsers,
  FaCalendarAlt,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaPhone,
  FaEnvelope,
  FaThumbsUp
} from 'react-icons/fa';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const { account, getDonorTotalAmount } = useBlockchain();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalDonationAmount, setTotalDonationAmount] = useState(0);
  const [rewardTier, setRewardTier] = useState(null);
  const [nextTierProgress, setNextTierProgress] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [completedCharities, setCompletedCharities] = useState([]);
  const [inProgressCharities, setInProgressCharities] = useState([]);
  const [followedOrganizations, setFollowedOrganizations] = useState([]);
  const [followedCharities, setFollowedCharities] = useState([]);
  

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Fetch user's transactions
        try {
          const transactionsRes = await axios.get(`/api/users/${user.ic_number}/transactions`);
          setTransactions(transactionsRes.data);
          
          // Calculate total donation amount
          const total = calculateTotalDonationAmount(transactionsRes.data);
          setTotalDonationAmount(total);
          
          // Calculate reward tier
          const tier = calculateRewardTier(total);
          setRewardTier(tier);
          
          // Calculate progress to next tier
          const progress = calculateNextTierProgress(total);
          setNextTierProgress(progress);
          
          // Get achievements
          const userAchievements = getAchievements(transactionsRes.data);
          setAchievements(userAchievements);
        } catch (err) {
          console.error('Error fetching transactions:', err);
          // Set default values if transactions fetch fails
          setTransactions([]);
          setTotalDonationAmount(0);
          setRewardTier(calculateRewardTier(0));
          setNextTierProgress(calculateNextTierProgress(0));
          setAchievements([]);
        }

        // Fetch user's charities
        try {
          const charitiesRes = await axios.get(`/api/users/${user.ic_number}/charities`);
          const charities = charitiesRes.data;
          
          // Split charities into completed and in progress
          setCompletedCharities(charities.filter(charity => 
            charity.fund_received >= charity.fund_targeted
          ));
          setInProgressCharities(charities.filter(charity => 
            charity.fund_received < charity.fund_targeted
          ));
        } catch (err) {
          console.error('Error fetching charities:', err);
          setCompletedCharities([]);
          setInProgressCharities([]);
        }
        
        // Fetch followed organizations
        try {
          const followedOrgsRes = await axios.get('/api/user/followed-organizations');
          setFollowedOrganizations(followedOrgsRes.data);
        } catch (err) {
          console.error('Error fetching followed organizations:', err);
          setFollowedOrganizations([]);
        }
        
        // Fetch followed charities
        try {
          const followedCharitiesRes = await axios.get('/api/user/followed-charities');
          setFollowedCharities(followedCharitiesRes.data);
        } catch (err) {
          console.error('Error fetching followed charities:', err);
          setFollowedCharities([]);
        }
      } catch (err) {
        console.error('Error in fetchUserData:', err);
        setError('Some data could not be loaded. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Fetch blockchain donation amount if wallet is connected
  useEffect(() => {
    const fetchBlockchainDonations = async () => {
      if (!account) return;
      
      try {
        const amount = await getDonorTotalAmount(account);
        console.log('Blockchain donation amount:', amount);
        // In a real app, you would update the total donation amount with this value
      } catch (err) {
        console.error('Error fetching blockchain donations:', err);
      }
    };
    
    fetchBlockchainDonations();
  }, [account, getDonorTotalAmount]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Format date to a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* User Header */}
          <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {user.profile_picture ? (
                  <img
                    src={formatImageUrl(user.profile_picture)}
                    alt="Profile"
                    className="h-20 w-20 rounded-full object-cover border-4 border-blue-500"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-blue-100 border-4 border-blue-500 flex items-center justify-center">
                    <FaUser className="h-10 w-10 text-blue-500" />
                  </div>
                )}
                {rewardTier && (
                  <div 
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-2 bg-white shadow-md" 
                    style={{ borderColor: rewardTier.color }}
                  >
                    <span className="flex items-center justify-center h-full w-full text-sm font-bold" style={{ color: rewardTier.color }}>
                      {rewardTier.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500">{user.gmail}</p>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="inline-flex items-center text-sm text-gray-500">
                    <FaPhone className="mr-1" />
                    {user.phone_number}
                  </span>
                  <span className="inline-flex items-center text-sm text-gray-500">
                    <FaEnvelope className="mr-1" />
                    {user.gmail}
                  </span>
                </div>
              </div>
              <div className="ml-auto">
                <Link
                  to="/user/edit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FaEdit className="mr-2" />
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('other-info')}
                className={`${
                  activeTab === 'other-info'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
              >
                <FaUser className="mr-2" />
                Other Information
              </button>
              <button
                onClick={() => setActiveTab('rewards')}
                className={`${
                  activeTab === 'rewards'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
              >
                <FaTrophy className="mr-2" />
                Rewards & Achievements
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`${
                  activeTab === 'completed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
              >
                <FaCheckCircle className="mr-2" />
                Completed Charity
              </button>
              <button
                onClick={() => setActiveTab('followed')}
                className={`${
                  activeTab === 'followed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
              >
                <FaThumbsUp className="mr-2" />
                Followed Organizations
              </button>
              <button
                onClick={() => setActiveTab('followed-charities')}
                className={`${
                  activeTab === 'followed-charities'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
              >
                <FaHeart className="mr-2" />
                Followed Charities
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'other-info' && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              {/* Personal Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaUser className="mr-2" />
                  Personal Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">IC Number</label>
                    <p className="mt-1 text-sm text-gray-900">{user.ic_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                    <p className="mt-1 text-sm text-gray-900">{user.phone_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user.gmail}</p>
                  </div>
                  {user.wallet_address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Wallet Address</label>
                      <p className="mt-1 text-sm font-mono text-gray-900">{user.wallet_address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* IC Pictures */}
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">IC Pictures</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Front IC</h3>
                    <img
                      src={formatImageUrl(user.front_ic_picture)}
                      alt="Front IC"
                      className="w-full h-auto rounded-lg shadow-sm"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Back IC</h3>
                    <img
                      src={formatImageUrl(user.back_ic_picture)}
                      alt="Back IC"
                      className="w-full h-auto rounded-lg shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FaTrophy className="mr-2 text-yellow-500" />
                Rewards & Achievements
              </h2>
              
              {/* Reward Tier */}
              <div className="mb-8">
                <h3 className="text-md font-medium text-gray-700 mb-2">Current Reward Tier</h3>
                {rewardTier ? (
                  <div className="bg-gray-50 rounded-lg p-4 border" style={{ borderColor: rewardTier.color }}>
                    <div className="flex items-center">
                      <div 
                        className="h-12 w-12 rounded-full flex items-center justify-center mr-4" 
                        style={{ backgroundColor: rewardTier.color + '20', color: rewardTier.color }}
                      >
                        <FaMedal className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold" style={{ color: rewardTier.color }}>{rewardTier.name} Tier</h4>
                        <p className="text-sm text-gray-600">{rewardTier.description}</p>
                      </div>
                    </div>
                    
                    {nextTierProgress && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress to {nextTierProgress.nextTier.name} Tier</span>
                          <span>${nextTierProgress.current.toFixed(2)} / ${nextTierProgress.required}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="h-2.5 rounded-full" 
                            style={{ 
                              width: `${nextTierProgress.percentage}%`,
                              backgroundColor: nextTierProgress.nextTier.color
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No reward tier yet. Start donating to earn rewards!</p>
                )}
              </div>
              
              {/* Achievements */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Your Achievements</h3>
                {achievements.length === 0 ? (
                  <p className="text-gray-500">No achievements yet. Keep supporting charities to unlock achievements!</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            {achievement.icon === 'donation' && <FaHandHoldingUsd className="h-5 w-5 text-blue-600" />}
                            {achievement.icon === 'streak' && <FaCalendarAlt className="h-5 w-5 text-blue-600" />}
                            {achievement.icon === 'variety' && <FaUsers className="h-5 w-5 text-blue-600" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{achievement.title}</h4>
                            <p className="text-xs text-gray-500">{achievement.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Completed Charities Tab */}
          {activeTab === 'completed' && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FaCheckCircle className="mr-2 text-green-500" />
                Completed Charities
              </h2>
              
              {completedCharities.length === 0 ? (
                <div className="text-center py-8">
                  <FaCheckCircle className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No completed charities</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't completed any charities yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {completedCharities.map(charity => (
                    <div key={charity.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {charity.picture_path && (
                        <img
                          src={formatImageUrl(charity.picture_path)}
                          alt={charity.name}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900">{charity.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{charity.category}</p>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                          {charity.description}
                        </p>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Funded</span>
                            <span className="font-medium">${charity.fund_received} / ${charity.fund_targeted}</span>
                          </div>
                          <div className="mt-1">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-green-600 h-2.5 rounded-full" 
                                style={{ width: '100%' }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Link
                            to={`/charities/${charity.id}`}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Followed Organizations Tab */}
          {activeTab === 'followed' && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FaThumbsUp className="mr-2 text-indigo-500" />
                Organizations You Follow
              </h2>
              
              {followedOrganizations.length === 0 ? (
                <div className="text-center py-8">
                  <FaThumbsUp className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No followed organizations</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't followed any organizations yet.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/organizations"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FaUsers className="mr-2" />
                      Browse Organizations
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {followedOrganizations.map(org => (
                    <div key={org.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-4 flex items-center space-x-3">
                        <img
                          src={formatImageUrl(org.logo)}
                          alt={org.name}
                          className="h-12 w-12 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/48?text=Logo';
                          }}
                        />
                        <div>
                          <h3 className="text-md font-medium text-gray-900">{org.name}</h3>
                          <p className="text-xs text-gray-500">{org.category}</p>
                        </div>
                      </div>
                      
                      {org.cover_image_path && (
                        <img
                          src={formatImageUrl(org.cover_image_path)}
                          alt={`${org.name} cover`}
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x150?text=Cover';
                          }}
                        />
                      )}
                      
                      <div className="p-4">
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {org.description}
                        </p>
                        
                        <Link
                          to={`/organizations/${org.id}`}
                          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          <FaExternalLinkAlt className="mr-2" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Followed Charities Tab */}
          {activeTab === 'followed-charities' && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FaHeart className="mr-2 text-red-500" />
                Charities You Follow
              </h2>
              
              {followedCharities.length === 0 ? (
                <div className="text-center py-8">
                  <FaHeart className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No followed charities</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't followed any charities yet.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/charities"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FaHandHoldingUsd className="mr-2" />
                      Browse Charities
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {followedCharities.map(charity => (
                    <div key={charity.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {charity.picture_path && (
                        <img
                          src={formatImageUrl(charity.picture_path)}
                          alt={charity.name}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900">{charity.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{charity.category}</p>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                          {charity.description}
                        </p>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-medium">${charity.fund_received} / ${charity.fund_targeted}</span>
                          </div>
                          <div className="mt-1">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-indigo-600 h-2.5 rounded-full" 
                                style={{ width: `${Math.min(100, (charity.fund_received / charity.fund_targeted) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Link
                            to={`/charities/${charity.id}`}
                            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            <FaExternalLinkAlt className="mr-2" />
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Transaction History Tab */}
          {activeTab === 'history' && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FaHistory className="mr-2" />
                Transaction History
              </h2>
              
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <FaHistory className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't made any transactions yet.
                  </p>
                </div>
              ) : (
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
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map(transaction => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(transaction.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.type === 'charity' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {transaction.type === 'charity' ? 'Charity Donation' : 'Task Funding'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            ${transaction.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.type === 'charity' && transaction.charity_id && (
                              <Link to={`/charities/${transaction.charity_id}`} className="text-indigo-600 hover:text-indigo-900">
                                View Charity
                              </Link>
                            )}
                            {transaction.type === 'task' && transaction.task_id && (
                              <Link to={`/tasks/${transaction.task_id}`} className="text-indigo-600 hover:text-indigo-900">
                                View Task
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 