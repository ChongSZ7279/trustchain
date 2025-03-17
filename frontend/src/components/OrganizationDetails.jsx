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
  FaInfoCircle,
  FaCalendarAlt,
  FaHandHoldingHeart,
  FaShare,
  FaBookmark
} from 'react-icons/fa';

export default function OrganizationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, accountType } = useAuth();
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
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
    return (accountType === 'organization' && orgData?.id === currentUser?.organization_id) || 
           (orgData?.representative_id === currentUser?.ic_number);
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
      className="min-h-screen bg-gray-100"
    >
      {/* Enhanced Cover Image with Gradient Overlay */}
      <div className="relative h-64 lg:h-96 w-full bg-indigo-900 overflow-hidden">
        {/* Cover Image with Loading State */}
        <div className={`absolute inset-0 bg-gray-200 ${imageLoading.cover ? 'animate-pulse' : ''}`}></div>
        <img
          src={formatImageUrl(orgData.cover_image_path) || 'https://via.placeholder.com/1920x400'}
          alt={`${orgData.name} cover`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading.cover ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setImageLoading(prev => ({ ...prev, cover: false }))}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Mission & Objectives</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-200 line-clamp-4 lg:line-clamp-none">
                    {orgData.mission || orgData.description?.substring(0, 200) + '...' || 'No mission statement provided.'}
                  </p>
                </div>
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={toggleFollow}
                    disabled={isFollowLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isFollowing
                        ? 'bg-white/20 text-white hover:bg-white/30 border border-white/50'
                        : 'bg-white text-indigo-700 hover:bg-gray-100'
                    }`}
                  >
                    <FaThumbsUp className={`inline-block mr-2 ${isFollowLoading ? 'opacity-50' : ''}`} />
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="px-4 py-2 rounded-lg font-medium bg-white/10 text-white hover:bg-white/20 transition-all duration-200 border border-white/30"
                  >
                    <FaShare className="inline-block mr-2" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <div className="max-w-7xl mx-auto">
            <Link 
              to="/organizations" 
              className="group inline-flex items-center text-sm font-medium text-white hover:text-indigo-200 transition-colors duration-200 bg-black/30 px-4 py-2 rounded-full"
            >
              <FaArrowLeft className="mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Organizations
            </Link>
          </div>
        </div>
      </div>

      {/* Organization Profile Card - Positioned to Overlap Cover Image */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              {/* Enhanced Logo */}
              <div className="relative flex-shrink-0 -mt-20 sm:-mt-24">
                <div className={`h-32 w-32 sm:h-40 sm:w-40 rounded-xl overflow-hidden border-4 border-white shadow-lg transition-opacity duration-300 ${imageLoading.logo ? 'animate-pulse bg-gray-200' : ''}`}>
                  <img
                    src={formatImageUrl(orgData.logo) || 'https://via.placeholder.com/128'}
                    alt={orgData.name}
                    className="h-full w-full object-cover"
                    onLoad={() => setImageLoading(prev => ({ ...prev, logo: false }))}
                  />
                </div>
                {orgData.is_verified && (
                  <div className="absolute -bottom-3 -right-3 bg-green-500 rounded-full p-2 shadow-lg">
                    <FaCheckCircle className="text-white text-lg" />
                  </div>
                )}
              </div>

              {/* Enhanced Organization Info */}
              <div className="flex-1 pt-4 lg:pt-0">
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

                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center text-gray-600">
                      <FaUsers className="mr-2" />
                      <span className="text-sm font-medium">{followerCount} followers</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaChartBar className="mr-2" />
                      <span className="text-sm font-medium">{charities.length} charities</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaCalendarAlt className="mr-2" />
                      <span className="text-sm font-medium">
                        Joined {new Date(orgData.created_at || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Enhanced Actions */}
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-3 w-full lg:w-auto mt-4 lg:mt-0"
              >
                <div className="relative">
                  <button
                    onClick={handleShare}
                    className="flex-1 lg:flex-none px-6 py-3 rounded-lg font-medium bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow hover:shadow-md"
                  >
                    <FaShare className="inline-block mr-2" />
                    Share
                  </button>
                  {showShareTooltip && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 text-white text-sm py-1 px-2 rounded z-10">
                      Link copied to clipboard!
                    </div>
                  )}
                </div>

                {canEditOrganization() && (
                  <Link
                    to={`/organizations/${id}/edit`}
                    className="flex-1 lg:flex-none px-6 py-3 rounded-lg font-medium bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 text-center shadow hover:shadow-md"
                  >
                    <FaEdit className="inline-block mr-2" />
                    Edit
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaBuilding className="inline-block mr-2" />
              Organization Info
            </button>
            <button
              onClick={() => setActiveTab('charities')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'charities'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaHandHoldingHeart className="inline-block mr-2" />
              Charities ({charities.length})
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contact'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaAddressCard className="inline-block mr-2" />
              Contact Information
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'about'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaInfoCircle className="inline-block mr-2" />
              About
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <AnimatePresence mode="wait">
          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <FaInfoCircle className="text-indigo-500 mr-3" />
                  About
                </h2>
                <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                  {orgData.description || 'No description provided.'}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Organization Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Registration Details</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500 block">Registration Number</span>
                        <span className="text-gray-900">{orgData.register_number || 'Not provided'}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 block">Registration Date</span>
                        <span className="text-gray-900">
                          {orgData.register_date ? new Date(orgData.register_date).toLocaleDateString() : 'Not provided'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 block">Organization Type</span>
                        <span className="text-gray-900">{orgData.type || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Additional Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500 block">Focus Areas</span>
                        <span className="text-gray-900">{orgData.focus_areas || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 block">Representative</span>
                        <span className="text-gray-900">{orgData.representative_name || 'Not provided'}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 block">Year Founded</span>
                        <span className="text-gray-900">{orgData.year_founded || 'Not provided'}</span>
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
            >
              {charities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {charities.map(charity => (
                    <motion.div
                      key={charity.id}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="h-48 bg-gray-200 relative">
                        <img
                          src={formatImageUrl(charity.image_path) || 'https://via.placeholder.com/400x200'}
                          alt={charity.name}
                          className="w-full h-full object-cover"
                        />
                        {charity.is_verified && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            <FaCheckCircle className="inline-block mr-1" />
                            Verified
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{charity.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{charity.description}</p>
                        <div className="flex justify-between items-center">
                          <Link
                            to={`/charities/${charity.id}`}
                            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                          >
                            View Details
                          </Link>
                          {currentUser && (
                            <Link
                              to={`/charities/${charity.id}/donate`}
                              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
                            >
                              Donate
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <FaInfoCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Charities Found</h3>
                  <p className="text-gray-600">This organization hasn't added any charities yet.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Details</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <FaPhone className="text-gray-500 mt-1 mr-3" />
                        <div>
                          <span className="text-sm font-medium text-gray-500 block">Phone</span>
                          <span className="text-gray-900">{orgData.phone || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <FaEnvelope className="text-gray-500 mt-1 mr-3" />
                        <div>
                          <span className="text-sm font-medium text-gray-500 block">Email</span>
                          <span className="text-gray-900">{orgData.email || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <FaMapMarkerAlt className="text-gray-500 mt-1 mr-3" />
                        <div>
                          <span className="text-sm font-medium text-gray-500 block">Address</span>
                          <span className="text-gray-900">{orgData.register_address || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Online Presence</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <FaGlobe className="text-gray-500 mt-1 mr-3" />
                        <div>
                          <span className="text-sm font-medium text-gray-500 block">Website</span>
                          {orgData.website ? (
                            <a href={orgData.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                              {orgData.website}
                            </a>
                          ) : (
                            <span className="text-gray-900">Not provided</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start">
                        <FaFacebook className="text-gray-500 mt-1 mr-3" />
                        <div>
                          <span className="text-sm font-medium text-gray-500 block">Facebook</span>
                          {orgData.facebook ? (
                            <a href={orgData.facebook} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                              {orgData.facebook}
                            </a>
                          ) : (
                            <span className="text-gray-900">Not provided</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start">
                        <FaInstagram className="text-gray-500 mt-1 mr-3" />
                        <div>
                          <span className="text-sm font-medium text-gray-500 block">Instagram</span>
                          {orgData.instagram ? (
                            <a href={orgData.instagram} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                              {orgData.instagram}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}