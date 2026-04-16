// routes/medicalRecords.js
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
import {
  uploadMedicalRecordWithFiles,
  getMedicalRecordWithFiles,
  deleteMedicalRecordWithFiles
} from '../controllers/medicalRecordUploadController.js';
import { uploadMultiple } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// ========== CLOUDINARY UPLOAD ROUTES ==========
// Upload medical record with files to Cloudinary
router.post('/upload', uploadMultiple.array('files', 10), uploadMedicalRecordWithFiles);

// Get medical record with Cloudinary file URLs
router.get('/cloudinary/:id', getMedicalRecordWithFiles);

// Delete medical record and remove files from Cloudinary
router.delete('/cloudinary/:id', deleteMedicalRecordWithFiles);

// ========== EXISTING ROUTES ==========
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