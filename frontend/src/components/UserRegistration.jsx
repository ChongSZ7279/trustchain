import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    acceptedTerms: false
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
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    if (uploadedFiles.length > 0) {
      setFiles(prev => ({ ...prev, [name]: uploadedFiles[0] }));
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
    
    if (!formData.acceptedTerms) {
      setError('You must accept the Terms and Conditions to register');
      return;
    }

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
      navigate('/user/dashboard');
    } catch (err) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6 pt-8">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            {/* IC Number */}
            <div className="sm:col-span-2">
              <label htmlFor="ic_number" className="block text-sm font-medium text-gray-700">
                IC Number
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="ic_number"
                  id="ic_number"
                  value={formData.ic_number}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                {formErrors.ic_number && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.ic_number}</p>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                {formErrors.name && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>
            </div>

            {/* Gmail */}
            <div className="sm:col-span-2">
              <label htmlFor="gmail" className="block text-sm font-medium text-gray-700">
                Gmail
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="gmail"
                  id="gmail"
                  value={formData.gmail}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                {formErrors.gmail && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.gmail}</p>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div className="sm:col-span-2">
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  type="tel"
                  name="phone_number"
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                {formErrors.phone_number && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.phone_number}</p>
                )}
              </div>
            </div>

            {/* Wallet Address */}
            <div className="sm:col-span-2">
              <label htmlFor="wallet_address" className="block text-sm font-medium text-gray-700">
                Wallet Address
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="wallet_address"
                  id="wallet_address"
                  value={formData.wallet_address}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                {formErrors.wallet_address && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.wallet_address}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-8">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Security</h3>
            <p className="mt-1 text-sm text-gray-500">
              Set a strong password to secure your account
            </p>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                {formErrors.password && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>
            </div>

            {/* Password Confirmation */}
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="password_confirmation"
                  id="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                {formErrors.password_confirmation && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.password_confirmation}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-8">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Identity Verification</h3>
            <p className="mt-1 text-sm text-gray-500">
              Please provide clear photos of your identification card
            </p>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            {/* Profile Picture */}
            <div className="sm:col-span-2">
              <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700">
                Profile Picture (Optional)
              </label>
              <div className="mt-1">
                <input
                  type="file"
                  name="profile_picture"
                  id="profile_picture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {formErrors.profile_picture && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.profile_picture}</p>
                )}
              </div>
            </div>

            {/* Front IC Picture */}
            <div>
              <label htmlFor="front_ic_picture" className="block text-sm font-medium text-gray-700">
                Front IC Picture
              </label>
              <div className="mt-1">
                <input
                  type="file"
                  name="front_ic_picture"
                  id="front_ic_picture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {formErrors.front_ic_picture && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.front_ic_picture}</p>
                )}
              </div>
            </div>

            {/* Back IC Picture */}
            <div>
              <label htmlFor="back_ic_picture" className="block text-sm font-medium text-gray-700">
                Back IC Picture
              </label>
              <div className="mt-1">
                <input
                  type="file"
                  name="back_ic_picture"
                  id="back_ic_picture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {formErrors.back_ic_picture && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.back_ic_picture}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-4 mt-6">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={formData.acceptedTerms}
                onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-800 font-medium">
                  Terms and Conditions
                </Link>
                {' '}and{' '}
                <Link to="/terms#privacy" className="text-blue-600 hover:text-blue-800 font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-end">
              <Link
                to="/login"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account or want to register as an organization?</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-600 hover:bg-indigo-50"
              >
                Sign In
              </Link>
              <Link
                to="/register/organization"
                className="w-full flex justify-center py-2 px-4 border border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-600 hover:bg-indigo-50"
              >
                Register as Organization
              </Link>
            </div>
          </div>
        </div>
      </form>
    </>
  );
} 