import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    password_confirmation: ''
  });
  const [files, setFiles] = useState({
    logo: null,
    statutory_declaration: null,
    verified_document: null
  });
  const [formErrors, setFormErrors] = useState({});

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
    
    if (!formData.name) errors.name = 'Organization name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.objectives) errors.objectives = 'Objectives are required';
    if (!formData.representative_id) errors.representative_id = 'Representative ID is required';
    if (!formData.wallet_address) errors.wallet_address = 'Wallet address is required';
    if (!formData.register_address) errors.register_address = 'Registration address is required';
    if (!formData.gmail) errors.gmail = 'Gmail is required';
    if (!formData.gmail.endsWith('@gmail.com')) {
      errors.gmail = 'Please enter a valid Gmail address';
    }
    if (!formData.phone_number) errors.phone_number = 'Phone number is required';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match';
    }

    if (!files.logo) errors.logo = 'Organization logo is required';
    if (!files.statutory_declaration) errors.statutory_declaration = 'Statutory declaration is required';
    if (!files.verified_document) errors.verified_document = 'Verified document is required';

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
      const registrationData = {
        ...formData,
        ...files
      };
      
      await registerOrganization(registrationData);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Register as an Organization
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Organization Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Organization Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {formErrors.description && (
                <p className="mt-2 text-sm text-red-600">{formErrors.description}</p>
              )}
            </div>

            {/* Objectives */}
            <div>
              <label htmlFor="objectives" className="block text-sm font-medium text-gray-700">
                Objectives
              </label>
              <textarea
                name="objectives"
                id="objectives"
                rows={3}
                value={formData.objectives}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {formErrors.objectives && (
                <p className="mt-2 text-sm text-red-600">{formErrors.objectives}</p>
              )}
            </div>

            {/* Representative ID */}
            <div>
              <label htmlFor="representative_id" className="block text-sm font-medium text-gray-700">
                Representative IC Number
              </label>
              <input
                type="text"
                name="representative_id"
                id="representative_id"
                value={formData.representative_id}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {formErrors.representative_id && (
                <p className="mt-2 text-sm text-red-600">{formErrors.representative_id}</p>
              )}
            </div>

            {/* Wallet Address */}
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {formErrors.wallet_address && (
                <p className="mt-2 text-sm text-red-600">{formErrors.wallet_address}</p>
              )}
            </div>

            {/* Registration Address */}
            <div>
              <label htmlFor="register_address" className="block text-sm font-medium text-gray-700">
                Registration Address
              </label>
              <textarea
                name="register_address"
                id="register_address"
                rows={3}
                value={formData.register_address}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {formErrors.register_address && (
                <p className="mt-2 text-sm text-red-600">{formErrors.register_address}</p>
              )}
            </div>

            {/* Gmail */}
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {formErrors.gmail && (
                <p className="mt-2 text-sm text-red-600">{formErrors.gmail}</p>
              )}
            </div>

            {/* Phone Number */}
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {formErrors.phone_number && (
                <p className="mt-2 text-sm text-red-600">{formErrors.phone_number}</p>
              )}
            </div>

            {/* Website */}
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {formErrors.website && (
                <p className="mt-2 text-sm text-red-600">{formErrors.website}</p>
              )}
            </div>

            {/* Facebook */}
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Instagram */}
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Others */}
            <div>
              <label htmlFor="others" className="block text-sm font-medium text-gray-700">
                Other Information (Optional)
              </label>
              <textarea
                name="others"
                id="others"
                rows={3}
                value={formData.others}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {formErrors.password && (
                <p className="mt-2 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>

            {/* Password Confirmation */}
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                name="password_confirmation"
                id="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {formErrors.password_confirmation && (
                <p className="mt-2 text-sm text-red-600">{formErrors.password_confirmation}</p>
              )}
            </div>

            {/* Logo */}
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                Organization Logo
              </label>
              <input
                type="file"
                name="logo"
                id="logo"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {formErrors.logo && (
                <p className="mt-2 text-sm text-red-600">{formErrors.logo}</p>
              )}
            </div>

            {/* Statutory Declaration */}
            <div>
              <label htmlFor="statutory_declaration" className="block text-sm font-medium text-gray-700">
                Statutory Declaration
              </label>
              <input
                type="file"
                name="statutory_declaration"
                id="statutory_declaration"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {formErrors.statutory_declaration && (
                <p className="mt-2 text-sm text-red-600">{formErrors.statutory_declaration}</p>
              )}
            </div>

            {/* Verified Document */}
            <div>
              <label htmlFor="verified_document" className="block text-sm font-medium text-gray-700">
                Verified Document
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
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Registering...' : 'Register Organization'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 