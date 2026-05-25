// Feedback.jsx - Without Images, Pure Icons & Same Appointments Style
import React, { useState } from 'react';
import axios from 'axios';
import { 
  FaStar, FaPaperPlane, FaComment, FaHeart, 
  FaCheckCircle, FaLightbulb, FaBug, FaRocket,
  FaSpinner, FaUserMd, FaEdit, FaArrowLeft,
  FaTimes, FaSmile, FaThumbsUp, FaQuoteLeft,
  FaShieldAlt, FaClock, FaLock, FaChartLine
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import FeedbackDoctorSelector from '../../components/FeedbackDoctorSelector';

const Feedback = ({ initialDoctorId, initialDoctorName, appointmentId, onClose }) => {
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState('');
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showDoctorSelector, setShowDoctorSelector] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState({
    id: initialDoctorId || '',
    doctorId: '',
    name: initialDoctorName || '',
    specialization: '',
    hospital: ''
  });

  const API_URL =import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Features for hero section - Icons only
  const features = [
    { icon: FaShieldAlt, title: "100% Confidential", description: "Your privacy matters", color: "text-teal-400" },
    { icon: FaClock, title: "Quick Response", description: "Reviewed promptly", color: "text-blue-400" },
    { icon: FaLock, title: "Secure Platform", description: "Encrypted data", color: "text-purple-400" },
    { icon: FaChartLine, title: "Helps Improve", description: "Better healthcare", color: "text-emerald-400" }
  ];

  const feedbackTypes = [
    { id: 'general', label: 'General', icon: <FaComment />, color: 'teal', gradient: 'from-teal-500 to-cyan-500' },
    { id: 'suggestion', label: 'Suggestion', icon: <FaLightbulb />, color: 'amber', gradient: 'from-amber-500 to-orange-500' },
    { id: 'bug', label: 'Bug Report', icon: <FaBug />, color: 'rose', gradient: 'from-rose-500 to-red-600' },
    { id: 'compliment', label: 'Compliment', icon: <FaHeart />, color: 'pink', gradient: 'from-pink-400 to-rose-600' }
  ];

  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor({
      id: doctor.id,
      doctorId: doctor.doctorId,
      name: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital
    });
    setShowDoctorSelector(false);
  };

  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  const handleChangeDoctor = () => {
    setShowDoctorSelector(true);
  };

  const handleCloseSelector = () => {
    setShowDoctorSelector(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDoctor.id) {
      setError("Please select a doctor first!");
      return;
    }
    if (rating === 0) {
      setError("Please provide a rating!");
      return;
    }
    if (!feedbackType) {
      setError("Please select a feedback category!");
      return;
    }
    if (!message.trim()) {
      setError("Please write your feedback!");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = getToken();
      if (!token) {
        setError("Please login to submit feedback");
        setLoading(false);
        return;
      }

      const feedbackData = {
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        rating,
        feedbackType,
        title: title || `${feedbackType.charAt(0).toUpperCase() + feedbackType.slice(1)} Feedback for Dr. ${selectedDoctor.name}`,
        message,
        consultationType: 'Video Consultation',
        anonymous,
        appointmentId: appointmentId || null
      };

      const response = await axios.post(
        `${API_URL}/feedback`,
        feedbackData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnother = () => {
    setSubmitted(false);
    setRating(0);
    setFeedbackType('');
    setMessage('');
    setTitle('');
    setAnonymous(false);
    setShowDoctorSelector(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Plus_Jakarta_Sans']">
      
      {/* Hero Section - Same as Appointments Page, No Images */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div className="absolute top-20 right-20 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-20 py-16 lg:py-20 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-5 py-2 mb-6 border border-white/20">
              <FaRocket size={14} className="text-teal-400" />
              <span className="text-white text-sm font-medium">Share Your Experience</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter mb-5">
              Your 
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
                Feedback Matters
              </span>
            </h1>
            
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed">
              Help us improve our healthcare services by sharing your honest feedback. 
              Your opinion helps us serve you better and provide quality medical care.
            </p>

            
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="none" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-20 -mt-24 relative z-20">
        
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div 
              key="feedback-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden"
            >
              {/* Change Doctor & Close Buttons */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <button
                  onClick={handleChangeDoctor}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                >
                  <FaEdit size={14} />
                  Change Doctor
                </button>
                
                {onClose && (
                  <button
                    onClick={handleClose}
                    className="bg-white border border-slate-200 rounded-xl p-2 hover:bg-slate-50 transition-all"
                  >
                    <FaTimes size={16} className="text-slate-500" />
                  </button>
                )}
              </div>

              <div className="p-8 md:p-10">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                    <FaTimes size={14} />
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* Selected Doctor Display - Same style as Appointments doctor card */}
                  {selectedDoctor.id ? (
                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-5 rounded-2xl border border-teal-100">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                          <FaUserMd size={28} className="text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-teal-600 uppercase tracking-wider">Providing feedback for</p>
                          <p className="text-xl font-black text-slate-800">Dr. {selectedDoctor.name}</p>
                          {selectedDoctor.specialization && (
                            <p className="text-xs text-slate-500 mt-1">{selectedDoctor.specialization} | {selectedDoctor.hospital || 'Healthcare Center'}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 p-6 rounded-2xl text-center border border-amber-200">
                      <p className="text-amber-800 font-bold mb-3">Please select a doctor to provide feedback</p>
                      <button
                        type="button"
                        onClick={handleChangeDoctor}
                        className="px-6 py-3 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-600 transition-all shadow-md"
                      >
                        Select Doctor
                      </button>
                    </div>
                  )}
                  
                  {/* Feedback Type Selection - Same as Appointments filter tabs */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FaQuoteLeft size={10} /> Feedback Category
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {feedbackTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFeedbackType(type.id)}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 font-bold text-sm ${
                            feedbackType === type.id 
                              ? `bg-gradient-to-r ${type.gradient} text-white border-transparent shadow-lg scale-105` 
                              : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:shadow-md'
                          }`}
                        >
                          <div className={`text-xl ${feedbackType === type.id ? 'text-white' : `text-${type.color}-500`}`}>
                            {type.icon}
                          </div>
                          <span className="text-[11px]">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Star Rating - Enhanced */}
                  <div className="text-center bg-slate-50 p-8 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-4">
                      Rate your experience {selectedDoctor.name ? `with Dr. ${selectedDoctor.name}` : ''}
                    </p>
                    <div className="flex justify-center gap-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="transition-transform active:scale-90"
                        >
                          <FaStar 
                            size={40} 
                            className={`transition-all duration-200 ${
                              star <= (hoverRating || rating) ? 'text-yellow-400 drop-shadow-lg scale-110' : 'text-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <p className="text-xs text-teal-600 mt-3 font-bold">
                        {rating === 5 ? 'Excellent! 🌟' : rating === 4 ? 'Very Good! 👍' : rating === 3 ? 'Good 😊' : rating === 2 ? 'Could be better 🤔' : 'Sorry to hear that 😟'}
                      </p>
                    )}
                  </div>

                  {/* Title Input */}
                  <div>
                    <input
                      type="text"
                      placeholder="Feedback Title (Optional)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-teal-400 focus:bg-white transition-all font-medium text-slate-700"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  {/* Message Box */}
                  <div>
                    <textarea
                      rows="5"
                      placeholder="Write your thoughts here... Tell us about your experience, what went well, or what could be improved."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 outline-none focus:border-teal-400 focus:bg-white transition-all font-medium text-slate-700 resize-none"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  {/* Anonymous Option */}
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={anonymous}
                      onChange={(e) => setAnonymous(e.target.checked)}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 border-slate-300"
                    />
                    <label htmlFor="anonymous" className="text-sm text-slate-600 font-medium">
                      Submit anonymously (Your name won't be shared with the doctor)
                    </label>
                  </div>

                  {/* Submit Button - Same style as Appointments */}
                  <button
                    type="submit"
                    disabled={loading || !selectedDoctor.id}
                    className="w-full py-5 bg-[#0f172a] hover:bg-teal-500 text-white hover:text-[#0f172a] rounded-2xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        SUBMITTING...
                      </>
                    ) : (
                      <>
                        SEND FEEDBACK
                        <FaPaperPlane className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            /* Success State - Same style as appointments */
            <motion.div 
              key="success-screen"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[2.5rem] p-16 text-center shadow-xl border border-slate-100"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FaCheckCircle size={48} className="text-white" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-3">Thank You!</h2>
              <p className="text-slate-500 font-medium mb-6 max-w-md mx-auto">
                Your feedback for <span className="font-bold text-teal-600">Dr. {selectedDoctor.name}</span> has been submitted successfully!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleSubmitAnother}
                  className="px-8 py-4 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-600 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <FaThumbsUp size={14} />
                  SUBMIT ANOTHER FEEDBACK
                </button>
                {onClose && (
                  <button 
                    onClick={handleClose}
                    className="px-8 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    CLOSE
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Doctor Selector Modal */}
      {showDoctorSelector && (
        <FeedbackDoctorSelector 
          onDoctorSelect={handleDoctorSelect}
          onClose={handleCloseSelector}
        />
      )}
    </div>
  );
};

export default Feedback;