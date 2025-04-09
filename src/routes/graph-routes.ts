import { Router } from "express";
import {
  createGraph,
  getAllGraphs,
  getGraphById,
  getGraphsByUserId,
  updateGraphById,
  deleteGraphById,
} from "../controllers/graph-controller";

const router = Router();

router.post("/", createGraph);
router.get("/", getAllGraphs);
router.get("/:id", getGraphById);
router.get("/user/:userId", getGraphsByUserId);
router.patch("/:id", updateGraphById);
router.delete("/:id", deleteGraphById);

export default router;
