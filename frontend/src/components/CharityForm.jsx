import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function CharityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    fund_targeted: '',
  });
  const [files, setFiles] = useState({
    picture_path: null,
    verified_document: null,
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (id) {
      fetchCharity();
    }
  }, [id]);

  const fetchCharity = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/charities/${id}`);
      const charity = response.data;

      // Check if user has permission to edit
      if (!canManageCharity(charity)) {
        navigate('/charities');
        return;
      }

      setFormData({
        category: charity.category,
        description: charity.description,
        fund_targeted: charity.fund_targeted,
      });
    } catch (err) {
      console.error('Error fetching charity:', err);
      setError(err.response?.data?.message || 'Failed to fetch charity');
    } finally {
      setLoading(false);
    }
  };

  const canManageCharity = (charity) => {
    return organization?.id === charity?.organization_id || 
           charity?.organization?.representative_id === user?.ic_number;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
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
    
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.fund_targeted) {
      errors.fund_targeted = 'Target fund amount is required';
    } else if (isNaN(formData.fund_targeted) || parseFloat(formData.fund_targeted) <= 0) {
      errors.fund_targeted = 'Target fund must be a positive number';
    }

    if (!id && !files.verified_document) {
      errors.verified_document = 'Verified document is required';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Append files if they exist
      Object.keys(files).forEach(key => {
        if (files[key]) {
          formDataToSend.append(key, files[key]);
        }
      });

      if (id) {
        await axios.put(`/api/charities/${id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('/api/charities', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      navigate('/charities');
    } catch (err) {
      console.error('Error saving charity:', err);
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || 'Failed to save charity');
      }
    } finally {
      setLoading(false);
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
              {id ? 'Edit Charity' : 'Create Charity'}
            </h3>
            <button
              onClick={() => navigate('/charities')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="border-t border-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-6">
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
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {formErrors.description && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.description}</p>
                  )}
                </div>

                {/* Fund Target */}
                <div>
                  <label htmlFor="fund_targeted" className="block text-sm font-medium text-gray-700">
                    Target Fund Amount ($)
                  </label>
                  <input
                    type="number"
                    name="fund_targeted"
                    id="fund_targeted"
                    min="0"
                    step="0.01"
                    value={formData.fund_targeted}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {formErrors.fund_targeted && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.fund_targeted}</p>
                  )}
                </div>

                {/* Picture */}
                <div>
                  <label htmlFor="picture_path" className="block text-sm font-medium text-gray-700">
                    Picture (Optional)
                  </label>
                  <input
                    type="file"
                    name="picture_path"
                    id="picture_path"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {formErrors.picture_path && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.picture_path}</p>
                  )}
                </div>

                {/* Verified Document */}
                <div>
                  <label htmlFor="verified_document" className="block text-sm font-medium text-gray-700">
                    Verified Document {!id && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="file"
                    name="verified_document"
                    id="verified_document"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {formErrors.verified_document && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.verified_document}</p>
                  )}
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          {error}
                        </h3>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Saving...' : id ? 'Update Charity' : 'Create Charity'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 