import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBuilding, FaGlobe, FaPhone, FaFacebook, FaInstagram, FaWallet, FaIdCard, FaFileAlt, FaArrowRight, FaTimes, FaEye } from 'react-icons/fa';
import axios from 'axios';

// Add this component for document preview modal
const PreviewModal = ({ file, onClose }) => {
  if (!file) return null;

  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf';
  const fileUrl = URL.createObjectURL(file);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">{file.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 flex justify-center items-center max-h-[70vh] overflow-auto">
          {isImage ? (
            <img src={fileUrl} alt="Preview" className="max-w-full h-auto" />
          ) : isPDF ? (
            <iframe
              src={fileUrl}
              title="PDF Preview"
              className="w-full h-[60vh]"
            />
          ) : (
            <div className="text-center py-8">
              <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Preview not available for this file type
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function OrganizationRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, loading, error } = useAuth();
  
  // Get email and password from location state if available
  const initialEmail = location.state?.email || '';
  const initialPassword = location.state?.password || '';
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    country: 'Malaysia',
    state: '',
    register_address: '',
    postcode: '',
    city: '',
    phone_number: '',
    website: '',
    facebook: '',
    instagram: '',
    wallet_address: '',
    representative_id: '',
    description: '',
    objectives: '',
    email: initialEmail,
    gmail: initialEmail,
    password: initialPassword,
    password_confirmation: initialPassword,
    logo: null,
    statutory_declaration: null,
    verified_document: null
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [previewUrls, setPreviewUrls] = useState({
    logo: null,
    statutory_declaration: null,
    verified_document: null
  });
  const [previewFile, setPreviewFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      
      // Create preview URL for the image/file
      if (files[0]) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrls(prev => ({ ...prev, [name]: reader.result }));
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Company name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.register_address) errors.register_address = 'Address is required';
    if (!formData.phone_number) errors.phone_number = 'Phone number is required';
    if (!formData.representative_id) errors.representative_id = 'Representative ID is required';
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.objectives) errors.objectives = 'Objectives are required';
    if (!formData.logo) errors.logo = 'Logo is required';
    if (!formData.statutory_declaration) errors.statutory_declaration = 'Statutory declaration document is required';
    if (!formData.verified_document) errors.verified_document = 'Verified document is required';
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
      console.log('Preparing organization registration with data:', formData);
      
      // Create a FormData object for file uploads
      const formDataObj = new FormData();
      
      // Add text fields
      formDataObj.append('name', formData.name);
      formDataObj.append('email', formData.gmail);
      formDataObj.append('password', formData.password);
      formDataObj.append('password_confirmation', formData.password_confirmation);
      formDataObj.append('category', formData.category);
      formDataObj.append('country', formData.country);
      formDataObj.append('state', formData.state);
      formDataObj.append('register_address', formData.register_address);
      formDataObj.append('postcode', formData.postcode);
      formDataObj.append('city', formData.city);
      formDataObj.append('phone_number', formData.phone_number);
      
      if (formData.website) {
        formDataObj.append('website', formData.website);
      }
      
      if (formData.facebook) {
        formDataObj.append('facebook', formData.facebook);
      }
      
      if (formData.instagram) {
        formDataObj.append('instagram', formData.instagram);
      }
      
      if (formData.wallet_address) {
        formDataObj.append('wallet_address', formData.wallet_address);
      }
      
      formDataObj.append('representative_id', formData.representative_id);
      formDataObj.append('description', formData.description);
      formDataObj.append('objectives', formData.objectives);
      formDataObj.append('type', 'organization');
      
      // Add files - these are already File objects from the file input
      if (formData.logo) {
        console.log('Adding logo:', formData.logo);
        formDataObj.append('logo', formData.logo, formData.logo.name);
      }
      
      if (formData.statutory_declaration) {
        console.log('Adding statutory declaration:', formData.statutory_declaration);
        formDataObj.append('statutory_declaration', formData.statutory_declaration, formData.statutory_declaration.name);
      }
      
      if (formData.verified_document) {
        console.log('Adding verified document:', formData.verified_document);
        formDataObj.append('verified_document', formData.verified_document, formData.verified_document.name);
      }
      
      console.log('Submitting organization registration with FormData');
      
      // Use axios directly instead of the register function
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/register/organization`,
        formDataObj,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          }
        }
      );
      
      console.log('Organization registration successful:', response.data);
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Navigate to organization dashboard instead of login
      navigate('/organization/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response) {
        console.log('Error response status:', err.response.status);
        console.log('Error response data:', err.response.data);
        
        if (err.response.status === 422 && err.response.data.errors) {
          console.log('Validation errors:', err.response.data.errors);
          
          // Set specific field errors
          const backendErrors = err.response.data.errors;
          const formattedErrors = {};
          
          // Format backend errors for the form
          Object.keys(backendErrors).forEach(field => {
            formattedErrors[field] = Array.isArray(backendErrors[field]) 
              ? backendErrors[field][0] 
              : backendErrors[field];
          });
          
          setFormErrors(formattedErrors);
        } else if (err.response.data.message) {
          setFormErrors({ general: err.response.data.message });
        } else {
          setFormErrors({ general: 'Registration failed. Please try again.' });
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.log('No response received:', err.request);
        setFormErrors({ general: 'No response received from server. Please check your connection.' });
      } else {
        // Something happened in setting up the request
        console.log('Error setting up request:', err.message);
        setFormErrors({ general: 'Error setting up request: ' + err.message });
      }
    }
  };

  // Add preview handler
  const handlePreview = (file) => {
    if (file) {
      setPreviewFile(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <FaBuilding className="mr-2 text-indigo-600" /> Organization Registration
      </h2>
      
      {formErrors.general && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {formErrors.general}
              </h3>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-700 border-b pb-2">Organization Details</h3>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Company Name <span className="text-red-600">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category <span className="text-red-600">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a category</option>
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Environment">Environment</option>
                  <option value="Youth Development">Youth Development</option>
                  <option value="Disaster Relief">Disaster Relief</option>
                  <option value="Other">Other</option>
                </select>
                {formErrors.category && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="register_address" className="block text-sm font-medium text-gray-700">
                Registered Address <span className="text-red-600">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="register_address"
                  name="register_address"
                  type="text"
                  required
                  value={formData.register_address}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {formErrors.register_address && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.register_address}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="postcode" className="block text-sm font-medium text-gray-700">
                  Postcode
                </label>
                <div className="mt-1">
                  <input
                    id="postcode"
                    name="postcode"
                    type="text"
                    value={formData.postcode}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <div className="mt-1">
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <div className="mt-1">
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <div className="mt-1">
                <input
                  id="country"
                  name="country"
                  type="text"
                  value={formData.country}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          
          
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-700 border-b pb-2">Contact Information</h3>
            
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaPhone className="mr-1" /> Phone Number <span className="text-red-600">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="phone_number"
                  name="phone_number"
                  type="text"
                  required
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {formErrors.phone_number && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.phone_number}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaGlobe className="mr-1" /> Website
              </label>
              <div className="mt-1">
                <input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaFacebook className="mr-1" /> Facebook
              </label>
              <div className="mt-1">
                <input
                  id="facebook"
                  name="facebook"
                  type="text"
                  value={formData.facebook}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaInstagram className="mr-1" /> Instagram
              </label>
              <div className="mt-1">
                <input
                  id="instagram"
                  name="instagram"
                  type="text"
                  value={formData.instagram}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="wallet_address" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaWallet className="mr-1" /> Wallet Address
              </label>
              <div className="mt-1">
                <input
                  id="wallet_address"
                  name="wallet_address"
                  type="text"
                  required
                  value={formData.wallet_address}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {formErrors.wallet_address && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.wallet_address}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="representative_id" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaIdCard className="mr-1" /> Representative ID <span className="text-red-600">*</span>
              </label>
              {formData.representative_id && (
                <div className="mb-2">
                  <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-md flex items-start">
                    <svg className="h-5 w-5 text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      Please register as a user first and use your IC number as the Representative ID. 
                      <a href="/register" className="text-blue-600 hover:text-blue-800 font-medium ml-1">
                        Register as user →
                      </a>
                    </span>
                  </div>
                </div>
              )}
              <div className="mt-1">
                <input
                  id="representative_id"
                  name="representative_id"
                  type="text"
                  required
                  value={formData.representative_id}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {formErrors.representative_id && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.representative_id}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Description - Row 2 */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 border-b pb-2 mb-4">Description</h3>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-600">*</span>
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe your organization's mission and activities..."
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Objectives - Row 3 */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 border-b pb-2 mb-4">Objectives</h3>
          <div>
            <label htmlFor="objectives" className="block text-sm font-medium text-gray-700">
              Objectives <span className="text-red-600">*</span>
            </label>
            <div className="mt-1">
              <textarea
                id="objectives"
                name="objectives"
                rows={4}
                required
                value={formData.objectives}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="List your organization's key objectives..."
              />
              {formErrors.objectives && (
                <p className="mt-1 text-sm text-red-600">{formErrors.objectives}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Documents - Row 4 */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 border-b pb-2 mb-4">Required Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                Organization Logo <span className="text-red-600">*</span>
              </label>
              <div className="mt-1 flex flex-col items-center">
                <label className="w-full cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                  <div className="flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    {previewUrls.logo ? (
                      <>
                        <img src={previewUrls.logo} alt="Logo preview" className="h-32 w-32 object-contain mb-2" />
                        <button
                          type="button"
                          onClick={() => handlePreview(formData.logo)}
                          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                        >
                          <FaEye className="mr-1" /> View Full Size
                        </button>
                      </>
                    ) : (
                      <>
                        <FaBuilding className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-1 text-sm text-gray-600">
                          Click to upload logo
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    id="logo"
                    name="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    required
                    className="sr-only"
                  />
                </label>
                {formErrors.logo && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.logo}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="statutory_declaration" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaFileAlt className="mr-1" /> Statutory Declaration <span className="text-red-600">*</span>
              </label>
              <div className="mt-1">
                <label className="w-full cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                  <div className="flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-600">
                      {formData.statutory_declaration ? formData.statutory_declaration.name : 'Click to upload document'}
                    </p>
                    {formData.statutory_declaration && (
                      <button
                        type="button"
                        onClick={() => handlePreview(formData.statutory_declaration)}
                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                      >
                        <FaEye className="mr-1" /> Preview Document
                      </button>
                    )}
                  </div>
                  <input
                    id="statutory_declaration"
                    name="statutory_declaration"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleChange}
                    required
                    className="sr-only"
                  />
                </label>
                {formErrors.statutory_declaration && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.statutory_declaration}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="verified_document" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaFileAlt className="mr-1" /> Verified Document <span className="text-red-600">*</span>
              </label>
              <div className="mt-1">
                <label className="w-full cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                  <div className="flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-600">
                      {formData.verified_document ? formData.verified_document.name : 'Click to upload document'}
                    </p>
                    {formData.verified_document && (
                      <button
                        type="button"
                        onClick={() => handlePreview(formData.verified_document)}
                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                      >
                        <FaEye className="mr-1" /> Preview Document
                      </button>
                    )}
                  </div>
                  <input
                    id="verified_document"
                    name="verified_document"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleChange}
                    required
                    className="sr-only"
                  />
                </label>
                {formErrors.verified_document && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.verified_document}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Preview Modal */}
        {previewFile && (
          <PreviewModal
            file={previewFile}
            onClose={() => setPreviewFile(null)}
          />
        )}
        
        <div className="mt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'} 
            {!loading && <FaArrowRight className="ml-2" />}
          </button>
        </div>
      </form>
    </div>
  );
} 