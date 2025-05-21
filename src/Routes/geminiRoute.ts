import express from 'express';
import { handleGeminiChat } from '../Controllers/geminiController';

const router = express.Router();

router.post('/', handleGeminiChat);

export default router; 