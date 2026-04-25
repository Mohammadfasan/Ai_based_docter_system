// controllers/userController.js
import User from '../models/User.js';

// Get all patients (for doctors and admins only)
export const getAllPatients = async (req, res) => {
  try {
    // Only doctors and admins can access patient list
    if (req.user.userType !== 'doctor' && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors and admins can view patient list.'
      });
    }

    const patients = await User.find({ userType: 'patient' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    // Calculate stats
    const totalPatients = patients.length;
    const activePatients = patients.filter(p => p.status === 'active').length;
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const newThisMonth = patients.filter(p => new Date(p.createdAt) >= firstDayOfMonth).length;
    const maleCount = patients.filter(p => p.gender === 'Male').length;
    const femaleCount = patients.filter(p => p.gender === 'Female').length;
    
    const ages = patients.map(p => p.age).filter(a => a);
    const avgAge = ages.length > 0 
      ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) 
      : 0;
    
    const bloodGroups = {};
    patients.forEach(p => {
      if (p.bloodGroup) {
        bloodGroups[p.bloodGroup] = (bloodGroups[p.bloodGroup] || 0) + 1;
      }
    });
    let commonBloodGroup = 'O+';
    let maxCount = 0;
    Object.entries(bloodGroups).forEach(([group, count]) => {
      if (count > maxCount) {
        maxCount = count;
        commonBloodGroup = group;
      }
    });
    
    res.json({
      success: true,
      count: patients.length,
      data: patients,
      stats: {
        totalPatients,
        activePatients,
        newThisMonth,
        maleCount,
        femaleCount,
        avgAge,
        commonBloodGroup,
        emergencyContacts: patients.filter(p => p.emergencyContact).length
      }
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patients',
      error: error.message
    });
  }
};

// Get all patients list for admin (full access - no restrictions)
export const getAllPatientsList = async (req, res) => {
  try {
    // Only admins can access full patient list
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can view complete patient list.'
      });
    }

    const patients = await User.find({ userType: 'patient' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    console.error('Error fetching patients list:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patients list',
      error: error.message
    });
  }
};

// Get patient by ID
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    // Authorization check
    if (req.user.userType !== 'doctor' && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    const patient = await User.findById(id).select('-password');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient',
      error: error.message
    });
  }
};

// Update patient status (block/unblock)
export const updatePatientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Only admins can update patient status
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can update patient status.'
      });
    }
    
    const patient = await User.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    ).select('-password');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    res.json({
      success: true,
      message: `Patient ${status === 'active' ? 'activated' : 'blocked'} successfully`,
      data: patient
    });
  } catch (error) {
    console.error('Error updating patient status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating patient status',
      error: error.message
    });
  }
};

// Delete patient
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only admins can delete patients
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can delete patients.'
      });
    }
    
    const patient = await User.findByIdAndDelete(id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting patient',
      error: error.message
    });
  }
};

// ============= PROFILE ROUTES =============

// Get user profile by userId
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('🔍 Fetching profile for userId:', userId);
    
    // Check authorization - users can only view their own profile unless admin
    if (req.user.userId !== userId && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own profile.'
      });
    }
    
    // Find user by userId field
    const user = await User.findOne({ userId: userId }).select('-password');
    
    if (!user) {
      const userById = await User.findById(userId).select('-password');
      if (userById) {
        return res.json({
          success: true,
          data: userById
        });
      }
      
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    console.log('📝 Updating profile for userId:', userId);
    
    // Check authorization
    if (req.user.userId !== userId && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own profile.'
      });
    }
    
    // Remove sensitive fields
    delete updates.password;
    delete updates.userId;
    delete updates.email;
    delete updates.userType;
    delete updates._id;
    delete updates.__v;
    delete updates.createdAt;
    
    updates.updatedAt = new Date();
    
    let user = await User.findOneAndUpdate(
      { userId: userId },
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: error.message
    });
  }
};

// Get current user profile (from token)
export const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};