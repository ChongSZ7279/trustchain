import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyBUMcMWNcCDoL0uXwHwx-gxxsX3QG3FEXw");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const generateAIResponse = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating response:", error);
    return "Error generating response.";
  }
};
