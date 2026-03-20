import express from "express";
import {
  getAllDoctors,
  getPaginatedDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  searchDoctors,
  checkEmail
} from "../controllers/doctorController.js";
import { uploadDoctorImage } from "../controllers/uploadController.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ============================================
// ✅ Doctor Routes
// ============================================

// Public routes
router.get('/', getAllDoctors);
router.get('/paginated', getPaginatedDoctors);
router.get('/search', searchDoctors);
router.get('/:id', getDoctorById);

// Create doctor
router.post('/', createDoctor);

// Update doctor
router.put('/:id', updateDoctor);

// Delete doctor
router.delete('/:id', deleteDoctor);

// Email check
router.post('/check-email', checkEmail);

// Image upload
router.post('/upload', upload.single('image'), uploadDoctorImage);

export default router;