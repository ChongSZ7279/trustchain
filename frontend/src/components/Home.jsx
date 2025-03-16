import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import charityImage from '../assets/image/charity-8366471_1280.png';
import childrenVideo from '../assets/image/240547_small.mp4';
import handImage from '../assets/image/hand-4806608_1280.jpg';
import smileImage from '../assets/image/smile-7400381_1280.jpg';
import africanImage from '../assets/image/african-2044961_1280.jpg';
// Import the new images for the carousel
import childrenCarouselImage from '../assets/image/children-73476_1280.jpg';
import downAndOutImage from '../assets/image/down-and-out-477546_1280.jpg';
import happyChildrenImage from '../assets/image/happy-children-876541_1280.jpg';
import plantImage from '../assets/image/plant-2230238_1280.jpg';
import { motion } from 'framer-motion';

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // State for the image carousel
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // State for testimonial carousel
    const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(1); // Start with middle testimonial
    
    // Refs for section headings to track when they come into view
    const aboutHeadingRef = useRef(null);
    const testimonialsHeadingRef = useRef(null);
    const contactHeadingRef = useRef(null);
    
    // State to track which headings are visible
    const [visibleHeadings, setVisibleHeadings] = useState({
        about: false,
        testimonials: false,
        contact: false
    });
    
    // State for heading animations
    const [headingScales, setHeadingScales] = useState({
        about: 1,
        testimonials: 1,
        contact: 1
    });
    
    // State for heading positions (for zoom up effect)
    const [headingPositions, setHeadingPositions] = useState({
        about: 50, // Start 50px below
        testimonials: 50,
        contact: 50
    });
    
    // Array of carousel images with their captions
    const carouselImages = [
        { 
            src: childrenCarouselImage, 
            alt: "Children in need", 
            caption: "Supporting children's education and welfare"
        },
        { 
            src: downAndOutImage, 
            alt: "Homeless person", 
            caption: "Helping those in difficult circumstances"
        },
        { 
            src: happyChildrenImage, 
            alt: "Happy children", 
            caption: "Creating brighter futures for children"
        },
        { 
            src: plantImage, 
            alt: "Growing plant", 
            caption: "Nurturing growth and sustainability"
        }
    ];
    
    // Testimonial data
    const testimonials = [
        {
            image: handImage,
            name: "Sarah Johnson",
            role: "Regular Donor",
            quote: "TrustChain has transformed how I give back. The transparency and tracking features give me confidence that my donations are making a real difference."
        },
        {
            image: smileImage,
            name: "Michael Chen",
            role: "Charity Director",
            quote: "As a charity director, I appreciate how TrustChain helps us maintain transparency and build trust with our donors. It's revolutionized our fundraising efforts."
        },
        {
            image: africanImage,
            name: "David Okafor",
            role: "Community Leader",
            quote: "The impact of TrustChain in our community has been incredible. It's helped us connect with donors and show them exactly how their contributions help."
        }
    ];
    
    // Auto-advance the hero carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => 
                prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000); // Change image every 5 seconds
        
        return () => clearInterval(interval);
    }, []);
    
    // Auto-advance the testimonial carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonialIndex((prevIndex) => 
                prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
            );
        }, 4000); // Change testimonial every 4 seconds
        
        return () => clearInterval(interval);
    }, []);
    
    // Set up intersection observer for scroll animations with more detailed tracking
    useEffect(() => {
        const observerOptions = {
            root: null, // Use the viewport
            rootMargin: '0px',
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] // Track multiple thresholds for smoother animation
        };
        
        const observerCallback = (entries) => {
            entries.forEach(entry => {
                // Calculate a scale factor based on intersection ratio (how much of the element is visible)
                const scaleValue = 1 + (entry.intersectionRatio * 0.5); // Scale from 1.0 to 1.5
                // Calculate position value (0 = normal position, 50 = 50px below)
                const positionValue = entry.isIntersecting ? Math.max(0, 50 - (entry.intersectionRatio * 50)) : 50;
                
                if (entry.target === aboutHeadingRef.current) {
                    setVisibleHeadings(prev => ({ ...prev, about: entry.isIntersecting }));
                    if (entry.isIntersecting) {
                        setHeadingScales(prev => ({ ...prev, about: scaleValue }));
                        setHeadingPositions(prev => ({ ...prev, about: positionValue }));
                    }
                } else if (entry.target === testimonialsHeadingRef.current) {
                    setVisibleHeadings(prev => ({ ...prev, testimonials: entry.isIntersecting }));
                    if (entry.isIntersecting) {
                        setHeadingScales(prev => ({ ...prev, testimonials: scaleValue }));
                        setHeadingPositions(prev => ({ ...prev, testimonials: positionValue }));
                    }
                } else if (entry.target === contactHeadingRef.current) {
                    setVisibleHeadings(prev => ({ ...prev, contact: entry.isIntersecting }));
                    if (entry.isIntersecting) {
                        setHeadingScales(prev => ({ ...prev, contact: scaleValue }));
                        setHeadingPositions(prev => ({ ...prev, contact: positionValue }));
                    }
                }
            });
        };
        
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        
        if (aboutHeadingRef.current) observer.observe(aboutHeadingRef.current);
        if (testimonialsHeadingRef.current) observer.observe(testimonialsHeadingRef.current);
        if (contactHeadingRef.current) observer.observe(contactHeadingRef.current);
        
        return () => {
            if (aboutHeadingRef.current) observer.unobserve(aboutHeadingRef.current);
            if (testimonialsHeadingRef.current) observer.unobserve(testimonialsHeadingRef.current);
            if (contactHeadingRef.current) observer.unobserve(contactHeadingRef.current);
        };
    }, []);
    
    // Function to manually change the image
    const goToImage = (index) => {
        setCurrentImageIndex(index);
    };
    
    // Function to manually change the testimonial
    const goToTestimonial = (index) => {
        setCurrentTestimonialIndex(index);
    };

    return (
        <div className="overflow-hidden">
            {/* Hero Section with Swiping Image Carousel - White Background */}
            <div className="relative bg-white min-h-screen flex items-center">
                <div className="absolute inset-0">
                    {/* Image carousel */}
                    {carouselImages.map((image, index) => (
                        <div 
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${
                                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                    <img
                        className="h-full w-full object-cover"
                                src={image.src}
                                alt={image.alt}
                    />
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-500 mix-blend-multiply opacity-70" />
                        </div>
                    ))}
                </div>
                <div className="relative w-full px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
                    <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                        <span className="block text-white">Welcome to TrustChain</span>
                        <span className="block text-indigo-200">Building Trust Through Transparency</span>
                    </h1>
                    <p className="mt-6 max-w-lg mx-auto text-center text-xl text-indigo-100 sm:max-w-3xl">
                        {carouselImages[currentImageIndex].caption}
                    </p>
                    <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                        <div className="space-y-4 sm:space-y-0 sm:space-x-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 sm:px-10"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                    
                    {/* Carousel indicators */}
                    <div className="flex justify-center mt-8">
                        {carouselImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToImage(index)}
                                className={`h-3 w-3 mx-1 rounded-full focus:outline-none ${
                                    index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* About Us Section - Indigo-50 Background */}
            <div id="about" className="bg-indigo-50 min-h-screen py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Heading with zoom-up animation */}
                    <div className="relative py-10 overflow-hidden" ref={aboutHeadingRef}>
                        <div 
                            className={`text-center transition-all duration-1000 ease-out
                                ${visibleHeadings.about ? 'opacity-100' : 'opacity-0'}
                            `}
                            style={{ 
                                transform: `scale(${headingScales.about}) translateY(${headingPositions.about}px)`,
                                transformOrigin: 'center bottom'
                            }}
                        >
                            <div className="relative inline-block">
                                <h2 className="text-3xl text-indigo-600 font-bold tracking-wide uppercase">
                                    About Us
                                </h2>
                                <div className="absolute -bottom-2 left-0 w-full h-1 bg-indigo-600"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8">
                        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
                            <div className="relative">
                                <video
                                    src={childrenVideo}
                                    alt="Children in need"
                                    className="rounded-lg shadow-lg"
                                    autoPlay
                                    muted
                                    loop
                                />
                            </div>
                            <div className="space-y-6 flex flex-col justify-center items-center">
                                <p className="text-lg text-gray-700 text-justify">
                                    TrustChain was founded with a simple mission: to revolutionize charitable giving through blockchain technology. We believe that transparency and trust are the cornerstones of effective philanthropy.
                                </p>
                                <p className="text-lg text-gray-700 text-justify">
                                    Our platform connects donors with verified charitable organizations, ensuring that every contribution makes a real difference in the lives of those in need.
                                </p>
                                <p className="text-lg text-gray-700 text-justify">
                                    By leveraging blockchain's immutable ledger, we provide a secure and transparent way to track donations, from the moment they are made to the moment they are used.
                                </p>
                    </div>
                </div>
            </div>

            {/* Mission and Vision Section */}
                    <div className="py-16">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-10">
                        {/* Mission */}
                                <div className="bg-white p-8 rounded-lg shadow-lg md:w-1/2 transform transition-transform hover:scale-105">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Our Mission</h3>
                                    <p className="text-gray-700 text-lg">
                                To create a transparent and efficient platform that connects donors with charitable organizations, ensuring that every contribution reaches those in need through blockchain-powered verification and tracking.
                            </p>
                        </div>
                        {/* Vision */}
                                <div className="bg-white p-8 rounded-lg shadow-lg md:w-1/2 transform transition-transform hover:scale-105">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Our Vision</h3>
                                    <p className="text-gray-700 text-lg">
                                To become the world's leading blockchain-based charitable platform, setting new standards for transparency and trust in philanthropy while making a lasting impact on global communities.
                            </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonials Section - White Background */}
            <div className="bg-white min-h-screen py-16 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    {/* Heading with zoom-up animation */}
                    <div className="relative py-10 overflow-hidden" ref={testimonialsHeadingRef}>
                        <div 
                            className={`text-center transition-all duration-1000 ease-out
                                ${visibleHeadings.testimonials ? 'opacity-100' : 'opacity-0'}
                            `}
                            style={{ 
                                transform: `scale(${headingScales.testimonials}) translateY(${headingPositions.testimonials}px)`,
                                transformOrigin: 'center bottom'
                            }}
                        >
                            <div className="relative inline-block">
                                <h2 className="text-3xl text-indigo-600 font-bold tracking-wide uppercase">
                                    Testimonials
                                </h2>
                                <div className="absolute -bottom-2 left-0 w-full h-1 bg-indigo-600"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8">
                        {/* Improved Testimonial Carousel */}
                        <div className="relative h-[500px] overflow-hidden">
                            <div className="flex justify-center items-center h-full">
                                {testimonials.map((testimonial, index) => {
                                    // Calculate position: -1 for left, 0 for center, 1 for right
                                    let position = index - currentTestimonialIndex;
                                    if (position < -1) position += testimonials.length;
                                    if (position > 1) position -= testimonials.length;
                                    
                                    return (
                                        <div 
                                            key={index}
                                            className={`absolute transition-all duration-500 ease-in-out transform
                                                ${position === -1 ? 'scale-75 -translate-x-3/4 opacity-70 z-10 rotate-[-5deg]' : ''}
                                                ${position === 0 ? 'scale-100 translate-x-0 opacity-100 z-20' : ''}
                                                ${position === 1 ? 'scale-75 translate-x-3/4 opacity-70 z-10 rotate-[5deg]' : ''}
                                                ${Math.abs(position) > 1 ? 'scale-50 opacity-0' : ''}
                                            `}
                                            onClick={() => goToTestimonial(index)}
                                        >
                                            <div className={`bg-gradient-to-br from-indigo-50 to-white p-8 rounded-xl shadow-xl ${position === 0 ? 'w-[500px]' : 'w-[400px]'}`}>
                                                <div className="flex items-center mb-6">
                                <div className="relative">
                                                        <div className="absolute inset-0 bg-indigo-200 rounded-full transform -rotate-6"></div>
                                                        <img
                                                            src={testimonial.image}
                                                            alt={`Testimonial from ${testimonial.name}`}
                                                            className="h-16 w-16 rounded-full object-cover border-2 border-white relative z-10"
                                    />
                                </div>
                                                    <div className="ml-6">
                                                        <h4 className="text-xl font-bold text-gray-800">{testimonial.name}</h4>
                                                        <p className="text-indigo-600 font-medium">{testimonial.role}</p>
                                </div>
                            </div>
                                <div className="relative">
                                                    <div className="absolute -top-4 -left-2 text-indigo-300 text-6xl opacity-30">"</div>
                                                    <p className="text-gray-700 text-lg relative z-10 italic">
                                                        {testimonial.quote}
                                                    </p>
                                                    <div className="absolute -bottom-10 -right-2 text-indigo-300 text-6xl opacity-30">"</div>
                                                </div>
                                                {position === 0 && (
                                                    <div className="mt-6 flex justify-end">
                                                        <div className="flex space-x-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <svg key={star} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                </div>
                                </div>
                                    );
                                })}
                            </div>
                            
                            {/* Carousel navigation arrows */}
                            <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-6 pointer-events-none">
                                <button 
                                    onClick={() => goToTestimonial(currentTestimonialIndex === 0 ? testimonials.length - 1 : currentTestimonialIndex - 1)}
                                    className="bg-white bg-opacity-80 rounded-full p-2 shadow-lg text-indigo-600 hover:text-indigo-800 focus:outline-none pointer-events-auto transform transition-transform hover:scale-110"
                                    aria-label="Previous testimonial"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button 
                                    onClick={() => goToTestimonial(currentTestimonialIndex === testimonials.length - 1 ? 0 : currentTestimonialIndex + 1)}
                                    className="bg-white bg-opacity-80 rounded-full p-2 shadow-lg text-indigo-600 hover:text-indigo-800 focus:outline-none pointer-events-auto transform transition-transform hover:scale-110"
                                    aria-label="Next testimonial"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Carousel indicators */}
                            <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-3 pb-6">
                                {testimonials.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToTestimonial(index)}
                                        className={`h-3 w-3 rounded-full focus:outline-none transition-all duration-300 ${
                                            index === currentTestimonialIndex 
                                                ? 'bg-indigo-600 w-8' 
                                                : 'bg-gray-300 hover:bg-indigo-400'
                                        }`}
                                        aria-label={`Go to testimonial ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Section - Indigo-50 Background */}
            <div id="contact" className="bg-indigo-50 min-h-screen py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Heading Animation */}
                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0, y: 50 }} // Start small & lower position
                        animate={{ scale: [0.5, 1.5, 1], opacity: [0, 1, 1], y: [50, 0, 0] }}
                        transition={{ duration: 1.8, ease: "easeOut", times: [0, 0.5, 1] }} // Zoom, hold, then shrink
                        className="text-center relative overflow-hidden"
                    >
                        <motion.h2
                            initial={{ backgroundSize: "100% 0%", opacity: 1 }} // No gradient initially
                            animate={{ backgroundSize: "100% 100%", opacity: 1 }} // Slowly reveal gradient
                            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.8 }} // Delayed color reveal
                            className="text-4xl font-bold uppercase bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                            style={{
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "bottom",
                                backgroundSize: "100% 0%",
                            }}
                        >
                            Contact Us
                        </motion.h2>
                    </motion.div>
                    {/* Contact Form & Google Map Side by Side */}
                    <div className="mt-8 flex flex-col md:flex-row gap-8 items-stretch">
                        {/* Contact Form - 50% Width */}
                        <div className="w-full md:w-1/2 flex flex-col">
                            <form className="space-y-6 flex-1">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="TrustChain"
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
                                        placeholder="info@trustchain.org"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="How can we help you?"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                            Message
                                        </label>
                                        <textarea
                                            id="message"
                                        rows={6}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="We would love to hear from you"
                                        ></textarea>
                                    </div>
                                    <div>
                                        <button
                                            type="submit"
                                        className="w-full flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-transform hover:scale-105"
                                        >
                                            Send Message
                                        </button>
                                    </div>
                                </form>
                            </div>

                        {/* Google Map - 50% Width & Full Height */}
                        <div className="w-full md:w-1/2 flex-1 rounded-lg overflow-hidden shadow-lg">
                            <iframe 
                                className="w-full h-full"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3168.626248348173!2d-122.08424968469265!3d37.42199957982537!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fba0281720e07%3A0x80d49c4a7aabb6e1!2sGoogleplex!5e0!3m2!1sen!2sus!4v1641767402635!5m2!1sen!2sus" 
                                allowFullScreen="" 
                                loading="lazy" 
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default Home