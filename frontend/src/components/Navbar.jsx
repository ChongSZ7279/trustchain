import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaShieldAlt, FaUserCircle, FaChevronDown, FaSignOutAlt, FaBook, FaUser } from 'react-icons/fa';

export default function Navbar() {
  const { currentUser, accountType, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const profileRef = useRef(null);

  // Check if the current user is an admin
  const isAdmin = currentUser?.is_admin === 1 || currentUser?.is_admin === true;

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileRef]);

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
                to="/carbonmarket"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  isActive('/carbonmarket')
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Carbon
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
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  <FaUserCircle className="w-5 h-5" />
                  <span>{currentUser?.name || (accountType === 'organization' ? 'Organization' : 'User')}</span>
                  <FaChevronDown className={`w-3 h-3 transition-transform duration-200 ${isProfileOpen ? 'transform rotate-180' : ''}`} />
                </button>
                
                {/* Profile dropdown */}
                {isProfileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
                    <div className="py-1">
                      <Link
                        to={accountType === 'organization' ? "/organization/dashboard" : "/user/dashboard"}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FaUser className="mr-3 h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        to="/guidelines"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FaBook className="mr-3 h-4 w-4" />
                        Guidelines
                      </Link>
                      {isAdmin && (
                        <div>
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-purple-600 hover:bg-purple-50"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <FaShieldAlt className="mr-3 h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      >
                        <FaSignOutAlt className="mr-3 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
            to="/carbonmarket"
            className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
              isActive('/carbonmarketmarket')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Carbon
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
                className="block w-full text-center px-4 py-2 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-md hover:shadow-lg transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center justify-center">
                  Register Now 
                  <svg className="ml-1 w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </Link>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="px-4 py-2 flex items-center">
                <FaUserCircle className="w-6 h-6 text-indigo-600" />
                <span className="ml-3 text-base font-medium text-gray-800">
                  {currentUser?.name || (accountType === 'organization' ? 'Organization' : 'User')}
                </span>
              </div>
              
              <div className="mt-3 space-y-1">
                <Link
                  to={accountType === 'organization' ? "/organization/dashboard" : "/user/dashboard"}
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <FaUser className="mr-3 h-4 w-4" />
                    Dashboard
                  </div>
                </Link>
                
                {isAdmin && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className="block px-4 py-2 text-base font-medium text-purple-600 hover:bg-purple-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <FaShieldAlt className="mr-3 h-4 w-4" />
                        Admin Dashboard
                      </div>
                    </Link>
                  </>
                )}
                
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <FaSignOutAlt className="mr-3 h-4 w-4" />
                    Sign out
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}