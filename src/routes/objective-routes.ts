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
import {
  authenticateToken,
  requireRole,
  requireRoleOrSelf,
  requireSelfOrAdmin,
} from "../middleware/auth.middleware";

const router = express.Router();

router.post("/", authenticateToken, requireRole("admin"), createObjective);
router.get("/", authenticateToken, requireRole("admin"), getAllObjectives);
router.get(
  "/:id",
  authenticateToken,
  requireRole(["admin", "coach", "medic", "sportsman"]),
  getObjectiveById
);
router.get(
  "/by-sportsman/:sportsmanId",
  authenticateToken,
  requireRoleOrSelf(["admin", "coach", "medic"]),
  getObjectivesBySportsman
);
router.get(
  "/by-responsible/:responsibleId",
  authenticateToken,
  requireSelfOrAdmin(),
  getObjectivesByResponsible
);
router.get(
  "/sportsman/:sportsmanId/inactive",
  authenticateToken,
  requireRoleOrSelf(["admin", "coach", "medic"]),
  getInactiveObjectivesBySportsman
);
router.patch("/:id", authenticateToken, requireRole("admin"), updateObjective);
router.delete("/:id", authenticateToken, requireRole("admin"), deleteObjective);

export default router;
