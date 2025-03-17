import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Add new loading states
  const [imageLoading, setImageLoading] = useState({
    logo: true,
    cover: true
  });

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading organization details...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !orgData) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-gray-50"
      >
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md mx-4">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">{error || 'Organization not found'}</h3>
          <p className="text-gray-600 mb-6">We couldn't find the organization you're looking for. Please try again later.</p>
          <button
            onClick={() => navigate('/organizations')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" />
            Back to Organizations
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Enhanced Breadcrumb */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            to="/organizations" 
            className="group inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Organizations
          </Link>
        </div>
      </div>

      {/* Enhanced Header Section */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col md:flex-row items-start md:items-center gap-8"
          >
            {/* Enhanced Logo */}
            <div className="relative flex-shrink-0">
              <div className={`h-32 w-32 rounded-xl overflow-hidden shadow-lg transition-opacity duration-300 ${imageLoading.logo ? 'animate-pulse bg-gray-200' : ''}`}>
                <img
                  src={formatImageUrl(orgData.logo) || 'https://via.placeholder.com/128'}
                  alt={orgData.name}
                  className="h-full w-full object-cover"
                  onLoad={() => setImageLoading(prev => ({ ...prev, logo: false }))}
                />
              </div>
              {orgData.is_verified && (
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                  <FaCheckCircle className="text-white text-lg" />
                </div>
              )}
            </div>

            {/* Enhanced Organization Info */}
            <div className="flex-1">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    {orgData.category}
                  </span>
                  {orgData.is_verified ? (
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <FaCheckCircle className="mr-1.5" />
                      Verified Organization
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      <FaExclamationTriangle className="mr-1.5" />
                      Verification Pending
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-gray-900">{orgData.name}</h1>

                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="mr-2 text-gray-500" />
                  <span className="text-sm">{orgData.register_address || 'No address provided'}</span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center text-gray-600">
                    <FaUsers className="mr-2" />
                    <span className="text-sm font-medium">{followerCount} followers</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaChartBar className="mr-2" />
                    <span className="text-sm font-medium">{charities.length} charities</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Enhanced Actions */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-3 min-w-[200px]"
            >
              <button
                onClick={toggleFollow}
                disabled={isFollowLoading}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                  isFollowing
                    ? 'bg-gray-100 text-indigo-600 hover:bg-gray-200 border-2 border-indigo-600'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                }`}
              >
                <FaThumbsUp className={`inline-block mr-2 ${isFollowLoading ? 'opacity-50' : ''}`} />
                {isFollowing ? 'Following' : 'Follow'}
              </button>

              {canEditOrganization() && (
                <Link
                  to={`/organizations/${id}/edit`}
                  className="w-full px-6 py-3 rounded-lg font-medium bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 text-center shadow hover:shadow-md"
                >
                  <FaEdit className="inline-block mr-2" />
                  Edit Organization
                </Link>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Cover Image Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white shadow-lg rounded-2xl overflow-hidden"
        >
          {/* Cover Image with Loading State */}
          <div className="relative h-72 w-full">
            <div className={`absolute inset-0 bg-gray-200 ${imageLoading.cover ? 'animate-pulse' : ''}`}></div>
            <img
              src={formatImageUrl(orgData.cover_image_path) || 'https://via.placeholder.com/1920x400'}
              alt={`${orgData.name} cover`}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading.cover ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setImageLoading(prev => ({ ...prev, cover: false }))}
            />
          </div>

          {/* Enhanced Description */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {orgData.description || 'No description provided.'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Tabs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white shadow-lg rounded-2xl overflow-hidden"
        >
          {/* Enhanced Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {['info', 'charities', 'documents'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200`}
                >
                  <motion.div
                    initial={false}
                    animate={{ scale: activeTab === tab ? 1.05 : 1 }}
                    className="flex items-center justify-center"
                  >
                    {tab === 'info' && <FaInfoCircle className="mr-2" />}
                    {tab === 'charities' && <FaChartBar className="mr-2" />}
                    {tab === 'documents' && <FaFileAlt className="mr-2" />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </motion.div>
                </button>
              ))}
            </nav>
          </div>

          {/* Enhanced Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-8"
            >
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
                        onClick={() => navigate(`/charities/create`)}
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
                          onClick={() => navigate(`/charities/create`)}
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
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
} 