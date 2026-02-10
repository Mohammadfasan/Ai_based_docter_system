import React, { useState, useEffect } from 'react';
import {
  FaStar, FaFilter, FaSearch, FaCalendarAlt,
  FaUserInjured, FaChartBar, FaDownload, FaEye,
  FaThumbsUp, FaCommentAlt, FaExclamationTriangle
} from 'react-icons/fa';

const DoctorFeedbackDashboard = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [filters, setFilters] = useState({
    rating: 'all',
    dateRange: 'all',
    search: ''
  });
  const [stats, setStats] = useState({
    averageRating: 0,
    totalFeedbacks: 0,
    recentFeedbacks: 0,
    positivePercentage: 0
  });

  // Mock data - In real app, this would come from API
  const mockFeedbacks = [
    {
      id: 1,
      patientName: 'Rajesh Kumar',
      patientId: 'PAT001',
      date: '2024-03-15',
      rating: 5,
      consultationType: 'Video Consultation',
      doctorName: 'Dr. Arvind Sharma',
      doctorId: 'DOC001',
      feedbackType: 'compliment',
      title: 'Excellent Consultation',
      message: 'Doctor was very patient and explained everything clearly. The diagnosis was accurate and treatment effective.',
      anonymous: false,
      responded: true,
      response: 'Thank you for your feedback. Glad to hear you had a good experience.'
    },
    {
      id: 2,
      patientName: 'Priya Menon',
      patientId: 'PAT002',
      date: '2024-03-14',
      rating: 4,
      consultationType: 'Clinic Visit',
      doctorName: 'Dr. Arvind Sharma',
      doctorId: 'DOC001',
      feedbackType: 'suggestion',
      title: 'Good but waiting time high',
      message: 'Doctor was knowledgeable but waiting time was 45 minutes. Maybe better scheduling?',
      anonymous: false,
      responded: false,
      response: null
    },
    {
      id: 3,
      patientName: 'Anonymous',
      patientId: 'PAT003',
      date: '2024-03-13',
      rating: 3,
      consultationType: 'Follow-up',
      doctorName: 'Dr. Arvind Sharma',
      doctorId: 'DOC001',
      feedbackType: 'general',
      title: 'Average experience',
      message: 'Prescription was clear but follow-up instructions could be better.',
      anonymous: true,
      responded: true,
      response: 'We appreciate your feedback. Will work on improving follow-up communication.'
    },
    {
      id: 4,
      patientName: 'Suresh Gupta',
      patientId: 'PAT004',
      date: '2024-03-12',
      rating: 5,
      consultationType: 'Emergency',
      doctorName: 'Dr. Arvind Sharma',
      doctorId: 'DOC001',
      feedbackType: 'compliment',
      title: 'Life-saving advice',
      message: 'Doctor was available immediately during emergency. Very professional.',
      anonymous: false,
      responded: false,
      response: null
    },
    {
      id: 5,
      patientName: 'Meena Patel',
      patientId: 'PAT005',
      date: '2024-03-11',
      rating: 2,
      consultationType: 'Video Consultation',
      doctorName: 'Dr. Arvind Sharma',
      doctorId: 'DOC001',
      feedbackType: 'technical',
      title: 'Video quality issue',
      message: 'Audio kept cutting during consultation. Had to switch to phone call.',
      anonymous: false,
      responded: true,
      response: 'We apologize for the technical issues. Our team is upgrading the video system.'
    },
    {
      id: 6,
      patientName: 'Anil Desai',
      patientId: 'PAT006',
      date: '2024-03-10',
      rating: 4,
      consultationType: 'Prescription Renewal',
      doctorName: 'Dr. Arvind Sharma',
      doctorId: 'DOC001',
      feedbackType: 'suggestion',
      title: 'Good online prescription system',
      message: 'E-prescription feature works well. Suggestion: add medication reminders.',
      anonymous: false,
      responded: true,
      response: 'Thank you for the suggestion! We are working on medication reminder feature.'
    }
  ];

  useEffect(() => {
    // In real app, fetch from API with doctor ID
    setFeedbacks(mockFeedbacks);
    setFilteredFeedbacks(mockFeedbacks);
    
    // Calculate stats
    const total = mockFeedbacks.length;
    const average = mockFeedbacks.reduce((sum, fb) => sum + fb.rating, 0) / total;
    const positive = mockFeedbacks.filter(fb => fb.rating >= 4).length;
    
    setStats({
      averageRating: average.toFixed(1),
      totalFeedbacks: total,
      recentFeedbacks: mockFeedbacks.filter(fb => {
        const fbDate = new Date(fb.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return fbDate > weekAgo;
      }).length,
      positivePercentage: ((positive / total) * 100).toFixed(0)
    });
  }, []);

  useEffect(() => {
    let filtered = [...feedbacks];
    
    // Filter by rating
    if (filters.rating !== 'all') {
      const ratingNum = parseInt(filters.rating);
      filtered = filtered.filter(fb => fb.rating === ratingNum);
    }
    
    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch(filters.dateRange) {
        case 'week': cutoffDate.setDate(now.getDate() - 7); break;
        case 'month': cutoffDate.setMonth(now.getMonth() - 1); break;
        case 'quarter': cutoffDate.setMonth(now.getMonth() - 3); break;
      }
      
      filtered = filtered.filter(fb => new Date(fb.date) >= cutoffDate);
    }
    
    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(fb => 
        fb.patientName.toLowerCase().includes(searchLower) ||
        fb.message.toLowerCase().includes(searchLower) ||
        fb.title.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredFeedbacks(filtered);
  }, [filters, feedbacks]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
  };

  const handleResponseSubmit = (feedbackId, response) => {
    // In real app, send to API
    const updated = feedbacks.map(fb => 
      fb.id === feedbackId 
        ? { ...fb, responded: true, response }
        : fb
    );
    setFeedbacks(updated);
    setSelectedFeedback(prev => prev?.id === feedbackId ? { ...prev, responded: true, response } : prev);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600 bg-green-50';
    if (rating === 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getFeedbackTypeIcon = (type) => {
    switch(type) {
      case 'compliment': return <FaThumbsUp className="text-green-500" />;
      case 'suggestion': return <FaCommentAlt className="text-blue-500" />;
      case 'technical': return <FaExclamationTriangle className="text-red-500" />;
      default: return <FaCommentAlt className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Feedback Dashboard</h1>
          <p className="text-gray-600">View and manage feedback from your patients</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="px-4 py-2 bg-white rounded-xl border border-gray-200">
              <span className="text-sm text-gray-500">Doctor:</span>
              <span className="ml-2 font-bold text-teal-700">Dr. Arvind Sharma</span>
            </div>
            <div className="px-4 py-2 bg-white rounded-xl border border-gray-200">
              <span className="text-sm text-gray-500">Doctor ID:</span>
              <span className="ml-2 font-bold text-gray-700">DOC001</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900">{stats.averageRating}/5</p>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl">
                <FaStar className="text-2xl text-amber-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Feedbacks</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalFeedbacks}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <FaCommentAlt className="text-2xl text-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Positive Feedback</p>
                <p className="text-3xl font-bold text-gray-900">{stats.positivePercentage}%</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <FaThumbsUp className="text-2xl text-green-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Week</p>
                <p className="text-3xl font-bold text-gray-900">{stats.recentFeedbacks}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <FaCalendarAlt className="text-2xl text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-400" />
                <span className="font-bold text-gray-700">Filters:</span>
              </div>
              
              <select 
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="all">All Ratings</option>
                <option value="5">★★★★★ (5)</option>
                <option value="4">★★★★ (4)</option>
                <option value="3">★★★ (3)</option>
                <option value="2">★★ (2)</option>
                <option value="1">★ (1)</option>
              </select>
              
              <select 
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="all">All Time</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 3 Months</option>
              </select>
            </div>
            
            <div className="relative">
              <FaSearch className="absolute left-4 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search feedback..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-12 pr-4 py-2 w-full md:w-64 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Feedback List and Details Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feedback List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Patient Feedback ({filteredFeedbacks.length})</h2>
              </div>
              
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {filteredFeedbacks.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No feedback found matching your filters</p>
                  </div>
                ) : (
                  filteredFeedbacks.map((feedback) => (
                    <div 
                      key={feedback.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedFeedback?.id === feedback.id ? 'bg-teal-50' : ''
                      }`}
                      onClick={() => handleViewFeedback(feedback)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`px-2 py-1 rounded-lg ${getRatingColor(feedback.rating)}`}>
                              <span className="font-bold">{feedback.rating}.0</span>
                              <FaStar className="inline ml-1 text-amber-500" />
                            </div>
                            <span className="text-sm text-gray-500">{feedback.date}</span>
                            <div className="flex items-center gap-1">
                              {getFeedbackTypeIcon(feedback.feedbackType)}
                              <span className="text-xs text-gray-500 capitalize">{feedback.feedbackType}</span>
                            </div>
                            {feedback.responded && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                Responded
                              </span>
                            )}
                          </div>
                          
                          <h3 className="font-bold text-gray-900 mb-1">{feedback.title}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2">{feedback.message}</p>
                          
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-2">
                              <FaUserInjured className="text-gray-400" />
                              <span className="text-sm text-gray-700">
                                {feedback.anonymous ? 'Anonymous Patient' : feedback.patientName}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {feedback.consultationType}
                            </div>
                          </div>
                        </div>
                        
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <FaEye className="text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Feedback Details Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 sticky top-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Feedback Details</h2>
              </div>
              
              {selectedFeedback ? (
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`px-3 py-1 rounded-xl ${getRatingColor(selectedFeedback.rating)}`}>
                        <span className="font-bold text-lg">{selectedFeedback.rating}.0</span>
                        <FaStar className="inline ml-1" />
                      </div>
                      <span className="text-sm text-gray-500">{selectedFeedback.date}</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{selectedFeedback.title}</h3>
                    
                    <div className="bg-gray-50 p-4 rounded-xl mb-4">
                      <p className="text-gray-700">{selectedFeedback.message}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-500">Patient</p>
                        <p className="font-bold text-gray-900">
                          {selectedFeedback.anonymous ? 'Anonymous' : selectedFeedback.patientName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Patient ID</p>
                        <p className="font-bold text-gray-900">{selectedFeedback.patientId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Consultation Type</p>
                        <p className="font-bold text-gray-900">{selectedFeedback.consultationType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Feedback Type</p>
                        <p className="font-bold text-gray-900 capitalize">{selectedFeedback.feedbackType}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Doctor's Response Section */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4">Your Response</h3>
                    
                    {selectedFeedback.responded ? (
                      <div className="bg-teal-50 p-4 rounded-xl mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-teal-700">Your Response:</span>
                          <span className="text-sm text-gray-500">Sent on {selectedFeedback.date}</span>
                        </div>
                        <p className="text-gray-700">{selectedFeedback.response}</p>
                        <button 
                          onClick={() => {
                            const newResponse = prompt("Edit your response:", selectedFeedback.response);
                            if (newResponse) {
                              handleResponseSubmit(selectedFeedback.id, newResponse);
                            }
                          }}
                          className="mt-3 text-sm text-teal-600 hover:text-teal-800"
                        >
                          Edit Response
                        </button>
                      </div>
                    ) : (
                      <div>
                        <textarea
                          id="doctorResponse"
                          placeholder="Type your response to the patient..."
                          rows="4"
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none mb-3"
                        />
                        <button
                          onClick={() => {
                            const response = document.getElementById('doctorResponse').value;
                            if (response.trim()) {
                              handleResponseSubmit(selectedFeedback.id, response);
                              document.getElementById('doctorResponse').value = '';
                            }
                          }}
                          className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors"
                        >
                          Send Response to Patient
                        </button>
                        <p className="text-sm text-gray-500 mt-2 text-center">
                          The patient will receive your response via notification
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-6 flex gap-3">
                    <button className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">
                      Mark as Resolved
                    </button>
                    <button className="flex-1 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                      Follow Up
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                    <FaEye className="text-3xl text-gray-400" />
                  </div>
                  <p className="text-gray-500">Select a feedback to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Export Feedback Reports</h3>
              <p className="text-sm text-gray-500">Download your feedback data for analysis</p>
            </div>
            <div className="flex gap-3">
              <button className="px-5 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 flex items-center gap-2">
                <FaDownload />
                CSV Export
              </button>
              <button className="px-5 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 flex items-center gap-2">
                <FaChartBar />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorFeedbackDashboard;