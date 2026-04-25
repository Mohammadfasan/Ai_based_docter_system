// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.jpeg';

import { 
  FaBell, FaSun, FaMoon, FaSignOutAlt,
  FaBars, FaTimes
} from 'react-icons/fa';

const Header = ({ onLogout, userType, userData, darkMode, onToggleDarkMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowMobileMenu(false);
      }
    };

    loadNotifications();

    const handleNotificationUpdate = () => {
      loadNotifications();
    };
    
    window.addEventListener('notificationUpdate', handleNotificationUpdate);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('notificationUpdate', handleNotificationUpdate);
    };
  }, [userType, userData]);

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString();
    } catch (e) {
      return 'Unknown';
    }
  };

  const isForCurrentUser = (notification) => {
    if (userType === 'admin') return true;
    
    if (userType === 'doctor') {
      if (notification.recipientType === 'all') return true;
      if (notification.recipientType === 'doctors') return true;
      if (notification.recipientType === 'specific' && notification.targetUsers) {
        return notification.targetUsers.some(u => 
          u.id === userData?.userId || 
          u.email === userData?.email ||
          u.id === userData?._id ||
          (u.type === 'doctor' && (u.id === userData?.userId || u.id === userData?._id))
        );
      }
      return false;
    }
    
    if (userType === 'patient') {
      if (notification.recipientType === 'all') return true;
      if (notification.recipientType === 'patients') return true;
      if (notification.recipientType === 'specific' && notification.targetUsers) {
        return notification.targetUsers.some(u => 
          u.id === userData?.userId || 
          u.email === userData?.email ||
          u.id === userData?._id ||
          (u.type === 'patient' && (u.id === userData?.userId || u.id === userData?._id))
        );
      }
      return false;
    }
    
    return false;
  };

  const loadNotifications = () => {
    try {
      const allNotifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
      
      let userNotifications = allNotifications.filter(isForCurrentUser);
      
      const formattedNotifs = userNotifications
        .sort((a, b) => {
          if (a.read !== b.read) return a.read ? 1 : -1;
          return new Date(b.timestamp) - new Date(a.timestamp);
        })
        .slice(0, 5)
        .map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          time: formatTimeAgo(n.timestamp),
          timestamp: n.timestamp,
          read: n.read,
          type: n.type,
          priority: n.priority || 'normal',
          actionUrl: n.actionUrl,
          recipientType: n.recipientType,
          targetUsers: n.targetUsers
        }));
      
      setNotifications(formattedNotifs);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
  };

  const getNavItems = () => {
    switch (userType) {
      case 'patient':
        return [
          { path: '/home', label: 'Home' },
          { path: '/doctors', label: 'Doctors' },
          { path: '/appointments', label: 'Appointments' },
          { path: '/medical-records', label: 'Records' },
          { path: '/my-prescriptions', label: 'Prescriptions' },
          { path: '/feedback', label: 'Feedback' },
        ];
      case 'doctor':
        return [
          { path: '/doctor', label: 'Dashboard' },
          { path: '/doctor-schedule', label: 'Schedule' },
          { path: '/doctor/appointments', label: 'Appointments' },
          { path: '/prescriptions', label: 'Prescriptions' },
          { path: '/doctor/patient-records', label: 'Records' },
          { path: '/doctor-feedback-dashboard', label: 'Feedback' },
        ];
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard' },
          { path: '/admin/doctors', label: 'Doctors' },
          { path: '/admin/patients', label: 'Patients' },
          { path: '/admin/appointments', label: 'Appointments' },
          { path: '/admin/logs', label: 'Medical Logs' },
          { path: '/admin/notifications', label: 'Notifications' },
          { path: '/admin/settings', label: 'Settings' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getUserTitle = () => {
    switch (userType) {
      case 'patient': return 'Patient Portal';
      case 'doctor': return 'Doctor Portal';
      case 'admin': return 'Admin Panel';
      default: return 'HealthAI';
    }
  };

  const getUserRole = () => {
    switch (userType) {
      case 'patient': return 'Patient';
      case 'doctor': return 'Doctor';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  const handleProfileClick = () => { 
    navigate('/profile'); 
    setShowUserMenu(false); 
    setShowMobileMenu(false);
  };
  
  const handleSettingsClick = () => { 
    if (userType === 'admin') {
      navigate('/admin/settings');
    } else {
      navigate('/settings');
    }
    setShowUserMenu(false); 
    setShowMobileMenu(false);
  };
  
  const handleHelpClick = () => { 
    navigate('/help'); 
    setShowUserMenu(false); 
    setShowMobileMenu(false);
  };
  
  const handleChatClick = () => { 
    navigate('/chat-system'); 
    setShowUserMenu(false); 
    setShowMobileMenu(false);
  };

  const handleFeedbackClick = () => { 
    navigate('/feedback'); 
    setShowUserMenu(false); 
    setShowMobileMenu(false);
  };

  const handleMobileNavClick = (path) => {
    navigate(path);
    setShowMobileMenu(false);
  };

  const handleLogout = () => {
    onLogout();
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    
    const allNotifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    const updatedNotifs = allNotifications.map(n => {
      if (isForCurrentUser(n)) {
        return { ...n, read: true };
      }
      return n;
    });
    localStorage.setItem('admin_notifications', JSON.stringify(updatedNotifs));
    
    window.dispatchEvent(new Event('notificationUpdate'));
  };

  const handleViewAllNotifications = () => {
    if (userType === 'admin') {
      navigate('/admin/notifications');
    } else {
      navigate('/notifications');
    }
    setShowNotifications(false);
  };

  const handleNotificationClick = (notification) => {
    setShowNotifications(false);
    
    if (!notification.read) {
      const allNotifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
      const updatedNotifs = allNotifications.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      );
      localStorage.setItem('admin_notifications', JSON.stringify(updatedNotifs));
      window.dispatchEvent(new Event('notificationUpdate'));
    }
    
    if (userType === 'admin' && notification.actionUrl) {
      navigate(notification.actionUrl);
    } else if (notification.type === 'appointment') {
      navigate(userType === 'doctor' ? '/doctor/appointments' : '/appointments');
    } else if (notification.type === 'prescription') {
      navigate(userType === 'doctor' ? '/prescriptions' : '/my-prescriptions');
    } else if (notification.type === 'feedback') {
      navigate(userType === 'doctor' ? '/doctor-feedback-dashboard' : '/feedback');
    }
  };

  const isActive = (itemPath) => location.pathname === itemPath;

  const getUserInitials = () => {
    if (userData?.name) {
      return userData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    return getUserRole().charAt(0);
  };

  const getAvatarColor = () => {
    switch (userType) {
      case 'patient': return 'from-blue-400 to-blue-600';
      case 'doctor': return 'from-emerald-400 to-teal-600';
      case 'admin': return 'from-amber-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getNotificationIcon = (type, priority) => {
    const iconClass = priority === 'urgent' ? 'text-red-500' : 
                     priority === 'high' ? 'text-orange-500' : 
                     'text-teal-500';
    
    switch(type) {
      case 'doctor': return <FaBell className={iconClass} />;
      case 'system': return <FaBell className="text-purple-500" />;
      case 'feedback': return <FaBell className="text-yellow-500" />;
      case 'appointment': return <FaBell className="text-green-500" />;
      case 'prescription': return <FaBell className="text-teal-500" />;
      default: return <FaBell className="text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const MobileNavItem = ({ item, onClick }) => (
    <button
      onClick={() => onClick(item.path)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all ${
        isActive(item.path)
          ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
          : 'text-slate-100 hover:text-white hover:bg-white/10'
      }`}
    >
      <span className="font-medium flex-1">{item.label}</span>
      {isActive(item.path) && <span className="text-teal-400">→</span>}
    </button>
  );

  return (
    <>
      <header className="bg-[#064E3B] sticky top-0 z-50 border-b border-emerald-800 shadow-xl transition-all duration-300 w-full">
        
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              
              {/* Logo Section */}
              <div className="flex items-center space-x-3">
                <Link 
                  to={
                    userType === 'patient' ? '/home' : 
                    userType === 'doctor' ? '/doctor' : 
                    userType === 'admin' ? '/admin/dashboard' : '/'
                  } 
                  className="flex items-center space-x-3 group"
                >
                  <div className="relative p-1 bg-white/10 rounded-xl group-hover:bg-white/20 transition-all">
                    <img className="h-10 w-10 rounded-lg object-cover" src={Logo} alt="Logo" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-extrabold text-white tracking-tight">
                      Health<span className="text-teal-300">AI</span>
                    </span>
                    <span className="text-[10px] text-teal-200/80 uppercase font-bold tracking-widest">
                      {getUserTitle()}
                    </span>
                  </div>
                </Link>
              </div>

              {/* Desktop Navigation - Center */}
              <nav className="hidden lg:flex items-center space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive(item.path)
                        ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                        : 'text-slate-100 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              {/* Action Icons - Right */}
              <div className="flex items-center space-x-2">
                
                {/* Theme Toggle */}
                <button
                  onClick={onToggleDarkMode}
                  className="hidden lg:flex p-2.5 rounded-xl bg-white/10 text-slate-100 hover:text-white hover:bg-white/20 border border-white/20 transition-all"
                  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {darkMode ? <FaSun className="text-yellow-300" size={16} /> : <FaMoon size={16} />}
                </button>

                {/* Notifications */}
                <div className="hidden lg:block relative">
                  <button 
                    onClick={() => { 
                      setShowNotifications(!showNotifications); 
                      setShowUserMenu(false); 
                    }}
                    className="relative p-2.5 rounded-xl bg-white/10 text-slate-100 hover:text-white hover:bg-white/20 border border-white/20 transition-all"
                  >
                    <FaBell size={16} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#064E3B]">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl bg-[#1e293b] border border-white/10 overflow-hidden z-50">
                      <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h3 className="font-bold text-white">Notifications</h3>
                        <div className="flex gap-2">
                          {unreadCount > 0 && (
                            <button 
                              onClick={markAllAsRead}
                              className="text-xs text-teal-400 hover:text-teal-300"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div 
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-4 border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer ${
                                !notif.read ? 'bg-teal-500/5' : ''
                              }`}
                            >
                              <div className="flex gap-3">
                                <div className="p-2 bg-white/5 rounded-lg">
                                  {getNotificationIcon(notif.type, notif.priority)}
                                </div>
                                <div className="flex-1">
                                  <p className={`text-sm ${!notif.read ? 'text-white font-bold' : 'text-slate-300'}`}>
                                    {notif.title}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <p className="text-[9px] text-slate-500 mt-1">{notif.time}</p>
                                </div>
                                {!notif.read && (
                                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-slate-500">
                            <FaBell className="mx-auto mb-3 opacity-30" size={32} />
                            <p>No notifications</p>
                          </div>
                        )}
                      </div>
                      <div className="p-3 border-t border-white/10">
                        <button 
                          onClick={handleViewAllNotifications}
                          className="w-full text-center text-xs text-teal-400 hover:text-teal-300"
                        >
                          View All Notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Menu */}
                <div className="relative">
                  {/* Desktop Profile Button */}
                  <button 
                    onClick={() => { 
                      setShowUserMenu(!showUserMenu); 
                      setShowNotifications(false); 
                    }}
                    className="hidden lg:flex items-center space-x-3 p-1.5 rounded-2xl hover:bg-white/10 transition-all border border-transparent hover:border-white/20"
                  >
                    <div className={`w-9 h-9 bg-gradient-to-br ${getAvatarColor()} rounded-xl flex items-center justify-center text-white font-bold shadow-inner text-sm`}>
                      {getUserInitials()}
                    </div>
                    <div className="hidden xl:block text-left pr-2">
                      <p className="text-xs font-bold text-white leading-none">{userData?.name}</p>
                      <p className="text-[9px] text-teal-200 mt-1 opacity-80 uppercase tracking-tighter flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                        Online
                      </p>
                    </div>
                  </button>

                  {/* Mobile Profile Button */}
                  <button 
                    onClick={() => { setShowMobileMenu(true); }}
                    className="lg:hidden flex items-center space-x-3 p-1.5 rounded-2xl hover:bg-white/10 transition-all border border-transparent hover:border-white/20"
                  >
                    <div className={`w-9 h-9 bg-gradient-to-br ${getAvatarColor()} rounded-xl flex items-center justify-center text-white font-bold shadow-inner text-sm`}>
                      {getUserInitials()}
                    </div>
                  </button>

                  {/* Mobile Menu Toggle Button */}
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="lg:hidden ml-2 p-2.5 rounded-xl bg-white/10 text-slate-100 hover:text-white hover:bg-white/20 border border-white/20 transition-all"
                  >
                    {showMobileMenu ? <FaTimes size={16} /> : <FaBars size={16} />}
                  </button>

                  {/* User Menu Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl bg-[#1e293b] border border-white/10 py-2 transform transition-all overflow-hidden hidden lg:block z-50">
                      <div className="px-4 py-3 border-b border-white/5 bg-gradient-to-r from-teal-500/10 to-blue-500/10">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor()} rounded-xl flex items-center justify-center text-white font-bold`}>
                            {getUserInitials()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{userData?.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{userData?.email}</p>
                            <p className="text-[8px] text-teal-400 mt-1 uppercase tracking-wider">{getUserRole()}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2 space-y-1">
                        <button 
                          onClick={handleProfileClick} 
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-teal-400 rounded-lg transition-all"
                        >
                          <span>My Profile</span>
                        </button>
                        
                        <button 
                          onClick={handleSettingsClick} 
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-teal-400 rounded-lg transition-all"
                        >
                          <span>{userType === 'admin' ? 'System Settings' : 'Settings'}</span>
                        </button>
                        
                        <button 
                          onClick={handleChatClick} 
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-teal-400 rounded-lg transition-all"
                        >
                          <span>Messages</span>
                        </button>
                        
                        <button 
                          onClick={handleFeedbackClick} 
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-teal-400 rounded-lg transition-all"
                        >
                          <span>Give Feedback</span>
                        </button>
                        
                        <button 
                          onClick={handleHelpClick} 
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-teal-400 rounded-lg transition-all"
                        >
                          <span>Help & Support</span>
                        </button>
                        
                        <div className="h-px bg-white/5 my-1" />
                        
                        <button 
                          onClick={handleLogout} 
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        >
                          <FaSignOutAlt size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                      
                      <div className="px-4 py-2 border-t border-white/5 mt-1">
                        <p className="text-[8px] text-slate-600 text-center">
                          Logged in as {userData?.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setShowMobileMenu(false)}
          />
          
          <div className={`fixed inset-y-0 right-0 w-80 bg-[#064E3B] border-l border-emerald-800 shadow-2xl z-50 transform transition-all duration-300 lg:hidden overflow-y-auto ${
            showMobileMenu ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="flex flex-col h-full">
              
              {/* Mobile Header */}
              <div className="p-6 border-b border-emerald-800">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="relative p-1 bg-white/10 rounded-xl">
                      <img className="h-10 w-10 rounded-lg object-cover" src={Logo} alt="Logo" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-extrabold text-white">
                        Health<span className="text-teal-300">AI</span>
                      </span>
                      <span className="text-[9px] text-teal-200 uppercase font-bold tracking-widest">
                        {getUserTitle()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-100 hover:text-white transition-all"
                  >
                    <FaTimes size={18} />
                  </button>
                </div>
                
                {/* User Info */}
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor()} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                    {getUserInitials()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{userData?.name}</p>
                    <p className="text-[10px] text-slate-300 truncate">{userData?.email}</p>
                    <p className="text-[8px] text-teal-200 mt-1 uppercase tracking-wider">{getUserRole()}</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={onToggleDarkMode}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-100 hover:text-white transition-all text-xs"
                  >
                    {darkMode ? <FaSun className="text-yellow-300" /> : <FaMoon />}
                    <span>{darkMode ? 'Light' : 'Dark'}</span>
                  </button>
                  <button 
                    onClick={() => { 
                      navigate('/chat-system');
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-100 hover:text-white transition-all text-xs"
                  >
                    <span>Chat</span>
                  </button>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                <p className="text-[10px] text-teal-200 uppercase font-bold tracking-wider px-3 mb-2">
                  Main Navigation
                </p>
                {navItems.map((item) => (
                  <MobileNavItem key={item.path} item={item} onClick={handleMobileNavClick} />
                ))}

                {/* Quick Links */}
                <div className="pt-4 mt-4 border-t border-emerald-800">
                  <p className="text-[10px] text-teal-200 uppercase font-bold tracking-wider px-3 mb-2">
                    Quick Links
                  </p>
                  <div className="space-y-1">
                    <button 
                      onClick={handleProfileClick}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-100 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                      <span className="text-sm">My Profile</span>
                    </button>
                    
                    <button 
                      onClick={handleSettingsClick}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-100 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                      <span className="text-sm">{userType === 'admin' ? 'System Settings' : 'Settings'}</span>
                    </button>
                    
                    <button 
                      onClick={handleFeedbackClick}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-100 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                      <span className="text-sm">Feedback</span>
                    </button>
                    
                    <button 
                      onClick={handleHelpClick}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-100 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                      <span className="text-sm">Help & Support</span>
                    </button>
                  </div>
                </div>

                {/* Notifications in Mobile */}
                <div className="pt-4 mt-4 border-t border-emerald-800">
                  <p className="text-[10px] text-teal-200 uppercase font-bold tracking-wider px-3 mb-2">
                    Notifications
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {notifications.slice(0, 3).map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => {
                          handleNotificationClick(notif);
                          setShowMobileMenu(false);
                        }}
                        className="flex items-start gap-3 p-3 bg-white/10 rounded-xl cursor-pointer hover:bg-white/20 transition-all"
                      >
                        <div className="p-1.5 bg-white/10 rounded-lg">
                          {getNotificationIcon(notif.type, notif.priority)}
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs ${!notif.read ? 'text-white font-bold' : 'text-slate-200'}`}>
                            {notif.title}
                          </p>
                          <p className="text-[9px] text-slate-300 mt-1 line-clamp-1">{notif.message}</p>
                          <p className="text-[8px] text-slate-400 mt-1">{notif.time}</p>
                        </div>
                        {!notif.read && (
                          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                        )}
                      </div>
                    ))}
                    
                    {notifications.length > 3 && (
                      <button
                        onClick={() => {
                          handleViewAllNotifications();
                          setShowMobileMenu(false);
                        }}
                        className="w-full text-center text-xs text-teal-300 py-2"
                      >
                        View all {notifications.length} notifications
                      </button>
                    )}
                    
                    {notifications.length === 0 && (
                      <div className="text-center py-4 text-slate-400">
                        <p className="text-xs">No notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Footer */}
              <div className="p-4 border-t border-emerald-800 space-y-3">
                <div className="p-3 bg-white/10 rounded-xl">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-teal-200 font-bold">Status:</p>
                    <p className="text-[9px] text-green-400 bg-green-400/20 px-2 py-0.5 rounded-full">Online</p>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">Last active: Just now</p>
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all text-sm font-bold"
                >
                  <FaSignOutAlt size={14} />
                  Sign Out
                </button>
                
                <div className="text-center">
                  <p className="text-[8px] text-slate-500">HealthAI v2.0 | © 2024</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;