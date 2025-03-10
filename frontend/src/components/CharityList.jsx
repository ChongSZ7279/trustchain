import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function CharityList() {
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/charities');
      setCharities(response.data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(response.data.map(charity => charity.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching charities:', err);
      setError(
        err.response?.data?.message || 
        'Failed to fetch charities. Please try again later.'
      );
      setCharities([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCharities = charities.filter(charity => {
    const matchesSearch = charity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         charity.organization.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || charity.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const canManageCharity = (charity) => {
    return organization?.id === charity.organization_id || 
           charity.organization.representative_id === user?.ic_number;
  };

  const calculateProgress = (charity) => {
    return (charity.fund_received / charity.fund_targeted) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-800">{error}</h3>
          <button
            onClick={fetchCharities}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header with Create Button */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Charities</h1>
          {(organization || user) && (
            <button
              onClick={() => navigate('/charities/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create Charity
            </button>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search Charities
              </label>
              <input
                type="text"
                name="search"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search by description or organization"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Filter by Category
              </label>
              <select
                id="category"
                name="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Charities Grid */}
        {filteredCharities.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No charities found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm || selectedCategory 
                ? 'Try adjusting your search or filter criteria'
                : 'Charities will appear here once they are created'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCharities.map(charity => (
              <div
                key={charity.id}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <img
                        className="h-12 w-12 rounded-lg object-cover"
                        src={charity.picture_path ? `/storage/${charity.picture_path}` : 'https://via.placeholder.com/48?text=Charity'}
                        alt={`${charity.organization.name} charity`}
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {charity.organization.name}
                      </h3>
                      <p className="text-sm text-gray-500">{charity.category}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 line-clamp-3">
                      {charity.description}
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                            Progress
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-indigo-600">
                            {calculateProgress(charity).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                        <div
                          style={{ width: `${calculateProgress(charity)}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Received: ${charity.fund_received} / ${charity.fund_targeted}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => navigate(`/charities/${charity.id}`)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                    >
                      View Details
                    </button>
                    {canManageCharity(charity) && (
                      <button
                        onClick={() => navigate(`/charities/${charity.id}/edit`)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
                {!charity.is_verified && (
                  <div className="bg-yellow-50 px-4 py-2">
                    <p className="text-sm text-yellow-700">
                      Verification Pending
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 