import { Router } from "express";
import {
  createFile,
  getAllFiles,
  getFileById,
  getFilesByCategory,
  updateFile,
  deleteFile,
  downloadFile,
  serveImage,
} from "../controllers/file-controller";
import {
  authenticateToken,
  requireRole,
  requireRoleOrSelf,
  requireSelfOrAdmin,
} from "../middleware/auth.middleware";
import {
  handleMulterError,
  moveFileToCorrectFolder,
  upload,
} from "../middleware/multer.middleware";
import { corsForImages } from "../middleware/corsForImages.middleware";

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
router.options("/image/:id", corsForImages);
router.get(
  "/image/:id",
  corsForImages,
  authenticateToken,
  requireRole(["admin", "coach", "medic", "sportsman"]),
  serveImage
);
router.get("/", authenticateToken, requireRole("admin"), getAllFiles);
router.get(
  "/category/:category",
  authenticateToken,
  requireRole("admin"),
  getFilesByCategory
);
router.patch("/:id", authenticateToken, updateFile);
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["admin", "coach", "medic", "sportsman"]),
  deleteFile
);

export default router;
