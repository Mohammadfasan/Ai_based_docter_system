import React, { useState, useEffect } from 'react';
import { 
  FaFolderOpen, FaFileMedical, FaUser, FaUserMd, 
  FaCalendarAlt, FaSearch, FaFilter, FaEye, 
  FaDownload, FaTrash, FaFilePdf, FaFileImage,
  FaFileAlt, FaImage, FaStethoscope, FaHospital,
  FaHeartbeat, FaTemperatureHigh, FaTint, FaHeart,
  FaClipboardList, FaNotesMedical, FaIdCard,
  FaEnvelope, FaPhone, FaVenusMars, FaTint as FaBlood,
  FaWeight, FaRuler, FaAmbulance, FaCheckCircle,
  FaTimesCircle, FaExclamationTriangle, FaHistory
} from 'react-icons/fa';
import { 
  Activity, Download, Eye, Trash2, Search, Filter,
  X, FileText, Image, User, Calendar, Clock,
  ChevronRight, AlertCircle, RefreshCw, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminMedicalRecords = ({ userType, userData, darkMode }) => {
  const [loading, setLoading] = useState(true);
  const [allRecords, setAllRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPatient, setFilterPatient] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
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

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    setLoading(true);
    
    try {
      // Load all users
      const allUsers = JSON.parse(localStorage.getItem('healthai_users') || '[]');
      const patientsList = allUsers.filter(u => u.userType === 'patient');
      const doctorsList = allUsers.filter(u => u.userType === 'doctor');
      setPatients(patientsList);
      setDoctors(doctorsList);

      // Load ALL medical records from ALL patients
      let allMedicalRecords = [];
      let totalFiles = 0;
      let totalImages = 0;
      let totalPDFs = 0;
      let recentCount = 0;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      patientsList.forEach(patient => {
        const patientId = patient.userId || patient.id;
        const records = JSON.parse(localStorage.getItem(`medical_records_${patientId}`) || '[]');
        
        // Add patient info to each record
        const recordsWithPatient = records.map(record => {
          // Count files
          if (record.files) {
            totalFiles += record.files.length;
            record.files.forEach(file => {
              if (file.fileType === 'image') totalImages++;
              else if (file.type?.includes('pdf') || file.name?.endsWith('.pdf')) totalPDFs++;
            });
          }

          // Count recent uploads
          const uploadDate = new Date(record.uploadedAt || record.date);
          if (uploadDate >= thirtyDaysAgo) recentCount++;

          return {
            ...record,
            patientId: patientId,
            patientName: patient.name || 'Unknown',
            patientEmail: patient.email,
            patientAge: patient.age,
            patientGender: patient.gender,
            patientBloodGroup: patient.bloodGroup,
            patientPhone: patient.phone,
            recordDate: record.date || record.uploadedAt || new Date().toISOString().split('T')[0]
          };
        });
        
        allMedicalRecords = [...allMedicalRecords, ...recordsWithPatient];
      });

      // Sort by date (newest first)
      allMedicalRecords.sort((a, b) => {
        const dateA = new Date(a.recordDate || a.uploadedAt || 0);
        const dateB = new Date(b.recordDate || b.uploadedAt || 0);
        return dateB - dateA;
      });

      setAllRecords(allMedicalRecords);
      
      setStats({
        totalRecords: allMedicalRecords.length,
        totalPatients: patientsList.length,
        totalFiles: totalFiles,
        totalImages: totalImages,
        totalPDFs: totalPDFs,
        recentUploads: recentCount
      });

    } catch (error) {
      console.error('Error loading medical records:', error);
      setAllRecords([]);
    }
    
    setLoading(false);
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowRecordModal(true);
  };

  const handleViewFile = (file) => {
    setSelectedFile(file);
    setShowFileModal(true);
  };

  const handleDownloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAllFiles = (record) => {
    if (!record.files || record.files.length === 0) return;
    
    record.files.forEach((file, index) => {
      setTimeout(() => {
        handleDownloadFile(file);
      }, index * 500);
    });
  };

  const handleDeleteRecord = (recordId) => {
    if (window.confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
      
      // Find which patient this record belongs to
      const record = allRecords.find(r => r.id === recordId);
      if (!record) return;

      // Get patient's records
      const patientRecords = JSON.parse(localStorage.getItem(`medical_records_${record.patientId}`) || '[]');
      
      // Remove the record
      const updatedRecords = patientRecords.filter(r => r.id !== recordId);
      
      // Save back to localStorage
      localStorage.setItem(`medical_records_${record.patientId}`, JSON.stringify(updatedRecords));
      
      // Reload data
      loadAllData();
      
      // Close modal if open
      if (selectedRecord?.id === recordId) {
        setShowRecordModal(false);
        setSelectedRecord(null);
      }
      
      alert('✅ Medical record deleted successfully');
    }
  };

  const handleDeleteAllPatientRecords = (patientId) => {
    if (window.confirm('Are you sure you want to delete ALL records for this patient?')) {
      localStorage.removeItem(`medical_records_${patientId}`);
      loadAllData();
      alert('✅ All patient records deleted');
    }
  };

  const getFileIcon = (file) => {
    if (!file) return <FaFileAlt className="text-gray-400" />;
    
    const fileName = file.name || '';
    const fileType = file.fileType || '';
    
    if (fileType === 'image' || fileName.match(/\.(jpg|jpeg|png|gif|bmp)$/i)) {
      return <FaFileImage className="text-blue-500" size={16} />;
    }
    if (fileName.endsWith('.pdf') || file.type?.includes('pdf')) {
      return <FaFilePdf className="text-red-500" size={16} />;
    }
    return <FaFileAlt className="text-gray-500" size={16} />;
  };

  const getRecordTypeIcon = (type) => {
    switch(type) {
      case 'X-Ray':
      case 'MRI':
      case 'CT Scan':
        return <FaImage className="text-purple-500" />;
      case 'Lab Report':
        return <FaClipboardList className="text-green-500" />;
      case 'Prescription':
        return <FaNotesMedical className="text-amber-500" />;
      default:
        return <FaFileMedical className="text-teal-500" />;
    }
  };

  // Filter records
  const filteredRecords = allRecords.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patientId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPatient = filterPatient === 'all' || record.patientId === filterPatient;
    const matchesType = filterType === 'all' || record.type === filterType;
    
    return matchesSearch && matchesPatient && matchesType;
  });

  const recordTypes = [
    'all',
    'Lab Report',
    'X-Ray',
    'MRI',
    'CT Scan',
    'Prescription',
    'Checkup'
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-slate-600 font-bold">Loading Medical Records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-[#f8fafc]'}`}>
      
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-b-3xl mb-8`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
                <FaFolderOpen className="text-teal-500" />
                Medical Records <span className="text-teal-500">Management</span>
              </h1>
              <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                View all medical records from all patients
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={loadAllData}
                className="px-4 py-2 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-600 transition-all flex items-center gap-2"
              >
                <RefreshCw size={16} />
                REFRESH
              </button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-8">
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-teal-50'}`}>
              <p className="text-xs text-teal-600 font-black">TOTAL RECORDS</p>
              <p className="text-xl font-black">{stats.totalRecords}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className="text-xs text-blue-600 font-black">PATIENTS</p>
              <p className="text-xl font-black">{stats.totalPatients}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <p className="text-xs text-purple-600 font-black">TOTAL FILES</p>
              <p className="text-xl font-black">{stats.totalFiles}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <p className="text-xs text-green-600 font-black">IMAGES</p>
              <p className="text-xl font-black">{stats.totalImages}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
              <p className="text-xs text-red-600 font-black">PDFs</p>
              <p className="text-xl font-black">{stats.totalPDFs}</p>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-amber-50'}`}>
              <p className="text-xs text-amber-600 font-black">RECENT (30d)</p>
              <p className="text-xl font-black">{stats.recentUploads}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by patient, doctor, diagnosis, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 outline-none ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white'
              }`}
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={filterPatient}
              onChange={(e) => setFilterPatient(e.target.value)}
              className={`px-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 outline-none ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white'
              }`}
            >
              <option value="all">All Patients</option>
              {patients.map(patient => (
                <option key={patient.userId || patient.id} value={patient.userId || patient.id}>
                  {patient.name} ({patient.userId || patient.id})
                </option>
              ))}
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 outline-none ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white'
              }`}
            >
              {recordTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
            
            <button className="p-4 bg-teal-500 text-white rounded-2xl hover:bg-teal-600 transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Records Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className={`rounded-2xl shadow-xl overflow-hidden border ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-slate-100'
                }`}
              >
                {/* Header with Patient Info */}
                <div className={`p-4 bg-gradient-to-r ${
                  record.patientGender === 'Female' 
                    ? 'from-pink-500 to-rose-500' 
                    : 'from-blue-500 to-teal-500'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-white font-black text-xl border-2 border-white/30">
                        {record.patientName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">{record.patientName}</h3>
                        <p className="text-white/80 text-xs flex items-center gap-1">
                          <FaIdCard size={10} /> {record.patientId}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-[9px] font-black text-white">
                      {record.type}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Record Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getRecordTypeIcon(record.type)}
                      <span className="font-bold text-sm">{record.diagnosis || record.type}</span>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 flex items-center gap-1">
                      <FaCalendarAlt size={8} /> {formatDate(record.recordDate)}
                    </span>
                  </div>

                  {/* Doctor */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <FaUserMd size={10} />
                    <span>{record.doctor || 'Self-uploaded'}</span>
                  </div>

                  {/* Patient Demographics */}
                  <div className="grid grid-cols-4 gap-1 text-[8px]">
                    {record.patientAge && (
                      <div className="p-1 bg-slate-50 rounded text-center">
                        <span className="font-black">Age {record.patientAge}</span>
                      </div>
                    )}
                    {record.patientBloodGroup && (
                      <div className="p-1 bg-red-50 text-red-600 rounded text-center font-black">
                        {record.patientBloodGroup}
                      </div>
                    )}
                    {record.patientGender && (
                      <div className="p-1 bg-blue-50 text-blue-600 rounded text-center font-black">
                        {record.patientGender === 'Male' ? 'M' : 'F'}
                      </div>
                    )}
                    {record.files && (
                      <div className="p-1 bg-purple-50 text-purple-600 rounded text-center font-black">
                        {record.files.length} file(s)
                      </div>
                    )}
                  </div>

                  {/* Files Preview */}
                  {record.files && record.files.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {record.files.slice(0, 3).map((file, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleViewFile(file)}
                          className="p-1 bg-slate-100 hover:bg-teal-100 rounded-lg transition-colors"
                          title={file.name}
                        >
                          {getFileIcon(file)}
                        </button>
                      ))}
                      {record.files.length > 3 && (
                        <span className="text-[8px] text-slate-400">
                          +{record.files.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button 
                      onClick={() => handleViewRecord(record)}
                      className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-[10px] font-black hover:bg-blue-600 transition-all flex items-center justify-center gap-1"
                    >
                      <FaEye size={10} /> VIEW
                    </button>
                    
                    {record.files && record.files.length > 0 && (
                      <button 
                        onClick={() => handleDownloadAllFiles(record)}
                        className="flex-1 py-2 bg-green-500 text-white rounded-lg text-[10px] font-black hover:bg-green-600 transition-all flex items-center justify-center gap-1"
                      >
                        <FaDownload size={10} /> ALL
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleDeleteRecord(record.id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                    >
                      <FaTrash size={10} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <FaFolderOpen className="text-6xl text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-slate-400">No Medical Records Found</h3>
              <p className="text-slate-400">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Record Detail Modal */}
      <AnimatePresence>
        {showRecordModal && selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowRecordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`p-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black">Medical Record Details</h2>
                    <p className="text-teal-100">ID: {selectedRecord.id}</p>
                  </div>
                  <button 
                    onClick={() => setShowRecordModal(false)}
                    className="text-white/60 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Patient Information */}
                <div>
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <FaUser className="text-teal-500" />
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Name</p>
                      <p className="font-black">{selectedRecord.patientName}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Patient ID</p>
                      <p className="font-mono text-sm">{selectedRecord.patientId}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Email</p>
                      <p className="text-sm">{selectedRecord.patientEmail}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Phone</p>
                      <p className="text-sm">{selectedRecord.patientPhone || 'N/A'}</p>
                    </div>
                    {selectedRecord.patientAge && (
                      <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                        <p className="text-xs text-slate-400">Age</p>
                        <p className="font-black">{selectedRecord.patientAge}</p>
                      </div>
                    )}
                    {selectedRecord.patientGender && (
                      <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                        <p className="text-xs text-slate-400">Gender</p>
                        <p className="font-black">{selectedRecord.patientGender}</p>
                      </div>
                    )}
                    {selectedRecord.patientBloodGroup && (
                      <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
                        <p className="text-xs text-slate-400">Blood Group</p>
                        <p className="font-black text-red-600">{selectedRecord.patientBloodGroup}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Record Information */}
                <div>
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <FaFileMedical className="text-teal-500" />
                    Record Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Type</p>
                      <p className="font-black flex items-center gap-2">
                        {getRecordTypeIcon(selectedRecord.type)}
                        {selectedRecord.type}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Date</p>
                      <p className="font-black">{formatDate(selectedRecord.recordDate)}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Doctor</p>
                      <p className="font-black">{selectedRecord.doctor || 'Self-uploaded'}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Uploaded By</p>
                      <p className="font-black">{selectedRecord.uploadedBy || 'Unknown'}</p>
                    </div>
                  </div>
                </div>

                {/* Diagnosis */}
                {selectedRecord.diagnosis && (
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <p className="text-xs text-slate-400 mb-2">Diagnosis</p>
                    <p className="font-black text-lg">{selectedRecord.diagnosis}</p>
                  </div>
                )}

                {/* OP Details */}
                {selectedRecord.opDetails && (
                  <div>
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                      <FaStethoscope className="text-teal-500" />
                      Consultation Details
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedRecord.opDetails.opDoctor && (
                        <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                          <p className="text-xs text-slate-400">Doctor</p>
                          <p className="font-black">{selectedRecord.opDetails.opDoctor}</p>
                        </div>
                      )}
                      {selectedRecord.opDetails.opDept && (
                        <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                          <p className="text-xs text-slate-400">Department</p>
                          <p className="font-black">{selectedRecord.opDetails.opDept}</p>
                        </div>
                      )}
                      {selectedRecord.opDetails.visitType && (
                        <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                          <p className="text-xs text-slate-400">Visit Type</p>
                          <p className="font-black">{selectedRecord.opDetails.visitType}</p>
                        </div>
                      )}
                      {selectedRecord.opDetails.bp && (
                        <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                          <p className="text-xs text-slate-400">BP</p>
                          <p className="font-black">{selectedRecord.opDetails.bp}</p>
                        </div>
                      )}
                      {selectedRecord.opDetails.heartRate && (
                        <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                          <p className="text-xs text-slate-400">Heart Rate</p>
                          <p className="font-black">{selectedRecord.opDetails.heartRate}</p>
                        </div>
                      )}
                      {selectedRecord.opDetails.temp && (
                        <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                          <p className="text-xs text-slate-400">Temperature</p>
                          <p className="font-black">{selectedRecord.opDetails.temp}</p>
                        </div>
                      )}
                      {selectedRecord.opDetails.oxygen && (
                        <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                          <p className="text-xs text-slate-400">Oxygen</p>
                          <p className="font-black">{selectedRecord.opDetails.oxygen}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedRecord.notes && (
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-amber-50'}`}>
                    <p className="text-xs text-slate-400 mb-2">Notes</p>
                    <p className="whitespace-pre-wrap">{selectedRecord.notes}</p>
                  </div>
                )}

                {/* Files */}
                {selectedRecord.files && selectedRecord.files.length > 0 && (
                  <div>
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                      <FaFileAlt className="text-teal-500" />
                      Attached Files ({selectedRecord.files.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedRecord.files.map((file, idx) => (
                        <div 
                          key={idx}
                          className={`p-3 rounded-xl border ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600' 
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getFileIcon(file)}
                              <div>
                                <p className="font-bold text-sm truncate max-w-[150px]">{file.name}</p>
                                <p className="text-[8px] text-slate-400">
                                  {(file.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleViewFile(file)}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                                title="View"
                              >
                                <FaEye size={12} />
                              </button>
                              <button
                                onClick={() => handleDownloadFile(file)}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all"
                                title="Download"
                              >
                                <FaDownload size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Download All Button */}
                    {selectedRecord.files.length > 1 && (
                      <button
                        onClick={() => handleDownloadAllFiles(selectedRecord)}
                        className="mt-4 w-full py-3 bg-teal-500 text-white rounded-xl font-black hover:bg-teal-600 transition-all flex items-center justify-center gap-2"
                      >
                        <FaDownload size={14} />
                        DOWNLOAD ALL ({selectedRecord.files.length} files)
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-slate-200'} flex justify-end gap-3`}>
                <button
                  onClick={() => setShowRecordModal(false)}
                  className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 transition-all font-bold text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDeleteRecord(selectedRecord.id)}
                  className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-bold text-sm flex items-center gap-2"
                >
                  <FaTrash size={14} />
                  Delete Record
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File View Modal */}
      <AnimatePresence>
        {showFileModal && selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]"
            onClick={() => setShowFileModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`p-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white flex justify-between items-center`}>
                <div className="flex items-center gap-3">
                  {getFileIcon(selectedFile)}
                  <div>
                    <h3 className="font-black">{selectedFile.name}</h3>
                    <p className="text-xs text-teal-100">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadFile(selectedFile)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                  >
                    <FaDownload size={16} />
                  </button>
                  <button
                    onClick={() => setShowFileModal(false)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-900">
                {selectedFile.fileType === 'image' || selectedFile.name?.match(/\.(jpg|jpeg|png|gif|bmp)$/i) ? (
                  <div className="flex justify-center">
                    <img 
                      src={selectedFile.data} 
                      alt={selectedFile.name}
                      className="max-w-full max-h-[60vh] object-contain rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaFilePdf size={64} className="mx-auto text-red-400 mb-4" />
                    <p className="text-white font-bold mb-4">PDF Document</p>
                    <button
                      onClick={() => handleDownloadFile(selectedFile)}
                      className="bg-teal-500 text-white px-6 py-3 rounded-xl font-black hover:bg-teal-600 transition-all inline-flex items-center gap-2"
                    >
                      <FaDownload size={16} /> DOWNLOAD PDF
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMedicalRecords;