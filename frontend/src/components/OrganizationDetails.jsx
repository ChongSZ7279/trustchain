import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils/helpers';
import { 
  FaBuilding,
  FaChartBar,
  FaUsers,
  FaAddressCard,
  FaFileAlt,
  FaEdit,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGlobe,
  FaFacebook,
  FaInstagram,
  FaLink,
  FaWallet,
  FaArrowLeft,
  FaPlus
} from 'react-icons/fa';

export default function OrganizationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('charities');
  const [charities, setCharities] = useState([]);

  useEffect(() => {
    fetchOrganizationDetails();
  }, [id]);

  const fetchOrganizationDetails = async () => {
    try {
      setLoading(true);
      const [orgResponse, charitiesResponse] = await Promise.all([
        axios.get(`/api/organizations/${id}`),
        axios.get(`/api/organizations/${id}/charities`)
      ]);
      setOrgData(orgResponse.data);
      setCharities(charitiesResponse.data);
    } catch (err) {
      setError('Failed to fetch organization details');
      console.error('Error fetching organization details:', err);
    } finally {
      setLoading(false);
    }
  };

  const canEditOrganization = () => {
    return organization?.id === orgData?.id || orgData?.representative_id === user?.ic_number;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !orgData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-800">{error || 'Organization not found'}</h3>
          <button
            onClick={() => navigate('/organizations')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Organizations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-gray-500 mb-6">
          <Link to="/organizations" className="hover:text-gray-700 flex items-center">
            <FaArrowLeft className="mr-2" />
            Back to Organizations
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{orgData.name}</span>
        </nav>

        {/* Organization Header */}
        <div className="bg-white shadow-sm rounded-lg mb-6">
          <div className="p-6">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <img
                  src={formatImageUrl(orgData.logo)}
                alt={orgData.name}
                  className="h-24 w-24 rounded-lg object-cover bg-gray-100"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/96?text=Logo';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 truncate">{orgData.name}</h1>
                    <p className="text-sm text-gray-500">{orgData.category}</p>
            </div>
              {canEditOrganization() && (
                <button
                  onClick={() => navigate(`/organizations/${id}/edit`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                      <FaEdit className="mr-2" />
                  Edit Organization
                </button>
              )}
            </div>
                <div className="mt-4">
                  <p className="text-gray-700">{orgData.description}</p>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900">Objectives</h3>
                  <p className="mt-1 text-sm text-gray-600">{orgData.objectives}</p>
                </div>
                <div className="mt-4">
                  {orgData.is_verified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FaCheckCircle className="mr-1" />
                      Verified Organization
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <FaExclamationTriangle className="mr-1" />
                      Verification Pending
                    </span>
                  )}
          </div>
              </div>
            </div>
          </div>
              </div>

        {/* Tabs */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('charities')}
                className={`${
                  activeTab === 'charities'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-center inline-flex items-center justify-center`}
              >
                <FaChartBar className="mr-2" />
                Charities
              </button>
              <button
                onClick={() => setActiveTab('representative')}
                className={`${
                  activeTab === 'representative'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-center inline-flex items-center justify-center`}
              >
                <FaUsers className="mr-2" />
                Representative
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`${
                  activeTab === 'contact'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-center inline-flex items-center justify-center`}
              >
                <FaAddressCard className="mr-2" />
                Contact & Documentation
              </button>
            </nav>
              </div>

          <div className="p-6">
            {/* Charities Tab */}
            {activeTab === 'charities' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Charities</h2>
                  {canEditOrganization() && (
                    <button
                      onClick={() => navigate(`/organizations/${id}/charities/create`)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <FaPlus className="mr-2" />
                      Create Charity
                    </button>
                  )}
                </div>
                {charities.length === 0 ? (
                  <div className="text-center py-12">
                    <FaChartBar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No charities</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This organization hasn't created any charities yet.
                    </p>
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
                          <div className="mt-4">
                            <Link
                              to={`/charities/${charity.id}`}
                              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                            >
                              View Details →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Representative Tab */}
            {activeTab === 'representative' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Representative Information</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Representative ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">{orgData.representative_id}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Representative Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{orgData.representative_name}</dd>
              </div>
              {orgData.wallet_address && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Wallet Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{orgData.wallet_address}</dd>
                </div>
              )}
                  </dl>
                </div>
              </div>
            )}

            {/* Contact & Documentation Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Contact Information</h2>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <FaPhone className="mr-2" />
                          Phone Number
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">{orgData.phone_number}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <FaEnvelope className="mr-2" />
                          Email
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">{orgData.gmail}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <FaMapMarkerAlt className="mr-2" />
                          Registration Address
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">{orgData.register_address}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Social Media */}
              {(orgData.website || orgData.facebook || orgData.instagram) && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Social Media</h2>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="space-y-4">
                      {orgData.website && (
                        <a
                          href={orgData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                            className="flex items-center text-indigo-600 hover:text-indigo-900"
                        >
                            <FaGlobe className="mr-2" />
                            <span className="text-sm">Website</span>
                        </a>
                      )}
                      {orgData.facebook && (
                        <a
                          href={orgData.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                            className="flex items-center text-indigo-600 hover:text-indigo-900"
                        >
                            <FaFacebook className="mr-2" />
                            <span className="text-sm">Facebook</span>
                        </a>
                      )}
                      {orgData.instagram && (
                        <a
                          href={orgData.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                            className="flex items-center text-indigo-600 hover:text-indigo-900"
                        >
                            <FaInstagram className="mr-2" />
                            <span className="text-sm">Instagram</span>
                        </a>
                      )}
                      </div>
                    </div>
                </div>
              )}

                {/* Documentation */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Documentation</h2>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 flex items-center">
                          <FaFileAlt className="mr-2" />
                          Statutory Declaration
                        </h3>
                        {orgData.statutory_declaration ? (
                          <a
                            href={formatImageUrl(orgData.statutory_declaration)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            View Document
                          </a>
                        ) : (
                          <p className="mt-2 text-sm text-gray-500">No document available</p>
                        )}
                </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 flex items-center">
                          <FaFileAlt className="mr-2" />
                          Verified Document
                        </h3>
                        {orgData.verified_document ? (
                          <a
                            href={formatImageUrl(orgData.verified_document)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            View Document
                          </a>
                        ) : (
                          <p className="mt-2 text-sm text-gray-500">No document available</p>
                        )}
                  </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
} 