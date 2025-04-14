import React, { useState } from 'react';
import { FaExchangeAlt, FaCreditCard, FaEthereum, FaShieldAlt, FaChartLine, 
         FaLock, FaQuestionCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FiatToScrollExplainer = () => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-indigo-100">
      <div 
        className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 flex justify-between items-center cursor-pointer hover:bg-indigo-100 transition-colors duration-200"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="flex items-center">
          <div className="bg-indigo-100 p-2 rounded-full mr-3">
            <FaExchangeAlt className="text-indigo-600" />
          </div>
          <h3 className="font-semibold text-indigo-900">How Fiat to Scroll Conversion Works</h3>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-indigo-700 mr-2">{expanded ? 'Hide details' : 'Learn more'}</span>
          {expanded ? <FaChevronUp className="text-indigo-500" /> : <FaChevronDown className="text-indigo-500" />}
        </div>
      </div>
      
      {expanded && (
        <div className="p-5 animate-fadeIn">
          <div className="bg-indigo-50 p-4 rounded-lg mb-5">
            <p className="text-indigo-800">
              Fiat to Scroll conversion allows you to make donations using your regular currency (like USD) 
              while still benefiting from blockchain transparency and security.
            </p>
          </div>
          
          <h4 className="font-semibold text-gray-800 mb-3">How It Works:</h4>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="bg-indigo-100 p-3 rounded-full mr-4 mt-1 flex-shrink-0">
                <FaCreditCard className="text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">1. Pay with Your Card</p>
                <p className="text-gray-600">Make a donation using your credit/debit card in your preferred currency. No cryptocurrency wallet needed!</p>
              </div>
            </div>
            
            <div className="flex items-start bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="bg-indigo-100 p-3 rounded-full mr-4 mt-1 flex-shrink-0">
                <FaExchangeAlt className="text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">2. Automatic Conversion</p>
                <p className="text-gray-600">Our system automatically converts your donation to Scroll cryptocurrency at the current exchange rate, with full transparency.</p>
              </div>
            </div>
            
            <div className="flex items-start bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="bg-indigo-100 p-3 rounded-full mr-4 mt-1 flex-shrink-0">
                <FaEthereum className="text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">3. Blockchain Transaction</p>
                <p className="text-gray-600">The Scroll is securely stored on the blockchain, providing a permanent, transparent record of your donation that can be verified anytime.</p>
              </div>
            </div>
          </div>
          
          <h4 className="font-semibold text-gray-800 mb-3">Benefits:</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start bg-green-50 p-3 rounded-lg">
              <FaShieldAlt className="text-green-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Enhanced Security</p>
                <p className="text-sm text-green-700">Your donation is secured by blockchain technology</p>
              </div>
            </div>
            
            <div className="flex items-start bg-green-50 p-3 rounded-lg">
              <FaLock className="text-green-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Transparent Allocation</p>
                <p className="text-sm text-green-700">See exactly where your donation goes</p>
              </div>
            </div>
            
            <div className="flex items-start bg-green-50 p-3 rounded-lg">
              <FaChartLine className="text-green-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Potential Growth</p>
                <p className="text-sm text-green-700">Your donation may increase in value over time</p>
              </div>
            </div>
            
            <div className="flex items-start bg-green-50 p-3 rounded-lg">
              <FaExchangeAlt className="text-green-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">No Crypto Knowledge Needed</p>
                <p className="text-sm text-green-700">Easy process with your regular payment card</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center mb-2">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <FaEthereum className="text-blue-700" />
              </div>
              <p className="font-medium text-blue-800">Why Scroll?</p>
            </div>
            <p className="text-blue-700 ml-12">
              Scroll is a layer 2 scaling solution for Ethereum that offers faster transaction times and lower fees, making it ideal for donations of any size. It combines the security of Ethereum with improved efficiency.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiatToScrollExplainer;