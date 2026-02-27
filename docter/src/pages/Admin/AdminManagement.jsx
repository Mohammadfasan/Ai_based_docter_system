import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUserMd, FaUsers, FaFilePrescription, FaCreditCard, 
  FaChartLine, FaSearch, FaFilter, FaEdit, FaTrash,
  FaEye, FaPlus, FaCalendar, FaDollarSign, FaPills,
  FaPrint, FaDownload, FaCheckCircle, FaTimesCircle, FaClock,
  FaPhone, FaEnvelope, FaHospital, FaGraduationCap,
  FaStar, FaImage, FaCamera, FaUpload, FaTimes, FaTrashAlt, FaFolderOpen,
  FaExclamationTriangle, FaCompress, FaBriefcaseMedical, FaLanguage,
  FaMapMarkerAlt, FaVideo, FaMoneyBillWave, FaUserCheck, FaCertificate,
  FaIdCard
} from 'react-icons/fa';

const AdminManagement = () => {
  const [activeTab, setActiveTab] = useState('doctors');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Doctors Data
  const [doctors, setDoctors] = useState([]);
  
  // Complete Doctor Form State
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    specialization: '',
    phone: '',
    hospital: '',
    location: 'Colombo',
    experience: '5+ Years',
    qualifications: '',
    license: '',
    fees: 'LKR 2,500',
    consultationTime: '30',
    availability: 'Mon-Fri: 9AM-6PM',
    languages: ['English', 'Sinhala'],
    isVideoAvailable: true,
    isVerified: true,
    rating: '4.5',
    reviewCount: 0,
    imageUrl: '',
    aiSummary: '',
    status: 'active'
  });

  const [editingDoctor, setEditingDoctor] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  
  // Image Upload State
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Language Options
  const languageOptions = ['English', 'Sinhala', 'Tamil', 'Arabic', 'Hindi'];

  // Specialization Options
  const specializationOptions = [
    'Cardiologist', 'Dermatologist', 'Pediatrician', 'General Physician',
    'Neurologist', 'Orthopedic', 'Dentist', 'ENT Specialist', 
    'Ophthalmologist', 'Psychiatrist', 'Gynecologist', 'Oncologist'
  ];

  // ✅ Load doctors on component mount
  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = () => {
    // Load from healthai_doctors (Patient Portal)
    const savedDoctors = JSON.parse(localStorage.getItem('healthai_doctors') || '[]');
    
    if (savedDoctors && savedDoctors.length > 0) {
      setDoctors(savedDoctors);
    } else {
      // Default doctors if none exist
      const defaultDoctors = [
        {
          id: 'DOC-1234-SRJ',
          userId: 'DOC-1234-SRJ',
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@healthai.com',
          specialization: 'Cardiologist',
          phone: '+94 77 123 4567',
          hospital: 'City Medical Center',
          location: 'Colombo 03',
          status: 'active',
          rating: 4.8,
          reviewCount: 128,
          experience: '10+ Years',
          image: "https://randomuser.me/api/portraits/women/44.jpg",
          isVerified: true,
          fees: "LKR 3,000",
          languages: ['English', 'Sinhala'],
          isVideoAvailable: true,
          qualifications: 'MD Cardiology, FRCP',
          license: 'MED123456',
          consultationTime: '30 mins',
          availability: 'Mon-Fri: 9AM-6PM',
          aiSummary: 'Expert cardiologist with 10+ years experience.',
          nextAvailable: 'Today, 4:30 PM',
          userType: 'doctor',
          password: 'doctor123',
          createdAt: new Date().toISOString()
        },
        {
          id: 'DOC-5678-MCH',
          userId: 'DOC-5678-MCH',
          name: 'Dr. Michael Chen',
          email: 'michael.chen@healthai.com',
          specialization: 'Dermatologist',
          phone: '+94 77 987 6543',
          hospital: 'General Hospital',
          location: 'Colombo 05',
          status: 'active',
          rating: 4.6,
          reviewCount: 89,
          experience: '8+ Years',
          image: "https://randomuser.me/api/portraits/men/32.jpg",
          isVerified: true,
          fees: "LKR 2,800",
          languages: ['English', 'Tamil'],
          isVideoAvailable: false,
          qualifications: 'MD Dermatology',
          license: 'MED789012',
          consultationTime: '20 mins',
          availability: 'Mon-Sat: 10AM-7PM',
          aiSummary: 'Specialist in skin care and acne treatments.',
          nextAvailable: 'Tomorrow, 11:00 AM',
          userType: 'doctor',
          password: 'doctor123',
          createdAt: new Date().toISOString()
        }
      ];
      setDoctors(defaultDoctors);
      localStorage.setItem('healthai_doctors', JSON.stringify(defaultDoctors));
    }
    
    setLoading(false);
  };

  // ============================================
  // ✅ EXACT SAME ID GENERATION AS LOGINFORM.JSX
  // ============================================
  const generateDoctorId = (name, email) => {
    // Create consistent hash from email (same email = same hash)
    const emailHash = (email || `${name}@healthai.com`).toLowerCase().split('').reduce((acc, char, index) => {
      return acc + char.charCodeAt(0) * (index + 1);
    }, 0);
    
    // Use only first 4 characters of hash for consistency
    const hashString = Math.abs(emailHash).toString(36).slice(-4).toUpperCase();
    
    // Get initials from name
    const getInitials = (fullName) => {
      if (!fullName) {
        return 'DOC';
      }
      return fullName
        .split(' ')
        .map(n => n.charAt(0).toUpperCase())
        .join('')
        .slice(0, 3);
    };
    
    const prefix = 'DOC';
    const initials = getInitials(name);
    
    return `${prefix}-${hashString}-${initials}`;
  };

  // ✅ Image Upload Handler
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadError('');

    // Check file size - 5MB max
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError(`File too large! Maximum size is 5MB.`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload only image files');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setSelectedImage(e.target.result);
      setNewDoctor({...newDoctor, imageUrl: e.target.result});
      setIsUploading(false);
    };
    reader.onerror = () => {
      setUploadError('Failed to read file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setSelectedImage(null);
    setNewDoctor({...newDoctor, imageUrl: ''});
    setUploadError('');
  };

  // ✅ Language Toggle
  const handleLanguageToggle = (lang) => {
    const currentLanguages = [...newDoctor.languages];
    if (currentLanguages.includes(lang)) {
      setNewDoctor({...newDoctor, languages: currentLanguages.filter(l => l !== lang)});
    } else {
      setNewDoctor({...newDoctor, languages: [...currentLanguages, lang]});
    }
  };

  // ✅ Add Doctor - Saves in BOTH storages with SAME ID
  const handleAddDoctor = () => {
    if (!newDoctor.name || !newDoctor.specialization) {
      alert('Please enter doctor name and specialization');
      return;
    }

    // ✅ Generate consistent Doctor ID using SAME method as LoginForm
    const doctorId = generateDoctorId(newDoctor.name, newDoctor.email);
    
    // Generate image if not selected
    let imageUrl = selectedImage;
    if (!imageUrl) {
      const initials = newDoctor.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
      imageUrl = `https://ui-avatars.com/api/?name=${initials}&background=0D9488&color=fff&size=200`;
    }

    // Create doctor object
    const doctor = {
      id: doctorId,
      userId: doctorId,
      name: newDoctor.name,
      email: newDoctor.email || `${newDoctor.name.toLowerCase().replace(/\s+/g, '.')}@healthai.com`,
      specialization: newDoctor.specialization,
      phone: newDoctor.phone || '+94 77 123 4567',
      hospital: newDoctor.hospital || 'City Hospital',
      location: newDoctor.location || 'Colombo',
      experience: newDoctor.experience,
      qualifications: newDoctor.qualifications || `MD ${newDoctor.specialization}`,
      license: newDoctor.license || `MED${Math.floor(Math.random() * 1000000)}`,
      fees: newDoctor.fees,
      consultationTime: `${newDoctor.consultationTime} mins`,
      availability: newDoctor.availability,
      languages: newDoctor.languages.length > 0 ? newDoctor.languages : ['English', 'Sinhala'],
      isVideoAvailable: newDoctor.isVideoAvailable,
      isVerified: true,
      rating: parseFloat(newDoctor.rating) || 4.5,
      reviewCount: 0,
      image: imageUrl,
      aiSummary: newDoctor.aiSummary || `Expert ${newDoctor.specialization} with ${newDoctor.experience} experience.`,
      status: 'active',
      userType: 'doctor',
      nextAvailable: 'Not set',
      distance: '2.5 km',
      password: 'doctor123',
      createdAt: new Date().toISOString(),
      avatarColor: 'from-teal-500 to-teal-600'
    };

    // ✅ STEP 1: Save in healthai_doctors (Patient Portal)
    const existingDoctors = JSON.parse(localStorage.getItem('healthai_doctors') || '[]');
    
    // Check if doctor already exists with this ID or email
    const doctorExists = existingDoctors.some(d => 
      d.id === doctorId || d.email === doctor.email
    );
    
    if (doctorExists) {
      alert(`⚠️ Doctor with email ${doctor.email} already exists!`);
      return;
    }
    
    const updatedDoctors = [...existingDoctors, doctor];
    localStorage.setItem('healthai_doctors', JSON.stringify(updatedDoctors));
    
    // ✅ STEP 2: Save in healthai_users (Login System) with SAME ID
    const existingUsers = JSON.parse(localStorage.getItem('healthai_users') || '[]');
    const userExists = existingUsers.some(u => u.userId === doctorId || u.email === doctor.email);
    
    if (!userExists) {
      const userDoctor = {
        userId: doctorId,
        name: doctor.name,
        email: doctor.email,
        userType: 'doctor',
        password: 'doctor123',
        specialization: doctor.specialization,
        licenseNumber: doctor.license,
        hospital: doctor.hospital,
        consultationFee: parseInt(doctor.fees?.replace(/\D/g, '') || '2500'),
        experience: doctor.experience,
        phone: doctor.phone,
        address: doctor.location,
        avatarColor: 'from-teal-500 to-teal-600',
        createdAt: new Date().toISOString(),
        isVerified: true
      };
      existingUsers.push(userDoctor);
      localStorage.setItem('healthai_users', JSON.stringify(existingUsers));
    }

    // ✅ STEP 3: Initialize empty slots for this doctor
    const slotsKey = `doctor_slots_${doctorId}`;
    if (!localStorage.getItem(slotsKey)) {
      localStorage.setItem(slotsKey, JSON.stringify([]));
    }

    // Update state
    setDoctors(updatedDoctors);
    
    // Reset form
    resetDoctorForm();
    setShowDoctorModal(false);
    
    alert(`✅ Doctor "${doctor.name}" added successfully!
    
👨‍⚕️ Doctor ID: ${doctorId}
📧 Email: ${doctor.email}
🔑 Password: doctor123
📅 Please ask doctor to login and add schedule

⚠️ IMPORTANT: This ID will be the same when doctor logs in with this email!`);
  };

  // ✅ Update Doctor
  const handleUpdateDoctor = () => {
    if (!editingDoctor) return;

    const existingDoctors = JSON.parse(localStorage.getItem('healthai_doctors') || '[]');
    const updatedDoctors = existingDoctors.map(d => 
      d.id === editingDoctor.id ? { 
        ...d, 
        name: newDoctor.name,
        email: newDoctor.email,
        specialization: newDoctor.specialization,
        phone: newDoctor.phone,
        hospital: newDoctor.hospital,
        location: newDoctor.location,
        experience: newDoctor.experience,
        qualifications: newDoctor.qualifications,
        license: newDoctor.license,
        fees: newDoctor.fees,
        consultationTime: `${newDoctor.consultationTime} mins`,
        availability: newDoctor.availability,
        languages: newDoctor.languages,
        isVideoAvailable: newDoctor.isVideoAvailable,
        rating: parseFloat(newDoctor.rating),
        image: selectedImage || d.image,
        aiSummary: newDoctor.aiSummary,
        status: newDoctor.status
      } : d
    );
    
    localStorage.setItem('healthai_doctors', JSON.stringify(updatedDoctors));
    setDoctors(updatedDoctors);
    
    // Also update in healthai_users
    const existingUsers = JSON.parse(localStorage.getItem('healthai_users') || '[]');
    const updatedUsers = existingUsers.map(u => 
      u.userId === editingDoctor.id ? { ...u, name: newDoctor.name, email: newDoctor.email } : u
    );
    localStorage.setItem('healthai_users', JSON.stringify(updatedUsers));
    
    setShowDoctorModal(false);
    setEditingDoctor(null);
    resetDoctorForm();
    
    alert('✅ Doctor updated successfully!');
  };

  // ✅ Delete Doctor
  const handleDeleteDoctor = (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      // Remove from healthai_doctors
      const existingDoctors = JSON.parse(localStorage.getItem('healthai_doctors') || '[]');
      const updatedDoctors = existingDoctors.filter(d => d.id !== id);
      localStorage.setItem('healthai_doctors', JSON.stringify(updatedDoctors));
      
      // Remove from healthai_users
      const existingUsers = JSON.parse(localStorage.getItem('healthai_users') || '[]');
      const updatedUsers = existingUsers.filter(u => u.userId !== id);
      localStorage.setItem('healthai_users', JSON.stringify(updatedUsers));
      
      // Remove doctor slots
      localStorage.removeItem(`doctor_slots_${id}`);
      
      setDoctors(updatedDoctors);
      alert('✅ Doctor deleted successfully!');
    }
  };

  // ✅ Edit Doctor
  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setNewDoctor({
      name: doctor.name || '',
      email: doctor.email || '',
      specialization: doctor.specialization || '',
      phone: doctor.phone || '',
      hospital: doctor.hospital || '',
      location: doctor.location || 'Colombo',
      experience: doctor.experience || '5+ Years',
      qualifications: doctor.qualifications || '',
      license: doctor.license || '',
      fees: doctor.fees || 'LKR 2,500',
      consultationTime: doctor.consultationTime?.replace(' mins', '') || '30',
      availability: doctor.availability || 'Mon-Fri: 9AM-6PM',
      languages: doctor.languages || ['English', 'Sinhala'],
      isVideoAvailable: doctor.isVideoAvailable ?? true,
      isVerified: doctor.isVerified ?? true,
      rating: doctor.rating?.toString() || '4.5',
      reviewCount: doctor.reviewCount || 0,
      imageUrl: doctor.image || '',
      aiSummary: doctor.aiSummary || '',
      status: doctor.status || 'active'
    });
    setImagePreview(doctor.image || '');
    setSelectedImage(doctor.image || '');
    setShowDoctorModal(true);
  };

  const resetDoctorForm = () => {
    setNewDoctor({
      name: '', email: '', specialization: '', phone: '', hospital: '', location: 'Colombo',
      experience: '5+ Years', qualifications: '', license: '',
      fees: 'LKR 2,500', consultationTime: '30', availability: 'Mon-Fri: 9AM-6PM',
      languages: ['English', 'Sinhala'],
      isVideoAvailable: true, isVerified: true,
      rating: '4.5', reviewCount: 0,
      imageUrl: '', aiSummary: '', status: 'active'
    });
    setImagePreview('');
    setSelectedImage(null);
    setUploadError('');
  };

  // Stats
  const stats = {
    totalDoctors: doctors.length,
    activeDoctors: doctors.filter(d => d.status === 'active').length,
    avgRating: doctors.length > 0 
      ? (doctors.reduce((sum, d) => sum + parseFloat(d.rating || 0), 0) / doctors.length).toFixed(1)
      : 0
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
        <p className="text-gray-600">
          Complete Doctor Management System
          <span className="ml-2 text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded">
            {doctors.length} doctors
          </span>
          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Same ID as Login System ✓
          </span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</div>
              <div className="text-gray-600">Total Doctors</div>
            </div>
            <FaUserMd className="text-teal-600 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.activeDoctors}</div>
              <div className="text-gray-600">Active Doctors</div>
            </div>
            <FaCheckCircle className="text-green-600 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.avgRating}</div>
              <div className="text-gray-600">Avg Rating</div>
            </div>
            <FaStar className="text-yellow-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{doctors.filter(d => d.isVideoAvailable).length}</div>
              <div className="text-gray-600">Video Available</div>
            </div>
            <FaVideo className="text-blue-600 text-2xl" />
          </div>
        </div>
      </div>

      {/* Doctors Management Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">👨‍⚕️ Doctors Management</h2>
              <p className="text-sm text-gray-500 mt-1">
                Add, edit, and manage all doctors in the system
              </p>
              <p className="text-xs text-teal-600 mt-1">
                ✓ Doctor IDs match LoginForm exactly - Same email = Same ID
              </p>
            </div>
            <button
              onClick={() => {
                setEditingDoctor(null);
                resetDoctorForm();
                setShowDoctorModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              <FaPlus />
              <span>Add New Doctor</span>
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors by name, specialization, hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Doctors Table */}
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
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors
                  .filter(doctor => 
                    doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    doctor.hospital?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(doctor => (
                  <tr key={doctor.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={doctor.image} 
                          alt={doctor.name} 
                          className="w-10 h-10 rounded-full object-cover border-2 border-teal-100"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${doctor.name?.charAt(0)}&background=0D9488&color=fff`;
                          }}
                        />
                        <div>
                          <div className="font-medium text-gray-900">{doctor.name}</div>
                          <div className="text-xs text-gray-500">{doctor.email}</div>
                          <span className="text-xs font-mono bg-teal-50 text-teal-700 px-1 py-0.5 rounded">
                            ID: {doctor.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-gray-900 font-medium">{doctor.specialization}</div>
                      <div className="text-xs text-gray-500">{doctor.qualifications}</div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center text-gray-900">
                        <FaBriefcaseMedical className="mr-1 text-teal-600" size={12} />
                        {doctor.experience}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center">
                        <FaStar className="text-yellow-500 mr-1" size={12} />
                        <span className="font-medium">{doctor.rating}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-medium text-teal-700">{doctor.fees}</span>
                    </td>
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
                    <td className="py-3 px-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditDoctor(doctor)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit Doctor"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => window.open('/doctors', '_blank')}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                          title="View in Patient Portal"
                        >
                          <FaEye size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteDoctor(doctor.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete Doctor"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {doctors.length === 0 && (
              <div className="text-center py-12">
                <FaUserMd className="text-5xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700">No Doctors Found</h3>
                <p className="text-gray-500 mt-2">Click "Add New Doctor" to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Doctor Modal */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingDoctor ? '✏️ Edit Doctor' : '👨‍⚕️ Add New Doctor'}
                </h2>
                <button
                  onClick={() => {
                    setShowDoctorModal(false);
                    setEditingDoctor(null);
                    resetDoctorForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto px-1">
                {/* Image Upload Section */}
                <div className="mb-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <img 
                        src={imagePreview || "https://ui-avatars.com/api/?name=DR&background=0D9488&color=fff&size=200"} 
                        alt="Doctor" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-teal-100"
                      />
                      <div className="absolute bottom-0 right-0">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                          id="doctor-image-upload"
                        />
                        <label
                          htmlFor="doctor-image-upload"
                          className="flex items-center justify-center w-10 h-10 bg-teal-600 text-white rounded-full cursor-pointer hover:bg-teal-700"
                        >
                          <FaCamera />
                        </label>
                      </div>
                    </div>
                  </div>

                  {isUploading && (
                    <p className="text-sm text-teal-600 mb-2">Processing image...</p>
                  )}

                  {uploadError && (
                    <p className="text-sm text-red-600 mb-2 bg-red-50 p-2 rounded-lg">
                      <FaExclamationTriangle className="inline mr-1" />
                      {uploadError}
                    </p>
                  )}

                  {(imagePreview || selectedImage) && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      <FaTimes className="inline mr-1" />
                      Remove Image
                    </button>
                  )}
                </div>

                {/* Form Grid - 2 Columns */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 border-b pb-2">📋 Basic Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Doctor Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newDoctor.name}
                        onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="Dr. John Smith"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specialization <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newDoctor.specialization}
                        onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select Specialization</option>
                        {specializationOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Qualifications
                      </label>
                      <input
                        type="text"
                        value={newDoctor.qualifications}
                        onChange={(e) => setNewDoctor({...newDoctor, qualifications: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="MD Cardiology, FRCP"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Experience
                      </label>
                      <input
                        type="text"
                        value={newDoctor.experience}
                        onChange={(e) => setNewDoctor({...newDoctor, experience: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="10+ Years"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        License Number
                      </label>
                      <input
                        type="text"
                        value={newDoctor.license}
                        onChange={(e) => setNewDoctor({...newDoctor, license: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="MED123456"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newDoctor.email}
                        onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="doctor@hospital.com"
                      />
                      <p className="text-xs text-teal-600 mt-1">
                        This email will determine the Doctor ID
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={newDoctor.phone}
                        onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="+94 77 123 4567"
                      />
                    </div>
                  </div>

                  {/* Right Column - Practice Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 border-b pb-2">🏥 Practice Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hospital / Clinic
                      </label>
                      <input
                        type="text"
                        value={newDoctor.hospital}
                        onChange={(e) => setNewDoctor({...newDoctor, hospital: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="City Hospital"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={newDoctor.location}
                        onChange={(e) => setNewDoctor({...newDoctor, location: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="Colombo 05"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Consultation Fee
                      </label>
                      <input
                        type="text"
                        value={newDoctor.fees}
                        onChange={(e) => setNewDoctor({...newDoctor, fees: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="LKR 2,500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Consultation Time
                      </label>
                      <select
                        value={newDoctor.consultationTime}
                        onChange={(e) => setNewDoctor({...newDoctor, consultationTime: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Availability
                      </label>
                      <input
                        type="text"
                        value={newDoctor.availability}
                        onChange={(e) => setNewDoctor({...newDoctor, availability: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="Mon-Fri: 9AM-6PM"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={newDoctor.rating}
                        onChange={(e) => setNewDoctor({...newDoctor, rating: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newDoctor.isVideoAvailable}
                          onChange={(e) => setNewDoctor({...newDoctor, isVideoAvailable: e.target.checked})}
                          className="rounded border-gray-300 text-teal-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Video Consultation Available</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Languages Section */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 border-b pb-2">🗣️ Languages Spoken</h3>
                  <div className="flex flex-wrap gap-3">
                    {languageOptions.map(lang => (
                      <label key={lang} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={newDoctor.languages.includes(lang)}
                          onChange={() => handleLanguageToggle(lang)}
                          className="rounded border-gray-300 text-teal-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* AI Summary */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 border-b pb-2">📝 AI Summary / Description</h3>
                  <textarea
                    value={newDoctor.aiSummary}
                    onChange={(e) => setNewDoctor({...newDoctor, aiSummary: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Brief description about the doctor..."
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 border-b pb-2">⚙️ Status</h3>
                  <select
                    value={newDoctor.status}
                    onChange={(e) => setNewDoctor({...newDoctor, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="busy">Busy</option>
                  </select>
                </div>

                {/* ID Generation Info Box - FIXED with FaIdCard imported */}
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-lg border border-teal-200">
                  <h4 className="font-bold text-teal-800 mb-2 flex items-center gap-2">
                    <FaIdCard className="text-teal-600" />
                    🔐 Doctor ID Generation (Same as LoginForm)
                  </h4>
                  <div className="text-sm text-teal-700 space-y-2">
                    <p className="font-mono bg-white p-2 rounded border border-teal-200">
                      {newDoctor.name && newDoctor.email ? (
                        <span>
                          Generated ID: <strong className="text-teal-800">{generateDoctorId(newDoctor.name, newDoctor.email)}</strong>
                        </span>
                      ) : (
                        <span className="text-gray-500">Enter name and email to see generated ID</span>
                      )}
                    </p>
                    <ul className="list-disc list-inside text-xs space-y-1">
                      <li><strong>Same email = Same Doctor ID</strong> (consistent with LoginForm)</li>
                      <li>Format: <code className="bg-teal-100 px-1 py-0.5 rounded">DOC-XXXX-INITIALS</code></li>
                      <li>Doctor can login with this email and password: <strong>doctor123</strong></li>
                      <li>The ID will be exactly the same when doctor registers with same email</li>
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDoctorModal(false);
                      setEditingDoctor(null);
                      resetDoctorForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={editingDoctor ? handleUpdateDoctor : handleAddDoctor}
                    className="px-8 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center space-x-2"
                    disabled={isUploading}
                  >
                    <FaUserMd />
                    <span>{isUploading ? 'Processing...' : (editingDoctor ? 'Update Doctor' : 'Add Doctor')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;