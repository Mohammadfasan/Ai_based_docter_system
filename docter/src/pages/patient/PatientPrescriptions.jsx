// PatientPrescriptions.jsx - Complete fixed version with working PDF
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Search, X, Stethoscope, 
  ChevronRight, Download, Printer, 
  Calendar, Pill, User, Clock,
  CheckCircle, AlertCircle, FileWarning,
  Filter, Eye, Trash2, Edit, RefreshCw
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Import jsPDF and autoTable correctly
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (currentPatient) {
        fetchPrescriptions();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [filter, searchTerm]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    
    // Get current logged in patient
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentPatient(currentUser);
    
    try {
      const patientId = currentUser.userId || currentUser._id;
      if (!patientId) {
        throw new Error('No patient ID found');
      }
      
      // Try API first
      const token = localStorage.getItem('token');
      if (token) {
        let url = `http://localhost:5000/api/prescriptions/patient/${patientId}`;
        const params = new URLSearchParams();
        if (filter !== 'all') params.append('status', filter);
        if (searchTerm) params.append('search', searchTerm);
        if (params.toString()) url += `?${params.toString()}`;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setPrescriptions(data.data || []);
            if (data.counts) {
              setStats({
                total: data.counts.total || 0,
                active: data.counts.active || 0,
                completed: data.counts.completed || 0
              });
            }
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
        pres.patient?.id === currentUser._id ||
        pres.patient?.name === currentUser.name
      );
      
      // Apply filter
      if (filter !== 'all') {
        patientPrescriptions = patientPrescriptions.filter(p => p.status === filter);
      }
      
      // Apply search
      if (searchTerm) {
        patientPrescriptions = patientPrescriptions.filter(p => 
          p.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.doctor?.id?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Sort by date (newest first)
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
      
      // Fallback to localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const allPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
      const patientPrescriptions = allPrescriptions.filter(pres => 
        pres.patient?.id === currentUser.userId || 
        pres.patientId === currentUser.userId
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
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateTimeString;
    }
  };

  const handleUpdateStatus = async (prescriptionId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`http://localhost:5000/api/prescriptions/${prescriptionId}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
          toast.success(`Prescription marked as ${newStatus}`);
          fetchPrescriptions();
          return;
        }
      }
      
      // Fallback to localStorage
      const allPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
      const updated = allPrescriptions.map(p => 
        p.id === prescriptionId ? { ...p, status: newStatus } : p
      );
      localStorage.setItem('prescriptions', JSON.stringify(updated));
      toast.success(`Prescription marked as ${newStatus} (local)`);
      fetchPrescriptions();
      
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Fixed PDF Download Function with autoTable
  const handleDownloadPDF = (prescription) => {
    try {
      console.log('Generating PDF for:', prescription._id || prescription.id);
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
        title: `Prescription-${prescription._id || prescription.id}`,
        subject: 'Medical Prescription',
        author: prescription.doctor?.name || 'Doctor',
        creator: 'HealthAI'
      });

      // Add header with gradient effect
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, doc.internal.pageSize.width, 45, 'F');
      
      // Hospital/Clinic Name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('MEDICAL PRESCRIPTION', 105, 20, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('HealthAI Medical Center', 105, 32, { align: 'center' });
      doc.text('Quality Healthcare Services', 105, 39, { align: 'center' });
      
      // Prescription ID and Date (right side)
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text(`ID: ${prescription.prescriptionId || prescription._id || 'N/A'}`, doc.internal.pageSize.width - 20, 15, { align: 'right' });
      doc.text(`Date: ${formatDate(prescription.date)}`, doc.internal.pageSize.width - 20, 22, { align: 'right' });
      if (prescription.appointmentTime) {
        doc.text(`Time: ${prescription.appointmentTime}`, doc.internal.pageSize.width - 20, 29, { align: 'right' });
      }

      // Status Badge
      const statusColor = prescription.status === 'active' ? [34, 197, 94] : 
                         prescription.status === 'completed' ? [59, 130, 246] : [239, 68, 68];
      doc.setFillColor(...statusColor);
      doc.roundedRect(doc.internal.pageSize.width - 45, 35, 35, 8, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text(prescription.status?.toUpperCase() || 'ACTIVE', doc.internal.pageSize.width - 27.5, 41, { align: 'center' });

      // Patient Information Section
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('PATIENT INFORMATION', 20, 60);
      
      // Patient Info Box
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(20, 65, 85, 50, 3, 3, 'FD');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Full Name:', 25, 78);
      doc.text('Patient ID:', 25, 90);
      doc.text('Email:', 25, 102);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(prescription.patient?.name || currentPatient?.name || 'N/A', 70, 78);
      doc.text(prescription.patient?.userId || prescription.patient?.id || currentPatient?.userId || 'N/A', 70, 90);
      doc.text(prescription.patient?.email || currentPatient?.email || 'N/A', 70, 102);

      // Doctor Information Section
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('DOCTOR INFORMATION', 120, 60);
      
      // Doctor Info Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(115, 65, 75, 50, 3, 3, 'FD');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Doctor Name:', 120, 78);
      doc.text('Doctor ID:', 120, 90);
      doc.text('Specialization:', 120, 102);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(prescription.doctor?.name || 'N/A', 175, 78, { align: 'right' });
      doc.text(prescription.doctor?.userId || prescription.doctor?.id || 'N/A', 175, 90, { align: 'right' });
      doc.text(prescription.doctor?.specialization || 'N/A', 175, 102, { align: 'right' });

      // Diagnosis Section
      let yPosition = 130;
      doc.setDrawColor(226, 232, 240);
      doc.line(20, yPosition - 5, doc.internal.pageSize.width - 20, yPosition - 5);
      
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('DIAGNOSIS', 20, yPosition);
      
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(prescription.diagnosis || 'N/A', 25, yPosition + 10);
      
      yPosition += 25;
      
      // Symptoms Section
      if (prescription.symptoms) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Symptoms:', 20, yPosition);
        
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        const symptomsLines = doc.splitTextToSize(prescription.symptoms, 170);
        doc.text(symptomsLines, 25, yPosition + 7);
        yPosition += 15 + (symptomsLines.length * 5);
      }

      // Medicines Table
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('PRESCRIBED MEDICINES', 20, yPosition);
      
      // Prepare table data
      const tableData = prescription.medicines?.map(med => [
        med.name || 'N/A',
        med.dosage || '-',
        med.frequency || '-',
        med.duration || '-'
      ]) || [];

      // Generate table using autoTable function
      autoTable(doc, {
        startY: yPosition + 5,
        head: [['Medicine Name', 'Dosage', 'Frequency', 'Duration']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 5
        },
        bodyStyles: { 
          fontSize: 9,
          textColor: [15, 23, 42],
          cellPadding: 4
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 35 },
          2: { cellWidth: 45 },
          3: { cellWidth: 40 }
        },
        margin: { left: 20, right: 20 }
      });

      // Instructions Section
      if (prescription.instructions) {
        const finalY = doc.lastAutoTable.finalY + 12;
        
        doc.setDrawColor(226, 232, 240);
        doc.line(20, finalY - 8, doc.internal.pageSize.width - 20, finalY - 8);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text("DOCTOR'S INSTRUCTIONS", 20, finalY);
        
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        const instructionsLines = doc.splitTextToSize(prescription.instructions, 170);
        doc.text(instructionsLines, 25, finalY + 7);
      }

      // Additional Notes
      if (prescription.notes) {
        const notesY = (prescription.instructions ? doc.lastAutoTable.finalY + 35 : doc.lastAutoTable.finalY + 15);
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Additional Notes:', 20, notesY);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        const notesLines = doc.splitTextToSize(prescription.notes, 170);
        doc.text(notesLines, 25, notesY + 7);
      }

      // Refills Section
      if (prescription.refills && prescription.refills > 0) {
        const refillsY = doc.lastAutoTable.finalY + 45;
        
        doc.setFillColor(254, 243, 199);
        doc.roundedRect(20, refillsY - 8, 170, 18, 3, 3, 'F');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(146, 64, 14);
        doc.text(`REFILLS REMAINING: ${prescription.refills}`, 105, refillsY + 3, { align: 'center' });
      }

      // Footer on all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Generated by HealthAI • ${new Date().toLocaleString()}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      const fileName = `Prescription_${prescription.patient?.name || currentPatient?.name || 'Patient'}_${formatDate(prescription.date)}.pdf`;
      doc.save(fileName);
      toast.success('PDF downloaded successfully');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('PDF download failed, downloading as text file');
      
      // Alternative download as text
      handleTextDownload(prescription);
    }
  };

  // Alternative text download
  const handleTextDownload = (prescription) => {
    try {
      let content = '='.repeat(60) + '\n';
      content += '                    MEDICAL PRESCRIPTION\n';
      content += '='.repeat(60) + '\n\n';
      
      content += `Prescription ID: ${prescription.prescriptionId || prescription._id || prescription.id || 'N/A'}\n`;
      content += `Date: ${formatDate(prescription.date)}\n`;
      content += `Status: ${prescription.status?.toUpperCase() || 'ACTIVE'}\n\n`;
      
      content += '-'.repeat(60) + '\n';
      content += 'PATIENT INFORMATION\n';
      content += '-'.repeat(60) + '\n';
      content += `Name: ${prescription.patient?.name || currentPatient?.name || 'N/A'}\n`;
      content += `Patient ID: ${prescription.patient?.userId || prescription.patient?.id || currentPatient?.userId || 'N/A'}\n`;
      content += `Email: ${prescription.patient?.email || currentPatient?.email || 'N/A'}\n\n`;
      
      content += '-'.repeat(60) + '\n';
      content += 'DOCTOR INFORMATION\n';
      content += '-'.repeat(60) + '\n';
      content += `Name: ${prescription.doctor?.name || 'N/A'}\n`;
      content += `Doctor ID: ${prescription.doctor?.userId || prescription.doctor?.id || 'N/A'}\n`;
      content += `Specialization: ${prescription.doctor?.specialization || 'N/A'}\n\n`;
      
      content += '-'.repeat(60) + '\n';
      content += 'DIAGNOSIS\n';
      content += '-'.repeat(60) + '\n';
      content += `${prescription.diagnosis || 'N/A'}\n\n`;
      
      if (prescription.symptoms) {
        content += '-'.repeat(60) + '\n';
        content += 'SYMPTOMS\n';
        content += '-'.repeat(60) + '\n';
        content += `${prescription.symptoms}\n\n`;
      }
      
      content += '-'.repeat(60) + '\n';
      content += 'PRESCRIBED MEDICINES\n';
      content += '-'.repeat(60) + '\n';
      if (prescription.medicines && prescription.medicines.length > 0) {
        prescription.medicines.forEach((med, i) => {
          content += `${i + 1}. ${med.name || 'N/A'}\n`;
          content += `   Dosage: ${med.dosage || '-'}\n`;
          content += `   Frequency: ${med.frequency || '-'}\n`;
          content += `   Duration: ${med.duration || '-'}\n`;
          if (med.notes) content += `   Notes: ${med.notes}\n`;
          content += '\n';
        });
      } else {
        content += 'No medicines prescribed\n\n';
      }
      
      if (prescription.instructions) {
        content += '-'.repeat(60) + '\n';
        content += "DOCTOR'S INSTRUCTIONS\n";
        content += '-'.repeat(60) + '\n';
        content += `${prescription.instructions}\n\n`;
      }
      
      if (prescription.notes) {
        content += '-'.repeat(60) + '\n';
        content += 'ADDITIONAL NOTES\n';
        content += '-'.repeat(60) + '\n';
        content += `${prescription.notes}\n\n`;
      }
      
      if (prescription.refills > 0) {
        content += '-'.repeat(60) + '\n';
        content += `REFILLS REMAINING: ${prescription.refills}\n`;
      }
      
      content += '\n' + '='.repeat(60) + '\n';
      content += `Generated by HealthAI • ${new Date().toLocaleString()}\n`;
      content += '='.repeat(60);
      
      // Create blob and download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Prescription_${prescription.patient?.name || currentPatient?.name || 'Patient'}_${formatDate(prescription.date)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Text file downloaded successfully');
    } catch (error) {
      console.error('Error downloading text file:', error);
      toast.error('Failed to download');
    }
  };

  const handlePrint = () => {
    window.print();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <div className="text-teal-600 font-black tracking-wider">LOADING PRESCRIPTIONS...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-['Inter', 'Plus_Jakarta_Sans'] pb-24">
      <Toaster position="top-right" />
      
      {/* Header - Premium Navy Theme */}
      <section className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] pt-20 pb-32 px-6 lg:px-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-teal-500/20 backdrop-blur-xl text-teal-400 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border border-teal-500/30">
                  Patient Portal
                </span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter mb-4">
                My <span className="text-teal-400 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Prescriptions</span>
              </h1>
              <p className="text-slate-300 text-lg max-w-2xl">
                View and manage all your medical prescriptions in one place. Download or print anytime.
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`text-teal-400 ${refreshing ? 'animate-spin' : ''}`} size={24} />
            </button>
          </div>
          
          {/* Patient Info Card */}
          {currentPatient && (
            <div className="inline-flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <User className="text-white" size={24} />
              </div>
              <div>
                <p className="text-white/60 text-xs font-bold uppercase tracking-wider">Logged in as</p>
                <p className="text-white font-bold text-lg">{currentPatient.name}</p>
                <p className="text-teal-400 text-xs font-mono">ID: {currentPatient.userId || currentPatient._id}</p>
              </div>
            </div>
          )}
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-400 text-xs font-bold uppercase mb-1">Total Prescriptions</p>
                  <p className="text-4xl font-black text-white">{stats.total}</p>
                </div>
                <FileText className="text-teal-400/50" size={32} />
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-xs font-bold uppercase mb-1">Active</p>
                  <p className="text-4xl font-black text-green-400">{stats.active}</p>
                </div>
                <Pill className="text-green-400/50" size={32} />
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 text-xs font-bold uppercase mb-1">Completed</p>
                  <p className="text-4xl font-black text-blue-400">{stats.completed}</p>
                </div>
                <CheckCircle className="text-blue-400/50" size={32} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-6 lg:px-20 -mt-16 relative z-20">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-slate-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by diagnosis, doctor name, or doctor ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter size={18} className="text-slate-400" />
              <span className="text-xs font-black text-slate-400 uppercase">Status:</span>
              {['all', 'active', 'completed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    filter === s 
                      ? s === 'active' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 
                        s === 'completed' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 
                        'bg-slate-800 text-white shadow-lg shadow-slate-800/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prescriptions Grid */}
        {prescriptions.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-xl">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileWarning className="text-slate-400" size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">No Prescriptions Found</h3>
            <p className="text-slate-500 font-medium">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'You don\'t have any prescriptions yet'}
            </p>
            {(searchTerm || filter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}
                className="mt-6 px-6 py-3 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-600 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {prescriptions.map((pres) => (
              <motion.div
                key={pres._id || pres.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                onClick={() => { 
                  setSelectedPrescription(pres); 
                  setShowViewModal(true); 
                }}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-teal-200 transition-all cursor-pointer shadow-lg hover:shadow-2xl"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-slate-50 to-white p-5 border-b border-slate-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Pill className="text-white" size={24} />
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1 border ${getStatusColor(pres.status)}`}>
                      {getStatusIcon(pres.status)}
                      {pres.status || 'ACTIVE'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 line-clamp-2">{pres.diagnosis || 'N/A'}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{pres.prescriptionId || pres._id || pres.id}</p>
                </div>
                
                {/* Card Body */}
                <div className="p-5 space-y-3">
                  {/* Doctor Info */}
                  <div className="flex items-start gap-2">
                    <Stethoscope size={16} className="text-teal-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-700">{pres.doctor?.name || 'N/A'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {pres.doctor?.userId || pres.doctor?.id || 'N/A'}</p>
                      {pres.doctor?.specialization && (
                        <p className="text-[10px] text-teal-600 mt-0.5">{pres.doctor.specialization}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar size={14} />
                    <span>{formatDate(pres.date)}</span>
                    {pres.appointmentTime && (
                      <>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <Clock size={14} />
                        <span>{pres.appointmentTime}</span>
                      </>
                    )}
                  </div>
                  
                  {/* Medicines Preview */}
                  {pres.medicines && pres.medicines.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                        {pres.medicines.length} Medicine(s) Prescribed
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {pres.medicines.slice(0, 2).map((med, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                            {med.name}
                          </span>
                        ))}
                        {pres.medicines.length > 2 && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                            +{pres.medicines.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Card Footer */}
                <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-black text-teal-600 uppercase tracking-wider flex items-center gap-1">
                    View Details
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  {pres.refills > 0 && (
                    <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      Refills: {pres.refills}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {showViewModal && selectedPrescription && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-sm" onClick={() => setShowViewModal(false)}></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
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
                  
                  {/* Doctor Info in Header */}
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Stethoscope size={14} className="text-teal-400" />
                      <span className="font-bold">{selectedPrescription.doctor?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/50 text-[10px] font-black uppercase">ID:</span>
                      <span className="text-teal-400 text-xs font-mono">{selectedPrescription.doctor?.userId || selectedPrescription.doctor?.id || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-white/50" />
                      <span className="text-sm">{formatDate(selectedPrescription.date)}</span>
                    </div>
                    {selectedPrescription.appointmentTime && (
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-white/50" />
                        <span className="text-sm">{selectedPrescription.appointmentTime}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="mt-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase ${getStatusColor(selectedPrescription.status)}`}>
                      {getStatusIcon(selectedPrescription.status)}
                      {selectedPrescription.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowViewModal(false)} 
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Patient Info */}
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <p className="text-[9px] font-black text-purple-600 uppercase mb-2 flex items-center gap-1">
                  <User size={12} /> PATIENT INFORMATION
                </p>
                <p className="font-black text-slate-800 text-lg">{selectedPrescription.patient?.name || currentPatient?.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-purple-600">ID:</span>
                  <span className="text-xs font-mono text-slate-600">{selectedPrescription.patient?.userId || selectedPrescription.patient?.id || currentPatient?.userId}</span>
                </div>
                {selectedPrescription.patient?.email && (
                  <p className="text-xs text-slate-500 mt-1">{selectedPrescription.patient.email}</p>
                )}
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
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <Pill size={14} /> PRESCRIBED MEDICINES
                </p>
                <div className="space-y-3">
                  {selectedPrescription.medicines && selectedPrescription.medicines.length > 0 ? (
                    selectedPrescription.medicines.map((med, idx) => (
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
                          {med.notes && (
                            <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              {med.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm">No medicines prescribed</p>
                  )}
                </div>
              </div>

              {/* Instructions */}
              {selectedPrescription.instructions && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <p className="text-[9px] font-black text-amber-600 uppercase mb-2 flex items-center gap-1">
                    <AlertCircle size={12} /> DOCTOR'S INSTRUCTIONS
                  </p>
                  <p className="text-sm text-amber-800 leading-relaxed">{selectedPrescription.instructions}</p>
                </div>
              )}

              {/* Additional Notes */}
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

              {/* Status Update (Patient can mark as completed) */}
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

            {/* Modal Footer - Action Buttons */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button 
                onClick={() => handleDownloadPDF(selectedPrescription)}
                className="flex-1 py-3 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-600 transition-all flex items-center justify-center gap-2"
              >
                <Download size={16} /> Download PDF
              </button>
              <button 
                onClick={handlePrint}
                className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-bold text-sm hover:bg-purple-600 transition-all flex items-center justify-center gap-2"
              >
                <Printer size={16} /> Print
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;