// src/pages/Admin/AdminNotifications.jsx
import React, { useState, useEffect } from 'react';
import {
  FaBell, FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
  FaUserMd, FaUser, FaCalendarAlt, FaCog, FaStar,
  FaFileAlt, FaTrash, FaCheck, FaEye, FaFilter,
  FaSearch, FaEnvelope, FaSms, FaBell as FaBellSolid,
  FaClock, FaHistory, FaBan, FaCheckDouble,
  FaUserPlus, FaUserCheck, FaUserSlash, FaSyringe,
  FaHospital, FaAmbulance, FaHeartbeat, FaPills,
  FaComment, FaFlag, FaShare, FaArchive, FaDownload,
  FaUpload, FaSync, FaEllipsisV, FaEdit, FaPlus,
  FaPaperPlane, FaUsers, FaStethoscope, FaProcedures
} from 'react-icons/fa';
import {
  Bell, CheckCircle, XCircle, AlertTriangle, Users,
  Calendar, Settings, Star, FileText, Trash2, Check,
  Eye, Filter, Search, Mail, MessageSquare, Clock,
  History, Ban, CheckCheck, UserPlus, UserCheck,
  UserX, Syringe, Hospital, Ambulance, Heart,
  Pill, MessageCircle, Flag, Share, Archive,
  Download, Upload, RefreshCw, MoreVertical, Edit,
  Plus, Send, UserCog, Stethoscope, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminNotifications = ({ userType, userData, darkMode }) => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRecipient, setFilterRecipient] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    urgent: 0,
    toDoctors: 0,
    toPatients: 0,
    toAll: 0,
    system: 0
  });
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [availablePatients, setAvailablePatients] = useState([]);

  // New Notification Form
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'system',
    priority: 'normal',
    recipientType: 'all', // 'all', 'doctors', 'patients', 'specific'
    specificRecipients: [],
    expiresAt: '',
    actionUrl: '',
    icon: 'bell',
    targetUsers: [] // Array of user IDs
  });

  // Load doctors and patients from localStorage
  useEffect(() => {
    loadUsers();
    loadNotifications();
  }, []);

  const loadUsers = () => {
    try {
      // Load all users from healthai_users
      const allUsers = JSON.parse(localStorage.getItem('healthai_users') || '[]');
      
      // Separate doctors and patients
      const doctors = allUsers.filter(u => u.userType === 'doctor').map(doc => ({
        id: doc.userId || doc.id,
        name: doc.name,
        email: doc.email,
        specialization: doc.specialization,
        type: 'doctor'
      }));
      
      const patients = allUsers.filter(u => u.userType === 'patient').map(pat => ({
        id: pat.userId || pat.id,
        name: pat.name,
        email: pat.email,
        type: 'patient'
      }));
      
      setAvailableDoctors(doctors);
      setAvailablePatients(patients);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadNotifications = () => {
    setLoading(true);
    
    try {
      // Load existing notifications from localStorage
      const savedNotifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
      
      // If no saved notifications, start with empty array (no sample data)
      if (savedNotifications.length === 0) {
        setNotifications([]);
        calculateStats([]);
        setFilteredNotifications([]);
      } else {
        setNotifications(savedNotifications);
        calculateStats(savedNotifications);
        setFilteredNotifications(savedNotifications);
      }
      
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
    
    setLoading(false);
  };

  const calculateStats = (notifs) => {
    setStats({
      total: notifs.length,
      unread: notifs.filter(n => !n.read).length,
      read: notifs.filter(n => n.read).length,
      urgent: notifs.filter(n => n.priority === 'urgent' && !n.read).length,
      toDoctors: notifs.filter(n => n.recipientType === 'doctors' || n.recipientType === 'specific' && n.targetUsers?.some(u => u.type === 'doctor')).length,
      toPatients: notifs.filter(n => n.recipientType === 'patients' || n.recipientType === 'specific' && n.targetUsers?.some(u => u.type === 'patient')).length,
      toAll: notifs.filter(n => n.recipientType === 'all').length,
      system: notifs.filter(n => n.type === 'system').length
    });
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...notifications];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(n => 
        filterStatus === 'read' ? n.read : !n.read
      );
    }
    
    // Recipient filter
    if (filterRecipient !== 'all') {
      filtered = filtered.filter(n => n.recipientType === filterRecipient);
    }
    
    // Date filter
    if (filterDate !== 'all') {
      const now = new Date();
      const today = now.setHours(0, 0, 0, 0);
      const yesterday = today - 86400000;
      const weekAgo = today - 7 * 86400000;
      
      filtered = filtered.filter(n => {
        const notifDate = new Date(n.timestamp || n.time).getTime();
        
        switch(filterDate) {
          case 'today':
            return notifDate >= today;
          case 'yesterday':
            return notifDate >= yesterday && notifDate < today;
          case 'week':
            return notifDate >= weekAgo;
          default:
            return true;
        }
      });
    }
    
    setFilteredNotifications(filtered);
  }, [searchTerm, filterType, filterStatus, filterRecipient, filterDate, notifications]);

  const handleMarkAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('admin_notifications', JSON.stringify(updatedNotifications));
    calculateStats(updatedNotifications);
    window.dispatchEvent(new Event('notificationUpdate'));
  };

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    localStorage.setItem('admin_notifications', JSON.stringify(updatedNotifications));
    calculateStats(updatedNotifications);
    window.dispatchEvent(new Event('notificationUpdate'));
  };

  const handleDeleteNotification = (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      setNotifications(updatedNotifications);
      localStorage.setItem('admin_notifications', JSON.stringify(updatedNotifications));
      calculateStats(updatedNotifications);
      
      if (selectedNotification?.id === notificationId) {
        setShowNotificationModal(false);
        setSelectedNotification(null);
      }
      
      window.dispatchEvent(new Event('notificationUpdate'));
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm('Are you sure you want to delete ALL notifications?')) {
      setNotifications([]);
      localStorage.setItem('admin_notifications', JSON.stringify([]));
      calculateStats([]);
      window.dispatchEvent(new Event('notificationUpdate'));
    }
  };

  const handleEditNotification = (notification) => {
    setEditingNotification(notification);
    setNewNotification({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      recipientType: notification.recipientType,
      specificRecipients: notification.targetUsers || [],
      expiresAt: notification.expiresAt || '',
      actionUrl: notification.actionUrl || '',
      icon: notification.icon || 'bell',
      targetUsers: notification.targetUsers || []
    });
    setShowCreateModal(true);
  };

  const handleCreateNotification = () => {
    if (!newNotification.title || !newNotification.message) {
      alert('Please enter title and message');
      return;
    }

    // Validate recipients for specific targeting
    if (newNotification.recipientType === 'specific' && newNotification.specificRecipients.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

    const notification = {
      id: editingNotification ? editingNotification.id : `NOT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      ...newNotification,
      time: 'Just now',
      timestamp: new Date().toISOString(),
      read: editingNotification ? editingNotification.read : false,
      icon: getIconForType(newNotification.type),
      createdBy: userData?.name || 'Admin',
      createdAt: new Date().toISOString()
    };

    let updatedNotifications;
    if (editingNotification) {
      // Update existing
      updatedNotifications = notifications.map(n => 
        n.id === editingNotification.id ? notification : n
      );
    } else {
      // Create new
      updatedNotifications = [notification, ...notifications];
    }

    setNotifications(updatedNotifications);
    localStorage.setItem('admin_notifications', JSON.stringify(updatedNotifications));
    calculateStats(updatedNotifications);
    
    setShowCreateModal(false);
    setEditingNotification(null);
    resetForm();
    
    alert(editingNotification ? '✅ Notification updated successfully' : '✅ Notification created successfully');
    window.dispatchEvent(new Event('notificationUpdate'));
  };

  const resetForm = () => {
    setNewNotification({
      title: '',
      message: '',
      type: 'system',
      priority: 'normal',
      recipientType: 'all',
      specificRecipients: [],
      expiresAt: '',
      actionUrl: '',
      icon: 'bell',
      targetUsers: []
    });
  };

  const handleRecipientTypeChange = (type) => {
    setNewNotification({
      ...newNotification,
      recipientType: type,
      specificRecipients: type === 'specific' ? [] : newNotification.specificRecipients
    });
  };

  const handleToggleRecipient = (user) => {
    const current = [...newNotification.specificRecipients];
    const exists = current.some(u => u.id === user.id);
    
    if (exists) {
      setNewNotification({
        ...newNotification,
        specificRecipients: current.filter(u => u.id !== user.id)
      });
    } else {
      setNewNotification({
        ...newNotification,
        specificRecipients: [...current, user]
      });
    }
  };

  const getIconForType = (type) => {
    switch(type) {
      case 'doctor': return 'user-md';
      case 'patient': return 'user';
      case 'appointment': return 'calendar';
      case 'system': return 'cog';
      case 'feedback': return 'star';
      case 'sos': return 'ambulance';
      case 'payment': return 'money';
      case 'inventory': return 'pills';
      default: return 'bell';
    }
  };

  const getNotificationIcon = (type, priority) => {
    const iconClass = priority === 'urgent' ? 'text-red-500' : 
                     priority === 'high' ? 'text-orange-500' : 
                     'text-teal-500';
    
    switch(type) {
      case 'doctor':
        return <FaUserMd className={iconClass} size={20} />;
      case 'patient':
      case 'feedback':
        return <FaUser className={iconClass} size={20} />;
      case 'appointment':
        return <FaCalendarAlt className={iconClass} size={20} />;
      case 'system':
        return <FaCog className={iconClass} size={20} />;
      case 'sos':
        return <FaAmbulance className="text-red-500" size={20} />;
      case 'payment':
        return <FaCheckCircle className="text-green-500" size={20} />;
      case 'inventory':
        return <FaPills className="text-purple-500" size={20} />;
      default:
        return <FaBell className={iconClass} size={20} />;
    }
  };

  const getRecipientBadge = (recipientType, targetUsers) => {
    switch(recipientType) {
      case 'all':
        return <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-[9px] font-black">ALL USERS</span>;
      case 'doctors':
        return <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-[9px] font-black">DOCTORS ONLY</span>;
      case 'patients':
        return <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-[9px] font-black">PATIENTS ONLY</span>;
      case 'specific':
        return <span className="px-2 py-1 bg-amber-100 text-amber-600 rounded-full text-[9px] font-black">
          {targetUsers?.length || 0} SPECIFIC
        </span>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'urgent':
        return <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-[9px] font-black flex items-center gap-1">
          <FaExclamationTriangle size={8} /> URGENT
        </span>;
      case 'high':
        return <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-[9px] font-black">HIGH</span>;
      case 'medium':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-[9px] font-black">MEDIUM</span>;
      default:
        return <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-[9px] font-black">NORMAL</span>;
    }
  };

  const formatTime = (timestamp) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-slate-600 font-bold">Loading Notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-[#f8fafc]'}`}>
      
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-b-3xl mb-8`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
                <FaBell className="text-teal-500" />
                Notification <span className="text-teal-500">Center</span>
              </h1>
              <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                Create and manage notifications for doctors and patients
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingNotification(null);
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="px-4 py-2 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-600 transition-all flex items-center gap-2"
              >
                <FaPlus size={16} />
                NEW NOTIFICATION
              </button>
              
              <button
                onClick={loadNotifications}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all flex items-center gap-2"
              >
                <FaSync size={16} />
                REFRESH
              </button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-8">
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-teal-50'}`}>
              <p className="text-xs text-teal-600 font-black">TOTAL</p>
              <p className="text-xl font-black">{stats.total}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-amber-50'}`}>
              <p className="text-xs text-amber-600 font-black">UNREAD</p>
              <p className="text-xl font-black">{stats.unread}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <p className="text-xs text-green-600 font-black">READ</p>
              <p className="text-xl font-black">{stats.read}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
              <p className="text-xs text-red-600 font-black">URGENT</p>
              <p className="text-xl font-black">{stats.urgent}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className="text-xs text-blue-600 font-black">TO DOCTORS</p>
              <p className="text-xl font-black">{stats.toDoctors}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <p className="text-xs text-green-600 font-black">TO PATIENTS</p>
              <p className="text-xl font-black">{stats.toPatients}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <p className="text-xs text-purple-600 font-black">TO ALL</p>
              <p className="text-xl font-black">{stats.toAll}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}>
              <p className="text-xs text-indigo-600 font-black">SYSTEM</p>
              <p className="text-xl font-black">{stats.system}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 outline-none ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white'
              }`}
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 outline-none ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white'
              }`}
            >
              <option value="all">All Types</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
              <option value="appointment">Appointment</option>
              <option value="system">System</option>
              <option value="feedback">Feedback</option>
            </select>
            
            <select
              value={filterRecipient}
              onChange={(e) => setFilterRecipient(e.target.value)}
              className={`px-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 outline-none ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white'
              }`}
            >
              <option value="all">All Recipients</option>
              <option value="doctors">Doctors Only</option>
              <option value="patients">Patients Only</option>
              <option value="all">All Users</option>
              <option value="specific">Specific Users</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 outline-none ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white'
              }`}
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
            
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className={`px-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 outline-none ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white'
              }`}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
            </select>
            
            <button className="p-4 bg-teal-500 text-white rounded-2xl hover:bg-teal-600 transition-all">
              <FaFilter size={16} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all flex items-center gap-2"
            >
              <FaCheckDouble size={14} />
              MARK ALL READ
            </button>
            
            <button
              onClick={handleDeleteAll}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all flex items-center gap-2"
            >
              <FaTrash size={14} />
              DELETE ALL
            </button>
          </div>
          
          <p className="text-sm text-slate-500">
            Showing {filteredNotifications.length} of {notifications.length}
          </p>
        </div>

        {/* Notifications Grid */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                className={`relative rounded-2xl border transition-all cursor-pointer ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                    : 'bg-white border-slate-100 hover:shadow-lg'
                } ${!notification.read ? (darkMode ? 'border-l-4 border-l-teal-500' : 'border-l-4 border-l-teal-500') : ''}`}
                onClick={() => {
                  setSelectedNotification(notification);
                  setShowNotificationModal(true);
                  if (!notification.read) {
                    handleMarkAsRead(notification.id);
                  }
                }}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl ${
                      !notification.read 
                        ? 'bg-teal-100' 
                        : darkMode ? 'bg-gray-700' : 'bg-slate-100'
                    }`}>
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-black text-lg ${!notification.read ? 'text-teal-600' : ''}`}>
                            {notification.title}
                            {!notification.read && (
                              <span className="ml-2 inline-block w-2 h-2 bg-teal-500 rounded-full"></span>
                            )}
                          </h3>
                          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {getRecipientBadge(notification.recipientType, notification.targetUsers)}
                          {getPriorityBadge(notification.priority)}
                          
                          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatTime(notification.timestamp)}
                          </span>
                          
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditNotification(notification);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Edit"
                            >
                              <FaEdit size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Recipient Info */}
                      {notification.recipientType === 'specific' && notification.targetUsers && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {notification.targetUsers.slice(0, 3).map(user => (
                            <span
                              key={user.id}
                              className={`text-[8px] px-2 py-1 rounded-full ${
                                user.type === 'doctor' 
                                  ? 'bg-blue-100 text-blue-600' 
                                  : 'bg-green-100 text-green-600'
                              }`}
                            >
                              {user.type === 'doctor' ? <FaUserMd size={8} className="inline mr-1" /> : <FaUser size={8} className="inline mr-1" />}
                              {user.name}
                            </span>
                          ))}
                          {notification.targetUsers.length > 3 && (
                            <span className="text-[8px] text-slate-400">
                              +{notification.targetUsers.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20">
              <FaBell className="text-6xl text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-slate-400">No Notifications</h3>
              <p className="text-slate-400">Click "New Notification" to create one</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Notification Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`max-w-3xl w-full rounded-2xl shadow-2xl overflow-hidden ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`p-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white`}>
                <h2 className="text-2xl font-black">
                  {editingNotification ? 'Edit Notification' : 'Create New Notification'}
                </h2>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="block text-sm font-bold mb-2">Title *</label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-teal-500 outline-none ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    placeholder="e.g., System Maintenance"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-bold mb-2">Message *</label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                    rows="3"
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-teal-500 outline-none ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    placeholder="Notification message..."
                  />
                </div>

                {/* Type and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Type</label>
                    <select
                      value={newNotification.type}
                      onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-teal-500 outline-none ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="system">System</option>
                      <option value="doctor">Doctor Related</option>
                      <option value="patient">Patient Related</option>
                      <option value="appointment">Appointment</option>
                      <option value="feedback">Feedback</option>
                      <option value="payment">Payment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Priority</label>
                    <select
                      value={newNotification.priority}
                      onChange={(e) => setNewNotification({...newNotification, priority: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-teal-500 outline-none ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="normal">Normal</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Recipient Type */}
                <div>
                  <label className="block text-sm font-bold mb-2">Send To</label>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRecipientTypeChange('all')}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        newNotification.recipientType === 'all'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      <FaUsers className="mx-auto mb-1" size={20} />
                      <span className="text-xs font-bold">All Users</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleRecipientTypeChange('doctors')}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        newNotification.recipientType === 'doctors'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      <FaUserMd className="mx-auto mb-1" size={20} />
                      <span className="text-xs font-bold">Doctors Only</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleRecipientTypeChange('patients')}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        newNotification.recipientType === 'patients'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      <FaUser className="mx-auto mb-1" size={20} />
                      <span className="text-xs font-bold">Patients Only</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleRecipientTypeChange('specific')}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        newNotification.recipientType === 'specific'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      <FaUserCheck className="mx-auto mb-1" size={20} />
                      <span className="text-xs font-bold">Specific</span>
                    </button>
                  </div>
                </div>

                {/* Specific Recipients Selection */}
                {newNotification.recipientType === 'specific' && (
                  <div>
                    <label className="block text-sm font-bold mb-2">Select Recipients</label>
                    
                    {/* Doctors Section */}
                    {availableDoctors.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                          <FaUserMd className="text-blue-500" /> Doctors ({availableDoctors.length})
                        </h4>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-xl">
                          {availableDoctors.map(doctor => (
                            <label
                              key={doctor.id}
                              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={newNotification.specificRecipients.some(u => u.id === doctor.id)}
                                onChange={() => handleToggleRecipient(doctor)}
                                className="rounded text-teal-600"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{doctor.name}</p>
                                <p className="text-xs opacity-60 truncate">{doctor.specialization}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Patients Section */}
                    {availablePatients.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                          <FaUser className="text-green-500" /> Patients ({availablePatients.length})
                        </h4>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-xl">
                          {availablePatients.map(patient => (
                            <label
                              key={patient.id}
                              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={newNotification.specificRecipients.some(u => u.id === patient.id)}
                                onChange={() => handleToggleRecipient(patient)}
                                className="rounded text-teal-600"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{patient.name}</p>
                                <p className="text-xs opacity-60 truncate">{patient.email}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {newNotification.specificRecipients.length > 0 && (
                      <p className="text-xs text-teal-600 mt-2">
                        Selected: {newNotification.specificRecipients.length} recipient(s)
                      </p>
                    )}
                  </div>
                )}

                {/* Action URL */}
                <div>
                  <label className="block text-sm font-bold mb-2">Action URL (optional)</label>
                  <input
                    type="text"
                    value={newNotification.actionUrl}
                    onChange={(e) => setNewNotification({...newNotification, actionUrl: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-teal-500 outline-none ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    placeholder="/admin/doctors"
                  />
                </div>

                {/* Expiry */}
                <div>
                  <label className="block text-sm font-bold mb-2">Expires At (optional)</label>
                  <input
                    type="datetime-local"
                    value={newNotification.expiresAt}
                    onChange={(e) => setNewNotification({...newNotification, expiresAt: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-teal-500 outline-none ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-slate-200'} flex justify-end gap-3`}>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingNotification(null);
                    resetForm();
                  }}
                  className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 transition-all font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNotification}
                  className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all font-bold text-sm flex items-center gap-2"
                >
                  <FaPaperPlane size={14} />
                  {editingNotification ? 'Update Notification' : 'Send Notification'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {showNotificationModal && selectedNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowNotificationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`p-6 bg-gradient-to-r ${
                selectedNotification.priority === 'urgent' 
                  ? 'from-red-500 to-red-600' 
                  : selectedNotification.priority === 'high'
                  ? 'from-orange-500 to-orange-600'
                  : 'from-teal-500 to-teal-600'
              } text-white`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black">Notification Details</h2>
                    <p className="opacity-90">ID: {selectedNotification.id}</p>
                  </div>
                  <button 
                    onClick={() => setShowNotificationModal(false)}
                    className="text-white/60 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {getRecipientBadge(selectedNotification.recipientType, selectedNotification.targetUsers)}
                  {getPriorityBadge(selectedNotification.priority)}
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedNotification.type?.toUpperCase()}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-xl font-black mb-2">{selectedNotification.title}</h3>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedNotification.message}
                  </p>
                </div>

                {/* Time */}
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                  <p className="text-xs text-slate-400 mb-1">Sent</p>
                  <p className="font-bold">{new Date(selectedNotification.timestamp).toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatTime(selectedNotification.timestamp)}</p>
                </div>

                {/* Recipients */}
                {selectedNotification.recipientType === 'specific' && selectedNotification.targetUsers && (
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <p className="text-xs text-slate-400 mb-2">Sent to ({selectedNotification.targetUsers.length} recipients)</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedNotification.targetUsers.map(user => (
                        <div key={user.id} className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                          {user.type === 'doctor' 
                            ? <FaUserMd className="text-blue-500" size={12} />
                            : <FaUser className="text-green-500" size={12} />
                          }
                          <span className="text-sm font-medium">{user.name}</span>
                          <span className="text-xs opacity-60 ml-auto">{user.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action URL */}
                {selectedNotification.actionUrl && (
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                    <p className="text-xs text-slate-400 mb-1">Action URL</p>
                    <p className="font-mono text-sm break-all">{selectedNotification.actionUrl}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-slate-200'} flex justify-end gap-3`}>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 transition-all font-bold text-sm"
                >
                  Close
                </button>
                
                <button
                  onClick={() => {
                    handleEditNotification(selectedNotification);
                    setShowNotificationModal(false);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-sm flex items-center gap-2"
                >
                  <FaEdit size={14} />
                  Edit
                </button>
                
                {!selectedNotification.read && (
                  <button
                    onClick={() => {
                      handleMarkAsRead(selectedNotification.id);
                      setShowNotificationModal(false);
                    }}
                    className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all font-bold text-sm flex items-center gap-2"
                  >
                    <FaCheck size={14} />
                    Mark Read
                  </button>
                )}
                
                <button
                  onClick={() => {
                    handleDeleteNotification(selectedNotification.id);
                    setShowNotificationModal(false);
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold text-sm flex items-center gap-2"
                >
                  <FaTrash size={14} />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminNotifications;