import React from 'react';
import { 
  FaUserCircle, FaCheck, FaTimes, FaVideo, 
  FaUserFriends, FaStethoscope, FaNotesMedical,
  FaHeartbeat, FaChartLine, FaCalendarAlt,
  FaSyncAlt, FaExclamationTriangle, FaClock,
  FaPhone, FaCalendarCheck
} from 'react-icons/fa';

const DoctorDashboardTab = ({ appointments, onAppointmentAction, onAddSlot, userData }) => {
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingAppointments = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');
  
  const recentPatients = [
    { id: 1, name: 'Robert Brown', lastVisit: '2 days ago', condition: 'Diabetes', nextAppointment: 'Next week' },
    { id: 2, name: 'Lisa Garcia', lastVisit: '1 week ago', condition: 'Hypertension', nextAppointment: 'Tomorrow' },
    { id: 3, name: 'David Lee', lastVisit: '3 days ago', condition: 'Asthma', nextAppointment: 'In 2 weeks' },
    { id: 4, name: 'Maria Rodriguez', lastVisit: '2 weeks ago', condition: 'Arthritis', nextAppointment: 'Today' },
    { id: 5, name: 'James Wilson', lastVisit: '5 days ago', condition: 'Migraine', nextAppointment: 'Next month' },
  ];

  const handleAddPrescription = () => {
    alert('Add prescription feature would open here');
  };

  return (
    <div className="space-y-8">
      {/* Today's Appointments */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Today's Appointments</h2>
          <div className="flex items-center space-x-4">
            <span className="text-teal-600 font-medium">{upcomingAppointments.length} appointments</span>
            <button className="text-sm text-gray-600 hover:text-teal-600">
              <FaSyncAlt />
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {upcomingAppointments.map((appointment) => (
            <div key={appointment.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <FaUserCircle className="text-teal-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{appointment.patientName}</h4>
                  <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getConsultationColor(appointment.consultationType)}`}>
                      {appointment.consultationType}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right mb-4 md:mb-0">
                <div className="font-bold text-gray-900">{appointment.time}</div>
                <div className="text-sm text-gray-600">{appointment.duration}</div>
                <div className="text-sm text-gray-600">{appointment.type}</div>
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
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 flex items-center space-x-1"
                      >
                        <FaVideo />
                        <span>Join Call</span>
                      </a>
                    )}
                    <button
                      onClick={() => onAppointmentAction(appointment.id, 'complete')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center space-x-1"
                    >
                      <FaCheck />
                      <span>Complete</span>
                    </button>
                  </>
                )}
                
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {upcomingAppointments.length === 0 && (
          <div className="text-center py-8">
            <FaCalendarAlt className="text-4xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments today</h3>
            <p className="text-gray-600">Add time slots to get appointments</p>
            <button
              onClick={onAddSlot}
              className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Add Time Slot
            </button>
          </div>
        )}
      </div>

      {/* Recent Patients */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Patients</h2>
          <button className="text-teal-600 hover:text-teal-700 font-medium">
            View All →
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 font-medium text-gray-700">Patient Name</th>
                <th className="text-left py-3 font-medium text-gray-700">Last Visit</th>
                <th className="text-left py-3 font-medium text-gray-700">Condition</th>
                <th className="text-left py-3 font-medium text-gray-700">Next Appointment</th>
                <th className="text-left py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentPatients.map((patient) => (
                <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <FaUserFriends className="text-teal-600" />
                      </div>
                      <span className="font-medium">{patient.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-gray-600">{patient.lastVisit}</td>
                  <td className="py-4">
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                      {patient.condition}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="text-gray-900">{patient.nextAppointment}</div>
                  </td>
                  <td className="py-4">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700">
                        View
                      </button>
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        Message
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-4">Weekly Schedule</h3>
          <div className="space-y-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
              <div key={day} className="flex justify-between items-center">
                <span>{day}</span>
                <span className="font-bold">{index + 8} patients</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30">
            View Full Schedule
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">Prescriptions Pending</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">Patient #{item}</span>
                  <div className="text-sm text-gray-600">Prescription review needed</div>
                </div>
                <button 
                  onClick={handleAddPrescription}
                  className="px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={handleAddPrescription}
            className="w-full mt-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50"
          >
            View All Prescriptions
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardTab;