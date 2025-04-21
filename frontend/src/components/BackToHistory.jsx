import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaArrowLeft, FaChevronRight, FaHome, FaHistory } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function BackToHistory({
  fallbackPath = '/',
  className = '',
  showBreadcrumb = true,
  customText = 'Back',
  currentPageText = '',
  variant = 'default',
  onBackClick = null,
  showTooltipHistory = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showTooltip, setShowTooltip] = useState(false);
  const [recentHistory, setRecentHistory] = useState([]);

  useEffect(() => {
    if (showTooltipHistory && typeof window !== 'undefined') {
      const current = location.pathname;
      setRecentHistory((prev) => {
        const newHistory = [...prev];
        if (!newHistory.includes(current) && current !== '/') {
          newHistory.unshift(current);
        }
        return newHistory.slice(0, 5); // Increased from 3 to 5 entries
      });
    }
  }, [location.pathname, showTooltipHistory]);

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
      return;
    }
    window.history.length > 2 ? navigate(-1) : navigate(fallbackPath);
  };

  const formatPathName = (path) =>
    path.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const generateBreadcrumb = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return null;

    return (
      <nav aria-label="Breadcrumb" className="ml-4 text-sm overflow-x-auto whitespace-nowrap">
        <ol className="flex items-center space-x-1">
          <li className="flex items-center">
            <Link
              to="/"
              className="text-indigo-600 hover:text-indigo-800 transition flex items-center group"
              aria-label="Home"
            >
              <FaHome className="text-indigo-500 group-hover:text-indigo-700" />
              <span className="ml-1 hidden sm:inline">Home</span>
            </Link>
          </li>

          {paths.map((path, index) => (
            <li key={index} className="flex items-center">
              <FaChevronRight className="mx-1 text-gray-300 flex-shrink-0" />
              {index < paths.length - 1 ? (
                <Link
                  to={`/${paths.slice(0, index + 1).join('/')}`}
                  className="text-gray-600 hover:text-indigo-600 whitespace-nowrap transition px-1 py-0.5 rounded hover:bg-indigo-50"
                >
                  {formatPathName(path)}
                </Link>
              ) : (
                <span className="text-gray-800 font-semibold whitespace-nowrap px-1">
                  {currentPageText || formatPathName(path)}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  const tooltipContent = () => {
    if (!showTooltipHistory || recentHistory.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute left-0 top-full mt-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-indigo-100 p-3 z-10 w-72"
      >
        <h6 className="text-xs font-semibold text-indigo-600 mb-2 px-2 flex items-center">
          <FaHistory className="mr-1.5" size={12} />
          Recent Pages
        </h6>
        <ul className="space-y-1 max-h-64 overflow-y-auto">
          {recentHistory.map((path, idx) => (
            <li key={idx}>
              <Link
                to={path}
                className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-indigo-50 rounded-lg transition flex items-center"
              >
                <span className="w-6 h-6 bg-indigo-100 rounded-full text-indigo-600 flex items-center justify-center mr-2 text-xs">
                  {idx + 1}
                </span>
                <span className="truncate">
                  {formatPathName(path.split('/').filter(Boolean).pop() || 'Home')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </motion.div>
    );
  };

  const getButtonStyles = () => {
    const base = "flex items-center gap-2 rounded-full font-medium transition-all duration-200";
    switch (variant) {
      case 'minimal':
        return `${base} px-3 py-1.5 text-gray-500 hover:text-indigo-600`;
      case 'prominent':
        return `${base} px-5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg`;
      case 'trustchain': // New variant matching your app design
        return `${base} px-4 py-2 bg-white border border-gray-200 text-indigo-600 hover:bg-indigo-50 shadow-sm`;
      default:
        return `${base} px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 shadow-sm`;
    }
  };

  return (
    <div className={`flex flex-wrap md:flex-nowrap items-center gap-2 ${className}`}>
      <div className="relative">
        <motion.button
          onClick={handleBack}
          onMouseEnter={() => showTooltipHistory && setShowTooltip(true)}
          onMouseLeave={() => showTooltipHistory && setShowTooltip(false)}
          onFocus={() => showTooltipHistory && setShowTooltip(true)}
          onBlur={() => showTooltipHistory && setShowTooltip(false)}
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ x: variant !== 'prominent' ? -2 : 0, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className={getButtonStyles()}
          aria-label={`Go back: ${customText}`}
        >
          <FaArrowLeft className={`${variant === 'prominent' ? 'text-white' : 'text-indigo-500'}`} />
          <span>{customText}</span>
        </motion.button>
        <AnimatePresence>
          {showTooltip && tooltipContent()}
        </AnimatePresence>
      </div>

      {showBreadcrumb && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="w-full md:w-auto overflow-x-auto hide-scrollbar"
        >
          {generateBreadcrumb()}
        </motion.div>
      )}
    </div>
  );
}
