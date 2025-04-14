import { Router } from "express";
import {
  createClientList,
  getClientListByProfessionalId,
  updateClientListByProfessionalId,
  clearClientListByProfessionalId,
} from "../controllers/client-controller";
import {
  authenticateToken,
  requireRole,
  requireSelfOrAdmin,
} from "../middleware/auth.middleware";

const router = Router();

// Client routes
// Private
router.post("/", authenticateToken, requireRole("admin"), createClientList);
router.get(
  "/:professionalId",
  authenticateToken,
  requireSelfOrAdmin(),
  getClientListByProfessionalId
);
router.post(
  "/update/:professionalId",
  authenticateToken,
  requireRole("admin"),
  updateClientListByProfessionalId
);
router.delete(
  "/:professionalId",
  authenticateToken,
  requireRole("admin"),
  clearClientListByProfessionalId
);

export default router;
