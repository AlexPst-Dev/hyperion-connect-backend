import express from "express";
import {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from "../controllers/subscription-controller";

const router = express.Router();

router.get("/", getAllSubscriptions);
router.get("/:id", getSubscriptionById);
router.post("", createSubscription);
router.patch("/:id", updateSubscription);
router.delete("/:id", deleteSubscription);

export default router;
