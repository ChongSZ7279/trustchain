import React from 'react';
import { FaDownload, FaEnvelope, FaPrint } from 'react-icons/fa';
import { formatDate } from '../utils/helpers';
import QRCode from 'react-qr-code';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const TransactionReceipt = ({ transaction }) => {
  const receiptRef = React.useRef();
  
  const downloadPDF = async () => {
    const element = receiptRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`donation-receipt-${transaction.id}.pdf`);
  };
  
  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Donation Receipt</title>');
    printWindow.document.write('<style>body { font-family: Arial, sans-serif; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(receiptRef.current.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };
  
  const sendEmail = async () => {
    try {
      await axios.post('/api/send-receipt', {
        transaction_id: transaction.id
      });
      toast.success('Receipt sent to your email');
    } catch (error) {
      console.error('Error sending receipt:', error);
      toast.error('Failed to send receipt');
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Donation Receipt</h2>
        <div className="flex space-x-2">
          <button 
            onClick={downloadPDF}
            className="p-2 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200"
            title="Download PDF"
          >
            <FaDownload />
          </button>
          <button 
            onClick={printReceipt}
            className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
            title="Print Receipt"
          >
            <FaPrint />
          </button>
          <button 
            onClick={sendEmail}
            className="p-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
            title="Email Receipt"
          >
            <FaEnvelope />
          </button>
        </div>
      </div>
      
      <div ref={receiptRef} className="p-6 border border-gray-200 rounded-lg">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Donation Receipt</h3>
            <p className="text-gray-600">Thank you for your contribution!</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Receipt #: {transaction.id.substring(0, 8)}</p>
            <p className="text-sm text-gray-600">Date: {formatDate(transaction.created_at)}</p>
          </div>
        </div>
        
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Donation Details</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Charity</p>
                <p className="font-medium">{transaction.charity?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-medium">
                  {transaction.is_blockchain 
                    ? `${transaction.amount} ETH`
                    : `$${parseFloat(transaction.amount).toFixed(2)}`
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium capitalize">{transaction.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Transaction Type</p>
                <p className="font-medium">
                  {transaction.is_blockchain ? 'Blockchain Donation' : 'Standard Donation'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {transaction.is_blockchain && (
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-700 mb-2">Blockchain Verification</h4>
            <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Transaction Hash</p>
                <p className="font-mono text-sm">{transaction.transaction_hash}</p>
                <a 
                  href={`https://etherscan.io/tx/${transaction.transaction_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  View on Etherscan
                </a>
              </div>
              <div className="bg-white p-2 rounded">
                <QRCode 
                  value={`https://etherscan.io/tx/${transaction.transaction_hash}`}
                  size={80}
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t border-gray-200">
          <p>This receipt serves as confirmation of your donation.</p>
          <p>Thank you for supporting our mission!</p>
        </div>
      </div>
    </div>
  );
};

export default TransactionReceipt; 