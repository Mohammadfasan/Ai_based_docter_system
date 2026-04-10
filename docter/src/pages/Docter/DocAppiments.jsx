import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCalendarAlt, FaClock, FaUserCircle,
  FaCheck, FaTimes, FaVideo, FaExclamationTriangle,
  FaUserMd, FaInfoCircle, FaCalendarCheck,
  FaFilter, FaSearch, FaStethoscope, FaCalendar,
  FaFileMedical, FaMapMarkerAlt, FaClock as FaPending,
  FaFilePdf, FaFileImage, FaFileAlt, FaDownload,
  FaEye, FaPaperclip, FaTrash, FaExclamationCircle,
  FaEnvelope, FaWallet, FaHeart, FaShieldAlt, FaLink,
  FaUser, FaPhoneAlt, FaBell, FaSpinner, FaPrescriptionBottle,
  FaChevronDown, FaChevronUp, FaTimesCircle
} from 'react-icons/fa';
import { 
  Stethoscope, Award, Users, Calendar as LucideCalendar, 
  Heart, Clock, ShieldCheck, Activity, PlusCircle, Trash2, MapPin,
  User, Mail, Phone as PhoneIcon, FileText, Video, Download,
  RefreshCw, CheckCircle, XCircle, Paperclip, Image, File,
  ZoomIn
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const DocAppointments = ({ 
  doctorId = null,
  doctorEmail = null,
  userData = {}
}) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState(null);
  const [showRecordViewModal, setShowRecordViewModal] = useState(false);
  const [patientRecords, setPatientRecords] = useState([]);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [expiredCount, setExpiredCount] = useState(0);
  const [showFileViewModal, setShowFileViewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeAppointmentData, setCompleteAppointmentData] = useState(null);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [expandedAttachments, setExpandedAttachments] = useState({});

  // Helper function to check if date is expired
  const isExpired = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(dateString);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate < today;
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(dateString);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate.getTime() === today.getTime();
  };

  const isFuture = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(dateString);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate > today;
  };
  
  // Load appointments from MongoDB
  const loadAppointments = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    setSuccessMessage('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      const actualDoctorId = doctorId || 
                            userData?.userId || 
                            currentUser?.userId ||
                            currentUser?._id ||
                            currentUser?.doctorId;
      
      if (!actualDoctorId) {
        console.log('No doctor ID found');
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      console.log('📥 Fetching appointments for doctor:', actualDoctorId);
      
      const response = await axios.get(`${API_URL}/appointments/doctor/${actualDoctorId}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📥 Response:', response.data);
      
      let allAppointments = [];
      if (response.data && response.data.success) {
        allAppointments = response.data.data || [];
      } else if (response.data && Array.isArray(response.data)) {
        allAppointments = response.data;
      }
      
      console.log(`📋 Found ${allAppointments.length} total appointments`);
      
      const expired = allAppointments.filter(apt => isExpired(apt.date));
      setExpiredCount(expired.length);
      
      const activeAppointments = allAppointments.filter(apt => !isExpired(apt.date));
      
      const formattedAppointments = activeAppointments.map(apt => ({
        ...apt,
        _id: apt._id,
        displayDate: apt.date ? new Date(apt.date).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric'
        }) : apt.date,
        patientName: apt.patientName || 'Unknown Patient',
        patientEmail: apt.patientEmail || 'Not provided',
        patientPhone: apt.patientPhone || 'Not provided',
        symptoms: apt.notes || apt.symptoms || 'General consultation',
        time: apt.time || '--:--',
        type: apt.type === 'video' ? 'Video Consultation' : (apt.type === 'in-person' ? 'Clinic Visit' : apt.type),
        fee: apt.fee || 2500,
        isToday: isToday(apt.date),
        isFuture: isFuture(apt.date),
        attachedRecords: apt.attachedRecords || []
      }));
      
      setAppointments(formattedAppointments);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
      setError(error.response?.data?.message || 'Failed to load appointments. Make sure backend is running on port 5000');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [doctorId, userData, navigate]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    loadAppointments();
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing appointments...');
      loadAppointments(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadAppointments]);

  const refreshAppointments = async () => {
    await loadAppointments(true);
  };

  const showSuccessNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Toggle expanded attachments view
  const toggleAttachments = (appointmentId) => {
    setExpandedAttachments(prev => ({
      ...prev,
      [appointmentId]: !prev[appointmentId]
    }));
  };

  // ✅ CONFIRM APPOINTMENT
  const handleConfirm = async (id, patientEmail, patientName) => {
    setActionLoading(id);
    setError('');
    
    if (!window.confirm(`Confirm appointment for ${patientName}?`)) {
      setActionLoading(null);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.patch(`${API_URL}/appointments/${id}/confirm`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (response.data.success) {
        showSuccessNotification(`✅ Appointment CONFIRMED for ${patientName}!`);
        await loadAppointments(true);
      } else {
        throw new Error(response.data.message || 'Failed to confirm');
      }
    } catch (error) {
      console.error('Error confirming:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Network error.';
      setError(errorMsg);
      alert(`Error: ${errorMsg}`);
    } finally {
      setActionLoading(null);
    }
  };

  // ❌ CANCEL APPOINTMENT
  const handleCancel = async (id, patientEmail, patientName) => {
    setActionLoading(id);
    setError('');
    
    const reason = prompt('Reason for cancellation (optional):');
    
    if (!window.confirm(`Cancel appointment for ${patientName}?`)) {
      setActionLoading(null);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.patch(`${API_URL}/appointments/${id}/reject`,
        { rejectionReason: reason || 'Cancelled by doctor' },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (response.data.success) {
        showSuccessNotification(`❌ Appointment CANCELLED for ${patientName}!`);
        await loadAppointments(true);
      } else {
        throw new Error(response.data.message || 'Failed to cancel');
      }
    } catch (error) {
      console.error('Error cancelling:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Network error';
      setError(errorMsg);
      alert(`Error: ${errorMsg}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Open complete modal
  const openCompleteModal = (appointment) => {
    setCompleteAppointmentData(appointment);
    setConsultationNotes('');
    setPrescription('');
    setShowCompleteModal(true);
  };

  // ✅ COMPLETE APPOINTMENT
  const handleComplete = async () => {
    if (!completeAppointmentData) return;
    
    setActionLoading(completeAppointmentData._id);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.patch(`${API_URL}/appointments/${completeAppointmentData._id}/complete`,
        { 
          consultationNotes: consultationNotes,
          prescription: prescription
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (response.data.success) {
        showSuccessNotification(`✅ Appointment completed for ${completeAppointmentData.patientName}!`);
        setShowCompleteModal(false);
        await loadAppointments(true);
      } else {
        throw new Error(response.data.message || 'Failed to complete');
      }
    } catch (error) {
      console.error('Error completing:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Network error';
      setError(errorMsg);
      alert(`Error: ${errorMsg}`);
    } finally {
      setActionLoading(null);
      setCompleteAppointmentData(null);
    }
  };

  // Load patient's attached medical records
  const loadPatientAttachedRecords = (appointment) => {
    setSelectedAppointment(appointment);
    const attachedRecords = appointment.attachedRecords || [];
    setPatientRecords(attachedRecords);
    setShowMedicalModal(true);
  };

  // View a single medical record
  const viewMedicalRecord = (record) => {
    setSelectedMedicalRecord(record);
    setShowRecordViewModal(true);
  };

  // View a file (image or PDF)
  const viewFile = (file) => {
    setSelectedFile(file);
    setShowFileViewModal(true);
  };

  // Download file
  const handleDownloadFile = (file) => {
    if (file.data) {
      const link = document.createElement('a');
      link.href = file.data;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  // Get file icon based on file extension
  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFileAlt className="text-gray-400" size={16} />;
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <FaFilePdf className="text-red-500" size={16} />;
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) return <FaFileImage className="text-blue-500" size={16} />;
    return <FaFileAlt className="text-gray-500" size={16} />;
  };

  // Check if file is an image
  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const ext = fileName.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext);
  };

  const handleWritePrescription = (appointment) => {
    navigate('/prescriptions', { 
      state: { 
        appointment: appointment,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        patientEmail: appointment.patientEmail,
        appointmentDate: appointment.date,
        symptoms: appointment.symptoms,
        doctorName: userData?.name || appointment.doctorName,
        doctorId: userData?.userId || appointment.doctorId,
        fromAppointment: true
      } 
    });
  };

  // Delete expired appointments
  const cleanupExpiredAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/appointments/expired`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        showSuccessNotification(`🗑️ Deleted expired appointments`);
        await loadAppointments(true);
      }
    } catch (error) {
      console.error('Error cleaning expired:', error);
      setError('Failed to clean expired appointments');
    }
  };

  const handleDeleteExpired = async () => {
    if (window.confirm(`Delete ${expiredCount} expired appointment(s) from MongoDB?`)) {
      await cleanupExpiredAppointments();
      setShowExpiredModal(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = searchQuery === '' || 
      (appointment.patientName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (appointment.symptoms?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (appointment.patientId?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (appointment.patientEmail?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    switch(activeFilter) {
      case 'all': matchesFilter = true; break;
      case 'today': matchesFilter = appointment.isToday; break;
      case 'future': matchesFilter = appointment.isFuture; break;
      case 'pending': matchesFilter = appointment.status === 'pending'; break;
      case 'confirmed': matchesFilter = appointment.status === 'confirmed'; break;
      case 'completed': matchesFilter = appointment.status === 'completed'; break;
      case 'cancelled': matchesFilter = appointment.status === 'cancelled'; break;
      default: matchesFilter = true;
    }
    return matchesSearch && matchesFilter;
  });

  const pendingCount = appointments.filter(apt => apt.status === 'pending').length;
  const todayCount = appointments.filter(apt => apt.isToday).length;
  const futureCount = appointments.filter(apt => apt.isFuture).length;
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

  // Check backend connection on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await axios.get(`${API_URL}/health`);
        console.log('✅ Backend connected:', response.data);
      } catch (err) {
        console.error('❌ Backend not reachable');
        setError('Cannot connect to backend server. Please make sure the server is running on http://localhost:5000');
      }
    };
    checkBackend();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001b38] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-cyan-400 font-bold text-sm tracking-widest uppercase">Loading from MongoDB...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] pb-20 overflow-x-hidden" style={{ fontFamily: '"Inter", sans-serif' }}>
      
      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-6 z-50 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <FaBell size={20} />
            <span className="font-bold text-sm">{notificationMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="bg-[#001b38] pt-24 pb-40 px-6 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border border-cyan-500/30">
                Doctor Portal
              </span>
              {pendingCount > 0 && (
                <span className="bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border border-amber-500/30 animate-pulse">
                  🔔 {pendingCount} Pending Request{pendingCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button
              onClick={refreshAppointments}
              disabled={refreshing}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none mb-6">
            Patient <span className="text-cyan-400">Visits</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg max-w-2xl">
            Manage appointments and view patient medical records
          </p>
          <p className="text-slate-500 text-xs mt-4">
            Last updated: {lastUpdate.toLocaleTimeString()} • Auto-refreshes every 30 seconds
          </p>
          
          {/* Search Bar */}
          <div className="mt-10 max-w-2xl">
            <div className="relative group">
              <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 p-2 rounded-2xl flex items-center">
                <FaSearch className="ml-5 text-cyan-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by patient name, email, ID or symptoms..." 
                  className="w-full bg-transparent border-none outline-none p-4 text-white placeholder:text-slate-500 font-bold"
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="mr-3 text-slate-400 hover:text-white">
                    <FaTimes size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        <Activity className="absolute -bottom-20 -left-10 text-white/5 w-96 h-96" />
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 mb-6">
          <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4">
            <p className="text-green-400 text-center font-bold">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 mb-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
            <p className="text-red-400 text-center font-bold">{error}</p>
          </div>
        </div>
      )}

      {/* Expired Alert */}
      {expiredCount > 0 && (
        <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 mb-6">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <FaExclamationCircle className="text-amber-500" size={24} />
              </div>
              <div>
                <p className="font-black text-amber-500 text-lg">{expiredCount} Expired Appointment(s)</p>
                <p className="text-sm text-amber-400/70">Past appointments will be deleted from MongoDB</p>
              </div>
            </div>
            <button
              onClick={() => setShowExpiredModal(true)}
              className="px-8 py-4 bg-amber-500 text-[#001b38] rounded-xl font-black text-xs tracking-widest uppercase hover:bg-amber-400 transition-all flex items-center gap-3"
            >
              <FaTrash size={14} />
              DELETE FROM DATABASE
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Today", val: todayCount, icon: <LucideCalendar className="text-white" />, bg: "bg-cyan-500", filter: "today" },
          { label: "Future", val: futureCount, icon: <Clock className="text-white" />, bg: "bg-blue-500", filter: "future" },
          { label: "Pending", val: pendingCount, icon: <FaExclamationTriangle className="text-white" />, bg: "bg-amber-500", filter: "pending", highlight: true },
          { label: "Confirmed", val: confirmedCount, icon: <FaCheck className="text-white" />, bg: "bg-green-500", filter: "confirmed" },
          { label: "Completed", val: completedCount, icon: <FaCalendarCheck className="text-white" />, bg: "bg-purple-500", filter: "completed" },
          { label: "Cancelled", val: cancelledCount, icon: <FaTimes className="text-white" />, bg: "bg-red-500", filter: "cancelled" }
        ].map((item, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5 }} 
            className={`bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border transition-all cursor-pointer ${activeFilter === item.filter ? 'ring-2 ring-cyan-500 shadow-lg' : 'border-slate-100'} ${item.highlight && pendingCount > 0 ? 'animate-pulse' : ''}`}
            onClick={() => setActiveFilter(item.filter)}
          >
            <div className={`${item.bg} p-3 rounded-xl shadow-lg`}>{item.icon}</div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
              <p className="text-xl font-black text-[#001b38]">{item.val}</p>
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

      {/* Filters Panel */}
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
                <div>
                  <p className="text-xs font-black text-[#001b38] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <LucideCalendar size={16} className="text-cyan-500" />
                    DATE
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => { setActiveFilter('all'); setShowFilters(false); }} className={`p-4 rounded-xl text-xs font-black transition-all ${activeFilter === 'all' ? 'bg-[#001b38] text-white' : 'bg-slate-50 text-slate-600'}`}>All ({appointments.length})</button>
                    <button onClick={() => { setActiveFilter('today'); setShowFilters(false); }} className={`p-4 rounded-xl text-xs font-black transition-all ${activeFilter === 'today' ? 'bg-cyan-500 text-white' : 'bg-slate-50 text-slate-600'}`}>Today ({todayCount})</button>
                    <button onClick={() => { setActiveFilter('future'); setShowFilters(false); }} className={`p-4 rounded-xl text-xs font-black transition-all ${activeFilter === 'future' ? 'bg-blue-500 text-white' : 'bg-slate-50 text-slate-600'}`}>Future ({futureCount})</button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-black text-[#001b38] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-cyan-500" />
                    STATUS
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    <button onClick={() => { setActiveFilter('pending'); setShowFilters(false); }} className={`p-4 rounded-xl text-xs font-black transition-all ${activeFilter === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600'}`}>Pending ({pendingCount})</button>
                    <button onClick={() => { setActiveFilter('confirmed'); setShowFilters(false); }} className={`p-4 rounded-xl text-xs font-black transition-all ${activeFilter === 'confirmed' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-600'}`}>Confirmed ({confirmedCount})</button>
                    <button onClick={() => { setActiveFilter('completed'); setShowFilters(false); }} className={`p-4 rounded-xl text-xs font-black transition-all ${activeFilter === 'completed' ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-600'}`}>Completed ({completedCount})</button>
                    <button onClick={() => { setActiveFilter('cancelled'); setShowFilters(false); }} className={`p-4 rounded-xl text-xs font-black transition-all ${activeFilter === 'cancelled' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600'}`}>Cancelled ({cancelledCount})</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appointments Grid */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <AnimatePresence>
          {filteredAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAppointments.map((appointment) => {
                const hasAttachments = appointment.attachedRecords && appointment.attachedRecords.length > 0;
                const isExpanded = expandedAttachments[appointment._id];
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={appointment._id} 
                    className={`bg-white rounded-3xl shadow-xl border overflow-hidden hover:shadow-2xl transition-all group relative ${
                      appointment.status === 'pending' ? 'border-l-8 border-l-amber-500' : 
                      appointment.status === 'confirmed' ? 'border-l-8 border-l-green-500' : 
                      appointment.status === 'completed' ? 'border-l-8 border-l-purple-500' : 'border-slate-100'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-[#001b38] to-[#002b4e] p-6 text-white">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg">
                          {appointment.patientName ? appointment.patientName.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h3 className="text-xl font-black">{appointment.patientName}</h3>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black flex items-center gap-1 border ${getStatusColor(appointment.status)}`}>
                              {getStatusIcon(appointment.status)}
                              {appointment.status?.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-300 flex-wrap">
                            <span className="flex items-center gap-1"><User size={14} className="text-cyan-400" /> ID: {typeof appointment.patientId === 'string' ? appointment.patientId.slice(-8) : 'N/A'}</span>
                            {appointment.patientEmail && appointment.patientEmail !== 'Not provided' && (
                              <span className="flex items-center gap-1"><Mail size={14} className="text-cyan-400" /> {appointment.patientEmail}</span>
                            )}
                            {appointment.patientPhone && appointment.patientPhone !== 'Not provided' && (
                              <span className="flex items-center gap-1"><FaPhoneAlt size={12} className="text-cyan-400" /> {appointment.patientPhone}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                          <div className="p-2 bg-cyan-100 rounded-lg"><FaCalendarAlt className="text-cyan-600" size={16} /></div>
                          <div><p className="text-[9px] font-black text-slate-400 uppercase">Date</p><p className="font-black text-[#001b38]">{appointment.displayDate}</p></div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                          <div className="p-2 bg-purple-100 rounded-lg"><FaClock className="text-purple-600" size={16} /></div>
                          <div><p className="text-[9px] font-black text-slate-400 uppercase">Time</p><p className="font-black text-[#001b38]">{appointment.time}</p></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                          <div className="p-2 bg-cyan-100 rounded-lg"><MapPin size={16} className="text-cyan-700" /></div>
                          <div><p className="text-[9px] font-black text-slate-400 uppercase">Type</p><p className="font-black text-[#001b38]">{appointment.type || 'Clinic Visit'}</p></div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
                          <div className="p-2 bg-emerald-200 rounded-lg"><FaWallet className="text-emerald-700" size={16} /></div>
                          <div><p className="text-[9px] font-black text-slate-400 uppercase">Fee</p><p className="font-black text-[#001b38]">LKR {appointment.fee || 2500}</p></div>
                        </div>
                      </div>

                      <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Symptoms / Reason</p>
                        <p className="text-sm font-medium text-[#001b38]">{appointment.symptoms || 'General consultation'}</p>
                      </div>

                      {/* ATTACHED MEDICAL RECORDS SECTION - IMPROVED */}
                      {hasAttachments && (
                        <div className="mb-6 p-4 bg-cyan-50 rounded-xl border border-cyan-200">
                          <button
                            onClick={() => toggleAttachments(appointment._id)}
                            className="flex items-center justify-between w-full"
                          >
                            <div className="flex items-center gap-2">
                              <FaFileMedical className="text-cyan-600" size={16} />
                              <span className="text-xs font-black text-cyan-700 uppercase">
                                {appointment.attachedRecords.length} Medical Record(s) Attached
                              </span>
                            </div>
                            {isExpanded ? <FaChevronUp size={14} className="text-cyan-600" /> : <FaChevronDown size={14} className="text-cyan-600" />}
                          </button>
                          
                          {isExpanded && (
                            <div className="mt-3 space-y-3">
                              {appointment.attachedRecords.map((record, idx) => (
                                <div 
                                  key={record.recordId || idx} 
                                  className="bg-white rounded-xl p-4 border border-cyan-100 cursor-pointer hover:shadow-md transition-all"
                                  onClick={() => viewMedicalRecord(record)}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <FaFileMedical className="text-cyan-600" size={14} />
                                      <span className="font-black text-sm text-[#001b38]">
                                        {record.recordName || 'Medical Record'}
                                      </span>
                                    </div>
                                    <span className="text-[8px] font-black text-slate-400">
                                      {record.uploadedAt ? new Date(record.uploadedAt).toLocaleDateString() : ''}
                                    </span>
                                  </div>
                                  
                                  <p className="text-[10px] text-slate-500 mb-2">
                                    Uploaded by: {record.uploadedByName || 'Patient'}
                                  </p>
                                  
                                  {record.recordType && (
                                    <span className="inline-block px-2 py-1 bg-cyan-100 text-cyan-700 rounded-lg text-[8px] font-black">
                                      {record.recordType}
                                    </span>
                                  )}
                                  
                                  {/* Show file info with view/download buttons */}
                                  {record.files && record.files.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                      <p className="text-[8px] font-black text-slate-400 uppercase">Attached Files:</p>
                                      {record.files.map((file, fileIdx) => (
                                        <div key={fileIdx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                          <div className="flex items-center gap-2">
                                            {getFileIcon(file.name)}
                                            <span className="text-xs font-medium text-slate-700 truncate max-w-[150px]">
                                              {file.name}
                                            </span>
                                          </div>
                                          <div className="flex gap-1">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                viewFile(file);
                                              }}
                                              className="p-1.5 text-cyan-600 hover:bg-cyan-100 rounded-lg transition-all"
                                              title="View"
                                            >
                                              <FaEye size={12} />
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadFile(file);
                                              }}
                                              className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-all"
                                              title="Download"
                                            >
                                              <FaDownload size={12} />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {!isExpanded && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {appointment.attachedRecords.slice(0, 2).map((record, idx) => (
                                <div 
                                  key={idx} 
                                  className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-cyan-100 text-[8px] font-bold text-cyan-700"
                                >
                                  <FaFileMedical size={8} />
                                  <span className="truncate max-w-[100px]">
                                    {record.recordName || 'Medical Record'}
                                  </span>
                                </div>
                              ))}
                              {appointment.attachedRecords.length > 2 && (
                                <span className="text-[8px] text-slate-400 px-2 py-1">
                                  +{appointment.attachedRecords.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ACTION BUTTONS */}
                      <div className="grid grid-cols-4 gap-3">
                        {/* Records Button - View attached records */}
                        <button 
                          onClick={() => loadPatientAttachedRecords(appointment)}
                          className={`col-span-1 px-3 py-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                            hasAttachments 
                              ? 'bg-cyan-500 text-white hover:bg-cyan-600' 
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                          disabled={!hasAttachments}
                        >
                          <FileText size={16} />
                          <span className="hidden sm:inline">Records</span>
                          {hasAttachments && appointment.attachedRecords.length > 0 && (
                            <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full text-[8px]">
                              {appointment.attachedRecords.length}
                            </span>
                          )}
                        </button>
                        
                        {/* PENDING STATUS - Shows CONFIRM and CANCEL buttons */}
                        {appointment.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleConfirm(appointment._id, appointment.patientEmail, appointment.patientName)}
                              disabled={actionLoading === appointment._id}
                              className="col-span-3 px-3 py-4 bg-green-600 text-white rounded-xl text-xs font-black hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {actionLoading === appointment._id ? (
                                <FaSpinner className="animate-spin" size={16} />
                              ) : (
                                <FaCheck size={16} />
                              )}
                              <span>CONFIRM</span>
                            </button>
                            <button 
                              onClick={() => handleCancel(appointment._id, appointment.patientEmail, appointment.patientName)}
                              disabled={actionLoading === appointment._id}
                              className="col-span-3 px-3 py-4 bg-red-600 text-white rounded-xl text-xs font-black hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {actionLoading === appointment._id ? (
                                <FaSpinner className="animate-spin" size={16} />
                              ) : (
                                <FaTimes size={16} />
                              )}
                              <span>CANCEL</span>
                            </button>
                          </>
                        )}
                        
                        {/* CONFIRMED STATUS - Shows COMPLETE and RX buttons */}
                        {appointment.status === 'confirmed' && (
                          <>
                            <button 
                              onClick={() => openCompleteModal(appointment)}
                              disabled={actionLoading === appointment._id}
                              className="col-span-2 px-3 py-4 bg-purple-600 text-white rounded-xl text-xs font-black hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {actionLoading === appointment._id ? (
                                <FaSpinner className="animate-spin" size={16} />
                              ) : (
                                <FaCalendarCheck size={16} />
                              )}
                              <span>COMPLETE</span>
                            </button>
                            <button 
                              onClick={() => handleWritePrescription(appointment)}
                              className="col-span-2 px-3 py-4 bg-cyan-600 text-white rounded-xl text-xs font-black hover:bg-cyan-700 transition-all flex items-center justify-center gap-2"
                            >
                              <FaPrescriptionBottle size={16} />
                              <span>RX</span>
                            </button>
                          </>
                        )}

                        {/* COMPLETED STATUS */}
                        {appointment.status === 'completed' && (
                          <div className="col-span-4 px-3 py-4 bg-purple-100 text-purple-600 rounded-xl text-xs font-black text-center">
                            ✓ Consultation Completed
                            {appointment.consultationNotes && (
                              <p className="text-[8px] mt-1 text-purple-500">{appointment.consultationNotes.substring(0, 50)}...</p>
                            )}
                          </div>
                        )}

                        {/* CANCELLED STATUS */}
                        {appointment.status === 'cancelled' && (
                          <div className="col-span-4 px-3 py-4 bg-red-100 text-red-600 rounded-xl text-xs font-black text-center">
                            ✗ Appointment Cancelled
                            {appointment.cancellationReason && (
                              <p className="text-[8px] mt-1">Reason: {appointment.cancellationReason}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div className="col-span-full py-32 bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl text-center">
              <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <LucideCalendar className="text-slate-400" size={48} />
              </div>
              <p className="text-lg font-black uppercase tracking-widest text-slate-400 mb-4">
                No Appointments Found
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Complete Appointment Modal */}
      <AnimatePresence>
        {showCompleteModal && completeAppointmentData && (
          <div className="fixed inset-0 bg-[#001b38]/80 backdrop-blur-xl flex items-center justify-center z-[90] p-4">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-8 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Complete Consultation</h2>
                    <p className="text-purple-100 text-sm mt-2">
                      {completeAppointmentData.patientName} • {completeAppointmentData.displayDate} at {completeAppointmentData.time}
                    </p>
                  </div>
                  <button onClick={() => setShowCompleteModal(false)} className="p-3 hover:bg-white/10 rounded-xl transition-all">
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-black text-[#001b38] mb-2">Consultation Notes</label>
                    <textarea
                      value={consultationNotes}
                      onChange={(e) => setConsultationNotes(e.target.value)}
                      rows="4"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder="Enter consultation notes, diagnosis, recommendations..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-[#001b38] mb-2">Prescription / Treatment Plan</label>
                    <textarea
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      rows="4"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder="Enter prescription details, medicines, dosage, follow-up instructions..."
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowCompleteModal(false)}
                      className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={handleComplete}
                      disabled={actionLoading === completeAppointmentData._id}
                      className="flex-1 py-4 bg-purple-600 text-white rounded-xl font-black text-sm hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {actionLoading === completeAppointmentData._id ? (
                        <FaSpinner className="animate-spin" size={16} />
                      ) : (
                        <FaCalendarCheck size={16} />
                      )}
                      COMPLETE CONSULTATION
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Medical Records Modal - Shows all attached records for the appointment */}
      <AnimatePresence>
        {showMedicalModal && selectedAppointment && (
          <div className="fixed inset-0 bg-[#001b38]/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white w-full max-w-3xl rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-8 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Attached Medical Records</h2>
                    <p className="text-cyan-100 text-sm mt-2">
                      {selectedAppointment.patientName} • {patientRecords.length} record(s) attached
                    </p>
                  </div>
                  <button onClick={() => setShowMedicalModal(false)} className="p-3 hover:bg-white/10 rounded-xl transition-all">
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>
              <div className="p-8 overflow-y-auto max-h-[65vh]">
                {patientRecords.length > 0 ? (
                  <div className="space-y-4">
                    {patientRecords.map((record, index) => (
                      <motion.div 
                        key={record.recordId || index}
                        whileHover={{ scale: 1.01 }}
                        className="border-2 border-slate-100 rounded-2xl p-5 hover:border-cyan-300 transition-all cursor-pointer"
                        onClick={() => viewMedicalRecord(record)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <FaFileMedical className="text-cyan-600" size={20} />
                            <div>
                              <h3 className="font-black text-lg text-[#001b38]">{record.recordName || 'Medical Record'}</h3>
                              <p className="text-xs text-slate-500 mt-1">
                                Uploaded by: {record.uploadedByName || 'Patient'} • 
                                {record.uploadedAt ? new Date(record.uploadedAt).toLocaleString() : 'Date unknown'}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs bg-cyan-100 text-cyan-700 px-3 py-1.5 rounded-full font-black">
                            {record.recordType || 'Document'}
                          </span>
                        </div>
                        
                        {record.files && record.files.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1">
                              <FaPaperclip size={10} /> {record.files.length} File(s)
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {record.files.slice(0, 3).map((file, fileIdx) => (
                                <div key={fileIdx} className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg text-[10px]">
                                  {getFileIcon(file.name)}
                                  <span className="truncate max-w-[120px]">{file.name}</span>
                                </div>
                              ))}
                              {record.files.length > 3 && (
                                <span className="text-[10px] text-slate-400">+{record.files.length - 3} more</span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-3 flex justify-end">
                          <span className="text-[10px] text-cyan-600 flex items-center gap-1">
                            <FaEye size={10} /> Click to view details
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FaFileMedical className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-400 font-black">No medical records attached to this appointment</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Single Record View Modal - Detailed view with files */}
      <AnimatePresence>
        {showRecordViewModal && selectedMedicalRecord && (
          <div className="fixed inset-0 bg-[#001b38]/80 backdrop-blur-xl flex items-center justify-center z-[60] p-4">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white w-full max-w-3xl rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-8 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">{selectedMedicalRecord.recordName || 'Medical Record'}</h2>
                    <p className="text-cyan-100 text-sm mt-2">
                      Uploaded: {selectedMedicalRecord.uploadedAt ? new Date(selectedMedicalRecord.uploadedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <button onClick={() => setShowRecordViewModal(false)} className="p-3 hover:bg-white/10 rounded-xl transition-all">
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>
              <div className="p-8 overflow-y-auto max-h-[65vh]">
                <div className="space-y-6">
                  {/* Uploader Info */}
                  <div className="bg-slate-50 p-5 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1">
                      <FaUser size={10} /> Uploaded By
                    </p>
                    <p className="font-black text-[#001b38] text-lg">{selectedMedicalRecord.uploadedByName || 'Patient'}</p>
                  </div>
                  
                  {/* Record Type */}
                  <div className="bg-slate-50 p-5 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1">
                      <FaFileMedical size={10} /> Record Type
                    </p>
                    <p className="font-black text-[#001b38]">{selectedMedicalRecord.recordType || 'Medical Document'}</p>
                  </div>
                  
                  {/* Record URL if exists */}
                  {selectedMedicalRecord.recordUrl && (
                    <div className="bg-slate-50 p-5 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1">
                        <FaLink size={10} /> Record URL
                      </p>
                      <a href={selectedMedicalRecord.recordUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-600 text-sm break-all hover:underline">
                        {selectedMedicalRecord.recordUrl}
                      </a>
                    </div>
                  )}
                  
                  {/* Attached Files Section with View/Download */}
                  {selectedMedicalRecord.files && selectedMedicalRecord.files.length > 0 && (
                    <div className="bg-slate-50 p-5 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-4 flex items-center gap-1">
                        <FaPaperclip size={10} /> Attached Files ({selectedMedicalRecord.files.length})
                      </p>
                      <div className="space-y-3">
                        {selectedMedicalRecord.files.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {getFileIcon(file.name)}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-[#001b38] text-sm truncate">{file.name}</p>
                                <p className="text-[9px] text-slate-400">
                                  {(file.size / 1024).toFixed(1)} KB • {file.fileType === 'image' ? 'Image' : 'Document'}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => viewFile(file)} 
                                className="p-2.5 text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all flex items-center gap-1"
                                title="View"
                              >
                                <FaEye size={14} />
                                <span className="text-[10px] hidden sm:inline">View</span>
                              </button>
                              <button 
                                onClick={() => handleDownloadFile(file)} 
                                className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all flex items-center gap-1"
                                title="Download"
                              >
                                <FaDownload size={14} />
                                <span className="text-[10px] hidden sm:inline">Download</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* File View Modal - For viewing images and PDFs */}
      <AnimatePresence>
        {showFileViewModal && selectedFile && (
          <div className="fixed inset-0 bg-[#001b38]/90 backdrop-blur-xl flex items-center justify-center z-[70] p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-5xl rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {getFileIcon(selectedFile.name)}
                    <div>
                      <h2 className="text-xl font-black">{selectedFile.name}</h2>
                      <p className="text-cyan-100 text-sm">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDownloadFile(selectedFile)} 
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                      title="Download"
                    >
                      <FaDownload size={20} />
                    </button>
                    <button 
                      onClick={() => setShowFileViewModal(false)} 
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                      title="Close"
                    >
                      <FaTimes size={20} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-8 max-h-[75vh] overflow-y-auto bg-[#1a1f2e] flex items-center justify-center">
                {selectedFile.fileType === 'image' || isImageFile(selectedFile.name) ? (
                  <div className="flex justify-center items-center min-h-[400px]">
                    <img 
                      src={selectedFile.data} 
                      alt={selectedFile.name} 
                      className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-lg" 
                    />
                  </div>
                ) : (
                  <div className="bg-white/10 rounded-2xl p-12 text-center max-w-md">
                    <FaFilePdf size={80} className="mx-auto text-red-400 mb-6" />
                    <p className="text-white font-bold text-lg mb-4">{selectedFile.name}</p>
                    <p className="text-slate-300 text-sm mb-6">PDF Document - {(selectedFile.size / 1024).toFixed(1)} KB</p>
                    <button 
                      onClick={() => handleDownloadFile(selectedFile)} 
                      className="bg-cyan-600 text-white px-8 py-4 rounded-xl font-black hover:bg-cyan-700 transition-all inline-flex items-center gap-3"
                    >
                      <FaDownload size={18} /> DOWNLOAD PDF
                    </button>
                    <p className="text-slate-400 text-xs mt-4">
                      Click download to view the complete PDF document
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Expired Modal */}
      <AnimatePresence>
        {showExpiredModal && (
          <div className="fixed inset-0 bg-[#001b38]/80 backdrop-blur-xl flex items-center justify-center z-[80] p-4">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaTrash className="text-amber-600" size={32} />
                </div>
                <h2 className="text-2xl font-black text-[#001b38] mb-4">Delete Expired from MongoDB?</h2>
                <p className="text-slate-500 mb-6">
                  You have <span className="font-black text-amber-600">{expiredCount}</span> expired appointment(s).
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowExpiredModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-xl font-black text-sm">
                    CANCEL
                  </button>
                  <button onClick={handleDeleteExpired} className="flex-1 py-4 bg-amber-600 text-white rounded-xl font-black text-sm hover:bg-amber-700">
                    DELETE
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocAppointments;