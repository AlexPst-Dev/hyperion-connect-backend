import express from "express";
import {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscriptionByUserId,
} from "../controllers/subscription-controller";
import {
  authenticateToken,
  requireRole,
  requireSelfOrAdmin,
} from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", authenticateToken, requireRole("admin"), getAllSubscriptions);
router.get(
  "/:id",
  authenticateToken,
  requireRole("admin"),
  getSubscriptionById
);
router.get(
  "/user/:userId",
  authenticateToken,
  requireSelfOrAdmin(),
  getSubscriptionByUserId
);
router.post("/", authenticateToken, requireRole("admin"), createSubscription);
router.patch(
  "/:id",
  authenticateToken,
  requireRole("admin"),
  updateSubscription
);
router.delete(
  "/:id",
  authenticateToken,
  requireRole("admin"),
  deleteSubscription
);

export default router;
