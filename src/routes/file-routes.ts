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
  serveCompanyImage,
} from "../controllers/file-controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import { handleMulterError, upload } from "../middleware/multer.middleware";
import {
  corsForDownload,
  corsForImages,
} from "../middleware/corsForImages.middleware";

const router = Router();

// File routes
// Public
router.get("/:id", getFileById);

// Private
router.post(
  "/",
  authenticateToken,
  requireRole(["admin", "coach", "medic", "sportsman", "partner", "free"]),
  upload.single("file"),
  handleMulterError,
  createFile
);

router.get(
  "/download/:id",
  corsForDownload,
  authenticateToken,
  requireRole(["admin", "coach", "medic", "sportsman", "partner"]),
  downloadFile
);

router.options("/image/:id", corsForImages);
router.get(
  "/image/:id",
  corsForImages,
  authenticateToken,
  requireRole(["admin", "coach", "medic", "sportsman", "partner", "free"]),
  serveImage
);

router.options("/companyImage/:id", corsForImages);
router.get(
  "/companyImage/:id",
  corsForImages,
  authenticateToken,
  requireRole(["admin", "coach", "medic", "sportsman", "partner", "free"]),
  serveCompanyImage
);

router.get(
  "/",
  authenticateToken,
  requireRole(["admin", "coach", "medic", "sportsman"]),
  getAllFiles
);

router.get(
  "/category/:category",
  authenticateToken,
  requireRole(["admin", "coach", "medic", "sportsman", "partner", "free"]),
  getFilesByCategory
);

router.patch("/:id", authenticateToken, updateFile);

router.delete(
  "/:id",
  authenticateToken,
  requireRole(["admin", "coach", "medic", "sportsman", "partner"]),
  deleteFile
);

export default router;
