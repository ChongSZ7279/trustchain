import React, { useState, useEffect } from 'react';
import { verifyTransaction } from '../utils/contractInteraction';
import { ethers } from 'ethers';

const TransactionVerifier = ({ transactionHash, onVerificationComplete }) => {
  const [txHash, setTxHash] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  
  const handleVerify = async () => {
    if (!txHash) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setResult({ success: false, error: 'User not authenticated' });
        return;
      }

      const provider = new ethers.providers.JsonRpcProvider(
        `https://sepolia.infura.io/v3/${import.meta.env.REACT_APP_INFURA_PROJECT_ID || '7b6b2b41ec7246db9a517eef9aa00ae8'}`
      );

      const verification = await verifyTransaction(txHash, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setResult(verification);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const verifyTransaction = async () => {
      try {
        setVerifying(true);
        // Change from localhost to Sepolia testnet
        const provider = new ethers.providers.JsonRpcProvider(
          `https://sepolia.infura.io/v3/${import.meta.env.REACT_APP_INFURA_PROJECT_ID || '7b6b2b41ec7246db9a517eef9aa00ae8'}`
        );
        // ... existing code ...
      } catch (error) {
        // ... existing code ...
      }
    };
    
    // ... existing code ...
  }, [transactionHash]);
  
  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Verify Blockchain Transaction</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Transaction Hash
        </label>
        <input
          type="text"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          placeholder="0x..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <button
        onClick={handleVerify}
        disabled={loading || !txHash}
        className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
      >
        {loading ? 'Verifying...' : 'Verify Transaction'}
      </button>
      
      {result && (
        <div className="mt-4 p-4 border rounded-md">
          <h3 className="font-bold mb-2">
            {result.success ? 'Transaction Found' : 'Verification Failed'}
          </h3>
          
          {result.success ? (
            <div>
              <p className="mb-2">
                <span className="font-semibold">Status:</span> 
                {result.confirmed ? ' Confirmed ✅' : ' Pending ⏳'}
              </p>
              {result.blockNumber && (
                <p className="mb-2">
                  <span className="font-semibold">Block Number:</span> {result.blockNumber.toString()}
                </p>
              )}
              <p className="mb-2">
                <span className="font-semibold">From:</span> {result.transaction?.from}
              </p>
              <p className="mb-2">
                <span className="font-semibold">To:</span> {result.transaction?.to}
              </p>
              <p className="mb-2">
                <span className="font-semibold">Value:</span> {result.transaction?.value.toString()} Wei
              </p>
            </div>
          ) : (
            <p className="text-red-500">{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionVerifier; 