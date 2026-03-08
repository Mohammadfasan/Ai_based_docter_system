import express from "express";
import Doctor from "../models/Doctor.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'doctors');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created uploads directory:', uploadDir);
}

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'doctor-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// ============================================
// ✅ GET all doctors
// ============================================
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
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
});

// ============================================
// ✅ GET doctors with pagination and search
// ============================================
router.get('/paginated', async (req, res) => {
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
    
    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const activeCount = await Doctor.countDocuments({ status: 'active' });
    const videoCount = await Doctor.countDocuments({ isVideoAvailable: true });
    const avgRatingResult = await Doctor.aggregate([
      { $match: { rating: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    
    res.json({
      success: true,
      doctors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: {
        active: activeCount,
        videoAvailable: videoCount,
        avgRating: avgRatingResult[0]?.avgRating || 0
      }
    });
  } catch (error) {
    console.error('Error in paginated doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: error.message
    });
  }
});

// ============================================
// ✅ GET doctor by ID
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      $or: [
        { doctorId: req.params.id },
        { _id: req.params.id }
      ]
    });
    
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
});

// ============================================
// ✅ CREATE new doctor - NO PASSWORD HASHING (PLAIN TEXT)
// ============================================
router.post('/', async (req, res) => {
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
    
    // Check if email already exists
    const emailExists = await Doctor.findOne({ email: req.body.email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please use a different email.'
      });
    }
    
    // Check if license already exists
    if (req.body.license) {
      const licenseExists = await Doctor.findOne({ license: req.body.license });
      if (licenseExists) {
        return res.status(400).json({
          success: false,
          message: 'License number already exists. Please check and try again.'
        });
      }
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
    console.log('🔐 Password (plain text):', plainPassword); // Check panna
    
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
});

// ============================================
// ✅ UPDATE doctor - NO PASSWORD HASHING
// ============================================
router.put('/:id', async (req, res) => {
  try {
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
    
    // Check email uniqueness if being updated
    if (req.body.email && req.body.email.toLowerCase() !== doctor.email) {
      const emailExists = await Doctor.findOne({ 
        email: req.body.email.toLowerCase(),
        _id: { $ne: doctor._id }
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already taken by another doctor'
        });
      }
    }
    
    // Check license uniqueness if being updated
    if (req.body.license && req.body.license !== doctor.license) {
      const licenseExists = await Doctor.findOne({ 
        license: req.body.license,
        _id: { $ne: doctor._id }
      });
      if (licenseExists) {
        return res.status(400).json({
          success: false,
          message: 'License number already taken by another doctor'
        });
      }
    }
    
    // Update fields (including password - plain text)
    Object.keys(req.body).forEach(key => {
      if (key !== 'doctorId' && key !== '_id') {
        doctor[key] = req.body[key];
      }
    });
    
    await doctor.save();
    
    res.json({
      success: true,
      message: 'Doctor updated successfully',
      doctor: doctor
    });
    
  } catch (error) {
    console.error('Error updating doctor:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate field error. Email or license already exists.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating doctor',
      error: error.message
    });
  }
});

// ============================================
// ✅ DELETE doctor
// ============================================
router.delete('/:id', async (req, res) => {
  try {
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
    
    res.json({
      success: true,
      message: 'Doctor deleted successfully',
      doctorId: doctor.doctorId
    });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting doctor',
      error: error.message
    });
  }
});

// ============================================
// ✅ UPLOAD doctor image
// ============================================
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }
    
    // Construct the image URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/doctors/${req.file.filename}`;
    
    console.log('✅ Image uploaded successfully:', imageUrl);
    console.log('📁 File details:', {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
});

// ============================================
// ✅ SEARCH doctors
// ============================================
router.get('/search', async (req, res) => {
  try {
    const searchQuery = req.query.q || '';
    
    const doctors = await Doctor.find({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { specialization: { $regex: searchQuery, $options: 'i' } },
        { hospital: { $regex: searchQuery, $options: 'i' } },
        { doctorId: { $regex: searchQuery, $options: 'i' } }
      ]
    });
    
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
});

// ============================================
// ✅ CHECK if email exists
// ============================================
router.post('/check-email', async (req, res) => {
  try {
    const { email, excludeId } = req.body;
    
    const query = { email: email.toLowerCase() };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const exists = await Doctor.findOne(query);
    
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
});

export default router;