import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { formatImageUrl } from '../utils/helpers';
import { 
  FaTasks, 
  FaFileAlt, 
  FaImage, 
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
  FaClipboardList,
  FaCheckCircle,
  FaTrash,
  FaUpload
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

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
  const [hasPermission, setHasPermission] = useState(true);
  
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

    const fetchTaskData = async () => {
      try {
        setLoading(true);
        const headers = { 'Accept': 'application/json' };
        
        // Fetch task details
        const taskResponse = await axios.get(`/tasks/${taskId}`, { headers });
        setTask(taskResponse.data);
        
        // Check if user has permission to manage this task
        if (taskResponse.data.charity && 
            taskResponse.data.charity.organization_id === organization.id) {
          setHasPermission(true);
        } else {
          setHasPermission(false);
          setError('You do not have permission to manage pictures for this task');
        }
        
        // Fetch existing pictures
        const picturesResponse = await axios.get(`/tasks/${taskId}/pictures`, { headers });
        setTaskPictures(picturesResponse.data || []);
      } catch (err) {
        console.error('Error fetching task data:', err);
        setError('Failed to load task data');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskData();
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
      const response = await axios.post(`/tasks/${taskId}/pictures`, pictureData, {
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
      
      toast.success('Picture uploaded successfully');
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
      await axios.delete(`/tasks/${taskId}/pictures/${pictureId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      // Remove the deleted picture from the list
      setTaskPictures(prev => prev.filter(pic => pic.id !== pictureId));
      
      toast.success('Picture deleted successfully');
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
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-gray-500 mb-6">
          <Link 
            to={`/charities/${task?.charity?.id}`} 
            className="hover:text-gray-700 flex items-center"
          >
            <FaArrowLeft className="mr-2" />
            Back to Charity
          </Link>
          <span className="mx-2">/</span>
          <Link 
            to={`/tasks/${taskId}`} 
            className="hover:text-gray-700"
          >
            Task Details
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Manage Pictures</span>
        </nav>

        <div className="bg-white shadow-sm rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FaImage className="mr-3" />
                Task Pictures: {task?.name}
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

            <div className="space-y-8">
              {/* Task Details Summary */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaInfoCircle className="mr-2" />
                  Task Details
                </h2>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{task?.name}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task?.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task?.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task?.status?.replace('_', ' ').charAt(0).toUpperCase() + task?.status?.slice(1)}
                      </span>
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900">{task?.description}</dd>
                  </div>
                </dl>
              </div>

              {/* Current Pictures */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaImage className="mr-2" />
                  Current Pictures
                </h2>
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
                            <FaTrash className="mr-2" />
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
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaUpload className="mr-2" />
                  Add New Picture
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="task-picture" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FaImage className="mr-2" />
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
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FaUpload className="mr-2" />
                          Upload Picture
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 