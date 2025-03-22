import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function UserDashboardFollowing() {
  const [followedCharities, setFollowedCharities] = useState([]);
  const [charityUpdates, setCharityUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('charities');

  useEffect(() => {
    const fetchFollowedCharities = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const response = await axios.get('/api/users/followed-charities', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setFollowedCharities(response.data.followedCharities || []);
        setCharityUpdates(response.data.updates || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching followed charities:', error);
        toast.error('Failed to load your followed charities');
        setLoading(false);
      }
    };

    fetchFollowedCharities();
  }, []);

  const handleUnfollow = async (charityId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/charities/${charityId}/unfollow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the state to remove the unfollowed charity
      setFollowedCharities(followedCharities.filter(charity => charity.id !== charityId));
      toast.success('Charity unfollowed successfully');
    } catch (error) {
      toast.error('Failed to unfollow charity');
    }
  };

  const renderCharitiesList = () => {
    if (followedCharities.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">You're not following any charities yet.</p>
          <Link to="/charities" className="text-blue-600 hover:text-blue-800 font-medium">
            Explore charities to follow →
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {followedCharities.map(charity => (
          <div key={charity.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {charity.imageUrl && (
              <img 
                src={charity.imageUrl} 
                alt={charity.name} 
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{charity.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{charity.description}</p>
              
              <div className="flex justify-between items-center">
                <Link 
                  to={`/charities/${charity.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View details
                </Link>
                <button
                  onClick={() => handleUnfollow(charity.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Unfollow
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderUpdates = () => {
    if (charityUpdates.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No updates from your followed charities yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {charityUpdates.map((update, index) => (
          <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-center mb-3">
              {update.charityLogo && (
                <img 
                  src={update.charityLogo} 
                  alt={update.charityName} 
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
              )}
              <div>
                <h3 className="font-medium">{update.charityName}</h3>
                <p className="text-gray-500 text-sm">{new Date(update.date).toLocaleDateString()}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-3">{update.content}</p>
            {update.link && (
              <a 
                href={update.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Learn more →
              </a>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading your followed charities...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Organizations You Follow</h1>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('charities')}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'charities'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Followed Charities
            </button>
            <button
              onClick={() => setActiveTab('updates')}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'updates'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recent Updates
            </button>
          </nav>
        </div>
      </div>
      
      <div className="mt-6">
        {activeTab === 'charities' ? renderCharitiesList() : renderUpdates()}
      </div>
    </div>
  );
}

export default UserDashboardFollowing; 