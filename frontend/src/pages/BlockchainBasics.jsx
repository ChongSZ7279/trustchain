import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function BlockchainBasics() {
  const [activeSection, setActiveSection] = useState('what-is-blockchain');
  
  const sections = [
    { id: 'what-is-blockchain', label: 'What is Blockchain?' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'benefits', label: 'Benefits' },
    { id: 'crypto-volatility', label: 'Cryptocurrency Volatility' },
    { id: 'trustchain-approach', label: 'TrustChain Approach' },
  ];

  return (
    <>
    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header with better spacing and styling */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white">
        <h1 className="text-3xl font-bold">Blockchain Basics</h1>
        <p className="mt-2 text-lg opacity-90">Understanding the technology behind TrustChain</p>
      </div>
      
      {/* Tabs navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto py-2 px-4">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 mx-1 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Content sections */}
      <div className="px-6 py-6">
        {/* What is Blockchain */}
        {activeSection === 'what-is-blockchain' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800">What is Blockchain?</h2>
            <p className="mt-3 text-gray-700">
              Blockchain is a digital ledger technology that records transactions across many computers 
              in a way that ensures the data cannot be altered retroactively.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
              <p className="text-blue-800">
                <strong>Think of it as:</strong> A digital record book where entries are permanent, 
                transparent, and verified by a community rather than a single authority.
              </p>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">Key Features</h3>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="bg-blue-50 p-5 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <span className="bg-blue-200 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center mr-3">🌐</span>
                  Decentralized
                </h3>
                <p className="text-gray-700 ml-11">
                  No single entity controls the entire network
                </p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <span className="bg-blue-200 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center mr-3">👁️</span>
                  Transparent
                </h3>
                <p className="text-gray-700 ml-11">
                  All transactions are visible to anyone on the network
                </p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <span className="bg-blue-200 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center mr-3">🔒</span>
                  Immutable
                </h3>
                <p className="text-gray-700 ml-11">
                  Once recorded, data cannot be altered or deleted
                </p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <span className="bg-blue-200 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center mr-3">🛡️</span>
                  Secure
                </h3>
                <p className="text-gray-700 ml-11">
                  Uses cryptography to protect data integrity
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="aspect-w-16 aspect-h-9">
                <iframe 
                  className="w-full h-64 md:h-96 rounded-lg shadow-sm"
                  src="https://www.youtube.com/embed/SSo_EIwHSd4" 
                  title="Blockchain Explained"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen>
                </iframe>
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Visual explanation of how blockchain technology works
              </p>
            </div>
          </div>
        )}
        
        {/* How It Works */}
        {activeSection === 'how-it-works' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800">How Blockchain Works</h2>
            <p className="mt-3 text-gray-700">
              Blockchain operates through a series of connected steps that ensure security and transparency:
            </p>
            
            <div className="mt-6 space-y-4">
              {[
                {
                  step: 1,
                  title: "Transaction Initiation",
                  description: "Someone requests a transaction (like a donation to a charity)",
                  icon: "💸"
                },
                {
                  step: 2,
                  title: "Block Creation",
                  description: "The transaction is grouped with others into a 'block'",
                  icon: "📦"
                },
                {
                  step: 3,
                  title: "Verification",
                  description: "The network of computers validates the transaction using known algorithms",
                  icon: "✅"
                },
                {
                  step: 4,
                  title: "Block Addition",
                  description: "The verified block is added to the existing chain, creating a permanent record",
                  icon: "⛓️"
                },
                {
                  step: 5,
                  title: "Transaction Completion",
                  description: "The transaction is complete and becomes part of the permanent ledger",
                  icon: "🏁"
                }
              ].map((item, index) => (
                <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 text-indigo-800 text-xl">
                    {item.step}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                      {item.title} <span className="ml-2 text-xl">{item.icon}</span>
                    </h3>
                    <p className="mt-1 text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
              <h3 className="font-medium text-yellow-800">Simplified Explanation</h3>
              <p className="text-gray-700 mt-1">
                Imagine a public notebook where everyone can see what's written, but once something is written, 
                it cannot be erased or changed. Each new page (block) references the previous page, 
                creating a chain that anyone can verify.
              </p>
            </div>
          </div>
        )}
        
        {/* Benefits */}
        {activeSection === 'benefits' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Benefits of Blockchain for Charity</h2>
            <p className="mt-3 text-gray-700">
              Blockchain technology offers several advantages that make it ideal for charitable giving:
            </p>
            
            <div className="mt-6 space-y-4">
              {[
                {
                  title: "Transparency",
                  description: "Donors can see exactly where their money goes and how it's used",
                  icon: "👁️"
                },
                {
                  title: "Reduced Fraud",
                  description: "The immutable nature of blockchain prevents tampering with records",
                  icon: "🛑"
                },
                {
                  title: "Lower Costs",
                  description: "Fewer intermediaries means more of your donation reaches its destination",
                  icon: "💰"
                },
                {
                  title: "Global Access",
                  description: "Anyone with internet access can participate, regardless of location",
                  icon: "🌍"
                },
                {
                  title: "Trust Building",
                  description: "Verified impact reports build confidence in charitable organizations",
                  icon: "🤝"
                },
                {
                  title: "Efficiency",
                  description: "Automated processes reduce administrative overhead",
                  icon: "⚡"
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
            
            <div className="mt-6 bg-green-50 p-5 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Real-World Impact</h3>
              <p className="text-gray-700">
                With blockchain, charitable organizations can provide proof of impact through 
                verifiable records of how donations were used and what outcomes were achieved.
              </p>
              <p className="text-gray-700 mt-2">
                This creates a virtuous cycle: increased transparency leads to greater trust, 
                which encourages more donations and ultimately helps more people in need.
              </p>
            </div>
          </div>
        )}
        
        {/* Cryptocurrency Volatility */}
        {activeSection === 'crypto-volatility' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Understanding Cryptocurrency Volatility</h2>
            <p className="mt-3 text-gray-700">
              While blockchain technology is secure, cryptocurrency values can be highly volatile:
            </p>
            
            <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
              <h3 className="font-medium text-red-800">Important Notice</h3>
              <p className="text-gray-700 mt-1">
                Cryptocurrency values can fluctuate dramatically, sometimes changing by 10-20% in a single day. 
                This volatility is an important consideration when using blockchain technology.
              </p>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">What Causes Volatility?</h3>
            <div className="mt-4 space-y-4">
              {[
                {
                  title: "Market Speculation",
                  description: "Many people buy cryptocurrencies hoping their value will increase",
                  icon: "📈"
                },
                {
                  title: "Regulatory Changes",
                  description: "Government decisions about cryptocurrency regulation can impact prices",
                  icon: "📜"
                },
                {
                  title: "Media Coverage",
                  description: "News and social media can drive rapid price changes",
                  icon: "📰"
                },
                {
                  title: "Market Size",
                  description: "Cryptocurrency markets are smaller than traditional markets, making them more susceptible to large trades",
                  icon: "🏪"
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
            
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">Protecting Yourself</h3>
            <div className="bg-indigo-50 p-5 rounded-lg">
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">✓</span>
                  <span>Be aware that cryptocurrency values can change rapidly</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">✓</span>
                  <span>Only invest what you can afford to lose</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">✓</span>
                  <span>Consider stablecoins (cryptocurrencies designed to maintain stable value)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">✓</span>
                  <span>Research thoroughly before making cryptocurrency transactions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">✓</span>
                  <span>Use reputable exchanges and wallets with strong security measures</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-6 border border-gray-200 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Volatility Chart Example</h3>
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <svg className="w-full h-64 mx-auto" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50,350 L100,300 L150,320 L200,100 L250,200 L300,150 L350,250 L400,50 L450,150 L500,100 L550,200 L600,50 L650,250 L700,150 L750,200" 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="3" />
                  <text x="400" y="380" textAnchor="middle" fill="#4b5563">Time</text>
                  <text x="30" y="200" textAnchor="middle" fill="#4b5563" transform="rotate(-90 30,200)">Price</text>
                </svg>
                <p className="text-sm text-gray-500 mt-2">
                  Simplified illustration of cryptocurrency price volatility over time
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* TrustChain Approach */}
        {activeSection === 'trustchain-approach' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800">TrustChain's Blockchain Approach</h2>
            <p className="mt-3 text-gray-700">
              TrustChain uses blockchain technology to enhance charitable giving while minimizing risks:
            </p>
            
            <div className="mt-6 space-y-4">
              {[
                {
                  title: "Transparency Without Volatility",
                  description: "We use blockchain for record-keeping while allowing donations in stable currencies",
                  icon: "🛡️"
                },
                {
                  title: "Smart Contracts",
                  description: "Automated agreements ensure funds are used exactly as intended by donors",
                  icon: "📝"
                },
                {
                  title: "Verification System",
                  description: "Our platform verifies charitable organizations and tracks their impact",
                  icon: "✅"
                },
                {
                  title: "User-Friendly Interface",
                  description: "You don't need to understand blockchain technology to use TrustChain effectively",
                  icon: "🖥️"
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
            
            <div className="mt-6 bg-green-50 border border-green-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Our Commitment</h3>
              <p className="text-gray-700">
                TrustChain is committed to providing the benefits of blockchain technology while 
                protecting our users from the risks of cryptocurrency volatility.
              </p>
              <p className="text-gray-700 mt-3">
                We believe that transparency and trust are essential for effective charitable giving, 
                and our platform is designed to maximize both without exposing donors or organizations 
                to unnecessary financial risk.
              </p>
              <div className="mt-4 pt-4 border-t border-green-200">
                <Link 
                  to="/register" 
                  className="inline-block px-5 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Join TrustChain Today
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer with navigation controls */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <button 
          onClick={() => {
            const currentIndex = sections.findIndex(section => section.id === activeSection);
            if (currentIndex > 0) {
              setActiveSection(sections[currentIndex - 1].id);
            }
          }}
          disabled={sections.findIndex(section => section.id === activeSection) === 0}
          className={`px-4 py-2 rounded flex items-center ${
            sections.findIndex(section => section.id === activeSection) === 0
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
          {sections.findIndex(section => section.id === activeSection) + 1} of {sections.length}
        </div>
        
        <button 
          onClick={() => {
            const currentIndex = sections.findIndex(section => section.id === activeSection);
            if (currentIndex < sections.length - 1) {
              setActiveSection(sections[currentIndex + 1].id);
            }
          }}
          disabled={sections.findIndex(section => section.id === activeSection) === sections.length - 1}
          className={`px-4 py-2 rounded flex items-center ${
            sections.findIndex(section => section.id === activeSection) === sections.length - 1
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
      <h2 className="text-2xl font-semibold text-gray-800 mb-3">Still Have Questions?</h2>
      <p className="text-gray-700 mb-5">
        Check out our Frequently Asked Questions section for more information about blockchain and cryptocurrency.
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