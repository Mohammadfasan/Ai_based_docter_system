// PrescriptionManager.jsx - Complete updated version with working PDF
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaFilePrescription, FaUserMd, FaCalendar, FaPills,
  FaPrint, FaDownload, FaEye, FaEdit, FaTrash,
  FaPlus, FaSearch, FaFilter, FaFileMedicalAlt,
  FaCheckCircle, FaClock, FaTimesCircle, FaTimes,
  FaUndo, FaSave, FaExclamationTriangle, FaArrowLeft,
  FaUser, FaNotesMedical, FaPrescriptionBottle, FaStethoscope,
  FaIdCard, FaCalendarAlt, FaHourglassHalf, FaHospital,
  FaIdBadge, FaUserTie, FaEnvelope, FaFilePdf,
  FaSpinner, FaSync, FaChevronRight, FaChevronDown
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

// Import jsPDF and autoTable correctly
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PrescriptionManager = ({ userType, userData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const appointmentData = location.state || {};
  
  // Refs to prevent infinite loops
  const isMounted = useRef(true);
  const isLoadingRef = useRef(false);
  const initialLoadDone = useRef(false);

  // State declarations
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletedPrescription, setDeletedPrescription] = useState(null);
  const [expandedPrescription, setExpandedPrescription] = useState(null);
  
  const [currentPatient, setCurrentPatient] = useState({
    id: appointmentData.patientId || '',
    name: appointmentData.patientName || '',
    email: appointmentData.patientEmail || '',
    appointmentDate: appointmentData.appointmentDate || new Date().toISOString().split('T')[0],
    appointmentTime: appointmentData.appointment?.time || appointmentData.appointmentTime || '',
    symptoms: appointmentData.appointment?.symptoms || appointmentData.symptoms || ''
  });

  const [newPrescription, setNewPrescription] = useState({
    diagnosis: '',
    symptoms: appointmentData.appointment?.symptoms || appointmentData.symptoms || '',
    instructions: '',
    refills: 0,
    medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
    notes: ''
  });

  const [prescriptions, setPrescriptions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0
  });

  // Load prescriptions from API
  const loadPrescriptions = useCallback(async () => {
    if (isLoadingRef.current) return;
    if (!isMounted.current) return;
    
    isLoadingRef.current = true;
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        if (isMounted.current) {
          setPrescriptions([]);
          setLoading(false);
        }
        isLoadingRef.current = false;
        return;
      }
      
      const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const doctorId = currentUserData?.userId || userData?.userId;
      
      if (!doctorId) {
        console.log('No doctor ID found');
        if (isMounted.current) {
          setPrescriptions([]);
          setLoading(false);
        }
        isLoadingRef.current = false;
        return;
      }
      
      // Build query params
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (searchTerm) params.append('search', searchTerm);
      params.append('limit', '100');
      
      const url = `http://localhost:5000/api/prescriptions/doctor/${doctorId}?${params.toString()}`;
      
      console.log('Fetching prescriptions from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && isMounted.current) {
          const prescriptionsData = data.data || [];
          setPrescriptions(prescriptionsData);
          
          // Calculate stats
          setStats({
            total: prescriptionsData.length,
            active: prescriptionsData.filter(p => p.status === 'active').length,
            completed: prescriptionsData.filter(p => p.status === 'completed').length,
            cancelled: prescriptionsData.filter(p => p.status === 'cancelled').length
          });
        } else if (isMounted.current) {
          setPrescriptions([]);
        }
      } else {
        console.error('Failed to load prescriptions:', response.status);
        if (isMounted.current) {
          setPrescriptions([]);
        }
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      if (isMounted.current) {
        setPrescriptions([]);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      isLoadingRef.current = false;
    }
  }, [filter, searchTerm, userData]);

  // Initial load - runs once
  useEffect(() => {
    isMounted.current = true;
    
    // Set current user
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
    
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      loadPrescriptions();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Reload when filter or search changes (debounced)
  useEffect(() => {
    if (!initialLoadDone.current) return;
    
    const timer = setTimeout(() => {
      loadPrescriptions();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [filter, searchTerm, loadPrescriptions]);

  // Get unique patients for filter
  const uniquePatients = React.useMemo(() => {
    const patientMap = new Map();
    prescriptions.forEach(p => {
      const key = p.patient?.userId || p.patient?.id;
      if (key && !patientMap.has(key)) {
        patientMap.set(key, p.patient);
      }
    });
    return Array.from(patientMap.values()).filter(Boolean);
  }, [prescriptions]);

  // Filter prescriptions by selected patient
  const filteredPrescriptions = React.useMemo(() => {
    if (selectedPatientId === 'all') return prescriptions;
    return prescriptions.filter(p => {
      const patientId = p.patient?.userId || p.patient?.id;
      return patientId === selectedPatientId;
    });
  }, [prescriptions, selectedPatientId]);

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

  const handleAddMedicine = () => {
    setNewPrescription({
      ...newPrescription,
      medicines: [...newPrescription.medicines, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const handleRemoveMedicine = (index) => {
    const updated = [...newPrescription.medicines];
    updated.splice(index, 1);
    setNewPrescription({ ...newPrescription, medicines: updated });
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...newPrescription.medicines];
    updated[index][field] = value;
    setNewPrescription({ ...newPrescription, medicines: updated });
  };

  const handleCreatePrescription = async () => {
    if (!newPrescription.diagnosis) {
      toast.error('Please enter a diagnosis');
      return;
    }

    if (newPrescription.medicines.length === 0 || !newPrescription.medicines[0].name) {
      toast.error('Please add at least one medicine');
      return;
    }

    if (!currentPatient.id) {
      toast.error('Please select a patient first');
      return;
    }

    const prescriptionData = {
      patientId: currentPatient.id,
      diagnosis: newPrescription.diagnosis,
      symptoms: newPrescription.symptoms,
      instructions: newPrescription.instructions,
      refills: parseInt(newPrescription.refills) || 0,
      notes: newPrescription.notes,
      medicines: newPrescription.medicines.filter(m => m.name && m.name.trim() !== ''),
      appointmentId: appointmentData.appointment?.id,
      appointmentTime: currentPatient.appointmentTime
    };

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login first');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/prescriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prescriptionData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Prescription created successfully!');
        resetForm();
        setShowCreateModal(false);
        loadPrescriptions();
      } else {
        toast.error(data.message || 'Failed to create prescription');
      }
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error('Failed to create prescription');
    }
  };

  const resetForm = () => {
    setNewPrescription({
      diagnosis: '',
      symptoms: appointmentData.appointment?.symptoms || '',
      instructions: '',
      refills: 0,
      medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
      notes: ''
    });
  };

  const handleUpdateStatus = async (prescriptionId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/prescriptions/${prescriptionId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Prescription marked as ${newStatus}`);
        loadPrescriptions();
        if (showViewModal) setShowViewModal(false);
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDeletePrescription = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/prescriptions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Prescription deleted successfully');
        loadPrescriptions();
        if (showViewModal) setShowViewModal(false);
      } else {
        toast.error(data.message || 'Failed to delete prescription');
      }
    } catch (error) {
      console.error('Error deleting prescription:', error);
      toast.error('Failed to delete prescription');
    }
  };

  // Fixed PDF download function using autoTable
  const handleDownloadPDF = (prescription) => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      doc.setProperties({
        title: `Prescription-${prescription._id || prescription.id}`,
        subject: 'Medical Prescription',
        author: prescription.doctor?.name || 'Doctor',
        creator: 'HealthAI'
      });

      // Header
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
      
      // Prescription ID and Date
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text(`ID: ${prescription.prescriptionId || prescription._id || 'N/A'}`, doc.internal.pageSize.width - 20, 15, { align: 'right' });
      doc.text(`Date: ${formatDate(prescription.date)}`, doc.internal.pageSize.width - 20, 22, { align: 'right' });
      
      // Status
      const statusColor = prescription.status === 'active' ? [34, 197, 94] : 
                         prescription.status === 'completed' ? [59, 130, 246] : [239, 68, 68];
      doc.setFillColor(...statusColor);
      doc.roundedRect(doc.internal.pageSize.width - 45, 35, 35, 8, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text(prescription.status?.toUpperCase() || 'ACTIVE', doc.internal.pageSize.width - 27.5, 41, { align: 'center' });

      // Patient Information
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('PATIENT INFORMATION', 20, 60);
      
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
      doc.text(prescription.patient?.name || 'N/A', 70, 78);
      doc.text(prescription.patient?.userId || prescription.patient?.id || 'N/A', 70, 90);
      doc.text(prescription.patient?.email || 'N/A', 70, 102);

      // Doctor Information
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('DOCTOR INFORMATION', 120, 60);
      
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

      // Diagnosis
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
      
      // Symptoms
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

      // Medicines Table - Using autoTable function
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('PRESCRIBED MEDICINES', 20, yPosition);
      
      const tableData = prescription.medicines?.map(med => [
        med.name || 'N/A',
        med.dosage || '-',
        med.frequency || '-',
        med.duration || '-'
      ]) || [];

      // Use autoTable function
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

      // Instructions
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

      // Refills
      if (prescription.refills && prescription.refills > 0) {
        const refillsY = doc.lastAutoTable.finalY + 45;
        
        doc.setFillColor(254, 243, 199);
        doc.roundedRect(20, refillsY - 8, 170, 18, 3, 3, 'F');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(146, 64, 14);
        doc.text(`REFILLS REMAINING: ${prescription.refills}`, 105, refillsY + 3, { align: 'center' });
      }

      // Footer
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

      const fileName = `Prescription_${prescription.patient?.name || 'Patient'}_${formatDate(prescription.date)}.pdf`;
      doc.save(fileName);
      toast.success('PDF downloaded successfully');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('PDF download failed, downloading as text file');
      
      // Fallback to text download
      handleTextDownload(prescription);
    }
  };

  // Text download fallback
  const handleTextDownload = (prescription) => {
    try {
      let content = '='.repeat(60) + '\n';
      content += '                    MEDICAL PRESCRIPTION\n';
      content += '='.repeat(60) + '\n\n';
      
      content += `Prescription ID: ${prescription.prescriptionId || prescription._id || 'N/A'}\n`;
      content += `Date: ${formatDate(prescription.date)}\n`;
      content += `Status: ${prescription.status?.toUpperCase() || 'ACTIVE'}\n\n`;
      
      content += '-'.repeat(60) + '\n';
      content += 'PATIENT INFORMATION\n';
      content += '-'.repeat(60) + '\n';
      content += `Name: ${prescription.patient?.name || 'N/A'}\n`;
      content += `Patient ID: ${prescription.patient?.userId || prescription.patient?.id || 'N/A'}\n`;
      content += `Email: ${prescription.patient?.email || 'N/A'}\n\n`;
      
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
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Prescription_${prescription.patient?.name || 'Patient'}_${formatDate(prescription.date)}.txt`;
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
      case 'active': return <FaCheckCircle className="text-green-500" />;
      case 'completed': return <FaCheckCircle className="text-blue-500" />;
      case 'cancelled': return <FaTimesCircle className="text-red-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPrescriptions();
    setRefreshing(false);
    toast.success('Prescriptions refreshed');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-cyan-600 mx-auto mb-4" />
          <div className="text-cyan-600 font-black animate-pulse">LOADING PRESCRIPTIONS...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] pb-20 overflow-x-hidden font-['Inter', 'Plus_Jakarta_Sans']">
      <Toaster position="top-right" />
      
      {/* Header */}
      <section className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] pt-20 pb-32 px-6 lg:px-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-cyan-500/20 backdrop-blur-xl text-cyan-400 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border border-cyan-500/30">
                  Doctor Portal
                </span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter mb-4">
                Prescription <span className="text-cyan-400 bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Manager</span>
              </h1>
              <p className="text-slate-300 text-lg max-w-2xl">
                Create and manage prescriptions for your patients. View history, update status, and generate PDFs.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all disabled:opacity-50"
              >
                <FaSync className={`text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} size={24} />
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-3 hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
              >
                <FaPlus size={18} />
                New Prescription
              </button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <p className="text-cyan-400 text-xs font-bold uppercase mb-1">Total</p>
              <p className="text-4xl font-black text-white">{stats.total}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <p className="text-green-400 text-xs font-bold uppercase mb-1">Active</p>
              <p className="text-4xl font-black text-green-400">{stats.active}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <p className="text-blue-400 text-xs font-bold uppercase mb-1">Completed</p>
              <p className="text-4xl font-black text-blue-400">{stats.completed}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <p className="text-red-400 text-xs font-bold uppercase mb-1">Cancelled</p>
              <p className="text-4xl font-black text-red-400">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-20 -mt-16 relative z-20">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-slate-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by diagnosis, patient name, or patient ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <FaFilter className="text-slate-400" />
              <span className="text-xs font-black text-slate-400 uppercase">Status:</span>
              {['all', 'active', 'completed', 'cancelled'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    filter === s 
                      ? s === 'active' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 
                        s === 'completed' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 
                        s === 'cancelled' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' :
                        'bg-slate-800 text-white shadow-lg shadow-slate-800/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
              
              {/* Patient Filter */}
              {uniquePatients.length > 0 && (
                <>
                  <span className="text-xs font-black text-slate-400 uppercase ml-4">Patient:</span>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="all">All Patients</option>
                    {uniquePatients.map((patient) => (
                      <option key={patient?.userId || patient?.id} value={patient?.userId || patient?.id}>
                        {patient?.name || patient?.userId}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        {filteredPrescriptions.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-xl">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaFilePrescription className="text-slate-400 text-5xl" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">No Prescriptions Found</h3>
            <p className="text-slate-500 font-medium">
              {searchTerm || filter !== 'all' || selectedPatientId !== 'all'
                ? 'Try adjusting your search or filter criteria' 
                : 'Start by creating a new prescription'}
            </p>
            {(searchTerm || filter !== 'all' || selectedPatientId !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                  setSelectedPatientId('all');
                }}
                className="mt-6 px-6 py-3 bg-cyan-500 text-white rounded-xl font-bold text-sm hover:bg-cyan-600 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPrescriptions.map((pres) => (
              <motion.div
                key={pres._id || pres.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all overflow-hidden"
              >
                {/* Prescription Header */}
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedPrescription(expandedPrescription === (pres._id || pres.id) ? null : (pres._id || pres.id))}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                        <FaFilePrescription className="text-white" size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-black text-slate-800">{pres.diagnosis || 'N/A'}</h3>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border flex items-center gap-1 ${getStatusColor(pres.status)}`}>
                            {getStatusIcon(pres.status)}
                            {pres.status || 'ACTIVE'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <FaUser size={12} />
                            {pres.patient?.name || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaCalendar size={12} />
                            {formatDate(pres.date)}
                          </span>
                          <span className="text-xs font-mono text-cyan-600">
                            ID: {pres.prescriptionId || pres._id}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedPrescription === (pres._id || pres.id) ? 
                        <FaChevronDown className="text-slate-400" /> : 
                        <FaChevronRight className="text-slate-400" />
                      }
                    </div>
                  </div>
                  
                  {/* Medicines Preview */}
                  {pres.medicines && pres.medicines.length > 0 && (
                    <div className="mt-4 ml-16">
                      <div className="flex flex-wrap gap-2">
                        {pres.medicines.slice(0, 3).map((med, idx) => (
                          <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
                            {med.name} - {med.dosage}
                          </span>
                        ))}
                        {pres.medicines.length > 3 && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
                            +{pres.medicines.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Expanded Content */}
                {expandedPrescription === (pres._id || pres.id) && (
                  <div className="px-6 pb-6 border-t border-slate-100 bg-slate-50">
                    <div className="pt-6 space-y-4">
                      {/* Patient Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Patient Information</p>
                          <p className="font-bold text-slate-800">{pres.patient?.name}</p>
                          <p className="text-xs text-slate-500">ID: {pres.patient?.userId || pres.patient?.id}</p>
                          <p className="text-xs text-slate-500">{pres.patient?.email}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Doctor Information</p>
                          <p className="font-bold text-slate-800">{pres.doctor?.name}</p>
                          <p className="text-xs text-slate-500">ID: {pres.doctor?.userId || pres.doctor?.id}</p>
                          {pres.doctor?.specialization && (
                            <p className="text-xs text-cyan-600">{pres.doctor.specialization}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Symptoms */}
                      {pres.symptoms && (
                        <div className="bg-white p-4 rounded-xl">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Symptoms</p>
                          <p className="text-sm text-slate-600">{pres.symptoms}</p>
                        </div>
                      )}
                      
                      {/* Full Medicines List */}
                      <div className="bg-white p-4 rounded-xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Prescribed Medicines</p>
                        <div className="space-y-2">
                          {pres.medicines?.map((med, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                              <div>
                                <p className="font-bold text-slate-800">{med.name}</p>
                                <p className="text-xs text-slate-500">{med.dosage} • {med.frequency} • {med.duration}</p>
                              </div>
                              {med.notes && (
                                <span className="text-[10px] bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">
                                  {med.notes}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Instructions */}
                      {pres.instructions && (
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                          <p className="text-[10px] font-black text-amber-600 uppercase mb-2">Instructions</p>
                          <p className="text-sm text-amber-800">{pres.instructions}</p>
                        </div>
                      )}
                      
                      {/* Notes */}
                      {pres.notes && (
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                          <p className="text-[10px] font-black text-purple-600 uppercase mb-2">Additional Notes</p>
                          <p className="text-sm text-purple-800">{pres.notes}</p>
                        </div>
                      )}
                      
                      {/* Refills */}
                      {pres.refills > 0 && (
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                          <p className="text-[10px] font-black text-green-600 uppercase">Refills Remaining</p>
                          <p className="text-2xl font-black text-green-700">{pres.refills}</p>
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => handleDownloadPDF(pres)}
                          className="flex-1 py-3 bg-cyan-500 text-white rounded-xl font-bold text-sm hover:bg-cyan-600 transition-all flex items-center justify-center gap-2"
                        >
                          <FaDownload size={14} /> Download PDF
                        </button>
                        
                        {pres.status === 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(pres._id || pres.id, 'completed')}
                            className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                          >
                            <FaCheckCircle size={14} /> Mark Completed
                          </button>
                        )}
                        
                        {pres.status === 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(pres._id || pres.id, 'cancelled')}
                            className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                          >
                            <FaTimesCircle size={14} /> Cancel
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeletePrescription(pres._id || pres.id)}
                          className="px-4 py-3 bg-slate-100 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Create Prescription Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] p-6 text-white sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
                      <FaPlus size={20} />
                    </div>
                    <h2 className="text-xl font-black">Create New Prescription</h2>
                  </div>
                  <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-xl">
                    <FaTimes size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Patient Info */}
                <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-100">
                  <p className="text-[10px] font-black text-cyan-600 uppercase mb-2">Patient Information</p>
                  <p className="font-bold text-slate-800 text-lg">{currentPatient.name || 'Select a patient'}</p>
                  <p className="text-xs text-slate-500">ID: {currentPatient.id || 'N/A'}</p>
                  {currentPatient.appointmentTime && (
                    <p className="text-xs text-cyan-600 mt-1">
                      Appointment: {currentPatient.appointmentDate} at {currentPatient.appointmentTime}
                    </p>
                  )}
                </div>
                
                {/* Diagnosis */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Diagnosis *</label>
                  <input
                    type="text"
                    value={newPrescription.diagnosis}
                    onChange={(e) => setNewPrescription({...newPrescription, diagnosis: e.target.value})}
                    placeholder="Enter diagnosis"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
                
                {/* Symptoms */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Symptoms</label>
                  <textarea
                    value={newPrescription.symptoms}
                    onChange={(e) => setNewPrescription({...newPrescription, symptoms: e.target.value})}
                    placeholder="Describe symptoms..."
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
                  />
                </div>
                
                {/* Medicines */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Medicines *</label>
                    <button
                      onClick={handleAddMedicine}
                      className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                    >
                      <FaPlus size={12} /> Add Medicine
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {newPrescription.medicines.map((med, index) => (
                      <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <div className="flex justify-between mb-2">
                          <span className="text-xs font-bold text-slate-500">Medicine #{index + 1}</span>
                          {newPrescription.medicines.length > 1 && (
                            <button
                              onClick={() => handleRemoveMedicine(index)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <FaTimes size={14} />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Medicine Name"
                            value={med.name}
                            onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                            className="col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Dosage (e.g., 500mg)"
                            value={med.dosage}
                            onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Frequency (e.g., Twice daily)"
                            value={med.frequency}
                            onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Duration (e.g., 7 days)"
                            value={med.duration}
                            onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                            className="col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Instructions */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Instructions</label>
                  <textarea
                    value={newPrescription.instructions}
                    onChange={(e) => setNewPrescription({...newPrescription, instructions: e.target.value})}
                    placeholder="Additional instructions for the patient..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
                  />
                </div>
                
                {/* Notes and Refills */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Additional Notes</label>
                    <textarea
                      value={newPrescription.notes}
                      onChange={(e) => setNewPrescription({...newPrescription, notes: e.target.value})}
                      placeholder="Private notes..."
                      rows={2}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Refills</label>
                    <input
                      type="number"
                      min="0"
                      value={newPrescription.refills}
                      onChange={(e) => setNewPrescription({...newPrescription, refills: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePrescription}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <FaSave size={14} /> Create Prescription
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrescriptionManager;