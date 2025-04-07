import express from 'express';
import {
  createUserQuestion,
  getUserQuestions,
  getUserQuestionById,
  updateUserQuestion,
  deleteUserQuestion
} from '../Controllers/UserQuestionController';

const router = express.Router();

// יצירת רישום חדש
router.post('/', createUserQuestion);

// קבלת כל הרישומים
router.get('/', getUserQuestions);

// קבלת רישום לפי ID
router.get('/:id', getUserQuestionById);

// עדכון רישום לפי ID
router.put('/:id', updateUserQuestion);

// מחיקת רישום לפי ID
router.delete('/:id', deleteUserQuestion);

export default router;
