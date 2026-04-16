// routes/patientRoutes.js
import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private/Doctor/Admin
router.get('/', protect, async (req, res) => {
  try {
    // Check if user is doctor or admin
    if (req.user.userType !== 'doctor' && req.user.userType !== 'admin' && req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access patients list'
      });
    }

    // Find all users with patient role
    const patients = await User.find({ 
      userType: 'patient' 
    }).select('-password');

    console.log(`✅ Found ${patients.length} patients`);

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients',
      error: error.message
    });
  }
});

// @desc    Get single patient by ID
// @route   GET /api/patients/:id
// @access  Private/Doctor/Admin
router.get('/:id', protect, async (req, res) => {
  try {
    const patient = await User.findOne({
      $or: [
        { _id: req.params.id },
        { userId: req.params.id },
        { patientId: req.params.id }
      ],
      userType: 'patient'
    }).select('-password');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient',
      error: error.message
    });
  }
});

export default router;