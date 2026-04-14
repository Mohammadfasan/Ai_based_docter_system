// controllers/appointmentController.js - COMPLETE UPDATED VERSION

import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import DoctorSchedule from '../models/DoctorSchedule.js';
import Doctor from '../models/Doctor.js';

// Helper function to find doctor by various ID formats
const findDoctorByAnyId = async (doctorId) => {
  // Try multiple ways to find the doctor
  let doctor = await Doctor.findOne({ doctorId: doctorId });
  
  if (!doctor && mongoose.Types.ObjectId.isValid(doctorId)) {
    doctor = await Doctor.findById(doctorId);
  }
  
  if (!doctor) {
    doctor = await Doctor.findOne({ userId: doctorId });
  }
  
  if (!doctor) {
    doctor = await Doctor.findOne({ email: doctorId });
  }
  
  return doctor;
};

// Create a new appointment (status = pending)
export const createAppointment = async (req, res) => {
  try {
    console.log('📝 Create appointment request body:', req.body);
    
    const {
      doctorId,
      doctorName,
      specialization,
      patientName,
      patientEmail,
      patientPhone,
      date,
      time,
      type,
      location,
      videoLink,
      fee,
      notes
    } = req.body;

    // Get patient ID from authenticated user
    const patientId = req.user._id;
    
    console.log('👤 Patient ID:', patientId);
    console.log('👨‍⚕️ Doctor ID (from request):', doctorId);

    // Validate required fields
    if (!doctorId || !doctorName || !specialization || !patientName || !date || !time || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: doctorId, doctorName, specialization, patientName, date, time, type'
      });
    }

    // First, find the doctor to get the actual doctorId string used in DoctorSchedule
    const doctor = await findDoctorByAnyId(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found. Please check the doctor information.'
      });
    }
    
    // Use the doctor's custom doctorId (string) for schedule lookup
    const actualDoctorId = doctor.doctorId;
    console.log('👨‍⚕️ Found doctor:', doctor.name, 'with doctorId:', actualDoctorId);

    // Find schedule using the doctor's custom ID (String)
    let schedule = await DoctorSchedule.findOne({ doctorId: actualDoctorId });
    
    if (!schedule) {
      console.log('❌ No schedule found for doctorId:', actualDoctorId);
      return res.status(400).json({
        success: false,
        message: 'Doctor schedule not found. Please contact the doctor to set up their availability.'
      });
    }
    
    console.log('✅ Schedule found with slots:', schedule.slots.length);
    
    // Find the specific slot
    const slotIndex = schedule.slots.findIndex(s => s.date === date && s.time === time);
    
    if (slotIndex === -1) {
      console.log('❌ Slot not found for date:', date, 'time:', time);
      return res.status(400).json({
        success: false,
        message: 'Selected time slot is not available on this date.'
      });
    }
    
    const slot = schedule.slots[slotIndex];
    
    // Check if slot is already booked or pending
    if (slot.status !== 'available') {
      console.log('❌ Slot is already', slot.status, '- cannot book again');
      return res.status(409).json({
        success: false,
        message: slot.status === 'pending' 
          ? 'This time slot has a pending booking request already. Please choose another slot.'
          : 'This time slot is already booked. Please choose another slot.',
        slotStatus: slot.status
      });
    }

    // Mark slot as pending immediately to prevent double booking
    schedule.slots[slotIndex].status = 'pending';
    schedule.slots[slotIndex].bookedBy = patientId.toString();
    schedule.slots[slotIndex].bookedAt = new Date();
    await schedule.save();
    console.log('✅ Slot marked as pending - prevents double booking');

    // Generate a unique appointment ID
    const appointmentId = `APT${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create appointment with PENDING status
    const appointment = await Appointment.create({
      appointmentId: appointmentId,
      doctorId: doctor._id,
      doctorName: doctorName,
      specialization: specialization,
      patientId: patientId,
      patientName: patientName,
      patientEmail: patientEmail || '',
      patientPhone: patientPhone || 'Not provided',
      date: date,
      time: time,
      type: type === 'video' ? 'video' : 'in-person',
      location: location || '',
      videoLink: videoLink || '',
      fee: fee || slot.fee || 0,
      notes: notes || '',
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Appointment created successfully with PENDING status:', appointment._id);

    res.status(201).json({
      success: true,
      message: 'Appointment request submitted successfully. Waiting for doctor confirmation.',
      data: appointment
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This appointment slot is already booked. Please choose a different time slot.',
        error: 'DUPLICATE_BOOKING'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Confirm a pending appointment (doctor only)
export const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID'
      });
    }

    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // IMPROVED: Convert both IDs to strings for comparison
    const appointmentDoctorId = appointment.doctorId.toString();
    const currentUserId = req.user._id.toString();
    
    console.log('Appointment doctor ID:', appointmentDoctorId);
    console.log('Current user ID:', currentUserId);
    console.log('User role:', req.user.role);
    
    // Also check if the doctor exists in the Doctor collection
    const doctor = await Doctor.findById(appointmentDoctorId);
    console.log('Found doctor:', doctor ? doctor.name : 'Not found');
    console.log('Doctor email:', doctor?.email);
    console.log('User email:', req.user.email);
    
    // Better authorization check: compare by email or ID
    const isAuthorized = 
      appointmentDoctorId === currentUserId ||
      (doctor && doctor.email === req.user.email) ||
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Only the doctor can confirm this appointment',
        debug: {
          appointmentDoctorId,
          currentUserId,
          userEmail: req.user.email
        }
      });
    }
    
    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Only pending appointments can be confirmed. Current status: ${appointment.status}`
      });
    }
    
    // Update appointment status to confirmed
    appointment.status = 'confirmed';
    appointment.confirmedAt = new Date();
    appointment.updatedAt = new Date();
    await appointment.save();
    
    // Now update the slot to booked
    if (doctor) {
      const schedule = await DoctorSchedule.findOne({ doctorId: doctor.doctorId });
      if (schedule) {
        const slot = schedule.slots.find(s => s.date === appointment.date && s.time === appointment.time);
        if (slot && slot.status === 'pending') {
          slot.status = 'booked';
          slot.bookedBy = appointment.patientId.toString();
          slot.bookedAt = new Date();
          await schedule.save();
          console.log('✅ Slot marked as booked for confirmed appointment');
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Appointment confirmed successfully',
      data: appointment
    });
    
  } catch (error) {
    console.error('Confirm appointment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get my appointments (for patients)
export const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { status, upcoming } = req.query;

    let query = { patientId };

    if (status) {
      query.status = status;
    }

    let appointments = await Appointment.find(query).sort({ date: -1, time: 1 });

    // Filter upcoming appointments if requested
    if (upcoming === 'true') {
      const today = new Date().toISOString().split('T')[0];
      appointments = appointments.filter(apt => apt.date >= today && apt.status === 'confirmed');
    }

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });

  } catch (error) {
    console.error('Get my appointments error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get doctor appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date, status } = req.query;
    
    // First find the doctor to get MongoDB _id
    const doctor = await findDoctorByAnyId(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    let query = { doctorId: doctor._id };

    if (date) {
      query.date = date;
    }

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query).sort({ date: -1, time: 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });

  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID'
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization (patient or doctor)
    const userId = req.user._id;
    const isPatient = appointment.patientId.toString() === userId.toString();
    const isDoctor = appointment.doctorId.toString() === userId.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }

    res.json({
      success: true,
      data: appointment
    });

  } catch (error) {
    console.error('Get appointment by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID'
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const userId = req.user._id;
    const isPatient = appointment.patientId.toString() === userId.toString();
    const isDoctor = appointment.doctorId.toString() === userId.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['completed', 'cancelled', 'no-show'],
      'completed': [],
      'cancelled': [],
      'no-show': []
    };

    if (!validTransitions[appointment.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${appointment.status} to ${status}`
      });
    }

    // Update status
    appointment.status = status;
    appointment.updatedAt = new Date();

    if (status === 'cancelled') {
      appointment.cancelledAt = new Date();
      appointment.cancellationReason = cancellationReason || 'No reason provided';
      
      // Find the doctor to get their custom doctorId
      const doctor = await Doctor.findById(appointment.doctorId);
      if (doctor) {
        // Free up the slot in doctor's schedule if it was booked or pending
        const schedule = await DoctorSchedule.findOne({ doctorId: doctor.doctorId });
        if (schedule) {
          const slot = schedule.slots.find(s => s.date === appointment.date && s.time === appointment.time);
          if (slot && (slot.status === 'booked' || slot.status === 'pending')) {
            slot.status = 'available';
            slot.bookedBy = null;
            slot.bookedAt = null;
            await schedule.save();
            console.log('✅ Slot released for doctor:', doctor.doctorId);
          }
        }
      }
    }

    if (status === 'confirmed') {
      appointment.confirmedAt = new Date();
    }

    if (status === 'completed') {
      appointment.completedAt = new Date();
    }

    await appointment.save();

    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: appointment
    });

  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID'
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const userId = req.user._id;
    const isPatient = appointment.patientId.toString() === userId.toString();
    const isDoctor = appointment.doctorId.toString() === userId.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this appointment'
      });
    }

    // Free up the slot if appointment was confirmed or pending
    if (appointment.status === 'confirmed' || appointment.status === 'pending') {
      const doctor = await Doctor.findById(appointment.doctorId);
      if (doctor) {
        const schedule = await DoctorSchedule.findOne({ doctorId: doctor.doctorId });
        if (schedule) {
          const slot = schedule.slots.find(s => s.date === appointment.date && s.time === appointment.time);
          if (slot && (slot.status === 'booked' || slot.status === 'pending')) {
            slot.status = 'available';
            slot.bookedBy = null;
            slot.bookedAt = null;
            await schedule.save();
          }
        }
      }
    }

    await appointment.deleteOne();

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });

  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete expired appointments (older than 30 days)
export const deleteExpiredAppointments = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Appointment.deleteMany({
      date: { $lt: thirtyDaysAgo.toISOString().split('T')[0] },
      status: { $in: ['completed', 'cancelled', 'no-show'] }
    });

    res.json({
      success: true,
      message: `${result.deletedCount} expired appointments deleted`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Delete expired appointments error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Attach medical record to appointment
export const attachRecordToAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { recordId, recordType, recordName, recordUrl, uploadedBy } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID'
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const userId = req.user._id;
    const isPatient = appointment.patientId.toString() === userId.toString();
    const isDoctor = appointment.doctorId.toString() === userId.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to attach records to this appointment'
      });
    }

    // Initialize attachedRecords array if it doesn't exist
    if (!appointment.attachedRecords) {
      appointment.attachedRecords = [];
    }

    // Check if record already attached
    const alreadyAttached = appointment.attachedRecords.some(r => {
      return r.recordId.toString() === recordId.toString();
    });
    
    if (alreadyAttached) {
      return res.status(400).json({
        success: false,
        message: 'This record is already attached to the appointment'
      });
    }

    // Add new record
    const newRecord = {
      recordId: recordId,
      recordType: recordType || 'document',
      recordName: recordName || 'Medical Record',
      recordUrl: recordUrl || '',
      uploadedBy: userId,
      uploadedByName: uploadedBy || req.user.name || 'User',
      uploadedAt: new Date()
    };

    appointment.attachedRecords.push(newRecord);
    appointment.updatedAt = new Date();
    await appointment.save();

    console.log('✅ Medical record attached:', recordId, 'to appointment:', appointment._id);

    res.json({
      success: true,
      message: 'Medical record attached successfully to appointment',
      data: newRecord
    });

  } catch (error) {
    console.error('Attach record error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove attached record from appointment
export const removeAttachedRecord = async (req, res) => {
  try {
    const { id, recordId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID'
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const userId = req.user._id;
    const isPatient = appointment.patientId.toString() === userId.toString();
    const isDoctor = appointment.doctorId.toString() === userId.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove records from this appointment'
      });
    }

    // Find and remove the record
    const recordIndex = appointment.attachedRecords.findIndex(r => r.recordId === recordId);
    
    if (recordIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    appointment.attachedRecords.splice(recordIndex, 1);
    appointment.updatedAt = new Date();
    await appointment.save();

    res.json({
      success: true,
      message: 'Record removed successfully'
    });

  } catch (error) {
    console.error('Remove record error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get patient statistics
export const getPatientStats = async (req, res) => {
  try {
    const patientId = req.user._id;

    const totalAppointments = await Appointment.countDocuments({ patientId });
    const pendingAppointments = await Appointment.countDocuments({
      patientId,
      status: 'pending'
    });
    const upcomingAppointments = await Appointment.countDocuments({
      patientId,
      date: { $gte: new Date().toISOString().split('T')[0] },
      status: 'confirmed'
    });
    const completedAppointments = await Appointment.countDocuments({
      patientId,
      status: 'completed'
    });
    const cancelledAppointments = await Appointment.countDocuments({
      patientId,
      status: 'cancelled'
    });

    // Calculate total spent
    const appointments = await Appointment.find({
      patientId,
      status: 'completed'
    });
    const totalSpent = appointments.reduce((sum, apt) => sum + (apt.fee || 0), 0);

    res.json({
      success: true,
      data: {
        totalAppointments,
        pendingAppointments,
        upcomingAppointments,
        completedAppointments,
        cancelledAppointments,
        totalSpent
      }
    });

  } catch (error) {
    console.error('Get patient stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get doctor statistics
export const getDoctorStats = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Find doctor to get MongoDB _id
    const doctor = await findDoctorByAnyId(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const totalAppointments = await Appointment.countDocuments({ doctorId: doctor._id });
    const pendingAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      status: 'pending'
    });
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      date: today
    });
    const completedAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      status: 'completed'
    });
    const cancelledAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      status: 'cancelled'
    });
    const upcomingAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      date: { $gte: today },
      status: 'confirmed'
    });

    // Calculate total revenue
    const completedApps = await Appointment.find({
      doctorId: doctor._id,
      status: 'completed'
    });
    const totalRevenue = completedApps.reduce((sum, apt) => sum + (apt.fee || 0), 0);

    res.json({
      success: true,
      data: {
        totalAppointments,
        pendingAppointments,
        todayAppointments,
        upcomingAppointments,
        completedAppointments,
        cancelledAppointments,
        totalRevenue
      }
    });

  } catch (error) {
    console.error('Get doctor stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get available slots
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    
    // Find doctor to get the custom doctorId string
    const doctor = await findDoctorByAnyId(doctorId);
    
    if (!doctor) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const schedule = await DoctorSchedule.findOne({ doctorId: doctor.doctorId });
    
    if (!schedule) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    let slots = schedule.slots;
    
    // Filter by date if provided
    if (date) {
      slots = slots.filter(slot => slot.date === date);
    }
    
    // Filter available slots (only 'available', not 'booked' or 'pending')
    const availableSlots = slots
      .filter(slot => slot.status === 'available')
      .map(slot => ({
        id: slot.id,
        time: slot.time,
        date: slot.date,
        type: slot.type,
        location: slot.location,
        videoLink: slot.videoLink,
        fee: slot.fee,
        status: slot.status,
        doctorName: slot.doctorName,
        specialization: slot.specialization
      }));
    
    res.json({
      success: true,
      data: availableSlots
    });
    
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reject/Cancel a pending appointment (doctor only)
export const rejectAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID'
      });
    }

    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user is the doctor
    const appointmentDoctorId = appointment.doctorId.toString();
    const currentUserId = req.user._id.toString();
    
    const doctor = await Doctor.findById(appointmentDoctorId);
    
    const isAuthorized = 
      appointmentDoctorId === currentUserId ||
      (doctor && doctor.email === req.user.email) ||
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Only the doctor can reject this appointment'
      });
    }
    
    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Only pending appointments can be rejected. Current status: ${appointment.status}`
      });
    }
    
    // Update appointment status to cancelled
    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = rejectionReason || 'Rejected by doctor';
    appointment.updatedAt = new Date();
    await appointment.save();
    
    // Free up the slot
    if (doctor) {
      const schedule = await DoctorSchedule.findOne({ doctorId: doctor.doctorId });
      if (schedule) {
        const slot = schedule.slots.find(s => s.date === appointment.date && s.time === appointment.time);
        if (slot && slot.status === 'pending') {
          slot.status = 'available';
          slot.bookedBy = null;
          slot.bookedAt = null;
          await schedule.save();
          console.log('✅ Slot released back to available');
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Appointment rejected successfully',
      data: appointment
    });
    
  } catch (error) {
    console.error('Reject appointment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Complete appointment after consultation
export const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { consultationNotes, prescription, prescriptionId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID'
      });
    }

    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user is the doctor
    const appointmentDoctorId = appointment.doctorId.toString();
    const currentUserId = req.user._id.toString();
    
    const doctor = await Doctor.findById(appointmentDoctorId);
    
    const isAuthorized = 
      appointmentDoctorId === currentUserId ||
      (doctor && doctor.email === req.user.email) ||
      req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Only the doctor can complete this appointment'
      });
    }
    
    // Check if appointment can be completed
    if (appointment.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Only confirmed appointments can be completed. Current status: ${appointment.status}`
      });
    }
    
    // Update appointment status to completed
    appointment.status = 'completed';
    appointment.completedAt = new Date();
    appointment.updatedAt = new Date();
    
    // Add consultation notes if provided
    if (consultationNotes) {
      appointment.consultationNotes = consultationNotes;
    }
    
    // Add prescription if provided
    if (prescription) {
      appointment.prescription = prescription;
    }
    
    if (prescriptionId) {
      appointment.prescriptionId = prescriptionId;
    }
    
    await appointment.save();
    
    console.log('✅ Appointment marked as completed:', appointment._id);
    
    res.json({
      success: true,
      message: 'Appointment marked as completed successfully',
      data: appointment
    });
    
  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Link prescription to appointment
export const linkPrescriptionToAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { prescriptionId, prescriptionData } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID'
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization - only the doctor can link prescription
    const appointmentDoctorId = appointment.doctorId.toString();
    const currentUserId = req.user._id.toString();
    
    const doctor = await Doctor.findById(appointmentDoctorId);
    
    const isAuthorized = 
      appointmentDoctorId === currentUserId ||
      (doctor && doctor.email === req.user.email) ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Only the doctor can add prescriptions to this appointment'
      });
    }

    // Add prescription reference to appointment
    appointment.prescriptionId = prescriptionId;
    appointment.prescription = prescriptionData;
    appointment.updatedAt = new Date();
    await appointment.save();

    console.log('✅ Prescription linked to appointment:', id);

    res.json({
      success: true,
      message: 'Prescription linked to appointment successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Link prescription error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};