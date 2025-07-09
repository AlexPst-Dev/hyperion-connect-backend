import { Router } from "express";
import {
  createFile,
  getAllFiles,
  getFileById,
  getFilesByCategory,
  updateFile,
  deleteFile,
  downloadFile,
} from "../controllers/file-controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import {
  handleMulterError,
  moveFileToCorrectFolder,
  upload,
} from "../middleware/multer.middleware";

const router = Router();

// File routes
// Public
router.get("/:id", getFileById);

// Private
router.post(
  "/",
  authenticateToken,
  requireRole(["admin", "coach", "medic", "sportsman", "partner"]),
  upload.single("file"),
  handleMulterError,
  moveFileToCorrectFolder,
  createFile
);
router.get(
  "/download/:id",
  authenticateToken,
  requireRole(["admin", "coach", "medic", "sportsman"]),
  downloadFile
);
router.get("/", authenticateToken, requireRole("admin"), getAllFiles);
router.get(
  "/category/:category",
  authenticateToken,
  requireRole("admin"),
  getFilesByCategory
);
router.patch("/:id", authenticateToken, updateFile);
router.delete("/:id", authenticateToken, requireRole("admin"), deleteFile);

export default router;
