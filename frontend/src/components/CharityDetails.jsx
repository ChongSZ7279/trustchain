import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl, getFileType } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import DonationForm from './DonationForm';
import BackButton from './BackToHistory';
import { 
  FaChartBar, 
  FaTasks, 
  FaHandHoldingHeart,
  FaExchangeAlt,
  FaFileAlt,
  FaEdit,
  FaTrash,
  FaImages,
  FaPlus,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaClock,
  FaTag,
  FaBullseye,
  FaHeart,
  FaUsers,
  FaExternalLinkAlt,
  FaChevronDown,
  FaShare,
  FaCalendarAlt,
  FaInfoCircle,
  FaCommentAlt,
  FaMapMarkerAlt,
  FaGlobe,
  FaFacebook,
  FaInstagram,
  FaLink,
  FaWallet,
  FaThumbsUp,
  FaBookmark,
  FaFileContract,
  FaFilePdf,
  FaFileWord,
  FaEye
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// Add this helper function at the top of the file, after imports
const getFileIcon = (fileType) => {
  if (fileType?.includes('pdf')) return <FaFilePdf className="text-red-500 text-xl" />;
  if (fileType?.includes('word') || fileType?.includes('doc')) return <FaFileWord className="text-blue-500 text-xl" />;
  if (fileType?.includes('image')) return <FaImages className="text-green-500 text-xl" />;
  return <FaFileAlt className="text-gray-500 text-xl" />;
};

export default function CharityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, accountType } = useAuth();
  const [charity, setCharity] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [donations, setDonations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('milestones');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [taskDeleteLoading, setTaskDeleteLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  // Add new loading states
  const [imageLoading, setImageLoading] = useState({
    cover: true
  });

  // Add new state for document preview
  const [documentPreview, setDocumentPreview] = useState({
    type: null,
    url: null,
    name: null
  });

  // Add the local formatImageUrl function
  const formatImageUrl = (path) => {
    if (!path) return null;
    
    // If it's already a full URL
    if (path.startsWith('http')) return path;
    
    // For storage paths like "organization_covers/filename.jpg"
    if (path.includes('organization_covers/') || 
        path.includes('organization_logos/') || 
        path.includes('charity_pictures/') ||
        path.includes('task_pictures/') ||
        path.includes('task_proofs/') ||
        path.includes('charity_documents/')) {
      return `/storage/${path}`;
    }
    
    // If path starts with a slash, it's already a relative path
    if (path.startsWith('/')) return path;
    
    // Otherwise, add a slash to make it a relative path from the root
    return `/${path}`;
  };

  useEffect(() => {
    fetchCharityData();
    // Reset scroll position when viewing a new charity
    window.scrollTo(0, 0);
  }, [id]);

  const fetchCharityData = async () => {
    try {
      setLoading(true);
      
      // First fetch the charity and tasks data
      try {
        const charityResponse = await axios.get(`/charities/${id}`);
        setCharity(charityResponse.data);
        
        // Set follower status only if user is logged in
        if (currentUser) {
          if (charityResponse.data.is_following !== undefined) {
            setIsFollowing(charityResponse.data.is_following);
          }
          if (charityResponse.data.follower_count !== undefined) {
            setFollowerCount(charityResponse.data.follower_count);
          }
        }
      } catch (err) {
        console.error('Error fetching charity:', err);
        setError('Failed to fetch charity details');
        setLoading(false);
        return;
      }
      
      try {
        const tasksResponse = await axios.get(`/charities/${id}/tasks`);
        // Transform tasks to include task pictures
        const tasksWithPictures = tasksResponse.data.map(task => ({
          ...task,
          pictures: task.pictures || [] // Use pictures instead of task_pictures
        }));
        setTasks(tasksWithPictures);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setTasks([]);
      }
      
      // Fetch donations and transactions only if user is authorized
      if (currentUser && (accountType === 'admin' || currentUser.ic_number === charity?.representative_id)) {
        try {
          const donationsRes = await axios.get(`/charity/${id}/donations`);
          setDonations(donationsRes.data);
        } catch (err) {
          console.error('Error fetching donations:', err);
          setDonations([]);
        }
      }

      if (currentUser && (accountType === 'admin' || currentUser.ic_number === charity?.representative_id)) {
        try {
          const transactionsRes = await axios.get(`/charities/${id}/transactions`);
          setTransactions(transactionsRes.data);
        } catch (err) {
          console.error('Error fetching transactions:', err);
          setTransactions([]);
        }
      }
      
      // Get follow status only if user is logged in
      if (currentUser) {
        try {
          const followStatusRes = await axios.get(`/charities/${id}/follow-status`);
          setIsFollowing(followStatusRes.data.is_following);
          setFollowerCount(followStatusRes.data.follower_count);
        } catch (err) {
          console.error('Error fetching follow status:', err);
        }
      }
    } catch (err) {
      console.error('Error fetching charity details:', err);
      setError('Failed to fetch charity details');
    } finally {
      setLoading(false);
    }
  };

  const canManageCharity = () => {
    const canEdit = currentUser && currentUser.id === charity?.organization_id;
    return canEdit;
  };

  const calculateProgress = () => {
    if (!charity?.fund_targeted) return 0;
    return Math.min(100, (charity.fund_received / charity.fund_targeted) * 100);
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      setTaskDeleteLoading(true);
      await axios.delete(`/tasks/${taskId}`);
      // Remove the deleted task from the tasks array
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setTaskDeleteLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setFollowLoading(true);
      const response = await axios.post(`/charities/${id}/follow`);
      setIsFollowing(response.data.is_following);
      setFollowerCount(response.data.follower_count);
      toast.success(isFollowing ? 'Unfollowed successfully' : 'Following this charity');
    } catch (error) {
      console.error('Error toggling follow status:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: charity?.name,
        text: `Check out ${charity?.name} on our platform!`,
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback - copy URL to clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          toast.success('URL copied to clipboard!');
          setShowShareTooltip(true);
        })
        .catch(err => console.error('Error copying to clipboard:', err));
    }
  };

  const handleQuickDonate = (amount) => {
    setDonationAmount(amount);
    setShowDonationModal(true);
  };

  const submitDonation = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Validate the donation amount
    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }
    
    // Close the modal and navigate to the donation page
    setShowDonationModal(false);
    navigate(`/charities/${id}/donate?amount=${amount}`);
  };

  const formatCurrency = (amount) => {
    return typeof amount === 'number' ? amount.toLocaleString() : '0';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTimeRemaining = () => {
    if (!charity?.end_date) return null;
    
    const endDate = new Date(charity.end_date);
    const now = new Date();
    const timeRemaining = endDate - now;
    
    if (timeRemaining <= 0) return 'Ended';
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    return `${days} days left`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !charity) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-gray-50"
      >
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md mx-4">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">{error || 'Charity not found'}</h3>
          <p className="text-gray-600 mb-6">We couldn't find the charity you're looking for. Please try again later.</p>
          <button
            onClick={() => navigate('/charities')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" />
            Back to Charities
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      <BackButton />

      {/* Charity Profile Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Charity Image */}
              <div className="relative flex-shrink-0">
                <div className={`h-24 w-24 md:h-28 md:w-28 border-2 border-blue-100 rounded-lg overflow-hidden transition-opacity duration-300 ${imageLoading.cover ? 'animate-pulse bg-gray-200' : ''}`}>
                  {charity?.picture_path ? (
                    <img
                      src={formatImageUrl(charity.picture_path)}
                      alt={charity?.name}
                      className="h-full w-full object-cover"
                      onLoad={() => setImageLoading(prev => ({ ...prev, cover: false }))}
                      onError={(e) => {
                        console.error('Error loading charity image:', e);
                        e.target.src = 'https://via.placeholder.com/128';
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-200">
                      <FaImages className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Charity Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-800">
                    {charity?.category || 'CATEGORY'}
                  </span>
                  {charity?.is_verified ? (
                    <span className="px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                      <FaCheckCircle className="inline-block mr-1" />
                      VERIFIED
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                      <FaExclamationTriangle className="inline-block mr-1" />
                      PENDING
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-1">{charity?.name.toUpperCase()}</h1>

                {/* Document Preview */}
                {charity?.verified_document && (
                  <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(getFileType(charity.verified_document))}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">
                            {charity.verified_document.split('/').pop()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getFileType(charity.verified_document)}
                          </p>
                        </div>
                      </div>
                      <a 
                        href={formatImageUrl(charity.verified_document)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                      >
                        <FaEye className="mr-1" />
                        View
                      </a>
                    </div>
                  </div>
                )}

                {/* Fund Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-500">
                      {calculateProgress()}% Complete
                    </span>
                    <span className="font-medium text-gray-900">
                      ${formatCurrency(charity.fund_received)} / ${formatCurrency(charity.fund_targeted)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4 md:mt-0">
                {currentUser && (
                  <>
                    <button
                      onClick={toggleFollow}
                      disabled={followLoading}
                      className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                        isFollowing
                          ? 'bg-gray-100 text-indigo-600 hover:bg-gray-200 border border-indigo-600'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      <FaThumbsUp className={`inline-block mr-2 ${followLoading ? 'opacity-50' : ''}`} />
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>

                    {/* Donate button - only visible to logged-in users */}
                    <button
                      onClick={() => setShowDonationModal(true)}
                      className="px-4 py-2 rounded-md font-medium text-sm bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
                    >
                      <FaHandHoldingHeart className="inline-block mr-2" />
                      Donate
                    </button>

                    <div className="relative">
                      <button
                        onClick={handleShare}
                        className="px-4 py-2 rounded-md font-medium text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                      >
                        <FaShare className="inline-block mr-2" />
                        Share
                      </button>
                      {showShareTooltip && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 text-white text-xs py-1 px-2 rounded z-10">
                          Link copied to clipboard!
                        </div>
                      )}
                    </div>
                  </>
                )}

                {canManageCharity() && (
                  <Link
                    to={`/charities/${id}/edit`}
                    className="px-4 py-2 rounded-md font-medium text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 text-center"
                  >
                    <FaEdit className="inline-block mr-2" />
                    Edit
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between border-b border-gray-200">
            <button
              onClick={() => setActiveTab('milestones')}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'milestones'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Milestones
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'about'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              About
            </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <AnimatePresence mode="wait">
        {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden mt-4"
            >
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Charity Details</h3>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500 block">Category</span>
                        <span className="text-gray-900">{charity.category || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 block">Created On</span>
                        <span className="text-gray-900">{formatDate(charity.created_at)}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 block">End Date</span>
                        <span className="text-gray-900">
                          {charity.end_date ? formatDate(charity.end_date) : 'Ongoing'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 block">Status</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          charity.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : charity.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {charity.status === 'active' && <FaCheckCircle className="mr-1" />}
                          {charity.status === 'completed' && <FaCheckCircle className="mr-1" />}
                          {charity.status?.charAt(0).toUpperCase() + charity.status?.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Organization</h3>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500 block">Organization Name</span>
                        <Link to={`/organizations/${charity.organization_id}`} className="text-indigo-600 hover:text-indigo-800">
                          {charity.organization_name || 'Unknown Organization'}
                        </Link>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 block">Representative</span>
                        <span className="text-gray-900">{charity.representative_name || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 block">Contact Email</span>
                        <span className="text-gray-900">{charity.contact_email || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'milestones' && (
            <motion.div
              key="milestones"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4"
            >
              {tasks.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-indigo-200"></div>
                  
                  <div className="space-y-12">
                    {[...tasks].reverse().map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        className={`relative flex items-center ${
                          index % 2 === 0 ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        {/* Timeline dot */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white shadow-lg"></div>
                        
                        {/* Content box */}
                        <div className={`w-5/12 bg-white rounded-xl shadow-sm overflow-hidden ${
                          index % 2 === 0 ? 'mr-auto' : 'ml-auto'
                        }`}>
                          <div className="p-6">
                            {/* Status Badge */}
                            <div className="flex justify-end mb-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                task.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : task.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {task.status === 'completed' && <FaCheckCircle className="mr-1" />}
                                {task.status === 'in_progress' && <FaClock className="mr-1" />}
                                {task.status?.charAt(0).toUpperCase() + task.status?.slice(1).replace('_', ' ')}
                              </span>
                            </div>

                            {/* Task Title and Date */}
                            <div className="mb-4 flex justify-between items-start">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900">{task.name}</h3>
                                <p className="text-sm text-gray-500 mt-1 flex items-center">
                                  <FaCalendarAlt className="mr-1" />
                                  {formatDate(task.created_at)}
                                </p>
                              </div>
                              {canManageCharity() && (
                                <div className="flex gap-2">
                                  <Link
                                    to={`/charities/${id}/tasks/${task.id}/edit`}
                                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors duration-200"
                                  >
                                    <FaEdit className="mr-1" />
                                    Edit
                                  </Link>
                                  <button
                                    onClick={() => deleteTask(task.id)}
                                    disabled={taskDeleteLoading}
                                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors duration-200"
                                  >
                                    <FaTrash className="mr-1" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            {/* Task Description */}
                            <p className="text-gray-600 mb-6">{task.description}</p>
                            
                            {/* Task Pictures */}
                            {task.pictures && task.pictures.length > 0 && (
                              <div className="mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {task.pictures.map((picture, picIndex) => (
                                    <div key={picIndex} className="relative h-64 rounded-lg overflow-hidden shadow-md">
                                      <img
                                        src={formatImageUrl(picture.path)}
                                        alt={`${task.name} - Image ${picIndex + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          console.error('Error loading task picture:', e);
                                          e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                                        }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Funding Progress */}
                            {task.fund_targeted > 0 && (
                              <div className="mt-4">
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-gray-500">Funding Progress</span>
                                  <span className="font-medium text-blue-600">
                                    ${formatCurrency(task.current_amount)} / ${formatCurrency(task.fund_targeted)}
                                  </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                    style={{
                                      width: `${Math.min(
                                        (task.current_amount / task.fund_targeted) * 100,
                                        100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <FaInfoCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Milestones Found</h3>
                  <p className="text-gray-600">This charity hasn't added any milestones yet.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden mt-4"
            >
              <div className="p-6">
                {transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transaction ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map(transaction => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(transaction.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                              {transaction.transaction_hash?.slice(0, 8) || transaction.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                transaction.type === 'donation' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {transaction.type === 'donation' ? (
                                  <FaHandHoldingHeart className="mr-1" />
                                ) : (
                                  <FaExchangeAlt className="mr-1" />
                                )}
                                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ${formatCurrency(transaction.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                transaction.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : transaction.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {transaction.status === 'completed' && <FaCheckCircle className="mr-1" />}
                                {transaction.status === 'pending' && <FaClock className="mr-1" />}
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
                    <p className="text-gray-600">This charity hasn't received any donations yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Donation Modal */}
      {showDonationModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
          >
            <DonationForm charity={charity} />
          </motion.div>
        </motion.div>
      )}

      {/* Admin Actions */}
      {canManageCharity() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-6 right-6"
        >
          <div className="flex flex-col space-y-3">
            <Link
              to={`/charities/${id}/edit`}
              className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
              title="Edit Charity"
            >
              <FaEdit className="h-6 w-6" />
            </Link>
            <Link
              to={`/charities/${id}/tasks/create`}
              className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
              title="Add Milestone"
            >
              <FaPlus className="h-6 w-6" />
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}