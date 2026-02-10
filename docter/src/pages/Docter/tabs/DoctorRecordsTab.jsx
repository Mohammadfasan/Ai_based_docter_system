import React, { useState, useEffect } from 'react';
import { 
  FileText, User, Calendar, Search, Filter, Download, 
  Eye, MessageSquare, CheckCircle, XCircle, AlertCircle,
  File, Image, Stethoscope, Pill, Activity, Shield
} from 'lucide-react';

const DoctorRecordsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [medicalRecords, setMedicalRecords] = useState([]);

  // Load records from localStorage (shared with patient view)
  useEffect(() => {
    const loadRecords = () => {
      const saved = localStorage.getItem('doctor_medical_records') || 
                    localStorage.getItem('user_medical_records');
      if (saved) {
        const records = JSON.parse(saved);
        // Add mock patients to simulate multiple patients
        const doctorViewRecords = records.map(record => ({
          ...record,
          patientId: `PAT${1000 + Math.floor(Math.random() * 9000)}`,
          patientName: ['John Smith', 'Emma Wilson', 'Michael Chen', 'Sarah Johnson', 'David Brown'][Math.floor(Math.random() * 5)],
          patientAge: Math.floor(Math.random() * 50) + 20,
          patientGender: ['Male', 'Female'][Math.floor(Math.random() * 2)],
          lastVisit: record.date
        }));
        setMedicalRecords(doctorViewRecords);
      }
    };
    
    loadRecords();
    // Refresh every 30 seconds for new records
    const interval = setInterval(loadRecords, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter records
  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'pending' && record.uploadedBy === 'user') ||
                         (filterStatus === 'reviewed' && record.uploadedBy === 'doctor');
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: medicalRecords.length,
    pending: medicalRecords.filter(r => r.uploadedBy === 'user').length,
    reviewed: medicalRecords.filter(r => r.uploadedBy === 'doctor').length,
    patients: new Set(medicalRecords.map(r => r.patientId)).size
  };

  const getStatusColor = (record) => {
    if (record.uploadedBy === 'user') return 'bg-yellow-100 text-yellow-800';
    if (record.status === 'Normal') return 'bg-emerald-100 text-emerald-800';
    if (record.status === 'Attention') return 'bg-amber-100 text-amber-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'Prescription': return <Pill size={16} />;
      case 'Lab Report': return <Activity size={16} />;
      case 'Checkup': return <Stethoscope size={16} />;
      case 'X-Ray': return <Image size={16} />;
      default: return <File size={16} />;
    }
  };

  const openRecordDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const addDoctorNote = () => {
    if (!doctorNotes.trim() || !selectedRecord) return;
    
    // Update record with doctor's note
    const updatedRecords = medicalRecords.map(record => 
      record.id === selectedRecord.id 
        ? { 
            ...record, 
            doctorNotes: doctorNotes,
            reviewedBy: 'Dr. Current User',
            reviewedAt: new Date().toISOString().split('T')[0],
            status: 'Reviewed',
            uploadedBy: 'doctor'
          }
        : record
    );
    
    setMedicalRecords(updatedRecords);
    localStorage.setItem('doctor_medical_records', JSON.stringify(updatedRecords));
    setDoctorNotes('');
    alert('Note added successfully!');
  };

  const approveRecord = () => {
    if (!selectedRecord) return;
    
    const updatedRecords = medicalRecords.map(record => 
      record.id === selectedRecord.id 
        ? { ...record, status: 'Approved', uploadedBy: 'doctor' }
        : record
    );
    
    setMedicalRecords(updatedRecords);
    localStorage.setItem('doctor_medical_records', JSON.stringify(updatedRecords));
    alert('Record approved!');
  };

  const downloadRecord = (record) => {
    // Create a mock download
    const data = JSON.stringify(record, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-record-${record.patientId}-${record.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Patient Medical Records</h1>
          <p className="text-gray-600 mt-2">Review and manage patient medical documents</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Records</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-600">Pending Review</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <AlertCircle className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.reviewed}</p>
                <p className="text-sm text-gray-600">Reviewed</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CheckCircle className="text-emerald-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.patients}</p>
                <p className="text-sm text-gray-600">Total Patients</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <User className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Status Filter */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {['all', 'pending', 'reviewed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                    filterStatus === status
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {status === 'all' ? 'All Records' : status}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by patient name, ID, or diagnosis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <button className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
              <Filter size={18} />
              Advanced Filter
            </button>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Patient</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Record Type</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Diagnosis</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User className="text-emerald-600" size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{record.patientName}</p>
                          <p className="text-sm text-gray-500">ID: {record.patientId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(record.type)}
                        <span className="font-medium text-gray-900">{record.type}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-900">{record.diagnosis}</p>
                      <p className="text-sm text-gray-500">{record.doctor}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-gray-700">{record.date}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record)}`}>
                        {record.uploadedBy === 'user' ? 'Pending Review' : record.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openRecordDetails(record)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => downloadRecord(record)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                        {record.uploadedBy === 'user' && (
                          <button
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowDetailModal(true);
                            }}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Add Note"
                          >
                            <MessageSquare size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedRecord && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Medical Record Details</h2>
                  <p className="text-gray-600">{selectedRecord.type} • {selectedRecord.date}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  
                  {/* Patient Info */}
                  <div className="md:col-span-1 space-y-6">
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Patient Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Full Name</p>
                          <p className="font-medium text-gray-900">{selectedRecord.patientName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Patient ID</p>
                          <p className="font-medium text-gray-900">{selectedRecord.patientId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Age & Gender</p>
                          <p className="font-medium text-gray-900">{selectedRecord.patientAge} years, {selectedRecord.patientGender}</p>
                        </div>
                      </div>
                    </div>

                    {/* Doctor Actions */}
                    <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Doctor Actions</h3>
                      <div className="space-y-3">
                        <button
                          onClick={approveRecord}
                          className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={18} />
                          Approve Record
                        </button>
                        <button
                          onClick={() => downloadRecord(selectedRecord)}
                          className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download size={18} />
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Record Details */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Consulting Doctor</p>
                        <p className="font-bold text-gray-900">{selectedRecord.doctor}</p>
                        <p className="text-sm text-gray-500">{selectedRecord.specialty}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Hospital/Clinic</p>
                        <p className="font-bold text-gray-900">{selectedRecord.hospital}</p>
                      </div>
                    </div>

                    {/* Diagnosis & Notes */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Diagnosis</h3>
                      <p className="text-gray-700">{selectedRecord.diagnosis}</p>
                      
                      <h3 className="text-lg font-bold text-gray-900 mt-4 mb-3">Doctor's Notes</h3>
                      <p className="text-gray-700">{selectedRecord.notes}</p>
                    </div>

                    {/* Add Doctor's Note */}
                    <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Add Clinical Note</h3>
                      <textarea
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        placeholder="Enter your clinical observations and recommendations..."
                        rows="4"
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <button
                        onClick={addDoctorNote}
                        disabled={!doctorNotes.trim()}
                        className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Note
                      </button>
                    </div>

                    {/* Uploaded Files */}
                    {selectedRecord.files && selectedRecord.files.length > 0 && (
                      <div className="bg-white p-5 rounded-xl border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Uploaded Files</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedRecord.files.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <File className="text-emerald-600" size={20} />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 truncate">{file.name}</p>
                                <p className="text-sm text-gray-500">{file.size} MB</p>
                              </div>
                              <button
                                onClick={() => downloadRecord(selectedRecord)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Download size={16} className="text-gray-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorRecordsTab;