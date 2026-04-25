// src/pages/Admin/AdminMedicalRecords.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaFolderOpen, FaFileMedical, FaUser, FaUserMd, 
  FaCalendarAlt, FaSearch, FaFilter, FaEye, 
  FaDownload, FaTrash, FaFilePdf, FaFileImage,
  FaFileAlt, FaImage, FaStethoscope, FaHospital,
  FaHeartbeat, FaTemperatureHigh, FaTint, FaHeart,
  FaClipboardList, FaNotesMedical, FaIdCard,
  FaEnvelope, FaPhone, FaVenusMars,
  FaWeight, FaRuler, FaAmbulance, FaCheckCircle,
  FaTimesCircle, FaExclamationTriangle, FaHistory,
  FaSpinner, FaUserCircle, FaClock, FaUpload
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const AdminMedicalRecords = ({ userType, userData, darkMode }) => {
  const [loading, setLoading] = useState(true);
  const [allRecords, setAllRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalPatients: 0,
    totalFiles: 0,
    totalImages: 0,
    totalPDFs: 0,
    recentUploads: 0
  });

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  useEffect(() => {
    fetchAllRecords();
  }, []);

  const fetchAllRecords = async () => {
    setLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      // First fetch all patients to get their IDs
      const patientsResponse = await axios.get(`${API_URL}/users/patients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (patientsResponse.data.success) {
        const patients = patientsResponse.data.data;
        
        // Fetch medical records for each patient
        let allMedicalRecords = [];
        let totalFiles = 0;
        let totalImages = 0;
        let totalPDFs = 0;
        let recentCount = 0;
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        for (const patient of patients) {
          try {
            const recordsResponse = await axios.get(`${API_URL}/medical-records/${patient.userId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (recordsResponse.data.success && recordsResponse.data.data) {
              const recordsWithPatient = recordsResponse.data.data.map(record => {
                // Count files
                if (record.files) {
                  totalFiles += record.files.length;
                  record.files.forEach(file => {
                    if (file.fileType === 'image') totalImages++;
                    else if (file.fileType === 'pdf') totalPDFs++;
                  });
                }

                // Count recent uploads
                const uploadDate = new Date(record.uploadedAt);
                if (uploadDate >= thirtyDaysAgo) recentCount++;

                return {
                  ...record,
                  patientId: patient.userId,
                  patientName: patient.name,
                  patientEmail: patient.email,
                  patientAge: patient.age,
                  patientGender: patient.gender,
                  patientBloodGroup: patient.bloodGroup,
                  patientPhone: patient.phone
                };
              });
              
              allMedicalRecords = [...allMedicalRecords, ...recordsWithPatient];
            }
          } catch (err) {
            console.error(`Error fetching records for patient ${patient.name}:`, err);
          }
        }

        // Sort by date (newest first)
        allMedicalRecords.sort((a, b) => {
          const dateA = new Date(a.uploadedAt || a.date || 0);
          const dateB = new Date(b.uploadedAt || b.date || 0);
          return dateB - dateA;
        });

        setAllRecords(allMedicalRecords);
        
        setStats({
          totalRecords: allMedicalRecords.length,
          totalPatients: patients.length,
          totalFiles: totalFiles,
          totalImages: totalImages,
          totalPDFs: totalPDFs,
          recentUploads: recentCount
        });
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleViewFile = (file) => {
    setSelectedFile(file);
    setShowFileModal(true);
  };

  const handleDownloadFile = (file) => {
    if (file.cloudinaryUrl || file.data) {
      window.open(file.cloudinaryUrl || file.data, '_blank');
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
      try {
        const token = getToken();
        const response = await axios.delete(`${API_URL}/medical-records/cloudinary/${recordId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data.success) {
          fetchAllRecords();
          if (showModal) setShowModal(false);
          alert('✅ Medical record deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Failed to delete record');
      }
    }
  };

  const getFileIcon = (file) => {
    if (!file) return <FaFileAlt className="text-gray-400" />;
    
    if (file.fileType === 'image') {
      return <FaFileImage className="text-blue-500" size={14} />;
    }
    if (file.fileType === 'pdf') {
      return <FaFilePdf className="text-red-500" size={14} />;
    }
    return <FaFileAlt className="text-gray-500" size={14} />;
  };

  const getRecordTypeBadge = (type) => {
    switch(type) {
      case 'X-Ray':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">X-Ray</span>;
      case 'MRI':
        return <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">MRI</span>;
      case 'CT Scan':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">CT Scan</span>;
      case 'Lab Report':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Lab Report</span>;
      case 'Prescription':
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Prescription</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{type}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter records
  const filteredRecords = allRecords.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.uploadedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patientId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || record.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const recordTypes = ['all', 'Lab Report', 'X-Ray', 'MRI', 'CT Scan', 'Prescription', 'Checkup'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-teal-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading medical records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaFolderOpen className="text-teal-500" />
          Medical Records Management
        </h1>
        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          View all medical records from all patients
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className="text-xs text-teal-600 font-medium">TOTAL RECORDS</p>
          <p className="text-2xl font-bold">{stats.totalRecords}</p>
        </div>
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className="text-xs text-blue-600 font-medium">PATIENTS</p>
          <p className="text-2xl font-bold">{stats.totalPatients}</p>
        </div>
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className="text-xs text-purple-600 font-medium">TOTAL FILES</p>
          <p className="text-2xl font-bold">{stats.totalFiles}</p>
        </div>
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className="text-xs text-green-600 font-medium">IMAGES</p>
          <p className="text-2xl font-bold">{stats.totalImages}</p>
        </div>
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className="text-xs text-red-600 font-medium">PDFs</p>
          <p className="text-2xl font-bold">{stats.totalPDFs}</p>
        </div>
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <p className="text-xs text-amber-600 font-medium">RECENT (30d)</p>
          <p className="text-2xl font-bold">{stats.recentUploads}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by patient name, doctor, diagnosis, type, uploaded by, patient ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 outline-none ${
              darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 outline-none ${
            darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
          }`}
        >
          {recordTypes.map(type => (
            <option key={type} value={type}>
              {type === 'all' ? 'All Types' : type}
            </option>
          ))}
        </select>
        <button 
          onClick={fetchAllRecords}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
        >
          <FaFilter size={14} />
          Refresh
        </button>
      </div>

      {/* Records Table */}
      <div className={`rounded-xl shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Files</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record._id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{formatDate(record.date || record.uploadedAt)}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <FaClock size={10} />
                          {formatDateTime(record.uploadedAt).split(',')[1]}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${record.patientGender === 'Female' ? 'from-pink-500 to-rose-500' : 'from-blue-500 to-teal-500'} flex items-center justify-center text-white font-bold text-xs`}>
                          {record.patientName?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{record.patientName}</p>
                          <p className="text-xs text-gray-500">{record.patientId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getRecordTypeBadge(record.type)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm max-w-[200px] truncate" title={record.diagnosis}>
                        {record.diagnosis}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <FaUserMd className="text-teal-500" size={12} />
                        <span className="text-sm">{record.doctor || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <FaUpload className="text-purple-500" size={12} />
                        <span className="text-sm">{record.uploadedBy}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {record.files && record.files.length > 0 ? (
                          <>
                            {record.files.slice(0, 2).map((file, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleViewFile(file)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                title={file.name}
                              >
                                {getFileIcon(file)}
                              </button>
                            ))}
                            {record.files.length > 2 && (
                              <span className="text-xs text-gray-500">+{record.files.length - 2}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">No files</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewRecord(record)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record._id)}
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
                    <FaFolderOpen className="text-5xl mx-auto mb-3 opacity-50" />
                    No medical records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Detail Modal */}
      {showModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className={`max-w-3xl w-full rounded-xl shadow-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
            <div className={`p-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Medical Record Details</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Patient Information */}
              <div>
                <h3 className="text-md font-bold mb-3 flex items-center gap-2">
                  <FaUser className="text-teal-500" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{selectedRecord.patientName}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500">Patient ID</p>
                    <p className="font-mono text-sm">{selectedRecord.patientId}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm">{selectedRecord.patientEmail}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm">{selectedRecord.patientPhone || 'N/A'}</p>
                  </div>
                  {selectedRecord.patientAge && (
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-500">Age</p>
                      <p className="font-medium">{selectedRecord.patientAge}</p>
                    </div>
                  )}
                  {selectedRecord.patientGender && (
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-500">Gender</p>
                      <p className="font-medium">{selectedRecord.patientGender}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Record Information */}
              <div>
                <h3 className="text-md font-bold mb-3 flex items-center gap-2">
                  <FaFileMedical className="text-teal-500" />
                  Record Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="font-medium">{selectedRecord.type}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500">Record Date</p>
                    <p className="font-medium">{formatDate(selectedRecord.date)}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500">Doctor</p>
                    <p className="font-medium">{selectedRecord.doctor}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500">Diagnosis</p>
                    <p className="font-medium">{selectedRecord.diagnosis}</p>
                  </div>
                </div>
              </div>

              {/* Upload Information */}
              <div>
                <h3 className="text-md font-bold mb-3 flex items-center gap-2">
                  <FaUpload className="text-purple-500" />
                  Upload Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500">Uploaded By</p>
                    <p className="font-medium">{selectedRecord.uploadedBy}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500">Uploaded At</p>
                    <p className="text-sm">{formatDateTime(selectedRecord.uploadedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedRecord.notes && (
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedRecord.notes}</p>
                </div>
              )}

              {/* Files */}
              {selectedRecord.files && selectedRecord.files.length > 0 && (
                <div>
                  <h3 className="text-md font-bold mb-3 flex items-center gap-2">
                    <FaFileAlt className="text-teal-500" />
                    Attached Files ({selectedRecord.files.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedRecord.files.map((file, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2">
                          {getFileIcon(file)}
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewFile(file)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          <FaEye size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3`}>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Close</button>
              <button onClick={() => handleDeleteRecord(selectedRecord._id)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Delete Record</button>
            </div>
          </div>
        </div>
      )}

      {/* File View Modal */}
      {showFileModal && selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowFileModal(false)}>
          <div className={`max-w-4xl w-full rounded-xl shadow-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
            <div className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b flex justify-between items-center`}>
              <div className="flex items-center gap-2">
                {getFileIcon(selectedFile)}
                <span className="font-medium">{selectedFile.name}</span>
              </div>
              <button onClick={() => setShowFileModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-900">
              {selectedFile.fileType === 'image' ? (
                <img src={selectedFile.cloudinaryUrl || selectedFile.data} alt={selectedFile.name} className="max-w-full mx-auto rounded-lg" />
              ) : (
                <div className="text-center py-12">
                  <FaFilePdf size={64} className="mx-auto text-red-400 mb-4" />
                  <p className="text-white mb-4">PDF Document</p>
                  <button
                    onClick={() => handleDownloadFile(selectedFile)}
                    className="bg-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-600"
                  >
                    <FaDownload className="inline mr-2" /> Download PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMedicalRecords;