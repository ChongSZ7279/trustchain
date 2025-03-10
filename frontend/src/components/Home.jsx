import React from 'react'
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();

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

            {/* Welcome Section */}
            <div className="bg-indigo-700">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                        Welcome to TrustChain
                    </h1>
                    <p className="mt-6 text-xl text-indigo-200 max-w-3xl">
                        Secure, transparent, and efficient blockchain solutions for your business.
                    </p>
                </div>
            </div>

            {/* About Us Section */}
            <div id="about" className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            About Us
                        </h2>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                            We are dedicated to providing cutting-edge blockchain solutions that help businesses 
                            streamline their operations and enhance security.
                        </p>
                    </div>
                </div>
            </div>

            {/* Management Team Section */}
            <div id="team" className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Our Management Team
                        </h2>
                        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Team Member 1 */}
                            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium text-gray-900">John Doe</h3>
                                    <p className="mt-1 text-sm text-gray-500">CEO</p>
                                </div>
                            </div>
                            {/* Team Member 2 */}
                            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium text-gray-900">Jane Smith</h3>
                                    <p className="mt-1 text-sm text-gray-500">CTO</p>
                                </div>
                            </div>
                            {/* Team Member 3 */}
                            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium text-gray-900">Mike Johnson</h3>
                                    <p className="mt-1 text-sm text-gray-500">COO</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Us Section */}
            <div id="contact" className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Contact Us
                        </h2>
                        <div className="mt-10 max-w-lg mx-auto">
                            <form className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={4}
                                        className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
                                    />
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Send Message
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home