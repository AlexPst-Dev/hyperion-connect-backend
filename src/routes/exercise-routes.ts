import express from "express";
import {
  createExercice,
  getAllExercices,
  getExerciceById,
  updateExerciceById,
  softDeleteExerciceById,
  deleteExerciceById,
} from "../controllers/exercises-controller";

const router = express.Router();

router.post("/", createExercice);
router.get("/", getAllExercices);
router.get("/:id", getExerciceById);
router.patch("/:id", updateExerciceById);
router.patch("/:id/archive", softDeleteExerciceById);
router.delete("/:id", deleteExerciceById);

export default router;
