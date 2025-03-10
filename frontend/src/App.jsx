import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import router from './router';
import axios from 'axios';

// Set up axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = true;

// Add token to requests if it exists
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
