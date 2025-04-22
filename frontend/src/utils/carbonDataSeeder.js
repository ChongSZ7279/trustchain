import { v4 as uuidv4 } from 'uuid';

// Project types
const projectTypes = ['reforestation', 'wind', 'solar', 'hydro'];

// Company names 
const companies = [
  'EcoSavvy Solutions',
  'GreenLife Industries',
  'SustainaTech',
  'EarthFirst Energy',
  'CarbonZero Innovations',
  'ForestGuard Co.',
  'CleanAir Ventures',
  'RenewPower Group',
  'BioCarbon Systems',
  'Terraform Sustainability',
  'OceanBlue Carbon',
  'AquaRestore Projects',
  'SkyWind Energy',
  'SolarHarbor Inc.',
  'GreenLeaf Collective'
];

// Locations
const locations = [
  'Amazon Basin, Brazil',
  'Western Ghats, India',
  'Borneo, Indonesia',
  'Southern Appalachia, USA',
  'Great Barrier Reef, Australia',
  'Patagonia, Argentina',
  'Scottish Highlands, UK',
  'Congo Basin, Africa',
  'Yunnan Province, China',
  'Costa Rica',
  'New Zealand',
  'Kenya',
  'British Columbia, Canada',
  'Sumatra, Indonesia',
  'Nordic Region, Europe'
];

// Verifiers
const verifiers = [
  'Green Standard Alliance',
  'Carbon Verification Board',
  'EcoTrust Registry',
  'Global Carbon Council',
  'Climate Action Certifiers',
  'Sustainable Projects Institute',
  'Forest Trust Network',
  'Carbon Offset Verification Alliance',
  'GreenCert International',
  'EarthProof Standards'
];

// Sample project descriptions
const descriptions = [
  'This project focuses on reforestation of degraded lands, promoting biodiversity and carbon sequestration.',
  'An innovative wind energy project that replaces fossil fuel electricity with clean, renewable energy.',
  'Solar power installation that provides clean energy and jobs to local communities while reducing carbon emissions.',
  'Sustainable hydroelectric power generation with minimal ecological impact and maximum carbon reduction.',
  'Conservation project that protects existing forest carbon stocks and enhances forest growth.',
  'Community-based initiative that combines sustainable agriculture with carbon sequestration practices.',
  'Marine ecosystem restoration project that enhances blue carbon storage in coastal habitats.',
  'Energy efficiency project that significantly reduces industrial carbon emissions.',
  'Methane capture and utilization from waste management sites.',
  'Sustainable agroforestry project that combines carbon sequestration with food security.'
];

// Sample project images
const projectImages = [
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1473773508845-188df298d2d1?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1500829243541-74b677fecc30?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1506701160839-34cfdecaf8cf?ixlib=rb-4.0.3'
];

// Helper to get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Helper to get random number in range
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to get random price with 2 decimal places
const getRandomPrice = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

// Helper to get random date in the last 30 days
const getRandomDate = () => {
  const now = new Date();
  const pastDate = new Date(now.getTime() - getRandomNumber(1, 30) * 24 * 60 * 60 * 1000);
  return pastDate.toISOString();
};

// Generate a mock project
const generateProject = () => {
  const pricePerCredit = getRandomPrice(5, 150);
  const type = getRandomItem(projectTypes);
  
  return {
    id: uuidv4(),
    name: `${getRandomItem(['Sustainable', 'Green', 'Eco', 'Carbon', 'Climate'])} ${getRandomItem(['Project', 'Initiative', 'Program', 'Effort', 'Venture'])} ${getRandomNumber(1, 100)}`,
    type,
    description: getRandomItem(descriptions),
    location: getRandomItem(locations),
    verifier: getRandomItem(verifiers),
    pricePerCredit: parseFloat(pricePerCredit),
    image: getRandomItem(projectImages),
    createdAt: getRandomDate(),
    carbonTons: getRandomNumber(10, 5000),
    totalPrice: 0, // Will be calculated
    rating: getRandomNumber(3, 5)
  };
};

// Generate a mock seller listing
const generateSellerListing = (id = null) => {
  const carbonTons = getRandomNumber(10, 100);
  const rate = parseFloat(getRandomPrice(0.01, 0.1));
  const price = (carbonTons * rate).toFixed(4);
  const usdPrice = `$${(parseFloat(price) * 2000).toFixed(2)}`;
  
  return {
    id: id || uuidv4(),
    company: getRandomItem(companies),
    carbonTons,
    rate: `${rate} ETH/ton`,
    price: `${price} ETH`,
    usdPrice,
    seller: `0x${Math.random().toString(16).substr(2, 40)}`,
    timestamp: getRandomDate(),
    status: 'active'
  };
};

// Generate a mock buyer listing
const generateBuyerListing = (id = null) => {
  const carbonTons = getRandomNumber(10, 100);
  const rate = parseFloat(getRandomPrice(0.01, 0.1));
  const price = (carbonTons * rate).toFixed(4);
  const usdPrice = `$${(parseFloat(price) * 2000).toFixed(2)}`;
  
  return {
    id: id || uuidv4(),
    company: getRandomItem(companies),
    carbonTons,
    rate: `${rate} ETH/ton`,
    price: `${price} ETH`,
    usdPrice,
    buyer: `0x${Math.random().toString(16).substr(2, 40)}`,
    timestamp: getRandomDate(),
    status: 'active'
  };
};

// Generate mock projects
export const generateProjects = (count = 12) => {
  return Array(count).fill().map(() => generateProject());
};

// Generate mock seller listings
export const generateSellerListings = (count = 10) => {
  return Array(count).fill().map((_, index) => generateSellerListing(`seller-${index + 1}`));
};

// Generate mock buyer listings
export const generateBuyerListings = (count = 8) => {
  return Array(count).fill().map((_, index) => generateBuyerListing(`buyer-${index + 1}`));
};

// Export a function to get all mock data
export const getMockMarketData = () => {
  return {
    projects: generateProjects(),
    sellerListings: generateSellerListings(),
    buyerListings: generateBuyerListings(),
    carbonCreditPool: getRandomNumber(5000, 15000),
    carbonCredits: getRandomNumber(0, 500)
  };
};

export default getMockMarketData; 