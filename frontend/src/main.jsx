import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import './index.css';
import './styles/alchemypay.css'; // Import Alchemy Pay specific styles
import './styles/transak.css'; // Import Transak specific styles
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { BlockchainProvider } from './context/BlockchainContext';

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// Add a request interceptor for auth token
axios.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, function (error) {
  return Promise.reject(error);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BlockchainProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </BlockchainProvider>
    </AuthProvider>
  </React.StrictMode>
);
