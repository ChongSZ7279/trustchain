import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  
  const faqCategories = {
    "General": [
      {
        question: "What is TrustChain?",
        answer: "TrustChain is a platform that connects donors with charitable organizations, providing transparency and accountability in charitable giving through blockchain technology."
      },
      {
        question: "How does TrustChain ensure transparency?",
        answer: "TrustChain uses blockchain technology to record all transactions, making them immutable and publicly verifiable. This ensures that all donations are traceable and that organizations are accountable for the funds they receive."
      }
    ],
    "Account Management": [
      {
        question: "How do I create an account?",
        answer: "You can create an account by clicking on the 'Register' button in the navigation bar and following the registration process. You can register either as an individual user or as an organization."
      },
      {
        question: "How do I register my organization?",
        answer: "Click on 'Register' in the navigation bar and select 'Organization Registration'. You'll need to provide details about your organization, including its name, description, and contact information."
      }
    ],
    "Donations": [
      {
        question: "How can I donate to a charity?",
        answer: "After logging in, you can browse the list of charities, select one that interests you, and click on the 'Donate' button on their page to make a contribution."
      },
      {
        question: "How can I track my donations?",
        answer: "Once logged in, you can view all your donations in your user dashboard. Each donation includes details about the recipient charity and the transaction status."
      }
    ],
    "Organizations": [
      {
        question: "Can I create a charity campaign?",
        answer: "Yes, registered organizations can create charity campaigns through their dashboard. These campaigns can specify funding goals, timelines, and the causes they support."
      }
    ],
    "Support": [
      {
        question: "How can I contact support?",
        answer: "For any questions or issues, please email us at support@trustchain.org or use the contact form available on our website."
      }
    ]
  };

  // Flatten the FAQ items for search functionality
  const allFaqItems = Object.entries(faqCategories).flatMap(([category, items]) => 
    items.map(item => ({ ...item, category }))
  );

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFaqs([]);
      return;
    }
    
    const filtered = allFaqItems.filter(item => 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredFaqs(filtered);
  }, [searchQuery]);

  // Filter items based on active category
  const getDisplayedItems = () => {
    if (activeCategory === 'all') {
      return faqCategories;
    }
    
    return {
      [activeCategory]: faqCategories[activeCategory]
    };
  };

  const getCategoryIcon = (category) => {
    const icons = {
      "General": (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
        </svg>
      ),
      "Account Management": (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
          <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
        </svg>
      ),
      "Donations": (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.25-11.25v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 1.5 0zm0 4v4.75a.75.75 0 0 1-1.5 0v-4.75a.75.75 0 0 1 1.5 0z"/>
        </svg>
      ),
      "Organizations": (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5Z"/>
          <path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6Z"/>
        </svg>
      ),
      "Support": (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 1a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a6 6 0 1 1 12 0v6a2.5 2.5 0 0 1-2.5 2.5H9.366a1 1 0 0 1-.866.5h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 .866.5H11.5A1.5 1.5 0 0 0 13 12h-1a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h1V6a5 5 0 0 0-5-5z"/>
        </svg>
      )
    };

    return icons[category] || (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
      </svg>
    );
  };

  const renderFaqItem = (item, index, isSearchResult = false) => (
    <motion.div 
      key={index} 
      className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <button 
        className={`w-full flex justify-between items-center p-5 transition-colors duration-200 focus:outline-none ${
          activeIndex === index ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'
        }`}
        onClick={() => toggleAccordion(index)}
        aria-expanded={activeIndex === index}
      >
        <h3 className="text-lg font-medium text-gray-800 text-left">{item.question}</h3>
        <span className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
          activeIndex === index ? 'bg-blue-500 text-white rotate-180' : 'bg-gray-100 text-blue-500'
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
          </svg>
        </span>
      </button>
      
      <AnimatePresence>
        {activeIndex === index && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-5 bg-gray-50 border-t border-gray-200">
              <p className="text-gray-700">{item.answer}</p>
              {isSearchResult && (
                <p className="mt-2 text-sm text-gray-500 flex items-center">
                  <span className="mr-2">Category:</span> 
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {item.category}
                  </span>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600 mb-8">Find answers to common questions about using TrustChain</p>
        
        <div className="relative max-w-xl mx-auto mb-8">
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 pl-12 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          <svg 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
            width="20" 
            height="20" 
            fill="currentColor" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        {!searchQuery && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {Object.keys(faqCategories).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                  activeCategory === category 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{getCategoryIcon(category)}</span>
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {searchQuery ? (
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Search Results</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'}
                </span>
              </div>
              {filteredFaqs.map((item, index) => renderFaqItem(item, index, true))}
            </>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-gray-500">Try different keywords or browse the categories below.</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                View all FAQs
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(getDisplayedItems()).map(([category, items], categoryIndex) => (
            <motion.div 
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center mb-4 bg-gray-50 p-3 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                  {getCategoryIcon(category)}
                </div>
                <h2 className="text-xl font-semibold text-gray-700">{category}</h2>
                <span className="ml-3 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="space-y-4">
                {items.map((item, itemIndex) => 
                  renderFaqItem(item, `${category}-${itemIndex}`)
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      <div className="mt-16 bg-blue-50 rounded-lg p-6 border border-blue-100">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Can't find what you're looking for?</h3>
        <p className="text-blue-700 mb-4">Our support team is here to help you with any questions you might have.</p>
        <a 
          href="mailto:support@trustchain.org" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
          </svg>
          Contact Support
        </a>
      </div>
    </div>
  );
};

export default FAQ;