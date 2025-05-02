import express from "express";
import {
  register,
  login,
  verifyToken,
  completeOnboarding,
} from "../Controllers/authController";
import { authMiddleware } from "../Middleware/authMiddleware";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/verify", authMiddleware, verifyToken);
router.post("/complete-onboarding", authMiddleware, completeOnboarding);

export default router;
