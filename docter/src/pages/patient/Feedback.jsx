import React, { useState } from 'react';
import { 
  FaStar, FaPaperPlane, FaComment, FaHeart, 
  FaCheckCircle, FaLightbulb, FaBug, FaRocket
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const feedbackTypes = [
    { id: 'general', label: 'General', icon: <FaComment />, color: 'from-cyan-400 to-blue-500' },
    { id: 'suggestion', label: 'Idea', icon: <FaLightbulb />, color: 'from-yellow-400 to-orange-500' },
    { id: 'bug', label: 'Bug', icon: <FaBug />, color: 'from-rose-400 to-red-600' },
    { id: 'compliment', label: 'Love it', icon: <FaHeart />, color: 'from-pink-400 to-rose-600' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0 || !feedbackType || !message) {
      alert("Please fill all fields!");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        
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
                      Ungaloda feedback engalukku romba mukkiyam. App-ai innum sirappa matha help pannunga!
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400">
                          <FaRocket />
                        </div>
                        <p className="text-sm font-bold">Fast Response</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Form */}
                <div className="p-8 md:p-12">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    
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
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Rate your journey</p>
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

                    <button
                      type="submit"
                      className="w-full py-5 bg-[#0f172a] hover:bg-teal-500 text-white hover:text-[#0f172a] rounded-[2rem] font-black text-sm transition-all shadow-xl flex items-center justify-center gap-3 group"
                    >
                      SEND FEEDBACK
                      <FaPaperPlane className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </form>
                </div>

              </div>
            </motion.div>
          ) : (
            /* Success State */
            <motion.div 
              key="success-screen"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[4rem] p-16 text-center shadow-2xl border border-teal-100"
            >
              <div className="w-24 h-24 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <FaCheckCircle size={48} />
              </div>
              <h2 className="text-4xl font-black text-[#0f172a] mb-4">Thank You!</h2>
              <p className="text-slate-500 font-bold mb-8 max-w-sm mx-auto leading-relaxed">
                Unga feedback-ai naanga receive pannittom. Idhu engalukku romba udhaviyaaga irukkum!
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="px-10 py-4 bg-teal-500 text-[#0f172a] rounded-full font-black hover:bg-teal-400 transition-all shadow-lg shadow-teal-200"
              >
                GO BACK
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Feedback;