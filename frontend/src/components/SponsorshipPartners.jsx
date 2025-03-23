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
      name: "Vitrox Technologies",
      logo: DiamondImg,
      description: "Non-Profit Organization & NGOs – Charities looking for fixed-proof, automated fund disbursement while reducing operational costs.",
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
  ]
};

const SponsorTier = ({ title, sponsors, bgColor, borderColor }) => {
  const getLogo = (tier, logo) => {
    const sizes = {
      Diamond: "w-40 h-40",
      Platinum: "w-32 h-32",
      Gold: "w-24 h-24",
      Silver: "w-20 h-20"
    };
    return sizes[tier];
  };

  const getSocialLinks = (sponsor) => (
    <div className="flex gap-3 mt-2">
      <a href={sponsor.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      </a>
      <a href={sponsor.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
      </a>
      <a href={sponsor.youtube} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
      </a>
      <a href={`mailto:${sponsor.email}`} className="text-gray-600 hover:text-gray-800">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
      </a>
      <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M21.41 8.64v-.05a10 10 0 1 0-18.82 0v.05a9.86 9.86 0 0 0 0 6.72v.05a10 10 0 1 0 18.82 0v-.05a9.86 9.86 0 0 0 0-6.72zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 0 1 5.08 16zm2.95-8H5.08a7.987 7.987 0 0 1 4.33-3.56A15.558 15.558 0 0 0 8.03 8zM12 20c-.7-1.19-1.23-2.35-1.6-3.56h3.2c-.37 1.21-.9 2.37-1.6 3.56zM13.6 14H10.4c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h3.2c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.4-6h-2.8c.37-1.21.9-2.37 1.6-3.56.7 1.19 1.23 2.35 1.6 3.56zm3.97 6c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>
      </a>
    </div>
  );

  return (
    <div className={`mb-12 ${bgColor} rounded-lg shadow-lg p-6 border-l-4 ${borderColor}`}>
      <h2 className="text-3xl text-center font-bold mb-6">{title} Sponsors</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center items-center mb-12">
        {sponsors.map(sponsor => (
          <div key={sponsor.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
            <div className={`${getLogo(title)} flex items-center justify-center mb-4`}>
              <img src={sponsor.logo} alt={`${sponsor.name} logo`} className="object-contain" />
            </div>
            <h3 className="text-xl font-semibold text-center">{sponsor.name}</h3>
            {title !== 'Silver' && (
              <p className="text-gray-600 text-center my-3">{sponsor.description}</p>
            )}
            {getSocialLinks(sponsor)}
          </div>
        ))}
      </div>
    </div>
  );
};

const SponsorshipPartners = () => {
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 mt-8">
      {/* Header section with consistent styling */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg p-8 mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Partners</h1>
          <p className="text-lg md:text-xl opacity-90 mb-6">
            We're grateful to our partners who make our mission possible. Their support enables us to build transparency and trust in charitable giving through blockchain technology.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <button 
              onClick={() => setShowContactForm(true)}
              className="px-6 py-3 bg-white text-indigo-700 font-medium rounded-md shadow-sm hover:bg-gray-100 transition-colors"
            >
              Become a Partner
            </button>
            <a 
              href="#partners-list"
              className="px-6 py-3 bg-indigo-700 text-white font-medium rounded-md shadow-sm hover:bg-indigo-800 transition-colors"
            >
              View Our Partners
            </a>
          </div>
        </div>
      </div>

      {/* Partners list section */}
      <div id="partners-list">
        <SponsorTier 
          title="Diamond" 
          sponsors={sponsorData.diamond} 
          bgColor="bg-blue-50" 
          borderColor="border-blue-600"
        />
        
        <SponsorTier 
          title="Platinum" 
          sponsors={sponsorData.platinum} 
          bgColor="bg-purple-50" 
          borderColor="border-purple-600"
        />
        
        <SponsorTier 
          title="Gold" 
          sponsors={sponsorData.gold} 
          bgColor="bg-yellow-50" 
          borderColor="border-yellow-600"
        />
        
        <SponsorTier 
          title="Silver" 
          sponsors={sponsorData.silver} 
          bgColor="bg-gray-50" 
          borderColor="border-gray-500"
        />
      </div>

      {/* Partnership benefits section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">How Your Partnership Helps</h2>
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
                Partnerships enable us to expand our reach globally, connecting more donors with impactful charitable organizations worldwide.
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
              We continuously innovate to improve transparency in charitable giving. Your partnership funds research and development of new features.
            </p>
          </div>
        </div>
      </div>

      {/* Contact form or CTA */}
      {showContactForm ? (
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Partnership Application</h2>
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
          <h2 className="text-2xl font-bold mb-4">Become a TrustChain Partner</h2>
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
            Apply for Partnership
          </button>
        </div>
      )}
    </div>
  );
};

export default SponsorshipPartners; 