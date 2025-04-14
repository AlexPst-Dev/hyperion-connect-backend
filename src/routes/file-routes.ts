import { Router } from "express";
import {
  createFile,
  getAllFiles,
  getFileById,
  getFilesByCategory,
  updateFile,
  deleteFile,
} from "../controllers/file-controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router = Router();

// File routes
// Public
router.get("/:id", getFileById);

// Private
router.post(
  "/",
  authenticateToken,
  requireRole(["admin", "coach", "medic", "sportsman", "partner"]),
  createFile
);
router.get("/", authenticateToken, requireRole("admin"), getAllFiles);
router.get(
  "/category/:category",
  authenticateToken,
  requireRole("admin"),
  getFilesByCategory
);
router.patch("/:id", authenticateToken, requireRole("admin"), updateFile);
router.delete("/:id", authenticateToken, requireRole("admin"), deleteFile);

export default router;
