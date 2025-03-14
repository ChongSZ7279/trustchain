import { useState, useEffect } from "react";
import { generateAIResponse } from "../context/geminiService";

const AIGenerator = ({ userHistory }) => {
  const [response, setResponse] = useState("");

  const charities = [
    "Red Cross",
    "Save the Children",
    "World Wildlife Fund",
    "Doctors Without Borders",
    "UNICEF",
    "Feeding America",
  ];

  useEffect(() => {
    const generateRecommendation = async () => {
      if (!userHistory || userHistory.length === 0) {
        setResponse("No user history available.");
        return;
      }

      setResponse("Analyzing your history...");
      
      // Create a prompt for AI
      const prompt = `Based on this user history: ${JSON.stringify(userHistory)}, 
      which of these charities would be the best match? ${charities.join(", ")}. 
      Just provide a name of the most suitable charity.`;

      const aiResponse = await generateAIResponse(prompt);
      setResponse(aiResponse);
    };

    generateRecommendation(); // Auto-run on page load
  }, [userHistory]); // Runs when userHistory changes

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-lg font-bold mb-2">Charity Recommendation</h2>
      {response ? (
        <p className="mt-4 p-2 bg-gray-100 rounded">{response}</p>
      ) : (
        <p className="mt-4 p-2 bg-gray-100 rounded">Loading recommendation...</p>
      )}
    </div>
  );
};

export default AIGenerator;

