import express from 'express';
import {
  createUserQuestion,
  getUserQuestions,
  getUserQuestionById,
  updateUserQuestion,
  deleteUserQuestion
} from '../Controllers/UserQuestionController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware); // שים בהתחלה


// יצירת רישום חדש
router.post('/', createUserQuestion);

// קבלת כל הרישומים
router.get('/', getUserQuestions);

// קבלת רישום לפי ID
router.get('/:id', getUserQuestionById);

// עדכון רישום לפי ID
router.put('/:id', updateUserQuestion);

router.delete('/:id', deleteUserQuestion);

export default router;
