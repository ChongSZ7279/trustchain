import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser, accountType, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`${scrolled ? 'bg-white shadow-md' : 'bg-white/95'} fixed top-0 left-0 right-0 z-50 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-500 transition-colors duration-200 flex items-center gap-2">
                <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 10v4h10v-4H7z" />
                  <path d="M12 2L2 12l10 10 10-10L12 2z" />
                </svg>
                <span>TrustChain</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-6">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  isActive('/')
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Home
              </Link>
              <Link
                to="/organizations"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  isActive('/organizations')
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Organizations
              </Link>
              <Link
                to="/charities"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  isActive('/charities')
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Charities
              </Link>
              <Link
                to="/transactions"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  isActive('/transactions')
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Transactions
              </Link>
              <Link
                to="/partners"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  isActive('/partners')
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Partners
              </Link>
              <Link
                to="/guidelines"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  isActive('/guidelines')
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Guidelines
              </Link>
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center sm:gap-3">
            {!currentUser && !accountType ? (
              <>
                <Link
                  to="/login"
                  className="text-indigo-600 hover:text-indigo-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-indigo-50 border border-transparent hover:border-indigo-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 group overflow-hidden"
                >
                  <span className="absolute inset-0 w-3 bg-gradient-to-r from-indigo-400 to-indigo-500 transform -skew-x-12 group-hover:w-full group-hover:skew-x-0 transition-all duration-500 ease-out"></span>
                  <span className="relative">Register Now</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={accountType === 'organization' ? "/organization/dashboard" : "/user/dashboard"}
                  className="text-indigo-600 hover:text-indigo-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-indigo-50 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                    <path d="M13 8h4"></path>
                    <path d="M13 12h4"></path>
                    <path d="M13 16h4"></path>
                  </svg>
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Sign out
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
      <div className={`sm:hidden transition-all duration-300 max-h-0 overflow-hidden ${isMenuOpen ? 'max-h-screen' : ''}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
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
            className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
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
            className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
              isActive('/charities')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Charities
          </Link>
          <Link
            to="/transactions"
            className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
              isActive('/transactions')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Transactions
          </Link>
          <Link
            to="/partners"
            className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
              isActive('/partners')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Partners
          </Link>
          <Link
            to="/guidelines"
            className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
              isActive('/guidelines')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Guidelines
          </Link>

          {!currentUser && !accountType ? (
            <div className="mt-6 px-3 space-y-3">
              <Link
                to="/login"
                className="block w-full text-center px-4 py-2 text-base font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block w-full text-center px-4 py-2 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Register Now
              </Link>
            </div>
          ) : (
            <div className="mt-6 px-3 space-y-3">
              <Link
                to={accountType === 'organization' ? "/organization/dashboard" : "/user/dashboard"}
                className={`block w-full text-center px-4 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                  isActive('/dashboard')
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-indigo-600 hover:bg-indigo-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-700 rounded-md transition-colors duration-200"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}