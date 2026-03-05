// ForgotPasswordModal.jsx
import React, { useState } from 'react';
import { FaEnvelope, FaTimes, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const ForgotPasswordModal = ({ email: initialEmail, onClose, onSuccess, onResetPassword }) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState('request'); // 'request' or 'verify'
  const [tempToken, setTempToken] = useState('');

  // Handle request password reset
  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('/forgot-password', { email });

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: 'Verification code sent to your email! Please check your inbox.' 
        });
        
        // For development - log the code to console
        if (response.data.devCode) {
          console.log('🔐 Development verification code:', response.data.devCode);
          console.log('📧 Check email at: https://ethereal.email/messages');
          
          // Auto-fill code for development (optional - uncomment if needed)
          // setVerificationCode(response.data.devCode);
        }
        
        setStep('verify');
        setTempToken(response.data.token);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check if the server is running.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Email service not configured properly.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verify code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a valid 6-digit code' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('/verify-reset-code', {
        email,
        code: verificationCode
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Code verified successfully!' });
        // Proceed to reset password
        onResetPassword(response.data.token);
      }
    } catch (error) {
      console.error('Code verification error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Invalid or expired code' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('/resend-code', { email });

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: 'New verification code sent to your email!' 
        });
        
        // Log new code for development
        if (response.data.devCode) {
          console.log('🔐 New verification code:', response.data.devCode);
        }
      }
    } catch (error) {
      console.error('Resend code error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to resend code' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to request step
  const handleBack = () => {
    setStep('request');
    setVerificationCode('');
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            {step === 'verify' && (
              <button
                onClick={handleBack}
                className="mr-3 text-gray-500 hover:text-gray-700"
              >
                <FaArrowLeft />
              </button>
            )}
            <h3 className="text-xl font-bold text-gray-900">
              {step === 'request' ? 'Reset Password' : 'Verify Code'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'request' ? (
            <>
              <p className="text-gray-600 mb-4">
                Enter your email address and we'll send you a verification code to reset your password.
              </p>

              <form onSubmit={handleRequestReset}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {message.text && (
                  <div className={`mb-4 p-3 rounded-lg text-sm ${
                    message.type === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {message.text}
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
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Code'
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                We've sent a 6-digit verification code to <strong>{email}</strong>. 
                Please enter it below.
              </p>

              <form onSubmit={handleVerifyCode}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="000000"
                    maxLength="6"
                    disabled={isLoading}
                  />
                </div>

                {message.text && (
                  <div className={`mb-4 p-3 rounded-lg text-sm ${
                    message.type === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                  className={`w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-all ${
                    isLoading || verificationCode.length !== 6 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Verify Code'
                  )}
                </button>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Didn't receive code? Resend
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-500 text-center">
            For security reasons, the verification code will expire in 10 minutes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;