import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { formatImageUrl } from '../utils/helpers';

export default function OrganizationEdit() {
  const { organization, setOrganization } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    objectives: '',
    category: '',
    phone_number: '',
    register_address: '',
    website: '',
    facebook: '',
    instagram: '',
    logo: null,
    statutory_declaration: null,
    verified_document: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrls, setPreviewUrls] = useState({
    logo: null,
    statutory_declaration: null,
    verified_document: null
  });

  useEffect(() => {
    // Debug log
    console.log('Current organization data:', organization);

    // Redirect if no organization is logged in
    if (!organization) {
      navigate('/login');
      return;
    }

    setFormData({
      name: organization.name || '',
      description: organization.description || '',
      objectives: organization.objectives || '',
      category: organization.category || '',
      phone_number: organization.phone_number || '',
      register_address: organization.register_address || '',
      website: organization.website || '',
      facebook: organization.facebook || '',
      instagram: organization.instagram || '',
      logo: null,
      statutory_declaration: null,
      verified_document: null
    });

    setPreviewUrls({
      logo: organization.logo ? formatImageUrl(organization.logo) : null,
      statutory_declaration: organization.statutory_declaration ? formatImageUrl(organization.statutory_declaration) : null,
      verified_document: organization.verified_document ? formatImageUrl(organization.verified_document) : null
    });
  }, [organization, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
      setPreviewUrls(prev => ({
        ...prev,
        [name]: URL.createObjectURL(files[0])
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if organization exists and has id
    if (!organization?.id) {
      setError('Organization not found. Please try logging in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'logo' && key !== 'statutory_declaration' && key !== 'verified_document') {
          formDataToSend.append(key, formData[key]);
        }
      });
      formDataToSend.append('_method', 'PUT');

      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }
      if (formData.statutory_declaration) {
        formDataToSend.append('statutory_declaration', formData.statutory_declaration);
      }
      if (formData.verified_document) {
        formDataToSend.append('verified_document', formData.verified_document);
      }

      // Debug log before making request
      console.log('Sending update request for organization:', {
        id: organization.id,
        formData: Object.fromEntries(formDataToSend.entries())
      });

      const response = await axios.post(`/api/organizations/${organization.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      // Update the organization state with the new data
      if (response.data && typeof setOrganization === 'function') {
        setOrganization(response.data);
      }

      navigate('/organization/dashboard');
    } catch (err) {
      console.error('Update error details:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      });
      setError(err.response?.data?.message || 'Failed to update organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking organization authentication
  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center space-x-5">
              <div className="block pl-2 font-semibold text-xl self-start text-gray-700">
                <h2 className="leading-relaxed">Edit Organization</h2>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="flex flex-col">
                  <label className="leading-loose">Organization Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="leading-loose">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="leading-loose">Objectives</label>
                  <textarea
                    name="objectives"
                    value={formData.objectives}
                    onChange={handleInputChange}
                    rows="3"
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="leading-loose">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="leading-loose">Phone Number</label>
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="leading-loose">Registration Address</label>
                  <input
                    type="text"
                    name="register_address"
                    value={formData.register_address}
                    onChange={handleInputChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="leading-loose">Website (Optional)</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="leading-loose">Facebook (Optional)</label>
                  <input
                    type="url"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="leading-loose">Instagram (Optional)</label>
                  <input
                    type="url"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="leading-loose">Logo</label>
                  <input
                    type="file"
                    name="logo"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                  />
                  {previewUrls.logo && (
                    <img
                      src={previewUrls.logo}
                      alt="Logo Preview"
                      className="mt-2 h-32 w-32 object-cover rounded-lg"
                    />
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="leading-loose">Statutory Declaration</label>
                  <input
                    type="file"
                    name="statutory_declaration"
                    onChange={handleFileChange}
                    accept=".pdf,image/*"
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                  />
                  {previewUrls.statutory_declaration && (
                    <div className="mt-2">
                      <a
                        href={previewUrls.statutory_declaration}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600"
                      >
                        View Current Document
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="leading-loose">Verified Document</label>
                  <input
                    type="file"
                    name="verified_document"
                    onChange={handleFileChange}
                    accept=".pdf,image/*"
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                  />
                  {previewUrls.verified_document && (
                    <div className="mt-2">
                      <a
                        href={previewUrls.verified_document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600"
                      >
                        View Current Document
                      </a>
                    </div>
                  )}
                </div>
              </div>
              {error && (
                <div className="text-red-500 text-sm mt-2">
                  {error}
                </div>
              )}
              <div className="pt-4 flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/organization/dashboard')}
                  className="flex justify-center items-center w-full text-gray-900 px-4 py-3 rounded-md focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none hover:bg-blue-600"
                >
                  {loading ? 'Updating...' : 'Update Organization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 