import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    gmail: '',
    password: '',
    type: 'user' // Default to user login
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

  const validateForm = () => {
    const errors = {};
    
    if (!formData.gmail) errors.gmail = 'Gmail is required';
    if (!formData.gmail.endsWith('@gmail.com')) {
      errors.gmail = 'Please enter a valid Gmail address';
    }
    if (!formData.password) errors.password = 'Password is required';

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
      const response = await login(formData);
      console.log('Login successful:', response);
      
      // Redirect based on user type
      if (formData.type === 'user') {
        navigate('/user/dashboard');
      } else {
        navigate('/organization/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setFormErrors({ general: err.response.data.message });
      } else {
        setFormErrors({ general: 'Login failed. Please try again.' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Account Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <div className="mt-2 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="user"
                    checked={formData.type === 'user'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2">User</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="organization"
                    checked={formData.type === 'organization'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2">Organization</span>
                </label>
              </div>
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

            {formErrors.general && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {formErrors.general}
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
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => navigate('/register/user')}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Register as User
                </button>
              </div>
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => navigate('/register/organization')}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Register as Organization
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 