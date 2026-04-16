import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Plus, X, Stethoscope, 
  ChevronRight, Upload, Users, RefreshCw, 
  Filter, Calendar, Activity, Thermometer, Droplets,
  Clipboard, HeartPulse, Building2, User, Download,
  Eye, File, Image, FileIcon, Trash2, ZoomIn, AlertCircle, ExternalLink
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const MedicalRecordsPage = () => {
  // --- STATES ---
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [downloadingFileId, setDownloadingFileId] = useState(null);
  const [viewingFileId, setViewingFileId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');

  // OP Details States
  const [opDoctor, setOpDoctor] = useState('');
  const [opDept, setOpDept] = useState('');
  const [visitType, setVisitType] = useState('');
  const [bp, setBp] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temp, setTemp] = useState('');
  const [oxygen, setOxygen] = useState('');

  // Helper: Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Helper: Get headers with auth
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  // Cleanup blob URLs when modal closes
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  // Get current user and load medical records from server
  useEffect(() => {
    const init = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        setCurrentUser(user);
        
        const userId = user?.userId || user?.id;
        if (userId) {
          await loadMedicalRecords(userId);
        } else {
          setMedicalRecords([]);
        }
      } catch (error) {
        console.error('Error initializing:', error);
        setError('Failed to load records');
        setMedicalRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, []);

  // Load medical records from server
  const loadMedicalRecords = async (userId) => {
    try {
      console.log('📋 Loading medical records for userId:', userId);
      
      const token = getAuthToken();
      if (!token) {
        console.warn('⚠️ No auth token found');
        setError('Please login to view records');
        setMedicalRecords([]);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/medical-records/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 401) {
        console.error('❌ Authentication failed');
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Loaded', result.data?.length, 'records');
        setMedicalRecords(result.data || []);
        setError(null);
      } else {
        console.warn('⚠️ Failed to load records:', result.message);
        setError(result.message || 'Failed to load records');
        setMedicalRecords([]);
      }
    } catch (error) {
      console.error('Error loading records:', error);
      setError('Network error loading records');
      setMedicalRecords([]);
    }
  };

  // Get proper Cloudinary URL
  const getProperCloudinaryUrl = (url, fileType) => {
    if (!url) return url;
    
    try {
      let processedUrl = url;
      
      if (fileType === 'pdf') {
        if (processedUrl.includes('/upload/')) {
          processedUrl = processedUrl.replace('/upload/', '/raw/upload/');
        }
        processedUrl = processedUrl.replace(/\/fl_attachment\//g, '/');
        processedUrl = processedUrl.replace(/\/fl_attachment:/g, '/');
        
        if (processedUrl.includes('/raw/upload/')) {
          const parts = processedUrl.split('/raw/upload/');
          processedUrl = parts[0] + '/raw/upload/fl_attachment/' + parts[1];
        }
      }
      
      return processedUrl;
    } catch (error) {
      console.error('Error converting URL:', error);
      return url;
    }
  };

  // Fetch PDF as blob to avoid CORS/iframe issues
  const fetchPdfAsBlob = async (url) => {
    try {
      console.log('📥 Fetching PDF as blob:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      console.log('✅ PDF loaded as blob URL:', blobUrl);
      return blobUrl;
    } catch (error) {
      console.error('❌ Failed to fetch PDF:', error);
      return null;
    }
  };

  const handleUploadSubmit = async () => {
    if (!recordDate || !recordType || uploadFiles.length === 0) {
      alert('Please fill required fields and select files');
      return;
    }

    if (!currentUser) {
      alert('Please login to upload records');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Authentication token not found. Please login again.');
      return;
    }

    let totalSize = 0;
    for (const file of uploadFiles) {
      totalSize += file.size;
    }
    
    if (totalSize > 50 * 1024 * 1024) {
      if (!window.confirm(`Total file size is ${(totalSize / 1024 / 1024).toFixed(1)}MB. Large files may affect performance. Continue?`)) {
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('userId', currentUser?.userId || currentUser?.id);
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

      uploadFiles.forEach((file) => {
        formData.append('files', file);
      });

      console.log('📤 Uploading', uploadFiles.length, 'files...');
      console.log('🔑 Token exists:', !!token);

      const response = await fetch(`${API_BASE_URL}/medical-records/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 401) {
        const errorData = await response.json();
        console.error('❌ Authentication failed:', errorData.message);
        setError(`Authentication failed: ${errorData.message}. Please login again.`);
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      const result = await response.json();

      if (result.success) {
        console.log('✅ Upload successful');
        setMedicalRecords([result.data, ...medicalRecords]);

        setShowUploadModal(false);
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
        setError(null);
        setSuccessMessage('✅ Medical record uploaded successfully!');
        
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        console.error('❌ Upload failed:', result.message);
        setError(`Upload failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Network error during upload: ' + error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleViewFile = async (record, file) => {
    console.log('👁️ Viewing file:', file.name);
    setSelectedRecord(record);
    setSelectedFile(file);
    
    if (file.fileType === 'pdf') {
      setViewingFileId(file.id);
      const pdfUrl = getProperCloudinaryUrl(file.cloudinaryUrl || file.data, 'pdf');
      const blobUrl = await fetchPdfAsBlob(pdfUrl);
      if (blobUrl) {
        if (pdfBlobUrl) {
          URL.revokeObjectURL(pdfBlobUrl);
        }
        setPdfBlobUrl(blobUrl);
      }
      setViewingFileId(null);
    }
    
    setShowViewModal(true);
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this record? This cannot be undone.')) {
      try {
        console.log('🗑️ Deleting record:', recordId);
        
        const token = getAuthToken();
        if (!token) {
          setError('Authentication token not found. Please login again.');
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/medical-records/cloudinary/${recordId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401) {
          setError('Session expired. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }

        const result = await response.json();

        if (result.success) {
          console.log('✅ Record deleted successfully');
          setMedicalRecords(medicalRecords.filter(r => r._id !== recordId));
          setError(null);
          setSuccessMessage('✅ Record deleted successfully');
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          console.error('❌ Delete failed:', result.message);
          setError('Failed to delete record');
        }
      } catch (error) {
        console.error('Delete error:', error);
        setError('Network error deleting record');
      }
    }
  };

  const handleViewFileInTab = async (file) => {
    console.log('🔗 Opening file in new tab:', file.name);
    
    let originalUrl = file.cloudinaryUrl || file.data;
    
    if (!originalUrl) {
      console.error('❌ No URL available for file');
      alert('File URL not available');
      return;
    }
    
    let finalUrl = originalUrl;
    
    if (file.fileType === 'pdf') {
      if (finalUrl.includes('/upload/') && !finalUrl.includes('/raw/upload/')) {
        finalUrl = finalUrl.replace('/upload/', '/raw/upload/');
      }
      finalUrl = finalUrl.replace(/\/fl_attachment\//g, '/');
      finalUrl = finalUrl.replace(/\/fl_attachment:/g, '/');
      
      if (finalUrl.includes('/raw/upload/')) {
        const urlParts = finalUrl.split('/raw/upload/');
        finalUrl = urlParts[0] + '/raw/upload/fl_attachment/' + urlParts[1];
      }
    }
    
    console.log('✅ Final URL:', finalUrl);
    window.open(finalUrl, '_blank');
  };

  const handleDownloadFile = async (file) => {
    console.log('📥 Download requested for:', file.name);
    
    setDownloadingFileId(file.id);
    
    let originalUrl = file.cloudinaryUrl || file.data;
    
    if (!originalUrl) {
      console.error('❌ No URL available for file');
      alert('File URL not available');
      setDownloadingFileId(null);
      return;
    }
    
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
      
      setSuccessMessage(`✅ ${file.name} downloaded successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    } finally {
      setDownloadingFileId(null);
    }
  };

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
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto text-teal-400" size={48} />
          <p className="text-slate-600 mt-4">Loading your records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Plus_Jakarta_Sans'] pb-24">
      
      {/* Success Alert */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg animate-in fade-in duration-300">
          <span className="font-bold">{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="ml-4 text-white hover:text-emerald-200 transition-colors">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg animate-in fade-in duration-300">
          <AlertCircle size={20} />
          <span className="font-bold">{error}</span>
          <button onClick={() => setError(null)} className="ml-4 text-white hover:text-red-200 transition-colors">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      <section className="bg-[#0f172a] pt-24 pb-44 px-6 lg:px-20 relative rounded-b-[4rem]">
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-5xl font-black text-white mb-2">Medical <span className="text-teal-400">Vault</span></h1>
          <p className="text-slate-400 text-lg mb-6">Store and view all your medical records securely on Cloudinary</p>
          
          {currentUser && (
            <div className="mb-4 text-sm text-teal-400 font-bold">
              👤 Logged in as: <span className="text-white">{currentUser.name}</span>
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-4 items-center mt-10">
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 flex flex-1 w-full">
              <Search className="text-teal-400 ml-4" size={22} />
              <input 
                type="text" 
                placeholder="Search diagnosis or doctor..." 
                className="w-full bg-transparent border-none outline-none text-white px-4 py-3 placeholder-slate-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                onClick={() => {
                  if (!currentUser) {
                    alert('Please login to upload records');
                    return;
                  }
                  setShowUploadModal(true);
                }}
                className="bg-teal-400 text-[#0f172a] px-8 py-4 rounded-[1.5rem] font-black hover:bg-teal-300 transition-all flex items-center gap-2"
              >
                <Upload size={18} /> UPLOAD
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
            {recordTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${
                  filter === type 
                    ? 'bg-teal-400 text-[#0f172a] shadow-lg shadow-teal-400/50' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {type === 'all' ? 'All Records' : type}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-6 lg:px-20 -mt-24 relative z-20">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-xl">
            <FileText className="mx-auto text-slate-300 mb-4" size={64} />
            <h3 className="text-2xl font-black text-slate-800 mb-2">No Records Found</h3>
            <p className="text-slate-400 mb-6">
              {searchTerm ? 'Try different search terms' : 'Upload your first medical record to get started'}
            </p>
            {!searchTerm && (
              <button 
                onClick={() => {
                  if (!currentUser) {
                    alert('Please login to upload records');
                    return;
                  }
                  setShowUploadModal(true);
                }}
                className="bg-teal-400 text-[#0f172a] px-8 py-4 rounded-[1.5rem] font-black hover:bg-teal-300 transition-all inline-flex items-center gap-2"
              >
                <Upload size={18} /> UPLOAD FIRST RECORD
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map((record) => (
              <div 
                key={record._id} 
                className="bg-white rounded-[3rem] p-8 border border-slate-100 hover:border-teal-400 transition-all shadow-xl shadow-slate-200/40 group hover:shadow-teal-200/50 hover:shadow-lg"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                    {record.type === 'X-Ray' || record.type === 'MRI' || record.type === 'CT Scan' ? (
                      <Image className="text-teal-600" size={28} />
                    ) : (
                      <FileText className="text-teal-600" size={28} />
                    )}
                  </div>
                  <span className="text-[10px] font-black px-3 py-1.5 bg-slate-100 rounded-full text-slate-500 uppercase">
                    {record.date}
                  </span>
                </div>
                
                <h3 className="text-xl font-black text-[#0f172a] mb-2">{record.diagnosis}</h3>
                <p className="text-slate-400 font-bold text-sm mb-4 flex items-center gap-2">
                  <User size={14}/> {record.doctor}
                </p>
                
                {/* File preview chips */}
                {record.files && record.files.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {record.files.map((file, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleViewFile(record, file)}
                        className="flex items-center gap-1 bg-slate-50 hover:bg-teal-50 px-3 py-2 rounded-lg text-[8px] font-bold text-slate-600 hover:text-teal-600 transition-all group/btn shadow-sm hover:shadow-md"
                      >
                        {file.fileType === 'image' ? <Image size={12} /> : <FileIcon size={12} />}
                        <span className="truncate max-w-[80px]">{file.name}</span>
                        <Eye size={12} className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                    ))}
                  </div>
                )}

                {record.notes && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-600 line-clamp-2">
                      <span className="font-bold">📝 Notes:</span> {record.notes}
                    </p>
                  </div>
                )}
                
                <div className="pt-6 border-t border-dashed border-slate-100 flex justify-between items-center text-[10px] font-black text-teal-600 tracking-widest uppercase">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                    {record.type}
                  </span>
                  <button 
                    onClick={() => handleDeleteRecord(record._id)}
                    className="text-rose-500 hover:text-rose-600 hover:scale-110 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-sm" onClick={() => setShowUploadModal(false)}></div>
          
          <div className="bg-[#0f172a] w-full max-w-2xl rounded-[2.5rem] border border-teal-400/30 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-8 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0f172a]/95 backdrop-blur z-10">
              <div>
                <h2 className="text-2xl font-black text-white">Upload Medical Record</h2>
                <p className="text-teal-400 text-sm font-bold">Add document details to your vault (Cloudinary)</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-white hover:text-teal-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 custom-scrollbar flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase ml-1">Record Type *</label>
                  <select 
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-teal-400 focus:bg-white/10 appearance-none cursor-pointer transition-all"
                  >
                    <option value="" className="bg-[#0f172a]">Select type</option>
                    <option value="Lab Report" className="bg-[#0f172a]">🧪 Lab Report</option>
                    <option value="X-Ray" className="bg-[#0f172a]">🦴 X-Ray</option>
                    <option value="MRI" className="bg-[#0f172a]">🧠 MRI Scan</option>
                    <option value="CT Scan" className="bg-[#0f172a]">📊 CT Scan</option>
                    <option value="Prescription" className="bg-[#0f172a]">📝 Prescription</option>
                    <option value="Checkup" className="bg-[#0f172a]">🏥 General Checkup</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase ml-1">Record Date *</label>
                  <input 
                    type="date" 
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-teal-400 focus:bg-white/10 transition-all cursor-pointer" 
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
                  placeholder="e.g., Acute Bronchitis, Hypertension"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-teal-400 focus:bg-white/10 transition-all"
                />
              </div>

              {/* OP DETAILS */}
              <div className="bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden hover:border-white/10 transition-all">
                <div 
                  className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
                  onClick={() => setShowOPDetails(!showOPDetails)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-400/10 rounded-xl flex items-center justify-center text-teal-400">
                      <Users size={20} />
                    </div>
                    <div>
                      <span className="text-sm font-black text-white uppercase tracking-wider block">OP / Consultation Details</span>
                      <span className="text-[10px] text-teal-400/60 font-bold uppercase">Doctor, Dept & Vitals</span>
                    </div>
                  </div>
                  <button className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${showOPDetails ? 'bg-rose-500/10 text-rose-500' : 'bg-teal-400 text-[#0f172a]'}`}>
                    {showOPDetails ? 'REMOVE' : '+ ADD DETAILS'}
                  </button>
                </div>

                {showOPDetails && (
                  <div className="p-6 pt-0 space-y-5 border-t border-white/5 mt-2 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-teal-400 uppercase flex items-center gap-1">
                          <User size={10}/> Doctor Name
                        </label>
                        <input 
                          type="text" 
                          value={opDoctor} 
                          onChange={(e)=>setOpDoctor(e.target.value)} 
                          placeholder="Dr. Name" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-teal-400 focus:bg-white/10 transition-all" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-teal-400 uppercase flex items-center gap-1">
                          <Building2 size={10}/> Department
                        </label>
                        <input 
                          type="text" 
                          value={opDept} 
                          onChange={(e)=>setOpDept(e.target.value)} 
                          placeholder="Cardio/General" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-teal-400 focus:bg-white/10 transition-all" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-teal-400 uppercase flex items-center gap-1">
                          <Clipboard size={10}/> Visit Type
                        </label>
                        <select 
                          value={visitType} 
                          onChange={(e)=>setVisitType(e.target.value)} 
                          className="w-full bg-[#1a2235] border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-teal-400 appearance-none cursor-pointer transition-all"
                        >
                          <option value="" className="bg-[#0f172a]">Select Type</option>
                          <option value="OP" className="bg-[#0f172a]">OP Consultation</option>
                          <option value="Emergency" className="bg-[#0f172a]">Emergency</option>
                          <option value="Follow-up" className="bg-[#0f172a]">Follow-up</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-teal-400 uppercase flex items-center gap-1">
                          <Activity size={10}/> BP
                        </label>
                        <input 
                          type="text" 
                          value={bp} 
                          onChange={(e)=>setBp(e.target.value)} 
                          placeholder="120/80" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-teal-400 focus:bg-white/10 transition-all" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-teal-400 uppercase flex items-center gap-1">
                          <HeartPulse size={10}/> Heart Rate
                        </label>
                        <input 
                          type="text" 
                          value={heartRate} 
                          onChange={(e)=>setHeartRate(e.target.value)} 
                          placeholder="72" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-teal-400 focus:bg-white/10 transition-all" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-teal-400 uppercase flex items-center gap-1">
                          <Thermometer size={10}/> Temp
                        </label>
                        <input 
                          type="text" 
                          value={temp} 
                          onChange={(e)=>setTemp(e.target.value)} 
                          placeholder="98.6" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-teal-400 focus:bg-white/10 transition-all" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-teal-400 uppercase flex items-center gap-1">
                          <Droplets size={10}/> Oxygen
                        </label>
                        <input 
                          type="text" 
                          value={oxygen} 
                          onChange={(e)=>setOxygen(e.target.value)} 
                          placeholder="98%" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-teal-400 focus:bg-white/10 transition-all" 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/50 uppercase ml-1">Notes (Optional)</label>
                <textarea
                  value={recordNotes}
                  onChange={(e) => setRecordNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-teal-400 focus:bg-white/10 transition-all resize-none"
                  rows="3"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/50 uppercase ml-1">Upload Files * ({uploadFiles.length} selected)</label>
                <div className="border-2 border-dashed border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center justify-center hover:border-teal-400/50 hover:bg-teal-400/5 transition-all relative group bg-white/[0.02]">
                  <Upload size={32} className="text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-white font-black text-xs text-center">
                    Drop your reports or <span className="text-teal-400 underline">browse</span>
                  </p>
                  <p className="text-slate-500 text-[8px] font-bold mt-1">
                    Supports: Images (JPG, PNG) and PDF files (Max 50MB per file)
                  </p>
                  <input 
                    type="file" 
                    multiple 
                    accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setUploadFiles(Array.from(e.target.files))}
                  />
                  {uploadFiles.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 justify-center max-h-24 overflow-y-auto w-full">
                      {uploadFiles.map((f, i) => (
                        <span key={i} className="bg-teal-400/10 text-teal-400 px-3 py-1 rounded-lg text-[9px] font-black border border-teal-400/20">
                          ✓ {f.name} ({(f.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-white/5 bg-slate-900/50 flex gap-4 sticky bottom-0 z-10">
              <button 
                onClick={() => setShowUploadModal(false)} 
                className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-black text-sm hover:bg-white/10 transition-all"
              >
                CANCEL
              </button>
              <button 
                onClick={handleUploadSubmit}
                disabled={isUploading}
                className="flex-1 py-4 bg-teal-400 text-[#0f172a] rounded-2xl font-black text-sm hover:bg-teal-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? <RefreshCw className="animate-spin" size={18} /> : <Upload size={18} />}
                {isUploading ? `UPLOADING... ${uploadProgress}%` : 'SAVE RECORDS'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW FILE MODAL */}
      {showViewModal && selectedFile && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-sm" onClick={() => {
            setShowViewModal(false);
            if (pdfBlobUrl) {
              URL.revokeObjectURL(pdfBlobUrl);
              setPdfBlobUrl(null);
            }
          }}></div>
          
          <div className="bg-[#0f172a] w-full max-w-5xl rounded-[2.5rem] border border-teal-400/30 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0f172a]/95 backdrop-blur z-10">
              <div className="flex items-center gap-3">
                {selectedFile.fileType === 'image' ? (
                  <Image className="text-teal-400" size={24} />
                ) : (
                  <FileText className="text-teal-400" size={24} />
                )}
                <div>
                  <h2 className="text-xl font-black text-white">{selectedFile.name}</h2>
                  <p className="text-teal-400 text-xs">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {selectedRecord?.date}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleViewFileInTab(selectedFile)}
                  className="p-3 bg-teal-400/10 text-teal-400 rounded-xl hover:bg-teal-400/20 transition-all"
                  title="Open PDF in new tab"
                >
                  <ExternalLink size={20} />
                </button>
                <button 
                  onClick={() => handleDownloadFile(selectedFile)}
                  disabled={downloadingFileId === selectedFile.id}
                  className="p-3 bg-teal-400/10 text-teal-400 rounded-xl hover:bg-teal-400/20 transition-all disabled:opacity-50 flex items-center gap-2"
                  title="Download file"
                >
                  {downloadingFileId === selectedFile.id ? (
                    <RefreshCw className="animate-spin" size={20} />
                  ) : (
                    <Download size={20} />
                  )}
                </button>
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    if (pdfBlobUrl) {
                      URL.revokeObjectURL(pdfBlobUrl);
                      setPdfBlobUrl(null);
                    }
                  }} 
                  className="p-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-[#1a1f2e]">
              {selectedFile.fileType === 'image' ? (
                <div className="flex justify-center items-center h-full min-h-[400px]">
                  <img 
                    src={getProperCloudinaryUrl(selectedFile.cloudinaryUrl || selectedFile.data, 'image')} 
                    alt={selectedFile.name}
                    className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
                    onError={(e) => {
                      console.error('Image load error:', e);
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23374151" width="300" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%23999"%3E❌ Image Load Error%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col h-full min-h-[500px]">
                  <div className="flex justify-between items-center mb-4 p-3 bg-slate-800/50 rounded-xl">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewFileInTab(selectedFile)}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-all flex items-center gap-2"
                      >
                        <ExternalLink size={16} />
                        Open in New Tab
                      </button>
                      <button
                        onClick={() => handleDownloadFile(selectedFile)}
                        className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-all flex items-center gap-2"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                    <p className="text-slate-400 text-xs truncate max-w-[300px]">{selectedFile.name}</p>
                  </div>
                  
                  <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                    {pdfBlobUrl ? (
                      <object
                        data={pdfBlobUrl}
                        type="application/pdf"
                        className="w-full h-[600px]"
                      >
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                          <FileText size={48} className="text-slate-500 mb-4" />
                          <p className="text-white font-bold mb-2">PDF cannot be displayed</p>
                          <p className="text-slate-400 text-sm mb-4">Click the button below to open in new tab</p>
                          <button
                            onClick={() => handleViewFileInTab(selectedFile)}
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-all"
                          >
                            Open PDF in New Tab
                          </button>
                        </div>
                      </object>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[600px]">
                        <RefreshCw className="animate-spin text-teal-400 mb-4" size={40} />
                        <p className="text-white">Loading PDF...</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 p-3 bg-teal-400/10 border border-teal-400/30 rounded-xl">
                    <p className="text-teal-400 text-xs text-center font-bold">
                      💡 If PDF doesn't display, click "Open in New Tab" button above
                    </p>
                  </div>
                </div>
              )}
            </div>

            {selectedRecord && (
              <div className="p-6 border-t border-white/5 bg-slate-900/50 sticky bottom-0 z-10">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400 font-bold">👨‍⚕️ Doctor</p>
                    <p className="text-white font-black">{selectedRecord.doctor}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold">📋 Type</p>
                    <p className="text-white font-black">{selectedRecord.type}</p>
                  </div>
                  {selectedRecord.notes && (
                    <div className="col-span-2">
                      <p className="text-slate-400 font-bold">📝 Notes</p>
                      <p className="text-white text-xs line-clamp-2">{selectedRecord.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(45, 212, 191, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(45, 212, 191, 0.5);
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
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

export default MedicalRecordsPage;