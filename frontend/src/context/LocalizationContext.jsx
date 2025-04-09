import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const LocalizationContext = createContext();

// Exchange rates (in a production app, these would be fetched from an API)
const DEFAULT_EXCHANGE_RATES = {
  ETH_TO_MYR: 13500, // 1 ETH ≈ 13,500 MYR (this would be updated regularly)
  USD_TO_MYR: 4.2,    // 1 USD ≈ 4.2 MYR
};

// Available languages in Malaysia
const MALAYSIAN_LANGUAGES = [
  { code: 'ms-MY', name: 'Bahasa Melayu', nativeName: 'Bahasa Melayu' },
  { code: 'en-MY', name: 'English (Malaysia)', nativeName: 'English' },
  { code: 'zh-MY', name: 'Chinese (Malaysia)', nativeName: '中文' },
  { code: 'ta-MY', name: 'Tamil (Malaysia)', nativeName: 'தமிழ்' },
];

export const LocalizationProvider = ({ children }) => {
  const [locale, setLocale] = useState('ms-MY'); // Default to Malaysian Malay
  const [currency, setCurrency] = useState('MYR'); // Malaysian Ringgit
  const [exchangeRates, setExchangeRates] = useState(DEFAULT_EXCHANGE_RATES);
  const [loading, setLoading] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState(MALAYSIAN_LANGUAGES);

  // Fetch current exchange rates (in a real app)
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch from an API like:
        // const response = await axios.get('https://api.exchangerate.host/latest?base=USD&symbols=MYR,ETH');
        // setExchangeRates({
        //   ETH_TO_MYR: response.data.rates.MYR / response.data.rates.ETH,
        //   USD_TO_MYR: response.data.rates.MYR,
        // });

        // For now, we'll use the default rates
        setExchangeRates(DEFAULT_EXCHANGE_RATES);
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
    // Set up a refresh interval (e.g., every hour)
    const interval = setInterval(fetchExchangeRates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Format currency based on locale and currency settings
  const formatCurrency = (amount, currencyType = currency) => {
    if (!amount) return '0.00';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyType,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Convert ETH to MYR
  const convertEthToMyr = (ethAmount) => {
    if (!ethAmount) return 0;
    return parseFloat(ethAmount) * exchangeRates.ETH_TO_MYR;
  };

  // Convert USD to MYR
  const convertUsdToMyr = (usdAmount) => {
    if (!usdAmount) return 0;
    return parseFloat(usdAmount) * exchangeRates.USD_TO_MYR;
  };

  // Convert MYR to ETH
  const convertMyrToEth = (myrAmount) => {
    if (!myrAmount) return 0;
    return parseFloat(myrAmount) / exchangeRates.ETH_TO_MYR;
  };

  // Format date based on locale
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Format Malaysian IC number (NRIC)
  const formatMyKad = (icNumber) => {
    if (!icNumber || icNumber.length !== 12) return icNumber;
    
    // Format as XXXXXX-XX-XXXX
    return `${icNumber.substring(0, 6)}-${icNumber.substring(6, 8)}-${icNumber.substring(8, 12)}`;
  };

  // Validate Malaysian IC number
  const validateMyKad = (icNumber) => {
    // Remove any non-digit characters
    const cleanIc = icNumber.replace(/\D/g, '');
    
    // MyKad should be 12 digits
    if (cleanIc.length !== 12) return false;
    
    // Basic validation: first 6 digits are YYMMDD (date of birth)
    const year = parseInt(cleanIc.substring(0, 2));
    const month = parseInt(cleanIc.substring(2, 4));
    const day = parseInt(cleanIc.substring(4, 6));
    
    // Check if month is valid (1-12)
    if (month < 1 || month > 12) return false;
    
    // Check if day is valid (1-31, depending on month)
    const daysInMonth = new Date(year > 50 ? 1900 + year : 2000 + year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) return false;
    
    return true;
  };

  // Check if a string contains non-Latin characters (for Malay/Chinese/Tamil)
  const containsNonLatinChars = (str) => {
    return /[^\u0000-\u007F]/.test(str);
  };

  // Format Malaysian phone number
  const formatMalaysianPhone = (phoneNumber) => {
    if (!phoneNumber) return '';
    
    // Remove any non-digit characters
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Check if it starts with '60' (country code)
    if (cleanPhone.startsWith('60')) {
      // Format as +60 XX-XXXXXXXX
      return `+60 ${cleanPhone.substring(2, 4)}-${cleanPhone.substring(4)}`;
    } else if (cleanPhone.startsWith('0')) {
      // Format as 0XX-XXXXXXXX
      return `0${cleanPhone.substring(1, 3)}-${cleanPhone.substring(3)}`;
    }
    
    return phoneNumber;
  };

  const value = {
    locale,
    setLocale,
    currency,
    setCurrency,
    exchangeRates,
    formatCurrency,
    convertEthToMyr,
    convertUsdToMyr,
    convertMyrToEth,
    formatDate,
    formatMyKad,
    validateMyKad,
    containsNonLatinChars,
    formatMalaysianPhone,
    availableLanguages,
    loading,
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

// Custom hook to use the localization context
export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

export default LocalizationContext; 