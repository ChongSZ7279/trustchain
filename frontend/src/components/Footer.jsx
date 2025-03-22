import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa';    

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-auto w-full">
      <div className="max-w-full mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-xl font-bold text-white">
              TrustChain
            </Link>
            <p className="mt-2 text-sm text-gray-300">
              Building trust through transparency. Our blockchain-powered platform ensures your donations reach those in need.
            </p>
            <div className="mt-4 flex space-x-6">
              {/* Facebook */}
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <FaFacebook className="h-6 w-6" />  
              </a>
              {/* Whatsapp   */}
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">WhatsApp</span>
                <FaWhatsapp className="h-6 w-6" />
              </a>
              {/* Email */}
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Email</span>
                <FaEnvelope className="h-6 w-6" />
              </a>
              {/* Instagram */}
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <FaInstagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Quick Links</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="/#about" className="text-base text-gray-300 hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <Link to="/charities" className="text-base text-gray-300 hover:text-white">
                  Charities
                </Link>
              </li>
              <li>
                <Link to="/organizations" className="text-base text-gray-300 hover:text-white">
                  Organizations
                </Link>
              </li>
              <li>
                <a href="/#contact" className="text-base text-gray-300 hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="/terms" className="text-base text-gray-300 hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-base text-gray-300 hover:text-white">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/terms" className="text-base text-gray-300 hover:text-white">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Contact Us</h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:info@trustchain.org" className="text-base text-gray-300 hover:text-white">
                  info@trustchain.org
                </a>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-base text-gray-300">
                  +1 (555) 123-4567
                </span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-base text-gray-300">
                  123 Charity Lane, Blockchain City
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {currentYear} TrustChain. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 