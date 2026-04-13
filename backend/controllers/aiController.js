const { askAI } = require("../utils/gemini");

// 🔥 Generate Project Description
exports.generateDescription = async (req, res) => {
  try {
    const { title, skills } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title required" });
    }

    const prompt = `
    You are a professional software architect.

    Generate a short and clear project description.

    Title: ${title}
    Skills: ${skills}

    Keep it:
    - 3-5 lines
    - Simple
    - Beginner-friendly
    `;

    const response = await askAI(prompt);

    res.json({ description: response });

  } catch (err) {
    console.log("AI DESCRIPTION ERROR:", err);
    res.status(500).json({ message: "AI error" });
  }
};


// 🤖 Project Assistant
exports.projectAssistant = async (req, res) => {
  try {
    const { question, project } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question required" });
    }

    const prompt = `
You are an AI assistant for a platform called SkillSwap.

-------------------------
📌 ABOUT PLATFORM:
SkillSwap is a platform where users:
- Create and join projects
- Add skills and interests in their profile
- Get project recommendations based on skills
- Collaborate with other developers

-------------------------
📌 PLATFORM RULES:
- To join projects → user should explore recommended projects
- Recommendations improve when user adds skills & interests
- Users can create their own projects
- Team size limits collaboration
- Users should complete their profile for better experience

-------------------------
📌 YOUR ROLE:
- Help users with:
  1. Project-related doubts
  2. Platform-related questions
- Answer simply and clearly
- Be beginner-friendly
- Give actionable suggestions

-------------------------
📌 PROJECT CONTEXT:
Title: ${project?.title || "N/A"}
Description: ${project?.description || "N/A"}
Skills: ${project?.skills || "N/A"}

-------------------------
📌 USER QUESTION:
${question}

-------------------------
📌 INSTRUCTIONS:
- If question is about platform → guide user properly
- If about project → give technical help
- If both → combine answers
- Keep response short and helpful
`;

    const response = await askAI(prompt);

    res.json({ answer: response });

  } catch (err) {
    console.log("AI ASSISTANT ERROR:", err);
    res.status(500).json({ message: "AI assistant error" });
  }
};