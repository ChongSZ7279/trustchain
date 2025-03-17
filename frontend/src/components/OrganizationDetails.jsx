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
  FaBookmark,
  FaFileContract
} from 'react-icons/fa';
import CharityCard from './CharityCard';

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
        {/* Navigation Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Link 
              to="/organizations" 
            className="group inline-flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors duration-200"
            >
              <FaArrowLeft className="mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Organizations
            </Link>
        </div>
      </div>

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
                    className="px-4 py-2 rounded-md font-medium text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 text-center"
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
          <div className="relative h-64 rounded-xl overflow-hidden">
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
        <div className="flex justify-between border-b border-gray-200">
          <button
            onClick={() => setActiveTab('information')}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'information'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Information
          </button>
          <button
            onClick={() => setActiveTab('charities')}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'charities'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Charities
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Documents
          </button>
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
              className="bg-white rounded-xl shadow-sm overflow-hidden mt-4"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Organization Information</h2>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Description & Objectives</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-500 block mb-1">Description</span>
                      <p className="text-gray-900">{orgData.description || 'No description provided.'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 block mb-1">Objectives</span>
                      <p className="text-gray-900">{orgData.objectives || 'No objectives provided.'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <FaPhone className="text-gray-500 mt-1 mr-3" />
                          <div>
                            <span className="text-sm font-medium text-gray-500 block">Phone</span>
                            <span className="text-gray-900">{orgData.phone_number || 'Not provided'}</span>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <FaEnvelope className="text-gray-500 mt-1 mr-3" />
                          <div>
                            <span className="text-sm font-medium text-gray-500 block">Email</span>
                            <span className="text-gray-900">{orgData.gmail || 'Not provided'}</span>
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
                        {orgData.others && (
                          <div className="flex items-start">
                            <FaLink className="text-gray-500 mt-1 mr-3" />
                            <div>
                              <span className="text-sm font-medium text-gray-500 block">Other Links</span>
                              <span className="text-gray-900">{orgData.others}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Account Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500 block">Created At</span>
                        <span className="text-gray-900">
                          {orgData.created_at ? new Date(orgData.created_at).toLocaleString() : 'Not available'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 block">Last Updated</span>
                        <span className="text-gray-900">
                          {orgData.updated_at ? new Date(orgData.updated_at).toLocaleString() : 'Not available'}
                        </span>
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
              className="mt-4"
            >
              {charities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {charities.map(charity => (
                    <CharityCard key={charity.id} charity={charity} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center mt-4">
                  <FaInfoCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Charities Found</h3>
                  <p className="text-gray-600">This organization hasn't added any charities yet.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden mt-4"
            >
              <div className="p-6">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FaFileContract className="text-indigo-500 mr-3" />
                    Verification Document
                  </h2>
                  
                  {orgData.verified_document ? (
                    <div className="border border-gray-200 rounded-lg p-4 flex items-center">
                      <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                        <FaFileAlt className="text-indigo-600 text-xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">Verification Document</h3>
                        <p className="text-sm text-gray-500">Official verification document</p>
                      </div>
                      <a 
                        href={getImageUrl(orgData.verified_document)}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        View
                      </a>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <FaFileAlt className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Verification Document</h3>
                      <p className="text-gray-600">This organization hasn't uploaded a verification document yet.</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FaFileContract className="text-indigo-500 mr-3" />
                    Statutory Declaration
            </h2>
                  
                  {orgData.statutory_declaration ? (
                    <div className="border border-gray-200 rounded-lg p-4 flex items-center">
                      <div className="bg-green-100 p-3 rounded-lg mr-4">
                        <FaFileAlt className="text-green-600 text-xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">Statutory Declaration</h3>
                        <p className="text-sm text-gray-500">Official statutory declaration document</p>
                      </div>
                      <a 
                        href={getImageUrl(orgData.statutory_declaration)}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        View
                      </a>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <FaFileAlt className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Statutory Declaration</h3>
                      <p className="text-gray-600">This organization hasn't uploaded a statutory declaration yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}