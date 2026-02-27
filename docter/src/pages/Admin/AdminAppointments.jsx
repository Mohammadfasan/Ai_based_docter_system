import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, FaClock, FaUserMd, FaUser, 
  FaFilter, FaSearch, FaCheck, FaTimes, FaEye,
  FaDownload, FaFileMedical, FaVideo, FaMapMarkerAlt,
  FaPhone, FaEnvelope, FaIdCard, FaCalendarCheck,
  FaExclamationTriangle, FaTrash, FaShieldAlt,
  FaStethoscope, FaHospital, FaMoneyBillWave,
  FaCheckCircle, FaTimesCircle, FaClock as FaPending,
  FaHistory, FaChartLine, FaUsers, FaUserCheck
} from 'react-icons/fa';
import { 
  Activity, TrendingUp, AlertCircle, Shield, 
  Calendar, Clock, Search, Filter, Download,
  Eye, Check, X, Trash2, ChevronRight, MoreVertical,
  FileText, Video, MapPin, Phone, Mail, User,
  Stethoscope, Award, Users, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminAppointments = ({ userType, userData, darkMode }) => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    video: 0,
    clinic: 0,
    totalRevenue: 0,
    uniquePatients: 0,
    uniqueDoctors: 0
  });

  useEffect(() => {
    loadAllData();
    // Auto refresh every 30 seconds
    const interval = setInterval(loadAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAllData = () => {
    setLoading(true);
    
    try {
      // Load all users
      const allUsers = JSON.parse(localStorage.getItem('healthai_users') || '[]');
      const doctorsList = allUsers.filter(u => u.userType === 'doctor');
      const patientsList = allUsers.filter(u => u.userType === 'patient');
      setDoctors(doctorsList);
      setPatients(patientsList);

      // Load all appointments
      const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      
      // Enhance appointments with full user details
      const enhancedAppointments = allAppointments.map(apt => {
        // Find doctor details
        const doctor = allUsers.find(u => 
          u.userId === apt.doctorId || 
          u.email === apt.doctorEmail ||
          u.name === apt.doctorName
        );
        
        // Find patient details
        const patient = allUsers.find(u => 
          u.userId === apt.patientId || 
          u.email === apt.patientEmail ||
          u.name === apt.patientName
        );
        
        return {
          ...apt,
          doctorDetails: doctor || {
            name: apt.doctorName || 'Unknown Doctor',
            specialization: apt.doctorSpecialization || 'General',
            phone: apt.doctorPhone || 'N/A',
            email: apt.doctorEmail || 'N/A'
          },
          patientDetails: patient || {
            name: apt.patientName || 'Unknown Patient',
            userId: apt.patientId || 'N/A',
            phone: apt.patientPhone || 'N/A',
            email: apt.patientEmail || 'N/A'
          },
          dateObj: apt.date ? new Date(apt.date) : null,
          isToday: apt.date ? isToday(apt.date) : false,
          isFuture: apt.date ? isFuture(apt.date) : false,
          isPast: apt.date ? isPast(apt.date) : false,
          fee: apt.fee || apt.consultationFee || 2500
        };
      });

      // Sort by date (newest first)
      enhancedAppointments.sort((a, b) => {
        if (!a.dateObj) return 1;
        if (!b.dateObj) return -1;
        return b.dateObj - a.dateObj;
      });

      setAppointments(enhancedAppointments);
      calculateStats(enhancedAppointments, doctorsList, patientsList);
      
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    }
    
    setLoading(false);
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const aptDate = new Date(dateString);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate.getTime() === today.getTime();
  };

  const isFuture = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const aptDate = new Date(dateString);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate > today;
  };

  const isPast = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const aptDate = new Date(dateString);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate < today;
  };

  const calculateStats = (apps, docs, pats) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayApps = apps.filter(apt => {
      if (!apt.date) return false;
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate.getTime() === today.getTime();
    });

    const totalRevenue = apps.reduce((sum, apt) => 
      sum + (apt.fee || apt.consultationFee || 2500), 0
    );

    const uniquePatientIds = new Set(apps.map(apt => apt.patientId).filter(id => id));
    const uniqueDoctorIds = new Set(apps.map(apt => apt.doctorId).filter(id => id));

    setStats({
      total: apps.length,
      today: todayApps.length,
      pending: apps.filter(apt => apt.status === 'pending').length,
      confirmed: apps.filter(apt => apt.status === 'confirmed').length,
      completed: apps.filter(apt => apt.status === 'completed').length,
      cancelled: apps.filter(apt => apt.status === 'cancelled').length,
      video: apps.filter(apt => apt.type?.includes('Video')).length,
      clinic: apps.filter(apt => !apt.type?.includes('Video')).length,
      totalRevenue: totalRevenue,
      uniquePatients: uniquePatientIds.size,
      uniqueDoctors: uniqueDoctorIds.size
    });
  };

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleCloseModal = () => {
    setShowAppointmentModal(false);
    setSelectedAppointment(null);
  };

  const handleUpdateStatus = (appointmentId, newStatus) => {
    const allApps = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedApps = allApps.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    );
    localStorage.setItem('appointments', JSON.stringify(updatedApps));
    
    // Reload data
    loadAllData();
    
    // Show notification
    alert(`✅ Appointment status updated to: ${newStatus}`);
  };

  const handleDeleteAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      const allApps = JSON.parse(localStorage.getItem('appointments') || '[]');
      const updatedApps = allApps.filter(apt => apt.id !== appointmentId);
      localStorage.setItem('appointments', JSON.stringify(updatedApps));
      
      // Reload data
      loadAllData();
      
      // Close modal if open
      if (selectedAppointment?.id === appointmentId) {
        setShowAppointmentModal(false);
        setSelectedAppointment(null);
      }
      
      alert('✅ Appointment deleted successfully');
    }
  };

  const handleDeleteAllExpired = () => {
    const expiredCount = appointments.filter(apt => isPast(apt.date)).length;
    
    if (expiredCount === 0) {
      alert('No expired appointments found');
      return;
    }
    
    if (window.confirm(`Delete all ${expiredCount} expired appointments?`)) {
      const allApps = JSON.parse(localStorage.getItem('appointments') || '[]');
      const updatedApps = allApps.filter(apt => !isPast(apt.date));
      localStorage.setItem('appointments', JSON.stringify(updatedApps));
      
      loadAllData();
      alert(`✅ Deleted ${expiredCount} expired appointments`);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(appointments, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `appointments_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctorId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.symptoms?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    
    let matchesDate = true;
    if (filterDate === 'today') matchesDate = apt.isToday;
    if (filterDate === 'future') matchesDate = apt.isFuture;
    if (filterDate === 'past') matchesDate = apt.isPast;
    
    const matchesType = filterType === 'all' || 
      (filterType === 'video' && apt.type?.includes('Video')) ||
      (filterType === 'clinic' && !apt.type?.includes('Video'));
    
    return matchesSearch && matchesStatus && matchesDate && matchesType;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-black flex items-center gap-1"><FaPending size={10} /> PENDING</span>;
      case 'confirmed':
        return <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-black flex items-center gap-1"><FaCheckCircle size={10} /> CONFIRMED</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-black flex items-center gap-1"><FaCheckCircle size={10} /> COMPLETED</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-black flex items-center gap-1"><FaTimesCircle size={10} /> CANCELLED</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-black">{status?.toUpperCase()}</span>;
    }
  };

  const getDateBadge = (apt) => {
    if (apt.isToday) return <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-black">TODAY</span>;
    if (apt.isFuture) return <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-black">UPCOMING</span>;
    if (apt.isPast) return <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-black">PAST</span>;
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-slate-600 font-bold">Loading Appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-[#f8fafc]'}`}>
      
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-b-3xl mb-8`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
                <FaCalendarAlt className="text-teal-500" />
                Appointment <span className="text-teal-500">Management</span>
              </h1>
              <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                View and manage all appointments across the system
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={loadAllData}
                className="px-4 py-2 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-600 transition-all flex items-center gap-2"
              >
                <Activity size={16} />
                REFRESH
              </button>
              <button 
                onClick={handleExportData}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all flex items-center gap-2"
              >
                <Download size={16} />
                EXPORT
              </button>
              <button 
                onClick={handleDeleteAllExpired}
                className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all flex items-center gap-2"
              >
                <Trash2 size={16} />
                CLEAN EXPIRED
              </button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-8">
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-teal-50'}`}>
              <p className="text-xs text-teal-600 font-black">TOTAL</p>
              <p className="text-xl font-black">{stats.total}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <p className="text-xs text-purple-600 font-black">TODAY</p>
              <p className="text-xl font-black">{stats.today}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-amber-50'}`}>
              <p className="text-xs text-amber-600 font-black">PENDING</p>
              <p className="text-xl font-black">{stats.pending}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <p className="text-xs text-green-600 font-black">CONFIRMED</p>
              <p className="text-xl font-black">{stats.confirmed}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className="text-xs text-blue-600 font-black">COMPLETED</p>
              <p className="text-xl font-black">{stats.completed}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
              <p className="text-xs text-red-600 font-black">CANCELLED</p>
              <p className="text-xl font-black">{stats.cancelled}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}>
              <p className="text-xs text-indigo-600 font-black">VIDEO</p>
              <p className="text-xl font-black">{stats.video}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-emerald-50'}`}>
              <p className="text-xs text-emerald-600 font-black">CLINIC</p>
              <p className="text-xl font-black">{stats.clinic}</p>
            </div>
          </div>

          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-emerald-50'}`}>
              <p className="text-xs text-emerald-600 font-black">TOTAL REVENUE</p>
              <p className="text-xl font-black">LKR {stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className="text-xs text-blue-600 font-black">UNIQUE PATIENTS</p>
              <p className="text-xl font-black">{stats.uniquePatients}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-teal-50'}`}>
              <p className="text-xs text-teal-600 font-black">UNIQUE DOCTORS</p>
              <p className="text-xl font-black">{stats.uniqueDoctors}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <p className="text-xs text-purple-600 font-black">AVG. FEE</p>
              <p className="text-xl font-black">
                LKR {stats.total > 0 ? Math.round(stats.totalRevenue / stats.total) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by doctor, patient, ID, symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 outline-none ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white'
              }`}
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 outline-none ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white'
              }`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className={`px-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 outline-none ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white'
              }`}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="future">Upcoming</option>
              <option value="past">Past</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 outline-none ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white'
              }`}
            >
              <option value="all">All Types</option>
              <option value="video">Video</option>
              <option value="clinic">Clinic</option>
            </select>
            
            <button className="p-4 bg-teal-500 text-white rounded-2xl hover:bg-teal-600 transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Appointments Table */}
        <div className={`rounded-2xl shadow-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}>
                  <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">Date & Time</th>
                  <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">Doctor</th>
                  <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">Patient</th>
                  <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">Type</th>
                  <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">Status</th>
                  <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">Fee</th>
                  <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((apt) => (
                    <tr 
                      key={apt.id} 
                      className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-slate-100 hover:bg-slate-50'} transition-colors`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 font-bold">
                            <FaCalendarAlt className="text-teal-500" size={12} />
                            {formatDate(apt.date)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                            <FaClock className="text-teal-500" size={10} />
                            {formatTime(apt.time)}
                          </div>
                          {getDateBadge(apt)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-black">
                            {apt.doctorName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-sm">{apt.doctorName}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <FaStethoscope size={10} />
                              {apt.doctorSpecialization || 'General'}
                            </p>
                            <p className="text-[9px] text-slate-400">ID: {apt.doctorId || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black">
                            {apt.patientName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-sm">{apt.patientName}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <FaIdCard size={10} />
                              {apt.patientId || 'N/A'}
                            </p>
                            {apt.patientEmail && (
                              <p className="text-[9px] text-slate-400">{apt.patientEmail}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {apt.type?.includes('Video') ? (
                            <>
                              <FaVideo className="text-purple-500" />
                              <span className="text-sm font-bold text-purple-600">Video</span>
                            </>
                          ) : (
                            <>
                              <FaMapMarkerAlt className="text-teal-500" />
                              <span className="text-sm font-bold text-teal-600">Clinic</span>
                            </>
                          )}
                        </div>
                        {apt.symptoms && (
                          <p className="text-[9px] text-slate-400 mt-1 truncate max-w-[150px]">
                            {apt.symptoms}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(apt.status)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-black text-emerald-600">
                          LKR {apt.fee?.toLocaleString() || 2500}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleViewAppointment(apt)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View Details"
                          >
                            <FaEye size={14} />
                          </button>
                          
                          {apt.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                title="Confirm"
                              >
                                <FaCheck size={14} />
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Cancel"
                              >
                                <FaTimes size={14} />
                              </button>
                            </>
                          )}
                          
                          {apt.status === 'confirmed' && (
                            <button 
                              onClick={() => handleUpdateStatus(apt.id, 'completed')}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Mark Complete"
                            >
                              <FaCheckCircle size={14} />
                            </button>
                          )}
                          
                          <button 
                            onClick={() => handleDeleteAppointment(apt.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-20">
                      <FaCalendarAlt className="text-5xl text-slate-300 mx-auto mb-4" />
                      <h3 className="text-2xl font-black text-slate-400">No Appointments Found</h3>
                      <p className="text-slate-400">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Summary */}
          <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-slate-200'} flex justify-between items-center`}>
            <p className="text-sm text-slate-500">
              Showing {filteredAppointments.length} of {appointments.length} appointments
            </p>
            <p className="text-sm font-bold">
              Total Revenue: <span className="text-emerald-600">LKR {stats.totalRevenue.toLocaleString()}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      <AnimatePresence>
        {showAppointmentModal && selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`max-w-3xl w-full rounded-2xl shadow-2xl overflow-hidden ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`p-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black">Appointment Details</h2>
                    <p className="text-teal-100">ID: {selectedAppointment.id}</p>
                  </div>
                  <button 
                    onClick={handleCloseModal}
                    className="text-white/60 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Status & Date */}
                <div className="flex justify-between items-center">
                  {getStatusBadge(selectedAppointment.status)}
                  {getDateBadge(selectedAppointment)}
                </div>

                {/* Doctor Info */}
                <div>
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <FaUserMd className="text-teal-500" />
                    Doctor Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Name</p>
                      <p className="font-black text-lg">{selectedAppointment.doctorName}</p>
                    </div>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Specialization</p>
                      <p className="font-black">{selectedAppointment.doctorSpecialization || 'General'}</p>
                    </div>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Doctor ID</p>
                      <p className="font-mono text-sm">{selectedAppointment.doctorId || 'N/A'}</p>
                    </div>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Email</p>
                      <p className="text-sm">{selectedAppointment.doctorEmail || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Patient Info */}
                <div>
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <FaUser className="text-teal-500" />
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Name</p>
                      <p className="font-black text-lg">{selectedAppointment.patientName}</p>
                    </div>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Patient ID</p>
                      <p className="font-mono text-sm">{selectedAppointment.patientId || 'N/A'}</p>
                    </div>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Email</p>
                      <p className="text-sm">{selectedAppointment.patientEmail || 'N/A'}</p>
                    </div>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Phone</p>
                      <p className="text-sm">{selectedAppointment.patientPhone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div>
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <FaCalendarAlt className="text-teal-500" />
                    Appointment Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Date</p>
                      <p className="font-black flex items-center gap-2">
                        <FaCalendarAlt className="text-teal-500" size={12} />
                        {formatDate(selectedAppointment.date)}
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Time</p>
                      <p className="font-black flex items-center gap-2">
                        <FaClock className="text-teal-500" size={12} />
                        {formatTime(selectedAppointment.time)}
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Type</p>
                      <p className="font-black flex items-center gap-2">
                        {selectedAppointment.type?.includes('Video') ? (
                          <>
                            <FaVideo className="text-purple-500" size={12} />
                            Video Consultation
                          </>
                        ) : (
                          <>
                            <FaMapMarkerAlt className="text-teal-500" size={12} />
                            Clinic Visit
                          </>
                        )}
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Fee</p>
                      <p className="font-black text-emerald-600">
                        LKR {selectedAppointment.fee?.toLocaleString() || 2500}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Symptoms */}
                {selectedAppointment.symptoms && (
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-amber-50'}`}>
                    <p className="text-xs text-slate-400 mb-2">Symptoms / Reason</p>
                    <p className="font-medium">{selectedAppointment.symptoms}</p>
                  </div>
                )}

                {/* Location / Video Link */}
                {(selectedAppointment.location || selectedAppointment.videoLink) && (
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <p className="text-xs text-slate-400 mb-2">
                      {selectedAppointment.location ? 'Location' : 'Video Meeting Link'}
                    </p>
                    <p className="font-mono text-sm break-all">
                      {selectedAppointment.location || selectedAppointment.videoLink}
                    </p>
                  </div>
                )}

                {/* Attached Records */}
                {selectedAppointment.attachedRecords && selectedAppointment.attachedRecords.length > 0 && (
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                    <p className="text-xs text-slate-400 mb-2">Attached Medical Records</p>
                    <div className="space-y-2">
                      {selectedAppointment.attachedRecords.map((recId, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                          <FaFileMedical className="text-purple-600" size={12} />
                          <span className="text-sm font-medium">{recId}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-slate-200'} flex justify-end gap-3`}>
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 transition-all font-bold text-sm"
                >
                  Close
                </button>
                
                {selectedAppointment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedAppointment.id, 'confirmed');
                        handleCloseModal();
                      }}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold text-sm flex items-center gap-2"
                    >
                      <FaCheck size={14} />
                      Confirm
                    </button>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedAppointment.id, 'cancelled');
                        handleCloseModal();
                      }}
                      className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold text-sm flex items-center gap-2"
                    >
                      <FaTimes size={14} />
                      Cancel
                    </button>
                  </>
                )}
                
                {selectedAppointment.status === 'confirmed' && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedAppointment.id, 'completed');
                      handleCloseModal();
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-sm flex items-center gap-2"
                  >
                    <FaCheckCircle size={14} />
                    Mark Complete
                  </button>
                )}
                
                <button
                  onClick={() => {
                    handleDeleteAppointment(selectedAppointment.id);
                    handleCloseModal();
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold text-sm flex items-center gap-2"
                >
                  <FaTrash size={14} />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAppointments;