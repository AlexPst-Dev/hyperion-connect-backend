import express from "express";
import {
  createObjective,
  getAllObjectives,
  getObjectiveById,
  getObjectivesByResponsible,
  getObjectivesBySportsman,
  getInactiveObjectivesBySportsman,
  updateObjective,
  deleteObjective,
} from "../controllers/objective-controller";

const router = express.Router();

router.post("/", createObjective);
router.get("/", getAllObjectives);
router.get("/:id", getObjectiveById);
router.get("/by-sportsman/:sportsmanId", getObjectivesBySportsman);
router.get("/by-responsible/:responsibleId", getObjectivesByResponsible);
router.get(
  "/sportsman/:sportsmanId/inactive",
  getInactiveObjectivesBySportsman
);
router.patch("/:id", updateObjective);
router.delete("/:id", deleteObjective);

export default router;
