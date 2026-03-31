// DoctorSchedule.jsx - Fixed version with proper doctor info sync

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaVideo, FaLink, FaTimes, FaWallet, FaEnvelope, FaIdCard
} from 'react-icons/fa';
import { 
  Stethoscope, Calendar as LucideCalendar, 
  Clock, ShieldCheck, Activity, PlusCircle, Trash2, MapPin, User
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
    status: 'active'
  });

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ time: '09:00', type: 'clinic', location: '', videoLink: '' });
  const [syncStatus, setSyncStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [stats, setStats] = useState({
    totalSlots: 0,
    bookedSlots: 0,
    availableSlots: 0,
    upcomingSlots: 0
  });

  // Fetch complete doctor profile from API using email or userId
  const fetchDoctorProfile = async (email, userId) => {
    try {
      console.log('🔍 Fetching doctor profile for:', email || userId);
      
      // First try to get all doctors and find by email or ID
      const response = await doctorAPI.getAllDoctors();
      console.log('📋 All doctors response:', response);
      
      if (response.success && response.data) {
        // Handle different response structures
        let doctors = [];
        if (Array.isArray(response.data)) {
          doctors = response.data;
        } else if (response.data.doctors && Array.isArray(response.data.doctors)) {
          doctors = response.data.doctors;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          doctors = response.data.data;
        }
        
        console.log('📋 Doctors list:', doctors);
        
        // Find doctor by email or userId
        let doctor = doctors.find(d => 
          d.email?.toLowerCase() === email?.toLowerCase() || 
          d.doctorId === userId || 
          d._id === userId ||
          d.email === email
        );
        
        // If still not found and we have userData, try that
        if (!doctor && userData) {
          doctor = doctors.find(d => 
            d.email?.toLowerCase() === userData.email?.toLowerCase() ||
            d.doctorId === userData.userId ||
            d._id === userData.userId
          );
        }
        
        if (doctor) {
          console.log('✅ Found doctor profile:', doctor);
          
          // Parse fees if it's a string with LKR
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
            image: doctor.image || ''
          };
        }
      }
      
      // Try to get doctor by ID directly
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
              image: doctor.image || ''
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
    
    console.log('🔐 Auth Check - Token:', token ? 'Present' : 'Missing');
    console.log('📦 Stored User:', storedUser);
    
    if (!token || !storedUser) {
      setAuthError(true);
      setLoading(false);
      return;
    }
    
    // Update doctor info from stored user
    const loadDoctorData = async () => {
      try {
        const user = JSON.parse(storedUser);
        console.log('👨‍⚕️ User from storage:', user);
        
        if (user.userType === 'doctor') {
          // Set initial doctor info from stored user
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
            status: user.status || 'active'
          };
          
          // Fetch complete profile from API
          const fullProfile = await fetchDoctorProfile(user.email, user.userId || user._id);
          if (fullProfile) {
            doctorInfo = { ...doctorInfo, ...fullProfile };
          }
          
          console.log('✅ Final doctor info:', doctorInfo);
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
      console.log('🔄 Loading schedule for doctor:', currentDoctor.doctorId);
      loadDoctorSlots();
      loadScheduleStats();
    }
  }, [currentDoctor.id, currentDoctor.doctorId, authError]);

  const loadDoctorSlots = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Use the 'me' endpoint for logged-in doctor
      const response = await doctorScheduleService.getMySchedule();
      
      console.log('📥 Schedule response:', response);
      
      if (response.success) {
        const slotsData = response.data.slots || [];
        console.log('📋 Loaded slots:', slotsData.length);
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
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await doctorScheduleService.getMyStats();
      console.log('📊 Stats response:', response);
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAddSlot = async () => {
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
      
      console.log('📝 Adding slot:', slotData);
      console.log('👨‍⚕️ Current doctor:', currentDoctor);
      
      const response = await doctorScheduleService.addMySlot(slotData);
      
      console.log('📥 Add slot response:', response);
      
      if (response.success) {
        setSyncStatus('✅ Slot added successfully');
        setTimeout(() => setSyncStatus(''), 3000);
        
        await loadDoctorSlots();
        await loadScheduleStats();
        
        setNewSlot(prev => ({ 
          ...prev, 
          time: getNextTime(prev.time),
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

  const getNextTime = (currentTime) => {
    const [hours, minutes] = currentTime.split(':').map(Number);
    let date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes + 30);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const filteredSlots = useMemo(() => 
    slots.filter(s => s.date === selectedDate).sort((a,b) => a.time.localeCompare(b.time))
  , [slots, selectedDate]);

  const getDailyRevenue = () => {
    return filteredSlots.filter(s => s.status !== 'booked').length * (currentDoctor.fee || 2500);
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
      
      {/* HERO DASHBOARD */}
      <div className="bg-[#001b38] pt-24 pb-40 px-6 relative">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-cyan-500/30">
                Active Portal
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none mb-4" style={{ fontFamily: '"Montserrat", sans-serif' }}>
              Dr. {currentDoctor.name}
            </h1>
            
            {/* Doctor ID Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <FaIdCard className="text-cyan-400" size={16} />
              <span className="text-cyan-300 text-sm font-mono font-bold">
                ID: {currentDoctor.doctorIdDisplay}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-6 text-slate-400 font-medium">
              <span className="flex items-center gap-2">
                <Stethoscope size={18} className="text-cyan-500"/> 
                {currentDoctor.specialization}
              </span>
              <span className="flex items-center gap-2">
                <FaEnvelope size={16} className="text-cyan-500"/> 
                {currentDoctor.email}
              </span>
              <span className="flex items-center gap-2">
                <FaWallet size={16} className="text-cyan-500"/> 
                LKR {currentDoctor.fee.toLocaleString()}
              </span>
            </div>
            
            {/* Additional Info */}
            <div className="mt-3 flex flex-wrap gap-3">
              {currentDoctor.qualifications && (
                <span className="text-xs text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full">
                  📚 {currentDoctor.qualifications}
                </span>
              )}
              {currentDoctor.experience && (
                <span className="text-xs text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full">
                  ⏱️ {currentDoctor.experience}
                </span>
              )}
              {currentDoctor.hospital && (
                <span className="text-xs text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full">
                  🏥 {currentDoctor.hospital}
                </span>
              )}
              {currentDoctor.phone && (
                <span className="text-xs text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full">
                  📞 {currentDoctor.phone}
                </span>
              )}
            </div>
          </motion.div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="bg-white text-[#001b38] px-10 py-5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] font-black text-xs tracking-widest uppercase flex items-center gap-3 hover:bg-cyan-500 transition-all"
            style={{ fontFamily: '"Montserrat", sans-serif' }}
          >
            <PlusCircle size={20}/> Build Schedule
          </motion.button>
        </div>
        
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        <Activity className="absolute -bottom-20 -left-10 text-white/5 w-96 h-96" />
      </div>

      {/* STATS OVERLAY */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Daily Slots", val: filteredSlots.filter(s => s.status !== 'booked').length, icon: <LucideCalendar className="text-white" />, bg: "bg-blue-600" },
          { label: "Daily Revenue", val: `LKR ${getDailyRevenue().toLocaleString()}`, icon: <FaWallet className="text-white" />, bg: "bg-emerald-500" },
          { label: "Total Slots", val: stats.totalSlots, icon: <Clock className="text-white" />, bg: "bg-purple-500" },
          { label: "Available", val: stats.availableSlots, icon: <ShieldCheck className="text-white" />, bg: "bg-amber-500" }
        ].map((item, i) => (
          <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-5 border border-slate-100">
            <div className={`${item.bg} p-4 rounded-xl shadow-lg`}>{item.icon}</div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
              <p className="text-xl font-black text-[#001b38]" style={{ fontFamily: '"Montserrat", sans-serif' }}>{item.val}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* MAIN SCHEDULE AREA */}
      <div className="max-w-7xl mx-auto px-6 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar Date Picker */}
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#001b38] mb-6 border-b pb-4">Select Date</h3>
            <div className="flex flex-col gap-4">
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-[#001b38] focus:ring-2 focus:ring-cyan-500 outline-none"
              />
              <p className="text-[11px] text-slate-400 font-medium px-2 italic text-center">Manage slots for the selected date above.</p>
              
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
              Showing slots for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
                    slot.status === 'booked' ? 'border-l-red-500 opacity-60' : 'border-l-[#001b38]'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <Clock size={20} className="text-cyan-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-[#001b38]">{slot.time}</span>
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
                  {slot.status !== 'booked' && (
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
              <div className="bg-[#001b38] p-8 text-white relative overflow-hidden">
                <h2 className="text-3xl font-black uppercase tracking-tighter relative z-10" style={{ fontFamily: '"Montserrat", sans-serif' }}>Slot Wizard</h2>
                <p className="text-cyan-400 text-[10px] font-bold tracking-[0.3em] uppercase mt-2 relative z-10">Configure availability</p>
                <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-20"><FaTimes size={24}/></button>
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500 rounded-full blur-[80px] opacity-20" />
              </div>

              <div className="p-10 space-y-8">
                {/* Time Input */}
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Starting Time</label>
                    <input 
                      type="time" 
                      value={newSlot.time} 
                      onChange={e => setNewSlot({...newSlot, time: e.target.value})} 
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-2xl text-[#001b38] focus:ring-2 focus:ring-cyan-500" 
                    />
                  </div>
                  <div className="bg-cyan-50 px-6 py-4 rounded-3xl border border-cyan-100 text-center">
                    <p className="text-[9px] font-black text-cyan-600 uppercase tracking-widest mb-1">Duration</p>
                    <p className="text-lg font-black text-[#001b38]">30 MIN</p>
                  </div>
                </div>

                {/* Type Selection */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Consultation Mode</label>
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
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Hospital/Clinic Location</label>
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
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Meeting Link</label>
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
                    className="flex-[2] bg-[#001b38] text-white py-6 rounded-3xl font-black text-xs tracking-[0.2em] uppercase shadow-2xl shadow-blue-900/40 hover:bg-slate-800 transition-all"
                  >
                    Add & Next Slot (+30m)
                  </button>
                  <button 
                    onClick={() => setShowAddModal(false)} 
                    className="flex-1 bg-slate-100 text-slate-400 py-6 rounded-3xl font-black text-xs uppercase hover:bg-slate-200 transition-all"
                  >
                    Done
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

export default DoctorSchedule;