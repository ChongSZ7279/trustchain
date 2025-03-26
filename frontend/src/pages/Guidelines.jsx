import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Guidelines() {
  const [activeTab, setActiveTab] = useState('getting-started');
  
  const tabs = [
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'donors', label: 'For Donors' },
    { id: 'organizations', label: 'For Organizations' },
    { id: 'blockchain', label: 'Understanding Blockchain' },
    { id: 'privacy', label: 'Privacy & Security' },
    // { id: 'help', label: 'Getting Help' },
  ];

  return (
    <>
    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header with better spacing and styling */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white">
        <h1 className="text-3xl font-bold">Website Guidelines</h1>
        <p className="mt-2 text-lg opacity-90">How to use TrustChain effectively</p>
      </div>
      
      {/* Tabs navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto py-2 px-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 mx-1 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Content sections */}
      <div className="px-6 py-6">
        {/* Getting Started */}
        {activeTab === 'getting-started' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Getting Started</h2>
            <p className="mt-3 text-gray-700">
              Welcome to TrustChain, a platform designed to connect donors with charitable organizations 
              using blockchain technology for transparency and trust.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="bg-blue-50 p-5 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <span className="bg-blue-200 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center mr-3">1</span>
                  Create an Account
                </h3>
                <p className="text-gray-700 ml-11">
                  Click on "Register" in the navigation bar to begin your TrustChain journey.
                </p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <span className="bg-blue-200 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center mr-3">2</span>
                  Choose Your Role
                </h3>
                <p className="text-gray-700 ml-11">
                  Select whether you're registering as an individual donor or an organization.
                </p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <span className="bg-blue-200 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center mr-3">3</span>
                  Complete Your Profile
                </h3>
                <p className="text-gray-700 ml-11">
                  Add your details to personalize your TrustChain experience.
                </p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <span className="bg-blue-200 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center mr-3">4</span>
                  Start Exploring
                </h3>
                <p className="text-gray-700 ml-11">
                  Discover organizations and charities from the main navigation menu.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* For Donors */}
        {activeTab === 'donors' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800">For Donors</h2>
            <p className="mt-3 text-gray-700">
              As a donor, you can support charitable causes with confidence:
            </p>
            <div className="mt-6 space-y-4">
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
                <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 text-indigo-800 text-xl">
                    {item.icon}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-800">{item.title}</h3>
                    <p className="mt-1 text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* For Organizations */}
        {activeTab === 'organizations' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800">For Organizations</h2>
            <p className="mt-3 text-gray-700">
              As a charitable organization, you can:
            </p>
            <div className="mt-6 space-y-4">
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
                <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 text-indigo-800 text-xl">
                    {item.icon}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-800">{item.title}</h3>
                    <p className="mt-1 text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Understanding Blockchain */}
        {activeTab === 'blockchain' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Understanding Blockchain</h2>
            <p className="mt-3 text-gray-700">
              TrustChain uses blockchain technology to ensure transparency and trust:
            </p>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
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
                <div key={index} className="bg-indigo-50 p-6 rounded-lg">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-indigo-800">{item.title}</h3>
                  <p className="mt-2 text-gray-700">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-blue-800 font-medium">
                New to blockchain? Check out our <a href="/blockchain-basics" className="underline">Blockchain Basics</a> guide to learn more.
              </p>
            </div>
          </div>
        )}
        
        {/* Privacy & Security */}
        {activeTab === 'privacy' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Privacy & Security</h2>
            <p className="mt-3 text-gray-700">
              We take your privacy and security seriously:
            </p>
            <div className="mt-6 space-y-5">
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
                <div key={index} className="flex p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex-shrink-0 text-2xl mr-4">{item.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-gray-100 rounded-lg text-center">
              <p className="text-gray-700">
                For more details, please review our <a href="/terms" className="text-blue-600 hover:underline font-medium">Terms and Conditions</a> and <a href="/privacy" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>.
              </p>
            </div>
          </div>
        )}
        
        {/* Getting Help
        {activeTab === 'help' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Getting Help</h2>
            <p className="mt-3 text-gray-700">
              If you need assistance using TrustChain:
            </p>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">Check our FAQ</h3>
                </div>
                <p className="text-gray-600">
                  Find answers to common questions in our comprehensive FAQ section.
                </p>
                <Link 
                  to="/faq" 
                  className="inline-block mt-4 px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Browse FAQs
                </Link>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">Email Support</h3>
                  </div>
                  <p className="text-gray-600">
                    Reach out to our support team for personalized assistance.
                  </p>
                  <a href="mailto:support@trustchain.org" className="inline-block mt-4 px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium">
                    Email Us
                  </a>
                </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">Live Chat</h3>
                </div>
                <p className="text-gray-600">
                  Get immediate assistance through our live chat feature.
                </p>
                <button className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                  Start Chat
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">Help Center</h3>
                </div>
                <p className="text-gray-600">
                  Browse our comprehensive knowledge base and tutorials.
                </p>
                <a href="/help" className="inline-block mt-4 px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium">
                  Visit Help Center
                </a>
              </div>
            </div>
            <div className="mt-8 bg-indigo-50 p-5 rounded-lg text-center">
              <h3 className="font-semibold text-indigo-800 text-lg mb-2">Need urgent assistance?</h3>
              <p className="text-gray-700 mb-4">Our support team is available Monday through Friday, 9AM-5PM EST.</p>
              <a href="/contact" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium">
                Contact Support
              </a>
            </div>
          </div>
        )} */}
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
              : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
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
              : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          Next
          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>

    </div>

      {/* FAQ Button Section */}
      <div className="max-w-6xl mx-auto mt-10 bg-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Have Questions?</h2>
        <p className="text-gray-700 mb-5">
          Check out our Frequently Asked Questions section for quick answers to common questions.
        </p>
        <Link 
          to="/faq" 
          className="inline-block px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          View FAQ
        </Link>
      </div>
    </>
  );
}