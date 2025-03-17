import { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { formatImageUrl } from '../utils/helpers';
import SidebarFilters from './SidebarFilters';
import { 
  FaHandHoldingHeart,
  FaPlus,
  FaMoneyBillWave,
  FaTag,
  FaCalendarAlt,
  FaChartBar,
  FaExternalLinkAlt,
  FaEdit,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHeart,
  FaUsers
} from 'react-icons/fa';

export default function CharityList() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { organization } = useAuth();
  const navigate = useNavigate();
  const { isSidebarOpen, showSidebar, location } = useOutletContext();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [fundRange, setFundRange] = useState({ min: 0, max: 100000 });
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  // Available filter options
  const categoryOptions = [
    'Education',
    'Healthcare',
    'Environment',
    'Youth Development',
    'Disaster Relief',
    'Other'
  ];
  
  const statusOptions = [
    { value: 'verified', label: 'Verified' },
    { value: 'pending', label: 'Pending' }
  ];

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/charities');
      setCharities(response.data);
    } catch (err) {
      setError('Failed to fetch charities');
      console.error('Error fetching charities:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleStatus = (status) => {
    setSelectedStatuses(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleFundRangeChange = (e, type) => {
    const value = parseInt(e.target.value, 10) || 0;
    setFundRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setFundRange({ min: 0, max: 100000 });
    setSelectedStatuses([]);
  };

  const applyFilters = () => {
    console.log('Applied filters:', {
      search: searchTerm,
      categories: selectedCategories,
      fundRange,
      statuses: selectedStatuses
    });
  };

  // Filter charities based on all criteria
  const filteredCharities = charities.filter(charity => {
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      charity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charity.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(charity.category);
    
    // Fund range filter
    const targetFund = charity.fund_targeted || 0;
    const matchesFundRange = targetFund >= fundRange.min && targetFund <= fundRange.max;
    
    // Status filter
    const isVerified = charity.is_verified;
    const matchesStatus = selectedStatuses.length === 0 || 
      (selectedStatuses.includes('verified') && isVerified) ||
      (selectedStatuses.includes('pending') && !isVerified);
    
    return matchesSearch && matchesCategory && matchesFundRange && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
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

  // Render filters in sidebar
  if (location === 'sidebar') {
    return (
      <SidebarFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
        fundRange={fundRange}
        handleFundRangeChange={handleFundRangeChange}
        selectedStatuses={selectedStatuses}
        toggleStatus={toggleStatus}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        categoryOptions={categoryOptions}
        statusOptions={statusOptions}
      />
    );
  }

  // Render main content
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaHandHoldingHeart className="mr-3" />
              Charities
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Support charitable causes and make a difference in the community
            </p>
          </div>
          {organization && (
            <Link
              to="/charities/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FaPlus className="mr-2" />
              Create Charity
            </Link>
          )}
        </div>

        {/* Charities Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCharities.length === 0 ? (
            <div className="col-span-full bg-white shadow-sm rounded-lg">
              <div className="text-center py-12">
                <FaHandHoldingHeart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No charities found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || selectedCategories.length > 0 || selectedStatuses.length > 0
                    ? 'Try adjusting your search or filter criteria'
                    : 'Charities will appear here once they are created'}
                </p>
              </div>
            </div>
          ) : (
            filteredCharities.map((charity) => (
              <div
                key={charity.id}
                className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow"
              >
                {charity.picture_path && (
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={formatImageUrl(charity.picture_path)}
                      alt={charity.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {charity.name}
                      </h3>
                      <div className="mt-1 flex items-center">
                        <FaTag className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500">{charity.category}</span>
                      </div>
                    </div>
                    {charity.is_verified ? (
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

                  <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                    {charity.description}
                  </p>

                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <FaMoneyBillWave className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 font-medium">
                          ${charity.fund_received} / ${charity.fund_targeted}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-gray-500">
                        {Math.min(100, (charity.fund_received / charity.fund_targeted) * 100)}% Complete
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (charity.fund_received / charity.fund_targeted) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <FaChartBar className="mr-1.5" />
                    <span>{charity.tasks?.length || 0} Tasks</span>
                    <span className="mx-2">•</span>
                    <FaCalendarAlt className="mr-1.5" />
                    <span>{new Date(charity.created_at).toLocaleDateString()}</span>
                    {charity.follower_count !== undefined && (
                      <>
                        <span className="mx-2">•</span>
                        <FaUsers className="mr-1.5" />
                        <span>{charity.follower_count} {charity.follower_count === 1 ? 'Follower' : 'Followers'}</span>
                      </>
                    )}
                    {charity.is_following && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                        <FaHeart className="mr-1 text-red-500" />
                        Following
                      </span>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <Link
                      to={`/charities/${charity.id}`}
                      className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900"
                    >
                      <FaExternalLinkAlt className="mr-2" />
                      View Details
                    </Link>
                    {organization?.id === charity.organization_id && (
                      <Link
                        to={`/charities/${charity.id}/edit`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                      >
                        <FaEdit className="mr-2" />
                        Edit
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}