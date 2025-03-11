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
    name: '',
    category: '',
    description: '',
    objective: '',
    fund_targeted: '',
  });
  const [files, setFiles] = useState({
    picture_path: null,
    verified_document: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

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

      console.log('Loaded charity data:', charity);

      // Check if user has permission to edit
      if (!canManageCharity(charity)) {
        navigate('/charities');
        return;
      }

      // Ensure all values are properly set, using empty strings as fallbacks
      setFormData({
        name: charity.name || '',
        category: charity.category || '',
        description: charity.description || '',
        objective: charity.objective || '',
        fund_targeted: charity.fund_targeted || '',
      });

      // Clear any existing form errors when populating the form
      setFormErrors({});
      setIsSubmitted(false);

      console.log('Form data after loading:', formData);
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
    // Only clear error if the form has been submitted once
    if (isSubmitted && formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    if (uploadedFiles.length > 0) {
      setFiles(prev => ({ ...prev, [name]: uploadedFiles[0] }));
      // Only clear error if the form has been submitted once
      if (isSubmitted && formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.objective) errors.objective = 'Objective is required';
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
    setIsSubmitted(true);
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      
      // Log the form data before sending
      console.log('Form data being sent:', formData);
      
      // Append form data, ensuring values are converted to strings
      formDataToSend.append('name', formData.name.toString());
      formDataToSend.append('category', formData.category.toString());
      formDataToSend.append('description', formData.description.toString());
      formDataToSend.append('objective', formData.objective.toString());
      formDataToSend.append('fund_targeted', formData.fund_targeted.toString());

      // Add organization_id to the form data
      if (organization?.id) {
        formDataToSend.append('organization_id', organization.id.toString());
      }

      // Append files if they exist
      if (files.picture_path) {
        formDataToSend.append('picture_path', files.picture_path);
      }
      if (files.verified_document) {
        formDataToSend.append('verified_document', files.verified_document);
      }

      // Log the FormData entries for debugging
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      let response;
      if (id) {
        // For PUT requests, we need to append the _method field
        formDataToSend.append('_method', 'PUT');
        response = await axios.post(`/api/charities/${id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          }
        });
      } else {
        response = await axios.post('/api/charities', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          }
        });
      }

      console.log('Server response:', response.data);
      navigate('/charities');
    } catch (err) {
      console.error('Error saving charity:', err);
      if (err.response?.data?.errors) {
        // Show all validation errors
        const serverErrors = err.response.data.errors;
        console.log('Validation errors:', serverErrors);
        setFormErrors(serverErrors);
      } else if (err.response?.data?.message) {
        // Show the error message from the server
        setError(err.response.data.message);
      } else {
        setError('Failed to save charity. Please try again.');
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
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {isSubmitted && formErrors.name && (
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
                  {isSubmitted && formErrors.category && (
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
                  {isSubmitted && formErrors.description && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.description}</p>
                  )}
                </div>

                {/* Objective */}
                <div>
                  <label htmlFor="objective" className="block text-sm font-medium text-gray-700">
                    Objective
                  </label>
                  <textarea
                    name="objective"
                    id="objective"
                    rows={4}
                    value={formData.objective}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {isSubmitted && formErrors.objective && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.objective}</p>
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
                  {isSubmitted && formErrors.fund_targeted && (
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
                  {isSubmitted && formErrors.picture_path && (
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
                  {isSubmitted && formErrors.verified_document && (
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