import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function BackToHistory({ 
  fallbackPath = '/', 
  className = '',
  showBreadcrumb = true,
  customText = 'Back',
  currentPageText = ''
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  // Generate Breadcrumb Navigation
  const generateBreadcrumb = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return null;

    return (
      <div className="flex items-center text-sm text-gray-500 ml-4">
        {paths.map((path, index) => (
          <span key={index} className="flex items-center">
            <FaChevronRight className="h-3 w-3 mx-2 text-gray-400" />
            <span className="text-gray-700 font-medium capitalize">
              {currentPageText && index === paths.length - 1 
                ? currentPageText 
                : path.replace(/-/g, ' ')}
            </span>
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <motion.button
        onClick={handleBack}
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        whileHover={{ x: -5 }}
        transition={{ duration: 0.2 }}
        className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-indigo-600 transition-all duration-200 "
      >
        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="font-medium">{customText}</span>
      </motion.button>
      
      {showBreadcrumb && generateBreadcrumb()}
    </div>
  );
}

