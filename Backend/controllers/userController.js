// controllers/userController.js
import User from '../models/User.js';

// Get all patients (for doctors and admins only)
export const getAllPatients = async (req, res) => {
  try {
    // Only doctors and admins can access patient list
    if (req.user.userType !== 'doctor' && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors can view patient list.'
      });
    }

    const patients = await User.find({ userType: 'patient' })
      .select('-password')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patients',
      error: error.message
    });
  }
};

// Get patient by ID (for doctors)
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    // Authorization check
    if (req.user.userType !== 'doctor' && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    const patient = await User.findById(id).select('-password');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient',
      error: error.message
    });
  }
};