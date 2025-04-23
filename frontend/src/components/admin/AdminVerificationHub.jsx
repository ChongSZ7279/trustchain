import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  FaTasks,
  FaBuilding,
  FaHandshake,
  FaUser,
  FaArrowLeft,
  FaExclamationTriangle,
  FaClipboardCheck
} from 'react-icons/fa';

export default function AdminVerificationHub() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.is_admin) {
      toast.error('You do not have permission to access this page');
      navigate('/');
    }
  }, [user, navigate]);

  const verificationSections = [
    {
      title: 'Task Verification',
      description: 'Review and approve task completion proofs to release funds to charities',
      icon: <FaTasks className="h-10 w-10 text-white" />,
      link: '/admin/verification/tasks',
      color: 'from-indigo-600 to-indigo-700',
      hoverColor: 'from-indigo-700 to-indigo-800'
    },
    {
      title: 'Organization Verification',
      description: 'Verify organization registration documents for platform approval',
      icon: <FaBuilding className="h-10 w-10 text-white" />,
      link: '/admin/verification/organizations',
      color: 'from-emerald-600 to-emerald-700',
      hoverColor: 'from-emerald-700 to-emerald-800'
    },
    {
      title: 'Charity Verification',
      description: 'Verify charity registration documents and eligibility',
      icon: <FaHandshake className="h-10 w-10 text-white" />,
      link: '/admin/verification/charities',
      color: 'from-blue-600 to-blue-700',
      hoverColor: 'from-blue-700 to-blue-800'
    },
    {
      title: 'User Verification',
      description: 'Verify user identity and documentation for enhanced trust',
      icon: <FaUser className="h-10 w-10 text-white" />,
      link: '/admin/verification/users',
      color: 'from-purple-600 to-purple-700',
      hoverColor: 'from-purple-700 to-purple-800'
    }
  ];

  if (!user || !user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="bg-yellow-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto">
            <FaExclamationTriangle className="h-8 w-8 text-yellow-500" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-3 text-gray-600">You do not have permission to access this page.</p>
          <Link to="/" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5">
            <FaArrowLeft className="mr-2" />
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <FaClipboardCheck className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-3xl font-bold">Verification Hub</h1>
                  <p className="text-sm text-indigo-100 mt-1">Manage all verification tasks in one place</p>
                </div>
              </div>
              <Link to="/admin/dashboard" className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-white border-opacity-30 text-sm font-medium rounded-md text-white bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm">
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {verificationSections.map((section, index) => (
            <Link
              key={index}
              to={section.link}
              className="block h-full"
            >
              <div className={`h-full rounded-xl shadow-md overflow-hidden bg-gradient-to-br ${section.color} hover:${section.hoverColor} transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg`}>
                <div className="p-8">
                  <div className="flex items-center">
                    <div className="bg-white bg-opacity-20 rounded-full p-4">
                      {section.icon}
                    </div>
                    <h3 className="ml-6 text-2xl font-semibold text-white">{section.title}</h3>
                  </div>
                  <p className="mt-6 text-lg text-white text-opacity-90">
                    {section.description}
                  </p>
                  <div className="mt-8 flex justify-end">
                    <span className="inline-flex items-center px-4 py-2 rounded-md bg-white bg-opacity-20 text-white text-sm font-medium">
                      Access {section.title} →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 