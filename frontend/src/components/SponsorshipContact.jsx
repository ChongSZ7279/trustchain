import React, { useState } from 'react';

const SponsorshipContact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    sponsorshipLevel: '',
    message: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsLoading(false);
      setIsSubmitted(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        sponsorshipLevel: '',
        message: ''
      });
    }, 1500);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Become a Sponsor</h2>
      
      {isSubmitted ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Thank You for Your Interest!</h3>
          <p className="text-gray-600 mb-4">
            We've received your sponsorship inquiry and will contact you shortly to discuss the partnership opportunities.
          </p>
          <button 
            onClick={() => setIsSubmitted(false)} 
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Submit another inquiry
          </button>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-6">
            Join our mission to bring transparency and trust to charitable giving. Your sponsorship helps us maintain and improve our blockchain-based platform, expand our reach, and make a greater impact in the charitable sector.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company/Organization *</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="sponsorshipLevel" className="block text-sm font-medium text-gray-700 mb-1">Interested Sponsorship Level *</label>
              <select
                id="sponsorshipLevel"
                name="sponsorshipLevel"
                value={formData.sponsorshipLevel}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a level</option>
                <option value="diamond">Diamond</option>
                <option value="platinum">Platinum</option>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="custom">Custom Partnership</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tell us about your organization and your sponsorship goals..."
              ></textarea>
            </div>
            
            <div className="text-center">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-3 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Submit Sponsorship Inquiry'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default SponsorshipContact; 