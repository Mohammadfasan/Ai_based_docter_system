import React from 'react';
import { FaHeartbeat, FaShieldAlt, FaLock, FaUserShield, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white ">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FaHeartbeat className="text-teal-400 text-2xl" />
              <span className="text-xl font-bold">Health<span className="text-teal-400">AI</span></span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              AI-powered healthcare booking platform making medical care accessible, accurate, and secure for everyone.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-teal-400">
                <FaFacebook />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400">
                <FaTwitter />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400">
                <FaLinkedin />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400">
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link to="/appointments" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Appointments
                </Link>
              </li>
              <li>
                <Link to="/medical-records" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Medical Records
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Privacy */}
          <div>
            <h4 className="font-bold text-lg mb-4">Security & Privacy</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <FaLock className="text-teal-400 mt-1" />
                <div>
                  <p className="font-medium">End-to-End Encryption</p>
                  <p className="text-gray-400 text-sm">All medical data is securely encrypted</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FaUserShield className="text-teal-400 mt-1" />
                <div>
                  <p className="font-medium">HIPAA Compliant</p>
                  <p className="text-gray-400 text-sm">Meets healthcare privacy standards</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FaShieldAlt className="text-teal-400 mt-1" />
                <div>
                  <p className="font-medium">GDPR Compliant</p>
                  <p className="text-gray-400 text-sm">Your data, your control</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FaPhone className="text-teal-400" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-teal-400" />
                <span className="text-gray-400">support@healthai.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaMapMarkerAlt className="text-teal-400" />
                <span className="text-gray-400">123 Healthcare St, Medical City</span>
              </div>
            </div>
            <div className="mt-6">
              <h5 className="font-medium mb-2">Emergency Numbers</h5>
              <div className="text-sm text-gray-400 space-y-1">
                <div>Ambulance: 911</div>
                <div>Poison Control: 1-800-222-1222</div>
                <div>Mental Health: 988</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 HealthAI. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center space-x-6 text-gray-400">
              <Link to="/help" className="text-sm hover:text-teal-400 transition-colors">
                Help Center
              </Link>
              <a href="#" className="text-sm hover:text-teal-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm hover:text-teal-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm hover:text-teal-400 transition-colors">
                Cookie Policy
              </a>
              <a href="#" className="text-sm hover:text-teal-400 transition-colors">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;