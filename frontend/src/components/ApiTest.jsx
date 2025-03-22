import { useState } from 'react';
import axios from 'axios';

export default function ApiTest() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testEndpoints = [
    { name: 'Test Database', url: '/test-database', method: 'get' },
    { name: 'Charities List', url: '/charities', method: 'get' },
    { name: 'Organizations List', url: '/organizations', method: 'get' },
    { name: 'Storage Test', url: '/storage-test', method: 'get' }
  ];

  const testApi = async (endpoint) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log(`Testing endpoint: ${endpoint.url}`);
      const response = await axios({
        method: endpoint.method,
        url: endpoint.url,
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Response from ${endpoint.url}:`, response);
      setResult({
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
    } catch (err) {
      console.error(`Error testing ${endpoint.url}:`, err);
      
      if (err.response) {
        setError({
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
          message: err.message
        });
      } else if (err.request) {
        setError({
          message: 'No response received from server',
          request: 'Request was sent but no response was received',
          error: err.message
        });
      } else {
        setError({
          message: err.message,
          error: 'Error setting up the request'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3">Test Endpoints</h2>
        <div className="flex flex-wrap gap-3">
          {testEndpoints.map((endpoint) => (
            <button
              key={endpoint.url}
              onClick={() => testApi(endpoint)}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {endpoint.name}
            </button>
          ))}
        </div>
      </div>
      
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2">Testing API connection...</span>
        </div>
      )}
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
          <h3 className="text-lg font-medium text-red-800">Error</h3>
          <pre className="mt-2 text-sm text-red-700 overflow-auto max-h-60">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
      
      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Response</h3>
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="mb-2">
              <span className="font-medium">Status:</span> {result.status} {result.statusText}
            </div>
            <div className="mb-2">
              <span className="font-medium">Headers:</span>
              <pre className="mt-1 text-xs text-gray-600 overflow-auto max-h-20">
                {JSON.stringify(result.headers, null, 2)}
              </pre>
            </div>
            <div>
              <span className="font-medium">Data:</span>
              <pre className="mt-1 text-xs text-gray-600 overflow-auto max-h-60">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-medium mb-2">API Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Base URL:</span> {axios.defaults.baseURL || 'Not set'}
          </div>
          <div>
            <span className="font-medium">With Credentials:</span> {axios.defaults.withCredentials ? 'Yes' : 'No'}
          </div>
          <div>
            <span className="font-medium">API URL from .env:</span> {import.meta.env.VITE_API_URL || 'Not set'}
          </div>
          <div>
            <span className="font-medium">Environment:</span> {import.meta.env.MODE}
          </div>
        </div>
      </div>
    </div>
  );
} 