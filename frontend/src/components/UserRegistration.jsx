import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaIdCard, FaPhone, FaWallet, FaCamera, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';

export default function UserRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { registerUser, loading, error } = useAuth();
  
  // Get email and password from location state if available
  const initialEmail = location.state?.email || '';
  const initialPassword = location.state?.password || '';
  
  const [formData, setFormData] = useState({
    name: '',
    ic_number: '',
    phone_number: '',
    wallet_address: '',
    email: initialEmail,
    gmail: initialEmail,
    password: initialPassword,
    password_confirmation: initialPassword,
    profile_picture: null,
    front_ic_picture: null,
    back_ic_picture: null
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [previewUrls, setPreviewUrls] = useState({
    profile_picture: null,
    front_ic_picture: null,
    back_ic_picture: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      
      // Create preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => ({ ...prev, [name]: reader.result }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Full name is required';
    if (!formData.ic_number) errors.ic_number = 'IC number is required';
    if (!formData.phone_number) errors.phone_number = 'Phone number is required';
    if (!formData.front_ic_picture) errors.front_ic_picture = 'Front IC picture is required';
    if (!formData.back_ic_picture) errors.back_ic_picture = 'Back IC picture is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Test file upload directly
    if (formData.front_ic_picture) {
      console.log('Testing direct file upload with front IC picture');
      const testFormData = new FormData();
      testFormData.append('test_file', formData.front_ic_picture);
      
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/test-upload`, 
          testFormData, 
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Accept': 'application/json'
            }
          }
        );
        console.log('Test upload response:', response.data);
      } catch (err) {
        console.error('Test upload error:', err);
      }
    }
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      console.log('Preparing user registration with data:', formData);
      
      // Create a FormData object for file uploads
      const formDataObj = new FormData();
      
      // Add text fields
      formDataObj.append('name', formData.name);
      formDataObj.append('gmail', formData.gmail || formData.email);
      formDataObj.append('email', formData.gmail || formData.email);
      formDataObj.append('password', formData.password);
      formDataObj.append('password_confirmation', formData.password_confirmation);
      formDataObj.append('ic_number', formData.ic_number);
      formDataObj.append('phone_number', formData.phone_number);
      
      if (formData.wallet_address) {
        formDataObj.append('wallet_address', formData.wallet_address);
      }
      
      formDataObj.append('type', 'user');
      
      // Add files - these are already File objects from the file input
      if (formData.profile_picture) {
        console.log('Adding profile picture:', formData.profile_picture);
        formDataObj.append('profile_picture', formData.profile_picture, formData.profile_picture.name);
      }
      
      if (formData.front_ic_picture) {
        console.log('Adding front IC picture:', formData.front_ic_picture);
        formDataObj.append('front_ic_picture', formData.front_ic_picture, formData.front_ic_picture.name);
      }
      
      if (formData.back_ic_picture) {
        console.log('Adding back IC picture:', formData.back_ic_picture);
        formDataObj.append('back_ic_picture', formData.back_ic_picture, formData.back_ic_picture.name);
      }
      
      console.log('Submitting user registration with FormData');
      
      // Log the FormData contents for debugging
      console.log('FormData contents before submission:');
      for (let pair of formDataObj.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name + ' (File object)' : pair[1]));
      }
      
      try {
        // Use axios directly instead of the registerUser function
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/register/user`,
          formDataObj,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Accept': 'application/json'
            }
          }
        );
        console.log('User registration successful:', response.data);
        
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);
        
        // Navigate to dashboard instead of login
        navigate('/user/dashboard');
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
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setFormErrors({ general: err.response.data.message });
      } else {
        setFormErrors({ general: 'Registration failed. Please try again.' });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <FaUser className="mr-2 text-indigo-600" /> User Registration
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
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-700 border-b pb-2">Basic Information</h3>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-600">*</span>
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
              <label htmlFor="ic_number" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaIdCard className="mr-1" /> IC Number <span className="text-red-600">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="ic_number"
                  name="ic_number"
                  type="text"
                  required
                  value={formData.ic_number}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {formErrors.ic_number && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.ic_number}</p>
                )}
              </div>
            </div>
            
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
              <label htmlFor="wallet_address" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaWallet className="mr-1" /> Wallet Address
              </label>
              <div className="mt-1">
                <input
                  id="wallet_address"
                  name="wallet_address"
                  type="text"
                  value={formData.wallet_address}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {formErrors.wallet_address && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.wallet_address}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - Document Uploads */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-700 border-b pb-2">Document Uploads</h3>
            
            <div>
              <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaCamera className="mr-1" /> Profile Picture
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                  <span className="block px-4 py-2 border border-gray-300 rounded-md shadow-sm">
                    {formData.profile_picture ? 'Change Picture' : 'Upload Picture'}
                  </span>
                  <input
                    id="profile_picture"
                    name="profile_picture"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="sr-only"
                  />
                </label>
                {previewUrls.profile_picture && (
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100">
                    <img src={previewUrls.profile_picture} alt="Profile preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
              {formErrors.profile_picture && (
                <p className="mt-1 text-sm text-red-600">{formErrors.profile_picture}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="front_ic_picture" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaIdCard className="mr-1" /> Front IC Picture <span className="text-red-600">*</span>
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                  <span className="block px-4 py-2 border border-gray-300 rounded-md shadow-sm">
                    {formData.front_ic_picture ? 'Change Picture' : 'Upload Picture'}
                  </span>
                  <input
                    id="front_ic_picture"
                    name="front_ic_picture"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    required
                    className="sr-only"
                  />
                </label>
                {previewUrls.front_ic_picture && (
                  <div className="h-16 w-24 overflow-hidden bg-gray-100">
                    <img src={previewUrls.front_ic_picture} alt="Front IC preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
              {formErrors.front_ic_picture && (
                <p className="mt-1 text-sm text-red-600">{formErrors.front_ic_picture}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="back_ic_picture" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaIdCard className="mr-1" /> Back IC Picture <span className="text-red-600">*</span>
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                  <span className="block px-4 py-2 border border-gray-300 rounded-md shadow-sm">
                    {formData.back_ic_picture ? 'Change Picture' : 'Upload Picture'}
                  </span>
                  <input
                    id="back_ic_picture"
                    name="back_ic_picture"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    required
                    className="sr-only"
                  />
                </label>
                {previewUrls.back_ic_picture && (
                  <div className="h-16 w-24 overflow-hidden bg-gray-100">
                    <img src={previewUrls.back_ic_picture} alt="Back IC preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
              {formErrors.back_ic_picture && (
                <p className="mt-1 text-sm text-red-600">{formErrors.back_ic_picture}</p>
              )}
            </div>
          </div>
        </div>
        
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