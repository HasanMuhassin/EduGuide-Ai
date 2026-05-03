const { GoogleGenAI } = require('@google/genai');
const dbService = require('./dbService');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const geminiService = {
  getAIResponse: async (prompt, userMessage) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return "I am currently unable to connect to my AI core. Please ask me about specific courses or fees.";
      }

      // Pull live course data from Firestore to inject into context
      let courseContext = '';
      try {
        const courses = await dbService.getAllCourses();
        if (courses.length > 0) {
          courseContext = courses.map(c => {
            const parts = [`Course: ${c.name}`];
            if (c.university) parts.push(`University: ${c.university}`);
            if (c.field) parts.push(`Field: ${c.field}`);
            if (c.courseType) parts.push(`Type: ${c.courseType}`);
            if (c.level) parts.push(`Level: ${c.level}`);
            if (c.duration) parts.push(`Duration: ${c.duration}`);
            if (c.studyMode) parts.push(`Mode: ${c.studyMode}`);
            if (c.totalFee) parts.push(`Total Fee: LKR ${Number(c.totalFee).toLocaleString()}`);
            if (c.registrationFee) parts.push(`Registration Fee: LKR ${Number(c.registrationFee).toLocaleString()}`);
            if (c.installmentAvailable) parts.push(`Installments: ${c.installmentAvailable}`);
            if (c.installmentPlan) parts.push(`Installment Plan: ${c.installmentPlan}`);
            if (c.eligibility) parts.push(`Eligibility: ${c.eligibility}`);
            if (c.minimumRequirements) parts.push(`Min Requirements: ${c.minimumRequirements}`);
            if (c.subjects && c.subjects.length) parts.push(`Subjects: ${c.subjects.join(', ')}`);
            if (c.campusLocation) parts.push(`Location: ${c.campusLocation}`);
            if (c.city) parts.push(`City: ${c.city}`);
            if (c.onlineAvailable) parts.push(`Online: ${c.onlineAvailable}`);
            if (c.jobOpportunities && c.jobOpportunities.length) parts.push(`Careers: ${c.jobOpportunities.join(', ')}`);
            if (c.careerPath) parts.push(`Career Path: ${c.careerPath}`);
            if (c.internshipAvailable) parts.push(`Internship: ${c.internshipAvailable}`);
            if (c.industryCertification) parts.push(`Industry Cert: ${c.industryCertification}`);
            if (c.keywords && c.keywords.length) parts.push(`Keywords: ${c.keywords.join(', ')}`);
            return parts.join(' | ');
          }).join('\n');
        }
      } catch (e) {
        console.warn('Could not load course context for AI:', e.message);
      }

      const systemInstruction = `You are EduGuide AI, a professional education consultant.
You help students find the best courses, understand fees, check eligibility, and plan their careers.
Be friendly, concise, and accurate.

${courseContext ? `=== AVAILABLE COURSES IN DATABASE ===\n${courseContext}\n===================================\n\nUse the above course data to answer student questions accurately. If a student asks about fees, eligibility, duration, subjects, or careers — refer to the database above.` : 'No courses are in the database yet. Let students know they can contact the institution for course details.'}`;

      const fullPrompt = `${systemInstruction}\n\nStudent Question: ${userMessage}\n\nPlease provide a helpful, professional response:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
          temperature: 0.6,
          maxOutputTokens: 400
        }
      });

      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "I'm having trouble processing that right now. Please ask me about specific courses, fees, or eligibility requirements.";
    }
  }
};

module.exports = { geminiService };
