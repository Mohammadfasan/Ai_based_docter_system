// Updated Appointments.jsx - Enhanced attachment viewing

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, Clock, Stethoscope, RefreshCw, 
  PlusCircle, FileText, Paperclip, ExternalLink, 
  AlertCircle, Trash2, Eye, Download, X, Clock as ClockIcon,
  Image, File, ChevronDown, ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../../services/appointmentAPI';

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [activeAppointmentId, setActiveAppointmentId] = useState(null);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [expiredCount, setExpiredCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [expandedAttachments, setExpandedAttachments] = useState({});

  // Helper function to check if date is expired
  const isExpired = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(dateString);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate < today;
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(dateString);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate.getTime() === today.getTime();
  };

  // Get status badge styling
  const getStatusBadge = (status, date) => {
    if (isToday(date)) {
      return 'bg-purple-50 text-purple-600 border-purple-100';
    }
    switch(status) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'pending':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'completed':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'no-show':
        return 'bg-gray-50 text-gray-600 border-gray-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed':
        return <Calendar size={14} className="text-emerald-500" />;
      case 'pending':
        return <ClockIcon size={14} className="text-amber-500" />;
      case 'completed':
        return <FileText size={14} className="text-blue-500" />;
      case 'cancelled':
        return <AlertCircle size={14} className="text-red-500" />;
      default:
        return <Calendar size={14} />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'confirmed':
        return 'CONFIRMED';
      case 'pending':
        return 'PENDING';
      case 'completed':
        return 'COMPLETED';
      case 'cancelled':
        return 'CANCELLED';
      case 'no-show':
        return 'NO SHOW';
      default:
        return status?.toUpperCase() || 'UNKNOWN';
    }
  };

  const loadData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      setCurrentUser(user);
      
      // Load appointments from MongoDB
      const response = await appointmentAPI.getMyAppointments();
      
      if (response.success) {
        let allApps = response.data || [];
        
        // Filter for this patient's appointments
        let userApps = allApps;
        
        // Count expired appointments
        const expired = userApps.filter(app => isExpired(app.date));
        setExpiredCount(expired.length);
        
        // Show only today and future appointments
        const activeAppointments = userApps.filter(app => !isExpired(app.date));
        
        // Sort by date (nearest first)
        setAppointments(activeAppointments.sort((a, b) => new Date(a.date) - new Date(b.date)));
        setLastUpdate(new Date());
      } else {
        throw new Error(response.message || 'Failed to load appointments');
      }
      
      // Load medical records from IndexedDB (keep as is)
      const patientId = user?.userId || user?.id;
      const records = JSON.parse(localStorage.getItem(`medical_records_${patientId}`) || '[]');
      setMedicalRecords(records);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing appointments...');
      loadData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleManualRefresh = () => {
    loadData(true);
  };

  const handleDeleteExpired = async () => {
    try {
      const response = await appointmentAPI.deleteExpiredAppointments();
      if (response.success) {
        await loadData();
        setShowExpiredModal(false);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error deleting expired:', error);
      alert('Failed to delete expired appointments');
    }
  };

  // Improved attach record function with better error handling
  const handleAttachRecord = async (appointmentId, record) => {
    try {
      // Prepare record data for attachment
      const recordData = {
        recordId: record.id,
        recordType: record.type || 'medical_record',
        recordName: record.diagnosis || record.type || 'Medical Record',
        recordUrl: record.files?.[0]?.data || '',
        uploadedBy: currentUser?.name || 'Patient'
      };
      
      const response = await appointmentAPI.attachRecord(appointmentId, record.id, recordData);
      if (response.success) {
        await loadData();
        setShowAttachModal(false);
        setActiveAppointmentId(null);
        alert('✅ Medical record attached successfully!');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error attaching record:', error);
      alert(error.response?.data?.message || 'Failed to attach record');
    }
  };

  // Function to get full record details by ID
  const getRecordById = (recordId) => {
    return medicalRecords.find(r => r.id === recordId || r._id === recordId);
  };

  // View file from attachment
  const handleViewAttachedFile = (record, file) => {
    setSelectedRecord(record);
    setSelectedFile(file);
    setShowViewModal(true);
  };

  const handleDownloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle expanded attachments view
  const toggleAttachments = (appointmentId) => {
    setExpandedAttachments(prev => ({
      ...prev,
      [appointmentId]: !prev[appointmentId]
    }));
  };

  // Get file icon based on file type
  const getFileIcon = (fileType) => {
    if (fileType === 'image') return <Image size={12} />;
    return <File size={12} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-teal-600" size={40} />
          <p className="text-slate-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Plus_Jakarta_Sans'] pb-20">
      <header className="bg-[#0f172a] pt-16 pb-48 px-6 lg:px-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter text-center md:text-left">
                Your <span className="text-teal-400">Visits</span>
              </h1>
              <p className="text-slate-400 font-bold mt-2 text-center md:text-left">
                Showing today & future appointments only
              </p>
              {currentUser && (
                <p className="text-teal-400 text-sm mt-2 text-center md:text-left">
                  Patient: {currentUser.name}
                </p>
              )}
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
          <p className="text-slate-500 text-xs mt-4 text-center md:text-left">
            Last updated: {lastUpdate.toLocaleTimeString()} • Auto-refreshes every 30 seconds
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-20 -mt-32 relative z-20">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        {expiredCount > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-[2rem] p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-amber-600" size={24} />
              <div>
                <p className="font-black text-amber-800">{expiredCount} expired appointment(s)</p>
                <p className="text-sm text-amber-600">Past appointments are automatically deleted</p>
              </div>
            </div>
            <button
              onClick={() => setShowExpiredModal(true)}
              className="px-6 py-3 bg-amber-600 text-white rounded-xl font-black text-sm hover:bg-amber-700 transition-all flex items-center gap-2"
            >
              <Trash2 size={16} />
              DELETE NOW
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {appointments.length > 0 ? (
              appointments.map((app) => {
                const isTodayApp = isToday(app.date);
                const isPending = app.status === 'pending';
                
                // Get attached records with full details
                const attachedRecords = (app.attachedRecords || []).map(rec => {
                  // If recordId is stored, try to find full record
                  if (rec.recordId) {
                    const fullRecord = getRecordById(rec.recordId);
                    if (fullRecord) {
                      return {
                        ...rec,
                        ...fullRecord,
                        files: fullRecord.files || []
                      };
                    }
                  }
                  return rec;
                });
                
                const hasAttachments = attachedRecords.length > 0;
                const isExpanded = expandedAttachments[app._id];
                
                return (
                  <div 
                    key={app._id} 
                    className={`bg-white rounded-[2.5rem] p-8 shadow-xl border hover:border-teal-200 transition-all group ${
                      isTodayApp ? 'border-purple-300 bg-purple-50/30' : 'border-white'
                    } ${isPending ? 'border-l-8 border-l-amber-400' : ''}`}
                  >
                    {isTodayApp && (
                      <div className="mb-4">
                        <span className="px-4 py-2 bg-purple-600 text-white rounded-full text-xs font-black">
                          TODAY
                        </span>
                      </div>
                    )}

                    {isPending && (
                      <div className="mb-4">
                        <span className="px-4 py-2 bg-amber-500 text-white rounded-full text-xs font-black flex items-center gap-2 w-fit animate-pulse">
                          <ClockIcon size={12} />
                          PENDING CONFIRMATION
                        </span>
                      </div>
                    )}

                    {app.status === 'confirmed' && (
                      <div className="mb-4">
                        <span className="px-4 py-2 bg-emerald-500 text-white rounded-full text-xs font-black flex items-center gap-2 w-fit">
                          <Calendar size={12} />
                          CONFIRMED BY DOCTOR
                        </span>
                      </div>
                    )}

                    {app.status === 'cancelled' && (
                      <div className="mb-4">
                        <span className="px-4 py-2 bg-red-500 text-white rounded-full text-xs font-black flex items-center gap-2 w-fit">
                          <AlertCircle size={12} />
                          CANCELLED BY DOCTOR
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <Stethoscope className="text-teal-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-[#0f172a]">{app.doctorName}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{app.specialization}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mb-6">
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                            <Calendar size={14} className="text-teal-500" /> 
                            {new Date(app.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                            <Clock size={14} className="text-teal-500" /> {app.time}
                          </div>
                          <div className={`flex items-center gap-2 text-[10px] font-black px-4 py-2 rounded-xl border ${getStatusBadge(app.status, app.date)}`}>
                            {getStatusIcon(app.status)}
                            {getStatusText(app.status)}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                            {app.type?.includes('Video') ? <ExternalLink size={14} /> : <Calendar size={14} />}
                            {app.type?.includes('Video') ? (app.videoLink || 'Video Call') : (app.location || 'Clinic Visit')}
                          </div>
                        </div>

                        {app.notes && (
                          <div className="mt-2 mb-3 p-2 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500">
                              <span className="font-bold">Reason:</span> {app.notes}
                            </p>
                          </div>
                        )}

                        {/* ATTACHED REPORTS SECTION - IMPROVED */}
                        {hasAttachments && (
                          <div className="mt-4">
                            <button
                              onClick={() => toggleAttachments(app._id)}
                              className="flex items-center gap-2 text-[10px] font-black text-teal-600 uppercase hover:text-teal-700 transition-colors"
                            >
                              <Paperclip size={12} />
                              {attachedRecords.length} Attached Report(s)
                              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                            
                            {isExpanded && (
                              <div className="mt-3 space-y-2">
                                {attachedRecords.map((record, idx) => (
                                  <div key={record.recordId || idx} className="bg-teal-50/30 rounded-xl p-3 border border-teal-100">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <FileText size={14} className="text-teal-600" />
                                        <span className="font-black text-sm text-slate-800">
                                          {record.recordName || record.diagnosis || record.type}
                                        </span>
                                      </div>
                                      <span className="text-[8px] font-black text-slate-400">
                                        {record.uploadedAt ? new Date(record.uploadedAt).toLocaleDateString() : record.date}
                                      </span>
                                    </div>
                                    
                                    {/* Files in this record */}
                                    {record.files && record.files.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {record.files.map((file, fileIdx) => (
                                          <button
                                            key={fileIdx}
                                            onClick={() => handleViewAttachedFile(record, file)}
                                            className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:text-teal-600 hover:bg-teal-50 transition-colors shadow-sm"
                                          >
                                            {getFileIcon(file.fileType)}
                                            <span className="max-w-[120px] truncate">{file.name}</span>
                                            <Eye size={10} className="ml-1" />
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {/* Doctor's notes if any */}
                                    {record.uploadedByName && (
                                      <p className="text-[8px] text-slate-400 mt-2">
                                        Uploaded by: {record.uploadedByName}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {!isExpanded && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {attachedRecords.slice(0, 2).map((record, idx) => (
                                  <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-teal-50 rounded-lg">
                                    <FileText size={10} className="text-teal-500" />
                                    <span className="text-[9px] font-bold text-teal-700 truncate max-w-[100px]">
                                      {record.recordName || record.diagnosis}
                                    </span>
                                  </div>
                                ))}
                                {attachedRecords.length > 2 && (
                                  <span className="text-[9px] text-slate-400 px-2 py-1">
                                    +{attachedRecords.length - 2} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-between items-end">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border flex items-center gap-2 ${
                          app.status === 'confirmed' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 
                          app.status === 'pending' ? 'bg-amber-50 text-amber-500 border-amber-100' :
                          app.status === 'completed' ? 'bg-blue-50 text-blue-500 border-blue-100' :
                          app.status === 'cancelled' ? 'bg-red-50 text-red-500 border-red-100' :
                          'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          {getStatusIcon(app.status)}
                          {getStatusText(app.status)}
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          {app.status === 'confirmed' && app.type?.includes('Video') && app.videoLink && (
                            <a 
                              href={app.videoLink.startsWith('http') ? app.videoLink : `https://${app.videoLink}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="px-4 py-3 bg-purple-600 text-white rounded-xl font-black text-xs hover:bg-purple-700 transition-all flex items-center gap-2"
                            >
                              <ExternalLink size={14} /> JOIN CALL
                            </a>
                          )}
                          <button 
                            onClick={() => { 
                              setActiveAppointmentId(app._id); 
                              setActiveAppointment(app);
                              setShowAttachModal(true); 
                            }} 
                            className="px-4 py-3 bg-teal-50 text-teal-600 rounded-xl font-black text-xs hover:bg-teal-100 transition-all flex items-center gap-2"
                          >
                            <Paperclip size={14} /> ATTACH
                          </button>
                        </div>

                        {app.status === 'pending' && (
                          <p className="text-[10px] text-amber-500 mt-3 text-center">
                            ⏳ Awaiting doctor's confirmation
                          </p>
                        )}
                        {app.status === 'confirmed' && (
                          <p className="text-[10px] text-emerald-500 mt-3 text-center">
                            ✓ Appointment confirmed by doctor
                          </p>
                        )}
                        {app.status === 'cancelled' && (
                          <p className="text-[10px] text-red-500 mt-3 text-center">
                            ✗ Appointment cancelled by doctor
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200">
                <Calendar className="mx-auto text-slate-200 mb-4" size={48} />
                <p className="text-slate-400 font-bold text-lg">No upcoming appointments</p>
                <p className="text-slate-400 text-sm mt-2">Book an appointment with our specialists</p>
                <button
                  onClick={() => navigate('/doctors')}
                  className="mt-6 px-8 py-4 bg-teal-600 text-white rounded-xl font-black text-sm hover:bg-teal-700 transition-all"
                >
                  FIND DOCTORS
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="bg-[#0f172a] rounded-[2.5rem] p-8 shadow-xl text-white sticky top-6">
              <h4 className="text-xl font-black mb-4">Summary</h4>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                  <span className="text-slate-300">Total Upcoming</span>
                  <span className="text-2xl font-black text-teal-400">{appointments.length}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                  <span className="text-slate-300">Pending</span>
                  <span className="text-2xl font-black text-amber-400">
                    {appointments.filter(a => a.status === 'pending').length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                  <span className="text-slate-300">Confirmed</span>
                  <span className="text-2xl font-black text-emerald-400">
                    {appointments.filter(a => a.status === 'confirmed').length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                  <span className="text-slate-300">Today</span>
                  <span className="text-2xl font-black text-purple-400">
                    {appointments.filter(a => isToday(a.date)).length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                  <span className="text-slate-300">Total Records</span>
                  <span className="text-2xl font-black text-amber-400">{medicalRecords.length}</span>
                </div>

                {currentUser && (
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                    <span className="text-slate-300">Patient ID</span>
                    <span className="text-sm font-black text-amber-400">{currentUser.userId || currentUser.id}</span>
                  </div>
                )}
              </div>

              <button 
                onClick={() => navigate('/medical-records')} 
                className="w-full py-4 bg-teal-500 text-[#0f172a] rounded-2xl font-black text-xs hover:bg-teal-400 transition-all"
              >
                VIEW MEDICAL VAULT ({medicalRecords.length})
              </button>

              <button
                onClick={() => {
                  if (expiredCount > 0) {
                    setShowExpiredModal(true);
                  } else {
                    alert('No expired appointments to clean up');
                  }
                }}
                className="w-full mt-3 py-3 bg-white/5 text-white rounded-2xl font-black text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                CLEAN EXPIRED ({expiredCount})
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Attach Record Modal - IMPROVED with better record display */}
      {showAttachModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-[#0f172a]">Attach Medical Record</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Appointment with {activeAppointment?.doctorName} on {activeAppointment?.date}
                </p>
              </div>
              <button onClick={() => setShowAttachModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {medicalRecords.length > 0 ? (
                medicalRecords.map(record => {
                  // Check if already attached
                  const isAlreadyAttached = activeAppointment?.attachedRecords?.some(
                    r => r.recordId === record.id || r.recordId === record._id
                  );
                  
                  return (
                    <div 
                      key={record.id} 
                      className={`p-4 border rounded-2xl transition-all ${
                        isAlreadyAttached 
                          ? 'border-green-200 bg-green-50 opacity-60 cursor-not-allowed' 
                          : 'border-slate-100 hover:bg-teal-50 cursor-pointer'
                      }`}
                      onClick={() => !isAlreadyAttached && handleAttachRecord(activeAppointmentId, record)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900">{record.diagnosis || record.type}</h4>
                          <p className="text-[10px] text-slate-400 uppercase font-black">{record.date}</p>
                          {record.files && (
                            <p className="text-[8px] text-teal-600 mt-1">
                              📎 {record.files.length} file(s)
                            </p>
                          )}
                        </div>
                        {isAlreadyAttached ? (
                          <span className="px-2 py-1 bg-green-100 text-green-600 rounded-lg text-[8px] font-black">
                            ATTACHED ✓
                          </span>
                        ) : (
                          <PlusCircle size={20} className="text-teal-500" />
                        )}
                      </div>
                      
                      {/* Preview of files in this record */}
                      {record.files && record.files.length > 0 && !isAlreadyAttached && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {record.files.slice(0, 2).map((file, idx) => (
                            <span key={idx} className="text-[8px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                              {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
                            </span>
                          ))}
                          {record.files.length > 2 && (
                            <span className="text-[8px] text-slate-400">+{record.files.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto text-slate-300 mb-3" size={40} />
                  <p className="text-slate-400 text-sm">No records found in your medical vault.</p>
                  <button
                    onClick={() => {
                      setShowAttachModal(false);
                      navigate('/medical-records');
                    }}
                    className="mt-4 text-teal-600 font-bold text-sm hover:underline"
                  >
                    Upload Records First →
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => navigate('/medical-records')}
                className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
              >
                + Add New Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Expired Confirmation Modal */}
      {showExpiredModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-amber-600" size={32} />
              </div>
              <h2 className="text-2xl font-black text-[#0f172a]">Delete Expired?</h2>
              <p className="text-slate-500 mt-2">
                You have <span className="font-black text-amber-600">{expiredCount}</span> expired appointment(s).
                These will be permanently removed.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowExpiredModal(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={handleDeleteExpired}
                className="flex-1 py-4 bg-amber-600 text-white rounded-xl font-black text-sm hover:bg-amber-700 transition-all"
              >
                DELETE ALL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View File Modal - IMPROVED with better navigation */}
      {showViewModal && selectedFile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-4xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-[#0f172a]">{selectedFile.name}</h2>
                <p className="text-slate-400 text-sm">
                  {(selectedFile.size / 1024).toFixed(1)} KB • 
                  {selectedRecord && ` ${selectedRecord.date || selectedRecord.uploadedAt}`}
                </p>
                {selectedRecord && (
                  <p className="text-teal-600 text-xs mt-1">
                    From: {selectedRecord.recordName || selectedRecord.diagnosis}
                  </p>
                )}
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-8">
              {selectedFile.fileType === 'image' ? (
                <div className="flex justify-center">
                  <img 
                    src={selectedFile.data} 
                    alt={selectedFile.name}
                    className="max-w-full max-h-[60vh] object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText size={64} className="mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600 mb-4">PDF Document - {selectedFile.name}</p>
                  <button
                    onClick={() => handleDownloadFile(selectedFile)}
                    className="bg-teal-600 text-white px-6 py-3 rounded-xl font-black hover:bg-teal-700 transition-all inline-flex items-center gap-2"
                  >
                    <Download size={18} /> DOWNLOAD PDF
                  </button>
                  <p className="text-slate-400 text-xs mt-4">
                    Click download to view the complete document
                  </p>
                </div>
              )}
            </div>
            
            {/* File metadata */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl">
              <p className="text-[10px] text-slate-400">
                <span className="font-bold">File Info:</span> {selectedFile.name} • 
                {(selectedFile.size / 1024).toFixed(1)} KB • 
                {selectedFile.fileType === 'image' ? 'Image File' : 'PDF Document'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;