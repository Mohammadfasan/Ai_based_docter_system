// DoctorSchedule.jsx - Enhanced version with doctor details, workflow guide, and time validation

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaVideo, FaLink, FaTimes, FaWallet, FaEnvelope, FaIdCard, FaCalendarAlt, FaCheckCircle, FaClock
} from 'react-icons/fa';
import { 
  Stethoscope, Calendar as LucideCalendar, 
  Clock, ShieldCheck, Activity, PlusCircle, Trash2, MapPin, User,
  AlertCircle, Info, ChevronRight, FileText, Award, Phone, Mail, Building
} from 'lucide-react';
import { doctorScheduleService } from '../../services/doctorScheduleService';
import { doctorAPI } from '../../services/api';

const DoctorSchedule = ({ userData }) => {
  const [currentDoctor, setCurrentDoctor] = useState({
    id: '',
    name: 'Loading...',
    specialization: '',
    email: '',
    fee: 2500,
    doctorId: '',
    doctorIdDisplay: '',
    qualifications: '',
    experience: '',
    hospital: '',
    phone: '',
    rating: 4.5,
    status: 'active',
    about: '',
    languages: []
  });

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ time: '09:00', type: 'clinic', location: '', videoLink: '' });
  const [syncStatus, setSyncStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(1);
  const [stats, setStats] = useState({
    totalSlots: 0,
    bookedSlots: 0,
    availableSlots: 0,
    upcomingSlots: 0
  });

  // Check if a time is in the past for today's date
  const isTimeInPast = (time, date) => {
    const today = new Date().toISOString().split('T')[0];
    if (date !== today) return false;
    
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    
    return slotTime < now;
  };

  // Get available time slots (only future times for today)
  const getAvailableTimes = () => {
    const times = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        if (!isTimeInPast(time, selectedDate)) {
          times.push(time);
        }
      }
    }
    return times;
  };

  // Fetch complete doctor profile from API using email or userId
  const fetchDoctorProfile = async (email, userId) => {
    try {
      console.log('🔍 Fetching doctor profile for:', email || userId);
      
      const response = await doctorAPI.getAllDoctors();
      console.log('📋 All doctors response:', response);
      
      if (response.success && response.data) {
        let doctors = [];
        if (Array.isArray(response.data)) {
          doctors = response.data;
        } else if (response.data.doctors && Array.isArray(response.data.doctors)) {
          doctors = response.data.doctors;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          doctors = response.data.data;
        }
        
        let doctor = doctors.find(d => 
          d.email?.toLowerCase() === email?.toLowerCase() || 
          d.doctorId === userId || 
          d._id === userId ||
          d.email === email
        );
        
        if (!doctor && userData) {
          doctor = doctors.find(d => 
            d.email?.toLowerCase() === userData.email?.toLowerCase() ||
            d.doctorId === userData.userId ||
            d._id === userData.userId
          );
        }
        
        if (doctor) {
          console.log('✅ Found doctor profile:', doctor);
          
          let feeAmount = 2500;
          if (doctor.fees) {
            const feeStr = doctor.fees.toString();
            const match = feeStr.match(/\d+/);
            if (match) feeAmount = parseInt(match[0]);
          }
          
          return {
            id: doctor._id,
            name: doctor.name,
            specialization: doctor.specialization,
            email: doctor.email,
            fee: feeAmount,
            doctorId: doctor.doctorId,
            doctorIdDisplay: doctor.doctorId || doctor._id,
            qualifications: doctor.qualifications || '',
            experience: doctor.experience || '',
            hospital: doctor.hospital || '',
            phone: doctor.phone || '',
            rating: doctor.rating || 4.5,
            status: doctor.status || 'active',
            image: doctor.image || '',
            about: doctor.about || `Dr. ${doctor.name} is a highly experienced ${doctor.specialization} specialist dedicated to providing quality healthcare.`,
            languages: doctor.languages || ['English', 'Sinhala']
          };
        }
      }
      
      if (userId) {
        try {
          const doctorById = await doctorAPI.getDoctorById(userId);
          if (doctorById.success && doctorById.data) {
            const doctor = doctorById.data.doctor || doctorById.data;
            let feeAmount = 2500;
            if (doctor.fees) {
              const feeStr = doctor.fees.toString();
              const match = feeStr.match(/\d+/);
              if (match) feeAmount = parseInt(match[0]);
            }
            return {
              id: doctor._id,
              name: doctor.name,
              specialization: doctor.specialization,
              email: doctor.email,
              fee: feeAmount,
              doctorId: doctor.doctorId,
              doctorIdDisplay: doctor.doctorId || doctor._id,
              qualifications: doctor.qualifications || '',
              experience: doctor.experience || '',
              hospital: doctor.hospital || '',
              phone: doctor.phone || '',
              rating: doctor.rating || 4.5,
              status: doctor.status || 'active',
              image: doctor.image || '',
              about: doctor.about || `Dr. ${doctor.name} is a dedicated ${doctor.specialization} professional.`,
              languages: doctor.languages || ['English', 'Sinhala']
            };
          }
        } catch (err) {
          console.log('Direct doctor fetch failed:', err);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      return null;
    }
  };

  // Check authentication and load doctor data on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('currentUser');
    
    if (!token || !storedUser) {
      setAuthError(true);
      setLoading(false);
      return;
    }
    
    const loadDoctorData = async () => {
      try {
        const user = JSON.parse(storedUser);
        
        if (user.userType === 'doctor') {
          let doctorInfo = {
            id: user.userId || user._id || '',
            name: user.name || 'Loading...',
            specialization: user.specialization || 'General Physician',
            email: user.email || '',
            fee: typeof user.fees === 'number' ? user.fees : 2500,
            doctorId: user.doctorId || user.userId || user._id || '',
            doctorIdDisplay: user.doctorId || user.userId || user._id || '',
            qualifications: user.qualifications || '',
            experience: user.experience || '',
            hospital: user.hospital || '',
            phone: user.phone || '',
            rating: user.rating || 4.5,
            status: user.status || 'active',
            about: user.about || '',
            languages: user.languages || ['English', 'Sinhala']
          };
          
          const fullProfile = await fetchDoctorProfile(user.email, user.userId || user._id);
          if (fullProfile) {
            doctorInfo = { ...doctorInfo, ...fullProfile };
          }
          
          setCurrentDoctor(doctorInfo);
        } else {
          setAuthError(true);
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
        setAuthError(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadDoctorData();
  }, [userData]);

  // Load schedule after doctor info is set
  useEffect(() => {
    if (!authError && localStorage.getItem('token') && currentDoctor.name !== 'Loading...' && currentDoctor.doctorId) {
      loadDoctorSlots();
      loadScheduleStats();
    }
  }, [currentDoctor.id, currentDoctor.doctorId, authError]);

  const loadDoctorSlots = async () => {
    setLoading(true);
    try {
      const response = await doctorScheduleService.getMySchedule();
      
      if (response.success) {
        const slotsData = response.data.slots || [];
        setSlots(slotsData);
        setSyncStatus(`✅ Loaded ${slotsData.length} schedule slots`);
        setTimeout(() => setSyncStatus(''), 3000);
      } else {
        throw new Error(response.message || 'Failed to load schedule');
      }
    } catch (error) {
      console.error('Error loading slots:', error);
      if (error.response?.status === 401) {
        setAuthError(true);
        setSyncStatus('❌ Session expired. Please login again.');
      } else {
        setSlots([]);
        setSyncStatus('ℹ️ No schedule found. Create your first slot!');
      }
      setTimeout(() => setSyncStatus(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const loadScheduleStats = async () => {
    try {
      const response = await doctorScheduleService.getMyStats();
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAddSlot = async () => {
    // Validate time is not in past for today
    if (isTimeInPast(newSlot.time, selectedDate)) {
      alert("❌ Cannot add slot for a time that has already passed today!");
      return;
    }
    
    if (newSlot.type === 'clinic' && !newSlot.location) {
      alert("Please enter clinic location");
      return;
    }
    if (newSlot.type === 'video' && !newSlot.videoLink) {
      alert("Please enter meeting link");
      return;
    }
    
    // Check for duplicate slot
    const slotExists = slots.some(s => s.date === selectedDate && s.time === newSlot.time);
    if (slotExists) {
      alert("Slot already exists for this time on the selected date!");
      return;
    }

    try {
      const slotData = {
        time: newSlot.time,
        date: selectedDate,
        type: newSlot.type,
        location: newSlot.location,
        videoLink: newSlot.videoLink,
        fee: currentDoctor.fee
      };
      
      const response = await doctorScheduleService.addMySlot(slotData);
      
      if (response.success) {
        setSyncStatus('✅ Slot added successfully');
        setTimeout(() => setSyncStatus(''), 3000);
        
        await loadDoctorSlots();
        await loadScheduleStats();
        
        setNewSlot(prev => ({ 
          ...prev, 
          time: getNextAvailableTime(prev.time),
          location: '',
          videoLink: ''
        }));
        
        if (!confirm('Slot added! Add another slot?')) {
          setShowAddModal(false);
        }
      } else {
        throw new Error(response.message || 'Failed to add slot');
      }
    } catch (error) {
      console.error('Error adding slot:', error);
      let errorMsg = 'Error adding slot';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      setSyncStatus(`❌ ${errorMsg}`);
      setTimeout(() => setSyncStatus(''), 3000);
      alert(`Failed to add slot: ${errorMsg}`);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;
    
    try {
      const response = await doctorScheduleService.deleteMySlot(slotId);
      
      if (response.success) {
        setSyncStatus('✅ Slot deleted successfully');
        setTimeout(() => setSyncStatus(''), 3000);
        
        await loadDoctorSlots();
        await loadScheduleStats();
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      setSyncStatus(`❌ Error deleting slot: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setSyncStatus(''), 3000);
    }
  };

  const getNextAvailableTime = (currentTime) => {
    const [hours, minutes] = currentTime.split(':').map(Number);
    let date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes + 30);
    let newTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    
    // Skip past times for today
    while (isTimeInPast(newTime, selectedDate)) {
      date.setMinutes(date.getMinutes() + 30);
      newTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
    
    return newTime;
  };

  const filteredSlots = useMemo(() => {
    const filtered = slots.filter(s => s.date === selectedDate).sort((a,b) => a.time.localeCompare(b.time));
    // Add validation for past slots (mark them visually)
    return filtered.map(slot => ({
      ...slot,
      isExpired: isTimeInPast(slot.time, slot.date)
    }));
  }, [slots, selectedDate]);

  const getDailyRevenue = () => {
    return filteredSlots.filter(s => s.status !== 'booked' && !s.isExpired).length * (currentDoctor.fee || 2500);
  };

  // Show login required message
  if (authError) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Authentication Required</h2>
          <p className="text-slate-600 mb-6">Please login as a doctor to access the schedule dashboard.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-600 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: '"Inter", sans-serif' }} className="bg-[#f0f4f8] min-h-screen pb-20 overflow-x-hidden">
      
      {/* Sync Status Toast */}
      {syncStatus && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg animate-bounce ${
          syncStatus.includes('✅') ? 'bg-green-500' : syncStatus.includes('❌') ? 'bg-red-500' : 'bg-blue-500'
        } text-white`}>
          {syncStatus}
        </div>
      )}
      
      {/* HERO DASHBOARD with Doctor Details */}
      <div className="bg-gradient-to-br from-[#001b38] via-[#002a4d] to-[#001b38] pt-24 pb-32 px-6 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-cyan-500/30">
                Active Portal
              </span>
            </div>
            
            {/* Doctor Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
              <div>
                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none mb-4" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                  Dr. {currentDoctor.name}
                </h1>
                
                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <FaIdCard className="text-cyan-400" size={16} />
                    <span className="text-cyan-300 text-sm font-mono font-bold">
                      ID: {currentDoctor.doctorIdDisplay}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-teal-500/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <FaWallet className="text-teal-400" size={16} />
                    <span className="text-teal-300 text-sm font-bold">
                      Fee: LKR {currentDoctor.fee.toLocaleString()}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Award className="text-purple-400" size={16} />
                    <span className="text-purple-300 text-sm font-bold">
                      Rating: {currentDoctor.rating} ★
                    </span>
                  </div>
                </div>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="bg-white text-[#001b38] px-8 py-4 rounded-2xl shadow-xl font-black text-sm tracking-widest uppercase flex items-center gap-3 hover:bg-cyan-500 hover:text-white transition-all"
                style={{ fontFamily: '"Montserrat", sans-serif' }}
              >
                <PlusCircle size={20}/> Add New Slot
              </motion.button>
            </div>
            
            {/* Doctor Details Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-start gap-3">
                  <div className="bg-cyan-500/20 p-2 rounded-xl">
                    <Stethoscope className="text-cyan-400" size={20} />
                  </div>
                  <div>
                    <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider">Specialization</p>
                    <p className="text-white font-semibold">{currentDoctor.specialization}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-cyan-500/20 p-2 rounded-xl">
                    <Building className="text-cyan-400" size={20} />
                  </div>
                  <div>
                    <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider">Hospital / Clinic</p>
                    <p className="text-white font-semibold">{currentDoctor.hospital || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-cyan-500/20 p-2 rounded-xl">
                    <Award className="text-cyan-400" size={20} />
                  </div>
                  <div>
                    <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider">Qualifications</p>
                    <p className="text-white font-semibold text-sm">{currentDoctor.qualifications || 'MBBS'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-cyan-500/20 p-2 rounded-xl">
                    <Clock className="text-cyan-400" size={20} />
                  </div>
                  <div>
                    <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider">Experience</p>
                    <p className="text-white font-semibold">{currentDoctor.experience || '5+ years'}</p>
                  </div>
                </div>
              </div>
              
              {/* About Section */}
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex items-start gap-3">
                  <div className="bg-cyan-500/20 p-2 rounded-xl">
                    <FileText className="text-cyan-400" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">About</p>
                    <p className="text-gray-200 text-sm leading-relaxed">
                      {currentDoctor.about || `Dr. ${currentDoctor.name} is a dedicated ${currentDoctor.specialization} with extensive experience in providing quality healthcare. Committed to patient well-being and using the latest medical practices.`}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-white/20 flex flex-wrap gap-4">
                {currentDoctor.email && (
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Mail size={14} className="text-cyan-400" />
                    <span>{currentDoctor.email}</span>
                  </div>
                )}
                {currentDoctor.phone && (
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Phone size={14} className="text-cyan-400" />
                    <span>{currentDoctor.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        <Activity className="absolute -bottom-20 -left-10 text-white/5 w-96 h-96" />
      </div>

      {/* WORKFLOW GUIDE */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-cyan-100"
        >
          <h3 className="text-lg font-black text-[#001b38] mb-4 flex items-center gap-2">
            <Info size={20} className="text-cyan-500" />
            How to Add Slots - Quick Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`flex items-start gap-3 p-4 rounded-2xl transition-all ${workflowStep === 1 ? 'bg-cyan-50 border-2 border-cyan-500' : 'bg-gray-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${workflowStep === 1 ? 'bg-cyan-500 text-white' : 'bg-gray-300 text-gray-600'}`}>1</div>
              <div>
                <p className="font-bold text-[#001b38] flex items-center gap-2">
                  <FaCalendarAlt size={14} className="text-cyan-500" />
                  Select Date
                </p>
                <p className="text-xs text-gray-500 mt-1">Choose a date from the calendar picker below</p>
              </div>
            </div>
            
            <div className={`flex items-start gap-3 p-4 rounded-2xl transition-all ${workflowStep === 2 ? 'bg-cyan-50 border-2 border-cyan-500' : 'bg-gray-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${workflowStep === 2 ? 'bg-cyan-500 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
              <div>
                <p className="font-bold text-[#001b38] flex items-center gap-2">
                  <Clock size={14} className="text-cyan-500" />
                  Add Time & Location
                </p>
                <p className="text-xs text-gray-500 mt-1">Set time, choose clinic/video, add location/meeting link</p>
              </div>
            </div>
            
            <div className={`flex items-start gap-3 p-4 rounded-2xl transition-all ${workflowStep === 3 ? 'bg-cyan-50 border-2 border-cyan-500' : 'bg-gray-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${workflowStep === 3 ? 'bg-cyan-500 text-white' : 'bg-gray-300 text-gray-600'}`}>3</div>
              <div>
                <p className="font-bold text-[#001b38] flex items-center gap-2">
                  <FaCheckCircle size={14} className="text-cyan-500" />
                  Verify & Confirm
                </p>
                <p className="text-xs text-gray-500 mt-1">Check schedule page to verify your added slots</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

    

      {/* MAIN SCHEDULE AREA */}
      <div className="max-w-7xl mx-auto px-6 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar Date Picker */}
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-24">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#001b38] mb-6 border-b pb-4 flex items-center gap-2">
              <FaCalendarAlt size={14} className="text-cyan-500" />
              Step 1: Select Date
            </h3>
            <div className="flex flex-col gap-4">
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setWorkflowStep(2);
                }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-[#001b38] focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 font-medium px-2 italic text-center">
                💡 Tip: Past dates are blocked. Select today or future dates.
              </p>
              
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 mb-3">Quick Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Slots:</span>
                    <span className="font-bold text-[#001b38]">{stats.totalSlots}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Booked Slots:</span>
                    <span className="font-bold text-red-500">{stats.bookedSlots}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Available:</span>
                    <span className="font-bold text-green-500">{stats.availableSlots}</span>
                  </div>
                </div>
              </div>
              
              {/* Info Box */}
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="text-amber-500 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Past time slots for today cannot be booked or added.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slots Grid */}
        <div className="lg:col-span-9">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-[#001b38] uppercase tracking-tighter" style={{ fontFamily: '"Montserrat", sans-serif' }}>
              Day Timeline <span className="text-cyan-500 ml-2">//</span>
            </h2>
            <div className="text-xs text-slate-400">
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredSlots.length > 0 ? filteredSlots.map((slot) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={slot.id} 
                  className={`bg-white p-5 rounded-2xl shadow-sm border flex justify-between items-center group hover:shadow-md transition-all border-l-8 ${
                    slot.status === 'booked' ? 'border-l-red-500 opacity-60' : 
                    slot.isExpired ? 'border-l-gray-400 opacity-50' : 'border-l-[#001b38]'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`p-3 rounded-xl ${slot.isExpired ? 'bg-gray-100' : 'bg-slate-50'}`}>
                      <Clock size={20} className={slot.isExpired ? 'text-gray-400' : 'text-cyan-500'} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-black ${slot.isExpired ? 'text-gray-400' : 'text-[#001b38]'}`}>{slot.time}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tighter ${
                          slot.type === 'video' ? 'bg-purple-100 text-purple-600' : 'bg-cyan-100 text-cyan-600'
                        }`}>
                          {slot.type}
                        </span>
                        {slot.status === 'booked' && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-600">
                            Booked
                          </span>
                        )}
                        {slot.isExpired && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                            Expired
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-1">
                        {slot.type === 'clinic' ? <MapPin size={12}/> : <FaLink size={12}/>}
                        {slot.type === 'clinic' ? slot.location : slot.videoLink}
                      </p>
                      <p className="text-[10px] text-teal-600 font-medium mt-1">
                        Fee: LKR {slot.fee?.toLocaleString() || currentDoctor.fee.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {slot.status !== 'booked' && !slot.isExpired && (
                    <button 
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18}/>
                    </button>
                  )}
                </motion.div>
              )) : (
                <div className="col-span-full py-20 bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl text-center">
                  <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LucideCalendar className="text-slate-300" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">No slots scheduled for this day</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 text-cyan-500 text-xs font-bold hover:text-cyan-600"
                  >
                    + Add a slot
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* MODERN MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-[#001b38]/60 backdrop-blur-xl flex items-center justify-center z-50 p-6">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl relative"
            >
              <div className="bg-gradient-to-r from-[#001b38] to-[#002a4d] p-8 text-white relative overflow-hidden">
                <h2 className="text-3xl font-black uppercase tracking-tighter relative z-10" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                  Step 2: Add Slot
                </h2>
                <p className="text-cyan-400 text-[10px] font-bold tracking-[0.3em] uppercase mt-2 relative z-10">Configure your availability</p>
                <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-20"><FaTimes size={24}/></button>
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500 rounded-full blur-[80px] opacity-20" />
              </div>

              <div className="p-10 space-y-8">
                {/* Date Display */}
                <div className="bg-cyan-50 p-4 rounded-2xl border border-cyan-100">
                  <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">Selected Date</p>
                  <p className="text-lg font-black text-[#001b38]">
                    {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                
                {/* Time Input */}
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Step 2a: Starting Time</label>
                    <select 
                      value={newSlot.time} 
                      onChange={e => setNewSlot({...newSlot, time: e.target.value})} 
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-lg text-[#001b38] focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    >
                      {getAvailableTimes().map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-cyan-50 px-6 py-4 rounded-3xl border border-cyan-100 text-center">
                    <p className="text-[9px] font-black text-cyan-600 uppercase tracking-widest mb-1">Duration</p>
                    <p className="text-lg font-black text-[#001b38]">30 MIN</p>
                  </div>
                </div>

                {/* Type Selection */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Step 2b: Consultation Mode</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setNewSlot({...newSlot, type: 'clinic'})} 
                      className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                        newSlot.type === 'clinic' ? 'border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <MapPin size={24}/>
                      <span className="text-[10px] font-black uppercase tracking-widest">Physical</span>
                    </button>
                    <button 
                      onClick={() => setNewSlot({...newSlot, type: 'video'})} 
                      className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                        newSlot.type === 'video' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <FaVideo size={24}/>
                      <span className="text-[10px] font-black uppercase tracking-widest">Video</span>
                    </button>
                  </div>
                </div>

                {/* Conditional Fields */}
                <AnimatePresence mode="wait">
                  {newSlot.type === 'clinic' ? (
                    <motion.div key="c" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Step 2c: Hospital/Clinic Location</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Apollo Hospital, Wing A" 
                        value={newSlot.location} 
                        onChange={e => setNewSlot({...newSlot, location: e.target.value})} 
                        className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold text-[#001b38] focus:ring-2 focus:ring-cyan-500" 
                      />
                    </motion.div>
                  ) : (
                    <motion.div key="v" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Step 2c: Meeting Link</label>
                      <input 
                        type="text" 
                        placeholder="e.g. zoom.us/j/meetingid" 
                        value={newSlot.videoLink} 
                        onChange={e => setNewSlot({...newSlot, videoLink: e.target.value})} 
                        className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold text-[#001b38] focus:ring-2 focus:ring-purple-500" 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={handleAddSlot} 
                    className="flex-[2] bg-[#001b38] text-white py-6 rounded-3xl font-black text-xs tracking-[0.2em] uppercase shadow-2xl shadow-blue-900/40 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <FaCheckCircle size={16}/> Step 3: Add Slot
                  </button>
                  <button 
                    onClick={() => setShowAddModal(false)} 
                    className="flex-1 bg-slate-100 text-slate-400 py-6 rounded-3xl font-black text-xs uppercase hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
                
                <p className="text-center text-[10px] text-slate-400 mt-4">
                  ⏰ Past times for today are automatically blocked
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorSchedule;