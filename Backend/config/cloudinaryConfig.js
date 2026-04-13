import dotenv from 'dotenv';
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';

// Validate environment variables
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing Cloudinary environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

console.log('=== Cloudinary Configuration ===');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✓ Present' : '✗ Missing');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✓ Present' : '✗ Missing');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test the configuration
const testConfig = cloudinary.config();
console.log('Configured with cloud_name:', testConfig.cloud_name);

if (!testConfig.cloud_name || !testConfig.api_key || !testConfig.api_secret) {
  console.error('❌ Cloudinary configuration is incomplete!');
} else {
  console.log('✅ Cloudinary configuration successful');
}

export default cloudinary;