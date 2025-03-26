import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const maxVisiblePages = 5;

  let visiblePages = pages;
  if (totalPages > maxVisiblePages) {
    const start = Math.max(0, Math.min(currentPage - 3, totalPages - maxVisiblePages));
    visiblePages = pages.slice(start, start + maxVisiblePages);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center space-x-2 mt-8"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <FaChevronLeft className="h-4 w-4" />
      </button>

      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
            currentPage === page
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <FaChevronRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
} 