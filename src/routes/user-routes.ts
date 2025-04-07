import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  getUsersByProfileCategory,
  getSubscriptionBySportsmanUserId,
  getGraphBySportsmanUserId,
  getCompanyByPartnerId,
  updateUserById,
  updateUserByProfileAndId,
  deleteUserById,
} from "../controllers/user-controller";

const router = Router();

// User routes
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.get("/category/:category", getUsersByProfileCategory);
router.get("/sportsman/:id/subscription", getSubscriptionBySportsmanUserId);
router.get("/sportsman/:id/graph", getGraphBySportsmanUserId);
router.get("/partner/:id/company", getCompanyByPartnerId);
router.put("/:id", updateUserById);
router.patch("/:id/:profileCategory", updateUserByProfileAndId);
router.delete("/:id", deleteUserById);

export default router;
