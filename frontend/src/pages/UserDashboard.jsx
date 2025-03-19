import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';

export default function UserDashboard() {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect is handled by the AuthContext
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <FaUser className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">
                {currentUser?.name || 'User'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              <FaSignOutAlt className="mr-1.5 h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Welcome to your dashboard</h2>
          <p className="text-gray-600">
            This is a placeholder for the user dashboard. You are logged in as a user.
          </p>
          
          {/* User details */}
          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-900 mb-2">Your Account Details</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{currentUser?.name || 'Not available'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{currentUser?.email || 'Not available'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">User</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Joined</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {currentUser?.created_at 
                      ? new Date(currentUser.created_at).toLocaleDateString() 
                      : 'Not available'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 