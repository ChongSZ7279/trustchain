import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function DonationForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    amount: "",
    name: "",
    email: "",
    message: "",
    paymentMethod: "credit_card",
  });

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <label className="block text-gray-700">Donation Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
              placeholder="Enter amount"
            />
            <button
              onClick={handleNext}
              className="bg-blue-600 text-white px-4 py-2 rounded mt-4 w-full"
            >
              Next
            </button>
          </div>
        );
      case 2:
        return (
          <div>
            <label className="block text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
              placeholder="Enter your name"
            />
            <label className="block text-gray-700 mt-3">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
              placeholder="Enter your email"
            />
            <div className="flex justify-between mt-4">
              <button
                onClick={handlePrev}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <label className="block text-gray-700">Payment Method</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
            >
              <option value="credit_card">Credit Card</option>
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
            <div className="flex justify-between mt-4">
              <button
                onClick={handlePrev}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Back
              </button>
              <button
                onClick={() => alert("Donation Submitted!")}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto">
      {/* Close Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
      >
        <FaTimes size={20} />
      </button>

      <h2 className="text-xl font-bold mb-4">Make a Donation</h2>
      {renderStep()}
    </div>
  );
}
