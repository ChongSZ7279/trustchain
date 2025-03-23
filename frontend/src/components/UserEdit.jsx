import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import BackButton from './BackToHistory';
import { formatImageUrl } from '../utils/helpers';
import { 
  FaUser, 
  FaPhone, 
  FaCamera, 
  FaIdCard, 
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaPalette,
  FaLock,
  FaTrophy,
  FaInfoCircle,
  FaCheck
} from 'react-icons/fa';
import { 
  calculateRewardTier, 
  calculateTotalDonationAmount, 
  getAchievements,
  REWARD_TIERS // Import the same REWARD_TIERS used in dashboard
} from '../utils/rewardSystem';

// Frame colors based on reward tiers
const FRAME_COLORS = [
  { id: 'default', color: '#E5E7EB', name: 'Default', requirement: null },
  { id: 'bronze', color: '#CD7F32', name: 'Bronze', requirement: 'donate_3_charities', tierName: 'Bronze' },
  { id: 'silver', color: '#C0C0C0', name: 'Silver', requirement: 'donate_100', tierName: 'Silver' },
  { id: 'gold', color: '#FFD700', name: 'Gold', requirement: 'donate_10_charities', tierName: 'Gold' },
  { id: 'platinum', color: '#E5E4E2', name: 'Platinum', requirement: 'donate_500', tierName: 'Platinum' },
  { id: 'diamond', color: '#B9F2FF', name: 'Diamond', requirement: 'donate_1000', tierName: 'Diamond' }
];

export default function UserEdit() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    profile_picture: null,
    front_ic_picture: null,
    back_ic_picture: null,
    frame_color: FRAME_COLORS[0].color
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrls, setPreviewUrls] = useState({
    profile_picture: null,
    front_ic_picture: null,
    back_ic_picture: null
  });
  const [unlockedColors, setUnlockedColors] = useState([FRAME_COLORS[0]]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [rewardTier, setRewardTier] = useState(null);
  const [totalDonationAmount, setTotalDonationAmount] = useState(0);

  // Fetch user transactions and calculate achievements
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      
      try {
        // Fetch user's transactions
        const transactionsRes = await axios.get(`/users/${currentUser.ic_number}/transactions`);
        setTransactions(transactionsRes.data);
        
        // Calculate total donation amount
        const total = calculateTotalDonationAmount(transactionsRes.data);
        setTotalDonationAmount(parseFloat(total) || 0);
        
        // Calculate reward tier
        const tier = calculateRewardTier(total);
        setRewardTier(tier);
        
        // Calculate achievements based on transactions
        const userAchievements = getAchievements(transactionsRes.data);
        setAchievements(userAchievements);
        
        // Determine unlocked colors based on achievements and tier
        const achievementIds = userAchievements.map(a => a.id);
        
        // Unlock colors based on both achievements and tier level
        const unlocked = FRAME_COLORS.filter(frame => {
          // Default is always available
          if (!frame.requirement) return true;
          
          // Check achievement-based requirements
          if (achievementIds.includes(frame.requirement)) return true;
          
          // Check tier-based requirements
          if (frame.tierName && tier && tier.name === frame.tierName) return true;
          
          return false;
        });
        
        setUnlockedColors(unlocked);
      } catch (err) {
        console.error('Error fetching user data:', err);
        // Set default values
        setTransactions([]);
        setAchievements([]);
        setTotalDonationAmount(0);
        setRewardTier(calculateRewardTier(0));
        setUnlockedColors([FRAME_COLORS[0]]);
      }
    };

    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    // Redirect if no user is logged in
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Set initial form data from user object
    setFormData({
      name: currentUser.name || '',
      phone_number: currentUser.phone_number || '',
      profile_picture: null,
      front_ic_picture: null,
      back_ic_picture: null,
      frame_color: currentUser.frame_color || FRAME_COLORS[0].color
    });

    // Set preview URLs for existing images
    setPreviewUrls({
      profile_picture: currentUser.profile_picture ? `/storage/${currentUser.profile_picture}` : null,
      front_ic_picture: currentUser.front_ic_picture ? `/storage/${currentUser.front_ic_picture}` : null,
      back_ic_picture: currentUser.back_ic_picture ? `/storage/${currentUser.back_ic_picture}` : null
    });

    console.log("Current user profile picture:", currentUser.profile_picture);
    console.log("Preview URL:", previewUrls.profile_picture);
    
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      // Validate file size (max 5MB)
      if (files[0].size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
      setPreviewUrls(prev => ({
        ...prev,
        [name]: URL.createObjectURL(files[0])
      }));
    }
  };

  const handleColorSelect = (color) => {
    // Check if color is unlocked
    const isUnlocked = unlockedColors.some(frame => frame.color === color);
    if (isUnlocked) {
      setFormData(prev => ({
        ...prev,
        frame_color: color
      }));
    } else {
      alert('This frame color is locked. Complete achievements to unlock it.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create form data for file upload
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone_number', formData.phone_number);
      data.append('frame_color', formData.frame_color);
      data.append('_method', 'PUT'); // For Laravel's form method spoofing
      
      if (formData.profile_picture) {
        data.append('profile_picture', formData.profile_picture);
      }
      
      if (formData.front_ic_picture) {
        data.append('front_ic_picture', formData.front_ic_picture);
      }
      
      if (formData.back_ic_picture) {
        data.append('back_ic_picture', formData.back_ic_picture);
      }

      // Send update request
      const response = await axios.post(`/users/${currentUser.ic_number}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Instead of trying to update the user in context, just show success and navigate
      alert('Profile updated successfully');
      
      // Force a page reload to refresh the user data from the server
      window.location.href = '/user/dashboard';
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Check if a frame is unlocked based on achievements
  const isFrameUnlocked = (frameId) => {
    const frame = FRAME_COLORS.find(f => f.id === frameId);
    if (!frame.requirement) return true; // Default is always unlocked
    return achievements.some(a => a.id === frame.requirement);
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await axios.delete(`/users/${currentUser.ic_number}`);
      alert('Account deleted successfully');
      logout(); // Use the logout function from AuthContext
      navigate('/login');
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <BackButton />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Profile</h3>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      <FaUser className="inline mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                      <FaPhone className="inline mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Profile Picture */}
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-4">Profile Picture</h4>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="relative">
                    <div 
                      className="h-32 w-32 rounded-full overflow-hidden border-4"
                      style={{ borderColor: formData.frame_color }}
                    >
                      {previewUrls.profile_picture ? (
                        <img
                          src={previewUrls.profile_picture}
                          alt="Profile"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            console.error("Profile image failed to load:", e);
                            e.target.src = 'https://via.placeholder.com/150?text=Profile';
                          }}
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          <FaUser className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {previewUrls.profile_picture && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, profile_picture: null }));
                          setPreviewUrls(prev => ({ ...prev, profile_picture: null }));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FaTimes className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload New Picture
                    </label>
                    <label className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="space-y-1 text-center">
                        <FaCamera className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <span className="relative bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            Upload a file
                          </span>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                      <input
                        type="file"
                        name="profile_picture"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
                
                {/* Frame Color Selection */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Frame Color</h3>
                  <div className="grid grid-cols-6 gap-4">
                    {FRAME_COLORS.map((frame) => {
                      const isUnlocked = unlockedColors.some(f => f.id === frame.id);
                      const isSelected = formData.frame_color === frame.color;
                      
                      return (
                        <div key={frame.id} className="flex flex-col items-center">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => handleColorSelect(frame.color)}
                              className={`h-16 w-16 rounded-full border-2 ${
                                isSelected ? 'border-indigo-600' : 'border-gray-300'
                              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                !isUnlocked ? 'opacity-60 cursor-not-allowed' : ''
                              }`}
                              style={{ backgroundColor: frame.color }}
                              disabled={!isUnlocked}
                            >
                              {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <FaCheck className="h-6 w-6 text-white drop-shadow-md" />
                                </div>
                              )}
                              
                              {!isUnlocked && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="bg-black bg-opacity-40 rounded-full p-1">
                                    <FaLock className="h-6 w-6 text-white" />
                                  </div>
                                </div>
                              )}
                            </button>
                          </div>
                          <span className="mt-2 text-sm text-gray-700">{frame.name}</span>
                          {!isUnlocked && (
                            <span className="text-xs text-gray-500 mt-1 text-center">
                              {frame.requirement}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 flex items-start">
                    <div className="flex-shrink-0">
                      <FaTrophy className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="ml-3 text-sm text-gray-500">
                      <p>Unlock more frame colors by completing achievements and reaching higher donor tiers.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* IC Pictures */}
              <div className="px-4 py-5 sm:p-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Identification Card</h4>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Front IC
                    </label>
                    <div className="mt-1">
                      <div className="relative">
                        {previewUrls.front_ic_picture ? (
                          <div className="relative">
                            <img
                              src={previewUrls.front_ic_picture}
                              alt="Front IC"
                              className="h-48 w-full object-cover rounded-lg border border-gray-300"
                              onError={(e) => {
                                console.error("IC image failed to load:", e);
                                e.target.src = 'https://via.placeholder.com/400x200?text=Front+IC';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, front_ic_picture: null }));
                                setPreviewUrls(prev => ({ ...prev, front_ic_picture: null }));
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <FaTimes className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                            <div className="space-y-1 text-center">
                              <FaIdCard className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="flex text-sm text-gray-600">
                                <span className="relative bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                  Upload a file
                                </span>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, GIF up to 5MB
                              </p>
                            </div>
                            <input
                              type="file"
                              name="front_ic_picture"
                              onChange={handleFileChange}
                              accept="image/*"
                              className="sr-only"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Back IC
                    </label>
                    <div className="mt-1">
                      <div className="relative">
                        {previewUrls.back_ic_picture ? (
                          <div className="relative">
                            <img
                              src={previewUrls.back_ic_picture}
                              alt="Back IC"
                              className="h-48 w-full object-cover rounded-lg border border-gray-300"
                              onError={(e) => {
                                console.error("IC image failed to load:", e);
                                e.target.src = 'https://via.placeholder.com/400x200?text=Back+IC';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, back_ic_picture: null }));
                                setPreviewUrls(prev => ({ ...prev, back_ic_picture: null }));
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <FaTimes className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                            <div className="space-y-1 text-center">
                              <FaIdCard className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="flex text-sm text-gray-600">
                                <span className="relative bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                  Upload a file
                                </span>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, GIF up to 5MB
                              </p>
                            </div>
                            <input
                              type="file"
                              name="back_ic_picture"
                              onChange={handleFileChange}
                              accept="image/*"
                              className="sr-only"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-start">
                  <div className="flex-shrink-0">
                    <FaInfoCircle className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3 text-sm text-gray-500">
                    <p>Your IC pictures are used for verification purposes only and are stored securely. They will not be shared with other users or third parties.</p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="px-4 py-5 sm:p-6 bg-red-50">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaTimes className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Error
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="px-4 py-5 sm:p-6 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FaTimes className="mr-2" />
                      Delete Account
                    </button>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => navigate('/user/dashboard')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Delete Account Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-red-600 mb-4">Delete Account</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  {loading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 