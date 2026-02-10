import React, { useState, useEffect } from 'react'; 
import { 
  FaCalendarAlt, FaFileMedical, FaBell, FaChartLine, 
  FaUserInjured, FaCalendarCheck, FaHeartbeat,
  FaThermometerHalf, FaPrescriptionBottle, FaHospital,
  FaExclamationTriangle, FaLightbulb, FaRunning,
  FaVideo, FaClock, FaMapMarkerAlt, FaUserMd, FaStar,
  FaArrowRight, FaSearch, FaFilter
} from 'react-icons/fa';
import SymptomInput from '../../components/SymptomInput';
import AiImage from '../../assets/image.png';
import backgroundImage from '../../assets/bak.png';
import AboutUs from '../../components/AboutUs';

const Dashboard = ({ userType }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [healthScore, setHealthScore] = useState(85);
  const [userName, setUserName] = useState('Alex');
  const [activeMood, setActiveMood] = useState('');

  // Example data for analysis
  const recommendedDoctors = [
    { name: "Dr. Sarah Johnson", specialty: "Cardiologist", experience: "15 yrs" },
    { name: "Dr. Michael Chen", specialty: "Neurologist", experience: "10 yrs" }
  ];

  useEffect(() => {
    const savedName = localStorage.getItem('userName') || 'Alex';
    setUserName(savedName);
  }, []);

  const handleAnalyze = (symptoms) => {
    setShowAnalysis(false);
    setTimeout(() => {
      setShowAnalysis(true);
      // Floating Success Notification
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-teal-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-bounce';
      successDiv.innerHTML = `✅ Analysis Complete! Found specialists.`;
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
    }, 1500);
  };

  const handleMoodSelect = (mood) => {
    setActiveMood(mood);
    localStorage.setItem('userMood', mood);
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed transition-all duration-00"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Premium Glass Overlay */}
      <div className="bg-white/80 backdrop-blur-md min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-10">
          
          {/* Header Section */}
          <div className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-5xl animate-pulse">👋</span>
                <div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                    Good morning, <span className="text-teal-600">{userName}</span>!
                  </h1>
                  <p className="text-gray-500 font-medium">{new Date().toDateString()}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-6">
                {['great', 'okay', 'unwell', 'sick'].map(m => (
                  <button
                    key={m}
                    onClick={() => handleMoodSelect(m)}
                    className={`px-6 py-2 rounded-xl border-2 font-bold capitalize transition-all ${
                      activeMood === m 
                      ? 'bg-teal-600 border-teal-600 text-white shadow-lg scale-105' 
                      : 'bg-white/50 border-gray-200 text-gray-600 hover:border-teal-300'
                    }`}
                  >
                    {m === 'great' ? '😊' : m === 'okay' ? '😐' : m === 'unwell' ? '😟' : '🤒'} {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Health Score Widget */}
            <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-white flex items-center space-x-6 hover:scale-105 transition-transform">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f0fdfa" strokeWidth="3"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0d9488" strokeWidth="3" strokeDasharray={`${healthScore}, 100`} strokeLinecap="round"/>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-black text-xl text-gray-800">{healthScore}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Wellness Index</p>
                <p className="text-teal-600 font-black text-lg">Excellent! 👏</p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-10 mb-20">
            <div className="lg:col-span-2 space-y-10">
              {/* Symptom Input Component */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-[2rem] blur opacity-15 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative">
                  <SymptomInput onAnalyze={handleAnalyze} />
                </div>
              </div>
              
              {/* Analysis Results */}
              {showAnalysis && (
                <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-2xl p-8 border border-teal-50 animate-fadeIn">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                      <FaUserMd className="mr-3 text-teal-600" /> Specialist Recommendations
                    </h3>
                    <span className="bg-teal-100 text-teal-700 px-4 py-1 rounded-full text-xs font-black uppercase">AI Match</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {recommendedDoctors.map((doc, i) => (
                      <div key={i} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-teal-300 transition-colors">
                        <p className="font-black text-gray-800 text-lg">{doc.name}</p>
                        <p className="text-teal-600 font-bold mb-3">{doc.specialty}</p>
                        <button className="w-full bg-teal-600 text-white py-2 rounded-xl font-bold hover:bg-teal-700 transition-all">Book Now</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar AI Visual */}
            <div className="hidden lg:block">
              <div className="sticky top-10">
                <div className="bg-gradient-to-br from-gray-900 to-teal-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-4">Neural Health Engine</h3>
                    <p className="text-teal-100/70 text-sm leading-relaxed mb-6">Our AI cross-references 1M+ medical journals for accuracy.</p>
                    <img src={AiImage} alt="AI" className="w-full h-auto drop-shadow-2xl group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  {/* Decorative blur */}
                  <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-teal-500/20 rounded-full blur-3xl"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Integrated About Us Section */}
          <div className="mt-20 pt-20 border-t border-gray-200">
            <AboutUs />
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 0; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default Dashboard;