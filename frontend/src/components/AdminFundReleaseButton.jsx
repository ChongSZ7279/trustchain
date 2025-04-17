import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaCoins, FaSpinner } from 'react-icons/fa';

/**
 * Button component for admins to release funds after proof verification
 * @param {Object} props - Component props
 * @param {string} props.type - Type of release ('task' or 'donation')
 * @param {number} props.id - ID of the task or donation
 * @param {function} props.onSuccess - Callback function to execute after successful fund release
 */
const AdminFundReleaseButton = ({ type, id, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleReleaseFunds = async () => {
    if (!window.confirm(`Are you sure you want to release funds for this ${type}?`)) {
      return;
    }

    setLoading(true);
    try {
      const endpoint = type === 'task' 
        ? `/tasks/${id}/release-funds` 
        : `/donations/${id}/release-funds`;

      const response = await axios.post(endpoint);
      
      if (response.data.success) {
        toast.success('Funds released successfully');
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(response.data);
        }
      } else {
        toast.error(`Failed to release funds: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error releasing funds:', error);
      toast.error(`Error releasing funds: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReleaseFunds}
      disabled={loading}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <FaSpinner className="animate-spin mr-2" />
          Processing...
        </>
      ) : (
        <>
          <FaCoins className="mr-2" />
          Release Funds to Charity
        </>
      )}
    </button>
  );
};

export default AdminFundReleaseButton;
