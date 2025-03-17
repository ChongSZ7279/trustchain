import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Set up axios defaults
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common['Accept'] = 'application/json';
  axios.defaults.headers.common['Content-Type'] = 'application/json';

  // Set up axios interceptors for handling token
  axios.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  // Add response interceptor to handle common errors
  axios.interceptors.response.use(
    response => response,
    error => {
      // Handle 401 Unauthorized errors globally
      if (error.response && error.response.status === 401 && currentUser) {
        // Only logout if we were previously logged in and got a 401
        logout();
        setError('Your session has expired. Please log in again.');
      }
      return Promise.reject(error);
    }
  );

  // Check if user is authenticated on page load
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setCurrentUser(null);
          setAccountType(null);
          setAuthChecked(true);
          setLoading(false);
          return;
        }

        const response = await axios.get('/user');
        setCurrentUser(response.data.user);
        setAccountType(response.data.account_type || 'user');
      } catch (err) {
        console.error('Auth check error:', err);
        localStorage.removeItem('token');
        setCurrentUser(null);
        setAccountType(null);
      } finally {
        setAuthChecked(true);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Register function that handles both user and organization registrations
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      // Determine the endpoint based on account type
      let endpoint;
      let type;
      
      // Check if userData is FormData
      if (userData instanceof FormData) {
        // Get the type from FormData
        type = userData.get('type');
        endpoint = type === 'organization' ? '/register/organization' : '/register/user';
        console.log('FormData detected, using endpoint:', endpoint);
        console.log('Registration type:', type);
        
        // Debug FormData contents
        console.log('FormData contents:');
        for (let pair of userData.entries()) {
          console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name + ' (File)' : pair[1]));
        }
      } else {
        // Get the type from object
        type = userData.type || 'user';
        endpoint = type === 'organization' ? '/register/organization' : '/register/user';
        console.log('Object data detected, using endpoint:', endpoint);
        console.log('Registration type:', type);
        
        // Create FormData for file uploads
        const formData = new FormData();
        
        // Add all fields to FormData
        Object.keys(userData).forEach(key => {
          // Skip confirmPassword as backend doesn't need it directly
          if (key !== 'confirmPassword') {
            // Check if it's a file
            if (userData[key] instanceof File) {
              formData.append(key, userData[key]);
              console.log(`Added file: ${key} - ${userData[key].name}`);
            } else {
              formData.append(key, userData[key]);
              console.log(`Added field: ${key} - ${userData[key]}`);
            }
          }
        });
        
        // Replace userData with formData
        userData = formData;
        
        // Debug FormData contents after creation
        console.log('Created FormData contents:');
        for (let pair of userData.entries()) {
          console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name + ' (File)' : pair[1]));
        }
      }
      
      console.log('Using endpoint:', endpoint);
      console.log('Registration type:', type);
      
      try {
        // Ensure we're using the correct content type for FormData
        const response = await axios.post(endpoint, userData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          }
        });
        
        console.log('Registration response:', response.data);
        return response.data;
      } catch (err) {
        console.error('Registration error:', err);
        
        if (err.response) {
          console.log('Error response status:', err.response.status);
          console.log('Error response data:', err.response.data);
          
          if (err.response.status === 422) {
            console.log('Validation errors:', err.response.data.errors);
            setError('Validation failed: ' + JSON.stringify(err.response.data.errors));
          } else {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
          }
        } else if (err.request) {
          console.log('No response received:', err.request);
          setError('No response received from server. Please check your connection.');
        } else {
          console.log('Error setting up request:', err.message);
          setError('Error setting up request: ' + err.message);
        }
        
        throw err;
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login function with improved error handling
  const login = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting login with:', { email });
      
      // Make sure we're sending the data in the correct format
      const loginData = {
        email: email.trim(),
        password: password
      };
      
      // Log the exact data being sent
      console.log('Sending login data:', JSON.stringify(loginData));
      
      // First try the test login to diagnose any issues
      try {
        const testResponse = await axios.post('/test-login', loginData);
        console.log('Test login response:', testResponse.data);
        
        // If test shows no user found, return early with error
        if (!testResponse.data.user_found && !testResponse.data.organization_found) {
          setError('No account found with this email. Please check your email or register.');
          setLoading(false);
          return { error: 'No account found' };
        }
        
        // If test shows database error, return early
        if (testResponse.data.user_query_error || testResponse.data.org_query_error) {
          console.error('Database error detected in test:', 
            testResponse.data.user_query_error || testResponse.data.org_query_error);
          setError('A database error occurred. Please try again later.');
          setLoading(false);
          return { error: 'Database error' };
        }
      } catch (testErr) {
        // Just log test errors, don't abort the actual login
        console.warn('Test login failed but continuing with real login:', testErr);
      }
      
      // Now try the actual login
      const response = await axios.post('/login', loginData);
      
      console.log('Login response:', response.data);
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Set current user and account type
      setCurrentUser(response.data.user);
      setAccountType(response.data.account_type || 'user');
      
      return response.data;
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle different error scenarios
      if (err.response) {
        console.log('Error response:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
        
        if (err.response.status === 422) {
          // Validation errors
          setError('Please check your email and password.');
        } else if (err.response.status === 401) {
          // Unauthorized
          setError('Invalid credentials. Please try again.');
        } else if (err.response.status === 500) {
          // Server error
          setError('Server error. Please try again later or contact support.');
          console.error('Server error details:', err.response.data);
        } else if (err.response.data?.message) {
          // Custom error message from backend
          setError(err.response.data.message);
        } else {
          setError('Login failed. Please try again later.');
        }
      } else if (err.request) {
        // Network error
        console.log('Network error - no response received');
        setError('Network error. Please check your connection and try again.');
      } else {
        console.log('Error setting up request:', err.message);
        setError('An unexpected error occurred. Please try again.');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call logout endpoint if user is logged in
      if (currentUser) {
        await axios.post('/logout');
      }
    } catch (err) {
      console.error('Logout error:', err);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local storage and state
      localStorage.removeItem('token');
      setCurrentUser(null);
      setAccountType(null);
      setLoading(false);
    }
  };

  // Function to check if user is authenticated
  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/user');
      setCurrentUser(response.data.user);
      setAccountType(response.data.account_type || 'user');
      return true;
    } catch (err) {
      console.error('Auth check error:', err);
      localStorage.removeItem('token');
      setCurrentUser(null);
      setAccountType(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Function to clear errors
  const clearError = () => {
    setError(null);
  };

  // Password reset request
  const requestPasswordReset = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/forgot-password', { email });
      return response.data;
    } catch (err) {
      console.error('Password reset request error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send password reset email. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (token, email, password, password_confirmation) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/reset-password', {
        token,
        email,
        password,
        password_confirmation
      });
      return response.data;
    } catch (err) {
      console.error('Password reset error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add a test login function
  const testLogin = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting test login with:', { email });
      
      // Make sure we're sending the data in the correct format
      const loginData = {
        email: email.trim(),
        password: password
      };
      
      console.log('Sending test login data:', loginData);
      
      const response = await axios.post('/test-login', loginData);
      
      console.log('Test login response:', response.data);
      
      return response.data;
    } catch (err) {
      console.error('Test login error:', err);
      
      if (err.response) {
        console.log('Test error response:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Value to be provided to consumers
  const value = {
    currentUser,
    accountType,
    loading,
    error,
    authChecked,
    register,
    registerUser: (userData) => {
      // If userData is already FormData, just add the type if not present
      if (userData instanceof FormData) {
        if (!userData.has('type')) {
          userData.append('type', 'user');
        }
        return register(userData);
      }
      // Otherwise, create FormData from object
      return register({ ...userData, type: 'user' });
    },
    registerOrganization: (orgData) => {
      // If orgData is already FormData, just add the type if not present
      if (orgData instanceof FormData) {
        if (!orgData.has('type')) {
          orgData.append('type', 'organization');
        }
        return register(orgData);
      }
      // Otherwise, create FormData from object
      return register({ ...orgData, type: 'organization' });
    },
    login,
    testLogin,
    logout,
    checkAuth,
    clearError,
    requestPasswordReset,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 