import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTrash, FaPlus, FaChevronLeft, FaChevronRight, 
  FaVideo, FaMapMarkerAlt, FaLink, FaTimes, FaWallet, FaEnvelope
} from 'react-icons/fa';
import { 
  Stethoscope, Award, Users, Calendar as LucideCalendar, 
  Heart, Clock, ShieldCheck, Activity, PlusCircle, Trash2, MapPin
} from 'lucide-react';

const DoctorSchedule = ({ userData }) => {
  const [currentDoctor] = useState({
    id: userData?.userId || 'DOC001',
    name: userData?.name || 'Dr. Sarah Johnson',
    specialization: userData?.specialization || 'Cardiologist',
    email: userData?.email || 'doctor@healthai.com',
    fee: 2500 
  });

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ time: '09:00', type: 'clinic', location: '', videoLink: '' });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`doctor_slots_${currentDoctor.id}`) || '[]');
    setSlots(saved);
  }, [currentDoctor.id]);

  const saveSlots = (updated) => {
    localStorage.setItem(`doctor_slots_${currentDoctor.id}`, JSON.stringify(updated));
    setSlots(updated);
  };

  const getNextTime = (currentTime) => {
    const [hours, minutes] = currentTime.split(':').map(Number);
    let date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes + 30);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const handleAddSlot = () => {
    if (newSlot.type === 'clinic' && !newSlot.location) return alert("Enter Location");
    if (newSlot.type === 'video' && !newSlot.videoLink) return alert("Enter Meeting Link");
    if (slots.some(s => s.date === selectedDate && s.time === newSlot.time)) return alert("Slot exists!");

    const slotObj = { ...newSlot, id: Date.now(), date: selectedDate, status: 'available' };
    saveSlots([...slots, slotObj]);

    setNewSlot(prev => ({ ...prev, time: getNextTime(prev.time) }));
  };

  const filteredSlots = useMemo(() => 
    slots.filter(s => s.date === selectedDate).sort((a,b) => a.time.localeCompare(b.time))
  , [slots, selectedDate]);

  return (
    <div style={{ fontFamily: '"Inter", sans-serif' }} className="bg-[#f0f4f8] min-h-screen pb-20 overflow-x-hidden">
      
      {/* --- HERO DASHBOARD --- */}
      <div className="bg-[#001b38] pt-24 pb-40 px-6 relative">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-cyan-500/30">
                Active Portal
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none mb-4" style={{ fontFamily: '"Montserrat", sans-serif' }}>
              {currentDoctor.name}
            </h1>
            <div className="flex flex-wrap gap-6 text-slate-400 font-medium">
              <span className="flex items-center gap-2"><Stethoscope size={18} className="text-cyan-500"/> {currentDoctor.specialization}</span>
              <span className="flex items-center gap-2"><FaEnvelope size={16} className="text-cyan-500"/> {currentDoctor.email}</span>
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

      {/* --- STATS OVERLAY --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Daily Slots", val: filteredSlots.length, icon: <LucideCalendar className="text-white" />, bg: "bg-blue-600" },
          { label: "Daily Revenue", val: `LKR ${filteredSlots.length * 2500}`, icon: <FaWallet className="text-white" />, bg: "bg-emerald-500" },
          { label: "Rating", val: "4.9/5", icon: <Heart className="text-white" />, bg: "bg-rose-500" },
          { label: "Status", val: "Online", icon: <ShieldCheck className="text-white" />, bg: "bg-amber-500" }
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

      {/* --- MAIN SCHEDULE AREA --- */}
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
            </div>
          </div>
        </div>

        {/* Slots Grid */}
        <div className="lg:col-span-9">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-[#001b38] uppercase tracking-tighter" style={{ fontFamily: '"Montserrat", sans-serif' }}>
              Day Timeline <span className="text-cyan-500 ml-2">//</span>
            </h2>
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
                  className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group hover:shadow-md transition-all border-l-8 border-l-[#001b38]"
                >
                  <div className="flex items-center gap-5">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <Clock size={20} className="text-cyan-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-[#001b38]">{slot.time}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tighter ${slot.type === 'video' ? 'bg-purple-100 text-purple-600' : 'bg-cyan-100 text-cyan-600'}`}>
                          {slot.type}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-1">
                        {slot.type === 'clinic' ? <MapPin size={12}/> : <FaLink size={12}/>}
                        {slot.type === 'clinic' ? slot.location : slot.videoLink}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => saveSlots(slots.filter(s => s.id !== slot.id))}
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18}/>
                  </button>
                </motion.div>
              )) : (
                <div className="col-span-full py-20 bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl text-center">
                  <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LucideCalendar className="text-slate-300" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">No appointments for this day</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* --- MODERN MODAL --- */}
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
                    <input type="time" value={newSlot.time} onChange={e => setNewSlot({...newSlot, time: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-2xl text-[#001b38] focus:ring-2 focus:ring-cyan-500" />
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
                      className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${newSlot.type === 'clinic' ? 'border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      <MapPin size={24}/>
                      <span className="text-[10px] font-black uppercase tracking-widest">Physical</span>
                    </button>
                    <button 
                      onClick={() => setNewSlot({...newSlot, type: 'video'})} 
                      className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${newSlot.type === 'video' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
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
                      <input type="text" placeholder="e.g. Apollo Hospital, Wing A" value={newSlot.location} onChange={e => setNewSlot({...newSlot, location: e.target.value})} className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold text-[#001b38] focus:ring-2 focus:ring-cyan-500" />
                    </motion.div>
                  ) : (
                    <motion.div key="v" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Meeting Link</label>
                      <input type="text" placeholder="e.g. zoom.us/j/meetingid" value={newSlot.videoLink} onChange={e => setNewSlot({...newSlot, videoLink: e.target.value})} className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold text-[#001b38] focus:ring-2 focus:ring-purple-500" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-4 pt-4">
                  <button onClick={handleAddSlot} className="flex-[2] bg-[#001b38] text-white py-6 rounded-3xl font-black text-xs tracking-[0.2em] uppercase shadow-2xl shadow-blue-900/40 hover:bg-slate-800 transition-all">
                    Add & Next Slot (+30m)
                  </button>
                  <button onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-100 text-slate-400 py-6 rounded-3xl font-black text-xs uppercase hover:bg-slate-200 transition-all">Done</button>
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