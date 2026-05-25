// src/pages/Admin/patients.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaSearch, FaEye, FaEdit, FaTrash, FaFilter, FaDownload, 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt,
  FaCheckCircle, FaTimesCircle, FaSpinner, FaIdCard, FaVenusMars,
  FaTint, FaClock, FaUserMd, FaUsers, FaChartLine, FaAmbulance
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


const Patients = ({ userType, userData, darkMode }) => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    newThisMonth: 0,
    maleCount: 0,
    femaleCount: 0,
    avgAge: 0,
    commonBloodGroup: 'O+',
    emergencyContacts: 0
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  // Get token from localStorage (where your login saves it)
  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        console.error('No token found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/users/patients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const patientsData = response.data.data.map(patient => ({
          id: patient.userId || patient._id,
          userId: patient.userId,
          name: patient.name || 'Unknown',
          email: patient.email || 'No email',
          phone: patient.phone || 'Not provided',
          age: patient.age || 'N/A',
          gender: patient.gender || 'Not specified',
          bloodGroup: patient.bloodGroup || 'N/A',
          address: patient.address || 'Not provided',
          emergencyContact: patient.emergencyContact || 'Not provided',
          emergencyName: patient.emergencyName || 'Not provided',
          status: patient.status || 'active',
          registeredDate: patient.createdAt,
          lastVisit: patient.lastVisit,
          appointmentsCount: patient.appointmentsCount || 0,
          prescriptionsCount: patient.prescriptionsCount || 0,
          medicalRecordsCount: patient.medicalRecordsCount || 0,
          allergies: patient.allergies || [],
          chronicConditions: patient.chronicConditions || []
        }));

        setPatients(patientsData);
        
        if (response.data.stats) {
          setStats(response.data.stats);
        } else {
          calculateStats(patientsData);
        }
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (patientList) => {
    const totalPatients = patientList.length;
    const activePatients = patientList.filter(p => p.status === 'active').length;
    
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const newThisMonth = patientList.filter(p => {
      if (!p.registeredDate) return false;
      return new Date(p.registeredDate) >= firstDayOfMonth;
    }).length;
    
    const maleCount = patientList.filter(p => p.gender === 'Male').length;
    const femaleCount = patientList.filter(p => p.gender === 'Female').length;
    
    const ages = patientList.map(p => p.age).filter(a => a && a !== 'N/A');
    const avgAge = ages.length > 0 
      ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) 
      : 0;
    
    const bloodGroups = {};
    patientList.forEach(p => {
      if (p.bloodGroup && p.bloodGroup !== 'N/A') {
        bloodGroups[p.bloodGroup] = (bloodGroups[p.bloodGroup] || 0) + 1;
      }
    });
    let commonBloodGroup = 'O+';
    let maxCount = 0;
    Object.entries(bloodGroups).forEach(([group, count]) => {
      if (count > maxCount) {
        maxCount = count;
        commonBloodGroup = group;
      }
    });
    
    setStats({
      totalPatients,
      activePatients,
      newThisMonth,
      maleCount,
      femaleCount,
      avgAge,
      commonBloodGroup,
      emergencyContacts: patientList.filter(p => p.emergencyContact && p.emergencyContact !== 'Not provided').length
    });
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const handleBlockPatient = async (patientId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    const confirmMessage = currentStatus === 'active' 
      ? 'Are you sure you want to block this patient?' 
      : 'Are you sure you want to unblock this patient?';
    
    if (window.confirm(confirmMessage)) {
      try {
        const token = getToken();
        await axios.put(
          `${API_URL}/users/patients/${patientId}/status`,
          { status: newStatus },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        fetchPatients();
        alert(`Patient ${newStatus === 'active' ? 'activated' : 'blocked'} successfully`);
      } catch (error) {
        console.error('Error updating patient status:', error);
        alert('Failed to update patient status');
      }
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to permanently delete this patient? This action cannot be undone.')) {
      try {
        const token = getToken();
        await axios.delete(`${API_URL}/users/patients/${patientId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchPatients();
        alert('Patient deleted successfully');
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Failed to delete patient');
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getInitials = (name) => {
    if (!name || name === 'Unknown') return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><FaCheckCircle size={10} /> Active</span>;
      case 'blocked':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1"><FaTimesCircle size={10} /> Blocked</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  // Filter patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm) ||
      patient.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-teal-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaUsers className="text-teal-500" />
          Patient Management
        </h1>
        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>View and manage all registered patients</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className="text-xs text-teal-600 font-medium">TOTAL</p>
          <p className="text-2xl font-bold">{stats.totalPatients}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Patients</p>
        </div>
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className="text-xs text-green-600 font-medium">ACTIVE</p>
          <p className="text-2xl font-bold">{stats.activePatients}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Now</p>
        </div>
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className="text-xs text-blue-600 font-medium">NEW</p>
          <p className="text-2xl font-bold">{stats.newThisMonth}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>This Month</p>
        </div>
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className="text-xs text-purple-600 font-medium">EMERGENCY</p>
          <p className="text-2xl font-bold">{stats.emergencyContacts}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Contacts</p>
        </div>
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className="text-xs text-amber-600 font-medium">AVG AGE</p>
          <p className="text-2xl font-bold">{stats.avgAge}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Years</p>
        </div>
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className="text-xs text-pink-600 font-medium">M/F</p>
          <p className="text-2xl font-bold">{stats.maleCount}/{stats.femaleCount}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Ratio</p>
        </div>
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className="text-xs text-red-600 font-medium">BLOOD</p>
          <p className="text-2xl font-bold">{stats.commonBloodGroup}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Most Common</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by name, email, phone or ID..."
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
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
        <button 
          onClick={fetchPatients}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
        >
          <FaFilter size={14} />
          Refresh
        </button>
      </div>

      {/* Patients Table */}
      <div className={`rounded-xl shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demographics</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${patient.gender === 'Male' ? 'from-blue-500 to-blue-600' : patient.gender === 'Female' ? 'from-pink-500 to-rose-500' : 'from-teal-500 to-teal-600'} flex items-center justify-center text-white font-bold`}>
                          {getInitials(patient.name)}
                        </div>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{patient.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <FaIdCard size={10} />
                            {patient.userId || patient.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm flex items-center gap-1">
                        <FaEnvelope className="text-gray-400" size={12} />
                        {patient.email}
                      </p>
                      <p className="text-sm flex items-center gap-1 mt-1">
                        <FaPhone className="text-gray-400" size={12} />
                        {patient.phone}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm flex items-center gap-2">
                        <FaVenusMars className="text-gray-400" size={12} />
                        {patient.gender}
                      </p>
                      <p className="text-sm flex items-center gap-2 mt-1">
                        <FaTint className="text-red-400" size={12} />
                        {patient.bloodGroup}
                      </p>
                      <p className="text-sm flex items-center gap-2 mt-1">
                        <FaCalendarAlt className="text-gray-400" size={12} />
                        Age: {patient.age}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(patient.status)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{formatDate(patient.registeredDate)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewPatient(patient)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye size={16} />
                        </button>
                        <button
                          onClick={() => handleBlockPatient(patient.id, patient.status)}
                          className={`p-2 rounded-lg transition-colors ${patient.status === 'active' ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={patient.status === 'active' ? 'Block' : 'Unblock'}
                        >
                          {patient.status === 'active' ? <FaTimesCircle size={16} /> : <FaCheckCircle size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <FaUsers className="text-4xl mx-auto mb-3 opacity-50" />
                    No patients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {showModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className={`max-w-2xl w-full rounded-xl shadow-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
            <div className={`p-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Patient Details</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="font-medium">{selectedPatient.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Patient ID</p>
                  <p className="font-medium">{selectedPatient.userId || selectedPatient.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">{selectedPatient.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium">{selectedPatient.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="font-medium">{selectedPatient.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Blood Group</p>
                  <p className="font-medium">{selectedPatient.bloodGroup}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Age</p>
                  <p className="font-medium">{selectedPatient.age}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  {getStatusBadge(selectedPatient.status)}
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="font-medium">{selectedPatient.address}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Emergency Contact</p>
                  <p className="font-medium">{selectedPatient.emergencyName} - {selectedPatient.emergencyContact}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Registered Date</p>
                  <p className="font-medium">{formatDate(selectedPatient.registeredDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Visit</p>
                  <p className="font-medium">{formatDate(selectedPatient.lastVisit)}</p>
                </div>
              </div>
            </div>
            <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3`}>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;