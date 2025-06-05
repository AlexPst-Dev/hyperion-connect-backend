import express from "express";
import {
  createNotification,
  getAllNotifications,
  getNotificationById,
  getNotificationsByCategory,
  updateNotification,
  deleteNotification,
} from "../controllers/notification-controller";
import {
  authenticateToken,
  requireRole,
  requireSelfOrAdmin,
} from "../middleware/auth.middleware";

const router = express.Router();

// Notification routes
// Public
router.get("/", getAllNotifications);
router.get("/:id", getNotificationById);

// Private
router.post("/", authenticateToken, requireRole("admin"), createNotification);
router.get(
  "/category/:category",
  authenticateToken,
  getNotificationsByCategory
);
router.patch(
  "/:id",
  authenticateToken,
  requireRole("admin"),
  updateNotification
);
router.delete(
  "/:id",
  authenticateToken,
  requireRole("admin"),
  deleteNotification
);

export default router;
