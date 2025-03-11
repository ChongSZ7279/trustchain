import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils/helpers';
import { 
  FaBuilding, 
  FaSearch, 
  FaFilter,
  FaEdit,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt
} from 'react-icons/fa';

export default function OrganizationList() {
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/organizations');
      setOrganizations(response.data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(response.data.map(org => org.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError(
        err.response?.data?.message || 
        'Failed to fetch organizations. Please try again later.'
      );
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || org.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const canEditOrganization = (org) => {
    return organization?.id === org.id || org.representative_id === user?.ic_number;
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
            onClick={fetchOrganizations}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaBuilding className="mr-3" />
            Organizations
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse and discover organizations making a difference in the community
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaSearch className="mr-2" />
                Search Organizations
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full rounded-md border-gray-300 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Search by name or description"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaFilter className="mr-2" />
                Filter by Category
              </label>
              <select
                id="category"
                name="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Organizations Grid */}
        {filteredOrganizations.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg">
            <div className="text-center py-12">
              <FaBuilding className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No organizations found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedCategory 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Organizations will appear here once they are registered'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOrganizations.map(org => (
              <div
                key={org.id}
                className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-16 w-16 rounded-lg object-cover bg-gray-100"
                        src={formatImageUrl(org.logo)}
                        alt={org.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/64?text=Logo';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {org.name}
                        </h3>
                        {org.is_verified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FaCheckCircle className="mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <FaExclamationTriangle className="mr-1" />
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{org.category}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {org.description}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    {org.phone_number && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <FaPhone className="mr-2 text-gray-400" />
                        {org.phone_number}
                      </p>
                    )}
                    {org.gmail && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <FaEnvelope className="mr-2 text-gray-400" />
                        {org.gmail}
                      </p>
                    )}
                    {org.register_address && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-gray-400" />
                        {org.register_address}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <Link
                      to={`/organizations/${org.id}`}
                      className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900"
                    >
                      <FaExternalLinkAlt className="mr-2" />
                      View Details
                    </Link>
                    {canEditOrganization(org) && (
                      <button
                        onClick={() => navigate(`/organizations/${org.id}/edit`)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                      >
                        <FaEdit className="mr-2" />
                        Edit
                      </button>
                    )}
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