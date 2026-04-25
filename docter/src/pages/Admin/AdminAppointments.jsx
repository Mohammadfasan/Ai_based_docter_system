// src/pages/Admin/AdminAppointments.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaCalendarAlt, FaClock, FaUserMd, FaUser, 
  FaFilter, FaSearch, FaCheck, FaTimes, FaEye,
  FaDownload, FaFileMedical, FaVideo, FaMapMarkerAlt,
  FaPhone, FaEnvelope, FaIdCard, FaCalendarCheck,
  FaExclamationTriangle, FaTrash, FaShieldAlt,
  FaStethoscope, FaHospital, FaMoneyBillWave,
  FaCheckCircle, FaTimesCircle, FaClock as FaPending,
  FaHistory, FaChartLine, FaUsers, FaUserCheck,
  FaSpinner
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const AdminAppointments = ({ userType, userData, darkMode }) => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0
  });

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  useEffect(() => {
    fetchAppointments();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      // Fetch all appointments from MongoDB
      const response = await axios.get(`${API_URL}/appointments/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const appointmentsData = response.data.data.map(apt => ({
          id: apt._id,
          appointmentId: apt.appointmentId,
          doctorId: apt.doctorId,
          doctorName: apt.doctorName,
          specialization: apt.specialization,
          patientId: apt.patientId,
          patientName: apt.patientName,
          patientEmail: apt.patientEmail,
          patientPhone: apt.patientPhone,
          date: apt.date,
          time: apt.time,
          type: apt.type,
          location: apt.location,
          videoLink: apt.videoLink,
          fee: apt.fee,
          notes: apt.notes,
          status: apt.status,
          paymentStatus: apt.paymentStatus,
          createdAt: apt.createdAt,
          updatedAt: apt.updatedAt,
          completedAt: apt.completedAt,
          cancelledAt: apt.cancelledAt,
          confirmedAt: apt.confirmedAt,
          cancellationReason: apt.cancellationReason,
          consultationNotes: apt.consultationNotes,
          prescription: apt.prescription
        }));

        setAppointments(appointmentsData);
        calculateStats(appointmentsData);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (apps) => {
    const today = new Date().toISOString().split('T')[0];
    
    const todayApps = apps.filter(apt => apt.date === today);
    const totalRevenue = apps.reduce((sum, apt) => sum + (apt.fee || 0), 0);

    setStats({
      total: apps.length,
      today: todayApps.length,
      pending: apps.filter(apt => apt.status === 'pending').length,
      confirmed: apps.filter(apt => apt.status === 'confirmed').length,
      completed: apps.filter(apt => apt.status === 'completed').length,
      cancelled: apps.filter(apt => apt.status === 'cancelled').length,
      totalRevenue: totalRevenue
    });
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const token = getToken();
      const response = await axios.patch(
        `${API_URL}/appointments/${appointmentId}/status`,
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        fetchAppointments();
        alert(`✅ Appointment status updated to: ${newStatus}`);
        if (showModal) setShowModal(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update appointment status');
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        const token = getToken();
        const response = await axios.delete(`${API_URL}/appointments/${appointmentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data.success) {
          fetchAppointments();
          if (showModal) setShowModal(false);
          alert('✅ Appointment deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Failed to delete appointment');
      }
    }
  };

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const isFuture = (dateString) => {
    if (!dateString) return false;
    return dateString > new Date().toISOString().split('T')[0];
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1"><FaPending size={10} /> Pending</span>;
      case 'confirmed':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><FaCheckCircle size={10} /> Confirmed</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"><FaCheckCircle size={10} /> Completed</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1"><FaTimesCircle size={10} /> Cancelled</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.appointmentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    
    let matchesDate = true;
    if (filterDate === 'today') matchesDate = isToday(apt.date);
    if (filterDate === 'future') matchesDate = isFuture(apt.date);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-teal-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaCalendarAlt className="text-teal-500" />
          Appointment Management
        </h1>
        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          View and manage all appointments across the system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className="text-xs text-teal-600 font-medium">TOTAL</p>
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Appointments</p>
        </div>
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className="text-xs text-purple-600 font-medium">TODAY</p>
          <p className="text-2xl font-bold">{stats.today}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Today</p>
        </div>
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className="text-xs text-amber-600 font-medium">PENDING</p>
          <p className="text-2xl font-bold">{stats.pending}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Pending</p>
        </div>
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className="text-xs text-green-600 font-medium">CONFIRMED</p>
          <p className="text-2xl font-bold">{stats.confirmed}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Confirmed</p>
        </div>
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className="text-xs text-blue-600 font-medium">COMPLETED</p>
          <p className="text-2xl font-bold">{stats.completed}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Completed</p>
        </div>
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className="text-xs text-red-600 font-medium">CANCELLED</p>
          <p className="text-2xl font-bold">{stats.cancelled}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Cancelled</p>
        </div>
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className="text-xs text-emerald-600 font-medium">REVENUE</p>
          <p className="text-lg font-bold">LKR {stats.totalRevenue.toLocaleString()}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Total</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by doctor, patient, ID or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 outline-none ${
              darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 outline-none ${
            darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
          }`}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 outline-none ${
            darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
          }`}
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="future">Upcoming</option>
        </select>
        <button 
          onClick={fetchAppointments}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
        >
          <FaFilter size={14} />
          Refresh
        </button>
      </div>

      {/* Appointments Table */}
      <div className={`rounded-xl shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointment ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-medium">{apt.appointmentId}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{formatDate(apt.date)}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <FaClock size={10} />
                        {apt.time}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm">
                          {apt.doctorName?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{apt.doctorName}</p>
                          <p className="text-xs text-gray-500">{apt.specialization}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-sm">{apt.patientName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <FaEnvelope size={10} />
                          {apt.patientEmail}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <FaPhone size={10} />
                          {apt.patientPhone}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {apt.type === 'video' ? (
                          <>
                            <FaVideo className="text-purple-500" size={12} />
                            <span className="text-sm">Video</span>
                          </>
                        ) : (
                          <>
                            <FaMapMarkerAlt className="text-teal-500" size={12} />
                            <span className="text-sm">Clinic</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(apt.status)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-emerald-600">LKR {apt.fee?.toLocaleString() || 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewAppointment(apt)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye size={14} />
                        </button>
                        {apt.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Confirm"
                          >
                            <FaCheck size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAppointment(apt.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                    <FaCalendarAlt className="text-4xl mx-auto mb-3 opacity-50" />
                    No appointments found
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className={`max-w-2xl w-full rounded-xl shadow-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
            <div className={`p-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Appointment Details</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <p className="text-sm text-gray-500 mt-1">ID: {selectedAppointment.appointmentId}</p>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(selectedAppointment.date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="font-medium">{selectedAppointment.time}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Doctor</p>
                  <p className="font-medium">{selectedAppointment.doctorName}</p>
                  <p className="text-xs text-gray-500">{selectedAppointment.specialization}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Patient</p>
                  <p className="font-medium">{selectedAppointment.patientName}</p>
                  <p className="text-xs text-gray-500">{selectedAppointment.patientEmail}</p>
                  <p className="text-xs text-gray-500">{selectedAppointment.patientPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-medium capitalize">{selectedAppointment.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  {getStatusBadge(selectedAppointment.status)}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fee</p>
                  <p className="font-medium text-emerald-600">LKR {selectedAppointment.fee?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Status</p>
                  <p className="font-medium capitalize">{selectedAppointment.paymentStatus}</p>
                </div>
              </div>
              
              {selectedAppointment.notes && (
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedAppointment.notes}</p>
                </div>
              )}
              
              {selectedAppointment.cancellationReason && (
                <div className="p-3 rounded-lg bg-red-50">
                  <p className="text-xs text-red-500 mb-1">Cancellation Reason</p>
                  <p className="text-sm text-red-600">{selectedAppointment.cancellationReason}</p>
                </div>
              )}
            </div>
            <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3`}>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">Close</button>
              {selectedAppointment.status === 'pending' && (
                <button onClick={() => handleUpdateStatus(selectedAppointment.id, 'confirmed')} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Confirm</button>
              )}
              <button onClick={() => handleDeleteAppointment(selectedAppointment.id)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;