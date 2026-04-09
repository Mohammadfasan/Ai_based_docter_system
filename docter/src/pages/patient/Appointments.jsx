// Appointments.jsx - Using ONLY MongoDB
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Stethoscope, RefreshCw, 
  PlusCircle, FileText, Paperclip, ExternalLink, 
  AlertCircle, Trash2, Eye, Download, X, Clock as ClockIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../../services/appointmentAPI';

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [activeAppointmentId, setActiveAppointmentId] = useState(null);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [expiredCount, setExpiredCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

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

  // Get status badge styling based on status
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

  // Get status icon based on status
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

  // Get status text with styling
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      setCurrentUser(user);
      
      // Load appointments from MongoDB
      const response = await appointmentAPI.getMyAppointments();
      
      if (response.success) {
        let allApps = response.data || [];
        
        // Filter for this patient's appointments (already filtered by API)
        let userApps = allApps;
        
        // Count expired appointments (past dates that are not pending/confirmed)
        const expired = userApps.filter(app => isExpired(app.date));
        setExpiredCount(expired.length);
        
        // Show only today and future appointments (not expired)
        const activeAppointments = userApps.filter(app => !isExpired(app.date));
        
        // Sort by date (nearest first)
        setAppointments(activeAppointments.sort((a, b) => new Date(a.date) - new Date(b.date)));
      } else {
        throw new Error(response.message || 'Failed to load appointments');
      }
      
      // Load medical records from localStorage (keep this as is or move to MongoDB)
      const patientId = user?.userId || user?.id;
      const records = JSON.parse(localStorage.getItem(`medical_records_${patientId}`) || '[]');
      setMedicalRecords(records);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // Delete expired appointments via API
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

  const handleAttachRecord = async (appointmentId, recordId) => {
    try {
      const response = await appointmentAPI.attachRecord(appointmentId, recordId);
      if (response.success) {
        await loadData();
        setShowAttachModal(false);
      }
    } catch (error) {
      console.error('Error attaching record:', error);
      alert('Failed to attach record');
    }
  };

  const handleViewFile = (record, file) => {
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
                const isConfirmed = app.status === 'confirmed';
                
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
                        <span className="px-4 py-2 bg-amber-500 text-white rounded-full text-xs font-black flex items-center gap-2 w-fit">
                          <ClockIcon size={12} />
                          PENDING CONFIRMATION
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

                        {app.attachedRecords && app.attachedRecords.length > 0 && (
                          <div className="mt-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Attached Reports</p>
                            <div className="flex flex-wrap gap-2">
                              {app.attachedRecords.map(recId => {
                                const record = medicalRecords.find(r => r.id === recId);
                                return record ? (
                                  <div key={recId} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-bold border border-blue-100">
                                    <FileText size={12} />
                                    <span>{record.diagnosis || record.type}</span>
                                    {record.files && record.files.length > 0 && (
                                      <button
                                        onClick={() => handleViewFile(record, record.files[0])}
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                      >
                                        <Eye size={10} />
                                      </button>
                                    )}
                                  </div>
                                ) : null;
                              })}
                            </div>
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
                  <span className="text-slate-300">This Week</span>
                  <span className="text-2xl font-black text-blue-400">
                    {appointments.filter(a => {
                      const date = new Date(a.date);
                      const today = new Date();
                      const weekLater = new Date(today);
                      weekLater.setDate(today.getDate() + 7);
                      return date <= weekLater;
                    }).length}
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

      {/* Attach Record Modal */}
      {showAttachModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-[#0f172a]">Select Report</h2>
              <button onClick={() => setShowAttachModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {medicalRecords.length > 0 ? (
                medicalRecords.map(record => (
                  <div 
                    key={record.id} 
                    onClick={() => handleAttachRecord(activeAppointmentId, record.id)} 
                    className="p-4 border border-slate-100 rounded-2xl hover:bg-teal-50 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900">{record.diagnosis || record.type}</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-black">{record.date}</p>
                      {record.files && (
                        <p className="text-[8px] text-teal-600 mt-1">
                          {record.files.length} file(s)
                        </p>
                      )}
                    </div>
                    <PlusCircle size={20} className="text-teal-500" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto text-slate-300 mb-3" size={40} />
                  <p className="text-slate-400 text-sm">No records found in vault.</p>
                  <button
                    onClick={() => {
                      setShowAttachModal(false);
                      navigate('/medical-records');
                    }}
                    className="mt-4 text-teal-600 font-bold text-sm hover:underline"
                  >
                    Upload Records
                  </button>
                </div>
              )}
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

      {/* View File Modal */}
      {showViewModal && selectedFile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-4xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-[#0f172a]">{selectedFile.name}</h2>
                <p className="text-slate-400 text-sm">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
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
                  <p className="text-slate-600 mb-4">PDF Document</p>
                  <button
                    onClick={() => handleDownloadFile(selectedFile)}
                    className="bg-teal-600 text-white px-6 py-3 rounded-xl font-black hover:bg-teal-700 transition-all inline-flex items-center gap-2"
                  >
                    <Download size={18} /> DOWNLOAD PDF
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

export default Appointments;