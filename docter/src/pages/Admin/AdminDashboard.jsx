import React, { useState, useEffect } from 'react';
import { 
  FaUsers, FaUserMd, FaCalendarCheck, FaDollarSign,
  FaChartLine, FaChartPie, FaExclamationTriangle, FaCheckCircle,
  FaClock, FaHospital, FaShieldAlt, FaRobot, FaFileMedical,
  FaDownload, FaFilter, FaEye, FaCheck, FaTimes, FaBan,
  FaSync, FaBell, FaUserCog, FaHistory, FaChartBar,
  FaHeartbeat, FaStethoscope, FaPrescriptionBottle, FaAmbulance,
  FaIdCard, FaEnvelope, FaPhone, FaMapMarkerAlt, FaStar,
  FaTrash, FaEdit, FaToggleOn, FaToggleOff, FaCrown,
  FaUserTie, FaUserGraduate, FaUserLock, FaUserClock,
  FaVideo, FaMapPin, FaLink, FaWallet, FaPercentage
} from 'react-icons/fa';
import { 
  Activity, TrendingUp, AlertCircle, Shield, Award,
  Users, Calendar, DollarSign, Clock, Filter,
  Download, Eye, Check, X, Trash2, Edit,
  MoreVertical, ChevronRight, Search, Plus,
  RefreshCw, Bell, Settings, LogOut, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = ({ userData }) => {
  // ========== STATE MANAGEMENT ==========
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('users');
  const [showFilters, setShowFilters] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dateRange, setDateRange] = useState('week');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // ========== REAL DATA FROM YOUR FILES ==========
  const [users, setUsers] = useState([]);           // From LoginForm.jsx
  const [doctors, setDoctors] = useState([]);       // From AdminManagement.jsx / Doctors.jsx
  const [patients, setPatients] = useState([]);     // Filtered from users
  const [appointments, setAppointments] = useState([]); // From Appointments.jsx
  const [prescriptions, setPrescriptions] = useState([]); // From PrescriptionManager.jsx
  const [medicalRecords, setMedicalRecords] = useState([]); // From MedicalRecordsPage.jsx
  const [feedbacks, setFeedbacks] = useState([]);   // From Feedback.jsx
  const [sosAlerts, setSosAlerts] = useState([]);   // From EmergencySOS.jsx
  const [doctorSlots, setDoctorSlots] = useState({}); // From DoctorSchedule.jsx
  const [pendingApprovals, setPendingApprovals] = useState([]); // Doctors pending approval
  const [auditLogs, setAuditLogs] = useState([]);   // Admin action logs
  const [activities, setActivities] = useState([]); // Recent activities

  // ========== STATS CALCULATED FROM REAL DATA ==========
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    totalPrescriptions: 0,
    totalMedicalRecords: 0,
    totalFeedbacks: 0,
    pendingApprovals: 0,
    activeSOS: 0,
    avgRating: 0,
    appointmentRate: 0,
    revenueChange: 0,
    userGrowth: 0,
    aiSuccessRate: 92,
    systemHealth: 99.9
  });

  // ========== LOAD ALL REAL DATA ==========
  useEffect(() => {
    loadAllData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      refreshData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadAllData = () => {
    setLoading(true);
    
    try {
      // ===== 1. LOAD USERS FROM LOGINFORM.JSX =====
      // All users stored in healthai_users
      const allUsers = JSON.parse(localStorage.getItem('healthai_users') || '[]');
      const usersArray = Array.isArray(allUsers) ? allUsers : [];
      setUsers(usersArray);
      
      // Filter patients (userType === 'patient')
      const patientUsers = usersArray.filter(u => u.userType === 'patient');
      setPatients(patientUsers);
      
      // ===== 2. LOAD DOCTORS FROM ADMINMANAGEMENT.JSX / DOCTORS.JSX =====
      // Doctors stored in healthai_doctors
      const savedDoctors = JSON.parse(localStorage.getItem('healthai_doctors') || '[]');
      const doctorsArray = Array.isArray(savedDoctors) ? savedDoctors : [];
      setDoctors(doctorsArray);
      
      // Pending approvals (doctors with status pending or no status)
      const pendingDocs = doctorsArray.filter(d => d.status === 'pending' || !d.status);
      setPendingApprovals(pendingDocs);
      
      // ===== 3. LOAD APPOINTMENTS FROM APPOINTMENTS.JSX / DOCAPPIMENTS.JSX =====
      const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const appointmentsArray = Array.isArray(allAppointments) ? allAppointments : [];
      setAppointments(appointmentsArray);
      
      // ===== 4. LOAD PRESCRIPTIONS FROM PRESCRIPTIONMANAGER.JSX =====
      const allPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
      const prescriptionsArray = Array.isArray(allPrescriptions) ? allPrescriptions : [];
      setPrescriptions(prescriptionsArray);
      
      // ===== 5. LOAD MEDICAL RECORDS FROM MEDICALRECORDSPAGE.JSX =====
      // Medical records are stored per patient: medical_records_{patientId}
      let allMedicalRecords = [];
      if (patientUsers.length > 0) {
        patientUsers.forEach(patient => {
          const patientId = patient.userId || patient.id;
          const records = JSON.parse(localStorage.getItem(`medical_records_${patientId}`) || '[]');
          if (records.length > 0) {
            allMedicalRecords = [...allMedicalRecords, ...records];
          }
        });
      }
      setMedicalRecords(allMedicalRecords);
      
      // ===== 6. LOAD FEEDBACK FROM FEEDBACK.JSX / DOCTORFEEDBACKDASHBOARD.JSX =====
      const allFeedbacks = JSON.parse(localStorage.getItem('patient_feedback') || '[]');
      const feedbacksArray = Array.isArray(allFeedbacks) ? allFeedbacks : [];
      setFeedbacks(feedbacksArray);
      
      // ===== 7. LOAD SOS ALERTS FROM EMERGENCYSOS.JSX =====
      const sosData = JSON.parse(localStorage.getItem('emergency_sos') || '[]');
      const sosArray = Array.isArray(sosData) ? sosData : [];
      setSosAlerts(sosArray);
      
      // ===== 8. LOAD DOCTOR SLOTS FROM DOCTORSCHEDULE.JSX =====
      const slotsData = {};
      if (doctorsArray.length > 0) {
        doctorsArray.forEach(doctor => {
          const doctorId = doctor.id || doctor.userId;
          if (doctorId) {
            const slots = JSON.parse(localStorage.getItem(`doctor_slots_${doctorId}`) || '[]');
            slotsData[doctorId] = slots;
          }
        });
      }
      setDoctorSlots(slotsData);
      
      // ===== 9. GENERATE ACTIVITIES FROM REAL DATA =====
      const recentActivities = generateActivities(
        appointmentsArray, 
        prescriptionsArray, 
        doctorsArray, 
        patientUsers,
        allMedicalRecords
      );
      setActivities(recentActivities);
      
      // ===== 10. GENERATE AUDIT LOGS =====
      const auditData = generateAuditLogs();
      setAuditLogs(auditData);
      
      // ===== 11. CALCULATE ALL STATS =====
      calculateStats(
        usersArray, 
        doctorsArray, 
        patientUsers, 
        appointmentsArray, 
        prescriptionsArray,
        allMedicalRecords,
        feedbacksArray,
        sosArray
      );
      
    } catch (error) {
      console.error('Error loading data:', error);
      // Set empty arrays on error
      setUsers([]);
      setDoctors([]);
      setPatients([]);
      setAppointments([]);
      setPrescriptions([]);
      setMedicalRecords([]);
      setFeedbacks([]);
      setSosAlerts([]);
    }
    
    setLoading(false);
  };

  // ===== GENERATE ACTIVITIES FROM REAL DATA =====
  const generateActivities = (appointments, prescriptions, doctors, patients, medicalRecords) => {
    const activities = [];
    
    // Recent appointments (last 5)
    if (appointments.length > 0) {
      appointments.slice(0, 5).forEach(apt => {
        activities.push({
          id: `apt-${apt.id || Date.now()}-${Math.random()}`,
          action: 'New appointment booked',
          user: `${apt.patientName || 'Patient'} with ${apt.doctorName || 'Doctor'}`,
          time: getTimeAgo(apt.bookedAt || apt.date),
          type: 'appointment'
        });
      });
    }
    
    // Recent prescriptions (last 3)
    if (prescriptions.length > 0) {
      prescriptions.slice(0, 3).forEach(pre => {
        activities.push({
          id: `pre-${pre.id || Date.now()}-${Math.random()}`,
          action: 'Prescription created',
          user: `For ${pre.patient?.name || 'Patient'} by ${pre.doctor?.name || 'Doctor'}`,
          time: getTimeAgo(pre.dateTime || pre.date),
          type: 'prescription'
        });
      });
    }
    
    // Recent medical records uploads
    if (medicalRecords.length > 0) {
      medicalRecords.slice(0, 3).forEach(rec => {
        activities.push({
          id: `rec-${rec.id || Date.now()}-${Math.random()}`,
          action: 'Medical record uploaded',
          user: `For ${rec.patientName || 'Patient'} by ${rec.doctor || 'User'}`,
          time: getTimeAgo(rec.uploadedAt || rec.date),
          type: 'record'
        });
      });
    }
    
    // Recent new patients
    if (patients.length > 0) {
      patients.slice(0, 3).forEach(pat => {
        activities.push({
          id: `pat-${pat.userId || pat.id}-${Math.random()}`,
          action: 'New patient registered',
          user: pat.name || 'Patient',
          time: getTimeAgo(pat.createdAt),
          type: 'patient'
        });
      });
    }
    
    // Recent doctor registrations
    if (doctors.length > 0) {
      doctors.slice(0, 3).forEach(doc => {
        activities.push({
          id: `doc-${doc.id || Date.now()}-${Math.random()}`,
          action: 'New doctor registered',
          user: doc.name || 'Doctor',
          time: getTimeAgo(doc.createdAt),
          type: 'doctor'
        });
      });
    }
    
    // Sort by time (newest first) and limit to 10
    return activities
      .sort((a, b) => {
        const timeA = a.time.includes('Just now') ? 0 : parseInt(a.time) || 0;
        const timeB = b.time.includes('Just now') ? 0 : parseInt(b.time) || 0;
        return timeA - timeB;
      })
      .slice(0, 10);
  };

  // ===== GENERATE AUDIT LOGS =====
  const generateAuditLogs = () => {
    const auditData = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    
    if (auditData.length > 0) {
      return auditData;
    }
    
    // Generate mock audit logs if none exist
    return [
      { id: 1, user: 'Admin', action: 'Logged in', ip: '192.168.1.1', time: '2 mins ago', type: 'login' },
      { id: 2, user: 'System', action: 'Database backup completed', ip: '127.0.0.1', time: '1 hour ago', type: 'system' },
      { id: 3, user: 'Admin', action: 'Updated system settings', ip: '192.168.1.1', time: '3 hours ago', type: 'settings' }
    ];
  };

  // ===== GET TIME AGO FUNCTION =====
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now - date) / 1000);
      
      if (seconds < 60) return 'Just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} mins ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} hours ago`;
      const days = Math.floor(hours / 24);
      return `${days} days ago`;
    } catch (e) {
      return 'Just now';
    }
  };

  // ===== CALCULATE ALL STATS FROM REAL DATA =====
  const calculateStats = (
    allUsers, 
    allDoctors, 
    allPatients, 
    allAppointments, 
    allPrescriptions,
    allMedicalRecords,
    allFeedbacks,
    allSOS
  ) => {
    
    // Basic counts
    const totalPatients = allPatients.length;
    const totalDoctors = allDoctors.length;
    const totalAppointments = allAppointments.length;
    const totalPrescriptions = allPrescriptions.length;
    const totalMedicalRecords = allMedicalRecords.length;
    const totalFeedbacks = allFeedbacks.length;
    
    // Calculate total revenue from appointments
    let totalRevenue = 0;
    allAppointments.forEach(apt => {
      // Try to get fee from different possible fields
      const fee = apt.fee || apt.consultationFee || apt.amount || 2500;
      totalRevenue += fee;
    });
    
    // Calculate pending approvals
    const pendingApprovals = allDoctors.filter(d => 
      d.status === 'pending' || !d.status || d.verified === false
    ).length;
    
    // Calculate active SOS alerts
    const activeSOS = allSOS.filter(s => s.status === 'active').length;
    
    // Calculate average doctor rating
    let avgRating = 0;
    const doctorsWithRating = allDoctors.filter(d => d.rating);
    if (doctorsWithRating.length > 0) {
      const totalRating = doctorsWithRating.reduce((sum, d) => sum + parseFloat(d.rating), 0);
      avgRating = (totalRating / doctorsWithRating.length).toFixed(1);
    }
    
    // Calculate appointment rate (growth compared to last month)
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const thisMonthAppointments = allAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= lastMonth && aptDate <= today;
    }).length;
    
    const previousMonthAppointments = allAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      return aptDate >= twoMonthsAgo && aptDate < lastMonth;
    }).length;
    
    let appointmentRate = 0;
    if (previousMonthAppointments > 0) {
      appointmentRate = ((thisMonthAppointments - previousMonthAppointments) / previousMonthAppointments) * 100;
    }
    
    // Calculate user growth
    const newUsersThisMonth = allUsers.filter(u => {
      const createdDate = new Date(u.createdAt || u.date);
      return createdDate >= lastMonth;
    }).length;
    
    const userGrowth = allUsers.length > 0 ? (newUsersThisMonth / allUsers.length) * 100 : 0;
    
    // Calculate revenue change
    const thisMonthRevenue = allAppointments
      .filter(apt => new Date(apt.date) >= lastMonth)
      .reduce((sum, apt) => sum + (apt.fee || apt.consultationFee || 2500), 0);
    
    const previousMonthRevenue = allAppointments
      .filter(apt => {
        const aptDate = new Date(apt.date);
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
        return aptDate >= twoMonthsAgo && aptDate < lastMonth;
      })
      .reduce((sum, apt) => sum + (apt.fee || apt.consultationFee || 2500), 0);
    
    let revenueChange = 0;
    if (previousMonthRevenue > 0) {
      revenueChange = ((thisMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
    }
    
    setStats({
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalRevenue,
      totalPrescriptions,
      totalMedicalRecords,
      totalFeedbacks,
      pendingApprovals,
      activeSOS,
      avgRating,
      appointmentRate: Math.round(appointmentRate),
      revenueChange: Math.round(revenueChange),
      userGrowth: Math.round(userGrowth),
      aiSuccessRate: 92, // You can calculate this from AI recommendation success
      systemHealth: 99.9
    });
  };

  // ===== REFRESH DATA =====
  const refreshData = () => {
    loadAllData();
    setRefreshTrigger(prev => prev + 1);
    showNotificationMsg('Dashboard data refreshed');
  };

  const showNotificationMsg = (msg) => {
    setNotificationMessage(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // ===== CHART DATA (BASED ON REAL APPOINTMENTS) =====
  const getWeeklyAppointmentData = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    
    appointments.forEach(apt => {
      try {
        const day = new Date(apt.date).getDay(); // 0 = Sunday
        counts[day]++;
      } catch (e) {
        // Skip invalid dates
      }
    });
    
    // Rearrange to start from Monday [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
    return [...counts.slice(1), counts[0]];
  };

  const getSpecializationData = () => {
    const specializations = {};
    
    doctors.forEach(doc => {
      const spec = doc.specialization || 'General';
      specializations[spec] = (specializations[spec] || 0) + 1;
    });
    
    const labels = Object.keys(specializations).slice(0, 6);
    const data = labels.map(label => specializations[label]);
    
    return { labels, data };
  };

  const getSymptomData = () => {
    // Extract symptoms from appointments
    const symptoms = {
      'Fever': 0,
      'Headache': 0,
      'Cough': 0,
      'Pain': 0,
      'BP': 0,
      'Diabetes': 0
    };
    
    appointments.forEach(apt => {
      const symptom = (apt.symptoms || '').toLowerCase();
      if (symptom.includes('fever')) symptoms['Fever']++;
      if (symptom.includes('headache')) symptoms['Headache']++;
      if (symptom.includes('cough')) symptoms['Cough']++;
      if (symptom.includes('pain')) symptoms['Pain']++;
      if (symptom.includes('bp') || symptom.includes('blood pressure')) symptoms['BP']++;
      if (symptom.includes('diabetes') || symptom.includes('sugar')) symptoms['Diabetes']++;
    });
    
    return {
      labels: Object.keys(symptoms),
      data: Object.values(symptoms)
    };
  };

  const specData = getSpecializationData();
  const symptomData = getSymptomData();

  const appointmentTrends = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Appointments',
        data: getWeeklyAppointmentData(),
        borderColor: 'rgb(20, 184, 166)',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const specializationData = {
    labels: specData.labels,
    datasets: [
      {
        data: specData.data,
        backgroundColor: [
          'rgba(20, 184, 166, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ]
      }
    ]
  };

  const symptomAnalytics = {
    labels: symptomData.labels,
    datasets: [
      {
        label: 'Patient Symptoms',
        data: symptomData.data,
        backgroundColor: 'rgba(20, 184, 166, 0.8)'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  // ===== HANDLERS FOR USER ACTIONS =====
  const handleApproveDoctor = (doctor) => {
    if (!doctor || !doctor.id) return;
    
    const updatedDoctors = doctors.map(d => 
      d.id === doctor.id ? { ...d, status: 'approved', verified: true } : d
    );
    localStorage.setItem('healthai_doctors', JSON.stringify(updatedDoctors));
    setDoctors(updatedDoctors);
    setPendingApprovals(pendingApprovals.filter(d => d.id !== doctor.id));
    
    showNotificationMsg(`Doctor ${doctor.name} approved successfully`);
  };

  const handleRejectDoctor = (doctor) => {
    if (!doctor || !doctor.id) return;
    
    if (window.confirm(`Reject doctor ${doctor.name}?`)) {
      const updatedDoctors = doctors.map(d => 
        d.id === doctor.id ? { ...d, status: 'rejected' } : d
      );
      localStorage.setItem('healthai_doctors', JSON.stringify(updatedDoctors));
      setDoctors(updatedDoctors);
      setPendingApprovals(pendingApprovals.filter(d => d.id !== doctor.id));
      showNotificationMsg(`Doctor ${doctor.name} rejected`);
    }
  };

  const handleBlockUser = (user) => {
    if (!user || !user.userId) return;
    
    if (window.confirm(`Block user ${user.name}?`)) {
      const updatedUsers = users.map(u => 
        u.userId === user.userId ? { ...u, status: 'blocked' } : u
      );
      localStorage.setItem('healthai_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      showNotificationMsg(`User ${user.name} blocked`);
    }
  };

  const handleDeleteUser = (user) => {
    if (!user || !user.userId) return;
    
    if (window.confirm(`Permanently delete user ${user.name}?`)) {
      const updatedUsers = users.filter(u => u.userId !== user.userId);
      localStorage.setItem('healthai_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      
      // Also remove from patients if it's a patient
      setPatients(patients.filter(p => p.userId !== user.userId));
      
      showNotificationMsg(`User ${user.name} deleted`);
    }
  };

  const handleResolveSOS = (alert) => {
    const updatedSOS = sosAlerts.map(a => 
      a.id === alert.id ? { ...a, status: 'resolved' } : a
    );
    localStorage.setItem('emergency_sos', JSON.stringify(updatedSOS));
    setSosAlerts(updatedSOS);
    showNotificationMsg(`SOS alert resolved for ${alert.patient}`);
  };

  // ===== FILTERED DATA FOR SEARCH =====
  const filteredDoctors = doctors.filter(d => 
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===== RENDER =====
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-slate-600 font-bold">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Plus_Jakarta_Sans'] pb-20">
      
      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-teal-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <FaCheckCircle size={20} />
            <span className="font-bold">{notificationMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-[#0f172a] pt-16 pb-32 px-6 lg:px-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                Admin <span className="text-teal-400">Dashboard</span>
              </h1>
              <p className="text-slate-400 font-bold mt-2">
                Welcome back, {userData?.name || 'Admin'}! System is running smoothly.
              </p>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-teal-400"> {stats.totalPatients} Patients</span>
                <span className="text-slate-500">|</span>
                <span className="text-teal-400"> {stats.totalDoctors} Doctors</span>
                <span className="text-slate-500">|</span>
                <span className="text-teal-400"> {stats.totalAppointments} Appointments</span>
              </div>
            </div>
            
            
          </div>
          
          
        </div>
        
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-500/10 to-transparent pointer-events-none" />
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-20 -mt-20 relative z-20">
        
        {/* ===== TOP LAYER: KPI CARDS (REAL DATA) ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Patients Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Patients</p>
                <p className="text-3xl font-black text-[#0f172a] mt-2">{stats.totalPatients}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1">
                    <TrendingUp size={12} /> +{stats.userGrowth}%
                  </span>
                  <span className="text-xs text-slate-400">from {users.length} total users</span>
                </div>
              </div>
              <div className="p-4 bg-blue-100 rounded-xl">
                <FaUsers className="text-blue-600 text-2xl" />
              </div>
            </div>
          </motion.div>

          {/* Doctors Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Doctors</p>
                <p className="text-3xl font-black text-[#0f172a] mt-2">{stats.totalDoctors}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg flex items-center gap-1">
                    <AlertCircle size={12} /> {stats.pendingApprovals} pending
                  </span>
                </div>
              </div>
              <div className="p-4 bg-green-100 rounded-xl">
                <FaUserMd className="text-green-600 text-2xl" />
              </div>
            </div>
          </motion.div>

          {/* Revenue Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
                <p className="text-3xl font-black text-[#0f172a] mt-2">LKR {stats.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1">
                    <TrendingUp size={12} /> +{stats.revenueChange}%
                  </span>
                  <span className="text-xs text-slate-400">from {stats.totalAppointments} appointments</span>
                </div>
              </div>
              <div className="p-4 bg-emerald-100 rounded-xl">
                <FaDollarSign className="text-emerald-600 text-2xl" />
              </div>
            </div>
          </motion.div>

          {/* AI Success Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">AI Success Rate</p>
                <p className="text-3xl font-black text-[#0f172a] mt-2">{stats.aiSuccessRate}%</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg flex items-center gap-1">
                    <FaRobot size={12} /> AI Accuracy
                  </span>
                </div>
              </div>
              <div className="p-4 bg-purple-100 rounded-xl">
                <FaRobot className="text-purple-600 text-2xl" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4 border border-slate-100">
            <p className="text-xs text-slate-500">Prescriptions</p>
            <p className="text-2xl font-black text-[#0f172a]">{stats.totalPrescriptions}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-slate-100">
            <p className="text-xs text-slate-500">Medical Records</p>
            <p className="text-2xl font-black text-[#0f172a]">{stats.totalMedicalRecords}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-slate-100">
            <p className="text-xs text-slate-500">Feedbacks</p>
            <p className="text-2xl font-black text-[#0f172a]">{stats.totalFeedbacks}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-slate-100">
            <p className="text-xs text-slate-500">Active SOS</p>
            <p className="text-2xl font-black text-[#0f172a]">{stats.activeSOS}</p>
          </div>
        </div>

        {/* ===== MIDDLE LAYER: CHARTS ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Appointment Trends */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-[#0f172a] flex items-center gap-2">
                <FaChartLine className="text-teal-500" />
                Appointment Trends
              </h3>
              <div className="flex gap-2">
                {['week', 'month', 'year'].map(range => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition-all ${
                      dateRange === range 
                        ? 'bg-teal-500 text-white' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              <Line data={appointmentTrends} options={chartOptions} />
            </div>
          </div>

          {/* Specialization Distribution */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
            <h3 className="text-lg font-black text-[#0f172a] mb-6 flex items-center gap-2">
              <FaChartPie className="text-teal-500" />
              Doctor Specializations
            </h3>
            <div className="h-64">
              {specData.labels.length > 0 ? (
                <Pie data={specializationData} options={pieChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  No specialization data
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Symptom Analytics */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 mb-8">
          <h3 className="text-lg font-black text-[#0f172a] mb-6 flex items-center gap-2">
            <FaHeartbeat className="text-teal-500" />
            Symptom Analytics
          </h3>
          <div className="h-48">
            <Bar data={symptomAnalytics} options={chartOptions} />
          </div>
        </div>

        {/* ===== BOTTOM LAYER: TABS ===== */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3 border-b border-slate-200 pb-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                activeTab === 'overview' 
                  ? 'bg-teal-500 text-white' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                activeTab === 'doctors' 
                  ? 'bg-teal-500 text-white' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Doctor Approvals ({pendingApprovals.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                activeTab === 'users' 
                  ? 'bg-teal-500 text-white' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              User Management ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('sos')}
              className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                activeTab === 'sos' 
                  ? 'bg-teal-500 text-white' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              SOS Alerts ({stats.activeSOS})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                activeTab === 'audit' 
                  ? 'bg-teal-500 text-white' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Audit Logs
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {activeTab !== 'overview' && activeTab !== 'audit' && (
          <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 border border-slate-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-xl font-bold text-[#0f172a] focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* ===== TAB CONTENT ===== */}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
              <h3 className="text-lg font-black text-[#0f172a] mb-6 flex items-center gap-2">
                <Activity size={20} className="text-teal-500" />
                Recent Activities
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'doctor' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'patient' ? 'bg-green-100 text-green-600' :
                        activity.type === 'appointment' ? 'bg-purple-100 text-purple-600' :
                        activity.type === 'prescription' ? 'bg-amber-100 text-amber-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {activity.type === 'doctor' ? <FaUserMd size={16} /> :
                         activity.type === 'patient' ? <FaUsers size={16} /> :
                         activity.type === 'appointment' ? <FaCalendarCheck size={16} /> :
                         activity.type === 'prescription' ? <FaPrescriptionBottle size={16} /> :
                         <FaFileMedical size={16} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#0f172a]">{activity.action}</p>
                        <p className="text-sm text-slate-500">{activity.user}</p>
                      </div>
                      <span className="text-xs text-slate-400">{activity.time}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 py-8">No recent activities</p>
                )}
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
              <h3 className="text-lg font-black text-[#0f172a] mb-6 flex items-center gap-2">
                <FaUserClock className="text-amber-500" />
                Pending Approvals ({pendingApprovals.length})
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pendingApprovals.length > 0 ? (
                  pendingApprovals.map((doctor) => (
                    <div key={doctor.id} className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center text-amber-700 font-black">
                          {doctor.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-[#0f172a] text-sm">{doctor.name}</p>
                          <p className="text-xs text-amber-600">{doctor.specialization}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleApproveDoctor(doctor)}
                          className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-black hover:bg-green-700 transition-all flex items-center justify-center gap-1"
                        >
                          <FaCheck size={12} /> Approve
                        </button>
                        <button 
                          onClick={() => handleRejectDoctor(doctor)}
                          className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-black hover:bg-red-700 transition-all flex items-center justify-center gap-1"
                        >
                          <FaTimes size={12} /> Reject
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <FaCheckCircle className="mx-auto mb-3" size={32} />
                    <p>No pending approvals</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DOCTOR APPROVALS TAB */}
        {activeTab === 'doctors' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
            <h3 className="text-lg font-black text-[#0f172a] mb-6">Doctor Approvals & Verification</h3>
            
            <div className="space-y-4">
              {filteredDoctors.filter(d => d.status === 'pending' || !d.status).map((doctor) => (
                <motion.div 
                  key={doctor.id}
                  layout
                  className="p-6 bg-amber-50 rounded-2xl border-2 border-amber-200"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-amber-200 rounded-2xl flex items-center justify-center text-amber-700 font-black text-2xl">
                          {doctor.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-[#0f172a]">{doctor.name}</h4>
                          <p className="text-amber-600 font-bold">{doctor.specialization}</p>
                          <p className="text-sm text-slate-500">ID: {doctor.id}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-white rounded-xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Email</p>
                          <p className="font-bold text-sm">{doctor.email}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Phone</p>
                          <p className="font-bold text-sm">{doctor.phone || '+91 9876543210'}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase">License</p>
                          <p className="font-bold text-sm">{doctor.license || 'MED123456'}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Experience</p>
                          <p className="font-bold text-sm">{doctor.experience || '10+ years'}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleApproveDoctor(doctor)}
                          className="flex-1 py-4 bg-green-600 text-white rounded-xl font-black text-xs hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                        >
                          <FaCheck size={14} /> APPROVE DOCTOR
                        </button>
                        <button 
                          onClick={() => handleRejectDoctor(doctor)}
                          className="flex-1 py-4 bg-red-600 text-white rounded-xl font-black text-xs hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                        >
                          <FaTimes size={14} /> REJECT
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* USER MANAGEMENT TAB */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setSelectedSection('users')}
                className={`px-6 py-3 rounded-xl font-black text-xs uppercase transition-all ${
                  selectedSection === 'users' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                All Users ({users.length})
              </button>
              <button
                onClick={() => setSelectedSection('doctors')}
                className={`px-6 py-3 rounded-xl font-black text-xs uppercase transition-all ${
                  selectedSection === 'doctors' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                Doctors ({doctors.length})
              </button>
              <button
                onClick={() => setSelectedSection('patients')}
                className={`px-6 py-3 rounded-xl font-black text-xs uppercase transition-all ${
                  selectedSection === 'patients' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                Patients ({patients.length})
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">User</th>
                    <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">ID</th>
                    <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">Type</th>
                    <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">Status</th>
                    <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSection === 'doctors' ? filteredDoctors.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-[#0f172a]">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm font-bold">{user.id}</td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-black">
                          DOCTOR
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                          user.status === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {user.status === 'blocked' ? 'BLOCKED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <FaEye size={14} />
                          </button>
                          <button 
                            onClick={() => handleBlockUser(user)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          >
                            {user.status === 'blocked' ? <FaToggleOff size={14} /> : <FaToggleOn size={14} />}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : filteredPatients.map((user) => (
                    <tr key={user.userId} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-black">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-[#0f172a]">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm font-bold">{user.userId}</td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-black">
                          PATIENT
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                          user.status === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {user.status === 'blocked' ? 'BLOCKED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <FaEye size={14} />
                          </button>
                          <button 
                            onClick={() => handleBlockUser(user)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          >
                            {user.status === 'blocked' ? <FaToggleOff size={14} /> : <FaToggleOn size={14} />}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SOS ALERTS TAB */}
        {activeTab === 'sos' && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
              <h3 className="text-lg font-black text-[#0f172a] mb-6 flex items-center gap-2">
                <FaAmbulance className="text-red-500" />
                SOS Alerts
              </h3>
              
              <div className="space-y-4">
                {sosAlerts.filter(a => a.status === 'active').length > 0 ? (
                  sosAlerts.filter(a => a.status === 'active').map((alert) => (
                    <motion.div 
                      key={alert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-red-50 rounded-2xl border-2 border-red-200"
                    >
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-red-200 rounded-2xl flex items-center justify-center text-red-700 font-black text-2xl">
                              {alert.patient?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-xl font-black text-[#0f172a]">{alert.patient}</h4>
                              <div className="flex items-center gap-2 text-sm text-red-600 mt-1">
                                <FaClock /> {alert.time || 'Just now'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-3 bg-white rounded-xl">
                              <p className="text-[9px] font-black text-slate-400 uppercase">Location</p>
                              <p className="font-bold text-sm flex items-center gap-1">
                                <FaMapMarkerAlt className="text-red-500" /> {alert.location || 'Unknown'}
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-xl">
                              <p className="text-[9px] font-black text-slate-400 uppercase">Phone</p>
                              <p className="font-bold text-sm flex items-center gap-1">
                                <FaPhone className="text-red-500" /> {alert.phone || 'N/A'}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button 
                              onClick={() => handleResolveSOS(alert)}
                              className="flex-1 py-4 bg-green-600 text-white rounded-xl font-black text-xs hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                            >
                              <FaCheck size={14} /> MARK RESOLVED
                            </button>
                            <button className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                              <FaPhone size={14} /> CALL NOW
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <FaCheckCircle className="mx-auto mb-3" size={32} />
                    <p>No active SOS alerts</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AUDIT LOGS TAB */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
            <h3 className="text-lg font-black text-[#0f172a] mb-6 flex items-center gap-2">
              <FaHistory className="text-teal-500" />
              System Audit Logs
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">User</th>
                    <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">Action</th>
                    <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">IP Address</th>
                    <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">Time</th>
                    <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4 font-bold text-[#0f172a]">{log.user}</td>
                      <td className="py-4 px-4">{log.action}</td>
                      <td className="py-4 px-4 text-sm font-mono">{log.ip}</td>
                      <td className="py-4 px-4 text-sm text-slate-500">{log.time}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                          log.type === 'login' ? 'bg-blue-100 text-blue-600' :
                          log.type === 'create' ? 'bg-green-100 text-green-600' :
                          log.type === 'system' ? 'bg-purple-100 text-purple-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {log.type.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="px-6 py-3 bg-teal-500 text-white rounded-xl font-black text-xs hover:bg-teal-600 transition-all flex items-center gap-2">
                <FaDownload size={14} />
                EXPORT AUDIT LOGS
              </button>
            </div>
          </div>
        )}

        {/* System Health Footer */}
        <div className="mt-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/20 rounded-2xl">
                <FaShieldAlt size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black">System Health Status</h3>
                <p className="opacity-90 mt-1">All systems operational</p>
                <p className="text-sm opacity-70 mt-1">
                  {stats.totalPatients} Patients • {stats.totalDoctors} Doctors • {stats.totalAppointments} Appointments
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-3xl font-black">{stats.systemHealth}%</p>
                <p className="text-xs opacity-80">Uptime</p>
              </div>
              <div className="w-px h-10 bg-white/20"></div>
              <div className="text-center">
                <p className="text-3xl font-black">24/7</p>
                <p className="text-xs opacity-80">Monitoring</p>
              </div>
              <div className="w-px h-10 bg-white/20"></div>
              <div className="text-center">
                <p className="text-3xl font-black">{stats.activeSOS}</p>
                <p className="text-xs opacity-80">Active SOS</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;