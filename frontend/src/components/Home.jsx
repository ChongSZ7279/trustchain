import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

  return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="text-xl font-bold text-indigo-600">
                                TrustChain
                            </Link>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <a href="#about" className="text-gray-500 hover:text-gray-700 px-3 py-2">
                                    About Us
                                </a>
                                <a href="#team" className="text-gray-500 hover:text-gray-700 px-3 py-2">
                                    Our Team
                                </a>
                                <a href="#contact" className="text-gray-500 hover:text-gray-700 px-3 py-2">
                                    Contact
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center">
                            {!user ? (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-gray-500 hover:text-gray-700 px-3 py-2"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Register
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    to="/dashboard"
                                    className="text-gray-500 hover:text-gray-700 px-3 py-2"
                                >
                                    Dashboard
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-500 mix-blend-multiply" />
                </div>
                <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
                    <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                        <span className="block text-white">Welcome to TrustChain</span>
                        <span className="block text-indigo-200">Building Trust Through Transparency</span>
                    </h1>
                    <p className="mt-6 max-w-lg mx-auto text-center text-xl text-indigo-100 sm:max-w-3xl">
                        Join our platform to connect with trusted organizations and individuals. 
                        We provide a secure and transparent environment for collaboration and growth.
                    </p>
                    <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                        <div className="space-y-4 sm:space-y-0 sm:space-x-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 sm:px-10"
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
                            Features
                        </h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Choose Your Path
                        </p>
                    </div>

                    <div className="mt-16">
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                            {/* Individual User Card */}
                            <div 
                                onClick={() => navigate('/register/user')}
                                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer"
                            >
                                <div>
                                    <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                                        {/* User Icon */}
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </span>
                                </div>
                                <div className="mt-8">
                                    <h3 className="text-lg font-medium">
                                        <span className="absolute inset-0" aria-hidden="true" />
                                        Register as Individual
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Create your personal account to connect with organizations and manage your identity securely.
                                    </p>
                                </div>
                            </div>

                            {/* Organization Card */}
                            <div 
                                onClick={() => navigate('/register/organization')}
                                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer"
                            >
                                <div>
                                    <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                                        {/* Building Icon */}
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </span>
                                </div>
                                <div className="mt-8">
                                    <h3 className="text-lg font-medium">
                                        <span className="absolute inset-0" aria-hidden="true" />
                                        Register as Organization
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Establish your organization's presence and build trust with verified documentation and transparency.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trust Indicators */}
            <div className="bg-gray-50 pt-12 sm:pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Trusted by organizations and individuals
                        </h2>
                        <p className="mt-3 text-xl text-gray-500 sm:mt-4">
                            Join our growing community of verified users and organizations.
                        </p>
                    </div>
                </div>
                <div className="mt-10 pb-12 bg-white sm:pb-16">
                    <div className="relative">
                        <div className="absolute inset-0 h-1/2 bg-gray-50" />
                        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="max-w-4xl mx-auto">
                                <dl className="rounded-lg bg-white shadow-lg sm:grid sm:grid-cols-3">
                                    <div className="flex flex-col border-b border-gray-100 p-6 text-center sm:border-0 sm:border-r">
                                        <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                                            Verified Users
                                        </dt>
                                        <dd className="order-1 text-5xl font-extrabold text-indigo-600">100%</dd>
                                    </div>
                                    <div className="flex flex-col border-t border-b border-gray-100 p-6 text-center sm:border-0 sm:border-l sm:border-r">
                                        <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                                            Security
                                        </dt>
                                        <dd className="order-1 text-5xl font-extrabold text-indigo-600">24/7</dd>
                                    </div>
                                    <div className="flex flex-col border-t border-gray-100 p-6 text-center sm:border-0 sm:border-l">
                                        <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                                            Transparency
                                        </dt>
                                        <dd className="order-1 text-5xl font-extrabold text-indigo-600">100%</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home