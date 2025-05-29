import express from "express";
import cors from "cors";
import questionRoutes from "./Routes/QuestionRoute";
import testRoutes from "./Routes/TestRoute";
import userRoutes from "./Routes/UserRoute";
import userQuestionRoutes from "./Routes/UserQuestionRoute";
import authRoutes from "./Routes/authRoutes";
import geminiRoutes from "./Routes/geminiRoute";
import userStatsRoutes from "./Routes/userStatsRoutes"; // אם משולב גם כאן

const app = express();

app.use(cors());
app.use(express.json());

// ראוטים
app.use("/api/questions", questionRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user-questions", userQuestionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/user-stats", userStatsRoutes); // רק אם נדרש באותו app

export { app };
