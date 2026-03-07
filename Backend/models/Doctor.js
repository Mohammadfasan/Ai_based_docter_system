// models/Doctor.js
import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    enum: [
      'Cardiologist', 'Dermatologist', 'Pediatrician', 'General Physician',
      'Neurologist', 'Orthopedic', 'Dentist', 'ENT Specialist',
      'Ophthalmologist', 'Psychiatrist', 'Gynecologist', 'Oncologist'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  qualifications: {
    type: String,
    required: [true, 'Qualifications are required']
  },
  experience: {
    type: String,
    required: [true, 'Experience is required'],
    default: '5+ Years'
  },
  license: {
    type: String,
    required: [true, 'Medical license number is required'],
    unique: true,
    sparse: true
  },
  hospital: {
    type: String,
    required: [true, 'Hospital/Clinic name is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    default: 'Colombo'
  },
  fees: {
    type: String,
    required: [true, 'Consultation fee is required'],
    default: 'LKR 2,500'
  },
  consultationTime: {
    type: String,
    required: [true, 'Consultation time is required'],
    default: '30 mins'
  },
  availability: {
    type: String,
    default: 'Mon-Fri: 9AM-6PM'
  },
  languages: [{
    type: String,
    enum: ['English', 'Sinhala', 'Tamil', 'Arabic', 'Hindi']
  }],
  isVideoAvailable: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true },
  rating: { type: Number, min: 0, max: 5, default: 4.5 },
  reviewCount: { type: Number, default: 0 },
  image: {
    type: String,
    default: 'https://ui-avatars.com/api/?name=DR&background=0D9488&color=fff&size=200'
  },
  aiSummary: { type: String, default: '' },
  status: {
    type: String,
    enum: ['active', 'inactive', 'busy'],
    default: 'active'
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  avatarColor: { type: String, default: 'from-teal-500 to-teal-600' },
  nextAvailable: { type: String, default: 'Not set' },
  distance: { type: String, default: '2.5 km' }
}, {
  timestamps: true
});

function generateDoctorId(name, email) {
  if (!name) return 'DOC-0000-XXX';
  const getInitials = (fullName) => {
    return fullName.split(' ').map(n => n.charAt(0).toUpperCase()).join('').slice(0, 3).padEnd(3, 'X');
  };
  const generateHash = (email) => {
    if (!email) return Math.random().toString(36).substring(2, 6).toUpperCase();
    const emailStr = email.toLowerCase();
    let hash = 0;
    for (let i = 0; i < emailStr.length; i++) {
      hash = ((hash << 5) - hash) + emailStr.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 4).toUpperCase().padStart(4, '0');
  };
  return `DOC-${generateHash(email)}-${getInitials(name)}`;
}

// ✅ FIXED: Removed 'next' parameter for async middleware
doctorSchema.pre('save', async function() {
  try {
    console.log('📝 Pre-save middleware running for doctor:', this.name || 'New Doctor');
    
    if (!this.doctorId) {
      let isUnique = false;
      let attempts = 0;
      let generatedId;
      
      while (!isUnique && attempts < 5) {
        const emailWithAttempt = attempts === 0 ? this.email : `${this.email}+${attempts}`;
        generatedId = generateDoctorId(this.name, emailWithAttempt);
        const existingDoctor = await mongoose.model('Doctor').findOne({ doctorId: generatedId });
        if (!existingDoctor) {
          isUnique = true;
          this.doctorId = generatedId;
        }
        attempts++;
      }
      
      if (!isUnique) {
        const timestamp = Date.now().toString().slice(-4);
        const initials = this.name ? this.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,3) : 'DOC';
        this.doctorId = `DOC-${timestamp}-${initials}`;
      }
    }
    console.log('✅ Doctor ID generated:', this.doctorId);
  } catch (error) {
    console.error('❌ Error in pre-save middleware:', error);
    throw error; // Throwing error will stop the save process
  }
});

doctorSchema.statics.isEmailTaken = async function(email, excludeDoctorId) {
  const doctor = await this.findOne({ email: email.toLowerCase(), _id: { $ne: excludeDoctorId } });
  return !!doctor;
};

doctorSchema.statics.isLicenseTaken = async function(license, excludeDoctorId) {
  const doctor = await this.findOne({ license: license, _id: { $ne: excludeDoctorId } });
  return !!doctor;
};

doctorSchema.virtual('formattedDoctorId').get(function() {
  return this.doctorId || generateDoctorId(this.name, this.email);
});

doctorSchema.methods.toJSON = function() {
  const doctor = this.toObject();
  delete doctor.password;
  delete doctor.__v;
  return doctor;
};

// Indexes
doctorSchema.index({ email: 1 }, { unique: true });
doctorSchema.index({ doctorId: 1 }, { unique: true, sparse: true });
doctorSchema.index({ license: 1 }, { unique: true, sparse: true });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ status: 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;