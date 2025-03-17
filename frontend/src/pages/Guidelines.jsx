import React from 'react';

export default function Guidelines() {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900">Website Guidelines</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">How to use TrustChain effectively</p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Getting Started</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <p>Welcome to TrustChain, a platform designed to connect donors with charitable organizations using blockchain technology for transparency and trust.</p>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                <li>Create an account by clicking on "Register" in the navigation bar</li>
                <li>Choose between registering as an individual user or an organization</li>
                <li>Complete your profile with accurate information</li>
                <li>Explore organizations and charities from the main navigation</li>
              </ol>
            </dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">For Donors</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <p>As a donor, you can support charitable causes with confidence:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Browse organizations and charities to find causes you care about</li>
                <li>View detailed information about each charity's mission and impact</li>
                <li>Make secure donations through our blockchain-based system</li>
                <li>Track your donation history and impact in your dashboard</li>
                <li>Receive updates and proof of impact from organizations you support</li>
              </ul>
            </dd>
          </div>
          
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">For Organizations</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <p>As a charitable organization, you can:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Create a detailed profile to showcase your mission and impact</li>
                <li>Add charitable projects and fundraising campaigns</li>
                <li>Provide transparent updates on how donations are being used</li>
                <li>Upload verification documents and impact evidence</li>
                <li>Build trust with donors through blockchain-verified transactions</li>
                <li>Access analytics and reports on your fundraising efforts</li>
              </ul>
            </dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Understanding Blockchain</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <p>TrustChain uses blockchain technology to ensure transparency and trust:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>All donations are recorded on a secure, immutable blockchain</li>
                <li>Transaction records cannot be altered or deleted</li>
                <li>Smart contracts ensure funds are used as intended</li>
                <li>Verification badges indicate blockchain-verified organizations</li>
                <li>You can view the complete transaction history for any charity</li>
              </ul>
            </dd>
          </div>
          
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Privacy & Security</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <p>We take your privacy and security seriously:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Your personal information is protected with industry-standard encryption</li>
                <li>You control what information is visible on your public profile</li>
                <li>Two-factor authentication is available for added security</li>
                <li>All financial transactions are processed through secure channels</li>
                <li>We never share your data with third parties without your consent</li>
              </ul>
              <p className="mt-2">For more details, please review our <a href="/terms" className="text-blue-600 hover:underline">Terms and Conditions</a>.</p>
            </dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Getting Help</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <p>If you need assistance using TrustChain:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Check our FAQ section for common questions</li>
                <li>Contact our support team through the Help Center</li>
                <li>Use the live chat feature for immediate assistance</li>
                <li>Email us at support@trustchain.org</li>
              </ul>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
} 