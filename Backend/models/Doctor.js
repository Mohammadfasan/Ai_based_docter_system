import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    unique: true,
    sparse: true // Allows nulls to exist without clashing, though we generate IDs
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
    minlength: 6
  },
  avatarColor: { type: String, default: 'from-teal-500 to-teal-600' },
  nextAvailable: { type: String, default: 'Today' },
  distance: { type: String, default: '2.5 km' }
}, {
  timestamps: true
});

// Generate doctor ID helper function
function generateDoctorId(name, email) {
  if (!name) return 'DOC-0000-XXX';
  const getInitials = (fullName) => fullName.split(' ').map(n => n.charAt(0).toUpperCase()).join('').slice(0, 3).padEnd(3, 'X');
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

// ✅ FIXED: Removed next parameter and next() calls for async middleware
doctorSchema.pre('save', async function() {
  try {
    console.log('📝 Pre-save middleware running for:', this.name);
    if (!this.doctorId) {
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 5) {
        const generatedId = generateDoctorId(this.name, attempts === 0 ? this.email : `${this.email}${attempts}`);
        const existing = await mongoose.model('Doctor').findOne({ doctorId: generatedId }).select('_id');
        if (!existing) {
          isUnique = true;
          this.doctorId = generatedId;
        }
        attempts++;
      }
    }
    console.log('✅ Doctor ID ready:', this.doctorId);
  } catch (error) {
    console.error('❌ Pre-save error:', error);
    throw error;
  }
});

// Indexes
doctorSchema.index({ email: 1 }, { unique: true });
doctorSchema.index({ doctorId: 1 }, { unique: true, sparse: true });
doctorSchema.index({ license: 1 }, { unique: true, sparse: true });

const Doctor = mongoose.model('Doctor', doctorSchema);

// Temporary cleanup for your specific "id_1" error
Doctor.collection.dropIndex('id_1').catch(() => {});

export default Doctor;