import express from 'express';
import { 
  createAppointment, 
  getMyAppointments, 
  getDoctorAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment,
  deleteExpiredAppointments,
  attachRecordToAppointment,
  removeAttachedRecord,
  getPatientStats,
  getDoctorStats
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ============================================
// PATIENT ROUTES
// ============================================

// Create new appointment (booking)
router.post('/', createAppointment);

// Get current patient's appointments
router.get('/my-appointments', getMyAppointments);

// Get patient's appointment statistics
router.get('/my-stats', getPatientStats);

// Delete expired appointments for current patient
router.delete('/expired', deleteExpiredAppointments);

// ============================================
// SHARED ROUTES (Patient & Doctor)
// ============================================

// Get single appointment by ID
router.get('/:id', getAppointmentById);

// Attach medical record to appointment
router.patch('/:id/attach-record', attachRecordToAppointment);

// Remove attached record from appointment
router.delete('/:id/attached-records/:recordId', removeAttachedRecord);

// Delete appointment (patient can delete their own)
router.delete('/:id', deleteAppointment);

// ============================================
// DOCTOR & ADMIN ROUTES
// ============================================

// Get all appointments for a specific doctor
router.get('/doctor/:doctorId', authorize('doctor', 'admin'), getDoctorAppointments);

// Get doctor's appointment statistics
router.get('/doctor/:doctorId/stats', authorize('doctor', 'admin'), getDoctorStats);

// Update appointment status (confirm/complete/cancel) - Doctor only
router.patch('/:id/status', authorize('doctor', 'admin'), updateAppointmentStatus);

export default router;