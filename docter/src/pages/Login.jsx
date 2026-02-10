import React from 'react';
import LoginForm from '../components/LoginForm';

const Login = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-6xl">
       

       
          
          
        

        {/* Login Form */}
        <LoginForm onLogin={onLogin} />

        {/* Stats Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-8 text-gray-600">
            <div>
              <div className="text-2xl font-bold text-teal-600">500+</div>
              <div className="text-sm">Doctors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-teal-600">10,000+</div>
              <div className="text-sm">Patients</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-teal-600">99%</div>
              <div className="text-sm">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-teal-600">24/7</div>
              <div className="text-sm">Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;