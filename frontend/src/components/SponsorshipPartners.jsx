import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DiamondImg from '../assets/image/Diamond.png';
import PlatinumImg from '../assets/image/Platinum.png';
import GoldImg from '../assets/image/Gold.png';
import SilverImg from '../assets/image/Silver.png';
import SponsorshipContact from './SponsorshipContact';

const sponsorData = {
  diamond: [
    {
      id: 1,
      name: "Global Tech Solutions",
      logo: DiamondImg,
      description: "Leading technology provider supporting innovative blockchain solutions for humanitarian causes.",
      contact: "contact@globaltechsolutions.com",
      website: "https://www.globaltechsolutions.com"
    },
    {
      id: 2,
      name: "Horizon Foundation",
      logo: DiamondImg,
      description: "International foundation dedicated to transparency and accountability in charitable giving.",
      contact: "partnerships@horizonfoundation.org",
      website: "https://www.horizonfoundation.org"
    },
    {
      id: 3,
      name: "TrustChain",
      logo: DiamondImg,
      description: "Blockchain-based platform for transparent and accountable charitable giving.",
      contact: "tech@trustchain.com",
      website: "https://www.trustchain.com"
    }
  ],
  platinum: [
    {
      id: 1,
      name: "EcoFuture Investments",
      logo: PlatinumImg,
      description: "Sustainable investment firm supporting environmental and social impact projects worldwide.",
      contact: "info@ecofutureinv.com",
      website: "https://www.ecofutureinv.com"
    },
    {
      id: 2,
      name: "Nexus Banking Group",
      logo: PlatinumImg,
      description: "Financial institution pioneering blockchain-based transparency solutions for charitable donations.",
      contact: "partnerships@nexusbanking.com",
      website: "https://www.nexusbanking.com"
    },
    {
      id: 3,
      name: "Quantum Security",
      logo: PlatinumImg,
      description: "Cybersecurity experts ensuring the integrity and safety of blockchain transactions.",
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
    {
      id: 4,
      name: "Education Forward",
      logo: SilverImg,
      description: "Educational nonprofit promoting access to learning resources globally.",
      contact: "programs@educationforward.org",
      website: "https://www.educationforward.org"
    }
  ]
};

const SponsorTier = ({ title, sponsors, bgColor, borderColor, iconColor }) => {
  return (
    <div className={`mb-12 ${bgColor} rounded-lg shadow-lg p-6 border-t-4 ${borderColor}`}>
      <div className="flex items-center justify-center mb-6">
        <div className={`w-12 h-12 ${iconColor} rounded-full flex items-center justify-center mr-3`}>
          {title === "Diamond" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )}
          {title === "Platinum" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          )}
          {title === "Gold" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {title === "Silver" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          )}
        </div>
        <h2 className="text-2xl font-bold text-center">{title} Sponsors</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sponsors.map(sponsor => (
          <div key={sponsor.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center transition-all hover:shadow-xl hover:scale-105">
            <div className="w-24 h-24 flex items-center justify-center mb-4 p-2 rounded-full bg-gray-50">
              <img src={sponsor.logo} alt={`${sponsor.name} logo`} className="w-20 h-20 object-contain" />
            </div>
            <h3 className="text-xl font-semibold text-center">{sponsor.name}</h3>
            <p className="text-gray-600 text-center my-3">{sponsor.description}</p>
            <div className="mt-auto pt-4 w-full border-t border-gray-100">
              <p className="text-sm text-gray-500"><span className="font-medium">Contact:</span> {sponsor.contact}</p>
              <a 
                href={sponsor.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm block mt-1 flex items-center"
              >
                Visit Website
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SponsorshipPartners = () => {
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      {/* Header section with consistent styling */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg p-8 mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Sponsorship Partners</h1>
          <p className="text-lg md:text-xl opacity-90 mb-6">
            We're grateful to our sponsors who make our mission possible. Their support enables us to build transparency and trust in charitable giving through blockchain technology.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <button 
              onClick={() => setShowContactForm(true)}
              className="px-6 py-3 bg-white text-indigo-700 font-medium rounded-md shadow-sm hover:bg-gray-100 transition-colors"
            >
              Become a Sponsor
            </button>
            <a 
              href="#sponsors-list"
              className="px-6 py-3 bg-indigo-700 text-white font-medium rounded-md shadow-sm hover:bg-indigo-800 transition-colors"
            >
              View Our Sponsors
            </a>
          </div>
        </div>
      </div>

      {/* Sponsorship benefits section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">How Your Sponsorship Helps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Platform Development</h3>
            <p className="text-gray-600">
              Your support helps us maintain and enhance our blockchain-based platform, ensuring transparency and security for all charitable transactions.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Global Reach</h3>
            <p className="text-gray-600">
              Sponsorships enable us to expand our reach globally, connecting more donors with impactful charitable organizations worldwide.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Innovation</h3>
            <p className="text-gray-600">
              We continuously innovate to improve transparency in charitable giving. Your sponsorship funds research and development of new features.
            </p>
          </div>
        </div>
      </div>

      {/* Sponsors list section */}
      <div id="sponsors-list">
        <SponsorTier 
          title="Diamond" 
          sponsors={sponsorData.diamond} 
          bgColor="bg-blue-50" 
          borderColor="border-blue-600"
          iconColor="bg-blue-600"
        />
        
        <SponsorTier 
          title="Platinum" 
          sponsors={sponsorData.platinum} 
          bgColor="bg-purple-50" 
          borderColor="border-purple-600"
          iconColor="bg-purple-600"
        />
        
        <SponsorTier 
          title="Gold" 
          sponsors={sponsorData.gold} 
          bgColor="bg-yellow-50" 
          borderColor="border-yellow-600"
          iconColor="bg-yellow-600"
        />
        
        <SponsorTier 
          title="Silver" 
          sponsors={sponsorData.silver} 
          bgColor="bg-gray-50" 
          borderColor="border-gray-500"
          iconColor="bg-gray-500"
        />
      </div>

      {/* Contact form or CTA */}
      {showContactForm ? (
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Sponsorship Application</h2>
            <button 
              onClick={() => setShowContactForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <SponsorshipContact />
        </div>
      ) : (
        <div className="text-center mt-12 p-8 bg-gray-100 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Become a TrustChain Sponsor</h2>
          <p className="mb-6 max-w-3xl mx-auto">
            Join our mission to revolutionize charitable giving through blockchain technology. As a sponsor, you'll help us create a more transparent, accountable, and efficient charitable sector while gaining visibility with our growing community of donors and organizations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <div className="bg-white p-4 rounded shadow-sm">
              <h3 className="font-bold text-blue-600">Diamond</h3>
              <p className="text-sm text-gray-600">Premium placement, featured in all materials, dedicated support</p>
            </div>
            <div className="bg-white p-4 rounded shadow-sm">
              <h3 className="font-bold text-purple-600">Platinum</h3>
              <p className="text-sm text-gray-600">Priority placement, featured in major materials, direct support</p>
            </div>
            <div className="bg-white p-4 rounded shadow-sm">
              <h3 className="font-bold text-yellow-600">Gold</h3>
              <p className="text-sm text-gray-600">Enhanced visibility, featured in select materials</p>
            </div>
            <div className="bg-white p-4 rounded shadow-sm">
              <h3 className="font-bold text-gray-600">Silver</h3>
              <p className="text-sm text-gray-600">Standard visibility, listed in sponsor materials</p>
            </div>
          </div>
          <button 
            onClick={() => setShowContactForm(true)}
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Apply for Sponsorship
          </button>
        </div>
      )}
    </div>
  );
};

export default SponsorshipPartners; 