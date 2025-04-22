import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTree, FaWind, FaSolarPanel, FaWater, FaFilter, FaSortAmountDown, FaSearch, FaInfoCircle } from 'react-icons/fa';

const projectTypes = {
  reforestation: { icon: <FaTree />, color: 'from-green-600 to-emerald-700' },
  wind: { icon: <FaWind />, color: 'from-blue-600 to-cyan-700' },
  solar: { icon: <FaSolarPanel />, color: 'from-yellow-600 to-amber-700' },
  hydro: { icon: <FaWater />, color: 'from-cyan-600 to-blue-700' },
};

const ProjectCard = ({ project, onSelect }) => {
  const projectType = projectTypes[project.type] || projectTypes.reforestation;
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-green-900/20 border border-gray-700"
      onClick={() => onSelect(project)}
    >
      <div className="h-48 overflow-hidden relative">
        <img 
          src={project.image} 
          alt={project.name}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
        />
        <div className={`absolute top-3 right-3 bg-gradient-to-r ${projectType.color} text-white text-xs font-bold px-3 py-1 rounded-full flex items-center`}>
          <span className="mr-1">{projectType.icon}</span>
          {project.type}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent h-20 pointer-events-none" />
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-semibold text-white mb-2">{project.name}</h3>
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{project.description}</p>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-col">
            <span className="text-gray-400 text-xs">Location</span>
            <span className="text-white">{project.location}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-gray-400 text-xs">Verified By</span>
            <span className="text-white">{project.verifier}</span>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-3 mt-2 flex justify-between items-center">
          <div>
            <span className="text-gray-400 text-xs">Price per Credit</span>
            <div className="text-green-400 font-bold">${project.pricePerCredit}</div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 rounded-lg text-white text-sm font-medium"
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const CarbonMarketplace = ({ projects, onSelectProject }) => {
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    priceRange: [0, 1000],
    searchTerm: '',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    let result = [...projects];
    
    // Apply type filter
    if (filters.type !== 'all') {
      result = result.filter(project => project.type === filters.type);
    }
    
    // Apply price range filter
    result = result.filter(
      project => 
        project.pricePerCredit >= filters.priceRange[0] && 
        project.pricePerCredit <= filters.priceRange[1]
    );
    
    // Apply search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(
        project => 
          project.name.toLowerCase().includes(term) || 
          project.description.toLowerCase().includes(term) ||
          project.location.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'priceAsc':
          return a.pricePerCredit - b.pricePerCredit;
        case 'priceDesc':
          return b.pricePerCredit - a.pricePerCredit;
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });
    
    setFilteredProjects(result);
  }, [projects, filters, sortBy]);

  const handleTypeFilter = (type) => {
    setFilters({...filters, type});
  };
  
  const handlePriceChange = (range) => {
    setFilters({...filters, priceRange: range});
  };
  
  const handleSearch = (e) => {
    setFilters({...filters, searchTerm: e.target.value});
  };
  
  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-green-400 mb-4">Carbon Credits Marketplace</h1>
          <p className="text-gray-300 max-w-3xl">
            Browse and purchase carbon credits from verified projects around the world. 
            Each credit represents one metric ton of carbon dioxide removed or avoided.
          </p>
        </motion.div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-700 sticky top-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button 
                  onClick={toggleFilters}
                  className="md:hidden bg-gray-700 p-2 rounded-md hover:bg-gray-600"
                >
                  <FaFilter />
                </button>
              </div>
              
              <AnimatePresence>
                {(isFilterOpen || window.innerWidth >= 768) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-400 mb-3">Project Type</h3>
                      <div className="space-y-2">
                        {['all', ...Object.keys(projectTypes)].map(type => (
                          <button
                            key={type}
                            onClick={() => handleTypeFilter(type)}
                            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              filters.type === type 
                                ? 'bg-green-800 text-white' 
                                : 'hover:bg-gray-700 text-gray-300'
                            }`}
                          >
                            {type === 'all' ? 'All Types' : (
                              <div className="flex items-center">
                                <span className="mr-2 text-green-500">
                                  {projectTypes[type].icon}
                                </span>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-400 mb-3">Price Range</h3>
                      <div className="px-2">
                        <div className="flex justify-between text-sm text-gray-400 mb-2">
                          <span>${filters.priceRange[0]}</span>
                          <span>${filters.priceRange[1]}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          step="10"
                          value={filters.priceRange[1]}
                          onChange={(e) => handlePriceChange([filters.priceRange[0], parseInt(e.target.value)])}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-700">
                      <button
                        onClick={() => setFilters({type: 'all', priceRange: [0, 1000], searchTerm: ''})}
                        className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="flex-grow">
            <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700 flex flex-col sm:flex-row items-center">
              <div className="relative flex-grow mb-4 sm:mb-0">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={filters.searchTerm}
                  onChange={handleSearch}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-2 sm:ml-4">
                <span className="text-gray-400 text-sm hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="newest">Newest</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-300 text-sm">
                Showing <span className="font-semibold">{filteredProjects.length}</span> of <span className="font-semibold">{projects.length}</span> projects
              </p>
              
              <div className="flex items-center text-gray-400 text-sm">
                <FaInfoCircle className="mr-2" />
                <span>All projects are independently verified</span>
              </div>
            </div>
            
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredProjects.map(project => (
                  <ProjectCard 
                    key={project.id} 
                    project={project}
                    onSelect={onSelectProject}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
            
            {filteredProjects.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700 mt-8"
              >
                <FaSearch className="mx-auto h-10 w-10 text-gray-500 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No projects found</h3>
                <p className="text-gray-400">
                  Try adjusting your search or filter criteria to find more results.
                </p>
                <button
                  onClick={() => setFilters({type: 'all', priceRange: [0, 1000], searchTerm: ''})}
                  className="mt-4 py-2 px-6 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonMarketplace; 