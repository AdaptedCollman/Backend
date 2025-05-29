import express from "express";
import {
  getUserStats,
  trackQuestion,
} from "../Controllers/userStatsController";

const router = express.Router();

// Get user stats by userId
router.get("/:userId", getUserStats);

// Track a question
router.post("/track-question", trackQuestion);

export default router;
