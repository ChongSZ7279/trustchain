import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BlockchainProvider } from './context/BlockchainContext';
import router from './router';
import axios from 'axios';
import { Route } from 'react-router-dom';
// Set axios defaults
axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

// Add request interceptor to add Authorization header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default function App() {
  return (
    <AuthProvider>
      <BlockchainProvider>
        <RouterProvider router={router} />
      </BlockchainProvider>
    </AuthProvider>
  );
}
