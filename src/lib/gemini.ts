import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

const initializeGenAI = () => {
  const apiKey = localStorage.getItem("gemini_api_key");
  if (!apiKey) {
    console.error("Gemini API key not found in localStorage.");
    return null;
  }
  // Initialize only if it hasn't been initialized or if the key has changed.
  // This check is mostly for scenarios like hot-reloading or complex state changes.
  if (!genAI || (genAI as any)._apiKey !== apiKey) {
     genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

export const runGemini = async (prompt: string) => {
  const aiInstance = initializeGenAI();
  if (!aiInstance) {
    throw new Error("Your Gemini API key is not set. Please provide it to enable AI features.");
  }

  const model = aiInstance.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    // Check for a common authentication error message from Google's API
    if (error.message && error.message.includes('API key not valid')) {
       localStorage.removeItem("gemini_api_key");
       // A reload will trigger the dialog to reappear
       window.location.reload();
       throw new Error("Your Gemini API key is invalid. Please enter a valid key.");
    }
    throw new Error("Failed to get response from AI. Please check your connection and API key.");
  }
};