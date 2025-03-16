import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils/helpers';
import { 
  FaCheckCircle, FaExclamationTriangle, FaThumbsUp, FaChevronDown, 
  FaChevronUp, FaPhone, FaEnvelope, FaMapMarkerAlt, FaExternalLinkAlt, FaEdit 
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

  const canEditOrganization = () => user && (user.ic_number === organization.representative_id);

  return (
    <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200 w-96 flex flex-col mt-4  ">
      
      {/* Row 1: Logo & Organization Info */}
      <div className="p-4 flex items-center space-x-4">
        {/* Organization Logo */}
        <img
          className="h-16 w-16 rounded-lg object-cover"
          src={formatImageUrl(organization.logo) || 'https://via.placeholder.com/64'}
          alt={organization.name}
        />

        {/* Organization Details */}
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{organization.name}</h3>
              <div className="flex items-center space-x-2 mt-2">
                  <p className="text-sm text-gray-500">{organization.category}</p>
                  {/* Verification Badge */}
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
            </div>

            {/* Thumbs Up & Follower Count */}
            <div className="flex flex-col items-center space-x-2">
              <button
                onClick={toggleFollow}
                disabled={isLoading}
                className={`p-2 rounded-full transition-colors ${
                  isFollowing ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                <FaThumbsUp className={`h-5 w-5 ${isLoading ? 'opacity-50' : ''}`} />
              </button>
              <span className="text-xs text-gray-500">{followerCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Cover Image */}
      <img
        className="w-full h-48 object-cover p-2"
        src={formatImageUrl(organization.cover_image_path) || 'https://via.placeholder.com/300x200'}
        alt={`${organization.name} cover`}
      />
      
      {/* Row 3: Objective */}
      <div className="p-4">
        <p className="text-sm text-gray-600 line-clamp-3">{organization.description}</p>
      </div>

      {/* Row 4: More Details */}
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

      {/* Row 5: Actions (More Details, View, Edit) */}
      <div className="p-4 border-t border-gray-100 flex justify-between">
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
    </div>
  );
}
