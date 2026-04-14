// prescriptionRoutes.js (Complete updated version)
import express from 'express';
import {
  createPrescription,
  getPatientPrescriptions,
  getDoctorPrescriptions,
  getPrescriptionById,
  updatePrescription,
  updatePrescriptionStatus,
  deletePrescription,
  getPrescriptionStats
} from '../controllers/prescriptionController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Statistics route (Admin only)
router.get('/stats', authorize('admin'), getPrescriptionStats);

// Create prescription (Doctor only)
router.post('/', authorize('doctor'), createPrescription);

// Get patient prescriptions (Patient or Doctor)
router.get('/patient/:patientId', getPatientPrescriptions);

// Get doctor prescriptions (Doctor only)
router.get('/doctor/:doctorId', authorize('doctor'), getDoctorPrescriptions);

// Get single prescription
router.get('/:id', getPrescriptionById);

// Update prescription (Doctor only)
router.put('/:id', authorize('doctor'), updatePrescription);

// Update prescription status (Patient or Doctor)
router.patch('/:id/status', updatePrescriptionStatus);

// Delete prescription (Doctor or Admin)
router.delete('/:id', authorize('doctor', 'admin'), deletePrescription);

export default router;