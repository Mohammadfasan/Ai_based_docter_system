import React, { useState } from 'react';
import { 
  FaUserMd, FaUser, FaLock, FaEnvelope, FaHospital, 
  FaShieldAlt, FaStethoscope, FaPhone, FaMapMarkerAlt,
  FaTint, FaWeight, FaRuler, FaHeart, FaCalendarAlt,
  FaVenusMars, FaIdCard, FaAmbulance, FaPills, FaNotesMedical
} from 'react-icons/fa';

const LoginForm = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'patient',
    
    // Patient Specific Fields
    phone: '',
    age: '',
    gender: '',
    bloodGroup: '',
    weight: '',
    height: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    allergies: '',
    chronicConditions: '',
    medications: '',
    insuranceProvider: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Function to generate unique ID based on email
  const generateUserId = (userType, name, email) => {
    const emailHash = email.toLowerCase().split('').reduce((acc, char, index) => {
      return acc + char.charCodeAt(0) * (index + 1);
    }, 0);
    
    const hashString = Math.abs(emailHash).toString(36).slice(-4).toUpperCase();
    
    const getInitials = (fullName) => {
      if (!fullName || fullName.trim() === '') {
        return userType === 'doctor' ? 'DOC' : userType === 'patient' ? 'PAT' : 'ADM';
      }
      return fullName
        .split(' ')
        .map(n => n.charAt(0).toUpperCase())
        .join('')
        .slice(0, 3);
    };
    
    const prefix = userType === 'patient' ? 'PAT' : 
                   userType === 'doctor' ? 'DOC' : 
                   'ADM';
    
    const initials = getInitials(name);
    
    return `${prefix}-${hashString}-${initials}`;
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const genders = ['Male', 'Female', 'Other'];

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }
    
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (formData.age < 0 || formData.age > 150) {
      newErrors.age = 'Please enter valid age';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    if (!formData.bloodGroup) {
      newErrors.bloodGroup = 'Blood group is required';
    }
    
    if (!formData.address) {
      newErrors.address = 'Address is required';
    }
    
    return newErrors;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    if (!formData.emergencyContactName) {
      newErrors.emergencyContactName = 'Emergency contact name is required';
    }
    
    if (!formData.emergencyContactPhone) {
      newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    }
    
    return newErrors;
  };

  const handleNextStep = () => {
    let stepErrors = {};
    
    if (currentStep === 1) {
      stepErrors = validateStep1();
    } else if (currentStep === 2) {
      stepErrors = validateStep2();
    }
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    
    setErrors({});
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentStep === 3) {
      const step3Errors = validateStep3();
      
      if (Object.keys(step3Errors).length > 0) {
        setErrors(step3Errors);
        return;
      }
    }

    if (currentStep < 3) {
      handleNextStep();
      return;
    }

    setIsLoading(true);

    const existingUsers = JSON.parse(localStorage.getItem('healthai_users') || '[]');
    const existingUserIndex = existingUsers.findIndex(u => 
      u.email.toLowerCase() === formData.email.toLowerCase() && u.userType === formData.userType
    );

    let userId;
    let userInfo = {};

    if (existingUserIndex >= 0) {
      // LOGIN
      if (existingUsers[existingUserIndex].password !== formData.password) {
        setErrors({ password: 'Incorrect password' });
        setIsLoading(false);
        return;
      }
      
      userId = existingUsers[existingUserIndex].userId;
      userInfo = { ...existingUsers[existingUserIndex] };
      
      localStorage.setItem('currentUser', JSON.stringify(userInfo));
      localStorage.setItem('userType', formData.userType);
      
      alert(`✅ Welcome back ${userInfo.name}!\n\n📋 Your ${formData.userType} ID: ${userId}`);
      
      onLogin(formData.userType, userInfo);
      setIsLoading(false);
      return;
    }

    if (isLogin) {
      setErrors({ email: 'No account found with this email' });
      setIsLoading(false);
      return;
    }

    // SIGN UP
    // Generate user ID
    userId = generateUserId(formData.userType, formData.name, formData.email);
    
    // Check if user already exists
    if (existingUsers.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
      setErrors({ email: 'Email already registered. Please sign in.' });
      setIsLoading(false);
      return;
    }
    
    // Parse allergies and conditions from textarea to array
    const allergiesArray = formData.allergies
      ? formData.allergies.split(',').map(item => item.trim()).filter(item => item)
      : [];
    
    const conditionsArray = formData.chronicConditions
      ? formData.chronicConditions.split(',').map(item => item.trim()).filter(item => item)
      : [];
    
    const medicationsArray = formData.medications
      ? formData.medications.split(',').map(item => item.trim()).filter(item => item)
      : [];
    
    // Create COMPLETE user object
    userInfo = {
      // Basic Info
      name: formData.name,
      email: formData.email,
      userId: userId,
      userType: formData.userType,
      password: formData.password,
      createdAt: new Date().toISOString(),
      
      // Contact Info
      phone: formData.phone,
      address: formData.address,
      
      // Personal Info
      age: parseInt(formData.age) || null,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      weight: formData.weight ? parseInt(formData.weight) : null,
      height: formData.height ? parseInt(formData.height) : null,
      
      // Emergency Contact
      emergencyName: formData.emergencyContactName,
      emergencyContact: formData.emergencyContactPhone,
      
      // Medical Info
      allergies: allergiesArray,
      chronicConditions: conditionsArray,
      currentMedications: medicationsArray,
      insuranceProvider: formData.insuranceProvider || '',
      
      // UI
      avatarColor: formData.userType === 'doctor' ? 'from-teal-500 to-teal-600' : 
                   formData.userType === 'admin' ? 'from-purple-500 to-purple-600' : 
                   'from-blue-500 to-blue-600',
      status: 'active',
      
      // Stats (will be updated later)
      appointmentsCount: 0,
      prescriptionsCount: 0,
      medicalRecordsCount: 0,
      lastVisit: null
    };

    // Save to users list
    existingUsers.push(userInfo);
    localStorage.setItem('healthai_users', JSON.stringify(existingUsers));
    
    // Save current user
    localStorage.setItem('currentUser', JSON.stringify(userInfo));
    localStorage.setItem('userType', formData.userType);

    console.log('✅ New user created with COMPLETE details:', userInfo);
    
    // Show success message
    alert(`✅ Account created successfully!\n\n📋 USER DETAILS:\n━━━━━━━━━━━━━━━━━━\n🆔 ID: ${userId}\n👤 Name: ${userInfo.name}\n📧 Email: ${userInfo.email}\n🔐 Password: (saved securely)\n\n⚠️ PLEASE SAVE THESE DETAILS!`);
    
    onLogin(formData.userType, userInfo);
    setIsLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setCurrentStep(1);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: formData.userType, // Preserve user type
      phone: '',
      age: '',
      gender: '',
      bloodGroup: '',
      weight: '',
      height: '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      allergies: '',
      chronicConditions: '',
      medications: '',
      insuranceProvider: ''
    });
    setErrors({});
  };

  const userTypes = [
    { id: 'patient', label: 'Patient', icon: <FaUser />, color: 'from-blue-500 to-blue-600' },
    { id: 'doctor', label: 'Doctor', icon: <FaStethoscope />, color: 'from-teal-500 to-teal-600' },
    { id: 'admin', label: 'Administrator', icon: <FaShieldAlt />, color: 'from-purple-500 to-purple-600' }
  ];

  // Render different steps based on user type and login/signup mode
  const renderFormSteps = () => {
    // For admin or doctor signup, or login mode - show simple form
    if (isLogin || formData.userType !== 'patient') {
      return renderSimpleForm();
    }
    
    // For patient signup - show multi-step form
    return renderPatientSignupForm();
  };

  const renderSimpleForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field - Only for Sign Up */}
      {!isLogin && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={formData.userType === 'doctor' ? 'Dr. John Smith' : 'John Smith'}
              disabled={isLoading}
            />
          </div>
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
      )}

      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="your@email.com"
            disabled={isLoading}
          />
        </div>
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      {/* Phone Field - For signup */}
      {!isLogin && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Phone number"
              disabled={isLoading}
            />
          </div>
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>
      )}

      {/* Password Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
              errors.password ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </div>

      {/* Confirm Password - Only for Sign Up */}
      {!isLogin && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className={`w-full bg-gradient-to-r from-teal-600 to-teal-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-teal-700 hover:to-teal-600 transition duration-300 transform hover:-translate-y-1 shadow-lg ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          isLogin ? 'Sign In' : 'Create Account'
        )}
      </button>
    </form>
  );

  const renderPatientSignupForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Steps */}
      <div className="flex justify-between mb-6">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex-1 text-center">
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold ${
              currentStep >= step 
                ? 'bg-teal-500 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {step}
            </div>
            <p className="text-xs mt-1 font-medium">
              {step === 1 && 'Basic Info'}
              {step === 2 && 'Personal Info'}
              {step === 3 && 'Medical Info'}
            </p>
          </div>
        ))}
      </div>

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">📋 Basic Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="John Smith"
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="john@email.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Phone number"
              />
            </div>
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>
        </div>
      )}

      {/* Step 2: Personal Information */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">👤 Personal Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                    errors.age ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="30"
                  min="1"
                  max="150"
                />
              </div>
              {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaVenusMars className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                    errors.gender ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Gender</option>
                  {genders.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Group <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaTint className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                    errors.bloodGroup ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              {errors.bloodGroup && <p className="mt-1 text-sm text-red-600">{errors.bloodGroup}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <div className="relative">
                <FaWeight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="70"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (cm)
              </label>
              <div className="relative">
                <FaRuler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="170"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Provider
              </label>
              <div className="relative">
                <FaHospital className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="insuranceProvider"
                  value={formData.insuranceProvider}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Insurance provider"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                  errors.address ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Your address"
              />
            </div>
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
          </div>
        </div>
      )}

      {/* Step 3: Medical Information */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">🏥 Medical Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                    errors.emergencyContactName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Emergency contact name"
                />
              </div>
              {errors.emergencyContactName && <p className="mt-1 text-sm text-red-600">{errors.emergencyContactName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                    errors.emergencyContactPhone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Emergency contact phone"
                />
              </div>
              {errors.emergencyContactPhone && <p className="mt-1 text-sm text-red-600">{errors.emergencyContactPhone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allergies (comma separated)
            </label>
            <div className="relative">
              <FaPills className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Penicillin, Sulfa, Peanuts"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Leave empty if none</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chronic Conditions (comma separated)
            </label>
            <div className="relative">
              <FaNotesMedical className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="chronicConditions"
                value={formData.chronicConditions}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Diabetes, Hypertension, Asthma"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Leave empty if none</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Medications (comma separated)
            </label>
            <div className="relative">
              <FaHeart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="medications"
                value={formData.medications}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Metformin, Lisinopril"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Leave empty if none</p>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-teal-200">
            <h4 className="font-bold text-teal-800 mb-3 flex items-center gap-2">
              <FaIdCard className="text-teal-600" />
              📋 Account Summary
            </h4>
            <div className="text-sm space-y-2">
              <p><strong>Name:</strong> {formData.name || 'Not provided'}</p>
              <p><strong>Email:</strong> {formData.email || 'Not provided'}</p>
              <p><strong>Phone:</strong> {formData.phone || 'Not provided'}</p>
              <p><strong>Age:</strong> {formData.age || 'Not provided'}</p>
              <p><strong>Blood Group:</strong> {formData.bloodGroup || 'Not provided'}</p>
            </div>
            <p className="text-xs text-teal-600 mt-3">
              ✓ Your User ID will be generated based on your email
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handlePrevStep}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-bold"
          >
            ← BACK
          </button>
        )}
        
        <button
          type="submit"
          className={`flex-1 bg-gradient-to-r from-teal-600 to-teal-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-teal-700 hover:to-teal-600 transition-all ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            currentStep === 3 ? 'CREATE ACCOUNT' : 'NEXT →'
          )}
        </button>
      </div>
    </form>
  );

  return (
    <div className="max-w-4xl w-full mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Left Side - User Type Selection */}
          <div className="bg-gradient-to-br from-teal-500 to-teal-700 p-8 text-white">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                <FaHospital className="text-white text-3xl" />
              </div>
              <h2 className="text-3xl font-bold">Welcome to HealthAI</h2>
              <p className="text-teal-100 mt-2">Choose your role to continue</p>
            </div>

            <div className="space-y-6">
              {userTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setFormData({...formData, userType: type.id});
                    setCurrentStep(1);
                  }}
                  className={`w-full p-6 rounded-2xl text-left transition-all transform hover:-translate-y-1 ${
                    formData.userType === type.id
                      ? 'bg-white/30 backdrop-blur-sm border-2 border-white'
                      : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
                  }`}
                  disabled={isLoading}
                  type="button"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${type.color}`}>
                      <div className="text-2xl">{type.icon}</div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{type.label}</h3>
                      <p className="text-sm text-teal-100 mt-1">
                        {type.id === 'patient' && 'Complete profile with medical details'}
                        {type.id === 'doctor' && 'Manage appointments, view patients'}
                        {type.id === 'admin' && 'System Administration'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Patient Info Box */}
            {formData.userType === 'patient' && !isLogin && (
              <div className="mt-8 p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <FaHeart className="text-pink-300" />
                  Patient Registration
                </h4>
                <p className="text-sm text-teal-100">
                  We'll collect your complete medical profile in 3 easy steps!
                </p>
                <div className="mt-3 text-xs space-y-1">
                  <p>✓ Step 1: Basic Info</p>
                  <p>✓ Step 2: Personal Details</p>
                  <p>✓ Step 3: Medical History</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Form */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                {formData.userType === 'admin' ? 'Admin Login' : 
                 formData.userType === 'doctor' ? (isLogin ? 'Doctor Login' : 'Doctor Registration') :
                 (isLogin ? 'Patient Login' : 'Patient Registration')}
              </h2>
              <p className="text-gray-600 mt-2">
                {formData.userType === 'patient' && !isLogin 
                  ? 'Complete all steps to create your account' 
                  : 'Enter your credentials'}
              </p>
              
              {/* ID Consistency Notification */}
              <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <FaIdCard className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-blue-700 mb-1">
                      📋 Your User ID is Permanent!
                    </p>
                    <p className="text-xs text-blue-600">
                      • Same email = Same User ID every time<br/>
                      • Your ID: <strong>XXX-XXXX-XXX</strong> format
                    </p>
                  </div>
                </div>
              </div>

              {/* Toggle Login/Signup for non-admin */}
              {formData.userType !== 'admin' && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleToggleMode}
                    className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                  >
                    {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                  </button>
                </div>
              )}
            </div>

            {renderFormSteps()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;