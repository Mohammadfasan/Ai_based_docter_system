import Feedback from '../models/Feedback.js';
import mongoose from 'mongoose';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

// @desc    Get all feedback for a specific doctor
// @route   GET /api/feedback/doctor/:doctorId
// @access  Private (Doctor only)
export const getDoctorFeedbacks = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { rating, dateRange, search, page = 1, limit = 20 } = req.query;

    console.log('🔍 getDoctorFeedbacks called:', {
      requestedDoctorId: doctorId,
      doctorIdType: typeof doctorId,
      doctorIdLength: doctorId?.length,
      userFromToken: {
        id: req.user.id,
        userId: req.user.userId,
        userType: req.user.userType,
        email: req.user.email
      }
    });

    // STRICT Authorization check - Doctor can only access their own feedback
    if (req.user.userType === 'doctor') {
      // Compare using the custom doctorId from token
      const isAuthorized = 
        req.user.userId === doctorId ||  // Compare custom doctorId
        req.user.id === doctorId;        // Fallback to _id
      
      if (!isAuthorized) {
        console.log('❌ Authorization failed:', {
          userTokenUserId: req.user.userId,
          userTokenId: req.user.id,
          requestedDoctorId: doctorId
        });
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized - You can only view your own feedback' 
        });
      }
    }

    // Find the doctor - FIRST try by custom doctorId field
    let doctor = null;
    let doctorObjectId = null;
    
    try {
      // Method 1: Try by custom doctorId field (most common for doctor routes)
      doctor = await Doctor.findOne({ doctorId: doctorId });
      if (doctor) {
        console.log('✅ Found doctor by doctorId field:', doctor.doctorId);
      }
      
      // Method 2: If doctorId looks like a MongoDB ObjectId, try by _id
      if (!doctor && mongoose.Types.ObjectId.isValid(doctorId)) {
        doctor = await Doctor.findById(doctorId);
        if (doctor) {
          console.log('✅ Found doctor by _id');
        }
      }
      
      // Method 3: Try by userId field
      if (!doctor) {
        doctor = await Doctor.findOne({ userId: doctorId });
        if (doctor) {
          console.log('✅ Found doctor by userId field');
        }
      }
      
      // Method 4: Try by email
      if (!doctor && doctorId.includes('@')) {
        doctor = await Doctor.findOne({ email: doctorId });
        if (doctor) {
          console.log('✅ Found doctor by email');
        }
      }
      
      // Method 5: Use the user's ID from token as fallback
      if (!doctor && req.user.userId) {
        doctor = await Doctor.findOne({ doctorId: req.user.userId });
        if (doctor) {
          console.log('✅ Found doctor using token userId:', req.user.userId);
        }
      }
      
      if (!doctor) {
        console.log('❌ Doctor not found for ID:', doctorId);
        console.log('💡 Tip: Use your custom doctorId from token:', req.user.userId);
        return res.status(404).json({ 
          success: false, 
          message: `Doctor not found. Please use your custom doctor ID: ${req.user.userId || doctorId}` 
        });
      }
      
      doctorObjectId = doctor._id;
      console.log('✅ Found doctor:', { 
        searchId: doctorId, 
        foundDoctorId: doctorObjectId,
        doctorName: doctor.name,
        customDoctorId: doctor.doctorId
      });
    } catch (err) {
      console.error('Error finding doctor:', err);
      return res.status(400).json({ 
        success: false, 
        message: 'Error finding doctor: ' + err.message 
      });
    }

    // Build query - ONLY for this specific doctor
    let query = { doctorId: doctorObjectId };

    // Apply rating filter
    if (rating && rating !== 'all') {
      query.rating = parseInt(rating);
    }

    // Apply date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch(dateRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    // Apply search filter
    if (search && search.trim()) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [feedbacks, total] = await Promise.all([
      Feedback.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Feedback.countDocuments(query)
    ]);

    console.log(`📊 Found ${total} feedbacks for doctor ${doctorObjectId}`);

    // Calculate stats
    const stats = await Feedback.aggregate([
      { $match: { doctorId: doctorObjectId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalFeedbacks: { $sum: 1 },
          positiveCount: { 
            $sum: { $cond: [{ $gte: ['$rating', 4] }, 1, 0] }
          },
          recentCount: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const statsData = stats[0] || {
      averageRating: 0,
      totalFeedbacks: 0,
      positiveCount: 0,
      recentCount: 0
    };

    res.json({
      success: true,
      feedbacks: feedbacks || [],
      stats: {
        averageRating: statsData.averageRating?.toFixed(1) || 0,
        totalFeedbacks: statsData.totalFeedbacks || 0,
        positivePercentage: statsData.totalFeedbacks > 0 
          ? ((statsData.positiveCount / statsData.totalFeedbacks) * 100).toFixed(0)
          : 0,
        recentFeedbacks: statsData.recentCount || 0
      },
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        totalItems: total || 0,
        itemsPerPage: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Private (Patient only)
export const createFeedback = async (req, res) => {
  try {
    const {
      doctorId,
      doctorName,
      rating,
      feedbackType,
      title,
      message,
      consultationType,
      anonymous,
      appointmentId
    } = req.body;

    // Validate required fields
    if (!doctorId || !rating || !feedbackType || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Validate that the doctor exists
    let doctorExists = await Doctor.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(doctorId) ? doctorId : null },
        { doctorId: doctorId },
        { userId: doctorId }
      ]
    });

    // If not found, try by email
    if (!doctorExists && doctorId.includes('@')) {
      doctorExists = await Doctor.findOne({ email: doctorId });
    }

    if (!doctorExists) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found. Please select a valid doctor.'
      });
    }

    const feedback = await Feedback.create({
      patientId: req.user.id,
      patientName: anonymous ? 'Anonymous' : req.user.name,
      doctorId: doctorExists._id,
      doctorName: doctorExists.name,
      rating: parseInt(rating),
      feedbackType,
      title: title || `${feedbackType.charAt(0).toUpperCase() + feedbackType.slice(1)} Feedback for Dr. ${doctorExists.name}`,
      message,
      consultationType: consultationType || 'Video Consultation',
      anonymous: anonymous || false,
      appointmentId: appointmentId || null
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Doctor responds to feedback
// @route   PUT /api/feedback/:id/respond
// @access  Private (Doctor only)
export const respondToFeedback = async (req, res) => {
  try {
    const { response } = req.body;
    
    if (!response || !response.trim()) {
      return res.status(400).json({ success: false, message: 'Response is required' });
    }

    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    // STRICT Authorization check
    if (req.user.userType === 'doctor') {
      // Get doctor's MongoDB _id using custom doctorId
      let doctor = await Doctor.findOne({
        $or: [
          { doctorId: req.user.userId },  // Use custom doctorId from token
          { _id: req.user.id },
          { email: req.user.email }
        ]
      });
      
      const doctorObjectId = doctor?._id || req.user.id;
      
      if (feedback.doctorId.toString() !== doctorObjectId.toString()) {
        console.log('❌ Response authorization failed:', {
          feedbackDoctorId: feedback.doctorId,
          doctorObjectId: doctorObjectId,
          userTokenId: req.user.id,
          userTokenUserId: req.user.userId
        });
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized - You can only respond to your own feedback' 
        });
      }
    }

    feedback.responded = true;
    feedback.response = response.trim();
    feedback.responseDate = new Date();
    
    await feedback.save();

    res.json({
      success: true,
      message: 'Response added successfully',
      feedback
    });
  } catch (error) {
    console.error('Error responding to feedback:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Mark feedback as resolved
// @route   PUT /api/feedback/:id/resolve
// @access  Private (Doctor only)
export const resolveFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    // STRICT Authorization check
    if (req.user.userType === 'doctor') {
      let doctor = await Doctor.findOne({
        $or: [
          { doctorId: req.user.userId },
          { _id: req.user.id },
          { email: req.user.email }
        ]
      });
      
      const doctorObjectId = doctor?._id || req.user.id;
      
      if (feedback.doctorId.toString() !== doctorObjectId.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized - You can only resolve your own feedback' 
        });
      }
    }

    feedback.resolved = true;
    await feedback.save();

    res.json({
      success: true,
      message: 'Feedback marked as resolved',
      feedback
    });
  } catch (error) {
    console.error('Error resolving feedback:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all feedback by current patient
// @route   GET /api/feedback/patient
// @access  Private (Patient only)
export const getPatientFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ patientId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      feedbacks
    });
  } catch (error) {
    console.error('Error fetching patient feedbacks:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single feedback by ID
// @route   GET /api/feedback/:id
// @access  Private
export const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    // Check authorization
    if (req.user.userType === 'patient' && feedback.patientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    if (req.user.userType === 'doctor') {
      let doctor = await Doctor.findOne({
        $or: [
          { doctorId: req.user.userId },
          { _id: req.user.id },
          { email: req.user.email }
        ]
      });
      
      const doctorObjectId = doctor?._id || req.user.id;
      
      if (feedback.doctorId.toString() !== doctorObjectId.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete feedback (Admin only)
// @route   DELETE /api/feedback/:id
// @access  Private (Admin only)
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    await feedback.deleteOne();

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get feedback statistics for dashboard
// @route   GET /api/feedback/stats/:doctorId
// @access  Private (Doctor only)
export const getFeedbackStats = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // STRICT Authorization check
    if (req.user.userType === 'doctor') {
      const isAuthorized = 
        req.user.userId === doctorId || 
        req.user.id === doctorId;
      
      if (!isAuthorized) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    // Find doctor's MongoDB _id
    let doctor = await Doctor.findOne({
      $or: [
        { doctorId: doctorId },
        { _id: mongoose.Types.ObjectId.isValid(doctorId) ? doctorId : null },
        { userId: doctorId }
      ]
    });
    
    if (!doctor && doctorId.includes('@')) {
      doctor = await Doctor.findOne({ email: doctorId });
    }
    
    const doctorObjectId = doctor?._id || (mongoose.Types.ObjectId.isValid(doctorId) ? new mongoose.Types.ObjectId(doctorId) : null);
    
    if (!doctorObjectId) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const stats = await Feedback.aggregate([
      { $match: { doctorId: doctorObjectId } },
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalFeedbacks: { $sum: 1 },
                respondedCount: { $sum: { $cond: ['$responded', 1, 0] } },
                resolvedCount: { $sum: { $cond: ['$resolved', 1, 0] } }
              }
            }
          ],
          byRating: [
            {
              $group: {
                _id: '$rating',
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          byType: [
            {
              $group: {
                _id: '$feedbackType',
                count: { $sum: 1 }
              }
            }
          ],
          monthly: [
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' }
                },
                count: { $sum: 1 },
                averageRating: { $avg: '$rating' }
              }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 6 }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get doctors that a patient has consulted
// @route   GET /api/feedback/my-doctors
// @access  Private (Patient only)
export const getMyDoctors = async (req, res) => {
  try {
    // Get unique doctor IDs from patient's feedback
    const feedbacks = await Feedback.find({ 
      patientId: req.user.id 
    }).distinct('doctorId');
    
    const doctors = await Doctor.find({
      _id: { $in: feedbacks }
    }).select('name specialization hospital rating image doctorId');
    
    res.json({
      success: true,
      doctors
    });
  } catch (error) {
    console.error('Error fetching patient doctors:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Debug endpoint to check doctor lookup
// @route   GET /api/feedback/debug/doctor/:doctorId
// @access  Private (Doctor only)
export const debugDoctorLookup = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const results = {
      searchId: doctorId,
      methods: {}
    };
    
    // Method 1: By doctorId field
    let doctor = await Doctor.findOne({ doctorId: doctorId });
    results.methods.byDoctorId = doctor ? { found: true, id: doctor._id, name: doctor.name } : { found: false };
    
    // Method 2: By _id
    if (mongoose.Types.ObjectId.isValid(doctorId)) {
      doctor = await Doctor.findById(doctorId);
      results.methods.byId = doctor ? { found: true, id: doctor._id, name: doctor.name } : { found: false };
    } else {
      results.methods.byId = { found: false, reason: 'Invalid ObjectId format' };
    }
    
    // Method 3: By userId
    doctor = await Doctor.findOne({ userId: doctorId });
    results.methods.byUserId = doctor ? { found: true, id: doctor._id, name: doctor.name } : { found: false };
    
    // Method 4: By email
    if (doctorId.includes('@')) {
      doctor = await Doctor.findOne({ email: doctorId });
      results.methods.byEmail = doctor ? { found: true, id: doctor._id, name: doctor.name } : { found: false };
    }
    
    // Get all doctors for reference
    const allDoctors = await Doctor.find({}, { _id: 1, doctorId: 1, userId: 1, name: 1, email: 1 });
    results.allDoctors = allDoctors;
    results.currentUser = {
      id: req.user.id,
      userId: req.user.userId,
      userType: req.user.userType,
      email: req.user.email
    };
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};