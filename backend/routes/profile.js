const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profileController");

router.get("/:email", profileController.getProfile);
router.put("/update", profileController.updateProfile);
module.exports = router;