import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function OrganizationEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    objectives: '',
    wallet_address: '',
    register_address: '',
    gmail: '',
    phone_number: '',
    website: '',
    facebook: '',
    instagram: '',
    others: ''
  });
  const [files, setFiles] = useState({
    logo: null,
    statutory_declaration: null,
    verified_document: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (id) {
      fetchOrganizationDetails();
    }
  }, [id, user, organization]);

  const fetchOrganizationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      setFormErrors({}); // Clear any existing form errors
      const response = await axios.get(`/api/organizations/${id}`);
      const orgData = response.data;

      // Check if user has permission to edit
      if (organization?.id !== orgData.id && orgData.representative_id !== user?.ic_number) {
        navigate(`/organizations/${id}`);
        return;
      }

      setFormData({
        name: orgData.name || '',
        category: orgData.category || '',
        description: orgData.description || '',
        objectives: orgData.objectives || '',
        wallet_address: orgData.wallet_address || '',
        register_address: orgData.register_address || '',
        gmail: orgData.gmail || '',
        phone_number: orgData.phone_number || '',
        website: orgData.website || '',
        facebook: orgData.facebook || '',
        instagram: orgData.instagram || '',
        others: orgData.others || ''
      });
    } catch (err) {
      console.error('Error fetching organization details:', err);
      setError(err.response?.data?.message || 'Failed to fetch organization details');
      navigate('/organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim() !== "" ? value : "",
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  

  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    if (uploadedFiles.length > 0) {
      setFiles(prev => ({ ...prev, [name]: uploadedFiles[0] }));
      // Clear error when user uploads a file
      if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Only validate if the field is empty after trimming
    if (!formData.name?.trim()) errors.name = 'Organization name is required';
    if (!formData.category?.trim()) errors.category = 'Category is required';
    if (!formData.description?.trim()) errors.description = 'Description is required';
    if (!formData.objectives?.trim()) errors.objectives = 'Objectives are required';
    if (!formData.wallet_address?.trim()) errors.wallet_address = 'Wallet address is required';
    if (!formData.register_address?.trim()) errors.register_address = 'Registration address is required';
    
    if (!formData.gmail?.trim()) {
      errors.gmail = 'Gmail is required';
    } else if (!formData.gmail.trim().endsWith('@gmail.com')) {
      errors.gmail = 'Please enter a valid Gmail address';
    }
    
    if (!formData.phone_number?.trim()) errors.phone_number = 'Phone number is required';

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      window.scrollTo(0, 0);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const formDataToSend = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          formDataToSend.append(key, formData[key].trim());
        }
      });

      // Append files if they exist
      Object.keys(files).forEach(key => {
        if (files[key]) {
          formDataToSend.append(key, files[key]);
        }
      });

      const response = await axios.put(`/api/organizations/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      // If successful, navigate to the organization details page
      navigate(`/organizations/${id}`);
    } catch (err) {
      console.error('Error updating organization:', err);
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
        window.scrollTo(0, 0);
      } else {
        setError(err.response?.data?.message || 'Failed to update organization');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Edit Organization
            </h3>
            <button
              onClick={() => navigate(`/organizations/${id}`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="border-t border-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Organization Name */}
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {formErrors.name && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    id="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {formErrors.category && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.category}</p>
                  )}
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {formErrors.description && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.description}</p>
                  )}
                </div>

                {/* Objectives */}
                <div className="sm:col-span-2">
                  <label htmlFor="objectives" className="block text-sm font-medium text-gray-700">
                    Objectives
                  </label>
                  <textarea
                    name="objectives"
                    id="objectives"
                    rows={3}
                    value={formData.objectives}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {formErrors.objectives && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.objectives}</p>
                  )}
                </div>

                {/* Contact Information */}
                <div>
                  <label htmlFor="gmail" className="block text-sm font-medium text-gray-700">
                    Gmail
                  </label>
                  <input
                    type="email"
                    name="gmail"
                    id="gmail"
                    value={formData.gmail}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {formErrors.gmail && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.gmail}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {formErrors.phone_number && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.phone_number}</p>
                  )}
                </div>

                {/* Addresses */}
                <div>
                  <label htmlFor="wallet_address" className="block text-sm font-medium text-gray-700">
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    name="wallet_address"
                    id="wallet_address"
                    value={formData.wallet_address}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {formErrors.wallet_address && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.wallet_address}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="register_address" className="block text-sm font-medium text-gray-700">
                    Registration Address
                  </label>
                  <textarea
                    name="register_address"
                    id="register_address"
                    rows={3}
                    value={formData.register_address}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {formErrors.register_address && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.register_address}</p>
                  )}
                </div>

                {/* Social Media */}
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    name="website"
                    id="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">
                    Facebook (Optional)
                  </label>
                  <input
                    type="text"
                    name="facebook"
                    id="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
                    Instagram (Optional)
                  </label>
                  <input
                    type="text"
                    name="instagram"
                    id="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                {/* Additional Information */}
                <div className="sm:col-span-2">
                  <label htmlFor="others" className="block text-sm font-medium text-gray-700">
                    Additional Information (Optional)
                  </label>
                  <textarea
                    name="others"
                    id="others"
                    rows={3}
                    value={formData.others}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                {/* File Uploads */}
                <div>
                  <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                    Update Logo (Optional)
                  </label>
                  <input
                    type="file"
                    name="logo"
                    id="logo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>

                <div>
                  <label htmlFor="statutory_declaration" className="block text-sm font-medium text-gray-700">
                    Update Statutory Declaration (Optional)
                  </label>
                  <input
                    type="file"
                    name="statutory_declaration"
                    id="statutory_declaration"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>

                <div>
                  <label htmlFor="verified_document" className="block text-sm font-medium text-gray-700">
                    Update Verified Document (Optional)
                  </label>
                  <input
                    type="file"
                    name="verified_document"
                    id="verified_document"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-6 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {error}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    saving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 