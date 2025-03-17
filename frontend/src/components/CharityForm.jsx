import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { currentUser, accountType } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
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
  
  // Add image loading states
  const [imageLoading, setImageLoading] = useState({
    picture: true,
    document: true
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
        organization_id: charityData.organization_id || accountType?.id
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
    return accountType?.id === charity?.organization_id || 
           charity?.organization?.representative_id === currentUser?.ic_number;
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
      
      // Append files
      if (files.picture_path) {
        formDataToSend.append('picture', files.picture_path);
      }
      
      if (files.verified_document) {
        formDataToSend.append('verified_document', files.verified_document);
      }
      
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

  if (loading && !id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-6"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Breadcrumb */}
        <nav className="flex items-center text-gray-500 mb-6">
          <Link 
            to="/organization/dashboard" 
            className="group inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Dashboard
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{id ? 'Edit Charity' : 'Create Charity'}</span>
        </nav>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white shadow-lg rounded-2xl"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FaBuilding className="mr-3 text-indigo-600" />
                {id ? 'Edit Charity' : 'Create Charity'}
              </h1>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg"
              >
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-red-400 mr-2" />
                  <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-50 p-8 rounded-xl shadow-sm"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                  <FaInfoCircle className="mr-2 text-indigo-600" />
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaBuilding className="mr-2 text-gray-400" />
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                    />
                    {isSubmitted && formErrors.name && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaTag className="mr-2 text-gray-400" />
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      id="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                    />
                    {isSubmitted && formErrors.category && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.category}</p>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaFileAlt className="mr-2 text-gray-400" />
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                    />
                    {isSubmitted && formErrors.description && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.description}</p>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label htmlFor="objective" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaBullseye className="mr-2 text-gray-400" />
                      Objective
                    </label>
                    <textarea
                      name="objective"
                      id="objective"
                      rows={4}
                      value={formData.objective}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                    />
                    {isSubmitted && formErrors.objective && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.objective}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="fund_targeted" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaMoneyBillWave className="mr-2 text-gray-400" />
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
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                    />
                    {isSubmitted && formErrors.fund_targeted && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.fund_targeted}</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Documents Section */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-50 p-8 rounded-xl shadow-sm"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                  <FaFileAlt className="mr-2 text-indigo-600" />
                  Documents
                </h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-4">
                    <label htmlFor="picture_path" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaImage className="mr-2 text-gray-400" />
                      Charity Picture
                    </label>
                    <div className="flex items-center space-x-4">
                      {previewUrls.picture_path && (
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-lg">
                          <img
                            src={previewUrls.picture_path}
                            alt="Picture Preview"
                            className="w-full h-full object-cover"
                            onLoad={() => setImageLoading(prev => ({ ...prev, picture: false }))}
                          />
                          <div className={`absolute inset-0 bg-gray-200 ${imageLoading.picture ? 'animate-pulse' : 'hidden'}`} />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          name="picture_path"
                          id="picture_path"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors duration-200"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Recommended size: 800x600 pixels. This will be the main image for your charity.
                        </p>
                      </div>
                    </div>
                    {isSubmitted && formErrors.picture_path && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.picture_path}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="verified_document" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaFileAlt className="mr-2 text-gray-400" />
                      Verified Document {!id && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="flex items-center space-x-4">
                      {previewUrls.verified_document && (
                        <a
                          href={previewUrls.verified_document}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200"
                        >
                          <FaFileAlt className="mr-2" />
                          View Current Document
                        </a>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          name="verified_document"
                          id="verified_document"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors duration-200"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Upload a document that verifies the legitimacy of this charity.
                        </p>
                      </div>
                    </div>
                    {isSubmitted && formErrors.verified_document && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.verified_document}</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Form Actions */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-end space-x-4 pt-6"
              >
                <button
                  type="button"
                  onClick={() => navigate('/organization/dashboard')}
                  className="inline-flex items-center px-6 py-3 border-2 border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                      {id ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      {id ? 'Update Charity' : 'Create Charity'}
                    </>
                  )}
                </button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 