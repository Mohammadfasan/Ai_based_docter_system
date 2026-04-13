
import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import DoctorSchedule from '../models/DoctorSchedule.js';
import Doctor from '../models/Doctor.js';

// Helper function to find doctor by various ID formats
const findDoctorByAnyId = async (doctorId) => {
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

// Create a new appointment (status = pending, slot marked as pending)
export const createAppointment = async (req, res) => {
  try {
    console.log('📝 Create appointment request body:', req.body);
    console.log('👤 Authenticated user:', req.user);
    
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

    // ✅ Get patient ID from authenticated user (not from request body)
    const patientId = req.user._id;
    console.log('👤 Patient ID (from auth):', patientId);
    console.log('👨‍⚕️ Doctor ID (from request):', doctorId);

    // Validate required fields
    if (!doctorId || !doctorName || !specialization || !patientName || !date || !time || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: doctorId, doctorName, specialization, patientName, date, time, type'
      });
    }

    // Find the doctor
    const doctor = await findDoctorByAnyId(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found. Please check the doctor information.'
      });
    }
    
    const actualDoctorId = doctor.doctorId;
    console.log('👨‍⚕️ Found doctor:', doctor.name, 'with doctorId:', actualDoctorId);
    
    // Find schedule
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
    const slot = schedule.slots.find(s => s.date === date && s.time === time);
    
    if (!slot) {
      console.log('❌ Slot not found for date:', date, 'time:', time);
      return res.status(400).json({
        success: false,
        message: 'Selected time slot is not available on this date.'
      });
    }
    
    if (slot.status !== 'available') {
      console.log('❌ Slot is not available, status:', slot.status);
      return res.status(400).json({
        success: false,
        message: 'Selected time slot is no longer available. Please choose another slot.'
      });
    }

    // ✅ MARK SLOT AS PENDING IMMEDIATELY (prevents double booking)
    slot.status = 'pending';
    slot.bookedBy = patientId.toString();
    slot.bookedAt = new Date();
    await schedule.save();
    console.log('✅ Slot marked as PENDING for this patient:', patientId);

    // Generate appointment ID
    const appointmentId = `APT${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // ✅ Create appointment with PENDING status - using authenticated patient ID
    const appointment = await Appointment.create({
      appointmentId: appointmentId,
      doctorId: doctor._id,
      doctorName: doctorName,
      specialization: specialization,
      patientId: patientId,  // ✅ Use authenticated patient ID
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
    console.log('📊 Appointment details - Patient:', appointment.patientId, 'Doctor:', appointment.doctorId);

    res.status(201).json({
      success: true,
      message: 'Appointment request submitted successfully. Waiting for doctor confirmation.',
      data: appointment
    });

  } catch (error) {
    console.error('❌ Create appointment error:', error);
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
    console.log('🔍 Confirming appointment:', id);
    
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
    
    console.log('📋 Found appointment:', {
      id: appointment._id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      status: appointment.status,
      date: appointment.date,
      time: appointment.time
    });
    
    // Find the doctor record for the logged-in user
    let doctor = await Doctor.findOne({ email: req.user.email });
    if (!doctor) {
      doctor = await Doctor.findOne({ userId: req.user._id });
    }
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found for this user'
      });
    }
    
    console.log('🔍 Authorization check:', {
      appointmentDoctorId: appointment.doctorId.toString(),
      doctorId: doctor._id.toString(),
      match: appointment.doctorId.toString() === doctor._id.toString()
    });
    
    // Check if the logged-in user is the doctor
    if (appointment.doctorId.toString() !== doctor._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the doctor can confirm this appointment'
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
    
    console.log('✅ Appointment status updated to CONFIRMED');
    
    // ✅ UPDATE SLOT STATUS: pending → booked
    const schedule = await DoctorSchedule.findOne({ doctorId: doctor.doctorId });
    if (schedule) {
      const slot = schedule.slots.find(s => s.date === appointment.date && s.time === appointment.time);
      if (slot) {
        if (slot.status === 'pending') {
          slot.status = 'booked';
          slot.bookedBy = appointment.patientId.toString();
          slot.bookedAt = new Date();
          await schedule.save();
          console.log('✅ Slot status changed from PENDING to BOOKED');
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Appointment confirmed successfully',
      data: appointment
    });
    
  } catch (error) {
    console.error('❌ Confirm appointment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reject/Cancel a pending appointment
export const rejectAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    console.log('🔍 Rejecting appointment:', id);
    
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
    
    // Find the doctor record for the logged-in user
    let doctor = await Doctor.findOne({ email: req.user.email });
    if (!doctor) {
      doctor = await Doctor.findOne({ userId: req.user._id });
    }
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found for this user'
      });
    }
    
    // Check if the logged-in user is the doctor
    if (appointment.doctorId.toString() !== doctor._id.toString() && req.user.role !== 'admin') {
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
    
    console.log('✅ Appointment status updated to CANCELLED');
    
    // ✅ RELEASE SLOT: pending → available
    const schedule = await DoctorSchedule.findOne({ doctorId: doctor.doctorId });
    if (schedule) {
      const slot = schedule.slots.find(s => s.date === appointment.date && s.time === appointment.time);
      if (slot) {
        slot.status = 'available';
        slot.bookedBy = null;
        slot.bookedAt = null;
        await schedule.save();
        console.log('✅ Slot released back to AVAILABLE status');
      }
    }
    
    res.json({
      success: true,
      message: 'Appointment rejected',
      data: appointment
    });
    
  } catch (error) {
    console.error('❌ Reject appointment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get my appointments (for patients) - ✅ FIXED to return only this patient's appointments
export const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { status, upcoming } = req.query;

    console.log('📋 Getting appointments for patient:', patientId);

    // ✅ CRITICAL: Only query appointments for THIS patient
    let query = { patientId: patientId };

    if (status) {
      query.status = status;
    }

    // Get ALL appointments for this patient (not just future ones)
    let appointments = await Appointment.find(query)
      .sort({ date: -1, time: 1 })
      .lean();

    console.log('📊 Found appointments:', appointments.length, 'for patient:', patientId);

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
    console.error('❌ Get my appointments error:', error);
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
    
    console.log('📋 Getting appointments for doctor:', doctorId);
    
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

    const appointments = await Appointment.find(query)
      .sort({ date: -1, time: 1 })
      .lean();

    console.log('📊 Found appointments:', appointments.length, 'for doctor:', doctor._id);

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });

  } catch (error) {
    console.error('❌ Get doctor appointments error:', error);
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
      
      // ✅ RELEASE SLOT if appointment was pending or confirmed
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
            console.log('✅ Slot released to AVAILABLE status');
          }
        }
      }
    }

    if (status === 'confirmed') {
      appointment.confirmedAt = new Date();
      
      // ✅ UPDATE SLOT: pending → booked
      const doctor = await Doctor.findById(appointment.doctorId);
      if (doctor) {
        const schedule = await DoctorSchedule.findOne({ doctorId: doctor.doctorId });
        if (schedule) {
          const slot = schedule.slots.find(s => s.date === appointment.date && s.time === appointment.time);
          if (slot && slot.status === 'pending') {
            slot.status = 'booked';
            await schedule.save();
            console.log('✅ Slot status changed to BOOKED');
          }
        }
      }
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
    console.error('❌ Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete appointment - ✅ ONLY delete if patient is the owner
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

    // ✅ CRITICAL: Check if this patient owns this appointment
    const userId = req.user._id;
    const isPatient = appointment.patientId.toString() === userId.toString();
    const isDoctor = appointment.doctorId.toString() === userId.toString();

    // ✅ Only patient who booked it or doctor can delete
    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this appointment'
      });
    }

    console.log('🗑️ Deleting appointment:', id, 'by patient:', userId);

    // ✅ FREE UP SLOT if appointment was confirmed or pending
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
            console.log('✅ Slot released to AVAILABLE');
          }
        }
      }
    }

    await Appointment.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete appointment error:', error);
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

    console.log('🗑️ Deleted expired appointments:', result.deletedCount);

    res.json({
      success: true,
      message: `${result.deletedCount} expired appointments deleted`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('❌ Delete expired appointments error:', error);
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

    const userId = req.user._id;
    const isPatient = appointment.patientId.toString() === userId.toString();
    const isDoctor = appointment.doctorId.toString() === userId.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to attach records to this appointment'
      });
    }

    if (!appointment.attachedRecords) {
      appointment.attachedRecords = [];
    }

    const newRecord = {
      recordId: recordId || `REC${Date.now()}${Math.floor(Math.random() * 1000)}`,
      recordType: recordType || 'document',
      recordName: recordName || 'Medical Record',
      recordUrl: recordUrl || '',
      uploadedBy: uploadedBy || userId,
      uploadedAt: new Date()
    };

    appointment.attachedRecords.push(newRecord);
    appointment.updatedAt = new Date();
    await appointment.save();

    res.json({
      success: true,
      message: 'Record attached successfully',
      data: newRecord
    });

  } catch (error) {
    console.error('❌ Attach record error:', error);
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

    const userId = req.user._id;
    const isPatient = appointment.patientId.toString() === userId.toString();
    const isDoctor = appointment.doctorId.toString() === userId.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove records from this appointment'
      });
    }

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
    console.error('❌ Remove record error:', error);
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
    console.error('❌ Get patient stats error:', error);
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
    console.error('❌ Get doctor stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get available slots (from doctorScheduleController)
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    
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
    
    if (date) {
      slots = slots.filter(slot => slot.date === date);
    }
    
    // ✅ ONLY RETURN AVAILABLE SLOTS (not pending or booked)
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
    console.error('❌ Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};