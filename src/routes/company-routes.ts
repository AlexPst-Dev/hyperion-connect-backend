import { Router } from "express";
import {
  createCompany,
  getAllCompanies,
  getCompanyById,
  getCompanyResponsibleById,
  updateCompany,
  deleteCompany,
} from "../controllers/company-controller";

const router = Router();

router.post("/", createCompany);
router.get("/", getAllCompanies);
router.get("/:id", getCompanyById);
router.get("/responsible/:id", getCompanyResponsibleById);
router.patch("/:id", updateCompany);
router.delete("/:id", deleteCompany);

export default router;
