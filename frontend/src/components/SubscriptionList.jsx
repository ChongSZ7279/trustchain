import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Subscription from './Subscription';
import {
  FaSpinner,
  FaExclamationTriangle,
  FaPlus,
  FaFilter,
  FaSearch
} from 'react-icons/fa';

const SubscriptionList = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'paused', 'cancelled'
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch user subscriptions
  const fetchSubscriptions = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await axios.get(`${API_BASE_URL}/subscriptions/user`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });

      if (response.data.success) {
        setSubscriptions(response.data.data);
      } else {
        setError('Failed to fetch subscriptions');
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError(err.response?.data?.error || 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscriptions on component mount
  useEffect(() => {
    fetchSubscriptions();
  }, [currentUser]);

  // Handle subscription status change
  const handleStatusChange = (subscriptionId, newStatus) => {
    setSubscriptions(prevSubscriptions => 
      prevSubscriptions.map(sub => 
        sub.id === subscriptionId ? { ...sub, status: newStatus } : sub
      )
    );
  };

  // Filter subscriptions based on status and search term
  const filteredSubscriptions = subscriptions.filter(subscription => {
    // Filter by status
    if (filter !== 'all' && subscription.status !== filter) {
      return false;
    }
    
    // Filter by search term (organization ID or amount)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const orgIdMatch = subscription.organizationId.toString().includes(searchLower);
      const amountMatch = subscription.amount.toString().includes(searchLower);
      return orgIdMatch || amountMatch;
    }
    
    return true;
  });

  // Get subscription count by status
  const getSubscriptionCount = (status) => {
    return subscriptions.filter(sub => sub.status === status).length;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Subscriptions</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your recurring donations
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => navigate('/organizations')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaPlus className="mr-2" />
              New Subscription
            </button>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({subscriptions.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  filter === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active ({getSubscriptionCount('active')})
              </button>
              <button
                onClick={() => setFilter('paused')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  filter === 'paused'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Paused ({getSubscriptionCount('paused')})
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  filter === 'cancelled'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancelled ({getSubscriptionCount('cancelled')})
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by org ID or amount"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-64"
              />
            </div>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center text-red-700">
            <FaExclamationTriangle className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-indigo-500 text-4xl" />
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'You don\'t have any subscriptions yet'}
            </p>
            <button
              onClick={() => navigate('/organizations')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaPlus className="mr-2" />
              Create a Subscription
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubscriptions.map(subscription => (
              <Subscription
                key={subscription.id}
                subscription={subscription}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionList;