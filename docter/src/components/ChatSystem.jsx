// src/components/ChatSystem.jsx
import React, { useState, useEffect, useRef } from 'react'; 
import { 
  FaPaperPlane, FaTimes, FaSearch, FaPaperclip, 
  FaPhone, FaVideo as FaVideoIcon, FaCircle, FaChevronLeft,
  FaUserMd, FaUserInjured, FaShieldAlt, FaStethoscope,
  FaPrescription, FaFileMedical, FaCalendarCheck, FaHistory,
  FaInfoCircle, FaArrowRight, FaBell, FaCheckCircle,
  FaUser, FaHospital, FaEnvelope, FaIdCard, FaClock,
  FaCheck, FaExclamationTriangle, FaFileAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ChatSystem = ({ currentUser, onClose, darkMode }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [quickReplyOptions, setQuickReplyOptions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userFilter, setUserFilter] = useState('all'); // 'all', 'doctors', 'patients', 'admins'
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [chatHistory, setChatHistory] = useState({}); // ✅ Added missing state
  const messagesEndRef = useRef(null);

  // Load users from localStorage
  useEffect(() => {
    loadUsers();
    loadChatHistory();
    
    // Simulate online status (in real app, this would come from websocket)
    const mockOnlineUsers = () => {
      const online = allUsers.filter(() => Math.random() > 0.5).map(u => u.id);
      setOnlineUsers(online);
    };
    
    const interval = setInterval(mockOnlineUsers, 30000);
    mockOnlineUsers();
    
    return () => clearInterval(interval);
  }, []);

  // Update filtered users when filter changes
  useEffect(() => {
    filterUsers();
  }, [searchTerm, userFilter, allUsers, chatHistory]); // ✅ Added chatHistory dependency

  // Load chat history when selected user changes
  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.id);
      // Mark messages as read
      markMessagesAsRead(selectedUser.id);
    }
  }, [selectedUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadUsers = () => {
    setLoading(true);
    try {
      // Get all users from localStorage
      const storedUsers = JSON.parse(localStorage.getItem('healthai_users') || '[]');
      
      // Format users for chat
      const formattedUsers = storedUsers
        .filter(user => user.userId !== currentUser.id) // Don't include current user
        .map(user => ({
          id: user.userId || user.id,
          name: user.name,
          email: user.email,
          role: getUserRole(user.userType),
          type: user.userType,
          specialization: user.specialization || '',
          hospital: user.hospital || '',
          phone: user.phone || '',
          age: user.age,
          gender: user.gender,
          bloodGroup: user.bloodGroup,
          lastActive: user.lastActive || new Date().toISOString(),
          image: getAvatarForUser(user),
          unreadCount: 0
        }));
      
      // Also load doctors from healthai_doctors if available
      const storedDoctors = JSON.parse(localStorage.getItem('healthai_doctors') || '[]');
      const doctorUsers = storedDoctors
        .filter(doc => !formattedUsers.some(u => u.id === doc.id) && doc.id !== currentUser.id)
        .map(doc => ({
          id: doc.id || doc.userId,
          name: doc.name,
          email: doc.email,
          role: doc.specialization || 'Doctor',
          type: 'doctor',
          specialization: doc.specialization,
          hospital: doc.hospital,
          phone: doc.phone,
          experience: doc.experience,
          rating: doc.rating,
          image: doc.image || getAvatarForUser(doc),
          unreadCount: 0
        }));
      
      const allFormattedUsers = [...formattedUsers, ...doctorUsers];
      setAllUsers(allFormattedUsers);
      
    } catch (error) {
      console.error('Error loading users:', error);
    }
    setLoading(false);
  };

  const getUserRole = (type) => {
    switch(type) {
      case 'doctor': return 'Doctor';
      case 'patient': return 'Patient';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  const getAvatarForUser = (user) => {
    if (user.image) return user.image;
    
    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
    const colors = {
      doctor: '0D9488',
      patient: '3B82F6',
      admin: '8B5CF6',
      default: '6B7280'
    };
    const color = colors[user.userType] || colors.default;
    
    return `https://ui-avatars.com/api/?name=${initials}&background=${color}&color=fff&size=200`;
  };

  const loadChatHistory = () => {
    try {
      const stored = localStorage.getItem(`chat_history_${currentUser.id}`);
      if (stored) {
        setChatHistory(JSON.parse(stored));
      } else {
        setChatHistory({});
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setChatHistory({});
    }
  };

  const loadMessages = (userId) => {
    try {
      const key = `chat_${currentUser.id}_${userId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        // Check reverse direction
        const reverseKey = `chat_${userId}_${currentUser.id}`;
        const reverseStored = localStorage.getItem(reverseKey);
        if (reverseStored) {
          setMessages(JSON.parse(reverseStored));
        } else {
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const saveMessages = (userId, newMessages) => {
    try {
      const key = `chat_${currentUser.id}_${userId}`;
      localStorage.setItem(key, JSON.stringify(newMessages));
      
      // Update chat history
      const history = { ...chatHistory };
      if (!history[userId]) {
        history[userId] = {
          lastMessage: newMessages[newMessages.length - 1]?.text || '',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0
        };
      } else {
        history[userId].lastMessage = newMessages[newMessages.length - 1]?.text || '';
        history[userId].lastMessageTime = new Date().toISOString();
      }
      setChatHistory(history);
      localStorage.setItem(`chat_history_${currentUser.id}`, JSON.stringify(history));
      
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const markMessagesAsRead = (userId) => {
    try {
      // Update unread count in history
      const history = { ...chatHistory };
      if (history[userId]) {
        history[userId].unreadCount = 0;
        setChatHistory(history);
        localStorage.setItem(`chat_history_${currentUser.id}`, JSON.stringify(history));
      }
      
      // Update unread counts state
      const newUnreadCounts = { ...unreadCounts };
      delete newUnreadCounts[userId];
      setUnreadCounts(newUnreadCounts);
      
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const filterUsers = (users = allUsers) => {
    let filtered = [...users];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.specialization && user.specialization.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.hospital && user.hospital.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply type filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(user => user.type === userFilter);
    }
    
    // Sort by online status and last message
    filtered.sort((a, b) => {
      // Online users first
      const aOnline = onlineUsers.includes(a.id);
      const bOnline = onlineUsers.includes(b.id);
      if (aOnline !== bOnline) return aOnline ? -1 : 1;
      
      // Then by last message time
      const aLastMsg = chatHistory[a.id]?.lastMessageTime || a.lastActive;
      const bLastMsg = chatHistory[b.id]?.lastMessageTime || b.lastActive;
      return new Date(bLastMsg) - new Date(aLastMsg);
    });
    
    setFilteredUsers(filtered);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (text = null) => {
    const messageText = text || newMessage;
    if (!messageText.trim() || !selectedUser) return;
    
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: messageText,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderType: currentUser.type,
      receiverId: selectedUser.id,
      timestamp: new Date().toISOString(),
      read: false,
      delivered: true
    };
    
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    saveMessages(selectedUser.id, updatedMessages);
    
    // Create notification for receiver
    createMessageNotification(selectedUser, newMsg);
    
    if (!text) setNewMessage('');
  };

  const createMessageNotification = (receiver, message) => {
    try {
      const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
      const newNotification = {
        id: `NOT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: `New message from ${currentUser.name}`,
        message: message.text.substring(0, 100) + (message.text.length > 100 ? '...' : ''),
        type: 'message',
        priority: 'normal',
        recipientType: 'specific',
        targetUsers: [{
          id: receiver.id,
          name: receiver.name,
          type: receiver.type
        }],
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: '/chat-system',
        icon: 'comment'
      };
      
      localStorage.setItem('admin_notifications', JSON.stringify([newNotification, ...notifications]));
      window.dispatchEvent(new Event('notificationUpdate'));
      
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const handleQuickReply = (text) => {
    handleSendMessage(text);
  };

  const handleSendPrescription = () => {
    if (!selectedUser) return;
    
    const prescriptionMsg = {
      id: `pres_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: `📋 Prescription sent to ${selectedUser.name}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderType: currentUser.type,
      receiverId: selectedUser.id,
      timestamp: new Date().toISOString(),
      isPrescription: true,
      prescriptionDetails: {
        id: `PRES-${Date.now()}`,
        patientId: selectedUser.id,
        patientName: selectedUser.name,
        doctorId: currentUser.id,
        doctorName: currentUser.name,
        date: new Date().toLocaleDateString(),
        status: 'sent'
      },
      read: false
    };
    
    const updatedMessages = [...messages, prescriptionMsg];
    setMessages(updatedMessages);
    saveMessages(selectedUser.id, updatedMessages);
    setShowPrescriptionModal(false);
    
    // Create notification
    createMessageNotification(selectedUser, prescriptionMsg);
  };

  const handleScheduleAppointment = () => {
    if (!selectedUser) return;
    
    const appointmentMsg = {
      id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: `📅 Appointment scheduled with ${selectedUser.name}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderType: currentUser.type,
      receiverId: selectedUser.id,
      timestamp: new Date().toISOString(),
      isAppointment: true,
      appointmentDetails: {
        id: `APT-${Date.now()}`,
        patientId: currentUser.type === 'patient' ? currentUser.id : selectedUser.id,
        patientName: currentUser.type === 'patient' ? currentUser.name : selectedUser.name,
        doctorId: currentUser.type === 'doctor' ? currentUser.id : selectedUser.id,
        doctorName: currentUser.type === 'doctor' ? currentUser.name : selectedUser.name,
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '10:00 AM',
        type: 'Consultation',
        status: 'pending'
      },
      read: false
    };
    
    const updatedMessages = [...messages, appointmentMsg];
    setMessages(updatedMessages);
    saveMessages(selectedUser.id, updatedMessages);
    setShowAppointmentModal(false);
    
    // Create notification
    createMessageNotification(selectedUser, appointmentMsg);
  };

  const handleAttachFile = () => {
    // In a real app, this would open file picker
    alert('File attachment feature coming soon!');
  };

  const handleVideoCall = () => {
    if (!selectedUser) return;
    
    const callMsg = {
      id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: `📹 Video call initiated with ${selectedUser.name}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderType: currentUser.type,
      receiverId: selectedUser.id,
      timestamp: new Date().toISOString(),
      isVideoCall: true,
      read: false
    };
    
    const updatedMessages = [...messages, callMsg];
    setMessages(updatedMessages);
    saveMessages(selectedUser.id, updatedMessages);
    
    // Simulate video call
    alert(`Starting video call with ${selectedUser.name}...`);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return 'bg-emerald-500';
      case 'offline': return 'bg-gray-400';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getUserIcon = (userType) => {
    switch(userType) {
      case 'doctor': return <FaUserMd className="text-blue-500" size={12} />;
      case 'patient': return <FaUserInjured className="text-green-500" size={12} />;
      case 'admin': return <FaShieldAlt className="text-purple-500" size={12} />;
      default: return <FaUser className="text-gray-500" size={12} />;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
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
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Quick replies based on user type
  useEffect(() => {
    if (!selectedUser) return;

    const options = [];
    
    if (currentUser.type === 'doctor' && selectedUser.type === 'patient') {
      options.push(
        { text: 'How are you feeling today?', value: 'How are you feeling today? Any improvement?' },
        { text: 'Please share your reports', value: 'Could you please share your recent medical reports?' },
        { text: 'Medication update', value: 'Any side effects from the medication?' },
        { text: 'Schedule follow-up', value: 'Let me schedule a follow-up appointment for you.' },
        { text: 'Prescription refill', value: 'I can send a prescription refill for you.' }
      );
    } else if (currentUser.type === 'patient' && selectedUser.type === 'doctor') {
      options.push(
        { text: 'I have symptoms', value: 'I have been experiencing some symptoms and need advice.' },
        { text: 'Prescription refill', value: 'I need a refill for my prescription.' },
        { text: 'Appointment question', value: 'I have a question about my upcoming appointment.' },
        { text: 'Reports attached', value: 'I have attached my medical reports for your review.' },
        { text: 'Feeling unwell', value: 'I am not feeling well. Can you advise?' }
      );
    } else if (currentUser.type === 'admin') {
      options.push(
        { text: 'How can I help?', value: 'How can I help you today?' },
        { text: 'Technical issue', value: 'Are you experiencing any technical issues?' },
        { text: 'Account help', value: 'Do you need help with your account?' },
        { text: 'Report problem', value: 'Please report the issue you are facing.' }
      );
    } else if (currentUser.type === 'doctor' && selectedUser.type === 'doctor') {
      options.push(
        { text: 'Consultation request', value: 'I would like to consult with you about a patient.' },
        { text: 'Case discussion', value: 'Can we discuss a patient case?' }
      );
    }

    setQuickReplyOptions(options);
  }, [selectedUser, currentUser]);

  if (loading) {
    return (
      <div className={`fixed inset-0 z-[100] flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat system...</p>
        </div>
      </div>
    );
  }

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
            
            <div className="relative mb-4">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search chats..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white shadow-sm border border-slate-100 focus:ring-2 focus:ring-emerald-500'}`}
              />
            </div>

            {/* User Type Filters */}
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => setUserFilter('all')}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                  userFilter === 'all' 
                    ? 'bg-teal-500 text-white' 
                    : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}
              >
                All ({allUsers.length})
              </button>
              <button 
                onClick={() => setUserFilter('doctor')}
                className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1 transition-all ${
                  userFilter === 'doctor' 
                    ? 'bg-blue-500 text-white' 
                    : darkMode ? 'bg-gray-800 text-blue-300' : 'bg-blue-100 text-blue-600'
                }`}
              >
                <FaUserMd size={10} /> Doctors ({allUsers.filter(u => u.type === 'doctor').length})
              </button>
              <button 
                onClick={() => setUserFilter('patient')}
                className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1 transition-all ${
                  userFilter === 'patient' 
                    ? 'bg-green-500 text-white' 
                    : darkMode ? 'bg-gray-800 text-green-300' : 'bg-green-100 text-green-600'
                }`}
              >
                <FaUserInjured size={10} /> Patients ({allUsers.filter(u => u.type === 'patient').length})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => {
                const isOnline = onlineUsers.includes(user.id);
                const unread = chatHistory[user.id]?.unreadCount || 0;
                
                return (
                  <div 
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-4 rounded-[1.5rem] cursor-pointer transition-all flex items-center gap-4 ${
                      selectedUser?.id === user.id 
                        ? (darkMode ? 'bg-emerald-600 shadow-emerald-900/20' : 'bg-emerald-600 text-white shadow-xl shadow-emerald-100') 
                        : (darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-white text-slate-600')
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img 
                        src={user.image} 
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/20" 
                        alt={user.name}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${user.name?.charAt(0)}&background=0D9488&color=fff`;
                        }}
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(isOnline ? 'online' : 'offline')} border-4 border-white rounded-full`} />
                      <div className="absolute -top-1 -left-1 p-1 bg-white rounded-full shadow-sm">
                        {getUserIcon(user.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm truncate">{user.name}</p>
                        {chatHistory[user.id]?.lastMessageTime && (
                          <p className={`text-[9px] ${selectedUser?.id === user.id ? 'text-white/80' : 'text-gray-400'}`}>
                            {formatTime(chatHistory[user.id].lastMessageTime)}
                          </p>
                        )}
                      </div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${selectedUser?.id === user.id ? 'text-white/80' : 'opacity-60'}`}>
                        {user.role}
                      </p>
                      {user.specialization && (
                        <p className={`text-[9px] truncate ${selectedUser?.id === user.id ? 'text-white/60' : 'text-gray-500'}`}>
                          <FaStethoscope className="inline mr-1" size={8} />
                          {user.specialization}
                        </p>
                      )}
                      {chatHistory[user.id]?.lastMessage && (
                        <p className={`text-[9px] truncate mt-1 ${selectedUser?.id === user.id ? 'text-white/70' : 'text-gray-500'}`}>
                          {chatHistory[user.id].lastMessage}
                        </p>
                      )}
                    </div>
                    
                    {unread > 0 && (
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold">
                        {unread}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaUser className="text-4xl mx-auto mb-2 opacity-30" />
                <p className="text-sm">No users found</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedUser ? (
          <div className="flex-1 flex flex-col bg-transparent relative">
            {/* Chat Header */}
            <div className={`p-6 flex items-center justify-between border-b ${darkMode ? 'border-gray-800' : 'border-slate-100'}`}>
              <div className="flex items-center gap-4">
                {/* Back button for mobile */}
                <button 
                  onClick={() => setSelectedUser(null)} 
                  className="md:hidden p-2 text-slate-400 hover:text-emerald-500"
                >
                  <FaChevronLeft size={20} />
                </button>
                
                <div className="relative">
                  <img 
                    src={selectedUser.image} 
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-50" 
                    alt={selectedUser.name}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${selectedUser.name?.charAt(0)}&background=0D9488&color=fff`;
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm">
                    {getUserIcon(selectedUser.type)}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-black text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      {selectedUser.name}
                    </h3>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(onlineUsers.includes(selectedUser.id) ? 'online' : 'offline')} animate-pulse`} />
                  </div>
                  
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    {selectedUser.role}
                  </p>
                  
                  {selectedUser.specialization && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <FaStethoscope size={10} />
                      {selectedUser.specialization}
                      {selectedUser.hospital && ` • ${selectedUser.hospital}`}
                    </p>
                  )}
                  
                  {selectedUser.bloodGroup && (
                    <p className="text-[9px] text-gray-400">
                      Blood: {selectedUser.bloodGroup} • Age: {selectedUser.age}
                    </p>
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
                      <FaPrescription size={16} />
                    </button>
                    <button 
                      onClick={() => setShowAppointmentModal(true)}
                      className={`p-3 rounded-xl transition-all flex items-center gap-2 ${darkMode ? 'hover:bg-gray-800 text-green-400' : 'hover:bg-green-50 text-green-600'}`}
                      title="Schedule Appointment"
                    >
                      <FaCalendarCheck size={16} />
                    </button>
                  </>
                )}
                
                {currentUser.type === 'patient' && selectedUser.type === 'doctor' && (
                  <button 
                    onClick={() => setShowAppointmentModal(true)}
                    className={`p-3 rounded-xl transition-all flex items-center gap-2 ${darkMode ? 'hover:bg-gray-800 text-green-400' : 'hover:bg-green-50 text-green-600'}`}
                    title="Book Appointment"
                  >
                    <FaCalendarCheck size={16} />
                    <span className="text-xs font-bold hidden sm:inline">Book</span>
                  </button>
                )}
                
                <button 
                  onClick={handleVideoCall}
                  className={`p-3 rounded-xl transition-all ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-slate-100 text-slate-400'}`}
                  title="Video Call"
                >
                  <FaVideoIcon size={16} />
                </button>
                
                <button 
                  onClick={() => alert(`Email: ${selectedUser.email}\nPhone: ${selectedUser.phone || 'Not available'}`)}
                  className={`p-3 rounded-xl transition-all ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-slate-100 text-slate-400'}`}
                  title="Contact Info"
                >
                  <FaInfoCircle size={16} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <FaPaperPlane size={24} className="text-emerald-500" />
                  </div>
                  <h3 className="font-bold text-gray-600">No messages yet</h3>
                  <p className="text-sm text-gray-400 text-center max-w-sm mt-2">
                    Start the conversation with {selectedUser.name}. 
                    {currentUser.type === 'doctor' && selectedUser.type === 'patient' && 
                      ' You can send prescriptions and schedule appointments.'}
                  </p>
                  
                  {/* Quick Replies for Empty Chat */}
                  {quickReplyOptions.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 gap-2 w-full max-w-md">
                      {quickReplyOptions.slice(0, 4).map((option, index) => (
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
                  {messages.map((msg, index) => {
                    const isCurrentUser = msg.senderId === currentUser.id;
                    const showDate = index === 0 || 
                      new Date(msg.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();
                    
                    return (
                      <React.Fragment key={msg.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="px-3 py-1 bg-gray-200 text-gray-600 text-[10px] font-bold rounded-full">
                              {new Date(msg.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        
                        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] p-4 rounded-[1.5rem] shadow-sm relative ${
                            isCurrentUser 
                              ? 'bg-emerald-600 text-white rounded-tr-none shadow-emerald-200/50' 
                              : (darkMode ? 'bg-gray-800 text-white rounded-tl-none border border-gray-700' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none')
                          }`}>
                            
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
                            
                            {msg.isVideoCall && (
                              <div className="flex items-center gap-2 mb-2 p-2 bg-purple-500/20 rounded-lg">
                                <FaVideoIcon className="text-purple-500" />
                                <span className="text-xs font-bold">VIDEO CALL</span>
                              </div>
                            )}
                            
                            <p className="text-sm font-semibold leading-relaxed">{msg.text}</p>
                            
                            {/* Prescription Details */}
                            {msg.prescriptionDetails && (
                              <div className="mt-2 p-2 bg-white/10 rounded-lg text-xs">
                                <p>Prescription ID: {msg.prescriptionDetails.id}</p>
                                <p>Date: {msg.prescriptionDetails.date}</p>
                                <button 
                                  onClick={() => navigate('/prescriptions')}
                                  className="mt-1 text-emerald-300 hover:text-emerald-200 text-[9px] font-bold"
                                >
                                  View Details →
                                </button>
                              </div>
                            )}
                            
                            {/* Appointment Details */}
                            {msg.appointmentDetails && (
                              <div className="mt-2 p-2 bg-white/10 rounded-lg text-xs">
                                <p>Date: {msg.appointmentDetails.date}</p>
                                <p>Time: {msg.appointmentDetails.time}</p>
                                <p>Type: {msg.appointmentDetails.type}</p>
                                <button 
                                  onClick={() => navigate('/appointments')}
                                  className="mt-1 text-emerald-300 hover:text-emerald-200 text-[9px] font-bold"
                                >
                                  View Appointment →
                                </button>
                              </div>
                            )}
                            
                            <div className={`flex items-center justify-between mt-2 ${isCurrentUser ? 'text-emerald-100' : 'text-gray-400'}`}>
                              <p className="text-[9px] font-black tracking-widest opacity-60">
                                {formatMessageTime(msg.timestamp)}
                              </p>
                              {isCurrentUser && (
                                <div className="flex items-center gap-1">
                                  {msg.delivered && !msg.read && (
                                    <FaCheck className="text-emerald-300" size={8} />
                                  )}
                                  {msg.read && (
                                    <FaCheckCircle className="text-emerald-300" size={8} />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
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
                <button 
                  onClick={handleAttachFile}
                  className="p-2 text-slate-300 hover:text-emerald-500 transition-colors"
                  title="Attach File"
                >
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
                  disabled={!newMessage.trim()}
                  className={`bg-emerald-600 text-white p-4 rounded-full transition-all ${
                    newMessage.trim() 
                      ? 'hover:bg-emerald-500 hover:rotate-12 active:scale-90 shadow-xl shadow-emerald-200' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
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
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaUserMd className="text-blue-600" size={20} />
                </div>
                <p className="text-xs font-bold text-gray-700">Doctors</p>
                <p className="text-lg font-black text-gray-900">
                  {allUsers.filter(u => u.type === 'doctor').length}
                </p>
              </div>
              
              <div className={`p-4 rounded-2xl text-center ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaUserInjured className="text-green-600" size={20} />
                </div>
                <p className="text-xs font-bold text-gray-700">Patients</p>
                <p className="text-lg font-black text-gray-900">
                  {allUsers.filter(u => u.type === 'patient').length}
                </p>
              </div>
              
              <div className={`p-4 rounded-2xl text-center ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaShieldAlt className="text-purple-600" size={20} />
                </div>
                <p className="text-xs font-bold text-gray-700">Admins</p>
                <p className="text-lg font-black text-gray-900">
                  {allUsers.filter(u => u.type === 'admin').length}
                </p>
              </div>
            </div>
            
            <p className="text-xs text-gray-400 mt-8">
              {allUsers.length} total users available
            </p>
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
                    <img 
                      src={selectedUser?.image} 
                      className="w-10 h-10 rounded-full object-cover" 
                      alt={selectedUser?.name}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${selectedUser?.name?.charAt(0)}&background=0D9488&color=fff`;
                      }}
                    />
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
                  rows="4"
                  placeholder="Add prescription details, medicines, dosage instructions..."
                  defaultValue="Take medication as prescribed. Follow-up in 7 days if symptoms persist."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Medicines
                </label>
                <div className="space-y-2">
                  <input type="text" placeholder="Medicine name & dosage" className="w-full p-2 border border-gray-300 rounded-lg" />
                  <input type="text" placeholder="Instructions" className="w-full p-2 border border-gray-300 rounded-lg" />
                </div>
                <button className="mt-2 text-sm text-emerald-600 hover:text-emerald-700">
                  + Add another medicine
                </button>
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
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentUser.type === 'doctor' ? 'Schedule Appointment' : 'Book Appointment'}
              </h3>
              <button onClick={() => setShowAppointmentModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentUser.type === 'doctor' ? 'Patient' : 'Doctor'}
                </label>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedUser?.image} 
                      className="w-10 h-10 rounded-full object-cover" 
                      alt={selectedUser?.name}
                    />
                    <div>
                      <p className="font-bold">{selectedUser?.name}</p>
                      <p className="text-sm text-gray-500">{selectedUser?.role}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    defaultValue={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                    className="w-full p-2 border border-gray-300 rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg">
                    <option>09:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>02:00 PM</option>
                    <option>03:00 PM</option>
                    <option>04:00 PM</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Appointment Type
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-lg">
                  <option>New Consultation</option>
                  <option>Follow-up</option>
                  <option>Emergency</option>
                  <option>Routine Checkup</option>
                  <option>Video Consultation</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Visit
                </label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows="2"
                  placeholder="Brief description..."
                />
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
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  {currentUser.type === 'doctor' ? 'Schedule' : 'Book Appointment'}
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