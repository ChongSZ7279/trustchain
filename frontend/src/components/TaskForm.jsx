import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { formatImageUrl } from '../utils/helpers';

export default function TaskForm({ mode = 'create' }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fund_targeted: '',
    status: 'pending',
    proof: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const { organization } = useAuth();
  const navigate = useNavigate();
  const { charityId, id } = useParams();

  useEffect(() => {
    if (!organization) {
      navigate('/login');
      return;
    }

    if (mode === 'edit' && id) {
      const fetchTask = async () => {
        try {
          const response = await axios.get(`/api/tasks/${id}`);
          const task = response.data;
          
          if (task.charity.organization_id !== organization.id) {
            navigate('/charities');
            return;
          }

          setFormData({
            name: task.name,
            description: task.description,
            fund_targeted: task.fund_targeted,
            status: task.status,
            proof: null
          });

          if (task.proof) {
            setPreviewUrl(formatImageUrl(task.proof));
          }
        } catch (err) {
          console.error('Error fetching task:', err);
          setError('Failed to fetch task details');
        }
      };

      fetchTask();
    }
  }, [mode, id, organization, navigate]);

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
      setFormData(prev => ({
        ...prev,
        proof: file
      }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      let response;
      if (mode === 'edit') {
        formDataToSend.append('_method', 'PUT');
        response = await axios.post(`/api/tasks/${id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await axios.post(`/api/charities/${charityId}/tasks`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      navigate(`/charities/${mode === 'edit' ? response.data.charity_id : charityId}`);
    } catch (err) {
      console.error('Error submitting task:', err);
      setError(err.response?.data?.message || 'Failed to submit task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {mode === 'edit' ? 'Edit Task' : 'Create New Task'}
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

              {mode === 'edit' && (
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
                {previewUrl && (
                  <div className="mt-2">
                    {previewUrl.endsWith('.pdf') ? (
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Current Document
                      </a>
                    ) : (
                      <img
                        src={previewUrl}
                        alt="Proof Preview"
                        className="h-32 w-auto object-cover rounded-lg"
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(`/charities/${mode === 'edit' ? formData.charity_id : charityId}`)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : mode === 'edit' ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 