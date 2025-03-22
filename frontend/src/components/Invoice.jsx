import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaDownload, FaPrint, FaArrowLeft, FaExclamationTriangle, FaFileInvoice, FaSync } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Invoice() {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invoiceHtml, setInvoiceHtml] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Try different endpoints in sequence
        const endpoints = [
          `/donations/${donationId}/invoice-html`,
          `/donations/${donationId}/direct-html`,
          `/donations/${donationId}/simple-html`,
          `/test-invoice-html`
        ];
        
        let response = null;
        let errorMessages = [];
        
        // Try each endpoint until one works
        for (const endpoint of endpoints) {
          try {
            console.log(`Trying endpoint: ${endpoint}`);
            response = await axios.get(endpoint);
            
            if (response.data && response.data.html) {
              console.log(`Success with endpoint: ${endpoint}`);
              break;
            }
          } catch (err) {
            console.error(`Error with endpoint ${endpoint}:`, err);
            errorMessages.push(`${endpoint}: ${err.message}`);
            response = null;
          }
        }
        
        if (!response || !response.data || !response.data.html) {
          throw new Error(`All endpoints failed: ${errorMessages.join(', ')}`);
        }
        
        setInvoiceHtml(response.data.html);
        setInvoiceData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching invoice:', error);
        
        // Get a more specific error message
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message || 
                            'Failed to load invoice';
        
        setError(errorMessage);
        setLoading(false);
        toast.error('Failed to load invoice: ' + errorMessage);
      }
    };

    fetchInvoice();
  }, [donationId, retryCount]);

  const downloadInvoice = async () => {
    try {
      // Use html2pdf from CDN (added to index.html)
      const element = document.getElementById('invoice-container');
      const opt = {
        margin: 1,
        filename: invoiceData?.filename || `donation-invoice-${donationId}.pdf`,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4"
      >
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <FaExclamationTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load Invoice</h2>
          <p className="text-gray-600 mb-6">
            We couldn't load the invoice for this donation. Please try again later or contact support if the problem persists.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              <FaArrowLeft className="mr-2" /> Go Back
            </button>
            <button
              onClick={handleRetry}
              className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <FaSync className="mr-2" /> Try Again
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={downloadInvoice}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <FaDownload className="mr-2" /> Download
          </button>
          <button
            onClick={printInvoice}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <FaPrint className="mr-2" /> Print
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <div 
            id="invoice-container" 
            className="invoice-container"
            dangerouslySetInnerHTML={{ __html: invoiceHtml }}
          />
        </div>
      </div>
    </motion.div>
  );
} 