import React from 'react';
import { motion } from 'framer-motion';
import { FaLeaf, FaTree, FaRecycle, FaChartLine } from 'react-icons/fa';

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-gradient-to-br from-green-900/40 to-emerald-900/30 p-6 rounded-xl backdrop-blur-sm border border-white/10 shadow-xl hover:shadow-green-900/20 transition-all group"
  >
    <div className="mb-4 bg-green-800/30 p-3 rounded-full w-14 h-14 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-green-50 mb-2 group-hover:text-green-300 transition-colors">
      {title}
    </h3>
    <p className="text-gray-300">
      {description}
    </p>
  </motion.div>
);

const CarbonAppLanding = ({ onConnect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-green-900 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute -left-40 -top-40 w-96 h-96 bg-green-500/20 rounded-full blur-3xl" />
        <div className="absolute -right-40 -bottom-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <motion.div 
          className="absolute top-1/4 right-1/4 w-4 h-4 bg-green-400 rounded-full"
          animate={{
            y: [0, 100, 0],
            opacity: [0.7, 0.4, 0.7],
          }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div 
          className="absolute bottom-1/3 left-1/4 w-6 h-6 bg-green-300 rounded-full"
          animate={{
            y: [0, -70, 0],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        />
        <div className="grid grid-cols-12 grid-rows-12 gap-8 h-full">
          {[...Array(144)].map((_, i) => (
            <div key={i} className="w-full h-full border-t border-l border-white/5"></div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div 
            className="inline-flex items-center mb-4 bg-white/10 px-4 py-2 rounded-full text-sm text-green-300 backdrop-blur-sm border border-white/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Built on Scroll Network with Trust Chain Technology
          </motion.div>
          
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-emerald-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Carbon Credits Marketplace
          </motion.h1>
          
          <motion.p 
            className="max-w-2xl mx-auto text-xl text-gray-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Buy, sell, and track carbon credits with transparent verification on the blockchain. 
            Make a real impact while supporting sustainable projects around the world.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
          >
            <motion.button
              onClick={onConnect}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg shadow-lg shadow-green-700/30 hover:shadow-green-700/50 transform hover:-translate-y-1 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Connect Wallet to Begin
            </motion.button>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <FeatureCard 
            icon={<FaLeaf className="w-6 h-6" />}
            title="Verified Projects"
            description="All carbon credits are sourced from independently verified sustainable projects with proven impact."
            delay={0.7}
          />
          <FeatureCard 
            icon={<FaRecycle className="w-6 h-6" />}
            title="Transparent Tracking"
            description="Follow your carbon credits throughout their lifecycle with complete transparency on the blockchain."
            delay={0.9}
          />
          <FeatureCard 
            icon={<FaTree className="w-6 h-6" />}
            title="Real World Impact"
            description="Support reforestation, renewable energy, and other projects that make a measurable difference."
            delay={1.1}
          />
          <FeatureCard 
            icon={<FaChartLine className="w-6 h-6" />}
            title="Portfolio Growth"
            description="Watch your environmental impact grow while potentially benefiting from appreciation in credit value."
            delay={1.3}
          />
        </div>

        <motion.div 
          className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm border border-white/10 shadow-xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.7 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h2 className="text-2xl font-bold mb-4 text-green-300">How It Works</h2>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <span className="bg-green-800/30 text-green-400 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</span>
                  <p>Connect your wallet and browse available carbon credit projects</p>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-800/30 text-green-400 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</span>
                  <p>Purchase credits directly with cryptocurrency</p>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-800/30 text-green-400 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</span>
                  <p>Receive NFT certificates as proof of your environmental contribution</p>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-800/30 text-green-400 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">4</span>
                  <p>Track the impact of your contributions in real-time</p>
                </li>
              </ol>
            </div>
            <div className="bg-gradient-to-br from-green-400/10 to-emerald-400/10 p-6 rounded-xl border border-white/10 w-full md:w-96 flex-shrink-0">
              <div className="text-center mb-4">
                <FaTree className="mx-auto h-12 w-12 text-green-400 mb-2" />
                <h3 className="text-lg font-medium text-white">Start Your Impact Today</h3>
                <p className="text-gray-300 text-sm mt-2 mb-4">Join thousands of individuals and companies offsetting their carbon footprint</p>
              </div>
              <motion.button
                onClick={onConnect}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg border border-white/5 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Connect Wallet
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CarbonAppLanding; 