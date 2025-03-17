import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils/helpers';
import { 
  FaCheckCircle, FaExclamationTriangle, FaThumbsUp, FaChevronDown, 
  FaChevronUp, FaPhone, FaEnvelope, FaMapMarkerAlt, FaExternalLinkAlt, FaEdit,
  FaTag
} from 'react-icons/fa';

export default function OrganizationCard({ organization }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(organization.is_following || false);
  const [followerCount, setFollowerCount] = useState(organization.follower_count || 0);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFollow = async () => {
    if (!user) {
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

  const canEditOrganization = () => user && (user.ic_number === organization.representative_id);

  return (
    <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200 flex flex-col mt-4">
      {/* Cover Image */}
      <div className="relative">
        <img
          className="w-full h-48 object-cover"
          src={formatImageUrl(organization.cover_image_path) || 'https://via.placeholder.com/300x200'}
          alt={`${organization.name} cover`}
        />
        
        {/* Logo overlapping the cover image */}
        <div className="absolute left-4 -bottom-8">
          <img
            className="h-16 w-16 rounded-lg object-cover border-2 border-white shadow-md"
            src={formatImageUrl(organization.logo) || 'https://via.placeholder.com/64'}
            alt={organization.name}
          />
        </div>
        
        {/* Like button positioned on the top right */}
        <div className="absolute top-2 right-2">
          <button
            onClick={toggleFollow}
            disabled={isLoading}
            className={`p-2 rounded-full transition-colors ${
              isFollowing ? 'text-white bg-indigo-600 hover:bg-indigo-700' : 'text-gray-100 bg-gray-700 bg-opacity-50 hover:bg-gray-600'
            }`}
          >
            <FaThumbsUp className={`h-5 w-5 ${isLoading ? 'opacity-50' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Organization Info */}
      <div className="p-4 pt-10">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-gray-900">{organization.name}</h3>
          
          <div className="flex items-center mt-2 space-x-2">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
              {organization.category}
            </div>
            
            {organization.is_verified ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <FaCheckCircle className="mr-1" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <FaExclamationTriangle className="mr-1" /> Pending
              </span>
            )}
          </div>
          
          {/* Location */}
          <div className="mt-3 flex items-center text-gray-600">
            <FaMapMarkerAlt className="mr-2 text-gray-500" />
            <span className="text-sm">{organization.register_address || 'Pulau Pinang, Malaysia'}</span>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-600 mt-4 line-clamp-3">{organization.description}</p>
      </div>

      {/* More Details (expandable) */}
      {showDetails && (
        <div className="p-4 border-t border-gray-100">
          {organization.phone_number && (
            <p className="text-sm text-gray-600 flex items-center">
              <FaPhone className="mr-2 text-gray-400" /> {organization.phone_number}
            </p>
          )}
          {organization.gmail && (
            <p className="text-sm text-gray-600 flex items-center">
              <FaEnvelope className="mr-2 text-gray-400" /> {organization.gmail}
            </p>
          )}
          {organization.register_address && (
            <p className="text-sm text-gray-600 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-gray-400" /> {organization.register_address}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t border-gray-100 flex justify-between mt-auto">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          {showDetails ? 'Less Details' : 'More Details'}
          {showDetails ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
        </button>
        
        <div className="flex space-x-2">
          <Link to={`/organizations/${organization.id}`} className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center">
            <FaExternalLinkAlt className="mr-1" /> View
          </Link>
          {canEditOrganization() && (
            <button
              onClick={() => navigate(`/organizations/${organization.id}/edit`)}
              className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center"
            >
              <FaEdit className="mr-1" /> Edit
            </button>
          )}
        </div>
      </div>
      
      {/* Follower count */}
      <div className="px-4 pb-3 text-xs text-gray-500 flex justify-end">
        {followerCount} {followerCount === 1 ? 'follower' : 'followers'}
      </div>
    </div>
  );
}
