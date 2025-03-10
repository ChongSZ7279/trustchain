import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function OrganizationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrganizationDetails();
  }, [id]);

  const fetchOrganizationDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/organizations/${id}`);
      setOrgData(response.data);
    } catch (err) {
      setError('Failed to fetch organization details');
      console.error('Error fetching organization details:', err);
    } finally {
      setLoading(false);
    }
  };

  const canEditOrganization = () => {
    return organization?.id === orgData?.id || orgData?.representative_id === user?.ic_number;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !orgData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-800">{error || 'Organization not found'}</h3>
          <button
            onClick={() => navigate('/organizations')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Organizations
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
            <div className="flex items-center">
              <img
                src={`/storage/${orgData.logo}`}
                alt={orgData.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="ml-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {orgData.name}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {orgData.category}
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/organizations')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </button>
              {canEditOrganization() && (
                <button
                  onClick={() => navigate(`/organizations/${id}/edit`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Edit Organization
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{orgData.description}</dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Objectives</dt>
                <dd className="mt-1 text-sm text-gray-900">{orgData.objectives}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Contact Information</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div>Email: {orgData.gmail}</div>
                  <div>Phone: {orgData.phone_number}</div>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Registration Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{orgData.register_address}</dd>
              </div>

              {orgData.wallet_address && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Wallet Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{orgData.wallet_address}</dd>
                </div>
              )}

              {(orgData.website || orgData.facebook || orgData.instagram) && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Social Media</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="space-y-2">
                      {orgData.website && (
                        <a
                          href={orgData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-500 block"
                        >
                          Website
                        </a>
                      )}
                      {orgData.facebook && (
                        <a
                          href={orgData.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-500 block"
                        >
                          Facebook
                        </a>
                      )}
                      {orgData.instagram && (
                        <a
                          href={orgData.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-500 block"
                        >
                          Instagram
                        </a>
                      )}
                    </div>
                  </dd>
                </div>
              )}

              {orgData.others && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Additional Information</dt>
                  <dd className="mt-1 text-sm text-gray-900">{orgData.others}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Verification Status */}
          {!orgData.is_verified && (
            <div className="border-t border-gray-200">
              <div className="bg-yellow-50 px-4 py-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Verification Pending
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        This organization is currently pending verification. Our team will review the submitted documents and update the status accordingly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 