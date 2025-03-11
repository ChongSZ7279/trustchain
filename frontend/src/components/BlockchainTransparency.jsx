import { useState, useEffect } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { Link } from 'react-router-dom';

export default function BlockchainTransparency({ charityId }) {
  const { contract } = useBlockchain();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalDonated, setTotalDonated] = useState(0);
  const [donorCount, setDonorCount] = useState(0);

  useEffect(() => {
    const fetchBlockchainData = async () => {
      if (!contract || !charityId) return;

      try {
        setLoading(true);
        
        // In a real application, you would fetch this data from the blockchain
        // For example:
        // const balance = await contract.getCharityBalance(charityId);
        // const donorCount = await contract.getDonorCount(charityId);
        
        // For now, we'll use mock data
        const mockBalance = Math.random() * 10;
        setTotalDonated(mockBalance);
        
        const mockDonorCount = Math.floor(Math.random() * 50) + 5;
        setDonorCount(mockDonorCount);
        
        // Generate mock transactions
        const mockTransactions = Array.from({ length: 10 }, (_, i) => ({
          id: `tx-${i}`,
          hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          donor: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          amount: (Math.random() * 2).toFixed(4),
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }));
        
        setTransactions(mockTransactions);
      } catch (err) {
        console.error('Error fetching blockchain data:', err);
        setError('Failed to load blockchain data');
      } finally {
        setLoading(false);
      }
    };

    fetchBlockchainData();
  }, [contract, charityId]);

  // Format date to a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Format address to a shortened version
  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Blockchain Transparency</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Real-time donation data from the blockchain
        </p>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-indigo-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Donated
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                {totalDonated.toFixed(4)} ETH
              </dd>
            </div>
          </div>
          
          <div className="bg-indigo-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Unique Donors
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                {donorCount}
              </dd>
            </div>
          </div>
          
          <div className="bg-indigo-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Transparency Score
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                100%
              </dd>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h4 className="text-lg font-medium text-gray-900">Recent Blockchain Transactions</h4>
          <div className="mt-4 flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction Hash
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Donor
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <a 
                              href={`https://etherscan.io/tx/${transaction.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              {formatAddress(transaction.hash)}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <a 
                              href={`https://etherscan.io/address/${transaction.donor}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              {formatAddress(transaction.donor)}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.amount} ETH
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(transaction.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-gray-50 p-4 rounded-md">
          <h4 className="text-md font-medium text-gray-900">About Blockchain Transparency</h4>
          <p className="mt-2 text-sm text-gray-600">
            All donations made through our blockchain integration are recorded on the Ethereum blockchain, 
            providing complete transparency and traceability. Each transaction is immutable and can be 
            independently verified by anyone. This ensures that your donations reach their intended recipients 
            and are used for their intended purposes.
          </p>
          <div className="mt-4">
            <Link 
              to="/blockchain-faq" 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Learn more about blockchain donations
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 