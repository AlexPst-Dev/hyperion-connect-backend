import { Router } from "express";
import {
  createOffer,
  getAllOffers,
  getOfferById,
  getOffersByCompanyId,
  getOffersByCompanyIdAndCategory,
  updateOffer,
  deleteOffer,
  notifySponsorshipApplication,
} from "../controllers/offer-controller";
import {
  authenticateToken,
  requireRole,
  requireSelfOrAdmin,
} from "../middleware/auth.middleware";

const router = Router();

// Offer routes
// Public
router.get("/", getAllOffers);
router.get("/:id", getOfferById);
router.get("/company/:companyId", getOffersByCompanyId);
router.get(
  "/company/:companyId/category/:category",
  getOffersByCompanyIdAndCategory
);

// Private
router.post("/", authenticateToken, requireRole("admin"), createOffer);
router.post(
  "/notifySponsorshipApplication",
  authenticateToken,
  requireRole("sportsman"),
  notifySponsorshipApplication
);
router.patch(
  "/:id",
  authenticateToken,
  requireRole(["admin", "partner"]),
  updateOffer
);
router.delete("/:id", authenticateToken, requireRole("admin"), deleteOffer);

export default router;
