import express from 'express';
import {
  getMySchedule,
  getDoctorSchedule,
  getAvailableSlots,
  addMySlot,
  addSlot,
  addMultipleSlots,
  deleteMySlot,
  deleteSlot,
  updateSlotStatus,
  getSlotsByDateRange,
  getMyStats,
  getScheduleStats
} from '../controllers/doctorScheduleController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================
// ✅ PUBLIC ROUTES (No authentication required)
// ============================================

// Get available slots for a doctor (patients can view without login)
router.get('/:doctorId/available-slots', getAvailableSlots);

// ============================================
// ✅ PROTECTED ROUTES (Authentication required)
// ============================================
router.use(protect);

// ============================================
// LOGGED-IN DOCTOR ROUTES (uses authenticated user)
// ============================================
router.get('/me', getMySchedule);
router.get('/me/stats', getMyStats);
router.post('/me/slots', addMySlot);
router.delete('/me/slots/:slotId', deleteMySlot);

// ============================================
// PATIENT ROUTES (view only - need auth but patient role)
// ============================================
router.get('/:doctorId', getDoctorSchedule);
router.get('/:doctorId/stats', getScheduleStats);
router.get('/:doctorId/date-range', getSlotsByDateRange);

// ============================================
// ADMIN/DOCTOR ROUTES (by specific ID)
// ============================================
router.post('/:doctorId/slots', authorize('doctor', 'admin'), addSlot);
router.post('/:doctorId/slots/batch', authorize('doctor', 'admin'), addMultipleSlots);
router.delete('/:doctorId/slots/:slotId', authorize('doctor', 'admin'), deleteSlot);
router.patch('/:doctorId/slots/:slotId/status', authorize('doctor', 'admin'), updateSlotStatus);

export default router;