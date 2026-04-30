const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/google-login", userController.googleLogin);
router.post("/github-login", userController.githubLogin);
router.post("/linkedin-login", userController.linkedinLogin);

module.exports = router;