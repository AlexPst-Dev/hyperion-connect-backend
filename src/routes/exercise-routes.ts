import express from "express";
import {
  createExercice,
  getAllExercices,
  getExerciceById,
  updateExerciceById,
  softDeleteExerciceById,
  deleteExerciceById,
  getMuscleGroupsForExercise,
} from "../controllers/exercises-controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  requireRole(["admin", "coach", "medic"]),
  createExercice
);
router.get(
  "/",
  authenticateToken,
  requireRole(["admin", "coach", "medic"]),
  getAllExercices
);
router.get(
  "/:id",
  authenticateToken,
  requireRole(["admin", "coach", "medic", "sportsman"]),
  getExerciceById
);
router.get(
  "/:id/muscle-groups",
  authenticateToken,
  requireRole(["admin", "coach", "medic", "sportsman"]),
  getMuscleGroupsForExercise
);
router.patch(
  "/:id",
  authenticateToken,
  requireRole(["admin", "coach", "medic"]),
  updateExerciceById
);
router.patch(
  "/:id/archive",
  authenticateToken,
  requireRole("admin"),
  softDeleteExerciceById
);
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["admin", "coach", "medic"]),
  deleteExerciceById
);

export default router;
