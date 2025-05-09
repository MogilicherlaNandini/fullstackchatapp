import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, deleteMessages, clearChat, getNotificationCounts } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id/messages", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.post("/delete", protectRoute, deleteMessages);
router.post("/clear/:userId", protectRoute, clearChat);
router.get("/notifications/counts", protectRoute, getNotificationCounts);

export default router;