import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { formatImageUrl } from '../utils/helpers';
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
  FaCheckCircle
} from 'react-icons/fa';

export default function TaskForm({ mode = 'create' }) {
  const { id: charityId, taskId } = useParams();
  const navigate = useNavigate();
  const { currentUser, accountType } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fund_targeted: '',
    status: 'pending',
  });
  const [files, setFiles] = useState({
    proof: null
  });
  const [charity, setCharity] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Mode:', mode, 'CharityId:', charityId, 'TaskId:', taskId); // Debug log
        
        if (mode === 'edit' || taskId) {
          // Fetch task data when editing
          const response = await axios.get(`/tasks/${taskId}`);
          const taskData = response.data;
          console.log('Fetched task:', taskData); // Debug log
          
          // Check if user owns the charity
          if (taskData.charity.organization_id !== accountType) {
            console.error('User does not own this charity');
            navigate('/charities');
            return;
          }

          setFormData({
            name: taskData.name || '',
            description: taskData.description || '',
            fund_targeted: taskData.fund_targeted || '',
            status: taskData.status || 'pending',
            required_volunteers: taskData.required_volunteers || 1,
            charity_id: taskData.charity_id || charityId
          });

          setCharity(taskData.charity);
        } else if (mode === 'create' || charityId) {
          // Verify charityId exists when creating
          if (!charityId) {
            console.error('No charity ID found for task creation');
            navigate('/charities');
            return;
          }

          // Fetch charity data when creating new task
          const response = await axios.get(`/charities/${charityId}`);
          const charityData = response.data;
          console.log('Fetched charity:', charityData); // Debug log
          
          // Check if user owns the charity
          if (charityData.organization_id !== accountType) {
            console.error('User does not own this charity');
            navigate('/charities');
            return;
          }

          setCharity(charityData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mode, taskId, charityId, currentUser, navigate, accountType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles({ proof: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Append file if exists
      if (files.proof) {
        formDataToSend.append('proof', files.proof);
      }

      let response;
      if (taskId) {
        // Update existing task
        response = await axios.post(`/tasks/${taskId}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        // Navigate back to charity details
        navigate(`/charities/${charity.id}`);
      } else {
        // Create new task
        response = await axios.post(`/charities/${charityId}/tasks`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        // Navigate back to charity details
        navigate(`/charities/${charityId}`);
      }
    } catch (err) {
      console.error('Error submitting task:', err);
      setError(err.response?.data?.message || 'Failed to submit task');
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-gray-500 mb-6">
          <Link 
            to={`/charities/${charity ? charity.id : charityId}`} 
            className="hover:text-gray-700 flex items-center"
          >
            <FaArrowLeft className="mr-2" />
            Back to Charity
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{mode === 'edit' ? 'Edit Task' : 'Create Task'}</span>
        </nav>

        <div className="bg-white shadow-sm rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FaTasks className="mr-3" />
                {mode === 'edit' ? 'Edit Task' : 'Create Task'}
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
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
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaClipboardList className="mr-2" />
                      Status
                    </label>
                    <select
                      name="status"
                      id="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaFileAlt className="mr-2" />
                  Proof Document
                </h2>
                <div>
                  <label htmlFor="proof" className="block text-sm font-medium text-gray-700 flex items-center">
                    <FaImage className="mr-2" />
                    Upload Proof Document
                  </label>
                  <input
                    type="file"
                    name="proof"
                    id="proof"
                    accept=".pdf,.doc,.docx,image/*"
                    onChange={handleFileChange}
                    className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Accepted file types: Images, PDF, DOC, DOCX
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
                      {mode === 'edit' ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      {mode === 'edit' ? 'Update Task' : 'Create Task'}
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