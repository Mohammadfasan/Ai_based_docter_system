import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, FaClock, FaPhone, FaUserCircle,
  FaCheck, FaTimes, FaVideo, FaExclamationTriangle,
  FaUserMd, FaInfoCircle, FaCalendarCheck,
  FaFilter, FaSearch, FaStethoscope, FaCalendar
} from 'react-icons/fa';

const DoctorAppointmentsTab = ({ 
  doctorId = null,
  doctorEmail = null
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadAppointments();
    const interval = setInterval(loadAppointments, 3000);
    return () => clearInterval(interval);
  }, [doctorId]);

  const loadAppointments = () => {
    setLoading(true);
    let loadedAppointments = [];
    
    if (doctorId) {
      // ✅ 1. Load from doctor-specific appointments (CRITICAL)
      const doctorAppointmentsKey = `doctor_appointments_${doctorId}`;
      const savedDoctorAppointments = JSON.parse(localStorage.getItem(doctorAppointmentsKey) || '[]');
      
      if (savedDoctorAppointments.length > 0) {
        loadedAppointments = savedDoctorAppointments;
        console.log(`✅ Loaded ${savedDoctorAppointments.length} appointments with patient details`);
      }
      
      // ✅ 2. Also load from main appointments
      const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const mainDoctorAppointments = allAppointments.filter(apt => 
        apt.doctorId === doctorId || apt.doctorUserId === doctorId
      );
      
      // ✅ 3. Merge and deduplicate
      mainDoctorAppointments.forEach(mainApt => {
        if (!loadedAppointments.some(a => a.id === mainApt.id)) {
          loadedAppointments.push(mainApt);
        }
      });
      
      // ✅ 4. Save back to ensure consistency
      localStorage.setItem(doctorAppointmentsKey, JSON.stringify(loadedAppointments));
    }
    
    // ✅ 5. Format dates for display
    loadedAppointments = loadedAppointments.map(apt => ({
      ...apt,
      displayDate: apt.date ? new Date(apt.date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      }) : 'Date not set'
    }));
    
    setAppointments(loadedAppointments);
    setLoading(false);
  };

  // ✅ Handle Confirm - Updates EVERYWHERE
  const handleConfirm = (id) => {
    console.log(`✅ Confirming appointment: ${id}`);
    
    // Update local state
    const updatedAppointments = appointments.map(apt => 
      apt.id === id ? { ...apt, status: 'confirmed' } : apt
    );
    setAppointments(updatedAppointments);
    
    // Update doctor-specific storage
    if (doctorId) {
      const doctorAppointmentsKey = `doctor_appointments_${doctorId}`;
      localStorage.setItem(doctorAppointmentsKey, JSON.stringify(updatedAppointments));
    }
    
    // Update main appointments (CRITICAL for patient view)
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAllAppointments = allAppointments.map(apt => 
      apt.id === id ? { ...apt, status: 'confirmed' } : apt
    );
    localStorage.setItem('appointments', JSON.stringify(updatedAllAppointments));
    
    // Update patient-specific appointments
    const appointment = appointments.find(a => a.id === id);
    if (appointment?.patientId) {
      const patientAppointmentsKey = `patient_appointments_${appointment.patientId}`;
      const patientAppointments = JSON.parse(localStorage.getItem(patientAppointmentsKey) || '[]');
      const updatedPatientAppointments = patientAppointments.map(apt => 
        apt.id === id ? { ...apt, status: 'confirmed' } : apt
      );
      localStorage.setItem(patientAppointmentsKey, JSON.stringify(updatedPatientAppointments));
    }
    
    alert('✅ Appointment confirmed successfully! Patient will see confirmed status.');
  };

  // ✅ Handle Cancel - Updates EVERYWHERE
  const handleCancel = (id) => {
    console.log(`❌ Cancelling appointment: ${id}`);
    
    const updatedAppointments = appointments.map(apt => 
      apt.id === id ? { ...apt, status: 'cancelled' } : apt
    );
    setAppointments(updatedAppointments);
    
    if (doctorId) {
      const doctorAppointmentsKey = `doctor_appointments_${doctorId}`;
      localStorage.setItem(doctorAppointmentsKey, JSON.stringify(updatedAppointments));
    }
    
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAllAppointments = allAppointments.map(apt => 
      apt.id === id ? { ...apt, status: 'cancelled' } : apt
    );
    localStorage.setItem('appointments', JSON.stringify(updatedAllAppointments));
    
    const appointment = appointments.find(a => a.id === id);
    if (appointment?.patientId) {
      const patientAppointmentsKey = `patient_appointments_${appointment.patientId}`;
      const patientAppointments = JSON.parse(localStorage.getItem(patientAppointmentsKey) || '[]');
      const updatedPatientAppointments = patientAppointments.map(apt => 
        apt.id === id ? { ...apt, status: 'cancelled' } : apt
      );
      localStorage.setItem(patientAppointmentsKey, JSON.stringify(updatedPatientAppointments));
    }
    
    // Free up the slot
    if (appointment?.slotId && doctorId) {
      const slotsKey = `doctor_slots_${doctorId}`;
      const doctorSlots = JSON.parse(localStorage.getItem(slotsKey) || '[]');
      const updatedSlots = doctorSlots.map(slot => 
        slot.id === appointment.slotId ? { ...slot, status: 'available', patientName: null } : slot
      );
      localStorage.setItem(slotsKey, JSON.stringify(updatedSlots));
    }
    
    alert('✅ Appointment cancelled successfully!');
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = searchQuery === '' || 
      (appointment.patientName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (appointment.symptoms?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (appointment.patientId?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (activeFilter === 'all') matchesFilter = true;
    else if (activeFilter === 'today') {
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      matchesFilter = appointment.displayDate === today;
    } else matchesFilter = appointment.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <FaCheck className="text-green-600" size={12} />;
      case 'pending': return <FaExclamationTriangle className="text-yellow-600" size={12} />;
      case 'completed': return <FaCalendarCheck className="text-blue-600" size={12} />;
      case 'cancelled': return <FaTimes className="text-red-600" size={12} />;
      default: return <FaInfoCircle className="text-gray-600" size={12} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Appointments</h1>
            <p className="text-xs text-gray-600">
              {filteredAppointments.length} {filteredAppointments.length === 1 ? 'appointment' : 'appointments'}
            </p>
          </div>
          <button className="p-2 bg-teal-100 rounded-lg text-teal-700" onClick={() => setShowFilters(!showFilters)}>
            <FaFilter size={18} />
          </button>
        </div>

        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
          <input type="text" placeholder="Search patients..." 
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        {showFilters && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { key: 'all', label: 'All', icon: <FaCalendarAlt size={14} /> },
              { key: 'today', label: 'Today', icon: <FaCalendar size={14} /> },
              { key: 'pending', label: 'Pending', icon: <FaExclamationTriangle size={14} /> },
              { key: 'confirmed', label: 'Confirmed', icon: <FaCheck size={14} /> },
              { key: 'completed', label: 'Completed', icon: <FaCalendarCheck size={14} /> },
              { key: 'cancelled', label: 'Cancelled', icon: <FaTimes size={14} /> }
            ].map(filter => (
              <button key={filter.key} onClick={() => { setActiveFilter(filter.key); setShowFilters(false); }}
                className={`flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-xs font-medium ${
                  activeFilter === filter.key ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <p className="text-lg font-bold text-gray-900">{appointments.filter(a => a.status === 'confirmed').length}</p>
            <p className="text-xs text-gray-600">Confirmed</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <p className="text-lg font-bold text-gray-900">{appointments.filter(a => a.status === 'pending').length}</p>
            <p className="text-xs text-gray-600">Pending</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <p className="text-lg font-bold text-gray-900">{appointments.filter(a => a.status === 'completed').length}</p>
            <p className="text-xs text-gray-600">Completed</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <p className="text-lg font-bold text-gray-900">{appointments.filter(a => a.consultationType === 'Video Consultation').length}</p>
            <p className="text-xs text-gray-600">Video</p>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="px-4 pb-24">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="mb-3 bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              {/* ✅ PATIENT INFO - Shows clearly */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                    {appointment.patientName ? appointment.patientName.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-gray-900 truncate">
                        {appointment.patientName || 'Unknown Patient'}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {appointment.patientId || 'N/A'}
                      </span>
                    </div>
                    {/* ✅ SYMPTOMS - Shows clearly */}
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Symptoms:</span> {appointment.symptoms || 'General consultation'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="text-gray-400" size={14} />
                    <span className="text-sm text-gray-700">{appointment.displayDate || appointment.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaClock className="text-gray-400" size={14} />
                    <span className="text-sm font-medium text-gray-900">{appointment.time || 'Time not set'}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span>{appointment.status || 'pending'}</span>
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${
                    appointment.consultationType === 'Video Consultation' ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800'
                  }`}>
                    {appointment.consultationType === 'Video Consultation' ? <FaVideo className="text-purple-600" size={12} /> : <FaUserMd className="text-teal-600" size={12} />}
                    <span>{appointment.consultationType || 'Clinic Visit'}</span>
                  </span>
                </div>
              </div>

              {/* ✅ ACTION BUTTONS - Confirm & Cancel */}
              <div className="grid grid-cols-2 gap-2">
                {appointment.status === 'pending' && (
                  <>
                    <button onClick={() => handleConfirm(appointment.id)}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center justify-center space-x-2">
                      <FaCheck size={14} />
                      <span>Confirm</span>
                    </button>
                    <button onClick={() => handleCancel(appointment.id)}
                      className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-100 flex items-center justify-center space-x-2">
                      <FaTimes size={14} />
                      <span>Cancel</span>
                    </button>
                  </>
                )}
                
                {appointment.status === 'confirmed' && (
                  <>
                    {appointment.consultationType === 'Video Consultation' && (
                      <a href={appointment.meetingLink || '#'} target="_blank" rel="noopener noreferrer"
                        className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 flex items-center justify-center space-x-2">
                        <FaVideo size={14} />
                        <span>Join Call</span>
                      </a>
                    )}
                    <button onClick={() => handleCancel(appointment.id)}
                      className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-100 flex items-center justify-center space-x-2">
                      <FaTimes size={14} />
                      <span>Cancel</span>
                    </button>
                  </>
                )}
              </div>

              {/* Contact Info */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaPhone className="text-gray-400" size={12} />
                    <span className="text-xs text-gray-600">{appointment.contact || appointment.patientPhone || 'No contact'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaUserCircle className="text-gray-400" size={12} />
                    <span className="text-xs text-gray-600 truncate max-w-[100px]">{appointment.email || appointment.patientEmail || 'No email'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 mt-4">
            <FaCalendarAlt className="text-4xl text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No appointments found</h3>
            <p className="text-gray-600 text-sm mb-4">
              When patients book appointments, they will appear here with their details.
            </p>
            <button onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointmentsTab;