// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaVenusMars,
  FaTint, FaWeight, FaRuler, FaMapMarkerAlt, FaAmbulance,
  FaAllergies, FaHeartbeat, FaPills, FaShieldAlt, FaBell,
  FaCog, FaFileAlt, FaClock, FaCheckCircle, FaEdit,
  FaSave, FaTimes, FaUserMd, FaIdCard,
  FaSpinner, FaExclamationTriangle
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const Profile = ({ userType: propUserType, userData: propUserData, darkMode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Get user from localStorage
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
    return propUserData || null;
  };

  const currentUser = getCurrentUser();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = currentUser?.userId || currentUser?._id || propUserData?.userId;
      
      if (!userId) {
        console.error('No user ID found');
        setError('User ID not found. Please login again.');
        setLoading(false);
        return;
      }

      console.log('Fetching profile for user ID:', userId);
      console.log('Using token:', token ? 'Present' : 'Missing');

      // Try to fetch from backend
      const response = await axios.get(`${API_URL}/users/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Profile API response:', response.data);

      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        setFormData(userData);
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      
      // Use localStorage data as fallback
      const localUser = {
        name: currentUser?.name || propUserData?.name || 'User',
        email: currentUser?.email || propUserData?.email || '',
        userId: currentUser?.userId || propUserData?.userId || '',
        phone: currentUser?.phone || propUserData?.phone || '',
        userType: propUserType || currentUser?.userType || 'patient',
        gender: currentUser?.gender || '',
        bloodGroup: currentUser?.bloodGroup || '',
        address: currentUser?.address || '',
        dateOfBirth: currentUser?.dateOfBirth || '',
        createdAt: currentUser?.createdAt || new Date().toISOString(),
        lastLogin: currentUser?.lastLogin || new Date().toISOString(),
        allergies: currentUser?.allergies || [],
        chronicConditions: currentUser?.chronicConditions || [],
        currentMedications: currentUser?.currentMedications || [],
        emergencyName: currentUser?.emergencyName || '',
        emergencyContact: currentUser?.emergencyContact || '',
        weight: currentUser?.weight || '',
        height: currentUser?.height || ''
      };
      setUser(localUser);
      setFormData(localUser);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
      } else {
        setError('Unable to fetch latest profile. Showing cached data.');
        setTimeout(() => setError(null), 5000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (e, fieldName) => {
    const value = e.target.value;
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [fieldName]: arrayValue
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const userId = currentUser?.userId || currentUser?._id;
      
      const response = await axios.put(
        `${API_URL}/users/profile/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setUser(formData);
        setEditMode(false);
        setSuccessMessage('Profile updated successfully!');
        
        // Update localStorage
        const updatedUser = { ...currentUser, ...formData };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile changes');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setEditMode(false);
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Not specified';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getAvatarColor = () => {
    switch (user?.userType) {
      case 'patient': return 'from-blue-400 to-blue-600';
      case 'doctor': return 'from-emerald-400 to-teal-600';
      case 'admin': return 'from-amber-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getUserRole = () => {
    switch (user?.userType) {
      case 'patient': return 'Patient';
      case 'doctor': return 'Doctor';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-teal-500 mx-auto mb-4" />
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 flex items-center gap-2">
            <FaCheckCircle />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-400 flex items-center gap-2">
            <FaExclamationTriangle />
            {error}
          </div>
        )}

        {/* Profile Header */}
        <div className={`rounded-2xl border p-6 mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 bg-gradient-to-br ${getAvatarColor()} rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                {getInitials(user?.name)}
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name}</h1>
                <p className={`flex items-center gap-2 mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <FaIdCard size={12} />
                  ID: {user?.userId}
                </p>
                <p className="text-sm text-teal-500 mt-1 capitalize">{getUserRole()}</p>
              </div>
            </div>
            
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl transition-all"
              >
                <FaEdit size={14} />
                Edit Profile
              </button>
            )}
            
            {editMode && (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all disabled:opacity-50"
                >
                  <FaSave size={14} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all"
                >
                  <FaTimes size={14} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'personal', label: 'Personal Info', icon: <FaUser size={14} /> },
            { id: 'medical', label: 'Medical Info', icon: <FaHeartbeat size={14} /> },
            { id: 'security', label: 'Security', icon: <FaShieldAlt size={14} /> },
            { id: 'preferences', label: 'Preferences', icon: <FaCog size={14} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-500 text-white'
                  : darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Account Status */}
          <div className="lg:col-span-1 space-y-6">
            {/* Account Status Card */}
            <div className={`rounded-2xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <FaClock />
                Account Status
              </h3>
              <div className="space-y-3">
                <div className={`flex justify-between items-center py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Member Since</span>
                  <span className={darkMode ? 'text-white' : 'text-gray-900'}>{formatDate(user?.createdAt)}</span>
                </div>
                <div className={`flex justify-between items-center py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Last Login</span>
                  <span className={darkMode ? 'text-white' : 'text-gray-900'}>{formatDate(user?.lastLogin)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Account Type</span>
                  <span className="text-teal-500 capitalize">{user?.userType}</span>
                </div>
              </div>
            </div>

            {/* Stats Card - Only for patients */}
            {user?.userType === 'patient' && (
              <div className={`rounded-2xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Health Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-500">{user?.appointmentsCount || 0}</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Appointments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-500">{user?.prescriptionsCount || 0}</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Prescriptions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-500">{user?.medicalRecordsCount || 0}</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Medical Records</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2">
            
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div className={`rounded-2xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Personal Information</h3>
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className={`block text-sm mb-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FaUser size={12} />
                      Full Name
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                      />
                    ) : (
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name || 'Not specified'}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className={`block text-sm mb-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FaEnvelope size={12} />
                      Email Address
                    </label>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.email || 'Not specified'}</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className={`block text-sm mb-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FaPhone size={12} />
                      Phone Number
                    </label>
                    {editMode ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                      />
                    ) : (
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.phone || 'Not specified'}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className={`block text-sm mb-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FaCalendarAlt size={12} />
                      Date of Birth
                    </label>
                    {editMode ? (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth?.split('T')[0] || ''}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                      />
                    ) : (
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(user?.dateOfBirth)}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className={`block text-sm mb-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FaVenusMars size={12} />
                      Gender
                    </label>
                    {editMode ? (
                      <select
                        name="gender"
                        value={formData.gender || ''}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.gender || 'Not specified'}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className={`block text-sm mb-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FaMapMarkerAlt size={12} />
                      Address
                    </label>
                    {editMode ? (
                      <textarea
                        name="address"
                        value={formData.address || ''}
                        onChange={handleInputChange}
                        rows="3"
                        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                      />
                    ) : (
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.address || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Medical Info Tab - Only for patients */}
            {activeTab === 'medical' && user?.userType === 'patient' && (
              <div className={`rounded-2xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Medical Information</h3>
                <div className="space-y-4">
                  {/* Blood Group */}
                  <div>
                    <label className={`block text-sm mb-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FaTint size={12} />
                      Blood Group
                    </label>
                    {editMode ? (
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup || ''}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    ) : (
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.bloodGroup || 'Not specified'}</p>
                    )}
                  </div>

                  {/* Weight & Height */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm mb-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FaWeight size={12} />
                        Weight (kg)
                      </label>
                      {editMode ? (
                        <input
                          type="number"
                          name="weight"
                          value={formData.weight || ''}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                        />
                      ) : (
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.weight ? `${user.weight} kg` : 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FaRuler size={12} />
                        Height (cm)
                      </label>
                      {editMode ? (
                        <input
                          type="number"
                          name="height"
                          value={formData.height || ''}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                        />
                      ) : (
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.height ? `${user.height} cm` : 'Not specified'}</p>
                      )}
                    </div>
                  </div>

                  {/* Allergies */}
                  <div>
                    <label className={`block text-sm mb-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FaAllergies size={12} />
                      Allergies
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.allergies?.join(', ') || ''}
                        onChange={(e) => handleArrayInputChange(e, 'allergies')}
                        placeholder="e.g., Penicillin, Peanuts, Pollen"
                        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user?.allergies?.length > 0 ? (
                          user.allergies.map((allergy, idx) => (
                            <span key={idx} className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs">
                              {allergy}
                            </span>
                          ))
                        ) : (
                          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>None specified</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Chronic Conditions */}
                  <div>
                    <label className={`block text-sm mb-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FaHeartbeat size={12} />
                      Chronic Conditions
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.chronicConditions?.join(', ') || ''}
                        onChange={(e) => handleArrayInputChange(e, 'chronicConditions')}
                        placeholder="e.g., Diabetes, Hypertension"
                        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user?.chronicConditions?.length > 0 ? (
                          user.chronicConditions.map((condition, idx) => (
                            <span key={idx} className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-xs">
                              {condition}
                            </span>
                          ))
                        ) : (
                          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>None specified</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Current Medications */}
                  <div>
                    <label className={`block text-sm mb-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FaPills size={12} />
                      Current Medications
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.currentMedications?.join(', ') || ''}
                        onChange={(e) => handleArrayInputChange(e, 'currentMedications')}
                        placeholder="e.g., Lisinopril 10mg, Metformin 500mg"
                        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user?.currentMedications?.length > 0 ? (
                          user.currentMedications.map((med, idx) => (
                            <span key={idx} className="px-2 py-1 bg-teal-500/20 text-teal-400 rounded-lg text-xs">
                              {med}
                            </span>
                          ))
                        ) : (
                          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>None specified</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Emergency Contact */}
                  <div className={`pt-4 mt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h4 className={`text-md font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <FaAmbulance size={14} />
                      Emergency Contact
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Name</label>
                        {editMode ? (
                          <input
                            type="text"
                            name="emergencyName"
                            value={formData.emergencyName || ''}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                          />
                        ) : (
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.emergencyName || 'Not specified'}</p>
                        )}
                      </div>
                      <div>
                        <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone</label>
                        {editMode ? (
                          <input
                            type="tel"
                            name="emergencyContact"
                            value={formData.emergencyContact || ''}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                          />
                        ) : (
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.emergencyContact || 'Not specified'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className={`rounded-2xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Security Settings</h3>
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <p className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                      🔒 For security reasons, password changes must be done through the login page.
                      Please use the "Forgot Password" option on the login screen.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => navigate('/forgot-password')}
                    className="w-full px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-all"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className={`rounded-2xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notification Preferences</h3>
                <div className="space-y-4">
                  <div className={`flex items-center justify-between py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div>
                      <p className={darkMode ? 'text-white' : 'text-gray-900'}>Email Notifications</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Receive updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                    </label>
                  </div>

                  <div className={`flex items-center justify-between py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div>
                      <p className={darkMode ? 'text-white' : 'text-gray-900'}>Appointment Reminders</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Get reminders for upcoming appointments</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                    </label>
                  </div>

                  <div className={`flex items-center justify-between py-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div>
                      <p className={darkMode ? 'text-white' : 'text-gray-900'}>Health Tips & News</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Receive health-related tips and news</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;