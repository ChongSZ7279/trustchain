import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatImageUrl } from '../utils/helpers';

export default function ImageTest() {
  const [storageInfo, setStorageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testImages, setTestImages] = useState([]);

  useEffect(() => {
    const fetchStorageInfo = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/storage-test');
        setStorageInfo(response.data);
        
        // Get the first few image files for testing
        const imageFiles = response.data.files.filter(file => 
          file.endsWith('.jpg') || file.endsWith('.jpeg') || 
          file.endsWith('.png') || file.endsWith('.gif')
        ).slice(0, 5);
        
        setTestImages(imageFiles);
      } catch (err) {
        console.error('Error fetching storage info:', err);
        setError('Failed to fetch storage information');
      } finally {
        setLoading(false);
      }
    };

    fetchStorageInfo();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Storage Test</h1>
      
      {loading && <p>Loading storage information...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {storageInfo && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Storage Configuration</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto">
            <pre>{JSON.stringify(storageInfo, null, 2)}</pre>
          </div>
        </div>
      )}
      
      {testImages.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Test Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testImages.map((image, index) => (
              <div key={index} className="border rounded p-4">
                <p className="mb-2 text-sm font-medium">{image}</p>
                <div className="mb-2">
                  <h3 className="text-sm font-medium">Direct Path:</h3>
                  <img 
                    src={`/storage/${image}`} 
                    alt={`Test ${index}`}
                    className="max-w-full h-auto max-h-40 object-contain"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Helper Function:</h3>
                  <img 
                    src={formatImageUrl(image)} 
                    alt={`Test ${index} with helper`}
                    className="max-w-full h-auto max-h-40 object-contain"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Manual Test</h2>
        <p className="mb-4">Test with a known image path from your database:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded p-4">
            <h3 className="text-sm font-medium mb-2">Profile Picture Test</h3>
            <img 
              src={formatImageUrl('profile_pictures/QBl8qO77BtqNrz3gdG9iHQX1k2vkIMF3waILaJq9.png')} 
              alt="Profile Picture Test"
              className="max-w-full h-auto max-h-40 object-contain"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }}
            />
          </div>
          <div className="border rounded p-4">
            <h3 className="text-sm font-medium mb-2">Organization Logo Test</h3>
            <img 
              src={formatImageUrl('organization_logos/Mum4I0lZIuVYfEgEkegu3ejv8aNR1THJ9uKUOnHG.png')} 
              alt="Organization Logo Test"
              className="max-w-full h-auto max-h-40 object-contain"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 