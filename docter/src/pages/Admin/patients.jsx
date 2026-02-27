import React, { useState, useEffect } from 'react';
import { 
  FaUserMd, FaCalendarCheck, FaPrescriptionBottle, FaFileMedical,
  FaHeartbeat, FaPhone, FaEnvelope, FaMapMarkerAlt, FaVenusMars,
  FaTint, FaWeight, FaRuler, FaUserCircle, FaSearch,
  FaEye, FaEdit, FaTrash, FaFilter, FaDownload, FaPlus,
  FaChartLine, FaUsers, FaAmbulance, FaClock, FaCheckCircle,
  FaTimesCircle, FaExclamationTriangle, FaIdCard, FaNotesMedical
} from 'react-icons/fa';
import { 
  Activity, TrendingUp, AlertCircle, Shield, 
  User, Mail, Phone, MapPin, Calendar, Heart,
  Download, Eye, Edit, Trash2, Filter, Search,
  ChevronRight, MoreVertical, PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Patients = ({ userType, userData, darkMode }) => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    newThisMonth: 0,
    emergencyContacts: 0,
    avgAge: 0,
    maleCount: 0,
    femaleCount: 0,
    commonBloodGroup: 'O+'
  });

  // Load patients from localStorage
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = () => {
    setLoading(true);
    
    try {
      // Get all users from healthai_users
      const allUsers = JSON.parse(localStorage.getItem('healthai_users') || '[]');
      
      // Filter only patients
      const patientUsers = allUsers.filter(u => u.userType === 'patient');
      
      // Enhance patient data with medical info
      const enhancedPatients = patientUsers.map(patient => {
        const patientId = patient.userId || patient.id;
        
        // Get medical records for this patient
        const medicalRecords = JSON.parse(
          localStorage.getItem(`medical_records_${patientId}`) || '[]'
        );
        
        // Get appointments for this patient
        const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        const patientAppointments = allAppointments.filter(
          apt => apt.patientId === patientId || apt.patientEmail === patient.email
        );
        
        // Get prescriptions for this patient
        const allPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
        const patientPrescriptions = allPrescriptions.filter(
          pre => pre.patientId === patientId || pre.patientEmail === patient.email
        );
        
        return {
          ...patient,
          id: patientId,
          medicalRecordsCount: medicalRecords.length,
          appointmentsCount: patientAppointments.length,
          prescriptionsCount: patientPrescriptions.length,
          lastVisit: patientAppointments.length > 0 
            ? patientAppointments.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
            : null,
          // Default values for demo
          bloodGroup: patient.bloodGroup || ['A+', 'B+', 'O+', 'AB+'][Math.floor(Math.random() * 4)],
          age: patient.age || Math.floor(Math.random() * 40) + 20,
          gender: patient.gender || (Math.random() > 0.5 ? 'Male' : 'Female'),
          weight: patient.weight || Math.floor(Math.random() * 30) + 50,
          height: patient.height || Math.floor(Math.random() * 30) + 150,
          emergencyContact: patient.emergencyContact || '+94 77 123 4567',
          emergencyName: patient.emergencyName || 'Emergency Contact',
          address: patient.address || 'Colombo, Sri Lanka',
          status: patient.status || 'active',
          registeredDate: patient.createdAt || new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          allergies: patient.allergies || ['None'],
          chronicConditions: patient.chronicConditions || ['None']
        };
      });
      
      setPatients(enhancedPatients);
      calculateStats(enhancedPatients);
      
    } catch (error) {
      console.error('Error loading patients:', error);
      // Set demo data if error
      setPatients(getDemoPatients());
      calculateStats(getDemoPatients());
    }
    
    setLoading(false);
  };

  const getDemoPatients = () => {
    return [
      {
        id: 'PAT001',
        userId: 'PAT001',
        name: 'Alex Johnson',
        email: 'alex.johnson@email.com',
        phone: '+94 77 123 4567',
        age: 32,
        gender: 'Male',
        bloodGroup: 'O+',
        weight: 75,
        height: 175,
        address: 'Colombo 03, Sri Lanka',
        emergencyContact: '+94 77 987 6543',
        emergencyName: 'Sarah Johnson',
        status: 'active',
        registeredDate: '2024-01-15',
        lastVisit: '2024-03-10',
        appointmentsCount: 8,
        prescriptionsCount: 3,
        medicalRecordsCount: 12,
        allergies: ['Penicillin'],
        chronicConditions: ['None'],
        avatarColor: 'from-blue-500 to-blue-600'
      },
      {
        id: 'PAT002',
        userId: 'PAT002',
        name: 'Maria Garcia',
        email: 'maria.garcia@email.com',
        phone: '+94 77 234 5678',
        age: 28,
        gender: 'Female',
        bloodGroup: 'A+',
        weight: 62,
        height: 165,
        address: 'Colombo 05, Sri Lanka',
        emergencyContact: '+94 77 876 5432',
        emergencyName: 'Carlos Garcia',
        status: 'active',
        registeredDate: '2024-02-20',
        lastVisit: '2024-03-12',
        appointmentsCount: 5,
        prescriptionsCount: 2,
        medicalRecordsCount: 8,
        allergies: ['Sulfa', 'Latex'],
        chronicConditions: ['Asthma'],
        avatarColor: 'from-pink-500 to-rose-500'
      },
      {
        id: 'PAT003',
        userId: 'PAT003',
        name: 'Robert Chen',
        email: 'robert.chen@email.com',
        phone: '+94 77 345 6789',
        age: 45,
        gender: 'Male',
        bloodGroup: 'B+',
        weight: 82,
        height: 180,
        address: 'Colombo 07, Sri Lanka',
        emergencyContact: '+94 77 765 4321',
        emergencyName: 'Lisa Chen',
        status: 'inactive',
        registeredDate: '2023-11-05',
        lastVisit: '2024-02-28',
        appointmentsCount: 12,
        prescriptionsCount: 6,
        medicalRecordsCount: 20,
        allergies: ['None'],
        chronicConditions: ['Hypertension', 'Diabetes Type 2'],
        avatarColor: 'from-teal-500 to-teal-600'
      },
      {
        id: 'PAT004',
        userId: 'PAT004',
        name: 'Priya Sharma',
        email: 'priya.sharma@email.com',
        phone: '+94 77 456 7890',
        age: 35,
        gender: 'Female',
        bloodGroup: 'AB+',
        weight: 58,
        height: 162,
        address: 'Colombo 04, Sri Lanka',
        emergencyContact: '+94 77 654 3210',
        emergencyName: 'Raj Sharma',
        status: 'active',
        registeredDate: '2024-01-10',
        lastVisit: '2024-03-08',
        appointmentsCount: 6,
        prescriptionsCount: 4,
        medicalRecordsCount: 10,
        allergies: ['Peanuts'],
        chronicConditions: ['None'],
        avatarColor: 'from-purple-500 to-purple-600'
      },
      {
        id: 'PAT005',
        userId: 'PAT005',
        name: 'David Kim',
        email: 'david.kim@email.com',
        phone: '+94 77 567 8901',
        age: 52,
        gender: 'Male',
        bloodGroup: 'O-',
        weight: 88,
        height: 178,
        address: 'Colombo 08, Sri Lanka',
        emergencyContact: '+94 77 543 2109',
        emergencyName: 'Mary Kim',
        status: 'active',
        registeredDate: '2023-12-01',
        lastVisit: '2024-03-05',
        appointmentsCount: 15,
        prescriptionsCount: 8,
        medicalRecordsCount: 25,
        allergies: ['Codeine'],
        chronicConditions: ['Arthritis', 'High Cholesterol'],
        avatarColor: 'from-amber-500 to-amber-600'
      }
    ];
  };

  const calculateStats = (patientList) => {
    const totalPatients = patientList.length;
    const activePatients = patientList.filter(p => p.status === 'active').length;
    
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const newThisMonth = patientList.filter(p => new Date(p.registeredDate) >= firstDayOfMonth).length;
    
    const emergencyContacts = patientList.filter(p => p.emergencyContact).length;
    
    const ages = patientList.map(p => p.age).filter(a => a);
    const avgAge = ages.length > 0 
      ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) 
      : 0;
    
    const maleCount = patientList.filter(p => p.gender === 'Male').length;
    const femaleCount = patientList.filter(p => p.gender === 'Female').length;
    
    // Find most common blood group
    const bloodGroups = {};
    patientList.forEach(p => {
      if (p.bloodGroup) {
        bloodGroups[p.bloodGroup] = (bloodGroups[p.bloodGroup] || 0) + 1;
      }
    });
    let commonBloodGroup = 'O+';
    let maxCount = 0;
    Object.entries(bloodGroups).forEach(([group, count]) => {
      if (count > maxCount) {
        maxCount = count;
        commonBloodGroup = group;
      }
    });
    
    setStats({
      totalPatients,
      activePatients,
      newThisMonth,
      emergencyContacts,
      avgAge,
      maleCount,
      femaleCount,
      commonBloodGroup
    });
  };

  const refreshData = () => {
    loadPatients();
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const handleCloseModal = () => {
    setShowPatientModal(false);
    setSelectedPatient(null);
  };

  const handleBlockPatient = (patientId) => {
    if (window.confirm('Are you sure you want to block this patient?')) {
      const updatedPatients = patients.map(p => 
        p.id === patientId ? { ...p, status: 'blocked' } : p
      );
      setPatients(updatedPatients);
      
      // Also update in users list
      const allUsers = JSON.parse(localStorage.getItem('healthai_users') || '[]');
      const updatedUsers = allUsers.map(u => 
        (u.userId === patientId || u.id === patientId) ? { ...u, status: 'blocked' } : u
      );
      localStorage.setItem('healthai_users', JSON.stringify(updatedUsers));
      
      calculateStats(updatedPatients);
      alert('Patient blocked successfully');
    }
  };

  const handleUnblockPatient = (patientId) => {
    const updatedPatients = patients.map(p => 
      p.id === patientId ? { ...p, status: 'active' } : p
    );
    setPatients(updatedPatients);
    
    const allUsers = JSON.parse(localStorage.getItem('healthai_users') || '[]');
    const updatedUsers = allUsers.map(u => 
      (u.userId === patientId || u.id === patientId) ? { ...u, status: 'active' } : u
    );
    localStorage.setItem('healthai_users', JSON.stringify(updatedUsers));
    
    calculateStats(updatedPatients);
    alert('Patient activated successfully');
  };

  const handleDeletePatient = (patientId) => {
    if (window.confirm('Are you sure you want to permanently delete this patient? This action cannot be undone.')) {
      const updatedPatients = patients.filter(p => p.id !== patientId);
      setPatients(updatedPatients);
      
      // Remove from users list
      const allUsers = JSON.parse(localStorage.getItem('healthai_users') || '[]');
      const updatedUsers = allUsers.filter(u => u.userId !== patientId && u.id !== patientId);
      localStorage.setItem('healthai_users', JSON.stringify(updatedUsers));
      
      // Remove patient's medical records
      localStorage.removeItem(`medical_records_${patientId}`);
      
      calculateStats(updatedPatients);
      alert('Patient deleted successfully');
    }
  };

  // Filter patients based on search and status
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm) ||
      patient.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-black flex items-center gap-1"><FaCheckCircle size={10} /> ACTIVE</span>;
      case 'inactive':
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-black flex items-center gap-1"><FaClock size={10} /> INACTIVE</span>;
      case 'blocked':
        return <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-black flex items-center gap-1"><FaTimesCircle size={10} /> BLOCKED</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-black">{status?.toUpperCase()}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-slate-600 font-bold">Loading Patient Data...</p>
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
                <FaUsers className="text-teal-500" />
                Patient <span className="text-teal-500">Management</span>
              </h1>
              <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                View and manage all patients in the system
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={refreshData}
                className="px-4 py-2 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-600 transition-all flex items-center gap-2"
              >
                <Activity size={16} />
                REFRESH
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all flex items-center gap-2">
                <Download size={16} />
                EXPORT
              </button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-8">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-teal-50'}`}>
              <p className="text-xs text-teal-600 font-black">TOTAL</p>
              <p className="text-2xl font-black">{stats.totalPatients}</p>
              <p className="text-xs text-slate-500">Patients</p>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <p className="text-xs text-green-600 font-black">ACTIVE</p>
              <p className="text-2xl font-black">{stats.activePatients}</p>
              <p className="text-xs text-slate-500">Now</p>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className="text-xs text-blue-600 font-black">NEW</p>
              <p className="text-2xl font-black">{stats.newThisMonth}</p>
              <p className="text-xs text-slate-500">This Month</p>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <p className="text-xs text-purple-600 font-black">EMERGENCY</p>
              <p className="text-2xl font-black">{stats.emergencyContacts}</p>
              <p className="text-xs text-slate-500">Contacts</p>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-amber-50'}`}>
              <p className="text-xs text-amber-600 font-black">AVG AGE</p>
              <p className="text-2xl font-black">{stats.avgAge}</p>
              <p className="text-xs text-slate-500">Years</p>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-pink-50'}`}>
              <p className="text-xs text-pink-600 font-black">MALE/FEMALE</p>
              <p className="text-2xl font-black">{stats.maleCount}/{stats.femaleCount}</p>
              <p className="text-xs text-slate-500">Ratio</p>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
              <p className="text-xs text-red-600 font-black">BLOOD</p>
              <p className="text-2xl font-black">{stats.commonBloodGroup}</p>
              <p className="text-xs text-slate-500">Most Common</p>
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
              placeholder="Search patients by name, email, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 outline-none ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white'
              }`}
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 outline-none ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white'
              }`}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
            
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`px-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 outline-none ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white'
              }`}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            
            <button className="p-4 bg-teal-500 text-white rounded-2xl hover:bg-teal-600 transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className={`rounded-2xl shadow-xl overflow-hidden border ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-slate-100'
                }`}
              >
                <div className={`p-6 bg-gradient-to-r ${patient.avatarColor || 'from-teal-500 to-teal-600'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-white font-black text-2xl border-2 border-white/30">
                        {getInitials(patient.name)}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white">{patient.name}</h3>
                        <p className="text-white/80 text-sm flex items-center gap-1">
                          <FaIdCard size={12} /> ID: {patient.id}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(patient.status)}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
                        <Mail size={10} /> EMAIL
                      </p>
                      <p className="font-bold text-sm truncate">{patient.email}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
                        <Phone size={10} /> PHONE
                      </p>
                      <p className="font-bold text-sm">{patient.phone}</p>
                    </div>
                  </div>

                  {/* Demographics */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className={`p-2 rounded-xl text-center ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-[9px] font-black text-slate-400 uppercase">AGE</p>
                      <p className="font-black text-sm">{patient.age}</p>
                    </div>
                    <div className={`p-2 rounded-xl text-center ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-[9px] font-black text-slate-400 uppercase">GENDER</p>
                      <p className="font-black text-sm">
                        {patient.gender === 'Male' ? 'M' : patient.gender === 'Female' ? 'F' : 'O'}
                      </p>
                    </div>
                    <div className={`p-2 rounded-xl text-center ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-[9px] font-black text-slate-400 uppercase">BLOOD</p>
                      <p className="font-black text-sm text-red-600">{patient.bloodGroup}</p>
                    </div>
                    <div className={`p-2 rounded-xl text-center ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-[9px] font-black text-slate-400 uppercase">WEIGHT</p>
                      <p className="font-black text-sm">{patient.weight}kg</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className={`p-2 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-teal-50'}`}>
                      <p className="text-[9px] font-black text-teal-600">APPOINTMENTS</p>
                      <p className="text-xl font-black">{patient.appointmentsCount}</p>
                    </div>
                    <div className={`p-2 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                      <p className="text-[9px] font-black text-purple-600">PRESCRIPTIONS</p>
                      <p className="text-xl font-black">{patient.prescriptionsCount}</p>
                    </div>
                    <div className={`p-2 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                      <p className="text-[9px] font-black text-blue-600">RECORDS</p>
                      <p className="text-xl font-black">{patient.medicalRecordsCount}</p>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className={`p-3 rounded-xl ${darkMode ? 'bg-red-900/20' : 'bg-red-50'} border border-red-200`}>
                    <div className="flex items-center gap-2 text-red-600 text-xs font-black mb-1">
                      <FaAmbulance /> EMERGENCY CONTACT
                    </div>
                    <p className="font-bold text-sm">{patient.emergencyName}</p>
                    <p className="text-sm">{patient.emergencyContact}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => handleViewPatient(patient)}
                      className="flex-1 py-3 bg-blue-500 text-white rounded-xl text-xs font-black hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                    >
                      <FaEye size={12} /> VIEW
                    </button>
                    
                    {patient.status === 'blocked' ? (
                      <button 
                        onClick={() => handleUnblockPatient(patient.id)}
                        className="flex-1 py-3 bg-green-500 text-white rounded-xl text-xs font-black hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                      >
                        <FaCheckCircle size={12} /> UNBLOCK
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleBlockPatient(patient.id)}
                        className="flex-1 py-3 bg-amber-500 text-white rounded-xl text-xs font-black hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                      >
                        <FaTimesCircle size={12} /> BLOCK
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleDeletePatient(patient.id)}
                      className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-2 text-center py-20">
              <FaUsers className="text-6xl text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-slate-400">No Patients Found</h3>
              <p className="text-slate-400">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Patient Detail Modal */}
      <AnimatePresence>
        {showPatientModal && selectedPatient && (
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
              <div className={`p-6 bg-gradient-to-r ${selectedPatient.avatarColor || 'from-teal-500 to-teal-600'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-white font-black text-3xl border-2 border-white/30">
                      {getInitials(selectedPatient.name)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">{selectedPatient.name}</h2>
                      <p className="text-white/80">{selectedPatient.email}</p>
                      <p className="text-white/60 text-sm">ID: {selectedPatient.id}</p>
                    </div>
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
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <FaUserCircle className="text-teal-500" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Age</p>
                      <p className="font-black text-xl">{selectedPatient.age}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Gender</p>
                      <p className="font-black text-xl">{selectedPatient.gender}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Blood Group</p>
                      <p className="font-black text-xl text-red-600">{selectedPatient.bloodGroup}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Weight</p>
                      <p className="font-black text-xl">{selectedPatient.weight} kg</p>
                    </div>
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Height</p>
                      <p className="font-black text-xl">{selectedPatient.height} cm</p>
                    </div>
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Registered</p>
                      <p className="font-black text-sm">{new Date(selectedPatient.registeredDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <FaPhone className="text-teal-500" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Phone</p>
                      <p className="font-bold">{selectedPatient.phone}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Email</p>
                      <p className="font-bold">{selectedPatient.email}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'} col-span-2`}>
                      <p className="text-xs text-slate-400">Address</p>
                      <p className="font-bold">{selectedPatient.address}</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-red-900/20' : 'bg-red-50'} border border-red-200`}>
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-red-600">
                    <FaAmbulance />
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Name</p>
                      <p className="font-bold">{selectedPatient.emergencyName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Phone</p>
                      <p className="font-bold">{selectedPatient.emergencyContact}</p>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div>
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <FaNotesMedical className="text-teal-500" />
                    Medical Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Allergies</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.allergies?.map((allergy, idx) => (
                          <span key={idx} className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-black">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Chronic Conditions</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.chronicConditions?.map((condition, idx) => (
                          <span key={idx} className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-black">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Summary */}
                <div>
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <Activity className="text-teal-500" />
                    Activity Summary
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className={`p-3 rounded-xl text-center ${darkMode ? 'bg-gray-700' : 'bg-teal-50'}`}>
                      <p className="text-3xl font-black text-teal-600">{selectedPatient.appointmentsCount}</p>
                      <p className="text-xs">Appointments</p>
                    </div>
                    <div className={`p-3 rounded-xl text-center ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                      <p className="text-3xl font-black text-purple-600">{selectedPatient.prescriptionsCount}</p>
                      <p className="text-xs">Prescriptions</p>
                    </div>
                    <div className={`p-3 rounded-xl text-center ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                      <p className="text-3xl font-black text-blue-600">{selectedPatient.medicalRecordsCount}</p>
                      <p className="text-xs">Records</p>
                    </div>
                  </div>
                  {selectedPatient.lastVisit && (
                    <p className="text-center mt-4 text-sm text-slate-400">
                      Last Visit: {new Date(selectedPatient.lastVisit).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-slate-200'} flex justify-end gap-3`}>
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 transition-all font-bold text-sm"
                >
                  Close
                </button>
                <button className="px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all font-bold text-sm flex items-center gap-2">
                  <FaEdit size={14} />
                  Edit Patient
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Patients;