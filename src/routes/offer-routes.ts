import { Router } from "express";
import {
  createOffer,
  getAllOffers,
  getOfferById,
  getOffersByCompanyId,
  getOffersByCompanyIdAndCategory,
  updateOffer,
  deleteOffer,
} from "../controllers/offer-controller";

const router = Router();

router.post("/", createOffer);
router.get("/", getAllOffers);
router.get("/:id", getOfferById);
router.get("/company/:companyId", getOffersByCompanyId);
router.get(
  "/company/:companyId/category/:category",
  getOffersByCompanyIdAndCategory
);
router.patch("/:id", updateOffer);
router.delete("/:id", deleteOffer);

export default router;
