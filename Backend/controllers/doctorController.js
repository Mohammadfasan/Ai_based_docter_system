import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Generate User ID helper function
const generateUserId = (userType, name, email) => {
  const emailHash = email.toLowerCase().split('').reduce((acc, char, index) => {
    return acc + char.charCodeAt(0) * (index + 1);
  }, 0);
  
  const hashString = Math.abs(emailHash).toString(36).slice(-4).toUpperCase();
  
  const getInitials = (fullName) => {
    if (!fullName || fullName.trim() === '') {
      return userType === 'doctor' ? 'DOC' : userType === 'patient' ? 'PAT' : 'ADM';
    }
    return fullName
      .split(' ')
      .map(n => n.charAt(0).toUpperCase())
      .join('')
      .slice(0, 3);
  };
  
  const prefix = userType === 'patient' ? 'PAT' : 
                 userType === 'doctor' ? 'DOC' : 
                 'ADM';
  
  const initials = getInitials(name);
  
  return `${prefix}-${hashString}-${initials}`;
};

// GET all doctors
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

// GET doctors with pagination and search
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

    const shouldIncludeStats = page === 1 && !search;
    
    const promises = [
      Doctor.countDocuments(query),
      Doctor.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ];

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
      promises.push(Promise.resolve([]));
    }

    const [total, doctors, statsResult] = await Promise.all(promises);

    const stats = statsResult && statsResult[0] ? {
      avgRating: statsResult[0].avgRating || 0,
      activeDoctors: statsResult[0].active || 0,
      videoAvailable: statsResult[0].videoAvailable || 0
    } : {};

    res.json({
      success: true,
      doctors: doctors,
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
      stats: shouldIncludeStats ? stats : {}
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

// GET doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      $or: [
        { doctorId: req.params.id },
        { _id: req.params.id }
      ]
    }).lean();
    
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

// CREATE new doctor
export const createDoctor = async (req, res) => {
  try {
    console.log('📝 Creating new doctor:', req.body.name);
    
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
    
    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }
    
    // Check for existing records
    const [emailExists, licenseExists, userExists] = await Promise.all([
      Doctor.findOne({ email: req.body.email.toLowerCase() }).lean(),
      req.body.license ? Doctor.findOne({ license: req.body.license }).lean() : Promise.resolve(null),
      User.findOne({ email: req.body.email.toLowerCase() }).lean()
    ]);
    
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered as a doctor'
      });
    }
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered as a user'
      });
    }
    
    if (licenseExists) {
      return res.status(400).json({
        success: false,
        message: 'License number already exists'
      });
    }
    
    // Use default password
    const plainPassword = 'doctor123';
    
    // Hash password for User record
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    // Prepare doctor data
    const doctorData = {
      name: req.body.name.trim(),
      email: req.body.email.toLowerCase().trim(),
      password: plainPassword, // Store plain password in Doctor model
      phone: req.body.phone.trim(),
      specialization: req.body.specialization,
      qualifications: req.body.qualifications.trim(),
      experience: req.body.experience,
      license: req.body.license.trim(),
      hospital: req.body.hospital.trim(),
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
    
    // Create doctor
    const doctor = new Doctor(doctorData);
    await doctor.save();
    
    console.log(`✅ New doctor created with ID: ${doctor.doctorId}`);
    
    // Create User record for authentication with hashed password
    const userData = {
      name: doctor.name,
      email: doctor.email,
      password: hashedPassword, // Store hashed password here
      userId: doctor.doctorId,
      userType: 'doctor',
      phone: doctor.phone,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const newUser = new User(userData);
    await newUser.save();
    
    console.log(`✅ User record created for doctor with ID: ${newUser.userId}`);
    
    // Remove password from response
    const doctorResponse = doctor.toObject();
    delete doctorResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      doctorId: doctor.doctorId,
      doctor: doctorResponse,
      loginCredentials: {
        email: doctor.email,
        password: plainPassword,
        userId: doctor.doctorId
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating doctor:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let message = 'Duplicate field error';
      if (field === 'email') message = 'Email already exists';
      if (field === 'license') message = 'License number already exists';
      
      return res.status(400).json({
        success: false,
        message: message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating doctor',
      error: error.message
    });
  }
};

// UPDATE doctor
export const updateDoctor = async (req, res) => {
  try {
    console.log('📝 Updating doctor:', req.params.id);
    
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
    let emailChanged = false;
    if (req.body.email && req.body.email.toLowerCase() !== doctor.email) {
      const emailExists = await Doctor.findOne({ 
        email: req.body.email.toLowerCase(),
        _id: { $ne: doctor._id }
      }).lean();
      
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already taken by another doctor'
        });
      }
      emailChanged = true;
    }
    
    // Check license uniqueness if being updated
    if (req.body.license && req.body.license !== doctor.license) {
      const licenseExists = await Doctor.findOne({ 
        license: req.body.license,
        _id: { $ne: doctor._id }
      }).lean();
      
      if (licenseExists) {
        return res.status(400).json({
          success: false,
          message: 'License number already taken by another doctor'
        });
      }
    }
    
    // Update fields
    const updateableFields = [
      'name', 'email', 'phone', 'specialization', 'qualifications', 
      'experience', 'license', 'hospital', 'location', 'fees', 
      'consultationTime', 'availability', 'languages', 'isVideoAvailable',
      'isVerified', 'rating', 'reviewCount', 'status', 'image', 
      'aiSummary', 'nextAvailable', 'distance', 'avatarColor'
    ];
    
    updateableFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        if (field === 'email') {
          doctor[field] = req.body[field].toLowerCase().trim();
        } else if (field === 'languages' && Array.isArray(req.body[field])) {
          doctor[field] = req.body[field];
        } else if (typeof req.body[field] === 'string') {
          doctor[field] = req.body[field].trim();
        } else {
          doctor[field] = req.body[field];
        }
      }
    });
    
    await doctor.save();
    
    // Update User record
    let user = await User.findOne({ 
      $or: [
        { email: doctor.email },
        { userId: doctor.doctorId }
      ]
    });
    
    if (user) {
      user.name = doctor.name;
      user.phone = doctor.phone;
      if (emailChanged) {
        user.email = doctor.email;
      }
      user.status = doctor.status;
      user.updatedAt = new Date();
      await user.save();
      console.log('✅ User record updated');
    }
    
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
    res.status(500).json({
      success: false,
      message: 'Error updating doctor',
      error: error.message
    });
  }
};

// DELETE doctor
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
    
    // Delete User record
    await User.findOneAndDelete({ 
      $or: [
        { email: doctor.email },
        { userId: doctor.doctorId }
      ],
      userType: 'doctor'
    });
    
    console.log(`✅ Doctor deleted successfully: ${doctor.name}`);
    
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

// SEARCH doctors
export const searchDoctors = async (req, res) => {
  try {
    const searchQuery = req.query.q || '';
    
    const doctors = await Doctor.find({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { specialization: { $regex: searchQuery, $options: 'i' } },
        { hospital: { $regex: searchQuery, $options: 'i' } }
      ]
    }).lean();
    
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

// CHECK email exists
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
    
    const exists = await Doctor.findOne(query).select('_id email').lean();
    
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