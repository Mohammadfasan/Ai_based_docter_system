// pages/EmergencySOS.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaAmbulance, FaPhone, FaMapMarkerAlt, FaUserMd, 
  FaClock, FaHeartbeat, FaShieldAlt, FaFirstAid 
} from 'react-icons/fa';

const EmergencySOS = () => {
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: 'Emergency', number: '108', type: 'ambulance' },
    { name: 'Police', number: '100', type: 'police' },
    { name: 'Fire', number: '101', type: 'fire' }
  ]);
  
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [ambulanceLocation, setAmbulanceLocation] = useState(null);
  const [eta, setEta] = useState('8 minutes');
  
  const triggerEmergency = () => {
    setIsEmergencyActive(true);
    // Simulate ambulance dispatch
    setTimeout(() => {
      setAmbulanceLocation({
        latitude: 13.0827,
        longitude: 80.2707,
        address: 'On the way to your location'
      });
    }, 2000);
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Emergency SOS</h1>
        <p className="text-gray-600">Immediate medical assistance at your fingertips</p>
      </div>
      
      {/* Emergency Button */}
      <div className="text-center mb-8">
        <button
          onClick={triggerEmergency}
          disabled={isEmergencyActive}
          className={`relative w-64 h-64 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg transform hover:scale-105 transition-all ${
            isEmergencyActive 
              ? 'bg-red-600 animate-pulse' 
              : 'bg-gradient-to-r from-red-500 to-red-600'
          }`}
        >
          {isEmergencyActive ? (
            <div className="text-center">
              <FaAmbulance className="text-4xl mx-auto mb-2" />
              <div>Help is on the way!</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">SOS</div>
              <div>Press for Emergency</div>
            </div>
          )}
        </button>
      </div>
      
      {/* Ambulance Tracking */}
      {isEmergencyActive && ambulanceLocation && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <FaAmbulance className="text-2xl text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Ambulance Tracking</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FaClock className="text-red-600" />
                <span className="font-bold">ETA</span>
              </div>
              <div className="text-2xl font-bold text-red-700">{eta}</div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FaMapMarkerAlt className="text-blue-600" />
                <span className="font-bold">Location</span>
              </div>
              <div className="text-lg font-bold text-blue-700">{ambulanceLocation.address}</div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FaUserMd className="text-green-600" />
                <span className="font-bold">Medical Team</span>
              </div>
              <div className="text-lg font-bold text-green-700">Ready</div>
            </div>
          </div>
          
          {/* Mock Map */}
          <div className="mt-4 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FaMapMarkerAlt className="text-3xl text-red-600 mb-2" />
              <p>Live ambulance location would appear here</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Emergency Contacts */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Emergency Contacts</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {contact.type === 'ambulance' && <FaAmbulance className="text-red-600" />}
                  {contact.type === 'police' && <FaShieldAlt className="text-blue-600" />}
                  {contact.type === 'fire' && <FaFirstAid className="text-orange-600" />}
                  <span className="font-bold">{contact.name}</span>
                </div>
                <a 
                  href={`tel:${contact.number}`}
                  className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700"
                >
                  <FaPhone />
                </a>
              </div>
              <div className="text-2xl font-bold text-gray-900">{contact.number}</div>
            </div>
          ))}
        </div>
        
        {/* Medical Information Card */}
        <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <FaHeartbeat className="text-teal-600" />
            <h3 className="font-bold text-teal-800">Your Medical Information</h3>
          </div>
          <p className="text-teal-700">
            In case of emergency, first responders will see: Blood Type: O+, Allergies: Penicillin, 
            Emergency Contact: +91 9876543210
          </p>
        </div>
      </div>
    </div>
  );
};
export default EmergencySOS;    