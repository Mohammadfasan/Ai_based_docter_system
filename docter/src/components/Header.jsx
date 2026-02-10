import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.jpeg';
  
import { 
  FaUserMd, FaBell, FaUserCircle, FaSignOutAlt, FaHome, 
  FaCalendarAlt, FaFileMedical, FaCog, FaQuestionCircle, 
  FaStethoscope, FaUsers, FaChartLine, FaShieldAlt,
  FaCalendarCheck, FaChartPie, FaFileAlt, FaPrescriptionBottle,
  FaDatabase, FaCogs, FaUserCog, FaMoneyBill,
  FaRobot, FaAmbulance, FaPills, FaBrain, FaVideo, FaBolt,
  FaComment, FaStar 
} from 'react-icons/fa';

const Header = ({ onLogout, userType, userData, darkMode, onToggleDarkMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getNavItems = () => {
    switch (userType) {
      case 'patient':
        return [
          { path: '/Home', label: 'Home', icon: <FaHome /> },
          { path: '/doctors', label: 'Find Doctors', icon: <FaStethoscope /> },
          { path: '/appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
          { path: '/medical-records', label: 'Records', icon: <FaFileMedical /> },
          { path: '/billing-payment', label: 'Billing', icon: <FaMoneyBill /> }, // ✅ Billing page
          { path: '/my-prescriptions', label: 'My Prescriptions', icon: <FaFileAlt /> },
          { path: '/feedback', label: 'Feedback', icon: <FaStar /> },
        ];
      case 'doctor':
        return [
          { path: '/doctor-portal', label: 'Dashboard', icon: <FaHome /> },
          { path: '/doctor-schedule', label: 'Schedule', icon: <FaCalendarCheck /> },
          
          { path: '/prescriptions', label: 'Prescriptions', icon: <FaPrescriptionBottle /> },
          { path: '/video-consultation/123', label: 'Video Call', icon: <FaVideo /> },
          { path: '/doctor-billing', label: 'Billing', icon: <FaMoneyBill /> }, // ✅ Doctor billing
          { path: '/doctor-feedback-dashboard', label: 'Feedback', icon: <FaStar /> },
        ];
      case 'admin':
        return [
          { path: '/admin', label: 'Dashboard', icon: <FaHome /> },
          { path: '/admin-management', label: 'Management', icon: <FaDatabase /> },
          { path: '/admin-portal', label: 'Admin Portal', icon: <FaShieldAlt /> },
          { path: '/admin-billing', label: 'Billing', icon: <FaMoneyBill /> }, // ✅ Admin billing
          { path: '/admin-feedback', label: 'Feedback', icon: <FaStar /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getUserTitle = () => {
    switch (userType) {
      case 'patient': return 'Patient';
      case 'doctor': return 'Doctor';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  const handleProfileClick = () => { navigate('/profile'); setShowUserMenu(false); };
  const handleSettingsClick = () => { navigate('/settings'); setShowUserMenu(false); };
  const handleHelpClick = () => { navigate('/help'); setShowUserMenu(false); };
  const handleChatClick = () => { navigate('/chat-system'); setShowUserMenu(false); };
  const handleFeedbackClick = () => { navigate('/feedback'); setShowUserMenu(false); };

  const isActive = (itemPath) => location.pathname === itemPath;

  const getUserInitials = () => userData?.name ? userData.name.charAt(0) : getUserTitle().charAt(0);

  // Dynamic colors for avatar
  const getAvatarColor = () => {
    switch (userType) {
      case 'patient': return 'from-blue-400 to-blue-600';
      case 'doctor': return 'from-emerald-400 to-teal-600';
      case 'admin': return 'from-amber-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <header className={`${
      darkMode 
        ? 'bg-[#0f172a] border-slate-800' // Darker Navy
        : 'bg-[#1e293b] border-slate-700' // Slate Blue/Grey for professional look
      } sticky top-0 z-50 border-b shadow-xl transition-all duration-300`}>
      
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <Link 
            to={userType === 'patient' ? '/dashboard' : userType === 'doctor' ? '/doctor-portal' : '/admin'} 
            className="flex items-center space-x-3 group"
          >
            <div className="relative p-1 bg-white/10 rounded-xl group-hover:bg-white/20 transition-all">
              <img className="h-10 w-10 rounded-lg object-cover" src={Logo} alt="Logo" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-white tracking-tight">
                Health<span className="text-teal-400">AI</span>
              </span>
              <span className="text-[10px] text-teal-200/60 uppercase font-bold tracking-widest">
                {getUserTitle()}
              </span>
            </div>
          </Link>

          {/* Navigation - Center */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive(item.path)
                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Action Icons - Right */}
          <div className="flex items-center space-x-3">
            
            {/* Theme Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-xl bg-white/5 text-teal-300 hover:bg-white/10 border border-white/10 transition-all"
            >
              {darkMode ? <FaBolt className="text-yellow-400" /> : <FaBolt />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                className="p-2.5 rounded-xl bg-white/5 text-slate-300 hover:text-white border border-white/10 transition-all"
              >
                <FaBell className="text-lg" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1e293b]"></span>
              </button>
            </div>

            {/* Profile Menu */}
            <div className="relative ml-2">
              <button 
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                className="flex items-center space-x-3 p-1.5 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
              >
                <div className={`w-9 h-9 bg-gradient-to-br ${getAvatarColor()} rounded-xl flex items-center justify-center text-white font-bold shadow-inner`}>
                  {getUserInitials()}
                </div>
                <div className="hidden xl:block text-left pr-2">
                  <p className="text-xs font-bold text-white leading-none">{userData?.name || 'User'}</p>
                  <p className="text-[10px] text-teal-300 mt-1 opacity-80 uppercase tracking-tighter">Online</p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-60 rounded-2xl shadow-2xl bg-[#1e293b] border border-white/10 py-2 transform transition-all overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 bg-black/20">
                    <p className="text-sm font-bold text-white">{userData?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{userData?.email}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <button onClick={handleProfileClick} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-teal-400 rounded-lg transition-all">
                      <FaUserCircle className="text-lg" /> <span>Profile Settings</span>
                    </button>
                    <button onClick={handleChatClick} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-teal-400 rounded-lg transition-all">
                      <FaComment className="text-lg" /> <span>Messages</span>
                    </button>
                    <button onClick={handleFeedbackClick} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-teal-400 rounded-lg transition-all">
                      <FaStar className="text-lg" /> <span>Give Feedback</span>
                    </button>
                    <button onClick={handleSettingsClick} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-teal-400 rounded-lg transition-all">
                      <FaCog className="text-lg" /> <span>Settings</span>
                    </button>
                    <button onClick={handleHelpClick} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-teal-400 rounded-lg transition-all">
                      <FaQuestionCircle className="text-lg" /> <span>Help & Support</span>
                    </button>
                    <div className="h-px bg-white/5 my-1" />
                    <button onClick={() => { onLogout(); setShowUserMenu(false); }} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                      <FaSignOutAlt className="text-lg" /> <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

Header.defaultProps = {
  userData: { name: 'Demo User', email: 'user@healthai.com' }
};

export default Header;