import express from "express";
import cors from "cors";
import dotenv from "dotenv"; 
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import doctorRoutes from "./routes/doctors.js";
import doctorScheduleRoutes from "./routes/doctorScheduleRoutes.js";
import appointmentRoutes from "./routes/appoimentRouter.js";
import medicalRecordRoutes from "./routes/medicalRecords.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'doctors');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory:', uploadsDir);
}

// Increase payload limit for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB with better error handling
connectDB().catch(err => {
  console.error('❌ Failed to connect to MongoDB:', err.message);
  process.exit(1);
});

// ============================================
// ✅ ROOT ROUTE - Fixes "Route not found: GET /"
// ============================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🏥 AI-based Doctor System API',
    version: '1.0.0',
    status: 'online',
    serverTime: new Date().toISOString(),
    endpoints: {
      authentication: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        google: 'POST /api/auth/google',
        forgotPassword: 'POST /api/auth/forgot-password',
        verifyResetCode: 'POST /api/auth/verify-reset-code',
        resetPassword: 'POST /api/auth/reset-password'
      },
      doctors: {
        list: 'GET /api/doctors',
        paginated: 'GET /api/doctors/paginated',
        search: 'GET /api/doctors/search',
        details: 'GET /api/doctors/:id',
        create: 'POST /api/doctors',
        update: 'PUT /api/doctors/:id',
        delete: 'DELETE /api/doctors/:id'
      },
      appointments: {
        create: 'POST /api/appointments',
        myAppointments: 'GET /api/appointments/my-appointments',
        doctorAppointments: 'GET /api/appointments/doctor/:doctorId/appointments',
        availableSlots: 'GET /api/appointments/available-slots/:doctorId',
        confirm: 'PATCH /api/appointments/:id/confirm',
        reject: 'PATCH /api/appointments/:id/reject',
        complete: 'PATCH /api/appointments/:id/complete'
      },
      medicalRecords: {
        list: 'GET /api/medical-records',
        create: 'POST /api/medical-records',
        update: 'PUT /api/medical-records/:id',
        delete: 'DELETE /api/medical-records/:id'
      },
      prescriptions: {
        list: 'GET /api/prescriptions',
        create: 'POST /api/prescriptions',
        update: 'PUT /api/prescriptions/:id',
        delete: 'DELETE /api/prescriptions/:id'
      },
      users: {
        profile: 'GET /api/users/profile/me',
        patients: 'GET /api/users/patients',
        updateProfile: 'PUT /api/users/profile/:userId'
      },
      feedback: {
        list: 'GET /api/feedback',
        create: 'POST /api/feedback',
        delete: 'DELETE /api/feedback/:id'
      },
      doctorSchedule: {
        list: 'GET /api/doctor-schedule',
        create: 'POST /api/doctor-schedule',
        update: 'PUT /api/doctor-schedule/:id'
      },
      system: {
        health: 'GET /api/health',
        test: 'GET /api/test'
      }
    },
    documentation: 'Use /api/health to check server status',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
  });
});

// ============================================
// ✅ API Routes
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/doctor-schedule', doctorScheduleRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes);

// ============================================
// ✅ Test Route
// ============================================
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ✅ Health Check Route
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'healthy',
    mongodb: 'connected',
    uploads: fs.existsSync(uploadsDir),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ✅ 404 Handler for undefined routes
// ============================================
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false, 
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    availableEndpoints: {
      root: 'GET /',
      health: 'GET /api/health',
      test: 'GET /api/test',
      auth: 'POST /api/auth/login, POST /api/auth/signup',
      doctors: 'GET /api/doctors',
      appointments: 'GET /api/appointments/my-appointments'
    }
  });
});

// ============================================
// ✅ Global Error Handling Middleware
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate key error',
      field: Object.keys(err.keyPattern)[0]
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ============================================
// ✅ Start Server
// ============================================
app.listen(PORT, () => {
  console.log('\n✅ ==================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Root endpoint: http://localhost:${PORT}/`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`✅ Auth routes: http://localhost:${PORT}/api/auth`);
  console.log(`✅ Doctor routes: http://localhost:${PORT}/api/doctors`);
  console.log(`✅ Appointment routes: http://localhost:${PORT}/api/appointments`);
  console.log(`✅ Uploads folder: ${path.join(__dirname, 'uploads')}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('✅ ==================================\n');
});

// ============================================
// ✅ Graceful Shutdown
// ============================================
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  process.exit(0);
});