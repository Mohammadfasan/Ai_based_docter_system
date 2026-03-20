import React, { useState, useRef, useCallback, memo, useMemo } from 'react';
import { 
  FaUserMd, FaCamera, FaTimes, FaSpinner, FaCheckCircle
} from 'react-icons/fa';
import { doctorAPI, validateDoctorForm, formatDoctorData } from '../../services/api';

// Memoized modal component for state isolation
const AddDoctorModal = memo(({ isOpen, onClose, onSuccess, showNotification }) => {
  const [modalLoading, setModalLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Ref-based form handling - prevents re-renders on file selection
  const fileInputRef = useRef(null);
  
  // Form State
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    password: 'doctor123',
    phone: '',
    specialization: '',
    qualifications: '',
    experience: '',
    license: '',
    hospital: '',
    location: 'Colombo',
    fees: '',
    consultationTime: '30 mins',
    languages: ['English', 'Sinhala'],
    isVideoAvailable: true,
    isVerified: true,
    rating: 4.5,
    status: 'active',
    image: '',
    aiSummary: ''
  });

  // Memoized lists
  const specializations = useMemo(() => [
    'Cardiologist', 'Dermatologist', 'Pediatrician', 'General Physician',
    'Neurologist', 'Orthopedic', 'Dentist', 'ENT Specialist',
    'Ophthalmologist', 'Psychiatrist', 'Gynecologist', 'Oncologist'
  ], []);

  const languageOptions = useMemo(() => ['English', 'Sinhala', 'Tamil'], []);
  
  const locations = useMemo(() => [
    'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo',
    'Batticaloa', 'Kurunegala', 'Ratnapura', 'Badulla', 'Matara'
  ], []);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setNewDoctor(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [formErrors]);

  // Handle language selection
  const handleLanguageChange = useCallback((language) => {
    setNewDoctor(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  }, []);

  // Handle image selection
  const handleImageSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size should be less than 5MB', 'error');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file', 'error');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [showNotification]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const { isValid, errors } = validateDoctorForm(newDoctor);
    
    if (!isValid) {
      setFormErrors(errors);
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    setModalLoading(true);
    
    try {
      // Check if email exists
      const emailCheck = await doctorAPI.checkEmail(newDoctor.email);
      
      if (emailCheck.success && emailCheck.exists) {
        setFormErrors(prev => ({ ...prev, email: 'Email already exists' }));
        showNotification('Email already registered', 'error');
        setModalLoading(false);
        return;
      }
      
      let doctorData = { ...newDoctor };
      
      // Upload image if selected
      if (selectedImage) {
        try {
          setUploadProgress(0);
          const uploadResult = await doctorAPI.uploadImage(
            selectedImage, 
            (progress) => setUploadProgress(progress)
          );
          
          if (uploadResult.success) {
            doctorData.image = uploadResult.imageUrl;
          } else {
            showNotification(uploadResult.message, 'error');
            setModalLoading(false);
            return;
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          showNotification('Failed to upload image', 'error');
          setModalLoading(false);
          return;
        }
      }
      
      // Format and create doctor
      const formattedData = formatDoctorData(doctorData);
      const result = await doctorAPI.createDoctor(formattedData);
      
      if (result.success) {
        showNotification(`✅ Doctor ${newDoctor.name} created successfully!`, 'success');
        resetForm();
        onSuccess();
        onClose();
      } else {
        if (result.field) {
          setFormErrors(prev => ({ ...prev, [result.field]: result.message }));
        }
        showNotification(`❌ ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Submit error:', error);
      showNotification('❌ Failed to create doctor. Please try again.', 'error');
    } finally {
      setModalLoading(false);
      setUploadProgress(0);
    }
  };

  // Reset form
  const resetForm = useCallback(() => {
    setNewDoctor({
      name: '',
      email: '',
      password: 'doctor123',
      phone: '',
      specialization: '',
      qualifications: '',
      experience: '',
      license: '',
      hospital: '',
      location: 'Colombo',
      fees: '',
      consultationTime: '30 mins',
      languages: ['English', 'Sinhala'],
      isVideoAvailable: true,
      isVerified: true,
      rating: 4.5,
      status: 'active',
      image: '',
      aiSummary: ''
    });
    setSelectedImage(null);
    setImagePreview(null);
    setFormErrors({});
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Add New Doctor</h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Profile Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <FaUserMd className="text-white text-3xl" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-50"
                    >
                      <FaCamera className="text-teal-600" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-teal-600 h-2 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Uploading: {uploadProgress}%</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={newDoctor.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Dr. John Doe"
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={newDoctor.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="doctor@example.com"
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={newDoctor.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${
                    formErrors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+94 77 123 4567"
                />
                {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <select
                  name="specialization"
                  value={newDoctor.specialization}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${
                    formErrors.specialization ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Specialization</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                {formErrors.specialization && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.specialization}</p>
                )}
              </div>

              {/* Qualifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualifications <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="qualifications"
                  value={newDoctor.qualifications}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${
                    formErrors.qualifications ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="MBBS, MD, FRCP"
                />
                {formErrors.qualifications && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.qualifications}</p>
                )}
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="experience"
                  value={newDoctor.experience}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${
                    formErrors.experience ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="10+ Years"
                />
                {formErrors.experience && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.experience}</p>
                )}
              </div>

              {/* License */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="license"
                  value={newDoctor.license}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${
                    formErrors.license ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="SLMC-12345"
                />
                {formErrors.license && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.license}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Hospital */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital/Clinic <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hospital"
                  value={newDoctor.hospital}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${
                    formErrors.hospital ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="City Hospital"
                />
                {formErrors.hospital && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.hospital}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  name="location"
                  value={newDoctor.location}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${
                    formErrors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                {formErrors.location && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>
                )}
              </div>

              {/* Fees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Fee <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fees"
                  value={newDoctor.fees}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${
                    formErrors.fees ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="LKR 2,500"
                />
                {formErrors.fees && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.fees}</p>
                )}
              </div>

              {/* Consultation Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Time
                </label>
                <input
                  type="text"
                  name="consultationTime"
                  value={newDoctor.consultationTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="30 mins"
                />
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages
                </label>
                <div className="flex flex-wrap gap-3">
                  {languageOptions.map(lang => (
                    <label key={lang} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={newDoctor.languages.includes(lang)}
                        onChange={() => handleLanguageChange(lang)}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="ml-1 text-sm text-gray-700">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features
                </label>
                <div className="space-y-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="isVideoAvailable"
                      checked={newDoctor.isVideoAvailable}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Video Consultation Available</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="isVerified"
                      checked={newDoctor.isVerified}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Verified Doctor</span>
                  </label>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={newDoctor.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="busy">Busy</option>
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Rating
                </label>
                <input
                  type="number"
                  name="rating"
                  value={newDoctor.rating}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  max="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              {/* AI Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Summary
                </label>
                <textarea
                  name="aiSummary"
                  value={newDoctor.aiSummary}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Enter doctor description..."
                />
              </div>

              {/* Password Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  Default password: <strong>doctor123</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={modalLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {modalLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  <span>Create Doctor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default AddDoctorModal;