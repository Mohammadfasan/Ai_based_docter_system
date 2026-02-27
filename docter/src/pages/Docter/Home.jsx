import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronRight, Award, Users, Smile } from 'lucide-react'
import Imge from '../../assets/img.png'
import Image1 from '../../assets/Docter1.png'
import Image2 from '../../assets/Docter2.png'
import Image3 from '../../assets/doc1.png'

const Home = () => {
  const ribbonItems = [
    "Immunization Services", "Emergency Care", "Diagnostic Services", 
    "General Medicine", "Surgical Services", "Diagnostics & Lab", "Pharmacy"
  ];

  const stats = [
    { id: 1, icon: <Award className="w-12 h-12 text-white/80" />, number: "2480", label: "Patients a year" },
    { id: 2, icon: <Users className="w-12 h-12 text-white/80" />, number: "26", label: "People working" },
    { id: 3, icon: <Calendar className="w-12 h-12 text-white/80" />, number: "38", label: "Years of experience" },
    { id: 4, icon: <Smile className="w-12 h-12 text-white/80" />, number: "7856", label: "Happy smiles" },
  ];

  const marqueeVariants = {
    animate: {
      x: [0, -1035],
      transition: {
        x: { repeat: Infinity, repeatType: "loop", duration: 25, ease: "linear" },
      },
    },
  };

  return (
    <div className="font-sans overflow-x-hidden">
      {/* Hero Section */}
      <div 
        className="relative min-h-[90vh] flex items-center bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(to right, #001b38 40%, rgba(0, 27, 56, 0.7) 70%, rgba(0, 27, 56, 0.3) 100%), url(${Imge})`,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] text-white mb-6 tracking-tight">
              PATIENT HEALTH, OUR <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent">
                TRUE MISSION
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-lg leading-relaxed font-light">
              Expert medical care is just a click away. Access our specialized doctors.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-3 bg-cyan-500 hover:bg-cyan-400 text-[#001b38] font-bold py-4 px-10 rounded-sm transition-all shadow-xl group">
                <Calendar size={20} /> SCHEDULE YOUR VISIT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ribbon */}
      <div className="bg-sky-200 border-y border-slate-200 py-6 overflow-hidden relative">
        <motion.div className="flex whitespace-nowrap" variants={marqueeVariants} animate="animate">
          {[...ribbonItems, ...ribbonItems].map((item, index) => (
            <div key={index} className="flex items-center gap-16 px-8">
              <span className="text-[12px] font-extrabold text-slate-500 tracking-[0.2em] uppercase">{item}</span>
              <div className="h-1.5 w-1.5 bg-cyan-400 rounded-full"></div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* WHAT WE DO SECTION WITH ANIMATION */}
      <section className="py-24 bg-white overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-6 lg:px-12"
        >
          
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-[#001b38] mb-4 tracking-tight uppercase">
              What We Do?
            </h2>
            <div className="w-16 h-1 bg-cyan-500 mx-auto mb-8"></div>
            <p className="max-w-3xl mx-auto text-slate-500 leading-relaxed text-lg">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. 
              Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
            
            {/* Left Side: Services */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-16"
            >
              {/* Cardiac Clinic */}
              <div className="group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-cyan-600 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#001b38] uppercase">Cardiac Clinic</h3>
                </div>
                <p className="text-slate-500 text-[15px] leading-relaxed mb-4 border-b border-slate-100 pb-6">
                  Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis.
                </p>
              </div>

              {/* Eye Care */}
              <div className="group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-cyan-600 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#001b38] uppercase">Eye Care & Surgery</h3>
                </div>
                <p className="text-slate-500 text-[15px] leading-relaxed mb-4 border-b border-slate-100 pb-6">
                  Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis.
                </p>
              </div>
            </motion.div>

            {/* Center Side: Doctor Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex justify-center order-first lg:order-none relative"
            >
              <div className="absolute inset-0 bg-cyan-100 rounded-full blur-[100px] opacity-30 -z-10 transform scale-75"></div>
              <img 
                src={Image2} 
                alt="Doctor Professional" 
                className="w-full max-w-[360px] object-contain drop-shadow-2xl" 
              />
            </motion.div>

            {/* Right Side: Services */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-16"
            >
              {/* Diabetes Treatment */}
              <div className="group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-cyan-600 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/></svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#001b38] uppercase">Diabetes Treatment</h3>
                </div>
                <p className="text-slate-500 text-[15px] leading-relaxed mb-4 border-b border-slate-100 pb-6">
                  Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis.
                </p>
              </div>

              {/* Emergency Services */}
              <div className="group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-cyan-600 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M16 4.5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2V6H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-3V4.5zM10 4.5h4V6h-4V4.5zM12 18c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm-1-4h2v-2h-2v2z"/></svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#001b38] uppercase">Emergency Services</h3>
                </div>
                <p className="text-slate-500 text-[15px] leading-relaxed mb-4 border-b border-slate-100 pb-6">
                  Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis.
                </p>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* --- NEW STATISTICS SECTION --- */}
      <section 
        className="relative py-28 bg-cover bg-center bg-fixed text-white"
        style={{ 
          backgroundImage: `linear-gradient(rgba(14, 116, 144, 0.85), rgba(14, 116, 144, 0.85)), url(${Image3})` 
        }}
      >
        {/* Dental Icon Decorative Overlay */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-10 hidden lg:block">
          <svg width="250" height="250" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <p className="text-xs font-bold tracking-[0.4em] uppercase mb-4 opacity-80">Some Statistics</p>
            <h2 className="text-4xl font-black uppercase tracking-wider">Our Clinic in Numbers</h2>
            <div className="w-14 h-0.5 bg-white/40 mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
            {stats.map((stat) => (
              <motion.div 
                key={stat.id} 
                whileHover={{ y: -10 }}
                className="flex flex-col items-center"
              >
                <div className="mb-6 opacity-90">{stat.icon}</div>
                <h3 className="text-6xl font-black mb-3 tabular-nums">{stat.number}</h3>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* --- END STATISTICS SECTION --- */}

      {/* TESTIMONIALS SECTION - LIGHT VERSION */}
      <section className="relative py-24 overflow-hidden">
        {/* Background with White Overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${Imge})` }}
        ></div>
        
        {/* Pure White Gradient for better readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-white z-0"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-cyan-600 font-bold tracking-[0.2em] uppercase text-sm"
            >
              Testimonials
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl font-extrabold text-[#001b38] mt-2 uppercase"
            >
              What Our Clients Say
            </motion.h2>
            <div className="w-16 h-1 bg-cyan-500 mx-auto mt-5"></div>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 - Vanessa */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-sm shadow-xl border border-slate-100 flex flex-col h-full"
            >
              <div className="bg-cyan-500 p-6 flex items-center gap-4 text-white">
                <img src={Image1} alt="Vanessa" className="w-14 h-14 rounded-full object-cover border-2 border-white/30" />
                <div>
                  <h4 className="font-bold text-base uppercase leading-tight">Vanessa Adams</h4>
                  <p className="text-[10px] opacity-90 tracking-widest uppercase">Officer Cleaner</p>
                </div>
              </div>
              <div className="p-8 flex-grow relative">
                <p className="text-slate-500 text-sm leading-relaxed italic">
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed tincidunt porta velit, sed suscipit massa consequat sed. Integer est ante."
                </p>
              </div>
            </motion.div>

            {/* Card 2 - Daniel */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-sm shadow-xl border border-slate-100 flex flex-col h-full"
            >
              <div className="bg-[#0092cc] p-6 flex items-center gap-4 text-white">
                <img src={Image2} alt="Daniel" className="w-14 h-14 rounded-full object-cover border-2 border-white/30" />
                <div>
                  <h4 className="font-bold text-base uppercase leading-tight">Daniel Palmer</h4>
                  <p className="text-[10px] opacity-90 tracking-widest uppercase">Businessman</p>
                </div>
              </div>
              <div className="p-8 flex-grow">
                <p className="text-slate-500 text-sm leading-relaxed italic">
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed tincidunt porta velit, sed suscipit massa consequat sed. Integer est ante."
                </p>
              </div>
            </motion.div>

            {/* Card 3 - Henri */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-sm shadow-xl border border-slate-100 flex flex-col h-full"
            >
              <div className="bg-[#1e4a8a] p-6 flex items-center gap-4 text-white">
                <img src={Image1} alt="Henri" className="w-14 h-14 rounded-full object-cover border-2 border-white/30" />
                <div>
                  <h4 className="font-bold text-base uppercase leading-tight">Henri Matisse</h4>
                  <p className="text-[10px] opacity-90 tracking-widest uppercase">Painter</p>
                </div>
              </div>
              <div className="p-8 flex-grow">
                <p className="text-slate-500 text-sm leading-relaxed italic">
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed tincidunt porta velit, sed suscipit massa consequat sed. Integer est ante."
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  )
}

export default Home