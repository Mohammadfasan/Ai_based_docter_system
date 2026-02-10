
import React, { useState, useEffect } from 'react';
import { 
  FaUserMd, FaUsers, FaFilePrescription, FaCreditCard, 
  FaChartLine, FaSearch, FaFilter, FaEdit, FaTrash,
  FaEye, FaPlus, FaCalendar, FaDollarSign, FaPills,
  FaPrint, FaDownload, FaCheckCircle, FaTimesCircle, FaClock
} from 'react-icons/fa';

const AdminManagement = () => {
  const [activeTab, setActiveTab] = useState('doctors');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Doctors Data
  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@healthai.com',
      specialization: 'General Physician & ENT Specialist',
      license: 'MED123456',
      status: 'active',
      patients: 245,
      rating: 4.8,
      joinDate: '2023-01-15',
      phone: '+1 (555) 123-4567',
      hospital: 'City Medical Center'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      email: 'michael.chen@healthai.com',
      specialization: 'Internal Medicine',
      license: 'MED789012',
      status: 'active',
      patients: 189,
      rating: 4.6,
      joinDate: '2023-03-22',
      phone: '+1 (555) 987-6543',
      hospital: 'General Hospital'
    }
  ]);

  // Billing Data
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-2024-001',
      patientName: 'John Smith',
      doctorName: 'Dr. Sarah Johnson',
      date: '2024-12-15',
      amount: 120,
      tax: 12,
      total: 132,
      status: 'paid',
      type: 'consultation'
    },
    {
      id: 'INV-2024-002',
      patientName: 'Emma Wilson',
      doctorName: 'Dr. Michael Chen',
      date: '2024-12-20',
      amount: 140,
      tax: 14,
      total: 154,
      status: 'pending',
      type: 'clinic'
    }
  ]);

  // Prescriptions Data
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 'PRES-001',
      patientName: 'John Smith',
      doctorName: 'Dr. Sarah Johnson',
      date: '2024-12-15',
      diagnosis: 'Common Cold with Fever',
      medicines: ['Paracetamol', 'Vitamin C'],
      status: 'active'
    },
    {
      id: 'PRES-002',
      patientName: 'Emma Wilson',
      doctorName: 'Dr. Michael Chen',
      date: '2024-12-10',
      diagnosis: 'Hypertension Management',
      medicines: ['Losartan', 'Hydrochlorothiazide'],
      status: 'completed'
    }
  ]);

  // Patients Data
  const [patients, setPatients] = useState([
    {
      id: 'PAT001',
      name: 'John Smith',
      email: 'john@example.com',
      age: 32,
      gender: 'Male',
      totalAppointments: 5,
      lastVisit: '2024-12-15'
    },
    {
      id: 'PAT002',
      name: 'Emma Wilson',
      email: 'emma@example.com',
      age: 45,
      gender: 'Female',
      totalAppointments: 8,
      lastVisit: '2024-12-10'
    }
  ]);

  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    specialization: '',
    license: '',
    phone: '',
    hospital: ''
  });

  const [editingDoctor, setEditingDoctor] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Doctor Functions
  const handleAddDoctor = () => {
    const doctor = {
      id: doctors.length + 1,
      ...newDoctor,
      status: 'pending',
      patients: 0,
      rating: 0,
      joinDate: new Date().toISOString().split('T')[0]
    };
    
    setDoctors([...doctors, doctor]);
    setNewDoctor({ name: '', email: '', specialization: '', license: '', phone: '', hospital: '' });
    setShowDoctorModal(false);
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setNewDoctor(doctor);
    setShowDoctorModal(true);
  };

  const handleUpdateDoctor = () => {
    setDoctors(doctors.map(d => d.id === editingDoctor.id ? newDoctor : d));
    setShowDoctorModal(false);
    setEditingDoctor(null);
  };

  const handleDeleteDoctor = (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      setDoctors(doctors.filter(d => d.id !== id));
    }
  };

  // Billing Functions
  const handlePayInvoice = (invoiceId) => {
    setInvoices(invoices.map(inv => 
      inv.id === invoiceId ? { ...inv, status: 'paid' } : inv
    ));
  };

  const handleDeleteInvoice = (invoiceId) => {
    setInvoices(invoices.filter(inv => inv.id !== invoiceId));
  };

  // Prescription Functions
  const handleDeletePrescription = (prescriptionId) => {
    setPrescriptions(prescriptions.filter(p => p.id !== prescriptionId));
  };

  // Stats Calculation
  const calculateStats = () => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.total : 0), 0);
    const pendingRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'pending' ? inv.total : 0), 0);
    
    return {
      totalDoctors: doctors.length,
      activeDoctors: doctors.filter(d => d.status === 'active').length,
      totalPatients: patients.length,
      activePrescriptions: prescriptions.filter(p => p.status === 'active').length,
      totalRevenue,
      pendingRevenue
    };
  };

  const stats = calculateStats();

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading management dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
        <p className="text-gray-600">Manage all system entities - Doctors, Patients, Bills, Prescriptions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</div>
              <div className="text-gray-600">Doctors</div>
            </div>
            <FaUserMd className="text-teal-600 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalPatients}</div>
              <div className="text-gray-600">Patients</div>
            </div>
            <FaUsers className="text-blue-600 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.activePrescriptions}</div>
              <div className="text-gray-600">Prescriptions</div>
            </div>
            <FaFilePrescription className="text-purple-600 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">${stats.totalRevenue}</div>
              <div className="text-gray-600">Revenue</div>
            </div>
            <FaDollarSign className="text-green-600 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">${stats.pendingRevenue}</div>
              <div className="text-gray-600">Pending</div>
            </div>
            <FaClock className="text-yellow-600 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{invoices.length}</div>
              <div className="text-gray-600">Invoices</div>
            </div>
            <FaCreditCard className="text-red-600 text-2xl" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
        {['doctors', 'patients', 'billing', 'prescriptions'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap ${
              activeTab === tab
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Doctors Management</h2>
              <button
                onClick={() => {
                  setEditingDoctor(null);
                  setNewDoctor({ name: '', email: '', specialization: '', license: '', phone: '', hospital: '' });
                  setShowDoctorModal(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg"
              >
                <FaPlus />
                <span>Add Doctor</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 font-medium text-gray-700">Doctor</th>
                    <th className="text-left py-3 font-medium text-gray-700">Specialization</th>
                    <th className="text-left py-3 font-medium text-gray-700">Contact</th>
                    <th className="text-left py-3 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 font-medium text-gray-700">Patients</th>
                    <th className="text-left py-3 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map(doctor => (
                    <tr key={doctor.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                            <FaUserMd className="text-teal-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{doctor.name}</div>
                            <div className="text-sm text-gray-500">{doctor.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-gray-900">{doctor.specialization}</div>
                      </td>
                      <td className="py-4">
                        <div className="text-gray-900">{doctor.phone}</div>
                        <div className="text-sm text-gray-500">{doctor.hospital}</div>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(doctor.status)}`}>
                          {doctor.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="text-gray-900 font-medium">{doctor.patients}</div>
                      </td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditDoctor(doctor)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteDoctor(doctor.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Patients Management</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patients.map(patient => (
                <div key={patient.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaUsers className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-500">{patient.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">{patient.age} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-medium">{patient.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Appointments:</span>
                      <span className="font-medium">{patient.totalAppointments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Visit:</span>
                      <span className="font-medium">{new Date(patient.lastVisit).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                      View Profile
                    </button>
                    <button className="flex-1 px-3 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700">
                      Medical History
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Billing Management</h2>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <FaFilter />
                <span>Filter</span>
              </button>
            </div>

            <div className="space-y-4">
              {invoices.map(invoice => (
                <div key={invoice.id} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <FaCreditCard className="text-teal-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{invoice.id}</h4>
                        <div className="text-sm text-gray-600">
                          {invoice.patientName} • {invoice.doctorName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(invoice.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="text-xl font-bold text-gray-900">${invoice.total}</div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedInvoice(invoice)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <FaEye />
                          </button>
                          {invoice.status !== 'paid' && (
                            <button
                              onClick={() => handlePayInvoice(invoice.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                            >
                              Mark Paid
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Prescriptions Management</h2>

            <div className="space-y-4">
              {prescriptions.map(prescription => (
                <div key={prescription.id} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FaFilePrescription className="text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{prescription.id}</h4>
                        <div className="text-sm text-gray-600">
                          {prescription.patientName} • {prescription.doctorName}
                        </div>
                        <div className="text-xs text-gray-500">
                          Diagnosis: {prescription.diagnosis}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {new Date(prescription.date).toLocaleDateString()}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(prescription.status)}`}>
                          {prescription.status}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <FaEye />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                          <FaPrint />
                        </button>
                        <button
                          onClick={() => handleDeletePrescription(prescription.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Medicines List */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">Medicines:</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {prescription.medicines.map((medicine, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {medicine}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Doctor Modal */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
                </h2>
                <button
                  onClick={() => {
                    setShowDoctorModal(false);
                    setEditingDoctor(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newDoctor.name}
                      onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={newDoctor.email}
                      onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization *
                    </label>
                    <input
                      type="text"
                      value={newDoctor.specialization}
                      onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Number *
                    </label>
                    <input
                      type="text"
                      value={newDoctor.license}
                      onChange={(e) => setNewDoctor({...newDoctor, license: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newDoctor.phone}
                      onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital/Clinic
                    </label>
                    <input
                      type="text"
                      value={newDoctor.hospital}
                      onChange={(e) => setNewDoctor({...newDoctor, hospital: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDoctorModal(false);
                      setEditingDoctor(null);
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={editingDoctor ? handleUpdateDoctor : handleAddDoctor}
                    className="px-8 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    {editingDoctor ? 'Update' : 'Add Doctor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Invoice Details</h3>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600">Invoice ID</label>
                    <div className="font-medium">{selectedInvoice.id}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Status</label>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedInvoice.status)}`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600">Patient</label>
                    <div className="font-medium">{selectedInvoice.patientName}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Doctor</label>
                    <div className="font-medium">{selectedInvoice.doctorName}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600">Date</label>
                    <div className="font-medium">{new Date(selectedInvoice.date).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Amount</label>
                    <div className="text-xl font-bold text-gray-900">${selectedInvoice.total}</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setSelectedInvoice(null)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        handlePayInvoice(selectedInvoice.id);
                        setSelectedInvoice(null);
                      }}
                      className="px-6 py-2 bg-teal-600 text-white rounded-lg"
                    >
                      Mark as Paid
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
