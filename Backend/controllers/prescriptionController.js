// prescriptionController.js (Complete updated version)
import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import mongoose from 'mongoose';

// @desc    Create a new prescription
// @route   POST /api/prescriptions
// @access  Private/Doctor
export const createPrescription = async (req, res) => {
  try {
    const {
      patientId,
      diagnosis,
      symptoms,
      medicines,
      instructions,
      notes,
      refills,
      appointmentId,
      appointmentTime
    } = req.body;

    console.log('📝 Creating prescription for patient:', patientId);
    console.log('📝 Doctor from auth:', req.user?._id, req.user?.userId, req.user?.email);

    // Validate required fields
    if (!patientId || !diagnosis || !medicines || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID, diagnosis, and at least one medicine are required'
      });
    }

    // Get patient details from User model
    let patient = await User.findOne({
      $or: [
        { userId: patientId },
        { _id: mongoose.Types.ObjectId.isValid(patientId) ? patientId : null },
        { email: patientId }
      ]
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    console.log('✅ Patient found:', patient.name, patient.userId);

    // Get doctor details from Doctor model using authenticated user
    let doctor = await Doctor.findOne({
      $or: [
        { email: req.user.email },
        { doctorId: req.user.userId },
        { userId: req.user.userId }
      ]
    });

    if (!doctor) {
      // If not found in Doctor model, create doctor info from user data
      doctor = {
        _id: req.user._id,
        name: req.user.name,
        specialization: req.user.specialization || 'General Physician',
        doctorId: req.user.userId,
        email: req.user.email
      };
    }

    console.log('✅ Doctor found/set:', doctor.name, doctor.doctorId);

    // Verify doctor role
    if (req.user.userType !== 'doctor' && req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can create prescriptions'
      });
    }

    // Create prescription
    const prescription = await Prescription.create({
      patient: {
        id: patient._id,
        name: patient.name,
        userId: patient.userId,
        email: patient.email
      },
      doctor: {
        id: doctor._id || doctor._id,
        name: doctor.name,
        specialization: doctor.specialization || '',
        userId: doctor.doctorId || doctor.userId || req.user.userId,
        email: doctor.email || req.user.email
      },
      diagnosis,
      symptoms: symptoms || '',
      medicines: medicines.filter(m => m.name && m.name.trim() !== ''),
      instructions: instructions || '',
      notes: notes || '',
      refills: refills || 0,
      appointmentId: appointmentId || null,
      appointmentTime: appointmentTime || '',
      status: 'active'
    });

    console.log('✅ Prescription created with ID:', prescription.prescriptionId);

    // If prescription is linked to an appointment, update appointment status
    if (appointmentId) {
      try {
        await Appointment.findByIdAndUpdate(
          appointmentId,
          { 
            status: 'completed',
            prescriptionId: prescription._id 
          },
          { new: true }
        );
        console.log('✅ Appointment updated:', appointmentId);
      } catch (apptError) {
        console.warn('⚠️ Could not update appointment:', apptError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: prescription
    });

  } catch (error) {
    console.error('❌ Error creating prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create prescription',
      error: error.message
    });
  }
};

// @desc    Get all prescriptions for a patient
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private/Patient or Doctor
export const getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status, search, page = 1, limit = 10 } = req.query;

    console.log('📋 Fetching prescriptions for patientId:', patientId);

    // Build query
    const query = {};
    
    // Create search conditions for patient
    const patientConditions = [];
    
    // Add condition using patient.userId (string ID)
    patientConditions.push({ 'patient.userId': patientId });
    patientConditions.push({ 'patient.id': patientId });
    
    // Try to find patient by ObjectId
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      patientConditions.push({ 'patient.id': new mongoose.Types.ObjectId(patientId) });
    }
    
    if (patientConditions.length > 0) {
      query.$or = patientConditions;
    } else {
      query['patient.userId'] = patientId;
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search functionality
    if (search) {
      const searchQuery = [
        { diagnosis: { $regex: search, $options: 'i' } },
        { 'doctor.name': { $regex: search, $options: 'i' } },
        { 'doctor.userId': { $regex: search, $options: 'i' } }
      ];
      
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: searchQuery }
        ];
        delete query.$or;
      } else {
        query.$or = searchQuery;
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Get prescriptions with pagination
    const prescriptions = await Prescription.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Prescription.countDocuments(query);

    // Get counts by status
    const statusMatchQuery = {};
    const statusPatientConditions = [
      { 'patient.userId': patientId },
      { 'patient.id': patientId }
    ];
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      statusPatientConditions.push({ 'patient.id': new mongoose.Types.ObjectId(patientId) });
    }
    statusMatchQuery.$or = statusPatientConditions;

    const statusCounts = await Prescription.aggregate([
      { $match: statusMatchQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const counts = {
      total: await Prescription.countDocuments(statusMatchQuery),
      active: statusCounts.find(s => s._id === 'active')?.count || 0,
      completed: statusCounts.find(s => s._id === 'completed')?.count || 0,
      cancelled: statusCounts.find(s => s._id === 'cancelled')?.count || 0
    };

    console.log(`✅ Found ${prescriptions.length} prescriptions for patient ${patientId}`);

    res.status(200).json({
      success: true,
      data: prescriptions,
      counts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    });

  } catch (error) {
    console.error('❌ Error fetching patient prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions',
      error: error.message
    });
  }
};

// @desc    Get all prescriptions for a doctor
// @route   GET /api/prescriptions/doctor/:doctorId
// @access  Private/Doctor
export const getDoctorPrescriptions = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status, search, page = 1, limit = 10 } = req.query;

    console.log('📋 Fetching prescriptions for doctorId:', doctorId);
    console.log('📋 Authenticated user:', req.user?._id, req.user?.userId, req.user?.email);

    // Build query - search in prescription doctor fields
    const query = {};
    
    // Create search conditions for doctor
    const doctorConditions = [];
    
    // Add condition using doctor.userId (string ID like DOC-C00E-MFX)
    doctorConditions.push({ 'doctor.userId': doctorId });
    doctorConditions.push({ 'doctor.id': doctorId });
    
    // Try to find doctor by email if available
    if (req.user?.email) {
      doctorConditions.push({ 'doctor.email': req.user.email });
    }
    
    if (doctorConditions.length > 0) {
      query.$or = doctorConditions;
    } else {
      query['doctor.userId'] = doctorId;
    }

    console.log('📋 Query conditions:', JSON.stringify(query, null, 2));

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search functionality
    if (search) {
      const searchQuery = [
        { diagnosis: { $regex: search, $options: 'i' } },
        { 'patient.name': { $regex: search, $options: 'i' } },
        { 'patient.userId': { $regex: search, $options: 'i' } },
        { 'patient.id': { $regex: search, $options: 'i' } }
      ];
      
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: searchQuery }
        ];
        delete query.$or;
      } else {
        query.$or = searchQuery;
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Get prescriptions with pagination
    const prescriptions = await Prescription.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Prescription.countDocuments(query);

    console.log(`✅ Found ${prescriptions.length} prescriptions for doctor ${doctorId}`);

    res.status(200).json({
      success: true,
      data: prescriptions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    });

  } catch (error) {
    console.error('❌ Error fetching doctor prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions',
      error: error.message
    });
  }
};

// @desc    Get single prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
export const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check authorization
    const userId = req.user._id.toString();
    const userStringId = req.user.userId;
    const userEmail = req.user.email;
    
    const isPatient = prescription.patient.userId === userStringId ||
                     prescription.patient.id?.toString() === userId ||
                     prescription.patient.email === userEmail;
                     
    const isDoctor = prescription.doctor.userId === userStringId ||
                    prescription.doctor.id?.toString() === userId ||
                    prescription.doctor.email === userEmail;
                    
    const isAdmin = req.user.userType === 'admin' || req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this prescription'
      });
    }

    res.status(200).json({
      success: true,
      data: prescription
    });

  } catch (error) {
    console.error('❌ Error fetching prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescription',
      error: error.message
    });
  }
};

// @desc    Update prescription
// @route   PUT /api/prescriptions/:id
// @access  Private/Doctor
export const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check authorization - only the prescribing doctor can update
    const userId = req.user._id.toString();
    const userStringId = req.user.userId;
    
    const isDoctor = prescription.doctor.userId === userStringId ||
                    prescription.doctor.id?.toString() === userId ||
                    prescription.doctor.email === req.user.email;

    if (!isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this prescription'
      });
    }

    // Don't allow updating patient or doctor info
    delete updateData.patient;
    delete updateData.doctor;
    delete updateData._id;
    delete updateData.prescriptionId;

    const updatedPrescription = await Prescription.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Prescription updated successfully',
      data: updatedPrescription
    });

  } catch (error) {
    console.error('❌ Error updating prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update prescription',
      error: error.message
    });
  }
};

// @desc    Update prescription status
// @route   PATCH /api/prescriptions/:id/status
// @access  Private
export const updatePrescriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('📝 Updating prescription status:', id, 'to', status);

    if (!['active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Both patient and doctor can update status
    const userId = req.user._id?.toString();
    const userStringId = req.user.userId;
    const userEmail = req.user.email;
    
    // Check if user is patient
    const isPatient = prescription.patient.userId === userStringId ||
                     prescription.patient.id?.toString() === userId ||
                     prescription.patient.email === userEmail;
    
    // Check if user is doctor
    const isDoctor = prescription.doctor.userId === userStringId ||
                    prescription.doctor.id?.toString() === userId ||
                    prescription.doctor.email === userEmail;

    const isAdmin = req.user.userType === 'admin' || req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this prescription'
      });
    }

    prescription.status = status;
    await prescription.save();

    console.log('✅ Prescription status updated to:', status);

    res.status(200).json({
      success: true,
      message: 'Prescription status updated successfully',
      data: prescription
    });

  } catch (error) {
    console.error('❌ Error updating prescription status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update prescription status',
      error: error.message
    });
  }
};

// @desc    Delete prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private/Doctor or Admin
export const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check authorization - only prescribing doctor or admin can delete
    const userId = req.user._id.toString();
    const userStringId = req.user.userId;
    
    const isDoctor = prescription.doctor.userId === userStringId ||
                    prescription.doctor.id?.toString() === userId ||
                    prescription.doctor.email === req.user.email;
                    
    const isAdmin = req.user.userType === 'admin' || req.user.role === 'admin';

    if (!isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this prescription'
      });
    }

    await Prescription.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Prescription deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete prescription',
      error: error.message
    });
  }
};

// @desc    Get prescription statistics
// @route   GET /api/prescriptions/stats
// @access  Private/Admin
export const getPrescriptionStats = async (req, res) => {
  try {
    const totalPrescriptions = await Prescription.countDocuments();
    
    const statusBreakdown = await Prescription.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const prescriptionsByMonth = await Prescription.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const topMedicines = await Prescription.aggregate([
      { $unwind: '$medicines' },
      { $group: { _id: '$medicines.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPrescriptions,
        statusBreakdown: statusBreakdown.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        prescriptionsByMonth,
        topMedicines
      }
    });

  } catch (error) {
    console.error('❌ Error fetching prescription stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescription statistics',
      error: error.message
    });
  }
};