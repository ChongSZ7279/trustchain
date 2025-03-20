import React, { useState } from 'react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: "What is TrustChain?",
      answer: "TrustChain is a platform that connects donors with charitable organizations, providing transparency and accountability in charitable giving through blockchain technology."
    },
    {
      question: "How do I create an account?",
      answer: "You can create an account by clicking on the 'Register' button in the navigation bar and following the registration process. You can register either as an individual user or as an organization."
    },
    {
      question: "How can I donate to a charity?",
      answer: "After logging in, you can browse the list of charities, select one that interests you, and click on the 'Donate' button on their page to make a contribution."
    },
    {
      question: "How do I register my organization?",
      answer: "Click on 'Register' in the navigation bar and select 'Organization Registration'. You'll need to provide details about your organization, including its name, description, and contact information."
    },
    {
      question: "How can I track my donations?",
      answer: "Once logged in, you can view all your donations in your user dashboard. Each donation includes details about the recipient charity and the transaction status."
    },
    {
      question: "How does TrustChain ensure transparency?",
      answer: "TrustChain uses blockchain technology to record all transactions, making them immutable and publicly verifiable. This ensures that all donations are traceable and that organizations are accountable for the funds they receive."
    },
    {
      question: "Can I create a charity campaign?",
      answer: "Yes, registered organizations can create charity campaigns through their dashboard. These campaigns can specify funding goals, timelines, and the causes they support."
    },
    {
      question: "How can I contact support?",
      answer: "For any questions or issues, please email us at support@trustchain.org or use the contact form available on our website."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600">Find answers to common questions about using TrustChain</p>
      </div>

      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <div 
            key={index} 
            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
          >
            <button 
              className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none"
              onClick={() => toggleAccordion(index)}
              aria-expanded={activeIndex === index}
            >
              <h3 className="text-lg font-medium text-gray-800 text-left">{item.question}</h3>
              <span className="text-2xl text-blue-500">
                {activeIndex === index ? '−' : '+'}
              </span>
            </button>
            <div 
              className={`overflow-hidden transition-all duration-300 ${
                activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-5 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-700">{item.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ; 