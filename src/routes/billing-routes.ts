import express from "express";
import {
  createBilling,
  getAllBillings,
  getBillingById,
  getBillingsByObjectiveId,
  getBillingsByUser,
  updateBilling,
  deleteBilling,
} from "../controllers/billing-controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/", authenticateToken, requireRole("admin"), createBilling);
router.get("/", authenticateToken, requireRole("admin"), getAllBillings);
router.get("/:id", authenticateToken, requireRole("admin"), getBillingById);
router.get(
  "/objective/:objectiveId",
  authenticateToken,
  requireRole(["sportsman", "admin"]),
  getBillingsByObjectiveId
);
router.get(
  "/user/:sportsmanId",
  authenticateToken,
  requireRole(["sportsman", "admin"]),
  getBillingsByUser
);
router.patch(
  "/:billingId",
  authenticateToken,
  requireRole("admin"),
  updateBilling
);
router.delete(
  "/:billingId",
  authenticateToken,
  requireRole("admin"),
  deleteBilling
);

export default router;
