// auth.js - Complete file with password reset functionality
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Temporary storage for verification codes (use Redis in production)
const verificationCodes = new Map();

// Email configuration with correct Ethereal credentials
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'libbie.hodkiewicz@ethereal.email',
    pass: process.env.EMAIL_PASS || 'VGfDJJ99cbFGfj4CwWB'
  }
});

// Test email connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error);
    console.log('⚠️ Using development mode - codes will be shown in console');
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Generate 6-digit verification code
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

// ============= PASSWORD RESET ROUTES =============

/**
 * ROUTE 1: Forgot Password - Request reset code
 * POST /api/auth/forgot-password
 * Body: { email }
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    // Generate 6-digit verification code
    const code = generateVerificationCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store code temporarily
    verificationCodes.set(email.toLowerCase(), {
      code,
      expiresAt,
      userId: user._id,
      attempts: 0,
      verified: false
    });

    console.log(`🔐 Verification code for ${email}: ${code}`);

    // Send email with code
    try {
      const mailOptions = {
        from: `"HealthAI" <${process.env.EMAIL_USER || 'libbie.hodkiewicz@ethereal.email'}>`,
        to: email,
        subject: 'HealthAI - Password Reset Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4A90E2;">🏥 HealthAI</h1>
              <h2 style="color: #333;">Password Reset Request</h2>
            </div>
            
            <p>Hello ${user.name || 'User'},</p>
            
            <p>We received a request to reset your password. Use the verification code below:</p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px; margin: 20px 0;">
              <div style="font-size: 48px; font-weight: bold; letter-spacing: 10px; color: white;">${code}</div>
            </div>
            
            <p><strong>This code will expire in 10 minutes.</strong></p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>⏰ Requested:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p>If you didn't request this, please ignore this email or contact support.</p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            
            <p style="color: #666; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} HealthAI. All rights reserved.
            </p>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);
      
      // Get Ethereal preview URL
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('📧 Preview URL:', previewUrl);
      }

    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      // Continue anyway - we'll still return success with dev code
    }

    // Always return success with dev code in development
    return res.json({
      success: true,
      message: 'Verification code sent to your email',
      email: email,
      devCode: code,
      previewUrl: 'https://ethereal.email/messages'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending reset code. Please try again.'
    });
  }
});

/**
 * ROUTE 2: Verify Reset Code
 * POST /api/auth/verify-reset-code
 * Body: { email, code }
 */
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
        message: 'No verification code found. Please request again.'
      });
    }

    // Check attempts (prevent brute force)
    storedData.attempts += 1;
    verificationCodes.set(email.toLowerCase(), storedData);

    if (storedData.attempts > 5) {
      verificationCodes.delete(email.toLowerCase());
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new code.'
      });
    }

    // Check expiration
    if (Date.now() > storedData.expiresAt) {
      verificationCodes.delete(email.toLowerCase());
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request again.'
      });
    }

    // Verify code
    if (storedData.code !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Generate reset token (valid for 15 minutes)
    const resetToken = jwt.sign(
      { 
        userId: storedData.userId.toString(),
        email: email.toLowerCase()
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '15m' }
    );

    // Mark as verified
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

/**
 * ROUTE 3: Resend Verification Code
 * POST /api/auth/resend-code
 * Body: { email }
 */
router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const storedData = verificationCodes.get(email.toLowerCase());
    
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'Please request password reset first'
      });
    }

    // Generate new code
    const newCode = generateVerificationCode();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    // Update stored code
    verificationCodes.set(email.toLowerCase(), {
      ...storedData,
      code: newCode,
      expiresAt,
      attempts: 0,
      verified: false
    });

    console.log(`🔄 New verification code for ${email}: ${newCode}`);

    // Get user details for email
    const user = await User.findById(storedData.userId);

    // Send new code via email
    try {
      const mailOptions = {
        from: `"HealthAI" <${process.env.EMAIL_USER || 'libbie.hodkiewicz@ethereal.email'}>`,
        to: email,
        subject: 'HealthAI - New Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4A90E2;">New Verification Code</h2>
            <p>Hello ${user?.name || 'User'},</p>
            <p>Here's your new verification code:</p>
            <div style="background: #4A90E2; padding: 20px; text-align: center; border-radius: 5px;">
              <h1 style="color: white; letter-spacing: 5px;">${newCode}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Resend email failed:', emailError.message);
    }

    // In development, return the new code
    return res.json({
      success: true,
      message: 'New verification code sent',
      devCode: newCode
    });

  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending code'
    });
  }
});

/**
 * ROUTE 4: Reset Password
 * POST /api/auth/reset-password
 * Body: { token, newPassword }
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(400).json({
          success: false,
          message: 'Reset link has expired. Please request again.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    // Find user
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

    // Check if new password is same as old
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    user.updatedAt = new Date();
    await user.save();

    // Clear verification code
    verificationCodes.delete(user.email.toLowerCase());

    // Send confirmation email
    try {
      const mailOptions = {
        from: `"HealthAI" <${process.env.EMAIL_USER || 'libbie.hodkiewicz@ethereal.email'}>`,
        to: user.email,
        subject: 'HealthAI - Password Changed Successfully',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4A90E2;">Password Changed Successfully!</h2>
            <p>Hello ${user.name},</p>
            <p>Your HealthAI account password was successfully changed.</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Device:</strong> ${req.headers['user-agent'] || 'Unknown'}</p>
            </div>
            <p>If you didn't make this change, please contact support immediately.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.log('Confirmation email error:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
});

/**
 * ROUTE 5: Check if email exists (for validation)
 * POST /api/auth/check-email
 * Body: { email }
 */
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    res.json({
      exists: !!user,
      message: user ? 'Email found' : 'Email not found'
    });
  } catch (error) {
    res.status(500).json({ exists: false, message: 'Error checking email' });
  }
});

// ============= REGULAR AUTH ROUTES =============

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
        status: 'active'
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
      isGoogleUser: false
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

    const user = await User.findOne({ 
      email: email.toLowerCase(),
      userType: userType 
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive. Please contact administrator.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);
    const userResponse = user.toObject();
    delete userResponse.password;

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

export default router