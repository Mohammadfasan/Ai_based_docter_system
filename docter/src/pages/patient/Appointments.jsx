// Appointments.jsx - With Delete for Expired & Old Completed Appointments
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, Clock, Stethoscope, RefreshCw, 
  PlusCircle, FileText, Paperclip, ExternalLink, 
  AlertCircle, Trash2, Eye, Download, X, Clock as ClockIcon,
  Image, File, ChevronDown, ChevronUp, CheckCircle, Clock as PendingIcon,
  FileText as PrescriptionIcon, Pill, Sparkles, Shield, Heart, Users, 
  ClipboardCheck, CalendarCheck, Video, MapPin, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../../services/appointmentAPI';

const APPOINTMENT_HERO_IMAGE = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop";

// ✅ FIX: Use environment variable instead of hardcoded localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [activeAppointmentId, setActiveAppointmentId] = useState(null);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [expiredCount, setExpiredCount] = useState(0);
  const [oldCompletedCount, setOldCompletedCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [expandedAttachments, setExpandedAttachments] = useState({});
  const [expandedPrescription, setExpandedPrescription] = useState({});
  const [attachingRecordId, setAttachingRecordId] = useState(null);
  const [attachingError, setAttachingError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Features for hero section
  const features = [
    { icon: Shield, title: "Secure Platform", description: "HIPAA compliant & encrypted", color: "text-teal-400" },
    { icon: Clock, title: "Instant Updates", description: "Real-time status changes", color: "text-blue-400" },
    { icon: Video, title: "Video Consult", description: "Connect from anywhere", color: "text-purple-400" },
    { icon: FileText, title: "Digital Records", description: "Access prescriptions online", color: "text-emerald-400" }
  ];

  // Status steps for timeline
  const statusSteps = [
    { status: "pending", label: "Booking Request", icon: Clock, description: "Your appointment request is sent to doctor", color: "amber" },
    { status: "confirmed", label: "Confirmed by Doctor", icon: CheckCircle, description: "Doctor has confirmed your appointment", color: "emerald" },
    { status: "completed", label: "Consultation Completed", icon: ClipboardCheck, description: "Visit completed, prescription available", color: "blue" }
  ];

  // Helper function to check if date is expired (past date)
  const isExpired = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(dateString);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate < today;
  };

  // Check if appointment is older than 7 weeks (49 days) - for completed appointments
  const isOlderThan7Weeks = (dateString) => {
    if (!dateString) return false;
    const sevenWeeksAgo = new Date();
    sevenWeeksAgo.setDate(sevenWeeksAgo.getDate() - 49); // 7 weeks = 49 days
    sevenWeeksAgo.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(dateString);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate < sevenWeeksAgo;
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(dateString);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate.getTime() === today.getTime();
  };

  // Get status badge styling
  const getStatusBadge = (status, date) => {
    if (isToday(date)) {
      return 'bg-purple-50 text-purple-600 border-purple-100';
    }
    switch(status) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'pending':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'completed':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'no-show':
        return 'bg-gray-50 text-gray-600 border-gray-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed':
        return <CheckCircle size={14} className="text-emerald-500" />;
      case 'pending':
        return <PendingIcon size={14} className="text-amber-500 animate-pulse" />;
      case 'completed':
        return <FileText size={14} className="text-blue-500" />;
      case 'cancelled':
        return <AlertCircle size={14} className="text-red-500" />;
      default:
        return <Calendar size={14} />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'confirmed':
        return 'CONFIRMED';
      case 'pending':
        return 'PENDING';
      case 'completed':
        return 'COMPLETED';
      case 'cancelled':
        return 'CANCELLED';
      case 'no-show':
        return 'NO SHOW';
      default:
        return status?.toUpperCase() || 'UNKNOWN';
    }
  };

  // Get status progress percentage
  const getStatusProgress = (status) => {
    switch(status) {
      case 'pending': return 33;
      case 'confirmed': return 66;
      case 'completed': return 100;
      default: return 0;
    }
  };

  // Get status color for timeline
  const getStatusColor = (status, stepStatus) => {
    const stepOrder = ['pending', 'confirmed', 'completed'];
    const currentIndex = stepOrder.indexOf(status);
    const stepIndex = stepOrder.indexOf(stepStatus);
    
    if (stepIndex < currentIndex) return 'bg-emerald-500';
    if (stepIndex === currentIndex) {
      if (status === 'pending') return 'bg-amber-500 animate-pulse';
      if (status === 'confirmed') return 'bg-emerald-500';
      if (status === 'completed') return 'bg-blue-500';
      return 'bg-gray-300';
    }
    return 'bg-gray-200';
  };

  // Helper function for step order index
  const stepOrderIndex = (status) => {
    const order = ['pending', 'confirmed', 'completed'];
    return order.indexOf(status);
  };

  // Toggle prescription expansion
  const togglePrescription = (appointmentId) => {
    setExpandedPrescription(prev => ({
      ...prev,
      [appointmentId]: !prev[appointmentId]
    }));
  };

  // ✅ MAIN LOAD DATA FUNCTION
  const loadData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    
    try {
      const currentUserData = localStorage.getItem('currentUser');
      const token = localStorage.getItem('token');

      console.group('🔄 [LOAD APPOINTMENTS]');
      console.log('Current user data:', currentUserData ? 'Present' : 'Missing');
      console.log('Token:', token ? 'Present' : 'Missing');

      if (!currentUserData || !token) {
        console.error('❌ Missing user data or token - redirecting to login');
        console.groupEnd();
        navigate('/login');
        return;
      }

      const user = JSON.parse(currentUserData);
      setCurrentUser(user);

      console.log('👤 User:', {
        name: user.name,
        email: user.email,
        userId: user.userId || user._id,
        userType: user.userType
      });

      // Fetch appointments using API
      console.log('📋 Fetching appointments for this patient...');
      const response = await appointmentAPI.getMyAppointments();

      console.log('📊 API Response:', {
        success: response.success,
        count: response.count,
        dataLength: response.data?.length || 0
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to load appointments');
      }

      const allApps = response.data || [];
      console.log('Total appointments received:', allApps.length);

      // Filter to ensure ALL appointments belong to this patient
      const validatedAppointments = allApps.filter(app => {
        const appPatientId = app.patientId?._id || app.patientId || '';
        const currentPatientId = user._id || user.userId;

        const isValid = appPatientId.toString() === currentPatientId.toString();

        if (!isValid) {
          console.warn('⚠️ FILTERING OUT appointment not owned by patient:', {
            appointmentPatientId: appPatientId,
            currentPatientId: currentPatientId,
            appointmentId: app._id,
            doctorName: app.doctorName
          });
        }

        return isValid;
      });

      console.log('✅ Validated appointments:', validatedAppointments.length, 'out of', allApps.length);

      // Count expired (past date)
      const expired = validatedAppointments.filter(app => isExpired(app.date));
      
      // Count old completed appointments (completed status + older than 7 weeks)
      const oldCompleted = validatedAppointments.filter(app => 
        app.status === 'completed' && isOlderThan7Weeks(app.date)
      );
      
      console.log('Expired count (past date):', expired.length);
      console.log('Old completed count (7+ weeks):', oldCompleted.length);
      
      // Sort appointments
      const sorted = validatedAppointments.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Log prescriptions found
      const withPrescriptions = sorted.filter(a => a.prescription || a.prescriptionId);
      console.log('📋 Appointments with prescriptions:', withPrescriptions.length);

      setExpiredCount(expired.length);
      setOldCompletedCount(oldCompleted.length);
      setAppointments(sorted);
      setLastUpdate(new Date());

      console.groupEnd();

      // Load medical records from BACKEND API
      const patientId = user?.userId || user?._id;
      console.log('📋 Fetching medical records from backend for patient:', patientId);
      
      try {
        // ✅ Using environment variable for API URL
        const recordsResponse = await fetch(`${API_BASE_URL}/medical-records/${patientId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!recordsResponse.ok) {
          throw new Error(`Failed to fetch records: ${recordsResponse.status}`);
        }

        const recordsData = await recordsResponse.json();
        
        if (recordsData.success && Array.isArray(recordsData.data)) {
          console.log('✅ Medical records loaded from backend:', recordsData.data.length);
          setMedicalRecords(recordsData.data);
        } else {
          console.warn('⚠️ Failed to load records from backend:', recordsData.message);
          setMedicalRecords([]);
        }
      } catch (recordError) {
        console.warn('⚠️ Error loading medical records:', recordError.message);
        setMedicalRecords([]);
      }
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      console.groupEnd();
      setError(error.message || 'Failed to load appointments');
      setAppointments([]);
      setMedicalRecords([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  // Load data on mount
  useEffect(() => {
    console.log('📍 Appointments component mounted');
    loadData();
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh triggered');
      loadData(true);
    }, 30000);

    return () => {
      clearInterval(interval);
      console.log('📍 Appointments component unmounted');
    };
  }, [loadData]);

  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    loadData(true);
  };

  // 🗑️ DELETE ALL EXPIRED & OLD COMPLETED APPOINTMENTS
  const handleDeleteAllOldAppointments = async () => {
    setDeletingId('all');
    try {
      console.log('🗑️ Deleting ALL expired and old completed appointments');
      
      // Get appointments to delete
      const toDelete = appointments.filter(app => {
        const isExpiredApp = isExpired(app.date);
        const isOldCompleted = app.status === 'completed' && isOlderThan7Weeks(app.date);
        return isExpiredApp || isOldCompleted;
      });
      
      console.log(`Found ${toDelete.length} appointments to delete`);
      
      let deletedCount = 0;
      for (const app of toDelete) {
        try {
          const response = await appointmentAPI.deleteAppointment(app._id);
          if (response.success) {
            deletedCount++;
            console.log(`✅ Deleted: ${app._id} (${app.doctorName} - ${app.date})`);
          }
        } catch (err) {
          console.error(`❌ Failed to delete ${app._id}:`, err);
        }
      }
      
      console.log(`✅ Total deleted: ${deletedCount} appointments`);
      await loadData();
      alert(`✅ Successfully deleted ${deletedCount} old appointments!`);
      setShowExpiredModal(false);
      
    } catch (error) {
      console.error('❌ Error deleting old appointments:', error);
      alert('Failed to delete old appointments');
    } finally {
      setDeletingId(null);
    }
  };

  // 🗑️ DELETE SINGLE APPOINTMENT (For any status - Pending, Expired, Completed)
  const handleDeleteSingleAppointment = async (appointmentId) => {
    setDeletingId(appointmentId);
    try {
      console.log('🗑️ Deleting single appointment:', appointmentId);
      const response = await appointmentAPI.deleteAppointment(appointmentId);
      
      if (response.success) {
        console.log('✅ Appointment deleted successfully');
        await loadData();
        alert('✅ Appointment deleted successfully!');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ Error deleting appointment:', error);
      alert('Failed to delete appointment');
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

  const handleAttachRecord = async (appointmentId, record) => {
    setAttachingRecordId(record._id);
    setAttachingError('');

    try {
      const recordUrl = record.files?.[0]?.cloudinaryUrl || 
                        record.files?.[0]?.data || 
                        '';

      const recordData = {
        recordId: record._id,
        recordType: record.type || 'medical_record',
        recordName: record.diagnosis || record.type || 'Medical Record',
        recordUrl: recordUrl,
        uploadedBy: currentUser?.name || 'Patient'
      };
      
      console.log('📎 Attaching record:', recordData);
      
      const response = await appointmentAPI.attachRecord(appointmentId, record._id, recordData);
      
      if (response.success) {
        console.log('✅ Record attached successfully');
        await loadData();
        setShowAttachModal(false);
        setActiveAppointmentId(null);
        alert('✅ Medical record attached successfully!');
      } else {
        throw new Error(response.message || 'Failed to attach record');
      }
    } catch (error) {
      console.error('❌ Error attaching record:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to attach record';
      setAttachingError(errorMsg);
      alert('Error: ' + errorMsg);
    } finally {
      setAttachingRecordId(null);
    }
  };

  const getRecordById = (recordId) => {
    return medicalRecords.find(r => r._id === recordId || r.id === recordId);
  };

  const handleViewAttachedFile = (record, file) => {
    setSelectedRecord(record);
    setSelectedFile(file);
    setShowViewModal(true);
  };

  const handleDownloadFile = (file) => {
    if (file.cloudinaryUrl) {
      window.open(file.cloudinaryUrl, '_blank');
    } else if (file.data) {
      const link = document.createElement('a');
      link.href = file.data;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const toggleAttachments = (appointmentId) => {
    setExpandedAttachments(prev => ({
      ...prev,
      [appointmentId]: !prev[appointmentId]
    }));
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'image') return <Image size={12} />;
    return <File size={12} />;
  };

  const handleViewFullPrescription = (appointment) => {
    navigate('/prescriptions', { 
      state: { 
        prescriptionId: appointment.prescriptionId,
        appointment: appointment,
        viewSpecificPrescription: true,
        patientId: appointment.patientId,
        patientName: appointment.patientName
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-teal-600" size={40} />
          <p className="text-slate-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  // Count appointments by status
  const totalDeletable = expiredCount + oldCompletedCount;
  const pendingCount = appointments.filter(a => a.status === 'pending' && !isExpired(a.date)).length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed' && !isExpired(a.date)).length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Plus_Jakarta_Sans'] pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div className="max-w-[90rem] mx-auto px-6 lg:px-20 py-16 lg:py-24 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20">
                <Sparkles size={16} className="text-teal-400" />
                <span className="text-white text-sm font-medium">Your Health Journey Tracker</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tighter mb-6 leading-tight">
                Your 
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
                  Appointments
                </span>
              </h1>
              
              <p className="text-base lg:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Track all your medical appointments in one place. View upcoming visits, access prescriptions, 
                and manage your medical records securely. Get real-time updates on your appointment status.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {features.map((feature, idx) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                      <FeatureIcon size={20} className={`${feature.color} mx-auto mb-2`} />
                      <p className="text-white text-xs font-bold">{feature.title}</p>
                      <p className="text-slate-400 text-[9px]">{feature.description}</p>
                    </div>
                  );
                })}
              </div>

              
            </div>

            <div className="flex-1">
              <div className="rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={APPOINTMENT_HERO_IMAGE}
                  alt="Medical Appointments" 
                  className="w-full h-auto object-cover"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="none" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Status Timeline Guide Section */}
      <section className="max-w-[90rem] mx-auto px-6 lg:px-20 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-teal-50 rounded-full px-4 py-2 mb-4">
            <Calendar size={16} className="text-teal-600" />
            <span className="text-teal-700 text-sm font-bold">Appointment Status Guide</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#0f172a]">
            Track Your <span className="text-teal-500">Appointment Journey</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto mt-2">
            Follow the real-time status of your appointments from booking to completion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {statusSteps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <div key={step.status} className="bg-white rounded-2xl p-6 text-center shadow-lg border border-slate-100 relative">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 
                  ${step.color === 'amber' ? 'bg-amber-50 text-amber-500' : 
                    step.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' : 
                    'bg-blue-50 text-blue-500'}`}>
                  <StepIcon size={32} />
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full 
                    ${step.color === 'amber' ? 'bg-amber-500' : 
                      step.color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  <h3 className="font-black text-[#0f172a]">{step.label}</h3>
                </div>
                <p className="text-xs text-slate-500">{step.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight size={24} className="text-slate-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 lg:px-20 relative z-20">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm flex items-start gap-3">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Delete Old Appointments Banner */}
        {totalDeletable > 0 && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-red-50 border border-amber-200 rounded-[2rem] p-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Trash2 className="text-amber-600" size={24} />
              </div>
              <div>
                <p className="font-black text-amber-800">
                  {expiredCount > 0 && `${expiredCount} Past appointment(s)`}
                  {expiredCount > 0 && oldCompletedCount > 0 && ' + '}
                  {oldCompletedCount > 0 && `${oldCompletedCount} Old completed (7+ weeks)`}
                </p>
                <p className="text-sm text-amber-600">Delete old appointments to keep your list clean</p>
              </div>
            </div>
            <button
              onClick={() => setShowExpiredModal(true)}
              disabled={deletingId === 'all'}
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-black text-sm hover:bg-red-700 transition-all flex items-center gap-2"
            >
              {deletingId === 'all' ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              DELETE ALL OLD ({totalDeletable})
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {/* Refresh Header */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-500 text-sm">
                  Showing {appointments.length} appointment(s)
                </p>
                <p className="text-slate-400 text-xs">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:bg-slate-50"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {appointments.length > 0 ? (
              appointments.map((app) => {
                const isTodayApp = isToday(app.date);
                const isPending = app.status === 'pending';
                const isConfirmed = app.status === 'confirmed';
                const isCancelled = app.status === 'cancelled';
                const isCompleted = app.status === 'completed';
                const isExpiredApp = isExpired(app.date);
                const isOldCompleted = isCompleted && isOlderThan7Weeks(app.date);
                const isDeletable = isExpiredApp || isOldCompleted || isPending;
                const progressPercentage = getStatusProgress(app.status);
                
                const attachedRecords = (app.attachedRecords || []).map(rec => {
                  if (rec.recordId) {
                    const fullRecord = getRecordById(rec.recordId);
                    if (fullRecord) {
                      return {
                        ...rec,
                        ...fullRecord,
                        files: fullRecord.files || []
                      };
                    }
                  }
                  return rec;
                });
                
                const hasAttachments = attachedRecords.length > 0;
                const hasPrescription = app.prescription || app.prescriptionId;
                const isExpanded = expandedAttachments[app._id];
                const isPrescriptionExpanded = expandedPrescription[app._id];
                
                return (
                  <div 
                    key={app._id} 
                    className={`bg-white rounded-[2.5rem] p-8 shadow-xl border transition-all group ${
                      isExpiredApp ? 'opacity-75 border-gray-200 bg-gray-50' :
                      isTodayApp ? 'border-purple-300 bg-purple-50/30' : 'border-white hover:border-teal-200'
                    } ${isPending ? 'border-l-8 border-l-amber-400' : ''} ${
                      isConfirmed ? 'border-l-8 border-l-emerald-400' : ''
                    } ${isCompleted && !isOldCompleted ? 'border-l-8 border-l-blue-400' : ''} ${
                      isOldCompleted ? 'border-l-8 border-l-gray-400 opacity-60' : ''
                    }`}
                  >
                    {/* Status Badges */}
                    {isExpiredApp && (
                      <div className="mb-4">
                        <span className="px-4 py-2 bg-gray-500 text-white rounded-full text-xs font-black">
                          PAST DATE - CAN DELETE
                        </span>
                      </div>
                    )}

                    {isOldCompleted && (
                      <div className="mb-4">
                        <span className="px-4 py-2 bg-gray-400 text-white rounded-full text-xs font-black">
                          OLD COMPLETED (7 WEEKS) - CAN DELETE
                        </span>
                      </div>
                    )}

                    {isTodayApp && !isExpiredApp && (
                      <div className="mb-4">
                        <span className="px-4 py-2 bg-purple-600 text-white rounded-full text-xs font-black animate-pulse">
                          TODAY - UPCOMING
                        </span>
                      </div>
                    )}

                    {/* Status Progress Bar */}
                    {!isExpiredApp && !isCancelled && !isOldCompleted && (
                      <div className="mb-6">
                        <div className="flex justify-between text-[10px] font-bold mb-1">
                          <span className={isPending ? 'text-amber-600' : isConfirmed ? 'text-emerald-600' : isCompleted ? 'text-blue-600' : 'text-slate-400'}>
                            {isPending && '📋 Request Sent'}
                            {isConfirmed && '✅ Doctor Confirmed'}
                            {isCompleted && '🎉 Consultation Completed'}
                          </span>
                          <span className="text-slate-400">{progressPercentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              isPending ? 'bg-amber-500' : isConfirmed ? 'bg-emerald-500' : isCompleted ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Status Timeline */}
                    {!isExpiredApp && !isCancelled && !isOldCompleted && (
                      <div className="mb-6 flex items-center justify-between">
                        {statusSteps.map((step, idx) => {
                          const StepIcon = step.icon;
                          const stepColor = getStatusColor(app.status, step.status);
                          
                          return (
                            <React.Fragment key={step.status}>
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                  stepColor !== 'bg-gray-200' ? stepColor : 'bg-gray-200'
                                } ${step.status === app.status ? 'ring-4 ring-offset-2 ring-opacity-50 ' + 
                                  (isPending ? 'ring-amber-300' : 
                                   isConfirmed ? 'ring-emerald-300' : 'ring-blue-300') : ''}`}>
                                  <StepIcon size={14} className="text-white" />
                                </div>
                                <span className="text-[9px] font-bold mt-1 text-center">
                                  {step.label.split(' ')[0]}
                                </span>
                              </div>
                              {idx < 2 && (
                                <div className={`flex-1 h-0.5 mx-2 ${
                                  stepOrderIndex(app.status) > idx ? 'bg-emerald-400' : 'bg-gray-200'
                                }`} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}

                    {/* Main Content */}
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        {/* Doctor Info */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <Stethoscope className="text-teal-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-[#0f172a]">{app.doctorName}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{app.specialization}</p>
                          </div>
                        </div>

                        {/* Appointment Details */}
                        <div className="flex flex-wrap gap-4 mb-6">
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                            <Calendar size={14} className="text-teal-500" /> 
                            {new Date(app.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                            <Clock size={14} className="text-teal-500" /> {app.time}
                          </div>
                          <div className={`flex items-center gap-2 text-[10px] font-black px-4 py-2 rounded-xl border ${getStatusBadge(app.status, app.date)}`}>
                            {getStatusIcon(app.status)}
                            {getStatusText(app.status)}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                            {app.type?.includes('Video') ? <Video size={14} /> : <MapPin size={14} />}
                            {app.type?.includes('Video') ? (app.videoLink || 'Video Call') : (app.location || 'Clinic Visit')}
                          </div>
                        </div>

                        {/* Notes */}
                        {app.notes && (
                          <div className="mt-2 mb-3 p-2 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500">
                              <span className="font-bold">Reason:</span> {app.notes}
                            </p>
                          </div>
                        )}

                        {/* PENDING: Medical Records Attachment Section */}
                        {isPending && (
                          <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Paperclip size={14} className="text-amber-600" />
                                <span className="text-xs font-black text-amber-700 uppercase">
                                  📎 Medical Records Required
                                </span>
                              </div>
                              <button 
                                onClick={() => { 
                                  setActiveAppointmentId(app._id); 
                                  setActiveAppointment(app);
                                  setShowAttachModal(true); 
                                }} 
                                className="px-3 py-1.5 bg-amber-500 text-white rounded-lg font-bold text-[10px] hover:bg-amber-600 transition-all flex items-center gap-1"
                              >
                                <PlusCircle size={10} />
                                ATTACH NOW
                              </button>
                            </div>
                            <p className="text-[10px] text-amber-600">
                              Please attach your medical records for doctor's review before confirmation
                            </p>
                            {hasAttachments && (
                              <div className="mt-2">
                                <span className="text-[9px] text-green-600">✓ {attachedRecords.length} record(s) attached</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* CONFIRMED: Awaiting Consultation */}
                        {isConfirmed && !isExpiredApp && (
                          <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle size={14} className="text-emerald-600" />
                              <span className="text-xs font-black text-emerald-700 uppercase">
                                ✓ APPOINTMENT CONFIRMED BY DOCTOR
                              </span>
                            </div>
                            <p className="text-[10px] text-emerald-600">
                              Your appointment has been confirmed. Please be available at the scheduled time.
                            </p>
                            {app.type?.includes('Video') && app.videoLink && (
                              <a 
                                href={app.videoLink.startsWith('http') ? app.videoLink : `https://${app.videoLink}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold text-[10px] hover:bg-purple-700 transition-all"
                              >
                                <Video size={12} />
                                JOIN VIDEO CALL
                              </a>
                            )}
                          </div>
                        )}

                        {/* COMPLETED: Prescription Available */}
                        {isCompleted && !isOldCompleted && hasPrescription && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <button
                              onClick={() => togglePrescription(app._id)}
                              className="flex items-center justify-between w-full"
                            >
                              <div className="flex items-center gap-2">
                                <PrescriptionIcon size={16} className="text-blue-600" />
                                <span className="text-xs font-black text-blue-700 uppercase">
                                  📋 PRESCRIPTION AVAILABLE
                                </span>
                              </div>
                              {isPrescriptionExpanded ? 
                                <ChevronUp size={14} className="text-blue-600" /> : 
                                <ChevronDown size={14} className="text-blue-600" />
                              }
                            </button>
                            
                            {isPrescriptionExpanded && (
                              <div className="mt-4 space-y-3">
                                {app.consultationNotes && (
                                  <div className="bg-white p-3 rounded-lg">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Consultation Notes</p>
                                    <p className="text-sm text-slate-700">{app.consultationNotes}</p>
                                  </div>
                                )}
                                
                                {app.prescription && (
                                  <div className="bg-white p-3 rounded-lg">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Prescription Details</p>
                                    {typeof app.prescription === 'string' ? (
                                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{app.prescription}</p>
                                    ) : (
                                      <>
                                        {app.prescription.diagnosis && (
                                          <div className="mb-2">
                                            <span className="text-xs font-bold text-slate-600">Diagnosis:</span>
                                            <p className="text-sm text-slate-700">{app.prescription.diagnosis}</p>
                                          </div>
                                        )}
                                        {app.prescription.medicines && app.prescription.medicines.length > 0 && (
                                          <div className="mb-2">
                                            <span className="text-xs font-bold text-slate-600">Medicines:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {app.prescription.medicines.map((med, idx) => (
                                                <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                  {med.name} {med.dosage}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        {app.prescription.instructions && (
                                          <div>
                                            <span className="text-xs font-bold text-slate-600">Instructions:</span>
                                            <p className="text-sm text-slate-700">{app.prescription.instructions}</p>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                )}
                                
                                {app.prescriptionId && (
                                  <button
                                    onClick={() => handleViewFullPrescription(app)}
                                    className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                                  >
                                    <Eye size={14} />
                                    VIEW FULL PRESCRIPTION
                                  </button>
                                )}
                              </div>
                            )}
                            
                            {!isPrescriptionExpanded && app.prescription && (
                              <div className="mt-2">
                                {typeof app.prescription === 'string' ? (
                                  <p className="text-xs text-slate-600 line-clamp-2">
                                    {app.prescription.substring(0, 100)}
                                    {app.prescription.length > 100 && '...'}
                                  </p>
                                ) : (
                                  <p className="text-xs text-slate-600">
                                    <span className="font-bold">Diagnosis:</span> {app.prescription.diagnosis || 'N/A'}
                                    {app.prescription.medicines && (
                                      <span className="ml-2 text-blue-600">
                                        • {app.prescription.medicines.length} medicine(s)
                                      </span>
                                    )}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Attached Reports */}
                        {hasAttachments && (
                          <div className="mt-4">
                            <button
                              onClick={() => toggleAttachments(app._id)}
                              className="flex items-center gap-2 text-[10px] font-black text-teal-600 uppercase hover:text-teal-700 transition-colors"
                            >
                              <Paperclip size={12} />
                              {attachedRecords.length} Attached Report(s)
                              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                            
                            {isExpanded && (
                              <div className="mt-3 space-y-2">
                                {attachedRecords.map((record, idx) => (
                                  <div key={record.recordId || idx} className="bg-teal-50/30 rounded-xl p-3 border border-teal-100">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <FileText size={14} className="text-teal-600" />
                                        <span className="font-black text-sm text-slate-800">
                                          {record.recordName || record.diagnosis || record.type}
                                        </span>
                                      </div>
                                      <span className="text-[8px] font-black text-slate-400">
                                        {record.uploadedAt ? new Date(record.uploadedAt).toLocaleDateString() : record.date}
                                      </span>
                                    </div>
                                    
                                    {record.files && record.files.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {record.files.map((file, fileIdx) => (
                                          <button
                                            key={fileIdx}
                                            onClick={() => handleViewAttachedFile(record, file)}
                                            className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:text-teal-600 hover:bg-teal-50 transition-colors shadow-sm"
                                          >
                                            {getFileIcon(file.fileType)}
                                            <span className="max-w-[120px] truncate">{file.name}</span>
                                            <Eye size={10} className="ml-1" />
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right Side Actions */}
                      <div className="flex flex-col justify-between items-end">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border flex items-center gap-2 ${
                          isConfirmed ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 
                          isPending ? 'bg-amber-50 text-amber-500 border-amber-100' :
                          isCompleted && !isOldCompleted ? 'bg-blue-50 text-blue-500 border-blue-100' :
                          isCancelled ? 'bg-red-50 text-red-500 border-red-100' :
                          'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          {getStatusIcon(app.status)}
                          {getStatusText(app.status)}
                        </div>
                        
                        <div className="flex gap-2 mt-4 flex-wrap justify-end">
                          {/* VIDEO CALL BUTTON */}
                          {isConfirmed && app.type?.includes('Video') && app.videoLink && (
                            <a 
                              href={app.videoLink.startsWith('http') ? app.videoLink : `https://${app.videoLink}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="px-4 py-3 bg-purple-600 text-white rounded-xl font-black text-xs hover:bg-purple-700 transition-all flex items-center gap-2"
                            >
                              <Video size={14} /> JOIN CALL
                            </a>
                          )}
                          
                          {/* ATTACH BUTTON - ONLY FOR PENDING */}
                          {isPending && (
                            <button 
                              onClick={() => { 
                                setActiveAppointmentId(app._id); 
                                setActiveAppointment(app);
                                setShowAttachModal(true); 
                              }} 
                              className="px-4 py-3 bg-teal-50 text-teal-600 rounded-xl font-black text-xs hover:bg-teal-100 transition-all flex items-center gap-2"
                            >
                              <Paperclip size={14} /> ATTACH
                            </button>
                          )}

                          {/* DELETE BUTTON - For Pending, Expired, or Old Completed appointments */}
                          {isDeletable && (
                            <button 
                              onClick={() => {
                                setDeleteTargetId(app._id);
                                setShowDeleteModal(true);
                              }}
                              disabled={deletingId === app._id}
                              className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-black text-xs hover:bg-red-100 transition-all flex items-center gap-2"
                              title="Delete this appointment"
                            >
                              {deletingId === app._id ? (
                                <RefreshCw size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                              DELETE
                            </button>
                          )}
                        </div>

                        {/* Status Messages */}
                        {isPending && (
                          <p className="text-[10px] text-amber-500 mt-3 text-center animate-pulse">
                            ⏳ Awaiting doctor's confirmation
                          </p>
                        )}
                        {isConfirmed && (
                          <p className="text-[10px] text-emerald-500 mt-3 text-center">
                            ✓ Appointment confirmed by doctor
                          </p>
                        )}
                        {isCompleted && !isOldCompleted && (
                          <p className="text-[10px] text-blue-500 mt-3 text-center">
                            ✓ Consultation completed - Prescription available
                          </p>
                        )}
                        {isCancelled && (
                          <p className="text-[10px] text-red-500 mt-3 text-center">
                            ✗ Appointment cancelled by doctor
                          </p>
                        )}
                        {isExpiredApp && (
                          <p className="text-[10px] text-gray-500 mt-3 text-center">
                            ⏰ Past appointment - Click DELETE to remove
                          </p>
                        )}
                        {isOldCompleted && (
                          <p className="text-[10px] text-gray-500 mt-3 text-center">
                            🗑️ Old completed - Click DELETE to remove
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200">
                <Calendar className="mx-auto text-slate-200 mb-4" size={48} />
                <p className="text-slate-400 font-bold text-lg">No appointments</p>
                <p className="text-slate-400 text-sm mt-2">Book an appointment with our specialists</p>
                <button
                  onClick={() => navigate('/doctors')}
                  className="mt-6 px-8 py-4 bg-teal-600 text-white rounded-xl font-black text-sm hover:bg-teal-700 transition-all"
                >
                  FIND DOCTORS
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar Summary */}
          <div className="lg:col-span-4">
            <div className="bg-[#0f172a] rounded-[2.5rem] p-8 shadow-xl text-white sticky top-6">
              <h4 className="text-xl font-black mb-4">Summary</h4>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                  <span className="text-slate-300">Total Appointments</span>
                  <span className="text-2xl font-black text-teal-400">{appointments.length}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                  <span className="text-slate-300">Pending</span>
                  <span className="text-2xl font-black text-amber-400 animate-pulse">
                    {pendingCount}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                  <span className="text-slate-300">Confirmed</span>
                  <span className="text-2xl font-black text-emerald-400">
                    {confirmedCount}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                  <span className="text-slate-300">Completed</span>
                  <span className="text-2xl font-black text-blue-400">
                    {completedCount}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                  <span className="text-slate-300">Today</span>
                  <span className="text-2xl font-black text-purple-400">
                    {appointments.filter(a => isToday(a.date)).length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-red-500/20 rounded-xl">
                  <span className="text-slate-300">Can Delete</span>
                  <span className="text-2xl font-black text-red-400">
                    {totalDeletable}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                  <span className="text-slate-300">Total Records</span>
                  <span className="text-2xl font-black text-amber-400">{medicalRecords.length}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                  <span className="text-slate-300">Prescriptions</span>
                  <span className="text-2xl font-black text-blue-400">
                    {appointments.filter(a => a.prescription || a.prescriptionId).length}
                  </span>
                </div>

                {currentUser && (
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                    <span className="text-slate-300">Patient ID</span>
                    <span className="text-sm font-black text-amber-400">{currentUser.userId || currentUser._id}</span>
                  </div>
                )}
              </div>

              <button 
                onClick={() => navigate('/medical-records')} 
                className="w-full py-4 bg-teal-500 text-[#0f172a] rounded-2xl font-black text-xs hover:bg-teal-400 transition-all"
              >
                VIEW MEDICAL VAULT ({medicalRecords.length})
              </button>
              
              <button 
                onClick={() => navigate('/prescriptions')} 
                className="w-full mt-3 py-4 bg-blue-500 text-white rounded-2xl font-black text-xs hover:bg-blue-400 transition-all flex items-center justify-center gap-2"
              >
                <PrescriptionIcon size={16} />
                VIEW PRESCRIPTIONS ({appointments.filter(a => a.prescription || a.prescriptionId).length})
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Delete All Old Appointments Modal */}
      {showExpiredModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600" size={32} />
              </div>
              <h2 className="text-2xl font-black text-[#0f172a]">Delete Old Appointments?</h2>
              <p className="text-slate-500 mt-2">
                You have:
              </p>
              <div className="mt-3 space-y-1">
                {expiredCount > 0 && (
                  <p className="text-sm text-amber-600">• {expiredCount} Past appointment(s)</p>
                )}
                {oldCompletedCount > 0 && (
                  <p className="text-sm text-blue-600">• {oldCompletedCount} Old completed (7+ weeks)</p>
                )}
              </div>
              <p className="text-slate-500 mt-3">
                These will be permanently removed.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowExpiredModal(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={handleDeleteAllOldAppointments}
                disabled={deletingId === 'all'}
                className="flex-1 py-4 bg-red-600 text-white rounded-xl font-black text-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                {deletingId === 'all' ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                DELETE ALL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Appointment Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600" size={32} />
              </div>
              <h2 className="text-2xl font-black text-[#0f172a]">Delete Appointment?</h2>
              <p className="text-slate-500 mt-2">
                This action cannot be undone. The appointment will be permanently removed.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTargetId(null);
                }}
                className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={() => handleDeleteSingleAppointment(deleteTargetId)}
                disabled={deletingId === deleteTargetId}
                className="flex-1 py-4 bg-red-600 text-white rounded-xl font-black text-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                {deletingId === deleteTargetId ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attach Record Modal */}
      {showAttachModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-[#0f172a]">Attach Medical Record</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Appointment with <strong>{activeAppointment?.doctorName}</strong> on <strong>{activeAppointment?.date}</strong>
                </p>
              </div>
              <button onClick={() => setShowAttachModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            {attachingError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                <p className="font-bold">Error attaching record</p>
                <p>{attachingError}</p>
              </div>
            )}
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {medicalRecords.length > 0 ? (
                medicalRecords.map(record => {
                  const isAlreadyAttached = activeAppointment?.attachedRecords?.some(
                    r => r.recordId === record._id || r.recordId === record.id
                  );
                  const isAttaching = attachingRecordId === record._id;
                  
                  return (
                    <div 
                      key={record._id} 
                      className={`p-4 border rounded-2xl transition-all ${
                        isAlreadyAttached 
                          ? 'border-green-200 bg-green-50 opacity-60 cursor-not-allowed' 
                          : 'border-slate-100 hover:bg-teal-50 cursor-pointer'
                      }`}
                      onClick={() => !isAlreadyAttached && !isAttaching && handleAttachRecord(activeAppointmentId, record)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900">{record.diagnosis || record.type}</h4>
                          <p className="text-[10px] text-slate-400 uppercase font-black">{record.date}</p>
                          {record.files && record.files.length > 0 && (
                            <p className="text-[8px] text-teal-600 mt-1">
                              📎 {record.files.length} file(s)
                            </p>
                          )}
                          {record.doctor && (
                            <p className="text-[9px] text-slate-500 mt-1">
                              👨‍⚕️ {record.doctor}
                            </p>
                          )}
                        </div>
                        {isAttaching ? (
                          <RefreshCw className="animate-spin text-teal-500" size={20} />
                        ) : isAlreadyAttached ? (
                          <span className="px-2 py-1 bg-green-100 text-green-600 rounded-lg text-[8px] font-black">
                            ATTACHED ✓
                          </span>
                        ) : (
                          <PlusCircle size={20} className="text-teal-500" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto text-slate-300 mb-3" size={40} />
                  <p className="text-slate-400 text-sm font-bold">No records found in your medical vault.</p>
                  <p className="text-slate-400 text-xs mt-2">Upload records from the Medical Records page to attach them here.</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowAttachModal(false);
                  navigate('/medical-records');
                }}
                className="w-full py-3 bg-teal-50 text-teal-600 rounded-xl font-bold text-sm hover:bg-teal-100 transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle size={16} /> Upload New Record
              </button>
              <button
                onClick={() => setShowAttachModal(false)}
                className="w-full mt-2 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View File Modal */}
      {showViewModal && selectedFile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-4xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-[#0f172a]">{selectedFile.name}</h2>
                <p className="text-slate-400 text-sm">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-8">
              {selectedFile.fileType === 'image' ? (
                <div className="flex justify-center">
                  <img 
                    src={selectedFile.cloudinaryUrl || selectedFile.data} 
                    alt={selectedFile.name}
                    className="max-w-full max-h-[60vh] object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText size={64} className="mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600 mb-4">PDF Document - {selectedFile.name}</p>
                  <button
                    onClick={() => handleDownloadFile(selectedFile)}
                    className="bg-teal-600 text-white px-6 py-3 rounded-xl font-black hover:bg-teal-700 transition-all inline-flex items-center gap-2"
                  >
                    <Download size={18} /> OPEN PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;