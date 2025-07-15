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
  createNewUserWithProfile,
} from "../controllers/user-controller";
import {
  authenticateToken,
  requireRole,
  requireRoleOrSelf,
  requireSelfOrAdmin,
} from "../middleware/auth.middleware";

const router = Router();

// User routes
// Public
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.get("/category/:category", getUsersByProfileCategory);
router.get("/sportsman/:id/graph", getGraphBySportsmanUserId);
router.get("/partner/:id/company", getCompanyByPartnerId);
// Private
router.get(
  "/sportsman/:id/subscription",
  authenticateToken,
  requireSelfOrAdmin(),
  getSubscriptionBySportsmanUserId
);
router.put("/:id", authenticateToken, requireSelfOrAdmin(), updateUserById);
router.patch(
  "/:id/:profileCategory",
  authenticateToken,
  requireRoleOrSelf(["admin", "coach", "medic", "partner"]),
  updateUserByProfileAndId
);
router.post(
  "/",
  authenticateToken,
  requireRole("admin"),
  createNewUserWithProfile
);
router.delete("/:id", authenticateToken, requireRole("admin"), deleteUserById);
export default router;
