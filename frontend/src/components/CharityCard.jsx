import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { formatImageUrl, getFileType } from '../utils/helpers';
import { 
  FaHeart, 
  FaTag, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaMoneyBillWave, 
  FaChartBar, 
  FaCalendarAlt, 
  FaUsers, 
  FaExternalLinkAlt, 
  FaEdit,
  FaChevronDown,
  FaChevronUp,
  FaThumbsUp,
  FaImage,
  FaFileAlt,
  FaFilePdf,
  FaFileWord,
  FaEye
} from 'react-icons/fa';

// Add this helper function at the top of the file, after imports
const getFileIcon = (fileType) => {
  if (fileType?.includes('pdf')) return <FaFilePdf className="text-red-500 text-xl" />;
  if (fileType?.includes('word') || fileType?.includes('doc')) return <FaFileWord className="text-blue-500 text-xl" />;
  if (fileType?.includes('image')) return <FaImage className="text-green-500 text-xl" />;
  return <FaFileAlt className="text-gray-500 text-xl" />;
};

export default function CharityCard({ charity }) {
  const navigate = useNavigate();
  const { organization, currentUser } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [isFollowing, setIsFollowing] = useState(charity.is_following || false);
  const [followerCount, setFollowerCount] = useState(charity.follower_count || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  
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
    console.log('Charity image path:', charity.picture_path);
    console.log('Formatted charity image URL:', formatImageUrl(charity.picture_path));
  }, [charity]);

  const toggleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`/charities/${charity.id}/follow`);
      setIsFollowing(response.data.is_following);
      setFollowerCount(response.data.follower_count);
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
          style={{ boxShadow: "6px 6px 10px rgba(0, 0, 0, 0.2)" }}
        >
          {imageError || !charity.picture_path ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
              <FaImage className="h-12 w-12 text-gray-400" />
            </div>
          ) : (
            <img
              src={formatImageUrl(charity.picture_path)}
              alt={charity.name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                console.error('Failed to load charity image:', charity.picture_path);
                setImageError(true);
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
      
      {/* Charity Info */}
      <div className="p-4 flex-grow">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{charity.name}</h3>
          
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-800">
              {charity.category || 'CATEGORY'}
            </span>
            
            {charity.is_verified ? (
              <span className="px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 flex items-center">
                <FaCheckCircle className="mr-1" /> VERIFIED
              </span>
            ) : (
              <span className="px-3 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center">
                <FaExclamationTriangle className="mr-1" /> PENDING
              </span>
            )}
          </div>

        </div>
        
        {/* Fund Progress */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <FaMoneyBillWave className="text-indigo-400 mr-2" />
              <span className="text-sm text-gray-900 font-medium">
                ${charity.fund_received || 0} / ${charity.fund_targeted || 0}
              </span>
            </div>
            <span className="text-xs font-medium text-gray-500">
              {Math.min(100, ((charity.fund_received || 0) / (charity.fund_targeted || 1)) * 100).toFixed(0)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, ((charity.fund_received || 0) / (charity.fund_targeted || 1)) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-100 flex justify-end mt-auto">
        <div className="flex space-x-4">
          {/* View button - visible to all */}
          <Link
            to={`/charities/${charity.id}`}
            className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center transition-colors duration-200"
          >
            <FaExternalLinkAlt className="mr-1" /> View
          </Link>

          {/* Edit button - only visible to organization owner */}
          {currentUser && currentUser.id === charity.organization_id && (
            <Link
              to={`/charities/${charity.id}/edit`}
              className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center transition-colors duration-200"
            >
              <FaEdit className="mr-1" /> Edit
            </Link>
          )}

          {/* Follow button - only visible to logged-in users */}
          {currentUser && (
            <button
              onClick={toggleFollow}
              disabled={isLoading}
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
        </div>
      </div>
    </motion.div>
  );
} 