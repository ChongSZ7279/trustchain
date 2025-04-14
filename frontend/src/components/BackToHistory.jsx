import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaArrowLeft, FaChevronRight, FaHome } from 'react-icons/fa';
import { motion } from 'framer-motion';

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
        return newHistory.slice(0, 3);
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
      <nav aria-label="Breadcrumb" className="ml-4 text-sm overflow-x-auto">
        <ol className="flex items-center space-x-2">
          <li className="flex items-center">
            <Link
              to="/"
              className="text-gray-500 hover:text-indigo-600 transition flex items-center"
              aria-label="Home"
            >
              <FaHome className="text-gray-400" />
              <span className="ml-1">Home</span>
            </Link>
          </li>

          {paths.map((path, index) => (
            <li key={index} className="flex items-center">
              <FaChevronRight className="mx-2 text-gray-300" />
              {index < paths.length - 1 ? (
                <Link
                  to={`/${paths.slice(0, index + 1).join('/')}`}
                  className="text-gray-600 hover:text-indigo-600 whitespace-nowrap transition"
                >
                  {formatPathName(path)}
                </Link>
              ) : (
                <span className="text-gray-800 font-semibold whitespace-nowrap">
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
      <div className="absolute left-0 top-full mt-2 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 p-3 z-10 w-72">
        <h6 className="text-xs font-semibold text-gray-500 mb-2 px-2">Recent Pages</h6>
        <ul className="space-y-1">
          {recentHistory.map((path, idx) => (
            <li key={idx}>
              <Link
                to={path}
                className="block px-2 py-1 text-sm text-gray-700 hover:bg-indigo-50 rounded transition"
              >
                {formatPathName(path.split('/').filter(Boolean).pop() || 'Home')}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const getButtonStyles = () => {
    const base = "flex items-center gap-2 rounded-full font-medium transition-all duration-200";
    switch (variant) {
      case 'minimal':
        return `${base} px-3 py-1 text-gray-500 hover:text-indigo-600`;
      case 'prominent':
        return `${base} px-5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg`;
      default:
        return `${base} px-5 py-2 bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-indigo-600 shadow`;
    }
  };

  return (
    <div className={`flex flex-wrap md:flex-nowrap items-center gap-3 mb-3 ${className}`}>
      <div className="relative">
        <motion.button
          onClick={handleBack}
          onMouseEnter={() => showTooltipHistory && setShowTooltip(true)}
          onMouseLeave={() => showTooltipHistory && setShowTooltip(false)}
          onFocus={() => showTooltipHistory && setShowTooltip(true)}
          onBlur={() => showTooltipHistory && setShowTooltip(false)}
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ x: variant !== 'prominent' ? -4 : 0 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className={getButtonStyles()}
          aria-label={`Go back: ${customText}`}
        >
          <FaArrowLeft className="text-base" />
          <span>{customText}</span>
        </motion.button>
        {showTooltip && tooltipContent()}
      </div>

      {showBreadcrumb && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="w-full md:w-auto"
        >
          {generateBreadcrumb()}
        </motion.div>
      )}
    </div>
  );
}
