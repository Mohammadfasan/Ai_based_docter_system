import Doctor from "../models/Doctor.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// ✅ GET all doctors
// ============================================
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      count: doctors.length,
      doctors: doctors
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: error.message
    });
  }
};

// ============================================
// ✅ GET doctors with pagination and search - OPTIMIZED VERSION
// ============================================
export const getPaginatedDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { specialization: { $regex: search, $options: 'i' } },
          { hospital: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // 🚀 IMPROVEMENT: Run queries in parallel for better performance
    // Only run heavy stats if it's the first page AND no search (dashboard view)
    const shouldIncludeStats = page === 1 && !search;
    
    const promises = [
      Doctor.countDocuments(query), // Total count
      Doctor.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean() // 🚀 lean() makes queries 3x faster by returning POJOs instead of Mongoose Docs
    ];

    // Only add stats query when needed (first page, no search)
    if (shouldIncludeStats) {
      promises.push(
        Doctor.aggregate([
          { 
            $group: { 
              _id: null, 
              avgRating: { $avg: '$rating' },
              active: { 
                $sum: { 
                  $cond: [{ $eq: ["$status", "active"] }, 1, 0] 
                } 
              },
              videoAvailable: {
                $sum: {
                  $cond: [{ $eq: ["$isVideoAvailable", true] }, 1, 0]
                }
              }
            }
          }
        ])
      );
    } else {
      // If stats not needed, add empty promise that resolves quickly
      promises.push(Promise.resolve([]));
    }

    // Execute all promises in parallel
    const [total, doctors, statsResult] = await Promise.all(promises);

    // Format stats if available
    const stats = statsResult && statsResult[0] ? {
      avgRating: statsResult[0].avgRating || 0,
      activeDoctors: statsResult[0].active || 0,
      videoAvailable: statsResult[0].videoAvailable || 0
    } : {};

    res.json({
      success: true,
      doctors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: shouldIncludeStats ? stats : {} // Only return stats when requested
    });
    
  } catch (error) {
    console.error('Error in paginated doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: error.message
    });
  }
};

// ============================================
// ✅ GET doctor by ID - OPTIMIZED with lean()
// ============================================
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      $or: [
        { doctorId: req.params.id },
        { _id: req.params.id }
      ]
    }).lean(); // 🚀 Added lean() for better performance
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    res.json({
      success: true,
      doctor: doctor
    });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor',
      error: error.message
    });
  }
};

// ============================================
// ✅ CREATE new doctor - NO PASSWORD HASHING (PLAIN TEXT)
// ============================================
export const createDoctor = async (req, res) => {
  try {
    console.log('📝 Creating new doctor:', req.body.name);
    console.log('📦 Received data:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'specialization', 'qualifications', 'experience', 'license', 'hospital', 'fees'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }
    
    // 🚀 IMPROVEMENT: Run email and license checks in parallel
    const [emailExists, licenseExists] = await Promise.all([
      Doctor.findOne({ email: req.body.email.toLowerCase() }).lean(),
      req.body.license ? Doctor.findOne({ license: req.body.license }).lean() : Promise.resolve(null)
    ]);
    
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please use a different email.'
      });
    }
    
    if (licenseExists) {
      return res.status(400).json({
        success: false,
        message: 'License number already exists. Please check and try again.'
      });
    }
    
    // ⚠️ IMPORTANT: NO PASSWORD HASHING - Plain text save pannu
    const plainPassword = req.body.password || 'doctor123';
    
    // Prepare doctor data
    const doctorData = {
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      password: plainPassword,  // 🔴 PLAIN TEXT PASSWORD - NO HASH
      phone: req.body.phone,
      specialization: req.body.specialization,
      qualifications: req.body.qualifications,
      experience: req.body.experience,
      license: req.body.license,
      hospital: req.body.hospital,
      location: req.body.location || 'Colombo',
      fees: req.body.fees,
      consultationTime: req.body.consultationTime || '30 mins',
      availability: req.body.availability || 'Mon-Fri: 9AM-6PM',
      languages: req.body.languages || ['English', 'Sinhala'],
      isVideoAvailable: req.body.isVideoAvailable ?? true,
      isVerified: req.body.isVerified ?? true,
      rating: req.body.rating || 4.5,
      reviewCount: req.body.reviewCount || 0,
      status: req.body.status || 'active',
      image: req.body.image || '',
      aiSummary: req.body.aiSummary || '',
      nextAvailable: req.body.nextAvailable || 'Today',
      distance: req.body.distance || '2.5 km',
      avatarColor: req.body.avatarColor || 'from-teal-500 to-teal-600'
    };
    
    console.log('📦 Saving doctor data...');
    console.log('🔐 Password (plain text):', plainPassword);
    
    // Create doctor
    const doctor = new Doctor(doctorData);
    await doctor.save();
    
    console.log(`✅ New doctor created with ID: ${doctor.doctorId}`);
    console.log(`✅ Doctor saved in database with _id: ${doctor._id}`);
    
    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      doctorId: doctor.doctorId,
      doctor: doctor
    });
    
  } catch (error) {
    console.error('❌ Error creating doctor:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let message = 'Duplicate field error';
      
      if (field === 'email') message = 'Email already exists';
      if (field === 'license') message = 'License number already exists';
      if (field === 'doctorId') message = 'Error generating unique ID. Please try again.';
      
      return res.status(400).json({
        success: false,
        message: message
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating doctor',
      error: error.message
    });
  }
};

// ============================================
// ✅ UPDATE doctor - ENHANCED VERSION
// ============================================
export const updateDoctor = async (req, res) => {
  try {
    console.log('📝 Updating doctor:', req.params.id);
    console.log('📦 Update data:', JSON.stringify(req.body, null, 2));
    
    // Find the doctor first
    const doctor = await Doctor.findOne({
      $or: [
        { _id: req.params.id },
        { doctorId: req.params.id }
      ]
    });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    console.log('✅ Found doctor:', doctor.name, doctor.email);
    
    // 🚀 IMPROVEMENT: Run email and license checks in parallel if needed
    const checks = [];
    
    // Check email uniqueness if being updated
    if (req.body.email && req.body.email.toLowerCase() !== doctor.email) {
      checks.push(
        Doctor.findOne({ 
          email: req.body.email.toLowerCase(),
          _id: { $ne: doctor._id }
        }).lean()
      );
    } else {
      checks.push(Promise.resolve(null));
    }
    
    // Check license uniqueness if being updated
    if (req.body.license && req.body.license !== doctor.license) {
      checks.push(
        Doctor.findOne({ 
          license: req.body.license,
          _id: { $ne: doctor._id }
        }).lean()
      );
    } else {
      checks.push(Promise.resolve(null));
    }
    
    const [emailExists, licenseExists] = await Promise.all(checks);
    
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already taken by another doctor',
        field: 'email'
      });
    }
    
    if (licenseExists) {
      return res.status(400).json({
        success: false,
        message: 'License number already taken by another doctor',
        field: 'license'
      });
    }
    
    // Update fields (including password if provided - plain text)
    const updateableFields = [
      'name', 'email', 'phone', 'specialization', 'qualifications', 
      'experience', 'license', 'hospital', 'location', 'fees', 
      'consultationTime', 'availability', 'languages', 'isVideoAvailable',
      'isVerified', 'rating', 'reviewCount', 'status', 'image', 
      'aiSummary', 'nextAvailable', 'distance', 'avatarColor'
    ];
    
    updateableFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        // Special handling for email to ensure lowercase
        if (field === 'email') {
          doctor[field] = req.body[field].toLowerCase();
        } 
        // Handle password separately
        else if (field === 'password') {
          // Only update password if provided and not empty
          if (req.body.password && req.body.password.trim() !== '') {
            doctor[field] = req.body.password;
            console.log('🔐 Password updated (plain text)');
          }
        }
        else {
          doctor[field] = req.body[field];
        }
      }
    });
    
    // Handle password separately if it's in the request body
    if (req.body.password && req.body.password.trim() !== '') {
      doctor.password = req.body.password;
      console.log('🔐 Password updated (plain text)');
    }
    
    console.log('💾 Saving updated doctor...');
    await doctor.save();
    
    console.log(`✅ Doctor updated successfully: ${doctor.doctorId}`);
    
    // Remove password from response
    const doctorResponse = doctor.toObject();
    delete doctorResponse.password;
    
    res.json({
      success: true,
      message: 'Doctor updated successfully',
      doctorId: doctor.doctorId,
      doctor: doctorResponse
    });
    
  } catch (error) {
    console.error('❌ Error updating doctor:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let message = 'Duplicate field error';
      
      if (field === 'email') message = 'Email already taken by another doctor';
      if (field === 'license') message = 'License number already taken by another doctor';
      if (field === 'doctorId') message = 'Error generating unique ID. Please try again.';
      
      return res.status(400).json({
        success: false,
        message: message,
        field: field
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating doctor',
      error: error.message
    });
  }
};

// ============================================
// ✅ DELETE doctor
// ============================================
export const deleteDoctor = async (req, res) => {
  try {
    console.log('🗑️ Deleting doctor:', req.params.id);
    
    const doctor = await Doctor.findOneAndDelete({
      $or: [
        { _id: req.params.id },
        { doctorId: req.params.id }
      ]
    });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    console.log(`✅ Doctor deleted successfully: ${doctor.name} (${doctor.doctorId})`);
    
    res.json({
      success: true,
      message: 'Doctor deleted successfully',
      doctorId: doctor.doctorId,
      doctorName: doctor.name
    });
  } catch (error) {
    console.error('❌ Error deleting doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting doctor',
      error: error.message
    });
  }
};

// ============================================
// ✅ SEARCH doctors - OPTIMIZED with lean()
// ============================================
export const searchDoctors = async (req, res) => {
  try {
    const searchQuery = req.query.q || '';
    
    const doctors = await Doctor.find({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { specialization: { $regex: searchQuery, $options: 'i' } },
        { hospital: { $regex: searchQuery, $options: 'i' } },
        { doctorId: { $regex: searchQuery, $options: 'i' } }
      ]
    }).lean(); // 🚀 Added lean() for better performance
    
    res.json({
      success: true,
      count: doctors.length,
      doctors: doctors
    });
  } catch (error) {
    console.error('Error searching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching doctors',
      error: error.message
    });
  }
};

// ============================================
// ✅ CHECK if email exists - OPTIMIZED with lean()
// ============================================
export const checkEmail = async (req, res) => {
  try {
    const { email, excludeId } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    const query = { email: email.toLowerCase() };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const exists = await Doctor.findOne(query).select('_id email').lean(); // 🚀 Added lean() and select only needed fields
    
    res.json({
      success: true,
      exists: !!exists,
      message: exists ? 'Email already taken' : 'Email is available'
    });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking email',
      error: error.message
    });
  }
};

// ============================================
// ✅ GET doctors statistics
// ============================================
export const getDoctorStats = async (req, res) => {
  try {
    const stats = await Doctor.aggregate([
      {
        $group: {
          _id: null,
          totalDoctors: { $sum: 1 },
          activeDoctors: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
          },
          videoAvailable: {
            $sum: { $cond: [{ $eq: ["$isVideoAvailable", true] }, 1, 0] }
          },
          verifiedDoctors: {
            $sum: { $cond: [{ $eq: ["$isVerified", true] }, 1, 0] }
          },
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: "$reviewCount" }
        }
      }
    ]);
    
    const specializationStats = await Doctor.aggregate([
      {
        $group: {
          _id: "$specialization",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalDoctors: 0,
          activeDoctors: 0,
          videoAvailable: 0,
          verifiedDoctors: 0,
          avgRating: 0,
          totalReviews: 0
        },
        bySpecialization: specializationStats
      }
    });
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor statistics',
      error: error.message
    });
  }
};

// ============================================
// ✅ BULK DELETE doctors
// ============================================
export const bulkDeleteDoctors = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of doctor IDs to delete'
      });
    }
    
    const result = await Doctor.deleteMany({
      $or: [
        { _id: { $in: ids } },
        { doctorId: { $in: ids } }
      ]
    });
    
    console.log(`🗑️ Bulk deleted ${result.deletedCount} doctors`);
    
    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} doctors`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing bulk delete',
      error: error.message
    });
  }
};

// ============================================
// ✅ TOGGLE doctor status
// ============================================
export const toggleDoctorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['active', 'inactive', 'busy'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status (active, inactive, busy)'
      });
    }
    
    const doctor = await Doctor.findOneAndUpdate(
      {
        $or: [
          { _id: id },
          { doctorId: id }
        ]
      },
      { status },
      { new: true }
    ).lean();
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    console.log(`🔄 Doctor status updated: ${doctor.name} -> ${status}`);
    
    res.json({
      success: true,
      message: `Doctor status updated to ${status}`,
      doctor: doctor
    });
  } catch (error) {
    console.error('Error toggling doctor status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating doctor status',
      error: error.message
    });
  }
};