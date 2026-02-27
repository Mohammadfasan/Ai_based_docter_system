// src/pages/Admin/AdminSettings.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaSun, FaMoon, FaBell, FaLock, FaGlobe, FaDatabase,
  FaUserShield, FaHistory, FaEnvelope, FaPhone, FaVideo,
  FaMapMarkerAlt, FaMoneyBillWave, FaPercentage, FaClock,
  FaShieldAlt, FaServer, FaCloud, FaMobile, FaLaptop,
  FaCheck, FaTimes, FaSave, FaUndo, FaKey, FaUserCog,
  FaRobot, FaChartLine, FaFileAlt, FaUsers, FaUserMd,
  FaCalendarAlt, FaCreditCard, FaLanguage, FaPalette,
  FaWifi, FaSync, FaDownload, FaUpload, FaTrash,
  FaExclamationTriangle, FaCheckCircle, FaQuestionCircle,
  FaCog, FaSlidersH, FaEye, FaEyeSlash, FaToggleOn,
  FaToggleOff, FaRegBell, FaRegEnvelope, FaRegClock,
  FaRegSave, FaRegTrashAlt, FaBug
} from 'react-icons/fa';
import { 
  Activity, AlertCircle, Shield, Users, Settings,
  Bell, Lock, Globe, Database, Mail, Phone,
  Video, MapPin, DollarSign, Percent, Clock,
  Server, Cloud, Smartphone, Laptop, Save,
  RefreshCw, Download, Upload, Trash2, Eye,
  EyeOff, ToggleLeft, ToggleRight, ChevronRight,
  Check, X, HelpCircle, UserCheck, Calendar,
  CreditCard, Languages, Palette, Wifi, LogOut,
  Key, UserCog, Bot, TrendingUp, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSettings = ({ userData, darkMode, onToggleDarkMode }) => {
  // ========== STATE MANAGEMENT ==========
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [showPassword, setShowPassword] = useState({});

  // ========== SETTINGS STATE ==========
  const [settings, setSettings] = useState({
    // General Settings
    general: {
      siteName: 'HealthAI',
      siteUrl: 'https://healthai.com',
      adminEmail: 'admin@healthai.com',
      supportEmail: 'support@healthai.com',
      contactPhone: '+94 77 123 4567',
      address: 'Colombo, Sri Lanka',
      timezone: 'Asia/Colombo',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      language: 'English',
      maintenanceMode: false,
      debugMode: false
    },

    // Appearance Settings
    appearance: {
      theme: darkMode ? 'dark' : 'light',
      primaryColor: '#14b8a6',
      sidebarColor: '#1e293b',
      headerColor: '#0f172a',
      fontSize: 'medium',
      borderRadius: 'rounded',
      animations: true,
      compactMode: false,
      showAvatars: true,
      showGradients: true
    },

    // Notification Settings
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      appointmentReminders: true,
      newUserAlerts: true,
      doctorApprovals: true,
      sosAlerts: true,
      systemAlerts: true,
      feedbackAlerts: true,
      reportAlerts: false,
      dailyDigest: true,
      weeklyReport: true
    },

    // Security Settings
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordExpiry: 90,
      requireStrongPassword: true,
      ipWhitelisting: false,
      sslEnabled: true,
      firewallEnabled: true,
      backupEncryption: true,
      auditLogging: true,
      rateLimiting: true,
      captchaEnabled: true
    },

    // System Settings
    system: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupTime: '02:00',
      backupRetention: 30,
      logRetention: 90,
      cacheEnabled: true,
      cacheDuration: 3600,
      apiRateLimit: 1000,
      maxUploadSize: 10,
      allowedFileTypes: ['jpg', 'png', 'pdf', 'doc'],
      sessionStorage: 'database',
      errorReporting: true
    },

    // User Management Settings
    userManagement: {
      allowRegistration: true,
      requireEmailVerification: true,
      requireAdminApproval: false,
      defaultUserRole: 'patient',
      allowSocialLogin: true,
      allowGoogleLogin: true,
      allowFacebookLogin: false,
      allowGithubLogin: false,
      registrationEmailDomain: '',
      maxUsersPerIp: 5,
      userSessionTimeout: 60,
      enableUserDeletion: false
    },

    // Appointment Settings
    appointment: {
      allowVideoConsult: true,
      allowClinicVisit: true,
      maxAdvanceBooking: 30,
      minAdvanceBooking: 1,
      bookingTimeGap: 30,
      cancellationPolicy: 24,
      autoConfirm: false,
      reminderTime: 24,
      maxAppointmentsPerDay: 100,
      consultationFee: 2500,
      enablePayment: true,
      paymentGateway: 'stripe'
    },

    // Doctor Settings
    doctor: {
      requireVerification: true,
      allowSelfRegistration: true,
      maxPatientsPerDay: 20,
      autoApproveSlots: false,
      enableRating: true,
      enableFeedback: true,
      showExperience: true,
      showQualifications: true,
      showLanguages: true,
      showHospital: true,
      minConsultationTime: 15,
      maxConsultationTime: 60
    },

    // Medical Records Settings
    medicalRecords: {
      enableUpload: true,
      maxFileSize: 10,
      allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'xls'],
      enableEncryption: true,
      enableSharing: true,
      enableDownload: true,
      requireConsent: true,
      retentionPeriod: 365,
      autoDelete: false
    },

    // Payment Settings
    payment: {
      currency: 'LKR',
      taxRate: 0,
      enableTax: false,
      enableDiscount: true,
      enableRefunds: true,
      refundPeriod: 7,
      minPaymentAmount: 100,
      maxPaymentAmount: 100000,
      enablePartialPayment: false,
      enableSubscription: false,
      paymentMethods: ['card', 'cash']
    },

    // Integration Settings
    integrations: {
      enableAI: true,
      enableChat: true,
      enableSMS: false,
      enableEmail: true,
      enableWhatsApp: false,
      enableTelegram: false,
      enableSlack: false,
      googleAnalytics: '',
      facebookPixel: '',
      customCSS: '',
      customJS: ''
    },

    // Backup & Maintenance
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupTime: '03:00',
      backupLocation: 'local',
      cloudBackup: false,
      backupRetention: 30,
      includeDatabase: true,
      includeFiles: true,
      includeLogs: false,
      compressBackup: true,
      encryptBackup: true
    },

    // Audit & Logs
    audit: {
      enableAuditLog: true,
      logLevel: 'info',
      logRetention: 90,
      logUserActions: true,
      logAdminActions: true,
      logSystemEvents: true,
      logErrors: true,
      logWarnings: true,
      logInfo: false,
      logDebug: false,
      emailOnError: true,
      emailOnWarning: false
    }
  });

  // ========== LOAD SAVED SETTINGS ==========
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    setLoading(true);
    try {
      const savedSettings = JSON.parse(localStorage.getItem('admin_settings') || '{}');
      if (savedSettings && Object.keys(savedSettings).length > 0) {
        setSettings(prev => ({
          ...prev,
          ...savedSettings
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    setLoading(false);
  };

  // ========== SAVE SETTINGS ==========
  const handleSaveSettings = () => {
    setLoading(true);
    try {
      localStorage.setItem('admin_settings', JSON.stringify(settings));
      
      if (settings.appearance.theme !== (darkMode ? 'dark' : 'light')) {
        onToggleDarkMode?.();
      }

      setSuccessMessage('Settings saved successfully!');
      setShowSuccess(true);
      setIsDirty(false);
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setErrorMessage('Failed to save settings');
      setTimeout(() => setErrorMessage(''), 3000);
    }
    setLoading(false);
  };

  // ========== RESET SETTINGS ==========
  const handleResetSettings = () => {
    setConfirmAction({
      title: 'Reset Settings',
      message: 'Are you sure you want to reset all settings to default? This action cannot be undone.',
      onConfirm: () => {
        const defaultSettings = {
          general: {
            siteName: 'HealthAI',
            siteUrl: 'https://healthai.com',
            adminEmail: 'admin@healthai.com',
            supportEmail: 'support@healthai.com',
            contactPhone: '+94 77 123 4567',
            address: 'Colombo, Sri Lanka',
            timezone: 'Asia/Colombo',
            dateFormat: 'YYYY-MM-DD',
            timeFormat: '24h',
            language: 'English',
            maintenanceMode: false,
            debugMode: false
          },
          appearance: {
            theme: darkMode ? 'dark' : 'light',
            primaryColor: '#14b8a6',
            sidebarColor: '#1e293b',
            headerColor: '#0f172a',
            fontSize: 'medium',
            borderRadius: 'rounded',
            animations: true,
            compactMode: false,
            showAvatars: true,
            showGradients: true
          },
          notifications: {
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
            appointmentReminders: true,
            newUserAlerts: true,
            doctorApprovals: true,
            sosAlerts: true,
            systemAlerts: true,
            feedbackAlerts: true,
            reportAlerts: false,
            dailyDigest: true,
            weeklyReport: true
          },
          security: {
            twoFactorAuth: false,
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            passwordExpiry: 90,
            requireStrongPassword: true,
            ipWhitelisting: false,
            sslEnabled: true,
            firewallEnabled: true,
            backupEncryption: true,
            auditLogging: true,
            rateLimiting: true,
            captchaEnabled: true
          },
          system: {
            autoBackup: true,
            backupFrequency: 'daily',
            backupTime: '02:00',
            backupRetention: 30,
            logRetention: 90,
            cacheEnabled: true,
            cacheDuration: 3600,
            apiRateLimit: 1000,
            maxUploadSize: 10,
            allowedFileTypes: ['jpg', 'png', 'pdf', 'doc'],
            sessionStorage: 'database',
            errorReporting: true
          },
          userManagement: {
            allowRegistration: true,
            requireEmailVerification: true,
            requireAdminApproval: false,
            defaultUserRole: 'patient',
            allowSocialLogin: true,
            allowGoogleLogin: true,
            allowFacebookLogin: false,
            allowGithubLogin: false,
            registrationEmailDomain: '',
            maxUsersPerIp: 5,
            userSessionTimeout: 60,
            enableUserDeletion: false
          },
          appointment: {
            allowVideoConsult: true,
            allowClinicVisit: true,
            maxAdvanceBooking: 30,
            minAdvanceBooking: 1,
            bookingTimeGap: 30,
            cancellationPolicy: 24,
            autoConfirm: false,
            reminderTime: 24,
            maxAppointmentsPerDay: 100,
            consultationFee: 2500,
            enablePayment: true,
            paymentGateway: 'stripe'
          },
          doctor: {
            requireVerification: true,
            allowSelfRegistration: true,
            maxPatientsPerDay: 20,
            autoApproveSlots: false,
            enableRating: true,
            enableFeedback: true,
            showExperience: true,
            showQualifications: true,
            showLanguages: true,
            showHospital: true,
            minConsultationTime: 15,
            maxConsultationTime: 60
          },
          medicalRecords: {
            enableUpload: true,
            maxFileSize: 10,
            allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'xls'],
            enableEncryption: true,
            enableSharing: true,
            enableDownload: true,
            requireConsent: true,
            retentionPeriod: 365,
            autoDelete: false
          },
          payment: {
            currency: 'LKR',
            taxRate: 0,
            enableTax: false,
            enableDiscount: true,
            enableRefunds: true,
            refundPeriod: 7,
            minPaymentAmount: 100,
            maxPaymentAmount: 100000,
            enablePartialPayment: false,
            enableSubscription: false,
            paymentMethods: ['card', 'cash']
          },
          integrations: {
            enableAI: true,
            enableChat: true,
            enableSMS: false,
            enableEmail: true,
            enableWhatsApp: false,
            enableTelegram: false,
            enableSlack: false,
            googleAnalytics: '',
            facebookPixel: '',
            customCSS: '',
            customJS: ''
          },
          backup: {
            autoBackup: true,
            backupFrequency: 'daily',
            backupTime: '03:00',
            backupLocation: 'local',
            cloudBackup: false,
            backupRetention: 30,
            includeDatabase: true,
            includeFiles: true,
            includeLogs: false,
            compressBackup: true,
            encryptBackup: true
          },
          audit: {
            enableAuditLog: true,
            logLevel: 'info',
            logRetention: 90,
            logUserActions: true,
            logAdminActions: true,
            logSystemEvents: true,
            logErrors: true,
            logWarnings: true,
            logInfo: false,
            logDebug: false,
            emailOnError: true,
            emailOnWarning: false
          }
        };
        setSettings(defaultSettings);
        localStorage.setItem('admin_settings', JSON.stringify(defaultSettings));
        setSuccessMessage('Settings reset to default');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  // ========== EXPORT/IMPORT SETTINGS ==========
  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `healthai_settings_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setSuccessMessage('Settings exported successfully');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target.result);
        setSettings(importedSettings);
        localStorage.setItem('admin_settings', JSON.stringify(importedSettings));
        setSuccessMessage('Settings imported successfully');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        setErrorMessage('Invalid settings file');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // ========== CLEAR CACHE ==========
  const handleClearCache = () => {
    setConfirmAction({
      title: 'Clear Cache',
      message: 'Are you sure you want to clear all system cache? This may temporarily slow down the system.',
      onConfirm: () => {
        localStorage.removeItem('appointments_cache');
        localStorage.removeItem('users_cache');
        localStorage.removeItem('doctors_cache');
        
        setSuccessMessage('Cache cleared successfully');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  // ========== RUN BACKUP ==========
  const handleRunBackup = () => {
    setLoading(true);
    setTimeout(() => {
      const backup = {
        timestamp: new Date().toISOString(),
        settings: settings,
        users: JSON.parse(localStorage.getItem('healthai_users') || '[]'),
        doctors: JSON.parse(localStorage.getItem('healthai_doctors') || '[]'),
        appointments: JSON.parse(localStorage.getItem('appointments') || '[]'),
        prescriptions: JSON.parse(localStorage.getItem('prescriptions') || '[]')
      };
      
      const dataStr = JSON.stringify(backup, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `healthai_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setSuccessMessage('Backup completed successfully');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setLoading(false);
    }, 2000);
  };

  // ========== UPDATE SETTING ==========
  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setIsDirty(true);
  };

  // ========== RENDER INPUT FIELDS ==========
  const renderInput = (category, key, value, type = 'text') => {
    const settingKey = `${category}.${key}`;
    
    if (type === 'boolean') {
      return (
        <button
          onClick={() => updateSetting(category, key, !value)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
            value ? 'bg-teal-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              value ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      );
    }
    
    if (type === 'select') {
      return (
        <select
          value={value}
          onChange={(e) => updateSetting(category, key, e.target.value)}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
        >
          {Array.isArray(key) ? key.map(option => (
            <option key={option} value={option}>{option}</option>
          )) : (
            <>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </>
          )}
        </select>
      );
    }
    
    if (type === 'color') {
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value}
            onChange={(e) => updateSetting(category, key, e.target.value)}
            className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => updateSetting(category, key, e.target.value)}
            className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          />
        </div>
      );
    }
    
    if (type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => updateSetting(category, key, e.target.value)}
          rows="3"
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
        />
      );
    }
    
    if (type === 'password') {
      return (
        <div className="relative">
          <input
            type={showPassword[settingKey] ? 'text' : 'password'}
            value={value}
            onChange={(e) => updateSetting(category, key, e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none pr-10"
          />
          <button
            onClick={() => setShowPassword(prev => ({ ...prev, [settingKey]: !prev[settingKey] }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword[settingKey] ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
          </button>
        </div>
      );
    }
    
    return (
      <input
        type={type}
        value={value}
        onChange={(e) => updateSetting(category, key, e.target.value)}
        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
      />
    );
  };

  // ========== SETTINGS SECTIONS ==========
  const settingsSections = [
    {
      id: 'general',
      name: 'General',
      icon: <FaCog className="text-teal-500" />,
      description: 'Basic system settings and information'
    },
    {
      id: 'appearance',
      name: 'Appearance',
      icon: <FaPalette className="text-purple-500" />,
      description: 'Theme, colors and visual settings'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: <FaBell className="text-amber-500" />,
      description: 'Email, push and SMS notification settings'
    },
    {
      id: 'security',
      name: 'Security',
      icon: <FaLock className="text-red-500" />,
      description: 'Authentication and security settings'
    },
    {
      id: 'system',
      name: 'System',
      icon: <FaServer className="text-blue-500" />,
      description: 'System performance and maintenance'
    },
    {
      id: 'userManagement',
      name: 'User Management',
      icon: <FaUsers className="text-green-500" />,
      description: 'User registration and permissions'
    },
    {
      id: 'appointment',
      name: 'Appointments',
      icon: <FaCalendarAlt className="text-indigo-500" />,
      description: 'Booking and consultation settings'
    },
    {
      id: 'doctor',
      name: 'Doctors',
      icon: <FaUserMd className="text-cyan-500" />,
      description: 'Doctor verification and settings'
    },
    {
      id: 'medicalRecords',
      name: 'Medical Records',
      icon: <FaFileAlt className="text-emerald-500" />,
      description: 'Record upload and storage settings'
    },
    {
      id: 'payment',
      name: 'Payments',
      icon: <FaMoneyBillWave className="text-yellow-500" />,
      description: 'Payment gateway and billing settings'
    },
    {
      id: 'integrations',
      name: 'Integrations',
      icon: <FaCloud className="text-sky-500" />,
      description: 'Third-party service integrations'
    },
    {
      id: 'backup',
      name: 'Backup',
      icon: <FaDatabase className="text-rose-500" />,
      description: 'Backup and restore settings'
    },
    {
      id: 'audit',
      name: 'Audit',
      icon: <FaHistory className="text-orange-500" />,
      description: 'Logging and audit trail settings'
    }
  ];

  // ========== RENDER SETTINGS SECTION ==========
  const renderSettingsSection = (sectionId) => {
    const section = settings[sectionId];
    if (!section) return null;

    switch(sectionId) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                {renderInput('general', 'siteName', section.siteName)}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
                {renderInput('general', 'siteUrl', section.siteUrl)}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                {renderInput('general', 'adminEmail', section.adminEmail, 'email')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                {renderInput('general', 'supportEmail', section.supportEmail, 'email')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                {renderInput('general', 'contactPhone', section.contactPhone, 'tel')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                {renderInput('general', 'address', section.address)}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                  value={section.timezone}
                  onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Asia/Colombo">Asia/Colombo (GMT+5:30)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                  <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={section.language}
                  onChange={(e) => updateSetting('general', 'language', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                >
                  <option value="English">English</option>
                  <option value="Sinhala">Sinhala</option>
                  <option value="Tamil">Tamil</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                <select
                  value={section.dateFormat}
                  onChange={(e) => updateSetting('general', 'dateFormat', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                >
                  <option value="YYYY-MM-DD">2024-01-31</option>
                  <option value="DD/MM/YYYY">31/01/2024</option>
                  <option value="MM/DD/YYYY">01/31/2024</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                <select
                  value={section.timeFormat}
                  onChange={(e) => updateSetting('general', 'timeFormat', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                >
                  <option value="24h">24 Hours (14:30)</option>
                  <option value="12h">12 Hours (2:30 PM)</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="text-amber-600" />
                <div>
                  <p className="font-bold text-amber-800">Maintenance Mode</p>
                  <p className="text-xs text-amber-600">Users cannot access the system</p>
                </div>
              </div>
              {renderInput('general', 'maintenanceMode', section.maintenanceMode, 'boolean')}
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center gap-3">
                <FaBug className="text-red-600" />
                <div>
                  <p className="font-bold text-red-800">Debug Mode</p>
                  <p className="text-xs text-red-600">Enable for troubleshooting only</p>
                </div>
              </div>
              {renderInput('general', 'debugMode', section.debugMode, 'boolean')}
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      updateSetting('appearance', 'theme', 'light');
                      if (darkMode) onToggleDarkMode?.();
                    }}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      section.theme === 'light' && !darkMode
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-teal-300'
                    }`}
                  >
                    <FaSun className={`mx-auto mb-2 text-2xl ${!darkMode ? 'text-yellow-500' : 'text-gray-400'}`} />
                    <span className="block text-sm font-medium">Light Mode</span>
                  </button>
                  <button
                    onClick={() => {
                      updateSetting('appearance', 'theme', 'dark');
                      if (!darkMode) onToggleDarkMode?.();
                    }}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      section.theme === 'dark' && darkMode
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-teal-300'
                    }`}
                  >
                    <FaMoon className={`mx-auto mb-2 text-2xl ${darkMode ? 'text-indigo-500' : 'text-gray-400'}`} />
                    <span className="block text-sm font-medium">Dark Mode</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                {renderInput('appearance', 'primaryColor', section.primaryColor, 'color')}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sidebar Color</label>
                {renderInput('appearance', 'sidebarColor', section.sidebarColor, 'color')}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Header Color</label>
                {renderInput('appearance', 'headerColor', section.headerColor, 'color')}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                <select
                  value={section.fontSize}
                  onChange={(e) => updateSetting('appearance', 'fontSize', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
                <select
                  value={section.borderRadius}
                  onChange={(e) => updateSetting('appearance', 'borderRadius', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                >
                  <option value="rounded">Rounded</option>
                  <option value="rounded-lg">More Rounded</option>
                  <option value="rounded-xl">Extra Rounded</option>
                  <option value="rounded-2xl">Super Rounded</option>
                  <option value="rounded-full">Pill</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="font-medium">Enable Animations</span>
                {renderInput('appearance', 'animations', section.animations, 'boolean')}
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="font-medium">Compact Mode</span>
                {renderInput('appearance', 'compactMode', section.compactMode, 'boolean')}
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="font-medium">Show Avatars</span>
                {renderInput('appearance', 'showAvatars', section.showAvatars, 'boolean')}
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="font-medium">Show Gradients</span>
                {renderInput('appearance', 'showGradients', section.showGradients, 'boolean')}
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-xs text-gray-500">Receive emails for alerts</p>
                </div>
                {renderInput('notifications', 'emailNotifications', section.emailNotifications, 'boolean')}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-xs text-gray-500">Browser push alerts</p>
                </div>
                {renderInput('notifications', 'pushNotifications', section.pushNotifications, 'boolean')}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-xs text-gray-500">Text message alerts</p>
                </div>
                {renderInput('notifications', 'smsNotifications', section.smsNotifications, 'boolean')}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">Appointment Reminders</p>
                  <p className="text-xs text-gray-500">Remind patients</p>
                </div>
                {renderInput('notifications', 'appointmentReminders', section.appointmentReminders, 'boolean')}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">New User Alerts</p>
                  <p className="text-xs text-gray-500">When users register</p>
                </div>
                {renderInput('notifications', 'newUserAlerts', section.newUserAlerts, 'boolean')}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">Doctor Approvals</p>
                  <p className="text-xs text-gray-500">When doctors need approval</p>
                </div>
                {renderInput('notifications', 'doctorApprovals', section.doctorApprovals, 'boolean')}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                <div>
                  <p className="font-medium text-amber-800">SOS Alerts</p>
                  <p className="text-xs text-amber-600">Emergency notifications</p>
                </div>
                {renderInput('notifications', 'sosAlerts', section.sosAlerts, 'boolean')}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div>
                  <p className="font-medium text-blue-800">System Alerts</p>
                  <p className="text-xs text-blue-600">System health alerts</p>
                </div>
                {renderInput('notifications', 'systemAlerts', section.systemAlerts, 'boolean')}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div>
                  <p className="font-medium text-green-800">Daily Digest</p>
                  <p className="text-xs text-green-600">Daily summary email</p>
                </div>
                {renderInput('notifications', 'dailyDigest', section.dailyDigest, 'boolean')}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div>
                  <p className="font-medium text-purple-800">Weekly Report</p>
                  <p className="text-xs text-purple-600">Weekly analytics</p>
                </div>
                {renderInput('notifications', 'weeklyReport', section.weeklyReport, 'boolean')}
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500">Require 2FA for admin</p>
                </div>
                {renderInput('security', 'twoFactorAuth', section.twoFactorAuth, 'boolean')}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={section.sessionTimeout}
                  onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  min="5"
                  max="120"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                <input
                  type="number"
                  value={section.maxLoginAttempts}
                  onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  min="3"
                  max="10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
                <input
                  type="number"
                  value={section.passwordExpiry}
                  onChange={(e) => updateSetting('security', 'passwordExpiry', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  min="30"
                  max="365"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">Require Strong Password</p>
                  <p className="text-xs text-gray-500">Enforce password complexity</p>
                </div>
                {renderInput('security', 'requireStrongPassword', section.requireStrongPassword, 'boolean')}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">IP Whitelisting</p>
                  <p className="text-xs text-gray-500">Restrict access by IP</p>
                </div>
                {renderInput('security', 'ipWhitelisting', section.ipWhitelisting, 'boolean')}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div>
                  <p className="font-medium text-green-800">SSL Enabled</p>
                  <p className="text-xs text-green-600">HTTPS enforced</p>
                </div>
                {renderInput('security', 'sslEnabled', section.sslEnabled, 'boolean')}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div>
                  <p className="font-medium text-blue-800">Firewall Enabled</p>
                  <p className="text-xs text-blue-600">Protect from attacks</p>
                </div>
                {renderInput('security', 'firewallEnabled', section.firewallEnabled, 'boolean')}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div>
                  <p className="font-medium text-purple-800">Backup Encryption</p>
                  <p className="text-xs text-purple-600">Encrypt backups</p>
                </div>
                {renderInput('security', 'backupEncryption', section.backupEncryption, 'boolean')}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                <div>
                  <p className="font-medium text-amber-800">Audit Logging</p>
                  <p className="text-xs text-amber-600">Track all actions</p>
                </div>
                {renderInput('security', 'auditLogging', section.auditLogging, 'boolean')}
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auto Backup</label>
                <select
                  value={section.backupFrequency}
                  onChange={(e) => updateSetting('system', 'backupFrequency', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Backup Time</label>
                <input
                  type="time"
                  value={section.backupTime}
                  onChange={(e) => updateSetting('system', 'backupTime', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Backup Retention (days)</label>
                <input
                  type="number"
                  value={section.backupRetention}
                  onChange={(e) => updateSetting('system', 'backupRetention', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  min="7"
                  max="365"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Log Retention (days)</label>
                <input
                  type="number"
                  value={section.logRetention}
                  onChange={(e) => updateSetting('system', 'logRetention', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  min="30"
                  max="365"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cache Duration (seconds)</label>
                <input
                  type="number"
                  value={section.cacheDuration}
                  onChange={(e) => updateSetting('system', 'cacheDuration', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  min="60"
                  max="86400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Rate Limit (per hour)</label>
                <input
                  type="number"
                  value={section.apiRateLimit}
                  onChange={(e) => updateSetting('system', 'apiRateLimit', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  min="100"
                  max="10000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Upload Size (MB)</label>
                <input
                  type="number"
                  value={section.maxUploadSize}
                  onChange={(e) => updateSetting('system', 'maxUploadSize', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  min="1"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allowed File Types</label>
                <input
                  type="text"
                  value={section.allowedFileTypes.join(', ')}
                  onChange={(e) => updateSetting('system', 'allowedFileTypes', e.target.value.split(',').map(t => t.trim()))}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  placeholder="jpg, png, pdf, doc"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="font-medium">Cache Enabled</span>
                {renderInput('system', 'cacheEnabled', section.cacheEnabled, 'boolean')}
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="font-medium">Error Reporting</span>
                {renderInput('system', 'errorReporting', section.errorReporting, 'boolean')}
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={handleClearCache}
                className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
              >
                <FaTrash size={14} />
                CLEAR CACHE
              </button>
              
              <button
                onClick={handleRunBackup}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
              >
                <FaDatabase size={14} />
                RUN BACKUP NOW
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12 text-gray-500">
            <Settings size={48} className="mx-auto mb-4 opacity-30" />
            <p>Settings for this section are being configured</p>
          </div>
        );
    }
  };

  // ========== RENDER ==========
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-slate-600 font-bold">Loading Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-[#f8fafc]'}`}>
      
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <FaCheckCircle size={20} />
            <span className="font-bold">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <FaExclamationTriangle size={20} />
            <span className="font-bold">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirm && confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 bg-amber-500 text-white">
                <h3 className="text-xl font-black">{confirmAction.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6">{confirmAction.message}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      confirmAction.onConfirm();
                      setShowConfirm(false);
                    }}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-b-3xl mb-8`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
                <FaCog className="text-teal-500" />
                System <span className="text-teal-500">Settings</span>
              </h1>
              <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                Configure and manage system preferences
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleExportSettings}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all flex items-center gap-2"
              >
                <FaDownload size={16} />
                EXPORT
              </button>
              
              <label className="px-4 py-2 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-all flex items-center gap-2 cursor-pointer">
                <FaUpload size={16} />
                IMPORT
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={handleResetSettings}
                className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-all flex items-center gap-2"
              >
                <FaUndo size={16} />
                RESET
              </button>
              
              <button
                onClick={handleSaveSettings}
                disabled={!isDirty}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  isDirty
                    ? 'bg-teal-500 text-white hover:bg-teal-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FaSave size={16} />
                {isDirty ? 'SAVE CHANGES' : 'SAVED'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:w-80">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl overflow-hidden sticky top-4`}>
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-black flex items-center gap-2">
                  <FaSlidersH className="text-teal-500" />
                  SETTINGS MENU
                </h2>
              </div>
              
              <nav className="p-2 space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === section.id
                        ? 'bg-teal-500 text-white'
                        : darkMode
                          ? 'hover:bg-gray-700 text-gray-300'
                          : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-sm">{section.name}</p>
                      <p className={`text-[10px] ${activeTab === section.id ? 'text-teal-100' : 'text-gray-500'}`}>
                        {section.description}
                      </p>
                    </div>
                    <ChevronRight size={16} className={activeTab === section.id ? 'opacity-100' : 'opacity-30'} />
                  </button>
                ))}
              </nav>
              
              {/* System Status */}
              <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-teal-500/10 to-blue-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-green-600">SYSTEM ONLINE</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 bg-white/50 rounded-lg">
                    <span className="text-gray-500">Version</span>
                    <p className="font-bold">2.0.0</p>
                  </div>
                  <div className="p-2 bg-white/50 rounded-lg">
                    <span className="text-gray-500">Environment</span>
                    <p className="font-bold text-teal-600">Production</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl overflow-hidden`}>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-black flex items-center gap-2">
                  {settingsSections.find(s => s.id === activeTab)?.icon}
                  {settingsSections.find(s => s.id === activeTab)?.name}
                </h2>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {settingsSections.find(s => s.id === activeTab)?.description}
                </p>
              </div>

              <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                {renderSettingsSection(activeTab)}
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className={`w-2 h-2 rounded-full ${isDirty ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                  {isDirty ? 'Unsaved changes' : 'All changes saved'}
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleResetSettings}
                    className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    disabled={!isDirty}
                    className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
                      isDirty
                        ? 'bg-teal-500 text-white hover:bg-teal-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;