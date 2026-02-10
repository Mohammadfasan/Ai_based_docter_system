import React from 'react';
import { 
  FaCalendarAlt, FaClock, FaPhone, FaUserCircle,
  FaCheck, FaTimes, FaVideo, FaExclamationTriangle
} from 'react-icons/fa';

const DoctorAppointmentsTab = ({ appointments, onAppointmentAction }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConsultationColor = (type) => {
    return type === 'Video Consultation' ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-6">
        {['all', 'today', 'pending', 'confirmed', 'completed', 'cancelled'].map((filter) => (
          <button
            key={filter}
            className={`px-4 py-2 rounded-lg font-medium capitalize ${
              filter === 'today'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{appointment.patientName}</h3>
                <p className="text-gray-600">{appointment.type}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
                <span className={`px-3 py-1 mt-2 rounded-full text-sm font-medium ${getConsultationColor(appointment.consultationType)}`}>
                  {appointment.consultationType}
                </span>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-gray-600">
                <FaCalendarAlt className="mr-3 flex-shrink-0" />
                <span>{appointment.date} at {appointment.time}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaClock className="mr-3 flex-shrink-0" />
                <span>Duration: {appointment.duration}</span>
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Symptoms: </span>
                {appointment.symptoms}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center text-gray-600 mb-2">
                <FaPhone className="mr-2" />
                <span>{appointment.contact}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaUserCircle className="mr-2" />
                <span>{appointment.email}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {appointment.status === 'pending' && (
                <>
                  <button
                    onClick={() => onAppointmentAction(appointment.id, 'confirm')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center space-x-1"
                  >
                    <FaCheck />
                    <span>Confirm Appointment</span>
                  </button>
                  <button
                    onClick={() => onAppointmentAction(appointment.id, 'cancel')}
                    className="px-4 py-2 border border-red-600 text-red-600 rounded-lg text-sm hover:bg-red-50 flex items-center space-x-1"
                  >
                    <FaTimes />
                    <span>Cancel Appointment</span>
                  </button>
                </>
              )}
              
              {appointment.status === 'confirmed' && (
                <>
                  {appointment.consultationType === 'Video Consultation' && (
                    <a
                      href={appointment.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                    >
                      Join Call
                    </a>
                  )}
                  <button
                    onClick={() => onAppointmentAction(appointment.id, 'complete')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    Mark Complete
                  </button>
                </>
              )}
              
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointmentsTab;