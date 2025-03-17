import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils/helpers';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaBuilding, 
  FaChartBar, 
  FaHistory, 
  FaEdit, 
  FaSignOutAlt,
  FaPlus,
  FaFileAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWallet,
  FaFacebook,
  FaInstagram,
  FaLink,
  FaCalendarAlt,
  FaHandHoldingUsd,
  FaUsers,
  FaCertificate,
  FaEdit as FaEditAlt,
  FaExternalLinkAlt
} from 'react-icons/fa';

export default function OrganizationDashboard() {
  const { organization, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [charities, setCharities] = useState([]);
  const [activeTab, setActiveTab] = useState('charity');
  const [totalDonations, setTotalDonations] = useState(0);

  useEffect(() => {
    if (!organization) {
      navigate('/login');
    }
  }, [organization, navigate]);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      if (!organization) return;
      
      try {
        setLoading(true);
        
        // Fetch charities associated with this organization
        const charitiesResponse = await axios.get(`/organizations/${organization.id}/charities`);
        setCharities(charitiesResponse.data);
        
        // Fetch recent transactions
        const transactionsResponse = await axios.get(`/organizations/${organization.id}/transactions`);
        setTransactions(transactionsResponse.data);
        
        // Calculate total donations
        const total = transactionsResponse.data.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
        setTotalDonations(total);
      } catch (err) {
        console.error('Error in fetchOrganizationData:', err);
        setError('Failed to load some organization data');
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
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Organization Header */}
          <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-4">
              {organization.logo && (
                <img
                  src={formatImageUrl(organization.logo)}
                  alt={organization.name}
                  className="h-20 w-20 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
                <p className="text-gray-500">{organization.category}</p>
                {organization.is_verified ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FaCheckCircle className="mr-1" />
                    Verified Organization
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <FaExclamationTriangle className="mr-1" />
                    Pending Verification
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('charity')}
                className={`${
                  activeTab === 'charity'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
              >
                <FaChartBar className="mr-2" />
                Charity
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`${
                  activeTab === 'contact'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
              >
                <FaPhone className="mr-2" />
                Contact
              </button>
              <button
                onClick={() => setActiveTab('representative')}
                className={`${
                  activeTab === 'representative'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
              >
                <FaUsers className="mr-2" />
                Representative
              </button>
              <button
                onClick={() => setActiveTab('transaction')}
                className={`${
                  activeTab === 'transaction'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
              >
                <FaHistory className="mr-2" />
                Transaction
              </button>
            </nav>
          </div>

          {/* Charity Tab */}
          {activeTab === 'charity' && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FaChartBar className="mr-2" />
                  My Charities
                </h2>
                <Link
                  to="/charities/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <FaPlus className="mr-2" />
                  Create Charity
                </Link>
              </div>

              {loading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-600">{error}</div>
              ) : charities.length === 0 ? (
                <div className="text-center py-12">
                  <FaChartBar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No charities yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new charity.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {charities.map(charity => (
                    <div key={charity.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {charity.picture_path && (
                        <img
                          src={formatImageUrl(charity.picture_path)}
                          alt={charity.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900">{charity.name}</h3>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{charity.description}</p>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Progress</span>
                            <span className="text-gray-900 font-medium">
                              ${charity.fund_received} / ${charity.fund_targeted}
                            </span>
                          </div>
                          <div className="mt-2 relative">
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                              <div
                                style={{
                                  width: `${Math.min(
                                    (charity.fund_received / charity.fund_targeted) * 100,
                                    100
                                  )}%`,
                                }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <Link
                            to={`/charities/${charity.id}`}
                            className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                          >
                            <FaExternalLinkAlt className="mr-2" />
                            View Details
                          </Link>
                          <Link
                            to={`/charities/${charity.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                          >
                            <FaEdit className="mr-2" />
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <FaPhone className="mr-2" />
                Contact Information
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Details</h3>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center">
                      <FaPhone className="text-gray-400 mr-2" />
                      <span className="text-gray-900">{organization.phone_number}</span>
                    </div>
                    <div className="flex items-center">
                      <FaEnvelope className="text-gray-400 mr-2" />
                      <span className="text-gray-900">{organization.gmail}</span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-gray-400 mr-2" />
                      <span className="text-gray-900">{organization.register_address}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Social Media</h3>
                  <div className="mt-4 space-y-4">
                    {organization.website && (
                      <a
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-indigo-600 hover:text-indigo-900"
                      >
                        <FaGlobe className="mr-2" />
                        Website
                      </a>
                    )}
                    {organization.facebook && (
                      <a
                        href={organization.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-indigo-600 hover:text-indigo-900"
                      >
                        <FaFacebook className="mr-2" />
                        Facebook
                      </a>
                    )}
                    {organization.instagram && (
                      <a
                        href={organization.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-indigo-600 hover:text-indigo-900"
                      >
                        <FaInstagram className="mr-2" />
                        Instagram
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Representative Tab */}
          {activeTab === 'representative' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <FaUsers className="mr-2" />
                Representative Information
              </h2>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Representative Details</h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{organization.representative_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IC Number</label>
                      <p className="mt-1 text-sm text-gray-900">{organization.representative_ic}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                      <p className="mt-1 text-sm text-gray-900">{organization.representative_phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{organization.representative_email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">IC Pictures</h3>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Front</label>
                      {organization.representative_front_ic && (
                        <img
                          src={formatImageUrl(organization.representative_front_ic)}
                          alt="Front IC"
                          className="mt-2 h-48 w-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Back</label>
                      {organization.representative_back_ic && (
                        <img
                          src={formatImageUrl(organization.representative_back_ic)}
                          alt="Back IC"
                          className="mt-2 h-48 w-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Tab */}
          {activeTab === 'transaction' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <FaHistory className="mr-2" />
                Transaction History
              </h2>

              {loading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-600">{error}</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <FaHistory className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Transactions will appear here once they occur.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-2" />
                            Date
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <FaHandHoldingUsd className="mr-2" />
                            Type
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <FaChartBar className="mr-2" />
                            Amount
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <FaUsers className="mr-2" />
                            From
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <FaCertificate className="mr-2" />
                            Status
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <FaEdit className="mr-2" />
                            Actions
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map(transaction => (
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
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Link
                              to={`/transactions/${transaction.id}`}
                              className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                            >
                              <FaEdit className="mr-2" />
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 