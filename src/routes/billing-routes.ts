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
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRole } from "../middleware/authorize-role";

const router = express.Router();

router.post("/", authenticateToken, authorizeRole(["admin"]), createBilling);
router.get("/", authenticateToken, authorizeRole(["admin"]), getAllBillings);
router.get("/:id", authenticateToken, authorizeRole(["admin"]), getBillingById);
router.get(
  "/objective/:objectiveId",
  authenticateToken,
  authorizeRole(["admin"]),
  getBillingsByObjectiveId
);
router.get(
  "/user/:sportsmanId",
  authenticateToken,
  authorizeRole(["sportsman", "admin"]),
  getBillingsByUser
);
router.patch(
  "/:billingId",
  authenticateToken,
  authorizeRole(["admin"]),
  updateBilling
);
router.delete(
  "/:billingId",
  authenticateToken,
  authorizeRole(["admin"]),
  deleteBilling
);

export default router;
