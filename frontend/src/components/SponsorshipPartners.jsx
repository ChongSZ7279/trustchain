import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DiamondImg from '../assets/image/Diamond.png';
import PlatinumImg from '../assets/image/Platinum.png';
import GoldImg from '../assets/image/Gold.png';
import SilverImg from '../assets/image/Silver.png';
import SponsorshipContact from './SponsorshipContact';
import { 
  FaFacebook, 
  FaInstagram, 
  FaYoutube, 
  FaEnvelope, 
  FaGlobe, 
  FaHandshake, 
  FaPlus, 
  FaShieldAlt, 
  FaGlobeAmericas, 
  FaLightbulb,
  FaTimes,
  FaChevronDown,
  FaAward,
  FaInfoCircle
} from 'react-icons/fa';

const sponsorData = {
  diamond: [
    {
      id: 1,
      name: "Vitrox Technologies",
      logo: DiamondImg,
      description: "Non-Profit Organization & NGOs – Charities looking for fixed-proof, automated fund disbursement while reducing operational costs. We are a team of blockchain enthusiasts who are passionate about using technology to make the world a better place.",
      facebook: "https://facebook.com/vitroxtech",
      instagram: "https://instagram.com/vitroxtech",
      youtube: "https://youtube.com/vitroxtech",
      website: "https://www.vitroxtech.com",
      email: "contact@vitroxtech.com"
    },
    {
      id: 2,
      name: "Horizon Foundation",
      logo: DiamondImg,
      description: "International foundation dedicated to transparency and accountability in charitable giving. We are a team of blockchain enthusiasts who are passionate about using technology to make the world a better place.",
      facebook: "https://facebook.com/horizonfoundation",
      instagram: "https://instagram.com/horizonfoundation",
      youtube: "https://youtube.com/horizonfoundation",
      website: "https://www.horizonfoundation.org",
      email: "partnerships@horizonfoundation.org"
    },
    {
      id: 3,
      name: "TrustChain",
      logo: DiamondImg,
      description: "Blockchain-based platform for transparent and accountable charitable giving. We are a team of blockchain enthusiasts who are passionate about using technology to make the world a better place.",
      contact: "tech@trustchain.com",
      website: "https://www.trustchain.com"
    }
  ],
  platinum: [
    {
      id: 1,
      name: "EcoFuture Investments",
      logo: PlatinumImg,
      description: "Sustainable investment firm supporting environmental and social impact projects worldwide. This is a test description.",
      contact: "info@ecofutureinv.com",
      website: "https://www.ecofutureinv.com"
    },
    {
      id: 2,
      name: "Nexus Banking Group",
      logo: PlatinumImg,
      description: "Financial institution pioneering blockchain-based transparency solutions for charitable donations. This is a test description.",
      contact: "partnerships@nexusbanking.com",
      website: "https://www.nexusbanking.com"
    },
    {
      id: 3,
      name: "Quantum Security",
      logo: PlatinumImg,
      description: "Cybersecurity experts ensuring the integrity and safety of blockchain transactions. This is a test description.",
      contact: "support@quantumsecurity.net",
      website: "https://www.quantumsecurity.net"
    }
  ],
  gold: [
    {
      id: 1,
      name: "Bright Future Media",
      logo: GoldImg,
      description: "Media company dedicated to highlighting humanitarian efforts and social impact initiatives.",
      contact: "media@brightfuture.com",
      website: "https://www.brightfuture.com"
    },
    {
      id: 2,
      name: "Innovate Partners",
      logo: GoldImg,
      description: "Venture capital firm focusing on technology solutions for social good.",
      contact: "ventures@innovatepartners.com",
      website: "https://www.innovatepartners.com"
    },
    {
      id: 3,
      name: "Global Connect Telecom",
      logo: GoldImg,
      description: "Telecommunications provider supporting connectivity for humanitarian organizations worldwide.",
      contact: "support@globalconnect.com",
      website: "https://www.globalconnect.com"
    }
  ],
  silver: [
    {
      id: 1,
      name: "Green Energy Co.",
      logo: SilverImg,
      description: "Renewable energy provider supporting sustainable development projects.",
      contact: "info@greenenergy.co",
      website: "https://www.greenenergy.co"
    },
    {
      id: 2,
      name: "Urban Development Group",
      logo: SilverImg,
      description: "Urban planning and development firm with a focus on community-building initiatives.",
      contact: "projects@urbandevelopment.com",
      website: "https://www.urbandevelopment.com"
    },
    {
      id: 3,
      name: "Health First Alliance",
      logo: SilverImg,
      description: "Healthcare coalition supporting medical aid projects in underserved communities.",
      contact: "alliance@healthfirst.org",
      website: "https://www.healthfirst.org"
    },
  ]
};

const SponsorTier = ({ title, sponsors, bgColor, borderColor, iconColor, iconBgColor }) => {
  const [expandedCard, setExpandedCard] = useState(null);
  
  const getLogo = (tier) => {
    const sizes = {
      Diamond: "w-24 h-24 md:w-32 md:h-32",
      Platinum: "w-20 h-20 md:w-28 md:h-28",
      Gold: "w-16 h-16 md:w-24 md:h-24",
      Silver: "w-16 h-16 md:w-20 md:h-20"
    };
    return sizes[tier];
  };

  const getIconClass = (tier) => {
    const icons = {
      Diamond: <FaAward className="w-6 h-6" />,
      Platinum: <FaAward className="w-6 h-6" />,
      Gold: <FaAward className="w-5 h-5" />,
      Silver: <FaAward className="w-5 h-5" />
    };
    return icons[tier];
  };

  const toggleExpandCard = (id) => {
    if (expandedCard === id) {
      setExpandedCard(null);
    } else {
      setExpandedCard(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`mb-12 ${bgColor} rounded-xl shadow-lg overflow-hidden relative`}
    >
      {/* Abstract background shapes for visual interest */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white transform translate-x-1/3 translate-y-1/3"></div>
      </div>
      
      <div className="relative z-10 p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className={`${iconBgColor} rounded-full p-3 mr-4`}>
              {getIconClass(title)}
            </div>
            <h2 className={`text-2xl md:text-3xl font-bold text-gray-800`}>
              {title} Partners
            </h2>
          </div>
          <div className={`hidden md:flex px-3 py-1 rounded-full ${borderColor} ${iconColor} text-sm font-medium`}>
            {sponsors.length} Partners
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
          {sponsors.map((sponsor, index) => (
            <motion.div
              key={sponsor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative">
                <div className={`absolute top-0 right-0 m-2 ${iconBgColor} rounded-full px-2 py-1 text-xs text-white font-medium`}>
                  {title}
                </div>
                <div className={`flex items-center justify-center p-6 ${bgColor}`}>
                  <img src={sponsor.logo} alt={`${sponsor.name} logo`} className={`${getLogo(title)} object-contain`} />
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">{sponsor.name}</h3>
                
                {title !== 'Silver' && (
                  <AnimatePresence>
                    {(expandedCard === sponsor.id || title === 'Diamond') ? (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="text-gray-600 mb-4 text-sm"
                      >
                        {sponsor.description}
                      </motion.p>
                    ) : (
                      <motion.p
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        className="text-gray-600 mb-4 text-sm line-clamp-2"
                      >
                        {sponsor.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                )}
                
                {title !== 'Diamond' && title !== 'Silver' && (
                  <button 
                    onClick={() => toggleExpandCard(sponsor.id)}
                    className={`text-sm ${iconColor} font-medium mb-4 flex items-center`}
                  >
                    {expandedCard === sponsor.id ? 'Read less' : 'Read more'}
                    <FaChevronDown className={`ml-1 transform transition-transform ${expandedCard === sponsor.id ? 'rotate-180' : ''}`} />
                  </button>
                )}
                
                {title !== 'Silver' && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {sponsor.facebook && (
                      <a href={sponsor.facebook} target="_blank" rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 transition-colors p-2 bg-blue-50 rounded-full">
                        <FaFacebook className="w-4 h-4" />
                      </a>
                    )}
                    {sponsor.instagram && (
                      <a href={sponsor.instagram} target="_blank" rel="noopener noreferrer" 
                        className="text-pink-600 hover:text-pink-800 transition-colors p-2 bg-pink-50 rounded-full">
                        <FaInstagram className="w-4 h-4" /> 
                      </a>
                    )}
                    {sponsor.youtube && (
                      <a href={sponsor.youtube} target="_blank" rel="noopener noreferrer" 
                        className="text-red-600 hover:text-red-800 transition-colors p-2 bg-red-50 rounded-full">
                        <FaYoutube className="w-4 h-4" />
                      </a>
                    )}
                    {sponsor.email && (
                      <a href={`mailto:${sponsor.email}`} 
                        className="text-gray-600 hover:text-gray-800 transition-colors p-2 bg-gray-50 rounded-full">
                        <FaEnvelope className="w-4 h-4" />
                      </a>
                    )}
                    {sponsor.website && (
                      <a href={sponsor.website} target="_blank" rel="noopener noreferrer" 
                        className="text-indigo-600 hover:text-indigo-800 transition-colors p-2 bg-indigo-50 rounded-full">
                        <FaGlobe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const SponsorshipPartners = () => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);
  const [activeTab, setActiveTab] = useState('partners');

  return (
    <div className="container mx-auto px-4 py-8 mt-8">
      {/* Header section with gradient styling matching OrganizationList */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-xl bg-gradient-to-r from-indigo-700 to-purple-700 text-white p-8 mb-12 shadow-lg overflow-hidden"
      >
        {/* Abstract background shapes */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white transform translate-x-1/3 translate-y-1/3"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center">
                <FaHandshake className="mr-3" />
                Our Partners
              </h1>
              <p className="text-lg opacity-90 mb-6 max-w-2xl">
                We're grateful to our partners who make our mission possible. Their support enables us to build transparency and trust in charitable giving through blockchain technology.
              </p>
            </div>
            <div className="mt-6 md:mt-0">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowContactForm(true);
                  setActiveTab('apply');
                }}
                className="inline-flex items-center px-5 py-3 bg-white text-indigo-700 font-medium rounded-lg shadow-md hover:bg-gray-100 transition-colors"
              >
                <FaPlus className="mr-2" />
                Become a Partner
              </motion.button>
            </div>
          </div>
          
          {/* Tab navigation */}
          <div className="flex space-x-1 mt-8 bg-indigo-800 bg-opacity-40 p-1 rounded-lg max-w-md">
            <button
              onClick={() => setActiveTab('partners')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'partners' 
                  ? 'bg-white text-indigo-700' 
                  : 'text-white hover:bg-indigo-600'
              }`}
            >
              Our Partners
            </button>
            <button
              onClick={() => {
                setActiveTab('benefits');
                setShowBenefits(true);
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'benefits' 
                  ? 'bg-white text-indigo-700' 
                  : 'text-white hover:bg-indigo-600'
              }`}
            >
              Partner Benefits
            </button>
            <button
              onClick={() => {
                setActiveTab('apply');
                setShowContactForm(true);
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'apply' 
                  ? 'bg-white text-indigo-700' 
                  : 'text-white hover:bg-indigo-600'
              }`}
            >
              Apply
            </button>
          </div>
        </div>
      </motion.div>

      {/* Content based on active tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'partners' && (
          <motion.div
            key="partners-list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            id="partners-list"
          >
            <SponsorTier 
              title="Diamond" 
              sponsors={sponsorData.diamond} 
              bgColor="bg-blue-50" 
              borderColor="border border-blue-200 bg-blue-50"
              iconColor="text-blue-600"
              iconBgColor="bg-blue-600"
            />
            
            <SponsorTier 
              title="Platinum" 
              sponsors={sponsorData.platinum} 
              bgColor="bg-purple-50" 
              borderColor="border border-purple-200 bg-purple-50"
              iconColor="text-purple-600"
              iconBgColor="bg-purple-600"
            />
            
            <SponsorTier 
              title="Gold" 
              sponsors={sponsorData.gold} 
              bgColor="bg-yellow-50" 
              borderColor="border border-yellow-200 bg-yellow-50"
              iconColor="text-yellow-600"
              iconBgColor="bg-yellow-600"
            />
            
            <SponsorTier 
              title="Silver" 
              sponsors={sponsorData.silver} 
              bgColor="bg-gray-50" 
              borderColor="border border-gray-200 bg-gray-50"
              iconColor="text-gray-600"
              iconBgColor="bg-gray-500"
            />
          </motion.div>
        )}

        {activeTab === 'benefits' && (
          <motion.div
            key="benefits"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-12"
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-center mb-8">
                  <div className="bg-indigo-600 rounded-full p-3 mr-4">
                    <FaShieldAlt className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                    How Your Partnership Helps
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-100"
                  >
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaShieldAlt className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Platform Development</h3>
                    <p className="text-gray-600">
                      Your support helps us maintain and enhance our blockchain-based platform, ensuring transparency and security for all charitable transactions.
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-100"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaGlobeAmericas className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Global Reach</h3>
                    <p className="text-gray-600">
                      Partnerships enable us to expand our reach globally, connecting more donors with impactful charitable organizations worldwide.
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-100"
                  >
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaLightbulb className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                    <p className="text-gray-600">
                      We continuously innovate to improve transparency in charitable giving. Your partnership funds research and development of new features.
                    </p>
                  </motion.div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl mb-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center">
                    <FaInfoCircle className="mr-2 text-indigo-600" />
                    Partnership Tiers
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <motion.div whileHover={{ y: -5 }} className="bg-white p-5 rounded-lg shadow-sm">
                      <h4 className="font-bold text-blue-600 text-lg mb-2">Diamond</h4>
                      <div className="h-1 w-12 bg-blue-600 mb-4 rounded-full"></div>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-2">✓</span>
                          Premium logo placement
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-2">✓</span>
                          Full company description
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-2">✓</span>
                          Social media links
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-2">✓</span>
                          Featured in newsletters
                        </li>
                      </ul>
                    </motion.div>
                    <motion.div whileHover={{ y: -5 }} className="bg-white p-5 rounded-lg shadow-sm">
                      <h4 className="font-bold text-purple-600 text-lg mb-2">Platinum</h4>
                      <div className="h-1 w-12 bg-purple-600 mb-4 rounded-full"></div>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                          <span className="text-purple-600 mr-2">✓</span>
                          Large logo placement
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-600 mr-2">✓</span>
                          Company description
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-600 mr-2">✓</span>
                          Social media links
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-600 mr-2">✓</span>
                          Newsletter mentions
                        </li>
                      </ul>
                    </motion.div>
                    <motion.div whileHover={{ y: -5 }} className="bg-white p-5 rounded-lg shadow-sm">
                      <h4 className="font-bold text-yellow-600 text-lg mb-2">Gold</h4>
                      <div className="h-1 w-12 bg-yellow-600 mb-4 rounded-full"></div>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                          <span className="text-yellow-600 mr-2">✓</span>
                          Medium logo placement
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-600 mr-2">✓</span>
                          Brief company description
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-600 mr-2">✓</span>
                          Social media links
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-600 mr-2">✓</span>
                          Website presence
                        </li>
                      </ul>
                    </motion.div>
                    <motion.div whileHover={{ y: -5 }} className="bg-white p-5 rounded-lg shadow-sm">
                      <h4 className="font-bold text-gray-600 text-lg mb-2">Silver</h4>
                      <div className="h-1 w-12 bg-gray-400 mb-4 rounded-full"></div>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                          <span className="text-gray-600 mr-2">✓</span>
                          Small logo placement
                        </li>
                        <li className="flex items-start">
                          <span className="text-gray-600 mr-2">✓</span>
                          Company name
                        </li>
                        <li className="flex items-start">
                          <span className="text-gray-600 mr-2">✓</span>
                          Website presence
                        </li>
                        <li className="flex items-start">
                          <span className="text-gray-600 mr-2">✓</span>
                          Support acknowledgment
                        </li>
                      </ul>
                    </motion.div>
                  </div>
                </div>

                <div className="text-center">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setActiveTab('apply');
                      setShowContactForm(true);
                    }}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-lg shadow-md hover:from-indigo-700 hover:to-indigo-800 transition-all"
                  >
                    <FaHandshake className="mr-2" />
                    Apply for Partnership
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'apply' && (
          <motion.div
            key="contact-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-12"
          >
            <SponsorshipContact />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SponsorshipPartners;