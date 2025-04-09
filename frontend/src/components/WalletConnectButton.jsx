import React from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { FaWallet, FaExclamationTriangle } from 'react-icons/fa';

const WalletConnectButton = () => {
  const { account, loading, error } = useBlockchain();

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        console.error('User denied account access', error);
      }
    } else {
      window.open('https://metamask.io/download.html', '_blank');
    }
  };

  if (loading) {
    return (
      <button 
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 opacity-75 cursor-not-allowed"
        disabled
      >
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </button>
    );
  }

  if (account) {
    return (
      <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600">
        <FaWallet className="mr-2" />
        {account.substring(0, 6)}...{account.substring(account.length - 4)}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={connectWallet}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <FaWallet className="mr-2" />
        Connect Wallet
      </button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center">
          <FaExclamationTriangle className="mr-1" />
          {error}
        </div>
      )}
      
      {!window.ethereum && (
        <div className="mt-2 text-xs text-gray-600">
          MetaMask not detected. Click to install.
        </div>
      )}
    </div>
  );
};

export default WalletConnectButton; 