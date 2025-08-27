import express from "express";
import {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscriptionByUserId,
  askForChangeSubscription,
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
  requireRole(["admin", "coach", "medic"]),
  getSubscriptionById
);
router.get(
  "/user/:userId",
  authenticateToken,
  requireSelfOrAdmin(),
  getSubscriptionByUserId
);
router.post("/", authenticateToken, requireRole("admin"), createSubscription);
router.post(
  "/askForChange",
  authenticateToken,
  requireRole("sportsman"),
  askForChangeSubscription
);
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
