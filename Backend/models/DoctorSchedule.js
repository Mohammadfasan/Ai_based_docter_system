import mongoose from 'mongoose';

const doctorScheduleSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    required: true,
    index: true,
    ref: 'Doctor'
  },
  slots: [{
    id: {
      type: Number,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['clinic', 'video'],
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
    status: {
      type: String,
      enum: ['available', 'booked','pending'],
      default: 'available'
    },
    bookedBy: {
      type: String,
      default: null
    },
    bookedAt: {
      type: Date,
      default: null
    },
    fee: {
      type: Number,
      required: true
    },
    doctorName: String,
    doctorEmail: String,
    specialization: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
doctorScheduleSchema.index({ doctorId: 1, 'slots.date': 1 });
doctorScheduleSchema.index({ 'slots.status': 1 });

const DoctorSchedule = mongoose.model('DoctorSchedule', doctorScheduleSchema);

export default DoctorSchedule;