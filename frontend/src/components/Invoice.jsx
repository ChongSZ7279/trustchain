import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
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

export default function Invoice() {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invoiceHtml, setInvoiceHtml] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [ethToRmRate, setEthToRmRate] = useState(7500); // Default exchange rate (1 ETH ≈ 7500 RM)

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
        
        // Convert ETH to RM in the HTML content
        const convertedHtml = convertEthToRm(response.data.html, ethToRmRate);
        
        setInvoiceHtml(convertedHtml);
        setInvoiceData(response.data);
        setLoading(false);
        
        // Auto download if specified in URL
        if (searchParams.get('download') === 'true') {
          setTimeout(() => {
            downloadInvoice();
          }, 1000);
        }
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
  }, [donationId, retryCount, ethToRmRate, searchParams]);

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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Failed to load invoice</h2>
          <p className="mt-2">Please try again later</p>
          <div className="mt-4 flex space-x-4 justify-center">
            <Link to={`/donations/${donationId}`} className="inline-block text-indigo-600 hover:text-indigo-900">
              Back to Donation
            </Link>
            <button 
              onClick={handleRetry}
              className="inline-block text-indigo-600 hover:text-indigo-900"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                Invoice ID: {donationId}
              </p>
            </div>
          </div>

          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center">
                <FaFileAlt className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-500">
                  {invoiceData?.filename || `donation-invoice-${donationId}.pdf`}
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
              <div dangerouslySetInnerHTML={{ __html: invoiceHtml }} />
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