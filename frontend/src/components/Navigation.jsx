import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600">TrustChain</Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300"
              >
                Home
              </Link>
              <Link
                to="/organizations"
                className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300"
              >
                Organizations
              </Link>
              <Link
                to="/charities"
                className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300"
              >
                Charities
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.type === 'organization' && (
                  <>
                    <Link
                      to="/organization/dashboard"
                      className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/charities/create"
                      className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Create Charity
                    </Link>
                  </>
                )}
                {user.is_admin && (
                  <Link
                    to="/admin/verification"
                    className="bg-yellow-500 text-white hover:bg-yellow-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Admin Verification
                  </Link>
                )}
                {user.type === 'user' && (
                  <Link
                    to="/dashboard"
                    className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register/user"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;