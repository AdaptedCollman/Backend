import { Router } from 'express';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from "../Controllers/UserController";

const router = Router();

// יצירת משתמש חדש
router.post('/', createUser);

// קבלת כל המשתמשים
router.get('/', getUsers);

// קבלת משתמש לפי ID
router.get('/:id', getUserById);

// עדכון משתמש לפי ID
router.put('/:id', updateUser);

// מחיקת משתמש לפי ID
router.delete('/:id', deleteUser);

export default router;
