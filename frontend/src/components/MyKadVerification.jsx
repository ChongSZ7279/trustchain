import React, { useState } from 'react';
import { FaIdCard, FaCheck, FaTimes, FaInfoCircle, FaUpload } from 'react-icons/fa';
import { useLocalization } from '../context/LocalizationContext';

const MyKadVerification = ({ onVerificationComplete }) => {
  const [icNumber, setIcNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [idImage, setIdImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, verifying, success, failed
  const [errors, setErrors] = useState({});
  const { formatMyKad, validateMyKad } = useLocalization();

  const handleIcNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 12);
    setIcNumber(value);
    
    if (value.length === 12) {
      const isValid = validateMyKad(value);
      setErrors(prev => ({
        ...prev,
        icNumber: isValid ? '' : 'Invalid MyKad number format'
      }));
    }
  };

  const handleIdImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setIdImage(e.target.files[0]);
    }
  };

  const handleSelfieImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelfieImage(e.target.files[0]);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!icNumber || icNumber.length !== 12) {
      newErrors.icNumber = 'MyKad number must be 12 digits';
    } else if (!validateMyKad(icNumber)) {
      newErrors.icNumber = 'Invalid MyKad number format';
    }
    
    if (!fullName || fullName.trim().length < 3) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!idImage) {
      newErrors.idImage = 'MyKad image is required';
    }
    
    if (!selfieImage) {
      newErrors.selfieImage = 'Selfie image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setVerificationStatus('verifying');
    
    // In a real application, you would upload the images and data to your backend
    // for verification against the Malaysian National Registration Department (JPN)
    
    // Simulate API call
    setTimeout(() => {
      // For demo purposes, we'll assume verification is successful
      setVerificationStatus('success');
      
      // Notify parent component
      if (onVerificationComplete) {
        onVerificationComplete({
          verified: true,
          icNumber,
          fullName
        });
      }
    }, 3000);
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 bg-blue-50">
        <div className="flex items-center">
          <FaIdCard className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            MyKad Verification
          </h3>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Verify your identity using your Malaysian Identity Card (MyKad)
        </p>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {verificationStatus === 'success' ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaCheck className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Verification Successful</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your identity has been successfully verified. You can now proceed with your donation.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="ic-number" className="block text-sm font-medium text-gray-700">
                  MyKad Number
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="ic-number"
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.icNumber ? 'border-red-300' : ''
                    }`}
                    placeholder="e.g., 901231045678"
                    value={icNumber}
                    onChange={handleIcNumberChange}
                    disabled={verificationStatus === 'verifying'}
                  />
                  {icNumber.length === 12 && !errors.icNumber && (
                    <p className="mt-1 text-sm text-gray-500">
                      Formatted: {formatMyKad(icNumber)}
                    </p>
                  )}
                  {errors.icNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.icNumber}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="full-name" className="block text-sm font-medium text-gray-700">
                  Full Name (as in MyKad)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="full-name"
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.fullName ? 'border-red-300' : ''
                    }`}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={verificationStatus === 'verifying'}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload MyKad Image (Front)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="id-image-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="id-image-upload"
                          name="id-image-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleIdImageUpload}
                          disabled={verificationStatus === 'verifying'}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                    {idImage && (
                      <p className="text-xs text-green-500">
                        <FaCheck className="inline mr-1" /> {idImage.name}
                      </p>
                    )}
                  </div>
                </div>
                {errors.idImage && (
                  <p className="mt-1 text-sm text-red-600">{errors.idImage}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload Selfie with MyKad
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="selfie-image-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="selfie-image-upload"
                          name="selfie-image-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleSelfieImageUpload}
                          disabled={verificationStatus === 'verifying'}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                    {selfieImage && (
                      <p className="text-xs text-green-500">
                        <FaCheck className="inline mr-1" /> {selfieImage.name}
                      </p>
                    )}
                  </div>
                </div>
                {errors.selfieImage && (
                  <p className="mt-1 text-sm text-red-600">{errors.selfieImage}</p>
                )}
              </div>
              
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaInfoCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Information</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Your identity information is securely verified against the Malaysian National Registration Department (JPN) database. 
                        We do not store your MyKad image after verification is complete.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    verificationStatus === 'verifying'
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                  disabled={verificationStatus === 'verifying'}
                >
                  {verificationStatus === 'verifying' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    'Verify Identity'
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default MyKadVerification; 