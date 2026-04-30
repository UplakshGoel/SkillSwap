const express = require("express");
const router = express.Router();
const controller = require("../controllers/projectController");

router.post("/create", controller.createProject);
router.get("/", controller.getProjects);
router.put("/update", controller.updateProject);
router.delete("/delete", controller.deleteProject);

router.get("/recommend/:email", controller.getRecommendedProjects);
router.post("/join", controller.joinProject);

router.get("/my/:email", controller.getMyProjects);
router.get("/all", controller.getAllProjects);

router.post("/kick", controller.kickMember);
router.post("/leave", controller.leaveProject);

router.post("/message", controller.sendMessage);
router.get("/messages/:projectId", controller.getMessages);

router.get("/notifications/:email", controller.getNotifications);
router.post("/notifications/read", controller.markNotificationsRead);
router.post("/notifications/read-one", controller.markOneNotificationRead);
router.post("/notifications/delete", controller.deleteNotification);

router.post("/post", controller.createPost);
router.get("/feed", controller.getFeed);
router.post("/like", controller.toggleLike);
router.post("/comment", controller.addComment);

router.get("/:id", controller.getProjectById);

module.exports = router;