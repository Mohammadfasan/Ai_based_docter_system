import MedicalRecord from '../models/MedicalRecord.js';

// @desc    Get all medical records for a user
// @route   GET /api/medical-records/:userId
// @access  Private (add authentication later)
export const getMedicalRecords = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const records = await MedicalRecord.find({ userId })
      .sort({ uploadedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medical records',
      error: error.message
    });
  }
};

// @desc    Get single medical record by ID
// @route   GET /api/medical-records/record/:id
// @access  Private
export const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await MedicalRecord.findById(id).lean();
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Error fetching medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medical record',
      error: error.message
    });
  }
};

// @desc    Create a new medical record
// @route   POST /api/medical-records
// @access  Private
export const createMedicalRecord = async (req, res) => {
  try {
    const recordData = req.body;
    
    // Validate required fields
    if (!recordData.userId || !recordData.date || !recordData.type || !recordData.files?.length) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, date, type, and files are required'
      });
    }

    const newRecord = new MedicalRecord(recordData);
    const savedRecord = await newRecord.save();

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: savedRecord
    });
  } catch (error) {
    console.error('Error creating medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating medical record',
      error: error.message
    });
  }
};

// @desc    Update a medical record
// @route   PUT /api/medical-records/:id
// @access  Private
export const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Medical record updated successfully',
      data: updatedRecord
    });
  } catch (error) {
    console.error('Error updating medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating medical record',
      error: error.message
    });
  }
};

// @desc    Delete a medical record
// @route   DELETE /api/medical-records/:id
// @access  Private
export const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRecord = await MedicalRecord.findByIdAndDelete(id);
    
    if (!deletedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Medical record deleted successfully',
      data: { id: deletedRecord._id }
    });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting medical record',
      error: error.message
    });
  }
};

// @desc    Get medical records by type
// @route   GET /api/medical-records/:userId/type/:type
// @access  Private
export const getMedicalRecordsByType = async (req, res) => {
  try {
    const { userId, type } = req.params;
    
    const records = await MedicalRecord.find({ 
      userId, 
      type: { $regex: new RegExp(type, 'i') } 
    })
    .sort({ uploadedAt: -1 })
    .lean();

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Error fetching records by type:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching records by type',
      error: error.message
    });
  }
};

// @desc    Get medical records by date range
// @route   GET /api/medical-records/:userId/date-range
// @access  Private
export const getMedicalRecordsByDateRange = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    const query = { userId };
    
    if (startDate) {
      query.date = { $gte: startDate };
    }
    if (endDate) {
      query.date = { ...query.date, $lte: endDate };
    }
    
    const records = await MedicalRecord.find(query)
      .sort({ date: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Error fetching records by date range:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching records by date range',
      error: error.message
    });
  }
};

// @desc    Search medical records
// @route   GET /api/medical-records/:userId/search
// @access  Private
export const searchMedicalRecords = async (req, res) => {
  try {
    const { userId } = req.params;
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const records = await MedicalRecord.find({
      userId,
      $or: [
        { diagnosis: { $regex: q, $options: 'i' } },
        { doctor: { $regex: q, $options: 'i' } },
        { type: { $regex: q, $options: 'i' } },
        { notes: { $regex: q, $options: 'i' } }
      ]
    })
    .sort({ uploadedAt: -1 })
    .lean();

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Error searching medical records:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching medical records',
      error: error.message
    });
  }
};

// @desc    Get medical records statistics
// @route   GET /api/medical-records/:userId/stats
// @access  Private
export const getMedicalRecordsStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const stats = await MedicalRecord.aggregate([
      { $match: { userId } },
      { $group: {
        _id: '$type',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ]);
    
    const totalRecords = await MedicalRecord.countDocuments({ userId });
    
    res.status(200).json({
      success: true,
      data: {
        total: totalRecords,
        byType: stats
      }
    });
  } catch (error) {
    console.error('Error fetching medical records stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};