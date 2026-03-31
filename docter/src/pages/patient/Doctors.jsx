import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, Star, Clock, Video, Shield, 
  Stethoscope, Hospital, ChevronRight, Languages, Globe, Calendar
} from 'lucide-react';
import { doctorScheduleService } from '../../services/doctorScheduleService';
import { doctorAPI } from '../../services/api';

const Doctors = ({ doctorsData = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [doctorsWithAvailability, setDoctorsWithAvailability] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const navigate = useNavigate();

  const filters = [
    "All", "Cardiologist", "Dermatologist", "Pediatrician", 
    "General Physician", "Dentist", "ENT Specialist", 
    "Neurologist", "Orthopedic", "Psychiatrist", "Gynecologist", "Oncologist"
  ];

  // Function to check doctor availability from API
  const checkDoctorAvailability = async (doctorId) => {
    try {
      // Get available slots from API
      const response = await doctorScheduleService.getAvailableSlots(doctorId);
      console.log(`📅 Availability for doctor ${doctorId}:`, response);
      
      let slots = [];
      if (response.success) {
        slots = response.data || [];
      } else if (Array.isArray(response)) {
        slots = response;
      } else if (response.data && Array.isArray(response.data)) {
        slots = response.data;
      }
      
      const today = new Date().toISOString().split('T')[0];
      const availableSlots = slots.filter(slot => slot.date >= today && slot.status === 'available');
      
      return {
        hasAvailableSlots: availableSlots.length > 0,
        availableSlotsCount: availableSlots.length,
        slots: availableSlots
      };
    } catch (error) {
      console.error(`Error checking availability for doctor ${doctorId}:`, error);
      return {
        hasAvailableSlots: false,
        availableSlotsCount: 0,
        slots: []
      };
    }
  };

  // Load doctors with availability info
  useEffect(() => {
    const loadDoctorsWithAvailability = async () => {
      setLoadingAvailability(true);
      
      try {
        // First, get the base doctors data
        let doctors = [];
        if (doctorsData && doctorsData.length > 0) {
          doctors = doctorsData;
        } else {
          // Fetch doctors if not provided
          const response = await doctorAPI.getAllDoctors();
          if (response.success) {
            if (Array.isArray(response.data)) {
              doctors = response.data;
            } else if (response.data.doctors) {
              doctors = response.data.doctors;
            } else if (response.data.data) {
              doctors = response.data.data;
            }
          }
        }
        
        console.log('📋 Base doctors:', doctors);
        
        // Check availability for each doctor
        const enhancedDoctors = await Promise.all(
          doctors.map(async (doctor) => {
            const doctorId = doctor._id || doctor.id || doctor.userId || doctor.doctorId;
            const availability = await checkDoctorAvailability(doctorId);
            
            // Parse fee if needed
            let feeDisplay = doctor.fees || 'LKR 2,500';
            let feeAmount = 2500;
            if (doctor.fees) {
              const feeStr = doctor.fees.toString();
              const match = feeStr.match(/\d+/);
              if (match) feeAmount = parseInt(match[0]);
            }
            
            return {
              ...doctor,
              id: doctorId,
              feeAmount: feeAmount,
              feeDisplay: feeDisplay,
              hasAvailableSlots: availability.hasAvailableSlots,
              availableSlotsCount: availability.availableSlotsCount,
              availableSlots: availability.slots
            };
          })
        );
        
        console.log('✅ Enhanced doctors with availability:', enhancedDoctors);
        setDoctorsWithAvailability(enhancedDoctors);
      } catch (error) {
        console.error('Error loading doctors with availability:', error);
        // Fallback: show doctors without availability info
        const fallbackDoctors = doctorsData.map(doctor => ({
          ...doctor,
          hasAvailableSlots: false,
          availableSlotsCount: 0
        }));
        setDoctorsWithAvailability(fallbackDoctors);
      } finally {
        setLoadingAvailability(false);
      }
    };
    
    loadDoctorsWithAvailability();
  }, [doctorsData]);

  const filteredDoctors = doctorsWithAvailability.filter((doctor) => {
    const matchesSearch = searchTerm === "" || 
      doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === "All" || doctor.specialization?.toLowerCase().includes(activeFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const formatLanguages = (languages) => {
    if (!languages) return 'English, Sinhala';
    if (Array.isArray(languages)) {
      return languages.join(', ');
    }
    return languages;
  };

  const getDoctorId = (doctor) => {
    return doctor._id || doctor.id || doctor.userId || doctor.doctorId;
  };

  // Loading state
  if (loadingAvailability && doctorsWithAvailability.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Plus_Jakarta_Sans'] pb-24">
      
      {/* Header Section */}
      <section className="bg-[#0f172a] pt-24 pb-44 px-6 lg:px-20 relative overflow-hidden rounded-b-[4rem]">
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-teal-500/10 blur-[100px] rounded-full"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center lg:text-left">
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6">
            Our Specialist <span className="text-teal-400">Doctors</span>
          </h1>
          
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search Bar */}
            <div className="w-full lg:max-w-xl relative group">
              <div className="absolute inset-0 bg-teal-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-all"></div>
              <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 p-2 rounded-3xl flex items-center shadow-2xl">
                <Search className="ml-5 text-teal-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search name, location or specialty..." 
                  className="w-full bg-transparent border-none outline-none p-4 text-white placeholder:text-slate-500 font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-12 flex gap-3 overflow-x-auto no-scrollbar py-2">
            {filters.map((filter) => (
              <button 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-8 py-3 rounded-2xl text-sm font-black transition-all duration-300 whitespace-nowrap ${
                  activeFilter === filter 
                    ? "bg-teal-500 text-[#0f172a] shadow-lg shadow-teal-500/20 scale-105" 
                    : "bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3-Column Grid Section */}
      <main className="max-w-7xl mx-auto px-6 lg:px-20 -mt-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <div key={getDoctorId(doctor)} className="group bg-white rounded-[3rem] p-5 border border-slate-100 hover:border-teal-200 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] flex flex-col">
                
                {/* Image Section */}
                <div className="relative mb-6">
                  <div className="w-full h-64 rounded-[2.5rem] overflow-hidden">
                    <img 
                      src={doctor.image || `https://ui-avatars.com/api/?name=${doctor.name?.charAt(0)}&background=0D9488&color=fff&size=200`} 
                      alt={doctor.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${doctor.name?.charAt(0)}&background=0D9488&color=fff&size=200`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-white font-black text-sm">{doctor.rating || 4.5}</span>
                    </div>
                    {doctor.hasAvailableSlots && (
                      <div className="bg-green-500 p-2.5 rounded-2xl text-white shadow-lg flex items-center gap-1">
                        <Calendar size={14} />
                        <span className="text-[10px] font-bold">{doctor.availableSlotsCount} slots</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 px-2">
                  <h3 className="text-2xl font-black text-[#0f172a] group-hover:text-teal-600 transition-colors mb-1">{doctor.name}</h3>
                  <p className="text-teal-600 font-black text-sm uppercase tracking-widest mb-4">{doctor.specialization}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-slate-500 text-sm font-bold">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-teal-500">
                        <MapPin size={16} />
                      </div>
                      {doctor.location || 'Colombo'}
                    </div>

                    <div className="flex items-center gap-3 text-slate-500 text-sm font-bold">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-blue-500">
                        <Globe size={16} />
                      </div>
                      {formatLanguages(doctor.languages)}
                    </div>

                    <div className="flex items-center gap-3 text-slate-500 text-sm font-bold">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-purple-500">
                        <Hospital size={16} />
                      </div>
                      {doctor.hospital}
                    </div>
                    
                    <div className="flex items-center gap-3 text-slate-500 text-sm font-bold">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-orange-500">
                        <Clock size={16} />
                      </div>
                      {doctor.experience || '5+ years'} Experience
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl mb-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Consultation Fee</span>
                    <span className="text-[#0f172a] font-black text-lg">{doctor.feeDisplay || `LKR ${doctor.feeAmount}`}</span>
                  </div>

                  {!doctor.hasAvailableSlots && (
                    <div className="mb-4 text-center">
                      <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                        No available slots
                      </span>
                    </div>
                  )}

                  <button 
                    onClick={() => navigate(`/book-appointment/${getDoctorId(doctor)}`)}
                    disabled={!doctor.hasAvailableSlots}
                    className={`w-full py-4 rounded-2xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn ${
                      doctor.hasAvailableSlots 
                        ? "bg-[#0f172a] hover:bg-teal-500 text-white hover:text-[#0f172a] shadow-xl shadow-slate-200" 
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    BOOK APPOINTMENT
                    <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-24 bg-white rounded-[4rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold text-xl">No doctors found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Doctors;