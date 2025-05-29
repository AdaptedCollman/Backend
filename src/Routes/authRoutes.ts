import express from "express";
import {
  register,
  login,
  verifyToken,
  completeOnboarding,
  logout,
} from "../Controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { refreshToken } from "../Controllers/authController";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);


router.get("/verify", authMiddleware, verifyToken);
router.post("/complete-onboarding", authMiddleware, completeOnboarding);

export default router;
