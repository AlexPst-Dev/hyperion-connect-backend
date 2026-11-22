import { Router } from "express";
import {
  createContactList,
  getContactListByUserId,
  updateContactListByUserId,
  clearContactListByUserId,
} from "../controllers/contact-controller";
import { authenticateToken, requireSelf } from "../middleware/auth.middleware";

const router = Router();

// Contact routes
// Signed-in users only (guard applied in server.ts)
router.post("/", createContactList);
router.get("/:userId", getContactListByUserId);
router.delete("/:userId", clearContactListByUserId);

// Private
router.post(
  "/update/:userId",
  authenticateToken,
  requireSelf(),
  updateContactListByUserId
);

export default router;
