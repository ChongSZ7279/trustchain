/**
 * Format an image URL to properly access files from Laravel's storage
 * @param {string} path - The image path from the database
 * @returns {string} The formatted URL
 */
export const formatImageUrl = (path) => {
  if (!path) return null;
  
  // If the path already starts with http or https, return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If the path already includes /storage, return it as is
  if (path.startsWith('/storage/')) {
    return path;
  }
  
  // For paths stored in the database like 'profile_pictures/image.png'
  // We need to prepend /storage/ to access them through Laravel's storage URL
  return `/storage/${path}`;
}; 