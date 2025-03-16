import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils/helpers';
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
  FaEdit
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
      const response = await axios.post(`/api/organizations/${organization.id}/follow`);
      setIsFollowing(response.data.is_following);
      setFollowerCount(response.data.follower_count);
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canEditOrganization = () => {
    return user && (user.ic_number === organization.representative_id);
  };

  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow">
      {/* Row 1: Logo, Status, Name, Category, Like Button */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <img
              className="h-16 w-16 rounded-lg object-cover bg-gray-100"
              src={formatImageUrl(organization.logo)}
              alt={organization.name}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/64?text=Logo';
              }}
            />
          </div>
          <div>
            <div className="flex items-center">
              {organization.is_verified ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                  <FaCheckCircle className="mr-1" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">
                  <FaExclamationTriangle className="mr-1" />
                  Pending
                </span>
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {organization.name}
            </h3>
            <p className="text-sm text-gray-500">{organization.category}</p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <button
            onClick={toggleFollow}
            disabled={isLoading}
            className={`p-2 rounded-full transition-colors ${
              isFollowing
                ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <FaThumbsUp className={`h-5 w-5 ${isLoading ? 'opacity-50' : ''}`} />
          </button>
          <span className="text-xs text-gray-500 mt-1">{followerCount}</span>
        </div>
      </div>

      {/* Row 2: Cover Image */}
      {organization.cover_image_path && (
        <div className="w-full h-40 overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={formatImageUrl(organization.cover_image_path)}
            alt={`${organization.name} cover`}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x300?text=Cover+Image';
            }}
          />
        </div>
      )}

      {/* Row 3: Description */}
      <div className="p-4">
        <p className="text-sm text-gray-600 line-clamp-3">
          {organization.description}
        </p>
      </div>

      {/* Row 4: More Details Button */}
      <div className="px-4 pb-4 flex justify-between items-center">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          {showDetails ? 'Less Details' : 'More Details'}
          {showDetails ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
        </button>
        <div className="flex space-x-2">
          <Link
            to={`/organizations/${organization.id}`}
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900"
          >
            <FaExternalLinkAlt className="mr-1" />
            View
          </Link>
          {canEditOrganization() && (
            <button
              onClick={() => navigate(`/organizations/${organization.id}/edit`)}
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900"
            >
              <FaEdit className="mr-1" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          <div className="space-y-2">
            {organization.phone_number && (
              <p className="text-sm text-gray-600 flex items-center">
                <FaPhone className="mr-2 text-gray-400" />
                {organization.phone_number}
              </p>
            )}
            {organization.gmail && (
              <p className="text-sm text-gray-600 flex items-center">
                <FaEnvelope className="mr-2 text-gray-400" />
                {organization.gmail}
              </p>
            )}
            {organization.register_address && (
              <p className="text-sm text-gray-600 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-gray-400" />
                {organization.register_address}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 