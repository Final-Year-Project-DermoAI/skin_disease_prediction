import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { createConsultationSession, getConsultationSessions, addConsultationMessage, getConsultationMessages, updateConsultationStatus } from '../controllers/consultationController';
import { authenticateToken } from '../middlewares/authMiddleware';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      file.mimetype.startsWith('image/') || 
      file.mimetype === 'application/pdf' ||
      ['.jpg', '.jpeg', '.png', '.gif', '.pdf'].includes(ext)
    ) {
       cb(null, true);
    } else {
       cb(new Error('Only images and PDF files are allowed!'));
    }
  }
});

const router = Router();

router.post('/sessions', authenticateToken, createConsultationSession);
router.patch('/sessions/:sessionId', authenticateToken, updateConsultationStatus);
router.get('/sessions', authenticateToken, getConsultationSessions);
router.post('/sessions/:sessionId/messages', authenticateToken, upload.single('media'), addConsultationMessage);
router.get('/sessions/:sessionId/messages', authenticateToken, getConsultationMessages);

export default router;
