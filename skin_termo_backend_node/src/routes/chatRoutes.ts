import { Router } from 'express';
import { createChatSession, getChatSessions, getChatSessionDetail, addChatMessage, chatWithAi } from '../controllers/chatController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/sessions', authenticateToken, createChatSession);
router.get('/sessions', authenticateToken, getChatSessions);
router.get('/sessions/:sessionId', authenticateToken, getChatSessionDetail);
router.post('/sessions/:sessionId/messages', authenticateToken, addChatMessage);

router.post('/message', authenticateToken, chatWithAi);

export default router;
