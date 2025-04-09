import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { FaWallet, FaExclamationTriangle, FaCheck, FaCopy } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const WalletManagement = ({ userWalletAddress, onWalletUpdate }) => {
  const { account } = useBlockchain();
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleConnectCurrentWallet = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    setUpdating(true);
    try {
      const response = await axios.post('/api/update-wallet', {
        wallet_address: account
      });
      
      toast.success('Wallet address updated successfully');
      if (onWalletUpdate) onWalletUpdate(account);
      
    } catch (error) {
      console.error('Error updating wallet address:', error);
      toast.error('Failed to update wallet address');
    } finally {
      setUpdating(false);
    }
  };

  const handleManualUpdate = async (e) => {
    e.preventDefault();
    
    if (!newWalletAddress || !newWalletAddress.startsWith('0x')) {
      toast.error('Please enter a valid Ethereum wallet address');
      return;
    }
    
    setUpdating(true);
    try {
      const response = await axios.post('/api/update-wallet', {
        wallet_address: newWalletAddress
      });
      
      toast.success('Wallet address updated successfully');
      if (onWalletUpdate) onWalletUpdate(newWalletAddress);
      setNewWalletAddress('');
      
    } catch (error) {
      console.error('Error updating wallet address:', error);
      toast.error('Failed to update wallet address');
    } finally {
      setUpdating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Wallet address copied to clipboard');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Wallet Management</h3>
      
      {userWalletAddress ? (
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-start">
            <FaCheck className="text-green-500 mt-1 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-800">Wallet Connected</p>
              <div className="mt-1 flex items-center">
                <p className="text-sm text-green-700 font-mono">
                  {userWalletAddress}
                </p>
                <button 
                  onClick={() => copyToClipboard(userWalletAddress)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <FaCopy />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-yellow-500 mt-1 mr-2" />
            <div>
              <p className="text-sm font-medium text-yellow-800">No Wallet Connected</p>
              <p className="mt-1 text-sm text-yellow-700">
                Connect a wallet to receive funds from donations or to make donations.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Connect Current Wallet</h4>
          <div className="flex items-center">
            <div className="mr-4">
              {account ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <FaWallet className="mr-1" />
                  {account.substring(0, 6)}...{account.substring(account.length - 4)}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <FaWallet className="mr-1" />
                  Not Connected
                </span>
              )}
            </div>
            <button
              onClick={handleConnectCurrentWallet}
              disabled={!account || updating}
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                !account || updating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {updating ? 'Updating...' : 'Use This Wallet'}
            </button>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Manually Enter Wallet Address</h4>
          <form onSubmit={handleManualUpdate} className="flex">
            <input
              type="text"
              value={newWalletAddress}
              onChange={(e) => setNewWalletAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <button
              type="submit"
              disabled={updating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {updating ? 'Updating...' : 'Update'}
            </button>
          </form>
          <p className="mt-1 text-xs text-gray-500">
            Enter your Ethereum wallet address starting with 0x
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletManagement; 