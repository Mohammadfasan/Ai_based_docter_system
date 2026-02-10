import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/patient/Dashboard';
import Doctors from './pages/patient/Doctors';
import Appointments from './pages/patient/Appointments';
import MedicalRecordsPage from './pages/patient/MedicalRecordsPage';
import Feedback from './pages/patient/Feedback'; 
import DoctorFeedbackDashboard from './pages/Docter/DoctorFeedbackDashboard'; 
import PatientPrescriptions from './pages/patient/PatientPrescriptions';

import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminManagement from './pages/Admin/AdminManagement';
import AdminPortal from './pages/Admin/AdminPortal';

import BookAppointment from './pages/patient/BookAppointment';

import DoctorAvailability from './pages/Docter/DoctorAvailability';
import BillingPayment from './pages/Docter/BillingPayment';
import DoctorBilling from './pages/Docter/DoctorBilling'; // ✅ இதை import பண்ணவும்

import DoctorPortal from './pages/Docter/DoctorPortal';
import DoctorSchedule from './pages/Docter/DoctorSchedule';
import PrescriptionManager from './pages/Docter/PrescriptionManager';
import VideoConsultation from './pages/Docter/VideoConsultation';
import Profile from './pages/Profile';

import AIDoctorRecommendation from './pages/patient/features/AIDoctorRecommendation';
import AIMedicalRecords from './pages/patient/features/AIMedicalRecords';

import EmergencySOS from './pages/patient/features/EmergencySOS';
import MedicineDelivery from './pages/patient/features/MedicineDelivery';
import HealthInsurance from './pages/patient/features/HealthInsurance';
import HealthMonitor from './pages/patient/features/HealthMonitor';
import AIHealthAssistant from './pages/patient/features/AIHealthAssistant'; 
import MentalHealth from './pages/patient/features/MentalHealth';
import FamilyHealth from './pages/patient/features/FamilyHealth';
import Nutrition from './pages/patient/features/Nutrition';

import ChatSystem from './components/ChatSystem';

import Header from './components/Header';
import Footer from './components/Footer';
import LanguageSelector from './components/LanguageSelector';
import DarkModeToggle from './components/DarkModeToggle';

import { 
  FaQuestionCircle, FaUsers, FaComment, FaRobot, 
  FaVideo, FaAmbulance, FaPills, FaShieldAlt, 
  FaHeartbeat, FaBrain, FaHeart, FaAppleAlt
} from 'react-icons/fa';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState('patient');
  const [userData, setUserData] = useState({
    name: 'Alex Johnson',
    email: 'alex@example.com',
    userId: 'PAT001'
  });
  const [darkMode, setDarkMode] = useState(false);

  const handleLogin = (type, userInfo = {}) => {
    setIsAuthenticated(true);
    setUserType(type);
    
    // Set default user data based on type
    let defaultData = {};
    switch(type) {
      case 'patient':
        defaultData = {
          name: 'Alex Johnson',
          email: 'alex@example.com',
          userId: 'PAT001',
          avatarColor: 'bg-blue-500',
          bloodGroup: 'O+',
          allergies: ['Penicillin'],
          emergencyContact: '+91 9876543210'
        };
        break;
      case 'doctor':
        defaultData = {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@healthai.com',
          userId: 'DOC001',
          specialization: 'General Physician',
          avatarColor: 'bg-teal-500',
          licenseNumber: 'MED123456',
          hospital: 'City General Hospital'
        };
        break;
      case 'admin':
        defaultData = {
          name: 'Admin User',
          email: 'admin@healthai.com',
          userId: 'ADM001',
          avatarColor: 'bg-purple-500',
          role: 'System Administrator'
        };
        break;
      default:
        defaultData = {
          name: 'User',
          email: 'user@example.com',
          userId: 'USR001',
          avatarColor: 'bg-gray-500'
        };
    }
    
    // Merge with provided user info
    setUserData({
      ...defaultData,
      ...userInfo
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserType('patient');
    setUserData({
      name: 'Alex Johnson',
      email: 'alex@example.com',
      userId: 'PAT001',
      avatarColor: 'bg-blue-500'
    });
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Create a wrapper component for ChatSystem with navigation
  const ChatSystemWrapper = () => {
    const navigate = useNavigate();
    return (
      <ChatSystem 
        currentUser={{ 
          id: userData.userId, 
          name: userData.name, 
          type: userType,
          avatarColor: userData.avatarColor || 'bg-gray-500'
        }}
        onClose={() => navigate(-1)}
        darkMode={darkMode}
      />
    );
  };

  return (
    <Router>
      <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        {isAuthenticated && (
          <Header 
            onLogout={handleLogout} 
            userType={userType} 
            userData={userData} 
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        )}
        
        {/* Patient Quick Access Bar */}
        {isAuthenticated && userType === 'patient' && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
            <div className="max-w-8xl mx-auto px-4 py-1">
              <div className="flex overflow-x-auto space-x-3 py-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#0D9488 #f1f1f1' }}>
                <Link 
                  to="/ai-recommendation"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-medium whitespace-nowrap"
                >
                  <FaRobot />
                  <span>AI Doctor Finder</span>
                </Link>
                <Link 
                  to="/chat-system"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-medium whitespace-nowrap"
                >
                  <FaComment />
                  <span>Chat System</span>
                </Link>
                <Link 
                  to="/ai-health-assistant"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium whitespace-nowrap"
                >
                  <FaBrain />
                  <span>AI Assistant</span>
                </Link>
                <Link 
                  to="/mental-health"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-medium whitespace-nowrap"
                >
                  <FaHeart />
                  <span>Mental Health</span>
                </Link>
                <Link 
                  to="/family-health"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium whitespace-nowrap"
                >
                  <FaUsers />
                  <span>Family Health</span>
                </Link>
                <Link 
                  to="/health-monitor"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium whitespace-nowrap"
                >
                  <FaHeartbeat />
                  <span>Health Monitor</span>
                </Link>
                <Link 
                  to="/emergency-sos"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium whitespace-nowrap"
                >
                  <FaAmbulance />
                  <span>Emergency SOS</span>
                </Link>
                <Link 
                  to="/medicine-delivery"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium whitespace-nowrap"
                >
                  <FaPills />
                  <span>Medicine Delivery</span>
                </Link>
                <Link 
                  to="/health-insurance"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-medium whitespace-nowrap"
                >
                  <FaShieldAlt />
                  <span>Health Insurance</span>
                </Link>
                <Link 
                  to="/nutrition"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium whitespace-nowrap"
                >
                  <FaAppleAlt />
                  <span>Nutrition Planner</span>
                </Link>
                <Link 
                  to="/feedback"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-medium whitespace-nowrap"
                >
                  <FaComment />
                  <span>Feedback</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        <main className="flex-grow">
          <Routes>
            {/* Public Route - Login */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                <Navigate to={
                  userType === 'admin' ? '/admin' : 
                  userType === 'doctor' ? '/doctor-portal' : 
                  '/home'
                } /> : 
                <Login onLogin={handleLogin} />
              } 
            />
            
            {/* Doctor Billing Route */}
            <Route 
              path="/doctor-billing" 
              element={
                isAuthenticated && userType === 'doctor' ? 
                <DoctorBilling userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            
            {/* Patient Routes */}
            <Route 
              path="/home" 
              element={
                isAuthenticated && userType === 'patient' ? 
                <Dashboard userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/doctors" 
              element={
                isAuthenticated && userType === 'patient' ? 
                <Doctors userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/appointments" 
              element={
                isAuthenticated && userType === 'patient' ? 
                <Appointments userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/medical-records" 
              element={
                isAuthenticated && userType === 'patient' ? 
                <MedicalRecordsPage userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/feedback" 
              element={
                isAuthenticated && userType === 'patient' ? 
                <Feedback userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/book-appointment/:doctorId" 
              element={
                isAuthenticated && userType === 'patient' ? 
                <BookAppointment userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
                path="/my-prescriptions" 
               element={
                isAuthenticated && userType === 'patient' ? 
               <PatientPrescriptions userType={userType} userData={userData} darkMode={darkMode} /> : 
             <Navigate to="/" />
             } 
/>
            {/* Chat System Route */}
            <Route 
              path="/chat-system" 
              element={
                isAuthenticated && (userType === 'patient' || userType === 'doctor' || userType === 'admin') ? 
                <ChatSystemWrapper /> : 
                <Navigate to="/" />
              } 
            />
            
            {/* AI Features Routes */}
            <Route 
              path="/ai-recommendation" 
              element={
                isAuthenticated && userType === 'patient' ? 
                <AIDoctorRecommendation userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/ai-health-assistant" 
              element={
                isAuthenticated && userType === 'patient' ? 
                <AIHealthAssistant userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/mental-health" 
              element={
                isAuthenticated && userType === 'patient' ? 
                <MentalHealth userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/nutrition" 
              element={
                isAuthenticated && userType === 'patient' ? 
                <Nutrition userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/family-health" 
              element={
                isAuthenticated && userType === 'patient' ? 
                <FamilyHealth userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/ai-medical-records" 
              element={
                isAuthenticated && userType === 'patient' ? 
                <AIMedicalRecords userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            
            {/* Health Services Routes */}
            <Route 
              path="/health-monitor" 
              element={
                isAuthenticated && userType === 'patient' ? 
                <HealthMonitor userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/emergency-sos" 
              element={
                isAuthenticated ? 
                <EmergencySOS userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/medicine-delivery" 
              element={
                isAuthenticated && userType === 'patient' ? 
                <MedicineDelivery userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/health-insurance" 
              element={
                isAuthenticated && userType === 'patient' ? 
                <HealthInsurance userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            
            {/* Video Consultation */}
            <Route 
              path="/video-consultation/:appointmentId" 
              element={
                isAuthenticated ? 
                <VideoConsultation userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            
            {/* Billing & Payments */}
            <Route 
              path="/billing-payment" 
              element={
                isAuthenticated && (userType === 'patient' || userType === 'admin') ? 
                <BillingPayment userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            
            {/* Doctor Routes */}
            <Route 
              path="/doctor-portal" 
              element={
                isAuthenticated && userType === 'doctor' ? 
                <DoctorPortal userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/doctor-schedule" 
              element={
                isAuthenticated && userType === 'doctor' ? 
                <DoctorSchedule userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/doctor-availability" 
              element={
                isAuthenticated && userType === 'doctor' ? 
                <DoctorAvailability userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/doctor-feedback-dashboard" 
              element={
                isAuthenticated && userType === 'doctor' ? 
                <DoctorFeedbackDashboard userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            
            {/* Prescription Management */}
            <Route 
              path="/prescriptions" 
              element={
                isAuthenticated && (userType === 'doctor' || userType === 'admin') ? 
                <PrescriptionManager userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                isAuthenticated && userType === 'admin' ? 
                <AdminDashboard userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/admin-management" 
              element={
                isAuthenticated && userType === 'admin' ? 
                <AdminManagement userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/admin-portal" 
              element={
                isAuthenticated && userType === 'admin' ? 
                <AdminPortal userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            
            {/* Profile Route (Available for all users) */}
            <Route 
              path="/profile" 
              element={
                isAuthenticated ? 
                <Profile userType={userType} userData={userData} darkMode={darkMode} /> : 
                <Navigate to="/" />
              } 
            />
            
            {/* Settings Route */}
            <Route 
              path="/settings" 
              element={
                isAuthenticated ? 
                <div className={`max-w-7xl mx-auto px-4 py-8 ${darkMode ? 'text-gray-100' : ''}`}>
                  <h1 className="text-3xl font-bold">Settings</h1>
                  <p className="opacity-80">System Settings</p>
                  <div className={`mt-6 rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold mb-4">System Preferences</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">Dark Mode</div>
                              <div className="text-sm opacity-80">Switch to dark theme</div>
                            </div>
                            <button
                              onClick={toggleDarkMode}
                              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                            >
                              {darkMode ? 'Dark' : 'Light'}
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">Chat Notifications</div>
                              <div className="text-sm opacity-80">Receive chat message alerts</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">Email Notifications</div>
                              <div className="text-sm opacity-80">Receive email updates</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">Appointment Reminders</div>
                              <div className="text-sm opacity-80">Get reminders before appointments</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {/* Language Selection */}
                      <div>
                        <h3 className="text-lg font-bold mb-4">Language</h3>
                        <LanguageSelector darkMode={darkMode} />
                      </div>
                      
                      {/* Security Settings */}
                      <div>
                        <h3 className="text-lg font-bold mb-4">Security</h3>
                        <div className="space-y-4">
                          <button className={`w-full text-left p-4 rounded-lg hover:opacity-90 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                            <div className="font-medium">Change Password</div>
                            <div className="text-sm opacity-80">Update your account password</div>
                          </button>
                          <button className={`w-full text-left p-4 rounded-lg hover:opacity-90 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                            <div className="font-medium">Two-Factor Authentication</div>
                            <div className="text-sm opacity-80">Add an extra layer of security</div>
                          </button>
                          <button className="w-full text-left p-4 rounded-lg hover:opacity-90 bg-red-900/30 hover:bg-red-800/40 text-red-300">
                            <div className="font-medium">Delete Account</div>
                            <div className="text-sm opacity-80">Permanently delete your account</div>
                          </button>
                        </div>
                      </div>
                      
                      <button className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
                        Save Settings
                      </button>
                    </div>
                  </div>
                </div> : 
                <Navigate to="/" />
              } 
            />
            
            {/* Help & Support Route */}
            <Route 
              path="/help" 
              element={
                isAuthenticated ? 
                <div className={`max-w-7xl mx-auto px-4 py-8 ${darkMode ? 'text-gray-100' : ''}`}>
                  <h1 className="text-3xl font-bold">Help & Support</h1>
                  <p className="opacity-80">Get help and support for HealthAI Clinic</p>
                  
                  <div className="mt-8 grid md:grid-cols-3 gap-6">
                    <div className={`rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="p-3 bg-blue-100 rounded-lg inline-block mb-4">
                        <FaQuestionCircle className="text-blue-600 text-2xl" />
                      </div>
                      <h3 className="font-bold text-lg mb-3">FAQ & Documentation</h3>
                      <p className="opacity-80 mb-4">Find answers to frequently asked questions and detailed guides.</p>
                      <button className="text-teal-600 hover:text-teal-700 font-medium">
                        Browse FAQ →
                      </button>
                    </div>
                    
                    <div className={`rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="p-3 bg-green-100 rounded-lg inline-block mb-4">
                        <FaUsers className="text-green-600 text-2xl" />
                      </div>
                      <h3 className="font-bold text-lg mb-3">24/7 Customer Support</h3>
                      <p className="opacity-80 mb-4">Get instant help from our support team via chat, email, or phone.</p>
                      <button className="text-teal-600 hover:text-teal-700 font-medium">
                        Contact Support →
                      </button>
                    </div>
                    
                    <div className={`rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="p-3 bg-purple-100 rounded-lg inline-block mb-4">
                        <FaComment className="text-purple-600 text-2xl" />
                      </div>
                      <h3 className="font-bold text-lg mb-3">Chat System Help</h3>
                      <p className="opacity-80 mb-4">Learn how to use the chat system to communicate with doctors, admins, and patients.</p>
                      <button className="text-teal-600 hover:text-teal-700 font-medium">
                        Chat Guide →
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-8 text-white">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Need Immediate Help?</h3>
                        <p className="opacity-90">Our team is ready to assist you right now.</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
                        <button className="px-6 py-3 bg-white text-teal-600 rounded-lg font-semibold hover:bg-gray-100">
                          Start Live Chat
                        </button>
                        <button className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10">
                          Schedule Call
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`mt-8 rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className="font-bold text-lg mb-4">Quick Links</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Link to="#" className={`p-4 rounded-lg hover:opacity-90 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                        <div className="font-medium">User Guide</div>
                        <div className="text-sm opacity-80">Getting started guide</div>
                      </Link>
                      <Link to="#" className={`p-4 rounded-lg hover:opacity-90 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                        <div className="font-medium">Video Tutorials</div>
                        <div className="text-sm opacity-80">Step-by-step videos</div>
                      </Link>
                      <Link to="/chat-system" className={`p-4 rounded-lg hover:opacity-90 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                        <div className="font-medium">Chat System</div>
                        <div className="text-sm opacity-80">Start messaging</div>
                      </Link>
                      <Link to="#" className={`p-4 rounded-lg hover:opacity-90 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                        <div className="font-medium">Community</div>
                        <div className="text-sm opacity-80">Join discussions</div>
                      </Link>
                    </div>
                  </div>
                </div> : 
                <Navigate to="/" />
              } 
            />
            
            {/* 404 Page */}
            <Route 
              path="*" 
              element={
                <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-teal-50 via-white to-blue-50'}`}>
                  <div className="text-center">
                    <h1 className={`text-6xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>404</h1>
                    <p className={`text-xl mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Oops! Page not found</p>
                    <p className={`mb-8 max-w-md mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      The page you are looking for might have been removed, had its name changed, 
                      or is temporarily unavailable.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link 
                        to="/" 
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                      >
                        Return Home
                      </Link>
                      <button 
                        onClick={() => window.history.back()}
                        className={`px-6 py-3 border rounded-lg font-semibold transition-colors ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
                </div>
              } 
            />
          </Routes>
        </main>
        {isAuthenticated && <Footer darkMode={darkMode} />}
        
        {/* Voice Assistant Button */}
        {isAuthenticated && (
          <button
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform"
            title="Voice Assistant"
            onClick={() => {
              // Voice assistant implementation
              if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                alert('Voice assistant activated. Say "book appointment", "emergency", "my prescriptions", or "open chat"');
              } else {
                alert('Voice recognition not supported in this browser');
              }
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        )}
        
        {/* Quick Login Buttons (for testing) */}
        {!isAuthenticated && (
          <div className="fixed top-4 right-4 flex space-x-2">
            <button 
              onClick={() => handleLogin('patient', { name: 'Patient User' })}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm"
            >
              Quick Patient
            </button>
            <button 
              onClick={() => handleLogin('doctor', { name: 'Dr. Sarah Johnson' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
            >
              Quick Doctor
            </button>
            <button 
              onClick={() => handleLogin('admin', { name: 'Admin User' })}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
            >
              Quick Admin
            </button>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;