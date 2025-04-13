/**
 * Recursively converts BigInt values to strings in an object
 * @param {Object} obj - The object to sanitize
 * @returns {Object} - A new object with BigInt values converted to strings
 */
export const sanitizeBigInt = (obj) => {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (typeof obj === 'bigint') {
      return obj.toString();
    }
    
    if (typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeBigInt(item));
    }
    
    const result = {};
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        
        if (typeof value === 'bigint') {
          result[key] = value.toString();
        } else if (typeof value === 'object' && value !== null) {
          result[key] = sanitizeBigInt(value);
        } else {
          result[key] = value;
        }
      }
    }
    
    return result;
  };

/**
 * Custom JSON replacer function to handle BigInt values
 * @param {string} key - The JSON key
 * @param {any} value - The value to serialize
 * @returns {any} - The serialized value
 */
export const bigIntSerializer = (key, value) => 
  typeof value === 'bigint' ? value.toString() : value;

/**
 * Safe JSON stringify function that handles BigInt values
 * @param {Object} obj - The object to stringify
 * @returns {string} - JSON string
 */
export const safeStringify = (obj) => {
  return JSON.stringify(obj, bigIntSerializer);
};