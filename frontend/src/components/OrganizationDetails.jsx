import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from './BackToHistory';
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
  FaInfoCircle,
  FaCalendarAlt,
  FaHandHoldingHeart,
  FaShare,
  FaBookmark,
  FaFileContract,
  FaBullseye,
  FaIdCard,
  FaHistory,
  FaTag,
  FaRegCalendarAlt,
  FaLock,
  FaRegClock,
  FaTwitter,
  FaYoutube,
  FaLinkedin,
  FaDownload,
  FaEye
} from 'react-icons/fa';
import CharityCard from './CharityCard';

export default function OrganizationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const { currentUser, accountType } = auth;
  
  // Debug auth context
  console.log("OrganizationDetails - Full Auth Context:", auth);
  console.log("OrganizationDetails - User Type:", accountType);
  
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('information');
  const [charities, setCharities] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  // Add new loading states
  const [imageLoading, setImageLoading] = useState({
    logo: true,
    cover: true
  });

  useEffect(() => {
    fetchOrganizationDetails();
    
    // Scroll to top on component mount
    window.scrollTo(0, 0);
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
    // Add debugging logs
    console.log("OrganizationDetails - isOrganizationUser check:", { 
      currentUser: currentUser ? 'exists' : 'null', 
      accountType,
      userAccountType: currentUser?.account_type,
      isUserOrganization: currentUser?.is_organization,
      orgDataId: orgData?.id,
      currentUserId: currentUser?.id,
      representativeId: orgData?.representative_id,
      icNumber: currentUser?.ic_number,
    });
    
    // More thorough check for organization status
    const isOrg = 
      // Check context accountType
      accountType === 'organization' || 
      // Check user's account_type property
      currentUser?.account_type === 'organization' ||
      // Check is_organization flag
      currentUser?.is_organization === true ||
      // Check if current user ID matches organization ID (user is the organization)
      (currentUser?.id && orgData?.id && currentUser.id === orgData.id);
    
    console.log("OrganizationDetails - isOrganizationUser result:", isOrg);
    
    return isOrg;
  };

  // Add a helper function to correctly format image paths
  const getImageUrl = (path) => {
    if (!path) return null;
    
    // Check if the path already includes the base URL
    if (path.startsWith('http')) {
      return path;
    }
    
    // Otherwise, construct the full URL - using import.meta.env for Vite
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/storage/${path}`;
  };

  // Debug image paths
  useEffect(() => {
    if (orgData) {
      console.log('Logo path:', orgData.logo);
      console.log('Cover path:', orgData.cover_image_path);
      console.log('Full logo URL:', getImageUrl(orgData.logo));
      console.log('Full cover URL:', getImageUrl(orgData.cover_image_path));
      console.log('Organization data:', orgData);
    }
  }, [orgData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading organization details...</p>
            <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
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
      className="min-h-screen"
    >
      
      <BackButton />  
      
      {/* Organization Profile Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Logo */}
              <div className="relative flex-shrink-0">
                <div className={`h-24 w-24 md:h-28 md:w-28 border-2 border-blue-100 rounded-lg overflow-hidden transition-opacity duration-300 ${imageLoading.logo ? 'animate-pulse bg-gray-200' : ''}`}>
                  <img
                    src={getImageUrl(orgData.logo) || 'https://via.placeholder.com/128'}
                    alt={orgData.name}
                    className="h-full w-full object-cover"
                    onLoad={() => setImageLoading(prev => ({ ...prev, logo: false }))}
                    onError={(e) => {
                      console.error('Error loading logo image:', e);
                      e.target.src = 'https://via.placeholder.com/128';
                    }}
                  />
                </div>
              </div>

              {/* Organization Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-800">
                    {orgData.category || 'CATEGORY'}
                    </span>
                    {orgData.is_verified ? (
                    <span className="px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                      <FaCheckCircle className="inline-block mr-1" />
                      VERIFIED
                      </span>
                    ) : (
                    <span className="px-3 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                      <FaExclamationTriangle className="inline-block mr-1" />
                      PENDING
                      </span>
                    )}
                  </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-1">{orgData.name.toUpperCase()}</h1>

                <div className="flex items-center text-gray-600 text-sm">
                    <FaMapMarkerAlt className="mr-2 text-gray-500" />
                  <span>{orgData.register_address || 'No address provided'}</span>
                  </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4 md:mt-0">
                {/* Only show follow button for non-organization users */}
                {!isOrganizationUser() && (
                  <button
                    onClick={toggleFollow}
                    disabled={isFollowLoading}
                    className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
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
                    className="px-4 py-2 rounded-md font-medium text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    <FaShare className="inline-block mr-2" />
                    Share
                  </button>
                  {showShareTooltip && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 text-white text-xs py-1 px-2 rounded z-10">
                      Link copied to clipboard!
                    </div>
                  )}
                </div>

                {canEditOrganization() && (
                  <Link
                    to={`/organizations/${id}/edit`}
                    className="px-4 py-2 rounded-md font-medium text-sm bg-green-600 border border-gray-300 text-white hover:bg-green-700 transition-all duration-200 text-center"
                  >
                    <FaEdit className="inline-block mr-2" />
                    Edit
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Cover Image with Description */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="relative h-64 md:h-72 rounded-xl overflow-hidden">
            {/* Cover Image with Loading State */}
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
              <div className="absolute inset-0 bg-gray-300 flex items-center justify-center" style={{ zIndex: 1 }}>
                <p className="text-gray-500">No cover image available</p>
              </div>
            )}
            {/* Text Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent flex items-center" style={{ zIndex: 2 }}>
              <div className="p-6 text-white max-w-lg">
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-200">
                    {orgData.objectives || orgData.description?.substring(0, 200) + (orgData.description?.length > 200 ? '...' : '') || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-t-xl shadow-sm">
          <div className="flex">
            <button
              onClick={() => setActiveTab('information')}
              className={`flex items-center justify-center py-4 px-6 font-medium text-sm transition-all duration-200 ${
                activeTab === 'information'
                  ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              } flex-1`}
            >
              <FaInfoCircle className={`mr-2 ${activeTab === 'information' ? 'text-indigo-500' : 'text-gray-400'}`} />
              Information
            </button>
            <button
              onClick={() => setActiveTab('charities')}
              className={`flex items-center justify-center py-4 px-6 font-medium text-sm transition-all duration-200 ${
                activeTab === 'charities'
                  ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              } flex-1`}
            >
              <FaHandHoldingHeart className={`mr-2 ${activeTab === 'charities' ? 'text-indigo-500' : 'text-gray-400'}`} />
              Charities
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex items-center justify-center py-4 px-6 font-medium text-sm transition-all duration-200 ${
                activeTab === 'documents'
                  ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              } flex-1`}
            >
              <FaFileAlt className={`mr-2 ${activeTab === 'documents' ? 'text-indigo-500' : 'text-gray-400'}`} />
              Documents
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <AnimatePresence mode="wait">
          {activeTab === 'information' && (
            <motion.div
              key="information"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-b-xl shadow-sm overflow-hidden"
            >
              <div className="p-6 md:p-8">
                {/* Organization Summary Card */}
                <div className="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-indigo-100 p-3 rounded-full">
                      <FaBuilding className="text-indigo-600 text-xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 ml-4">Organization Summary</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="bg-white p-2 rounded-md shadow-sm">
                          <FaTag className="text-indigo-500" />
                        </div>
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-500 block">Category</span>
                          <span className="text-gray-900 font-medium">{orgData.category || 'Not specified'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-white p-2 rounded-md shadow-sm">
                          <FaRegCalendarAlt className="text-indigo-500" />
                        </div>
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-500 block">Joined</span>
                          <span className="text-gray-900 font-medium">
                            {orgData.created_at ? new Date(orgData.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="bg-white p-2 rounded-md shadow-sm">
                          <FaThumbsUp className="text-indigo-500" />
                        </div>
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-500 block">Followers</span>
                          <span className="text-gray-900 font-medium">{followerCount || 0}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-white p-2 rounded-md shadow-sm">
                          <FaRegClock className="text-indigo-500" />
                        </div>
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-500 block">Status</span>
                          <div className="flex items-center">
                            {orgData.is_verified ? (
                              <>
                                <FaCheckCircle className="text-green-500 mr-1" />
                                <span className="text-green-600 font-medium">Verified</span>
                              </>
                            ) : (
                              <>
                                <FaExclamationTriangle className="text-yellow-500 mr-1" />
                                <span className="text-yellow-600 font-medium">Pending Verification</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Description & Objectives */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <FaBullseye className="text-blue-600 text-xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Mission & Objectives</h2>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                      <div className="p-6">
                        <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                          <FaInfoCircle className="text-blue-500 mr-2" />
                          Description
                        </h3>
                        <div className="prose max-w-none">
                          <p className="text-gray-700">{orgData.description || 'No description provided.'}</p>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                          <FaBullseye className="text-blue-500 mr-2" />
                          Objectives
                        </h3>
                        <div className="prose max-w-none">
                          <p className="text-gray-700">{orgData.objectives || 'No objectives provided.'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-100 p-3 rounded-full mr-4">
                      <FaAddressCard className="text-purple-600 text-xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                      {/* Primary Contact Info */}
                      <div className="p-6">
                        <h3 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                          <FaIdCard className="text-purple-500 mr-2" />
                          Primary Contact
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-start">
                            <FaPhone className="text-gray-500 mt-1 flex-shrink-0 mr-3" />
                            <div>
                              <span className="text-sm font-medium text-gray-500 block">Phone</span>
                              <span className="text-gray-900">{orgData.phone_number || 'Not provided'}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <FaEnvelope className="text-gray-500 mt-1 flex-shrink-0 mr-3" />
                            <div>
                              <span className="text-sm font-medium text-gray-500 block">Email</span>
                              <span className="text-gray-900 break-all">{orgData.gmail || 'Not provided'}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <FaMapMarkerAlt className="text-gray-500 mt-1 flex-shrink-0 mr-3" />
                            <div>
                              <span className="text-sm font-medium text-gray-500 block">Address</span>
                              <span className="text-gray-900">{orgData.register_address || 'Not provided'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Online Presence */}
                      <div className="p-6">
                        <h3 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                          <FaGlobe className="text-purple-500 mr-2" />
                          Online Presence
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-start">
                            <FaGlobe className="text-gray-500 mt-1 flex-shrink-0 mr-3" />
                            <div>
                              <span className="text-sm font-medium text-gray-500 block">Website</span>
                              {orgData.website ? (
                                <a href={orgData.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 break-all">
                                  {formatSocialUrl(orgData.website)}
                                </a>
                              ) : (
                                <span className="text-gray-900">Not provided</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <FaFacebook className="text-gray-500 mt-1 flex-shrink-0 mr-3" />
                            <div>
                              <span className="text-sm font-medium text-gray-500 block">Facebook</span>
                              {orgData.facebook ? (
                                <a href={orgData.facebook} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 break-all">
                                  {formatSocialUrl(orgData.facebook)}
                                </a>
                              ) : (
                                <span className="text-gray-900">Not provided</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <FaInstagram className="text-gray-500 mt-1 flex-shrink-0 mr-3" />
                            <div>
                              <span className="text-sm font-medium text-gray-500 block">Instagram</span>
                              {orgData.instagram ? (
                                <a href={orgData.instagram} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 break-all">
                                  {formatSocialUrl(orgData.instagram)}
                                </a>
                              ) : (
                                <span className="text-gray-900">Not provided</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                     
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div>
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-3 rounded-full mr-4">
                      <FaHistory className="text-green-600 text-xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                      <div className="p-6">
                        <div className="flex items-center justify-center flex-col h-full">
                          <div className="bg-green-100 rounded-full p-4 mb-3">
                            <FaRegCalendarAlt className="text-green-600 text-xl" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">Account Created</h3>
                          <p className="text-gray-600">
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
                          <div className="bg-green-100 rounded-full p-4 mb-3">
                            <FaRegClock className="text-green-600 text-xl" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">Last Updated</h3>
                          <p className="text-gray-600">
                            {orgData.updated_at ? new Date(orgData.updated_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'Not available'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-center flex-col h-full">
                          <div className="bg-green-100 rounded-full p-4 mb-3">
                            <FaLock className="text-green-600 text-xl" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">Verification Status</h3>
                          <p className={`${orgData.is_verified ? 'text-green-600' : 'text-yellow-600'} font-medium`}>
                            {orgData.is_verified ? 'Verified Account' : 'Pending Verification'}
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
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-b-xl shadow-sm"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-indigo-100 p-3 rounded-full mr-4">
                      <FaHandHoldingHeart className="text-indigo-600 text-xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Charity Campaigns</h2>
                  </div>
                  
                  {currentUser && canEditOrganization() && (
                    <Link 
                      to={`/charities/create`}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                    >
                      <FaPlus className="mr-2" />
                      Add Charity
                    </Link>
                  )}
                </div>
                
                {charities.length > 0 ? (
                  <>
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
                      <FaInfoCircle className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-blue-800 mb-1">Charity Campaigns</h3>
                        <p className="text-blue-700 text-sm">
                          {orgData.name} has {charities.length} active charity campaign{charities.length !== 1 ? 's' : ''}. 
                          You can donate to any of the causes below.
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {charities.map(charity => (
                        <motion.div
                          key={charity.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CharityCard charity={charity} />
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <div className="bg-white rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <FaInfoCircle className="text-gray-400 text-2xl" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Charities Found</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      This organization hasn't added any charity campaigns yet. Check back later or follow the organization to get updates.
                    </p>
                    
                    {currentUser && canEditOrganization() && (
                      <Link 
                        to={`/charities/create`}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                      >
                        <FaPlus className="mr-2" />
                        Create Your First Charity
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
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-b-xl shadow-sm"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-indigo-100 p-3 rounded-full mr-4">
                    <FaFileContract className="text-indigo-600 text-xl" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Organization Documents</h2>
                </div>
                
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
                  <FaInfoCircle className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-800 mb-1">Verification Documents</h3>
                    <p className="text-blue-700 text-sm">
                      All organizations must submit official documents for verification. These documents help us confirm the legitimacy of the organization.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Verification Document */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 p-2 rounded-md">
                          <FaFileAlt className="text-indigo-600" />
                        </div>
                        <h3 className="ml-3 font-medium text-gray-900">Verification Document</h3>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${orgData.verified_document ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {orgData.verified_document ? 'Uploaded' : 'Missing'}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      {orgData.verified_document ? (
                        <div className="flex flex-col space-y-4">
                          <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4 h-48">
                            <div className="bg-indigo-100 p-3 rounded-full">
                              <FaFileContract className="text-indigo-600 text-2xl" />
                            </div>
                          </div>
                          
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">Verification Document</h4>
                              <p className="text-sm text-gray-500">Official verification document</p>
                            </div>
                            
                            <div className="space-x-2">
                              <a 
                                href={getImageUrl(orgData.verified_document)}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                              >
                                <FaEye className="mr-1" />
                                View
                              </a>
                              
                              <a 
                                href={getImageUrl(orgData.verified_document)}
                                download
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <FaDownload className="mr-1" />
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-center">
                          <div className="bg-gray-100 rounded-full p-4 mb-4">
                            <FaFileAlt className="text-gray-400 text-xl" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Document Uploaded</h3>
                          <p className="text-gray-600 mb-4">This organization hasn't uploaded a verification document yet.</p>
                          
                          {canEditOrganization() && (
                            <Link 
                              to={`/organizations/${id}/edit`}
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
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
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-md">
                          <FaFileAlt className="text-green-600" />
                        </div>
                        <h3 className="ml-3 font-medium text-gray-900">Statutory Declaration</h3>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${orgData.statutory_declaration ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {orgData.statutory_declaration ? 'Uploaded' : 'Missing'}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      {orgData.statutory_declaration ? (
                        <div className="flex flex-col space-y-4">
                          <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4 h-48">
                            <div className="bg-green-100 p-3 rounded-full">
                              <FaFileContract className="text-green-600 text-2xl" />
                            </div>
                          </div>
                          
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">Statutory Declaration</h4>
                              <p className="text-sm text-gray-500">Official statutory declaration document</p>
                            </div>
                            
                            <div className="space-x-2">
                              <a 
                                href={getImageUrl(orgData.statutory_declaration)}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                              >
                                <FaEye className="mr-1" />
                                View
                              </a>
                              
                              <a 
                                href={getImageUrl(orgData.statutory_declaration)}
                                download
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <FaDownload className="mr-1" />
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-center">
                          <div className="bg-gray-100 rounded-full p-4 mb-4">
                            <FaFileAlt className="text-gray-400 text-xl" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Declaration Uploaded</h3>
                          <p className="text-gray-600 mb-4">This organization hasn't uploaded a statutory declaration yet.</p>
                          
                          {canEditOrganization() && (
                            <Link 
                              to={`/organizations/${id}/edit`}
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
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