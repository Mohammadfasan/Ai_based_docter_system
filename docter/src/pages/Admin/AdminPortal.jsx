import React, { useState } from 'react';
import { FaUserMd, FaUsers, FaChartLine, FaCog, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaHospital } from 'react-icons/fa';

const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState('doctors');
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine /> },
    { id: 'doctors', label: 'Doctors', icon: <FaUserMd /> },
    { id: 'patients', label: 'Patients', icon: <FaUsers /> },
    { id: 'analytics', label: 'Analytics', icon: <FaChartLine /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> },
  ];

  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@healthai.com',
      specialization: 'General Physician & ENT Specialist',
      experience: '12 years',
      license: 'MED123456',
      status: 'active',
      patients: 245,
      rating: 4.8,
      joinDate: '2023-01-15'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      email: 'michael.chen@healthai.com',
      specialization: 'Internal Medicine',
      experience: '8 years',
      license: 'MED789012',
      status: 'active',
      patients: 189,
      rating: 4.6,
      joinDate: '2023-03-22'
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@healthai.com',
      specialization: 'Pediatrician',
      experience: '15 years',
      license: 'MED345678',
      status: 'pending',
      patients: 312,
      rating: 4.9,
      joinDate: '2023-05-10'
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      email: 'james.wilson@healthai.com',
      specialization: 'Cardiologist',
      experience: '20 years',
      license: 'MED901234',
      status: 'inactive',
      patients: 178,
      rating: 4.7,
      joinDate: '2023-02-28'
    }
  ]);

  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    specialization: '',
    experience: '',
    license: '',
    phone: '',
    hospital: '',
    qualification: '',
    bio: ''
  });

  const handleAddDoctor = () => {
    if (!newDoctor.name || !newDoctor.email || !newDoctor.specialization) {
      alert('Please fill in required fields');
      return;
    }

    const doctor = {
      id: doctors.length + 1,
      ...newDoctor,
      status: 'pending',
      patients: 0,
      rating: 0,
      joinDate: new Date().toISOString().split('T')[0]
    };

    setDoctors([...doctors, doctor]);
    setNewDoctor({
      name: '', email: '', specialization: '', experience: '', 
      license: '', phone: '', hospital: '', qualification: '', bio: ''
    });
    setShowAddDoctorModal(false);
    alert('Doctor added successfully!');
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setShowAddDoctorModal(true);
  };

  const handleUpdateDoctor = () => {
    setDoctors(doctors.map(d => d.id === editingDoctor.id ? editingDoctor : d));
    setShowAddDoctorModal(false);
    setEditingDoctor(null);
    alert('Doctor updated successfully!');
  };

  const handleDeleteDoctor = (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      setDoctors(doctors.filter(d => d.id !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-gray-600">Manage doctors, patients, and system settings</p>
        </div>
        <button
          onClick={() => setShowAddDoctorModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors"
        >
          <FaPlus />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{doctors.length}</div>
              <div className="text-gray-600">Total Doctors</div>
            </div>
            <FaUserMd className="text-teal-600 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{doctors.filter(d => d.status === 'active').length}</div>
              <div className="text-gray-600">Active Doctors</div>
            </div>
            <FaUsers className="text-green-600 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {doctors.reduce((sum, doc) => sum + doc.patients, 0)}
              </div>
              <div className="text-gray-600">Total Patients</div>
            </div>
            <FaHospital className="text-blue-600 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">{doctors.filter(d => d.status === 'pending').length}</div>
              <div className="text-gray-600">Pending Approvals</div>
            </div>
            <FaChartLine className="text-yellow-600 text-2xl" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === tab.id
                      ? 'bg-teal-50 text-teal-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-lg">{tab.icon}</div>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Doctors Management */}
          {activeTab === 'doctors' && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6">
                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search doctors by name or specialization..."
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <select className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option>All Status</option>
                      <option>Active</option>
                      <option>Pending</option>
                      <option>Inactive</option>
                    </select>
                    
                    <button className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50">
                      <FaFilter />
                      <span>Filter</span>
                    </button>
                  </div>
                </div>

                {/* Doctors Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 font-medium text-gray-700">Doctor</th>
                        <th className="text-left py-3 font-medium text-gray-700">Specialization</th>
                        <th className="text-left py-3 font-medium text-gray-700">Experience</th>
                        <th className="text-left py-3 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 font-medium text-gray-700">Patients</th>
                        <th className="text-left py-3 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map((doctor) => (
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
                            <div className="text-gray-900">{doctor.experience}</div>
                          </td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(doctor.status)}`}>
                              {doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="text-gray-900 font-medium">{doctor.patients}</div>
                            <div className="text-sm text-gray-500">patients</div>
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
                              <button className="px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700">
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">System Overview</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 border border-gray-200 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">24/7</div>
                    <div className="text-gray-600">System Uptime</div>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">99.8%</div>
                    <div className="text-gray-600">Success Rate</div>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">1.2s</div>
                    <div className="text-gray-600">Avg Response Time</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Doctor Modal */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddDoctorModal(false);
                    setEditingDoctor(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={editingDoctor?.name || newDoctor.name}
                      onChange={(e) => editingDoctor 
                        ? setEditingDoctor({...editingDoctor, name: e.target.value})
                        : setNewDoctor({...newDoctor, name: e.target.value})
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={editingDoctor?.email || newDoctor.email}
                      onChange={(e) => editingDoctor 
                        ? setEditingDoctor({...editingDoctor, email: e.target.value})
                        : setNewDoctor({...newDoctor, email: e.target.value})
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization *
                    </label>
                    <input
                      type="text"
                      value={editingDoctor?.specialization || newDoctor.specialization}
                      onChange={(e) => editingDoctor 
                        ? setEditingDoctor({...editingDoctor, specialization: e.target.value})
                        : setNewDoctor({...newDoctor, specialization: e.target.value})
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience *
                    </label>
                    <input
                      type="text"
                      value={editingDoctor?.experience || newDoctor.experience}
                      onChange={(e) => editingDoctor 
                        ? setEditingDoctor({...editingDoctor, experience: e.target.value})
                        : setNewDoctor({...newDoctor, experience: e.target.value})
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical License *
                    </label>
                    <input
                      type="text"
                      value={editingDoctor?.license || newDoctor.license}
                      onChange={(e) => editingDoctor 
                        ? setEditingDoctor({...editingDoctor, license: e.target.value})
                        : setNewDoctor({...newDoctor, license: e.target.value})
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editingDoctor?.phone || newDoctor.phone}
                      onChange={(e) => editingDoctor 
                        ? setEditingDoctor({...editingDoctor, phone: e.target.value})
                        : setNewDoctor({...newDoctor, phone: e.target.value})
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital/Clinic
                  </label>
                  <input
                    type="text"
                    value={editingDoctor?.hospital || newDoctor.hospital}
                    onChange={(e) => editingDoctor 
                      ? setEditingDoctor({...editingDoctor, hospital: e.target.value})
                      : setNewDoctor({...newDoctor, hospital: e.target.value})
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualifications
                  </label>
                  <textarea
                    value={editingDoctor?.qualification || newDoctor.qualification}
                    onChange={(e) => editingDoctor 
                      ? setEditingDoctor({...editingDoctor, qualification: e.target.value})
                      : setNewDoctor({...newDoctor, qualification: e.target.value})
                    }
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g., MD in Internal Medicine, MBBS, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Bio
                  </label>
                  <textarea
                    value={editingDoctor?.bio || newDoctor.bio}
                    onChange={(e) => editingDoctor 
                      ? setEditingDoctor({...editingDoctor, bio: e.target.value})
                      : setNewDoctor({...newDoctor, bio: e.target.value})
                    }
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Brief professional background and expertise..."
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddDoctorModal(false);
                      setEditingDoctor(null);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={editingDoctor ? handleUpdateDoctor : handleAddDoctor}
                    className="px-8 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                  >
                    {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;