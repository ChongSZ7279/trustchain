/**
 * Format an image URL from the backend to be properly displayed in the frontend
 * @param {string} path - The image path from the backend
 * @returns {string} The formatted URL
 */
export const formatImageUrl = (path) => {
  if (!path) return '';
  
  // If the path already starts with http, return it as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // Otherwise, prepend the backend URL
  return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${path}`;
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