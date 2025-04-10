import express from "express";
import {
  createNotification,
  getAllNotifications,
  getNotificationById,
  getNotificationsByCategory,
  updateNotification,
  deleteNotification,
} from "../controllers/notification-controller";

const router = express.Router();

router.post("/", createNotification);
router.get("/", getAllNotifications);
router.get("/:id", getNotificationById);
router.get("/category/:category", getNotificationsByCategory);
router.patch("/:id", updateNotification);
router.delete("/:id", deleteNotification);

export default router;
