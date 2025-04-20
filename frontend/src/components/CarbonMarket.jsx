import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaLeaf, FaChartLine, FaPlus, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const CarbonMarket = () => {
  const { currentUser } = useAuth();
  const tradingMarketRef = useRef(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [modalType, setModalType] = useState(''); // 'sell' or 'buy'
  const [newListing, setNewListing] = useState({
    company: '',
    carbonTons: '',
    price: '',
    rate: ''
  });
  
  // Sample data for the listings
  const [sellerListings, setSellerListings] = useState([
    { id: 1, company: 'xxx Company', carbonTons: 1, price: '100 Eth', rate: 100, usdPrice: '1000USD' },
    { id: 2, company: 'yyyy Sdn. Bhd', carbonTons: 2, price: '220 Eth', rate: 110, usdPrice: '2000USD' },
    { id: 3, company: 'Manufacturing Company', carbonTons: 3, price: '250 Eth', rate: 83, usdPrice: '3000USD' },
  ]);

  const [buyerListings, setBuyerListings] = useState([
    { id: 1, company: 'We Care', carbonTons: 1, price: '100 Eth', rate: 100, usdPrice: '1000USD' },
    { id: 2, company: 'Go Green', carbonTons: 2, price: '220 Eth', rate: 110, usdPrice: '2000USD' },
    { id: 3, company: 'GreenEarth', carbonTons: 3, price: '250 Eth', rate: 83, usdPrice: '3000USD' },
  ]);

  const handleGetStarted = () => {
    // if (!currentUser) {
    //   alert('Please login to get started');
    //   return;
    // }
    tradingMarketRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleCreateListing = (type) => {
    setModalType(type);
    setIsCreateModalOpen(true);
  };

  const handleSubmitListing = (e) => {
    e.preventDefault();
    const listingData = {
      id: modalType === 'sell' 
        ? sellerListings.length + 1
        : buyerListings.length + 1,
      ...newListing,
      usdPrice: `${parseFloat(newListing.price) * 1000}USD` // Simple conversion for demo
    };

    if (modalType === 'sell') {
      setSellerListings([...sellerListings, listingData]);
    } else {
      setBuyerListings([...buyerListings, listingData]);
    }

    setIsCreateModalOpen(false);
    setNewListing({ company: '', carbonTons: '', price: '', rate: '' });
  };

  const handleBuySell = (listing, type) => {
    setSelectedListing(listing);
    setModalType(type);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmTransaction = () => {
    if (modalType === 'buy') {
      // Remove the listing and reindex the remaining listings
      const updatedListings = sellerListings
        .filter(item => item.id !== selectedListing.id)
        .map((item, index) => ({
          ...item,
          id: index + 1
        }));
      setSellerListings(updatedListings);
    } else {
      // Remove the listing and reindex the remaining listings
      const updatedListings = buyerListings
        .filter(item => item.id !== selectedListing.id)
        .map((item, index) => ({
          ...item,
          id: index + 1
        }));
      setBuyerListings(updatedListings);
    }
    setIsConfirmModalOpen(false);
    setSelectedListing(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="bg-indigo-100 rounded-xl p-8 mb-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Carbon Footprint Marketplace</h1>
            <div className="w-2/3">
              {/* <div className="md:w-2/3"> */}
                <p className="text-lg text-gray-600 mb-6">
                  Our Carbon Footprint Marketplace is a blockchain-powered platform that enables companies to sell carbon credits...
                </p>
            <button 
              onClick={handleGetStarted}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors duration-200"
            >
              Get Started
            </button>
          </div>
            {/* Image section */}
          <div className="w-full md:w-1/3 flex justify-center">
            <img src="/carbon-graph.svg" alt="Carbon Market Growth" className="w-64 h-64" />
          </div>
        </div>

        {/* Trading Market Section */}
        <div ref={tradingMarketRef} className="bg-white rounded-xl shadow-lg p-8 mb-8 scroll-mt-20">
          {/* <h2 className="text-2xl font-bold text-gray-900 mb-6">Trading Market</h2> */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <FaLeaf className="w-32 h-32 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Carbon Footprint Pool</h3>
                <p className="text-4xl font-bold text-gray-900">10,053</p>
                <p className="text-gray-600">TONS</p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img src="/market-chart.svg" alt="Market Chart" className="w-full h-64 object-contain" />
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Seller Listings */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Seller Listing</h3>
              <button 
                onClick={() => handleCreateListing('sell')}
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
              >
                <FaPlus className="mr-1" /> Create
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-3">No.</th>
                    <th className="pb-3">Company</th>
                    <th className="pb-3">Carbon (Tons)</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Rate (per tons)</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {sellerListings.map((listing) => (
                    <tr key={listing.id} className="border-t border-gray-100">
                      <td className="py-3">{listing.id}</td>
                      <td className="py-3">{listing.company}</td>
                      <td className="py-3">{listing.carbonTons}</td>
                      <td className="py-3">
                        {listing.price}
                        <br />
                        <span className="text-sm text-gray-500">≈{listing.usdPrice}</span>
                      </td>
                      <td className="py-3">{listing.rate}</td>
                      <td className="py-3">
                        <button 
                          onClick={() => handleBuySell(listing, 'buy')}
                          className="bg-indigo-600 text-white px-4 py-1 rounded text-sm hover:bg-indigo-700"
                        >
                          Buy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Buyer Listings */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Buyers Listing</h3>
              <button 
                onClick={() => handleCreateListing('buy')}
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
              >
                <FaPlus className="mr-1" /> Create
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-3">No.</th>
                    <th className="pb-3">Company</th>
                    <th className="pb-3">Carbon (Tons)</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Rate (per tons)</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {buyerListings.map((listing) => (
                    <tr key={listing.id} className="border-t border-gray-100">
                      <td className="py-3">{listing.id}</td>
                      <td className="py-3">{listing.company}</td>
                      <td className="py-3">{listing.carbonTons}</td>
                      <td className="py-3">
                        {listing.price}
                        <br />
                        <span className="text-sm text-gray-500">≈{listing.usdPrice}</span>
                      </td>
                      <td className="py-3">{listing.rate}</td>
                      <td className="py-3">
                        <button 
                          onClick={() => handleBuySell(listing, 'sell')}
                          className="bg-indigo-600 text-white px-4 py-1 rounded text-sm hover:bg-indigo-700"
                        >
                          Sell
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create Listing Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Create {modalType === 'sell' ? 'Seller' : 'Buyer'} Listing
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmitListing}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input
                    type="text"
                    required
                    value={newListing.company}
                    onChange={(e) => setNewListing({...newListing, company: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Carbon (Tons)</label>
                  <input
                    type="number"
                    required
                    value={newListing.carbonTons}
                    onChange={(e) => setNewListing({...newListing, carbonTons: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price (ETH)</label>
                  <input
                    type="number"
                    required
                    value={newListing.price}
                    onChange={(e) => setNewListing({...newListing, price: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rate (per ton)</label>
                  <input
                    type="number"
                    required
                    value={newListing.rate}
                    onChange={(e) => setNewListing({...newListing, rate: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                >
                  Create Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Transaction Modal */}
      {isConfirmModalOpen && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Confirm {modalType === 'buy' ? 'Purchase' : 'Sale'}
              </h3>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to {modalType === 'buy' ? 'buy' : 'sell'} {selectedListing.carbonTons} tons of carbon credits for {selectedListing.price} ({selectedListing.usdPrice})?
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransaction}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default CarbonMarket; 