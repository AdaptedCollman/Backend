import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import questionRoutes from "../src/Routes/QuestionRoute";
import testRoutes from "../src/Routes/TestRoute";
import userRoutes from "../src/Routes/UserRoute";
import userQuestionRoutes from "../src/Routes/UserQuestionRoute";
import authRoutes from "../src/Routes/authRoutes";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ברירת מחדל ל-root
app.get("/", (_req, res) => {
  res.send("Hello from backend!");
});

// ראוט לשאלות
app.use("/api/questions", questionRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/users", userRoutes);
app.use("/api/userQuestions", userQuestionRoutes);
app.use("/api/auth", authRoutes);

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/adapted";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    throw err;
  }
};

export { app, connectDB };
