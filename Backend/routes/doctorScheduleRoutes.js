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

// Protect all routes
router.use(protect);

// ============================================
// LOGGED-IN DOCTOR ROUTES (uses authenticated user)
// ============================================
router.get('/me', getMySchedule);
router.get('/me/stats', getMyStats);
router.post('/me/slots', addMySlot);
router.delete('/me/slots/:slotId', deleteMySlot);

// ============================================
// PATIENT ROUTES (view only)
// ============================================
router.get('/:doctorId', getDoctorSchedule);
router.get('/:doctorId/available-slots', getAvailableSlots);
router.get('/:doctorId/stats', getScheduleStats);
router.get('/:doctorId/date-range', getSlotsByDateRange);

// ============================================
// ADMIN/DOCTOR ROUTES (by specific ID)
// ============================================
router.post('/:doctorId/slots', addSlot);
router.post('/:doctorId/slots/batch', addMultipleSlots);
router.delete('/:doctorId/slots/:slotId', deleteSlot);
router.patch('/:doctorId/slots/:slotId/status', updateSlotStatus);

export default router;