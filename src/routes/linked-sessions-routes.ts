import express from "express";
import {
  createLinkedSession,
  getAllLinkedSessions,
  getLinkedSessionById,
  updateLinkedSession,
  deleteLinkedSession,
} from "../controllers/linked-sessions-controller";

const router = express.Router();

router.post("/", createLinkedSession);
router.get("/", getAllLinkedSessions);
router.get("/:id", getLinkedSessionById);
router.put("/:id", updateLinkedSession);
router.delete("/:id", deleteLinkedSession);

export default router;
