import React from 'react';
import { 
  FaHeartbeat, FaStethoscope, FaUsers, 
  FaShieldAlt, FaRocket, FaHandsHelping,
  FaCheckCircle, FaLaptopMedical
} from 'react-icons/fa';

const AboutUs = () => {
  const teamMembers = [
    { name: "Dr. Sarah Johnson", role: "Medical Director", bio: "15+ years in internal medicine.", image: "👩‍⚕️" },
    { name: "Michael Chen", role: "AI/ML Lead", bio: "AI researcher in healthcare.", image: "👨‍💻" },
    { name: "Priya Sharma", role: "Patient Experience", bio: "UX/UI Specialist.", image: "👩‍💼" },
    { name: "David Wilson", role: "Data Security", bio: "HIPAA Compliance expert.", image: "👨‍🔒" }
  ];

  const values = [
    { icon: <FaHeartbeat />, title: "Patient First", desc: "Every decision starts with patient wellbeing.", color: "text-red-500", bg: "bg-red-50" },
    { icon: <FaStethoscope />, title: "Medical Accuracy", desc: "AI backed by verified medical experts.", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: <FaShieldAlt />, title: "Privacy", desc: "Enterprise-grade data protection.", color: "text-purple-500", bg: "bg-purple-50" }
  ];

  const stats = [
    { number: "50K+", label: "Patients Helped" },
    { number: "500+", label: "Partner Doctors" },
    { number: "95%", label: "Satisfaction" },
    { number: "24/7", label: "AI Support" }
  ];

  return (
    <div className="space-y-24 py-12">
      
      {/* 1. Mission Section - Clean & Impactful */}
      <section className="text-center max-w-4xl mx-auto px-4">
        <span className="text-teal-600 font-bold tracking-widest uppercase text-sm">Our Mission</span>
        <h2 className="text-4xl font-extrabold text-gray-900 mt-3 mb-6">
          Democratizing Healthcare Through <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Smart Technology</span>
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          We bridge the gap between advanced AI and human empathy. Our goal is to provide immediate, 
          accurate medical guidance to everyone, regardless of their location.
        </p>
      </section>

      {/* 2. Stats - Floating Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-white shadow-xl text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="text-4xl font-black text-teal-600 mb-1">{stat.number}</div>
            <div className="text-gray-500 font-medium uppercase text-xs tracking-wider">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* 3. Core Values - Modern Cards */}
      <section className="px-4">
        <h3 className="text-2xl font-bold text-center mb-12 text-gray-800">Our Core Pillars</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((v, i) => (
            <div key={i} className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-2xl hover:border-teal-200 transition-all duration-300">
              <div className={`w-14 h-14 ${v.bg} ${v.color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
                {v.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{v.title}</h4>
              <p className="text-gray-600 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. The "Why Us" Story - Interactive Layout */}
      <section className="bg-gray-900 rounded-[3rem] overflow-hidden text-white flex flex-col lg:flex-row shadow-2xl mx-4">
        <div className="lg:w-1/2 p-12 lg:p-20 space-y-6">
          <h3 className="text-3xl font-bold italic text-teal-400">"The future of health is in your pocket."</h3>
          <p className="text-gray-400 text-lg leading-relaxed">
            Founded in 2020, we noticed that millions suffer because they can't access medical advice quickly. 
            We built HealthAI to ensure no one has to wait for hours just to understand their symptoms.
          </p>
          <ul className="space-y-4">
            {['AI-Powered Precision', '24/7 Availability', 'Doctor-Verified Insights'].map((item, idx) => (
              <li key={idx} className="flex items-center space-x-3">
                <FaCheckCircle className="text-teal-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:w-1/2 bg-teal-800/50 flex items-center justify-center p-12 border-l border-white/10">
          <div className="text-center">
             <FaLaptopMedical className="text-9xl text-teal-400 opacity-50 mb-4 mx-auto" />
             <p className="text-xl font-medium">Empowering millions worldwide</p>
          </div>
        </div>
      </section>

      {/* 5. Team - Minimalist Style */}
      <section className="px-4 pb-12">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Led by Experts</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((m, i) => (
            <div key={i} className="text-center p-6 rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-300 group">
              <div className="text-6xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">
                {m.image}
              </div>
              <h4 className="text-lg font-bold text-gray-900">{m.name}</h4>
              <p className="text-teal-600 text-sm font-semibold mb-2">{m.role}</p>
              <p className="text-gray-500 text-xs px-4">{m.bio}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutUs;