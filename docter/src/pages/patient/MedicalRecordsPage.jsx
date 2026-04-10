import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Plus, X, Stethoscope, 
  ChevronRight, Upload, Users, RefreshCw, 
  Filter, Calendar, Activity, Thermometer, Droplets,
  Clipboard, HeartPulse, Building2, User, Download,
  Eye, File, Image, FileIcon, Trash2, ZoomIn
} from 'lucide-react';

// IndexedDB wrapper for storing large files
const DB_NAME = 'MedicalRecordsDB';
const DB_VERSION = 1;
const STORE_NAME = 'medicalRecords';
let db = null;

const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db && db.name === DB_NAME) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
    };
  });
};

// Fixed: Get all records by user ID without transaction conflicts
const getAllRecordsByUserId = async (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await initDB();
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('userId');
      const records = [];
      
      const cursorRequest = index.openCursor(IDBKeyRange.only(userId));
      
      cursorRequest.onerror = () => reject(cursorRequest.error);
      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          records.push(cursor.value);
          cursor.continue();
        } else {
          records.sort((a, b) => new Date(b.date) - new Date(a.date));
          resolve(records);
        }
      };
    } catch (error) {
      reject(error);
    }
  });
};

// Fixed: Save records without transaction conflicts
const saveMedicalRecordsToIndexedDB = async (userId, records) => {
  try {
    const database = await initDB();
    
    // First, get existing records to delete them
    const existingRecords = await getAllRecordsByUserId(userId);
    
    // Use a single transaction for all write operations
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Delete existing records
    for (const record of existingRecords) {
      store.delete(record.id);
    }
    
    // Save new records
    for (const record of records) {
      store.put(record);
    }
    
    // Wait for transaction to complete
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(new Error('Transaction aborted'));
    });
  } catch (error) {
    console.error('Error saving to IndexedDB:', error);
    throw error;
  }
};

const getMedicalRecordsFromIndexedDB = async (userId) => {
  try {
    return await getAllRecordsByUserId(userId);
  } catch (error) {
    console.error('Error loading from IndexedDB:', error);
    return [];
  }
};

const deleteMedicalRecordFromIndexedDB = async (recordId) => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(recordId);
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error deleting from IndexedDB:', error);
    throw error;
  }
};

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

  // OP Details States
  const [opDoctor, setOpDoctor] = useState('');
  const [opDept, setOpDept] = useState('');
  const [visitType, setVisitType] = useState('');
  const [bp, setBp] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temp, setTemp] = useState('');
  const [oxygen, setOxygen] = useState('');

  // Get current user and load medical records from IndexedDB
  useEffect(() => {
    const init = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        setCurrentUser(user);
        
        const userId = user?.userId || user?.id;
        if (userId) {
          await initDB();
          const records = await getMedicalRecordsFromIndexedDB(userId);
          setMedicalRecords(records);
        } else {
          setMedicalRecords([]);
        }
      } catch (error) {
        console.error('Error loading records:', error);
        setMedicalRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, []);

  // Save medical records to IndexedDB
  const saveMedicalRecords = async (records) => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userId = user?.userId || user?.id;
    
    if (userId) {
      await saveMedicalRecordsToIndexedDB(userId, records);
      setMedicalRecords(records);
    }
  };

  // Compress image before storing (reduces storage usage)
  const compressImage = (base64String, maxWidth = 1024, quality = 0.7) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = base64String;
    });
  };

  // Convert file to base64 for storage with compression for images
  const fileToBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        let result = reader.result;
        // Compress if it's an image and size is large (> 500KB)
        if (file.type.startsWith('image/') && result.length > 500 * 1024) {
          result = await compressImage(result, 800, 0.6);
        }
        resolve(result);
      };
      reader.onerror = error => reject(error);
    });
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

    // Check total size before uploading
    let totalSize = 0;
    for (const file of uploadFiles) {
      totalSize += file.size;
    }
    
    // Warn if total size > 50MB
    if (totalSize > 50 * 1024 * 1024) {
      if (!window.confirm(`Total file size is ${(totalSize / 1024 / 1024).toFixed(1)}MB. Large files may affect performance. Continue?`)) {
        return;
      }
    }

    setIsUploading(true);

    try {
      // Convert files to base64 for storage
      const filesData = await Promise.all(
        uploadFiles.map(async (file, index) => ({
          id: Date.now() + index + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: await fileToBase64(file),
          fileType: file.type.startsWith('image/') ? 'image' : 'pdf'
        }))
      );

      const newRecord = {
        id: Date.now(),
        userId: currentUser?.userId || currentUser?.id,
        userEmail: currentUser?.email || '',
        userName: currentUser?.name || '',
        date: recordDate,
        doctor: opDoctor || 'Self-uploaded',
        type: recordType,
        diagnosis: recordType === 'Lab Report' ? 'Lab Results' : 
                   recordType === 'X-Ray' ? 'X-Ray Report' :
                   recordType === 'MRI' ? 'MRI Scan' :
                   recordType === 'CT Scan' ? 'CT Scan Report' :
                   recordType === 'Prescription' ? 'Prescription' : 'Health Report',
        notes: recordNotes,
        opDetails: showOPDetails ? { 
          opDoctor, 
          opDept, 
          visitType, 
          bp, 
          heartRate, 
          temp, 
          oxygen 
        } : null,
        uploadedBy: currentUser?.name || 'User',
        uploadedById: currentUser?.userId || currentUser?.id,
        uploadedAt: new Date().toISOString(),
        files: filesData
      };

      const updatedRecords = [newRecord, ...medicalRecords];
      await saveMedicalRecords(updatedRecords);

      // Reset form
      setShowUploadModal(false);
      setUploadFiles([]);
      setRecordType('');
      setRecordDate('');
      setRecordNotes('');
      setOpDoctor('');
      setOpDept('');
      setVisitType('');
      setBp('');
      setHeartRate('');
      setTemp('');
      setOxygen('');
      setShowOPDetails(false);

      alert('✅ Medical record uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Error uploading file: ${error.message || 'Please try again with smaller files'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewFile = (record, file) => {
    setSelectedRecord(record);
    setSelectedFile(file);
    setShowViewModal(true);
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        const updatedRecords = medicalRecords.filter(r => r.id !== recordId);
        await saveMedicalRecords(updatedRecords);
        alert('Record deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting record');
      }
    }
  };

  const handleDownloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter records based on search and filter
  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
      
      {/* Header - Navy Dark Theme */}
      <section className="bg-[#0f172a] pt-24 pb-44 px-6 lg:px-20 relative rounded-b-[4rem]">
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-5xl font-black text-white mb-2">Medical <span className="text-teal-400">Vault</span></h1>
          <p className="text-slate-400 text-lg mb-6">Store and view all your medical records securely</p>
          
          {currentUser && (
            <div className="mb-4 text-sm text-teal-400">
              Logged in as: {currentUser.name} (ID: {currentUser.userId || currentUser.id})
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-4 items-center mt-10">
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 flex flex-1 w-full">
              <Search className="text-teal-400 ml-4" size={22} />
              <input 
                type="text" 
                placeholder="Search diagnosis or doctor..." 
                className="w-full bg-transparent border-none outline-none text-white px-4 py-3"
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
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
            {recordTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${
                  filter === type 
                    ? 'bg-teal-400 text-[#0f172a]' 
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
              <div key={record.id} className="bg-white rounded-[3rem] p-8 border border-slate-100 hover:border-teal-400 transition-all shadow-xl shadow-slate-200/40 group">
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
                        className="flex items-center gap-1 bg-slate-50 hover:bg-teal-50 px-2 py-1 rounded-lg text-[8px] font-bold text-slate-600 hover:text-teal-600 transition-colors"
                      >
                        {file.fileType === 'image' ? <Image size={10} /> : <FileIcon size={10} />}
                        <span className="truncate max-w-[80px]">{file.name}</span>
                        <Eye size={10} />
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="pt-6 border-t border-dashed border-slate-100 flex justify-between items-center text-[10px] font-black text-teal-600 tracking-widest uppercase">
                  <span>{record.type}</span>
                  <button 
                    onClick={() => handleDeleteRecord(record.id)}
                    className="text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- UPLOAD MODAL - SCROLLABLE DARK UI --- */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-sm" onClick={() => setShowUploadModal(false)}></div>
          
          <div className="bg-[#0f172a] w-full max-w-2xl rounded-[2.5rem] border border-teal-400/30 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white">Upload Medical Record</h2>
                <p className="text-teal-400 text-sm font-bold">Add document details to your vault</p>
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
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-teal-400 appearance-none"
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
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-teal-400" 
                  />
                </div>
              </div>

              {/* OP DETAILS - WITH DOCTOR, DEPT, VISIT TYPE & VITALS */}
              <div className="bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden">
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
                  <div className="p-6 pt-0 space-y-5 border-t border-white/5 mt-2">
                    {/* Doctor Info Row */}
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
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-teal-400" 
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
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-teal-400" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-teal-400 uppercase flex items-center gap-1">
                          <Clipboard size={10}/> Visit Type
                        </label>
                        <select 
                          value={visitType} 
                          onChange={(e)=>setVisitType(e.target.value)} 
                          className="w-full bg-[#1a2235] border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-teal-400 appearance-none"
                        >
                          <option value="">Select Type</option>
                          <option value="OP">OP Consultation</option>
                          <option value="Emergency">Emergency</option>
                          <option value="Follow-up">Follow-up</option>
                        </select>
                      </div>
                    </div>

                    {/* Vitals Row */}
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
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none" 
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
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none" 
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
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none" 
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
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none" 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/50 uppercase ml-1">Notes (Optional)</label>
                <textarea
                  value={recordNotes}
                  onChange={(e) => setRecordNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-teal-400"
                  rows="3"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/50 uppercase ml-1">Upload Files *</label>
                <div className="border-2 border-dashed border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center justify-center hover:border-teal-400/50 hover:bg-teal-400/5 transition-all relative group">
                  <Upload size={32} className="text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-white font-black text-xs text-center">
                    Drop your reports or <span className="text-teal-400 underline">browse</span>
                  </p>
                  <p className="text-slate-500 text-[8px] font-bold mt-1">
                    Supports: Images (JPG, PNG) and PDF files
                  </p>
                  <input 
                    type="file" 
                    multiple 
                    accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setUploadFiles(Array.from(e.target.files))}
                  />
                  {uploadFiles.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 justify-center max-h-24 overflow-y-auto">
                      {uploadFiles.map((f, i) => (
                        <span key={i} className="bg-teal-400/10 text-teal-400 px-3 py-1 rounded-lg text-[9px] font-black">
                          {f.name} ({(f.size / 1024).toFixed(1)} KB)
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
                className="flex-1 py-4 bg-teal-400 text-[#0f172a] rounded-2xl font-black text-sm hover:bg-teal-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? <RefreshCw className="animate-spin" size={18} /> : <Upload size={18} />}
                {isUploading ? 'UPLOADING...' : 'SAVE RECORDS'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- VIEW FILE MODAL --- */}
      {showViewModal && selectedFile && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-sm" onClick={() => setShowViewModal(false)}></div>
          
          <div className="bg-[#0f172a] w-full max-w-4xl rounded-[2.5rem] border border-teal-400/30 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
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
                  onClick={() => handleDownloadFile(selectedFile)}
                  className="p-3 bg-teal-400/10 text-teal-400 rounded-xl hover:bg-teal-400/20 transition-colors"
                >
                  <Download size={20} />
                </button>
                <button 
                  onClick={() => setShowViewModal(false)} 
                  className="p-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-[#1a1f2e]">
              {selectedFile.fileType === 'image' ? (
                <div className="flex justify-center">
                  <img 
                    src={selectedFile.data} 
                    alt={selectedFile.name}
                    className="max-w-full max-h-[70vh] object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="bg-white/5 rounded-2xl p-8 text-center">
                  <FileText size={64} className="mx-auto text-teal-400 mb-4" />
                  <p className="text-white font-bold mb-4">PDF Document</p>
                  <button
                    onClick={() => handleDownloadFile(selectedFile)}
                    className="bg-teal-400 text-[#0f172a] px-6 py-3 rounded-xl font-black hover:bg-teal-300 transition-all inline-flex items-center gap-2"
                  >
                    <Download size={18} /> Download to View
                  </button>
                  <p className="text-slate-400 text-xs mt-4">
                    PDF viewing is not available in browser. Please download to view.
                  </p>
                </div>
              )}
            </div>

            {/* Record details footer */}
            {selectedRecord && (
              <div className="p-6 border-t border-white/5 bg-slate-900/50">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400 font-bold">Doctor</p>
                    <p className="text-white font-black">{selectedRecord.doctor}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold">Type</p>
                    <p className="text-white font-black">{selectedRecord.type}</p>
                  </div>
                  {selectedRecord.notes && (
                    <div className="col-span-2">
                      <p className="text-slate-400 font-bold">Notes</p>
                      <p className="text-white">{selectedRecord.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
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
      `}</style>
    </div>
  );
};

export default MedicalRecordsPage;