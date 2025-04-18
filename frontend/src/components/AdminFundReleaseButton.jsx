import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaCoins, FaSpinner, FaExternalLinkAlt } from 'react-icons/fa';

/**
 * Button component for admins to release funds after proof verification
 * @param {Object} props - Component props
 * @param {string} props.type - Type of release ('task' or 'donation')
 * @param {number} props.id - ID of the task or donation
 * @param {function} props.onSuccess - Callback function to execute after successful fund release
 */
const AdminFundReleaseButton = ({ type, id, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [showTxDetails, setShowTxDetails] = useState(false);

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

        // Store the transaction hash if available
        if (response.data.transaction_hash) {
          setTxHash(response.data.transaction_hash);
          setShowTxDetails(true);
        }

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
    <div className="space-y-2">
      {!showTxDetails ? (
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
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center">
            <FaCheckCircle className="text-green-500 mr-2" />
            <span className="text-sm font-medium text-green-800">Funds released successfully</span>
          </div>
          {txHash && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Transaction Hash:</p>
              <div className="flex items-center">
                <code className="text-xs bg-gray-100 p-1 rounded">
                  {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}
                </code>
                <a
                  href={`https://sepolia.scrollscan.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  <FaExternalLinkAlt className="mr-1" size={10} />
                  View on Scroll Explorer
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminFundReleaseButton;
