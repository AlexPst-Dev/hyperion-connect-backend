import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoriesByType,
  updateCategory,
  deleteCategory,
} from "../controllers/category-controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/", authenticateToken, requireRole("admin"), createCategory);
router.get(
  "/",
  authenticateToken,
  requireRole(["admin", "coach", "medic"]),
  getAllCategories
);
router.get(
  "/:id",
  authenticateToken,
  requireRole(["admin", "coach", "medic", "sportsman", "partner"]),
  getCategoryById
);
router.get(
  "/type/:type",
  authenticateToken,
  requireRole(["admin", "coach", "medic", "sportsman"]),
  getCategoriesByType
);
router.patch("/:id", authenticateToken, requireRole("admin"), updateCategory);
router.delete("/:id", authenticateToken, requireRole("admin"), deleteCategory);

export default router;
