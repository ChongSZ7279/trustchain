import React, { useState } from 'react';
import { FaExchangeAlt, FaCreditCard, FaEthereum, FaShieldAlt, FaChartLine, FaLock, FaQuestionCircle } from 'react-icons/fa';

const FiatToScrollExplainer = () => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div 
        className="px-4 py-3 bg-indigo-50 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <FaExchangeAlt className="text-indigo-600 mr-2" />
          <h3 className="font-medium text-indigo-900">What is Fiat to Scroll Conversion?</h3>
        </div>
        <FaQuestionCircle className="text-indigo-500" />
      </div>
      
      {expanded && (
        <div className="p-4">
          <p className="text-gray-700 mb-4">
            Fiat to Scroll conversion allows you to make donations using your regular currency (like USD) 
            while still benefiting from blockchain transparency and security.
          </p>
          
          <h4 className="font-medium text-gray-800 mb-2">How It Works:</h4>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-start">
              <div className="bg-indigo-100 p-2 rounded-full mr-3 mt-1">
                <FaCreditCard className="text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">1. Pay with Your Card</p>
                <p className="text-sm text-gray-600">Make a donation using your credit/debit card in your preferred currency.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-indigo-100 p-2 rounded-full mr-3 mt-1">
                <FaExchangeAlt className="text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">2. Automatic Conversion</p>
                <p className="text-sm text-gray-600">Our system automatically converts your donation to Scroll cryptocurrency at the current exchange rate.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-indigo-100 p-2 rounded-full mr-3 mt-1">
                <FaEthereum className="text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">3. Blockchain Transaction</p>
                <p className="text-sm text-gray-600">The Scroll is stored on the blockchain, providing a permanent, transparent record of your donation.</p>
              </div>
            </div>
          </div>
          
          <h4 className="font-medium text-gray-800 mb-2">Benefits:</h4>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-start">
              <FaShieldAlt className="text-green-500 mr-2 mt-1" />
              <p className="text-sm">Enhanced security through blockchain technology</p>
            </div>
            
            <div className="flex items-start">
              <FaLock className="text-green-500 mr-2 mt-1" />
              <p className="text-sm">Transparent fund allocation</p>
            </div>
            
            <div className="flex items-start">
              <FaChartLine className="text-green-500 mr-2 mt-1" />
              <p className="text-sm">Potential crypto appreciation</p>
            </div>
            
            <div className="flex items-start">
              <FaExchangeAlt className="text-green-500 mr-2 mt-1" />
              <p className="text-sm">No need for a crypto wallet</p>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
            <p className="font-medium mb-1">Why Scroll?</p>
            <p>Scroll is a layer 2 scaling solution for Ethereum that offers faster transaction times and lower fees, making it ideal for donations of any size.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiatToScrollExplainer; 