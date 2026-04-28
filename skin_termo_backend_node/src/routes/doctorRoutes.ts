import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { registerDoctor, getDoctorProfile, getAllDoctors } from '../controllers/doctorController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const doctorRouter = Router();

// Public/Common routes for doctors
router.get('/', getAllDoctors);

// Configure storage for file uploads
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

const upload = multer({ storage: storage });

const doctorUploads = upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'idProofDocument', maxCount: 1 },
  { name: 'medicalLicenseDoc', maxCount: 1 },
  { name: 'degreeCertificate', maxCount: 1 },
  { name: 'additionalCertificate', maxCount: 1 },
]);

// Registration (Open)
doctorRouter.post('/register', doctorUploads, registerDoctor);

// Authenticated Doctor profile access
doctorRouter.get('/me/profile', authenticateToken, getDoctorProfile);

export { router, doctorRouter };
