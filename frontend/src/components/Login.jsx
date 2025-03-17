import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaArrowRight, FaLock, FaEnvelope, FaExclamationTriangle, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const { login, testLogin, loading, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear auth errors when component mounts or unmounts
  useEffect(() => {
    return () => {
      // Reset any auth errors when component unmounts
      if (authError) {
        // If your auth context has a clearError function, call it here
      }
    };
  }, []);

  // Update errors from auth context
  useEffect(() => {
    if (authError) {
      setFormErrors(prev => ({ ...prev, general: authError }));
    }
  }, [authError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Clear general error when user starts typing
    if (formErrors.general) {
      setFormErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) errors.password = 'Password is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      console.log('Login already in progress, ignoring additional attempt');
      return;
    }
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting login form with email:', formData.email);
      
      const response = await login(formData);
      console.log('Login successful:', response);
      
      // Determine user type with fallback logic
      let userType = response.account_type;
      
      if (!userType) {
        // Try to determine from user data
        if (response.user?.is_organization) {
          userType = 'organization';
        } else {
          userType = 'user';
        }
        console.log('Account type not in response, determined as:', userType);
      }
      
      // Navigate based on the determined user type
      const dashboardPath = userType === 'organization' ? '/organization/dashboard' : '/user/dashboard';
      
      console.log('Determined user type:', userType);
      console.log('Navigating to:', dashboardPath);
      
      // Use replace: true to ensure we replace the current history entry
      // and increase timeout to ensure state is fully updated
      setTimeout(() => {
        console.log('Executing navigation to:', dashboardPath);
        navigate(dashboardPath, { replace: true });
        
        // Force a page reload if navigation doesn't work
        setTimeout(() => {
          console.log('Checking if navigation worked...');
          if (window.location.pathname !== dashboardPath) {
            console.log('Navigation failed, forcing page reload');
            window.location.href = dashboardPath;
          }
        }, 500);
      }, 300);
    } catch (err) {
      console.error('Login error in component:', err);
      setLoginAttempts(prev => prev + 1);
      
      // Display a more user-friendly error message
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.status === 500) {
        console.error('Server error details:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
        errorMessage = 'Server error. Please try again later.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Use toast or alert to show error
      setFormErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestLogin = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Testing login with email:', formData.email);
      
      const response = await testLogin(formData);
      console.log('Test login response:', response);
      
      // Show test results
      setFormErrors({ 
        general: 'Test login response received. Check console for details.' 
      });
    } catch (err) {
      console.error('Test login error:', err);
      
      if (err.response?.status === 500) {
        console.error('Test server error details:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
        
        setFormErrors({ 
          general: 'A server error occurred during test. Check console for details.'
        });
      } else {
        setFormErrors({ 
          general: 'Test login failed. Check console for details.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const testDatabaseConnection = async () => {
    try {
      setIsSubmitting(true);
      const response = await axios.get('http://localhost:8000/api/test-database');
      console.log('Database test response:', response.data);
      
      if (response.data.status === 'success') {
        setFormErrors({
          general: 'Database connection successful!',
          details: `Connected to ${response.data.database_name} with ${response.data.tables.length} tables.`
        });
      } else {
        setFormErrors({
          general: 'Database connection test failed.',
          details: response.data.error
        });
      }
    } catch (err) {
      console.error('Database test error:', err);
      setFormErrors({
        general: 'Database connection test failed.',
        details: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
          <FaLock className="h-8 w-8 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Sign in to your account</h2>
        <p className="text-gray-500 text-sm mt-1">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {formErrors.general && (
          <div className="rounded-md bg-red-50 p-4 animate-fadeIn">
            <div className="flex">
              <FaExclamationTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {formErrors.general}
                </h3>
                {formErrors.details && (
                  <p className="mt-1 text-xs text-red-700">
                    {formErrors.details}
                  </p>
                )}
                {loginAttempts >= 3 && (
                  <div className="mt-2 text-sm text-red-700">
                    <Link to="/forgot-password" className="font-medium underline">
                      Forgot your password?
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                formErrors.email ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none`}
              placeholder="your@email.com"
            />
          </div>
          {formErrors.email && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <FaExclamationTriangle className="mr-1 h-3 w-3" /> {formErrors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                formErrors.password ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none`}
              placeholder="••••••••"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5" />
                ) : (
                  <FaEye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {formErrors.password && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <FaExclamationTriangle className="mr-1 h-3 w-3" /> {formErrors.password}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 transition">
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading || isSubmitting}
            className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${
              (loading || isSubmitting) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading || isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                Sign in <FaArrowRight className="ml-2" />
              </>
            )}
          </button>
        </div>
        
        
      </form>
    </div>
  );
} 