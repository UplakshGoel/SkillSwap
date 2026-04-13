const express = require("express");
const router = express.Router();

const {
  generateDescription,
  projectAssistant
} = require("../controllers/aiController");

// ✨ Generate Description
router.post("/generate-description", generateDescription);

// 🤖 Project Assistant
router.post("/assistant", projectAssistant);

module.exports = router;