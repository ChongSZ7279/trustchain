import axios from 'axios';

// Define the API base URL from environment variables or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      console.error('Authentication error (401): ', error);
      
      // Remove invalid token
      localStorage.removeItem('token');
      
      // Redirect to login if needed
      // window.location.href = '/login';
    }
    
    // Handle 404 Not Found errors
    if (error.response && error.response.status === 404) {
      console.error('API Not Found (404):', error.config.url);
      console.log('Full request URL:', error.config.baseURL + error.config.url);
      console.log('Headers:', error.config.headers);
    }
    
    // Handle 500 Server errors
    if (error.response && error.response.status >= 500) {
      console.error('Server Error:', error.response.status, error.response.data);
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error - No Response:', error.message);
      console.log('Request was sent to:', error.config?.url);
    }
    
    // Log all other errors
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api; 