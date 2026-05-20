import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, Star, Clock, Video, Shield, 
  Stethoscope, Hospital, ChevronRight, Languages, Globe, Calendar,
  UserPlus, CalendarCheck, ClipboardList, CheckCircle, FileText,
  Sparkles, Heart, Award, Users, ArrowRight
} from 'lucide-react';
import { doctorScheduleService } from '../../services/doctorScheduleService';
import { doctorAPI } from '../../services/api';

// Import the image
import doctorHeroImage from '../../assets/doc1.jpg'

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();
  const navigate = useNavigate();

  const filters = useMemo(() => [
    "All", "Cardiologist", "Dermatologist", "Pediatrician", 
    "General Physician", "Dentist", "ENT Specialist", 
    "Neurologist", "Orthopedic", "Psychiatrist", "Gynecologist", "Oncologist"
  ], []);

  const bookingSteps = useMemo(() => [
    { icon: UserPlus, title: "Select Doctor", description: "Choose from our specialist doctors based on your health needs", color: "text-teal-500", bgColor: "bg-teal-50" },
    { icon: CalendarCheck, title: "Book Slot", description: "Pick a convenient date & time from available slots", color: "text-blue-500", bgColor: "bg-blue-50" },
    { icon: ClipboardList, title: "Add Medical Records", description: "Share your medical history & current symptoms", color: "text-purple-500", bgColor: "bg-purple-50" },
    { icon: CheckCircle, title: "Doctor Confirms", description: "Doctor reviews & confirms your appointment", color: "text-orange-500", bgColor: "bg-orange-50" },
    { icon: FileText, title: "Get Prescription", description: "Receive e-prescription & medical advice", color: "text-green-500", bgColor: "bg-green-50" }
  ], []);

  // Load doctors with pagination
  const loadDoctors = useCallback(async (pageNum = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Use the new fast paginated endpoint
      const response = await doctorAPI.getPaginatedDoctorsFast(pageNum, 8);
      
      if (response.success && response.data.doctors) {
        const newDoctors = response.data.doctors;
        
        // Format doctors with fee and ID
        const formattedDoctors = newDoctors.map(doctor => {
          const doctorId = doctor._id || doctor.id || doctor.doctorId;
          let feeAmount = 2500;
          if (doctor.fees) {
            const match = doctor.fees.toString().match(/\d+/);
            if (match) feeAmount = parseInt(match[0]);
          }
          
          return {
            ...doctor,
            id: doctorId,
            feeAmount: feeAmount,
            feeDisplay: doctor.fees || `LKR ${feeAmount}`,
            // Default availability - will check later
            hasAvailableSlots: false,
            availableSlotsCount: 0
          };
        });
        
        if (isLoadMore) {
          setDoctors(prev => [...prev, ...formattedDoctors]);
        } else {
          setDoctors(formattedDoctors);
        }
        
        setHasMore(response.data.hasMore === true);
        setPage(pageNum);
        
        // After loading doctors, check availability for visible ones only
        setTimeout(() => {
          checkAvailabilityForVisibleDoctors();
        }, 100);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Check availability for visible doctors only
  const checkAvailabilityForVisibleDoctors = useCallback(async () => {
    const doctorCards = document.querySelectorAll('.doctor-card');
    const visibleDoctors = [];
    
    doctorCards.forEach(card => {
      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight + 200) {
        const doctorId = card.getAttribute('data-doctor-id');
        if (doctorId) visibleDoctors.push(doctorId);
      }
    });
    
    // Update availability for visible doctors
    for (const doctorId of visibleDoctors) {
      const doctorIndex = doctors.findIndex(d => (d._id || d.id) === doctorId);
      if (doctorIndex !== -1 && !doctors[doctorIndex].hasAvailableSlotsChecked) {
        try {
          const response = await doctorScheduleService.getAvailableSlots(doctorId);
          let slots = [];
          if (response.success) slots = response.data || [];
          else if (Array.isArray(response)) slots = response;
          
          const today = new Date().toISOString().split('T')[0];
          const availableSlots = slots.filter(slot => slot.date >= today && slot.status === 'available');
          
          setDoctors(prev => prev.map((doc, idx) => 
            idx === doctorIndex 
              ? { ...doc, hasAvailableSlots: availableSlots.length > 0, availableSlotsCount: availableSlots.length, hasAvailableSlotsChecked: true }
              : doc
          ));
        } catch (error) {
          console.error('Error checking availability:', error);
        }
      }
    }
  }, [doctors]);

  // Initial load
  useEffect(() => {
    loadDoctors(1, false);
  }, []);

  // Check availability when doctors change or scroll
  useEffect(() => {
    if (doctors.length > 0) {
      checkAvailabilityForVisibleDoctors();
      
      window.addEventListener('scroll', checkAvailabilityForVisibleDoctors);
      return () => window.removeEventListener('scroll', checkAvailabilityForVisibleDoctors);
    }
  }, [doctors, checkAvailabilityForVisibleDoctors]);

  // Infinite scroll observer
  const lastDoctorRef = useCallback((node) => {
    if (loading || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadDoctors(page + 1, true);
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, hasMore, page, loadDoctors]);

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesSearch = searchTerm === "" || 
        doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = activeFilter === "All" || doctor.specialization?.toLowerCase().includes(activeFilter.toLowerCase());
      return matchesSearch && matchesFilter;
    });
  }, [doctors, searchTerm, activeFilter]);

  const formatLanguages = useCallback((languages) => {
    if (!languages) return 'English, Sinhala';
    if (Array.isArray(languages)) return languages.join(', ');
    return languages;
  }, []);

  const getDoctorId = useCallback((doctor) => {
    return doctor._id || doctor.id || doctor.doctorId;
  }, []);

  if (loading && doctors.length === 0) {
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
      
      {/* Welcome Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div className="max-w-[90rem] mx-auto px-6 lg:px-20 py-16 lg:py-24 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20">
                <Sparkles size={16} className="text-teal-400" />
                <span className="text-white text-sm font-medium">Welcome to Our Doctor Portal</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tighter mb-6 leading-tight">
                Find Your Perfect
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
                  Healthcare Partner
                </span>
              </h1>
              
              <p className="text-base lg:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Connect with experienced doctors, book appointments instantly, and manage your health journey seamlessly. 
                Our platform brings quality healthcare to your fingertips with secure video consultations and in-person visits.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-6 lg:gap-8 mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <Users size={20} className="text-teal-400" />
                  </div>
                  <div>
                    <p className="text-white font-black text-2xl">100+</p>
                    <p className="text-slate-400 text-xs font-medium">Expert Doctors</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Heart size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-black text-2xl">50k+</p>
                    <p className="text-slate-400 text-xs font-medium">Happy Patients</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Award size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-black text-2xl">24/7</p>
                    <p className="text-slate-400 text-xs font-medium">Support Available</p>
                  </div>
                </div>
              </div>

              <div className="w-full lg:max-w-xl mx-auto lg:mx-0 relative group">
                <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 p-2 rounded-3xl flex items-center shadow-2xl">
                  <Search className="ml-5 text-teal-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search by doctor name, specialization, or location..." 
                    className="w-full bg-transparent border-none outline-none p-4 text-white placeholder:text-slate-500 font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={doctorHeroImage} 
                  alt="Doctors and Healthcare Professionals" 
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

      {/* How It Works Section */}
      <section className="max-w-[90rem] mx-auto px-6 lg:px-20 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-teal-50 rounded-full px-4 py-2 mb-4">
            <Calendar size={16} className="text-teal-600" />
            <span className="text-teal-700 text-sm font-bold">Easy Booking Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[#0f172a] mb-4">
            How It <span className="text-teal-500">Works</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Book your appointment in 5 simple steps and get quality healthcare from the comfort of your home
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {bookingSteps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <div key={index} className="relative group">
                <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all border group-hover:-translate-y-2">
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-black">
                    {index + 1}
                  </div>
                  <div className={`w-16 h-16 ${step.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 ${step.color} group-hover:scale-110 transition-transform`}>
                    <StepIcon size={32} />
                  </div>
                  <h3 className="font-black text-[#0f172a] mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-500">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Doctors List Section */}
      <main className="max-w-[90rem] mx-auto px-6 lg:px-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#0f172a]">
              Our Specialist <span className="text-teal-500">Doctors</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {filteredDoctors.length} doctors available • Verified & Experienced
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {filters.map((filter) => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeFilter === filter 
                  ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20 scale-105" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor, index) => {
              const isLast = index === filteredDoctors.length - 1;
              return (
                <div 
                  key={getDoctorId(doctor)} 
                  ref={isLast ? lastDoctorRef : null}
                  data-doctor-id={getDoctorId(doctor)}
                  className="doctor-card group bg-white rounded-[2rem] p-5 border border-slate-100 hover:border-teal-200 transition-all duration-500 hover:shadow-[0_20px_40px_-20px_rgba(15,23,42,0.15)] flex flex-col"
                >
                  <div className="relative mb-6">
                    <div className="w-full h-56 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-100 to-blue-100">
                      <img 
                        src={doctor.image || `https://ui-avatars.com/api/?name=${doctor.name?.replace(/ /g, '+')}&background=0D9488&color=fff&size=200&bold=true`} 
                        alt={doctor.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${doctor.name?.charAt(0)}&background=0D9488&color=fff&size=200&bold=true`;
                        }}
                      />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                      <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1">
                        <Star size={12} className="fill-yellow-500 text-yellow-500" />
                        <span className="text-slate-700 font-black text-sm">{doctor.rating || 4.5}</span>
                      </div>
                      {doctor.hasAvailableSlots && (
                        <div className="bg-green-500 px-3 py-1.5 rounded-xl text-white shadow-lg flex items-center gap-1">
                          <Calendar size={12} />
                          <span className="text-[10px] font-bold">{doctor.availableSlotsCount} slots</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 px-2">
                    <h3 className="text-xl font-black text-[#0f172a] group-hover:text-teal-600 transition-colors mb-1">{doctor.name}</h3>
                    <p className="text-teal-600 font-bold text-xs uppercase tracking-wider mb-3">{doctor.specialization}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <MapPin size={12} className="text-teal-500" />
                        {doctor.location || 'Colombo, Sri Lanka'}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <Globe size={12} className="text-blue-500" />
                        {formatLanguages(doctor.languages)}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <Stethoscope size={12} className="text-purple-500" />
                        {doctor.experience || '5+ years'} Experience
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl mb-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Fee</span>
                      <span className="text-[#0f172a] font-bold text-base">{doctor.feeDisplay}</span>
                    </div>

                    <button 
                      onClick={() => navigate(`/book-appointment/${getDoctorId(doctor)}`)}
                      disabled={!doctor.hasAvailableSlots}
                      className={`w-full py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                        doctor.hasAvailableSlots 
                          ? "bg-[#0f172a] hover:bg-teal-500 text-white hover:text-[#0f172a] shadow-lg" 
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      BOOK APPOINTMENT
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-24 bg-white rounded-[2rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium text-lg">No doctors found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        )}
      </main>

      {/* Quick Booking Banner */}
      <section className="max-w-[90rem] mx-auto px-6 lg:px-20 mt-16">
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-2xl font-black mb-2">Ready to Book Your Appointment?</h3>
              <p className="text-teal-50">Select a doctor, choose your preferred time, and get confirmation instantly.</p>
            </div>
            <button 
              onClick={() => document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-teal-600 px-6 py-3 rounded-xl font-black hover:shadow-lg transition-all flex items-center gap-2"
            >
              Find a Doctor Now
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Doctors;