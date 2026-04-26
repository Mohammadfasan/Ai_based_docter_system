import React, { useState, useEffect } from 'react';
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

  // Booking process steps
  const bookingSteps = [
    {
      icon: UserPlus,
      title: "Select Doctor",
      description: "Choose from our specialist doctors based on your health needs",
      color: "text-teal-500",
      bgColor: "bg-teal-50"
    },
    {
      icon: CalendarCheck,
      title: "Book Slot",
      description: "Pick a convenient date & time from available slots",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: ClipboardList,
      title: "Add Medical Records",
      description: "Share your medical history & current symptoms",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      icon: CheckCircle,
      title: "Doctor Confirms",
      description: "Doctor reviews & confirms your appointment",
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    },
    {
      icon: FileText,
      title: "Get Prescription",
      description: "Receive e-prescription & medical advice",
      color: "text-green-500",
      bgColor: "bg-green-50"
    }
  ];

  // Function to check doctor availability from API
  const checkDoctorAvailability = async (doctorId) => {
    try {
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
        let doctors = [];
        if (doctorsData && doctorsData.length > 0) {
          doctors = doctorsData;
        } else {
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
        
        const enhancedDoctors = await Promise.all(
          doctors.map(async (doctor) => {
            const doctorId = doctor._id || doctor.id || doctor.userId || doctor.doctorId;
            const availability = await checkDoctorAvailability(doctorId);
            
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
      
      {/* Welcome Hero Section with Description and Clean Image */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        {/* Simple Background - No effects on image */}
        <div className="max-w-[90rem] mx-auto px-6 lg:px-20 py-16 lg:py-24 relative z-10">
          {/* Two Column Layout - Left Content & Right Image */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            
            {/* Left Side - Text Content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Welcome Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20">
                <Sparkles size={16} className="text-teal-400" />
                <span className="text-white text-sm font-medium">Welcome to Our Doctor Portal</span>
              </div>

              {/* Main Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tighter mb-6 leading-tight">
                Find Your Perfect
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
                  Healthcare Partner
                </span>
              </h1>
              
              {/* Description */}
              <p className="text-base lg:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Connect with experienced doctors, book appointments instantly, and manage your health journey seamlessly. 
                Our platform brings quality healthcare to your fingertips with secure video consultations and in-person visits.
              </p>

              {/* Stats */}
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

              {/* Search Bar */}
              <div className="w-full lg:max-w-xl mx-auto lg:mx-0 relative group">
                <div className="absolute inset-0 bg-teal-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-all"></div>
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

            {/* Right Side - Clean Image Only (No Background Effects) */}
            <div className="flex-1">
              {/* Simple Image Container - No backgrounds, no glows, just the image */}
              <div className="rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={doctorHeroImage} 
                  alt="Doctors and Healthcare Professionals" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* How It Works Section - Booking Process */}
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

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-teal-200 via-blue-200 to-green-200 -translate-y-1/2"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {bookingSteps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={index} className="relative group">
                  <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-teal-200 group-hover:-translate-y-2">
                    {/* Step Number */}
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-black shadow-lg">
                      {index + 1}
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 ${step.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 ${step.color} group-hover:scale-110 transition-transform duration-300`}>
                      <StepIcon size={32} />
                    </div>
                    
                    {/* Title & Description */}
                    <h3 className="font-black text-[#0f172a] mb-2">{step.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
                  </div>
                  
                  {/* Arrow between steps (mobile) */}
                  {index < bookingSteps.length - 1 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-300">
                      <ArrowRight size={20} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Doctors List Section with Filter */}
      <main className="max-w-[90rem] mx-auto px-6 lg:px-20">
        {/* Section Header */}
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

        {/* Filters - NO SCROLLBAR */}
        <div className="mb-8 flex gap-3 overflow-x-auto overflow-y-hidden pb-2 no-scrollbar" 
             style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {filters.map((filter) => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
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
            filteredDoctors.map((doctor) => (
              <div key={getDoctorId(doctor)} className="group bg-white rounded-[2rem] p-5 border border-slate-100 hover:border-teal-200 transition-all duration-500 hover:shadow-[0_20px_40px_-20px_rgba(15,23,42,0.15)] flex flex-col">
                
                {/* Image Section */}
                <div className="relative mb-6">
                  <div className="w-full h-56 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-100 to-blue-100">
                    <img 
                      src={doctor.image || `https://ui-avatars.com/api/?name=${doctor.name?.replace(/ /g, '+')}&background=0D9488&color=fff&size=200&bold=true`} 
                      alt={doctor.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${doctor.name?.charAt(0)}&background=0D9488&color=fff&size=200&bold=true`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-2xl"></div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-lg">
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

                {/* Info Section */}
                <div className="flex-1 px-2">
                  <h3 className="text-xl font-black text-[#0f172a] group-hover:text-teal-600 transition-colors mb-1">{doctor.name}</h3>
                  <p className="text-teal-600 font-bold text-xs uppercase tracking-wider mb-3">{doctor.specialization}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                      <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-teal-500">
                        <MapPin size={12} />
                      </div>
                      {doctor.location || 'Colombo, Sri Lanka'}
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                      <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-blue-500">
                        <Globe size={12} />
                      </div>
                      {formatLanguages(doctor.languages)}
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                      <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-purple-500">
                        <Stethoscope size={12} />
                      </div>
                      {doctor.experience || '5+ years'} Experience
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Fee</span>
                    <span className="text-[#0f172a] font-bold text-base">{doctor.feeDisplay || `LKR ${doctor.feeAmount}`}</span>
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
                    className={`w-full py-3.5 rounded-xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn ${
                      doctor.hasAvailableSlots 
                        ? "bg-[#0f172a] hover:bg-teal-500 text-white hover:text-[#0f172a] shadow-lg shadow-slate-200" 
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    BOOK APPOINTMENT
                    <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-24 bg-white rounded-[2rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium text-lg">No doctors found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>

      {/* Quick Booking Info Banner */}
      <section className="max-w-[90rem] mx-auto px-6 lg:px-20 mt-16">
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-2xl font-black mb-2">Ready to Book Your Appointment?</h3>
              <p className="text-teal-50">Select a doctor, choose your preferred time, and get confirmation instantly.</p>
            </div>
            <button 
              onClick={() => {
                const doctorsSection = document.querySelector('main');
                doctorsSection?.scrollIntoView({ behavior: 'smooth' });
              }}
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