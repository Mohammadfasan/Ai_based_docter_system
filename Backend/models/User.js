import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true,
    unique: true
  },
  userType: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },
  phone: String,
  
  // Personal Info
  age: Number,
  gender: String,
  bloodGroup: String,
  weight: Number,
  height: Number,
  address: String,
  
  // Emergency Contact
  emergencyName: String,
  emergencyContact: String,
  
  // Medical Info
  allergies: [String],
  chronicConditions: [String],
  currentMedications: [String],
  insuranceProvider: String,
  
  // Stats
  appointmentsCount: {
    type: Number,
    default: 0
  },
  prescriptionsCount: {
    type: Number,
    default: 0
  },
  medicalRecordsCount: {
    type: Number,
    default: 0
  },
  lastVisit: Date,
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
});

// Create index for faster queries
userSchema.index({ email: 1, userType: 1 });
userSchema.index({ userId: 1 });

const User = mongoose.model('User', userSchema);
export default User;