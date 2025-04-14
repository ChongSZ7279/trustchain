import React, { useState } from 'react';

const SponsorshipContact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    sponsorshipLevel: '',
    message: '',
    industry: '',
    hearAboutUs: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!/^\S+@\S+\.\S+$/.test(formData.email) && formData.email.trim()) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!formData.company.trim()) newErrors.company = 'Company is required';
    } else if (step === 2) {
      if (!formData.sponsorshipLevel) newErrors.sponsorshipLevel = 'Please select a sponsorship level';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;
    
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
        message: '',
        industry: '',
        hearAboutUs: ''
      });
      setCurrentStep(1);
    }, 1500);
  };

  const sponsorshipLevels = [
    { id: 'diamond', name: 'Diamond', description: 'Premier visibility across all platforms and events', price: '$25,000+', color: 'bg-blue-100 text-blue-800 border-blue-600' },
    { id: 'platinum', name: 'Platinum', description: 'Top-tier recognition and premium promotion opportunities', price: '$15,000', color: 'bg-purple-100 text-purple-800 border-purple-600' },
    { id: 'gold', name: 'Gold', description: 'Enhanced visibility and promotional benefits', price: '$10,000', color: 'bg-yellow-100 text-yellow-800 border-yellow-600' },
    { id: 'silver', name: 'Silver', description: 'Standard recognition and promotional placement', price: '$5,000', color: 'bg-gray-100 text-gray-800 border-gray-500' },
    { id: 'custom', name: 'Custom Partnership', description: 'Tailored sponsorship package to meet your specific goals', price: 'Custom', color: 'bg-green-100 text-green-800 border-green-600' }
  ];

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-10">
        {[1, 2, 3].map(step => (
          <div key={step} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep === step 
                ? 'bg-indigo-600 text-white' 
                : currentStep > step 
                  ? 'bg-indigo-200 text-indigo-800' 
                  : 'bg-gray-200 text-gray-600'
            } font-medium shadow-sm transition-all duration-300`}>
              {currentStep > step ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step
              )}
            </div>
            {step < 3 && (
              <div className={`w-16 h-1 ${currentStep > step ? 'bg-indigo-200' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPersonalInfoForm = () => {
    return (
      <>
        <h3 className="text-2xl font-semibold mb-6 text-indigo-800">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200`}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200`}
              placeholder="Enter your email address"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Company/Organization <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${errors.company ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200`}
              placeholder="Enter your company name"
            />
            {errors.company && <p className="mt-1 text-sm text-red-500">{errors.company}</p>}
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="Enter your phone number"
            />
          </div>
          
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <select
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">Select an industry</option>
              <option value="technology">Technology</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="retail">Retail</option>
              <option value="nonprofit">Nonprofit</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="hearAboutUs" className="block text-sm font-medium text-gray-700 mb-1">
              How did you hear about us?
            </label>
            <select
              id="hearAboutUs"
              name="hearAboutUs"
              value={formData.hearAboutUs}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">Select an option</option>
              <option value="search">Search Engine</option>
              <option value="social">Social Media</option>
              <option value="referral">Referral</option>
              <option value="event">Event</option>
              <option value="advertisement">Advertisement</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </>
    );
  };

  const renderSponsorshipSelection = () => {
    return (
      <>
        <h3 className="text-2xl font-semibold mb-4 text-indigo-800">Sponsorship Options</h3>
        <p className="text-gray-600 mb-8">
          Choose the sponsorship level that aligns with your organization's goals and budget.
        </p>
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Select Sponsorship Level <span className="text-red-500">*</span>
          </label>
          
          <div className="grid grid-cols-1 gap-4">
            {sponsorshipLevels.map(level => (
              <div 
                key={level.id}
                className={`border-l-4 rounded-lg p-5 cursor-pointer transition-all duration-300 ${
                  formData.sponsorshipLevel === level.id 
                    ? `${level.color} border-l-8 shadow-md` 
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                }`}
                onClick={() => {
                  setFormData({...formData, sponsorshipLevel: level.id});
                  if (errors.sponsorshipLevel) {
                    setErrors({...errors, sponsorshipLevel: null});
                  }
                }}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 ${
                    formData.sponsorshipLevel === level.id 
                      ? 'border-indigo-600' 
                      : 'border-gray-400'
                  } flex items-center justify-center mr-4`}>
                    {formData.sponsorshipLevel === level.id && (
                      <div className="w-3 h-3 rounded-full bg-indigo-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-lg">{level.name}</h4>
                      <span className="font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm">{level.price}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">{level.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {errors.sponsorshipLevel && (
            <p className="mt-2 text-sm text-red-500">{errors.sponsorshipLevel}</p>
          )}
        </div>
      </>
    );
  };

  const renderAdditionalInfo = () => {
    return (
      <>
        <h3 className="text-2xl font-semibold mb-4 text-indigo-800">Additional Information</h3>
        <p className="text-gray-600 mb-8">
          Please share any specific goals or questions about your sponsorship.
        </p>
        
        <div className="mb-8">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Your Sponsorship Goals
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            placeholder="Tell us about your organization and what you hope to achieve through this partnership..."
          ></textarea>
        </div>
        
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-md font-medium text-indigo-800">What happens next?</h4>
              <div className="mt-2 text-sm text-indigo-700">
                <p>Once you submit this form, our sponsorship team will review your information and contact you within 2 business days to discuss partnership opportunities.</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfoForm();
      case 2:
        return renderSponsorshipSelection();
      case 3:
        return renderAdditionalInfo();
      default:
        return null;
    }
  };

  const renderFormNavigation = () => {
    return (
      <div className="flex justify-between mt-10">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handlePrevStep}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-sm"
          >
            Back
          </button>
        ) : (
          <div></div>
        )}
        
        {currentStep < 3 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-md"
          >
            Continue
          </button>
        ) : (
          <button
            type="submit"
            disabled={isLoading}
            className={`px-8 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : 'Submit Application'}
          </button>
        )}
      </div>
    );
  };

  const renderSuccessMessage = () => {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-8">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-3xl font-bold mb-4 text-indigo-800">Thank You for Your Interest!</h3>
        <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg">
          We've received your sponsorship inquiry and will contact you within 2 business days to discuss partnership opportunities.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-5">
          <button 
            onClick={() => setIsSubmitted(false)} 
            className="px-8 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all duration-300"
          >
            Submit another inquiry
          </button>
          <a 
            href="#" 
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md"
          >
            View Sponsorship Benefits
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-indigo-800 mb-2">Partner With Us</h2>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto text-lg">
          Join our mission to bring transparency and trust to charitable giving. Your sponsorship empowers positive change in the charitable sector.
        </p>
      </div>
      
      {isSubmitted ? (
        renderSuccessMessage()
      ) : (
        <>
          {renderStepIndicator()}
          
          <form onSubmit={handleSubmit} className="transition-all duration-500">
            {renderStep()}
            {renderFormNavigation()}
          </form>
        </>
      )}
      
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="transform transition-all duration-300 hover:scale-105">
            <div className="text-indigo-600 font-bold text-3xl mb-2">50+</div>
            <div className="text-gray-500 text-sm">Corporate Partners</div>
          </div>
          <div className="transform transition-all duration-300 hover:scale-105">
            <div className="text-indigo-600 font-bold text-3xl mb-2">100K+</div>
            <div className="text-gray-500 text-sm">Platform Users</div>
          </div>
          <div className="transform transition-all duration-300 hover:scale-105">
            <div className="text-indigo-600 font-bold text-3xl mb-2">$2.5M</div>
            <div className="text-gray-500 text-sm">Funds Raised</div>
          </div>
          <div className="transform transition-all duration-300 hover:scale-105">
            <div className="text-indigo-600 font-bold text-3xl mb-2">200+</div>
            <div className="text-gray-500 text-sm">Verified Charities</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorshipContact;