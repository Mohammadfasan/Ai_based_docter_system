// routes/userRoutes.js
import express from 'express';
import { 
  getAllPatients, 
  getAllPatientsList,
  getPatientById 
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.get('/patients', getAllPatients);
router.get('/patients-list', getAllPatientsList);  // New route for admin
router.get('/patients/:id', getPatientById);

export default router;