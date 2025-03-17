import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  FaBuilding, 
  FaFileAlt, 
  FaImage, 
  FaTag,
  FaMoneyBillWave,
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaExclamationTriangle,
  FaBullseye,
  FaInfoCircle
} from 'react-icons/fa';

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
    picture_path: null,
  });
  const [files, setFiles] = useState({
    picture_path: null,
    verified_document: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previewUrls, setPreviewUrls] = useState({
    picture_path: null,
    verified_document: null
  });

  useEffect(() => {
    if (id) {
      fetchCharity();
    }
  }, [id]);

  const fetchCharity = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/charities/${id}`);
      const charityData = response.data;

      console.log('Loaded charity data:', charityData);

      // Check if user has permission to edit
      if (!canManageCharity(charityData)) {
        navigate('/charities');
        return;
      }

      // Set all form data including the picture_path
      setFormData({
        name: charityData.name || '',
        category: charityData.category || '',
        description: charityData.description || '',
        objective: charityData.objective || '',
        fund_targeted: charityData.fund_targeted || '',
        picture_path: charityData.picture_path || null,
        status: charityData.status || 'pending',
        organization_id: charityData.organization_id || organization?.id
      });

      // If there's an existing picture, set it in the preview
      if (charityData.picture_path) {
        setPreviewUrls(prev => ({
          ...prev,
          picture_path: formatImageUrl(charityData.picture_path)
        }));
      }

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
      const file = uploadedFiles[0];
      setFiles(prev => ({ ...prev, [name]: file }));
      
      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        setPreviewUrls(prev => ({ ...prev, [name]: previewUrl }));
      }
      
      // Clear error if form was previously submitted
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
      
      // Append all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'logo' || key === 'cover_image') {
          if (formData[key] && formData[key] instanceof File) {
            formDataToSend.append(key, formData[key]);
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      let response;
      
      if (id) {
        // Update existing charity
        response = await axios.post(`/charities/${id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Create new charity
        response = await axios.post('/charities', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      console.log('Server response:', response.data);
      navigate('/charities');
    } catch (err) {
      console.error('Error saving charity:', err);
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
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
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-gray-500 mb-6">
          <Link to="/organization/dashboard" className="hover:text-gray-700 flex items-center">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{id ? 'Edit Charity' : 'Create Charity'}</span>
        </nav>

        <div className="bg-white shadow-sm rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FaBuilding className="mr-3" />
                {id ? 'Edit Charity' : 'Create Charity'}
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
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaInfoCircle className="mr-2" />
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaBuilding className="mr-2" />
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {isSubmitted && formErrors.name && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaTag className="mr-2" />
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      id="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {isSubmitted && formErrors.category && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.category}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaFileAlt className="mr-2" />
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {isSubmitted && formErrors.description && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.description}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="objective" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaBullseye className="mr-2" />
                      Objective
                    </label>
                    <textarea
                      name="objective"
                      id="objective"
                      rows={4}
                      value={formData.objective}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {isSubmitted && formErrors.objective && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.objective}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="fund_targeted" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaMoneyBillWave className="mr-2" />
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {isSubmitted && formErrors.fund_targeted && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.fund_targeted}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaFileAlt className="mr-2" />
                  Documents
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="picture_path" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaImage className="mr-2" />
                      Charity Picture
                    </label>
                    <div className="mt-2 flex items-center space-x-4">
                      {(previewUrls.picture_path || formData.picture_path) && (
                        <img
                          src={previewUrls.picture_path || formatImageUrl(formData.picture_path)}
                          alt="Picture Preview"
                          className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                        />
                      )}
                      <input
                        type="file"
                        name="picture_path"
                        id="picture_path"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                    {isSubmitted && formErrors.picture_path && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.picture_path}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="verified_document" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaFileAlt className="mr-2" />
                      Verified Document {!id && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="mt-2 flex items-center space-x-4">
                      {previewUrls.verified_document && (
                        <a
                          href={previewUrls.verified_document}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-500 flex items-center"
                        >
                          <FaFileAlt className="mr-2" />
                          View Current Document
                        </a>
                      )}
                      <input
                        type="file"
                        name="verified_document"
                        id="verified_document"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                    {isSubmitted && formErrors.verified_document && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.verified_document}</p>
                    )}
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
                      {id ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      {id ? 'Update Charity' : 'Create Charity'}
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