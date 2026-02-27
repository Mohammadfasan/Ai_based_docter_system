import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Mic, Keyboard, Calendar, UserCheck, ClipboardList, 
  Stethoscope, HeartPulse, Pill, Activity, Syringe, Thermometer,
  Microscope, Bandage, Plus, Droplets, FlaskConical, Baby, 
  Bone, Brain, ClipboardPlus, Dna, BriefcaseMedical, Hospital,
  ShieldCheck, Ambulance, Radiation, Tablets, Heart, Zap, Star,
} from 'lucide-react';
import DocterImage from '../../assets/doc.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);

  // Get doctors from the same source as Doctors.jsx
  useEffect(() => {
    const savedDoctors = JSON.parse(localStorage.getItem('healthai_doctors') || '[]');
    // Use first 3 doctors or default list if empty
    if (savedDoctors.length > 0) {
      setRecommendedDoctors(savedDoctors.slice(0, 3));
    } else {
      const defaultDocs = [
        {
          id: 'DOC-1234-SRJ',
          name: "Dr. Sarah Johnson",
          specialization: "Cardiologist",
          image: "https://randomuser.me/api/portraits/women/44.jpg",
          rating: 4.8,
        },
        {
          id: 'DOC-5678-MCH',
          name: "Dr. Michael Chen",
          specialization: "Dermatologist",
          image: "https://randomuser.me/api/portraits/men/32.jpg",
          rating: 4.6,
        },
        {
          id: 'DOC-9012-LMA',
          name: "Dr. Lisa Adams",
          specialization: "Pediatrician",
          image: "https://randomuser.me/api/portraits/women/65.jpg",
          rating: 4.9,
        }
      ];
      setRecommendedDoctors(defaultDocs);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans'] text-white overflow-x-hidden relative">
      
      {/* --- 1. Floating Background Icons --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <Stethoscope className="absolute top-[5%] left-[5%] text-teal-400 rotate-12 animate-pulse" size={35} />
        <HeartPulse className="absolute top-[8%] left-[25%] text-rose-400" size={30} />
        <Plus className="absolute top-[4%] left-[45%] text-white/40" size={40} />
        <Dna className="absolute top-[10%] left-[65%] text-blue-400 rotate-45" size={35} />
        <Hospital className="absolute top-[6%] left-[85%] text-slate-300" size={45} />
        <Activity className="absolute top-[25%] left-[10%] text-teal-300 animate-bounce" style={{ animationDuration: '5s' }} size={40} />
        <Pill className="absolute top-[22%] left-[35%] text-emerald-400 -rotate-12" size={28} />
        <Brain className="absolute top-[28%] left-[55%] text-purple-300" size={38} />
        <BriefcaseMedical className="absolute top-[20%] left-[80%] text-rose-300" size={32} />
        <ShieldCheck className="absolute top-[35%] left-[90%] text-blue-300" size={30} />
        <Syringe className="absolute top-[45%] left-[2%] text-slate-400 -rotate-45" size={42} />
        <FlaskConical className="absolute top-[50%] left-[20%] text-amber-300" size={36} />
        <Zap className="absolute top-[42%] left-[40%] text-yellow-400 opacity-30" size={24} />
        <Droplets className="absolute top-[55%] left-[60%] text-blue-400" size={32} />
        <Ambulance className="absolute top-[48%] left-[75%] text-slate-200" size={40} />
        <Bone className="absolute top-[70%] left-[8%] text-orange-200 rotate-12" size={34} />
        <Tablets className="absolute top-[75%] left-[28%] text-emerald-300" size={32} />
        <Microscope className="absolute top-[65%] left-[48%] text-teal-200" size={44} />
        <Radiation className="absolute top-[72%] left-[68%] text-yellow-500 opacity-20" size={30} />
        <Heart className="absolute top-[68%] left-[92%] text-rose-500 animate-pulse" size={28} />
        <Thermometer className="absolute top-[90%] left-[15%] text-orange-400" size={35} />
        <Baby className="absolute top-[85%] left-[38%] text-pink-300" size={38} />
        <ClipboardPlus className="absolute top-[92%] left-[60%] text-teal-300" size={32} />
        <Bandage className="absolute top-[88%] left-[82%] text-amber-200 rotate-12" size={30} />
      </div>

      {/* --- 2. Hero Section --- */}
      <section className="relative z-10 px-6 bg-[#1e293b] lg:px-20 flex flex-col lg:flex-row items-center min-h-[90vh]">
        <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="z-20 max-w-2xl py-20">
          <h1 className="text-6xl md:text-8xl font-black leading-[0.95] mb-8 tracking-tighter">
            AI-Integrated <br /> 
            <span className="text-teal-400">Patient Booking</span> <br />
            System
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-lg font-medium opacity-90">
            Experience the future of healthcare. Find the right specialist in seconds using our intelligent AI engine.
          </p>
          <div className="space-y-6 max-w-xl">
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-3xl border border-white/20 flex items-center shadow-2xl focus-within:ring-2 ring-teal-400 transition-all">
              <div className="flex items-center flex-1 px-4">
                <Search className="text-teal-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Describe your symptoms..." 
                  className="w-full py-4 px-3 outline-none text-white bg-transparent text-lg font-medium placeholder:text-slate-400"
                />
              </div>
              <button className="bg-teal-400 text-[#1e293b] px-8 py-4 rounded-2xl font-black hover:bg-teal-300 transition-all shadow-lg shadow-teal-500/20">
                Find My Doctor
              </button>
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl text-sm font-bold transition-all text-slate-200">
                <Keyboard size={18} className="text-teal-400" />
                Type Symptoms
              </button>
              <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl text-sm font-bold transition-all text-slate-200">
                <Mic size={18} className="text-teal-400" />
                Speak Symptoms
              </button>
            </div>
          </div>
        </div>

        <div className="relative flex-1 flex justify-end items-end h-full self-stretch lg:min-h-[90vh]">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-teal-500/10 blur-[150px] rounded-full -z-10"></div>
          <div className="relative z-10 w-full h-full flex items-end justify-end overflow-visible">
            <img 
              src={DocterImage} 
              alt="Doctor" 
              className="w-full lg:w-auto lg:h-[115%] object-contain object-bottom brightness-110 lg:scale-125 origin-bottom transition-all duration-700 block" 
              style={{
                WebkitMaskImage: `linear-gradient(to top, black 80%, transparent 100%), linear-gradient(to bottom, black 80%, transparent 100%), linear-gradient(to left, black 85%, transparent 100%), linear-gradient(to right, black 85%, transparent 100%)`,
                WebkitMaskComposite: 'source-in'
              }}
            />
          </div>
        </div>
      </section>

      {/* --- 3. Process Section --- */}
      <section className="bg-white py-24 px-6 lg:px-20 relative z-30 rounded-t-[3rem] -mt-12 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-[#1e293b] mb-4 tracking-tight">
              Our <span className="text-teal-500">Simple Process</span>
            </h2>
            <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
              Get high-quality healthcare in just three simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: <ClipboardList />, title: "Enter Symptoms", step: "01", desc: "Type or speak your health concerns." },
              { icon: <UserCheck />, title: "AI Analysis", step: "02", desc: "The AI engine matches you with the right specialist." },
              { icon: <Calendar />, title: "Book Instant", step: "03", desc: "Pick a time and get instant confirmation." }
            ].map((item, idx) => (
              <div key={idx} className="group relative bg-white p-12 rounded-[3rem] border border-slate-100 hover:border-teal-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(30,41,59,0.15)]">
                <div className="absolute top-8 right-10 text-6xl font-black text-slate-100 group-hover:text-teal-50 transition-colors">{item.step}</div>
                <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-[1.8rem] flex items-center justify-center mb-10 shadow-inner group-hover:bg-[#1e293b] group-hover:text-teal-400 group-hover:rotate-[10deg] transition-all duration-500">
                  {React.cloneElement(item.icon, { size: 36, strokeWidth: 1.5 })}
                </div>
                <h4 className="text-2xl font-extrabold text-[#1e293b] mb-4 group-hover:text-teal-600 transition-colors">{item.title}</h4>
                <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 4. Recommended Doctors Section (Modern Dark UI) --- */}
      <section className="bg-[#0f172a] py-24 px-6 lg:px-20 relative z-30 rounded-b-[10rem] -mt-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-t-[10rem]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-teal-400 font-bold tracking-widest uppercase text-sm mb-2">Expert Care</p>
              <h2 className="text-4xl font-black text-white">Top Rated Specialists</h2>
            </div>
            <button 
              onClick={() => navigate('/doctors')}
              className="text-slate-400 hover:text-teal-400 font-bold transition-colors flex items-center gap-2"
            >
              View All Doctors <Plus size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendedDoctors.map((doc) => (
              <div 
                key={doc.id} 
                className="group relative bg-slate-800/40 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/5 hover:border-teal-500/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                {/* Background Glow Effect */}
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-teal-500/10 blur-3xl group-hover:bg-teal-500/20 transition-all duration-500"></div>
                
                <div className="relative flex flex-col gap-6">
                  {/* Top Section: Image & Badge */}
                  <div className="flex items-start justify-between">
                    <div className="relative">
                      <div className="absolute inset-0 bg-teal-400 blur-lg opacity-20 group-hover:opacity-40 transition-all"></div>
                      <img 
                        src={doc.image} 
                        alt={doc.name} 
                        className="w-24 h-24 rounded-2xl object-cover relative border border-white/10"
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${doc.name?.charAt(0)}&background=0D9488&color=fff`; }}
                      />
                    </div>
                    <div className="bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-white font-bold text-sm">{doc.rating || '4.8'}</span>
                    </div>
                  </div>

                  {/* Middle Section: Info */}
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors mb-1">
                      {doc.name}
                    </h3>
                    <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                      {doc.specialization}
                    </p>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-3 py-4 border-y border-white/5">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Experience</p>
                      <p className="text-white font-bold">10+ Years</p>
                    </div>
                    <div className="text-center border-l border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Patients</p>
                      <p className="text-white font-bold">1.2k+</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={() => navigate(`/book-appointment/${doc.id}`)}
                    className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-[#1e293b] rounded-2xl font-black text-sm transition-all shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2 group/btn"
                  >
                    BOOK APPOINTMENT
                    <Activity size={16} className="group-hover/btn:animate-pulse" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* --- 5. Health Categories Section --- */}
<section className="bg-white py-24 px-6 lg:px-20 relative z-10">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-black text-[#1e293b] mb-4">
        Browse by <span className="text-teal-500">Specialization</span>
      </h2>
      <p className="text-slate-500 font-medium">Find experts based on your specific health needs.</p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {[
        { icon: <Heart className="text-rose-500" />, name: "Cardiology" },
        { icon: <Brain className="text-purple-500" />, name: "Neurology" },
        { icon: <Baby className="text-pink-500" />, name: "Pediatrics" },
        { icon: <Bone className="text-orange-500" />, name: "Orthopedics" },
        { icon: <Droplets className="text-blue-500" />, name: "Hematology" },
        { icon: <Dna className="text-teal-500" />, name: "Genetics" },
      ].map((cat, idx) => (
        <div key={idx} className="flex flex-col items-center p-8 rounded-[2rem] border border-slate-100 hover:border-teal-200 hover:shadow-xl transition-all cursor-pointer group">
          <div className="mb-4 transform group-hover:scale-110 transition-transform">
            {React.cloneElement(cat.icon, { size: 32 })}
          </div>
          <span className="text-slate-700 font-bold text-sm">{cat.name}</span>
        </div>
      ))}
    </div>
  </div>
</section>
{/* --- 5. Enhanced Testimonials & Trust Section --- */}
<section className="bg-[#0f172a] py-32 px-6 lg:px-20 relative overflow-hidden">
  {/* Advanced Background Blurs */}
  <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-500/10 blur-[120px] rounded-full"></div>
  <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full"></div>

  <div className="max-w-7xl mx-auto relative z-10">
    
    {/* 5a. High-Impact Stats Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
      {[
        { label: "Happy Patients", value: "12k+", icon: <UserCheck />, color: "text-teal-400", bg: "bg-teal-400/10" },
        { label: "Expert Doctors", value: "450+", icon: <Stethoscope />, color: "text-rose-400", bg: "bg-rose-400/10" },
        { label: "Success Rate", value: "98%", icon: <Activity />, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Partners", value: "80+", icon: <Hospital />, color: "text-amber-400", bg: "bg-amber-400/10" },
      ].map((stat, idx) => (
        <div key={idx} className="group p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-md hover:bg-white/[0.08] hover:border-white/20 transition-all duration-500 hover:-translate-y-2">
          <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
            {React.cloneElement(stat.icon, { size: 28 })}
          </div>
          <h3 className="text-4xl font-black text-white mb-2 tracking-tight">{stat.value}</h3>
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">{stat.label}</p>
        </div>
      ))}
    </div>

    {/* 5b. Section Header */}
    <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
      <div className="text-center md:text-left">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          Trusted by <span className="text-teal-400">Thousands</span>
        </h2>
        <p className="text-slate-400 font-medium max-w-md">Real stories from people who found the right care at the right time.</p>
      </div>
      <div className="hidden md:flex gap-4">
        <div className="flex -space-x-4">
          {[1, 2, 3, 4].map((i) => (
            <img key={i} className="w-12 h-12 rounded-full border-4 border-[#0f172a]" src={`https://i.pravatar.cc/150?img=${i+10}`} alt="user" />
          ))}
          <div className="w-12 h-12 rounded-full border-4 border-[#0f172a] bg-teal-500 flex items-center justify-center text-xs font-bold text-[#0f172a]">
            +2k
          </div>
        </div>
      </div>
    </div>

    {/* 5c. Masonry-style Testimonials */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        { 
          name: "Alex Rivera", 
          role: "Verified Patient",
          text: "The AI symptom checker was incredibly accurate. It recommended a specialist who solved my issue in one visit!",
          rating: 5 
        },
        { 
          name: "Sarah Chen", 
          role: "Software Engineer",
          text: "Booking was so seamless. I saved hours of waiting on the phone. Highly recommend for busy professionals who value their time.",
          rating: 5 
        },
        { 
          name: "James Wilson", 
          role: "Retired Teacher",
          text: "The interface is beautiful and easy to use even for older people like me. Excellent healthcare innovation that simplifies everything.",
          rating: 5 
        },
      ].map((testi, idx) => (
        <div key={idx} className="relative group">
          {/* Animated Glow Border on Hover */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-[2.5rem] opacity-0 group-hover:opacity-30 blur transition duration-500"></div>
          
          <div className="relative bg-slate-900/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/5 h-full flex flex-col justify-between">
            <div>
              <div className="flex gap-1 mb-6">
                {[...Array(testi.rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-teal-400 text-teal-400" />
                ))}
              </div>
              <p className="text-slate-200 text-lg leading-relaxed mb-8 font-medium">
                "{testi.text}"
              </p>
            </div>
            
            <div className="flex items-center gap-4 border-t border-white/5 pt-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-500 to-blue-500 flex items-center justify-center font-black text-[#0f172a] text-lg shadow-lg shadow-teal-500/20">
                {testi.name[0]}
              </div>
              <div>
                <h4 className="text-white font-bold">{testi.name}</h4>
                <p className="text-teal-500/70 text-xs font-black uppercase tracking-wider">{testi.role}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
{/* --- 7. App & Newsletter Section with Background Image --- */}
<section className="py-24 px-6 lg:px-20 bg-white">
  <div className="max-w-7xl mx-auto">
    <div 
      className="rounded-[3rem] p-8 md:p-16 overflow-hidden relative group"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.7)), url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Decorative Glow - Kept for extra depth */}
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-500/20 blur-[100px] rounded-full"></div>
      
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Manage your health <br /> 
            <span className="text-teal-400">on the go.</span>
          </h2>
          <p className="text-slate-200 text-lg mb-10 max-w-md font-medium">
            Download our mobile app to book appointments, track prescriptions, and consult with doctors anytime, anywhere.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-teal-400 hover:scale-105 transition-all shadow-xl">
              App Store
            </button>
            <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-white/20 hover:scale-105 transition-all shadow-xl">
              Play Store
            </button>
          </div>
        </div>

        {/* Newsletter Box - Slightly more transparent to show the BG */}
        <div className="bg-white/10 p-8 rounded-[2.5rem] border border-white/20 backdrop-blur-xl">
          <h3 className="text-2xl font-bold text-white mb-2">Weekly Health Tips</h3>
          <p className="text-slate-300 mb-6 text-sm">Join 5,000+ subscribers for AI-curated health advice.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 bg-slate-900/60 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-teal-400 transition-all placeholder:text-slate-500"
            />
            <button className="bg-teal-500 text-[#0f172a] px-8 py-4 rounded-xl font-black hover:bg-teal-400 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
    </div>
  );
};

export default Dashboard;