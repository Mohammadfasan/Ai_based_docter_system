import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  // Patient Info
  patientId: {
    type: String,
    required: true,
    index: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String,
    required: true
  },
  
  // Doctor Info
  doctorId: {
    type: String,
    required: true,
    index: true
  },
  doctorName: {
    type: String,
    required: true
  },
  doctorSpecialization: {
    type: String,
    required: true
  },
  
  // Appointment Details
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Video Consultation', 'Clinic Visit', 'video', 'clinic'],
    required: true
  },
  location: {
    type: String,
    default: ''
  },
  videoLink: {
    type: String,
    default: ''
  },
  
  // Fees
  fee: {
    type: Number,
    required: true
  },
  
  // Symptoms
  symptoms: {
    type: String,
    default: ''
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Slot reference
  slotId: {
    type: String,
    default: ''
  },
  
  // Attached records
  attachedRecords: [{
    type: String
  }],
  
  // Timestamps
  bookedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for unique appointments (prevents double-booking)
appointmentSchema.index({ doctorId: 1, date: 1, time: 1 }, { unique: true });
// Index for faster queries
appointmentSchema.index({ patientId: 1, status: 1 });
appointmentSchema.index({ doctorId: 1, date: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;