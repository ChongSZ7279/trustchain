/**
 * Format an image URL from the backend to be properly displayed in the frontend
 * @param {string} path - The image path from the backend
 * @returns {string} The formatted URL
 */
export const formatImageUrl = (path) => {
  if (!path) return null;
    
    // Check if the path already includes the base URL
    if (path.startsWith('http')) {
      return path;
    }
    
    // Otherwise, construct the full URL - using import.meta.env for Vite
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/storage/${path}`;
};

/**
 * Determine the file type based on the file extension
 * @param {string} path - The file path
 * @returns {string} The file type ('image', 'pdf', 'document', or 'unknown')
 */
export const getFileType = (path) => {
  if (!path) return 'unknown';
  const extension = path.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
  if (['pdf'].includes(extension)) return 'pdf';
  if (['doc', 'docx'].includes(extension)) return 'document';
  return 'unknown';
};

// Enhanced image URL formatter with fallback
export const formatImageUrlWithFallback = (url) => {
  if (!url) return '/fallback-image.png';
  
  // If it's already a full URL, return it
  if (url.startsWith('http')) return url;
  
  // If it's a relative path, prepend the API base URL
  const baseUrl = process.env.REACT_APP_API_URL || '';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Global image error handler
export const setupGlobalImageErrorHandler = () => {
  window.addEventListener('error', (e) => {
    // Only handle image loading errors
    if (e.target.tagName === 'IMG') {
      console.log('Image failed to load:', e.target.src);
      e.target.src = '/fallback-image.png';
      e.preventDefault(); // Prevent the error from bubbling up
    }
  }, true);
}; 