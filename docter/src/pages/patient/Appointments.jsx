import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, Clock, Stethoscope, RefreshCw, 
  PlusCircle, FileText, Paperclip, ExternalLink, 
  AlertCircle, Trash2, Eye, Download, X, 
  Clock as ClockIcon, CheckCircle, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [activeAppointmentId, setActiveAppointmentId] = useState(null);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [expiredCount, setExpiredCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [successMessage, setSuccessMessage] = useState('');

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

  const getStatusBadge = (status, date) => {
    if (isToday(date)) return 'bg-purple-50 text-purple-600 border-purple-100';
    switch(status) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'completed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed': return <CheckCircle size={14} className="text-emerald-500" />;
      case 'pending': return <ClockIcon size={14} className="text-amber-500" />;
      case 'completed': return <FileText size={14} className="text-blue-500" />;
      case 'cancelled': return <XCircle size={14} className="text-red-500" />;
      default: return <Calendar size={14} />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'confirmed': return 'CONFIRMED';
      case 'pending': return 'PENDING';
      case 'completed': return 'COMPLETED';
      case 'cancelled': return 'CANCELLED';
      default: return status?.toUpperCase() || 'UNKNOWN';
    }
  };

  // Load appointments from MongoDB (NO localStorage)
  const loadData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      setCurrentUser(user);
      
      // Fetch appointments from MongoDB
      const response = await axios.get(`${API_URL}/appointments/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        let allApps = response.data.data || [];
        
        console.log(`📋 Found ${allApps.length} total appointments from MongoDB`);
        
        const expired = allApps.filter(app => isExpired(app.date));
        setExpiredCount(expired.length);
        
        const activeAppointments = allApps.filter(app => !isExpired(app.date));
        
        setAppointments(activeAppointments.sort((a, b) => new Date(a.date) - new Date(b.date)));
        setLastUpdate(new Date());
      } else {
        throw new Error(response.data.message || 'Failed to load appointments');
      }
      
      // Fetch medical records from MongoDB
      try {
        const recordsResponse = await axios.get(`${API_URL}/medical-records/my-records`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (recordsResponse.data.success) {
          setMedicalRecords(recordsResponse.data.data || []);
        }
      } catch (recordsError) {
        console.log('No medical records found');
        setMedicalRecords([]);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing appointments from MongoDB...');
      loadData(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadData]);

  const handleManualRefresh = () => {
    loadData(true);
  };

  // Delete expired appointments from MongoDB
  const handleDeleteExpired = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/appointments/expired`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSuccessMessage(`Deleted ${response.data.deletedCount} expired appointments`);
        setTimeout(() => setSuccessMessage(''), 3000);
        await loadData();
        setShowExpiredModal(false);
      }
    } catch (error) {
      console.error('Error deleting expired:', error);
      setError('Failed to delete expired appointments');
    }
  };

  const handleAttachRecord = async (appointmentId, recordId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/appointments/${appointmentId}/attach`, {
        recordId: recordId,
        recordName: medicalRecords.find(r => r._id === recordId)?.diagnosis || 'Medical Record'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSuccessMessage('Record attached successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        await loadData();
        setShowAttachModal(false);
      }
    } catch (error) {
      console.error('Error attaching record:', error);
      setError('Failed to attach record');
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
          <p className="text-slate-600">Loading appointments from MongoDB...</p>
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
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                Your <span className="text-teal-400">Visits</span>
              </h1>
              <p className="text-slate-400 font-bold mt-2">
                Live from MongoDB Database
              </p>
              {currentUser && (
                <p className="text-teal-400 text-sm mt-2">
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
          <p className="text-slate-500 text-xs mt-4">
            Last updated: {lastUpdate.toLocaleTimeString()} • Auto-refreshes every 30 seconds
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-20 -mt-32 relative z-20">
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 text-green-600 text-sm">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        {expiredCount > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-[2rem] p-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-amber-600" size={24} />
              <div>
                <p className="font-black text-amber-800">{expiredCount} expired appointment(s)</p>
                <p className="text-sm text-amber-600">Past appointments will be deleted from MongoDB</p>
              </div>
            </div>
            <button
              onClick={() => setShowExpiredModal(true)}
              className="px-6 py-3 bg-amber-600 text-white rounded-xl font-black text-sm hover:bg-amber-700 transition-all flex items-center gap-2"
            >
              <Trash2 size={16} />
              DELETE EXPIRED
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
                        <span className="px-4 py-2 bg-amber-500 text-white rounded-full text-xs font-black flex items-center gap-2 w-fit animate-pulse">
                          <ClockIcon size={12} />
                          PENDING CONFIRMATION
                        </span>
                      </div>
                    )}

                    {app.status === 'confirmed' && (
                      <div className="mb-4">
                        <span className="px-4 py-2 bg-emerald-500 text-white rounded-full text-xs font-black flex items-center gap-2 w-fit">
                          <CheckCircle size={12} />
                          CONFIRMED BY DOCTOR
                        </span>
                      </div>
                    )}

                    {app.status === 'cancelled' && (
                      <div className="mb-4">
                        <span className="px-4 py-2 bg-red-500 text-white rounded-full text-xs font-black flex items-center gap-2 w-fit">
                          <XCircle size={12} />
                          CANCELLED
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
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 bg-slate-50 px-4 py-2 rounded-xl">
                            <Calendar size={14} className="text-teal-500" /> 
                            {new Date(app.date).toLocaleDateString('en-US', { 
                              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 bg-slate-50 px-4 py-2 rounded-xl">
                            <Clock size={14} className="text-teal-500" /> {app.time}
                          </div>
                          <div className={`flex items-center gap-2 text-[10px] font-black px-4 py-2 rounded-xl border ${getStatusBadge(app.status, app.date)}`}>
                            {getStatusIcon(app.status)}
                            {getStatusText(app.status)}
                          </div>
                        </div>

                        {app.notes && (
                          <div className="mt-2 mb-3 p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-600">
                              <span className="font-bold">Reason:</span> {app.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-between items-end">
                        <div className="flex gap-2">
                          {app.status === 'confirmed' && app.type === 'video' && app.videoLink && (
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
                        {app.status === 'confirmed' && (
                          <p className="text-[10px] text-emerald-500 mt-3 text-center">
                            ✓ Appointment confirmed
                          </p>
                        )}
                        {app.status === 'cancelled' && (
                          <p className="text-[10px] text-red-500 mt-3 text-center">
                            ✗ Appointment cancelled
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
                  <span className="text-slate-300">Medical Records</span>
                  <span className="text-2xl font-black text-amber-400">{medicalRecords.length}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/medical-records')} 
                className="w-full py-4 bg-teal-500 text-[#0f172a] rounded-2xl font-black text-xs hover:bg-teal-400 transition-all"
              >
                VIEW MEDICAL RECORDS
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
              <h2 className="text-2xl font-black text-[#0f172a]">Select Record</h2>
              <button onClick={() => setShowAttachModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {medicalRecords.length > 0 ? (
                medicalRecords.map(record => (
                  <div 
                    key={record._id} 
                    onClick={() => handleAttachRecord(activeAppointmentId, record._id)} 
                    className="p-4 border border-slate-100 rounded-2xl hover:bg-teal-50 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900">{record.diagnosis || record.type}</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-black">{record.date}</p>
                      {record.files && (
                        <p className="text-[8px] text-teal-600 mt-1">{record.files.length} file(s)</p>
                      )}
                    </div>
                    <PlusCircle size={20} className="text-teal-500" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto text-slate-300 mb-3" size={40} />
                  <p className="text-slate-400 text-sm">No medical records found.</p>
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

      {/* Delete Expired Modal */}
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
              </p>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setShowExpiredModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-xl font-black text-sm">
                CANCEL
              </button>
              <button onClick={handleDeleteExpired} className="flex-1 py-4 bg-amber-600 text-white rounded-xl font-black text-sm hover:bg-amber-700">
                DELETE ALL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View File Modal */}
      {showViewModal && selectedFile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-4xl w-full p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-[#0f172a]">{selectedFile.name}</h2>
                <p className="text-slate-400 text-sm">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-8">
              {selectedFile.fileType === 'image' ? (
                <div className="flex justify-center">
                  <img src={selectedFile.data} alt={selectedFile.name} className="max-w-full max-h-[60vh] object-contain rounded-xl" />
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText size={64} className="mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600 mb-4">PDF Document</p>
                  <button onClick={() => handleDownloadFile(selectedFile)} className="bg-teal-600 text-white px-6 py-3 rounded-xl font-black hover:bg-teal-700 transition-all inline-flex items-center gap-2">
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