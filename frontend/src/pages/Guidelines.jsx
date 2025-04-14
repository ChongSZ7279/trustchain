import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBook, 
  FaHandHoldingHeart, 
  FaBuilding, 
  FaLock, 
  FaChevronLeft, 
  FaChevronRight, 
  FaQuestionCircle,
  FaChevronDown,
  FaLayerGroup
} from 'react-icons/fa';

export default function Guidelines() {
  const [activeTab, setActiveTab] = useState('getting-started');
  
  const tabs = [
    { id: 'getting-started', label: 'Getting Started', icon: <FaBook /> },
    { id: 'donors', label: 'For Donors', icon: <FaHandHoldingHeart /> },
    { id: 'organizations', label: 'For Organizations', icon: <FaBuilding /> },
    { id: 'blockchain', label: 'Understanding Blockchain', icon: <FaLayerGroup /> },
    { id: 'privacy', label: 'Privacy & Security', icon: <FaLock /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
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
            TrustChain Guidelines
          </h1>
          <p className="mt-2 text-indigo-100 max-w-xl">
            Learn how to use TrustChain effectively and make the most of our blockchain-powered platform
            for transparent charitable giving.
          </p>
        </div>
      </motion.div>

      {/* Main content card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-xl shadow-md overflow-hidden mb-8"
      >
        {/* Tabs navigation */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto px-4 py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 mx-1 text-sm font-medium rounded-lg whitespace-nowrap transition-colors flex items-center ${
                  activeTab === tab.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Getting Started */}
              {activeTab === 'getting-started' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Getting Started</h2>
                  <p className="text-gray-700 mb-6">
                    Welcome to TrustChain, a platform designed to connect donors with charitable organizations 
                    using blockchain technology for transparency and trust.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        step: 1,
                        title: "Create an Account",
                        description: "Click on 'Register' in the navigation bar to begin your TrustChain journey."
                      },
                      {
                        step: 2,
                        title: "Choose Your Role",
                        description: "Select whether you're registering as an individual donor or an organization."
                      },
                      {
                        step: 3,
                        title: "Complete Your Profile",
                        description: "Add your details to personalize your TrustChain experience."
                      },
                      {
                        step: 4,
                        title: "Start Exploring",
                        description: "Discover organizations and charities from the main navigation menu."
                      }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-indigo-50 p-5 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <h3 className="font-semibold text-indigo-800 mb-3 flex items-center">
                          <span className="bg-indigo-200 text-indigo-800 rounded-full h-8 w-8 flex items-center justify-center mr-3">
                            {item.step}
                          </span>
                          {item.title}
                        </h3>
                        <p className="text-gray-700 ml-11">
                          {item.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* For Donors */}
              {activeTab === 'donors' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">For Donors</h2>
                  <p className="text-gray-700 mb-6">
                    As a donor, you can support charitable causes with confidence:
                  </p>
                  
                  <div className="space-y-4">
                    {[
                      {
                        title: "Browse Causes",
                        description: "Find organizations and charities that align with your values.",
                        icon: "🔍"
                      },
                      {
                        title: "Explore Missions",
                        description: "View detailed information about each charity's mission and impact.",
                        icon: "📋"
                      },
                      {
                        title: "Secure Donations",
                        description: "Make donations through our blockchain-based system for maximum security.",
                        icon: "🔒"
                      },
                      {
                        title: "Track Impact",
                        description: "Monitor your donation history and impact in your personal dashboard.",
                        icon: "📊"
                      },
                      {
                        title: "Stay Updated",
                        description: "Receive updates and proof of impact from organizations you support.",
                        icon: "📩"
                      }
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 text-indigo-800 text-xl">
                          {item.icon}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-800">{item.title}</h3>
                          <p className="mt-1 text-gray-600">{item.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* For Organizations */}
              {activeTab === 'organizations' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">For Organizations</h2>
                  <p className="text-gray-700 mb-6">
                    As a charitable organization, you can:
                  </p>
                  
                  <div className="space-y-4">
                    {[
                      {
                        title: "Create Your Profile",
                        description: "Showcase your mission and impact with a detailed profile.",
                        icon: "🏢"
                      },
                      {
                        title: "Manage Charities",
                        description: "Add charitable projects and fundraising campaigns to drive support.",
                        icon: "📢"
                      },
                      {
                        title: "Provide Updates",
                        description: "Share transparent updates on how donations are being used.",
                        icon: "📝"
                      },
                      {
                        title: "Verify Impact",
                        description: "Upload verification documents and evidence of your work's impact.",
                        icon: "✅"
                      },
                      {
                        title: "Build Trust",
                        description: "Establish donor confidence through blockchain-verified transactions.",
                        icon: "🤝"
                      },
                      {
                        title: "Access Analytics",
                        description: "View comprehensive reports on your fundraising efforts.",
                        icon: "📈"
                      }
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 text-indigo-800 text-xl">
                          {item.icon}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-800">{item.title}</h3>
                          <p className="mt-1 text-gray-600">{item.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Understanding Blockchain */}
              {activeTab === 'blockchain' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Understanding Blockchain</h2>
                  <p className="text-gray-700 mb-6">
                    TrustChain uses blockchain technology to ensure transparency and trust:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        title: "Immutable Records",
                        description: "All donations are recorded on a secure, immutable blockchain that cannot be altered.",
                        icon: "📜"
                      },
                      {
                        title: "Smart Contracts",
                        description: "Automated agreements ensure funds are used exactly as intended.",
                        icon: "📑"
                      },
                      {
                        title: "Verification System",
                        description: "Special badges indicate blockchain-verified organizations you can trust.",
                        icon: "🛡️"
                      },
                      {
                        title: "Transaction History",
                        description: "View the complete transaction history for any charity at any time.",
                        icon: "🔍"
                      }
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-indigo-50 p-6 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="text-3xl mb-3">{item.icon}</div>
                        <h3 className="text-lg font-semibold text-indigo-800">{item.title}</h3>
                        <p className="mt-2 text-gray-700">{item.description}</p>
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg"
                  >
                    <p className="text-blue-800 font-medium">
                      New to blockchain? Check out our <a href="/blockchain-basics" className="underline">Blockchain Basics</a> guide to learn more.
                    </p>
                  </motion.div>
                </div>
              )}
              
              {/* Privacy & Security */}
              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Privacy & Security</h2>
                  <p className="text-gray-700 mb-6">
                    We take your privacy and security seriously:
                  </p>
                  
                  <div className="space-y-5">
                    {[
                      {
                        title: "Encryption",
                        description: "Your personal information is protected with industry-standard encryption",
                        icon: "🔐"
                      },
                      {
                        title: "Privacy Controls",
                        description: "You control what information is visible on your public profile",
                        icon: "👤"
                      },
                      {
                        title: "Two-Factor Authentication",
                        description: "Additional security is available through 2FA",
                        icon: "🔒"
                      },
                      {
                        title: "Secure Transactions",
                        description: "All financial transactions are processed through secure channels",
                        icon: "💳"
                      },
                      {
                        title: "Data Protection",
                        description: "We never share your data with third parties without your consent",
                        icon: "🛡️"
                      }
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex p-4 bg-gray-50 rounded-lg border-l-4 border-green-500 hover:shadow-md transition-shadow"
                      >
                        <div className="flex-shrink-0 text-2xl mr-4">{item.icon}</div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{item.title}</h3>
                          <p className="text-gray-600">{item.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 p-4 bg-gray-100 rounded-lg text-center"
                  >
                    <p className="text-gray-700">
                      For more details, please review our <a href="/terms" className="text-blue-600 hover:underline font-medium">Terms and Conditions</a> and <a href="/privacy" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>.
                    </p>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Footer with navigation controls */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <button 
            onClick={() => {
              const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
              if (currentIndex > 0) {
                setActiveTab(tabs[currentIndex - 1].id);
              }
            }}
            disabled={tabs.findIndex(tab => tab.id === activeTab) === 0}
            className={`px-4 py-2 rounded flex items-center ${
              tabs.findIndex(tab => tab.id === activeTab) === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <FaChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </button>
          
          <div className="text-sm text-gray-500">
            {tabs.findIndex(tab => tab.id === activeTab) + 1} of {tabs.length}
          </div>
          
          <button 
            onClick={() => {
              const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
              if (currentIndex < tabs.length - 1) {
                setActiveTab(tabs[currentIndex + 1].id);
              }
            }}
            disabled={tabs.findIndex(tab => tab.id === activeTab) === tabs.length - 1}
            className={`px-4 py-2 rounded flex items-center ${
              tabs.findIndex(tab => tab.id === activeTab) === tabs.length - 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            Next
            <FaChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </motion.div>

      {/* FAQ Button Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-6xl mx-auto bg-indigo-50 rounded-lg shadow-sm border border-indigo-100 p-6 text-center"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Have Questions?</h2>
        <p className="text-gray-700 mb-5">
          Check out our Frequently Asked Questions section for quick answers to common questions.
        </p>
        <Link 
          to="/faq" 
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          <FaQuestionCircle className="mr-2" />
          View FAQ
        </Link>
      </motion.div>
    </motion.div>
  );
}