import React from 'react';
import { 
  FaUserMd, FaClock, FaUserFriends, FaCalendarCheck, 
  FaFileMedical, FaChartBar, FaCog, FaPrescriptionBottle,
  FaFileAlt, FaCalendarAlt, FaChartLine
} from 'react-icons/fa';

const DoctorSidebar = ({ 
  activeTab, 
  onTabChange, 
  onAddSlot,
  onAddPrescription,
  onGenerateReport,
  availability 
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaUserMd /> },
    { id: 'appointments', label: 'Appointments', icon: <FaClock /> },
    { id: 'patients', label: 'Patients', icon: <FaUserFriends /> },
    { id: 'availability', label: 'Availability', icon: <FaCalendarCheck /> },
    { id: 'records', label: 'Medical Records', icon: <FaFileMedical /> },
    { id: 'analytics', label: 'Analytics', icon: <FaChartBar /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> },
  ];

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-8">
        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
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

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={onAddPrescription}
              className="w-full flex items-center justify-center space-x-2 bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              <FaPrescriptionBottle />
              <span>Add Prescription</span>
            </button>
            <button 
              onClick={() => onTabChange('availability')}
              className="w-full border border-teal-600 text-teal-600 py-2 rounded-lg font-medium hover:bg-teal-50 transition-colors"
            >
              Manage Availability
            </button>
            <button 
              onClick={onGenerateReport}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <FaFileAlt className="inline mr-2" />
              Generate Report
            </button>
            <button 
              onClick={() => onTabChange('schedule')}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <FaCalendarAlt className="inline mr-2" />
              View Full Schedule
            </button>
          </div>
        </div>

        {/* Availability Status */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4">Availability</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Today's Slots</span>
              <span className="font-medium">8/12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Next Available</span>
              <span className="font-medium">Tomorrow, 9:00 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Response Time</span>
              <span className="font-medium">15 min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSidebar;