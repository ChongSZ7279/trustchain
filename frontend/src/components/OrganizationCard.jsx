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
  FaImage,
  FaUserCheck,
  FaUserPlus
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function OrganizationCard({ organization, inDashboard = false }) {
  const navigate = useNavigate();
  const auth = useAuth();
  const { currentUser, accountType } = auth;
  const [isFollowing, setIsFollowing] = useState(inDashboard || organization.is_following || false);
  const [followerCount, setFollowerCount] = useState(organization.follower_count || 0);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [coverImageError, setCoverImageError] = useState(false);
  const [logoImageError, setLogoImageError] = useState(false);

  // Function to check if the user is an organization
  const isOrganizationUser = () => {
    // More thorough check for organization status
    return accountType === 'organization' || 
           currentUser?.account_type === 'organization' ||
           currentUser?.is_organization === true;
  };

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

  // Check follow status when component mounts
  useEffect(() => {
    // Only check follow status if user is logged in and not in dashboard
    if (currentUser && !isOrganizationUser() && !inDashboard) {
      const checkFollowStatus = async () => {
        try {
          console.log(`Checking follow status for organization ${organization.id}`);
          const response = await axios.get(`/organizations/${organization.id}/follow-status`);
          console.log('Follow status response:', response.data);
          
          if (response.data && response.data.is_following !== undefined) {
            setIsFollowing(response.data.is_following);
            if (response.data.follower_count !== undefined) {
              setFollowerCount(response.data.follower_count);
            }
          }
        } catch (error) {
          console.error('Error checking follow status:', error);
        }
      };
      
      checkFollowStatus();
    }
  }, [currentUser, organization.id, inDashboard]);

  const toggleFollow = async () => {
    if (!currentUser) {
      toast.error('Please login to follow organizations');
      return;
    }

    // Hide follow button for organization users
    if (isOrganizationUser()) {
      return;
    }

    // Prevent users from following their own organization
    if (currentUser.ic_number === organization.representative_id) {
      toast.error('You cannot follow your own organization');
      return;
    }

    try {
      setIsLoading(true);
      console.log(`Making request to: /organizations/${organization.id}/follow`);
      
      const response = await axios.post(`/organizations/${organization.id}/follow`);
      console.log('Follow response:', response.data);
      
      // Update the UI based on the response
      setIsFollowing(response.data.is_following);
      setFollowerCount(response.data.follower_count || followerCount);
      
      toast.success(response.data.is_following ? 
        'Successfully followed organization' : 
        'Successfully unfollowed organization'
      );
    } catch (error) {
      console.error('Error toggling follow status:', error);
      toast.error(error.response?.data?.message || 'Failed to follow organization');
    } finally {
      setIsLoading(false);
    }
  };

  const canEditOrganization = () => {
    // Allow if user is the representative (IC number matches)
    if (currentUser && currentUser.ic_number === organization.representative_id) {
      return true;
    }
    
    // Allow if user is an organization and is the same organization
    if (currentUser && accountType === 'organization' && currentUser.id === organization.id) {
      return true;
    }
    
    return false;
  };
  
  // Default placeholder images
  const defaultCoverImage = '/images/placeholder.jpg';
  const defaultLogoImage = '/images/logo-placeholder.jpg';

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-gray-50 overflow-hidden shadow-md hover:shadow-xl rounded-xl border border-gray-200 flex flex-col h-full transition-all duration-200"
    >
      <Link
      to={`/organizations/${organization.id}`}
      className="flex flex-col h-full"
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
          {/* View button - visible to all */}
          <Link 
            to={`/organizations/${organization.id}`} 
            className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center transition-colors duration-200"
          >
            <FaExternalLinkAlt className="mr-1" /> View
          </Link>

          {/* Edit button - only visible to organization owner */}
          {canEditOrganization() && (
            <Link
              to={`/organizations/${organization.id}/edit`}
              className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center transition-colors duration-200"
            >
              <FaEdit className="mr-1" /> Edit
            </Link>
          )}

          {/* Only show follow button for non-organization users and not in dashboard */}
          {currentUser && !isOrganizationUser() && !inDashboard && (
            <button
              onClick={toggleFollow}
              className={`text-sm flex items-center transition-colors duration-200 ${
                isFollowing
                  ? 'text-indigo-600 hover:text-indigo-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isFollowing ? (
                <>
                  <FaHeart className="mr-1" /> Following
                </>
              ) : (
                <>
                  <FaThumbsUp className="mr-1" /> Follow
                </>
              )}
            </button>
          )}

          {/* Show a static "Following" indicator when in dashboard */}
          {inDashboard && (
            <div className="text-sm flex items-center text-indigo-600">
              <FaHeart className="mr-1" /> Following
            </div>
          )}
        </div>
      </div>
      </Link>
      
    </motion.div>
  );
}
