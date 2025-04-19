import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { DonationContractABI } from '../contracts/DonationContractABI';

export default function BlockchainTester() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('');
  const [donationAmount, setDonationAmount] = useState('0.01');
  const [donationMessage, setDonationMessage] = useState('Test donation');
  const [donationCount, setDonationCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const init = async () => {
      console.log("Environment variables:", {
        VITE_CONTRACT_ADDRESS: import.meta.env.VITE_CONTRACT_ADDRESS,
        VITE_API_URL: import.meta.env.VITE_API_URL,
      });

      if (window.ethereum) {
        try {
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const account = accounts[0];
          setAccount(account);

          // Create provider and signer - compatible with ethers v5 or v6
          let provider;
          let signer;

          // Check ethers version by feature detection
          if (typeof ethers.BrowserProvider === 'function') {
            // ethers v6
            console.log("Using ethers v6");
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
          } else {
            // ethers v5
            console.log("Using ethers v5");
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
          }

          setProvider(provider);
          setSigner(signer);

          // Get balance
          const balance = await provider.getBalance(account);
          setBalance(ethers.utils?.formatEther(balance) || ethers.formatEther(balance));

          // Connect to contract
          const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
          console.log("Contract address:", contractAddress);

          const contract = new ethers.Contract(
            contractAddress,
            DonationContractABI,
            signer
          );
          setContract(contract);

          // Get donation count
          const count = await contract.getDonationCount();
          setDonationCount(count.toString());
        } catch (err) {
          console.error("Detailed error:", err);
          setError('Failed to connect to blockchain');
        }
      } else {
        setError('Please install MetaMask to use this feature');
      }
    };

    init();
  }, []);

  const handleDonate = async () => {
    if (!contract) {
      setError('Contract not initialized');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult('');

      // Convert amount to wei - compatible with ethers v5 or v6
      let amountInWei;
      if (ethers.utils && ethers.utils.parseEther) {
        // ethers v5
        amountInWei = ethers.utils.parseEther(donationAmount);
      } else if (ethers.parseEther) {
        // ethers v6
        amountInWei = ethers.parseEther(donationAmount);
      } else {
        throw new Error("Could not find parseEther function in ethers library");
      }

      // Call the donate function on the contract
      const tx = await contract.donate(donationMessage, { value: amountInWei });

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      setResult(`Donation successful! Transaction hash: ${receipt.hash || receipt.transactionHash}`);

      // Update donation count
      const count = await contract.getDonationCount();
      setDonationCount(count.toString());

      // Add to transactions list
      const newTransaction = {
        hash: receipt.hash || receipt.transactionHash,
        amount: donationAmount,
        message: donationMessage,
        timestamp: new Date().toISOString()
      };

      setTransactions(prev => [newTransaction, ...prev]);
    } catch (err) {
      console.error("Donation error:", err);
      setError(`Failed to donate: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Blockchain Tester</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Account Info</h3>
          <p><strong>Address:</strong> {account || 'Not connected'}</p>
          <p><strong>Balance:</strong> {balance ? `${balance} ETH` : 'Unknown'}</p>
          <p><strong>Donation Count:</strong> {donationCount}</p>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Make Donation</h3>
          <div className="mb-4">
            <label className="block mb-1">Amount (ETH)</label>
            <input
              type="text"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Message</label>
            <input
              type="text"
              value={donationMessage}
              onChange={(e) => setDonationMessage(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            onClick={handleDonate}
            disabled={loading || !contract}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Donate'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded">
          {result}
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Hash</th>
                  <th className="py-2 px-4 border-b">Amount</th>
                  <th className="py-2 px-4 border-b">Message</th>
                  <th className="py-2 px-4 border-b">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b font-mono text-sm truncate max-w-[150px]">{tx.hash}</td>
                    <td className="py-2 px-4 border-b">{tx.amount} ETH</td>
                    <td className="py-2 px-4 border-b">{tx.message}</td>
                    <td className="py-2 px-4 border-b">{new Date(tx.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}