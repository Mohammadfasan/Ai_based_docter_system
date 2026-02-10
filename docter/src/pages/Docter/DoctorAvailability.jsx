import React, { useState } from 'react';
import {
  FaCalendar, FaClock, FaCheck, FaTimes, FaCalendarAlt,
  FaUserMd, FaVideo, FaCalendarCheck, FaSave, FaUndo,
  FaBell, FaPhone, FaMapMarkerAlt
} from 'react-icons/fa';

const DoctorAvailability = ({ userType, userData, availability, setAvailability }) => {
  const [newUnavailableDate, setNewUnavailableDate] = useState('');

  const statusOptions = [
    { value: 'available', label: 'Available', color: 'bg-green-500', desc: 'Accepting new appointments' },
    { value: 'busy', label: 'Busy', color: 'bg-yellow-500', desc: 'Limited availability' },
    { value: 'away', label: 'Away', color: 'bg-orange-500', desc: 'Temporarily unavailable' },
    { value: 'offline', label: 'Offline', color: 'bg-red-500', desc: 'Not available' }
  ];

  const handleDayToggle = (index) => {
    const updatedDays = [...availability.workingDays];
    updatedDays[index].active = !updatedDays[index].active;
    setAvailability({ ...availability, workingDays: updatedDays });
  };

  const handleDayTimeChange = (index, field, value) => {
    const updatedDays = [...availability.workingDays];
    updatedDays[index][field] = value;
    setAvailability({ ...availability, workingDays: updatedDays });
  };

  const handleConsultationToggle = (index) => {
    const updatedTypes = [...availability.consultationTypes];
    updatedTypes[index].enabled = !updatedTypes[index].enabled;
    setAvailability({ ...availability, consultationTypes: updatedTypes });
  };

  const handleAddUnavailableDate = () => {
    if (!newUnavailableDate) return;
    
    if (!availability.unavailableDates.includes(newUnavailableDate)) {
      setAvailability({
        ...availability,
        unavailableDates: [...availability.unavailableDates, newUnavailableDate]
      });
      setNewUnavailableDate('');
    }
  };

  const handleRemoveUnavailableDate = (date) => {
    setAvailability({
      ...availability,
      unavailableDates: availability.unavailableDates.filter(d => d !== date)
    });
  };

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('doctorAvailability', JSON.stringify(availability));
    alert('Availability settings saved successfully!');
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to default?')) {
      setAvailability({
        status: 'available',
        workingDays: [
          { day: 'Monday', active: true, start: '09:00', end: '17:00' },
          { day: 'Tuesday', active: true, start: '09:00', end: '17:00' },
          { day: 'Wednesday', active: true, start: '09:00', end: '17:00' },
          { day: 'Thursday', active: true, start: '09:00', end: '17:00' },
          { day: 'Friday', active: true, start: '09:00', end: '17:00' },
          { day: 'Saturday', active: false, start: '10:00', end: '14:00' },
          { day: 'Sunday', active: false, start: '10:00', end: '14:00' }
        ],
        breakTime: {
          enabled: true,
          start: '13:00',
          end: '14:00'
        },
        consultationTypes: [
          { type: 'video', enabled: true, duration: 30, price: 120 },
          { type: 'clinic', enabled: true, duration: 30, price: 140 }
        ],
        slotDuration: 30,
        bufferTime: 15,
        maxDailyAppointments: 12,
        autoConfirm: true,
        advanceBookingDays: 30,
        unavailableDates: ['2024-12-25', '2024-12-31']
      });
    }
  };

  const getWeeklyScheduleSummary = () => {
    const activeDays = availability.workingDays.filter(day => day.active);
    const totalHours = activeDays.reduce((total, day) => {
      const start = parseInt(day.start.split(':')[0]);
      const end = parseInt(day.end.split(':')[0]);
      return total + (end - start);
    }, 0);
    
    return {
      activeDays: activeDays.length,
      totalHours,
      totalSlots: Math.floor((totalHours * 60) / availability.slotDuration)
    };
  };

  const summary = getWeeklyScheduleSummary();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Availability Settings</h1>
        <p className="text-gray-600">Configure your working hours and appointment settings</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Current Status</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAvailability({ ...availability, status: option.value })}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center ${
                    availability.status === option.value
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 ${option.color} rounded-full mb-3`}></div>
                  <div className="font-bold text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Working Days */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Working Days & Hours</h3>
            
            <div className="space-y-4">
              {availability.workingDays.map((day, index) => (
                <div key={day.day} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={day.active}
                        onChange={() => handleDayToggle(index)}
                        className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="font-medium text-gray-900 min-w-24">{day.day}</span>
                    </label>
                    
                    {day.active && (
                      <div className="flex items-center space-x-4">
                        <div>
                          <label className="text-sm text-gray-600">From</label>
                          <input
                            type="time"
                            value={day.start}
                            onChange={(e) => handleDayTimeChange(index, 'start', e.target.value)}
                            className="ml-2 px-3 py-1 border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">To</label>
                          <input
                            type="time"
                            value={day.end}
                            onChange={(e) => handleDayTimeChange(index, 'end', e.target.value)}
                            className="ml-2 px-3 py-1 border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    day.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {day.active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consultation Types */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Consultation Types</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {availability.consultationTypes.map((consultation, index) => (
                <div key={consultation.type} className={`p-4 rounded-xl border-2 ${
                  consultation.enabled ? 'border-teal-500 bg-teal-50' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-bold text-gray-900 capitalize">
                        {consultation.type} Consultation
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Duration: {consultation.duration} min • ${consultation.price}
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consultation.enabled}
                        onChange={() => handleConsultationToggle(index)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                  
                  {consultation.enabled && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                        <select
                          value={consultation.duration}
                          onChange={(e) => {
                            const updated = [...availability.consultationTypes];
                            updated[index].duration = parseInt(e.target.value);
                            setAvailability({ ...availability, consultationTypes: updated });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        >
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="45">45 minutes</option>
                          <option value="60">60 minutes</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                        <input
                          type="number"
                          value={consultation.price}
                          onChange={(e) => {
                            const updated = [...availability.consultationTypes];
                            updated[index].price = parseInt(e.target.value);
                            setAvailability({ ...availability, consultationTypes: updated });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Advanced Settings</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Slot Duration
                </label>
                <select
                  value={availability.slotDuration}
                  onChange={(e) => setAvailability({ ...availability, slotDuration: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buffer Time Between Appointments
                </label>
                <select
                  value={availability.bufferTime}
                  onChange={(e) => setAvailability({ ...availability, bufferTime: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="0">No buffer</option>
                  <option value="5">5 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Daily Appointments
                </label>
                <input
                  type="number"
                  value={availability.maxDailyAppointments}
                  onChange={(e) => setAvailability({ ...availability, maxDailyAppointments: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min="1"
                  max="50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advance Booking (Days)
                </label>
                <input
                  type="number"
                  value={availability.advanceBookingDays}
                  onChange={(e) => setAvailability({ ...availability, advanceBookingDays: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min="1"
                  max="365"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={availability.autoConfirm}
                  onChange={(e) => setAvailability({ ...availability, autoConfirm: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="font-medium text-gray-900">Auto-confirm appointments</span>
                <span className="text-sm text-gray-600">Automatically confirm appointments without manual approval</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-6">Schedule Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Days</span>
                <span className="font-bold">{summary.activeDays} days</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Weekly Hours</span>
                <span className="font-bold">{summary.totalHours} hours</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available Slots</span>
                <span className="font-bold">{summary.totalSlots} slots</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Slot Duration</span>
                <span className="font-bold">{availability.slotDuration} min</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Buffer Time</span>
                <span className="font-bold">{availability.bufferTime} min</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Max Daily Appointments</span>
                <span className="font-bold">{availability.maxDailyAppointments}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm">
                <div className="font-medium mb-1">Current Status</div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    availability.status === 'available' ? 'bg-green-500' :
                    availability.status === 'busy' ? 'bg-yellow-500' :
                    availability.status === 'away' ? 'bg-orange-500' : 'bg-red-500'
                  }`}></div>
                  <span className="font-medium capitalize">{availability.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Break Time */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">Break Time</h3>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  checked={availability.breakTime.enabled}
                  onChange={(e) => setAvailability({
                    ...availability,
                    breakTime: { ...availability.breakTime, enabled: e.target.checked }
                  })}
                  className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="font-medium text-gray-900">Enable Break Time</span>
              </label>
              
              {availability.breakTime.enabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={availability.breakTime.start}
                      onChange={(e) => setAvailability({
                        ...availability,
                        breakTime: { ...availability.breakTime, start: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={availability.breakTime.end}
                      onChange={(e) => setAvailability({
                        ...availability,
                        breakTime: { ...availability.breakTime, end: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Unavailable Dates */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">Unavailable Dates</h3>
            
            <div className="mb-4">
              <div className="flex space-x-2 mb-3">
                <input
                  type="date"
                  value={newUnavailableDate}
                  onChange={(e) => setNewUnavailableDate(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                />
                <button
                  onClick={handleAddUnavailableDate}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Add
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              {availability.unavailableDates.map((date) => (
                <div key={date} className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="text-red-800">{new Date(date).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleRemoveUnavailableDate(date)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
              
              {availability.unavailableDates.length === 0 && (
                <p className="text-gray-600 text-sm">No unavailable dates set</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-6">Save Changes</h3>
            
            <div className="space-y-3">
              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-white text-teal-600 rounded-lg font-semibold hover:bg-gray-100"
              >
                <FaSave />
                <span>Save All Settings</span>
              </button>
              
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg font-semibold hover:bg-white/30"
              >
                <FaUndo />
                <span>Reset to Default</span>
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/30">
              <p className="text-sm opacity-90">
                Changes will take effect immediately and affect future appointments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailability;