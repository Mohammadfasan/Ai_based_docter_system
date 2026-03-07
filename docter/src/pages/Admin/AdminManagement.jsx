import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FaUserMd, FaSearch, FaEdit, FaTrash, FaEye, FaPlus, FaCamera,
  FaStar, FaHospital, FaTimes, FaSyncAlt, FaChevronLeft, 
  FaChevronRight, FaSpinner, FaVideo, FaCheckCircle, FaExclamationCircle
} from 'react-icons/fa';
import { doctorAPI, validateDoctorForm, formatDoctorData } from '../../services/api';

const AdminManagement = () => {
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  // Form State for New Doctor
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
    availability: 'Mon-Fri: 9AM-6PM',
    languages: ['English', 'Sinhala'],
    isVideoAvailable: true,
    isVerified: true,
    rating: 4.5,
    reviewCount: 0,
    status: 'active',
    image: '',
    aiSummary: '',
    nextAvailable: 'Today',
    distance: '2.5 km'
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const itemsPerPage = 10;

  // Specializations List
  const specializations = [
    'Cardiologist', 'Dermatologist', 'Pediatrician', 'General Physician',
    'Neurologist', 'Orthopedic', 'Dentist', 'ENT Specialist',
    'Ophthalmologist', 'Psychiatrist', 'Gynecologist', 'Oncologist'
  ];

  // Languages List
  const languageOptions = ['English', 'Sinhala', 'Tamil', 'Arabic', 'Hindi'];

  // Locations List
  const locations = [
    'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo',
    'Batticaloa', 'Kurunegala', 'Ratnapura', 'Badulla', 'Matara'
  ];

  // Doctors Data
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    activeDoctors: 0,
    avgRating: 0,
    videoAvailable: 0
  });

  // Action States
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // ✅ Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  // ✅ Load doctors with pagination and search - FIXED to accept parameters
  const loadDoctors = useCallback(async (page = currentPage, search = searchTerm) => {
    try {
      setLoading(true);
      
      const result = await doctorAPI.getPaginatedDoctors(page, itemsPerPage, search);
      
      if (result.success) {
        setDoctors(result.data.doctors || []);
        setTotalPages(result.data.totalPages || 1);
        setTotalDoctors(result.data.total || 0);
        
        setStats({
          totalDoctors: result.data.total || 0,
          activeDoctors: result.data.stats?.active || 0,
          avgRating: result.data.stats?.avgRating || 0,
          videoAvailable: result.data.stats?.videoAvailable || 0
        });
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      showNotification('Failed to load doctors', 'error');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [itemsPerPage]); // Only depend on itemsPerPage

  // ✅ Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchDebounce);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchDebounce]);

  // Load on mount
  useEffect(() => {
    loadDoctors(1, '');
  }, []); // Empty dependency array - run once on mount

  // Load when dependencies change - FIXED
  useEffect(() => {
    if (!initialLoad) {
      loadDoctors(currentPage, searchTerm);
    }
  }, [currentPage, searchTerm, loadDoctors]);

  // ✅ Refresh data
  const handleRefresh = () => {
    loadDoctors(currentPage, searchTerm);
  };

  // ✅ Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // ✅ Handle input change for form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewDoctor(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ Handle language selection
  const handleLanguageChange = (language) => {
    setNewDoctor(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  // ✅ Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size should be less than 5MB', 'error');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Handle add doctor submit - FIXED
  const handleAddDoctor = async (e) => {
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
      // Check if email already exists
      const emailCheck = await doctorAPI.checkEmail(newDoctor.email);
      
      if (emailCheck.success && emailCheck.exists) {
        setFormErrors(prev => ({ ...prev, email: 'Email already exists' }));
        showNotification('Email already registered', 'error');
        setModalLoading(false);
        return;
      }
      
      // Upload image if selected
      let imageUrl = newDoctor.image;
      if (selectedImage) {
        const uploadResult = await doctorAPI.uploadImage(
          selectedImage, 
          (progress) => setUploadProgress(progress)
        );
        
        if (uploadResult.success) {
          imageUrl = uploadResult.imageUrl;
        } else {
          showNotification(uploadResult.message, 'error');
          setModalLoading(false);
          return;
        }
      }
      
      // Prepare doctor data
      const doctorData = formatDoctorData({
        ...newDoctor,
        image: imageUrl
      });
      
      console.log('Submitting doctor data:', doctorData);
      
      // Create doctor
      const result = await doctorAPI.createDoctor(doctorData);
      
      if (result.success) {
        // Success message with doctor name
        showNotification(`✅ Doctor ${newDoctor.name} created successfully!`, 'success');
        
        // Reset form and close modal
        resetForm();
        setShowAddModal(false);
        
        // Go to first page and refresh
        setCurrentPage(1);
        
        // Small delay to ensure state updates
        setTimeout(() => {
          loadDoctors(1, searchTerm);
        }, 100);
        
        // Optional: Scroll to top to see the new doctor
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
      } else {
        // Handle field-specific errors
        if (result.field) {
          setFormErrors(prev => ({ ...prev, [result.field]: result.message }));
        }
        showNotification(`❌ ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Error creating doctor:', error);
      showNotification('❌ Failed to create doctor. Please try again.', 'error');
    } finally {
      setModalLoading(false);
      setUploadProgress(0);
    }
  };

  // ✅ Handle delete doctor
  const handleDeleteDoctor = async (id, doctorName) => {
    if (!window.confirm(`Are you sure you want to delete Dr. ${doctorName}?`)) return;

    setDeleteLoading(id);

    try {
      const result = await doctorAPI.deleteDoctor(id);

      if (result.success) {
        showNotification(`✅ Dr. ${doctorName} deleted successfully!`, 'success');
        
        // If current page becomes empty, go to previous page
        if (doctors.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          loadDoctors(currentPage, searchTerm);
        }
      } else {
        showNotification(`❌ ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      showNotification('❌ Failed to delete doctor', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  // ✅ Reset form
  const resetForm = () => {
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
      availability: 'Mon-Fri: 9AM-6PM',
      languages: ['English', 'Sinhala'],
      isVideoAvailable: true,
      isVerified: true,
      rating: 4.5,
      reviewCount: 0,
      status: 'active',
      image: '',
      aiSummary: '',
      nextAvailable: 'Today',
      distance: '2.5 km'
    });
    setSelectedImage(null);
    setImagePreview(null);
    setFormErrors({});
    setUploadProgress(0);
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      busy: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || colors.inactive;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-6">
        <div className="h-10 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (initialLoad) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white animate-slide-in`}>
          {notification.type === 'success' ? (
            <FaCheckCircle className="text-xl" />
          ) : (
            <FaExclamationCircle className="text-xl" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-gray-600">
            Complete Doctor Management System
            <span className="ml-2 text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded">
              {totalDoctors} doctors
            </span>
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
          title="Refresh"
        >
          <FaSyncAlt className={`text-xl ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FaUserMd className="text-teal-600 text-2xl" />}
          value={stats.totalDoctors}
          label="Total Doctors"
          loading={loading}
        />
        <StatCard
          icon={<FaUserMd className="text-green-600 text-2xl" />}
          value={stats.activeDoctors}
          label="Active Doctors"
          loading={loading}
        />
        <StatCard
          icon={<FaStar className="text-yellow-500 text-2xl" />}
          value={stats.avgRating.toFixed(1)}
          label="Avg Rating"
          loading={loading}
        />
        <StatCard
          icon={<FaVideo className="text-blue-600 text-2xl" />}
          value={stats.videoAvailable}
          label="Video Available"
          loading={loading}
        />
      </div>

      {/* Doctors Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">👨‍⚕️ Doctors Management</h2>
              <p className="text-sm text-gray-500 mt-1">
                Page {currentPage} of {totalPages} | Showing {doctors.length} doctors
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:min-w-[300px]">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search doctors..."
                  value={searchDebounce}
                  onChange={(e) => setSearchDebounce(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Add Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
              >
                <FaPlus />
                <span>Add Doctor</span>
              </button>
            </div>
          </div>

          {/* Table */}
          {loading && !initialLoad ? (
            <div className="text-center py-12">
              <FaSpinner className="animate-spin text-4xl text-teal-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading doctors...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Doctor</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Specialization</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Experience</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Rating</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Fees</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Hospital</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Created</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.length > 0 ? (
                      doctors.map(doctor => (
                        <tr key={doctor._id || doctor.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={doctor.image || `https://ui-avatars.com/api/?name=${doctor.name?.charAt(0)}&background=0D9488&color=fff`}
                                alt={doctor.name} 
                                className="w-10 h-10 rounded-full object-cover border-2 border-teal-100"
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${doctor.name?.charAt(0)}&background=0D9488&color=fff`;
                                }}
                              />
                              <div>
                                <div className="font-medium text-gray-900">{doctor.name}</div>
                                <div className="text-xs text-gray-500">{doctor.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="text-gray-900 font-medium">{doctor.specialization}</div>
                            <div className="text-xs text-gray-500">{doctor.qualifications}</div>
                          </td>
                          <td className="py-3 px-2 text-gray-900">{doctor.experience}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center">
                              <FaStar className="text-yellow-500 mr-1" size={12} />
                              <span className="font-medium">{doctor.rating}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 font-medium text-teal-700">{doctor.fees}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center">
                              <FaHospital className="mr-1 text-gray-500" size={12} />
                              {doctor.hospital}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doctor.status)}`}>
                              {doctor.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-xs text-gray-500">
                            {formatDate(doctor.createdAt)}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => alert('Edit functionality coming soon!')}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Doctor"
                              >
                                <FaEdit size={14} />
                              </button>
                              <button
                                onClick={() => window.open('/doctors', '_blank')}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="View in Patient Portal"
                              >
                                <FaEye size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteDoctor(doctor._id || doctor.id, doctor.name)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors relative"
                                title="Delete Doctor"
                                disabled={deleteLoading === (doctor._id || doctor.id)}
                              >
                                {deleteLoading === (doctor._id || doctor.id) ? (
                                  <FaSpinner className="animate-spin" size={14} />
                                ) : (
                                  <FaTrash size={14} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center py-12">
                          <FaUserMd className="text-5xl text-gray-300 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-gray-700">No Doctors Found</h3>
                          <p className="text-gray-500 mt-2">
                            {searchTerm ? 'Try a different search term' : 'Click "Add Doctor" to get started.'}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalDoctors)} of {totalDoctors} doctors
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft size={14} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                          className={`px-3 py-1 border rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-teal-600 text-white border-teal-600'
                              : 'hover:bg-gray-50'
                          } disabled:opacity-50`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Add New Doctor</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleAddDoctor} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Form fields */}
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

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newDoctor.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Dr. John Doe"
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                    )}
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
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="doctor@example.com"
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                    )}
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
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                        formErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+94 77 123 4567"
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                    )}
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
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
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
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
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
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                        formErrors.experience ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="10+ Years"
                    />
                    {formErrors.experience && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.experience}</p>
                    )}
                  </div>

                  {/* License Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="license"
                      value={newDoctor.license}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
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
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
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
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
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

                  {/* Consultation Fee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Consultation Fee <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fees"
                      value={newDoctor.fees}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="30 mins"
                    />
                  </div>

                  {/* Languages */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Languages
                    </label>
                    <div className="flex flex-wrap gap-2">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* AI Summary */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI Summary / Description
                    </label>
                    <textarea
                      name="aiSummary"
                      value={newDoctor.aiSummary}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter doctor description or AI summary..."
                    />
                  </div>

                  {/* Default Password Info */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Default password will be: <strong>doctor123</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
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
      )}

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, value, label, loading }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <div className="flex justify-between items-center">
      <div>
        {loading ? (
          <>
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-gray-600">{label}</div>
          </>
        )}
      </div>
      {icon}
    </div>
  </div>
);

export default AdminManagement;