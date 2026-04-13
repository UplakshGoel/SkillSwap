const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function askAI(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: prompt,
    });

    return response.text;

  } catch (err) {
    console.error("Gemini Error:", err);
    return "Hello 👋, welcome to SkillSwap! This is your space to build, collaborate, and grow 🚀. To get started, simply enhance your profile by adding your skills and interests. Once your profile is set up, our intelligent recommendation system will automatically activate your personalized feed, where you’ll discover projects that match your strengths and passions. From there, you can explore opportunities and join any project that excites you—connecting with like-minded individuals and turning ideas into reality.";
  }
}

module.exports = { askAI };