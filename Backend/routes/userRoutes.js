// routes/userRoutes.js
import express from 'express';
import { 
  getAllPatients, 
  getAllPatientsList,
  getPatientById,
  getUserProfile,
  updateUserProfile,
  getCurrentUserProfile,
  updatePatientStatus,
  deletePatient
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Patient management routes
router.get('/patients', getAllPatients);
router.get('/patients-list', getAllPatientsList);
router.get('/patients/:id', getPatientById);
router.put('/patients/:id/status', updatePatientStatus);
router.delete('/patients/:id', deletePatient);

// Profile routes
router.get('/profile/me', getCurrentUserProfile);
router.get('/profile/:userId', getUserProfile);
router.put('/profile/:userId', updateUserProfile);

export default router;