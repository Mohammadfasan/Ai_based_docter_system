import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  feedbackType: {
    type: String,
    enum: ['general', 'suggestion', 'bug', 'compliment', 'technical'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  consultationType: {
    type: String,
    enum: ['Video Consultation', 'Clinic Visit', 'Follow-up', 'Emergency', 'Prescription Renewal'],
    default: 'Video Consultation'
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  responded: {
    type: Boolean,
    default: false
  },
  response: {
    type: String,
    default: null
  },
  responseDate: {
    type: Date,
    default: null
  },
  resolved: {
    type: Boolean,
    default: false
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }
}, {
  timestamps: true
});

// Index for efficient queries
feedbackSchema.index({ doctorId: 1, createdAt: -1 });
feedbackSchema.index({ patientId: 1, createdAt: -1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ feedbackType: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;