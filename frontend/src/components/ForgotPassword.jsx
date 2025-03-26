import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaArrowRight, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

export default function ForgotPassword() {
  const { requestPasswordReset, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (formErrors.email) {
      setFormErrors(prev => ({ ...prev, email: '' }));
    }
    if (formErrors.general) {
      setFormErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!email) errors.email = 'Email is required';
    else if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = 'Please enter a valid email address';
    }
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
      await requestPasswordReset(email);
      setSuccessMessage('Password reset link has been sent to your email. Please check your inbox and follow the instructions.');
      setEmail('');
    } catch (err) {
      console.error('Password reset request error:', err);
      
      if (err.response?.data?.errors?.email) {
        setFormErrors({ email: err.response.data.errors.email[0] });
      } else if (err.response?.data?.message) {
        setFormErrors({ general: err.response.data.message });
      } else {
        setFormErrors({ general: 'Failed to send password reset email. Please try again later.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
          <FaEnvelope className="h-8 w-8 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Forgot your password?</h2>
        <p className="text-gray-500 text-sm mt-1">
          Enter your email address and we'll send you a link to reset your password
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
                <Link
                  to="/login"
                  className="text-sm font-medium text-green-600 hover:text-green-500 transition"
                >
                  Return to login
                </Link>
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
                value={email}
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
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Link <FaArrowRight className="ml-2" />
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