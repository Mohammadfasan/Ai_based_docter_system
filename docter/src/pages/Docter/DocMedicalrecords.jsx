// DocMedicalrecords.jsx - COMPLETE VERSION USING MONGODB ONLY
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaFileMedical, FaSearch, FaPlus, FaTimes, 
  FaStethoscope, FaChevronRight, FaUpload, 
  FaUsers, FaSyncAlt, FaFilter, FaCalendarAlt, 
  FaHeartbeat, FaUser, FaDownload, FaEye, FaFileImage, 
  FaFilePdf, FaFileAlt, FaTrash, FaUserCircle,
  FaEnvelope, FaIdCard, FaPrescriptionBottle,
  FaThermometerHalf, FaTint, FaClipboardList
} from 'react-icons/fa';
import { Activity } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const DocMedicalrecords = () => {
  // --- STATES ---
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPatientSelectModal, setShowPatientSelectModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Upload Form States
  const [uploadFiles, setUploadFiles] = useState([]);
  const [recordType, setRecordType] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [recordNotes, setRecordNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showOPDetails, setShowOPDetails] = useState(false);
  
  // OP Details States
  const [opDoctor, setOpDoctor] = useState('');
  const [opDept, setOpDept] = useState('');
  const [visitType, setVisitType] = useState('');
  const [bp, setBp] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temp, setTemp] = useState('');
  const [oxygen, setOxygen] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  
  // Selected file for view
  const [selectedFile, setSelectedFile] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    totalRecords: 0,
    labReports: 0,
    xrays: 0,
    prescriptions: 0
  });

  // Get current doctor and load patients from MongoDB
  useEffect(() => {
    const init = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        setCurrentDoctor(user);
        
        // Load all patients from MongoDB
        await loadPatients();
      } catch (error) {
        console.error('Error initializing:', error);
        setError('Failed to initialize');
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, []);

  // Load patients from MongoDB
  const loadPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/users/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPatients(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      // Fallback to localStorage users if API fails
      const allUsers = JSON.parse(localStorage.getItem('healthai_users') || '[]');
      const patientUsers = allUsers.filter(u => u.userType === 'patient');
      setPatients(patientUsers);
    }
  };

  // Load medical records from MongoDB for selected patient
  useEffect(() => {
    if (selectedPatient) {
      loadPatientRecords(selectedPatient.userId || selectedPatient._id);
    } else {
      setMedicalRecords([]);
      setStats({
        totalRecords: 0,
        labReports: 0,
        xrays: 0,
        prescriptions: 0
      });
    }
  }, [selectedPatient]);

  const loadPatientRecords = async (patientId) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('📋 Loading medical records for patient:', patientId);
      
      const response = await axios.get(`${API_URL}/medical-records/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const records = response.data.data || [];
        // Sort by date (newest first)
        const sorted = records.sort((a, b) => new Date(b.date) - new Date(a.date));
        setMedicalRecords(sorted);
        
        // Calculate stats
        setStats({
          totalRecords: sorted.length,
          labReports: sorted.filter(r => r.type === 'Lab Report').length,
          xrays: sorted.filter(r => ['X-Ray', 'MRI', 'CT Scan'].includes(r.type)).length,
          prescriptions: sorted.filter(r => r.type === 'Prescription').length
        });
        
        console.log('✅ Loaded', sorted.length, 'records from MongoDB');
        setError('');
      } else {
        console.warn('⚠️ Failed to load records:', response.data.message);
        setMedicalRecords([]);
      }
    } catch (error) {
      console.error('Error loading records:', error);
      setError('Failed to load patient records');
      setMedicalRecords([]);
    }
  };

  // Handle file upload to MongoDB
  const handleUploadSubmit = async () => {
    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }

    if (!recordDate || !recordType || uploadFiles.length === 0) {
      alert('Please fill required fields and select files');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('userId', selectedPatient.userId || selectedPatient._id);
      formData.append('userEmail', selectedPatient.email || '');
      formData.append('userName', selectedPatient.name || '');
      formData.append('date', recordDate);
      formData.append('type', recordType);
      formData.append('diagnosis', diagnosis || recordType);
      formData.append('doctor', currentDoctor?.name || 'Dr. Unknown');
      formData.append('notes', recordNotes);
      formData.append('patientId', selectedPatient.userId || selectedPatient._id);
      
      if (showOPDetails) {
        formData.append('opDetails', JSON.stringify({
          opDoctor: opDoctor || currentDoctor?.name,
          opDept: opDept || 'General',
          visitType: visitType || 'OP',
          bp,
          heartRate,
          temp,
          oxygen
        }));
      }

      uploadFiles.forEach((file) => {
        formData.append('files', file);
      });

      console.log('📤 Uploading', uploadFiles.length, 'files to MongoDB');

      const response = await axios.post(`${API_URL}/medical-records/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        console.log('✅ Upload successful - Record saved to MongoDB');
        
        // Refresh records
        await loadPatientRecords(selectedPatient.userId || selectedPatient._id);
        
        // Reset form
        resetUploadForm();
        setShowUploadModal(false);
        setSuccessMessage('✅ Medical record added successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadFiles([]);
    setRecordType('');
    setRecordDate('');
    setRecordNotes('');
    setDiagnosis('');
    setOpDoctor('');
    setOpDept('');
    setVisitType('');
    setBp('');
    setHeartRate('');
    setTemp('');
    setOxygen('');
    setShowOPDetails(false);
  };

  const handleViewFile = (record, file) => {
    setSelectedRecord(record);
    setSelectedFile(file);
    setShowViewModal(true);
  };

  const handleDeleteRecord = async (recordId) => {
    if (!selectedPatient) return;
    
    if (window.confirm('Are you sure you want to delete this record? This cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.delete(`${API_URL}/medical-records/cloudinary/${recordId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          // Refresh records
          await loadPatientRecords(selectedPatient.userId || selectedPatient._id);
          setSuccessMessage('✅ Record deleted successfully');
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          throw new Error(response.data.message || 'Delete failed');
        }
      } catch (error) {
        console.error('Delete error:', error);
        setError('Failed to delete record');
      }
    }
  };

  const handleDownloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.cloudinaryUrl || file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter records based on search and filter
  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || record.type === filter;
    
    return matchesSearch && matchesFilter;
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
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFileAlt className="text-gray-400" />;
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <FaFilePdf className="text-red-500" size={16} />;
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return <FaFileImage className="text-blue-500" size={16} />;
    return <FaFileAlt className="text-gray-500" size={16} />;
  };

  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const ext = fileName.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001b38] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-cyan-400 font-bold text-sm tracking-widest uppercase">Loading Medical Records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] pb-20 overflow-x-hidden" style={{ fontFamily: '"Inter", sans-serif' }}>
      
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in fade-in duration-300">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in fade-in duration-300">
          {error}
        </div>
      )}

      {/* HERO DASHBOARD */}
      <div className="bg-[#001b38] pt-24 pb-40 px-6 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border border-cyan-500/30">
              Medical Records Management (MongoDB)
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none mb-6" style={{ fontFamily: '"Montserrat", sans-serif' }}>
            Patient <span className="text-cyan-400">Records</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg max-w-2xl">
            Manage patient medical records stored securely in MongoDB with Cloudinary file storage.
          </p>
          
          {currentDoctor && (
            <div className="mt-4 flex items-center gap-4 text-sm text-cyan-400">
              <span className="flex items-center gap-2"><FaUserCircle size={16} /> Dr. {currentDoctor.name}</span>
              <span className="text-slate-500">|</span>
              <span className="flex items-center gap-2"><FaIdCard size={16} /> ID: {currentDoctor.userId || currentDoctor._id}</span>
            </div>
          )}
          
          {/* Patient Selection Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center">
                  <FaUsers className="text-cyan-400" size={28} />
                </div>
                <div>
                  <p className="text-sm text-cyan-400 font-bold uppercase">Selected Patient</p>
                  {selectedPatient ? (
                    <div>
                      <p className="text-white font-black text-xl">{selectedPatient.name}</p>
                      <p className="text-slate-400 text-sm">ID: {selectedPatient.userId || selectedPatient._id}</p>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-lg">No patient selected</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowPatientSelectModal(true)}
                className="bg-cyan-400 text-[#001b38] px-8 py-4 rounded-xl font-black text-xs hover:bg-cyan-300 transition-all flex items-center gap-3"
              >
                <FaUsers size={16} />
                {selectedPatient ? 'CHANGE PATIENT' : 'SELECT PATIENT'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        <Activity className="absolute -bottom-20 -left-10 text-white/5 w-96 h-96" />
      </div>

      {/* STATS CARDS - Only show if patient selected */}
      {selectedPatient && (
        <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Records", val: stats.totalRecords, icon: <FaFileMedical className="text-white" />, bg: "bg-cyan-500" },
            { label: "Lab Reports", val: stats.labReports, icon: <FaClipboardList className="text-white" />, bg: "bg-blue-500" },
            { label: "X-Rays & Scans", val: stats.xrays, icon: <FaFileImage className="text-white" />, bg: "bg-purple-500" },
            { label: "Prescriptions", val: stats.prescriptions, icon: <FaPrescriptionBottle className="text-white" />, bg: "bg-emerald-500" }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -5 }} 
              className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-100"
            >
              <div className={`${item.bg} p-4 rounded-xl shadow-lg`}>{item.icon}</div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                <p className="text-2xl font-black text-[#001b38]" style={{ fontFamily: '"Montserrat", sans-serif' }}>{item.val}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Search and Filter Section - Only show if patient selected */}
      {selectedPatient && (
        <div className="max-w-7xl mx-auto px-6 mt-8">
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search records by diagnosis, type, doctor or notes..." 
                  className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-[#001b38] focus:ring-2 focus:ring-cyan-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <button 
                onClick={() => setShowUploadModal(true)}
                className="bg-cyan-400 text-[#001b38] px-8 py-4 rounded-2xl font-black text-xs hover:bg-cyan-300 transition-all flex items-center gap-3 whitespace-nowrap"
              >
                <FaUpload size={16} />
                ADD NEW RECORD
              </button>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-4 bg-slate-100 text-[#001b38] rounded-2xl font-black text-xs hover:bg-slate-200 transition-all flex items-center gap-3"
              >
                <FaFilter size={16} />
                {showFilters ? 'HIDE' : 'FILTER'}
              </button>
            </div>
            
            {/* Filter tabs */}
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-slate-100"
                >
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {recordTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${
                          filter === type 
                            ? 'bg-cyan-400 text-[#001b38]' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {type === 'all' ? 'All Records' : type}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-6 lg:px-20 mt-8 relative z-20">
        {!selectedPatient ? (
          <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-xl">
            <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaUsers className="text-slate-400" size={48} />
            </div>
            <h3 className="text-2xl font-black text-[#001b38] mb-2">Select a Patient</h3>
            <p className="text-slate-400 mb-6">Choose a patient to view or add medical records</p>
            <button 
              onClick={() => setShowPatientSelectModal(true)}
              className="bg-cyan-400 text-[#001b38] px-8 py-4 rounded-full font-black text-xs tracking-widest uppercase hover:bg-cyan-300 transition-all inline-flex items-center gap-2"
            >
              <FaUsers size={18} /> SELECT PATIENT
            </button>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-xl">
            <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaFileMedical className="text-slate-400" size={48} />
            </div>
            <h3 className="text-2xl font-black text-[#001b38] mb-2">No Records Found</h3>
            <p className="text-slate-400 mb-6">
              {searchTerm ? 'Try different search terms' : 'No medical records for this patient in MongoDB'}
            </p>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="bg-cyan-400 text-[#001b38] px-8 py-4 rounded-full font-black text-xs tracking-widest uppercase hover:bg-cyan-300 transition-all inline-flex items-center gap-2"
            >
              <FaUpload size={18} /> ADD FIRST RECORD
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRecords.map((record) => (
              <motion.div
                key={record._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-[#001b38] to-[#002b4e] p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-cyan-500 rounded-2xl flex items-center justify-center">
                        {record.type === 'X-Ray' || record.type === 'MRI' || record.type === 'CT Scan' ? (
                          <FaFileImage size={28} className="text-white" />
                        ) : record.type === 'Prescription' ? (
                          <FaPrescriptionBottle size={28} className="text-white" />
                        ) : (
                          <FaFileMedical size={28} className="text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-black">{record.diagnosis}</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-300 mt-1">
                          <span className="flex items-center gap-1"><FaCalendarAlt size={12} /> {formatDate(record.date)}</span>
                          <span className="flex items-center gap-1"><FaStethoscope size={12} /> {record.doctor}</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-[10px] font-black uppercase border border-cyan-500/30">
                      {record.type}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Doctor ID */}
                  <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Uploaded By</p>
                    <p className="font-bold text-[#001b38] text-sm">{record.uploadedBy || record.doctor}</p>
                  </div>

                  {/* OP Details */}
                  {record.opDetails && (
                    <div className="mb-4">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                        <FaHeartbeat size={12} className="text-cyan-500" />
                        VITAL SIGNS
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {record.opDetails.bp && (
                          <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                            <p className="text-[8px] font-black text-rose-600 uppercase">BP</p>
                            <p className="font-bold text-[#001b38]">{record.opDetails.bp}</p>
                          </div>
                        )}
                        {record.opDetails.heartRate && (
                          <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                            <p className="text-[8px] font-black text-red-600 uppercase">HR</p>
                            <p className="font-bold text-[#001b38]">{record.opDetails.heartRate}</p>
                          </div>
                        )}
                        {record.opDetails.temp && (
                          <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                            <p className="text-[8px] font-black text-orange-600 uppercase">TEMP</p>
                            <p className="font-bold text-[#001b38]">{record.opDetails.temp}°F</p>
                          </div>
                        )}
                        {record.opDetails.oxygen && (
                          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-[8px] font-black text-blue-600 uppercase">O2</p>
                            <p className="font-bold text-[#001b38]">{record.opDetails.oxygen}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Files */}
                  {record.files && record.files.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                        <FaFileAlt size={12} className="text-cyan-500" />
                        ATTACHMENTS ({record.files.length})
                      </p>
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                        {record.files.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              {getFileIcon(file.name)}
                              <span className="text-xs font-bold text-slate-600 truncate max-w-[150px]">
                                {file.name}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleViewFile(record, file)}
                                className="p-1.5 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-all"
                                title="View"
                              >
                                <FaEye size={12} />
                              </button>
                              <button
                                onClick={() => handleDownloadFile(file)}
                                className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
                                title="Download"
                              >
                                <FaDownload size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {record.notes && (
                    <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2">NOTES</p>
                      <p className="text-sm text-slate-700">{record.notes}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="pt-4 border-t border-dashed border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-black text-cyan-600 tracking-widest uppercase">
                      MongoDB ID: {record._id?.slice(-8)}
                    </span>
                    <button 
                      onClick={() => handleDeleteRecord(record._id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* --- PATIENT SELECT MODAL --- */}
      <AnimatePresence>
        {showPatientSelectModal && (
          <div className="fixed inset-0 bg-[#001b38]/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#001b38] w-full max-w-2xl rounded-[40px] border border-cyan-500/30 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-8 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Select Patient</h2>
                    <p className="text-cyan-100 text-sm mt-2">Choose a patient to manage records (from MongoDB)</p>
                  </div>
                  <button onClick={() => setShowPatientSelectModal(false)} className="p-3 hover:bg-white/10 rounded-xl transition-all">
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>

              <div className="p-8 overflow-y-auto space-y-3 flex-1">
                {patients.length === 0 ? (
                  <div className="text-center py-12">
                    <FaUsers className="mx-auto text-slate-500 mb-4" size={48} />
                    <p className="text-white font-bold">No patients found</p>
                  </div>
                ) : (
                  patients.map((patient) => (
                    <button
                      key={patient._id || patient.userId}
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowPatientSelectModal(false);
                      }}
                      className="w-full bg-white/5 hover:bg-cyan-500/10 border border-white/10 rounded-2xl p-6 text-left transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                          <FaUserCircle className="text-cyan-400" size={32} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-black text-lg">{patient.name}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm">
                            <span className="text-cyan-400 text-xs flex items-center gap-1">
                              <FaIdCard size={12} /> ID: {patient.userId || patient._id}
                            </span>
                            {patient.email && (
                              <span className="text-slate-400 text-xs flex items-center gap-1">
                                <FaEnvelope size={12} /> {patient.email}
                              </span>
                            )}
                          </div>
                        </div>
                        <FaChevronRight className="text-slate-500 group-hover:text-cyan-400 transition-colors" size={20} />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- UPLOAD MODAL --- */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-[#001b38]/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-[#001b38] w-full max-w-2xl rounded-[40px] border border-cyan-500/30 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-8 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Add Medical Record</h2>
                    <p className="text-cyan-100 text-sm mt-2">for {selectedPatient?.name} (Saves to MongoDB)</p>
                  </div>
                  <button onClick={() => setShowUploadModal(false)} className="p-3 hover:bg-white/10 rounded-xl transition-all">
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>

              <div className="p-8 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                {/* Patient Info Summary */}
                <div className="bg-cyan-500/10 rounded-2xl p-4 border border-cyan-500/20">
                  <p className="text-cyan-400 text-xs font-bold mb-1">SELECTED PATIENT</p>
                  <p className="text-white font-black">{selectedPatient?.name}</p>
                  <p className="text-slate-400 text-xs">ID: {selectedPatient?.userId || selectedPatient?._id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/50 uppercase ml-1">Record Type *</label>
                    <select 
                      value={recordType}
                      onChange={(e) => setRecordType(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-cyan-400"
                    >
                      <option value="" className="bg-[#001b38]">Select type</option>
                      <option value="Lab Report" className="bg-[#001b38]">🧪 Lab Report</option>
                      <option value="X-Ray" className="bg-[#001b38]">🦴 X-Ray</option>
                      <option value="MRI" className="bg-[#001b38]">🧠 MRI Scan</option>
                      <option value="CT Scan" className="bg-[#001b38]">📊 CT Scan</option>
                      <option value="Prescription" className="bg-[#001b38]">📝 Prescription</option>
                      <option value="Checkup" className="bg-[#001b38]">🏥 Checkup</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/50 uppercase ml-1">Record Date *</label>
                    <input 
                      type="date" 
                      value={recordDate}
                      onChange={(e) => setRecordDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-cyan-400" 
                    />
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase ml-1">Diagnosis</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Acute Bronchitis"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-cyan-400"
                  />
                </div>

                {/* OP DETAILS */}
                <div className="bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden">
                  <div 
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
                    onClick={() => setShowOPDetails(!showOPDetails)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                        <FaHeartbeat className="text-cyan-400" size={20} />
                      </div>
                      <div>
                        <span className="text-sm font-black text-white uppercase tracking-wider">Vitals & OP Details</span>
                        <span className="text-[10px] text-cyan-400/60 font-bold block">BP, Heart Rate, Temperature</span>
                      </div>
                    </div>
                    <button className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${showOPDetails ? 'bg-rose-500/10 text-rose-500' : 'bg-cyan-400 text-[#001b38]'}`}>
                      {showOPDetails ? 'REMOVE' : '+ ADD'}
                    </button>
                  </div>

                  {showOPDetails && (
                    <div className="p-6 pt-0 space-y-5 border-t border-white/5 mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-cyan-400 uppercase">Doctor</label>
                          <input 
                            type="text" 
                            value={opDoctor} 
                            onChange={(e)=>setOpDoctor(e.target.value)} 
                            placeholder="Dr. Name" 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-cyan-400 uppercase">Department</label>
                          <input 
                            type="text" 
                            value={opDept} 
                            onChange={(e)=>setOpDept(e.target.value)} 
                            placeholder="Cardiology" 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-cyan-400 uppercase">Visit Type</label>
                          <select 
                            value={visitType} 
                            onChange={(e)=>setVisitType(e.target.value)} 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none"
                          >
                            <option value="">Select</option>
                            <option value="OP">OP</option>
                            <option value="Emergency">Emergency</option>
                            <option value="Follow-up">Follow-up</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-cyan-400 uppercase">BP</label>
                          <input 
                            type="text" 
                            value={bp} 
                            onChange={(e)=>setBp(e.target.value)} 
                            placeholder="120/80" 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-cyan-400 uppercase">Heart Rate</label>
                          <input 
                            type="text" 
                            value={heartRate} 
                            onChange={(e)=>setHeartRate(e.target.value)} 
                            placeholder="72" 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-cyan-400 uppercase">Temp (°F)</label>
                          <input 
                            type="text" 
                            value={temp} 
                            onChange={(e)=>setTemp(e.target.value)} 
                            placeholder="98.6" 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-cyan-400 uppercase">Oxygen (%)</label>
                          <input 
                            type="text" 
                            value={oxygen} 
                            onChange={(e)=>setOxygen(e.target.value)} 
                            placeholder="98" 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none" 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase ml-1">Notes (Optional)</label>
                  <textarea
                    value={recordNotes}
                    onChange={(e) => setRecordNotes(e.target.value)}
                    placeholder="Additional notes..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-cyan-400"
                    rows="3"
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase ml-1">Upload Files * ({uploadFiles.length} selected)</label>
                  <div className="border-2 border-dashed border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center justify-center hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-all relative">
                    <FaUpload size={32} className="text-cyan-400 mb-2" />
                    <p className="text-white font-black text-xs text-center">
                      Drop files or <span className="text-cyan-400 underline">browse</span>
                    </p>
                    <p className="text-slate-500 text-[8px] font-bold mt-1">
                      Images (JPG, PNG) and PDF (Max 50MB) - Stored in Cloudinary
                    </p>
                    <input 
                      type="file" 
                      multiple 
                      accept=".jpg,.jpeg,.png,.gif,.pdf"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => setUploadFiles(Array.from(e.target.files))}
                    />
                    {uploadFiles.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2 justify-center max-h-24 overflow-y-auto">
                        {uploadFiles.map((f, i) => (
                          <span key={i} className="bg-cyan-400/10 text-cyan-400 px-3 py-1 rounded-lg text-[9px] font-black">
                            {f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-slate-900/50 flex gap-4">
                <button 
                  onClick={() => setShowUploadModal(false)} 
                  className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-black text-sm hover:bg-white/10 transition-all"
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleUploadSubmit}
                  disabled={isUploading}
                  className="flex-1 py-4 bg-cyan-400 text-[#001b38] rounded-2xl font-black text-sm hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? <FaSyncAlt className="animate-spin" size={18} /> : <FaUpload size={18} />}
                  {isUploading ? 'UPLOADING...' : 'SAVE TO MONGODB'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- VIEW FILE MODAL --- */}
      <AnimatePresence>
        {showViewModal && selectedFile && (
          <div className="fixed inset-0 bg-[#001b38]/80 backdrop-blur-xl flex items-center justify-center z-[60] p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#001b38] w-full max-w-4xl rounded-[40px] border border-cyan-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {getFileIcon(selectedFile.name)}
                    <div>
                      <h2 className="text-xl font-black">{selectedFile.name}</h2>
                      <p className="text-cyan-100 text-sm">
                        {(selectedFile.size / 1024).toFixed(1)} KB • {selectedRecord?.patientName || selectedPatient?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDownloadFile(selectedFile)}
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                      title="Download"
                    >
                      <FaDownload size={20} />
                    </button>
                    <button 
                      onClick={() => setShowViewModal(false)} 
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                    >
                      <FaTimes size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-[#1a1f2e]">
                {selectedFile.fileType === 'image' || isImageFile(selectedFile.name) ? (
                  <div className="flex justify-center">
                    <img 
                      src={selectedFile.cloudinaryUrl || selectedFile.data} 
                      alt={selectedFile.name}
                      className="max-w-full max-h-[70vh] object-contain rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-2xl p-12 text-center">
                    <FaFilePdf size={64} className="mx-auto text-red-400 mb-4" />
                    <p className="text-white font-bold mb-4">PDF Document - Stored in Cloudinary</p>
                    <button
                      onClick={() => handleDownloadFile(selectedFile)}
                      className="bg-cyan-400 text-[#001b38] px-8 py-4 rounded-xl font-black hover:bg-cyan-300 transition-all inline-flex items-center gap-2"
                    >
                      <FaDownload size={18} /> DOWNLOAD PDF
                    </button>
                    <p className="text-slate-400 text-xs mt-4">
                      Cloudinary URL: {selectedFile.cloudinaryUrl?.substring(0, 50)}...
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(45, 212, 191, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(45, 212, 191, 0.5);
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-in {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default DocMedicalrecords;