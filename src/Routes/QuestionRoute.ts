import express from 'express';
import {
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  generateQuestionsAutomatically
} from "../Controllers/QuestionController";

const router = express.Router();

// יצירת שאלה חדשה
router.post('/', createQuestion);

// יצירת שאלות באופן אוטומטי
router.post('/generate', generateQuestionsAutomatically);

// קבלת שאלות (אפשר גם לפי נושא/רמה)
router.get('/', getQuestions);

// עדכון שאלה לפי ID
router.put('/:id', updateQuestion);

// מחיקת שאלה לפי ID
router.delete('/:id', deleteQuestion);

export default router;
