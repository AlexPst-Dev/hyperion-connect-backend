import { Router } from "express";
import {
  createContactList,
  getContactListByUserId,
  updateContactListByUserId,
  clearContactListByUserId,
} from "../controllers/contact-controller";

const router = Router();

router.post("/", createContactList);
router.get("/:userId", getContactListByUserId);
router.post("/update/:userId", updateContactListByUserId);
router.delete("/:userId", clearContactListByUserId);

export default router;
