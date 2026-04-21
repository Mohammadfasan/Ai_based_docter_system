import React, { useState, useEffect } from 'react';
import {
  FaStar, FaFilter, FaSearch, FaCalendarAlt,
  FaUserInjured, FaChartBar, FaDownload, FaEye,
  FaThumbsUp, FaCommentAlt, FaExclamationTriangle,
  FaSpinner, FaCheckCircle, FaReply, FaUserMd
} from 'react-icons/fa';
import axios from 'axios';

const DoctorFeedbackDashboard = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseSuccess, setResponseSuccess] = useState('');
  const [responseError, setResponseError] = useState('');
  const [doctorInfo, setDoctorInfo] = useState(null);
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
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  const API_URL = 'http://localhost:5000/api';

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Get current doctor info from localStorage - FIXED VERSION
  const getCurrentDoctor = () => {
    try {
      // Try to get from multiple possible storage keys
      let userStr = localStorage.getItem('currentUser');
      
      if (!userStr) {
        userStr = localStorage.getItem('user');
      }
      
      if (!userStr) {
        userStr = sessionStorage.getItem('currentUser');
      }
      
      if (!userStr) {
        userStr = sessionStorage.getItem('user');
      }
      
      if (!userStr) {
        console.error('❌ No user data found in storage');
        return null;
      }
      
      const user = JSON.parse(userStr);
      console.log('📋 User data from storage:', user);
      
      // IMPORTANT: For doctor routes, use the custom doctorId (DOC-XXXX-XXX)
      // NOT the MongoDB _id
      let doctorId = null;
      
      // Priority order for doctor ID
      if (user.userId && user.userType === 'doctor') {
        // This is the custom doctor ID from the token
        doctorId = user.userId;
        console.log('✅ Using userId field (custom doctor ID):', doctorId);
      } else if (user.doctorId) {
        doctorId = user.doctorId;
        console.log('✅ Using doctorId field:', doctorId);
      } else if (user.doctor && user.doctor.doctorId) {
        doctorId = user.doctor.doctorId;
        console.log('✅ Using doctor.doctorId field:', doctorId);
      } else if (user._id && user.userType === 'doctor') {
        // Fallback - but this will likely fail
        console.warn('⚠️ No custom doctorId found, falling back to _id:', user._id);
        doctorId = user._id;
      }
      
      if (!doctorId) {
        console.error('❌ Could not extract doctor ID. User object:', user);
        return null;
      }
      
      const doctorData = {
        id: doctorId,
        doctorId: doctorId,
        name: user.name || user.fullName || user.doctor?.name || 'Unknown Doctor',
        email: user.email,
        userType: user.userType,
        specialization: user.specialization || user.doctor?.specialization || 'General',
        hospital: user.hospital || user.doctor?.hospital || 'General Hospital'
      };
      
      console.log('👨‍⚕️ Doctor info extracted:', doctorData);
      return doctorData;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  };

  // Get doctor info on component mount
  useEffect(() => {
    const doctor = getCurrentDoctor();
    setDoctorInfo(doctor);
  }, []);

  const doctor = doctorInfo;
  const doctorId = doctor?.doctorId; // Use the custom doctor ID, not MongoDB _id

  console.log('🆔 Custom Doctor ID for API calls:', doctorId);
  console.log('👨‍⚕️ Doctor name:', doctor?.name);

  // Fetch feedbacks from API
  const fetchFeedbacks = async (page = 1) => {
    if (!doctorId) {
      console.error('❌ No doctor ID found - Cannot fetch feedbacks');
      setLoading(false);
      setResponseError('Unable to identify doctor. Please logout and login again.');
      return;
    }

    setLoading(true);
    setResponseError('');
    
    try {
      const token = getToken();
      if (!token) {
        console.error('❌ No token found');
        setResponseError('Please login again');
        setLoading(false);
        return;
      }

      // Build query params
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 20);
      
      if (filters.rating !== 'all') {
        params.append('rating', filters.rating);
      }
      if (filters.dateRange !== 'all') {
        params.append('dateRange', filters.dateRange);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      const url = `${API_URL}/feedback/doctor/${doctorId}?${params.toString()}`;
      console.log('📡 Fetching URL:', url);
      
      const response = await axios.get(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 API Response:', response.data);

      if (response.data.success) {
        setFeedbacks(response.data.feedbacks || []);
        setFilteredFeedbacks(response.data.feedbacks || []);
        
        // Update stats from API response
        if (response.data.stats) {
          setStats({
            averageRating: response.data.stats.averageRating || 0,
            totalFeedbacks: response.data.stats.totalFeedbacks || 0,
            recentFeedbacks: response.data.stats.recentFeedbacks || 0,
            positivePercentage: response.data.stats.positivePercentage || 0
          });
        }
        
        setPagination({
          currentPage: response.data.pagination?.currentPage || 1,
          totalPages: response.data.pagination?.totalPages || 1,
          totalItems: response.data.pagination?.totalItems || 0,
          itemsPerPage: response.data.pagination?.itemsPerPage || 20
        });

        if (response.data.feedbacks?.length === 0) {
          console.log('ℹ️ No feedbacks found for this doctor');
        }
      } else {
        setResponseError(response.data.message || 'Failed to load feedbacks');
      }
    } catch (err) {
      console.error('❌ Error fetching feedbacks:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 404) {
        setResponseError(`Doctor not found. Please ensure you are logged in correctly. Doctor ID: ${doctorId}`);
      } else if (err.response?.status === 403) {
        setResponseError('You are not authorized to view these feedbacks. Please ensure you are logged in as the correct doctor.');
      } else if (err.response?.status === 401) {
        setResponseError('Session expired. Please login again.');
      } else if (err.code === 'ERR_NETWORK') {
        setResponseError('Cannot connect to server. Please make sure the backend server is running on port 5000.');
      } else {
        setResponseError(err.response?.data?.message || 'Failed to load feedbacks');
      }
    } finally {
      setLoading(false);
    }
  };

  // Apply filters locally
  useEffect(() => {
    if (feedbacks.length > 0) {
      let filtered = [...feedbacks];
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(fb => 
          (fb.patientName && fb.patientName.toLowerCase().includes(searchLower)) ||
          (fb.message && fb.message.toLowerCase().includes(searchLower)) ||
          (fb.title && fb.title.toLowerCase().includes(searchLower))
        );
      }
      
      setFilteredFeedbacks(filtered);
    }
  }, [filters.search, feedbacks]);

  // Initial fetch
  useEffect(() => {
    if (doctorId) {
      fetchFeedbacks();
    }
  }, [doctorId]);

  // Refetch when filters change
  useEffect(() => {
    if (doctorId) {
      fetchFeedbacks(1);
    }
  }, [filters.rating, filters.dateRange]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setResponseMessage('');
    setResponseSuccess('');
    setResponseError('');
  };

  const handleResponseSubmit = async (feedbackId, response) => {
    if (!response.trim()) {
      setResponseError('Please enter a response');
      return;
    }

    setSubmittingResponse(true);
    setResponseError('');
    setResponseSuccess('');

    try {
      const token = getToken();
      const responseData = await axios.put(
        `${API_URL}/feedback/${feedbackId}/respond`,
        { response },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (responseData.data.success) {
        setResponseSuccess('Response sent successfully!');
        
        // Update local state
        const updatedFeedbacks = feedbacks.map(fb => 
          fb._id === feedbackId 
            ? { ...fb, responded: true, response, responseDate: new Date() }
            : fb
        );
        setFeedbacks(updatedFeedbacks);
        
        setSelectedFeedback(prev => prev?._id === feedbackId 
          ? { ...prev, responded: true, response, responseDate: new Date() }
          : prev
        );
        
        setResponseMessage('');
        
        setTimeout(() => setResponseSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error submitting response:', err);
      if (err.response?.status === 403) {
        setResponseError('You can only respond to your own feedback');
      } else {
        setResponseError(err.response?.data?.message || 'Failed to submit response');
      }
    } finally {
      setSubmittingResponse(false);
    }
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
      case 'bug':
      case 'technical': return <FaExclamationTriangle className="text-red-500" />;
      default: return <FaCommentAlt className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Show loading while checking doctor info
  if (!doctorInfo && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-5xl text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading doctor information...</p>
        </div>
      </div>
    );
  }

  if (!doctorId || !doctorInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-md">
          <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please login as a doctor to view this dashboard.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading && feedbacks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-5xl text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your feedback dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Feedback Dashboard</h1>
          <p className="text-gray-600">View and manage feedback from your patients</p>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <span className="text-sm text-gray-500">Doctor:</span>
              <span className="ml-2 font-bold text-teal-700">Dr. {doctor?.name || 'Loading...'}</span>
            </div>
            <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <span className="text-sm text-gray-500">Specialization:</span>
              <span className="ml-2 font-bold text-gray-700">{doctor?.specialization || 'General'}</span>
            </div>
            <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <span className="text-sm text-gray-500">Doctor ID:</span>
              <span className="ml-2 font-mono text-xs text-gray-600">{doctorId}</span>
            </div>
          </div>
          
          {/* Security Info */}
          <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
            <p className="text-sm text-green-700 flex items-center gap-2">
              <FaCheckCircle className="text-green-600" />
              <strong>Secure Access:</strong> You are viewing feedback specifically for your practice only.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900">{stats.averageRating || 0}/5</p>
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
                <p className="text-3xl font-bold text-gray-900">{stats.totalFeedbacks || 0}</p>
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
                <p className="text-3xl font-bold text-gray-900">{stats.positivePercentage || 0}%</p>
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
                <p className="text-3xl font-bold text-gray-900">{stats.recentFeedbacks || 0}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <FaCalendarAlt className="text-2xl text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {responseError && !loading && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
            <FaExclamationTriangle />
            {responseError}
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
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
                <h2 className="text-xl font-bold text-gray-900">
                  Patient Feedback ({filteredFeedbacks.length} of {stats.totalFeedbacks})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {filteredFeedbacks.length === 0 ? (
                  <div className="p-8 text-center">
                    <FaCommentAlt className="text-4xl text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No feedback found matching your filters</p>
                    <p className="text-sm text-gray-400 mt-2">When patients leave feedback, it will appear here</p>
                  </div>
                ) : (
                  filteredFeedbacks.map((feedback) => (
                    <div 
                      key={feedback._id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedFeedback?._id === feedback._id ? 'bg-teal-50 border-l-4 border-teal-500' : ''
                      }`}
                      onClick={() => handleViewFeedback(feedback)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <div className={`px-2 py-1 rounded-lg ${getRatingColor(feedback.rating)}`}>
                              <span className="font-bold">{feedback.rating}.0</span>
                              <FaStar className="inline ml-1 text-amber-500" />
                            </div>
                            <span className="text-sm text-gray-500">{formatDate(feedback.createdAt)}</span>
                            <div className="flex items-center gap-1">
                              {getFeedbackTypeIcon(feedback.feedbackType)}
                              <span className="text-xs text-gray-500 capitalize">{feedback.feedbackType}</span>
                            </div>
                            {feedback.responded && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                                <FaCheckCircle size={10} /> Responded
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
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                  <button
                    onClick={() => fetchFeedbacks(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchFeedbacks(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
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
                  {responseSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm flex items-center gap-2">
                      <FaCheckCircle /> {responseSuccess}
                    </div>
                  )}
                  {responseError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                      {responseError}
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`px-3 py-1 rounded-xl ${getRatingColor(selectedFeedback.rating)}`}>
                        <span className="font-bold text-lg">{selectedFeedback.rating}.0</span>
                        <FaStar className="inline ml-1" />
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(selectedFeedback.createdAt)}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{selectedFeedback.title}</h3>
                    
                    <div className="bg-gray-50 p-4 rounded-xl mb-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.message}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-500">Patient</p>
                        <p className="font-bold text-gray-900">
                          {selectedFeedback.anonymous ? 'Anonymous' : selectedFeedback.patientName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Consultation Type</p>
                        <p className="font-bold text-gray-900">{selectedFeedback.consultationType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Feedback Type</p>
                        <p className="font-bold text-gray-900 capitalize">{selectedFeedback.feedbackType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className={`font-bold ${selectedFeedback.resolved ? 'text-green-600' : 'text-yellow-600'}`}>
                          {selectedFeedback.resolved ? 'Resolved' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Doctor's Response Section */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FaReply className="text-teal-500" /> Your Response
                    </h3>
                    
                    {selectedFeedback.responded ? (
                      <div className="bg-teal-50 p-4 rounded-xl mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-teal-700">Your Response:</span>
                          <span className="text-xs text-gray-500">
                            {selectedFeedback.responseDate ? formatDate(selectedFeedback.responseDate) : ''}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.response}</p>
                        <button 
                          onClick={() => {
                            const newResponse = prompt("Edit your response:", selectedFeedback.response);
                            if (newResponse && newResponse.trim()) {
                              handleResponseSubmit(selectedFeedback._id, newResponse);
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
                          value={responseMessage}
                          onChange={(e) => setResponseMessage(e.target.value)}
                          placeholder="Type your response to the patient..."
                          rows="4"
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none mb-3"
                        />
                        <button
                          onClick={() => handleResponseSubmit(selectedFeedback._id, responseMessage)}
                          disabled={submittingResponse}
                          className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {submittingResponse ? <FaSpinner className="animate-spin" /> : <FaReply />}
                          {submittingResponse ? 'Sending...' : 'Send Response to Patient'}
                        </button>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          The patient will receive your response via notification
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                    <FaEye className="text-3xl text-gray-400" />
                  </div>
                  <p className="text-gray-500">Select a feedback from the list to view details and respond</p>
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
              <button className="px-5 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 flex items-center gap-2 transition-colors">
                <FaDownload />
                CSV Export
              </button>
              <button className="px-5 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 flex items-center gap-2 transition-colors">
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