import { Router } from "express";
import {
  getAllEvents,
  createEvent,
  getEventById,
  getEventsByCategory,
  getEventUsers,
  updateEvent,
  deleteEvent,
  getEventsByUserId,
} from "../controllers/event-controller";

const router = Router();

router.get("/", getAllEvents);
router.post("/", createEvent);
router.get("/:id", getEventById);
router.get("/category/:category", getEventsByCategory);
router.get("/:id/users", getEventUsers);
router.get("/user/:userId", getEventsByUserId);
router.patch("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;
