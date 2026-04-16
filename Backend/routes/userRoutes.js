// routes/userRoutes.js
import express from 'express';
import { getAllPatients } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.get('/patients', getAllPatients);

export default router;