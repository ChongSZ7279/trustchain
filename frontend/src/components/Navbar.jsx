import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser, accountType, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // For debugging
  console.log('Navbar - Auth state:', { currentUser: currentUser ? 'exists' : 'null', accountType });

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors duration-200">
                TrustChain
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  isActive('/')
                    ? 'border-transparent text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Home
              </Link>
              <Link
                to="/organizations"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  isActive('/organizations')
                    ? 'border-transparent text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Organizations
              </Link>
              <Link
                to="/charities"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  isActive('/charities')
                    ? 'border-transparent text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Charities
              </Link>
              {currentUser && (
                <Link
                  to="/transactions"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    isActive('/transactions')
                      ? 'border-transparent text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Transactions
                </Link>
              )}
              <Link
                to="/partners"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  isActive('/partners')
                    ? 'border-transparent text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Partners
              </Link>
              <Link
                to="/guidelines"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  isActive('/guidelines')
                    ? 'border-transparent text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Guidelines
              </Link>
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center">
            {!currentUser && !accountType ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={accountType === 'organization' ? "/organization/dashboard" : "/user/dashboard"}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Logout
                </button>
              </>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-200"
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
            className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
              isActive('/')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/organizations"
            className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
              isActive('/organizations')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Organizations
          </Link>
          <Link
            to="/charities"
            className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
              isActive('/charities')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Charities
          </Link>
          <Link
            to="/guidelines"
            className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
              isActive('/guidelines')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Guidelines
          </Link>
          {currentUser && (
            <Link
              to="/transactions"
              className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                isActive('/transactions')
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Transactions
            </Link>
          )}
          {!currentUser && !accountType ? (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 text-base font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </>
          ) : (
            <Link
              to={accountType === 'organization' ? "/organization/dashboard" : "/user/dashboard"}
              className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                isActive('/dashboard')
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}
          <Link
            to="/partners"
            className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
              isActive('/partners')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Partners
          </Link>
        </div>
      </div>
    </nav>
  );
} 