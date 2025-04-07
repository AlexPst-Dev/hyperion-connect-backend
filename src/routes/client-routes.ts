import { Router } from "express";
import {
  createClientList,
  getClientListByProfessionalId,
  updateClientListByProfessionalId,
  clearClientListByProfessionalId,
} from "../controllers/client-controller";

const router = Router();

router.post("/", createClientList);
router.get("/:professionalId", getClientListByProfessionalId);
router.post("/update/:professionalId", updateClientListByProfessionalId);
router.delete("/:professionalId", clearClientListByProfessionalId);

export default router;
