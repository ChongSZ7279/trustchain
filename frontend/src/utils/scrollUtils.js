/**
 * Utility functions for Scroll-related operations
 */

/**
 * Fetches current conversion rates for Scroll tokens
 * Falls back to default values if the API request fails
 * 
 * @param {string} currency - The currency to convert to (default: USD)
 * @return {Promise<Object>} - The conversion rate data
 */
export const fetchScrollConversionRate = async (currency = 'USD') => {
  try {
    // Determine if we're in development or production
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.trustchain.com' 
      : '';
      
    const response = await fetch(`${baseUrl}/api/scroll-conversion-rates?currency=${currency}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Scroll conversion rates:', error);
    
    // Return fallback data
    return {
      success: true,
      currency: currency.toUpperCase(),
      rate: currency.toUpperCase() === 'USD' ? 2000 : 1,
      timestamp: new Date().toISOString(),
      rates: {
        USD: 2000,
        ETH: 1,
        MYR: 4.2,
        EUR: 0.92,
        GBP: 0.78,
        JPY: 150,
        AUD: 1.52
      },
      isFallback: true
    };
  }
};

/**
 * Formats a Scroll amount with the appropriate currency symbol
 * 
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (USD, ETH, etc.)
 * @param {boolean} showCurrencyCode - Whether to show the currency code
 * @return {string} - Formatted amount with currency symbol
 */
export const formatScrollAmount = (amount, currency = 'USD', showCurrencyCode = true) => {
  if (typeof amount !== 'number') {
    return 'Invalid amount';
  }
  
  let symbol = '';
  let formattedAmount = '';
  
  switch (currency.toUpperCase()) {
    case 'USD':
      symbol = '$';
      formattedAmount = amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      break;
    case 'ETH':
      symbol = 'Ξ';
      formattedAmount = amount.toLocaleString('en-US', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 8
      });
      break;
    case 'MYR':
      symbol = 'RM';
      formattedAmount = amount.toLocaleString('ms-MY', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      break;
    case 'EUR':
      symbol = '€';
      formattedAmount = amount.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      break;
    case 'GBP':
      symbol = '£';
      formattedAmount = amount.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      break;
    case 'JPY':
      symbol = '¥';
      formattedAmount = amount.toLocaleString('ja-JP', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
      break;
    case 'AUD':
      symbol = 'A$';
      formattedAmount = amount.toLocaleString('en-AU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      break;
    default:
      symbol = '';
      formattedAmount = amount.toLocaleString('en-US');
      break;
  }
  
  return `${symbol}${formattedAmount}${showCurrencyCode ? ` ${currency.toUpperCase()}` : ''}`;
}; 