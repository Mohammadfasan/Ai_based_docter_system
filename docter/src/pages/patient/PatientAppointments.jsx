import React, { useState, useEffect } from 'react';
import { 
  FaCalendar, FaClock, FaUserMd, FaVideo, FaPhone,
  FaMapMarkerAlt, FaTimes, FaCheck, FaCalendarCheck,
  FaDownload, FaFileMedical, FaCalendarAlt, FaStethoscope,
  FaArrowRight, FaSyncAlt, FaFilter, FaSort
} from 'react-icons/fa';

const PatientAppointments = ({ userType, userData }) => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const filters = [
    { id: 'all', label: 'All Appointments' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAppointments([
        {
          id: 'APT-001',
          doctor: {
            name: 'Dr. Sarah Johnson',
            specialization: 'General Physician',
            photo: null
          },
          date: '2024-12-20',
          time: '09:00 AM',
          endTime: '09:30 AM',
          type: 'video',
          status: 'confirmed',
          symptoms: 'Fever and sore throat',
          notes: 'Please join 5 minutes early',
          meetingLink: 'https://meet.healthai.com/apt001',
          consultationFee: 120,
          bookedAt: '2024-12-15 10:30 AM',
          location: 'Online Consultation',
          duration: 30
        },
        {
          id: 'APT-002',
          doctor: {
            name: 'Dr. Michael Chen',
            specialization: 'Internal Medicine',
            photo: null
          },
          date: '2024-12-22',
          time: '02:30 PM',
          endTime: '03:15 PM',
          type: 'clinic',
          status: 'pending',
          symptoms: 'Blood pressure check',
          consultationFee: 140,
          bookedAt: '2024-12-16 11:20 AM',
          location: 'MediCare Center, Room 302',
          duration: 45
        },
        {
          id: 'APT-003',
          doctor: {
            name: 'Dr. Emily Rodriguez',
            specialization: 'Pediatrician',
            photo: null
          },
          date: '2024-12-18',
          time: '11:00 AM',
          endTime: '11:30 AM',
          type: 'video',
          status: 'completed',
          symptoms: 'Child vaccination follow-up',
          consultationFee: 150,
          bookedAt: '2024-12-10 09:15 AM',
          location: 'Online Consultation',
          duration: 30,
          prescription: 'Vaccination completed successfully'
        },
        {
          id: 'APT-004',
          doctor: {
            name: 'Dr. James Wilson',
            specialization: 'Cardiologist',
            photo: null
          },
          date: '2024-12-25',
          time: '10:00 AM',
          endTime: '10:30 AM',
          type: 'clinic',
          status: 'cancelled',
          symptoms: 'Heart checkup',
          consultationFee: 200,
          bookedAt: '2024-12-12 03:45 PM',
          location: 'Heart Care Institute',
          duration: 30,
          cancellationReason: 'Doctor unavailable'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredAppointments = appointments.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return ['confirmed', 'pending'].includes(app.status);
    return app.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    return type === 'video' ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800';
  };

  const handleCancelAppointment = (appointmentId, reason) => {
    setAppointments(appointments.map(app => 
      app.id === appointmentId ? { ...app, status: 'cancelled', cancellationReason: reason } : app
    ));
    setShowCancelModal(false);
    alert('Appointment cancelled successfully');
  };

  const handleReschedule = (appointmentId, newDate, newTime) => {
    setAppointments(appointments.map(app => 
      app.id === appointmentId ? { 
        ...app, 
        date: newDate, 
        time: newTime,
        status: 'pending' 
      } : app
    ));
    setShowRescheduleModal(false);
    alert('Appointment rescheduled successfully');
  };

  const handleJoinMeeting = (meetingLink) => {
    window.open(meetingLink, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600">Manage and track all your medical appointments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => ['confirmed', 'pending'].includes(a.status)).length}
              </div>
              <div className="text-gray-600">Upcoming</div>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <FaCalendarAlt className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'pending').length}
              </div>
              <div className="text-gray-600">Pending</div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <FaClock className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'completed').length}
              </div>
              <div className="text-gray-600">Completed</div>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <FaCheck className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'cancelled').length}
              </div>
              <div className="text-gray-600">Cancelled</div>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <FaTimes className="text-red-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <span className="font-medium text-gray-700">Filter by:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === f.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <FaSort />
            <span>Sort</span>
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-6">
        {filteredAppointments.map(appointment => (
          <div key={appointment.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center">
                    {appointment.doctor.photo ? (
                      <img src={appointment.doctor.photo} alt={appointment.doctor.name} className="w-16 h-16 rounded-xl" />
                    ) : (
                      <FaUserMd className="text-teal-600 text-2xl" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{appointment.doctor.name}</h3>
                    <p className="text-teal-600">{appointment.doctor.specialization}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(appointment.type)}`}>
                        {appointment.type === 'video' ? 'Video Consultation' : 'Clinic Visit'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{appointment.time}</div>
                  <div className="text-gray-600">
                    {new Date(appointment.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Duration: {appointment.duration} mins</div>
                </div>
              </div>

              {/* Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                    <FaStethoscope className="mr-2" />
                    Symptoms
                  </h4>
                  <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">{appointment.symptoms}</p>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                    <FaMapMarkerAlt className="mr-2" />
                    Location
                  </h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{appointment.location}</p>
                    {appointment.type === 'video' && appointment.meetingLink && (
                      <div className="mt-2">
                        <div className="text-sm text-gray-600">Meeting Link:</div>
                        <a 
                          href={appointment.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:text-teal-700 text-sm break-all"
                        >
                          {appointment.meetingLink}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fees and Actions */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6 border-t border-gray-200">
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    ${appointment.consultationFee}
                    <span className="text-sm text-gray-500 font-normal"> / consultation</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Booked on: {new Date(appointment.bookedAt).toLocaleString()}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {appointment.status === 'confirmed' && appointment.type === 'video' && (
                    <button
                      onClick={() => handleJoinMeeting(appointment.meetingLink)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center space-x-2"
                    >
                      <FaVideo />
                      <span>Join Meeting</span>
                    </button>
                  )}
                  
                  {appointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowCancelModal(true);
                        }}
                        className="px-4 py-2 border border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowRescheduleModal(true);
                        }}
                        className="px-4 py-2 border border-teal-600 text-teal-600 rounded-lg font-medium hover:bg-teal-50"
                      >
                        Reschedule
                      </button>
                    </>
                  )}
                  
                  {appointment.status === 'confirmed' && appointment.type === 'clinic' && (
                    <button
                      onClick={() => setSelectedAppointment(appointment)}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
                    >
                      View Directions
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedAppointment(appointment)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                  >
                    View Details
                  </button>
                  
                  {appointment.status === 'completed' && (
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center space-x-2">
                      <FaDownload />
                      <span>Download Prescription</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredAppointments.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FaCalendar className="text-4xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No appointments found</h3>
            <p className="text-gray-500 mb-6">You don't have any appointments with the selected filter</p>
            <a 
              href="/doctors" 
              className="inline-flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
            >
              <span>Book New Appointment</span>
              <FaArrowRight />
            </a>
          </div>
        )}
      </div>

      {/* Cancel Appointment Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Appointment</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel your appointment with {selectedAppointment.doctor.name} 
                on {selectedAppointment.date} at {selectedAppointment.time}?
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for cancellation (optional)
                  </label>
                  <textarea
                    placeholder="Please provide a reason for cancellation..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Keep Appointment
                  </button>
                  <button
                    onClick={() => handleCancelAppointment(selectedAppointment.id, "Patient cancelled")}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reschedule Appointment</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select New Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select New Time</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option>09:00 AM</option>
                    <option>10:30 AM</option>
                    <option>02:00 PM</option>
                    <option>03:30 PM</option>
                    <option>04:45 PM</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => setShowRescheduleModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReschedule(selectedAppointment.id, '2024-12-21', '11:00 AM')}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Request Reschedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;