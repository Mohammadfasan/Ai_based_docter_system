import express from "express";
import cors from "cors";
import dotenv from "dotenv"; 
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import doctorRoutes from "./routes/doctors.js";
import doctorScheduleRoutes from "./routes/doctorScheduleRoutes.js";
import appointmentRoutes from "./routes/appoimentRouter.js";
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

// ============================================
// ✅ FIXED CORS CONFIGURATION FOR RENDER
// ============================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000', 
  'http://127.0.0.1:5173',
  'https://ai-based-docter-system-5.onrender.com',
  /\.onrender\.com$/,  // Allow all Render subdomains
  /\.vercel\.app$/,     // Allow Vercel (if you deploy frontend there)
  '*'  // TEMPORARY - Remove this after testing
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed === '*') return true;
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      // For now, allow anyway (remove in production)
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB with better error handling
connectDB().catch(err => {
  console.error('❌ Failed to connect to MongoDB:', err.message);
  process.exit(1);
});

// ============================================
// ✅ ROUTES - All properly configured
// ============================================

// Auth routes
app.use('/api/auth', authRoutes);

// Doctor routes
app.use('/api/doctors', doctorRoutes);

// Doctor schedule routes
app.use('/api/doctor-schedule', doctorScheduleRoutes);

// Appointment routes
app.use('/api/appointments', appointmentRoutes);

// ============================================
// ✅ TEST ROUTES - For debugging
// ============================================

// Root route - Welcome message
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AI Doctor System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      test: '/api/test',
      health: '/api/health',
      auth: '/api/auth',
      doctors: '/api/doctors',
      appointments: '/api/appointments',
      schedule: '/api/doctor-schedule'
    },
    available_auth_endpoints: {
      login: 'POST /api/auth/login',
      signup: 'POST /api/auth/signup',
      google: 'POST /api/auth/google',
      forgot_password: 'POST /api/auth/forgot-password',
      verify_code: 'POST /api/auth/verify-reset-code',
      reset_password: 'POST /api/auth/reset-password'
    }
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'healthy',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uploads: fs.existsSync(uploadsDir),
    timestamp: new Date().toISOString()
  });
});

// Debug route to list all registered API routes
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((layer) => {
    if (layer.route) {
      routes.push({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods)
      });
    } else if (layer.name === 'router' && layer.regexp) {
      const path = layer.regexp.source
        .replace('\\/?(?=\\/|$)', '')
        .replace(/\\\//g, '/')
        .replace(/\^/g, '')
        .replace(/\(\?:\(\[\^\\\/\]\+\?\)\)/g, ':param');
      routes.push({
        router: path,
        type: 'router'
      });
    }
  });
  res.json({
    success: true,
    routes: routes,
    total: routes.length
  });
});

// ============================================
// ✅ 404 HANDLER - For undefined routes
// ============================================
app.use((req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false, 
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    available_endpoints: {
      base: '/',
      test: '/api/test',
      health: '/api/health',
      auth: '/api/auth',
      doctors: '/api/doctors',
      appointments: '/api/appointments',
      schedule: '/api/doctor-schedule',
      debug_routes: '/api/debug/routes'
    }
  });
});

// ============================================
// ✅ ERROR HANDLING MIDDLEWARE
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Import mongoose for health check
import mongoose from 'mongoose';

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n✅ ==================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Server running on https://your-backend.onrender.com`);
  console.log('\n📋 Available Endpoints:');
  console.log(`   📍 GET  /                 - API Information`);
  console.log(`   📍 GET  /api/test         - Test endpoint`);
  console.log(`   📍 GET  /api/health       - Health check`);
  console.log(`   📍 POST /api/auth/login   - User login`);
  console.log(`   📍 POST /api/auth/signup  - User registration`);
  console.log(`   📍 GET  /api/doctors      - Get all doctors`);
  console.log(`   📍 GET  /api/debug/routes - Debug routes`);
  console.log('✅ ==================================\n');
});