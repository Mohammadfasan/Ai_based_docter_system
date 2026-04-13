import cloudinary from '../config/cloudinaryConfig.js';
import fs from 'fs';
import path from 'path';
import MedicalRecord from '../models/MedicalRecord.js';

// ✅ FIXED: Proper URL handling for Cloudinary PDFs
const getProperDeliveryUrl = (cloudinaryUrl, fileType, publicId = null) => {
  if (!cloudinaryUrl) return cloudinaryUrl;
  
  try {
    console.log('🔄 Processing URL for:', fileType);
    
    // For PDFs - need special raw/upload URL
    if (fileType === 'pdf') {
      // Method 1: Build URL from publicId (most reliable)
      if (publicId) {
        const cloudName = 'dsughluct';
        const builtUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/fl_attachment/${publicId}`;
        console.log('✅ Built PDF URL from publicId:', builtUrl);
        return builtUrl;
      }
      
      // Method 2: Fix existing URL
      let convertedUrl = cloudinaryUrl;
      
      // Replace upload/ with raw/upload/ for PDFs
      if (convertedUrl.includes('/upload/')) {
        convertedUrl = convertedUrl.replace('/upload/', '/raw/upload/');
      }
      
      // Remove duplicate flags
      convertedUrl = convertedUrl.replace(/\/fl_attachment\//g, '/');
      convertedUrl = convertedUrl.replace(/\/fl_attachment:/g, '/');
      
      // Add fl_attachment flag for download/view
      if (convertedUrl.includes('/raw/upload/')) {
        const parts = convertedUrl.split('/raw/upload/');
        convertedUrl = parts[0] + '/raw/upload/fl_attachment/' + parts[1];
      }
      
      console.log('✅ Fixed PDF URL:', convertedUrl);
      return convertedUrl;
    }
    
    // For images - standard URL works fine
    console.log('✅ Image URL:', cloudinaryUrl);
    return cloudinaryUrl;
  } catch (error) {
    console.error('❌ URL conversion error:', error);
    return cloudinaryUrl;
  }
};

// Upload to Cloudinary
const uploadToCloudinary = async (filePath, fileName, fileType) => {
  try {
    // CRITICAL: PDFs MUST use 'raw' resource type
    const resourceType = fileType === 'pdf' ? 'raw' : 'image';
    
    console.log(`📤 Uploading: ${fileName}`);
    console.log(`   Type: ${fileType}, Resource: ${resourceType}`);
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'medical-records',
      resource_type: resourceType,
      public_id: `${Date.now()}-${fileName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-')}`,
      overwrite: false,
    });

    console.log(`✅ Uploaded to Cloudinary`);
    console.log(`   Public ID: ${result.public_id}`);
    console.log(`   URL: ${result.secure_url}`);
    console.log(`   Resource Type: ${result.resource_type}`);

    return {
      success: true,
      secureUrl: result.secure_url,
      publicId: result.public_id,
      size: result.bytes,
      resourceType: result.resource_type,
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error.message);
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
  }
};

// Upload medical record with files
export const uploadMedicalRecordWithFiles = async (req, res) => {
  try {
    const { userId, userEmail, userName, date, type, diagnosis, doctor, notes, opDetails } = req.body;

    if (!userId || !date || !type || !req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, date, type, and files are required',
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('📁 UPLOADING MEDICAL RECORD');
    console.log('='.repeat(60));
    console.log(`Patient: ${userName} (${userId})`);
    console.log(`Type: ${type}, Date: ${date}`);
    console.log(`Files: ${req.files.length}`);
    
    req.files.forEach((f, i) => {
      console.log(`  ${i + 1}. ${f.originalname} (${(f.size / 1024).toFixed(0)} KB)`);
    });

    // Upload each file to Cloudinary
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        const fileExtension = path.extname(file.originalname).toLowerCase();
        const fileType = fileExtension === '.pdf' ? 'pdf' : 'image';

        console.log(`\n⬆️ Uploading file ${i + 1}/${req.files.length}: ${file.originalname}`);

        const uploadResult = await uploadToCloudinary(
          file.path,
          file.originalname,
          fileType
        );

        uploadedFiles.push({
          id: Date.now() + i,
          name: file.originalname,
          type: file.mimetype,
          size: uploadResult.size,
          fileType: fileType,
          data: uploadResult.secureUrl,
          cloudinaryUrl: uploadResult.secureUrl,
          publicId: uploadResult.publicId,
        });

        // Clean up temp file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        
        console.log(`✅ Uploaded successfully`);
      } catch (fileError) {
        console.error(`❌ Failed to upload ${file.originalname}:`, fileError.message);
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw fileError;
      }
    }

    // Save to database
    const newRecord = new MedicalRecord({
      userId,
      userEmail: userEmail || '',
      userName: userName || '',
      date,
      doctor: doctor || 'Self-uploaded',
      type,
      diagnosis: diagnosis || type,
      notes: notes || '',
      opDetails: opDetails ? JSON.parse(opDetails) : null,
      uploadedBy: userName || 'User',
      uploadedById: userId,
      uploadedAt: new Date().toISOString(),
      files: uploadedFiles,
    });

    const savedRecord = await newRecord.save();

    console.log('\n' + '='.repeat(60));
    console.log('✅ RECORD SAVED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log(`Record ID: ${savedRecord._id}`);
    console.log(`Files saved: ${savedRecord.files.length}`);
    savedRecord.files.forEach((f, i) => {
      console.log(`  ${i + 1}. ${f.name} (${f.fileType})`);
      console.log(`     Public ID: ${f.publicId}`);
    });
    console.log('='.repeat(60) + '\n');

    res.status(201).json({
      success: true,
      message: 'Medical record uploaded successfully',
      data: savedRecord,
    });
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ UPLOAD ERROR');
    console.error('='.repeat(60));
    console.error(error.message);
    console.error('='.repeat(60) + '\n');
    
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading medical record',
      error: error.message,
    });
  }
};

// Get medical record with proper URLs
export const getMedicalRecordWithFiles = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📋 Fetching record:', id);

    const record = await MedicalRecord.findById(id).lean();

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }

    // Fix URLs for each file
    if (record.files && Array.isArray(record.files)) {
      record.files = record.files.map(file => {
        const properUrl = getProperDeliveryUrl(
          file.cloudinaryUrl || file.data, 
          file.fileType,
          file.publicId
        );
        return {
          ...file,
          cloudinaryUrl: properUrl,
          data: properUrl
        };
      });
      
      console.log(`✅ Record found with ${record.files.length} file(s)`);
      record.files.forEach((f, i) => {
        console.log(`  ${i + 1}. ${f.name} -> ${f.fileType}`);
      });
    }

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medical record',
      error: error.message,
    });
  }
};

// Delete medical record and Cloudinary files
export const deleteMedicalRecordWithFiles = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting record:', id);

    const record = await MedicalRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }

    // Delete from Cloudinary
    if (record.files && record.files.length > 0) {
      for (const file of record.files) {
        if (file.publicId) {
          try {
            const resourceType = file.fileType === 'pdf' ? 'raw' : 'image';
            await cloudinary.uploader.destroy(file.publicId, {
              resource_type: resourceType,
            });
            console.log(`🗑️ Deleted from Cloudinary: ${file.publicId}`);
          } catch (deleteError) {
            console.warn(`⚠️ Could not delete ${file.publicId}:`, deleteError.message);
          }
        }
      }
    }

    await MedicalRecord.findByIdAndDelete(id);
    console.log('✅ Record deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Medical record deleted successfully',
      data: { id: record._id },
    });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting medical record',
      error: error.message,
    });
  }
};