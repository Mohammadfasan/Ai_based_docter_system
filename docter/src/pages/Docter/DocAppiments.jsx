import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCalendarAlt, FaClock, FaPhone, FaUserCircle,
  FaCheck, FaTimes, FaVideo, FaExclamationTriangle,
  FaUserMd, FaInfoCircle, FaCalendarCheck,
  FaFilter, FaSearch, FaStethoscope, FaCalendar,
  FaFileMedical, FaMapMarkerAlt, FaClock as FaPending,
  FaFilePdf, FaFileImage, FaFileAlt, FaDownload,
  FaEye, FaPaperclip, FaTrash, FaExclamationCircle,
  FaEnvelope, FaWallet, FaHeart, FaShieldAlt, FaLink,
  FaUser
} from 'react-icons/fa';
import { 
  Stethoscope, Award, Users, Calendar as LucideCalendar, 
  Heart, Clock, ShieldCheck, Activity, PlusCircle, Trash2, MapPin,
  User, Mail, Phone as PhoneIcon, FileText, Video, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DocAppiments = ({ 
  doctorId = null,
  doctorEmail = null,
  userData = {}
}) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState(null);
  const [showRecordViewModal, setShowRecordViewModal] = useState(false);
  const [patientRecords, setPatientRecords] = useState([]);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [expiredCount, setExpiredCount] = useState(0);
  const [showFileViewModal, setShowFileViewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Helper function to check if date is expired (before today)
  const isExpired = (dateString) => {
    if (!dateString) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const appointmentDate = new Date(dateString);
    appointmentDate.setHours(0, 0, 0, 0);
    
    return appointmentDate < today;
  };

  // Helper function to check if a date is today
  const isToday = (dateString) => {
    if (!dateString) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const appointmentDate = new Date(dateString);
    appointmentDate.setHours(0, 0, 0, 0);
    
    return appointmentDate.getTime() === today.getTime();
  };

  // Helper function to check if date is future
  const isFuture = (dateString) => {
    if (!dateString) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const appointmentDate = new Date(dateString);
    appointmentDate.setHours(0, 0, 0, 0);
    
    return appointmentDate > today;
  };
  
  useEffect(() => {
    loadAppointments();
    const interval = setInterval(() => {
      cleanupExpiredAppointments();
      loadAppointments();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [doctorId, userData]);

  const loadAppointments = () => {
    setLoading(true);
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const actualDoctorId = doctorId || 
                          userData?.userId || 
                          currentUser?.userId;
    
    const doctorEmailId = doctorEmail || 
                         userData?.email || 
                         currentUser?.email;
    
    if (!actualDoctorId) {
      setLoading(false);
      return;
    }
    
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    
    // Get all users to ensure correct patient names
    const allUsers = JSON.parse(localStorage.getItem('healthai_users') || '[]');
    
    let doctorAppointments = allAppointments.filter(apt => {
      const matchById = apt.doctorId && String(apt.doctorId) === String(actualDoctorId);
      const matchByUserId = apt.doctorUserId && String(apt.doctorUserId) === String(actualDoctorId);
      const matchByEmail = apt.doctorEmail && apt.doctorEmail.toLowerCase() === doctorEmailId?.toLowerCase();
      
      return matchById || matchByUserId || matchByEmail;
    });
    
    // FIXED: Ensure patient names are correct by cross-referencing with users data
    doctorAppointments = doctorAppointments.map(app => {
      const patientUser = allUsers.find(u => 
        u.userId === app.patientId || 
        u.email === app.patientEmail
      );
      if (patientUser && patientUser.name && patientUser.name !== app.patientName) {
        console.log(`Fixing patient name: ${app.patientName} -> ${patientUser.name}`);
        return { ...app, patientName: patientUser.name };
      }
      return app;
    });
    
    const expired = doctorAppointments.filter(apt => isExpired(apt.date));
    setExpiredCount(expired.length);
    
    const activeAppointments = doctorAppointments.filter(apt => !isExpired(apt.date));
    
    const formattedAppointments = activeAppointments.map(apt => ({
      ...apt,
      displayDate: apt.date ? new Date(apt.date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      }) : apt.date,
      patientName: apt.patientName || 'Unknown Patient',
      symptoms: apt.symptoms || 'General consultation',
      time: apt.time || '--:--',
      type: apt.type || 'Clinic Visit',
      fee: apt.fee || 2500,
      isToday: isToday(apt.date),
      isFuture: isFuture(apt.date)
    }));
    
    setAppointments(formattedAppointments);
    setLoading(false);
  };

  const cleanupExpiredAppointments = () => {
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAppointments = allAppointments.filter(apt => !isExpired(apt.date));
    
    if (updatedAppointments.length !== allAppointments.length) {
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    }
  };

  const handleDeleteExpired = () => {
    if (window.confirm(`Delete ${expiredCount} expired appointment(s)?`)) {
      cleanupExpiredAppointments();
      loadAppointments();
      setShowExpiredModal(false);
    }
  };

  const loadPatientMedicalRecords = (patientId, patientEmail) => {
    // FIXED: Get records from medical_records_{patientId} format
    if (patientId) {
      const records = JSON.parse(localStorage.getItem(`medical_records_${patientId}`) || '[]');
      return records;
    }
    
    // Fallback to old format
    const records = JSON.parse(localStorage.getItem('user_medical_records') || '[]');
    
    return records.filter(record => 
      record.patientId === patientId || 
      record.userId === patientId ||
      record.email === patientEmail ||
      record.patientEmail === patientEmail ||
      record.uploadedById === patientId
    );
  };

  const viewPatientMedicalRecords = (appointment) => {
    setSelectedAppointment(appointment);
    const records = loadPatientMedicalRecords(
      appointment.patientId, 
      appointment.patientEmail
    );
    setPatientRecords(records);
    setShowMedicalModal(true);
  };

  const viewMedicalRecord = (record) => {
    setSelectedMedicalRecord(record);
    setShowRecordViewModal(true);
  };

  const viewFile = (file) => {
    setSelectedFile(file);
    setShowFileViewModal(true);
  };

  const handleDownloadFile = (file) => {
    // Create download link
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAllFiles = (record) => {
    if (!record.files || record.files.length === 0) return;
    
    // Download each file
    record.files.forEach(file => {
      setTimeout(() => {
        handleDownloadFile(file);
      }, 500); // Small delay between downloads
    });
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFileAlt className="text-gray-400" />;
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <FaFilePdf className="text-red-500" size={16} />;
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return <FaFileImage className="text-blue-500" size={16} />;
    return <FaFileAlt className="text-gray-500" size={16} />;
  };

  const handleConfirm = (id) => {
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAllAppointments = allAppointments.map(apt => 
      apt.id === id ? { ...apt, status: 'confirmed' } : apt
    );
    localStorage.setItem('appointments', JSON.stringify(updatedAllAppointments));
    
    loadAppointments();
    alert('✅ Appointment confirmed!');
  };

  const handleCancel = (id) => {
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAllAppointments = allAppointments.map(apt => 
      apt.id === id ? { ...apt, status: 'cancelled' } : apt
    );
    localStorage.setItem('appointments', JSON.stringify(updatedAllAppointments));
    
    loadAppointments();
    alert('❌ Appointment cancelled!');
  };

  const handleComplete = (id) => {
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAllAppointments = allAppointments.map(apt => 
      apt.id === id ? { ...apt, status: 'completed' } : apt
    );
    localStorage.setItem('appointments', JSON.stringify(updatedAllAppointments));
    
    loadAppointments();
    alert('✅ Appointment marked as completed!');
  };

  const handleWritePrescription = (appointment) => {
    // Navigate to prescription manager with appointment data
    navigate('/prescriptions', { 
      state: { 
        appointment: appointment,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        patientEmail: appointment.patientEmail,
        appointmentDate: appointment.date,
        symptoms: appointment.symptoms,
        doctorName: userData?.name || appointment.doctorName || 'Dr. Sarah Johnson',
        doctorId: userData?.userId || appointment.doctorId,
        fromAppointment: true
      } 
    });
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = searchQuery === '' || 
      (appointment.patientName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (appointment.symptoms?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (appointment.patientId?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    
    switch(activeFilter) {
      case 'all':
        matchesFilter = true;
        break;
      case 'today':
        matchesFilter = appointment.isToday;
        break;
      case 'future':
        matchesFilter = appointment.isFuture;
        break;
      case 'pending':
        matchesFilter = appointment.status === 'pending';
        break;
      case 'confirmed':
        matchesFilter = appointment.status === 'confirmed';
        break;
      case 'completed':
        matchesFilter = appointment.status === 'completed';
        break;
      case 'cancelled':
        matchesFilter = appointment.status === 'cancelled';
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  const todayCount = appointments.filter(apt => apt.isToday).length;
  const futureCount = appointments.filter(apt => apt.isFuture).length;
  const pendingCount = appointments.filter(apt => apt.status === 'pending').length;
  const confirmedCount = appointments.filter(apt => apt.status === 'confirmed').length;
  const completedCount = appointments.filter(apt => apt.status === 'completed').length;
  const cancelledCount = appointments.filter(apt => apt.status === 'cancelled').length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <FaCheck className="text-green-600" size={12} />;
      case 'pending': return <FaExclamationTriangle className="text-amber-600" size={12} />;
      case 'completed': return <FaCalendarCheck className="text-blue-600" size={12} />;
      case 'cancelled': return <FaTimes className="text-red-600" size={12} />;
      default: return <FaInfoCircle className="text-gray-600" size={12} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001b38] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-cyan-400 font-bold text-sm tracking-widest uppercase">Loading Appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] pb-20 overflow-x-hidden" style={{ fontFamily: '"Inter", sans-serif' }}>
      
      {/* HERO DASHBOARD */}
      <div className="bg-[#001b38] pt-24 pb-40 px-6 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border border-cyan-500/30">
              Appointment Dashboard
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none mb-6" style={{ fontFamily: '"Montserrat", sans-serif' }}>
            Patient <span className="text-cyan-400">Visits</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg max-w-2xl">
            Manage all your appointments, view patient medical records, and track consultation status.
          </p>
          
          {/* Search Bar */}
          <div className="mt-10 max-w-2xl">
            <div className="relative group">
              <div className="absolute inset-0 bg-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-all"></div>
              <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 p-2 rounded-2xl flex items-center shadow-2xl">
                <FaSearch className="ml-5 text-cyan-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by patient name, ID or symptoms..." 
                  className="w-full bg-transparent border-none outline-none p-4 text-white placeholder:text-slate-500 font-bold"
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        <Activity className="absolute -bottom-20 -left-10 text-white/5 w-96 h-96" />
      </div>

      {/* Expired Alert */}
      {expiredCount > 0 && (
        <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 mb-6">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 flex items-center justify-between backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <FaExclamationCircle className="text-amber-500" size={24} />
              </div>
              <div>
                <p className="font-black text-amber-500 text-lg">{expiredCount} Expired Appointment(s)</p>
                <p className="text-sm text-amber-400/70">Past appointments are automatically deleted</p>
              </div>
            </div>
            <button
              onClick={handleDeleteExpired}
              className="px-8 py-4 bg-amber-500 text-[#001b38] rounded-xl font-black text-xs tracking-widest uppercase hover:bg-amber-400 transition-all flex items-center gap-3"
            >
              <FaTrash size={14} />
              DELETE NOW
            </button>
          </div>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 grid grid-cols-1 md:grid-cols-6 gap-4">
        {[
          { label: "Today", val: todayCount, icon: <LucideCalendar className="text-white" />, bg: "bg-cyan-500" },
          { label: "Future", val: futureCount, icon: <Clock className="text-white" />, bg: "bg-blue-500" },
          { label: "Pending", val: pendingCount, icon: <FaExclamationTriangle className="text-white" />, bg: "bg-amber-500" },
          { label: "Confirmed", val: confirmedCount, icon: <FaCheck className="text-white" />, bg: "bg-green-500" },
          { label: "Completed", val: completedCount, icon: <FaCalendarCheck className="text-white" />, bg: "bg-purple-500" },
          { label: "Cancelled", val: cancelledCount, icon: <FaTimes className="text-white" />, bg: "bg-red-500" }
        ].map((item, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5 }} 
            className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-100"
          >
            <div className={`${item.bg} p-4 rounded-xl shadow-lg`}>{item.icon}</div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
              <p className="text-2xl font-black text-[#001b38]" style={{ fontFamily: '"Montserrat", sans-serif' }}>{item.val}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter Button */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="bg-white text-[#001b38] px-8 py-4 rounded-full shadow-lg font-black text-xs tracking-widest uppercase flex items-center gap-3 hover:bg-cyan-500 hover:text-white transition-all"
        >
          <FaFilter size={16} />
          {showFilters ? 'HIDE FILTERS' : 'SHOW FILTERS'}
        </button>
      </div>

      {/* FILTERS */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-7xl mx-auto px-6 mt-6"
          >
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Date Filters */}
                <div>
                  <p className="text-xs font-black text-[#001b38] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <LucideCalendar size={16} className="text-cyan-500" />
                    DATE
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => { setActiveFilter('all'); setShowFilters(false); }}
                      className={`p-4 rounded-xl text-xs font-black transition-all ${
                        activeFilter === 'all' ? 'bg-[#001b38] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => { setActiveFilter('today'); setShowFilters(false); }}
                      className={`p-4 rounded-xl text-xs font-black transition-all ${
                        activeFilter === 'today' ? 'bg-cyan-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Today ({todayCount})
                    </button>
                    <button 
                      onClick={() => { setActiveFilter('future'); setShowFilters(false); }}
                      className={`p-4 rounded-xl text-xs font-black transition-all ${
                        activeFilter === 'future' ? 'bg-blue-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Future ({futureCount})
                    </button>
                  </div>
                </div>

                {/* Status Filters */}
                <div>
                  <p className="text-xs font-black text-[#001b38] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-cyan-500" />
                    STATUS
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    <button 
                      onClick={() => { setActiveFilter('pending'); setShowFilters(false); }}
                      className={`p-4 rounded-xl text-xs font-black transition-all ${
                        activeFilter === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                      }`}
                    >
                      Pending
                    </button>
                    <button 
                      onClick={() => { setActiveFilter('confirmed'); setShowFilters(false); }}
                      className={`p-4 rounded-xl text-xs font-black transition-all ${
                        activeFilter === 'confirmed' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      Confirmed
                    </button>
                    <button 
                      onClick={() => { setActiveFilter('completed'); setShowFilters(false); }}
                      className={`p-4 rounded-xl text-xs font-black transition-all ${
                        activeFilter === 'completed' ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                      }`}
                    >
                      Completed
                    </button>
                    <button 
                      onClick={() => { setActiveFilter('cancelled'); setShowFilters(false); }}
                      className={`p-4 rounded-xl text-xs font-black transition-all ${
                        activeFilter === 'cancelled' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      Cancelled
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filter Indicator */}
      {activeFilter !== 'all' && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="bg-cyan-50 text-cyan-700 px-6 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-3 border border-cyan-200">
            <span>Active Filter:</span>
            <span className="capitalize px-3 py-1 bg-cyan-200 rounded-lg">{activeFilter}</span>
            <button 
              onClick={() => setActiveFilter('all')}
              className="ml-2 text-cyan-500 hover:text-cyan-700"
            >
              ✕ Clear
            </button>
          </div>
        </div>
      )}

      {/* Appointments Grid */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <AnimatePresence>
          {filteredAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAppointments.map((appointment) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={appointment.id} 
                  className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group relative"
                >
                  {/* Card Header - Patient Info */}
                  <div className="bg-gradient-to-r from-[#001b38] to-[#002b4e] p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg">
                        {appointment.patientName ? appointment.patientName.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-black">{appointment.patientName}</h3>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black flex items-center gap-1 border ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            {appointment.status ? appointment.status.toUpperCase() : 'PENDING'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-300">
                          <span className="flex items-center gap-1"><User size={14} className="text-cyan-400" /> ID: {appointment.patientId || 'N/A'}</span>
                          {appointment.patientEmail && (
                            <span className="flex items-center gap-1"><Mail size={14} className="text-cyan-400" /> {appointment.patientEmail}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                        <div className="p-2 bg-cyan-100 rounded-lg">
                          <FaCalendarAlt className="text-cyan-600" size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">Date</p>
                          <p className="font-black text-[#001b38]">{appointment.displayDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FaClock className="text-purple-600" size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">Time</p>
                          <p className="font-black text-[#001b38]">{appointment.time}</p>
                        </div>
                      </div>
                    </div>

                    {/* Type & Fee */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className={`flex items-center gap-3 p-4 rounded-xl ${
                        appointment.type?.includes('Video') ? 'bg-purple-50' : 'bg-cyan-50'
                      }`}>
                        <div className={`p-2 rounded-lg ${
                          appointment.type?.includes('Video') ? 'bg-purple-200' : 'bg-cyan-200'
                        }`}>
                          {appointment.type?.includes('Video') ? 
                            <Video size={16} className="text-purple-700" /> : 
                            <MapPin size={16} className="text-cyan-700" />
                          }
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">Type</p>
                          <p className="font-black text-[#001b38]">{appointment.type || 'Clinic Visit'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
                        <div className="p-2 bg-emerald-200 rounded-lg">
                          <FaWallet className="text-emerald-700" size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">Fee</p>
                          <p className="font-black text-[#001b38]">LKR {appointment.fee || 2500}</p>
                        </div>
                      </div>
                    </div>

                    {/* Symptoms */}
                    <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Symptoms / Reason</p>
                      <p className="text-sm font-medium text-[#001b38]">{appointment.symptoms || 'General consultation'}</p>
                    </div>

                    {/* Location/Video Link */}
                    {(appointment.location || appointment.videoLink) && (
                      <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">
                          {appointment.location ? 'Location' : 'Meeting Link'}
                        </p>
                        <div className="flex items-center gap-2 text-sm font-bold text-cyan-600">
                          {appointment.location ? <MapPin size={16} /> : <FaLink size={16} />}
                          <span className="truncate">{appointment.location || appointment.videoLink}</span>
                        </div>
                      </div>
                    )}

                    {/* Attached Records from MedicalRecordsPage */}
                    {appointment.attachedRecords && appointment.attachedRecords.length > 0 && (
                      <div className="mb-6">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                          <FaPaperclip size={12} />
                          Patient Medical Records ({appointment.attachedRecords.length})
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                          {appointment.attachedRecords.map(recId => {
                            // Get records from medical_records_{patientId}
                            const records = JSON.parse(localStorage.getItem(`medical_records_${appointment.patientId}`) || '[]');
                            const record = records.find(r => r.id === recId);
                            return record ? (
                              <div
                                key={recId}
                                className="p-3 bg-blue-50 rounded-xl border border-blue-200"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    {getFileIcon(record.files?.[0]?.name)}
                                    <span className="font-bold text-blue-800 text-sm">
                                      {record.diagnosis || record.type}
                                    </span>
                                  </div>
                                  <span className="text-[8px] bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-black">
                                    {record.date}
                                  </span>
                                </div>
                                
                                {/* Files List */}
                                {record.files && record.files.length > 0 && (
                                  <div className="space-y-2 mt-2">
                                    {record.files.map((file, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg">
                                        <div className="flex items-center gap-2">
                                          {getFileIcon(file.name)}
                                          <span className="text-xs text-slate-600 truncate max-w-[150px]">
                                            {file.name}
                                          </span>
                                        </div>
                                        <div className="flex gap-1">
                                          <button
                                            onClick={() => viewFile(file)}
                                            className="p-1.5 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-all"
                                            title="View"
                                          >
                                            <FaEye size={12} />
                                          </button>
                                          <button
                                            onClick={() => handleDownloadFile(file)}
                                            className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
                                            title="Download"
                                          >
                                            <Download size={12} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Download All Button */}
                                {record.files && record.files.length > 1 && (
                                  <button
                                    onClick={() => handleDownloadAllFiles(record)}
                                    className="mt-2 w-full py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                  >
                                    <Download size={12} />
                                    DOWNLOAD ALL ({record.files.length} files)
                                  </button>
                                )}
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-4 gap-3">
                      <button 
                        onClick={() => viewPatientMedicalRecords(appointment)}
                        className="col-span-1 px-3 py-4 bg-blue-50 text-blue-600 rounded-xl text-xs font-black hover:bg-blue-100 transition-all flex items-center justify-center gap-2 border border-blue-200"
                        title="View Medical Records"
                      >
                        <FileText size={16} />
                        <span className="hidden sm:inline">Records</span>
                      </button>
                      
                      {(!appointment.status || appointment.status === 'pending') && (
                        <>
                          <button 
                            onClick={() => handleConfirm(appointment.id)}
                            className="col-span-1 px-3 py-4 bg-green-600 text-white rounded-xl text-xs font-black hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                          >
                            <FaCheck size={16} />
                            <span className="hidden sm:inline">Confirm</span>
                          </button>
                          <button 
                            onClick={() => handleCancel(appointment.id)}
                            className="col-span-2 px-3 py-4 bg-red-50 text-red-600 rounded-xl text-xs font-black hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-200"
                          >
                            <FaTimes size={16} />
                            <span className="hidden sm:inline">Cancel</span>
                          </button>
                        </>
                      )}
                      
                      {appointment.status === 'confirmed' && (
                        <>
                          {appointment.type?.includes('Video') && appointment.videoLink && (
                            <button 
                              onClick={() => window.open(appointment.videoLink.startsWith('http') ? appointment.videoLink : `https://${appointment.videoLink}`, '_blank')}
                              className="col-span-1 px-3 py-4 bg-purple-600 text-white rounded-xl text-xs font-black hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                            >
                              <Video size={16} />
                              <span className="hidden sm:inline">Join</span>
                            </button>
                          )}
                          <button 
                            onClick={() => handleComplete(appointment.id)}
                            className={`col-span-1 px-3 py-4 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 ${
                              !appointment.type?.includes('Video') ? 'col-span-2' : ''
                            }`}
                          >
                            <FaCalendarCheck size={16} />
                            <span className="hidden sm:inline">Complete</span>
                          </button>
                          <button 
                            onClick={() => handleCancel(appointment.id)}
                            className="col-span-1 px-3 py-4 bg-red-50 text-red-600 rounded-xl text-xs font-black hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-200"
                          >
                            <FaTimes size={16} />
                            <span className="hidden sm:inline">Cancel</span>
                          </button>
                        </>
                      )}

                      {appointment.status === 'completed' && (
                        <>
                          <button 
                            onClick={() => handleWritePrescription(appointment)}
                            className="col-span-3 px-3 py-4 bg-[#001b38] text-white rounded-xl text-xs font-black hover:bg-cyan-600 transition-all flex items-center justify-center gap-2"
                          >
                            <FaFileMedical size={16} />
                            <span>Write Prescription</span>
                          </button>
                          <button 
                            onClick={() => viewPatientMedicalRecords(appointment)}
                            className="col-span-1 px-3 py-4 bg-blue-50 text-blue-600 rounded-xl text-xs font-black hover:bg-blue-100 transition-all flex items-center justify-center gap-2 border border-blue-200"
                            title="View Medical Records"
                          >
                            <FileText size={16} />
                          </button>
                        </>
                      )}

                      {appointment.status === 'cancelled' && (
                        <div className="col-span-3 px-3 py-4 bg-slate-100 text-slate-500 rounded-xl text-xs font-black text-center">
                          Appointment Cancelled
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Today/Upcoming Badge */}
                  {(appointment.isToday || appointment.isFuture) && (
                    <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      appointment.isToday ? 'bg-cyan-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {appointment.isToday ? 'TODAY' : 'UPCOMING'}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-32 bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl text-center"
            >
              <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <LucideCalendar className="text-slate-400" size={48} />
              </div>
              <p className="text-lg font-black uppercase tracking-widest text-slate-400 mb-4">
                {activeFilter === 'pending' ? 'No Pending Appointments' :
                 activeFilter === 'confirmed' ? 'No Confirmed Appointments' :
                 activeFilter === 'completed' ? 'No Completed Appointments' :
                 activeFilter === 'cancelled' ? 'No Cancelled Appointments' :
                 activeFilter === 'today' ? 'No Appointments Today' :
                 activeFilter === 'future' ? 'No Future Appointments' :
                 'No Appointments Found'}
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                className="px-8 py-4 bg-[#001b38] text-white rounded-full font-black text-xs tracking-widest uppercase hover:bg-cyan-600 transition-all"
              >
                View All Appointments
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Medical Records List Modal */}
      <AnimatePresence>
        {showMedicalModal && selectedAppointment && (
          <div className="fixed inset-0 bg-[#001b38]/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-[#001b38] to-[#002b4e] p-8 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Medical Records</h2>
                    <p className="text-cyan-400 text-sm mt-2">
                      {selectedAppointment.patientName} • {patientRecords.length} records
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowMedicalModal(false)}
                    className="p-3 hover:bg-white/10 rounded-xl transition-all"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-8 overflow-y-auto max-h-[60vh]">
                {patientRecords.length > 0 ? (
                  <div className="space-y-4">
                    {patientRecords.map((record, index) => (
                      <motion.div 
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className="border-2 border-slate-100 rounded-2xl p-6 hover:border-cyan-200 transition-all cursor-pointer"
                        onClick={() => viewMedicalRecord(record)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            {getFileIcon(record.files?.[0]?.name)}
                            <h3 className="font-black text-lg text-[#001b38]">{record.diagnosis || record.type}</h3>
                          </div>
                          <span className="text-xs bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full font-black">
                            {record.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-bold mb-3">Dr. {record.doctor || 'Unknown'} • {record.date}</p>
                        {record.files && record.files.length > 0 && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-cyan-600">
                            <FaPaperclip size={12} />
                            {record.files.length} file(s)
                          </div>
                        )}
                        {record.notes && (
                          <p className="text-sm text-slate-600 p-4 bg-slate-50 rounded-xl">
                            {record.notes.length > 100 ? record.notes.substring(0, 100) + '...' : record.notes}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-400 font-black">No medical records found</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Single Record View Modal */}
      <AnimatePresence>
        {showRecordViewModal && selectedMedicalRecord && (
          <div className="fixed inset-0 bg-[#001b38]/80 backdrop-blur-xl flex items-center justify-center z-[60] p-4">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-8 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">{selectedMedicalRecord.diagnosis || selectedMedicalRecord.type}</h2>
                    <p className="text-cyan-100 text-sm mt-2">{selectedMedicalRecord.date}</p>
                  </div>
                  <button 
                    onClick={() => setShowRecordViewModal(false)}
                    className="p-3 hover:bg-white/10 rounded-xl transition-all"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-8 overflow-y-auto max-h-[60vh]">
                <div className="space-y-6">
                  {/* Doctor Info */}
                  <div className="bg-slate-50 p-6 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Doctor</p>
                    <p className="font-black text-[#001b38] text-lg">{selectedMedicalRecord.doctor || 'Unknown'}</p>
                  </div>

                  {/* Notes */}
                  {selectedMedicalRecord.notes && (
                    <div className="bg-slate-50 p-6 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Notes</p>
                      <p className="text-slate-700 whitespace-pre-wrap">{selectedMedicalRecord.notes}</p>
                    </div>
                  )}

                  {/* OP Details */}
                  {selectedMedicalRecord.opDetails && (
                    <div className="bg-slate-50 p-6 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-4">Vitals & Details</p>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedMedicalRecord.opDetails.opDoctor && (
                          <div className="p-3 bg-white rounded-xl">
                            <p className="text-[8px] text-slate-400 uppercase">Doctor</p>
                            <p className="font-bold text-[#001b38]">{selectedMedicalRecord.opDetails.opDoctor}</p>
                          </div>
                        )}
                        {selectedMedicalRecord.opDetails.opDept && (
                          <div className="p-3 bg-white rounded-xl">
                            <p className="text-[8px] text-slate-400 uppercase">Dept</p>
                            <p className="font-bold text-[#001b38]">{selectedMedicalRecord.opDetails.opDept}</p>
                          </div>
                        )}
                        {selectedMedicalRecord.opDetails.bp && (
                          <div className="p-3 bg-white rounded-xl">
                            <p className="text-[8px] text-slate-400 uppercase">BP</p>
                            <p className="font-bold text-[#001b38]">{selectedMedicalRecord.opDetails.bp}</p>
                          </div>
                        )}
                        {selectedMedicalRecord.opDetails.heartRate && (
                          <div className="p-3 bg-white rounded-xl">
                            <p className="text-[8px] text-slate-400 uppercase">HR</p>
                            <p className="font-bold text-[#001b38]">{selectedMedicalRecord.opDetails.heartRate}</p>
                          </div>
                        )}
                        {selectedMedicalRecord.opDetails.temp && (
                          <div className="p-3 bg-white rounded-xl">
                            <p className="text-[8px] text-slate-400 uppercase">Temp</p>
                            <p className="font-bold text-[#001b38]">{selectedMedicalRecord.opDetails.temp}</p>
                          </div>
                        )}
                        {selectedMedicalRecord.opDetails.oxygen && (
                          <div className="p-3 bg-white rounded-xl">
                            <p className="text-[8px] text-slate-400 uppercase">Oxygen</p>
                            <p className="font-bold text-[#001b38]">{selectedMedicalRecord.opDetails.oxygen}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Files */}
                  {selectedMedicalRecord.files && selectedMedicalRecord.files.length > 0 && (
                    <div className="bg-slate-50 p-6 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-4">Attached Files</p>
                      <div className="space-y-2">
                        {selectedMedicalRecord.files.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                              {getFileIcon(file.name)}
                              <span className="font-bold text-[#001b38]">{file.name}</span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => viewFile(file)}
                                className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"
                                title="View"
                              >
                                <FaEye size={14} />
                              </button>
                              <button 
                                onClick={() => handleDownloadFile(file)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                title="Download"
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Download All Button */}
                      {selectedMedicalRecord.files.length > 1 && (
                        <button
                          onClick={() => handleDownloadAllFiles(selectedMedicalRecord)}
                          className="mt-4 w-full py-3 bg-cyan-600 text-white rounded-xl font-black text-sm hover:bg-cyan-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Download size={16} />
                          DOWNLOAD ALL ({selectedMedicalRecord.files.length} files)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* File View Modal */}
      <AnimatePresence>
        {showFileViewModal && selectedFile && (
          <div className="fixed inset-0 bg-[#001b38]/80 backdrop-blur-xl flex items-center justify-center z-[70] p-4">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {getFileIcon(selectedFile.name)}
                    <div>
                      <h2 className="text-xl font-black">{selectedFile.name}</h2>
                      <p className="text-cyan-100 text-sm">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDownloadFile(selectedFile)}
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                      title="Download"
                    >
                      <Download size={20} />
                    </button>
                    <button 
                      onClick={() => setShowFileViewModal(false)}
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                    >
                      <FaTimes size={20} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-8 max-h-[70vh] overflow-y-auto bg-[#1a1f2e]">
                {selectedFile.fileType === 'image' ? (
                  <div className="flex justify-center">
                    <img 
                      src={selectedFile.data} 
                      alt={selectedFile.name}
                      className="max-w-full max-h-[60vh] object-contain rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-2xl p-12 text-center">
                    <FaFilePdf size={64} className="mx-auto text-red-400 mb-4" />
                    <p className="text-white font-bold mb-4">PDF Document</p>
                    <button
                      onClick={() => handleDownloadFile(selectedFile)}
                      className="bg-cyan-600 text-white px-8 py-4 rounded-xl font-black hover:bg-cyan-700 transition-all inline-flex items-center gap-2"
                    >
                      <Download size={18} /> DOWNLOAD PDF
                    </button>
                    <p className="text-slate-400 text-xs mt-4">
                      PDF viewing is not available in browser. Please download to view.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocAppiments;