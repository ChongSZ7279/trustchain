import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, organization, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  // Function to check if a path is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-800 transition-all duration-200">
                TrustChain
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-none transition-all duration-200 hover:text-black hover:scale-105 ${
                  isActive('/') 
                    ? 'border-indigo-500 text-black font-semibold' 
                    : 'border-transparent text-gray-500 hover:border-gray-300'
                }`}
              >
                Home
              </Link>
              <Link
                to="/organizations"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-none transition-all duration-200 hover:text-black hover:scale-105 ${
                  isActive('/organizations') 
                    ? 'border-indigo-500 text-black font-semibold' 
                    : 'border-transparent text-gray-500 hover:border-gray-300'
                }`}
              >
                Organizations
              </Link>
              <Link
                to="/charities"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-none transition-all duration-200 hover:text-black hover:scale-105 ${
                  isActive('/charities') 
                    ? 'border-indigo-500 text-black font-semibold' 
                    : 'border-transparent text-gray-500 hover:border-gray-300'
                }`}
              >
                Charities
              </Link>
              {(user || organization) && (
                <Link
                  to="/transactions"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-none transition-all duration-200 hover:text-black hover:scale-105 ${
                    isActive('/transactions') 
                      ? 'border-indigo-500 text-black font-semibold' 
                      : 'border-transparent text-gray-500 hover:border-gray-300'
                  }`}
                >
                  Transactions
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center">
            {!user && !organization ? (
              <>
                <Link
                  to="/login"
                  className={`text-gray-500 hover:text-black hover:scale-105 px-3 py-2 transition-all duration-200 ${
                    isActive('/login') ? 'text-black font-semibold' : ''
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 hover:scale-105 transition-all duration-200"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={organization ? "/organization/dashboard" : "/user/dashboard"}
                  className={`text-gray-500 hover:text-black hover:scale-105 px-3 py-2 transition-all duration-200 ${
                    isActive('/organization/dashboard') || isActive('/user/dashboard') 
                      ? 'text-black font-semibold' 
                      : ''
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 hover:scale-105 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`block px-3 py-2 text-base font-medium hover:text-black hover:bg-gray-50 transition-all duration-200 ${
              isActive('/') 
                ? 'text-black bg-indigo-50 border-l-4 border-indigo-500' 
                : 'text-gray-500'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/organizations"
            className={`block px-3 py-2 text-base font-medium hover:text-black hover:bg-gray-50 transition-all duration-200 ${
              isActive('/organizations') 
                ? 'text-black bg-indigo-50 border-l-4 border-indigo-500' 
                : 'text-gray-500'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Organizations
          </Link>
          <Link
            to="/charities"
            className={`block px-3 py-2 text-base font-medium hover:text-black hover:bg-gray-50 transition-all duration-200 ${
              isActive('/charities') 
                ? 'text-black bg-indigo-50 border-l-4 border-indigo-500' 
                : 'text-gray-500'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Charities
          </Link>
          {!user && !organization ? (
            <>
              <Link
                to="/login"
                className={`block px-3 py-2 text-base font-medium hover:text-black hover:bg-gray-50 transition-all duration-200 ${
                  isActive('/login') 
                    ? 'text-black bg-indigo-50 border-l-4 border-indigo-500' 
                    : 'text-gray-500'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`block px-3 py-2 text-base font-medium hover:text-black hover:bg-gray-50 transition-all duration-200 ${
                  isActive('/register') 
                    ? 'text-black bg-indigo-50 border-l-4 border-indigo-500' 
                    : 'text-gray-500'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </>
          ) : (
            <Link
              to={organization ? "/organization/dashboard" : "/user/dashboard"}
              className={`block px-3 py-2 text-base font-medium hover:text-black hover:bg-gray-50 transition-all duration-200 ${
                isActive('/organization/dashboard') || isActive('/user/dashboard') 
                  ? 'text-black bg-indigo-50 border-l-4 border-indigo-500' 
                  : 'text-gray-500'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
} 