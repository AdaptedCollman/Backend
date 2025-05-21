import express from "express";
import {
  register,
  login,
  verifyToken,
  completeOnboarding,
  logout,
} from "../Controllers/authController";
import { authMiddleware } from "../Middleware/authMiddleware";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes
router.get("/verify", authMiddleware, verifyToken);
router.post("/complete-onboarding", authMiddleware, completeOnboarding);

export default router;
