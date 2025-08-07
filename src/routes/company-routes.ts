import { Router } from "express";
import {
  createCompany,
  getAllCompanies,
  getCompanyById,
  getCompanyResponsibleById,
  updateCompany,
  deleteCompany,
} from "../controllers/company-controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router = Router();

// Company routes
// Public
router.get("/", getAllCompanies);
router.get("/:id", getCompanyById);
router.get("/responsible/:id", getCompanyResponsibleById);

// Private
router.post(
  "/",
  authenticateToken,
  requireRole(["admin", "partner"]),
  createCompany
);
router.patch(
  "/:id",
  authenticateToken,
  requireRole(["admin", "partner"]),
  updateCompany
);
router.delete("/:id", authenticateToken, requireRole("admin"), deleteCompany);

export default router;
