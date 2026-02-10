import React, { useState, useEffect, useRef } from 'react';
import { 
  FaVideo, 
  FaMicrophone, 
  FaPhone, 
  FaUserMd, 
  FaUser, 
  FaCopy, 
  FaComment,
  FaPaperPlane,
  FaExpand,
  FaShareSquare,
  FaRecordVinyl,
  FaStop,
  FaVolumeUp,
  FaVolumeMute,
  FaUserFriends,
  FaCalendarCheck,
  FaStethoscope,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHeartbeat
} from 'react-icons/fa';

const VideoConsultation = ({ userType, userData, darkMode }) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [consultationInfo, setConsultationInfo] = useState(null);
  const [timer, setTimer] = useState(0);
  const [consultationLink, setConsultationLink] = useState('');
  
  const videoRef = useRef(null);
  const localVideoRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // Initialize consultation data
  useEffect(() => {
    // Generate unique consultation link
    const link = `https://healthai.com/video/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setConsultationLink(link);
    
    // Set consultation info
    setConsultationInfo({
      id: 'CONS-' + Date.now().toString().slice(-6),
      doctorName: 'Dr. Sarah Johnson',
      patientName: userData?.name || 'Patient',
      specialization: 'General Physician',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'Follow-up Consultation',
      duration: '30 minutes',
      status: 'in-progress'
    });
    
    // Initialize participants
    setParticipants([
      {
        id: 1,
        name: userData?.name || 'Patient',
        role: userType === 'doctor' ? 'Doctor' : 'Patient',
        isVideoOn: true,
        isAudioOn: true,
        isSpeaking: false,
        avatarColor: userType === 'doctor' ? 'bg-teal-500' : 'bg-blue-500'
      },
      {
        id: 2,
        name: userType === 'doctor' ? 'Patient' : 'Dr. Sarah Johnson',
        role: userType === 'doctor' ? 'Patient' : 'Doctor',
        isVideoOn: true,
        isAudioOn: true,
        isSpeaking: true,
        avatarColor: userType === 'doctor' ? 'bg-blue-500' : 'bg-teal-500'
      }
    ]);
    
    // Initialize chat with welcome messages
    setChatMessages([
      {
        id: 1,
        sender: 'system',
        message: 'Video consultation started. All participants joined.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 2,
        sender: 'doctor',
        message: 'Hello! How are you feeling today?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    
    // Start timer
    const timerInterval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [userType, userData]);
  
  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const copyLink = () => {
    navigator.clipboard.writeText(consultationLink);
    alert('Consultation link copied to clipboard!');
  };
  
  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: chatMessages.length + 1,
        sender: userType,
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, message]);
      setNewMessage('');
    }
  };
  
  const startRecording = () => {
    setIsRecording(true);
    alert('Consultation recording started. Recording indicator is now visible to all participants.');
  };
  
  const stopRecording = () => {
    setIsRecording(false);
    alert('Consultation recording stopped. The recording will be available in your medical records.');
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  const shareScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      setIsScreenSharing(true);
      alert('Screen sharing started. Click "Stop Sharing" to end.');
      
      // Handle stop sharing
      stream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
      };
    } catch (err) {
      console.error('Error sharing screen:', err);
      alert('Failed to share screen. Please check permissions.');
    }
  };
  
  const endConsultation = () => {
    if (window.confirm('Are you sure you want to end this consultation?')) {
      alert('Consultation ended successfully. You will be redirected to the dashboard.');
      // In real app, navigate to dashboard
      window.location.href = userType === 'doctor' ? '/doctor-portal' : '/dashboard';
    }
  };
  
  const toggleParticipantAudio = (participantId) => {
    setParticipants(participants.map(p => 
      p.id === participantId ? { ...p, isAudioOn: !p.isAudioOn } : p
    ));
  };
  
  const toggleParticipantVideo = (participantId) => {
    setParticipants(participants.map(p => 
      p.id === participantId ? { ...p, isVideoOn: !p.isVideoOn } : p
    ));
  };
  
  const quickReactions = [
    { emoji: '👍', label: 'Yes' },
    { emoji: '👎', label: 'No' },
    { emoji: '🤔', label: 'Thinking' },
    { emoji: '😊', label: 'Good' },
    { emoji: '🤕', label: 'Pain' }
  ];
  
  const sendReaction = (reaction) => {
    const message = {
      id: chatMessages.length + 1,
      sender: userType,
      message: reaction.emoji,
      isReaction: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages([...chatMessages, message]);
  };
  
  const medicalTools = [
    { name: 'Prescription', icon: '📝', action: () => alert('Open prescription pad') },
    { name: 'Medical Chart', icon: '📊', action: () => alert('Open medical chart') },
    { name: 'Vitals Monitor', icon: '❤️', action: () => alert('Open vitals monitor') },
    { name: 'Images', icon: '🖼️', action: () => alert('View medical images') },
    { name: 'Notes', icon: '📋', action: () => alert('Take notes') }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50'}`}>
      {/* Consultation Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
                <FaVideo className="text-teal-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Video Consultation</h1>
                <div className="flex items-center space-x-4 text-sm opacity-80">
                  <span className="flex items-center">
                    <FaClock className="mr-1" />
                    {formatTime(timer)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${consultationInfo?.status === 'in-progress' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {consultationInfo?.status}
                  </span>
                  {isRecording && (
                    <span className="flex items-center text-red-600">
                      <FaRecordVinyl className="animate-pulse mr-1" />
                      Recording
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-2 md:mt-0 flex items-center space-x-4">
              <div className="hidden md:block text-sm">
                <div>Consultation ID: <span className="font-mono">{consultationInfo?.id}</span></div>
                <div className="opacity-80">{consultationInfo?.date} • {consultationInfo?.time}</div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyLink}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-teal-600 text-teal-600 hover:bg-teal-50"
                  title="Copy consultation link"
                >
                  <FaCopy />
                  <span className="hidden md:inline">Copy Link</span>
                </button>
                
                <button
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className="p-2 rounded-lg border hover:bg-gray-100"
                  title={isChatOpen ? 'Close chat' : 'Open chat'}
                >
                  <FaComment />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Video Section - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Video Container */}
            <div className={`relative rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-black'}`}>
              {/* Main Video Feed */}
              <div className="aspect-video relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  {participants.find(p => p.role === 'Doctor')?.isVideoOn ? (
                    <div className="text-center">
                      {/* Doctor's video feed would go here */}
                      <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-4xl">
                        D
                      </div>
                      <p className="text-white text-lg">Dr. Sarah Johnson</p>
                      <p className="text-gray-300">Live Video</p>
                    </div>
                  ) : (
                    <div className="text-center text-white">
                      <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                        <FaUserMd className="text-4xl" />
                      </div>
                      <p className="text-lg">Camera is off</p>
                    </div>
                  )}
                </div>
                
                {/* Self View (Picture-in-Picture) */}
                <div className="absolute bottom-4 right-4 w-48 h-32 rounded-lg overflow-hidden border-2 border-white">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center">
                        {userData?.name?.charAt(0) || 'P'}
                      </div>
                      <p className="text-sm">You</p>
                    </div>
                  </div>
                </div>
                
                {/* Recording Indicator */}
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-2 rounded-lg">
                    <FaRecordVinyl className="animate-pulse" />
                    <span className="font-medium">Recording</span>
                  </div>
                )}
                
                {/* Consultation Timer */}
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg">
                  <div className="font-mono text-lg">{formatTime(timer)}</div>
                </div>
              </div>
              
              {/* Call Controls */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-4">
                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`p-4 rounded-full ${isVideoOn ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
                  title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
                >
                  <FaVideo />
                </button>
                
                <button
                  onClick={() => setIsAudioOn(!isAudioOn)}
                  className={`p-4 rounded-full ${isAudioOn ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
                  title={isAudioOn ? 'Mute microphone' : 'Unmute microphone'}
                >
                  {isAudioOn ? <FaVolumeUp /> : <FaVolumeMute />}
                </button>
                
                <button
                  onClick={shareScreen}
                  className={`p-4 rounded-full ${isScreenSharing ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                  title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                >
                  <FaShareSquare />
                </button>
                
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-4 rounded-full ${isRecording ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                  title={isRecording ? 'Stop recording' : 'Start recording'}
                >
                  {isRecording ? <FaStop /> : <FaRecordVinyl />}
                </button>
                
                <button
                  onClick={toggleFullscreen}
                  className="p-4 rounded-full bg-gray-800 text-white hover:bg-gray-700"
                  title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  <FaExpand />
                </button>
                
                <button
                  onClick={endConsultation}
                  className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700"
                  title="End consultation"
                >
                  <FaPhone className="rotate-135" />
                </button>
              </div>
            </div>
            
            {/* Quick Reactions */}
            <div className={`rounded-2xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
              <h3 className="font-bold mb-3 flex items-center">
                <FaHeartbeat className="mr-2 text-teal-600" />
                Quick Reactions
              </h3>
              <div className="flex space-x-3">
                {quickReactions.map((reaction, index) => (
                  <button
                    key={index}
                    onClick={() => sendReaction(reaction)}
                    className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title={reaction.label}
                  >
                    <span className="text-2xl mb-1">{reaction.emoji}</span>
                    <span className="text-xs opacity-80">{reaction.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Medical Tools - For Doctors */}
            {userType === 'doctor' && (
              <div className={`rounded-2xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                <h3 className="font-bold mb-3 flex items-center">
                  <FaStethoscope className="mr-2 text-teal-600" />
                  Medical Tools
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {medicalTools.map((tool, index) => (
                    <button
                      key={index}
                      onClick={tool.action}
                      className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title={tool.name}
                    >
                      <span className="text-2xl mb-1">{tool.icon}</span>
                      <span className="text-xs opacity-80">{tool.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Consultation Info */}
            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
              <h3 className="font-bold mb-4 flex items-center">
                <FaCalendarCheck className="mr-2 text-teal-600" />
                Consultation Details
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <div className="text-sm opacity-80 mb-1">Patient</div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {consultationInfo?.patientName?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <div className="font-bold">{consultationInfo?.patientName}</div>
                        <div className="text-sm opacity-80">Patient ID: PAT001</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm opacity-80 mb-1">Doctor</div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                        D
                      </div>
                      <div>
                        <div className="font-bold">{consultationInfo?.doctorName}</div>
                        <div className="text-sm opacity-80">{consultationInfo?.specialization}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm opacity-80">Type</div>
                    <div className="font-medium">{consultationInfo?.type}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm opacity-80">Scheduled Duration</div>
                    <div className="font-medium">{consultationInfo?.duration}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm opacity-80">Date & Time</div>
                    <div className="font-medium">{consultationInfo?.date} • {consultationInfo?.time}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm opacity-80">Connection Status</div>
                    <div className="flex items-center text-green-600">
                      <FaCheckCircle className="mr-2" />
                      <span>Excellent</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Chat & Participants */}
          <div className="space-y-6">
            {/* Participants Panel */}
            <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
              <div className="p-4 border-b dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold flex items-center">
                    <FaUserFriends className="mr-2 text-teal-600" />
                    Participants ({participants.length})
                  </h3>
                </div>
              </div>
              
              <div className="p-4">
                {participants.map(participant => (
                  <div key={participant.id} className="flex items-center justify-between py-3 border-b last:border-b-0 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${participant.avatarColor} rounded-full flex items-center justify-center text-white font-bold`}>
                        {participant.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{participant.name}</div>
                        <div className="text-sm opacity-80 flex items-center">
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700">
                            {participant.role}
                          </span>
                          {participant.isSpeaking && (
                            <span className="ml-2 flex items-center text-green-600">
                              <FaVolumeUp className="mr-1 text-xs" />
                              Speaking
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleParticipantAudio(participant.id)}
                        className={`p-2 rounded ${participant.isAudioOn ? 'text-gray-600 dark:text-gray-300' : 'text-red-600'}`}
                        title={participant.isAudioOn ? 'Mute' : 'Unmute'}
                      >
                        {participant.isAudioOn ? <FaVolumeUp /> : <FaVolumeMute />}
                      </button>
                      
                      <button
                        onClick={() => toggleParticipantVideo(participant.id)}
                        className={`p-2 rounded ${participant.isVideoOn ? 'text-gray-600 dark:text-gray-300' : 'text-red-600'}`}
                        title={participant.isVideoOn ? 'Turn off camera' : 'Turn on camera'}
                      >
                        <FaVideo />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Panel */}
            <div className={`rounded-2xl overflow-hidden flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`} style={{ height: '500px' }}>
              <div className="p-4 border-b dark:border-gray-700">
                <h3 className="font-bold flex items-center">
                  <FaComment className="mr-2 text-teal-600" />
                  Consultation Chat
                </h3>
              </div>
              
              {/* Chat Messages */}
              <div 
                ref={chatContainerRef}
                className="flex-1 p-4 overflow-y-auto"
                style={{ maxHeight: '400px' }}
              >
                <div className="space-y-4">
                  {chatMessages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`${msg.sender === userType ? 'text-right' : ''} ${msg.sender === 'system' ? 'text-center' : ''}`}
                    >
                      <div className={`inline-block max-w-xs lg:max-w-md rounded-lg p-3 ${msg.sender === 'system' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : msg.sender === userType ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                        {msg.isReaction ? (
                          <div className="text-3xl text-center">{msg.message}</div>
                        ) : (
                          <>
                            <div className="font-medium mb-1">
                              {msg.sender === 'system' ? 'System' : msg.sender === 'doctor' ? 'Dr. Sarah Johnson' : 'You'}
                            </div>
                            <div>{msg.message}</div>
                          </>
                        )}
                        <div className="text-xs opacity-70 mt-2">{msg.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Chat Input */}
              <div className="p-4 border-t dark:border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className={`flex-1 px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-100' : 'border border-gray-300'}`}
                  />
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center space-x-2"
                  >
                    <FaPaperPlane />
                    <span className="hidden md:inline">Send</span>
                  </button>
                </div>
                
                {/* Quick Message Buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {['Hello!', 'I understand', 'Can you repeat?', 'Thank you', 'Goodbye'].map((text, index) => (
                    <button
                      key={index}
                      onClick={() => setNewMessage(text)}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className={`rounded-2xl p-4 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg border border-yellow-200'}`}>
              <div className="flex items-center space-x-2 mb-3">
                <FaExclamationTriangle className="text-yellow-500" />
                <h4 className="font-bold">Important Notes</h4>
              </div>
              
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">•</span>
                  <span>This consultation is being recorded for medical records</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">•</span>
                  <span>Do not share sensitive information in the chat</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">•</span>
                  <span>Ensure you have a stable internet connection</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">•</span>
                  <span>Prescription will be sent after consultation ends</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Summary Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => alert('Generate consultation summary')}
          className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <FaCheckCircle />
          <span>End & Generate Summary</span>
        </button>
      </div>
    </div>
  );
};

export default VideoConsultation;