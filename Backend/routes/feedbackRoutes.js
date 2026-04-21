import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getDoctorFeedbacks,
  createFeedback,
  respondToFeedback,
  resolveFeedback,
  getPatientFeedbacks,
  getFeedbackById,
  deleteFeedback,
  getFeedbackStats,
  getMyDoctors,
  debugDoctorLookup
} from '../controllers/feedbackController.js';

const router = express.Router();

// ==================== DEBUG ROUTES (Remove in production) ====================
router.get('/debug/doctor/:doctorId', protect, authorize('doctor'), debugDoctorLookup);

// ==================== PATIENT ROUTES ====================
// Protected routes - Patient only
router.post('/', protect, authorize('patient'), createFeedback);
router.get('/patient', protect, authorize('patient'), getPatientFeedbacks);
router.get('/my-doctors', protect, authorize('patient'), getMyDoctors);

// ==================== DOCTOR ROUTES ====================
// IMPORTANT: The :doctorId parameter MUST match the logged-in doctor's ID
router.get('/doctor/:doctorId', protect, authorize('doctor'), getDoctorFeedbacks);
router.get('/stats/:doctorId', protect, authorize('doctor'), getFeedbackStats);
router.put('/:id/respond', protect, authorize('doctor'), respondToFeedback);
router.put('/:id/resolve', protect, authorize('doctor'), resolveFeedback);

// ==================== SHARED ROUTES ====================
// Protected routes - Both patient and doctor (with authorization checks in controller)
router.get('/:id', protect, getFeedbackById);

// ==================== ADMIN ROUTES ====================
// Protected routes - Admin only
router.delete('/:id', protect, authorize('admin'), deleteFeedback);

export default router;