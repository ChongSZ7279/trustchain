import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { formatImageUrl } from '../utils/helpers';

export default function CharityList() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const { organization } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const response = await axios.get('/api/charities');
        setCharities(response.data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(response.data.map(charity => charity.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        setError('Failed to fetch charities');
        console.error('Error fetching charities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCharities();
  }, []);

  // Filter charities based on search term and category
  const filteredCharities = charities.filter(charity => {
    const matchesSearch = charity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         charity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || charity.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Charities</h1>
          {organization && (
            <Link
              to="/charities/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Add Charity
            </Link>
          )}
        </div>

        {error && (
          <div className="mb-4 text-red-600">
            {error}
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white shadow rounded-lg mb-6 p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                placeholder="Search by name or description"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

        {/* No Charities Message */}
        {filteredCharities.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No charities found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory 
                ? 'Try adjusting your search or filter criteria'
                : 'There are no charities available at the moment'}
            </p>
            {organization && (
              <Link
                to="/charities/create"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Create the First Charity
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCharities.map((charity) => (
              <div
                key={charity.id}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                {charity.picture_path && (
                  <img
                    src={formatImageUrl(charity.picture_path)}
                    alt={charity.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {charity.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {charity.category}
                  </p>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                    {charity.description}
                  </p>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-900">
                      Target: ${charity.fund_targeted}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/charities/${charity.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}