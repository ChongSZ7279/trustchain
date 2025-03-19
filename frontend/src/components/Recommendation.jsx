import { useState, useEffect } from "react";
import { generateAIResponse } from "../context/geminiService";

const AIGenerator = ({ userHistory, followedCharityNames, onRecommendation }) => {
  const [charities, setCharities] = useState([]);

  // Fetch charities from API on mount
  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const res = await fetch("/api/charities"); // Replace with actual API endpoint
        if (!res.ok) throw new Error(`Failed to fetch charities: ${res.status}`);

        const responseData = await res.json();
        const charitiesList = responseData.data || [];

        setCharities(charitiesList);
      } catch (error) {
        setCharities([]); // Ensure charities is an empty array on failure
      }
    };

    fetchCharities();
  }, []); // Fetch charities only once on mount

  // Generate AI-based recommendation when userHistory or charities change
  useEffect(() => {
    const generateRecommendation = async () => {
      if (!userHistory || userHistory.length === 0) {
        onRecommendation(null);
        return;
      }

      if (charities.length === 0) {
        onRecommendation(null);
        return;
      }

      // 🔹 Filter out followed charities
      const availableCharities = charities.filter(
        (charity) => !followedCharityNames.includes(charity.name.toLowerCase())
      );

      // 🔹 If ALL charities are followed, return NO recommendation
      if (availableCharities.length === 0) {
        console.warn("All charities are followed. No recommendations available.");
        onRecommendation(null);
        return;
      }

      try {
        // Format charity data for AI
        const charityNames = availableCharities
          .map((charity) => `Name: ${charity.name}, Description: ${charity.description}`)
          .join("; ");

        // Create AI prompt
        const prompt = `Based on this user history: ${JSON.stringify(userHistory)}, 
        which of these charities would be the best match? ${charityNames}. 
        Just provide the name of the most suitable charity.`;

        const aiResponse = await generateAIResponse(prompt);
        const cleanResponse = aiResponse?.trim();

        // Try to find the recommended charity
        let matchedCharity = availableCharities.find(
          (charity) => charity.name.toLowerCase() === cleanResponse?.toLowerCase()
        );

        // 🔹 Fallback: If AI response is invalid, pick a random charity
        if (!matchedCharity) {
          matchedCharity = availableCharities[Math.floor(Math.random() * availableCharities.length)];
        }

        onRecommendation(matchedCharity);
      } catch (error) {
        console.error("AI recommendation failed. Falling back to random charity.");
        
        // 🔹 If AI fails, still pick a random charity
        const fallbackCharity = availableCharities[Math.floor(Math.random() * availableCharities.length)];
        onRecommendation(fallbackCharity);
      }
    };

    if (charities.length > 0) {
      generateRecommendation();
    }
  }, [userHistory, charities, followedCharityNames]); // Runs when userHistory, charities, or followedCharityNames change

  return null; // No UI needed, just handling logic
};

export default AIGenerator;
