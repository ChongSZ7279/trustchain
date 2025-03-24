import React from 'react';
import { FaShieldAlt, FaFileAlt, FaCheckCircle, FaBuilding, FaHandHoldingHeart } from 'react-icons/fa';

const MalaysianCompliance = () => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 bg-indigo-50">
        <div className="flex items-center">
          <FaShieldAlt className="h-6 w-6 text-indigo-600 mr-3" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Malaysian Regulatory Compliance
          </h3>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          TrustChain operates in full compliance with Malaysian laws and regulations governing charitable organizations and fundraising activities.
        </p>
      </div>
      
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <FaBuilding className="mr-2 text-gray-400" />
              Registration Status
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <FaCheckCircle className="mr-1" />
                Registered
              </span>
              <p className="mt-1">
                TrustChain is registered with the Companies Commission of Malaysia (SSM) and the Registry of Societies (ROS) under the Societies Act 1966.
              </p>
            </dd>
          </div>
          
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <FaFileAlt className="mr-2 text-gray-400" />
              Governing Laws
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                  <div className="w-0 flex-1 flex items-center">
                    <span className="ml-2 flex-1 w-0 truncate">
                      Societies Act 1966 (Act 335)
                    </span>
                  </div>
                </li>
                <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                  <div className="w-0 flex-1 flex items-center">
                    <span className="ml-2 flex-1 w-0 truncate">
                      Companies Act 2016 (Act 777)
                    </span>
                  </div>
                </li>
                <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                  <div className="w-0 flex-1 flex items-center">
                    <span className="ml-2 flex-1 w-0 truncate">
                      Income Tax Act 1967 (for tax exemption status)
                    </span>
                  </div>
                </li>
                <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                  <div className="w-0 flex-1 flex items-center">
                    <span className="ml-2 flex-1 w-0 truncate">
                      Anti-Money Laundering, Anti-Terrorism Financing and Proceeds of Unlawful Activities Act 2001
                    </span>
                  </div>
                </li>
              </ul>
            </dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <FaHandHoldingHeart className="mr-2 text-gray-400" />
              Tax Benefits for Donors
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <p>
                Donations to approved charities on our platform qualify for tax deductions under Section 44(6) of the Income Tax Act 1967. Donors can claim tax deductions for:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-gray-700">
                <li>Individual donors: Up to 7% of aggregate income</li>
                <li>Corporate donors: Up to 10% of aggregate income</li>
              </ul>
              <p className="mt-2 text-sm text-gray-500">
                Tax receipts are provided for all eligible donations upon request.
              </p>
            </dd>
          </div>
          
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Regulatory Oversight
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <p>
                TrustChain operates under the oversight of:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-gray-700">
                <li>Companies Commission of Malaysia (SSM)</li>
                <li>Registry of Societies (ROS)</li>
                <li>Inland Revenue Board of Malaysia (LHDN)</li>
                <li>Bank Negara Malaysia (for financial transactions)</li>
              </ul>
            </dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Financial Transparency
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <p>
                In accordance with Malaysian regulations, TrustChain:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-gray-700">
                <li>Maintains audited financial statements</li>
                <li>Files annual returns with relevant authorities</li>
                <li>Ensures all blockchain transactions comply with Bank Negara Malaysia guidelines on digital currencies</li>
                <li>Implements strict KYC (Know Your Customer) and AML (Anti-Money Laundering) procedures</li>
              </ul>
            </dd>
          </div>
          
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Contact Information
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <p>
                For compliance-related inquiries:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> compliance@trustchain.my<br />
                <strong>Phone:</strong> +60 3-2345-6789<br />
                <strong>Address:</strong> Level 25, Menara TrustChain, Jalan Sultan Ismail, 50250 Kuala Lumpur, Malaysia
              </p>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default MalaysianCompliance; 