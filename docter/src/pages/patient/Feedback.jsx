import React, { useState } from 'react';
import axios from 'axios';
import { 
  FaStar, FaPaperPlane, FaComment, FaHeart, 
  FaCheckCircle, FaLightbulb, FaBug, FaRocket,
  FaSpinner, FaUserMd, FaEdit, FaArrowLeft,
  FaTimes
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

  const API_URL = 'http://localhost:5000/api';

  const feedbackTypes = [
    { id: 'general', label: 'General', icon: <FaComment />, color: 'from-cyan-400 to-blue-500' },
    { id: 'suggestion', label: 'Idea', icon: <FaLightbulb />, color: 'from-yellow-400 to-orange-500' },
    { id: 'bug', label: 'Bug', icon: <FaBug />, color: 'from-rose-400 to-red-600' },
    { id: 'compliment', label: 'Love it', icon: <FaHeart />, color: 'from-pink-400 to-rose-600' }
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
        // ✅ REMOVED: No auto-redirect, just stay on success page
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add function to submit another feedback
  const handleSubmitAnother = () => {
    setSubmitted(false);
    setRating(0);
    setFeedbackType('');
    setMessage('');
    setTitle('');
    setAnonymous(false);
    setShowDoctorSelector(true); // Show doctor selector for new feedback
  };

  return (
    <>
      {/* Main Feedback Form */}
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl w-full mx-auto">
          
          {/* Change Doctor button */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handleChangeDoctor}
              className="bg-white rounded-full px-4 py-2 shadow-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <FaEdit size={16} className="text-gray-600" />
              <span className="text-sm font-medium">Change Doctor</span>
            </button>
            
            {onClose && (
              <button
                onClick={handleClose}
                className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <FaTimes size={18} className="text-gray-600" />
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div 
                key="feedback-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-white"
              >
                <div className="grid md:grid-cols-2">
                  
                  {/* Left Side: Visual Content */}
                  <div className="bg-[#0f172a] p-12 flex flex-col justify-center relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                      <h2 className="text-4xl font-black mb-6 leading-tight">
                        Share Your <br/>
                        <span className="text-teal-400">Experience!</span>
                      </h2>
                      <p className="text-slate-400 font-medium mb-8">
                        Your feedback helps us improve our service and provide better healthcare!
                      </p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                          <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400">
                            <FaRocket />
                          </div>
                          <p className="text-sm font-bold">We value your opinion</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Form */}
                  <div className="p-8 md:p-12">
                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        {error}
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-8">
                      
                      {/* Selected Doctor Display */}
                      {selectedDoctor.id ? (
                        <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-2xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center text-white">
                                <FaUserMd size={24} />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Providing feedback for:</p>
                                <p className="font-bold text-gray-900">Dr. {selectedDoctor.name}</p>
                                {selectedDoctor.specialization && (
                                  <p className="text-xs text-gray-600">{selectedDoctor.specialization} | {selectedDoctor.hospital}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 p-4 rounded-2xl text-center">
                          <p className="text-yellow-800">Please select a doctor to provide feedback</p>
                          <button
                            type="button"
                            onClick={handleChangeDoctor}
                            className="mt-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                          >
                            Select Doctor
                          </button>
                        </div>
                      )}
                      
                      {/* Feedback Type Selection */}
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Feedback Category</p>
                        <div className="grid grid-cols-2 gap-3">
                          {feedbackTypes.map((type) => (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => setFeedbackType(type.id)}
                              className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 font-bold text-sm ${
                                feedbackType === type.id 
                                  ? `bg-gradient-to-r ${type.color} text-white border-transparent shadow-lg` 
                                  : 'border-slate-100 text-slate-500 hover:border-teal-200'
                              }`}
                            >
                              {type.icon} {type.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Star Rating */}
                      <div className="text-center bg-slate-50 p-6 rounded-[2rem]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                          Rate your experience {selectedDoctor.name ? `with Dr. ${selectedDoctor.name}` : ''}
                        </p>
                        <div className="flex justify-center gap-2">
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
                                size={32} 
                                className={`transition-colors duration-200 ${
                                  star <= (hoverRating || rating) ? 'text-yellow-400 drop-shadow-md' : 'text-slate-200'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Title Input */}
                      <div>
                        <input
                          type="text"
                          placeholder="Feedback Title (Optional)"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-teal-400 transition-all font-medium text-slate-700"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>

                      {/* Message Box */}
                      <div className="relative">
                        <textarea
                          rows="4"
                          placeholder="Write your thoughts here..."
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 outline-none focus:border-teal-400 transition-all font-medium text-slate-700"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                      </div>

                      {/* Anonymous Option */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="anonymous"
                          checked={anonymous}
                          onChange={(e) => setAnonymous(e.target.checked)}
                          className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <label htmlFor="anonymous" className="text-sm text-gray-600">
                          Submit anonymously (Your name won't be shared with the doctor)
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !selectedDoctor.id}
                        className="w-full py-5 bg-[#0f172a] hover:bg-teal-500 text-white hover:text-[#0f172a] rounded-[2rem] font-black text-sm transition-all shadow-xl flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
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

                </div>
              </motion.div>
            ) : (
              /* Success State - NO AUTO REDIRECT */
              <motion.div 
                key="success-screen"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[4rem] p-16 text-center shadow-2xl border border-teal-100"
              >
                <div className="w-24 h-24 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <FaCheckCircle size={48} />
                </div>
                <h2 className="text-4xl font-black text-[#0f172a] mb-4">Thank You!</h2>
                <p className="text-slate-500 font-bold mb-8 max-w-sm mx-auto leading-relaxed">
                  Your feedback for Dr. {selectedDoctor.name} has been submitted successfully!
                </p>
                
                {/* ✅ Button to submit another feedback */}
                <button 
                  onClick={handleSubmitAnother}
                  className="px-8 py-4 bg-teal-500 text-white rounded-full font-bold hover:bg-teal-600 transition-all shadow-lg"
                >
                  SUBMIT ANOTHER FEEDBACK
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Doctor Selector Modal */}
      {showDoctorSelector && (
        <FeedbackDoctorSelector 
          onDoctorSelect={handleDoctorSelect}
          onClose={handleCloseSelector}
        />
      )}
    </>
  );
};

export default Feedback;