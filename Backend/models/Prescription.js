// models/Prescription.js
import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required']
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required']
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required']
  },
  notes: {
    type: String,
    default: ''
  }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: {
    type: String,
    unique: true,
    default: () => `PRESC${Date.now()}${Math.floor(Math.random() * 1000)}`
  },
  patient: {
    id: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Patient ID is required']
    },
    name: {
      type: String,
      required: [true, 'Patient name is required']
    },
    userId: {
      type: String,
      required: [true, 'Patient user ID is required']
    },
    email: {
      type: String
    }
  },
  doctor: {
    id: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Doctor ID is required']
    },
    name: {
      type: String,
      required: [true, 'Doctor name is required']
    },
    userId: {
      type: String
    },
    specialization: {
      type: String
    },
    email: {
      type: String
    }
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required']
  },
  symptoms: {
    type: String,
    default: ''
  },
  medicines: {
    type: [medicineSchema],
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v);
      },
      message: 'Medicines must be an array'
    }
  },
  instructions: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  refills: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  date: {
    type: Date,
    default: Date.now
  },
  appointmentTime: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted date
prescriptionSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Indexes for faster queries
prescriptionSchema.index({ 'patient.id': 1, createdAt: -1 });
prescriptionSchema.index({ 'patient.userId': 1, createdAt: -1 });
prescriptionSchema.index({ 'doctor.id': 1, createdAt: -1 });
prescriptionSchema.index({ 'doctor.userId': 1, createdAt: -1 });
prescriptionSchema.index({ 'doctor.email': 1, createdAt: -1 });
prescriptionSchema.index({ prescriptionId: 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ date: -1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;