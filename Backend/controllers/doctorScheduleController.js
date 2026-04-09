import DoctorSchedule from '../models/DoctorSchedule.js';
import Doctor from '../models/Doctor.js';
import mongoose from 'mongoose';

// Helper function to find doctor by various ID formats
const findDoctorById = async (doctorId) => {
  // Try multiple ways to find the doctor
  let doctor = await Doctor.findOne({ doctorId: doctorId });
  
  if (!doctor && mongoose.Types.ObjectId.isValid(doctorId)) {
    doctor = await Doctor.findById(doctorId);
  }
  
  if (!doctor) {
    doctor = await Doctor.findOne({ userId: doctorId });
  }
  
  // Try to find by email
  if (!doctor) {
    doctor = await Doctor.findOne({ email: doctorId });
  }
  
  // If still not found, try to find by name
  if (!doctor) {
    doctor = await Doctor.findOne({ 
      name: { $regex: doctorId, $options: 'i' } 
    });
  }
  
  return doctor;
};

// Get logged-in doctor's schedule
export const getMySchedule = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor privileges required.'
      });
    }
    
    // Find doctor by email from logged-in user
    let doctor = await Doctor.findOne({ email: req.user.email });
    if (!doctor) {
      doctor = await Doctor.findOne({ doctorId: req.user.userId });
    }
    
    if (!doctor) {
      return res.status(200).json({
        success: true,
        data: { slots: [] },
        message: 'Doctor profile not found'
      });
    }
    
    const actualDoctorId = doctor.doctorId;
    console.log('✅ Found doctor:', doctor.name, 'with ID:', actualDoctorId);
    
    let schedule = await DoctorSchedule.findOne({ doctorId: actualDoctorId });
    
    if (!schedule) {
      schedule = new DoctorSchedule({
        doctorId: actualDoctorId,
        slots: []
      });
      await schedule.save();
    }
    
    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Error getting my schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule',
      error: error.message
    });
  }
};

// Get doctor schedule by ID
export const getDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    console.log('📅 Fetching schedule for doctorId:', doctorId);
    
    const doctor = await findDoctorById(doctorId);
    
    if (!doctor) {
      return res.status(200).json({
        success: true,
        data: { slots: [] },
        message: 'Doctor not found, returning empty schedule'
      });
    }
    
    const actualDoctorId = doctor.doctorId;
    
    let schedule = await DoctorSchedule.findOne({ doctorId: actualDoctorId });
    
    if (!schedule) {
      schedule = new DoctorSchedule({
        doctorId: actualDoctorId,
        slots: []
      });
      await schedule.save();
    }
    
    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Error getting doctor schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor schedule',
      error: error.message
    });
  }
};

// Get available slots for patients
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    
    console.log('📅 Fetching available slots for doctor:', doctorId, 'date:', date);
    
    const doctor = await findDoctorById(doctorId);
    
    if (!doctor) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    const actualDoctorId = doctor.doctorId;
    const schedule = await DoctorSchedule.findOne({ doctorId: actualDoctorId });
    
    if (!schedule) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    let availableSlots = schedule.slots.filter(slot => slot.status === 'available');
    
    if (date) {
      availableSlots = availableSlots.filter(slot => slot.date === date);
    }
    
    // Only show future slots (today and future dates)
    const today = new Date().toISOString().split('T')[0];
    availableSlots = availableSlots.filter(slot => slot.date >= today);
    
    // Sort by date and time
    availableSlots.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
    
    console.log(`✅ Found ${availableSlots.length} available slots`);
    
    res.status(200).json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available slots',
      error: error.message
    });
  }
};

// Add slot for logged-in doctor
export const addMySlot = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor privileges required.'
      });
    }
    
    // Find doctor by email from logged-in user
    let doctor = await Doctor.findOne({ email: req.user.email });
    if (!doctor) {
      doctor = await Doctor.findOne({ doctorId: req.user.userId });
    }
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found. Please contact admin.'
      });
    }
    
    const { time, date, type, location, videoLink, fee } = req.body;
    
    console.log('📝 Adding slot for doctor:', doctor.name, doctor.doctorId);
    console.log('📝 Slot data:', { time, date, type, location, videoLink, fee });
    
    const actualDoctorId = doctor.doctorId;
    
    let schedule = await DoctorSchedule.findOne({ doctorId: actualDoctorId });
    
    if (!schedule) {
      schedule = new DoctorSchedule({
        doctorId: actualDoctorId,
        slots: []
      });
    }
    
    // Check if slot already exists
    const slotExists = schedule.slots.some(
      slot => slot.date === date && slot.time === time
    );
    
    if (slotExists) {
      return res.status(400).json({
        success: false,
        message: 'Slot already exists for this date and time'
      });
    }
    
    // Create new slot
    const newSlot = {
      id: Date.now(),
      time,
      date,
      type,
      location: location || '',
      videoLink: videoLink || '',
      status: 'available',
      fee: fee || parseInt(doctor.fees) || 2500,
      doctorName: doctor.name,
      doctorEmail: doctor.email,
      specialization: doctor.specialization,
      createdAt: new Date()
    };
    
    schedule.slots.push(newSlot);
    schedule.lastUpdated = new Date();
    
    await schedule.save();
    
    console.log('✅ Slot added successfully');
    
    res.status(201).json({
      success: true,
      message: 'Slot added successfully',
      data: newSlot
    });
  } catch (error) {
    console.error('❌ Error adding slot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add slot',
      error: error.message
    });
  }
};

// Add slot by doctor ID (admin use)
export const addSlot = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { time, date, type, location, videoLink, fee } = req.body;
    
    console.log('📝 Adding slot for doctorId:', doctorId);
    
    const doctor = await findDoctorById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    const actualDoctorId = doctor.doctorId;
    
    let schedule = await DoctorSchedule.findOne({ doctorId: actualDoctorId });
    
    if (!schedule) {
      schedule = new DoctorSchedule({
        doctorId: actualDoctorId,
        slots: []
      });
    }
    
    const slotExists = schedule.slots.some(
      slot => slot.date === date && slot.time === time
    );
    
    if (slotExists) {
      return res.status(400).json({
        success: false,
        message: 'Slot already exists for this date and time'
      });
    }
    
    const newSlot = {
      id: Date.now(),
      time,
      date,
      type,
      location: location || '',
      videoLink: videoLink || '',
      status: 'available',
      fee: fee || parseInt(doctor.fees) || 2500,
      doctorName: doctor.name,
      doctorEmail: doctor.email,
      specialization: doctor.specialization,
      createdAt: new Date()
    };
    
    schedule.slots.push(newSlot);
    schedule.lastUpdated = new Date();
    await schedule.save();
    
    res.status(201).json({
      success: true,
      message: 'Slot added successfully',
      data: newSlot
    });
  } catch (error) {
    console.error('Error adding slot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add slot',
      error: error.message
    });
  }
};

// Add multiple slots (batch)
export const addMultipleSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { slots } = req.body;
    
    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid slots data'
      });
    }
    
    const doctor = await findDoctorById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    const actualDoctorId = doctor.doctorId;
    
    let schedule = await DoctorSchedule.findOne({ doctorId: actualDoctorId });
    
    if (!schedule) {
      schedule = new DoctorSchedule({
        doctorId: actualDoctorId,
        slots: []
      });
    }
    
    const newSlots = [];
    const existingSlots = new Set(
      schedule.slots.map(slot => `${slot.date}-${slot.time}`)
    );
    
    for (const slot of slots) {
      const slotKey = `${slot.date}-${slot.time}`;
      
      if (!existingSlots.has(slotKey)) {
        const newSlot = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          time: slot.time,
          date: slot.date,
          type: slot.type,
          location: slot.location || '',
          videoLink: slot.videoLink || '',
          status: 'available',
          fee: slot.fee || parseInt(doctor.fees) || 2500,
          doctorName: doctor.name,
          doctorEmail: doctor.email,
          specialization: doctor.specialization,
          createdAt: new Date()
        };
        
        schedule.slots.push(newSlot);
        newSlots.push(newSlot);
        existingSlots.add(slotKey);
      }
    }
    
    schedule.lastUpdated = new Date();
    await schedule.save();
    
    res.status(201).json({
      success: true,
      message: `${newSlots.length} slots added successfully`,
      data: newSlots
    });
  } catch (error) {
    console.error('Error adding multiple slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add slots',
      error: error.message
    });
  }
};

// Delete slot for logged-in doctor
export const deleteMySlot = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor privileges required.'
      });
    }
    
    let doctor = await Doctor.findOne({ email: req.user.email });
    if (!doctor) {
      doctor = await Doctor.findOne({ doctorId: req.user.userId });
    }
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    const { slotId } = req.params;
    const actualDoctorId = doctor.doctorId;
    const schedule = await DoctorSchedule.findOne({ doctorId: actualDoctorId });
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    const slotIndex = schedule.slots.findIndex(slot => String(slot.id) === String(slotId));
    
    if (slotIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }
    
    if (schedule.slots[slotIndex].status === 'booked') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete booked slot'
      });
    }
    
    schedule.slots.splice(slotIndex, 1);
    schedule.lastUpdated = new Date();
    await schedule.save();
    
    res.status(200).json({
      success: true,
      message: 'Slot deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting slot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete slot',
      error: error.message
    });
  }
};

// Delete slot by ID (admin use)
export const deleteSlot = async (req, res) => {
  try {
    const { doctorId, slotId } = req.params;
    
    const doctor = await findDoctorById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    const actualDoctorId = doctor.doctorId;
    const schedule = await DoctorSchedule.findOne({ doctorId: actualDoctorId });
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    const slotIndex = schedule.slots.findIndex(slot => String(slot.id) === String(slotId));
    
    if (slotIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }
    
    if (schedule.slots[slotIndex].status === 'booked') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete booked slot'
      });
    }
    
    schedule.slots.splice(slotIndex, 1);
    schedule.lastUpdated = new Date();
    await schedule.save();
    
    res.status(200).json({
      success: true,
      message: 'Slot deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting slot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete slot',
      error: error.message
    });
  }
};

// Update slot status (book/cancel) - FIXED VERSION
export const updateSlotStatus = async (req, res) => {
  try {
    const { doctorId, slotId } = req.params;
    const { status, patientId, patientName, patientEmail } = req.body;
    
    console.log('📝 Updating slot status:', { doctorId, slotId, status });
    
    const doctor = await findDoctorById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    const actualDoctorId = doctor.doctorId;
    const schedule = await DoctorSchedule.findOne({ doctorId: actualDoctorId });
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    // Find slot by id (compare as strings for consistency)
    const slot = schedule.slots.find(slot => String(slot.id) === String(slotId));
    
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }
    
    if (status === 'booked') {
      if (slot.status === 'booked') {
        return res.status(400).json({
          success: false,
          message: 'Slot already booked by another patient'
        });
      }
      
      slot.status = 'booked';
      slot.bookedBy = patientId;
      slot.bookedAt = new Date();
      
      console.log('✅ Slot booked:', slot.id, 'by patient:', patientId);
    } else if (status === 'available') {
      slot.status = 'available';
      slot.bookedBy = null;
      slot.bookedAt = null;
      
      console.log('✅ Slot released:', slot.id);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "booked" or "available"'
      });
    }
    
    schedule.lastUpdated = new Date();
    await schedule.save();
    
    res.status(200).json({
      success: true,
      message: `Slot ${status === 'booked' ? 'booked' : 'released'} successfully`,
      data: slot
    });
  } catch (error) {
    console.error('Error updating slot status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update slot status',
      error: error.message
    });
  }
};

// Get slots by date range
export const getSlotsByDateRange = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { startDate, endDate } = req.query;
    
    const doctor = await findDoctorById(doctorId);
    
    if (!doctor) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    const actualDoctorId = doctor.doctorId;
    const schedule = await DoctorSchedule.findOne({ doctorId: actualDoctorId });
    
    if (!schedule) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    let filteredSlots = schedule.slots;
    
    if (startDate) {
      filteredSlots = filteredSlots.filter(slot => slot.date >= startDate);
    }
    
    if (endDate) {
      filteredSlots = filteredSlots.filter(slot => slot.date <= endDate);
    }
    
    filteredSlots.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
    
    res.status(200).json({
      success: true,
      data: filteredSlots
    });
  } catch (error) {
    console.error('Error getting slots by date range:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch slots',
      error: error.message
    });
  }
};

// Get schedule statistics for logged-in doctor
export const getMyStats = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor privileges required.'
      });
    }
    
    let doctor = await Doctor.findOne({ email: req.user.email });
    if (!doctor) {
      doctor = await Doctor.findOne({ doctorId: req.user.userId });
    }
    
    if (!doctor) {
      return res.status(200).json({
        success: true,
        data: {
          totalSlots: 0,
          bookedSlots: 0,
          availableSlots: 0,
          upcomingSlots: 0
        }
      });
    }
    
    const actualDoctorId = doctor.doctorId;
    const schedule = await DoctorSchedule.findOne({ doctorId: actualDoctorId });
    
    if (!schedule) {
      return res.status(200).json({
        success: true,
        data: {
          totalSlots: 0,
          bookedSlots: 0,
          availableSlots: 0,
          upcomingSlots: 0
        }
      });
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    const totalSlots = schedule.slots.length;
    const bookedSlots = schedule.slots.filter(slot => slot.status === 'booked').length;
    const availableSlots = schedule.slots.filter(slot => slot.status === 'available').length;
    const upcomingSlots = schedule.slots.filter(slot => slot.date >= today && slot.status === 'available').length;
    
    res.status(200).json({
      success: true,
      data: {
        totalSlots,
        bookedSlots,
        availableSlots,
        upcomingSlots
      }
    });
  } catch (error) {
    console.error('Error getting my stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule statistics',
      error: error.message
    });
  }
};

// Get schedule statistics by doctor ID
export const getScheduleStats = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const doctor = await findDoctorById(doctorId);
    
    if (!doctor) {
      return res.status(200).json({
        success: true,
        data: {
          totalSlots: 0,
          bookedSlots: 0,
          availableSlots: 0,
          upcomingSlots: 0
        }
      });
    }
    
    const actualDoctorId = doctor.doctorId;
    const schedule = await DoctorSchedule.findOne({ doctorId: actualDoctorId });
    
    if (!schedule) {
      return res.status(200).json({
        success: true,
        data: {
          totalSlots: 0,
          bookedSlots: 0,
          availableSlots: 0,
          upcomingSlots: 0
        }
      });
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    const totalSlots = schedule.slots.length;
    const bookedSlots = schedule.slots.filter(slot => slot.status === 'booked').length;
    const availableSlots = schedule.slots.filter(slot => slot.status === 'available').length;
    const upcomingSlots = schedule.slots.filter(slot => slot.date >= today && slot.status === 'available').length;
    
    res.status(200).json({
      success: true,
      data: {
        totalSlots,
        bookedSlots,
        availableSlots,
        upcomingSlots
      }
    });
  } catch (error) {
    console.error('Error getting schedule stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule statistics',
      error: error.message
    });
  }
};