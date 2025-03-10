import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UserRegistration() {
  const navigate = useNavigate();
  const { registerUser, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    ic_number: '',
    name: '',
    password: '',
    password_confirmation: '',
    phone_number: '',
    gmail: '',
    wallet_address: '',
    frame_color_code: '#000000'
  });
  const [files, setFiles] = useState({
    profile_picture: null,
    front_ic_picture: null,
    back_ic_picture: null
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    if (uploadedFiles.length > 0) {
      setFiles(prev => ({ ...prev, [name]: uploadedFiles[0] }));
      // Clear error when user uploads a file
      if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.ic_number) errors.ic_number = 'IC number is required';
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match';
    }
    if (!formData.phone_number) errors.phone_number = 'Phone number is required';
    if (!formData.gmail) errors.gmail = 'Gmail is required';
    if (!formData.gmail.endsWith('@gmail.com')) {
      errors.gmail = 'Please enter a valid Gmail address';
    }

    if (!files.front_ic_picture) errors.front_ic_picture = 'Front IC picture is required';
    if (!files.back_ic_picture) errors.back_ic_picture = 'Back IC picture is required';

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      const registrationData = {
        ...formData,
        ...files
      };
      
      await registerUser(registrationData);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Register as a User
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* IC Number */}
            <div>
              <label htmlFor="ic_number" className="block text-sm font-medium text-gray-700">
                IC Number
              </label>
              <input
                type="text"
                name="ic_number"
                id="ic_number"
                value={formData.ic_number}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {formErrors.ic_number && (
                <p className="mt-2 text-sm text-red-600">{formErrors.ic_number}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {formErrors.name && (
                <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {formErrors.password && (
                <p className="mt-2 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>

            {/* Password Confirmation */}
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                name="password_confirmation"
                id="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {formErrors.password_confirmation && (
                <p className="mt-2 text-sm text-red-600">{formErrors.password_confirmation}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone_number"
                id="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {formErrors.phone_number && (
                <p className="mt-2 text-sm text-red-600">{formErrors.phone_number}</p>
              )}
            </div>

            {/* Gmail */}
            <div>
              <label htmlFor="gmail" className="block text-sm font-medium text-gray-700">
                Gmail
              </label>
              <input
                type="email"
                name="gmail"
                id="gmail"
                value={formData.gmail}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {formErrors.gmail && (
                <p className="mt-2 text-sm text-red-600">{formErrors.gmail}</p>
              )}
            </div>

            {/* Wallet Address */}
            <div>
              <label htmlFor="wallet_address" className="block text-sm font-medium text-gray-700">
                Wallet Address
              </label>
              <input
                type="text"
                name="wallet_address"
                id="wallet_address"
                value={formData.wallet_address}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {formErrors.wallet_address && (
                <p className="mt-2 text-sm text-red-600">{formErrors.wallet_address}</p>
              )}
            </div>

            {/* Frame Color Code */}
            <div>
              <label htmlFor="frame_color_code" className="block text-sm font-medium text-gray-700">
                Frame Color
              </label>
              <input
                type="color"
                name="frame_color_code"
                id="frame_color_code"
                value={formData.frame_color_code}
                onChange={handleChange}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Profile Picture */}
            <div>
              <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700">
                Profile Picture
              </label>
              <input
                type="file"
                name="profile_picture"
                id="profile_picture"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {formErrors.profile_picture && (
                <p className="mt-2 text-sm text-red-600">{formErrors.profile_picture}</p>
              )}
            </div>

            {/* Front IC Picture */}
            <div>
              <label htmlFor="front_ic_picture" className="block text-sm font-medium text-gray-700">
                Front IC Picture
              </label>
              <input
                type="file"
                name="front_ic_picture"
                id="front_ic_picture"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {formErrors.front_ic_picture && (
                <p className="mt-2 text-sm text-red-600">{formErrors.front_ic_picture}</p>
              )}
            </div>

            {/* Back IC Picture */}
            <div>
              <label htmlFor="back_ic_picture" className="block text-sm font-medium text-gray-700">
                Back IC Picture
              </label>
              <input
                type="file"
                name="back_ic_picture"
                id="back_ic_picture"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {formErrors.back_ic_picture && (
                <p className="mt-2 text-sm text-red-600">{formErrors.back_ic_picture}</p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 