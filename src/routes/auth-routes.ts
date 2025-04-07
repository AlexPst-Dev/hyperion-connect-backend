import { Router } from "express";
import {
  register,
  loginUser,
  getMe,
  changePassword,
} from "../controllers/auth-controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Authentication routes
router.post("/register", register);
router.post("/login", loginUser);
router.get("/me", authenticateToken, getMe);
router.post("/change-password", authenticateToken, changePassword);

export default router;
