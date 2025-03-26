import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaLock, FaArrowRight, FaExclamationTriangle, FaCheckCircle, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const { resetPassword, loading } = useAuth();
  const [formData, setFormData] = useState({
    token: token || '',
    email: email || '',
    password: '',
    password_confirmation: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  // Check password strength
  useEffect(() => {
    const password = formData.password;
    const strength = {
      score: 0,
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password)
    };
    
    // Calculate score (1 point for each criteria met)
    strength.score = [
      strength.hasMinLength,
      strength.hasUppercase,
      strength.hasLowercase,
      strength.hasNumber,
      strength.hasSpecialChar
    ].filter(Boolean).length;
    
    setPasswordStrength(strength);
  }, [formData.password]);

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
    
    // Clear confirm password error when password changes
    if (name === 'password' && formErrors.password_confirmation) {
      setFormErrors(prev => ({ ...prev, password_confirmation: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) errors.email = 'Email is required';
    else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength.score < 3) {
      errors.password = 'Password is too weak. Please include uppercase, lowercase, numbers, or special characters.';
    }
    
    if (!formData.password_confirmation) errors.password_confirmation = 'Please confirm your password';
    else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match';
    }
    
    if (!formData.token) errors.general = 'Reset token is missing';
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(
        formData.token,
        formData.email,
        formData.password,
        formData.password_confirmation
      );
      
      setSuccessMessage('Your password has been reset successfully. You can now log in with your new password.');
      setFormData(prev => ({ ...prev, password: '', password_confirmation: '' }));
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      
      if (err.response?.data?.errors) {
        const apiErrors = {};
        Object.keys(err.response.data.errors).forEach(key => {
          apiErrors[key] = err.response.data.errors[key][0];
        });
        setFormErrors(apiErrors);
      } else if (err.response?.data?.message) {
        setFormErrors({ general: err.response.data.message });
      } else {
        setFormErrors({ general: 'Failed to reset password. Please try again later.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get password strength color
  const getPasswordStrengthColor = () => {
    if (formData.password.length === 0) return 'bg-gray-200';
    if (passwordStrength.score < 2) return 'bg-red-500';
    if (passwordStrength.score < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get password strength label
  const getPasswordStrengthLabel = () => {
    if (formData.password.length === 0) return '';
    if (passwordStrength.score < 2) return 'Weak';
    if (passwordStrength.score < 4) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
          <FaLock className="h-8 w-8 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Reset your password</h2>
        <p className="text-gray-500 text-sm mt-1">
          Create a new password for your account
        </p>
      </div>

      {successMessage ? (
        <div className="rounded-md bg-green-50 p-4 animate-fadeIn">
          <div className="flex">
            <FaCheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                {successMessage}
              </h3>
              <div className="mt-4">
                <p className="text-sm text-green-700">
                  Redirecting to login page...
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {formErrors.general && (
            <div className="rounded-md bg-red-50 p-4 animate-fadeIn">
              <div className="flex">
                <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {formErrors.general}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`appearance-none block w-full px-3 py-2 border ${
                formErrors.email ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none`}
              placeholder="your@email.com"
            />
            {formErrors.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FaExclamationTriangle className="mr-1 h-3 w-3" /> {formErrors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none block w-full pr-10 py-2 border ${
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
            
            {/* Password strength meter */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`} 
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs font-medium text-gray-700">{getPasswordStrengthLabel()}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className={`flex items-center ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordStrength.hasMinLength ? <FaCheck className="mr-1 h-3 w-3" /> : <span className="mr-1 h-3 w-3">•</span>}
                    At least 8 characters
                  </div>
                  <div className={`flex items-center ${passwordStrength.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordStrength.hasUppercase ? <FaCheck className="mr-1 h-3 w-3" /> : <span className="mr-1 h-3 w-3">•</span>}
                    Uppercase letter
                  </div>
                  <div className={`flex items-center ${passwordStrength.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordStrength.hasLowercase ? <FaCheck className="mr-1 h-3 w-3" /> : <span className="mr-1 h-3 w-3">•</span>}
                    Lowercase letter
                  </div>
                  <div className={`flex items-center ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordStrength.hasNumber ? <FaCheck className="mr-1 h-3 w-3" /> : <span className="mr-1 h-3 w-3">•</span>}
                    Number
                  </div>
                  <div className={`flex items-center ${passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordStrength.hasSpecialChar ? <FaCheck className="mr-1 h-3 w-3" /> : <span className="mr-1 h-3 w-3">•</span>}
                    Special character
                  </div>
                </div>
              </div>
            )}
            
            {formErrors.password && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FaExclamationTriangle className="mr-1 h-3 w-3" /> {formErrors.password}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                id="password_confirmation"
                name="password_confirmation"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.password_confirmation}
                onChange={handleChange}
                className={`appearance-none block w-full pr-10 py-2 border ${
                  formErrors.password_confirmation ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none`}
                placeholder="••••••••"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            {formErrors.password_confirmation && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FaExclamationTriangle className="mr-1 h-3 w-3" /> {formErrors.password_confirmation}
              </p>
            )}
          </div>

          <div className="mt-6">
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
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password <FaArrowRight className="ml-2" />
                </>
              )}
            </button>
          </div>

          <div className="text-center mt-4">
            <Link
              to="/login"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition"
            >
              Back to login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
} 