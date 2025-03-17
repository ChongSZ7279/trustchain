import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaThumbsUp, 
  FaChevronDown, 
  FaChevronUp, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaExternalLinkAlt, 
  FaEdit,
  FaTag,
  FaHeart,
  FaImage
} from 'react-icons/fa';

export default function OrganizationCard({ organization }) {
  const navigate = useNavigate();
  const { currentUser, accountType } = useAuth();
  const [isFollowing, setIsFollowing] = useState(organization.is_following || false);
  const [followerCount, setFollowerCount] = useState(organization.follower_count || 0);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [coverImageError, setCoverImageError] = useState(false);
  const [logoImageError, setLogoImageError] = useState(false);

  // Helper function to format image URL
  const formatImageUrl = (path) => {
    if (!path) return null;
    
    // If it's already a full URL
    if (path.startsWith('http')) return path;
    
    // For storage paths like "organization_covers/filename.jpg"
    if (path.includes('organization_covers/') || 
        path.includes('organization_logos/') || 
        path.includes('charity_pictures/')) {
      return `/storage/${path}`;
    }
    
    // If path starts with a slash, it's already a relative path
    if (path.startsWith('/')) return path;
    
    // Otherwise, add a slash to make it a relative path from the root
    return `/${path}`;
  };

  // Log image paths for debugging
  useEffect(() => {
    console.log('Organization cover image path:', organization.cover_image_path);
    console.log('Organization logo path:', organization.logo);
  }, [organization]);

  const toggleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`/organizations/${organization.id}/follow`);
      setIsFollowing(response.data.is_following);
      setFollowerCount(response.data.follower_count);
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canEditOrganization = () => currentUser && (currentUser.ic_number === organization.representative_id);

  // Default placeholder images
  const defaultCoverImage = '/images/placeholder.jpg';
  const defaultLogoImage = '/images/logo-placeholder.jpg';

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-gray-50 overflow-hidden shadow-md hover:shadow-xl rounded-xl border border-gray-200 flex flex-col h-full transition-all duration-200"
    >
      {/* Cover Image */}
    <div className="relative p-4"> 
      <div 
        className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden relative"
        style={{ boxShadow: "6px 6px 10px rgba(0, 0, 0, 0.2)" }} // Custom shadow on bottom-right
      >
        {coverImageError || !organization.cover_image_path ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
            <FaImage className="h-12 w-12 text-gray-400" />
          </div>
        ) : (
          <img
            className="w-full h-full object-cover rounded-lg"
            src={formatImageUrl(organization.cover_image_path)}
            alt={`${organization.name} cover`}
            onError={(e) => {
              console.error('Failed to load cover image:', organization.cover_image_path);
              setCoverImageError(true);
            }}
          />
        )}
      </div>
      
      {/* Like button positioned on the top right */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleFollow}
          disabled={isLoading}
          className={`p-2 rounded-full transition-colors shadow-md ${
            isFollowing 
              ? 'text-white bg-indigo-600 hover:bg-indigo-700' 
              : 'text-gray-100 bg-gray-700 bg-opacity-50 hover:bg-gray-600'
          }`}
        >
          {isFollowing ? (
            <FaHeart className={`h-5 w-5 ${isLoading ? 'opacity-50' : ''}`} />
          ) : (
            <FaThumbsUp className={`h-5 w-5 ${isLoading ? 'opacity-50' : ''}`} />
          )}
        </button>
      </div>
    </div>

      
      {/* Organization Info with Logo */}
      <div className="p-4 flex-grow">
        <div className="flex items-start space-x-3">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="h-16 w-16 rounded-lg overflow-hidden border-2 border-white shadow-md bg-white">
              {logoImageError || !organization.logo ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <FaImage className="h-8 w-8 text-gray-400" />
                </div>
              ) : (
                <img
                  className="h-full w-full object-cover"
                  src={formatImageUrl(organization.logo)}
                  alt={organization.name}
                  onError={(e) => {
                    console.error('Failed to load logo image:', organization.logo);
                    setLogoImageError(true);
                  }}
                />
              )}
            </div>
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{organization.name}</h3>
            
            <div className="flex items-center mt-1 space-x-2">
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                <FaTag className="mr-1 text-blue-500" />
                {organization.category || 'CATEGORY'}
              </div>
              
              {organization.is_verified ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                  <FaCheckCircle className="mr-1 text-green-500" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                  <FaExclamationTriangle className="mr-1 text-yellow-500" /> Pending
                </span>
              )}
            </div>
            
            {/* Location */}
            <div className="mt-2 flex items-center text-gray-600">
              <FaMapMarkerAlt className="mr-2 text-gray-400" />
              <span className="text-sm">{organization.register_address || 'Pulau Pinang, Malaysia'}</span>
            </div>
          </div>
        </div>
        
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-100 flex justify-end mt-auto">
        <div className="flex space-x-4">
          <Link 
            to={`/organizations/${organization.id}`} 
            className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center transition-colors duration-200"
          >
            <FaExternalLinkAlt className="mr-1" /> View
          </Link>
          {canEditOrganization() && (
            <button
              onClick={() => navigate(`/organizations/${organization.id}/edit`)}
              className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center transition-colors duration-200"
            >
              <FaEdit className="mr-1" /> Edit
            </button>
          )}
        </div>
      </div>

      
    </motion.div>
  );
}
