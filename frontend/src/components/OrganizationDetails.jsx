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
  FaPlus,
  FaThumbsUp,
  FaInfoCircle
} from 'react-icons/fa';

export default function OrganizationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, accountType } = useAuth();
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [charities, setCharities] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    fetchOrganizationDetails();
  }, [id]);

  const fetchOrganizationDetails = async () => {
    try {
      setLoading(true);
      const [orgResponse, charitiesResponse] = await Promise.all([
        axios.get(`/organizations/${id}`),
        axios.get(`/organizations/${id}/charities`)
      ]);
      setOrgData(orgResponse.data);
      setCharities(charitiesResponse.data);
      
      // Set follow status and follower count
      setIsFollowing(orgResponse.data.is_following || false);
      setFollowerCount(orgResponse.data.follower_count || 0);
    } catch (err) {
      setError('Failed to fetch organization details');
      console.error('Error fetching organization details:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setIsFollowLoading(true);
      const response = await axios.post(`/organizations/${id}/follow`);
      setIsFollowing(response.data.is_following);
      setFollowerCount(response.data.follower_count);
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const canEditOrganization = () => {
    return accountType === 'organization' && orgData?.id === orgData?.id || orgData?.representative_id === currentUser?.ic_number;
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
      {/* Breadcrumb */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/organizations" className="text-indigo-600 hover:text-indigo-900 flex items-center">
            <FaArrowLeft className="mr-2" />
            Back to Organizations
          </Link>
        </div>
      </div>

      {/* Section 1: Logo, Category, Verification, Name, Address */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img
                src={formatImageUrl(orgData.logo) || 'https://via.placeholder.com/128'}
                alt={orgData.name}
                className="h-32 w-32 rounded-lg object-cover border border-gray-200 shadow-sm"
              />
            </div>
            
            {/* Organization Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {orgData.category}
                </span>
                {orgData.is_verified ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <FaCheckCircle className="mr-1" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <FaExclamationTriangle className="mr-1" />
                    Pending Verification
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{orgData.name}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <FaMapMarkerAlt className="mr-2 text-gray-500" />
                <span>{orgData.register_address || 'No address provided'}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center text-gray-600">
                  <FaUsers className="mr-1" />
                  <span className="text-sm">{followerCount} followers</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaChartBar className="mr-1" />
                  <span className="text-sm">{charities.length} charities</span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={toggleFollow}
                disabled={isFollowLoading}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isFollowing
                    ? 'bg-gray-100 text-indigo-600 hover:bg-gray-200 border border-indigo-600'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <FaThumbsUp className={`inline-block mr-2 ${isFollowLoading ? 'opacity-50' : ''}`} />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              
              {canEditOrganization() && (
                <Link
                  to={`/organizations/${id}/edit`}
                  className="px-6 py-3 rounded-lg font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-center"
                >
                  <FaEdit className="inline-block mr-2" />
                  Edit
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Cover Image and Description */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Cover Image */}
          <div className="h-64 w-full">
            <img
              src={formatImageUrl(orgData.cover_image_path) || 'https://via.placeholder.com/1920x400'}
              alt={`${orgData.name} cover`}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Description */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {orgData.description || 'No description provided.'}
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('info')}
                className={`${
                  activeTab === 'info'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-center inline-flex items-center justify-center`}
              >
                <FaInfoCircle className="mr-2" />
                Information
              </button>
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
                onClick={() => setActiveTab('documents')}
                className={`${
                  activeTab === 'documents'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-center inline-flex items-center justify-center`}
              >
                <FaFileAlt className="mr-2" />
                Documents
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Information Tab */}
            {activeTab === 'info' && (
              <div className="space-y-8">
                {/* Contact Info */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <FaPhone className="mr-2" />
                          Phone Number
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">{orgData.phone_number || 'Not provided'}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <FaEnvelope className="mr-2" />
                          Email
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">{orgData.gmail || 'Not provided'}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <FaMapMarkerAlt className="mr-2" />
                          Registration Address
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">{orgData.register_address || 'Not provided'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Representative Info */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Representative</h2>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Representative Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{orgData.representative_name || orgData.name}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Representative ID</dt>
                        <dd className="mt-1 text-sm text-gray-900">{orgData.representative_id || 'Not provided'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Social Media */}
                {(orgData.website || orgData.facebook || orgData.instagram) && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Social Media</h2>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              </div>
            )}

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
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FaChartBar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No charities</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This organization hasn't created any charities yet.
                    </p>
                    {canEditOrganization() && (
                      <button
                        onClick={() => navigate(`/organizations/${id}/charities/create`)}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <FaPlus className="mr-2" />
                        Create First Charity
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {charities.map(charity => (
                      <div key={charity.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center p-4">
                          {/* Image Column */}
                          <div className="w-full md:w-48 h-32 flex-shrink-0 mb-4 md:mb-0">
                            <img
                              src={formatImageUrl(charity.picture_path) || 'https://via.placeholder.com/192x128'}
                              alt={charity.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>

                          {/* Details Column */}
                          <div className="flex-1 md:px-6">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="text-lg font-medium text-gray-900">{charity.name}</h3>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {charity.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{charity.description}</p>
                            <div className="flex items-center space-x-2">
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-500">Progress</span>
                                  <span className="text-gray-900 font-medium">
                                    ${(Number(charity?.fund_received) || 0).toLocaleString()} / ${(Number(charity?.fund_targeted) || 0).toLocaleString()}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-indigo-600 h-2 rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        ((Number(charity?.fund_received) || 0) / (Number(charity?.fund_targeted) || 1)) * 100,
                                        100
                                      )}%`
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions Column */}
                          <div className="flex flex-row md:flex-col justify-center md:justify-start gap-2 mt-4 md:mt-0 md:ml-4">
                            <button
                              onClick={() => navigate(`/charities/${charity.id}/donate`)}
                              className="flex-1 md:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                              Donate
                            </button>
                            <Link
                              to={`/charities/${charity.id}`}
                              className="flex-1 md:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Documentation</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-6">
                    {/* Statutory Declaration */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Statutory Declaration</h3>
                      <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                        <FaFileAlt className="text-gray-400 mr-3 text-xl" />
                        {orgData.statutory_declaration ? (
                          <a
                            href={formatImageUrl(orgData.statutory_declaration)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900 hover:underline"
                          >
                            View Statutory Declaration Document
                          </a>
                        ) : (
                          <span className="text-gray-500">Statutory Declaration Document (Not Available)</span>
                        )}
                      </div>
                    </div>

                    {/* Verified Document */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Verification Document</h3>
                      <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                        <FaFileAlt className="text-gray-400 mr-3 text-xl" />
                        {orgData.verified_document ? (
                          <a
                            href={formatImageUrl(orgData.verified_document)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900 hover:underline"
                          >
                            View Organization Verification Document
                          </a>
                        ) : (
                          <span className="text-gray-500">Organization Verification Document (Not Available)</span>
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