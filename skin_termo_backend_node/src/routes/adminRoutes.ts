import { Router } from 'express';
import { 
  getDoctorsList, 
  getUsersList, 
  verifyDoctorStatus, 
  createAdminUserEntry, 
  editUserDetails, 
  removeUserEntry 
} from '../controllers/adminController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Routes for Super Admin control
router.get('/doctors', authenticateToken, getDoctorsList);
router.get('/users', authenticateToken, getUsersList);
router.post('/user', authenticateToken, createAdminUserEntry);
router.patch('/user/:userId', authenticateToken, editUserDetails);
router.delete('/user/:userId', authenticateToken, removeUserEntry);
router.patch('/doctor/:doctorId/verify', authenticateToken, verifyDoctorStatus);

export default router;
