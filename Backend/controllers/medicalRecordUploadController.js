// controllers/medicalRecordUploadController.js - COMPLETE FIXED VERSION

import cloudinary from '../config/cloudinaryConfig.js';
import fs from 'fs';
import path from 'path';
import MedicalRecord from '../models/MedicalRecord.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

// Helper: Get proper delivery URL for files
const getProperDeliveryUrl = (cloudinaryUrl, fileType, publicId = null) => {
  if (!cloudinaryUrl) return cloudinaryUrl;
  
  try {
    if (fileType === 'pdf') {
      if (publicId) {
        const cloudName = 'dsughluct';
        const builtUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/fl_attachment/${publicId}`;
        return builtUrl;
      }
      
      let convertedUrl = cloudinaryUrl;
      if (convertedUrl.includes('/upload/')) {
        convertedUrl = convertedUrl.replace('/upload/', '/raw/upload/');
      }
      convertedUrl = convertedUrl.replace(/\/fl_attachment\//g, '/');
      convertedUrl = convertedUrl.replace(/\/fl_attachment:/g, '/');
      
      if (convertedUrl.includes('/raw/upload/')) {
        const parts = convertedUrl.split('/raw/upload/');
        convertedUrl = parts[0] + '/raw/upload/fl_attachment/' + parts[1];
      }
      return convertedUrl;
    }
    return cloudinaryUrl;
  } catch (error) {
    console.error('URL conversion error:', error);
    return cloudinaryUrl;
  }
};

// Upload to Cloudinary
const uploadToCloudinary = async (filePath, fileName, fileType) => {
  try {
    const resourceType = fileType === 'pdf' ? 'raw' : 'image';
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'medical-records',
      resource_type: resourceType,
      public_id: `${Date.now()}-${fileName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-')}`,
      overwrite: false,
    });

    return {
      success: true,
      secureUrl: result.secure_url,
      publicId: result.public_id,
      size: result.bytes,
      resourceType: result.resource_type,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error.message);
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
  }
};

// ✅ UPLOAD MEDICAL RECORD
export const uploadMedicalRecordWithFiles = async (req, res) => {
  try {
    const currentUser = req.user;
    
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const { date, type, diagnosis, doctor, notes, opDetails, patientId } = req.body;
    
    let targetUserId;
    let targetUserEmail;
    let targetUserName;
    let uploadedByName = currentUser.name;
    // IMPORTANT: Store the actual logged-in user's ID
    let uploadedById = currentUser.userId || currentUser._id;
    
    console.log('📝 Upload request from:', currentUser.userType, currentUser.name);
    console.log('📝 Uploader ID (will be stored in uploadedById):', uploadedById);
    
    if (currentUser.userType === 'doctor') {
      if (!patientId) {
        return res.status(400).json({
          success: false,
          message: 'Doctor must specify patientId when uploading records'
        });
      }
      // Patient's ID goes to userId field
      targetUserId = patientId;
      
      // Get patient details
      const patient = await User.findOne({ userId: patientId });
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found with ID: ' + patientId
        });
      }
      targetUserEmail = patient.email;
      targetUserName = patient.name;
      
      console.log('👨‍⚕️ Doctor uploading FOR patient:', targetUserName);
      console.log('👨‍⚕️ Patient ID (userId field):', targetUserId);
      console.log('👨‍⚕️ Doctor ID (uploadedById field):', uploadedById);
      
    } else if (currentUser.userType === 'patient') {
      targetUserId = currentUser.userId || currentUser._id;
      targetUserEmail = currentUser.email;
      targetUserName = currentUser.name;
      
      console.log('👤 Patient uploading own record:', targetUserName);
      console.log('👤 Patient ID (userId & uploadedById):', targetUserId);
      
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only doctors and patients can upload medical records'
      });
    }
    
    if (!date || !type || !req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: date, type, and files are required',
      });
    }
    
    console.log(`📁 Uploading ${req.files.length} file(s)`);
    
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        const fileExtension = path.extname(file.originalname).toLowerCase();
        const fileType = fileExtension === '.pdf' ? 'pdf' : 'image';
        
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
        
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        
      } catch (fileError) {
        console.error(`Failed to upload ${file.originalname}:`, fileError.message);
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw fileError;
      }
    }
    
    let parsedOpDetails = null;
    if (opDetails) {
      try {
        parsedOpDetails = typeof opDetails === 'string' ? JSON.parse(opDetails) : opDetails;
      } catch (e) {
        console.warn('Failed to parse opDetails:', e);
      }
    }
    
    const newRecord = new MedicalRecord({
      userId: targetUserId,
      userEmail: targetUserEmail,
      userName: targetUserName,
      date,
      doctor: doctor || (currentUser.userType === 'doctor' ? currentUser.name : 'Self-uploaded'),
      type,
      diagnosis: diagnosis || type,
      notes: notes || '',
      opDetails: parsedOpDetails,
      uploadedBy: uploadedByName,
      uploadedById: uploadedById,  // This will be DOC-C00E-MFX for doctors
      uploadedAt: new Date().toISOString(),
      files: uploadedFiles,
    });
    
    const savedRecord = await newRecord.save();
    
    console.log('✅ Record saved successfully!');
    console.log('   - Record ID:', savedRecord._id);
    console.log('   - Patient ID (userId):', savedRecord.userId);
    console.log('   - Uploaded By ID (uploadedById):', savedRecord.uploadedById);
    
    res.status(201).json({
      success: true,
      message: 'Medical record uploaded successfully',
      data: savedRecord,
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    
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

// ✅ GET MEDICAL RECORD
export const getMedicalRecordWithFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    const record = await MedicalRecord.findById(id).lean();
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }
    
    let isAuthorized = false;
    
    if (currentUser.userType === 'patient') {
      const currentUserId = currentUser.userId || currentUser._id;
      isAuthorized = record.userId.toString() === currentUserId.toString();
    } 
    else if (currentUser.userType === 'doctor') {
      const uploadedById = record.uploadedById?.toString();
      const currentUserId = currentUser.userId || currentUser._id;
      
      if (uploadedById === currentUserId) {
        isAuthorized = true;
      } else {
        try {
          const hasAppointment = await Appointment.findOne({
            doctorId: currentUser.userId || currentUser._id,
            patientId: record.userId
          });
          isAuthorized = !!hasAppointment;
        } catch (err) {
          isAuthorized = false;
        }
      }
    } 
    else if (currentUser.userType === 'admin') {
      isAuthorized = true;
    }
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this record'
      });
    }
    
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

// ✅ DELETE MEDICAL RECORD - COMPLETE FIX
export const deleteMedicalRecordWithFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    const record = await MedicalRecord.findById(id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }
    
    console.log('🗑️ DELETE REQUEST DETAILS:');
    console.log('   - Record ID:', record._id);
    console.log('   - Patient ID (userId):', record.userId);
    console.log('   - Uploaded By (uploadedBy):', record.uploadedBy);
    console.log('   - Uploaded By ID (uploadedById):', record.uploadedById);
    console.log('   - Current User Type:', currentUser.userType);
    console.log('   - Current User Name:', currentUser.name);
    console.log('   - Current User ID:', currentUser.userId || currentUser._id);
    
    let isAuthorized = false;
    
    if (currentUser.userType === 'patient') {
      // Patient can delete their own records
      const currentUserId = currentUser.userId || currentUser._id;
      if (record.userId.toString() === currentUserId.toString()) {
        console.log('✅ PATIENT AUTHORIZED - Record belongs to this patient');
        isAuthorized = true;
      } else {
        console.log('❌ PATIENT NOT AUTHORIZED - Record belongs to different patient');
      }
    } 
    else if (currentUser.userType === 'doctor') {
      // Doctor can delete ONLY records they uploaded
      const uploadedById = record.uploadedById?.toString();
      const currentUserId = currentUser.userId || currentUser._id;
      
      console.log('   - Comparing: uploadedById (doctor who uploaded):', uploadedById);
      console.log('   - Comparing: currentUserId (logged in doctor):', currentUserId);
      
      if (uploadedById === currentUserId) {
        console.log('✅ DOCTOR AUTHORIZED - This doctor uploaded the record');
        isAuthorized = true;
      } else {
        console.log('❌ DOCTOR NOT AUTHORIZED - Different doctor uploaded this record');
      }
    } 
    else if (currentUser.userType === 'admin') {
      console.log('✅ ADMIN AUTHORIZED');
      isAuthorized = true;
    }
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this record. Only the patient who owns it or the doctor who uploaded it can delete it.'
      });
    }
    
    // Delete files from Cloudinary
    if (record.files && record.files.length > 0) {
      console.log(`🗑️ Deleting ${record.files.length} file(s) from Cloudinary...`);
      for (const file of record.files) {
        if (file.publicId) {
          try {
            const resourceType = file.fileType === 'pdf' ? 'raw' : 'image';
            await cloudinary.uploader.destroy(file.publicId, {
              resource_type: resourceType,
            });
            console.log(`   ✅ Deleted: ${file.publicId}`);
          } catch (deleteError) {
            console.warn(`   ⚠️ Could not delete ${file.publicId}:`, deleteError.message);
          }
        }
      }
    }
    
    // Delete record from database
    await MedicalRecord.findByIdAndDelete(id);
    console.log('✅ Record deleted from database successfully!');
    
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