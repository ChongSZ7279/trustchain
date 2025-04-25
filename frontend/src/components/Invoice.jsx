import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  FaDownload, 
  FaPrint, 
  FaArrowLeft, 
  FaExclamationTriangle, 
  FaFileInvoice, 
  FaSync,
  FaFileAlt
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import BackButton from './BackToHistory';

const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonation = async () => {
      setLoading(true);
      console.log('Starting invoice fetch...', {
        donationId: id,
        userDetails: {
          isAdmin: user?.is_admin,
          ic_number: user?.ic_number
        }
      });

      try {
        // First try to get the donation details
        const donationResponse = await axios.get(`/api/donations/${id}`);
        console.log('Donation details:', donationResponse.data);

        // Then get the invoice
        const response = await axios.get(`/api/donations/${id}/invoice`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        console.log('Invoice Response:', response.data);
        
        if (response.data) {
          setDonation(response.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Invoice fetch error:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
        
        // More descriptive error message
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Failed to fetch invoice';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDonation();
    }
  }, [id, user]);

  const downloadInvoice = async () => {
    try {
      const response = await axios.get(`/api/donations/${id}/invoice-pdf`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `donation-invoice-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice. Please try again later.');
    }
  };

  const printInvoice = () => {
    try {
      const printContent = document.getElementById('invoice-container');
      if (!printContent) {
        toast.error('Print content not found');
        return;
      }

      const originalContents = document.body.innerHTML;
      const printStyles = `
        <style>
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      `;
      
      document.body.innerHTML = printStyles + printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      
      // Reload the page to restore React functionality
      window.location.reload();
    } catch (error) {
      console.error('Error printing invoice:', error);
      toast.error('Failed to print invoice');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-md">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <FaExclamationTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Invoice</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/donations')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FaArrowLeft className="mr-2" /> Back to Donations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton />
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <FaFileInvoice className="h-6 w-6 text-indigo-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">Donation Invoice</h2>
              </div>
              <p className="text-sm text-gray-500">
                Invoice #{id}
              </p>
            </div>
          </div>

          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center">
                <FaFileAlt className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-500">
                  donation-invoice-{id}.pdf
                </span>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={downloadInvoice}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaDownload className="mr-2" /> Download PDF
                </button>
                <button
                  onClick={printInvoice}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaPrint className="mr-2" /> Print
                </button>
              </div>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:px-6">
            <div 
              id="invoice-container" 
              className="invoice-container overflow-hidden border border-gray-200 p-6 rounded-md"
            >
              {donation?.html ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: donation.html }} 
                  className="invoice-content"
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaFileInvoice className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No invoice content available</p>
                  <p className="text-sm text-gray-400 mt-2">
                    If this persists, please contact support
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Thank you for your donation. For any questions regarding this invoice, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
