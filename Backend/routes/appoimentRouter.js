// routes/appointmentRouter.js
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
  getDoctorStats,
  getAvailableSlots,
  confirmAppointment,
  rejectAppointment
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Available slots route (patient viewing available slots)
router.get('/available-slots/:doctorId', getAvailableSlots);

// Patient routes
router.post('/', createAppointment);
router.get('/my-appointments', getMyAppointments);
router.delete('/expired', deleteExpiredAppointments);
router.get('/stats/patient', getPatientStats);

// Doctor routes
router.get('/doctor/:doctorId/appointments', getDoctorAppointments);
router.get('/stats/doctor/:doctorId', getDoctorStats);

// Doctor confirmation/rejection routes
router.patch('/:id/confirm', confirmAppointment);
router.patch('/:id/reject', rejectAppointment);

// Common routes (with specific IDs)
router.get('/:id', getAppointmentById);
router.patch('/:id/status', updateAppointmentStatus);
router.delete('/:id', deleteAppointment);

// Medical record attachment routes
router.post('/:id/attach', attachRecordToAppointment);
router.delete('/:id/attach/:recordId', removeAttachedRecord);

export default router;