import cloudinary from '../config/cloudinaryConfig.js';
import fs from 'fs';
import path from 'path';

export const uploadDoctorImage = async (req, res) => {
  try {
    console.log('=== UPLOAD DEBUG START ===');
    console.log('Request file:', req.file);
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    console.log('File details:', {
      path: req.file.path,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Check if file exists
    if (!fs.existsSync(req.file.path)) {
      console.error('File does not exist at path:', req.file.path);
      return res.status(400).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Test Cloudinary connection first
    console.log('Testing Cloudinary connection...');
    try {
      const pingResult = await cloudinary.api.ping();
      console.log('Cloudinary ping successful:', pingResult);
    } catch (pingError) {
      console.error('Cloudinary connection failed:', pingError);
      return res.status(500).json({
        success: false,
        message: 'Cloudinary connection failed. Check your credentials.',
        error: pingError.message
      });
    }

    // Upload to Cloudinary
    console.log('Uploading to Cloudinary...');
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'doctor-portal/doctors',
      resource_type: 'auto',
      quality: 'auto',
      transformation: [
        { width: 500, height: 500, crop: 'limit' }
      ]
    });

    console.log('Cloudinary upload successful:', result.secure_url);
    console.log('Public ID:', result.public_id);

    // Clean up temp file
    try {
      fs.unlinkSync(req.file.path);
      console.log('Temp file deleted:', req.file.path);
    } catch (unlinkError) {
      console.warn('Could not delete temp file:', unlinkError);
    }

    console.log('=== UPLOAD DEBUG END ===');
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
      publicId: result.public_id,
      filename: req.file.filename
    });

  } catch (error) {
    console.error('=== UPLOAD ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.http_code) {
      console.error('Cloudinary HTTP code:', error.http_code);
    }
    
    // Clean up temp file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Temp file cleaned up after error:', req.file.path);
      } catch (unlinkError) {
        console.warn('Could not delete temp file after error:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message,
      cloudinaryError: error.http_code ? `Cloudinary error: ${error.http_code}` : null
    });
  }
};