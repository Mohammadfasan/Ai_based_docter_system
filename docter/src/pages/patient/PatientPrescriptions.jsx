// PatientPrescriptions.jsx - Same Color Scheme as Appointments Page
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Search, X, Stethoscope, 
  ChevronRight, Download, Printer, 
  Calendar, Pill, User, Clock,
  CheckCircle, AlertCircle, FileWarning,
  Filter, Eye, Trash2, Edit, RefreshCw,
  Sparkles, Shield, Heart, Users, Activity,
  ClipboardCheck, Video, MapPin, ChevronDown, ChevronUp
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Prescription Hero Image
const PRESCRIPTION_HERO_IMAGE = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop";

const PatientPrescriptions = ({ userType, userData }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPatient, setCurrentPatient] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [expandedPrescriptions, setExpandedPrescriptions] = useState({});

  // Features for hero section - Same as Appointments
  const features = [
    { icon: Shield, title: "E-Prescriptions", description: "Digital & secure", color: "text-teal-400" },
    { icon: Clock, title: "Instant Access", description: "24/7 availability", color: "text-blue-400" },
    { icon: Download, title: "Download PDF", description: "Print anytime", color: "text-purple-400" },
    { icon: Activity, title: "Track History", description: "All prescriptions", color: "text-emerald-400" }
  ];

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPatient) fetchPrescriptions();
    }, 500);
    return () => clearTimeout(timer);
  }, [filter, searchTerm]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentPatient(currentUser);
    
    try {
      const patientId = currentUser.userId || currentUser._id;
      if (!patientId) throw new Error('No patient ID found');
      
      const token = localStorage.getItem('token');
      if (token) {
        let url = `http://localhost:5000/api/prescriptions/patient/${patientId}`;
        const params = new URLSearchParams();
        if (filter !== 'all') params.append('status', filter);
        if (searchTerm) params.append('search', searchTerm);
        if (params.toString()) url += `?${params.toString()}`;
        
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setPrescriptions(data.data || []);
            if (data.counts) setStats({
              total: data.counts.total || 0,
              active: data.counts.active || 0,
              completed: data.counts.completed || 0
            });
            setLoading(false);
            return;
          }
        }
      }
      
      // Fallback to localStorage
      const allPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
      let patientPrescriptions = allPrescriptions.filter(pres => 
        pres.patient?.id === currentUser.userId || 
        pres.patientId === currentUser.userId ||
        pres.patient?.id === currentUser._id
      );
      
      if (filter !== 'all') patientPrescriptions = patientPrescriptions.filter(p => p.status === filter);
      if (searchTerm) patientPrescriptions = patientPrescriptions.filter(p => 
        p.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const sorted = patientPrescriptions.sort((a, b) => 
        new Date(b.dateTime || b.date) - new Date(a.dateTime || a.date)
      );
      
      setPrescriptions(sorted);
      setStats({
        total: sorted.length,
        active: sorted.filter(p => p.status === 'active').length,
        completed: sorted.filter(p => p.status === 'completed').length
      });
      
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPrescriptions();
    setRefreshing(false);
    toast.success('Prescriptions refreshed');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return dateString; }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle size={12} />;
      case 'completed': return <CheckCircle size={12} />;
      default: return <Clock size={12} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'ACTIVE';
      case 'completed': return 'COMPLETED';
      case 'cancelled': return 'CANCELLED';
      default: return 'UNKNOWN';
    }
  };

  const togglePrescription = (prescriptionId) => {
    setExpandedPrescriptions(prev => ({ ...prev, [prescriptionId]: !prev[prescriptionId] }));
  };

  const handleDownloadPDF = (prescription) => {
    try {
      const doc = new jsPDF();
      doc.setProperties({ title: `Prescription-${prescription._id || prescription.id}`, subject: 'Medical Prescription', author: prescription.doctor?.name || 'Doctor', creator: 'HealthAI' });

      // Header with gradient effect - Same as Appointments
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, doc.internal.pageSize.width, 45, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('MEDICAL PRESCRIPTION', 105, 20, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('HealthAI Medical Center', 105, 32, { align: 'center' });
      doc.text('Quality Healthcare Services', 105, 39, { align: 'center' });

      // ID and Date
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text(`ID: ${prescription.prescriptionId || prescription._id || 'N/A'}`, doc.internal.pageSize.width - 20, 15, { align: 'right' });
      doc.text(`Date: ${formatDate(prescription.date)}`, doc.internal.pageSize.width - 20, 22, { align: 'right' });

      // Status Badge
      const statusColor = prescription.status === 'active' ? [34, 197, 94] : prescription.status === 'completed' ? [59, 130, 246] : [239, 68, 68];
      doc.setFillColor(...statusColor);
      doc.roundedRect(doc.internal.pageSize.width - 45, 35, 35, 8, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text(prescription.status?.toUpperCase() || 'ACTIVE', doc.internal.pageSize.width - 27.5, 41, { align: 'center' });

      // Patient & Doctor Info
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('PATIENT INFORMATION', 20, 60);
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(20, 65, 85, 45, 3, 3, 'FD');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Full Name:', 25, 78);
      doc.text('Patient ID:', 25, 90);
      doc.text('Email:', 25, 102);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(prescription.patient?.name || currentPatient?.name || 'N/A', 70, 78);
      doc.text(prescription.patient?.userId || currentPatient?.userId || 'N/A', 70, 90);
      doc.text(prescription.patient?.email || currentPatient?.email || 'N/A', 70, 102);

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('DOCTOR INFORMATION', 120, 60);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(115, 65, 75, 45, 3, 3, 'FD');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Doctor Name:', 120, 78);
      doc.text('Doctor ID:', 120, 90);
      doc.text('Specialization:', 120, 102);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(prescription.doctor?.name || 'N/A', 175, 78, { align: 'right' });
      doc.text(prescription.doctor?.userId || prescription.doctor?.id || 'N/A', 175, 90, { align: 'right' });
      doc.text(prescription.doctor?.specialization || 'N/A', 175, 102, { align: 'right' });

      // Diagnosis
      let yPosition = 130;
      doc.setDrawColor(226, 232, 240);
      doc.line(20, yPosition - 5, doc.internal.pageSize.width - 20, yPosition - 5);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('DIAGNOSIS', 20, yPosition);
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.text(prescription.diagnosis || 'N/A', 25, yPosition + 10);
      yPosition += 30;

      // Symptoms
      if (prescription.symptoms) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Symptoms:', 20, yPosition);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        const symptomsLines = doc.splitTextToSize(prescription.symptoms, 170);
        doc.text(symptomsLines, 25, yPosition + 7);
        yPosition += 20 + (symptomsLines.length * 5);
      }

      // Medicines Table
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('PRESCRIBED MEDICINES', 20, yPosition);
      
      const tableData = prescription.medicines?.map(med => [med.name || 'N/A', med.dosage || '-', med.frequency || '-', med.duration || '-']) || [];
      autoTable(doc, {
        startY: yPosition + 5,
        head: [['Medicine Name', 'Dosage', 'Frequency', 'Duration']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold', halign: 'center' },
        bodyStyles: { fontSize: 9, textColor: [15, 23, 42] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 20, right: 20 }
      });

      // Instructions
      if (prescription.instructions) {
        const finalY = doc.lastAutoTable.finalY + 12;
        doc.setDrawColor(226, 232, 240);
        doc.line(20, finalY - 8, doc.internal.pageSize.width - 20, finalY - 8);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("DOCTOR'S INSTRUCTIONS", 20, finalY);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        const instructionsLines = doc.splitTextToSize(prescription.instructions, 170);
        doc.text(instructionsLines, 25, finalY + 7);
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(`Generated by HealthAI • ${new Date().toLocaleString()}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      }

      doc.save(`Prescription_${prescription.patient?.name || currentPatient?.name || 'Patient'}_${formatDate(prescription.date)}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handleUpdateStatus = async (prescriptionId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`http://localhost:5000/api/prescriptions/${prescriptionId}/status`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        if (response.ok) {
          toast.success(`Prescription marked as ${newStatus}`);
          fetchPrescriptions();
          return;
        }
      }
      toast.success(`Prescription marked as ${newStatus}`);
      fetchPrescriptions();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-teal-600" size={40} />
          <p className="text-slate-600">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Plus_Jakarta_Sans'] pb-20">
      <Toaster position="top-right" />
      
      {/* Hero Section - Same as Appointments Page */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div className="max-w-[90rem] mx-auto px-6 lg:px-20 py-16 lg:py-24 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20">
                <Sparkles size={16} className="text-teal-400" />
                <span className="text-white text-sm font-medium">Your Digital Health Records</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tighter mb-6 leading-tight">
                My 
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
                  Prescriptions
                </span>
              </h1>
              
              <p className="text-base lg:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                View and manage all your medical prescriptions in one place. Download PDFs, 
                track medication history, and access your health records anytime, anywhere.
              </p>

             

            

              
             
            </div>

            <div className="flex-1">
              <div className="rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={PRESCRIPTION_HERO_IMAGE}
                  alt="Medical Prescriptions" 
                  className="w-full h-auto object-cover"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>

      
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-20 -mt-32 relative z-20">
        
   
        {/* Prescriptions Grid */}
        {prescriptions.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200">
            <FileText className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold text-lg">No Prescriptions Found</p>
            <p className="text-slate-400 text-sm mt-2">
              {searchTerm || filter !== 'all' ? 'Try adjusting your search or filter criteria' : 'No prescriptions available yet'}
            </p>
            {(searchTerm || filter !== 'all') && (
              <button
                onClick={() => { setSearchTerm(''); setFilter('all'); }}
                className="mt-6 px-6 py-3 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-600 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {prescriptions.map((pres) => {
              const isExpanded = expandedPrescriptions[pres._id || pres.id];
              const medicinesCount = pres.medicines?.length || 0;
              
              return (
                <div 
                  key={pres._id || pres.id}
                  className={`bg-white rounded-[2.5rem] p-6 shadow-xl border transition-all group hover:shadow-2xl ${
                    pres.status === 'active' ? 'border-l-8 border-l-amber-400' : 
                    pres.status === 'completed' ? 'border-l-8 border-l-blue-400' : 'border-l-8 border-l-gray-300'
                  }`}
                >
                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase border ${getStatusColor(pres.status)}`}>
                      {getStatusIcon(pres.status)}
                      {getStatusText(pres.status)}
                    </span>
                  </div>

                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                        <Pill className="text-teal-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 text-lg line-clamp-1">{pres.diagnosis || 'N/A'}</h3>
                        <p className="text-[10px] font-mono text-slate-400">{pres.prescriptionId || pres._id || pres.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="flex items-center gap-2 mb-3 p-2 bg-slate-50 rounded-xl">
                    <Stethoscope size={14} className="text-teal-500" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-700">{pres.doctor?.name || 'N/A'}</p>
                      {pres.doctor?.specialization && (
                        <p className="text-[9px] text-teal-600">{pres.doctor.specialization}</p>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 mb-3 text-slate-500">
                    <Calendar size={14} className="text-teal-500" />
                    <span className="text-xs font-medium">{formatDate(pres.date)}</span>
                    {pres.appointmentTime && (
                      <>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <Clock size={14} className="text-teal-500" />
                        <span className="text-xs font-medium">{pres.appointmentTime}</span>
                      </>
                    )}
                  </div>

                  {/* Medicines Preview */}
                  {medicinesCount > 0 && (
                    <div className="mb-3">
                      <button
                        onClick={() => togglePrescription(pres._id || pres.id)}
                        className="flex items-center justify-between w-full p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Pill size={12} className="text-teal-500" />
                          <span className="text-[10px] font-black text-slate-600 uppercase">
                            {medicinesCount} Medicine(s) Prescribed
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      
                      {isExpanded && (
                        <div className="mt-3 space-y-2">
                          {pres.medicines.map((med, idx) => (
                            <div key={idx} className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                              <p className="font-bold text-slate-800 text-sm">{med.name}</p>
                              <div className="flex flex-wrap gap-2 mt-1 text-[10px]">
                                <span className="bg-white px-2 py-0.5 rounded-full text-blue-700 font-bold">{med.dosage}</span>
                                <span className="text-slate-500">•</span>
                                <span className="text-slate-600">{med.frequency}</span>
                                <span className="text-slate-500">•</span>
                                <span className="text-slate-600">{med.duration}</span>
                              </div>
                              {med.notes && <p className="text-[9px] text-slate-500 mt-1">{med.notes}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {!isExpanded && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {pres.medicines.slice(0, 2).map((med, idx) => (
                            <span key={idx} className="text-[9px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                              {med.name}
                            </span>
                          ))}
                          {medicinesCount > 2 && (
                            <span className="text-[9px] text-slate-400 px-2 py-1">+{medicinesCount - 2} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Instructions Preview */}
                  {pres.instructions && !isExpanded && (
                    <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-[9px] font-bold text-amber-600 uppercase mb-1">Instructions</p>
                      <p className="text-[10px] text-slate-600 line-clamp-2">{pres.instructions}</p>
                    </div>
                  )}

                  {/* Refills */}
                  {pres.refills > 0 && (
                    <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-100 text-center">
                      <p className="text-[9px] font-bold text-green-600 uppercase">Refills Remaining</p>
                      <p className="text-lg font-black text-green-700">{pres.refills}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-dashed border-slate-200">
                    <button
                      onClick={() => { setSelectedPrescription(pres); setShowViewModal(true); }}
                      className="flex-1 py-2.5 bg-teal-50 text-teal-600 rounded-xl font-bold text-[10px] hover:bg-teal-100 transition-all flex items-center justify-center gap-1"
                    >
                      <Eye size={12} />
                      VIEW DETAILS
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(pres)}
                      className="flex-1 py-2.5 bg-purple-50 text-purple-600 rounded-xl font-bold text-[10px] hover:bg-purple-100 transition-all flex items-center justify-center gap-1"
                    >
                      <Download size={12} />
                      PDF
                    </button>
                    {pres.status === 'active' && (
                      <button
                        onClick={() => handleUpdateStatus(pres._id || pres.id, 'completed')}
                        className="flex-1 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-[10px] hover:bg-blue-100 transition-all flex items-center justify-center gap-1"
                      >
                        <CheckCircle size={12} />
                        COMPLETE
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail Modal - Same style as Appointments */}
      {showViewModal && selectedPrescription && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-sm" onClick={() => setShowViewModal(false)}></div>
          
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header - Same as Appointments */}
            <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] p-6 text-white sticky top-0 z-10">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black">Prescription Details</h2>
                      <p className="text-teal-400 text-xs font-mono">{selectedPrescription.prescriptionId || selectedPrescription._id || selectedPrescription.id}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Stethoscope size={14} className="text-teal-400" />
                      <span className="font-bold">{selectedPrescription.doctor?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-white/50" />
                      <span className="text-sm">{formatDate(selectedPrescription.date)}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase ${getStatusColor(selectedPrescription.status)}`}>
                      {getStatusIcon(selectedPrescription.status)}
                      {getStatusText(selectedPrescription.status)}
                    </span>
                  </div>
                </div>
                <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Patient Info */}
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <p className="text-[9px] font-black text-purple-600 uppercase mb-2 flex items-center gap-1">PATIENT INFORMATION</p>
                <p className="font-black text-slate-800 text-lg">{selectedPrescription.patient?.name || currentPatient?.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-purple-600">ID:</span>
                  <span className="text-xs font-mono text-slate-600">{selectedPrescription.patient?.userId || currentPatient?.userId}</span>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-2">DIAGNOSIS</p>
                <p className="text-lg font-bold text-slate-800">{selectedPrescription.diagnosis}</p>
                {selectedPrescription.symptoms && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">SYMPTOMS</p>
                    <p className="text-sm text-slate-600">{selectedPrescription.symptoms}</p>
                  </div>
                )}
              </div>

              {/* Medicines */}
              {selectedPrescription.medicines && selectedPrescription.medicines.length > 0 && (
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">PRESCRIBED MEDICINES</p>
                  <div className="space-y-3">
                    {selectedPrescription.medicines.map((med, idx) => (
                      <div key={idx} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-black text-slate-800">{med.name}</p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs">
                              <span className="text-blue-700 font-bold">{med.dosage}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-600">{med.frequency}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-600">{med.duration}</span>
                            </div>
                          </div>
                          {med.notes && <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">{med.notes}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              {selectedPrescription.instructions && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <p className="text-[9px] font-black text-amber-600 uppercase mb-2 flex items-center gap-1">DOCTOR'S INSTRUCTIONS</p>
                  <p className="text-sm text-amber-800 leading-relaxed">{selectedPrescription.instructions}</p>
                </div>
              )}

              {/* Notes */}
              {selectedPrescription.notes && (
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <p className="text-[9px] font-black text-purple-600 uppercase mb-2">ADDITIONAL NOTES</p>
                  <p className="text-sm text-purple-800">{selectedPrescription.notes}</p>
                </div>
              )}

              {/* Refills */}
              {selectedPrescription.refills > 0 && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
                  <p className="text-[9px] font-black text-green-600 uppercase mb-1">Refills Remaining</p>
                  <p className="text-3xl font-black text-green-700">{selectedPrescription.refills}</p>
                </div>
              )}

              {/* Status Update */}
              {selectedPrescription.status === 'active' && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-[9px] font-black text-blue-600 uppercase mb-2">Update Status</p>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedPrescription._id || selectedPrescription.id, 'completed');
                      setShowViewModal(false);
                    }}
                    className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Mark as Completed
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button 
                onClick={() => handleDownloadPDF(selectedPrescription)}
                className="flex-1 py-3 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-600 transition-all flex items-center justify-center gap-2"
              >
                <Download size={16} /> Download PDF
              </button>
              <button 
                onClick={() => window.print()}
                className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-bold text-sm hover:bg-purple-600 transition-all flex items-center justify-center gap-2"
              >
                <Printer size={16} /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;