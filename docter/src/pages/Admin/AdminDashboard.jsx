// src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  FaVideo, FaMapPin, FaLink, FaWallet, FaPercentage,
  FaSpinner
} from 'react-icons/fa';
import { 
  Activity, TrendingUp, AlertCircle, Shield, Award,
  Users, Calendar, DollarSign, Clock, Filter,
  Download, Eye, Check, X, Trash2, Edit,
  ChevronRight, Search, Plus,
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

const API_URL = 'http://localhost:5000/api';

const AdminDashboard = ({ userData, darkMode }) => {
  // ========== STATE MANAGEMENT ==========
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('users');
  const [dateRange, setDateRange] = useState('week');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');

  // ========== DATA FROM MONGODB ==========
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [activities, setActivities] = useState([]);

  // ========== STATS ==========
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

  // ========== HELPER FUNCTIONS ==========
  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const showNotificationMsg = (msg, type = 'success') => {
    setNotificationMessage(msg);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // ========== FETCH ALL DATA FROM MONGODB ==========
  const fetchAllData = async () => {
    setLoading(true);
    const token = getToken();

    if (!token) {
      showNotificationMsg('Please login again', 'error');
      setLoading(false);
      return;
    }

    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      // 1. Fetch all users (patients)
      let allUsers = [];
      let patientUsers = [];
      
      try {
        const usersRes = await axios.get(`${API_URL}/users/patients-list`, { headers });
        if (usersRes.data.success) {
          allUsers = usersRes.data.data || [];
          patientUsers = allUsers.filter(u => u.userType === 'patient');
          setUsers(allUsers);
          setPatients(patientUsers);
          console.log('✅ Loaded users:', allUsers.length);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      }

      // 2. Fetch all doctors
      let allDoctors = [];
      try {
        const doctorsRes = await axios.get(`${API_URL}/doctors`, { headers });
        if (doctorsRes.data.success) {
          allDoctors = doctorsRes.data.doctors || [];
          setDoctors(allDoctors);
          
          // Pending approvals
          const pending = allDoctors.filter(d => d.status === 'pending' || !d.isVerified);
          setPendingApprovals(pending);
          console.log('✅ Loaded doctors:', allDoctors.length);
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
      }

      // 3. Fetch all appointments
      let allAppointments = [];
      try {
        const appointmentsRes = await axios.get(`${API_URL}/appointments/admin/all`, { headers });
        if (appointmentsRes.data.success) {
          allAppointments = appointmentsRes.data.data || [];
          setAppointments(allAppointments);
          console.log('✅ Loaded appointments:', allAppointments.length);
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
      }

      // 4. Fetch prescriptions (via patients)
      let allPrescriptions = [];
      if (patientUsers.length > 0) {
        for (const patient of patientUsers.slice(0, 20)) {
          try {
            const presRes = await axios.get(`${API_URL}/prescriptions/patient/${patient.userId || patient._id}`, { headers });
            if (presRes.data.success && presRes.data.data) {
              allPrescriptions = [...allPrescriptions, ...presRes.data.data];
            }
          } catch (err) {
            // No prescriptions for this patient, continue
          }
        }
      }
      setPrescriptions(allPrescriptions);
      console.log('✅ Loaded prescriptions:', allPrescriptions.length);

      // 5. Fetch medical records
      let allMedicalRecords = [];
      if (patientUsers.length > 0) {
        for (const patient of patientUsers.slice(0, 20)) {
          try {
            const medRes = await axios.get(`${API_URL}/medical-records/${patient.userId || patient._id}`, { headers });
            if (medRes.data.success && medRes.data.data) {
              allMedicalRecords = [...allMedicalRecords, ...medRes.data.data];
            }
          } catch (err) {
            // No medical records for this patient, continue
          }
        }
      }
      setMedicalRecords(allMedicalRecords);
      console.log('✅ Loaded medical records:', allMedicalRecords.length);

      // 6. Fetch feedbacks
      let allFeedbacks = [];
      if (allDoctors.length > 0) {
        for (const doctor of allDoctors.slice(0, 10)) {
          try {
            const fbRes = await axios.get(`${API_URL}/feedback/doctor/${doctor.doctorId || doctor._id}`, { headers });
            if (fbRes.data.success && fbRes.data.feedbacks) {
              allFeedbacks = [...allFeedbacks, ...fbRes.data.feedbacks];
            }
          } catch (err) {
            // No feedback for this doctor, continue
          }
        }
      }
      setFeedbacks(allFeedbacks);
      console.log('✅ Loaded feedbacks:', allFeedbacks.length);

      // 7. Calculate stats
      calculateStats(
        patientUsers,
        allDoctors,
        allAppointments,
        allPrescriptions,
        allMedicalRecords,
        allFeedbacks
      );

      // 8. Generate activities
      generateActivities(allAppointments, allPrescriptions, allDoctors, patientUsers, allMedicalRecords);

    } catch (error) {
      console.error('Error fetching data:', error);
      showNotificationMsg('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ========== CALCULATE STATS ==========
  const calculateStats = (patientsData, doctorsData, appointmentsData, prescriptionsData, medicalRecordsData, feedbacksData) => {
    const totalPatients = patientsData.length;
    const totalDoctors = doctorsData.length;
    const totalAppointments = appointmentsData.length;
    const totalPrescriptions = prescriptionsData.length;
    const totalMedicalRecords = medicalRecordsData.length;
    const totalFeedbacks = feedbacksData.length;
    const pendingApprovalsCount = doctorsData.filter(d => d.status === 'pending' || !d.isVerified).length;
    
    // Calculate total revenue
    let totalRevenue = 0;
    appointmentsData.forEach(apt => {
      const fee = apt.fee || apt.consultationFee || 2500;
      totalRevenue += fee;
    });

    // Calculate average doctor rating
    let avgRating = 0;
    const doctorsWithRating = doctorsData.filter(d => d.rating);
    if (doctorsWithRating.length > 0) {
      const totalRating = doctorsWithRating.reduce((sum, d) => sum + parseFloat(d.rating), 0);
      avgRating = (totalRating / doctorsWithRating.length).toFixed(1);
    }

    // Calculate user growth (new users this month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const newUsersThisMonth = patientsData.filter(u => {
      const createdDate = new Date(u.createdAt);
      return createdDate >= lastMonth;
    }).length;
    const userGrowth = patientsData.length > 0 ? (newUsersThisMonth / patientsData.length) * 100 : 0;

    // Calculate appointment rate
    const thisMonth = new Date();
    const lastMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1);
    const thisMonthAppointments = appointmentsData.filter(apt => new Date(apt.date) >= lastMonthStart).length;
    const previousMonthAppointments = appointmentsData.filter(apt => new Date(apt.date) < lastMonthStart).length;
    let appointmentRate = 0;
    if (previousMonthAppointments > 0) {
      appointmentRate = ((thisMonthAppointments - previousMonthAppointments) / previousMonthAppointments) * 100;
    }

    // Calculate revenue change
    const thisMonthRevenue = appointmentsData
      .filter(apt => new Date(apt.date) >= lastMonthStart)
      .reduce((sum, apt) => sum + (apt.fee || 2500), 0);
    const previousMonthRevenue = appointmentsData
      .filter(apt => new Date(apt.date) < lastMonthStart)
      .reduce((sum, apt) => sum + (apt.fee || 2500), 0);
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
      pendingApprovals: pendingApprovalsCount,
      activeSOS: 0,
      avgRating,
      appointmentRate: Math.round(appointmentRate),
      revenueChange: Math.round(revenueChange),
      userGrowth: Math.round(userGrowth),
      aiSuccessRate: 92,
      systemHealth: 99.9
    });
  };

  // ========== GENERATE ACTIVITIES ==========
  const generateActivities = (appointmentsData, prescriptionsData, doctorsData, patientsData, medicalRecordsData) => {
    const activitiesList = [];

    // Recent appointments
    appointmentsData.slice(0, 5).forEach(apt => {
      activitiesList.push({
        id: `apt-${apt._id || Date.now()}`,
        action: 'New appointment booked',
        user: `${apt.patientName || 'Patient'} with ${apt.doctorName || 'Doctor'}`,
        time: getTimeAgo(apt.createdAt || apt.date),
        type: 'appointment'
      });
    });

    // Recent prescriptions
    prescriptionsData.slice(0, 3).forEach(pre => {
      activitiesList.push({
        id: `pre-${pre._id || Date.now()}`,
        action: 'Prescription created',
        user: `For ${pre.patient?.name || 'Patient'} by ${pre.doctor?.name || 'Doctor'}`,
        time: getTimeAgo(pre.dateTime || pre.date),
        type: 'prescription'
      });
    });

    // Recent patients
    patientsData.slice(0, 3).forEach(pat => {
      activitiesList.push({
        id: `pat-${pat.userId || pat._id}`,
        action: 'New patient registered',
        user: pat.name || 'Patient',
        time: getTimeAgo(pat.createdAt),
        type: 'patient'
      });
    });

    // Sort by time (newest first)
    activitiesList.sort((a, b) => {
      const timeA = a.time.includes('Just now') || a.time.includes('mins') ? 0 : 999;
      const timeB = b.time.includes('Just now') || b.time.includes('mins') ? 0 : 999;
      return timeA - timeB;
    });

    setActivities(activitiesList.slice(0, 10));
  };

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
    } catch {
      return 'Just now';
    }
  };

  // ========== HANDLE ACTIONS ==========
  const handleApproveDoctor = async (doctor) => {
    try {
      const token = getToken();
      await axios.put(
        `${API_URL}/doctors/${doctor._id || doctor.doctorId}`,
        { status: 'active', isVerified: true },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      showNotificationMsg(`Doctor ${doctor.name} approved successfully`);
      fetchAllData();
    } catch (error) {
      showNotificationMsg('Failed to approve doctor', 'error');
    }
  };

  const handleRejectDoctor = async (doctor) => {
    if (!window.confirm(`Reject doctor ${doctor.name}?`)) return;
    try {
      const token = getToken();
      await axios.delete(`${API_URL}/doctors/${doctor._id || doctor.doctorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showNotificationMsg(`Doctor ${doctor.name} rejected`);
      fetchAllData();
    } catch (error) {
      showNotificationMsg('Failed to reject doctor', 'error');
    }
  };

  const handleBlockUser = async (user) => {
    if (!window.confirm(`Block user ${user.name}?`)) return;
    try {
      const token = getToken();
      await axios.put(
        `${API_URL}/users/patients/${user._id}/status`,
        { status: user.status === 'active' ? 'blocked' : 'active' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      showNotificationMsg(`User ${user.name} ${user.status === 'active' ? 'blocked' : 'activated'}`);
      fetchAllData();
    } catch (error) {
      showNotificationMsg('Failed to update user status', 'error');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Permanently delete user ${user.name}? This action cannot be undone.`)) return;
    try {
      const token = getToken();
      await axios.delete(`${API_URL}/users/patients/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showNotificationMsg(`User ${user.name} deleted`);
      fetchAllData();
    } catch (error) {
      showNotificationMsg('Failed to delete user', 'error');
    }
  };

  // ========== CHART DATA ==========
  const getWeeklyAppointmentData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    
    appointments.forEach(apt => {
      try {
        const day = new Date(apt.date).getDay();
        const adjustedDay = day === 0 ? 6 : day - 1;
        if (adjustedDay >= 0 && adjustedDay < 7) {
          counts[adjustedDay]++;
        }
      } catch (e) {}
    });
    
    return counts;
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

  const specData = getSpecializationData();

  const appointmentTrends = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Appointments',
      data: getWeeklyAppointmentData(),
      borderColor: 'rgb(20, 184, 166)',
      backgroundColor: 'rgba(20, 184, 166, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const specializationData = {
    labels: specData.labels,
    datasets: [{
      data: specData.data,
      backgroundColor: [
        'rgba(20, 184, 166, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(34, 197, 94, 0.8)'
      ]
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } } }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  // ========== FILTERED DATA ==========
  const filteredDoctors = doctors.filter(d => 
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.doctorId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ========== EFFECTS ==========
  useEffect(() => {
    fetchAllData();
  }, [refreshTrigger]);

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
    showNotificationMsg('Dashboard refreshed');
  };

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'} flex items-center justify-center`}>
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-teal-500 mx-auto mb-4" />
          <p className={`${darkMode ? 'text-gray-400' : 'text-slate-600'} font-bold`}>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'} font-['Plus_Jakarta_Sans'] pb-20`}>
      
      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 ${notificationType === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4`}
          >
            {notificationType === 'success' ? <FaCheckCircle size={20} /> : <FaExclamationTriangle size={20} />}
            <span className="font-bold">{notificationMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-[#0f172a]'} pt-16 pb-32 px-6 lg:px-20 relative overflow-hidden`}>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                Admin <span className="text-teal-400">Dashboard</span>
              </h1>
              <p className="text-slate-400 font-bold mt-2">
                Real-time data from MongoDB
              </p>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-teal-400">{stats.totalPatients} Patients</span>
                <span className="text-slate-500">|</span>
                <span className="text-teal-400">{stats.totalDoctors} Doctors</span>
                <span className="text-slate-500">|</span>
                <span className="text-teal-400">{stats.totalAppointments} Appointments</span>
              </div>
            </div>
            
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-600 transition-all flex items-center gap-2"
            >
              <FaSync size={14} />
              REFRESH
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-500/10 to-transparent pointer-events-none" />
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-20 -mt-20 relative z-20">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div whileHover={{ y: -5 }} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Patients</p>
                <p className="text-3xl font-black text-[#0f172a] dark:text-white mt-2">{stats.totalPatients}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1">
                    <TrendingUp size={12} /> +{stats.userGrowth}%
                  </span>
                </div>
              </div>
              <div className="p-4 bg-blue-100 rounded-xl">
                <FaUsers className="text-blue-600 text-2xl" />
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Doctors</p>
                <p className="text-3xl font-black text-[#0f172a] dark:text-white mt-2">{stats.totalDoctors}</p>
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

          <motion.div whileHover={{ y: -5 }} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
                <p className="text-3xl font-black text-[#0f172a] dark:text-white mt-2">LKR {stats.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1">
                    <TrendingUp size={12} /> +{stats.revenueChange}%
                  </span>
                </div>
              </div>
              <div className="p-4 bg-emerald-100 rounded-xl">
                <FaDollarSign className="text-emerald-600 text-2xl" />
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Appointments</p>
                <p className="text-3xl font-black text-[#0f172a] dark:text-white mt-2">{stats.totalAppointments}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg flex items-center gap-1">
                    <FaCalendarCheck size={12} /> Total Bookings
                  </span>
                </div>
              </div>
              <div className="p-4 bg-purple-100 rounded-xl">
                <FaCalendarCheck className="text-purple-600 text-2xl" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow p-4`}>
            <p className="text-xs text-slate-500">Prescriptions</p>
            <p className="text-2xl font-black text-[#0f172a] dark:text-white">{stats.totalPrescriptions}</p>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow p-4`}>
            <p className="text-xs text-slate-500">Medical Records</p>
            <p className="text-2xl font-black text-[#0f172a] dark:text-white">{stats.totalMedicalRecords}</p>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow p-4`}>
            <p className="text-xs text-slate-500">Feedbacks</p>
            <p className="text-2xl font-black text-[#0f172a] dark:text-white">{stats.totalFeedbacks}</p>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow p-4`}>
            <p className="text-xs text-slate-500">Avg Rating</p>
            <p className="text-2xl font-black text-[#0f172a] dark:text-white">{stats.avgRating} ⭐</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3 border-b border-slate-200 dark:border-gray-700 pb-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                activeTab === 'overview' 
                  ? 'bg-teal-500 text-white' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                activeTab === 'doctors' 
                  ? 'bg-teal-500 text-white' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800'
              }`}
            >
              Doctor Approvals ({pendingApprovals.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                activeTab === 'users' 
                  ? 'bg-teal-500 text-white' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800'
              }`}
            >
              User Management ({users.length})
            </button>
          </div>
        </div>

        {/* Search Bar for Tabs */}
        {activeTab !== 'overview' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-gray-700 border-none rounded-xl font-bold text-[#0f172a] dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-black text-[#0f172a] dark:text-white mb-6 flex items-center gap-2">
                <Activity size={20} className="text-teal-500" />
                Recent Activities
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-xl transition-colors">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'doctor' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'patient' ? 'bg-green-100 text-green-600' :
                        activity.type === 'appointment' ? 'bg-purple-100 text-purple-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {activity.type === 'doctor' ? <FaUserMd size={16} /> :
                         activity.type === 'patient' ? <FaUsers size={16} /> :
                         activity.type === 'appointment' ? <FaCalendarCheck size={16} /> :
                         <FaFileMedical size={16} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#0f172a] dark:text-white">{activity.action}</p>
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

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-black text-[#0f172a] dark:text-white mb-6 flex items-center gap-2">
                <FaUserClock className="text-amber-500" />
                Pending Approvals ({pendingApprovals.length})
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pendingApprovals.length > 0 ? (
                  pendingApprovals.map((doctor) => (
                    <div key={doctor._id} className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center text-amber-700 dark:text-amber-300 font-black">
                          {doctor.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-[#0f172a] dark:text-white text-sm">{doctor.name}</p>
                          <p className="text-xs text-amber-600 dark:text-amber-400">{doctor.specialization}</p>
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-black text-[#0f172a] dark:text-white mb-6">Doctor Approvals & Verification</h3>
            
            <div className="space-y-4">
              {filteredDoctors.filter(d => d.status === 'pending' || !d.isVerified).map((doctor) => (
                <motion.div key={doctor._id} layout className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border-2 border-amber-200 dark:border-amber-800">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-amber-200 dark:bg-amber-800 rounded-2xl flex items-center justify-center text-amber-700 dark:text-amber-300 font-black text-2xl">
                          {doctor.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-[#0f172a] dark:text-white">{doctor.name}</h4>
                          <p className="text-amber-600 dark:text-amber-400 font-bold">{doctor.specialization}</p>
                          <p className="text-sm text-slate-500">ID: {doctor.doctorId || doctor._id}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Email</p>
                          <p className="font-bold text-sm">{doctor.email}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Phone</p>
                          <p className="font-bold text-sm">{doctor.phone || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase">License</p>
                          <p className="font-bold text-sm">{doctor.license || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Experience</p>
                          <p className="font-bold text-sm">{doctor.experience || 'N/A'}</p>
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
              {filteredDoctors.filter(d => d.status === 'pending' || !d.isVerified).length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <FaCheckCircle className="mx-auto mb-3" size={48} />
                  <p>No pending doctor approvals</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* USER MANAGEMENT TAB */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setSelectedSection('users')}
                className={`px-6 py-3 rounded-xl font-black text-xs uppercase transition-all ${
                  selectedSection === 'users' ? 'bg-teal-500 text-white' : 'bg-slate-100 dark:bg-gray-700 text-slate-500'
                }`}
              >
                All Users ({users.length})
              </button>
              <button
                onClick={() => setSelectedSection('doctors')}
                className={`px-6 py-3 rounded-xl font-black text-xs uppercase transition-all ${
                  selectedSection === 'doctors' ? 'bg-teal-500 text-white' : 'bg-slate-100 dark:bg-gray-700 text-slate-500'
                }`}
              >
                Doctors ({doctors.length})
              </button>
              <button
                onClick={() => setSelectedSection('patients')}
                className={`px-6 py-3 rounded-xl font-black text-xs uppercase transition-all ${
                  selectedSection === 'patients' ? 'bg-teal-500 text-white' : 'bg-slate-100 dark:bg-gray-700 text-slate-500'
                }`}
              >
                Patients ({patients.length})
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-gray-700">
                    <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">User</th>
                    <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">ID</th>
                    <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">Email</th>
                    <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">Status</th>
                    <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSection === 'doctors' ? (
                    filteredDoctors.map((user) => (
                      <tr key={user._id} className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-black">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-black text-[#0f172a] dark:text-white">{user.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm font-bold">{user.doctorId || user._id?.slice(-6)}</td>
                        <td className="py-4 px-4 text-sm">{user.email}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${
                            user.status === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {user.status === 'blocked' ? 'BLOCKED' : 'ACTIVE'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
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
                    ))
                  ) : (
                    filteredPatients.map((user) => (
                      <tr key={user._id} className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-300 font-black">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-black text-[#0f172a] dark:text-white">{user.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm font-bold">{user.userId || user._id?.slice(-6)}</td>
                        <td className="py-4 px-4 text-sm">{user.email}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${
                            user.status === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {user.status === 'blocked' ? 'BLOCKED' : 'ACTIVE'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 mb-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-[#0f172a] dark:text-white flex items-center gap-2">
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
                        : 'bg-slate-100 dark:bg-gray-700 text-slate-500'
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

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-black text-[#0f172a] dark:text-white mb-6 flex items-center gap-2">
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
                <p className="text-3xl font-black">{stats.avgRating}</p>
                <p className="text-xs opacity-80">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;