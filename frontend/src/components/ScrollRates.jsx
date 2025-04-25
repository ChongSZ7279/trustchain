import React, { useState, useEffect } from 'react';
import { fetchScrollConversionRate, formatScrollAmount } from '../utils/scrollUtils';
import './ScrollRates.css';

/**
 * Component for displaying current Scroll token conversion rates
 */
const ScrollRates = ({ 
  defaultCurrency = 'USD',
  showAllRates = false,
  refreshInterval = 60000, // refresh every minute by default
}) => {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency);

  // Load rates on mount and when currency changes
  useEffect(() => {
    const loadRates = async () => {
      setLoading(true);
      try {
        const data = await fetchScrollConversionRate(selectedCurrency);
        setRates(data);
        setError(null);
      } catch (err) {
        setError('Failed to load conversion rates');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadRates();

    // Set up refresh interval
    const intervalId = setInterval(loadRates, refreshInterval);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [selectedCurrency, refreshInterval]);

  // Handle currency change
  const handleCurrencyChange = (e) => {
    setSelectedCurrency(e.target.value);
  };

  // Currencies to display in dropdown
  const currencies = ['USD', 'ETH', 'MYR', 'EUR', 'GBP', 'JPY', 'AUD'];

  if (loading && !rates) {
    return <div className="scroll-rates loading">Loading rates...</div>;
  }

  if (error && !rates) {
    return <div className="scroll-rates error">Error: {error}</div>;
  }

  return (
    <div className="scroll-rates-container">
      <div className="scroll-rates-header">
        <h3>SCROLL Token Rates</h3>
        {rates?.isFallback && (
          <p className="fallback-notice">Using fallback rates due to API connectivity issues</p>
        )}
        <div className="currency-selector">
          <label htmlFor="currency-select">Base Currency:</label>
          <select 
            id="currency-select" 
            value={selectedCurrency} 
            onChange={handleCurrencyChange}
          >
            {currencies.map(currency => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="main-rate">
        <div className="rate-value">
          <span className="rate-label">1 SCROLL =</span>
          <span className="rate-amount">
            {formatScrollAmount(rates?.rate || 0, selectedCurrency)}
          </span>
        </div>
        <div className="timestamp">
          Last updated: {new Date(rates?.timestamp || Date.now()).toLocaleString()}
        </div>
      </div>

      {showAllRates && rates?.rates && (
        <div className="all-rates">
          <h4>All Conversion Rates</h4>
          <ul className="rates-list">
            {Object.entries(rates.rates).map(([currency, rate]) => (
              <li key={currency} className="rate-item">
                <span className="currency-code">{currency}</span>
                <span className="rate-value">{formatScrollAmount(rate, currency, false)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ScrollRates; 