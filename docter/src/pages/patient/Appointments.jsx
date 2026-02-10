import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Video, MapPin, Search, Check, 
  X, ChevronDown, ChevronUp, Stethoscope, AlertCircle, CalendarCheck,
  MessageSquare, Phone, User, Shield, Download
} from 'lucide-react';

const Appointments = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAppointments, setExpandedAppointments] = useState(new Set());
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Load appointments from localStorage
  useEffect(() => {
    const loadAppointments = () => {
      const saved = localStorage.getItem('appointments');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter to show only appointments for the current user (patient)
        const userAppointments = parsed.filter(app => 
          app.status === 'confirmed' || app.status === 'pending'
        );
        setAppointments(userAppointments);
      }
    };

    loadAppointments();
    const interval = setInterval(loadAppointments, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const filteredAppointments = appointments.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = app.doctorName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleExpand = (id) => {
    const newSet = new Set(expandedAppointments);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedAppointments(newSet);
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const handleJoinMeeting = (appointment) => {
    if (appointment.type === 'Video Consultation' && appointment.meetingLink) {
      window.open(appointment.meetingLink, '_blank');
    } else if (appointment.type === 'Clinic Visit') {
      alert(`Please visit ${appointment.location} for your appointment at ${appointment.time}`);
    } else {
      alert('No meeting link available for this appointment.');
    }
  };

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    if (!selectedAppointment) return;
    
    // Update appointment status
    const updatedAppointments = appointments.map(app => 
      app.id === selectedAppointment.id 
        ? { ...app, status: 'cancelled', notes: 'Cancelled by patient' }
        : app
    );
    
    setAppointments(updatedAppointments);
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    
    // Update doctor's time slot to available
    const doctorSlots = JSON.parse(localStorage.getItem('doctor_time_slots') || '[]');
    const updatedSlots = doctorSlots.map(slot => {
      if (slot.date === selectedAppointment.date && slot.time === selectedAppointment.time) {
        return { ...slot, status: 'available', patientName: null, patientId: null };
      }
      return slot;
    });
    localStorage.setItem('doctor_time_slots', JSON.stringify(updatedSlots));
    
    setShowCancelModal(false);
    setSelectedAppointment(null);
    alert('Appointment cancelled successfully!');
  };

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleDate(appointment.date);
    setRescheduleTime(appointment.time);
    setShowRescheduleModal(true);
  };

  const confirmReschedule = () => {
    if (!selectedAppointment) return;
    
    // Update appointment
    const updatedAppointments = appointments.map(app => 
      app.id === selectedAppointment.id 
        ? { 
            ...app, 
            date: rescheduleDate, 
            time: rescheduleTime,
            notes: (app.notes || '') + ' (Rescheduled)'
          }
        : app
    );
    
    setAppointments(updatedAppointments);
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    
    // Update doctor's time slot
    const doctorSlots = JSON.parse(localStorage.getItem('doctor_time_slots') || '[]');
    
    // Make old slot available
    const updatedSlots1 = doctorSlots.map(slot => {
      if (slot.date === selectedAppointment.date && slot.time === selectedAppointment.time) {
        return { ...slot, status: 'available', patientName: null, patientId: null };
      }
      return slot;
    });
    
    // Make new slot booked
    const updatedSlots = updatedSlots1.map(slot => {
      if (slot.date === rescheduleDate && slot.time === rescheduleTime) {
        return { ...slot, status: 'booked', patientName: 'Patient', patientId: 'PAT001' };
      }
      return slot;
    });
    
    localStorage.setItem('doctor_time_slots', JSON.stringify(updatedSlots));
    
    setShowRescheduleModal(false);
    setSelectedAppointment(null);
    alert('Appointment rescheduled successfully!');
  };

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(app => app.date >= today && app.status === 'confirmed')
      .slice(0, 2);
  };

  const downloadAppointmentDetails = (appointment) => {
    const data = {
      AppointmentID: appointment.id,
      Doctor: appointment.doctorName,
      Specialty: appointment.doctorSpecialty,
      Date: appointment.date,
      Time: appointment.time,
      Type: appointment.type,
      Status: appointment.status,
      Location: appointment.location,
      Symptoms: appointment.symptoms,
      Notes: appointment.notes || 'None'
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointment-${appointment.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-emerald-50/30 p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-slate-500 mt-1">Manage your doctor visits and consultations</p>
        </div>

        {/* Upcoming Appointments Banner */}
        {getUpcomingAppointments().length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold mb-2">Upcoming Appointments</h3>
                <p className="text-emerald-100">You have {getUpcomingAppointments().length} confirmed appointment(s)</p>
              </div>
              <div className="flex gap-3">
                {getUpcomingAppointments().map(app => (
                  <div key={app.id} className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <div className="font-bold">{app.doctorName}</div>
                    <div className="text-sm">{app.date} at {app.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold text-slate-900">{appointments.length}</p>
                <p className="text-sm text-slate-600">Total Appointments</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Calendar className="text-emerald-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold text-emerald-600">
                  {appointments.filter(a => a.status === 'confirmed').length}
                </p>
                <p className="text-sm text-slate-600">Confirmed</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Check className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold text-amber-600">
                  {appointments.filter(a => a.status === 'pending').length}
                </p>
                <p className="text-sm text-slate-600">Pending</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <AlertCircle className="text-amber-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {appointments.filter(a => a.type === 'Video Consultation').length}
                </p>
                <p className="text-sm text-slate-600">Video Consultations</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Video className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex bg-slate-100/50 p-1 rounded-xl">
            {['all', 'confirmed', 'pending'].map(status => (
              <button 
                key={status} 
                onClick={() => setFilter(status)} 
                className={`px-5 py-2 rounded-lg text-sm font-bold capitalize ${
                  filter === status ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="relative md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search doctor..." 
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        {/* Appointments List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAppointments.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <CalendarCheck size={32} className="text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No appointments found</h3>
              <p className="text-slate-500 mt-2">When a doctor confirms your appointment, it will appear here.</p>
            </div>
          ) : (
            filteredAppointments.map(app => (
              <div key={app.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-emerald-300 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <img src={app.image} alt="" className="w-14 h-14 rounded-2xl object-cover" />
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 leading-tight">{app.doctorName}</h3>
                      <p className="text-sm text-emerald-600 font-semibold">{app.doctorSpecialty}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border ${getStatusStyle(app.status)}`}>
                    {app.status}
                  </span>
                </div>

                <div className="bg-slate-50/80 rounded-2xl p-4 grid grid-cols-2 gap-3 text-sm border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar size={16} /> 
                    <span className="font-bold">{app.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock size={16} /> 
                    <span>{app.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 col-span-2">
                    <MapPin size={16} /> 
                    <span className="truncate">{app.location}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <button 
                    onClick={() => toggleExpand(app.id)} 
                    className="text-xs font-bold text-slate-400 flex items-center gap-1"
                  >
                    Details {expandedAppointments.has(app.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <div className="flex gap-2">
                    {app.status === 'confirmed' && (
                      <button 
                        onClick={() => handleJoinMeeting(app)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                      >
                        <Video size={14} />
                        {app.type === 'Video Consultation' ? 'Join Meeting' : 'View Details'}
                      </button>
                    )}
                    <button
                      onClick={() => downloadAppointmentDetails(app)}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                      title="Download Details"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>

                {expandedAppointments.has(app.id) && (
                  <div className="mt-4 pt-4 border-t border-dashed border-slate-200 animate-in fade-in">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Stethoscope size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">Symptoms</p>
                          <p className="text-sm font-medium text-slate-700">{app.symptoms}</p>
                        </div>
                      </div>
                      
                      {app.notes && (
                        <div className="flex items-start gap-2">
                          <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Doctor Notes</p>
                            <p className="text-sm font-medium text-slate-700">{app.notes}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-2">
                        <User size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">Appointment Type</p>
                          <p className="text-sm font-medium text-slate-700">{app.type}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-3">
                        {app.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => handleReschedule(app)}
                              className="flex-1 px-3 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleCancelAppointment(app)}
                              className="flex-1 px-3 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {app.status === 'pending' && (
                          <button
                            onClick={() => handleCancelAppointment(app)}
                            className="flex-1 px-3 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700"
                          >
                            Cancel Request
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full animate-in zoom-in">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Cancel Appointment</h3>
                <button 
                  onClick={() => setShowCancelModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-slate-700 mb-4">
                  Are you sure you want to cancel your appointment with <span className="font-bold">{selectedAppointment.doctorName}</span>?
                </p>
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                  <p className="text-sm font-bold text-rose-800 mb-1">Appointment Details</p>
                  <p className="text-sm text-rose-700">
                    {selectedAppointment.date} at {selectedAppointment.time}<br />
                    {selectedAppointment.type} • {selectedAppointment.location}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full animate-in zoom-in">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Reschedule Appointment</h3>
                <button 
                  onClick={() => setShowRescheduleModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    New Date
                  </label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    New Time
                  </label>
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReschedule}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;