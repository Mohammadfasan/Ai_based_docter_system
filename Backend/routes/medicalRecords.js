import express from 'express';
import {
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getMedicalRecordsByType,
  getMedicalRecordsByDateRange,
  searchMedicalRecords,
  getMedicalRecordsStats
} from '../controllers/medicalRecordController.js';

const router = express.Router();

// Stats route (must be before :userId routes to avoid conflicts)
router.get('/stats/:userId', getMedicalRecordsStats);

// Search route
router.get('/search/:userId', searchMedicalRecords);

// Date range route
router.get('/date-range/:userId', getMedicalRecordsByDateRange);

// Get records by type
router.get('/type/:userId/:type', getMedicalRecordsByType);

// Get all records for a user
router.get('/:userId', getMedicalRecords);

// Get single record by ID
router.get('/record/:id', getMedicalRecordById);

// Create new record
router.post('/', createMedicalRecord);

// Update record
router.put('/:id', updateMedicalRecord);

// Delete record
router.delete('/:id', deleteMedicalRecord);

export default router;