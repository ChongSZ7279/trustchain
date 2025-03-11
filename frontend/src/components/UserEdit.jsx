import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { formatImageUrl } from '../utils/helpers';

export default function UserEdit() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    profile_picture: null,
    front_ic_picture: null,
    back_ic_picture: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrls, setPreviewUrls] = useState({
    profile_picture: null,
    front_ic_picture: null,
    back_ic_picture: null
  });

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
      back_ic_picture: null
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
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center space-x-5">
              <div className="block pl-2 font-semibold text-xl self-start text-gray-700">
                <h2 className="leading-relaxed">Edit Profile</h2>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="flex flex-col">
                  <label className="leading-loose">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Phone Number</label>
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="leading-loose">Profile Picture</label>
                  <input
                    type="file"
                    name="profile_picture"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                  />
                  {previewUrls.profile_picture && (
                    <img
                      src={previewUrls.profile_picture}
                      alt="Profile Preview"
                      className="mt-2 h-32 w-32 object-cover rounded-full"
                    />
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="leading-loose">Front IC Picture</label>
                  <input
                    type="file"
                    name="front_ic_picture"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                  />
                  {previewUrls.front_ic_picture && (
                    <img
                      src={previewUrls.front_ic_picture}
                      alt="Front IC Preview"
                      className="mt-2 h-48 w-full object-cover rounded-lg"
                    />
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="leading-loose">Back IC Picture</label>
                  <input
                    type="file"
                    name="back_ic_picture"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                  />
                  {previewUrls.back_ic_picture && (
                    <img
                      src={previewUrls.back_ic_picture}
                      alt="Back IC Preview"
                      className="mt-2 h-48 w-full object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>
              {error && (
                <div className="text-red-500 text-sm mt-2">
                  {error}
                </div>
              )}
              <div className="pt-4 flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/user/dashboard')}
                  className="flex justify-center items-center w-full text-gray-900 px-4 py-3 rounded-md focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none hover:bg-blue-600"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 