import express from "express";
import {
  createSession,
  getAllSessions,
  getSessionById,
  updateSessionById,
  softDeleteSessionById,
  deleteSessionById,
} from "../controllers/session-controller";

const router = express.Router();

router.post("/", createSession);
router.get("/", getAllSessions);
router.get("/:id", getSessionById);
router.patch("/:id", updateSessionById);
router.patch("/:id/archive", softDeleteSessionById);
router.delete("/:id", deleteSessionById);

export default router;
