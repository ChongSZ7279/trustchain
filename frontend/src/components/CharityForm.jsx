import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl, getFileType } from '../utils/helpers';
import BackButton from './BackToHistory';
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
  FaInfoCircle,
  FaFilePdf,
  FaFileWord,
  FaEye,
  FaDownload
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
    people_affected: '',
    picture: null,
  });
  const [files, setFiles] = useState({
    picture: null,
    verified_document: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previewUrls, setPreviewUrls] = useState({
    picture: null,
    verified_document: null
  });
  
  // Add image loading states
  const [imageLoading, setImageLoading] = useState({
    picture: true,
    document: true
  });

  const [documentPreview, setDocumentPreview] = useState({
    type: null,
    url: null,
    name: null
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
        people_affected: charityData.people_affected || '',
        picture: charityData.picture_path || null,
        status: charityData.status || 'pending',
        organization_id: charityData.organization_id || accountType?.id
      });

      // If there's an existing picture, set it in the preview
      if (charityData.picture_path) {
        setPreviewUrls(prev => ({
          ...prev,
          picture: formatImageUrl(charityData.picture_path)
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
    return currentUser?.id === charity?.organization_id || 
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
      console.log(`File selected for ${name}:`, file);
      
      setFiles(prev => {
        const newFiles = { ...prev, [name]: file };
        console.log('Updated files state:', newFiles);
        return newFiles;
      });
      
      // Create preview URL for images and documents
      const previewUrl = URL.createObjectURL(file);
      
      if (name === 'picture') {
        setPreviewUrls(prev => ({ ...prev, [name]: previewUrl }));
      } else if (name === 'verified_document') {
        const fileType = file.type;
        setDocumentPreview({
          type: fileType,
          url: previewUrl,
          name: file.name
        });
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
    
    if (formData.people_affected && (isNaN(formData.people_affected) || parseInt(formData.people_affected) < 0)) {
      errors.people_affected = 'People affected must be a positive number';
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
      
      // Create FormData instance to handle file uploads
      const formDataToSend = new FormData();
      
      // Add basic form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('objective', formData.objective);
      formDataToSend.append('fund_targeted', formData.fund_targeted);
      formDataToSend.append('people_affected', formData.people_affected || 0);

      // Add organization_id if available
      if (formData.organization_id || currentUser?.organization_id) {
        formDataToSend.append('organization_id', formData.organization_id || currentUser.organization_id);
      }

      // Add files if they exist
      if (files.picture) {
        formDataToSend.append('picture', files.picture);
        console.log('Picture file being sent:', files.picture);
      }
      if (files.verified_document) {
        formDataToSend.append('verified_document', files.verified_document);
        console.log('Document file being sent:', files.verified_document);
      }

      // Log the entire FormData contents
      console.log('FormData entries:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Log the data being sent
      console.log('Sending data:', Object.fromEntries(formDataToSend));
      
      let response;
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        // Add this to ensure proper file upload handling
        transformRequest: [function (data) {
          return data; // Don't transform the data
        }],
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted);
        }
      };

      if (id) {
        // If we have an ID, update existing charity
        response = await axios.post(`/charities/${id}?_method=PUT`, formDataToSend, config);
      } else {
        // If no ID, create new charity
        response = await axios.post('/charities', formDataToSend, config);
      }

      console.log('Server response:', response.data);
      navigate('/charities');
    } catch (err) {
      console.error('Error saving charity:', err);
      
      // Log the full error response
      if (err.response) {
        console.error('Server error response:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      }
      
      // Handle validation errors from the server
      if (err.response?.data?.errors) {
        const serverErrors = err.response.data.errors;
        console.log('Server validation errors:', serverErrors);
        setFormErrors(serverErrors);
        const firstError = Object.values(serverErrors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to save charity. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add the local formatImageUrl function
  const formatImageUrl = (path) => {
    if (!path) return null;
    
    // If it's already a full URL
    if (path.startsWith('http')) return path;
    
    // For storage paths like "organization_covers/filename.jpg"
    if (path.includes('organization_covers/') || 
        path.includes('organization_logos/') || 
        path.includes('charity_pictures/') ||
        path.includes('task_pictures/') ||
        path.includes('task_proofs/') ||
        path.includes('charity_documents/')) {
      return `/storage/${path}`;
    }
    
    // If path starts with a slash, it's already a relative path
    if (path.startsWith('/')) return path;
    
    // Otherwise, add a slash to make it a relative path from the root
    return `/${path}`;
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
      className="min-h-screen bg-gray-100"
    >
      <BackButton />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        

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
                    <select
                      name="category"
                      id="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      <option value="">Select Category</option>
                      <option value="Education">Education</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Environment">Environment</option>
                      <option value="Youth Development">Youth Development</option>
                      <option value="Disaster Relief">Disaster Relief</option>
                      <option value="Other">Other</option>
                    </select>
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

                  <div className="space-y-2">
                    <label htmlFor="people_affected" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaBullseye className="mr-2 text-gray-400" />
                      People Affected
                    </label>
                    <input
                      type="number"
                      name="people_affected"
                      id="people_affected"
                      min="0"
                      step="1"
                      value={formData.people_affected}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                    />
                    {isSubmitted && formErrors.people_affected && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.people_affected}</p>
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
                  Documents & Images
                </h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-4">
                    <label htmlFor="picture" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaImage className="mr-2 text-gray-400" />
                      Charity Picture
                    </label>
                    <div className="flex items-center space-x-4">
                      {previewUrls.picture && (
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-lg group">
                          <img
                            src={previewUrls.picture}
                            alt="Picture Preview"
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            onLoad={() => setImageLoading(prev => ({ ...prev, picture: false }))}
                          />
                          <div className={`absolute inset-0 bg-gray-200 ${imageLoading.picture ? 'animate-pulse' : 'hidden'}`} />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center">
                            <FaEye className="text-white opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-200" />
                          </div>
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          name="picture"
                          id="picture"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors duration-200"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Recommended size: 800x600 pixels. This will be the main image for your charity.
                        </p>
                      </div>
                    </div>
                    {isSubmitted && formErrors.picture && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.picture}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="verified_document" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaFileAlt className="mr-2 text-gray-400" />
                      Verified Document {!id && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="space-y-4">
                      {/* Document Upload */}
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

                      {/* Document Preview */}
                      {(documentPreview.url || formData.verified_document) && (
                        <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Document Preview</h3>
                          <div className="flex items-center space-x-3">
                            {documentPreview.type?.includes('pdf') || formData.verified_document?.includes('.pdf') ? (
                              <FaFilePdf className="text-red-500 text-xl" />
                            ) : (
                              <FaFileWord className="text-blue-500 text-xl" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 truncate">
                                {documentPreview.name || formData.verified_document}
                              </p>
                              <p className="text-xs text-gray-500">
                                {documentPreview.type || getFileType(formData.verified_document)}
                              </p>
                            </div>
                            {documentPreview.url && (
                              <a
                                href={documentPreview.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                              >
                                <FaEye className="mr-1" />
                                View
                              </a>
                            )}
                            {formData.verified_document && !documentPreview.url && (
                              <a
                                href={formatImageUrl(formData.verified_document)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                              >
                                <FaDownload className="mr-1" />
                                Download
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {isSubmitted && formErrors.verified_document && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.verified_document}</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Charity Picture Preview */}
              {formData.picture_path && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Current Picture</h3>
                  <div className="relative h-48 rounded-lg overflow-hidden shadow-md">
                    <img
                      src={formatImageUrl(formData.picture_path)}
                      alt="Charity picture"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Error loading charity picture:', e);
                        e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Document Preview */}
              {formData.verified_document && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Current Document</h3>
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(getFileType(formData.verified_document))}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">
                          {formData.verified_document.split('/').pop()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getFileType(formData.verified_document)}
                        </p>
                      </div>
                    </div>
                    <a 
                      href={formatImageUrl(formData.verified_document)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                    >
                      <FaEye className="mr-1" />
                      View
                    </a>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-end space-x-4 pt-6"
              >
                <button
                  type="button"
                  onClick={() => navigate('/charities')}
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