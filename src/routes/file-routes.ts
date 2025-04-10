import { Router } from "express";
import {
  createFile,
  getAllFiles,
  getFileById,
  getFilesByCategory,
  updateFile,
  deleteFile,
} from "../controllers/file-controller";

const router = Router();

router.post("/", createFile);
router.get("/", getAllFiles);
router.get("/:id", getFileById);
router.get("/category/:category", getFilesByCategory);
router.patch("/:id", updateFile);
router.delete("/:id", deleteFile);

export default router;
