const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function askAI(prompt) {
  let retries = 3;

  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text;

    } catch (err) {
      retries--;

      // Retry only for 503 / UNAVAILABLE errors
      if (
        retries > 0 &&
        (err.message.includes("503") || err.message.includes("UNAVAILABLE"))
      ) {
        const delay = (4 - retries) * 2000; // 2s, 4s, 6s
        console.log(`Retrying in ${delay / 1000}s...`);

        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error("Gemini Error:", err);
        return "AI is currently experiencing high demand. Please try again later.";
      }
    }
  }
}

module.exports = { askAI };