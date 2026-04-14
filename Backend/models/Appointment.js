// models/Appointment.js
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true, unique: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: { type: String, required: true },
  specialization: { type: String, required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  patientEmail: { type: String, required: true },
  patientPhone: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  type: { type: String, enum: ['in-person', 'video'], required: true },
  location: { type: String },
  videoLink: { type: String },
  fee: { type: Number, required: true },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  // Prescription fields
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  prescription: {
    type: mongoose.Schema.Types.Mixed  // Store prescription summary or object
  },
  consultationNotes: {
    type: String
  },
  attachedRecords: [{
    recordId: String,
    recordType: String,
    recordName: String,
    recordUrl: String,
    uploadedBy: mongoose.Schema.Types.ObjectId,
    uploadedByName: String,
    uploadedAt: Date
  }],
  cancelledAt: Date,
  cancellationReason: String,
  completedAt: Date,
  confirmedAt: Date,
  createdAt: Date,
  updatedAt: Date
});

// Add index for better query performance
appointmentSchema.index({ patientId: 1, date: -1 });
appointmentSchema.index({ doctorId: 1, date: -1 });
appointmentSchema.index({ status: 1 });

export default mongoose.model('Appointment', appointmentSchema);