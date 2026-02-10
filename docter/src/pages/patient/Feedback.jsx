import React, { useState } from 'react';
import { 
  FaStar, FaSmile, FaFrown, FaMeh, FaPaperPlane,
  FaThumbsUp, FaComment, FaHeart, FaCheckCircle, FaLightbulb, FaBug
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion'; // Animation-kaga (Optional)

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const feedbackTypes = [
    { id: 'general', label: 'General', icon: <FaComment />, color: 'from-blue-400 to-blue-600' },
    { id: 'suggestion', label: 'Idea', icon: <FaLightbulb />, color: 'from-amber-400 to-yellow-600' },
    { id: 'bug', label: 'Bug', icon: <FaBug />, color: 'from-rose-400 to-red-600' },
    { id: 'compliment', label: 'Love it', icon: <FaHeart />, color: 'from-pink-400 to-fuchsia-600' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0 || !feedbackType || !message.trim()) return;

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setFeedbackType('');
      setMessage('');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-teal-100 p-6">
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-100/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <span className="px-4 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm font-bold tracking-wide uppercase">Feedback Loop</span>
          <h1 className="text-5xl font-extrabold mt-4 tracking-tight text-slate-900">How are we doing?</h1>
          <p className="text-slate-500 mt-4 text-lg">Help us shape the future of HealthAI.</p>
        </header>

        <AnimatePresence mode="wait">
          {submitted ? (
            <div className="max-w-xl mx-auto bg-white border border-slate-100 shadow-2xl rounded-[2rem] p-12 text-center">
              <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle size={40} />
              </div>
              <h2 className="text-3xl font-bold mb-2">You're Awesome!</h2>
              <p className="text-slate-500">Your feedback has been beamed to our team. We'll get on it right away.</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-8 text-teal-600 font-semibold hover:underline"
              >
                Send more feedback
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Left: Interactive Section */}
              <div className="lg:col-span-7 space-y-6">
                <section className="bg-white border border-slate-100 shadow-sm rounded-[2rem] p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm">1</span>
                    Rate your experience
                  </h3>
                  
                  <div className="flex flex-col items-center py-4">
                    <div className="flex gap-3 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="relative transition-all duration-200 transform hover:scale-110 active:scale-95"
                        >
                          <FaStar 
                            className={`text-5xl transition-colors duration-300 ${
                              star <= (hoverRating || rating) ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]' : 'text-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="font-medium text-slate-400 h-6">
                      {rating === 1 && "Poor ☹️"}
                      {rating === 2 && "Could be better 😕"}
                      {rating === 3 && "It's okay 😐"}
                      {rating === 4 && "Great! 🙂"}
                      {rating === 5 && "Excellent! 🤩"}
                    </p>
                  </div>
                </section>

                <section className="bg-white border border-slate-100 shadow-sm rounded-[2rem] p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm">2</span>
                    What's on your mind?
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {feedbackTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setFeedbackType(type.id)}
                        className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
                          feedbackType === type.id 
                          ? 'border-slate-900 bg-slate-900 text-white scale-105 shadow-xl' 
                          : 'border-slate-50 bg-slate-50 hover:border-slate-200 text-slate-600'
                        }`}
                      >
                        <div className={`text-2xl transition-transform group-hover:rotate-12 ${feedbackType === type.id ? 'text-white' : 'text-slate-400'}`}>
                          {type.icon}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right: Text Input Section */}
              <div className="lg:col-span-5">
                <div className="bg-white border border-slate-100 shadow-xl rounded-[2rem] p-8 sticky top-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm">3</span>
                    The details
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us what happened..."
                        rows="6"
                        className="w-full bg-slate-50 border-none rounded-2xl p-5 focus:ring-2 focus:ring-teal-500/20 outline-none text-slate-700 placeholder:text-slate-400 transition-all resize-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Email address (Optional)"
                        className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-teal-500/20 outline-none text-slate-700"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!rating || !feedbackType || !message.trim()}
                      className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white rounded-2xl font-bold text-lg shadow-lg shadow-teal-200 transition-all flex items-center justify-center gap-3 hover:-translate-y-1 active:translate-y-0"
                    >
                      <FaPaperPlane className="text-sm" />
                      Send Feedback
                    </button>

                    <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                      By submitting, you agree to our <span className="underline cursor-pointer">Terms of Service</span>. <br/> Your data is safe with us.
                    </p>
                  </form>
                </div>
              </div>

            </div>
          )}
        </AnimatePresence>

        {/* Minimal Footer Stats */}
        <footer className="mt-20 py-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Rating</p>
              <p className="text-xl font-black text-slate-800">4.8 / 5.0</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Support Speed</p>
              <p className="text-xl font-black text-slate-800">&lt; 24 Hours</p>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 italic">"Design is not just what it looks like, it's how it works."</p>
        </footer>
      </div>
    </div>
  );
};

export default Feedback;