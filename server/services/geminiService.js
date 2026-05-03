const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const geminiService = {
  getAIResponse: async (prompt, userMessage) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is missing. Using mock AI response.");
        return "I am currently unable to connect to my AI core, but I'm an education consultant. How can I help you with your studies?";
      }

      const systemInstruction = "You are an education consultant named EduGuide AI. Provide short, accurate answers related to courses, universities, and careers. Keep your responses concise, helpful, and professional.";
      
      const fullPrompt = `${systemInstruction}\n\nUser Question: ${userMessage}\n\nPlease provide a helpful response as EduGuide AI.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            temperature: 0.7,
            maxOutputTokens: 250
        }
      });

      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "I'm sorry, I'm having trouble processing that request right now. Could you ask me about specific courses or fees?";
    }
  }
};

module.exports = { geminiService };
