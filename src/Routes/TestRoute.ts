import { Router } from 'express';
import { createTest, getTest, finishTest, getAllTests, getUserStatsFromTests } from '../Controllers/TestController';

const router = Router();
router.get('/',getAllTests)
router.post('/', createTest); 
router.get('/:id', getTest);  
router.put('/:id/finish', finishTest); 
router.get('/stats/:userId', getUserStatsFromTests);


export default router;
