import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaShieldAlt, FaHandshake, FaUserShield, FaArrowRight, FaCheck } from 'react-icons/fa';

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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Sidebar with Glass Effect*/}
      <aside className="w-72 bg-white/80 backdrop-blur-md shadow-lg rounded-lg overflow-y-auto p-6 fixed">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Navigation</h2>
        <ul className="space-y-4">
          <li>
            <button 
              onClick={() => setActiveSection('terms')}
              className={`w-full text-left flex items-center justify-between text-lg font-medium ${activeSection === 'terms' ? 'text-blue-600' : 'text-gray-700'} hover:text-blue-600 transition p-2 rounded-lg ${activeSection === 'terms' ? 'bg-blue-50' : ''}`}
            >
              <span><FaHandshake className="inline mr-2" /> Terms of Service</span>
              {readSections.terms && <FaCheck className="text-green-500" />}
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveSection('privacy')}
              className={`w-full text-left flex items-center justify-between text-lg font-medium ${activeSection === 'privacy' ? 'text-blue-600' : 'text-gray-700'} hover:text-blue-600 transition p-2 rounded-lg ${activeSection === 'privacy' ? 'bg-blue-50' : ''}`}
            >
              <span><FaShieldAlt className="inline mr-2" /> Privacy Policy</span>
              {readSections.privacy && <FaCheck className="text-green-500" />}
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveSection('security')}
              className={`w-full text-left flex items-center justify-between text-lg font-medium ${activeSection === 'security' ? 'text-blue-600' : 'text-gray-700'} hover:text-blue-600 transition p-2 rounded-lg ${activeSection === 'security' ? 'bg-blue-50' : ''}`}
            >
              <span><FaUserShield className="inline mr-2" /> Data Security</span>
              {readSections.security && <FaCheck className="text-green-500" />}
            </button>
          </li>
        </ul>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-700">Reading Progress</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${(Object.values(readSections).filter(Boolean).length / 3) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {allSectionsRead ? 'All sections read!' : 'Please read all sections'}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 ml-80">
        {/* Header */}
        <div className="bg-white shadow-md p-8 rounded-xl text-center">
          <h1 className="text-4xl font-extrabold text-blue-700 flex items-center justify-center">
            <FaBook className="mr-3 text-blue-500" /> Terms and Conditions
          </h1>
          <p className="mt-3 text-gray-600">Please read these terms carefully before using our platform.</p>
        </div>

        {/* Sections */}
        <div className="mt-12 space-y-12">
          {/* Terms Section */}
          <section 
            id="terms" 
            className={`bg-white p-8 shadow-lg rounded-xl transition-all duration-300 ${activeSection === 'terms' ? 'scale-100 opacity-100 border-l-4 border-blue-500' : 'scale-95 opacity-70'}`}
          >
            <h2 className="text-2xl font-bold text-blue-700 flex items-center mb-4">
              <FaHandshake className="mr-2 text-blue-500" /> Terms of Service
            </h2>
            <div className="prose max-w-none text-gray-600">
              <p>Welcome to TrustChain. By accessing our platform, you agree to these terms.</p>
              <p className="mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.</p>
              <p className="mt-4">Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.</p>
            </div>
            <button 
              onClick={() => {
                markAsRead('terms');
                setActiveSection('privacy');
              }}
              className="mt-6 flex items-center text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
            >
              I've Read This Section <FaArrowRight className="ml-2" />
            </button>
          </section>

          {/* Privacy Section */}
          <section 
            id="privacy" 
            className={`bg-white p-8 shadow-lg rounded-xl transition-all duration-300 ${activeSection === 'privacy' ? 'scale-100 opacity-100 border-l-4 border-blue-500' : 'scale-95 opacity-70'}`}
          >
            <h2 className="text-2xl font-bold text-blue-700 flex items-center mb-4">
              <FaShieldAlt className="mr-2 text-blue-500" /> Privacy Policy
            </h2>
            <div className="prose max-w-none text-gray-600">
              <p>Your privacy is important to us. This section explains how we collect and protect your data.</p>
              <p className="mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.</p>
              <p className="mt-4">Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.</p>
            </div>
            <button 
              onClick={() => {
                markAsRead('privacy');
                setActiveSection('security');
              }}
              className="mt-6 flex items-center text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
            >
              I've Read This Section <FaArrowRight className="ml-2" />
            </button>
          </section>

          {/* Data Security Section */}
          <section 
            id="security" 
            className={`bg-white p-8 shadow-lg rounded-xl transition-all duration-300 ${activeSection === 'security' ? 'scale-100 opacity-100 border-l-4 border-blue-500' : 'scale-95 opacity-70'}`}
          >
            <h2 className="text-2xl font-bold text-blue-700 flex items-center mb-4">
              <FaUserShield className="mr-2 text-blue-500" /> Data Security
            </h2>
            <div className="prose max-w-none text-gray-600">
              <p>We implement strict security measures to keep your data safe.</p>
              <p className="mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.</p>
              <p className="mt-4">Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.</p>
            </div>
            <button 
              onClick={() => markAsRead('security')}
              className="mt-6 flex items-center text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
            >
              I've Read This Section <FaCheck className="ml-2" />
            </button>
          </section>
        </div>

        {/* Agreement Section */}
        <div className={`mt-8 bg-white p-6 rounded-xl shadow-md transition-all duration-500 ${allSectionsRead ? 'opacity-100' : 'opacity-50'}`}>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="agree" 
              className="h-5 w-5 text-blue-600 rounded"
              disabled={!allSectionsRead}
            />
            <label htmlFor="agree" className="ml-2 text-gray-700">
              I have read and agree to the Terms and Conditions
            </label>
          </div>
          <button 
            className={`mt-4 w-full py-3 rounded-lg font-medium ${allSectionsRead ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            disabled={!allSectionsRead}
          >
            Continue to Platform
          </button>
        </div>

        {/* Footer */}
        <footer className="mt-16 bg-gray-50 p-4 text-center rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
          <Link to="/contact" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Contact Us
          </Link>
        </footer>
      </main>
    </div>
  );
}
