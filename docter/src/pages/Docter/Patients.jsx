import React, { useState, useEffect } from 'react';
import {
  FaUserFriends, FaSearch, FaFilter, FaCalendarAlt,
  FaPhone, FaEnvelope, FaStethoscope, FaNotesMedical,
  FaHeartbeat, FaChartLine, FaEdit, FaTrash,
  FaEye, FaPlus, FaUserMd, FaPrescriptionBottle,
  FaHistory, FaAllergies, FaBirthdayCake
} from 'react-icons/fa';

const Patients = ({ userType, userData }) => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddPatient, setShowAddPatient] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockPatients = [
        {
          id: 'PAT001',
          name: 'John Smith',
          age: 45,
          gender: 'Male',
          contact: '+1 (555) 123-4567',
          email: 'john.smith@email.com',
          address: '123 Main St, New York',
          bloodGroup: 'O+',
          height: '175 cm',
          weight: '80 kg',
          allergies: ['Penicillin', 'Peanuts'],
          chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
          lastVisit: '2024-12-10',
          nextAppointment: '2024-12-24',
          status: 'active',
          notes: 'Patient needs regular blood pressure monitoring',
          appointments: 12,
          prescriptions: 8
        },
        {
          id: 'PAT002',
          name: 'Emma Wilson',
          age: 32,
          gender: 'Female',
          contact: '+1 (555) 234-5678',
          email: 'emma.wilson@email.com',
          address: '456 Oak Ave, Chicago',
          bloodGroup: 'A+',
          height: '165 cm',
          weight: '62 kg',
          allergies: ['Sulfa drugs'],
          chronicConditions: ['Asthma'],
          lastVisit: '2024-12-08',
          nextAppointment: '2024-12-20',
          status: 'active',
          notes: 'Seasonal asthma, needs inhaler refill',
          appointments: 8,
          prescriptions: 5
        },
        {
          id: 'PAT003',
          name: 'Michael Chen',
          age: 28,
          gender: 'Male',
          contact: '+1 (555) 345-6789',
          email: 'michael.chen@email.com',
          address: '789 Pine Rd, San Francisco',
          bloodGroup: 'B+',
          height: '180 cm',
          weight: '75 kg',
          allergies: ['Latex'],
          chronicConditions: ['Allergic Rhinitis'],
          lastVisit: '2024-12-05',
          nextAppointment: '2024-12-18',
          status: 'active',
          notes: 'Pollen allergy, needs seasonal medication',
          appointments: 6,
          prescriptions: 4
        },
        {
          id: 'PAT004',
          name: 'Sarah Johnson',
          age: 50,
          gender: 'Female',
          contact: '+1 (555) 456-7890',
          email: 'sarah.johnson@email.com',
          address: '101 Maple Dr, Boston',
          bloodGroup: 'AB+',
          height: '168 cm',
          weight: '70 kg',
          allergies: ['Iodine contrast'],
          chronicConditions: ['Arthritis', 'Osteoporosis'],
          lastVisit: '2024-11-30',
          nextAppointment: '2024-12-28',
          status: 'active',
          notes: 'Post-surgical follow-up, pain management',
          appointments: 15,
          prescriptions: 10
        },
        {
          id: 'PAT005',
          name: 'Robert Brown',
          age: 60,
          gender: 'Male',
          contact: '+1 (555) 567-8901',
          email: 'robert.brown@email.com',
          address: '202 Elm St, Miami',
          bloodGroup: 'O-',
          height: '170 cm',
          weight: '85 kg',
          allergies: ['Aspirin'],
          chronicConditions: ['Hypertension', 'High Cholesterol', 'GERD'],
          lastVisit: '2024-11-25',
          nextAppointment: '2024-12-22',
          status: 'active',
          notes: 'Multiple medications, needs regular checkup',
          appointments: 20,
          prescriptions: 15
        },
        {
          id: 'PAT006',
          name: 'Lisa Garcia',
          age: 35,
          gender: 'Female',
          contact: '+1 (555) 678-9012',
          email: 'lisa.garcia@email.com',
          address: '303 Birch Ln, Austin',
          bloodGroup: 'A-',
          height: '162 cm',
          weight: '58 kg',
          allergies: ['Shellfish'],
          chronicConditions: ['Migraine', 'Anxiety'],
          lastVisit: '2024-11-20',
          nextAppointment: '2024-12-15',
          status: 'inactive',
          notes: 'Follow-up needed for anxiety medication',
          appointments: 5,
          prescriptions: 3
        }
      ];

      setPatients(mockPatients);
      if (mockPatients.length > 0) {
        setSelectedPatient(mockPatients[0]);
      }
      setLoading(false);
    }, 1500);
  }, []);

  const filterOptions = [
    { value: 'all', label: 'All Patients' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'recent', label: 'Recent' },
    { value: 'chronic', label: 'Chronic Conditions' },
  ];

  const filteredPatients = patients.filter(patient => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && patient.status === 'active') ||
                         (filter === 'inactive' && patient.status === 'inactive') ||
                         (filter === 'chronic' && patient.chronicConditions.length > 0) ||
                         (filter === 'recent' && new Date(patient.lastVisit) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const handleAddPatient = () => {
    alert('Add patient form would open here');
    // In real app, this would open a modal to add new patient
  };

  const handleDeletePatient = (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      setPatients(patients.filter(p => p.id !== id));
      if (selectedPatient && selectedPatient.id === id) {
        setSelectedPatient(patients[0] || null);
      }
    }
  };

  const handleSendReminder = (patient) => {
    alert(`Reminder sent to ${patient.name} at ${patient.email}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Patients Management</h1>
        <p className="text-gray-600">Manage your patients and their medical information</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Left Sidebar - Patients List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
            {/* Search and Filter */}
            <div className="mb-6">
              <div className="relative mb-4">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <div className="space-x-2 flex flex-wrap gap-2">
                {filterOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`px-3 py-1 text-sm rounded-lg ${
                      filter === option.value
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Patient Button */}
            <button
              onClick={handleAddPatient}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 mb-6"
            >
              <FaPlus />
              <span>Add New Patient</span>
            </button>

            {/* Patients List */}
            <div className="max-h-[500px] overflow-y-auto">
              <h3 className="font-bold text-gray-900 mb-4">Patients ({filteredPatients.length})</h3>
              <div className="space-y-3">
                {filteredPatients.map(patient => (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedPatient?.id === patient.id ? 'bg-teal-50 border border-teal-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-600">ID: {patient.id}</div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(patient.status)}`}>
                        {patient.status}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaBirthdayCake className="mr-2 text-xs" />
                      <span>{patient.age} years, {patient.gender}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Last visit: {patient.lastVisit}
                    </div>
                  </button>
                ))}
              </div>
              
              {filteredPatients.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-600">No patients found</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Patients</span>
                  <span className="font-bold">{patients.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active</span>
                  <span className="font-bold text-green-600">{patients.filter(p => p.status === 'active').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Appointments Today</span>
                  <span className="font-bold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Follow-ups</span>
                  <span className="font-bold text-yellow-600">5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Patient Details */}
        <div className="lg:col-span-3">
          {selectedPatient ? (
            <div className="space-y-6">
              {/* Patient Header */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
                      <FaUserFriends className="text-teal-600 text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedPatient.name}</h2>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-gray-600">Patient ID: {selectedPatient.id}</span>
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedPatient.status)}`}>
                          {selectedPatient.status}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {selectedPatient.age} years, {selectedPatient.gender}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleSendReminder(selectedPatient)}
                      className="px-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50"
                    >
                      Send Reminder
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                      Edit Profile
                    </button>
                    <button
                      onClick={() => handleDeletePatient(selectedPatient.id)}
                      className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact & Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <FaPhone className="mr-2" />
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <FaPhone className="mr-3 text-teal-600" />
                      <span>{selectedPatient.contact}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaEnvelope className="mr-3 text-teal-600" />
                      <span>{selectedPatient.email}</span>
                    </div>
                    <div className="text-gray-600">
                      <div className="font-medium mb-1">Address:</div>
                      <div className="text-sm">{selectedPatient.address}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <FaHeartbeat className="mr-2" />
                    Medical Profile
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Blood Group</div>
                      <div className="font-bold">{selectedPatient.bloodGroup}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Height</div>
                      <div className="font-bold">{selectedPatient.height}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Weight</div>
                      <div className="font-bold">{selectedPatient.weight}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">BMI</div>
                      <div className="font-bold">
                        {((parseInt(selectedPatient.weight) / Math.pow(parseInt(selectedPatient.height) / 100, 2)).toFixed(1))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Conditions */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <FaAllergies className="mr-2" />
                    Allergies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.allergies.map((allergy, index) => (
                      <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        {allergy}
                      </span>
                    ))}
                    {selectedPatient.allergies.length === 0 && (
                      <span className="text-gray-600">No known allergies</span>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <FaStethoscope className="mr-2" />
                    Chronic Conditions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.chronicConditions.map((condition, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {condition}
                      </span>
                    ))}
                    {selectedPatient.chronicConditions.length === 0 && (
                      <span className="text-gray-600">No chronic conditions</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Appointment History & Stats */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-6">Patient History & Statistics</h3>
                
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-teal-50 rounded-xl">
                    <div className="text-2xl font-bold text-teal-600">{selectedPatient.appointments}</div>
                    <div className="text-sm text-gray-600">Total Appointments</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{selectedPatient.prescriptions}</div>
                    <div className="text-sm text-gray-600">Prescriptions</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">
                      {new Date(selectedPatient.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-sm text-gray-600">Last Visit</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">
                      {new Date(selectedPatient.nextAppointment).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-sm text-gray-600">Next Appointment</div>
                  </div>
                </div>

                {/* Recent Appointments */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Recent Appointments</h4>
                  <div className="space-y-3">
                    {[
                      { date: '2024-12-10', type: 'Follow-up', doctor: 'Dr. Sarah Johnson', status: 'Completed' },
                      { date: '2024-11-25', type: 'Consultation', doctor: 'Dr. Sarah Johnson', status: 'Completed' },
                      { date: '2024-11-10', type: 'Lab Test', doctor: 'Lab Specialist', status: 'Completed' },
                    ].map((appointment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FaCalendarAlt className="text-teal-600" />
                          <div>
                            <div className="font-medium">{appointment.type}</div>
                            <div className="text-sm text-gray-600">{appointment.date}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">{appointment.doctor}</div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Doctor's Notes */}
                <div className="mt-6">
                  <h4 className="font-bold text-gray-900 mb-3">Doctor's Notes</h4>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-gray-700">{selectedPatient.notes}</p>
                    <div className="text-sm text-gray-500 mt-2">Last updated: {selectedPatient.lastVisit}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                  <FaPrescriptionBottle />
                  <span>Add Prescription</span>
                </button>
                <button className="flex items-center space-x-2 px-6 py-3 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50">
                  <FaCalendarAlt />
                  <span>Schedule Appointment</span>
                </button>
                <button className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <FaNotesMedical />
                  <span>Add Medical Record</span>
                </button>
                <button className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <FaHistory />
                  <span>View Full History</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <FaUserFriends className="text-4xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Patient Selected</h3>
              <p className="text-gray-600 mb-6">Select a patient from the list to view details</p>
              <button
                onClick={handleAddPatient}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Add New Patient
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Patients;