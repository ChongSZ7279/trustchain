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
  FaEnvelope
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
                onClick={() => setActiveTab('in-progress')}
                className={`${
                  activeTab === 'in-progress'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
              >
                <FaChartLine className="mr-2" />
                In Progress Charity
              </button>
            </nav>
          </div>

          {/* Other Information Tab */}
          {activeTab === 'other-info' && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FaCertificate className="mr-2" />
                    IC Pictures
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Front</label>
                      {user.front_ic_picture ? (
                        <img
                          src={formatImageUrl(user.front_ic_picture)}
                          alt="Front IC"
                          className="mt-2 h-48 w-full object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="mt-2 h-48 w-full bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Back</label>
                      {user.back_ic_picture ? (
                        <img
                          src={formatImageUrl(user.back_ic_picture)}
                          alt="Back IC"
                          className="mt-2 h-48 w-full object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="mt-2 h-48 w-full bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Tier */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FaMedal className="mr-2" />
                    Your Donor Status
                  </h2>
                  
                  {rewardTier && (
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="text-4xl" style={{ color: rewardTier.color }}>
                        {rewardTier.name === 'Bronze' && <FaMedal />}
                        {rewardTier.name === 'Silver' && <FaStar />}
                        {rewardTier.name === 'Gold' && <FaTrophy />}
                        {rewardTier.name === 'Platinum' && <FaCertificate />}
                        {rewardTier.name === 'Diamond' && <FaHeart />}
                      </div>
                      <div>
                        <p className="text-xl font-bold" style={{ color: rewardTier.color }}>
                          {rewardTier.name} Donor
                        </p>
                        <p className="text-sm text-gray-600">
                          Total Donations: ${totalDonationAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Progress to next tier */}
                  {nextTierProgress && nextTierProgress.nextTier && (
                    <div className="mt-4">
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium text-gray-700">
                          Progress to {nextTierProgress.nextTier.name}
                        </p>
                        <p className="text-sm font-medium text-gray-700">
                          ${nextTierProgress.amountToNextTier.toFixed(2)} more needed
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="h-2.5 rounded-full" 
                          style={{ 
                            width: `${nextTierProgress.progress}%`,
                            backgroundColor: nextTierProgress.nextTier.color 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Tier Benefits */}
                  <div className="mt-6">
                    <h3 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                      <FaStar className="mr-2" />
                      Benefits
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                      <li>Exclusive {rewardTier?.name} profile frame</li>
                      <li>Special recognition on charity pages</li>
                      <li>Detailed impact reports for your donations</li>
                      {rewardTier?.name === 'Gold' && <li>Priority access to charity events</li>}
                      {(rewardTier?.name === 'Platinum' || rewardTier?.name === 'Diamond') && (
                        <>
                          <li>Priority access to charity events</li>
                          <li>Direct communication with charity representatives</li>
                        </>
                      )}
                      {rewardTier?.name === 'Diamond' && (
                        <li>Personalized thank you from charity beneficiaries</li>
                      )}
                    </ul>
                  </div>
                </div>
                
                {/* Achievements */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FaTrophy className="mr-2" />
                    Your Achievements
                  </h2>
                  
                  {achievements.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {achievements.map((achievement) => (
                        <div 
                          key={achievement.id}
                          className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-shrink-0 mr-4 text-2xl">
                            {achievement.icon}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{achievement.name}</h3>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Make your first donation to earn achievements!</p>
                      <Link 
                        to="/charities" 
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <FaHeart className="mr-2" />
                        Browse Charities
                      </Link>
                    </div>
                  )}
                  
                  {/* Available Achievements */}
                  <div className="mt-6">
                    <h3 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                      <FaChartLine className="mr-2" />
                      Available Achievements
                    </h3>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {!achievements.some(a => a.id === 'first_donation') && (
                        <div className="flex items-center p-3 bg-gray-100 rounded-lg opacity-70">
                          <div className="flex-shrink-0 mr-3 text-xl text-gray-400">🎉</div>
                          <div>
                            <h3 className="font-medium text-gray-700">First Steps</h3>
                            <p className="text-xs text-gray-500">Make your first donation</p>
                          </div>
                        </div>
                      )}
                      {!achievements.some(a => a.id === 'five_donations') && (
                        <div className="flex items-center p-3 bg-gray-100 rounded-lg opacity-70">
                          <div className="flex-shrink-0 mr-3 text-xl text-gray-400">🌟</div>
                          <div>
                            <h3 className="font-medium text-gray-700">Regular Contributor</h3>
                            <p className="text-xs text-gray-500">Make 5 or more donations</p>
                          </div>
                        </div>
                      )}
                      {!achievements.some(a => a.id === 'diverse_donor') && (
                        <div className="flex items-center p-3 bg-gray-100 rounded-lg opacity-70">
                          <div className="flex-shrink-0 mr-3 text-xl text-gray-400">🌈</div>
                          <div>
                            <h3 className="font-medium text-gray-700">Diverse Supporter</h3>
                            <p className="text-xs text-gray-500">Donate to 3 or more different charities</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Completed Charity Tab */}
          {activeTab === 'completed' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <FaCheckCircle className="mr-2" />
                Completed Charities
              </h2>

              {loading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-600">{error}</div>
              ) : completedCharities.length === 0 ? (
                <div className="text-center py-12">
                  <FaCheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No completed charities</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your completed charities will appear here.
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
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900">{charity.name}</h3>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{charity.description}</p>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Final Amount</span>
                            <span className="text-gray-900 font-medium">
                              ${charity.fund_received}
                            </span>
                          </div>
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FaCheckCircle className="mr-1" />
                              Completed
                            </span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Link
                            to={`/charities/${charity.id}`}
                            className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
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

          {/* In Progress Charity Tab */}
          {activeTab === 'in-progress' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <FaChartLine className="mr-2" />
                In Progress Charities
              </h2>

              {loading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-600">{error}</div>
              ) : inProgressCharities.length === 0 ? (
                <div className="text-center py-12">
                  <FaChartLine className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No charities in progress</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Charities you've donated to that are still collecting funds will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {inProgressCharities.map(charity => (
                    <div key={charity.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {charity.picture_path && (
                        <img
                          src={formatImageUrl(charity.picture_path)}
                          alt={charity.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900">{charity.name}</h3>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{charity.description}</p>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Progress</span>
                            <span className="text-gray-900 font-medium">
                              ${charity.fund_received} / ${charity.fund_targeted}
                            </span>
                          </div>
                          <div className="mt-2 relative">
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                              <div
                                style={{
                                  width: `${Math.min(
                                    (charity.fund_received / charity.fund_targeted) * 100,
                                    100
                                  )}%`,
                                }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Link
                            to={`/charities/${charity.id}`}
                            className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
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
        </div>
      </div>
    </div>
  );
} 