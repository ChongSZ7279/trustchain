import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { formatImageUrl } from '../utils/helpers';
import BackButton from './BackToHistory';
import { motion, AnimatePresence } from 'framer-motion';
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
  FaExclamationTriangle,
  FaInfoCircle,
  FaAddressCard,
  FaFilePdf,
  FaFileWord,
  FaEye,
  FaDownload
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

  // Add new loading states
  const [imageLoading, setImageLoading] = useState({
    logo: true,
    cover: true,
    statutory: true,
    verified: true
  });

  const [documentPreview, setDocumentPreview] = useState({
    statutory: { type: null, url: null, name: null },
    verified: { type: null, url: null, name: null }
  });

  // Add getFileType helper function
  const getFileType = (filename) => {
    if (!filename) return '';
    if (filename.endsWith('.pdf')) return 'PDF Document';
    if (filename.endsWith('.doc') || filename.endsWith('.docx')) return 'Word Document';
    return 'Document';
  };

  // Add getFileIcon helper function
  const getFileIcon = (type) => {
    if (type.includes('PDF')) {
      return <FaFilePdf className="text-red-500 text-xl" />;
    }
    return <FaFileWord className="text-blue-500 text-xl" />;
  };

  // Add getImageUrl helper function
  const getImageUrl = (path) => {
    if (!path) return null;
    
    // Check if the path already includes the base URL
    if (path.startsWith('http')) {
      return path;
    }
    
    // Otherwise, construct the full URL - using import.meta.env for Vite
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/storage/${path}`;
  };

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

    // Update preview URLs with proper URL formatting
    setPreviewUrls({
      logo: organization.logo ? getImageUrl(organization.logo) : null,
      cover_image_path: organization.cover_image_path ? getImageUrl(organization.cover_image_path) : null,
      statutory_declaration: organization.statutory_declaration ? getImageUrl(organization.statutory_declaration) : null,
      verified_document: organization.verified_document ? getImageUrl(organization.verified_document) : null
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
      console.log(`File selected for ${name}:`, files[0].name);
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
      
      // Create preview URL for the new file
      const previewUrl = URL.createObjectURL(files[0]);
      
      if (name === 'logo' || name === 'cover_image_path') {
        setPreviewUrls(prev => ({
          ...prev,
          [name]: previewUrl
        }));
      } else if (name === 'statutory_declaration' || name === 'verified_document') {
        const fileType = files[0].type;
        const docType = name === 'statutory_declaration' ? 'statutory' : 'verified';
        setDocumentPreview(prev => ({
          ...prev,
          [docType]: {
            type: fileType,
            url: previewUrl,
            name: files[0].name
          }
        }));
      }

      // Reset loading state for the changed image
      if (name === 'logo' || name === 'cover_image_path') {
        setImageLoading(prev => ({
          ...prev,
          [name === 'logo' ? 'logo' : 'cover']: false
        }));
      }
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
      // Create FormData object for file uploads
      const formDataToSend = new FormData();
      
      // Add basic text fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('objectives', formData.objectives);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('phone_number', formData.phone_number);
      formDataToSend.append('register_address', formData.register_address);
      
      // Add optional text fields
      if (formData.website) formDataToSend.append('website', formData.website);
      if (formData.facebook) formDataToSend.append('facebook', formData.facebook);
      if (formData.instagram) formDataToSend.append('instagram', formData.instagram);
      
      // Add file fields only if they are Files
      if (formData.logo instanceof File) {
        console.log('Adding logo file:', formData.logo.name);
        formDataToSend.append('logo', formData.logo);
      }
      
      if (formData.cover_image_path instanceof File) {
        console.log('Adding cover image file:', formData.cover_image_path.name);
        formDataToSend.append('cover_image_path', formData.cover_image_path);
      }
      
      if (formData.statutory_declaration instanceof File) {
        formDataToSend.append('statutory_declaration', formData.statutory_declaration);
      }
      
      if (formData.verified_document instanceof File) {
        formDataToSend.append('verified_document', formData.verified_document);
      }
      
      // Add method spoofing for Laravel
      formDataToSend.append('_method', 'PUT');
      
      // Log the FormData contents for debugging
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }
      
      // Use POST method with _method=PUT for Laravel
      const response = await axios.post(`/organizations/${organization.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && typeof setOrganization === 'function') {
        setOrganization(response.data);
      }

      // Use history.back() instead of navigating to a specific route
      window.history.back();
    } catch (err) {
      console.error('Update error:', err);
      if (err.response?.data?.errors) {
        console.log('Validation errors:', err.response.data.errors);
        // Format validation errors for display
        const errorMessages = Object.entries(err.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        setError(`Validation failed:\n${errorMessages}`);
      } else {
        setError(err.response?.data?.message || 'Failed to update organization. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading organization details...</p>
            <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      <BackButton />  
      
      <div className="max-w-7xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Breadcrumb */}

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white shadow-lg rounded-2xl"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FaBuilding className="mr-3 text-indigo-600" />
                Edit Organization
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
                    <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Education">Education</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Environment">Environment</option>
                      <option value="Youth Development">Youth Development</option>
                      <option value="Disaster Relief">Disaster Relief</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                      required
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Objectives</label>
                    <textarea
                      name="objectives"
                      value={formData.objectives}
                      onChange={handleInputChange}
                      rows="4"
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                      required
                    />
                  </div>
                </div>
              </motion.div>

              {/* Contact Information Section */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-50 p-8 rounded-xl shadow-sm"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                  <FaAddressCard className="mr-2 text-indigo-600" />
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaPhone className="mr-2 text-gray-400" />
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-gray-400" />
                      Registration Address
                    </label>
                    <input
                      type="text"
                      name="register_address"
                      value={formData.register_address}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaGlobe className="mr-2 text-gray-400" />
                      Website (Optional)
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                      placeholder="https://"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaFacebook className="mr-2 text-gray-400" />
                      Facebook (Optional)
                    </label>
                    <input
                      type="url"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                      placeholder="https://facebook.com/"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaInstagram className="mr-2 text-gray-400" />
                      Instagram (Optional)
                    </label>
                    <input
                      type="url"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                      placeholder="https://instagram.com/"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Documents Section */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-50 p-8 rounded-xl shadow-sm"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                  <FaFileAlt className="mr-2 text-indigo-600" />
                  Documents & Images
                </h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {/* Logo Upload */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaImage className="mr-2 text-gray-400" />
                      Organization Logo
                    </label>
                    <div className="flex items-center space-x-4">
                      {previewUrls.logo && (
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-lg">
                          <img
                            src={previewUrls.logo}
                            alt="Logo Preview"
                            className="w-full h-full object-cover"
                            onLoad={() => setImageLoading(prev => ({ ...prev, logo: false }))}
                            onError={(e) => {
                              console.error('Error loading logo preview:', e);
                              e.target.src = 'https://via.placeholder.com/128';
                            }}
                          />
                          <div className={`absolute inset-0 bg-gray-200 ${imageLoading.logo ? 'animate-pulse' : 'hidden'}`} />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          name="logo"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors duration-200"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Recommended size: 256x256 pixels. This will be your organization's main identifier.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cover Image Upload */}
                  <div className="md:col-span-2 space-y-4">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaImage className="mr-2 text-gray-400" />
                      Cover Image
                    </label>
                    <div className="space-y-4">
                      {previewUrls.cover_image_path && (
                        <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-lg">
                          <img
                            src={previewUrls.cover_image_path}
                            alt="Cover Image Preview"
                            className="w-full h-full object-cover"
                            onLoad={() => setImageLoading(prev => ({ ...prev, cover: false }))}
                            onError={(e) => {
                              console.error('Error loading cover image preview:', e);
                              e.target.src = 'https://via.placeholder.com/1200x300';
                            }}
                          />
                          <div className={`absolute inset-0 bg-gray-200 ${imageLoading.cover ? 'animate-pulse' : 'hidden'}`} />
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          name="cover_image_path"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors duration-200"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Recommended size: 1200x300 pixels. This image will appear at the top of your organization profile.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Document Uploads */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaFileAlt className="mr-2 text-gray-400" />
                      Statutory Declaration
                    </label>
                    <div className="space-y-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          name="statutory_declaration"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors duration-200"
                        />
                      </div>

                      {/* Document Preview */}
                      {(documentPreview.statutory.url || previewUrls.statutory_declaration) && (
                        <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Document Preview</h3>
                          <div className="flex items-center space-x-3">
                            {documentPreview.statutory.type?.includes('pdf') || previewUrls.statutory_declaration?.includes('.pdf') ? (
                              <FaFilePdf className="text-red-500 text-xl" />
                            ) : (
                              <FaFileWord className="text-blue-500 text-xl" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 truncate">
                                {documentPreview.statutory.name || previewUrls.statutory_declaration?.split('/').pop()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {documentPreview.statutory.type || getFileType(previewUrls.statutory_declaration)}
                              </p>
                            </div>
                            {documentPreview.statutory.url && (
                              <a
                                href={documentPreview.statutory.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                              >
                                <FaEye className="mr-1" />
                                View
                              </a>
                            )}
                            {previewUrls.statutory_declaration && !documentPreview.statutory.url && (
                              <a
                                href={previewUrls.statutory_declaration}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                              >
                                <FaEye className="mr-1" />
                                View
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaFileAlt className="mr-2 text-gray-400" />
                      Verified Document
                    </label>
                    <div className="space-y-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          name="verified_document"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors duration-200"
                        />
                      </div>

                      {/* Document Preview */}
                      {(documentPreview.verified.url || previewUrls.verified_document) && (
                        <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Document Preview</h3>
                          <div className="flex items-center space-x-3">
                            {documentPreview.verified.type?.includes('pdf') || previewUrls.verified_document?.includes('.pdf') ? (
                              <FaFilePdf className="text-red-500 text-xl" />
                            ) : (
                              <FaFileWord className="text-blue-500 text-xl" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 truncate">
                                {documentPreview.verified.name || previewUrls.verified_document?.split('/').pop()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {documentPreview.verified.type || getFileType(previewUrls.verified_document)}
                              </p>
                            </div>
                            {documentPreview.verified.url && (
                              <a
                                href={documentPreview.verified.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                              >
                                <FaEye className="mr-1" />
                                View
                              </a>
                            )}
                            {previewUrls.verified_document && !documentPreview.verified.url && (
                              <a
                                href={previewUrls.verified_document}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                              >
                                <FaEye className="mr-1" />
                                View
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Form Actions */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-end space-x-4 pt-6"
              >
                <button
                  type="button"
                  onClick={() => window.history.back()}
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
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Update Organization
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