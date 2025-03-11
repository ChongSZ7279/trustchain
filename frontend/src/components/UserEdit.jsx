import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
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
  FaTrophy
} from 'react-icons/fa';

// Define available frame colors and their requirements
const FRAME_COLORS = [
  { id: 'default', color: '#4F46E5', name: 'Default Blue', requirement: null },
  { id: 'gold', color: '#EAB308', name: 'Gold', requirement: 'Donate to 10 charities' },
  { id: 'emerald', color: '#059669', name: 'Emerald', requirement: 'Complete 5 volunteer tasks' },
  { id: 'ruby', color: '#DC2626', name: 'Ruby', requirement: 'Reach trusted donor status' },
  { id: 'diamond', color: '#7C3AED', name: 'Diamond', requirement: 'Be a top donor for 3 months' },
  { id: 'rainbow', color: 'linear-gradient(90deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)', name: 'Rainbow', requirement: 'Complete all achievements' }
];

export default function UserEdit() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    profile_picture: null,
    front_ic_picture: null,
    back_ic_picture: null,
    frame_color: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrls, setPreviewUrls] = useState({
    profile_picture: null,
    front_ic_picture: null,
    back_ic_picture: null
  });

  // Get user's unlocked colors based on achievements
  const getUnlockedColors = () => {
    // This should be replaced with actual achievement logic
    const achievements = user?.achievements || [];
    return FRAME_COLORS.filter(frame => {
      if (!frame.requirement) return true; // Default color is always available
      // Mock achievement check - replace with actual logic
      return achievements.includes(frame.id);
    });
  };

  useEffect(() => {
    // Redirect if no user is logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Set initial form data from user object
    setFormData({
      name: user.name || '',
      phone_number: user.phone_number || '',
      profile_picture: null,
      front_ic_picture: null,
      back_ic_picture: null,
      frame_color: user.frame_color || FRAME_COLORS[0].color
    });

    // Set preview URLs for existing images
    setPreviewUrls({
      profile_picture: user.profile_picture ? formatImageUrl(user.profile_picture) : null,
      front_ic_picture: user.front_ic_picture ? formatImageUrl(user.front_ic_picture) : null,
      back_ic_picture: user.back_ic_picture ? formatImageUrl(user.back_ic_picture) : null
    });
  }, [user, navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user exists and has ic_number
    if (!user?.ic_number) {
      setError('User not found or invalid IC number. Please try logging in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phone_number', formData.phone_number);
      formDataToSend.append('frame_color', formData.frame_color);
      formDataToSend.append('_method', 'PUT');

      if (formData.profile_picture) {
        formDataToSend.append('profile_picture', formData.profile_picture);
      }
      if (formData.front_ic_picture) {
        formDataToSend.append('front_ic_picture', formData.front_ic_picture);
      }
      if (formData.back_ic_picture) {
        formDataToSend.append('back_ic_picture', formData.back_ic_picture);
      }

      const response = await axios.post(`/api/users/${user.ic_number}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update the user state with the new data
      if (response.data && typeof setUser === 'function') {
        setUser(response.data);
      }
      
      navigate('/user/dashboard');
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking user authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <button
            onClick={() => navigate('/user/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {/* Basic Information */}
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FaUser className="mr-2" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Picture with Color Frame */}
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FaCamera className="mr-2" />
                Profile Picture
              </h2>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div 
                    className="h-32 w-32 rounded-full overflow-hidden bg-gray-100"
                    style={{
                      padding: '3px',
                      background: formData.frame_color
                    }}
                  >
                    <div className="h-full w-full rounded-full overflow-hidden bg-white">
                      {previewUrls.profile_picture ? (
                        <img
                          src={previewUrls.profile_picture}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <FaUser className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-lg cursor-pointer">
                    <FaCamera className="h-4 w-4 text-gray-600" />
                    <input
                      type="file"
                      name="profile_picture"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">
                    Upload a new profile picture. Recommended size: 400x400 pixels.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Frame Colors */}
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FaPalette className="mr-2" />
                Profile Frame Color
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {FRAME_COLORS.map((frame) => {
                    const isUnlocked = !frame.requirement || getUnlockedColors().includes(frame);
                    return (
                      <div
                        key={frame.id}
                        className={`relative rounded-lg p-4 ${
                          formData.frame_color === frame.color
                            ? 'ring-2 ring-indigo-500'
                            : 'ring-1 ring-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className="h-8 w-8 rounded-full"
                            style={{
                              background: frame.color
                            }}
                          />
                          {!isUnlocked && (
                            <FaLock className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <div className="mt-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {frame.name}
                          </h3>
                          {frame.requirement && (
                            <p className="mt-1 text-xs text-gray-500 flex items-center">
                              <FaTrophy className="mr-1" />
                              {frame.requirement}
                            </p>
                          )}
                        </div>
                        {isUnlocked && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, frame_color: frame.color }))}
                            className={`mt-2 w-full inline-flex justify-center items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white ${
                              formData.frame_color === frame.color
                                ? 'bg-indigo-600'
                                : 'bg-gray-600 hover:bg-gray-700'
                            }`}
                          >
                            {formData.frame_color === frame.color ? 'Selected' : 'Select'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* IC Pictures */}
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FaIdCard className="mr-2" />
                IC Pictures
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            className="h-48 w-full object-cover rounded-lg"
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
                            <FaCamera className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <span className="relative bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                Upload a file
                              </span>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 10MB
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
                            className="h-48 w-full object-cover rounded-lg"
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
                            <FaCamera className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <span className="relative bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                Upload a file
                              </span>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 10MB
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
            <div className="px-4 py-4 sm:px-6 bg-gray-50">
              <div className="flex justify-end space-x-3">
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
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
          </form>
        </div>
      </div>
    </div>
  );
} 