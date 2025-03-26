import React from 'react';
import { 
  FaCreditCard, 
  FaUniversity, 
  FaMobile, 
  FaQrcode, 
  FaEthereum,
  FaCheckCircle
} from 'react-icons/fa';

const MalaysianPaymentOptions = ({ 
  selectedMethod, 
  onSelectMethod, 
  showBlockchain = true 
}) => {
  // Malaysian payment methods
  const paymentMethods = [
    {
      id: 'fpx',
      name: 'FPX Online Banking',
      description: 'Pay directly from your Malaysian bank account',
      icon: <FaUniversity className="h-6 w-6" />,
      popular: true,
    },
    {
      id: 'tng',
      name: 'Touch \'n Go eWallet',
      description: 'Pay using your Touch \'n Go eWallet',
      icon: <FaMobile className="h-6 w-6" />,
      popular: true,
    },
    {
      id: 'boost',
      name: 'Boost',
      description: 'Pay using your Boost e-wallet',
      icon: <FaMobile className="h-6 w-6" />,
    },
    {
      id: 'grabpay',
      name: 'GrabPay',
      description: 'Pay using your GrabPay wallet',
      icon: <FaMobile className="h-6 w-6" />,
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay with Visa, Mastercard, or American Express',
      icon: <FaCreditCard className="h-6 w-6" />,
    },
    {
      id: 'duitnow',
      name: 'DuitNow QR',
      description: 'Scan a QR code to pay',
      icon: <FaQrcode className="h-6 w-6" />,
    },
  ];

  // Add blockchain option if enabled
  const allPaymentMethods = showBlockchain 
    ? [...paymentMethods, {
        id: 'blockchain',
        name: 'Ethereum Blockchain',
        description: 'Donate using cryptocurrency for full transparency',
        icon: <FaEthereum className="h-6 w-6" />,
      }]
    : paymentMethods;

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Payment Method</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
        {allPaymentMethods.map((method) => (
          <div
            key={method.id}
            className={`relative rounded-lg border ${
              selectedMethod === method.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300'
            } p-4 flex cursor-pointer focus:outline-none`}
            onClick={() => onSelectMethod(method.id)}
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${
                selectedMethod === method.id ? 'text-indigo-600' : 'text-gray-400'
              }`}>
                {method.icon}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900 flex items-center">
                  {method.name}
                  {method.popular && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Popular
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-500">{method.description}</p>
              </div>
            </div>
            {selectedMethod === method.id && (
              <div className="absolute top-3 right-3">
                <FaCheckCircle className="h-5 w-5 text-indigo-600" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bank logos for FPX */}
      {selectedMethod === 'fpx' && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Select Your Bank</h4>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {['Maybank', 'CIMB', 'Public Bank', 'RHB', 'Hong Leong Bank', 'AmBank', 
              'Bank Islam', 'Alliance Bank', 'Bank Rakyat', 'BSN', 'OCBC', 'UOB'].map((bank) => (
              <div 
                key={bank} 
                className="p-2 border rounded-md text-center text-xs hover:bg-gray-100 cursor-pointer"
              >
                {bank}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* E-wallet specific instructions */}
      {['tng', 'boost', 'grabpay'].includes(selectedMethod) && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {selectedMethod === 'tng' ? 'Touch \'n Go eWallet' : 
             selectedMethod === 'boost' ? 'Boost' : 'GrabPay'} Instructions
          </h4>
          <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-1">
            <li>You'll receive a payment link via SMS after confirming</li>
            <li>Open the link on your phone</li>
            <li>Complete the payment in your e-wallet app</li>
            <li>Return to this page to see your donation confirmation</li>
          </ol>
        </div>
      )}

      {/* DuitNow QR instructions */}
      {selectedMethod === 'duitnow' && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md text-center">
          <h4 className="text-sm font-medium text-gray-900 mb-2">DuitNow QR</h4>
          <p className="text-sm text-gray-600 mb-3">
            Scan this QR code with any banking or e-wallet app that supports DuitNow QR
          </p>
          <div className="inline-block p-4 bg-white border rounded-md">
            <div className="w-48 h-48 bg-gray-200 mx-auto flex items-center justify-center">
              <FaQrcode className="h-32 w-32 text-gray-400" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MalaysianPaymentOptions; 