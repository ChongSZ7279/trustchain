import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaShieldAlt, FaHandshake, FaUserShield } from 'react-icons/fa';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-8 text-white">
            <h1 className="text-3xl font-bold flex items-center">
              <FaBook className="mr-3" />
              Terms and Conditions
            </h1>
            <p className="mt-2 text-blue-100">
              Please read these terms and conditions carefully before using our platform
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            {/* Terms Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                <FaHandshake className="mr-2 text-blue-600" />
                Terms of Service
              </h2>
              
              <div className="space-y-6 text-gray-600">
                <p>
                  Welcome to TrustChain. By accessing or using our platform, you agree to be bound by these terms and conditions.
                </p>

                <div className="pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">1. Account Registration</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>You must provide accurate and complete information during registration</li>
                    <li>You are responsible for maintaining the security of your account</li>
                    <li>You must be at least 18 years old to create an account</li>
                    <li>Organizations must provide valid registration documents</li>
                  </ul>
                </div>

                <div className="pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">2. Platform Usage</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>All donations must be made in good faith</li>
                    <li>Organizations must use funds for stated charitable purposes</li>
                    <li>Users must not engage in fraudulent activities</li>
                    <li>We reserve the right to suspend accounts for violations</li>
                  </ul>
                </div>

                <div className="pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">3. Donations and Transactions</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>All transactions are final and non-refundable</li>
                    <li>Organizations must provide regular updates on fund usage</li>
                    <li>Transaction fees may apply</li>
                    <li>We use secure payment processing systems</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Privacy Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                <FaShieldAlt className="mr-2 text-blue-600" />
                Privacy Policy
              </h2>

              <div className="space-y-6 text-gray-600">
                <p>
                  Your privacy is important to us. This section explains how we collect, use, and protect your personal information.
                </p>

                <div className="pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">1. Information We Collect</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Personal identification information (Name, IC, email, phone)</li>
                    <li>Organization details and documentation</li>
                    <li>Transaction and donation history</li>
                    <li>Usage data and platform interactions</li>
                  </ul>
                </div>

                <div className="pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">2. How We Use Your Information</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>To verify user and organization identities</li>
                    <li>To process donations and transactions</li>
                    <li>To provide customer support</li>
                    <li>To send important updates and notifications</li>
                  </ul>
                </div>

                <div className="pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">3. Data Protection</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>We use industry-standard security measures</li>
                    <li>Your data is encrypted in transit and at rest</li>
                    <li>We never share personal information without consent</li>
                    <li>You can request data deletion at any time</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Security Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                <FaUserShield className="mr-2 text-blue-600" />
                Data Security
              </h2>

              <div className="space-y-6 text-gray-600">
                <p>
                  We implement various security measures to maintain the safety of your personal information.
                </p>

                <div className="pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Security Measures</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Regular security audits and updates</li>
                    <li>Secure socket layer (SSL) encryption</li>
                    <li>Two-factor authentication options</li>
                    <li>Regular data backups</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <Link
              to="/contact"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 