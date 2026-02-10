import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, User, Search, Filter, 
  Download, Eye, Plus, X, Activity, Pill, 
  Beaker, ChevronRight, Stethoscope, Share2, 
  Thermometer, Clock, ShieldCheck, Upload,
  Camera, File, Image, XCircle, CheckCircle
} from 'lucide-react';

const MedicalRecordsPage = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [recordType, setRecordType] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [recordNotes, setRecordNotes] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Load records from localStorage
  const [medicalRecords, setMedicalRecords] = useState(() => {
    const saved = localStorage.getItem('user_medical_records');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        date: '2024-11-15',
        doctor: 'Dr. Sarah Johnson',
        specialty: 'General Physician',
        type: 'Checkup',
        diagnosis: 'Viral Fever',
        prescription: ['Paracetamol 500mg', 'Vitamin C', 'Rest for 3 days'],
        notes: 'Patient had high temperature (102°F). Recommended blood test if fever persists.',
        labResults: 'None',
        status: 'Normal',
        hospital: 'City General Hospital',
        uploadedBy: 'doctor'
      },
      {
        id: 2,
        date: '2024-10-20',
        doctor: 'Dr. Kasun Perera',
        specialty: 'Cardiologist',
        type: 'Lab Report',
        diagnosis: 'High Cholesterol',
        prescription: ['Atorvastatin 10mg', 'Diet Control'],
        notes: 'Lipid profile shows slightly elevated LDL levels.',
        labResults: 'Lipid Profile - Abnormal',
        status: 'Attention',
        hospital: 'Asiri Surgical',
        uploadedBy: 'doctor'
      }
    ];
  });

  // Save to localStorage whenever records change
  useEffect(() => {
    localStorage.setItem('user_medical_records', JSON.stringify(medicalRecords));
    // Also sync to doctor's view
    localStorage.setItem('doctor_medical_records', JSON.stringify(medicalRecords));
  }, [medicalRecords]);

  // --- Stats Calculation ---
  const stats = {
    total: medicalRecords.length,
    prescriptions: medicalRecords.filter(r => r.prescription.length > 0).length,
    labs: medicalRecords.filter(r => r.type === 'Lab Report').length,
    conditions: new Set(medicalRecords.map(r => r.diagnosis)).size,
    uploadedByUser: medicalRecords.filter(r => r.uploadedBy === 'user').length
  };

  // --- Filtering ---
  const filteredRecords = medicalRecords.filter(record => {
    const matchesFilter = filter === 'all' || record.type.toLowerCase().includes(filter.toLowerCase());
    const matchesSearch = record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const openDetails = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2), // MB
      type: file.type
    }));
    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    const newFiles = [...uploadFiles];
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview);
    }
    newFiles.splice(index, 1);
    setUploadFiles(newFiles);
  };

  const handleUploadSubmit = async () => {
    if (!recordDate || !recordType || uploadFiles.length === 0) {
      alert('Please fill all required fields and select at least one file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate API call
    setTimeout(() => {
      clearInterval(interval);
      
      // Create new record
      const newRecord = {
        id: Date.now(),
        date: recordDate,
        doctor: 'Self-uploaded',
        specialty: 'General',
        type: recordType,
        diagnosis: recordType === 'Lab Report' ? 'Lab Results' : 'Health Report',
        prescription: [],
        notes: recordNotes,
        labResults: recordType === 'Lab Report' ? 'Pending Analysis' : 'N/A',
        status: 'Pending Review',
        hospital: 'Self Document',
        uploadedBy: 'user',
        files: uploadFiles.map(f => ({
          name: f.name,
          type: f.type,
          size: f.size,
          uploadedAt: new Date().toISOString()
        }))
      };

      // Add to records
      setMedicalRecords(prev => [newRecord, ...prev]);
      
      // Reset form
      setUploadFiles([]);
      setRecordType('');
      setRecordDate('');
      setRecordNotes('');
      setUploadProgress(0);
      setIsUploading(false);
      setShowUploadModal(false);
      
      alert('Medical records uploaded successfully!');
    }, 2000);
  };

  // --- Helper for Badge Colors ---
  const getTypeColor = (type) => {
    switch(type) {
      case 'Checkup': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Lab Report': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Prescription': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'X-Ray': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Scan Report': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getUploadedByColor = (by) => {
    return by === 'user' 
      ? 'bg-blue-100 text-blue-700 border-blue-200' 
      : 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 pb-24 font-sans text-slate-800">
      
      {/* --- Main Container --- */}
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Medical Records</h1>
            <p className="text-slate-500 mt-1">Access your health history and reports</p>
          </div>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:scale-105 transition-transform"
          >
            <Upload size={18} /> Upload New Record
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {[
            { label: 'Total Records', val: stats.total, color: 'bg-indigo-50 text-indigo-600', icon: FileText },
            { label: 'Prescriptions', val: stats.prescriptions, color: 'bg-emerald-50 text-emerald-600', icon: Pill },
            { label: 'Lab Reports', val: stats.labs, color: 'bg-blue-50 text-blue-600', icon: Beaker },
            { label: 'User Uploads', val: stats.uploadedByUser, color: 'bg-cyan-50 text-cyan-600', icon: Upload }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)] flex items-center justify-between group hover:shadow-md transition-all">
              <div>
                <span className="text-3xl font-bold text-slate-800">{stat.val}</span>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color} bg-opacity-50`}>
                <stat.icon size={24} />
              </div>
            </div>
          ))}
        </div>

        {/* --- Controls Bar --- */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Tabs */}
          <div className="flex bg-slate-100/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            {['all', 'Checkup', 'Prescription', 'Lab Report', 'X-Ray', 'Scan Report'].map(item => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-5 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${
                  filter === item 
                    ? 'bg-white text-emerald-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {item === 'all' ? 'All Records' : item}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-96 mr-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search diagnosis, doctor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* --- Records Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map(record => (
            <div 
              key={record.id} 
              onClick={() => openDetails(record)}
              className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100 hover:border-emerald-300 hover:shadow-lg cursor-pointer transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getTypeColor(record.type).replace('border', '')}`}>
                    {record.type === 'Prescription' ? <Pill size={20} /> : 
                     record.type === 'Lab Report' ? <Beaker size={20} /> : 
                     record.type === 'X-Ray' ? <Camera size={20} /> :
                     <Stethoscope size={20} />}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">{record.date}</p>
                    <h3 className="font-bold text-slate-900 line-clamp-1">{record.diagnosis}</h3>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-emerald-600 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                 <div className="flex items-center gap-2 text-sm text-slate-600">
                   <User size={16} className="text-emerald-500" />
                   <span className="font-medium">{record.doctor}</span>
                 </div>
                 <div className="flex items-center gap-2 text-sm text-slate-600">
                   <ShieldCheck size={16} className="text-emerald-500" />
                   <span className="truncate">{record.hospital}</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getUploadedByColor(record.uploadedBy)}`}>
                     {record.uploadedBy === 'user' ? 'Self Uploaded' : 'Doctor Uploaded'}
                   </span>
                   {record.files && (
                     <span className="text-xs text-slate-500">
                       {record.files.length} file{record.files.length > 1 ? 's' : ''}
                     </span>
                   )}
                 </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getTypeColor(record.type)}`}>
                  {record.type}
                </span>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
                  View Details
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* --- Details Modal --- */}
      {showModal && selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-2xl w-full shadow-2xl animate-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedRecord.diagnosis}</h2>
                <p className="text-sm text-emerald-600 font-medium">{selectedRecord.type} • {selectedRecord.date}</p>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase mt-1 ${getUploadedByColor(selectedRecord.uploadedBy)}`}>
                  {selectedRecord.uploadedBy === 'user' ? 'Self Uploaded' : 'Doctor Uploaded'}
                </span>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 bg-white hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Doctor Info */}
              <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                   <User size={24} />
                 </div>
                 <div>
                   <p className="text-xs font-bold text-emerald-800 uppercase">Consulting Doctor</p>
                   <p className="font-bold text-slate-900">{selectedRecord.doctor}</p>
                   <p className="text-xs text-slate-500">{selectedRecord.specialty} • {selectedRecord.hospital}</p>
                 </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Status</p>
                  <p className="font-bold text-slate-800 flex items-center gap-2">
                    <Activity size={16} className="text-emerald-500" /> {selectedRecord.status}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Lab Results</p>
                  <p className="font-bold text-slate-800">{selectedRecord.labResults}</p>
                </div>
              </div>

              {/* Files Section */}
              {selectedRecord.files && selectedRecord.files.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <File size={18} className="text-emerald-600" /> Uploaded Files
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRecord.files.map((file, idx) => (
                      <div key={idx} className="bg-slate-100 p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-emerald-600" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-slate-800 truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-500">{file.size} MB • {new Date(file.uploadedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prescription */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Pill size={18} className="text-emerald-600" /> Prescriptions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRecord.prescription.length > 0 ? (
                    selectedRecord.prescription.map((med, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200">
                        {med}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400 italic">No medicines prescribed.</span>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                <h3 className="text-xs font-bold text-amber-800 uppercase mb-1 flex items-center gap-2">
                  <FileText size={14} /> Notes
                </h3>
                <p className="text-sm text-amber-900/80 leading-relaxed">
                  "{selectedRecord.notes}"
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
                <Download size={18} /> Download Report
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors">
                <Share2 size={18} /> Share Record
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- Upload Modal --- */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-md w-full shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Upload Medical Record</h2>
                <p className="text-sm text-slate-500">Add new medical documents to your records</p>
              </div>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="p-2 bg-white hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
                disabled={isUploading}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Record Type */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Record Type <span className="text-red-500">*</span>
                </label>
                <select 
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  disabled={isUploading}
                >
                  <option value="">Select type</option>
                  <option value="Lab Report">Lab Report</option>
                  <option value="Prescription">Prescription</option>
                  <option value="X-Ray">X-Ray Report</option>
                  <option value="Scan Report">Scan Report (MRI/CT)</option>
                  <option value="Checkup">Checkup Report</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Record Date <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  disabled={isUploading}
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Upload Files <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-slate-500 ml-2">(PDF, JPG, PNG up to 10MB)</span>
                </label>
                
                {/* File Drop Zone */}
                <div 
                  className={`border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center transition-all ${isUploading ? 'opacity-50' : 'hover:border-emerald-400 cursor-pointer'}`}
                  onClick={() => !isUploading && document.getElementById('fileInput').click()}
                >
                  <input 
                    type="file" 
                    id="fileInput"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Upload size={36} className="mx-auto text-slate-400 mb-3" />
                  <p className="text-slate-600 font-medium">Drop files here or click to upload</p>
                  <p className="text-xs text-slate-500 mt-1">PDF, Images, Documents (Max 10MB each)</p>
                </div>

                {/* File List */}
                {uploadFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-slate-700">Selected Files ({uploadFiles.length})</p>
                    {uploadFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-100 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          {file.preview ? (
                            <img src={file.preview} alt="preview" className="w-10 h-10 object-cover rounded" />
                          ) : (
                            <File className="text-emerald-600" size={20} />
                          )}
                          <div>
                            <p className="text-sm font-medium text-slate-800 truncate max-w-[200px]">{file.name}</p>
                            <p className="text-xs text-slate-500">{file.size} MB</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => !isUploading && removeFile(index)}
                          className="p-1 hover:bg-slate-200 rounded-full text-slate-500 hover:text-rose-500"
                          disabled={isUploading}
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Additional Notes
                </label>
                <textarea 
                  value={recordNotes}
                  onChange={(e) => setRecordNotes(e.target.value)}
                  placeholder="Any additional information about these records..."
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none"
                  disabled={isUploading}
                />
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">Uploading...</span>
                    <span className="font-bold text-emerald-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button 
                onClick={() => !isUploading && setShowUploadModal(false)}
                className="flex-1 px-4 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button 
                onClick={handleUploadSubmit}
                disabled={isUploading || !recordDate || !recordType || uploadFiles.length === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Upload Records
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MedicalRecordsPage;