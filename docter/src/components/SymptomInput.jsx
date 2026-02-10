import React, { useState, useEffect, useRef } from 'react';
import { 
  FaMicrophone, FaBrain, FaStethoscope, FaHistory, FaTimes, 
  FaArrowRight, FaRobot, FaLightbulb, FaShieldAlt, 
  FaCalendarCheck, FaUserMd, FaVolumeUp, FaVolumeMute, 
  FaHeartbeat, FaThermometer, FaPlus, FaCheck, FaKeyboard
} from 'react-icons/fa';
import { GiMedicines, GiHealthNormal } from 'react-icons/gi';

const SymptomInput = ({ onAnalyze, userHistory = [] }) => {
  const [symptoms, setSymptoms] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeExample, setActiveExample] = useState(null);
  const [severity, setSeverity] = useState('moderate');
  const [duration, setDuration] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isTextToSpeech, setIsTextToSpeech] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const textareaRef = useRef(null);

  const severityOptions = [
    { value: 'mild', label: 'Mild', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: '😊' },
    { value: 'moderate', label: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: '😐' },
    { value: 'severe', label: 'Severe', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: '😣' },
    { value: 'emergency', label: 'Emergency', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: '🚨' },
  ];

  useEffect(() => {
    if (symptoms.length > 3) {
      const suggestions = [
        "Headache with dizziness", "Fever with body aches", 
        "Chest pain with breathing difficulty", "Abdominal pain"
      ].filter(s => s.toLowerCase().includes(symptoms.toLowerCase().split(' ')[0])).slice(0, 3);
      setAiSuggestions(suggestions);
    } else {
      setAiSuggestions([]);
    }
  }, [symptoms]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      if (onAnalyze) onAnalyze({ symptoms, severity, duration });
    }, 2000);
  };

  const handleQuickSymptom = (symptom) => {
    setSymptoms(prev => prev ? `${prev}, ${symptom}` : symptom);
  };

  return (
    <div className="relative group transition-all duration-500">
      {/* Outer Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-[2.5rem] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
      
      <div className="relative bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 border border-white/50">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center space-x-5">
            <div className="relative">
              <div className="p-4 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-2xl shadow-lg transform group-hover:rotate-6 transition-transform">
                <FaBrain className="text-white text-2xl" />
              </div>
              <div className="absolute -top-2 -right-2 bg-white p-1 rounded-full shadow-md">
                <FaRobot className="text-teal-600 text-xs" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">AI Diagnostic Center</h3>
              <p className="text-sm text-gray-500 font-medium">Describe your health concerns for instant AI insights</p>
            </div>
          </div>
          
          <button onClick={() => setShowHistory(!showHistory)} className="flex items-center space-x-2 px-5 py-2.5 bg-white/50 border border-gray-100 rounded-2xl text-gray-600 hover:bg-teal-50 transition-all text-sm font-bold shadow-sm">
            <FaHistory className="text-teal-500" />
            <span>Consultation History</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Main Textarea with Glassmorphism */}
          <div className="relative group/input">
            <div className="absolute top-6 left-6 text-teal-500 text-xl transition-transform group-focus-within/input:scale-125">
              <FaStethoscope />
            </div>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="What symptoms are you experiencing today?"
              className="w-full h-48 p-6 pl-16 bg-white/40 border-2 border-transparent focus:border-teal-400/50 rounded-[2rem] focus:ring-0 text-lg placeholder-gray-400 shadow-inner transition-all resize-none"
            />
            
            {/* Floating Action Bar */}
            <div className="absolute bottom-5 right-5 flex items-center bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-white">
              <button type="button" onClick={() => setIsRecording(true)} className="p-3 text-teal-600 hover:bg-teal-50 rounded-xl transition-all">
                <FaMicrophone />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-2"></div>
              <button type="button" onClick={() => setSymptoms('')} className="p-3 text-gray-400 hover:text-red-500 transition-all">
                <FaTimes />
              </button>
            </div>
          </div>

          {/* AI Suggestion Pills */}
          {aiSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 animate-fadeIn">
              {aiSuggestions.map((s, i) => (
                <button key={i} type="button" onClick={() => handleQuickSymptom(s)} className="px-4 py-2 bg-teal-500/10 border border-teal-100 rounded-full text-xs font-bold text-teal-700 hover:bg-teal-500 hover:text-white transition-all">
                  ✨ {s}
                </button>
              ))}
            </div>
          )}

          {/* Severity Selector - Modern Grid */}
          <div className="space-y-4">
            <label className="flex items-center text-sm font-black text-gray-400 uppercase tracking-widest ml-2">
              <FaThermometer className="mr-2 text-red-500" /> Severity Assessment
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {severityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSeverity(opt.value)}
                  className={`relative p-5 rounded-[1.5rem] border-2 transition-all duration-300 ${
                    severity === opt.value 
                    ? `${opt.bg} ${opt.border} shadow-lg scale-105` 
                    : 'bg-white/50 border-transparent hover:border-gray-100 shadow-sm'
                  }`}
                >
                  <span className="text-3xl block mb-2">{opt.icon}</span>
                  <span className={`text-sm font-bold ${severity === opt.value ? opt.color : 'text-gray-400'}`}>{opt.label}</span>
                  {severity === opt.value && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                      <FaCheck className="text-white text-[10px]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Duration & Submit Section */}
          <div className="pt-8 border-t border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center bg-gray-100/50 p-2 rounded-2xl border border-gray-200">
              <FaCalendarCheck className="mx-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="How long? (e.g. 2 days)" 
                className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={!symptoms || analyzing}
              className="w-full lg:w-auto px-10 py-5 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-teal-200 hover:shadow-teal-300 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center space-x-3"
            >
              {analyzing ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <FaBrain className="text-xl" />
                  <span>Start AI Analysis</span>
                  <FaArrowRight />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Footer */}
        <div className="mt-8 flex justify-center space-x-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span className="flex items-center"><FaShieldAlt className="mr-1 text-teal-500" /> HIPAA Compliant</span>
          <span className="flex items-center"><FaShieldAlt className="mr-1 text-teal-500" /> 256-Bit Encrypted</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default SymptomInput;