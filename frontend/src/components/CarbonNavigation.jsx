import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLeaf, FaExchangeAlt, FaStore, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { useCarbonMarket } from '../context/CarbonMarketContext';
import CarbonWalletButton from './CarbonWalletButton';

const CarbonNavigation = () => {
  const location = useLocation();
  const { isConnected } = useCarbonMarket();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Check if current route is active
  const isActive = (path) => location.pathname === path;

  // Toggle mobile menu
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Handle scroll events to add background on scroll
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items with icons
  const navItems = [
    { path: '/', label: 'Home', icon: <FaLeaf /> },
    { path: '/market', label: 'Trading', icon: <FaExchangeAlt /> },
    { path: '/marketplace', label: 'Marketplace', icon: <FaStore /> },
  ];

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r ${
          scrolled 
            ? 'from-gray-900/95 to-green-900/95 backdrop-blur-md shadow-lg' 
            : 'from-gray-900/70 to-green-900/70 backdrop-blur-sm'
        } transition-all duration-300`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                <FaLeaf className="text-white text-xl" />
              </div>
              <span className="text-white font-bold text-xl hidden sm:inline">CarbonChain</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors ${
                    isActive(item.path)
                      ? 'bg-white/10 text-white'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Wallet Button & Mobile Menu Button */}
            <div className="flex items-center">
              <div className="mr-2 md:mr-0">
                <CarbonWalletButton />
              </div>
              
              <button
                className="p-2 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white md:hidden ml-2"
                onClick={toggleMenu}
                aria-label="Menu"
              >
                {isMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed top-[72px] left-0 right-0 bg-gray-900/95 backdrop-blur-md z-40 md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium flex items-center ${
                    isActive(item.path)
                      ? 'bg-white/10 text-white'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              
              {isConnected && (
                <div className="border-t border-gray-700 mt-4 pt-4">
                  <div className="flex items-center px-4 py-3 rounded-lg text-gray-300">
                    <FaUser className="mr-3" />
                    <span>My Profile</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add padding to the body to account for fixed header */}
      <div className="h-20"></div>
    </>
  );
};

export default CarbonNavigation; 