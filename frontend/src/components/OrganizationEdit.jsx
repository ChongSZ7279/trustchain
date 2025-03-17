import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { formatImageUrl } from '../utils/helpers';
import { 
  FaBuilding, 
  FaFileAlt, 
  FaImage, 
  FaPhone, 
  FaMapMarkerAlt,
  FaGlobe,
  FaFacebook,
  FaInstagram,
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaExclamationTriangle
} from 'react-icons/fa';

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
    cover_image_path: null,
    statutory_declaration: null,
    verified_document: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrls, setPreviewUrls] = useState({
    logo: null,
    cover_image_path: null,
    statutory_declaration: null,
    verified_document: null
  });

  useEffect(() => {
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
      cover_image_path: null,
      statutory_declaration: null,
      verified_document: null
    });

    setPreviewUrls({
      logo: organization.logo ? formatImageUrl(organization.logo) : null,
      cover_image_path: organization.cover_image_path ? formatImageUrl(organization.cover_image_path) : null,
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

    if (!organization?.id) {
      setError('Organization not found. Please try logging in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      setSubmitting(true);
      
      // Create FormData object for file uploads
      const formDataToSend = new FormData();
      
      // Append all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'logo' || key === 'cover_image_path') {
          if (formData[key] && formData[key] instanceof File) {
            formDataToSend.append(key, formData[key]);
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Use PUT method for update
      const response = await axios.post(`/organizations/${organization.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && typeof setOrganization === 'function') {
        setOrganization(response.data);
      }

      navigate('/organization/dashboard');
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-gray-500 mb-6">
          <Link to="/organization/dashboard" className="hover:text-gray-700 flex items-center">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Edit Organization</span>
        </nav>

        <div className="bg-white shadow-sm rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FaBuilding className="mr-3" />
                Edit Organization
              </h1>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-red-400 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Objectives</label>
                    <textarea
                      name="objectives"
                      value={formData.objectives}
                      onChange={handleInputChange}
                      rows="3"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaPhone className="mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaMapMarkerAlt className="mr-2" />
                      Registration Address
                    </label>
                    <input
                      type="text"
                      name="register_address"
                      value={formData.register_address}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaGlobe className="mr-2" />
                      Website (Optional)
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaFacebook className="mr-2" />
                      Facebook (Optional)
                    </label>
                    <input
                      type="url"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaInstagram className="mr-2" />
                      Instagram (Optional)
                    </label>
                    <input
                      type="url"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Documents & Images</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaImage className="mr-2" />
                      Organization Logo
                    </label>
                    <div className="mt-1 flex items-center space-x-4">
                      {previewUrls.logo && (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                          <img
                            src={previewUrls.logo}
                            alt="Logo Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        name="logo"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaImage className="mr-2" />
                      Cover Image
                    </label>
                    <div className="mt-1 flex flex-col space-y-4">
                      {previewUrls.cover_image_path && (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden">
                          <img
                            src={previewUrls.cover_image_path}
                            alt="Cover Image Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        name="cover_image_path"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      <p className="text-xs text-gray-500">
                        Recommended size: 1200 x 300 pixels. This image will appear at the top of your organization profile.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaFileAlt className="mr-2" />
                      Statutory Declaration
                    </label>
                    <div className="mt-1 flex items-center space-x-4">
                      {previewUrls.statutory_declaration && (
                        <a
                          href={previewUrls.statutory_declaration}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                        >
                          View Current
                        </a>
                      )}
                      <input
                        type="file"
                        name="statutory_declaration"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaFileAlt className="mr-2" />
                      Verified Document
                    </label>
                    <div className="mt-1 flex items-center space-x-4">
                      {previewUrls.verified_document && (
                        <a
                          href={previewUrls.verified_document}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                        >
                          View Current
                        </a>
                      )}
                      <input
                        type="file"
                        name="verified_document"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/organization/dashboard')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Update Organization
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 