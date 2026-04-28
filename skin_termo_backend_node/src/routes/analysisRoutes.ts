import { Router } from 'express';
import { analyzeSkin, getAnalysisHistory } from '../controllers/analysisController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/scan', authenticateToken, analyzeSkin);
router.get('/history', authenticateToken, getAnalysisHistory);

export default router;
