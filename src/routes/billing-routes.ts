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

const router = express.Router();

router.post("/", createBilling);
router.get("/", getAllBillings);
router.get("/:id", getBillingById);
router.get("/objective/:objectiveId", getBillingsByObjectiveId);
router.get("/user/:sportsmanId", getBillingsByUser);
router.patch("/:billingId", updateBilling);
router.delete("/:billingId", deleteBilling);

export default router;
