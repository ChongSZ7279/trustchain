import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { formatImageUrl } from '../utils/helpers';

export default function TaskForm({ mode = 'create' }) {
  // Extract parameters from URL
  const params = useParams();
  // For edit mode: /tasks/:taskId/edit
  // For create mode: /charities/:id/tasks/create
  const taskId = params.taskId; // From /tasks/:taskId/edit
  const charityId = params.id; // From /charities/:id/tasks/create
  
  console.log('Route params:', params); // Debug log
  
  const navigate = useNavigate();
  const { organization } = useAuth();
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
    if (!organization) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Mode:', mode, 'CharityId:', charityId, 'TaskId:', taskId); // Debug log
        
        if (mode === 'edit' || taskId) {
          // Fetch task data when editing
          const response = await axios.get(`/api/tasks/${taskId}`);
          const task = response.data;
          console.log('Fetched task:', task); // Debug log
          
          // Check if user owns the charity
          if (task.charity.organization_id !== organization.id) {
            console.error('User does not own this charity');
            navigate('/charities');
            return;
          }

          setFormData({
            name: task.name || '',
            description: task.description || '',
            fund_targeted: task.fund_targeted || '',
            status: task.status || 'pending',
          });

          setCharity(task.charity);
        } else if (mode === 'create' || charityId) {
          // Verify charityId exists when creating
          if (!charityId) {
            console.error('No charity ID found for task creation');
            navigate('/charities');
            return;
          }

          // Fetch charity data when creating new task
          const response = await axios.get(`/api/charities/${charityId}`);
          const charityData = response.data;
          console.log('Fetched charity:', charityData); // Debug log
          
          // Check if user owns the charity
          if (charityData.organization_id !== organization.id) {
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
  }, [mode, taskId, charityId, organization, navigate]);

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
      if (mode === 'edit' || taskId) {
        formDataToSend.append('_method', 'PUT');
        response = await axios.post(`/api/tasks/${taskId}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          },
        });
        
        // Navigate back to charity details
        navigate(`/charities/${charity.id}`);
      } else if (mode === 'create' || charityId) {
        response = await axios.post(`/api/charities/${charityId}/tasks`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
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

  if (loading) {
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
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {(mode === 'edit' || taskId) ? 'Edit Task' : 'Create New Task'}
            </h2>

            {error && (
              <div className="mb-4 text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="fund_targeted" className="block text-sm font-medium text-gray-700">
                  Target Fund ($)
                </label>
                <input
                  type="number"
                  name="fund_targeted"
                  id="fund_targeted"
                  min="0"
                  step="0.01"
                  value={formData.fund_targeted}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {(mode === 'edit' || taskId) && (
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    id="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="proof" className="block text-sm font-medium text-gray-700">
                  Proof Document
                </label>
                <input
                  type="file"
                  name="proof"
                  id="proof"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(`/charities/${charity ? charity.id : charityId}`)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (mode === 'edit' || taskId) ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 