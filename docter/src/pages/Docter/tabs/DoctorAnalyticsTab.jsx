import React from 'react';
import { 
  FaChartPie, FaUserFriends, FaClock, 
  FaChartLine, FaStar, FaCalendarAlt
} from 'react-icons/fa';

const DoctorAnalyticsTab = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white">
          <h3 className="font-bold text-lg mb-4">Monthly Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Appointments</span>
              <span className="font-bold">124</span>
            </div>
            <div className="flex justify-between">
              <span>New Patients</span>
              <span className="font-bold">28</span>
            </div>
            <div className="flex justify-between">
              <span>Follow-ups</span>
              <span className="font-bold">96</span>
            </div>
            <div className="flex justify-between">
              <span>Revenue</span>
              <span className="font-bold">$12,450</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-800 mb-4">Patient Satisfaction</h3>
          <div className="flex items-center mb-2">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="bg-green-500 h-4 rounded-full" style={{ width: '92%' }}></div>
            </div>
            <span className="ml-3 font-bold">92%</span>
          </div>
          <p className="text-sm text-gray-600">Based on 245 reviews</p>
          <div className="mt-3 flex items-center">
            <FaStar className="text-yellow-400 mr-1" />
            <FaStar className="text-yellow-400 mr-1" />
            <FaStar className="text-yellow-400 mr-1" />
            <FaStar className="text-yellow-400 mr-1" />
            <FaStar className="text-yellow-400 mr-1" />
            <span className="ml-2 font-medium">4.8/5.0</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-xl">
          <div className="flex items-center mb-2">
            <FaChartPie className="text-blue-600 mr-2" />
            <span className="font-medium">Consultation Types</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Video</span>
              <span className="font-bold">68%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Clinic</span>
              <span className="font-bold">25%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Phone</span>
              <span className="font-bold">7%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-xl">
          <div className="flex items-center mb-2">
            <FaUserFriends className="text-green-600 mr-2" />
            <span className="font-medium">Patient Demographics</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Age 18-35</span>
              <span className="font-bold">35%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Age 36-55</span>
              <span className="font-bold">45%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Age 55+</span>
              <span className="font-bold">20%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-xl">
          <div className="flex items-center mb-2">
            <FaClock className="text-purple-600 mr-2" />
            <span className="font-medium">Busiest Days</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Wednesday</span>
              <span className="font-bold">18 patients</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Monday</span>
              <span className="font-bold">16 patients</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Friday</span>
              <span className="font-bold">14 patients</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-bold text-gray-800 mb-4">Monthly Trends</h3>
        <div className="flex items-center justify-center h-40 border border-gray-200 rounded-lg">
          <div className="text-center">
            <FaChartLine className="text-4xl text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600">Chart would display here</p>
            <p className="text-sm text-gray-500">Monthly appointment trends visualization</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAnalyticsTab;