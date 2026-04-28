import { Router } from 'express';
import { register, login, getMe, updateMe, uploadProfileImage } from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uuidv4()}${ext}`);
  }
});
const upload = multer({ storage });

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.patch('/me', authenticateToken, updateMe);
router.post('/upload-image', authenticateToken, upload.single('file'), uploadProfileImage);

export default router;
