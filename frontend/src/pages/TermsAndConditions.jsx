import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBook, 
  FaShieldAlt, 
  FaHandshake, 
  FaUserShield, 
  FaArrowRight, 
  FaCheck,
  FaCheckCircle,
  FaHistory
} from 'react-icons/fa';

export default function TermsAndConditions() {
  const [activeSection, setActiveSection] = useState('terms');
  const [readSections, setReadSections] = useState({
    terms: false,
    privacy: false,
    security: false
  });

  const markAsRead = (section) => {
    setReadSections({
      ...readSections,
      [section]: true
    });
  };

  const allSectionsRead = Object.values(readSections).every(value => value);
  const readSectionsCount = Object.values(readSections).filter(Boolean).length;
  const progressPercentage = (readSectionsCount / 3) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen bg-gray-50"
    >
      {/* Sidebar with Glass Effect */}
      <aside className="w-72 bg-white/80 backdrop-blur-md shadow-lg rounded-lg overflow-y-auto p-6 sticky top-6 self-start mx-6 my-6 h-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Navigation</h2>
        <ul className="space-y-4">
          <motion.li whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
            <button 
              onClick={() => setActiveSection('terms')}
              className={`w-full text-left flex items-center justify-between text-lg font-medium ${activeSection === 'terms' ? 'text-indigo-600' : 'text-gray-700'} hover:text-indigo-600 transition p-2 rounded-lg ${activeSection === 'terms' ? 'bg-indigo-50' : ''}`}
            >
              <span><FaHandshake className="inline mr-2" /> Terms of Service</span>
              {readSections.terms && <FaCheckCircle className="text-green-500" />}
            </button>
          </motion.li>
          <motion.li whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
            <button 
              onClick={() => setActiveSection('privacy')}
              className={`w-full text-left flex items-center justify-between text-lg font-medium ${activeSection === 'privacy' ? 'text-indigo-600' : 'text-gray-700'} hover:text-indigo-600 transition p-2 rounded-lg ${activeSection === 'privacy' ? 'bg-indigo-50' : ''}`}
            >
              <span><FaShieldAlt className="inline mr-2" /> Privacy Policy</span>
              {readSections.privacy && <FaCheckCircle className="text-green-500" />}
            </button>
          </motion.li>
          <motion.li whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
            <button 
              onClick={() => setActiveSection('security')}
              className={`w-full text-left flex items-center justify-between text-lg font-medium ${activeSection === 'security' ? 'text-indigo-600' : 'text-gray-700'} hover:text-indigo-600 transition p-2 rounded-lg ${activeSection === 'security' ? 'bg-indigo-50' : ''}`}
            >
              <span><FaUserShield className="inline mr-2" /> Data Security</span>
              {readSections.security && <FaCheckCircle className="text-green-500" />}
            </button>
          </motion.li>
        </ul>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-700 flex items-center">
              <FaHistory className="mr-2" /> Reading Progress
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <motion.div 
                className="bg-indigo-600 h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              ></motion.div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {allSectionsRead ? 'All sections read!' : `${readSectionsCount}/3 sections read`}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Header with gradient background */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative rounded-xl bg-gradient-to-r from-indigo-700 to-purple-700 text-white p-8 mb-8 shadow-lg overflow-hidden"
        >
          {/* Abstract background shapes */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white transform translate-x-1/3 translate-y-1/3"></div>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold flex items-center">
              <FaBook className="mr-3" />
              Terms and Conditions
            </h1>
            <p className="mt-2 text-indigo-100 max-w-xl">
              Please read these terms carefully before using our platform. Your agreement is required to continue.
            </p>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="mt-6 space-y-8">
          {/* Terms Section */}
          <AnimatePresence mode="wait">
            {activeSection === 'terms' && (
              <motion.section 
                key="terms"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-8 shadow-lg rounded-xl border-l-4 border-indigo-500"
              >
                <h2 className="text-2xl font-bold text-indigo-700 flex items-center mb-4">
                  <FaHandshake className="mr-2 text-indigo-500" /> Terms of Service
                </h2>
                <div className="prose max-w-none text-gray-600">
                  <p>Welcome to TrustChain. By accessing our platform, you agree to these terms.</p>
                  <p className="mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.</p>
                  <p className="mt-4">Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.</p>
                  <p className="mt-4">Nullam efficitur, odio ut tempor facilisis, lorem ipsum aliquet libero, vitae vestibulum ipsum augue id elit. Aenean facilisis, magna at tincidunt vehicula, tortor felis feugiat velit, et molestie dolor mi sit amet lectus.</p>
                </div>
                <motion.button 
                  onClick={() => {
                    markAsRead('terms');
                    setActiveSection('privacy');
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-6 flex items-center text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-lg transition shadow-md"
                >
                  I've Read This Section <FaArrowRight className="ml-2" />
                </motion.button>
              </motion.section>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <motion.section 
                key="privacy"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-8 shadow-lg rounded-xl border-l-4 border-indigo-500"
              >
                <h2 className="text-2xl font-bold text-indigo-700 flex items-center mb-4">
                  <FaShieldAlt className="mr-2 text-indigo-500" /> Privacy Policy
                </h2>
                <div className="prose max-w-none text-gray-600">
                  <p>Your privacy is important to us. This section explains how we collect and protect your data.</p>
                  <p className="mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.</p>
                  <p className="mt-4">Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.</p>
                  <p className="mt-4">Nullam efficitur, odio ut tempor facilisis, lorem ipsum aliquet libero, vitae vestibulum ipsum augue id elit. Aenean facilisis, magna at tincidunt vehicula, tortor felis feugiat velit, et molestie dolor mi sit amet lectus.</p>
                </div>
                <motion.button 
                  onClick={() => {
                    markAsRead('privacy');
                    setActiveSection('security');
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-6 flex items-center text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-lg transition shadow-md"
                >
                  I've Read This Section <FaArrowRight className="ml-2" />
                </motion.button>
              </motion.section>
            )}

            {/* Data Security Section */}
            {activeSection === 'security' && (
              <motion.section 
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-8 shadow-lg rounded-xl border-l-4 border-indigo-500"
              >
                <h2 className="text-2xl font-bold text-indigo-700 flex items-center mb-4">
                  <FaUserShield className="mr-2 text-indigo-500" /> Data Security
                </h2>
                <div className="prose max-w-none text-gray-600">
                  <p>We implement strict security measures to keep your data safe.</p>
                  <p className="mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.</p>
                  <p className="mt-4">Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.</p>
                  <p className="mt-4">Nullam efficitur, odio ut tempor facilisis, lorem ipsum aliquet libero, vitae vestibulum ipsum augue id elit. Aenean facilisis, magna at tincidunt vehicula, tortor felis feugiat velit, et molestie dolor mi sit amet lectus.</p>
                </div>
                <motion.button 
                  onClick={() => markAsRead('security')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-6 flex items-center text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-lg transition shadow-md"
                >
                  I've Read This Section <FaCheck className="ml-2" />
                </motion.button>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Agreement Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: allSectionsRead ? 1 : 0.5, 
            y: 0,
            scale: allSectionsRead ? 1 : 0.98
          }}
          transition={{ 
            duration: 0.5,
            delay: 0.1
          }}
          className="mt-8 bg-white p-6 rounded-xl shadow-md"
        >
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="agree" 
              className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
              disabled={!allSectionsRead}
            />
            <label htmlFor="agree" className="ml-3 text-gray-700 font-medium">
              I have read and agree to the Terms and Conditions
            </label>
          </div>
          <motion.button 
            whileHover={allSectionsRead ? { scale: 1.02 } : {}}
            whileTap={allSectionsRead ? { scale: 0.98 } : {}}
            className={`mt-4 w-full py-3 rounded-lg font-medium text-center ${allSectionsRead ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            disabled={!allSectionsRead}
          >
            Continue to Platform
          </motion.button>
        </motion.div>

        {/* Footer */}
        <footer className="mt-16 bg-gray-50 p-6 rounded-lg shadow-md text-center">
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <Link to="/contact" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            Contact Us
          </Link>
        </footer>
      </main>
    </motion.div>
  );
}