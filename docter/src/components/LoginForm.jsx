import React, { useState } from 'react';
import { FaUserMd, FaUser, FaLock, FaEnvelope, FaHospital, FaShieldAlt, FaStethoscope } from 'react-icons/fa';

const LoginForm = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'patient'
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!isLogin && !formData.name.trim()) {
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
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // For demo purposes - simulate different user types
    let userInfo = {
      name: formData.name || 'Demo User',
      email: formData.email
    };

    // Set demo data based on user type
    switch(formData.userType) {
      case 'doctor':
        userInfo = {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@healthai.com',
          specialization: 'General Physician'
        };
        break;
      case 'admin':
        userInfo = {
          name: 'Admin User',
          email: 'admin@healthai.com'
        };
        break;
      default:
        userInfo = {
          name: 'Alex Johnson',
          email: 'alex@example.com'
        };
    }

    onLogin(formData.userType, userInfo);
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

  const userTypes = [
    { id: 'patient', label: 'Patient', icon: <FaUser />, color: 'from-blue-500 to-blue-600' },
    { id: 'doctor', label: 'Doctor', icon: <FaStethoscope />, color: 'from-teal-500 to-teal-600' },
    { id: 'admin', label: 'Administrator', icon: <FaShieldAlt />, color: 'from-purple-500 to-purple-600' }
  ];

  const demoCredentials = {
    patient: { email: 'patient@demo.com', password: 'demo123' },
    doctor: { email: 'doctor@demo.com', password: 'demo123' },
    admin: { email: 'admin@demo.com', password: 'demo123' }
  };

  const handleDemoLogin = (type) => {
    setFormData({
      ...formData,
      userType: type,
      email: demoCredentials[type].email,
      password: demoCredentials[type].password
    });
    
    // Auto-login after 500ms
    setTimeout(() => {
      let userInfo = {};
      switch(type) {
        case 'doctor':
          userInfo = { name: 'Dr. Sarah Johnson', email: 'sarah.johnson@healthai.com' };
          break;
        case 'admin':
          userInfo = { name: 'Admin User', email: 'admin@healthai.com' };
          break;
        default:
          userInfo = { name: 'Alex Johnson', email: 'alex@example.com' };
      }
      onLogin(type, userInfo);
    }, 500);
  };

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
                    if (isLogin) {
                      handleDemoLogin(type.id);
                    }
                  }}
                  className={`w-full p-6 rounded-2xl text-left transition-all transform hover:-translate-y-1 ${
                    formData.userType === type.id
                      ? 'bg-white/30 backdrop-blur-sm border-2 border-white'
                      : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${type.color}`}>
                      <div className="text-2xl">{type.icon}</div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{type.label}</h3>
                      <p className="text-sm text-teal-100 mt-1">
                        {type.id === 'patient' && 'Book appointments, view medical records'}
                        {type.id === 'doctor' && 'Manage appointments, view patients'}
                        {type.id === 'admin' && 'Manage system, doctors, and settings'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/30">
              <h4 className="font-bold mb-3">Demo Credentials</h4>
              <div className="space-y-2 text-sm">
                {Object.entries(demoCredentials).map(([type, creds]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="capitalize">{type}:</span>
                    <span>{creds.email} / {creds.password}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                {isLogin ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="text-gray-600 mt-2">
                {isLogin ? 'Enter your credentials to continue' : 'Fill in your details to get started'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
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
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
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
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
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
                    placeholder="Enter your password"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
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
                      placeholder="Confirm your password"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <button type="button" className="text-sm text-teal-600 hover:text-teal-700">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-teal-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-teal-700 hover:to-teal-600 transition duration-300 transform hover:-translate-y-1 shadow-lg"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Quick Demo Login Buttons */}
            {isLogin && (
              <div className="mt-6">
                <p className="text-center text-sm text-gray-600 mb-3">Quick Login:</p>
                <div className="grid grid-cols-3 gap-3">
                  {userTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleDemoLogin(type.id)}
                      className={`p-3 rounded-lg text-sm font-medium bg-gradient-to-br ${type.color} text-white hover:opacity-90 transition-opacity`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Or continue with</p>
                <div className="mt-3 flex justify-center space-x-4">
                  <button 
                    type="button"
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  </button>
                  <button 
                    type="button"
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <img src="https://facebook.com/favicon.ico" alt="Facebook" className="w-5 h-5" />
                  </button>
                  <button 
                    type="button"
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <img src="https://apple.com/favicon.ico" alt="Apple" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;