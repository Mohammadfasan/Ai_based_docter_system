import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, Star, Clock, Video, Shield, 
  Stethoscope, Hospital, ChevronRight, Languages, Globe
} from 'lucide-react';

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [doctorsData, setDoctorsData] = useState([]);
  const navigate = useNavigate();

  const filters = [
    "All", "Cardiologist", "Dermatologist", "Pediatrician", 
    "General Physician", "Dentist", "ENT Specialist", 
    "Neurologist", "Orthopedic", "Psychiatrist", "Gynecologist", "Oncologist"
  ];

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = () => {
    const savedDoctors = JSON.parse(localStorage.getItem('healthai_doctors') || '[]');
    setDoctorsData(savedDoctors);
  };

  const filteredDoctors = doctorsData.filter((doctor) => {
    const matchesSearch = searchTerm === "" || 
      doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = activeFilter === "All" || doctor.specialization?.toLowerCase().includes(activeFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Plus_Jakarta_Sans'] pb-24">
      
      {/* --- Header Section --- */}
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

      {/* --- 3-Column Grid Section --- */}
      <main className="max-w-7xl mx-auto px-6 lg:px-20 -mt-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="group bg-white rounded-[3rem] p-5 border border-slate-100 hover:border-teal-200 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] flex flex-col">
                
                {/* Image Section */}
                <div className="relative mb-6">
                  <div className="w-full h-64 rounded-[2.5rem] overflow-hidden">
                    <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-white font-black text-sm">{doctor.rating}</span>
                    </div>
                    {doctor.isVideoAvailable && (
                      <div className="bg-teal-500 p-2.5 rounded-2xl text-[#0f172a] shadow-lg">
                        <Video size={18} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 px-2">
                  <h3 className="text-2xl font-black text-[#0f172a] group-hover:text-teal-600 transition-colors mb-1">{doctor.name}</h3>
                  <p className="text-teal-600 font-black text-sm uppercase tracking-widest mb-4">{doctor.specialization}</p>
                  
                  <div className="space-y-3 mb-6">
                    {/* Location display */}
                    <div className="flex items-center gap-3 text-slate-500 text-sm font-bold">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-teal-500">
                        <MapPin size={16} />
                      </div>
                      {doctor.location}
                    </div>

                    {/* Language display */}
                    <div className="flex items-center gap-3 text-slate-500 text-sm font-bold">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-blue-500">
                        <Globe size={16} />
                      </div>
                      {doctor.languages}
                    </div>

                    <div className="flex items-center gap-3 text-slate-500 text-sm font-bold">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-purple-500">
                        <Hospital size={16} />
                      </div>
                      {doctor.hospital}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl mb-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Consultation Fee</span>
                    <span className="text-[#0f172a] font-black text-lg">{doctor.fees}</span>
                  </div>

                  <button 
                    onClick={() => navigate(`/book-appointment/${doctor.id}`)}
                    className="w-full py-4 bg-[#0f172a] hover:bg-teal-500 text-white hover:text-[#0f172a] rounded-2xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-xl shadow-slate-200"
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