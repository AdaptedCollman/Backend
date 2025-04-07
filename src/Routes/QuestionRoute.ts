import express from 'express';
import {
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion
} from "../Controllers/QuestionController";

const router = express.Router();

// יצירת שאלה חדשה
router.post('/', createQuestion);

// קבלת שאלות (אפשר גם לפי נושא/רמה)
router.get('/', getQuestions);

// עדכון שאלה לפי ID
router.put('/:id', updateQuestion);

// מחיקת שאלה לפי ID
router.delete('/:id', deleteQuestion);

export default router;
