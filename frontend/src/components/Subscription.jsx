import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  FaCalendarAlt,
  FaEthereum,
  FaExchangeAlt,
  FaPause,
  FaPlay,
  FaTrash,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSpinner
} from 'react-icons/fa';

const Subscription = ({ subscription, onStatusChange }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get payment method icon
  const getPaymentMethodIcon = () => {
    return subscription.paymentMethod === 'scroll' ? (
      <FaEthereum className="text-indigo-600" />
    ) : (
      <FaExchangeAlt className="text-indigo-600" />
    );
  };

  // Get payment method label
  const getPaymentMethodLabel = () => {
    return subscription.paymentMethod === 'scroll' ? 'Scroll Wallet' : 'Transak';
  };

  // Get frequency label
  const getFrequencyLabel = () => {
    switch (subscription.frequency) {
      case 'weekly':
        return 'Weekly';
      case 'biweekly':
        return 'Bi-weekly';
      case 'monthly':
        return 'Monthly';
      case 'quarterly':
        return 'Quarterly';
      default:
        return subscription.frequency;
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await axios.patch(
        `${API_BASE_URL}/subscriptions/${subscription.id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        }
      );

      if (response.data.success) {
        if (onStatusChange) {
          onStatusChange(subscription.id, newStatus);
        }
      } else {
        setError('Failed to update subscription status');
      }
    } catch (err) {
      console.error('Error updating subscription:', err);
      setError(err.response?.data?.error || 'Failed to update subscription status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate days until next payment
  const getDaysUntilNextPayment = () => {
    const nextPayment = new Date(subscription.nextPaymentDate);
    const today = new Date();
    const diffTime = nextPayment - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilNextPayment = getDaysUntilNextPayment();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {error && (
        <div className="bg-red-50 p-3 border-b border-red-100 flex items-center text-red-700">
          <FaExclamationTriangle className="mr-2 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {formatCurrency(subscription.amount)} {getFrequencyLabel()} Donation
            </h3>
            <p className="text-sm text-gray-500">
              to Organization #{subscription.organizationId}
            </p>
          </div>
          <div className="flex items-center">
            {getPaymentMethodIcon()}
            <span className="ml-2 text-sm font-medium text-gray-700">
              {getPaymentMethodLabel()}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <p className="text-sm font-medium text-gray-900 capitalize">
              {subscription.status}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Next Payment</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(subscription.nextPaymentDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Last Payment</p>
            <p className="text-sm font-medium text-gray-900">
              {subscription.lastPaymentDate 
                ? formatDate(subscription.lastPaymentDate) 
                : 'No payments yet'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Days Until Next</p>
            <p className="text-sm font-medium text-gray-900">
              {daysUntilNextPayment} days
            </p>
          </div>
        </div>
        
        {subscription.message && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-500 mb-1">Message</p>
            <p className="text-sm text-gray-700">{subscription.message}</p>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            {subscription.status === 'active' ? (
              <button
                onClick={() => handleStatusChange('paused')}
                disabled={isUpdating}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isUpdating ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaPause className="mr-2" />
                )}
                Pause
              </button>
            ) : subscription.status === 'paused' ? (
              <button
                onClick={() => handleStatusChange('active')}
                disabled={isUpdating}
                className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isUpdating ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaPlay className="mr-2" />
                )}
                Resume
              </button>
            ) : null}
            
            <button
              onClick={() => handleStatusChange('cancelled')}
              disabled={isUpdating}
              className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {isUpdating ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaTrash className="mr-2" />
              )}
              Cancel
            </button>
          </div>
          
          <div className="flex items-center text-xs text-gray-500">
            <FaInfoCircle className="mr-1" />
            <span>ID: {subscription.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;