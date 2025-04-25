import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DiamondImg from '../assets/image/Diamond.png';
// import PlatinumImg from '../assets/image/Platinum.png';
// import GoldImg from '../assets/image/Gold.png';
// import SilverImg from '../assets/image/Silver.png';
import TrustchainImg from '../assets/image/Trustchain.png';
import CortexaImg from '../assets/image/Cortexa.jpg';
import HorizonImg from '../assets/image/Horizon.jpg';
import GlobalConnectImg from '../assets/image/GlobalConnect.jpg';
import NexusBankingImg from '../assets/image/NexusBanking.jpg';
import QuantumSecurityImg from '../assets/image/Quantum.jpg';
import BrightFutureImg from '../assets/image/BrightFuture.jpg';
import InnovationPartnersImg from '../assets/image/InnovationPartners.jpg';
import GreenEnergyImg from '../assets/image/GreenEnergy.jpg';
import UrbanDevelopmentImg from '../assets/image/Urban.jpg';
import HealthFirstImg from '../assets/image/HealthFirst.jpg';
import EcoFutureImg from '../assets/image/EcoFuture.jpg';


import SponsorshipContact from './SponsorshipContact';
import { motion } from 'framer-motion';
import { FaFacebook, FaInstagram, FaYoutube, FaEnvelope, FaGlobe, FaChevronRight, FaUsers } from 'react-icons/fa';

const sponsorData = {
  diamond: [
    {
      id: 1,
      name: "Cortexa Technologies",
      logo: CortexaImg,
      description: " A next-generation AI technology company focused on building intelligent systems that think, learn, and evolve. Leveraging advanced machine learning, real-time data analysis, and scalable cloud infrastructure, Cortexa delivers solutions that empower businesses to make smarter decisions, automate complex tasks, and unlock new levels of performance.",
      facebook: "https://facebook.com/vitroxtech",
      instagram: "https://instagram.com/vitroxtech",
      youtube: "https://youtube.com/vitroxtech",
      website: "https://www.vitroxtech.com",
      email: "contact@vitroxtech.com"
    },
    {
      id: 2,
      name: "Horizon Foundation",
      logo: HorizonImg,
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
      logo: TrustchainImg,
      description: "Blockchain-based platform for transparent and accountable charitable giving. We are a team of blockchain enthusiasts who are passionate about using technology to make the world a better place.",
      contact: "tech@trustchain.com",
      facebook: "https://facebook.com/horizonfoundation",
      instagram: "https://instagram.com/horizonfoundation",
      youtube: "https://youtube.com/horizonfoundation",
      website: "https://www.trustchain.com"
    }
  ],
  platinum: [
    {
      id: 1,
      name: "EcoFuture Investments",
      logo: EcoFutureImg,
      description: "Sustainable investment firm supporting environmental and social impact projects worldwide. This is a test description.",
      contact: "info@ecofutureinv.com",
      website: "https://www.ecofutureinv.com"
    },
    {
      id: 2,
      name: "Nexus Banking Group",
      logo: NexusBankingImg,
      description: "Financial institution pioneering blockchain-based transparency solutions for charitable donations. This is a test description.",
      contact: "partnerships@nexusbanking.com",
      website: "https://www.nexusbanking.com"
    },
    {
      id: 3,
      name: "Quantum Security",
      logo: QuantumSecurityImg,
      description: "Cybersecurity experts ensuring the integrity and safety of blockchain transactions. This is a test description.",
      contact: "support@quantumsecurity.net",
      website: "https://www.quantumsecurity.net"
    }
  ],
  gold: [
    {
      id: 1,
      name: "Bright Future Media",
      logo: BrightFutureImg,
      // description: "Media company dedicated to highlighting humanitarian efforts and social impact initiatives.",
      contact: "media@brightfuture.com",
      website: "https://www.brightfuture.com"
    },
    // {
    //   id: 2,
    //   name: "Innovate Partners",
    //   logo: InnovationPartnersImg,
    //   description: "Venture capital firm focusing on technology solutions for social good.",
    //   contact: "ventures@innovatepartners.com",
    //   website: "https://www.innovatepartners.com"
    // },
    {
      id: 3,
      name: "Global Connect Telecom",
      logo: GlobalConnectImg,
      // description: "Telecommunications provider supporting connectivity for humanitarian organizations worldwide.",
      contact: "support@globalconnect.com",
      website: "https://www.globalconnect.com"
    }
  ],
  silver: [
    {
      id: 1,
      name: "Green Energy Co.",
      logo: GreenEnergyImg,
      description: "Renewable energy provider supporting sustainable development projects.",
      contact: "info@greenenergy.co",
      // website: "https://www.greenenergy.co"
    },
    {
      id: 2,
      name: "Urban Development Group",
      logo: UrbanDevelopmentImg,
      description: "Urban planning and development firm with a focus on community-building initiatives.",
      contact: "projects@urbandevelopment.com",
      // website: "https://www.urbandevelopment.com"
    },
    {
      id: 3,
      name: "Health First Alliance",
      logo: HealthFirstImg,
      description: "Healthcare coalition supporting medical aid projects in underserved communities.",
      contact: "alliance@healthfirst.org",
      // website: "https://www.healthfirst.org"
    },
  ]
};

const SponsorTier = ({ title, sponsors, bgColor, borderColor, textColor }) => {
  return (
    <div className={`mb-12 ${bgColor} rounded-xl shadow-lg p-8 border-l-4 ${borderColor} transition-all hover:shadow-xl`}>
      <h2 className={`text-4xl text-center font-bold mb-8 ${textColor}`}>{title} Sponsors</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center items-stretch mb-4">
        {sponsors.map(sponsor => (
          <div key={sponsor.id} className="bg-white/45 rounded-xl shadow-md p-6 flex flex-col h-full transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center justify-center mb-5">
              <img 
                src={sponsor.logo} 
                alt={`${sponsor.name} logo`} 
                className={`object-contain ${
                  title === 'Diamond' ? 'w-32 h-32' :
                  title === 'Platinum' ? 'w-28 h-28' :
                  title === 'Gold' ? 'w-24 h-24' : 'w-20 h-20'
                }`} 
              />
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">{sponsor.name}</h3>
            {title !== 'Silver' && (
              <p className="text-gray-600 text-center mb-4 flex-grow">{sponsor.description}</p>
            )}
            <div className="flex justify-center gap-4 mt-auto pt-4 border-t border-gray-100">
              {sponsor.facebook && (
                <a href={sponsor.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">
                  <FaFacebook className="w-5 h-5" />
                </a>
              )}
              {sponsor.instagram && (
                <a href={sponsor.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800 transition-colors">
                  <FaInstagram className="w-5 h-5" /> 
                </a>
              )}
              {sponsor.youtube && (
                <a href={sponsor.youtube} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800 transition-colors">
                  <FaYoutube className="w-5 h-5" />
                </a>
              )}
              {sponsor.email && (
                <a href={`mailto:${sponsor.email}`} className="text-gray-600 hover:text-gray-800 transition-colors">
                  <FaEnvelope className="w-5 h-5" />
                </a>
              )}
              {sponsor.website && (
                <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">
                  <FaGlobe className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BenefitCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-md text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-indigo-100">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-600">
      {description}
    </p>
  </div>
);

const SponsorshipTierCard = ({ title, color, benefits }) => (
  <div className={`bg-white p-5 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-t-4 ${color}`}>
    <h3 className={`font-bold text-xl mb-3`} style={{color: color === 'border-blue-600' ? '#2563EB' : 
                                                      color === 'border-purple-600' ? '#9333EA' : 
                                                      color === 'border-yellow-600' ? '#CA8A04' : 
                                                      '#4B5563'}}>{title}</h3>
    <ul className="list-disc pl-5 text-sm text-gray-600 mt-3 text-left space-y-2">
      {benefits.map((benefit, index) => (
        <li key={index}>{benefit}</li>
      ))}
    </ul>
  </div>
);

const SponsorshipPartners = () => {
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <div className="container mx-auto px-4 py-12">
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
            <FaUsers className="mr-3" />
            Sponsorship Partners
          </h1>
          <p className="mt-2 text-indigo-100 max-w-xl">
            
          We're grateful to our partners who make our mission possible. Their support enables us to build transparency and trust in charitable giving through blockchain technology.
          </p>
        </div>
      </motion.div>
    
      {/* Partners list section */}
      <div id="partners-list">
        <SponsorTier 
          title="Diamond" 
          sponsors={sponsorData.diamond} 
          bgColor="bg-blue-50" 
          borderColor="border-blue-600"
          textColor="text-blue-700"
        />
        
        <SponsorTier 
          title="Platinum" 
          sponsors={sponsorData.platinum} 
          bgColor="bg-purple-50" 
          borderColor="border-purple-600"
          textColor="text-purple-700"
        />
        
        <SponsorTier 
          title="Gold" 
          sponsors={sponsorData.gold} 
          bgColor="bg-yellow-50" 
          borderColor="border-yellow-600"
          textColor="text-yellow-700"
        />
        
        <SponsorTier 
          title="Silver" 
          sponsors={sponsorData.silver} 
          bgColor="bg-gray-50" 
          borderColor="border-gray-500"
          textColor="text-gray-700"
        />
      </div>

      {/* Partnership benefits section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">How Your Partnership Helps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <BenefitCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>}
            title="Platform Development"
            description="Your support helps us maintain and enhance our blockchain-based platform, ensuring transparency and security for all charitable transactions."
          />
          
          <BenefitCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>}
            title="Global Reach"
            description="Partnerships enable us to expand our reach globally, connecting more donors with impactful charitable organizations worldwide."
          />
          
          <BenefitCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>}
            title="Innovation"
            description="We continuously innovate to improve transparency in charitable giving. Your partnership funds research and development of new features."
          />
        </div>
      </div>

      {/* Contact form or CTA */}
      {showContactForm ? (
        <div className="mt-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-indigo-800">Partnership Application</h2>
            <button 
              onClick={() => setShowContactForm(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <SponsorshipContact />
        </div>
      ) : (
        <div className="text-center mt-16 p-10 bg-gray-50 rounded-xl shadow-md">
          <h2 className="text-3xl font-bold mb-6 text-indigo-800">Become a TrustChain Partner</h2>
          <p className="mb-8 max-w-3xl mx-auto text-lg">
            Join our mission to revolutionize charitable giving through blockchain technology. As a partner, you'll help us create a more transparent, accountable, and efficient charitable sector while gaining visibility with our growing community of donors and organizations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-10">
            <SponsorshipTierCard 
              title="Diamond"
              color="border-blue-600"
              benefits={[
                "Big logo placement",
                "Full company intro with key highlights",
                "Maximum brand exposure with featured partnerships"
              ]}
            />
            
            <SponsorshipTierCard 
              title="Platinum"
              color="border-purple-600"
              benefits={[
                "Medium logo placement",
                "Company intro with key highlights",
                "High visibility in selected campaigns & social media"
              ]}
            />
            
            <SponsorshipTierCard 
              title="Gold"
              color="border-yellow-600"
              benefits={[
                "Small logo placement",
                "Name mention in partner section",
                "Moderate exposure on website & newsletters"
              ]}
            />
            
            <SponsorshipTierCard 
              title="Silver"
              color="border-gray-500"
              benefits={[
                "Small logo placement",
                "No name listing",
                "Limited exposure on sponsorship page"
              ]}
            />
          </div>
          <button 
            onClick={() => setShowContactForm(true)}
            className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-indigo-700 transition-all duration-300 shadow-md"
          >
            Apply for Partnership
          </button>
        </div>
      )}
    </div>
  );
};

export default SponsorshipPartners; 