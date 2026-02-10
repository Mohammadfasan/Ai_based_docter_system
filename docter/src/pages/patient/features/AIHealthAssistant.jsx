// pages/AIHealthAssistant.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  FaRobot, FaUserMd, FaPills, FaExclamationTriangle, 
  FaHeart, FaBrain, FaLightbulb, FaClock,
  FaMicrophone, FaPaperPlane, FaHistory, FaTrash,
  FaStar, FaThumbsUp, FaThumbsDown, FaCopy
} from 'react-icons/fa';
import { IoIosSend } from 'react-icons/io';

const AIHealthAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI Health Assistant. How can I help you today? You can ask about symptoms, medicines, health tips, or anything related to your health.",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [quickQuestions, setQuickQuestions] = useState([
    "What are the symptoms of flu?",
    "Can I take ibuprofen with blood pressure medication?",
    "How to manage stress?",
    "What foods help with digestion?",
    "Should I see a doctor for my headache?"
  ]);
  
  const [features, setFeatures] = useState([
    {
      title: 'Symptom Checker',
      icon: <FaUserMd />,
      description: 'Describe your symptoms for AI analysis',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Medicine Interaction',
      icon: <FaPills />,
      description: 'Check if your medicines are safe to take together',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Health Tips',
      icon: <FaLightbulb />,
      description: 'Personalized health and wellness advice',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'Emergency Advice',
      icon: <FaExclamationTriangle />,
      description: 'Immediate guidance for urgent situations',
      color: 'from-red-500 to-red-600'
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "Based on your symptoms, it sounds like you might have a common cold. Make sure to rest, stay hydrated, and monitor your temperature. If symptoms worsen, consult a doctor.",
        "Ibuprofen can interact with blood pressure medication. It's best to consult your doctor before taking them together.",
        "For stress management, try deep breathing exercises, regular physical activity, and ensuring you get 7-8 hours of sleep each night.",
        "Foods like yogurt, bananas, ginger, and whole grains can help with digestion. Avoid spicy and fried foods if you're experiencing digestive issues.",
        "If your headache is severe, persistent, or accompanied by vision changes, fever, or confusion, you should see a doctor immediately."
      ];

      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage = {
        id: messages.length + 2,
        text: randomResponse,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickQuestion = (question) => {
    setInputText(question);
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsRecording(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        alert('Voice recognition failed. Please try again.');
      };

      recognition.start();
    } else {
      alert('Voice recognition is not supported in your browser.');
    }
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([
        {
          id: 1,
          text: "Hello! I'm your AI Health Assistant. How can I help you today? You can ask about symptoms, medicines, health tips, or anything related to your health.",
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    alert('Message copied to clipboard!');
  };

  const rateResponse = (messageId, rating) => {
    const updatedMessages = messages.map(msg => 
      msg.id === messageId ? { ...msg, rating } : msg
    );
    setMessages(updatedMessages);
    alert(`Response rated ${rating === 'good' ? '👍' : '👎'}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
              <FaRobot className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Health Assistant</h1>
              <p className="text-gray-600">24/7 medical guidance at your fingertips</p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <FaTrash />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat Container */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-bold text-gray-900">Online • 24/7 Available</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FaClock />
                  <span>Response time: ~2 seconds</span>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.sender === 'ai' && (
                        <div className="p-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full">
                          <FaRobot className="text-white text-sm" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="whitespace-pre-wrap">{message.text}</p>
                        <div className={`flex items-center justify-between mt-2 text-xs ${
                          message.sender === 'user' ? 'text-teal-100' : 'text-gray-500'
                        }`}>
                          <span>{message.timestamp}</span>
                          {message.sender === 'ai' && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => copyMessage(message.text)}
                                className="hover:opacity-80"
                                title="Copy"
                              >
                                <FaCopy />
                              </button>
                              <button
                                onClick={() => rateResponse(message.id, 'good')}
                                className={`hover:opacity-80 ${message.rating === 'good' ? 'text-green-500' : ''}`}
                                title="Good response"
                              >
                                <FaThumbsUp />
                              </button>
                              <button
                                onClick={() => rateResponse(message.id, 'bad')}
                                className={`hover:opacity-80 ${message.rating === 'bad' ? 'text-red-500' : ''}`}
                                title="Bad response"
                              >
                                <FaThumbsDown />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {message.sender === 'user' && (
                        <div className="p-1 bg-white/20 rounded-full">
                          <FaUserMd className="text-white text-sm" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-none p-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full">
                        <FaRobot className="text-white text-sm" />
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your health question here..."
                    rows="2"
                    className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                    <button
                      onClick={handleVoiceInput}
                      className={`p-2 rounded-full ${isRecording ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      title="Voice input"
                    >
                      <FaMicrophone className={isRecording ? 'animate-pulse' : ''} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className={`p-4 rounded-xl flex items-center justify-center ${
                    inputText.trim()
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <IoIosSend className="text-xl" />
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500 flex items-center space-x-4">
                <span>Press Enter to send • Shift+Enter for new line</span>
                <span className="flex items-center space-x-1">
                  <FaExclamationTriangle />
                  <span>For medical emergencies, call 108 immediately</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Sidebar */}
        <div className="space-y-6">
          {/* AI Assistant Features */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <FaBrain className="text-purple-600" />
              <span>AI Assistant Features</span>
            </h2>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl bg-gradient-to-r ${feature.color} text-white`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg">
                      {feature.icon}
                    </div>
                    <h3 className="font-bold">{feature.title}</h3>
                  </div>
                  <p className="text-sm opacity-90">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Health Statistics */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <FaHeart className="text-red-600" />
              <span>Your Health Stats</span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Conversations Today</span>
                <span className="font-bold text-gray-900">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Questions Answered</span>
                <span className="font-bold text-gray-900">42</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Symptom Checks</span>
                <span className="font-bold text-gray-900">15</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Medicine Interactions Checked</span>
                <span className="font-bold text-gray-900">7</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Assistant Accuracy</span>
                <span className="font-bold text-green-600">94%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
          </div>

          {/* Recent Topics */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <FaHistory className="text-blue-600" />
                <span>Recent Topics</span>
              </h2>
              <span className="text-sm text-gray-500">Last 7 days</span>
            </div>
            
            <div className="space-y-3">
              {['Cold & Flu Symptoms', 'Blood Pressure Management', 'Stress Relief Techniques', 'Healthy Diet Tips', 'Sleep Improvement'].map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <span className="text-gray-800">{topic}</span>
                  <button className="text-teal-600 hover:text-teal-700 text-sm">
                    Ask Again
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Need more help?</span>
                <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700">
                  Talk to Doctor
                </button>
              </div>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <FaExclamationTriangle className="text-yellow-600 text-xl mt-1" />
              <div>
                <h3 className="font-bold text-yellow-800 mb-2">Important Notice</h3>
                <p className="text-yellow-700 text-sm">
                  This AI assistant provides general health information and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIHealthAssistant;