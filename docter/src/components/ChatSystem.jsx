import React, { useState, useEffect, useRef } from 'react'; 
import { 
  FaPaperPlane, FaTimes, FaSearch, FaPaperclip, 
  FaPhone, FaVideo as FaVideoIcon, FaCircle, FaChevronLeft,
  FaUserMd, FaUserInjured, FaShieldAlt, FaStethoscope,
  FaPrescription, FaFileMedical, FaCalendarCheck, FaHistory,
  FaInfoCircle, FaArrowRight, FaBell, FaCheckCircle
} from 'react-icons/fa';

const ChatSystem = ({ currentUser, onClose, darkMode }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [quickReplyOptions, setQuickReplyOptions] = useState([]);
  const messagesEndRef = useRef(null);

  // Dynamic users based on current user type
  const getUsers = () => {
    const baseUsers = [
      { 
        id: 'dr001', 
        name: 'Dr. Kasun Perera', 
        role: 'Cardiologist', 
        type: 'doctor',
        status: 'online', 
        image: 'https://randomuser.me/api/portraits/men/32.jpg',
        specialization: 'Cardiology',
        hospital: 'City General Hospital'
      },
      { 
        id: 'dr002', 
        name: 'Dr. Fathima Riaz', 
        role: 'Pediatrician', 
        type: 'doctor',
        status: 'offline', 
        image: 'https://randomuser.me/api/portraits/women/63.jpg',
        specialization: 'Pediatrics',
        hospital: 'Children Medical Center'
      },
      { 
        id: 'admin01', 
        name: 'Support Team', 
        role: 'Administrator', 
        type: 'admin',
        status: 'online', 
        image: 'https://ui-avatars.com/api/?name=Support&background=0D9488&color=fff',
        department: 'Customer Support'
      }
    ];

    // Add patients for doctors
    if (currentUser.type === 'doctor') {
      return [
        ...baseUsers,
        { 
          id: 'pat001', 
          name: 'Alex Johnson', 
          role: 'Patient', 
          type: 'patient',
          status: 'online', 
          image: 'https://randomuser.me/api/portraits/men/67.jpg',
          age: 32,
          lastAppointment: '2024-12-15'
        },
        { 
          id: 'pat002', 
          name: 'Emma Wilson', 
          role: 'Patient', 
          type: 'patient',
          status: 'offline', 
          image: 'https://randomuser.me/api/portraits/women/44.jpg',
          age: 45,
          lastAppointment: '2024-12-10'
        },
        { 
          id: 'pat003', 
          name: 'Michael Chen', 
          role: 'Patient', 
          type: 'patient',
          status: 'online', 
          image: 'https://randomuser.me/api/portraits/men/22.jpg',
          age: 28,
          lastAppointment: '2024-12-05'
        }
      ];
    }

    // Add other doctors and patients for patients
    if (currentUser.type === 'patient') {
      return baseUsers;
    }

    // For admin: show all users
    if (currentUser.type === 'admin') {
      return [
        ...baseUsers,
        { 
          id: 'pat001', 
          name: 'Alex Johnson', 
          role: 'Patient', 
          type: 'patient',
          status: 'online', 
          image: 'https://randomuser.me/api/portraits/men/67.jpg'
        },
        { 
          id: 'dr003', 
          name: 'Dr. David Wilson', 
          role: 'Neurologist', 
          type: 'doctor',
          status: 'online', 
          image: 'https://randomuser.me/api/portraits/men/75.jpg'
        }
      ];
    }

    return baseUsers;
  };

  // Quick replies based on user type and selected user
  useEffect(() => {
    if (!selectedUser) return;

    const options = [];
    
    if (currentUser.type === 'doctor' && selectedUser.type === 'patient') {
      options.push(
        { text: 'Please send your recent reports', value: 'Please send your recent reports' },
        { text: 'How are you feeling today?', value: 'How are you feeling today?' },
        { text: 'Any side effects from medication?', value: 'Any side effects from medication?' },
        { text: 'Schedule follow-up appointment', value: 'Let me schedule a follow-up appointment for you.' }
      );
    } else if (currentUser.type === 'patient' && selectedUser.type === 'doctor') {
      options.push(
        { text: 'I have a fever', value: 'I have a fever and need advice.' },
        { text: 'Need prescription refill', value: 'I need a refill for my prescription.' },
        { text: 'Appointment question', value: 'I have a question about my appointment.' },
        { text: 'Report attached', value: 'I have attached my medical reports.' }
      );
    } else if (currentUser.type === 'admin') {
      options.push(
        { text: 'How can I help?', value: 'How can I help you today?' },
        { text: 'System issue?', value: 'Are you experiencing any system issues?' },
        { text: 'Account question', value: 'Do you have any account-related questions?' }
      );
    }

    setQuickReplyOptions(options);
  }, [selectedUser, currentUser.type]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (text = null) => {
    const messageText = text || newMessage;
    if (!messageText.trim()) return;
    
    const msg = {
      id: Date.now(),
      text: messageText,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderType: currentUser.type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString()
    };
    
    setMessages([...messages, msg]);
    if (!text) setNewMessage('');
  };

  const handleQuickReply = (text) => {
    handleSendMessage(text);
  };

  const handleSendPrescription = () => {
    const prescriptionMessage = {
      id: Date.now(),
      text: `Prescription sent for ${selectedUser?.name}. Please check your prescriptions page.`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderType: currentUser.type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isPrescription: true,
      prescriptionDetails: {
        id: 'PRES-' + Date.now(),
        patient: selectedUser?.name,
        date: new Date().toLocaleDateString(),
        medicines: ['Paracetamol 500mg', 'Vitamin C 1000mg'],
        status: 'sent'
      }
    };
    
    setMessages([...messages, prescriptionMessage]);
    setShowPrescriptionModal(false);
  };

  const handleScheduleAppointment = () => {
    const appointmentMessage = {
      id: Date.now(),
      text: `Appointment scheduled for ${selectedUser?.name} on December 20, 2024 at 10:00 AM`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderType: currentUser.type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAppointment: true,
      appointmentDetails: {
        id: 'APT-' + Date.now(),
        patient: selectedUser?.name,
        doctor: currentUser.name,
        date: '2024-12-20',
        time: '10:00 AM',
        type: 'Follow-up'
      }
    };
    
    setMessages([...messages, appointmentMessage]);
    setShowAppointmentModal(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return 'bg-emerald-500';
      case 'offline': return 'bg-gray-400';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getUserIcon = (userType) => {
    switch(userType) {
      case 'doctor': return <FaUserMd className="text-blue-500" />;
      case 'patient': return <FaUserInjured className="text-green-500" />;
      case 'admin': return <FaShieldAlt className="text-purple-500" />;
      default: return <FaCircle className="text-gray-500" />;
    }
  };

  const users = getUsers();
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 ${darkMode ? 'bg-black/80' : 'bg-slate-900/60'} backdrop-blur-md`}>
      
      {/* Main Container */}
      <div className={`w-full max-w-6xl h-full sm:h-[85vh] flex overflow-hidden sm:rounded-[2.5rem] shadow-2xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white/95 border-white'} backdrop-blur-xl relative animate-in zoom-in duration-300`}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-[110] p-3 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 hover:rotate-90 transition-all duration-300 active:scale-90"
          title="Close Chat"
        >
          <FaTimes size={18} />
        </button>

        {/* Sidebar - Contacts */}
        <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-shrink-0 border-r ${darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-slate-100 bg-slate-50/50'} flex flex-col`}>
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Messages
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                {getUserIcon(currentUser.type)}
                <span className="capitalize">{currentUser.type}</span>
              </div>
            </div>
            
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search chats..." 
                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white shadow-sm border border-slate-100 focus:ring-2 focus:ring-emerald-500'}`}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* User Type Filters */}
            <div className="flex gap-2 mt-4">
              <button className={`px-3 py-1.5 text-xs rounded-lg ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                All
              </button>
              <button className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1 ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                <FaUserMd size={10} /> Doctors
              </button>
              <button className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1 ${darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-600'}`}>
                <FaUserInjured size={10} /> Patients
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {filteredUsers.map(user => (
              <div 
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-4 rounded-[1.5rem] cursor-pointer transition-all flex items-center gap-4 ${selectedUser?.id === user.id ? (darkMode ? 'bg-emerald-600 shadow-emerald-900/20' : 'bg-emerald-600 text-white shadow-xl shadow-emerald-100') : (darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-white text-slate-600')}`}
              >
                <div className="relative flex-shrink-0">
                  <img src={user.image} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/20" alt="" />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(user.status)} border-4 border-white rounded-full`} />
                  <div className="absolute -top-1 -left-1 p-1 bg-white rounded-full">
                    {getUserIcon(user.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{user.name}</p>
                  <p className={`text-[11px] font-bold uppercase tracking-wider opacity-60`}>{user.role}</p>
                  {user.specialization && (
                    <p className="text-xs text-gray-500 truncate">{user.specialization}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedUser ? (
          <div className="flex-1 flex flex-col bg-transparent relative">
            {/* Chat Header */}
            <div className={`p-6 flex items-center justify-between border-b ${darkMode ? 'border-gray-800' : 'border-slate-100'}`}>
              <div className="flex items-center gap-4">
                {/* Back button for mobile */}
                <button onClick={() => setSelectedUser(null)} className="md:hidden p-2 text-slate-400 hover:text-emerald-500">
                  <FaChevronLeft size={20} />
                </button>
                <div className="relative">
                  <img src={selectedUser.image} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-50" />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm">
                    {getUserIcon(selectedUser.type)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-black text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>{selectedUser.name}</h3>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedUser.status)} animate-pulse`} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    {selectedUser.role} • {selectedUser.status}
                  </p>
                  {selectedUser.specialization && (
                    <p className="text-xs text-gray-500">{selectedUser.specialization}</p>
                  )}
                  {selectedUser.hospital && (
                    <p className="text-xs text-gray-500">{selectedUser.hospital}</p>
                  )}
                </div>
              </div>
              
              {/* Header Actions */}
              <div className="flex items-center gap-2 mr-16">
                {currentUser.type === 'doctor' && selectedUser.type === 'patient' && (
                  <>
                    <button 
                      onClick={() => setShowPrescriptionModal(true)}
                      className={`p-3 rounded-xl transition-all flex items-center gap-2 ${darkMode ? 'hover:bg-gray-800 text-blue-400' : 'hover:bg-blue-50 text-blue-600'}`}
                      title="Send Prescription"
                    >
                      <FaPrescription />
                      <span className="text-xs font-bold">Prescription</span>
                    </button>
                    <button 
                      onClick={() => setShowAppointmentModal(true)}
                      className={`p-3 rounded-xl transition-all flex items-center gap-2 ${darkMode ? 'hover:bg-gray-800 text-green-400' : 'hover:bg-green-50 text-green-600'}`}
                      title="Schedule Appointment"
                    >
                      <FaCalendarCheck />
                      <span className="text-xs font-bold">Schedule</span>
                    </button>
                  </>
                )}
                <button className={`p-3 rounded-xl transition-all ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-slate-100 text-slate-400'}`}>
                  <FaPhone size={16} />
                </button>
                <button className={`p-3 rounded-xl transition-all ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-slate-100 text-slate-400'}`}>
                  <FaVideoIcon size={16} />
                </button>
                <button className={`p-3 rounded-xl transition-all ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-slate-100 text-slate-400'}`}>
                  <FaInfoCircle size={16} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <FaPaperPlane size={24} className="text-emerald-500" />
                  </div>
                  <h3 className="font-bold text-gray-600">No messages yet</h3>
                  <p className="text-sm text-gray-400">Start the conversation with {selectedUser.name}</p>
                  
                  {/* Quick Replies for Empty Chat */}
                  {quickReplyOptions.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 gap-2 w-full max-w-md">
                      {quickReplyOptions.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickReply(option.value)}
                          className="p-3 bg-white border border-gray-200 rounded-xl text-sm text-left hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
                        >
                          {option.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] p-4 rounded-[1.5rem] shadow-sm relative ${msg.senderId === currentUser.id 
                        ? 'bg-emerald-600 text-white rounded-tr-none shadow-emerald-200/50' 
                        : (darkMode ? 'bg-gray-800 text-white rounded-tl-none border border-gray-700' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none')}`}>
                        
                        {/* Special Message Indicators */}
                        {msg.isPrescription && (
                          <div className="flex items-center gap-2 mb-2 p-2 bg-emerald-500/20 rounded-lg">
                            <FaPrescription className="text-emerald-500" />
                            <span className="text-xs font-bold">PRESCRIPTION SENT</span>
                          </div>
                        )}
                        
                        {msg.isAppointment && (
                          <div className="flex items-center gap-2 mb-2 p-2 bg-blue-500/20 rounded-lg">
                            <FaCalendarCheck className="text-blue-500" />
                            <span className="text-xs font-bold">APPOINTMENT SCHEDULED</span>
                          </div>
                        )}
                        
                        <p className="text-sm font-semibold leading-relaxed">{msg.text}</p>
                        
                        <div className={`flex items-center justify-between mt-2 ${msg.senderId === currentUser.id ? 'text-emerald-100' : 'text-gray-400'}`}>
                          <p className="text-[9px] font-black tracking-widest opacity-60">
                            {msg.timestamp}
                          </p>
                          {msg.senderId === currentUser.id && (
                            <FaCheckCircle className="text-emerald-300" size={10} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Quick Reply Options (When messages exist) */}
            {messages.length > 0 && quickReplyOptions.length > 0 && (
              <div className="px-6 pt-4">
                <div className="flex flex-wrap gap-2">
                  {quickReplyOptions.slice(0, 4).map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(option.value)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-emerald-100 hover:text-emerald-700 transition-colors flex items-center gap-1"
                    >
                      {option.text}
                      <FaArrowRight size={8} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-6 bg-white/50 backdrop-blur-sm">
              <div className={`relative flex items-center gap-3 p-2 pl-4 rounded-[2rem] border-2 transition-all ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100 shadow-2xl focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10'}`}>
                <button className="p-2 text-slate-300 hover:text-emerald-500 transition-colors">
                  <FaPaperclip size={18} />
                </button>
                <input 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={currentUser.type === 'doctor' ? "Type message or send prescription..." : "Type your message here..."} 
                  className={`flex-1 bg-transparent outline-none text-sm font-semibold py-3 ${darkMode ? 'text-white' : 'text-slate-700'}`}
                />
                <button 
                  onClick={() => handleSendMessage()}
                  className="bg-emerald-600 text-white p-4 rounded-full hover:bg-emerald-500 transition-all hover:rotate-12 active:scale-90 shadow-xl shadow-emerald-200"
                >
                  <FaPaperPlane size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-slate-50/50 text-slate-400 p-8">
            <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center shadow-inner mb-6">
              <div className="relative">
                <FaPaperPlane size={48} className="text-emerald-300" />
                <div className="absolute -inset-4 bg-emerald-500/10 rounded-full animate-ping"></div>
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">
              {currentUser.type === 'doctor' ? 'Doctor Messages' : 
               currentUser.type === 'admin' ? 'Admin Console' : 'HealthAI Chat'}
            </h3>
            <p className="font-bold text-sm text-slate-500 text-center max-w-md mb-8">
              {currentUser.type === 'doctor' 
                ? 'Select a patient to start consultation, send prescriptions, or schedule appointments.' 
                : currentUser.type === 'admin'
                ? 'Connect with doctors, patients, or support team members.'
                : 'Select a doctor to start a conversation about your health concerns.'}
            </p>
            
            <div className="grid grid-cols-3 gap-4 max-w-lg">
              <div className={`p-4 rounded-2xl text-center ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaUserMd className="text-emerald-600" size={20} />
                </div>
                <p className="text-xs font-bold text-gray-700">Doctors</p>
                <p className="text-lg font-black text-gray-900">
                  {users.filter(u => u.type === 'doctor').length}
                </p>
              </div>
              
              <div className={`p-4 rounded-2xl text-center ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaUserInjured className="text-blue-600" size={20} />
                </div>
                <p className="text-xs font-bold text-gray-700">Patients</p>
                <p className="text-lg font-black text-gray-900">
                  {users.filter(u => u.type === 'patient').length}
                </p>
              </div>
              
              <div className={`p-4 rounded-2xl text-center ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaShieldAlt className="text-purple-600" size={20} />
                </div>
                <p className="text-xs font-bold text-gray-700">Admins</p>
                <p className="text-lg font-black text-gray-900">
                  {users.filter(u => u.type === 'admin').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-[120] bg-black/50 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-md w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Send Prescription</h3>
              <button onClick={() => setShowPrescriptionModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Patient
                </label>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img src={selectedUser?.image} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-bold">{selectedUser?.name}</p>
                      <p className="text-sm text-gray-500">Patient ID: {selectedUser?.id}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prescription Notes
                </label>
                <textarea 
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg"
                  rows="3"
                  placeholder="Add prescription notes..."
                  defaultValue="Please take the prescribed medication as directed. Follow-up in 7 days if symptoms persist."
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowPrescriptionModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSendPrescription}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Send Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 z-[120] bg-black/50 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-md w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Schedule Appointment</h3>
              <button onClick={() => setShowAppointmentModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Patient
                </label>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img src={selectedUser?.image} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-bold">{selectedUser?.name}</p>
                      <p className="text-sm text-gray-500">Patient ID: {selectedUser?.id}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input type="date" className="w-full p-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg">
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>2:00 PM</option>
                    <option>3:00 PM</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Appointment Type
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-lg">
                  <option>Follow-up</option>
                  <option>New Consultation</option>
                  <option>Emergency</option>
                  <option>Routine Checkup</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowAppointmentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleScheduleAppointment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSystem;