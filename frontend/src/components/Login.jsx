import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    gmail: '',
    password: '',
    type: 'user'
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      navigate(formData.type === 'user' ? '/user/dashboard' : '/organization/dashboard');
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
    <>
      <div className="space-y-8">
        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, type: 'user' }))}
            className={`p-4 text-center rounded-lg border-2 transition-all ${
              formData.type === 'user'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Individual User</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, type: 'organization' }))}
            className={`p-4 text-center rounded-lg border-2 transition-all ${
              formData.type === 'organization'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-medium">Organization</span>
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <label htmlFor="gmail" className="block text-sm font-medium text-gray-700">
              Gmail
            </label>
            <div className="mt-1">
              <input
                id="gmail"
                name="gmail"
                type="email"
                required
                value={formData.gmail}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {formErrors.gmail && (
                <p className="mt-2 text-sm text-red-600">{formErrors.gmail}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {formErrors.password && (
                <p className="mt-2 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </Link>
            </div>
          </div>

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
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Link
              to="/register/user"
              className="w-full flex justify-center py-2 px-4 border border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-600 hover:bg-indigo-50"
            >
              Register as User
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
    </>
  );
} 