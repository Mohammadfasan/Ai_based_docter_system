// LoginForm.jsx (Fixed - Ensuring POST requests)
import React, { useState } from 'react';
import { 
  FaEnvelope, FaLock, FaUser, 
  FaPhone, FaHospital, 
  FaTimes 
} from 'react-icons/fa';
import axios from 'axios';
import GoogleAuth from './GoogleAuth';
import ForgotPasswordModal from './ForgotPasswordModal';
import ResetPasswordModal from './ResetPasswordModal';

// ✅ API URL - points to the base API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with debug logging
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure POST requests don't get redirected to GET
  maxRedirects: 0,
  validateStatus: function (status) {
    return status >= 200 && status < 400;
  }
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    console.log('📦 Request data:', config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`📥 Response from ${response.config.url}:`, response.status, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ API Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error('❌ No response received:', error.request);
    } else {
      console.error('❌ Error:', error.message);
    }
    return Promise.reject(error);
  }
);

const LoginForm = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: 'patient'
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState('');
  
  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Validation
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
    
    if (!isLogin && !formData.phone) {
      newErrors.phone = 'Phone number is required';
    }
    
    return newErrors;
  };

  const handleLogin = async () => {
    try {
      console.log('🔐 Attempting login POST to:', `${API_BASE_URL}/auth/login`);
      console.log('📧 Email:', formData.email);
      console.log('👤 User Type:', formData.userType);
      
      // ✅ POST request to /auth/login
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
        userType: formData.userType
      });

      console.log('📥 Login response:', response.data);

      if (response.data.success) {
        // Save to localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        localStorage.setItem('userType', formData.userType);
        
        console.log('✅ Login successful!');
        console.log('✅ User:', response.data.user);
        
        setServerMessage({ type: 'success', text: 'Login successful!' });
        
        setTimeout(() => {
          onLogin(formData.userType, response.data.user);
        }, 500);
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setServerMessage({ 
        type: 'error', 
        text: errorMessage
      });
    }
  };

  const handleSignup = async () => {
    try {
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userType: formData.userType,
        phone: formData.phone
      };

      console.log('📝 Attempting signup POST to:', `${API_BASE_URL}/auth/signup`);
      console.log('📦 Signup data:', { ...signupData, password: '***' });

      // ✅ POST request to /auth/signup
      const response = await api.post('/auth/signup', signupData);

      console.log('📥 Signup response:', response.data);

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        localStorage.setItem('userType', formData.userType);
        
        setServerMessage({ type: 'success', text: 'Account created successfully!' });
        
        alert(`✅ Account created!\nYour ID: ${response.data.user.userId}\nYou are now logged in.`);
        
        setTimeout(() => {
          onLogin(formData.userType, response.data.user);
        }, 500);
      } else {
        throw new Error(response.data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      
      let errorMessage = 'Signup failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setServerMessage({ 
        type: 'error', 
        text: errorMessage
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setServerMessage('');

    try {
      if (isLogin) {
        await handleLogin();
      } else {
        await handleSignup();
      }
    } finally {
      setIsLoading(false);
    }
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
    
    if (serverMessage) {
      setServerMessage('');
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      ...formData,
      name: '',
      password: '',
      confirmPassword: '',
      phone: ''
    });
    setErrors({});
    setServerMessage('');
  };

  const handleGoogleSuccess = (user) => {
    console.log('Google sign-in success:', user);
    if (user.token) {
      localStorage.setItem('token', user.token);
    }
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('userType', user.userType || 'patient');
    
    setServerMessage({ type: 'success', text: 'Google sign-in successful!' });
    onLogin(user.userType || 'patient', user);
  };

  const handleGoogleError = (error) => {
    console.error('Google sign-in error:', error);
    setServerMessage({ type: 'error', text: error });
  };

  const handleForgotPassword = () => {
    if (!formData.email) {
      setServerMessage({ type: 'error', text: 'Please enter your email address first' });
      return;
    }
    setResetEmail(formData.email);
    setShowForgotPassword(true);
  };

  const handleForgotPasswordSuccess = (message, email) => {
    setShowForgotPassword(false);
    setServerMessage({ type: 'success', text: message });
    setResetEmail(email);
  };

  const handleResetPassword = (token) => {
    setShowForgotPassword(false);
    setResetToken(token);
    setShowResetPassword(true);
  };

  const handleResetSuccess = () => {
    setShowResetPassword(false);
    setServerMessage({ type: 'success', text: 'Password reset successful! Please login with your new password.' });
    setFormData({
      ...formData,
      password: '',
      confirmPassword: ''
    });
  };

  const UserTypeSelector = () => (
    <div className="flex justify-center space-x-2 mb-6">
      <button
        type="button"
        onClick={() => setFormData({...formData, userType: 'patient'})}
        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
          formData.userType === 'patient'
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Patient
      </button>
      <button
        type="button"
        onClick={() => setFormData({...formData, userType: 'doctor'})}
        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
          formData.userType === 'doctor'
            ? 'bg-teal-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Doctor
      </button>
      <button
        type="button"
        onClick={() => {
          setFormData({...formData, userType: 'admin'});
          setIsLogin(true);
        }}
        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
          formData.userType === 'admin'
            ? 'bg-purple-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Admin
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-xl mb-4">
            <FaHospital className="text-teal-500 text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">HealthAI</h1>
          <p className="text-gray-600 mt-2">Your Personal Health Assistant</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Sign in' : 'Create account'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {isLogin 
                ? 'to continue to HealthAI' 
                : 'to get started with HealthAI'}
            </p>
          </div>

          <UserTypeSelector />

          {formData.userType === 'doctor' && isLogin && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700">
                💡 Doctor login: Use the email provided by admin
              </p>
            </div>
          )}

          {formData.userType === 'admin' && isLogin && (
            <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-700">
                💡 Admin login: Use admin credentials provided by system
              </p>
            </div>
          )}

          <GoogleAuth 
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            buttonText={isLogin ? 'Sign in with Google' : 'Sign up with Google'}
            userType={formData.userType}
          />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Full name"
                    disabled={isLoading}
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
            )}

            <div>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {!isLogin && (
              <div>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Phone number"
                    disabled={isLoading}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
            )}

            <div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Password"
                  disabled={isLoading}
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirm password"
                    disabled={isLoading}
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
              </div>
            )}

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {serverMessage && (
              <div className={`p-3 rounded-lg text-sm ${
                serverMessage.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : serverMessage.type === 'info'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {serverMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-all ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
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
                isLogin ? 'Sign in' : 'Sign up'
              )}
            </button>
          </form>

          {formData.userType !== 'admin' && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleToggleMode}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          )}

          {formData.userType === 'admin' && (
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Admin access is restricted to authorized personnel only.
              </p>
            </div>
          )}

          <div className="mt-6 text-center text-xs text-gray-500">
            By continuing, you agree to HealthAI's{' '}
            <button className="text-blue-600 hover:text-blue-700">Terms of Service</button>
            {' '}and{' '}
            <button className="text-blue-600 hover:text-blue-700">Privacy Policy</button>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-md p-4 border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 mb-2">🔐 Test Credentials</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">👤 Doctor:</span>
              <span className="text-gray-800">doctor@healthai.com / doctor123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">👤 Patient:</span>
              <span className="text-gray-800">patient@healthai.com / patient123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">👤 Admin:</span>
              <span className="text-gray-800">admin@healthai.com / admin123</span>
            </div>
          </div>
        </div>
      </div>

      {showForgotPassword && (
        <ForgotPasswordModal
          email={resetEmail}
          onClose={() => setShowForgotPassword(false)}
          onSuccess={handleForgotPasswordSuccess}
          onResetPassword={handleResetPassword}
        />
      )}

      {showResetPassword && (
        <ResetPasswordModal
          token={resetToken}
          email={resetEmail}
          onClose={() => setShowResetPassword(false)}
          onSuccess={handleResetSuccess}
        />
      )}
    </div>
  );
};

export default LoginForm;