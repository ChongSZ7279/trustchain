import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import BackButton from './BackToHistory';
import { formatImageUrl, getFileType } from '../utils/helpers';
import { 
  FaTasks, 
  FaFileAlt, 
  FaImage, 
  FaMoneyBillWave,
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
  FaClipboardList,
  FaCheckCircle,
  FaFilePdf,
  FaFileWord,
  FaEye
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const getFileIcon = (fileType) => {
  if (fileType?.includes('pdf')) return <FaFilePdf className="text-red-500 text-xl" />;
  if (fileType?.includes('word') || fileType?.includes('doc')) return <FaFileWord className="text-blue-500 text-xl" />;
  if (fileType?.includes('image')) return <FaImage className="text-green-500 text-xl" />;
  return <FaFileAlt className="text-gray-500 text-xl" />;
};

export default function TaskForm() {
  const { charityId, taskId } = useParams();
  const navigate = useNavigate();
  const { currentUser, accountType } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'pending',
    fund_targeted: '',
    due_date: ''
  });
  const [existingPictures, setExistingPictures] = useState([]);
  const [newPictures, setNewPictures] = useState([]);
  const [picturesToDelete, setPicturesToDelete] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [proofFile, setProofFile] = useState(null);
  const [existingProof, setExistingProof] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [charity, setCharity] = useState(null);
  const [documentPreview, setDocumentPreview] = useState({
    type: null,
    url: null,
    name: null
  });

  // Effect to create preview URLs for new pictures
  useEffect(() => {
    const urls = newPictures.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [newPictures]);

  const canManageCharity = (charityData) => {
    // Organization users can manage their own charities
    if (!currentUser || !charityData) return false;
    
    // Check if user is organization and matches the charity's organization_id
    if (accountType === 'organization' && currentUser.id === charityData.organization_id) {
      return true;
    }
    
    // Add any additional permission checks here if needed
    return false;
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate name
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Task name is required';
    }

    // Validate description
    if (!formData.description || !formData.description.trim()) {
      errors.description = 'Description is required';
    }

    // Validate fund_targeted
    if (!formData.fund_targeted || formData.fund_targeted === '') {
      errors.fund_targeted = 'Fund target is required';
    } else {
      const fundAmount = parseFloat(formData.fund_targeted);
      if (isNaN(fundAmount) || fundAmount < 0) {
        errors.fund_targeted = 'Fund target must be a positive number';
      }
    }

    // Log validation results
    console.log('Form validation results:', { formData, errors });

    return errors;
  };

  useEffect(() => {
    if (!currentUser) {
      console.log('No user logged in, redirecting to login');
      navigate('/login');
      return;
    }

    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching data for:', { charityId, taskId, currentUser, accountType });
        
        // First fetch charity data
        try {
          const charityResponse = await axios.get(`/charities/${charityId}`);
          const charityData = charityResponse.data;
          console.log('Fetched charity:', charityData);
          
          // Only proceed if component is still mounted
          if (!isMounted) return;

          // Check if user can manage this charity
          if (!canManageCharity(charityData)) {
            console.error('User does not have permission to manage this charity');
            setError('You do not have permission to manage this charity');
            navigate('/charities');
            return;
          }

          setCharity(charityData);

          // If editing, fetch task data
          if (taskId) {
            try {
              const taskResponse = await axios.get(`/tasks/${taskId}`);
              const taskData = taskResponse.data;
              console.log('Fetched task:', taskData);
              
              if (!isMounted) return;

              if (!taskData) {
                setError('Task not found');
                navigate(`/charities/${charityId}`);
                return;
              }

              setFormData({
                name: taskData.name || '',
                description: taskData.description || '',
                status: taskData.status || 'pending',
                fund_targeted: taskData.fund_targeted || '',
                due_date: taskData.due_date || ''
              });

              // Set existing proof file if exists
              if (taskData.proof) {
                setExistingProof(taskData.proof);
              }

              // Fetch task pictures
              try {
                const picturesResponse = await axios.get(`/tasks/${taskId}/pictures`);
                if (picturesResponse.data) {
                  setExistingPictures(picturesResponse.data);
                }
              } catch (err) {
                console.error('Error fetching task pictures:', err);
              }
            } catch (err) {
              console.error('Error fetching task:', err);
              if (isMounted) {
                if (err.response?.status === 404) {
                  setError('Task not found');
                  navigate(`/charities/${charityId}`);
                } else {
                  setError('Failed to load task data. Please try again.');
                }
              }
            }
          }
        } catch (err) {
          console.error('Error fetching charity:', err);
          if (isMounted) {
            if (err.response?.status === 404) {
              setError('Charity not found');
            } else {
              setError('Failed to load charity data');
            }
            navigate('/charities');
          }
          return;
        }
      } catch (err) {
        console.error('Error in fetchData:', err);
        if (isMounted) {
          setError('Failed to load required data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [charityId, taskId, currentUser, accountType, navigate]);

  const handlePictureDelete = (index, isPreviouslyUploaded = false) => {
    if (isPreviouslyUploaded) {
      const pictureToDelete = existingPictures[index];
      setPicturesToDelete(prev => [...prev, pictureToDelete.id]);
      setExistingPictures(prev => prev.filter((_, i) => i !== index));
    } else {
      setNewPictures(prev => prev.filter((_, i) => i !== index));
      setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handlePictureChange = (e) => {
    const files = Array.from(e.target.files);
    setNewPictures(prev => [...prev, ...files]);
  };

  const handleProofFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/gif'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload PDF, DOC, DOCX, JPEG, PNG, JPG, or GIF files only.');
        e.target.value = ''; // Reset the file input
        return;
      }
      
      // Validate file size (2MB = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size too large. Maximum size is 2MB.');
        e.target.value = ''; // Reset the file input
        return;
      }

      setProofFile(file);
      // Create preview URL for the document
      const previewUrl = URL.createObjectURL(file);
      setDocumentPreview({
        type: file.type,
        url: previewUrl,
        name: file.name
      });
    }
  };

  const handleRemoveProof = () => {
    setProofFile(null);
    setExistingProof(null);
    // Reset the file input
    const fileInput = document.getElementById('proof-file');
    if (fileInput) fileInput.value = '';
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
      setError(null);
      
      // Log form state before submission for debugging
      console.log('Form data before submission:', { ...formData });
      
      // Create a plain object first to ensure we have all data
      const dataObject = {
        name: formData.name || '',
        description: formData.description || '',
        fund_targeted: formData.fund_targeted || '',
        status: formData.status || 'pending',
      };
      
      // Now convert to FormData
      const formDataToSend = new FormData();
      
      // Add all fields to FormData
      Object.keys(dataObject).forEach(key => {
        formDataToSend.append(key, dataObject[key]);
        console.log(`Adding field ${key}:`, dataObject[key]); // Debug log
      });

      // Add _method field for Laravel to understand PUT requests
      if (taskId) {
        formDataToSend.append('_method', 'PUT');
        console.log('Adding _method: PUT');
      }

      // Append new pictures
      newPictures.forEach(file => {
        formDataToSend.append('pictures[]', file);
      });

      // Append pictures to delete
      if (picturesToDelete.length > 0) {
        formDataToSend.append('pictures_to_delete', JSON.stringify(picturesToDelete));
      }

      // Add proof file to form data if exists
      if (proofFile) {
        formDataToSend.append('proof', proofFile);
        console.log('Adding proof file:', proofFile.name, 'Type:', proofFile.type, 'Size:', proofFile.size);
      }

      // Add proof deletion flag if removing existing proof
      if (existingProof && !proofFile) {
        formDataToSend.append('delete_proof', '1');
      }

      const endpoint = taskId 
        ? `/fix-tasks/${taskId}` 
        : `/charities/${charityId}/tasks`;

      // Log the fetch request details
      console.log('Sending request to:', endpoint, 'with method:', taskId ? 'put' : 'post');
      
      // Directly log the form data entries
      console.log('Debug - Form data entries:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name} (${pair[1].type}, ${pair[1].size} bytes)` : pair[1]));
      }
      
      const response = await axios({
        method: taskId ? 'post' : 'post',
        url: endpoint,
        data: formDataToSend,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });

      console.log('Task saved successfully:', response.data);
      navigate(`/charities/${charity ? charity.id : charityId}`);
    } catch (err) {
      console.error('Error saving task:', err);
      
      // Enhanced error logging
      if (err.response) {
        console.error('Response error details:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
        
        // Log the actual validation errors
        if (err.response.data?.errors) {
          console.error('Validation errors:', err.response.data.errors);
          // Display validation errors to the user
          Object.entries(err.response.data.errors).forEach(([field, messages]) => {
            if (field === 'proof') {
              toast.error(`Proof file error: ${messages[0]}`);
            } else {
              setFormErrors(prev => ({ ...prev, [field]: messages[0] }));
            }
          });
        } else if (err.response.data?.message) {
          console.error('Error message:', err.response.data.message);
          setError(err.response.data.message);
        } else {
          console.error('Unknown error:', err.response.data);
          setError('Failed to save task. Server returned an error.');
        }
      } else if (err.request) {
        console.error('Request was made but no response received:', err.request);
        setError('Failed to save task. No response received from server.');
      } else {
        console.error('Error setting up request:', err.message);
        setError('Failed to save task. ' + err.message);
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

  if (loading && !charity) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!charity && !loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading charity information...</h2>
          {error && <p className="mt-2 text-red-600">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <BackButton />
      <div className="max-w-7xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white shadow-sm rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FaTasks className="mr-3 text-indigo-600" />
                {taskId ? 'Edit Task' : 'Create Task'}
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
                  <FaInfoCircle className="mr-2 text-indigo-600" />
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaTasks className="mr-2" />
                      Task Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        formErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
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
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        formErrors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    />
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
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
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        formErrors.fund_targeted ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    />
                    {formErrors.fund_targeted && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.fund_targeted}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Proof Document Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaFileAlt className="mr-2 text-indigo-600" />
                  Proof Document
                </h2>
                
                {/* Existing Proof File */}
                {existingProof && !proofFile && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Current Proof Document</h3>
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(getFileType(existingProof))}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">
                            {existingProof.split('/').pop()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getFileType(existingProof)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a 
                          href={formatImageUrl(existingProof)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                        >
                          <FaEye className="mr-1" />
                          View Proof
                        </a>
                        <button
                          type="button"
                          onClick={handleRemoveProof}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTimes className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* New Proof File Upload */}
                <div>
                  <label htmlFor="proof-file" className="block text-sm font-medium text-gray-700">
                    {existingProof ? 'Replace Proof Document' : 'Upload Proof Document'}
                  </label>
                  <div className="mt-2">
                    <input
                      type="file"
                      id="proof-file"
                      accept=".pdf,.doc,.docx,image/*"
                      onChange={handleProofFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                  {proofFile && (
                    <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(documentPreview.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 truncate">
                              {documentPreview.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {documentPreview.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <a
                            href={documentPreview.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                          >
                            <FaEye className="mr-1" />
                            View Proof
                          </a>
                          <button
                            type="button"
                            onClick={handleRemoveProof}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTimes className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    Accepted file types: PDF, DOC, DOCX, Images
                  </p>
                </div>
              </div>

              {/* Pictures Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaImage className="mr-2 text-indigo-600" />
                  Task Pictures
                </h2>
                
                {/* Existing Pictures */}
                {existingPictures.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Current Pictures</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {existingPictures.map((picture, index) => (
                        <div key={picture.id} className="relative border rounded-lg overflow-hidden">
                          <img
                            src={formatImageUrl(picture.path)}
                            alt={`Task picture ${index + 1}`}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              console.error('Error loading task picture:', e);
                              e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handlePictureDelete(index, true)}
                            className="absolute top-2 right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Pictures */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Add New Pictures
                  </label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePictureChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                  {newPictures.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {newPictures.map((file, index) => (
                        <div key={index} className="relative border rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New picture ${index + 1}`}
                            className="w-full h-48 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handlePictureDelete(index)}
                            className="absolute top-2 right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    Upload one or multiple pictures. Supported formats: JPG, PNG, GIF
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate(`/charities/${charity ? charity.id : charityId}`)}
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
                      {taskId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      {taskId ? 'Update Task' : 'Create Task'}
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