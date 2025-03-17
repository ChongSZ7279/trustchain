import React from "react";
import { Link, Outlet, useMatches, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function AuthLayout() {
  const matches = useMatches();
  const location = useLocation();
  const handle = matches[matches.length - 1]?.handle;
  
  const isRegisterPage = location.pathname.includes("/register");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center px-8 sm:px-16 py-12 w-full lg:w-3/5">
        <div className="max-w-md mx-auto w-full">
          <Link to="/" className="text-gray-600 flex items-center mb-8 hover:text-indigo-600 transition">
            <FaArrowLeft className="mr-2" /> Back to Home
          </Link>

          {/* Branding */}
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">TrustChain</h1>
            <p className="mt-2 text-gray-500">
              {isRegisterPage
                ? "Create your account to get started"
                : "Welcome back! Please sign in to continue"}
            </p>
          </div>

          {/* Auth Form Card */}
          <div className="mt-8 bg-white shadow-lg rounded-xl p-6 sm:p-8 border border-gray-100">
            <Outlet />
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center text-gray-600 text-sm">
            {isRegisterPage ? (
              <>
                Already have an account?{" "}
                <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-800">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-800">
                  Register here
                </Link>
              </>
            )}
          </div>
          
          <div className="mt-4 text-center text-xs text-gray-500">
            By continuing, you agree to our{" "}
            <Link to="/terms" className="text-indigo-600 hover:text-indigo-800">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/terms#privacy" className="text-indigo-600 hover:text-indigo-800">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
