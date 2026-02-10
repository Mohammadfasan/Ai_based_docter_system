import React, { useState, useEffect } from 'react';
import { 
  FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaMapMarkerAlt, 
  FaVenusMars, FaHeartbeat, FaEdit, FaSave, FaTimes, FaCamera,
  FaShieldAlt, FaBell, FaLock, FaFileMedical, FaCreditCard,
  FaUserShield, FaHistory, FaShareAlt, FaTrash
} from 'react-icons/fa';

const Profile = ({ userType, userData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    address: '',
    bloodGroup: '',
    emergencyContact: '',
    insuranceId: '',
    allergies: [],
    medicalConditions: []
  });

  // Initialize profile data based on user type
  useEffect(() => {
    if (userType === 'patient') {
      setProfile({
        name: 'Alex Johnson',
        email: 'alex.johnson@example.com',
        phone: '+1 (555) 123-4567',
        dob: '1985-05-15',
        gender: 'Male',
        address: '123 Main Street, New York, NY 10001',
        bloodGroup: 'O+',
        emergencyContact: '+1 (555) 987-6543 (Jane Doe)',
        insuranceId: 'INS78901234',
        allergies: ['Penicillin', 'Peanuts', 'Dust'],
        medicalConditions: ['Hypertension', 'Type 2 Diabetes']
      });
    } else if (userType === 'doctor') {
      setProfile({
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@healthai.com',
        phone: '+1 (555) 234-5678',
        dob: '1978-08-22',
        gender: 'Female',
        address: '456 Medical Center Drive, Boston, MA 02115',
        bloodGroup: 'A+',
        emergencyContact: '+1 (555) 876-5432 (John Smith)',
        insuranceId: '',
        allergies: ['None'],
        medicalConditions: [],
        specialization: 'General Physician & ENT Specialist',
        licenseNumber: 'MED123456',
        experience: '12 years',
        consultationFee: '$120',
        qualifications: ['MD in Internal Medicine', 'MBBS'],
        languages: ['English', 'Spanish', 'French']
      });
    } else if (userType === 'admin') {
      setProfile({
        name: 'Admin User',
        email: 'admin@healthai.com',
        phone: '+1 (555) 345-6789',
        dob: '1980-03-10',
        gender: 'Prefer not to say',
        address: '789 Admin Blvd, San Francisco, CA 94107',
        bloodGroup: 'B+',
        emergencyContact: '+1 (555) 765-4321',
        insuranceId: '',
        allergies: [],
        medicalConditions: [],
        role: 'System Administrator',
        permissions: ['Full System Access', 'User Management', 'Doctor Approval'],
        department: 'Administration',
        employeeId: 'ADM001'
      });
    }
  }, [userType]);

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <FaUser /> },
    { id: 'medical', label: 'Medical Info', icon: <FaHeartbeat /> },
    { id: 'security', label: 'Security', icon: <FaShieldAlt /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'preferences', label: 'Preferences', icon: <FaUserShield /> },
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically send updated profile to backend
    console.log('Profile saved:', profile);
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reload original data
  };

  const handleChange = (field, value) => {
    setProfile({
      ...profile,
      [field]: value
    });
  };

  const handleAddAllergy = () => {
    const allergy = prompt('Enter allergy:');
    if (allergy && !profile.allergies.includes(allergy)) {
      setProfile({
        ...profile,
        allergies: [...profile.allergies, allergy]
      });
    }
  };

  const handleRemoveAllergy = (allergy) => {
    setProfile({
      ...profile,
      allergies: profile.allergies.filter(a => a !== allergy)
    });
  };

  const handleAddCondition = () => {
    const condition = prompt('Enter medical condition:');
    if (condition && !profile.medicalConditions.includes(condition)) {
      setProfile({
        ...profile,
        medicalConditions: [...profile.medicalConditions, condition]
      });
    }
  };

  const handleRemoveCondition = (condition) => {
    setProfile({
      ...profile,
      medicalConditions: profile.medicalConditions.filter(mc => mc !== condition)
    });
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-4xl">
            {profile.name.charAt(0)}
          </div>
          {isEditing && (
            <button className="absolute bottom-0 right-0 p-3 bg-teal-600 text-white rounded-full hover:bg-teal-700">
              <FaCamera />
            </button>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
          <p className="text-gray-600">{profile.email}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
              {userType.charAt(0).toUpperCase() + userType.slice(1)}
            </span>
            {profile.specialization && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {profile.specialization}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          {isEditing ? (
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg flex items-center">
              <FaUser className="text-gray-400 mr-3" />
              <span className="font-medium">{profile.name}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          {isEditing ? (
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg flex items-center">
              <FaEnvelope className="text-gray-400 mr-3" />
              <span className="font-medium">{profile.email}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          {isEditing ? (
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg flex items-center">
              <FaPhone className="text-gray-400 mr-3" />
              <span className="font-medium">{profile.phone}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          {isEditing ? (
            <input
              type="date"
              value={profile.dob}
              onChange={(e) => handleChange('dob', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg flex items-center">
              <FaCalendarAlt className="text-gray-400 mr-3" />
              <span className="font-medium">{new Date(profile.dob).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          {isEditing ? (
            <select
              value={profile.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg flex items-center">
              <FaVenusMars className="text-gray-400 mr-3" />
              <span className="font-medium">{profile.gender}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
          {isEditing ? (
            <select
              value={profile.bloodGroup}
              onChange={(e) => handleChange('bloodGroup', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg flex items-center">
              <FaHeartbeat className="text-gray-400 mr-3" />
              <span className="font-medium">{profile.bloodGroup}</span>
            </div>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        {isEditing ? (
          <textarea
            value={profile.address}
            onChange={(e) => handleChange('address', e.target.value)}
            rows="3"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
          />
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg flex items-start">
            <FaMapMarkerAlt className="text-gray-400 mr-3 mt-1" />
            <span className="font-medium">{profile.address}</span>
          </div>
        )}
      </div>

      {/* Emergency Contact */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
        {isEditing ? (
          <input
            type="text"
            value={profile.emergencyContact}
            onChange={(e) => handleChange('emergencyContact', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Name and phone number"
          />
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">{profile.emergencyContact}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderMedicalInfo = () => (
    <div className="space-y-6">
      {/* Insurance Information */}
      {userType === 'patient' && (
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <FaCreditCard className="mr-2" />
            Insurance Information
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Insurance ID</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.insuranceId}
                  onChange={(e) => handleChange('insuranceId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              ) : (
                <div className="p-3 bg-white rounded-lg">
                  <span className="font-medium">{profile.insuranceId}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Provider</label>
              <div className="p-3 bg-white rounded-lg">
                <span className="font-medium">HealthCare Plus</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Coverage: 80% for consultations, 70% for medications</p>
            <p>Validity: Until Dec 31, 2024</p>
          </div>
        </div>
      )}

      {/* Allergies */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Allergies</h3>
          {isEditing && (
            <button
              onClick={handleAddAllergy}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
            >
              Add Allergy
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.allergies.map((allergy, index) => (
            <div key={index} className="flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full">
              <span>{allergy}</span>
              {isEditing && (
                <button
                  onClick={() => handleRemoveAllergy(allergy)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          ))}
          {profile.allergies.length === 0 && (
            <p className="text-gray-500">No allergies recorded</p>
          )}
        </div>
      </div>

      {/* Medical Conditions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Medical Conditions</h3>
          {isEditing && (
            <button
              onClick={handleAddCondition}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
            >
              Add Condition
            </button>
          )}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {profile.medicalConditions.map((condition, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">{condition}</span>
                {isEditing && (
                  <button
                    onClick={() => handleRemoveCondition(condition)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>Diagnosed: Jan 2023</p>
                <p>Status: Managed</p>
              </div>
            </div>
          ))}
          {profile.medicalConditions.length === 0 && (
            <p className="text-gray-500">No medical conditions recorded</p>
          )}
        </div>
      </div>

      {/* Medical History Summary */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-bold mb-4">Health Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm opacity-90">Total Visits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm opacity-90">Active Conditions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">85%</div>
            <div className="text-sm opacity-90">Health Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">5</div>
            <div className="text-sm opacity-90">Allergies</div>
          </div>
        </div>
        <button className="w-full mt-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30">
          View Complete Medical History
        </button>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      {/* Password Change */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <FaLock className="mr-2" />
          Change Password
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Confirm new password"
            />
          </div>
          <button className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
            Update Password
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <FaShieldAlt className="mr-2" />
              Two-Factor Authentication
            </h3>
            <p className="text-gray-600 text-sm mt-1">Add an extra layer of security to your account</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
          </label>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>• Receive verification codes via SMS or authenticator app</p>
          <p>• Required for sensitive actions</p>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Active Sessions</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium">Current Session</div>
              <div className="text-sm text-gray-600">Chrome on Windows • Now</div>
            </div>
            <button className="text-red-600 hover:text-red-800 text-sm">
              Logout
            </button>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium">iPhone 13 Pro</div>
              <div className="text-sm text-gray-600">Safari on iOS • 2 hours ago</div>
            </div>
            <button className="text-red-600 hover:text-red-800 text-sm">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Notification Preferences</h3>
        <div className="space-y-6">
          {[
            { label: 'Appointment Reminders', description: 'Reminders before appointments' },
            { label: 'New Messages', description: 'When you receive new messages' },
            { label: 'Prescription Updates', description: 'When prescriptions are updated' },
            { label: 'Lab Results', description: 'When lab results are available' },
            { label: 'Medical Record Updates', description: 'When medical records are updated' },
            { label: 'System Updates', description: 'Important system announcements' },
          ].map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900">{item.label}</div>
                <div className="text-sm text-gray-600">{item.description}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>
          ))}
        </div>
        <button className="w-full mt-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
          Save Preferences
        </button>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-bold mb-2">Notification History</h3>
        <p className="text-sm opacity-90 mb-4">View your recent notifications</p>
        <button className="px-6 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30">
          View History
        </button>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      {/* Privacy Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          {[
            { label: 'Share medical records with doctors', description: 'Allow doctors to view your complete medical history' },
            { label: 'Anonymous data sharing', description: 'Share anonymized data for medical research' },
            { label: 'Profile visibility', description: 'Make your profile visible to other patients' },
            { label: 'Contact information sharing', description: 'Allow doctors to contact you directly' },
          ].map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900">{item.label}</div>
                <div className="text-sm text-gray-600">{item.description}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={index < 2} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Data Management</h3>
        <div className="space-y-4">
          <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="font-medium text-gray-900">Download Medical Data</div>
            <div className="text-sm text-gray-600">Download all your medical records in PDF format</div>
          </button>
          <button className="w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 text-red-700">
            <div className="font-medium">Delete Account</div>
            <div className="text-sm">Permanently delete your account and all associated data</div>
          </button>
        </div>
      </div>

      {/* Language & Region */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Language & Region</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
              <option>UTC-05:00 Eastern Time</option>
              <option>UTC-08:00 Pacific Time</option>
              <option>UTC+00:00 GMT</option>
              <option>UTC+05:30 India</option>
            </select>
          </div>
        </div>
        <button className="mt-4 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
          Save Settings
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <FaTimes />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center space-x-2"
              >
                <FaSave />
                <span>Save Changes</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center space-x-2"
            >
              <FaEdit />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-8">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === tab.id
                      ? 'bg-teal-50 text-teal-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-lg">{tab.icon}</div>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Quick Stats */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-bold text-gray-800 mb-4">Account Status</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">Jan 2023</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Login</span>
                  <span className="font-medium">Today</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Type</span>
                  <span className="font-medium capitalize">{userType}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {activeTab === 'personal' && renderPersonalInfo()}
            {activeTab === 'medical' && renderMedicalInfo()}
            {activeTab === 'security' && renderSecurity()}
            {activeTab === 'notifications' && renderNotifications()}
            {activeTab === 'preferences' && renderPreferences()}
          </div>

          {/* Additional Information based on user type */}
          {userType === 'doctor' && (
            <div className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Professional Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm opacity-90">Specialization</div>
                  <div className="font-bold text-xl">{profile.specialization}</div>
                </div>
                <div>
                  <div className="text-sm opacity-90">Years of Experience</div>
                  <div className="font-bold text-xl">{profile.experience}</div>
                </div>
                <div>
                  <div className="text-sm opacity-90">License Number</div>
                  <div className="font-bold text-xl">{profile.licenseNumber}</div>
                </div>
                <div>
                  <div className="text-sm opacity-90">Consultation Fee</div>
                  <div className="font-bold text-xl">{profile.consultationFee}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;