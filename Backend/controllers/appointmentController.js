import Appointment from '../models/Appointment.js';
import DoctorSchedule from '../models/DoctorSchedule.js';

// ✅ Create new appointment
export const createAppointment = async (req, res) => {
  try {
    const { 
      doctorId, date, time, slotId, patientId, patientName, 
      patientEmail, doctorName, doctorSpecialization, type, 
      location, videoLink, fee, symptoms, status
    } = req.body;
    
    console.log('📝 Creating appointment:', { doctorId, date, time, slotId, patientId });
    
    // Check if appointment already exists for this slot
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $ne: 'cancelled' }
    });
    
    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }
    
    // Verify slot is still available in doctor's schedule
    const schedule = await DoctorSchedule.findOne({ doctorId });
    if (!schedule) {
      return res.status(400).json({
        success: false,
        message: 'Doctor schedule not found'
      });
    }
    
    const slot = schedule.slots.find(s => String(s.id) === String(slotId));
    if (!slot) {
      return res.status(400).json({
        success: false,
        message: 'Slot not found'
      });
    }
    
    if (slot.status === 'booked') {
      return res.status(400).json({
        success: false,
        message: 'This time slot is no longer available'
      });
    }
    
    // Create appointment with 'pending' status
    const appointment = new Appointment({
      patientId,
      patientName,
      patientEmail,
      doctorId,
      doctorName: doctorName || slot.doctorName,
      doctorSpecialization: doctorSpecialization || slot.specialization,
      date,
      time,
      type,
      location: location || '',
      videoLink: videoLink || '',
      fee: fee || slot.fee,
      symptoms: symptoms || 'General consultation',
      slotId: String(slotId),
      status: status || 'pending',
      bookedAt: new Date(),
      attachedRecords: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await appointment.save();
    console.log('✅ Appointment created:', appointment._id);
    
    // Mark slot as booked in DoctorSchedule
    slot.status = 'booked';
    slot.bookedBy = patientId;
    slot.bookedAt = new Date();
    schedule.lastUpdated = new Date();
    await schedule.save();
    console.log('✅ Slot marked as booked in schedule');
    
    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
    
  } catch (error) {
    console.error('❌ Error creating appointment:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message
    });
  }
};

// ✅ Get current patient's appointments - SHOW ALL STATUSES
export const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user.userId || req.user._id || req.user.id;
    
    console.log('📋 Fetching appointments for patient:', patientId);
    
    // Get ALL appointments regardless of status
    const appointments = await Appointment.find({ patientId }).sort({ date: 1, time: 1 });
    
    console.log(`✅ Found ${appointments.length} appointments for patient (all statuses)`);
    
    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('❌ Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};

// ✅ Get all appointments for a specific doctor - SHOW ALL STATUSES
export const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    console.log('📋 Fetching appointments for doctor:', doctorId);
    
    // Get ALL appointments regardless of status
    const appointments = await Appointment.find({ doctorId }).sort({ date: 1, time: 1 });
    
    console.log(`✅ Found ${appointments.length} appointments for doctor (all statuses)`);
    
    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('❌ Error fetching doctor appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};

// ✅ Get single appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('❌ Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment',
      error: error.message
    });
  }
};

// ✅ Update appointment status (confirm/complete/cancel)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('📝 Updating appointment status:', { id, status });
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Update status
    appointment.status = status;
    appointment.updatedAt = new Date();
    
    // Set timestamp based on status
    if (status === 'confirmed') {
      appointment.confirmedAt = new Date();
    } else if (status === 'completed') {
      appointment.completedAt = new Date();
    } else if (status === 'cancelled') {
      appointment.cancelledAt = new Date();
      
      // Free up the slot when cancelled
      const schedule = await DoctorSchedule.findOne({ doctorId: appointment.doctorId });
      if (schedule && appointment.slotId) {
        const slot = schedule.slots.find(s => String(s.id) === String(appointment.slotId));
        if (slot) {
          slot.status = 'available';
          slot.bookedBy = null;
          slot.bookedAt = null;
          schedule.lastUpdated = new Date();
          await schedule.save();
          console.log('✅ Slot freed up after cancellation');
        }
      }
    }
    
    await appointment.save();
    
    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: appointment
    });
  } catch (error) {
    console.error('❌ Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message
    });
  }
};

// ✅ Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Deleting appointment:', id);
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Free up the slot if appointment was booked
    if (appointment.status !== 'cancelled' && appointment.slotId) {
      const schedule = await DoctorSchedule.findOne({ doctorId: appointment.doctorId });
      if (schedule) {
        const slot = schedule.slots.find(s => String(s.id) === String(appointment.slotId));
        if (slot) {
          slot.status = 'available';
          slot.bookedBy = null;
          slot.bookedAt = null;
          schedule.lastUpdated = new Date();
          await schedule.save();
          console.log('✅ Slot freed up after deletion');
        }
      }
    }
    
    await Appointment.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment',
      error: error.message
    });
  }
};

// ✅ Delete multiple expired appointments
export const deleteExpiredAppointments = async (req, res) => {
  try {
    const patientId = req.user.userId || req.user._id || req.user.id;
    
    console.log('🗑️ Deleting expired appointments for patient:', patientId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    // Find expired appointments
    const expiredAppointments = await Appointment.find({
      patientId,
      date: { $lt: todayStr }
    });
    
    let deletedCount = 0;
    
    for (const appointment of expiredAppointments) {
      // Free up slots for expired appointments
      if (appointment.slotId) {
        const schedule = await DoctorSchedule.findOne({ doctorId: appointment.doctorId });
        if (schedule) {
          const slot = schedule.slots.find(s => String(s.id) === String(appointment.slotId));
          if (slot && slot.status === 'booked') {
            slot.status = 'available';
            slot.bookedBy = null;
            slot.bookedAt = null;
            schedule.lastUpdated = new Date();
            await schedule.save();
          }
        }
      }
      
      await Appointment.findByIdAndDelete(appointment._id);
      deletedCount++;
    }
    
    console.log(`✅ Deleted ${deletedCount} expired appointments`);
    
    res.status(200).json({
      success: true,
      message: `Deleted ${deletedCount} expired appointments`,
      data: { deletedCount }
    });
  } catch (error) {
    console.error('❌ Error deleting expired appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expired appointments',
      error: error.message
    });
  }
};

// ✅ Attach medical record to appointment
export const attachRecordToAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { recordId } = req.body;
    
    console.log('📎 Attaching record to appointment:', { appointmentId: id, recordId });
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Initialize attachedRecords array if it doesn't exist
    if (!appointment.attachedRecords) {
      appointment.attachedRecords = [];
    }
    
    // Add record if not already attached
    if (!appointment.attachedRecords.includes(recordId)) {
      appointment.attachedRecords.push(recordId);
      appointment.updatedAt = new Date();
      await appointment.save();
      
      console.log('✅ Record attached successfully');
    } else {
      console.log('ℹ️ Record already attached');
    }
    
    res.status(200).json({
      success: true,
      message: 'Record attached successfully',
      data: appointment
    });
  } catch (error) {
    console.error('❌ Error attaching record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to attach record',
      error: error.message
    });
  }
};

// ✅ Remove attached record from appointment
export const removeAttachedRecord = async (req, res) => {
  try {
    const { id, recordId } = req.params;
    
    console.log('📎 Removing record from appointment:', { appointmentId: id, recordId });
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    if (appointment.attachedRecords) {
      appointment.attachedRecords = appointment.attachedRecords.filter(
        recId => recId !== recordId
      );
      appointment.updatedAt = new Date();
      await appointment.save();
      
      console.log('✅ Record removed successfully');
    }
    
    res.status(200).json({
      success: true,
      message: 'Record removed successfully',
      data: appointment
    });
  } catch (error) {
    console.error('❌ Error removing record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove record',
      error: error.message
    });
  }
};

// ✅ Get appointment statistics for patient
export const getPatientStats = async (req, res) => {
  try {
    const patientId = req.user.userId || req.user._id || req.user.id;
    
    const total = await Appointment.countDocuments({ patientId });
    const pending = await Appointment.countDocuments({ patientId, status: 'pending' });
    const confirmed = await Appointment.countDocuments({ patientId, status: 'confirmed' });
    const completed = await Appointment.countDocuments({ patientId, status: 'completed' });
    const cancelled = await Appointment.countDocuments({ patientId, status: 'cancelled' });
    
    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        confirmed,
        completed,
        cancelled
      }
    });
  } catch (error) {
    console.error('❌ Error fetching patient stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// ✅ Get appointment statistics for doctor
export const getDoctorStats = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const today = new Date().toISOString().split('T')[0];
    
    const total = await Appointment.countDocuments({ doctorId });
    const pending = await Appointment.countDocuments({ doctorId, status: 'pending' });
    const confirmed = await Appointment.countDocuments({ doctorId, status: 'confirmed' });
    const completed = await Appointment.countDocuments({ doctorId, status: 'completed' });
    const cancelled = await Appointment.countDocuments({ doctorId, status: 'cancelled' });
    const todayAppointments = await Appointment.countDocuments({ 
      doctorId, 
      date: today,
      status: { $in: ['pending', 'confirmed'] }
    });
    
    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        confirmed,
        completed,
        cancelled,
        todayAppointments
      }
    });
  } catch (error) {
    console.error('❌ Error fetching doctor stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};