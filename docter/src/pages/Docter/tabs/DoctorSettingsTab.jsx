import React from 'react';
import { FaUserMd, FaEnvelope, FaPhone, FaGraduationCap } from 'react-icons/fa';

const DoctorSettingsTab = ({ userData }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Settings</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-gray-900 mb-4">Profile Settings</h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="flex items-center">
                  <FaUserMd className="text-gray-400 mr-2" />
                  <input 
                    type="text" 
                    defaultValue={userData?.name || 'Dr. Sarah Johnson'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="flex items-center">
                  <FaEnvelope className="text-gray-400 mr-2" />
                  <input 
                    type="email" 
                    defaultValue={userData?.email || 'sarah.johnson@healthai.com'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="flex items-center">
                  <FaPhone className="text-gray-400 mr-2" />
                  <input 
                    type="tel" 
                    defaultValue="+1 (555) 123-4567"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <div className="flex items-center">
                  <FaGraduationCap className="text-gray-400 mr-2" />
                  <input 
                    type="text" 
                    defaultValue="General Physician & ENT Specialist"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold text-gray-900 mb-4">Notification Settings</h3>
          <div className="space-y-4">
            {[
              { label: 'Email Notifications', description: 'Receive appointment notifications via email', defaultChecked: true },
              { label: 'SMS Notifications', description: 'Receive urgent alerts via SMS', defaultChecked: true },
              { label: 'Appointment Reminders', description: 'Get reminders before appointments', defaultChecked: true },
              { label: 'New Patient Alerts', description: 'Notify when new patients book appointments', defaultChecked: true },
            ].map((setting, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-900">{setting.label}</div>
                  <div className="text-sm text-gray-600">{setting.description}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    defaultChecked={setting.defaultChecked}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button className="px-8 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorSettingsTab;