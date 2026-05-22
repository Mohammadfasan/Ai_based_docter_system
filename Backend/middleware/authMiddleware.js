import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify user is authenticated
export const protect = async (req, res, next) => {
  let token;

  try {
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login first.'
      });
    }

    // Verify token - use fallback secret if env not set
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // ✅ FIXED: Try multiple ways to find the user
    let user = null;
    
    // Try to find by _id (from token's 'id' field)
    if (decoded.id) {
      user = await User.findById(decoded.id).select('-password');
    }
    
    // If not found, try by userId field
    if (!user && decoded.userId) {
      user = await User.findOne({ userId: decoded.userId }).select('-password');
    }
    
    // If still not found, try by email
    if (!user && decoded.email) {
      user = await User.findOne({ email: decoded.email }).select('-password');
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please login again.'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Your account is inactive. Please contact support.'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Authorize based on user role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: `User role "${req.user.userType}" is not authorized to access this route. Required roles: ${roles.join(', ')}`
      });
    }
    next();
  };
};

// Middleware to check if user is a doctor
export const isDoctor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }
  
  if (req.user.userType !== 'doctor') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Doctor privileges required.'
    });
  }
  next();
};

// Middleware to check if user is a patient
export const isPatient = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }
  
  if (req.user.userType !== 'patient') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Patient privileges required.'
    });
  }
  next();
};

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }
  
  if (req.user.userType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Check if user is accessing their own data or has admin privileges
export const checkOwnership = (req, res, next) => {
  const userId = req.params.userId || req.params.id;
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }
  
  // Allow if user is admin or accessing their own data
  if (req.user.userType === 'admin' || req.user.userId === userId || req.user._id.toString() === userId) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own data.'
    });
  }
};