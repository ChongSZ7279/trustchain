import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from './BackToHistory';
import CharityCard from './CharityCard';
import {
  FaBuilding,
  FaUsers,
  FaAddressCard,
  FaFileAlt,
  FaEdit,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGlobe,
  FaFacebook,
  FaInstagram,
  FaArrowLeft,
  FaPlus,
  FaThumbsUp,
  FaInfoCircle,
  FaHandHoldingHeart,
  FaShare,
  FaFileContract,
  FaBullseye,
  FaIdCard,
  FaHistory,
  FaTag,
  FaRegCalendarAlt,
  FaRegClock,
  FaDownload,
  FaEye,
  FaChartBar
} from 'react-icons/fa';

export default function OrganizationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, accountType } = useAuth();

  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('information');
  const [charities, setCharities] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [imageLoading, setImageLoading] = useState({
    logo: true,
    cover: true
  });

  // Check if organization has uploaded documents
  const hasDocuments = Boolean(orgData?.verified_document || orgData?.statutory_declaration);

  useEffect(() => {
    fetchOrganizationDetails();

    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, [id]);

  // Check follow status when the component mounts
  useEffect(() => {
    // Only check follow status if user is logged in and not an organization
    if (currentUser && !isOrganizationUser()) {
      const checkFollowStatus = async () => {
        try {
          setIsFollowLoading(true);
          const response = await axios.get(`/organizations/${id}/follow-status`);

          if (response.data && response.data.is_following !== undefined) {
            setIsFollowing(response.data.is_following);
            if (response.data.follower_count !== undefined) {
              setFollowerCount(response.data.follower_count);
            }
          }
        } catch (error) {
          console.error('Error checking follow status:', error);
        } finally {
          setIsFollowLoading(false);
        }
      };

      checkFollowStatus();
    }
  }, [currentUser, id]);

  const fetchOrganizationDetails = async () => {
    try {
      setLoading(true);
      const [orgResponse, charitiesResponse] = await Promise.all([
        axios.get(`/organizations/${id}`),
        axios.get(`/organizations/${id}/charities`)
      ]);

      setOrgData(orgResponse.data);
      setCharities(charitiesResponse.data);

      // Set follow status and follower count from the response
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
      navigate('/login', { state: { from: `/organizations/${id}` } });
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

  const handleShare = () => {
    // Copy current URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 2000);
  };

  const canEditOrganization = () => {
    return (accountType === 'organization' && orgData?.id === currentUser?.id) ||
           (orgData?.representative_id === currentUser?.ic_number);
  };

  // Check if the current user is an organization
  const isOrganizationUser = () => {
    return (
      accountType === 'organization' ||
      currentUser?.account_type === 'organization' ||
      currentUser?.is_organization === true ||
      (currentUser?.id && orgData?.id && currentUser.id === orgData.id)
    );
  };

  // Helper function to correctly format image paths
  const getImageUrl = (path) => {
    if (!path) return null;

    // Check if the path already includes the base URL
    if (path.startsWith('http')) {
      return path;
    }

    // Otherwise, construct the full URL - using import.meta.env for Vite
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/storage/${path}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-8 rounded-xl shadow-md max-w-md mx-4"
        >
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
              <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-indigo-600"></div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Loading Organization</h3>
            <p className="text-gray-600">Fetching organization details...</p>
            <div className="mt-4 w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !orgData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
      >
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="bg-red-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{error || 'Organization Not Found'}</h3>
          <p className="text-gray-600 mb-8">We couldn't find the organization you're looking for. The organization may have been removed or the URL might be incorrect.</p>
          <button
            onClick={() => navigate('/organizations')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg w-full justify-center"
          >
            <FaArrowLeft className="mr-2" />
            Back to Organizations
          </button>
        </div>
      </motion.div>
    );
  }

  // Format social media URL for display
  const formatSocialUrl = (url) => {
    if (!url) return "";
    try {
      const parsed = new URL(url);
      return parsed.hostname + parsed.pathname;
    } catch {
      return url;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <BackButton />
      </div>

      {/* Organization Header Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          {/* Cover Image Banner */}
          <div className="relative h-40 md:h-56 w-full overflow-hidden">
            <div className={`absolute inset-0 bg-gray-200 ${imageLoading.cover ? 'animate-pulse' : ''}`}></div>
            {orgData.cover_image_path ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${getImageUrl(orgData.cover_image_path)})`,
                  zIndex: 1
                }}
              ></div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center" style={{ zIndex: 1 }}>
                <div className="text-white text-opacity-30 font-bold text-4xl">{orgData.name?.substring(0, 2).toUpperCase() || 'ORG'}</div>
              </div>
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" style={{ zIndex: 2 }}></div>
          </div>

          {/* Organization Info Section */}
          <div className="relative px-6 pt-4 pb-6 md:px-8 md:pb-8">
            {/* Logo - Positioned to overlap with cover image */}
            <div className="absolute -top-16 left-6 md:left-8 z-10">
              <div className={`h-24 w-24 md:h-28 md:w-28 rounded-xl overflow-hidden border-4 border-white shadow-lg transition-opacity duration-300 ${imageLoading.logo ? 'animate-pulse bg-gray-200' : ''}`}>
                <img
                  src={getImageUrl(orgData.logo) || 'https://via.placeholder.com/128'}
                  alt={orgData.name}
                  className="h-full w-full object-cover"
                  onLoad={() => setImageLoading(prev => ({ ...prev, logo: false }))}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/128';
                  }}
                />
              </div>
            </div>

            {/* Organization Info with right padding to avoid overlapping with logo */}
            <div className="mt-12 md:mt-14 md:ml-32">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {orgData.category || 'CATEGORY'}
                </span>
                {orgData.is_verified ? (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
                    <FaCheckCircle className="mr-1" />
                    VERIFIED
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    PENDING VERIFICATION
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center">
                  <FaUsers className="mr-1" />
                  {followerCount || 0} Followers
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{orgData.name}</h1>

              <div className="flex items-center text-gray-600 text-sm mb-4">
                <FaMapMarkerAlt className="mr-2 text-gray-500" />
                <span className="line-clamp-1">{orgData.register_address || 'No address provided'}</span>
              </div>

              {/* Description */}
              <div className="text-gray-600 mb-6 max-w-3xl">
                <p className="line-clamp-3">
                  {orgData.description?.substring(0, 300) + (orgData.description?.length > 300 ? '...' : '') || 'No description provided.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {/* Only show follow button for non-organization users */}
                {!isOrganizationUser() && (
                  <button
                    onClick={toggleFollow}
                    disabled={isFollowLoading}
                    className={`px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm ${
                      isFollowing
                        ? 'bg-gray-100 text-indigo-600 hover:bg-gray-200 border border-indigo-600'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    <FaThumbsUp className={`inline-block mr-2 ${isFollowLoading ? 'opacity-50' : ''}`} />
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}

                <div className="relative">
                  <button
                    onClick={handleShare}
                    className="px-5 py-2 rounded-lg font-medium text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm"
                  >
                    <FaShare className="inline-block mr-2" />
                    Share
                  </button>
                  {showShareTooltip && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 text-white text-xs py-2 px-3 rounded-md z-10 shadow-lg">
                      Link copied to clipboard!
                    </div>
                  )}
                </div>

                {canEditOrganization() && (
                  <Link
                    to={`/organizations/${id}/edit`}
                    className="px-5 py-2 rounded-lg font-medium text-sm bg-green-600 text-white hover:bg-green-700 transition-all duration-200 shadow-sm"
                  >
                    <FaEdit className="inline-block mr-2" />
                    Edit Organization
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row border-b border-gray-200">
            <button
              onClick={() => setActiveTab('information')}
              className={`relative flex items-center justify-center py-5 px-6 font-medium text-sm transition-all duration-200 ${
                activeTab === 'information'
                  ? 'text-indigo-600 bg-white border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              } flex-1 group`}
            >
              <div className={`mr-2 ${activeTab === 'information' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500'} transition-colors duration-200`}>
                <FaInfoCircle className="text-lg" />
              </div>
              <span>Information</span>
            </button>

            <button
              onClick={() => setActiveTab('charities')}
              className={`relative flex items-center justify-center py-5 px-6 font-medium text-sm transition-all duration-200 ${
                activeTab === 'charities'
                  ? 'text-indigo-600 bg-white border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              } flex-1 group`}
            >
              <div className={`mr-2 ${activeTab === 'charities' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500'} transition-colors duration-200`}>
                <FaHandHoldingHeart className="text-lg" />
              </div>
              <span>Charities</span>
              {charities.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center min-w-[20px]">
                  {charities.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`relative flex items-center justify-center py-5 px-6 font-medium text-sm transition-all duration-200 ${
                activeTab === 'documents'
                  ? 'text-indigo-600 bg-white border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              } flex-1 group`}
            >
              <div className={`mr-2 ${activeTab === 'documents' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500'} transition-colors duration-200`}>
                <FaFileAlt className="text-lg" />
              </div>
              <span>Documents</span>
              {hasDocuments && (
                <span className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-green-100 text-green-800">
                  <FaCheckCircle className="text-xs" />
                </span>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <AnimatePresence mode="wait">
          {activeTab === 'information' && (
            <motion.div
              key="information"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-6 md:p-8">
                {/* Organization Summary and Mission */}
                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-indigo-100 p-3 rounded-full">
                      <FaBuilding className="text-indigo-600 text-xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 ml-4">About the Organization</h2>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-white p-2 rounded-full shadow-sm">
                        <FaBullseye className="text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 ml-3">Mission & Objectives</h3>
                    </div>
                    <div className="prose max-w-none text-gray-700">
                      <p>{orgData.objectives || 'No mission statement provided.'}</p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6">
                      <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                        <FaInfoCircle className="text-indigo-600 mr-2" />
                        Description
                      </h3>
                      <div className="prose max-w-none">
                        <p className="text-gray-700">{orgData.description || 'No description provided.'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organization Stats */}
                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FaChartBar className="text-blue-600 text-xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 ml-4">Organization Overview</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Category */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col items-center text-center transition-all duration-200 hover:shadow-md">
                      <div className="bg-indigo-100 p-4 rounded-full mb-4">
                        <FaTag className="text-indigo-600 text-xl" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Category</h3>
                      <p className="text-gray-600 font-medium">{orgData.category || 'Not specified'}</p>
                    </div>

                    {/* Followers */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col items-center text-center transition-all duration-200 hover:shadow-md">
                      <div className="bg-blue-100 p-4 rounded-full mb-4">
                        <FaThumbsUp className="text-blue-600 text-xl" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Followers</h3>
                      <p className="text-gray-600 font-medium">{followerCount || 0}</p>
                    </div>

                    {/* Status */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col items-center text-center transition-all duration-200 hover:shadow-md">
                      <div className={`${orgData.is_verified ? 'bg-green-100' : 'bg-yellow-100'} p-4 rounded-full mb-4`}>
                        {orgData.is_verified ? (
                          <FaCheckCircle className="text-green-600 text-xl" />
                        ) : (
                          <FaExclamationTriangle className="text-yellow-600 text-xl" />
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Verification Status</h3>
                      <p className={`${orgData.is_verified ? 'text-green-600' : 'text-yellow-600'} font-medium`}>
                        {orgData.is_verified ? 'Verified Account' : 'Pending Verification'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <FaAddressCard className="text-purple-600 text-xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 ml-4">Contact Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Primary Contact */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="flex items-center text-lg font-medium text-gray-900">
                          <FaIdCard className="text-purple-600 mr-2" />
                          Primary Contact
                        </h3>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex items-start">
                          <div className="bg-purple-100 p-2 rounded-full">
                            <FaPhone className="text-purple-600" />
                          </div>
                          <div className="ml-4">
                            <span className="text-sm font-medium text-gray-500 block">Phone</span>
                            <span className="text-gray-900 font-medium">{orgData.phone_number || 'Not provided'}</span>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="bg-purple-100 p-2 rounded-full">
                            <FaEnvelope className="text-purple-600" />
                          </div>
                          <div className="ml-4">
                            <span className="text-sm font-medium text-gray-500 block">Email</span>
                            <span className="text-gray-900 font-medium break-all">{orgData.gmail || 'Not provided'}</span>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="bg-purple-100 p-2 rounded-full">
                            <FaMapMarkerAlt className="text-purple-600" />
                          </div>
                          <div className="ml-4">
                            <span className="text-sm font-medium text-gray-500 block">Address</span>
                            <span className="text-gray-900 font-medium">{orgData.register_address || 'Not provided'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Online Presence */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="flex items-center text-lg font-medium text-gray-900">
                          <FaGlobe className="text-purple-600 mr-2" />
                          Online Presence
                        </h3>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex items-start">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <FaGlobe className="text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <span className="text-sm font-medium text-gray-500 block">Website</span>
                            {orgData.website ? (
                              <a href={orgData.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 break-all font-medium">
                                {formatSocialUrl(orgData.website)}
                              </a>
                            ) : (
                              <span className="text-gray-900 font-medium">Not provided</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <FaFacebook className="text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <span className="text-sm font-medium text-gray-500 block">Facebook</span>
                            {orgData.facebook ? (
                              <a href={orgData.facebook} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 break-all font-medium">
                                {formatSocialUrl(orgData.facebook)}
                              </a>
                            ) : (
                              <span className="text-gray-900 font-medium">Not provided</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <FaInstagram className="text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <span className="text-sm font-medium text-gray-500 block">Instagram</span>
                            {orgData.instagram ? (
                              <a href={orgData.instagram} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 break-all font-medium">
                                {formatSocialUrl(orgData.instagram)}
                              </a>
                            ) : (
                              <span className="text-gray-900 font-medium">Not provided</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="bg-green-100 p-3 rounded-full">
                      <FaHistory className="text-green-600 text-xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 ml-4">Account Information</h2>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                      <div className="p-6">
                        <div className="flex items-center justify-center flex-col h-full">
                          <div className="bg-green-100 rounded-full p-4 mb-4">
                            <FaRegCalendarAlt className="text-green-600 text-xl" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Account Created</h3>
                          <p className="text-gray-600 font-medium">
                            {orgData.created_at ? new Date(orgData.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'Not available'}
                          </p>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center justify-center flex-col h-full">
                          <div className="bg-green-100 rounded-full p-4 mb-4">
                            <FaRegClock className="text-green-600 text-xl" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Last Updated</h3>
                          <p className="text-gray-600 font-medium">
                            {orgData.updated_at ? new Date(orgData.updated_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'Not available'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'charities' && (
            <motion.div
              key="charities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-md"
            >
              <div className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center">
                    <div className="bg-indigo-100 p-3 rounded-full mr-4">
                      <FaHandHoldingHeart className="text-indigo-600 text-xl" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Charity Campaigns</h2>
                      <p className="text-gray-600 text-sm mt-1">
                        {charities.length > 0
                          ? `${orgData.name} has ${charities.length} active charity campaign${charities.length !== 1 ? 's' : ''}`
                          : 'No active charity campaigns'}
                      </p>
                    </div>
                  </div>

                  {currentUser && canEditOrganization() && (
                    <Link
                      to={`/charities/create`}
                      className="inline-flex items-center px-5 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 whitespace-nowrap"
                    >
                      <FaPlus className="mr-2" />
                      Add New Charity
                    </Link>
                  )}
                </div>

                {charities.length > 0 ? (
                  <>
                    <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 flex items-start">
                      <div className="bg-white p-3 rounded-full shadow-sm mr-4 flex-shrink-0">
                        <FaInfoCircle className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-800 text-lg mb-2">Support These Causes</h3>
                        <p className="text-blue-700">
                          Browse through the charity campaigns below and support causes that resonate with you.
                          Each donation makes a real difference in the lives of those in need.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {charities.map(charity => (
                        <motion.div
                          key={charity.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ y: -5 }}
                          className="h-full"
                        >
                          <CharityCard charity={charity} />
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <div className="bg-white rounded-full p-5 w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-md">
                      <FaHandHoldingHeart className="text-gray-400 text-3xl" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No Charity Campaigns Yet</h3>
                    <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                      {orgData.name} hasn't created any charity campaigns yet. Check back later or follow the organization to get updates when new campaigns are launched.
                    </p>

                    {currentUser && canEditOrganization() && (
                      <Link
                        to={`/charities/create`}
                        className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200"
                      >
                        <FaPlus className="mr-2" />
                        Create Your First Charity Campaign
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-md"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center mb-8">
                  <div className="bg-indigo-100 p-3 rounded-full mr-4">
                    <FaFileContract className="text-indigo-600 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Organization Documents</h2>
                    <p className="text-gray-600 text-sm mt-1">
                      {hasDocuments
                        ? 'This organization has provided verification documents'
                        : 'This organization has not uploaded verification documents yet'}
                    </p>
                  </div>
                </div>

                <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 flex items-start">
                  <div className="bg-white p-3 rounded-full shadow-sm mr-4 flex-shrink-0">
                    <FaInfoCircle className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800 text-lg mb-2">Verification Documents</h3>
                    <p className="text-blue-700">
                      All organizations must submit official documents for verification. These documents help us confirm the legitimacy of the organization and ensure transparency for donors.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Verification Document */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                    <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                          <FaFileAlt className="text-indigo-600 text-lg" />
                        </div>
                        <h3 className="ml-3 font-semibold text-gray-900">Verification Document</h3>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${orgData.verified_document ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {orgData.verified_document ? 'Uploaded' : 'Not Uploaded'}
                      </div>
                    </div>

                    <div className="p-6">
                      {orgData.verified_document ? (
                        <div className="flex flex-col space-y-6">
                          <div className="flex items-center justify-center bg-gray-100 rounded-xl p-6 h-56 relative overflow-hidden group">
                            <img
                              src={getImageUrl(orgData.verified_document)}
                              alt="Verification Document Preview"
                              className="max-h-full max-w-full object-contain z-10 transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="absolute inset-0 hidden items-center justify-center">
                              <div className="bg-indigo-100 p-4 rounded-full">
                                <FaFileContract className="text-indigo-600 text-3xl" />
                              </div>
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 z-20">
                              <a
                                href={getImageUrl(orgData.verified_document)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white rounded-full p-3 mx-2 shadow-lg hover:bg-indigo-100 transition-all duration-200"
                              >
                                <FaEye className="text-indigo-600 text-xl" />
                              </a>
                              <a
                                href={getImageUrl(orgData.verified_document)}
                                download
                                className="bg-white rounded-full p-3 mx-2 shadow-lg hover:bg-indigo-100 transition-all duration-200"
                              >
                                <FaDownload className="text-indigo-600 text-xl" />
                              </a>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 text-lg">Verification Document</h4>
                              <p className="text-gray-600">Official verification document</p>
                            </div>

                            <div className="flex space-x-3">
                              <a
                                href={getImageUrl(orgData.verified_document)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 shadow-sm"
                              >
                                <FaEye className="mr-2" />
                                View Document
                              </a>

                              <a
                                href={getImageUrl(orgData.verified_document)}
                                download
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm"
                              >
                                <FaDownload className="mr-2" />
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <div className="bg-gray-100 rounded-full p-5 mb-6 w-20 h-20 flex items-center justify-center">
                            <FaFileAlt className="text-gray-400 text-3xl" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">No Document Uploaded</h3>
                          <p className="text-gray-600 mb-6 max-w-md">
                            This organization hasn't uploaded a verification document yet. Verification documents help establish the legitimacy of the organization.
                          </p>

                          {canEditOrganization() && (
                            <Link
                              to={`/organizations/${id}/edit`}
                              className="inline-flex items-center px-5 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200"
                            >
                              <FaPlus className="mr-2" />
                              Upload Document
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Statutory Declaration */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                    <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-teal-50 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                          <FaFileAlt className="text-green-600 text-lg" />
                        </div>
                        <h3 className="ml-3 font-semibold text-gray-900">Statutory Declaration</h3>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${orgData.statutory_declaration ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {orgData.statutory_declaration ? 'Uploaded' : 'Not Uploaded'}
                      </div>
                    </div>

                    <div className="p-6">
                      {orgData.statutory_declaration ? (
                        <div className="flex flex-col space-y-6">
                          <div className="flex items-center justify-center bg-gray-100 rounded-xl p-6 h-56 relative overflow-hidden group">
                            <img
                              src={getImageUrl(orgData.statutory_declaration)}
                              alt="Statutory Declaration Preview"
                              className="max-h-full max-w-full object-contain z-10 transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="absolute inset-0 hidden items-center justify-center">
                              <div className="bg-green-100 p-4 rounded-full">
                                <FaFileContract className="text-green-600 text-3xl" />
                              </div>
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 z-20">
                              <a
                                href={getImageUrl(orgData.statutory_declaration)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white rounded-full p-3 mx-2 shadow-lg hover:bg-green-100 transition-all duration-200"
                              >
                                <FaEye className="text-green-600 text-xl" />
                              </a>
                              <a
                                href={getImageUrl(orgData.statutory_declaration)}
                                download
                                className="bg-white rounded-full p-3 mx-2 shadow-lg hover:bg-green-100 transition-all duration-200"
                              >
                                <FaDownload className="text-green-600 text-xl" />
                              </a>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 text-lg">Statutory Declaration</h4>
                              <p className="text-gray-600">Official statutory declaration document</p>
                            </div>

                            <div className="flex space-x-3">
                              <a
                                href={getImageUrl(orgData.statutory_declaration)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all duration-200 shadow-sm"
                              >
                                <FaEye className="mr-2" />
                                View Document
                              </a>

                              <a
                                href={getImageUrl(orgData.statutory_declaration)}
                                download
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm"
                              >
                                <FaDownload className="mr-2" />
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <div className="bg-gray-100 rounded-full p-5 mb-6 w-20 h-20 flex items-center justify-center">
                            <FaFileAlt className="text-gray-400 text-3xl" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">No Declaration Uploaded</h3>
                          <p className="text-gray-600 mb-6 max-w-md">
                            This organization hasn't uploaded a statutory declaration yet. Statutory declarations are important legal documents that verify the organization's status.
                          </p>

                          {canEditOrganization() && (
                            <Link
                              to={`/organizations/${id}/edit`}
                              className="inline-flex items-center px-5 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-all duration-200"
                            >
                              <FaPlus className="mr-2" />
                              Upload Declaration
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}