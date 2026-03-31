import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Temporary storage for verification codes
const verificationCodes = new Map();

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'libbie.hodkiewicz@ethereal.email',
    pass: process.env.EMAIL_PASS || 'VGfDJJ99cbFGfj4CwWB'
  }
});

// Generate verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate User ID
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

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      userId: user.userId,
      email: user.email,
      userType: user.userType,
      name: user.name
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// DEBUG ROUTE - Check doctor user
router.get('/debug/check-doctor-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email: email.toLowerCase() });
    const doctor = await Doctor.findOne({ email: email.toLowerCase() });
    
    res.json({
      userExists: !!user,
      userData: user ? {
        id: user._id,
        email: user.email,
        userType: user.userType,
        userId: user.userId,
        status: user.status,
        createdAt: user.createdAt,
        passwordHash: user.password ? user.password.substring(0, 20) + '...' : null
      } : null,
      doctorExists: !!doctor,
      doctorData: doctor ? {
        id: doctor._id,
        email: doctor.email,
        doctorId: doctor.doctorId,
        status: doctor.status,
        name: doctor.name
      } : null
    });
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DEBUG ROUTE - Test doctor login
router.post('/debug/test-doctor-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔍 Debug - Testing login for:', email);
    
    // Find user
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      userType: 'doctor'
    });
    
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found',
        userExists: false
      });
    }
    
    // Test password comparison
    const isMatch = await bcrypt.compare(password, user.password);
    
    // Find doctor record
    const doctor = await Doctor.findOne({ email: email.toLowerCase() });
    
    res.json({
      success: true,
      userExists: true,
      doctorExists: !!doctor,
      passwordMatch: isMatch,
      userData: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        hashedPassword: user.password.substring(0, 20) + '...',
        status: user.status
      },
      doctorData: doctor ? {
        id: doctor._id,
        email: doctor.email,
        doctorId: doctor.doctorId,
        status: doctor.status
      } : null,
      message: isMatch ? '✅ Password matches! Login will work.' : '❌ Password does not match. Check the stored password.'
    });
    
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE DOCTOR USER (Fix existing doctors)
router.post('/create-doctor-user', async (req, res) => {
  try {
    const { email } = req.body;
    
    const doctor = await Doctor.findOne({ email: email.toLowerCase() });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    let user = await User.findOne({ email: doctor.email });
    
    const plainPassword = 'doctor123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    if (!user) {
      user = new User({
        name: doctor.name,
        email: doctor.email,
        password: hashedPassword,
        userId: doctor.doctorId,
        userType: 'doctor',
        phone: doctor.phone,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await user.save();
      return res.json({ 
        success: true, 
        message: 'User created successfully', 
        password: plainPassword,
        email: doctor.email
      });
    } else {
      user.password = hashedPassword;
      user.userType = 'doctor';
      user.userId = doctor.doctorId;
      await user.save();
      return res.json({ 
        success: true, 
        message: 'User password updated successfully', 
        password: plainPassword,
        email: doctor.email
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    const code = generateVerificationCode();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    verificationCodes.set(email.toLowerCase(), {
      code,
      expiresAt,
      userId: user._id,
      attempts: 0,
      verified: false
    });

    console.log(`🔐 Verification code for ${email}: ${code}`);

    try {
      const mailOptions = {
        from: `"HealthAI" <${process.env.EMAIL_USER || 'libbie.hodkiewicz@ethereal.email'}>`,
        to: email,
        subject: 'HealthAI - Password Reset Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4A90E2;">Password Reset Code</h2>
            <p>Hello ${user.name || 'User'},</p>
            <p>Your verification code is:</p>
            <div style="background: #4A90E2; padding: 20px; text-align: center; border-radius: 5px;">
              <h1 style="color: white; letter-spacing: 5px;">${code}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
    }

    return res.json({
      success: true,
      message: 'Verification code sent to your email',
      email: email,
      devCode: code
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending reset code'
    });
  }
});

// Verify Reset Code
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and code are required'
      });
    }

    const storedData = verificationCodes.get(email.toLowerCase());
    
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found'
      });
    }

    storedData.attempts += 1;
    verificationCodes.set(email.toLowerCase(), storedData);

    if (storedData.attempts > 5) {
      verificationCodes.delete(email.toLowerCase());
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts'
      });
    }

    if (Date.now() > storedData.expiresAt) {
      verificationCodes.delete(email.toLowerCase());
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired'
      });
    }

    if (storedData.code !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    const resetToken = jwt.sign(
      { 
        userId: storedData.userId.toString(),
        email: email.toLowerCase()
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '15m' }
    );

    storedData.verified = true;
    verificationCodes.set(email.toLowerCase(), storedData);

    res.json({
      success: true,
      message: 'Code verified successfully',
      token: resetToken
    });

  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying code'
    });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(400).json({
          success: false,
          message: 'Reset link has expired'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    const user = await User.findOne({ 
      _id: decoded.userId,
      email: decoded.email 
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.updatedAt = new Date();
    await user.save();

    verificationCodes.delete(user.email.toLowerCase());

    res.json({
      success: true,
      message: 'Password reset successful!'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
});

// Google Auth
router.post('/google', async (req, res) => {
  try {
    const { credential, userType } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      const userId = generateUserId(userType, name, email);
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = new User({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        userId,
        userType: userType || 'patient',
        phone: '',
        googleId,
        profilePicture: picture,
        isGoogleUser: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await user.save();
    }

    const token = generateToken(user);
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Google authentication failed'
    });
  }
});

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, userType, phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = generateUserId(userType, name, email);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      userId,
      userType,
      phone,
      status: 'active',
      isGoogleUser: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newUser.save();
    const token = generateToken(newUser);
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during signup' 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    console.log('🔐 Login attempt:', { email, userType });

    const user = await User.findOne({ 
      email: email.toLowerCase(),
      userType: userType 
    });

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    console.log('✅ User found:', { 
      email: user.email, 
      userType: user.userType,
      status: user.status
    });

    if (user.status !== 'active') {
      console.log('❌ User inactive');
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive. Please contact administrator.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔐 Password match:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    user.lastLogin = new Date();
    user.updatedAt = new Date();
    await user.save();

    const token = generateToken(user);
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('✅ Login successful:', user.email);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

export default router;