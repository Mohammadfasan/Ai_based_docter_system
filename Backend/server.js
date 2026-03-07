import express from "express";
import cors from "cors";
import dotenv from "dotenv"; 
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import doctorRoutes from "./routes/doctors.js"; // ✅ Import doctor routes
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Increase payload limit for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB with better error handling
connectDB().catch(err => {
  console.error('❌ Failed to connect to MongoDB:', err.message);
  process.exit(1);
});

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);

// ✅ Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// ✅ 404 handler for undefined routes - FIXED: Don't use '*' wildcard
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false, 
    message: `Route not found: ${req.method} ${req.originalUrl}` 
  });
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n✅ ==================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Auth routes: http://localhost:${PORT}/api/auth`);
  console.log(`✅ Doctor routes: http://localhost:${PORT}/api/doctors`);
  console.log(`✅ Uploads folder: ${path.join(__dirname, 'uploads')}`);
  console.log('✅ ==================================\n');
});