import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OrganizationRegistration() {
  const navigate = useNavigate();
  const { registerOrganization, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    objectives: '',
    representative_id: '',
    wallet_address: '',
    register_address: '',
    gmail: '',
    phone_number: '',
    website: '',
    facebook: '',
    instagram: '',
    others: '',
    password: '',
    password_confirmation: '',
    acceptedTerms: false
  });
  const [files, setFiles] = useState({
    logo: null,
    cover_image_path: null,
    statutory_declaration: null,
    verified_document: null
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    if (uploadedFiles.length > 0) {
      setFiles(prev => ({ ...prev, [name]: uploadedFiles[0] }));
      if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name || formData.name.trim() === '') errors.name = 'Organization name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.description || formData.description.trim() === '') errors.description = 'Description is required';
    if (!formData.objectives || formData.objectives.trim() === '') errors.objectives = 'Objectives are required';
    if (!formData.representative_id || formData.representative_id.trim() === '') errors.representative_id = 'Representative ID is required';
    if (!formData.wallet_address || formData.wallet_address.trim() === '') errors.wallet_address = 'Wallet address is required';
    if (!formData.register_address || formData.register_address.trim() === '') errors.register_address = 'Registration address is required';
    
    if (!formData.gmail || formData.gmail.trim() === '') {
      errors.gmail = 'Gmail is required';
    } else if (!formData.gmail.endsWith('@gmail.com')) {
      errors.gmail = 'Please enter a valid Gmail address';
    }
    
    if (!formData.phone_number || formData.phone_number.trim() === '') errors.phone_number = 'Phone number is required';
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.password_confirmation) {
      errors.password_confirmation = 'Password confirmation is required';
    } else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match';
    }

    if (!files.logo) errors.logo = 'Organization logo is required';
    if (!files.statutory_declaration) errors.statutory_declaration = 'Statutory declaration is required';
    if (!files.verified_document) errors.verified_document = 'Verified document is required';
    // Cover image is optional, so no validation needed

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.acceptedTerms) {
      setFormErrors({
        submit: 'You must accept the Terms and Conditions to register'
      });
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      window.scrollTo(0, 0);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (formData.password) {
        formDataToSend.append('password', formData.password);
      }
      
      if (formData.password_confirmation) {
        formDataToSend.append('password_confirmation', formData.password_confirmation);
      }

      Object.keys(files).forEach(key => {
        if (files[key]) {
          formDataToSend.append(key, files[key], files[key].name);
        }
      });
      
      if (!formDataToSend.has('logo') || !formDataToSend.has('statutory_declaration') || !formDataToSend.has('verified_document')) {
        setFormErrors({
          submit: 'Missing required files. Please upload all required documents.'
        });
        window.scrollTo(0, 0);
        return;
      }
      
      const response = await registerOrganization(formDataToSend);
      console.log('Registration successful:', response);
      navigate('/organization/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response) {
        if (err.response.status === 500) {
          setFormErrors({
            submit: 'Server error occurred. This might be due to one of the following reasons:',
            submit_details: [
              'The representative IC number does not match any registered user',
              'File upload issues - ensure all files are valid and not too large',
              'Database connection issues - please try again later',
              `Server error: ${err.response.data?.message || 'Unknown error'}`
            ]
          });
        } else if (err.response.status === 422 && err.response.data?.errors) {
          const serverErrors = err.response.data.errors;
          const formattedErrors = {};
          
          Object.keys(serverErrors).forEach(key => {
            if (Array.isArray(serverErrors[key])) {
              formattedErrors[key] = serverErrors[key][0];
            } else {
              formattedErrors[key] = serverErrors[key];
            }
          });
          
          if (formattedErrors.representative_id) {
            formattedErrors.representative_id = 'This IC number is not registered. Please ensure the representative is registered as a user first.';
          }
          
          if (formattedErrors.gmail) {
            formattedErrors.gmail = 'This Gmail address is already in use or is invalid. Please use a different Gmail address.';
          }
          
          if (Object.keys(formattedErrors).length > 0) {
            formattedErrors.submit = 'Please fix the validation errors below.';
          }
          
          setFormErrors(formattedErrors);
        } else {
          setFormErrors({
            submit: err.response.data?.message || 'Registration failed. Please try again.'
          });
        }
      } else if (err.request) {
        setFormErrors({
          submit: 'No response from server. Please check your internet connection and try again.'
        });
      } else {
        setFormErrors({
          submit: 'An unexpected error occurred. Please try again.'
        });
      }
      
      window.scrollTo(0, 0);
    }
  };

  return (
    <>
      <form className="space-y-8 divide-y divide-gray-200" onSubmit={handleSubmit}>
        {formErrors.submit && (
          <div className="p-4 bg-red-50">
            <p className="text-sm font-medium text-red-800">{formErrors.submit}</p>
            {formErrors.submit_details && (
              <ul className="mt-2 text-sm text-red-700 list-disc pl-5">
                {formErrors.submit_details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="space-y-8 divide-y divide-gray-200">
          {/* Basic Information */}
          <div className="pt-8">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Please provide your organization's basic details
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Organization Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  {formErrors.name && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <div className="mt-1">
                  <select
                    name="category"
                    id="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Select Category</option>
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Environment">Environment</option>
                    <option value="Youth Development">Youth Development</option>
                    <option value="Disaster Relief">Disaster Relief</option>
                    <option value="Other">Other</option>
                  </select>
                  
                  {formErrors.category && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.category}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  {formErrors.description && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.description}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="objectives" className="block text-sm font-medium text-gray-700">
                  Objectives
                </label>
                <div className="mt-1">
                  <textarea
                    name="objectives"
                    id="objectives"
                    rows={3}
                    value={formData.objectives}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  {formErrors.objectives && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.objectives}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="wallet_address" className="block text-sm font-medium text-gray-700">
                  Wallet Address
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="wallet_address"
                    id="wallet_address"
                    value={formData.wallet_address}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  {formErrors.wallet_address && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.wallet_address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="pt-8">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Contact Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                How can donors and supporters reach your organization?
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="gmail" className="block text-sm font-medium text-gray-700">
                  Gmail
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="gmail"
                    id="gmail"
                    value={formData.gmail}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  {formErrors.gmail && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.gmail}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    name="phone_number"
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  {formErrors.phone_number && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.phone_number}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="register_address" className="block text-sm font-medium text-gray-700">
                  Registration Address
                </label>
                <div className="mt-1">
                  <textarea
                    name="register_address"
                    id="register_address"
                    rows={3}
                    value={formData.register_address}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  {formErrors.register_address && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.register_address}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website (Optional)
                </label>
                <div className="mt-1">
                  <input
                    type="url"
                    name="website"
                    id="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">
                  Facebook (Optional)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="facebook"
                    id="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
                  Instagram (Optional)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="instagram"
                    id="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Representative & Blockchain */}
          <div className="pt-8">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Representative & Blockchain</h3>
              <p className="mt-1 text-sm text-gray-500">
                Provide representative details and blockchain information
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="representative_id" className="block text-sm font-medium text-gray-700">
                  Representative IC Number
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="representative_id"
                    id="representative_id"
                    value={formData.representative_id}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  {formErrors.representative_id && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.representative_id}</p>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  The representative must be a registered user. 
                  <Link to="/register/user" className="ml-1 text-indigo-600 hover:text-indigo-500">
                    Register them first if needed
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="pt-8">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Security</h3>
              <p className="mt-1 text-sm text-gray-500">
                Set up your account security
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  {formErrors.password && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.password}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="password_confirmation"
                    id="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  {formErrors.password_confirmation && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.password_confirmation}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="pt-8">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Required Documents</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload the necessary documents to verify your organization
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                  Organization Logo
                </label>
                <div className="mt-1">
                  <input
                    type="file"
                    name="logo"
                    id="logo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {formErrors.logo && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.logo}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="cover_image_path" className="block text-sm font-medium text-gray-700">
                  Cover Image (Optional)
                </label>
                <div className="mt-1">
                  <input
                    type="file"
                    name="cover_image_path"
                    id="cover_image_path"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Recommended size: 1200 x 300 pixels. This image will appear at the top of your organization profile.
                  </p>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="statutory_declaration" className="block text-sm font-medium text-gray-700">
                  Statutory Declaration
                </label>
                <div className="mt-1">
                  <input
                    type="file"
                    name="statutory_declaration"
                    id="statutory_declaration"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {formErrors.statutory_declaration && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.statutory_declaration}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="verified_document" className="block text-sm font-medium text-gray-700">
                  Verified Document
                </label>
                <div className="mt-1">
                  <input
                    type="file"
                    name="verified_document"
                    id="verified_document"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {formErrors.verified_document && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.verified_document}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-4 mt-6">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={formData.acceptedTerms}
                  onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-800 font-medium">
                    Terms and Conditions
                  </Link>
                  {' '}and{' '}
                  <Link to="/terms#privacy" className="text-blue-600 hover:text-blue-800 font-medium">
                    Privacy Policy
                  </Link>
                  . I confirm that my organization is legally registered and all provided information is accurate.
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-end">
              <Link
                to="/login"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating Organization...' : 'Create Organization'}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account or want to register as a user?</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-600 hover:bg-indigo-50"
              >
                Sign In
              </Link>
              <Link
                to="/register/user"
                className="w-full flex justify-center py-2 px-4 border border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-600 hover:bg-indigo-50"
              >
                Register as User
              </Link>
            </div>
          </div>
        </div>
      </form>
    </>
  );
} 