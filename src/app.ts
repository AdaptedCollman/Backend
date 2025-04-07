import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import questionRoutes from "../src/Routes/QuestionRoute"
import testRoutes from "../src/Routes/TestRoute"
import userRoutes from "../src/Routes/UserRoute"
import userQuestionRoutes from "../src/Routes/UserQuestionRoute"

dotenv.config();

const app = express();
app.use(express.json());

// ברירת מחדל ל-root
app.get('/', (_req, res) => {
  res.send('Hello from backend!');
});

// ראוט לשאלות
app.use('/questions', questionRoutes);
app.use('/tests', testRoutes);
app.use('/users', userRoutes);
app.use('/userQuestions', userQuestionRoutes);

const MONGO_URI = process.env.MONGO_URI as string;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    throw err;
  }
};

export { app, connectDB };
