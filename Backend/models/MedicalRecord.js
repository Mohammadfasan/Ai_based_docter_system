import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  data: {
    type: String,
    required: true
  },
  cloudinaryUrl: {
    type: String,
    default: null
  },
  publicId: {
    type: String,
    default: null
  },
  fileType: {
    type: String,
    enum: ['image', 'pdf'],
    required: true
  }
});

const opDetailsSchema = new mongoose.Schema({
  opDoctor: {
    type: String,
    default: ''
  },
  opDept: {
    type: String,
    default: ''
  },
  visitType: {
    type: String,
    enum: ['OP', 'Emergency', 'Follow-up', ''],
    default: ''
  },
  bp: {
    type: String,
    default: ''
  },
  heartRate: {
    type: String,
    default: ''
  },
  temp: {
    type: String,
    default: ''
  },
  oxygen: {
    type: String,
    default: ''
  }
});

const medicalRecordSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  doctor: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Lab Report', 'X-Ray', 'MRI', 'CT Scan', 'Prescription', 'Checkup']
  },
  diagnosis: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  opDetails: {
    type: opDetailsSchema,
    default: null
  },
  uploadedBy: {
    type: String,
    required: true
  },
  uploadedById: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: String,
    required: true
  },
  files: [fileSchema]
}, {
  timestamps: true
});

// Add indexes for better query performance
medicalRecordSchema.index({ userId: 1, type: 1 });
medicalRecordSchema.index({ userId: 1, date: -1 });
medicalRecordSchema.index({ userId: 1, doctor: 1 });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

export default MedicalRecord;