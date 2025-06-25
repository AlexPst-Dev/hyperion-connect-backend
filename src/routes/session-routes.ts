import express from "express";
import {
  createSession,
  getAllSessions,
  getSessionById,
  updateSessionById,
  softDeleteSessionById,
  deleteSessionById,
  getExercisesBySessionId,
} from "../controllers/session-controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  requireRole(["admin", "coach", "medic"]),
  createSession
);
router.get(
  "/",
  authenticateToken,
  requireRole(["admin", "coach", "medic"]),
  getAllSessions
);
router.get(
  "/:id",
  authenticateToken,
  requireRole(["admin", "coach", "medic", "sportsman"]),
  getSessionById
);
router.get(
  "/:id/exercises",
  authenticateToken,
  requireRole(["admin", "coach", "medic", "sportsman"]),
  getExercisesBySessionId
);
router.patch(
  "/:id",
  authenticateToken,
  requireRole(["admin", "coach", "medic"]),
  updateSessionById
);
router.patch(
  "/:id/archive",
  authenticateToken,
  requireRole("admin"),
  softDeleteSessionById
);
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["admin", "coach", "medic"]),
  deleteSessionById
);

export default router;
