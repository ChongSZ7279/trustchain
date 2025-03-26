import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatImageUrl, getFileType } from '../utils/helpers';

/**
 * Component for displaying task pictures and proof documents
 * @param {Object} props - Component props
 * @param {number} props.taskId - The ID of the task
 * @param {string} props.proof - The proof document path
 */
export default function TaskMediaDisplay({ taskId, proof }) {
  const [pictures, setPictures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPictures = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/tasks/${taskId}/pictures`);
        setPictures(response.data);
      } catch (err) {
        console.error('Error fetching pictures:', err);
        setError('Failed to load pictures');
      } finally {
        setLoading(false);
      }
    };

    fetchPictures();
  }, [taskId]);

  return (
    <div className="mt-2">
      {/* Task Proof Document */}
      {proof && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Proof Document:</h5>
          <div className="flex items-center">
            {getFileType(proof) === 'image' ? (
              <a 
                href={formatImageUrl(proof)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <img 
                  src={formatImageUrl(proof)} 
                  alt="Proof document" 
                  className="h-24 w-auto object-cover rounded"
                />
              </a>
            ) : (
              <a 
                href={formatImageUrl(proof)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-indigo-600 hover:text-indigo-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                View Document
              </a>
            )}
          </div>
        </div>
      )}
      
      {/* Task Pictures */}
      {!loading && pictures.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Task Pictures:</h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {pictures.map(picture => (
              <a 
                key={picture.id} 
                href={formatImageUrl(picture.path)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <img 
                  src={formatImageUrl(picture.path)} 
                  alt="Task picture" 
                  className="h-20 w-full object-cover rounded"
                />
              </a>
            ))}
          </div>
        </div>
      )}
      
      {loading && (
        <div className="mt-4 py-2 text-center text-sm text-gray-500">
          Loading media...
        </div>
      )}
      
      {error && (
        <div className="mt-4 py-2 text-center text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
} 