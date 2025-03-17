import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { FaArrowLeft, FaShieldAlt } from "react-icons/fa";

export default function AuthLayout() {
  const location = useLocation();
  
  const isRegisterPage = location.pathname.includes("/register");
  const isDetailedRegistration = location.pathname.includes("/register/user") || location.pathname.includes("/register/organization");

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Left Side - Background Image with Blur Shadow */}
      {!isDetailedRegistration && (
        <div className="hidden lg:flex w-2/5 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transform transition-transform duration-10000 hover:scale-110"
            style={{
              backgroundImage: isRegisterPage
                ? "url('/src/assets/image/charity-8366471_1280.png')"
                : "url('/src/assets/image/good-4206177_1280.jpg')",
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/60 via-indigo-800/40 to-transparent"></div>
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm">
              <FaShieldAlt className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-4">
              {isRegisterPage ? "Join Our Community" : "Welcome Back"}
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-md">
              {isRegisterPage 
                ? "Create an account to access our secure blockchain platform and start building trust in your digital transactions." 
                : "Sign in to access your account and continue building trust in your digital transactions."}
            </p>
            <div className="flex space-x-3">
              <div className="h-2 w-16 rounded-full bg-white"></div>
              <div className="h-2 w-4 rounded-full bg-white/50"></div>
              <div className="h-2 w-4 rounded-full bg-white/50"></div>
            </div>
          </div>
        </div>
      )}

      {/* Right Side - Auth Form */}
      <div className={`flex flex-col justify-center px-8 sm:px-16 py-12 w-full ${isDetailedRegistration ? 'max-w-5xl mx-auto' : 'lg:w-3/5'}`}>
        <div className={`${isDetailedRegistration ? 'w-full' : 'max-w-md mx-auto w-full'}`}>
          <Link to={isDetailedRegistration ? "/register" : "/"} className="text-gray-600 flex items-center mb-8 hover:text-indigo-600 transition group">
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Back to {isDetailedRegistration ? "Registration" : "Home"}
          </Link>

          {/* Branding */}
          {!isDetailedRegistration && (
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-indigo-600">TrustChain</h1>
              <p className="mt-2 text-gray-500">
                {isRegisterPage
                  ? "Create your account to get started"
                  : "Welcome back! Please sign in to continue"}
              </p>
            </div>
          )}

          {/* Auth Form Card */}
          <div className={`mt-8 bg-white shadow-lg rounded-xl ${isDetailedRegistration ? 'p-0' : 'p-6 sm:p-8'} border border-gray-100`}>
            <Outlet />
          </div>

          {/* Footer Links */}
          {!isDetailedRegistration && (
            <>
              <div className="mt-8 text-center text-gray-600 text-sm">
                {isRegisterPage ? (
                  <>
                    Already have an account?{" "}
                    <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-800 transition">
                      Sign in
                    </Link>
                  </>
                ) : (
                  <>
                    Don't have an account?{" "}
                    <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-800 transition">
                      Register here
                    </Link>
                  </>
                )}
              </div>
              
              <div className="mt-4 text-center text-xs text-gray-500">
                By continuing, you agree to our{" "}
                <Link to="/terms" className="text-indigo-600 hover:text-indigo-800 transition">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/terms#privacy" className="text-indigo-600 hover:text-indigo-800 transition">
                  Privacy Policy
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
