import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBook, 
  FaSearch, 
  FaNetworkWired, 
  FaShieldAlt, 
  FaExchangeAlt,
  FaSync,
  FaChevronRight,
  FaChevronLeft,
  FaQuestion,
  FaChevronDown,
  FaGlobe,
  FaEye,
  FaLock,
  FaHandshake,
  FaMoneyBillWave,
  FaChartLine,
  FaFileContract,
  FaCheckCircle,
  FaDesktop
} from 'react-icons/fa';

export default function BlockchainBasics() {
  const [activeSection, setActiveSection] = useState('what-is-blockchain');
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const sections = [
    { id: 'what-is-blockchain', label: 'What is Blockchain?', icon: <FaBook /> },
    { id: 'how-it-works', label: 'How It Works', icon: <FaNetworkWired /> },
    { id: 'benefits', label: 'Benefits', icon: <FaHandshake /> },
    { id: 'crypto-volatility', label: 'Crypto Volatility', icon: <FaChartLine /> },
    { id: 'trustchain-approach', label: 'TrustChain Approach', icon: <FaShieldAlt /> },
  ];

  const navigateSection = (direction) => {
    const currentIndex = sections.findIndex(section => section.id === activeSection);
    if (direction === 'next' && currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].id);
    } else if (direction === 'prev' && currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1].id);
    }
    
    // Scroll to top of content when changing sections
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      {/* Header with gradient background */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative rounded-xl bg-gradient-to-r from-indigo-700 to-purple-700 text-white p-8 mb-8 shadow-lg overflow-hidden"
      >
        {/* Abstract background shapes */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white transform translate-x-1/3 translate-y-1/3"></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold flex items-center">
            <FaNetworkWired className="mr-3" />
            Blockchain Basics
          </h1>
          <p className="mt-2 text-indigo-100 max-w-xl">
            Understanding the revolutionary technology behind TrustChain and how it enhances transparency in charitable giving.
          </p>
        </div>
      </motion.div>

      {/* Navigation tabs with sticky behavior */}
      <motion.div 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`bg-white rounded-xl shadow-md mb-6 transition-all ${
          isScrolled ? 'sticky top-0 z-10 shadow-lg' : ''
        }`}
      >
        <div className="px-4 py-1">
          <nav className="flex overflow-x-auto py-2">
            {sections.map((section, index) => (
              <motion.button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-3 mx-1 text-sm font-medium rounded-lg flex items-center whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.label}
              </motion.button>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Content Sections with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6 mb-6"
        >
          {/* What is Blockchain */}
          {activeSection === 'what-is-blockchain' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
                <FaBook className="mr-3 text-indigo-600" />
                What is Blockchain?
              </h2>
              
              <p className="mt-3 text-gray-700">
                Blockchain is a digital ledger technology that records transactions across many computers 
                in a way that ensures the data cannot be altered retroactively.
              </p>
              
              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 my-6 rounded-r-lg shadow-sm">
                <p className="text-indigo-800">
                  <strong>Think of it as:</strong> A digital record book where entries are permanent, 
                  transparent, and verified by a community rather than a single authority.
                </p>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4 flex items-center">
                <span className="text-indigo-600 mr-2">Key Features</span>
              </h3>
              
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <motion.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-white border border-indigo-100 shadow-sm p-5 rounded-xl hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-indigo-700 mb-3 flex items-center">
                    <span className="bg-indigo-100 text-indigo-700 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                      <FaGlobe />
                    </span>
                    Decentralized
                  </h3>
                  <p className="text-gray-700 ml-13">
                    No single entity controls the entire network, distributing power and reducing central points of failure
                  </p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-white border border-indigo-100 shadow-sm p-5 rounded-xl hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-indigo-700 mb-3 flex items-center">
                    <span className="bg-indigo-100 text-indigo-700 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                      <FaEye />
                    </span>
                    Transparent
                  </h3>
                  <p className="text-gray-700 ml-13">
                    All transactions are visible to anyone on the network, creating unprecedented levels of accountability
                  </p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-white border border-indigo-100 shadow-sm p-5 rounded-xl hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-indigo-700 mb-3 flex items-center">
                    <span className="bg-indigo-100 text-indigo-700 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                      <FaLock />
                    </span>
                    Immutable
                  </h3>
                  <p className="text-gray-700 ml-13">
                    Once recorded, data cannot be altered or deleted, ensuring a permanent and trustworthy record
                  </p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-white border border-indigo-100 shadow-sm p-5 rounded-xl hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-indigo-700 mb-3 flex items-center">
                    <span className="bg-indigo-100 text-indigo-700 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                      <FaShieldAlt />
                    </span>
                    Secure
                  </h3>
                  <p className="text-gray-700 ml-13">
                    Uses advanced cryptography to protect data integrity and prevent unauthorized access
                  </p>
                </motion.div>
              </div>
              
              <div className="mt-8 bg-gray-50 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Visual Explanation</h3>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe 
                    className="w-full h-64 md:h-96 rounded-lg shadow-sm"
                    src="https://www.youtube.com/embed/SSo_EIwHSd4" 
                    title="Blockchain Explained"
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                </div>
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Visual explanation of how blockchain technology works and its real-world applications
                </p>
              </div>
            </div>
          )}
          
          {/* How It Works */}
          {activeSection === 'how-it-works' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
                <FaNetworkWired className="mr-3 text-indigo-600" />
                How Blockchain Works
              </h2>
              
              <p className="mt-3 text-gray-700">
                Blockchain operates through a series of connected steps that ensure security and transparency
                throughout the transaction process:
              </p>
              
              <div className="mt-8 space-y-6">
                {[
                  {
                    step: 1,
                    title: "Transaction Initiation",
                    description: "Someone requests a transaction (like a donation to a charity)",
                    icon: <FaMoneyBillWave className="text-indigo-600" />
                  },
                  {
                    step: 2,
                    title: "Block Creation",
                    description: "The transaction is grouped with others into a 'block'",
                    icon: <FaNetworkWired className="text-indigo-600" />
                  },
                  {
                    step: 3,
                    title: "Verification",
                    description: "The network of computers validates the transaction using known algorithms",
                    icon: <FaCheckCircle className="text-indigo-600" />
                  },
                  {
                    step: 4,
                    title: "Block Addition",
                    description: "The verified block is added to the existing chain, creating a permanent record",
                    icon: <FaLock className="text-indigo-600" />
                  },
                  {
                    step: 5,
                    title: "Transaction Completion",
                    description: "The transaction is complete and becomes part of the permanent ledger",
                    icon: <FaHandshake className="text-indigo-600" />
                  }
                ].map((item, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start p-5 bg-white border border-indigo-100 rounded-xl shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-700 text-xl font-bold">
                      {item.step}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-800 flex items-center">
                        {item.title} <span className="ml-2 text-xl">{item.icon}</span>
                      </h3>
                      <p className="mt-1 text-gray-600">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-5 mt-8 rounded-r-lg shadow-sm">
                <h3 className="font-medium text-indigo-800">Simplified Explanation</h3>
                <p className="text-gray-700 mt-2">
                  Imagine a public notebook where everyone can see what's written, but once something is written, 
                  it cannot be erased or changed. Each new page (block) references the previous page, 
                  creating a chain that anyone can verify.
                </p>
              </div>
            </div>
          )}
          
          {/* Benefits */}
          {activeSection === 'benefits' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
                <FaHandshake className="mr-3 text-indigo-600" />
                Benefits of Blockchain for Charity
              </h2>
              
              <p className="mt-3 text-gray-700">
                Blockchain technology offers several advantages that make it ideal for charitable giving and ensures
                that donations reach those who need them most:
              </p>
              
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    title: "Transparency",
                    description: "Donors can see exactly where their money goes and how it's used",
                    icon: <FaEye className="text-indigo-600" />
                  },
                  {
                    title: "Reduced Fraud",
                    description: "The immutable nature of blockchain prevents tampering with records",
                    icon: <FaShieldAlt className="text-indigo-600" />
                  },
                  {
                    title: "Lower Costs",
                    description: "Fewer intermediaries means more of your donation reaches its destination",
                    icon: <FaMoneyBillWave className="text-indigo-600" />
                  },
                  {
                    title: "Global Access",
                    description: "Anyone with internet access can participate, regardless of location",
                    icon: <FaGlobe className="text-indigo-600" />
                  },
                  {
                    title: "Trust Building",
                    description: "Verified impact reports build confidence in charitable organizations",
                    icon: <FaHandshake className="text-indigo-600" />
                  },
                  {
                    title: "Efficiency",
                    description: "Automated processes reduce administrative overhead",
                    icon: <FaSync className="text-indigo-600" />
                  }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="flex flex-col p-5 bg-white border border-indigo-100 rounded-xl shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-xl mb-4">
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">{item.title}</h3>
                    <p className="mt-2 text-gray-600 flex-grow">{item.description}</p>
                  </motion.div>
                ))}
              </div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="mt-8 bg-gradient-to-r from-green-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-green-100"
              >
                <h3 className="text-xl font-semibold text-green-800 mb-3">Real-World Impact</h3>
                <p className="text-gray-700">
                  With blockchain, charitable organizations can provide proof of impact through 
                  verifiable records of how donations were used and what outcomes were achieved.
                </p>
                <p className="text-gray-700 mt-3">
                  This creates a virtuous cycle: increased transparency leads to greater trust, 
                  which encourages more donations and ultimately helps more people in need.
                </p>
              </motion.div>
            </div>
          )}
          
          {/* Cryptocurrency Volatility */}
          {activeSection === 'crypto-volatility' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
                <FaChartLine className="mr-3 text-indigo-600" />
                Understanding Cryptocurrency Volatility
              </h2>
              
              <p className="mt-3 text-gray-700">
                While blockchain technology is secure, cryptocurrency values can be highly volatile, presenting both 
                opportunities and challenges for charitable organizations:
              </p>
              
              <div className="bg-red-50 border-l-4 border-red-400 p-5 my-6 rounded-r-lg shadow-sm">
                <h3 className="font-medium text-red-800 flex items-center">
                  <FaExchangeAlt className="mr-2" /> Important Notice
                </h3>
                <p className="text-gray-700 mt-2">
                  Cryptocurrency values can fluctuate dramatically, sometimes changing by 10-20% in a single day. 
                  This volatility is an important consideration when using blockchain technology.
                </p>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">What Causes Volatility?</h3>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Market Speculation",
                    description: "Many people buy cryptocurrencies hoping their value will increase",
                    icon: <FaChartLine className="text-indigo-600" />
                  },
                  {
                    title: "Regulatory Changes",
                    description: "Government decisions about cryptocurrency regulation can impact prices",
                    icon: <FaFileContract className="text-indigo-600" />
                  },
                  {
                    title: "Media Coverage",
                    description: "News and social media can drive rapid price changes",
                    icon: <FaSearch className="text-indigo-600" />
                  },
                  {
                    title: "Market Size",
                    description: "Cryptocurrency markets are smaller than traditional markets, making them more susceptible to large trades",
                    icon: <FaExchangeAlt className="text-indigo-600" />
                  }
                ].map((item, index) => (
                  <motion.div 
                    key={index} 
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-white border border-indigo-100 shadow-sm p-5 rounded-xl hover:shadow-md transition-all"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-xl">
                        {item.icon}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-800">{item.title}</h3>
                        <p className="mt-1 text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Protecting Yourself</h3>
              <motion.div 
                whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                className="bg-indigo-50 p-6 rounded-xl shadow-sm"
              >
                <ul className="space-y-3 text-gray-700">
                  {[
                    "Be aware that cryptocurrency values can change rapidly",
                    "Only invest what you can afford to lose",
                    "Consider stablecoins (cryptocurrencies designed to maintain stable value)",
                    "Research thoroughly before making cryptocurrency transactions",
                    "Use reputable exchanges and wallets with strong security measures"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-indigo-100 text-indigo-700 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              
              <div className="mt-8 border border-indigo-100 rounded-xl p-5 shadow-sm bg-white">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Volatility Chart Example</h3>
                <div className="bg-gray-50 p-5 rounded-lg">
                  <svg className="w-full h-64 mx-auto" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50,350 L100,300 L150,320 L200,100 L250,200 L300,150 L350,250 L400,50 L450,150 L500,100 L550,200 L600,50 L650,250 L700,150 L750,200" 
                          fill="none" 
                          stroke="#4f46e5" 
                          strokeWidth="3" />
                    <text x="400" y="380" textAnchor="middle" fill="#4b5563">Time</text>
                    <text x="30" y="200" textAnchor="middle" fill="#4b5563" transform="rotate(-90 30,200)">Price</text>
                  </svg>
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    Simplified illustration of cryptocurrency price volatility over time
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* TrustChain Approach */}
          {activeSection === 'trustchain-approach' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
                <FaShieldAlt className="mr-3 text-indigo-600" />
                TrustChain's Blockchain Approach
              </h2>
              
              <p className="mt-3 text-gray-700">
                TrustChain uses blockchain technology to enhance charitable giving while minimizing risks,
                providing a secure and transparent platform for donors and organizations:
              </p>
              
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {[
                  {
                    title: "Transparency Without Volatility",
                    description: "We use blockchain for record-keeping while allowing donations in stable currencies",
                    icon: <FaShieldAlt className="text-indigo-600" />
                  },
                  {
                    title: "Smart Contracts",
                    description: "Automated agreements ensure funds are used exactly as intended by donors",
                    icon: <FaFileContract className="text-indigo-600" />
                  },
                  {
                    title: "Verification System",
                    description: "Our platform verifies charitable organizations and tracks their impact",
                    icon: <FaCheckCircle className="text-indigo-600" />
                  },
                  {
                    title: "User-Friendly Interface",
                    description: "You don't need to understand blockchain technology to use TrustChain effectively",
                    icon: <FaDesktop className="text-indigo-600" />
                  }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-white border border-indigo-100 shadow-sm p-6 rounded-xl hover:shadow-md transition-all"
                  >
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-xl">
                        {item.icon}
                      </div>
                      <h3 className="ml-4 text-lg font-medium text-gray-800">{item.title}</h3>
                    </div>
                    <p className="text-gray-600">{item.description}</p>
                  </motion.div>
                ))}
              </div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-700 p-8 rounded-xl shadow-md text-white"
              >
                <h3 className="text-xl font-semibold mb-4">Our Commitment</h3>
                <p className="text-indigo-100">
                  TrustChain is committed to providing the benefits of blockchain technology while 
                  protecting our users from the risks of cryptocurrency volatility.
                </p>
                <p className="text-indigo-100 mt-4">
                  We believe that transparency and trust are essential for effective charitable giving, 
                  and our platform is designed to maximize both without exposing donors or organizations 
                  to unnecessary financial risk.
                </p>
                <div className="mt-6 pt-4 border-t border-indigo-300">
                  <Link 
                    to="/register" 
                    className="inline-flex items-center px-6 py-3 bg-white text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
                  >
                    Join TrustChain Today
                    <FaChevronRight className="ml-2" />
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-md px-6 py-4 border border-gray-100 flex justify-between items-center"
      >
        <button 
          onClick={() => navigateSection('prev')}
          disabled={sections.findIndex(section => section.id === activeSection) === 0}
          className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
            sections.findIndex(section => section.id === activeSection) === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-indigo-600 hover:bg-indigo-50'
          }`}
        >
          <FaChevronLeft className="mr-2" />
          Previous
        </button>
        
        <div className="text-sm font-medium text-gray-700">
          Section {sections.findIndex(section => section.id === activeSection) + 1} of {sections.length}
        </div>
        
        <button 
        onClick={() => navigateSection('next')}
          disabled={sections.findIndex(section => section.id === activeSection) === sections.length - 1}
          className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
            sections.findIndex(section => section.id === activeSection) === sections.length - 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-indigo-600 hover:bg-indigo-50'
          }`}
        >
          Next
          <FaChevronRight className="ml-2" />
        </button>
      </motion.div>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-purple-100 max-w-2xl mx-auto mb-6">
            Join TrustChain today and be part of a transparent charitable giving revolution. 
            Every donation makes an impact, and with TrustChain, you'll see exactly how.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
            >
              Create Account
            </Link>
            <Link 
              to="/explore-charities" 
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-700 text-white font-medium rounded-lg hover:bg-indigo-800 transition-colors shadow-sm"
            >
              Explore Charities
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}