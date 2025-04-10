import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoriesByType,
  updateCategory,
  deleteCategory,
} from "../controllers/category-controller";

const router = express.Router();

router.post("/", createCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.get("/type/:type", getCategoriesByType);
router.patch("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
