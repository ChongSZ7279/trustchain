import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function CharityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCharity();
  }, [id]);

  const fetchCharity = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/charities/${id}`);
      setCharity(response.data);
    } catch (err) {
      console.error('Error fetching charity:', err);
      setError(
        err.response?.data?.message || 
        'Failed to fetch charity details. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const canManageCharity = () => {
    if (!charity || !user) return false;
    return organization?.id === charity.organization_id || 
           charity.organization.representative_id === user.ic_number;
  };

  const calculateProgress = () => {
    if (!charity) return 0;
    return (charity.fund_received / charity.fund_targeted) * 100;
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this charity?')) {
      return;
    }

    try {
      await axios.delete(`/api/charities/${id}`);
      navigate('/charities');
    } catch (err) {
      console.error('Error deleting charity:', err);
      alert(err.response?.data?.message || 'Failed to delete charity');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !charity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-800">{error || 'Charity not found'}</h3>
          <button
            onClick={() => navigate('/charities')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Charities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Header */}
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Charity Details
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {charity.organization.name}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/charities')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </button>
              {canManageCharity() && (
                <>
                  <button
                    onClick={() => navigate(`/charities/${id}/edit`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              {/* Picture */}
              {charity.picture_path && (
                <div className="sm:col-span-2">
                  <img
                    src={`/storage/${charity.picture_path}`}
                    alt={`${charity.organization.name} charity`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Category */}
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900">{charity.category}</dd>
              </div>

              {/* Progress */}
              <div>
                <dt className="text-sm font-medium text-gray-500">Funding Progress</dt>
                <dd className="mt-1">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-indigo-600">
                          {calculateProgress().toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                      <div
                        style={{ width: `${calculateProgress()}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Received: ${charity.fund_received} / ${charity.fund_targeted}
                    </div>
                  </div>
                </dd>
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {charity.description}
                </dd>
              </div>

              {/* Organization Details */}
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Organization Information</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={`/storage/${charity.organization.logo}`}
                          alt={charity.organization.name}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/48?text=Logo';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">
                          {charity.organization.name}
                        </h4>
                        <p className="text-sm text-gray-500">{charity.organization.category}</p>
                      </div>
                    </div>
                  </div>
                </dd>
              </div>

              {/* Verification Status */}
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Verification Status</dt>
                <dd className="mt-1">
                  {charity.is_verified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending Verification
                    </span>
                  )}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 