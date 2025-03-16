import React from 'react';
import { 
  FaSearch, 
  FaFilter,
  FaMoneyBillWave,
  FaUndo
} from 'react-icons/fa';

export default function SidebarFilters({
  searchTerm,
  setSearchTerm,
  selectedCategories,
  toggleCategory,
  fundRange,
  handleFundRangeChange,
  selectedStatuses,
  toggleStatus,
  applyFilters,
  resetFilters,
  categoryOptions,
  statusOptions
}) {
  return (
    <div className="p-4 space-y-6">
      {/* Search */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
          Search Organizations
        </label>
        <div className="relative rounded-md shadow-sm">
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-gray-300 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Search by name or description"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Categories */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
        <div className="space-y-2">
          {categoryOptions.map(category => (
            <div key={category} className="flex items-center">
              <input
                id={`category-${category}`}
                name={`category-${category}`}
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => toggleCategory(category)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor={`category-${category}`} className="ml-2 block text-sm text-gray-700">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Target Fund Range */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <FaMoneyBillWave className="mr-2 text-green-600" />
          Target Fund Range
        </h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="min-fund" className="block text-xs text-gray-500">
              Min: ${fundRange.min}
            </label>
            <input
              type="range"
              id="min-fund"
              min="0"
              max="100000"
              step="1000"
              value={fundRange.min}
              onChange={(e) => handleFundRangeChange(e, 'min')}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
                    [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:bg-indigo-700 
                    [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:bg-indigo-600 
                    [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md"
            />
          </div>
          <div>
            <label htmlFor="max-fund" className="block text-xs text-gray-500">
              Max: ${fundRange.max}
            </label>
            <input
              type="range"
              id="max-fund"
              min="0"
              max="100000"
              step="1000"
              value={fundRange.max}
              onChange={(e) => handleFundRangeChange(e, 'max')}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
                  [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full 
                  [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:bg-indigo-700 
                  [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:bg-indigo-600 
                  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>$0</span>
            <span>$100,000</span>
          </div>
        </div>
      </div>
      
      {/* Status */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
        <div className="space-y-2">
          {statusOptions.map(status => (
            <div key={status.value} className="flex items-center">
              <input
                id={`status-${status.value}`}
                name={`status-${status.value}`}
                type="checkbox"
                checked={selectedStatuses.includes(status.value)}
                onChange={() => toggleStatus(status.value)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor={`status-${status.value}`} className="ml-2 flex items-center text-sm text-gray-700">
                <span>{status.label}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Filters Button */}
      <button
        onClick={applyFilters}
        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <FaFilter className="mr-2" />
        Apply Filters
      </button>
      <button 
        onClick={resetFilters}
        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <FaUndo className="mr-2" />
        Reset
      </button>
    </div>
  );
} 