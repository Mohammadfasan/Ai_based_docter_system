import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, Star, Filter, 
  ChevronRight, PlayCircle, ShieldCheck, HeartPulse 
} from 'lucide-react';

const doctorsData = [
  {
    id: 1,
    name: "Dr. Kasun Perera",
    specialty: "Cardiologist (Heart)",
    experience: "15+ Yrs Exp",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 4.9,
    reviewCount: 240,
    hospital: "Asiri Surgical",
    location: "Colombo 05",
    distance: "1.2 km",
    languages: ["Sinhala", "English"],
    nextAvailable: "Today, 5:30 PM",
    fees: "LKR 2,500",
    isVideoAvailable: true,
    aiSummary: "Very experienced senior consultant. Explains ECG results clearly.",
    isVerified: true
  },
  {
    id: 2,
    name: "Dr. Fathima Riaz",
    specialty: "Dermatologist (Skin)",
    experience: "8 Yrs Exp",
    image: "https://randomuser.me/api/portraits/women/63.jpg",
    rating: 4.8,
    reviewCount: 115,
    hospital: "Durdans Hospital",
    location: "Colpetty (Col 03)",
    distance: "3.5 km",
    languages: ["Tamil", "English", "Sinhala"],
    nextAvailable: "Tomorrow, 9:00 AM",
    fees: "LKR 1,800",
    isVideoAvailable: false,
    aiSummary: "Best for acne treatments. Very friendly with female patients.",
    isVerified: true
  },
  {
    id: 3,
    name: "Dr. Ruwan Silva",
    specialty: "Pediatrician (Child)",
    experience: "12 Yrs Exp",
    image: "https://randomuser.me/api/portraits/men/86.jpg",
    rating: 5.0,
    reviewCount: 310,
    hospital: "Nawaloka Hospital",
    location: "Colombo 02",
    distance: "4.0 km",
    languages: ["Sinhala", "English"],
    nextAvailable: "Today, 7:00 PM",
    fees: "LKR 2,200",
    isVideoAvailable: true,
    aiSummary: "Kids love him! Doesn't prescribe unnecessary antibiotics.",
    isVerified: true
  }
];

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();

  const filters = ["All", "General", "Heart", "Skin", "Child", "Dental"];

  // --- FILTER LOGIC ---
  const filteredDoctors = doctorsData.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === "All" || 
                          doctor.specialty.toLowerCase().includes(activeFilter.toLowerCase());

    return matchesSearch && matchesFilter;
  });

  const handleBookClick = (doctorId) => {
    navigate(`/book-appointment/${doctorId}`);
  };

  return (
    <div className="min-h-screen bg-emerald-50/30 font-sans text-slate-800 pb-24">
      <header className="bg-white sticky top-0 z-10 shadow-sm px-5 py-5 rounded-b-3xl">
        <div className="flex justify-between items-center mb-5">
          <div>
            <p className="text-xs text-slate-400 font-semibold tracking-wider">CURRENT LOCATION</p>
            <div className="flex items-center gap-1 text-emerald-700 font-bold cursor-pointer mt-0.5">
              <MapPin size={18} className="text-emerald-600" />
              <span className="text-lg">Colombo 07, SL</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
          <input 
            type="text" 
            placeholder="Search doctors, specialists..." 
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* FILTER BUTTONS */}
      <div className="pl-5 py-4 flex gap-3 overflow-x-auto no-scrollbar">
        {filters.map((filter) => (
          <button 
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              activeFilter === filter 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="px-5 flex flex-col gap-5">
        <h2 className="font-bold text-xl text-slate-800">
          {activeFilter} Doctors ({filteredDoctors.length})
        </h2>

        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex gap-4">
                <img src={doctor.image} alt={doctor.name} className="w-[88px] h-[88px] rounded-2xl object-cover" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900">{doctor.name}</h3>
                  <p className="text-xs font-semibold text-emerald-700">{doctor.specialty}</p>
                  <p className="text-xs text-slate-500">{doctor.hospital}</p>
                  
                  {/* Added AI Summary as Description */}
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-600 bg-emerald-50/50 p-2 rounded-xl border-l-2 border-emerald-500">
                    {doctor.aiSummary}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-dashed">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Next Slot</p>
                  <p className="text-xs font-bold text-emerald-600">{doctor.nextAvailable}</p>
                </div>
                <button 
                  onClick={() => handleBookClick(doctor.id)}
                  className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-semibold text-sm"
                >
                   Book Now
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-slate-500 font-medium">
            No doctors found for "{activeFilter}".
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;