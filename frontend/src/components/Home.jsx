import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BlockchainExplainer from './BlockchainExplainer';
import charityImage from '../assets/image/charity-8366471_1280.png';
import childrenImage from '../assets/image/children-5833685_1280.jpg';
import handImage from '../assets/image/hand-4806608_1280.jpg';
import smileImage from '../assets/image/smile-7400381_1280.jpg';
import africanImage from '../assets/image/african-2044961_1280.jpg';
import jonathon from '../assets/image/Jonat.jpg';
import sally from '../assets/image/Sally2.png';
import weiwen from '../assets/image/WeiWen2.png';
import siewzhen from '../assets/image/SiewZhen.png';
import { FaHandHoldingHeart, FaChartLine, FaLock, FaEthereum } from 'react-icons/fa';

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Sample featured charities (in a real app, these would come from an API)
    const featuredCharities = [
        {
            id: 1,
            name: "Clean Water Initiative",
            description: "Providing clean water to communities in need around the world.",
            image: africanImage,
            progress: 65,
            goal: 50000
        },
        {
            id: 2,
            name: "Children's Education Fund",
            description: "Supporting education for underprivileged children globally.",
            image: childrenImage,
            progress: 42,
            goal: 75000
        },
        {
            id: 3,
            name: "Disaster Relief Program",
            description: "Immediate assistance for communities affected by natural disasters.",
            image: handImage,
            progress: 78,
            goal: 100000
        }
    ];

    return (
        <div>
            {/* Hero Section with Welcome Quote */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        className="h-full w-full object-cover"
                        src={charityImage}
                        alt="Charity background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-500 mix-blend-multiply" />
                </div>
                <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
                    <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                        <span className="block text-white">Welcome to TrustChain</span>
                        <span className="block text-indigo-200">Building Trust Through Transparency</span>
                    </h1>
                    <p className="mt-6 max-w-lg mx-auto text-center text-xl text-indigo-100 sm:max-w-3xl">
                        "The best way to find yourself is to lose yourself in the service of others." - Mahatma Gandhi
                    </p>
                    <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                        <div className="space-y-4 sm:space-y-0 sm:space-x-4">
                            <button
                                onClick={() => navigate('/charities')}
                                className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 sm:px-10"
                            >
                                Donate Now
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 sm:px-10"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Benefits Section */}
            <div className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Benefits</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Why Choose TrustChain?
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                            Our blockchain-powered platform ensures your donations make a real impact.
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                                        <FaLock className="h-6 w-6" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Complete Transparency</h3>
                                    <p className="mt-2 text-base text-gray-500">
                                        Every donation is recorded on the blockchain, creating an immutable record that anyone can verify.
                                    </p>
                                </div>
                            </div>

                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                                        <FaHandHoldingHeart className="h-6 w-6" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Direct Impact</h3>
                                    <p className="mt-2 text-base text-gray-500">
                                        Fund specific tasks and track exactly how your donation is making a difference.
                                    </p>
                                </div>
                            </div>

                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                                        <FaChartLine className="h-6 w-6" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Real-Time Tracking</h3>
                                    <p className="mt-2 text-base text-gray-500">
                                        Monitor the progress of projects and see your contributions at work in real-time.
                                    </p>
                                </div>
                            </div>

                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                                        <FaEthereum className="h-6 w-6" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Blockchain Security</h3>
                                    <p className="mt-2 text-base text-gray-500">
                                        Smart contracts ensure funds are only released when predefined conditions are met.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Charities Section */}
            <div className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Featured Causes</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Make a Difference Today
                        </p>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                            Support these verified charitable organizations and track your impact in real-time.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-8 md:grid-cols-3">
                        {featuredCharities.map((charity) => (
                            <div key={charity.id} className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="h-48 w-full overflow-hidden">
                                    <img 
                                        src={charity.image} 
                                        alt={charity.name} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">{charity.name}</h3>
                                    <p className="mt-1 text-sm text-gray-500">{charity.description}</p>
                                    
                                    <div className="mt-4">
                                        <div className="relative pt-1">
                                            <div className="flex mb-2 items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                                                        Progress
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-semibold inline-block text-indigo-600">
                                                        {charity.progress}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                                                <div 
                                                    style={{ width: `${charity.progress}%` }} 
                                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                                                ></div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Goal: ${charity.goal.toLocaleString()}
                                        </p>
                                    </div>
                                    
                                    <div className="mt-5">
                                        <button
                                            onClick={() => navigate(`/charities/${charity.id}`)}
                                            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Donate Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-10 text-center">
                        <Link
                            to="/charities"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            View All Charities
                        </Link>
                    </div>
                </div>
            </div>

            {/* Blockchain Explainer Section */}
            <BlockchainExplainer />

            {/* About Us Section */}
            <div id="about" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">About Us</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Our Story
                        </p>
                    </div>
                    <div className="mt-10">
                        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
                            <div className="relative">
                                <img
                                    src={childrenImage}
                                    alt="Children in need"
                                    className="rounded-lg shadow-lg"
                                />
                            </div>
                            <div className="space-y-6">
                                <p className="text-lg text-gray-500">
                                    TrustChain was founded with a simple mission: to revolutionize charitable giving through blockchain technology. We believe that transparency and trust are the cornerstones of effective philanthropy.
                                </p>
                                <p className="text-lg text-gray-500">
                                    Our platform connects donors with verified charitable organizations, ensuring that every contribution makes a real difference in the lives of those in need.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission and Vision Section */}
            <div className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {/* Mission */}
                        <div className="bg-white p-8 rounded-lg shadow-lg">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                            <p className="text-gray-600">
                                To create a transparent and efficient platform that connects donors with charitable organizations, ensuring that every contribution reaches those in need through blockchain-powered verification and tracking.
                            </p>
                        </div>
                        {/* Vision */}
                        <div className="bg-white p-8 rounded-lg shadow-lg">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                            <p className="text-gray-600">
                                To become the world's leading blockchain-based charitable platform, setting new standards for transparency and trust in philanthropy while making a lasting impact on global communities.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Testimonials</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            What Our Community Says
                        </p>
                    </div>
                    <div className="mt-10">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            {/* Testimonial 1 */}
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <div className="flex items-center mb-4">
                                    <img
                                        src={handImage}
                                        alt="Testimonial 1"
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                    <div className="ml-4">
                                        <h4 className="text-lg font-semibold">Sarah Johnson</h4>
                                        <p className="text-gray-500">Regular Donor</p>
                                    </div>
                                </div>
                                <p className="text-gray-600">
                                    "TrustChain has transformed how I give back. The transparency and tracking features give me confidence that my donations are making a real difference."
                                </p>
                            </div>
                            {/* Testimonial 2 */}
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <div className="flex items-center mb-4">
                                    <img
                                        src={smileImage}
                                        alt="Testimonial 2"
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                    <div className="ml-4">
                                        <h4 className="text-lg font-semibold">Michael Chen</h4>
                                        <p className="text-gray-500">Charity Director</p>
                                    </div>
                                </div>
                                <p className="text-gray-600">
                                    "As a charity director, I appreciate how TrustChain helps us maintain transparency and build trust with our donors. It's revolutionized our fundraising efforts."
                                </p>
                            </div>
                            {/* Testimonial 3 */}
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <div className="flex items-center mb-4">
                                    <img
                                        src={africanImage}
                                        alt="Testimonial 3"
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                    <div className="ml-4">
                                        <h4 className="text-lg font-semibold">David Okafor</h4>
                                        <p className="text-gray-500">Community Leader</p>
                                    </div>
                                </div>
                                <p className="text-gray-600">
                                    "The impact of TrustChain in our community has been incredible. It's helped us connect with donors and show them exactly how their contributions help."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Management Team Section */}
            <div id="team" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Our Team</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Meet the People Behind TrustChain
                        </p>
                    </div>
                    <div className="mt-10">
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Team Member 1 */}
                            <div className="text-center">
                                <div className="relative">
                                    <img
                                        src={jonathon}
                                        alt="Team member"
                                        className="mx-auto h-32 w-32 rounded-full object-cover"
                                    />
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-lg font-medium text-gray-900">Jonathon</h3>
                                    <p className="text-sm text-gray-500">Backend Developer</p>
                                </div>
                            </div>
                            {/* Team Member 2 */}
                            <div className="text-center">
                                <div className="relative">
                                    <img
                                        src={sally}
                                        alt="Team member"
                                        className="mx-auto h-32 w-32 rounded-full object-cover"
                                    />
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-lg font-medium text-gray-900">Sally</h3>
                                    <p className="text-sm text-gray-500">Frontend Developer</p>
                                </div>
                            </div>
                            {/* Team Member 3 */}
                            <div className="text-center">
                                <div className="relative">
                                    <img
                                        src={weiwen}
                                        alt="Team member"
                                        className="mx-auto h-32 w-32 rounded-full object-cover" 
                                    />
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-lg font-medium text-gray-900">Weiwen</h3>
                                    <p className="text-sm text-gray-500">UI UX Designer</p>
                                </div>
                            </div>
                            {/* Team Member 4 */}
                            <div className="text-center">
                                <div className="relative">
                                    <img
                                        src={siewzhen}
                                        alt="Team member"
                                        className="mx-auto h-32 w-32 rounded-full object-cover"
                                    />
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-lg font-medium text-gray-900">Siew Zhen</h3>
                                    <p className="text-sm text-gray-500">Full Stack Developer</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div id="contact" className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Contact Us</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Get in Touch
                        </p>
                    </div>
                    <div className="mt-10">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            {/* Contact Form */}
                            <div className="bg-white p-8 rounded-lg shadow-lg">
                                <form className="space-y-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                            Message
                                        </label>
                                        <textarea
                                            id="message"
                                            rows={4}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        ></textarea>
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
                            {/* Contact Information */}
                            <div className="bg-white p-8 rounded-lg shadow-lg">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span className="ml-3 text-gray-600">+1 (555) 123-4567</span>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="ml-3 text-gray-600">info@trustchain.org</span>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="ml-3 text-gray-600">123 Charity Lane, Blockchain City</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home