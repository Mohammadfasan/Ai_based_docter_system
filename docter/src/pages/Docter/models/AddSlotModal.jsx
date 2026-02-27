// DoctorPortal/models/AddSlotModal.jsx
import React from 'react';
import { FaTimes, FaCalendarAlt, FaClock, FaVideo, FaPhone, FaCheck, FaUserMd } from 'react-icons/fa';

const AddSlotModal = ({ newSlotData, onClose, onSlotDataChange, onSaveSlot }) => {
  const handleSave = () => {
    if (!newSlotData.date || !newSlotData.startTime) {
      alert('Please select date and time');
      return;
    }
    onSaveSlot();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add Time Slot</h2>
            <p className="text-sm text-gray-600">Create new appointment slot</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FaCalendarAlt className="mr-2 text-gray-500" />
              Date
            </label>
            <input
              type="date"
              value={newSlotData.date}
              onChange={(e) => onSlotDataChange('date', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Time Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaClock className="mr-2 text-gray-500" />
                Start Time
              </label>
              <input
                type="time"
                value={newSlotData.startTime}
                onChange={(e) => onSlotDataChange('startTime', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <select
                value={newSlotData.duration || '30'}
                onChange={(e) => onSlotDataChange('duration', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>
          </div>

          {/* Consultation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Consultation Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { 
                  value: 'Video Consultation', 
                  icon: <FaVideo className="text-purple-600" />, 
                  label: 'Video',
                  color: 'border-purple-200 bg-purple-50 text-purple-700'
                },
                { 
                  value: 'Clinic Visit', 
                  icon: <FaUserMd className="text-teal-600" />, 
                  label: 'Clinic',
                  color: 'border-teal-200 bg-teal-50 text-teal-700'
                },
                { 
                  value: 'Phone Consultation', 
                  icon: <FaPhone className="text-blue-600" />, 
                  label: 'Phone',
                  color: 'border-blue-200 bg-blue-50 text-blue-700'
                }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => onSlotDataChange('type', type.value)}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                    newSlotData.type === type.value
                      ? `${type.color} ring-2 ring-offset-2 ${type.color.includes('purple') ? 'ring-purple-300' : type.color.includes('teal') ? 'ring-teal-300' : 'ring-blue-300'}`
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl mb-2">{type.icon}</span>
                  <span className="font-medium text-sm">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={newSlotData.notes || ''}
              onChange={(e) => onSlotDataChange('notes', e.target.value)}
              placeholder="Add any special instructions or notes..."
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
            />
          </div>

          {/* Info Text */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This slot will be visible to patients for booking. You can cancel it anytime before 24 hours of the scheduled time.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium flex items-center justify-center gap-2"
            >
              <FaCheck />
              Add Time Slot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

AddSlotModal.defaultProps = {
  newSlotData: {},
  onClose: () => {},
  onSlotDataChange: () => {},
  onSaveSlot: () => {}
};

export default AddSlotModal;