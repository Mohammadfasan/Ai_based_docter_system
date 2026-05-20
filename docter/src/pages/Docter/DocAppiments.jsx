// DocAppointments.jsx - EXPIRED SECTION REMOVED
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCalendarAlt, FaClock, FaUserCircle, FaCheck, FaTimes, FaVideo, 
  FaExclamationTriangle, FaUserMd, FaInfoCircle, FaCalendarCheck,
  FaFilter, FaSearch, FaStethoscope, FaCalendar, FaFileMedical, 
  FaMapMarkerAlt, FaClock as FaPending, FaFilePdf, FaFileImage, 
  FaFileAlt, FaDownload, FaEye, FaPaperclip, FaTrash, FaExclamationCircle,
  FaEnvelope, FaWallet, FaHeart, FaShieldAlt, FaLink, FaUser, FaPhoneAlt, 
  FaBell, FaSpinner, FaPrescriptionBottle, FaChevronDown, FaChevronUp,
  FaTimesCircle, FaCheckCircle, FaHourglassHalf, FaSyringe
} from 'react-icons/fa';
import { 
  Stethoscope, Award, Users, Calendar as LucideCalendar, Heart, Clock, 
  ShieldCheck, Activity, PlusCircle, Trash2, MapPin, User, Mail, 
  Phone as PhoneIcon, FileText, Video, Download, RefreshCw, XCircle,
  ZoomIn, ClipboardList, Pill, Brain
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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState(null);

  // Helper function to check if date is expired
  const isExpired = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(dateString);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate < today;
  };

  // Check if appointment is today
  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(dateString);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate.getTime() === today.getTime();
  };

  // Check if appointment is future
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
      
      let allAppointments = [];
      if (response.data && response.data.success) {
        allAppointments = response.data.data || [];
      } else if (response.data && Array.isArray(response.data)) {
        allAppointments = response.data;
      }
      
      console.log(`📋 Found ${allAppointments.length} total appointments`);
      
      // Show all appointments - don't filter out expired ones
      const formattedAppointments = allAppointments.map(apt => ({
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
        isExpired: isExpired(apt.date),
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
    showSuccessNotification('Appointments refreshed!');
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

  // View appointment details
  const viewAppointmentDetails = (appointment) => {
    setSelectedAppointmentDetails(appointment);
    setShowDetailsModal(true);
  };

  // ✅ CONFIRM APPOINTMENT
  const handleConfirm = async (id, patientEmail, patientName) => {
    setActionLoading(id);
    setError('');
    
    if (!window.confirm(`Confirm appointment for ${patientName}?\n\nPatient will receive a confirmation notification.`)) {
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
        showSuccessNotification(`✅ Appointment CONFIRMED for ${patientName}! Patient has been notified.`);
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

  // ❌ REJECT/CANCEL APPOINTMENT
  const handleCancel = async (id, patientEmail, patientName) => {
    setActionLoading(id);
    setError('');
    
    const reason = prompt('Reason for cancellation/rejection (optional):');
    
    if (!window.confirm(`Cancel appointment for ${patientName}? The patient will be notified.`)) {
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
        showSuccessNotification(`❌ Appointment CANCELLED for ${patientName}! Patient has been notified.`);
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
    setConsultationNotes(appointment.consultationNotes || '');
    setPrescription(appointment.prescription || '');
    setShowCompleteModal(true);
  };

  // ✅ COMPLETE APPOINTMENT
  const handleComplete = async () => {
    if (!completeAppointmentData) return;
    
    setActionLoading(completeAppointmentData._id);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.patch(
        `${API_URL}/appointments/${completeAppointmentData._id}/complete`,
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
        showSuccessNotification(`✅ Consultation completed for ${completeAppointmentData.patientName}!`);
        setShowCompleteModal(false);
        setConsultationNotes('');
        setPrescription('');
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

  // Filter appointments
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
      case 'future': matchesFilter = appointment.isFuture && appointment.status !== 'completed' && appointment.status !== 'cancelled'; break;
      case 'pending': matchesFilter = appointment.status === 'pending'; break;
      case 'confirmed': matchesFilter = appointment.status === 'confirmed'; break;
      case 'completed': matchesFilter = appointment.status === 'completed'; break;
      case 'cancelled': matchesFilter = appointment.status === 'cancelled'; break;
      default: matchesFilter = true;
    }
    return matchesSearch && matchesFilter;
  });

  // Statistics
  const pendingCount = appointments.filter(apt => apt.status === 'pending').length;
  const todayCount = appointments.filter(apt => apt.isToday).length;
  const futureCount = appointments.filter(apt => apt.isFuture && apt.status !== 'completed' && apt.status !== 'cancelled').length;
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
      case 'confirmed': return <FaCheckCircle className="text-green-600" size={14} />;
      case 'pending': return <FaHourglassHalf className="text-amber-600" size={14} />;
      case 'completed': return <FaCalendarCheck className="text-blue-600" size={14} />;
      case 'cancelled': return <FaTimesCircle className="text-red-600" size={14} />;
      default: return <FaInfoCircle className="text-gray-600" size={14} />;
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
      <div className="min-h-screen bg-gradient-to-br from-[#001b38] via-[#001b38] to-[#002d5a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-cyan-400 font-bold text-sm tracking-widest uppercase">Loading Appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pb-20" style={{ fontFamily: '"Inter", sans-serif' }}>
      
      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, x: 50, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 50, y: -20 }}
            className="fixed top-24 right-6 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <FaBell size={20} />
            <span className="font-bold text-sm">{notificationMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#001b38] via-[#001b38] to-[#002d5a] pt-24 pb-32 px-6 relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600')] opacity-5 bg-cover bg-center"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border border-cyan-500/30 backdrop-blur-sm">
                Doctor Portal
              </span>
              {pendingCount > 0 && (
                <span className="bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border border-amber-500/30 animate-pulse backdrop-blur-sm">
                  🔔 {pendingCount} Pending Request{pendingCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={refreshAppointments}
                disabled={refreshing}
                className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all backdrop-blur-sm"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none mb-6">
            <span className="text-cyan-400">Patient</span> Appointments
          </h1>
          <p className="text-slate-300 font-medium text-lg max-w-2xl">
            Manage patient visits, confirm appointments, add prescriptions, 
            and review medical records - all in one place.
          </p>
          <div className="flex gap-6 mt-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Pending: Awaiting your confirmation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Confirmed: Ready for consultation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Completed: Consultation done</span>
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-6">
            Last updated: {lastUpdate.toLocaleTimeString()} • Auto-refreshes every 30 seconds
          </p>
          
          {/* Search Bar */}
          <div className="mt-8 max-w-2xl">
            <div className="relative group">
              <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 flex items-center">
                <FaSearch className="ml-5 text-cyan-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by patient name, email, ID or symptoms..." 
                  className="w-full bg-transparent border-none outline-none p-4 text-white placeholder:text-slate-500 font-medium"
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="mr-4 text-slate-400 hover:text-white transition-colors">
                    <FaTimes size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 mb-6">
          <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-4">
            <p className="text-green-400 text-center font-bold">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 mb-6">
          <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-2xl p-4">
            <p className="text-red-400 text-center font-bold">{error}</p>
          </div>
        </div>
      )}

  

      {/* Filter Button */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="bg-white text-[#001b38] px-6 py-3 rounded-full shadow-lg font-bold text-xs tracking-widest uppercase flex items-center gap-3 hover:bg-cyan-500 hover:text-white transition-all duration-300"
        >
          <FaFilter size={14} />
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
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-black text-[#001b38] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <LucideCalendar size={14} className="text-cyan-500" />
                    DATE FILTERS
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => { setActiveFilter('all'); setShowFilters(false); }} className={`py-3 rounded-xl text-xs font-bold transition-all ${activeFilter === 'all' ? 'bg-[#001b38] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>All ({appointments.length})</button>
                    <button onClick={() => { setActiveFilter('today'); setShowFilters(false); }} className={`py-3 rounded-xl text-xs font-bold transition-all ${activeFilter === 'today' ? 'bg-cyan-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>Today ({todayCount})</button>
                    <button onClick={() => { setActiveFilter('future'); setShowFilters(false); }} className={`py-3 rounded-xl text-xs font-bold transition-all ${activeFilter === 'future' ? 'bg-blue-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>Upcoming ({futureCount})</button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-black text-[#001b38] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-cyan-500" />
                    STATUS FILTERS
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => { setActiveFilter('pending'); setShowFilters(false); }} className={`py-3 rounded-xl text-xs font-bold transition-all ${activeFilter === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>Pending ({pendingCount})</button>
                    <button onClick={() => { setActiveFilter('confirmed'); setShowFilters(false); }} className={`py-3 rounded-xl text-xs font-bold transition-all ${activeFilter === 'confirmed' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>Confirmed ({confirmedCount})</button>
                    <button onClick={() => { setActiveFilter('completed'); setShowFilters(false); }} className={`py-3 rounded-xl text-xs font-bold transition-all ${activeFilter === 'completed' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>Completed ({completedCount})</button>
                    <button onClick={() => { setActiveFilter('cancelled'); setShowFilters(false); }} className={`py-3 rounded-xl text-xs font-bold transition-all ${activeFilter === 'cancelled' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>Cancelled ({cancelledCount})</button>
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
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={appointment._id} 
                    className={`bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-all group relative ${
                      appointment.status === 'pending' ? 'border-l-8 border-l-amber-500' : 
                      appointment.status === 'confirmed' ? 'border-l-8 border-l-green-500' : 
                      appointment.status === 'completed' ? 'border-l-8 border-l-blue-500' : 
                      appointment.status === 'cancelled' ? 'border-l-8 border-l-red-500' : 'border-slate-100'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-[#001b38] to-[#002b4e] p-5 text-white">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg">
                          {appointment.patientName ? appointment.patientName.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-lg font-black">{appointment.patientName}</h3>
                            <span className={`px-2 py-1 rounded-lg text-[8px] font-black flex items-center gap-1 border backdrop-blur-sm ${getStatusColor(appointment.status)}`}>
                              {getStatusIcon(appointment.status)}
                              {appointment.status?.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                            <span className="flex items-center gap-1"><User size={12} className="text-cyan-400" /> ID: {typeof appointment.patientId === 'string' ? appointment.patientId.slice(-8) : 'N/A'}</span>
                            {appointment.patientEmail && appointment.patientEmail !== 'Not provided' && (
                              <span className="flex items-center gap-1"><Mail size={12} className="text-cyan-400" /> {appointment.patientEmail}</span>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => viewAppointmentDetails(appointment)}
                          className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                          title="View Details"
                        >
                          <FaInfoCircle size={16} className="text-cyan-300" />
                        </button>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                          <div className="p-1.5 bg-cyan-100 rounded-lg"><FaCalendarAlt className="text-cyan-600" size={12} /></div>
                          <div><p className="text-[8px] font-black text-slate-400 uppercase">Date</p><p className="font-bold text-[#001b38] text-sm">{appointment.displayDate}</p></div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                          <div className="p-1.5 bg-purple-100 rounded-lg"><FaClock className="text-purple-600" size={12} /></div>
                          <div><p className="text-[8px] font-black text-slate-400 uppercase">Time</p><p className="font-bold text-[#001b38] text-sm">{appointment.time}</p></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                          <div className="p-1.5 bg-cyan-100 rounded-lg"><MapPin size={12} className="text-cyan-700" /></div>
                          <div><p className="text-[8px] font-black text-slate-400 uppercase">Type</p><p className="font-bold text-[#001b38] text-sm">{appointment.type || 'Clinic Visit'}</p></div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl">
                          <div className="p-1.5 bg-emerald-100 rounded-lg"><FaWallet className="text-emerald-700" size={12} /></div>
                          <div><p className="text-[8px] font-black text-slate-400 uppercase">Fee</p><p className="font-bold text-[#001b38] text-sm">LKR {appointment.fee || 2500}</p></div>
                        </div>
                      </div>

                      <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                          <Brain size={10} /> Symptoms / Reason
                        </p>
                        <p className="text-sm font-medium text-[#001b38]">{appointment.symptoms || 'General consultation'}</p>
                      </div>

                      {/* ATTACHED MEDICAL RECORDS SECTION */}
                      {hasAttachments && (
                        <div className="mb-4 p-3 bg-cyan-50 rounded-xl border border-cyan-200">
                          <button
                            onClick={() => toggleAttachments(appointment._id)}
                            className="flex items-center justify-between w-full"
                          >
                            <div className="flex items-center gap-2">
                              <FaFileMedical className="text-cyan-600" size={14} />
                              <span className="text-[10px] font-black text-cyan-700 uppercase">
                                {appointment.attachedRecords.length} Medical Record(s) Attached
                              </span>
                            </div>
                            {isExpanded ? <FaChevronUp size={12} className="text-cyan-600" /> : <FaChevronDown size={12} className="text-cyan-600" />}
                          </button>
                          
                          {isExpanded && (
                            <div className="mt-2 space-y-2">
                              {appointment.attachedRecords.map((record, idx) => (
                                <div 
                                  key={record.recordId || idx} 
                                  className="bg-white rounded-xl p-2.5 border border-cyan-100 cursor-pointer hover:shadow-md transition-all"
                                  onClick={() => viewMedicalRecord(record)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <FaFileMedical className="text-cyan-600" size={12} />
                                      <span className="font-bold text-xs text-[#001b38]">
                                        {record.recordName || 'Medical Record'}
                                      </span>
                                    </div>
                                    <span className="text-[7px] font-black text-slate-400">
                                      {record.uploadedAt ? new Date(record.uploadedAt).toLocaleDateString() : ''}
                                    </span>
                                  </div>
                                  <p className="text-[8px] text-slate-500 mt-1">
                                    Uploaded by: {record.uploadedByName || 'Patient'}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ACTION BUTTONS */}
                      <div className="flex gap-2">
                        {/* View Medical Records Button */}
                        <button 
                          onClick={() => loadPatientAttachedRecords(appointment)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                            hasAttachments 
                              ? 'bg-cyan-500 text-white hover:bg-cyan-600' 
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                          disabled={!hasAttachments}
                        >
                          <FaFileMedical size={12} />
                          Records {hasAttachments && `(${appointment.attachedRecords.length})`}
                        </button>
                        
                        {/* Write Prescription Button (for confirmed/completed) */}
                        {(appointment.status === 'confirmed' || appointment.status === 'completed') && (
                          <button 
                            onClick={() => handleWritePrescription(appointment)}
                            className="flex-1 py-2.5 bg-purple-500 text-white rounded-xl text-xs font-black hover:bg-purple-600 transition-all flex items-center justify-center gap-2"
                          >
                            <FaPrescriptionBottle size={12} />
                            Prescription
                          </button>
                        )}
                        
                        {/* PENDING STATUS ACTIONS */}
                        {appointment.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleConfirm(appointment._id, appointment.patientEmail, appointment.patientName)}
                              disabled={actionLoading === appointment._id}
                              className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-xs font-black hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {actionLoading === appointment._id ? (
                                <FaSpinner className="animate-spin" size={12} />
                              ) : (
                                <FaCheck size={12} />
                              )}
                              Confirm
                            </button>
                            <button 
                              onClick={() => handleCancel(appointment._id, appointment.patientEmail, appointment.patientName)}
                              disabled={actionLoading === appointment._id}
                              className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {actionLoading === appointment._id ? (
                                <FaSpinner className="animate-spin" size={12} />
                              ) : (
                                <FaTimes size={12} />
                              )}
                              Reject
                            </button>
                          </>
                        )}
                        
                        {/* CONFIRMED STATUS ACTIONS */}
                        {appointment.status === 'confirmed' && (
                          <>
                            <button 
                              onClick={() => openCompleteModal(appointment)}
                              disabled={actionLoading === appointment._id}
                              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {actionLoading === appointment._id ? (
                                <FaSpinner className="animate-spin" size={12} />
                              ) : (
                                <FaCalendarCheck size={12} />
                              )}
                              Complete
                            </button>
                          </>
                        )}

                        {/* COMPLETED STATUS - Show info */}
                        {appointment.status === 'completed' && (
                          <div className="flex-1 py-2.5 bg-blue-100 text-blue-700 rounded-xl text-xs font-black text-center">
                            <div className="flex items-center justify-center gap-1">
                              <FaCheckCircle size={10} />
                              Consultation Completed
                            </div>
                          </div>
                        )}

                        {/* CANCELLED STATUS - Show info */}
                        {appointment.status === 'cancelled' && (
                          <div className="flex-1 py-2.5 bg-red-100 text-red-700 rounded-xl text-xs font-black text-center">
                            <div className="flex items-center justify-center gap-1">
                              <FaTimesCircle size={10} />
                              Cancelled
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-xl p-16 text-center"
            >
              <div className="bg-gradient-to-br from-slate-100 to-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <LucideCalendar className="text-slate-400" size={48} />
              </div>
              <p className="text-xl font-black uppercase tracking-wider text-slate-400 mb-2">
                No Appointments Found
              </p>
              <p className="text-slate-500">
                {searchQuery ? 'Try adjusting your search or filters' : 'New appointments will appear here when patients book'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Complete Appointment Modal */}
      <AnimatePresence>
        {showCompleteModal && completeAppointmentData && (
          <div className="fixed inset-0 bg-[#001b38]/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Complete Consultation</h2>
                    <p className="text-blue-100 text-sm mt-1">
                      {completeAppointmentData.patientName} • {completeAppointmentData.displayDate} at {completeAppointmentData.time}
                    </p>
                  </div>
                  <button onClick={() => setShowCompleteModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-black text-[#001b38] mb-2 flex items-center gap-2">
                      <ClipboardList size={16} className="text-blue-600" />
                      Consultation Notes
                    </label>
                    <textarea
                      value={consultationNotes}
                      onChange={(e) => setConsultationNotes(e.target.value)}
                      rows="4"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      placeholder="Enter consultation notes, diagnosis, recommendations..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-[#001b38] mb-2 flex items-center gap-2">
                      <Pill size={16} className="text-blue-600" />
                      Prescription / Treatment Plan
                    </label>
                    <textarea
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      rows="4"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      placeholder="Enter prescription details, medicines, dosage, follow-up instructions..."
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowCompleteModal(false)}
                      className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleComplete}
                      disabled={actionLoading === completeAppointmentData._id}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {actionLoading === completeAppointmentData._id ? (
                        <FaSpinner className="animate-spin" size={14} />
                      ) : (
                        <FaCalendarCheck size={14} />
                      )}
                      Complete Consultation
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Medical Records Modal */}
      <AnimatePresence>
        {showMedicalModal && selectedAppointment && (
          <div className="fixed inset-0 bg-[#001b38]/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Medical Records</h2>
                    <p className="text-cyan-100 text-sm mt-1">
                      {selectedAppointment.patientName} • {patientRecords.length} record(s) attached
                    </p>
                  </div>
                  <button onClick={() => setShowMedicalModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {patientRecords.length > 0 ? (
                  <div className="space-y-3">
                    {patientRecords.map((record, index) => (
                      <motion.div 
                        key={record.recordId || index}
                        whileHover={{ scale: 1.01 }}
                        className="border-2 border-slate-100 rounded-xl p-4 hover:border-cyan-300 transition-all cursor-pointer"
                        onClick={() => viewMedicalRecord(record)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <FaFileMedical className="text-cyan-600" size={20} />
                            <div>
                              <h3 className="font-black text-[#001b38]">{record.recordName || 'Medical Record'}</h3>
                              <p className="text-xs text-slate-500 mt-1">
                                Uploaded by: {record.uploadedByName || 'Patient'} • 
                                {record.uploadedAt ? new Date(record.uploadedAt).toLocaleDateString() : 'Date unknown'}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full font-black">
                            {record.recordType || 'Document'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaFileMedical className="mx-auto text-slate-300 mb-3" size={48} />
                    <p className="text-slate-400 font-medium">No medical records attached to this appointment</p>
                    <p className="text-slate-300 text-sm mt-1">Patients can upload records before the appointment</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Record Details Modal */}
      <AnimatePresence>
        {showRecordViewModal && selectedMedicalRecord && (
          <div className="fixed inset-0 bg-[#001b38]/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-6 text-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black">{selectedMedicalRecord.recordName || 'Medical Record'}</h2>
                  <button onClick={() => setShowRecordViewModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                    <FaTimes size={18} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                      <FaUser size={10} /> Uploaded By
                    </p>
                    <p className="font-bold text-[#001b38]">{selectedMedicalRecord.uploadedByName || 'Patient'}</p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                      <FaFileMedical size={10} /> Record Type
                    </p>
                    <p className="font-bold text-[#001b38]">{selectedMedicalRecord.recordType || 'Medical Document'}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                      <FaCalendarAlt size={10} /> Uploaded At
                    </p>
                    <p className="font-bold text-[#001b38]">
                      {selectedMedicalRecord.uploadedAt ? new Date(selectedMedicalRecord.uploadedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Appointment Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedAppointmentDetails && (
          <div className="fixed inset-0 bg-[#001b38]/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-[#001b38] to-[#002b4e] p-6 text-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black">Appointment Details</h2>
                  <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                    <FaTimes size={18} />
                  </button>
                </div>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Patient Information</p>
                    <p className="font-bold text-[#001b38] mt-1">{selectedAppointmentDetails.patientName}</p>
                    <p className="text-sm text-slate-600">{selectedAppointmentDetails.patientEmail !== 'Not provided' ? selectedAppointmentDetails.patientEmail : 'No email'}</p>
                    <p className="text-sm text-slate-600">{selectedAppointmentDetails.patientPhone !== 'Not provided' ? selectedAppointmentDetails.patientPhone : 'No phone'}</p>
                    <p className="text-xs text-slate-400 mt-1">Patient ID: {selectedAppointmentDetails.patientId}</p>
                  </div>

                  <div className="border-b pb-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Appointment Information</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div><p className="text-xs text-slate-500">Date:</p><p className="font-medium">{selectedAppointmentDetails.displayDate}</p></div>
                      <div><p className="text-xs text-slate-500">Time:</p><p className="font-medium">{selectedAppointmentDetails.time}</p></div>
                      <div><p className="text-xs text-slate-500">Type:</p><p className="font-medium">{selectedAppointmentDetails.type}</p></div>
                      <div><p className="text-xs text-slate-500">Fee:</p><p className="font-medium">LKR {selectedAppointmentDetails.fee}</p></div>
                    </div>
                  </div>

                  <div className="border-b pb-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Symptoms / Reason</p>
                    <p className="text-sm text-[#001b38] mt-1">{selectedAppointmentDetails.symptoms}</p>
                  </div>

                  {selectedAppointmentDetails.consultationNotes && (
                    <div className="border-b pb-3">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Consultation Notes</p>
                      <p className="text-sm text-[#001b38] mt-1 whitespace-pre-wrap">{selectedAppointmentDetails.consultationNotes}</p>
                    </div>
                  )}

                  {selectedAppointmentDetails.prescription && (
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Prescription</p>
                      <p className="text-sm text-[#001b38] mt-1 whitespace-pre-wrap">
                        {typeof selectedAppointmentDetails.prescription === 'string' 
                          ? selectedAppointmentDetails.prescription 
                          : selectedAppointmentDetails.prescription.diagnosis || 'Prescription available'}
                      </p>
                    </div>
                  )}
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