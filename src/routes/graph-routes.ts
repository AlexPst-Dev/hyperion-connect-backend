import { Router } from "express";
import {
  createGraph,
  getAllGraphs,
  getGraphById,
  getGraphsByUserId,
  updateGraphById,
  deleteGraphById,
} from "../controllers/graph-controller";
import {
  authenticateToken,
  requireRole,
  requireRoleOrSelf,
} from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authenticateToken,
  requireRole(["admin", "coach"]),
  createGraph
);
router.get("/", authenticateToken, requireRole("admin"), getAllGraphs);
router.get(
  "/:id",
  authenticateToken,
  requireRoleOrSelf(["admin", "coach", "medic"]),
  getGraphById
);
router.get(
  "/user/:userId",
  authenticateToken,
  requireRoleOrSelf(["admin", "coach", "medic"]),
  getGraphsByUserId
);
router.patch(
  "/:id",
  authenticateToken,
  requireRole(["admin", "coach"]),
  updateGraphById
);
router.delete("/:id", authenticateToken, requireRole("admin"), deleteGraphById);

export default router;
