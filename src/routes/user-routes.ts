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
  deleteCurrentUser,
} from "../controllers/user-controller";
import {
  authenticateToken,
  requireRole,
  requireRoleOrSelf,
  requireSelf,
  requireSelfOrAdmin,
} from "../middleware/auth.middleware";

const router = Router();

// User routes
// Public
router.get("/", getAllUsers);
router.get("/category/:category", getUsersByProfileCategory);

// Private
router.delete("/self", authenticateToken, deleteCurrentUser);

router.get(
  "/sportsman/:id/subscription",
  authenticateToken,
  requireSelfOrAdmin(),
  getSubscriptionBySportsmanUserId
);
router.get("/sportsman/:id/graph", getGraphBySportsmanUserId);
router.get("/partner/:id/company", getCompanyByPartnerId);

router.post(
  "/",
  authenticateToken,
  requireRole("admin"),
  createNewUserWithProfile
);

router.get("/:id", getUserById);
router.put("/:id", authenticateToken, requireSelfOrAdmin(), updateUserById);
router.patch(
  "/:id/:profileCategory",
  authenticateToken,
  requireRoleOrSelf(["admin", "coach", "medic", "partner"]),
  updateUserByProfileAndId
);
router.delete(
  "/:id",
  authenticateToken,
  requireRoleOrSelf(["admin"]),
  deleteUserById
);

export default router;
