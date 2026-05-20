// MedicalRecordsPage.jsx - WITHOUT ATTACH TO APPOINTMENTS (No Icons, Pure Text)
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

const MedicalRecordsPage = () => {
  // --- STATES ---
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [recordType, setRecordType] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [recordNotes, setRecordNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showOPDetails, setShowOPDetails] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingFileId, setDownloadingFileId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedFileState, setSelectedFileState] = useState(null);

  // OP Details States
  const [opDoctor, setOpDoctor] = useState('');
  const [opDept, setOpDept] = useState('');
  const [visitType, setVisitType] = useState('');
  const [bp, setBp] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temp, setTemp] = useState('');
  const [oxygen, setOxygen] = useState('');

  // Edit form states
  const [editDiagnosis, setEditDiagnosis] = useState('');
  const [editRecordDate, setEditRecordDate] = useState('');
  const [editRecordType, setEditRecordType] = useState('');
  const [editRecordNotes, setEditRecordNotes] = useState('');
  const [editOpDoctor, setEditOpDoctor] = useState('');
  const [editOpDept, setEditOpDept] = useState('');
  const [editVisitType, setEditVisitType] = useState('');
  const [editBp, setEditBp] = useState('');
  const [editHeartRate, setEditHeartRate] = useState('');
  const [editTemp, setEditTemp] = useState('');
  const [editOxygen, setEditOxygen] = useState('');

  // Helper functions
  const getAuthToken = () => localStorage.getItem('token');

  const getProperCloudinaryUrl = (url, fileType) => {
    if (!url) return url;
    try {
      let processedUrl = url;
      if (fileType === 'pdf') {
        if (processedUrl.includes('/upload/')) {
          processedUrl = processedUrl.replace('/upload/', '/raw/upload/');
        }
        processedUrl = processedUrl.replace(/\/fl_attachment\//g, '/');
        if (processedUrl.includes('/raw/upload/')) {
          const parts = processedUrl.split('/raw/upload/');
          processedUrl = parts[0] + '/raw/upload/fl_attachment/' + parts[1];
        }
      }
      return processedUrl;
    } catch (error) {
      return url;
    }
  };

  const fetchPdfAsBlob = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Failed to fetch PDF:', error);
      return null;
    }
  };

  // Load data
  useEffect(() => {
    const init = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        setCurrentUser(user);
        
        const userId = user?.userId || user?.id || user?._id;
        if (userId) {
          await loadMedicalRecords(userId);
        }
      } catch (error) {
        console.error('Error initializing:', error);
        setError('Failed to load records');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const loadMedicalRecords = async (userId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Please login to view records');
        setMedicalRecords([]);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/medical-records/${userId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        setTimeout(() => window.location.href = '/login', 2000);
        return;
      }
      
      const result = await response.json();
      if (result.success) {
        setMedicalRecords(result.data || []);
        setError(null);
      } else {
        setError(result.message || 'Failed to load records');
        setMedicalRecords([]);
      }
    } catch (error) {
      console.error('Error loading records:', error);
      setError('Network error loading records');
      setMedicalRecords([]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!recordDate || !recordType || uploadFiles.length === 0) {
      alert('Please fill required fields and select files');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Authentication token not found. Please login again.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('userId', currentUser?.userId || currentUser?.id || currentUser?._id);
      formData.append('userEmail', currentUser?.email || '');
      formData.append('userName', currentUser?.name || '');
      formData.append('date', recordDate);
      formData.append('type', recordType);
      formData.append('diagnosis', diagnosis || recordType);
      formData.append('doctor', opDoctor || 'Self-uploaded');
      formData.append('notes', recordNotes);
      
      if (showOPDetails) {
        formData.append('opDetails', JSON.stringify({
          opDoctor: opDoctor || '',
          opDept: opDept || '',
          visitType: visitType || '',
          bp: bp || '',
          heartRate: heartRate || '',
          temp: temp || '',
          oxygen: oxygen || ''
        }));
      }

      uploadFiles.forEach((file) => formData.append('files', file));

      const response = await fetch(`${API_BASE_URL}/medical-records/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setMedicalRecords([result.data, ...medicalRecords]);
        setShowUploadModal(false);
        resetUploadForm();
        setSuccessMessage('Medical record uploaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(`Upload failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Network error during upload');
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

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setEditDiagnosis(record.diagnosis || '');
    setEditRecordDate(record.date || '');
    setEditRecordType(record.type || '');
    setEditRecordNotes(record.notes || '');
    
    if (record.opDetails) {
      const opDetails = typeof record.opDetails === 'string' ? JSON.parse(record.opDetails) : record.opDetails;
      setEditOpDoctor(opDetails.opDoctor || '');
      setEditOpDept(opDetails.opDept || '');
      setEditVisitType(opDetails.visitType || '');
      setEditBp(opDetails.bp || '');
      setEditHeartRate(opDetails.heartRate || '');
      setEditTemp(opDetails.temp || '');
      setEditOxygen(opDetails.oxygen || '');
    }
    setShowEditModal(true);
  };

  const handleUpdateRecord = async () => {
    if (!editingRecord) return;
    
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const updateData = {
        diagnosis: editDiagnosis,
        date: editRecordDate,
        type: editRecordType,
        notes: editRecordNotes,
        opDetails: {
          opDoctor: editOpDoctor,
          opDept: editOpDept,
          visitType: editVisitType,
          bp: editBp,
          heartRate: editHeartRate,
          temp: editTemp,
          oxygen: editOxygen
        }
      };
      
      const response = await fetch(`${API_BASE_URL}/medical-records/${editingRecord._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMedicalRecords(medicalRecords.map(r => r._id === editingRecord._id ? { ...r, ...updateData } : r));
        setShowEditModal(false);
        setEditingRecord(null);
        setSuccessMessage('Record updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Update error:', error);
      setError('Network error updating record');
    }
  };

  const handleViewFile = async (record, file) => {
    setSelectedRecord(record);
    setSelectedFileState(file);
    
    if (file.fileType === 'pdf') {
      const pdfUrl = getProperCloudinaryUrl(file.cloudinaryUrl || file.data, 'pdf');
      const blobUrl = await fetchPdfAsBlob(pdfUrl);
      if (blobUrl) {
        if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl(blobUrl);
      }
    }
    setShowViewModal(true);
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record? This cannot be undone.')) return;
    
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/medical-records/cloudinary/${recordId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        setMedicalRecords(medicalRecords.filter(r => r._id !== recordId));
        setSuccessMessage('Record deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Network error deleting record');
    }
  };

  const handleDownloadFile = async (file) => {
    setDownloadingFileId(file.id);
    let originalUrl = file.cloudinaryUrl || file.data;
    
    let finalUrl = originalUrl;
    if (file.fileType === 'pdf') {
      if (finalUrl.includes('/upload/') && !finalUrl.includes('/raw/upload/')) {
        finalUrl = finalUrl.replace('/upload/', '/raw/upload/');
      }
      finalUrl = finalUrl.replace(/\/fl_attachment\//g, '/');
      if (finalUrl.includes('/raw/upload/')) {
        const parts = finalUrl.split('/raw/upload/');
        finalUrl = parts[0] + '/raw/upload/fl_attachment/' + parts[1];
      }
    }
    
    try {
      const response = await fetch(finalUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      setSuccessMessage(`${file.name} downloaded`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file');
    } finally {
      setDownloadingFileId(null);
    }
  };

  // Calculate stats
  const totalRecords = medicalRecords.length;
  const labReports = medicalRecords.filter(r => r.type === 'Lab Report').length;
  const scans = medicalRecords.filter(r => ['X-Ray', 'MRI', 'CT Scan'].includes(r.type)).length;
  const prescriptions = medicalRecords.filter(r => r.type === 'Prescription').length;

  // Filter records
  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || record.type === filter;
    return matchesSearch && matchesFilter;
  });

  const recordTypes = ['all', 'Lab Report', 'X-Ray', 'MRI', 'CT Scan', 'Prescription', 'Checkup'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your health records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Success Alert */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-500 text-white px-5 py-3 rounded-lg shadow-xl text-sm font-medium">
          {successMessage}
          <button onClick={() => setSuccessMessage(null)} className="ml-4 text-white/80 hover:text-white">×</button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="fixed top-20 right-4 z-50 bg-rose-500 text-white px-5 py-3 rounded-lg shadow-xl text-sm font-medium">
          {error}
          <button onClick={() => setError(null)} className="ml-4 text-white/80 hover:text-white">×</button>
        </div>
      )}

      {/* Hero Section - Pure Text */}
      <div className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block bg-white/10 rounded-full px-4 py-1 text-sm font-medium mb-4">
            Secure Medical Storage
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Medical <span className="text-teal-400">Health Vault</span>
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto mb-8">
            Store, manage, and access all your medical records securely in one place.
            Upload reports, prescriptions, and scan results easily.
          </p>
          
       
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Search & Upload Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Search by diagnosis, doctor, or record type..." 
              className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-teal-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              onClick={() => setShowUploadModal(true)}
              className="bg-teal-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-600 transition"
            >
              + Upload Record
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-5 overflow-x-auto pb-2">
            {recordTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  filter === type 
                    ? 'bg-teal-500 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'all' ? 'All Records' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Records Grid */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-md">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Records Found</h3>
            <p className="text-slate-400 mb-6">
              {searchTerm ? 'Try different search terms' : 'Upload your first medical record'}
            </p>
            {!searchTerm && (
              <button 
                onClick={() => setShowUploadModal(true)}
                className="bg-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-600"
              >
                + Upload First Record
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map((record) => {
              const recordFiles = record.files || [];
              
              return (
                <div key={record._id} className="bg-white rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-5 border-b border-teal-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{record.diagnosis || record.type}</h3>
                        <p className="text-xs text-teal-600 font-medium uppercase mt-1">{record.type}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditRecord(record)}
                          className="px-3 py-1 bg-white/70 rounded-lg text-sm text-slate-600 hover:bg-white transition"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteRecord(record._id)}
                          className="px-3 py-1 bg-white/70 rounded-lg text-sm text-rose-600 hover:bg-white transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    {/* Doctor Info */}
                    <div className="mb-3 pb-2 border-b border-slate-100">
                      <div className="text-xs text-slate-400 uppercase mb-1">Doctor</div>
                      <div className="font-medium text-slate-700">{record.doctor || 'Self-uploaded'}</div>
                    </div>

                    {/* Date */}
                    <div className="mb-3 pb-2 border-b border-slate-100">
                      <div className="text-xs text-slate-400 uppercase mb-1">Date</div>
                      <div className="font-medium text-slate-700">{record.date}</div>
                    </div>

                    {/* Notes */}
                    {record.notes && (
                      <div className="mb-3 pb-2 border-b border-slate-100">
                        <div className="text-xs text-slate-400 uppercase mb-1">Notes</div>
                        <div className="text-sm text-slate-600 line-clamp-2">{record.notes}</div>
                      </div>
                    )}

                    {/* OP Details */}
                    {record.opDetails && (() => {
                      const op = typeof record.opDetails === 'string' ? JSON.parse(record.opDetails) : record.opDetails;
                      if (op.opDoctor || op.bp) {
                        return (
                          <div className="mb-3 pb-2 border-b border-slate-100">
                            <div className="text-xs text-slate-400 uppercase mb-1">Consultation Details</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {op.opDoctor && <div><span className="text-slate-500">Doctor:</span> {op.opDoctor}</div>}
                              {op.opDept && <div><span className="text-slate-500">Dept:</span> {op.opDept}</div>}
                              {op.visitType && <div><span className="text-slate-500">Type:</span> {op.visitType}</div>}
                              {op.bp && <div><span className="text-slate-500">BP:</span> {op.bp}</div>}
                              {op.heartRate && <div><span className="text-slate-500">HR:</span> {op.heartRate}</div>}
                              {op.temp && <div><span className="text-slate-500">Temp:</span> {op.temp}°F</div>}
                              {op.oxygen && <div><span className="text-slate-500">O₂:</span> {op.oxygen}%</div>}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Files Section */}
                    {recordFiles.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-slate-400 uppercase mb-2">Attached Files ({recordFiles.length})</div>
                        <div className="flex flex-wrap gap-2">
                          {recordFiles.map((file, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleViewFile(record, file)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 rounded-lg text-xs text-slate-600 transition"
                            >
                              {file.name.substring(0, 25)}{file.name.length > 25 ? '...' : ''}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Edit Button at bottom */}
                    <div className="pt-3 border-t border-dashed border-slate-200">
                      <button
                        onClick={() => handleEditRecord(record)}
                        className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
                      >
                        Edit Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowUploadModal(false)}></div>
          
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-5 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Upload Medical Record</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 text-2xl hover:text-slate-600">×</button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Record Type *</label>
                <select 
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-700 outline-none focus:border-teal-400"
                >
                  <option value="">Select type</option>
                  <option value="Lab Report">Lab Report</option>
                  <option value="X-Ray">X-Ray</option>
                  <option value="MRI">MRI Scan</option>
                  <option value="CT Scan">CT Scan</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Checkup">General Checkup</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Record Date *</label>
                <input 
                  type="date" 
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-700 outline-none focus:border-teal-400" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Diagnosis / Title *</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g., Acute Bronchitis"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-700 outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={opDoctor}
                  onChange={(e) => setOpDoctor(e.target.value)}
                  placeholder="Dr. Name (Optional)"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-700 outline-none focus:border-teal-400"
                />
              </div>

              {/* OP Details Toggle */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button 
                  className="w-full p-3 text-left font-medium bg-slate-50 hover:bg-slate-100 flex justify-between items-center"
                  onClick={() => setShowOPDetails(!showOPDetails)}
                >
                  <span>Add Consultation Details (Optional)</span>
                  <span>{showOPDetails ? '−' : '+'}</span>
                </button>

                {showOPDetails && (
                  <div className="p-3 space-y-3 border-t border-slate-200">
                    <input type="text" value={opDept} onChange={(e)=>setOpDept(e.target.value)} placeholder="Department" className="w-full border rounded-lg px-3 py-2 text-sm" />
                    <select value={visitType} onChange={(e)=>setVisitType(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                      <option value="">Visit Type</option>
                      <option value="OP">OP Consultation</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Follow-up">Follow-up</option>
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={bp} onChange={(e)=>setBp(e.target.value)} placeholder="BP (120/80)" className="border rounded-lg px-3 py-2 text-sm" />
                      <input type="text" value={heartRate} onChange={(e)=>setHeartRate(e.target.value)} placeholder="Heart Rate" className="border rounded-lg px-3 py-2 text-sm" />
                      <input type="text" value={temp} onChange={(e)=>setTemp(e.target.value)} placeholder="Temperature (°F)" className="border rounded-lg px-3 py-2 text-sm" />
                      <input type="text" value={oxygen} onChange={(e)=>setOxygen(e.target.value)} placeholder="Oxygen (%)" className="border rounded-lg px-3 py-2 text-sm" />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Notes</label>
                <textarea
                  value={recordNotes}
                  onChange={(e) => setRecordNotes(e.target.value)}
                  placeholder="Add symptoms, observations..."
                  rows="3"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-600 text-sm outline-none focus:border-teal-400 resize-none"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Upload Files * ({uploadFiles.length})</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-teal-400 transition cursor-pointer relative">
                  <p className="text-slate-500 mb-1">Click or drag files to upload</p>
                  <p className="text-slate-400 text-xs">PDF, JPG, PNG (Max 50MB)</p>
                  <input 
                    type="file" 
                    multiple 
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setUploadFiles(Array.from(e.target.files))}
                  />
                  {uploadFiles.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 justify-center">
                      {uploadFiles.map((f, i) => (
                        <span key={i} className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs">
                          {f.name.substring(0, 25)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white p-5 border-t border-slate-200 flex gap-3">
              <button onClick={() => setShowUploadModal(false)} className="flex-1 py-2.5 bg-slate-100 rounded-lg font-medium hover:bg-slate-200">
                Cancel
              </button>
              <button onClick={handleUploadSubmit} disabled={isUploading} className="flex-1 py-2.5 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 disabled:opacity-50">
                {isUploading ? 'Uploading...' : 'Save Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditModal(false)}></div>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Edit Record</h2>
              <button onClick={() => setShowEditModal(false)} className="text-2xl">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Type</label>
                <select value={editRecordType} onChange={(e)=>setEditRecordType(e.target.value)} className="w-full border rounded-lg px-4 py-2 mt-1">
                  <option value="Lab Report">Lab Report</option>
                  <option value="X-Ray">X-Ray</option>
                  <option value="MRI">MRI</option>
                  <option value="CT Scan">CT Scan</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Checkup">Checkup</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Date</label>
                <input type="date" value={editRecordDate} onChange={(e)=>setEditRecordDate(e.target.value)} className="w-full border rounded-lg px-4 py-2 mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Diagnosis</label>
                <input type="text" value={editDiagnosis} onChange={(e)=>setEditDiagnosis(e.target.value)} className="w-full border rounded-lg px-4 py-2 mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Doctor</label>
                <input type="text" value={editOpDoctor} onChange={(e)=>setEditOpDoctor(e.target.value)} className="w-full border rounded-lg px-4 py-2 mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Notes</label>
                <textarea value={editRecordNotes} onChange={(e)=>setEditRecordNotes(e.target.value)} rows="2" className="w-full border rounded-lg px-4 py-2 mt-1 resize-none" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-200 flex gap-3">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-2 bg-slate-100 rounded-lg font-medium">Cancel</button>
              <button onClick={handleUpdateRecord} className="flex-1 py-2 bg-teal-500 text-white rounded-lg font-medium">Update</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW FILE MODAL */}
      {showViewModal && selectedFileState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => {
            setShowViewModal(false);
            if (pdfBlobUrl) { URL.revokeObjectURL(pdfBlobUrl); setPdfBlobUrl(null); }
          }}></div>
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl relative z-10 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <span className="font-medium">{selectedFileState.name}</span>
              <div className="flex gap-2">
                <button onClick={() => handleDownloadFile(selectedFileState)} className="px-3 py-1 bg-teal-50 rounded-lg text-teal-600">Download</button>
                <button onClick={() => setShowViewModal(false)} className="px-3 py-1 bg-slate-100 rounded-lg">Close</button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex-1 min-h-[500px] bg-slate-100">
              {selectedFileState.fileType === 'image' ? (
                <img 
                  src={getProperCloudinaryUrl(selectedFileState.cloudinaryUrl || selectedFileState.data, 'image')} 
                  alt={selectedFileState.name} 
                  className="max-w-full max-h-[70vh] mx-auto rounded-lg shadow" 
                />
              ) : (
                pdfBlobUrl ? (
                  <object data={pdfBlobUrl} type="application/pdf" className="w-full h-[70vh] rounded-lg">
                    <div className="text-center py-20">
                      <p>PDF cannot be displayed</p>
                      <button onClick={() => window.open(pdfBlobUrl)} className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg">Open PDF</button>
                    </div>
                  </object>
                ) : (
                  <div className="flex items-center justify-center h-full py-20">
                    <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full"></div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default MedicalRecordsPage;