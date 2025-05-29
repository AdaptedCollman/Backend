import { Router } from 'express';
import {
  getUserById,
  updateUser,
} from "../Controllers/UserController";

const router = Router();


// קבלת משתמש לפי ID
router.get('/:id', getUserById);

// עדכון משתמש לפי ID
router.put('/:id', updateUser);


export default router;
