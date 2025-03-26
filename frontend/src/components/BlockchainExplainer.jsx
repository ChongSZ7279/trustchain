import React, { useState } from 'react';
import { FaEthereum, FaExchangeAlt, FaCheckCircle, FaLock, FaChartLine, FaHandHoldingUsd } from 'react-icons/fa';

const BlockchainExplainer = () => {
  const [activeTab, setActiveTab] = useState('how-it-works');

  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Understanding Blockchain Donations
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            How TrustChain uses blockchain technology to ensure transparency and trust
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mt-12 border-b border-gray-200">
          <nav className="flex justify-center -mb-px space-x-8">
            <button
              onClick={() => setActiveTab('how-it-works')}
              className={`${
                activeTab === 'how-it-works'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              How It Works
            </button>
            <button
              onClick={() => setActiveTab('smart-contracts')}
              className={`${
                activeTab === 'smart-contracts'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Smart Contracts
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`${
                activeTab === 'milestones'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Milestone Funding
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-10">
          {activeTab === 'how-it-works' && (
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100">
                  <FaEthereum className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Connect Your Wallet</h3>
                <p className="mt-2 text-base text-gray-500">
                  Connect your Ethereum wallet (like MetaMask) to our platform to make secure blockchain donations.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100">
                  <FaExchangeAlt className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Make a Donation</h3>
                <p className="mt-2 text-base text-gray-500">
                  Choose a charity or specific task to fund, enter the amount, and confirm the transaction in your wallet.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100">
                  <FaCheckCircle className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Track Your Impact</h3>
                <p className="mt-2 text-base text-gray-500">
                  Your donation is recorded on the blockchain and you can track its usage and impact in real-time.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'smart-contracts' && (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">What are Smart Contracts?</h3>
                <p className="text-gray-600 mb-4">
                  Smart contracts are self-executing contracts with the terms directly written into code. On TrustChain, our smart contracts:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>Automatically record all donations on the Ethereum blockchain</li>
                  <li>Ensure funds are only released when predefined conditions are met</li>
                  <li>Create a permanent, tamper-proof record of all transactions</li>
                  <li>Eliminate the need for intermediaries, reducing costs and increasing efficiency</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Our Smart Contract Functions:</h4>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <FaHandHoldingUsd className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <h5 className="text-md font-medium text-gray-900">donate(charityId)</h5>
                      <p className="text-sm text-gray-500">Sends funds directly to a specific charity</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <FaLock className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <h5 className="text-md font-medium text-gray-900">fundTask(taskId)</h5>
                      <p className="text-sm text-gray-500">Allocates funds to a specific task within a charity</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <FaChartLine className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <h5 className="text-md font-medium text-gray-900">getCharityBalance(charityId)</h5>
                      <p className="text-sm text-gray-500">Checks the current balance of a charity</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'milestones' && (
            <div>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Milestone-Based Funding</h3>
                <p className="text-gray-600">
                  Our platform uses milestone-based funding to ensure accountability and transparency. Here's how it works:
                </p>
              </div>
              
              <div className="relative">
                {/* Timeline */}
                <div className="absolute top-0 left-6 h-full w-1 bg-indigo-200" aria-hidden="true"></div>
                
                <div className="space-y-8">
                  {/* Milestone 1 */}
                  <div className="relative">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center">
                          <span className="text-white font-bold">1</span>
                        </div>
                      </div>
                      <div className="ml-6">
                        <h4 className="text-lg font-medium text-gray-900">Task Creation with Milestones</h4>
                        <p className="mt-1 text-gray-600">
                          Charities create tasks with clear milestones, each with specific deliverables and funding requirements.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Milestone 2 */}
                  <div className="relative">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center">
                          <span className="text-white font-bold">2</span>
                        </div>
                      </div>
                      <div className="ml-6">
                        <h4 className="text-lg font-medium text-gray-900">Donor Funding</h4>
                        <p className="mt-1 text-gray-600">
                          Donors contribute to specific tasks, with funds held securely in the smart contract until milestones are completed.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Milestone 3 */}
                  <div className="relative">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center">
                          <span className="text-white font-bold">3</span>
                        </div>
                      </div>
                      <div className="ml-6">
                        <h4 className="text-lg font-medium text-gray-900">Milestone Completion</h4>
                        <p className="mt-1 text-gray-600">
                          Charities provide evidence of milestone completion, which is verified by the platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Milestone 4 */}
                  <div className="relative">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center">
                          <span className="text-white font-bold">4</span>
                        </div>
                      </div>
                      <div className="ml-6">
                        <h4 className="text-lg font-medium text-gray-900">Fund Release</h4>
                        <p className="mt-1 text-gray-600">
                          Once verified, funds for that milestone are automatically released to the charity through the smart contract.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Milestone 5 */}
                  <div className="relative">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center">
                          <span className="text-white font-bold">5</span>
                        </div>
                      </div>
                      <div className="ml-6">
                        <h4 className="text-lg font-medium text-gray-900">Transparent Reporting</h4>
                        <p className="mt-1 text-gray-600">
                          Donors can track the progress of each milestone and see exactly how their funds are being used.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockchainExplainer; 