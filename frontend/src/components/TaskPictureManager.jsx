import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { formatImageUrl } from '../utils/helpers';

export default function TaskPictureManager() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { organization, token: authToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [task, setTask] = useState(null);
  const [taskPictures, setTaskPictures] = useState([]);
  const [newPicture, setNewPicture] = useState(null);
  const [picturePreview, setPicturePreview] = useState(null);
  
  // Get token directly from localStorage as a backup
  const localToken = localStorage.getItem('token');
  // Use authToken from context if available, otherwise use localToken
  const token = authToken || localToken;
  
  useEffect(() => {
    console.log('Current token:', token);
    console.log('Current organization:', organization);
    
    if (!token) {
      console.error('No token found');
      navigate('/login');
      return;
    }

    if (!organization) {
      console.error('No organization data found');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Set up headers with token
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        };
        
        console.log('Using headers:', headers);
        
        // Fetch task data
        const taskResponse = await axios.get(`/api/tasks/${taskId}`, { headers });
        const taskData = taskResponse.data;
        console.log('Fetched task data:', taskData);
        
        // Check if user owns the charity
        if (taskData.charity.organization_id !== organization.id) {
          console.error('User does not own this charity');
          navigate('/charities');
          return;
        }

        setTask(taskData);
        
        // Fetch task pictures
        const picturesResponse = await axios.get(`/api/tasks/${taskId}/pictures`, { headers });
        console.log('Fetched pictures:', picturesResponse.data);
        setTaskPictures(picturesResponse.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId, organization, navigate, token]);

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPicture(file);
      setPicturePreview(URL.createObjectURL(file));
    }
  };
  
  const handleAddPicture = async () => {
    if (!newPicture || !taskId) {
      setError('No picture selected or invalid task ID');
      return;
    }
    
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      navigate('/login');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const pictureData = new FormData();
      pictureData.append('picture', newPicture);
      pictureData.append('task_id', taskId);
      
      console.log('Sending picture upload request:');
      console.log('- Task ID:', taskId);
      console.log('- Token:', token ? 'Present (length: ' + token.length + ')' : 'Missing');
      console.log('- Picture size:', newPicture.size, 'bytes');
      
      // Make the request with explicit headers
      const response = await axios.post(`/api/tasks/${taskId}/pictures`, pictureData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      console.log('Picture upload response:', response.data);
      
      // Add the new picture to the list
      setTaskPictures(prev => [...prev, response.data]);
      
      // Reset the form
      setNewPicture(null);
      setPicturePreview(null);
      
      // Clear the file input
      const fileInput = document.getElementById('task-picture');
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      console.error('Error adding picture:', err);
      console.error('Response data:', err.response?.data);
      console.error('Status:', err.response?.status);
      setError(
        'Failed to add picture: ' + 
        (err.response?.data?.message || err.message) +
        '. Status: ' + (err.response?.status || 'unknown')
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeletePicture = async (pictureId) => {
    if (!pictureId || !taskId) return;
    
    if (!confirm('Are you sure you want to delete this picture?')) return;
    
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      navigate('/login');
      return;
    }
    
    try {
      setLoading(true);
      await axios.delete(`/api/tasks/${taskId}/pictures/${pictureId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      // Remove the deleted picture from the list
      setTaskPictures(prev => prev.filter(pic => pic.id !== pictureId));
    } catch (err) {
      console.error('Error deleting picture:', err);
      setError('Failed to delete picture: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !task) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!task && !loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading task information...</h2>
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Task Pictures: {task.name}
              </h2>
              <button
                type="button"
                onClick={() => navigate(`/charities/${task.charity.id}`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Charity
              </button>
            </div>

            {error && (
              <div className="mb-4 text-red-600">
                {error}
              </div>
            )}
            
            {/* Authentication Status */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700">Authentication Status</h3>
              <p className="text-sm text-gray-600">
                Token: {token ? 'Present ✓' : 'Missing ✗'}
              </p>
              <p className="text-sm text-gray-600">
                Organization: {organization ? `${organization.name} (ID: ${organization.id}) ✓` : 'Missing ✗'}
              </p>
            </div>

            {/* Task Details Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Task Details</h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{task.name}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{task.description}</dd>
                </div>
              </dl>
            </div>
            
            {/* Existing Pictures */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Current Pictures</h3>
              {taskPictures.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {taskPictures.map(picture => (
                    <div key={picture.id} className="border rounded-lg overflow-hidden bg-white shadow">
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={formatImageUrl(picture.path)} 
                          alt="Task picture" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-500">
                          Uploaded: {new Date(picture.created_at).toLocaleString()}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleDeletePicture(picture.id)}
                          className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No pictures have been added to this task yet.</p>
              )}
            </div>
            
            {/* Add New Picture */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Picture</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="task-picture" className="block text-sm font-medium text-gray-700">
                    Select Picture
                  </label>
                  <input
                    type="file"
                    id="task-picture"
                    accept="image/*"
                    onChange={handlePictureChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
                
                {picturePreview && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <img 
                      src={picturePreview} 
                      alt="Preview" 
                      className="h-40 w-auto object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div>
                  <button
                    type="button"
                    onClick={handleAddPicture}
                    disabled={!newPicture || loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? 'Uploading...' : 'Upload Picture'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 