// Mock API endpoint for Scroll conversion rates
// This simulates an API that would fetch real-time exchange rates

export default function handler(req, res) {
  // Get requested currency from query params
  const { currency = 'USD' } = req.query;
  
  // Add a small random fluctuation to make it look like real rates
  const getRandomFluctuation = (baseValue, maxPercentage = 2) => {
    const fluctuation = (Math.random() * maxPercentage * 2 - maxPercentage) / 100;
    return baseValue * (1 + fluctuation);
  };
  
  // Base values for conversion rates
  const baseRates = {
    // Conversion rates for SCROLL token
    USD: 2000, // 1 SCROLL = $2000 USD (example value)
    ETH: 1,    // 1 SCROLL = 1 ETH (example value)
    
    // Other fiat currencies relative to USD
    MYR: 4.2,  // 1 USD = 4.2 MYR (Malaysian Ringgit)
    EUR: 0.92, // 1 USD = 0.92 EUR
    GBP: 0.78, // 1 USD = 0.78 GBP
    JPY: 150,  // 1 USD = 150 JPY
    AUD: 1.52  // 1 USD = 1.52 AUD
  };
  
  // Add slight random fluctuation to the rates to simulate real market behavior
  const rates = Object.keys(baseRates).reduce((acc, key) => {
    acc[key] = getRandomFluctuation(baseRates[key]);
    return acc;
  }, {});
  
  // Optional delay to simulate network latency (0-500ms)
  const simulatedDelay = Math.random() * 500;
  
  setTimeout(() => {
    // If the requested currency is supported, return its rate
    if (rates[currency.toUpperCase()]) {
      res.status(200).json({
        success: true,
        currency: currency.toUpperCase(),
        rate: rates[currency.toUpperCase()],
        timestamp: new Date().toISOString(),
        rates // Include all rates for reference
      });
    } else {
      // Return error for unsupported currency
      res.status(400).json({
        success: false,
        error: `Currency '${currency}' is not supported`,
        supported_currencies: Object.keys(rates)
      });
    }
  }, simulatedDelay);
} 