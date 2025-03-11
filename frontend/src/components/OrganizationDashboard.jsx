import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils/helpers';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function OrganizationDashboard() {
  const { organization, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [charities, setCharities] = useState([]);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      if (!organization) return;
      
      try {
        setLoading(true);
        
        // Fetch organization's charities
        const charitiesResponse = await axios.get(`/api/organizations/${organization.id}/charities`);
        setCharities(charitiesResponse.data);
        
        // Fetch transactions for all charities
        const transactionsPromises = charitiesResponse.data.map(charity => 
          axios.get(`/api/charities/${charity.id}/transactions`)
        );
        
        const transactionsResponses = await Promise.all(transactionsPromises);
        
        // Combine all transactions
        const allTransactions = transactionsResponses.flatMap(response => response.data);
        
        // Sort by date (newest first)
        allTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        setTransactions(allTransactions);
      } catch (err) {
        console.error('Error fetching organization data:', err);
        setError('Failed to load organization data');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationData();
  }, [organization]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Format date to a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Organization Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/charities/create')}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Create Charity
              </button>
              <button
                onClick={() => navigate('/organization/edit')}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit Organization
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Organization Information</h2>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center space-x-4">
                    {organization.logo && (
                      <img
                        src={formatImageUrl(organization.logo)}
                        alt="Organization Logo"
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{organization.name}</p>
                      <p className="text-sm text-gray-500">{organization.category}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="mt-1 text-sm text-gray-900">{organization.description}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Objectives</p>
                      <p className="mt-1 text-sm text-gray-900">{organization.objectives}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Contact Information</p>
                      <p className="mt-1 text-sm text-gray-900">{organization.phone_number}</p>
                      <p className="mt-1 text-sm text-gray-900">{organization.gmail}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Registration Address</p>
                      <p className="mt-1 text-sm text-gray-900">{organization.register_address}</p>
                    </div>
                    {organization.wallet_address && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-500">Wallet Address</p>
                        <p className="mt-1 text-sm text-gray-900">{organization.wallet_address}</p>
                      </div>
                    )}
                  </div>

                  {(organization.website || organization.facebook || organization.instagram) && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Social Media</h3>
                      <div className="mt-2 space-y-2">
                        {organization.website && (
                          <a
                            href={organization.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-500 block"
                          >
                            Website
                          </a>
                        )}
                        {organization.facebook && (
                          <a
                            href={organization.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-500 block"
                          >
                            Facebook
                          </a>
                        )}
                        {organization.instagram && (
                          <a
                            href={organization.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-500 block"
                          >
                            Instagram
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900">Documents</h2>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Statutory Declaration</h3>
                    <div className="mt-2">
                      {organization.statutory_declaration && (
                        <a
                          href={formatImageUrl(organization.statutory_declaration)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          View Document
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Verified Document</h3>
                    <div className="mt-2">
                      {organization.verified_document && (
                        <a
                          href={formatImageUrl(organization.verified_document)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          View Document
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {!organization.is_verified && (
                <div className="rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Verification Pending
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Your organization is currently pending verification. We will review your
                          documents and update your status soon.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">My Charities</h2>
            
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-600">
                {error}
              </div>
            ) : charities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {charities.map(charity => (
                  <div key={charity.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {charity.picture_path && (
                      <img 
                        src={formatImageUrl(charity.picture_path)} 
                        alt={charity.name} 
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900">{charity.name}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{charity.description}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">
                          ${charity.fund_received} / ${charity.fund_targeted}
                        </span>
                        <Link 
                          to={`/charities/${charity.id}`}
                          className="text-sm text-indigo-600 hover:text-indigo-900"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>You haven't created any charities yet.</p>
                <button
                  onClick={() => navigate('/charities/create')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Your First Charity
                </button>
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Recent Transactions</h2>
            
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-600">
                {error}
              </div>
            ) : transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        From
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        To
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === 'charity' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {transaction.type === 'charity' ? 'Charity Donation' : 'Task Funding'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${transaction.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.from_user ? (
                            <Link to={`/users/${transaction.from_user.id}`} className="text-indigo-600 hover:text-indigo-900">
                              {transaction.from_user.name}
                            </Link>
                          ) : (
                            'Anonymous'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.type === 'charity' ? (
                            <Link to={`/charities/${transaction.charity_id}`} className="text-indigo-600 hover:text-indigo-900">
                              {transaction.charity?.name || `Charity #${transaction.charity_id}`}
                            </Link>
                          ) : (
                            <Link to={`/tasks/${transaction.task_id}`} className="text-indigo-600 hover:text-indigo-900">
                              {transaction.task?.name || `Task #${transaction.task_id}`}
                            </Link>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Link to={`/transactions/${transaction.id}`} className="text-indigo-600 hover:text-indigo-900">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No transactions found for your charities.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 