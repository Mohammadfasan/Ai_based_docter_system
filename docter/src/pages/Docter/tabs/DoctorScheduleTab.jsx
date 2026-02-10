import React from 'react';
import { FaCalendarAlt, FaClock, FaVideo, FaPhone } from 'react-icons/fa';

const DoctorScheduleTab = ({ newSlotData, onSlotDataChange, onSaveSlot }) => {
  const calendarDays = Array.from({ length: 35 }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">My Schedule</h2>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Calendar View</h3>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg">Week</button>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg">Month</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg">Day</button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center font-medium text-gray-700 py-2">
              {day}
            </div>
          ))}
          
          {calendarDays.map(day => (
            <div key={day} className="border rounded-lg p-2 min-h-24">
              <div className="font-medium">{day}</div>
              {day <= 7 && (
                <div className="space-y-1 mt-1">
                  <div className="text-xs bg-green-100 text-green-800 p-1 rounded">2 slots</div>
                  <div className="text-xs bg-blue-100 text-blue-800 p-1 rounded">1 appt</div>
                </div>
              )}
              {day > 7 && day <= 14 && (
                <div className="space-y-1 mt-1">
                  <div className="text-xs bg-green-100 text-green-800 p-1 rounded">3 slots</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-teal-50 rounded-xl p-6">
        <h3 className="font-bold text-gray-800 mb-4">Add New Time Slot</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input 
              type="date" 
              value={newSlotData.date}
              onChange={(e) => onSlotDataChange('date', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
            <input 
              type="time" 
              value={newSlotData.startTime}
              onChange={(e) => onSlotDataChange('startTime', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select 
              value={newSlotData.type}
              onChange={(e) => onSlotDataChange('type', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option>Video Consultation</option>
              <option>Clinic Visit</option>
              <option>Phone Consultation</option>
            </select>
          </div>
        </div>
        <button 
          onClick={onSaveSlot}
          className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          Add Slot
        </button>
      </div>
    </div>
  );
};

export default DoctorScheduleTab;