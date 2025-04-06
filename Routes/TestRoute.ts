import { Router } from 'express';
import { createTest, getTest, finishTest } from '../Controllers/TestController';

const router = Router();

router.post('/', createTest); 
router.get('/:id', getTest);  
router.put('/:id/finish', finishTest); 

export default router;
