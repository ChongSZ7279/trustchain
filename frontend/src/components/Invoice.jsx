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
  const { currentUser } = useAuth();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ethToRmRate, setEthToRmRate] = useState(7500); // Default exchange rate (1 ETH ≈ 7500 RM)

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const response = await axios.get(`/api/donations/${id}`);
        setDonation(response.data);
        
        // Redirect if user is not the owner - using ic_number
        if (currentUser?.ic_number !== response.data.user_id) {
          navigate('/unauthorized');
          return;
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching donation:', error);
        setError('Failed to fetch donation details');
        setLoading(false);
      }
    };

    fetchDonation();
  }, [id, currentUser, navigate]);

  useEffect(() => {
    // Fetch current ETH to RM exchange rate
    const fetchExchangeRate = async () => {
      try {
        // You can replace this with your preferred crypto exchange rate API
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=myr');
        if (response.data && response.data.ethereum && response.data.ethereum.myr) {
          setEthToRmRate(response.data.ethereum.myr);
        }
      } catch (error) {
        console.error('Error fetching ETH to RM rate:', error);
        // Keep using the default rate if fetch fails
      }
    };

    fetchExchangeRate();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Function to convert ETH values to RM in the HTML
  const convertEthToRm = (html, rate) => {
    if (!html) return html;
    
    // Create a temporary DOM element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Find all elements that might contain ETH values
    // This regex looks for patterns like "0.05 ETH" or "ETH 0.05"
    const ethRegex = /(\d+(\.\d+)?\s*ETH|ETH\s*\d+(\.\d+)?)/gi;
    
    // Process text nodes to replace ETH values
    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (ethRegex.test(text)) {
          // Reset regex lastIndex
          ethRegex.lastIndex = 0;
          
          // Replace ETH values with ETH and RM equivalent
          node.textContent = text.replace(ethRegex, (match) => {
            // Extract the numeric value
            const numericValue = parseFloat(match.replace(/[^\d.]/g, ''));
            if (!isNaN(numericValue)) {
              // Calculate RM value
              const rmValue = (numericValue * rate).toFixed(2);
              return `${match} (RM ${rmValue})`;
            }
            return match;
          });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Process child nodes recursively
        Array.from(node.childNodes).forEach(processNode);
      }
    };
    
    // Process all nodes in the HTML
    Array.from(tempDiv.childNodes).forEach(processNode);
    
    return tempDiv.innerHTML;
  };

  const downloadInvoice = async () => {
    try {
      // Use html2pdf from CDN (added to index.html)
      const element = document.getElementById('invoice-container');
      const opt = {
        margin: 1,
        filename: donation?.filename || `donation-invoice-${id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      // Check if html2pdf is available globally
      if (window.html2pdf) {
        window.html2pdf().set(opt).from(element).save();
        toast.success('Invoice downloaded successfully');
      } else {
        toast.error('PDF generation library not loaded');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const printInvoice = () => {
    try {
      const printContent = document.getElementById('invoice-container');
      const originalContents = document.body.innerHTML;
      
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      
      // Reload the page to restore React functionality
      window.location.reload();
    } catch (error) {
      console.error('Error printing invoice:', error);
      toast.error('Failed to print invoice');
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen">
      <BackButton />
      <div className="max-w-4xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <FaFileInvoice className="h-6 w-6 text-indigo-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">Donation Invoice</h2>
              </div>
              <p className="text-sm text-gray-500">
                Invoice ID: {id}
              </p>
            </div>
          </div>

          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center">
                <FaFileAlt className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-500">
                  {donation?.filename || `donation-invoice-${id}.pdf`}
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
              <div dangerouslySetInnerHTML={{ __html: convertEthToRm(donation?.html, ethToRmRate) }} />
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
}

export default Invoice;
