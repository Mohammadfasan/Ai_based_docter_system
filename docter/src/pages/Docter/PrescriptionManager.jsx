// PrescriptionManager.jsx - Shows both Doctor ID and Patient ID (Fixed)
import React, { useState, useEffect } from 'react';
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
  FaIdBadge, FaUserTie, FaEnvelope, FaFilePdf
} from 'react-icons/fa';
import { Activity, User, Calendar, Mail, Phone, Clock, UserCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PrescriptionManager = ({ userType, userData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const appointmentData = location.state || {};

  // --- STATE DECLARATIONS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('all');
  const [currentPatient, setCurrentPatient] = useState({
    id: appointmentData.patientId || '',
    name: appointmentData.patientName || '',
    email: appointmentData.patientEmail || '',
    appointmentDate: appointmentData.appointmentDate || new Date().toISOString().split('T')[0],
    appointmentTime: appointmentData.appointment?.time || appointmentData.appointmentTime || '',
    symptoms: appointmentData.appointment?.symptoms || appointmentData.symptoms || ''
  });

  // New prescription form state - all empty by default
  const [newPrescription, setNewPrescription] = useState({
    diagnosis: '',
    symptoms: appointmentData.appointment?.symptoms || appointmentData.symptoms || '',
    instructions: '',
    refills: 0,
    medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
    notes: ''
  });

  // Load prescriptions from localStorage
  const [prescriptions, setPrescriptions] = useState([]);

  // Get current user on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
    console.log('Current user:', user);
    
    // If we have appointment data but no patient, try to get from localStorage
    if (appointmentData.patientId) {
      const allUsers = JSON.parse(localStorage.getItem('healthai_users') || '[]');
      const patient = allUsers.find(u => u.userId === appointmentData.patientId);
      
      if (patient) {
        setCurrentPatient(prev => ({
          ...prev,
          id: patient.userId,
          name: patient.name,
          email: patient.email
        }));
      }
    }
  }, []);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  useEffect(() => {
    if (appointmentData.patientId) {
      setCurrentPatient({
        id: appointmentData.patientId,
        name: appointmentData.patientName,
        email: appointmentData.patientEmail,
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointment?.time || appointmentData.appointmentTime,
        symptoms: appointmentData.appointment?.symptoms || appointmentData.symptoms
      });
      
      // Pre-fill symptoms from appointment data
      setNewPrescription(prev => ({
        ...prev,
        symptoms: appointmentData.appointment?.symptoms || appointmentData.symptoms || ''
      }));
    }
  }, [appointmentData]);

  const loadPrescriptions = () => {
    const allPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    
    // Sort by date (newest first)
    const sorted = allPrescriptions.sort((a, b) => 
      new Date(b.dateTime || b.date) - new Date(a.dateTime || a.date)
    );
    
    setPrescriptions(sorted);
    console.log('Loaded prescriptions:', sorted.length);
  };

  const savePrescriptions = (updatedPrescriptions) => {
    localStorage.setItem('prescriptions', JSON.stringify(updatedPrescriptions));
    setPrescriptions(updatedPrescriptions);
  };

  // Get unique patients for filter
  const uniquePatients = [...new Map(
    prescriptions.map(p => [p.patient?.id, p.patient])
  ).values()].filter(Boolean);

  // Filter prescriptions based on selected patient and search
  const filteredPrescriptions = prescriptions.filter(p => {
    // Filter by patient
    if (selectedPatientId !== 'all' && p.patient?.id !== selectedPatientId) {
      return false;
    }
    
    // Search
    const matchesSearch = searchTerm === '' || 
      (p.patient?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.diagnosis?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.doctor?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.doctor?.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.patient?.id?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesFilter = filter === 'all' || p.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Format date nicely
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

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  // --- HANDLERS ---
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

  const handleCreatePrescription = () => {
    if (!newPrescription.diagnosis) {
      alert('Please enter a diagnosis');
      return;
    }

    if (newPrescription.medicines.length === 0 || !newPrescription.medicines[0].name) {
      alert('Please add at least one medicine');
      return;
    }

    const doctorName = userData?.name || 
                      currentUser?.name || 
                      appointmentData.doctorName;
    
    const doctorId = userData?.userId || 
                    currentUser?.userId || 
                    appointmentData.doctorId;

    // If no patient selected, use currentPatient or prompt
    if (!currentPatient.id && !currentPatient.name) {
      alert('Please select a patient first');
      return;
    }

    const prescription = {
      id: `PR-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0],
      dateTime: new Date().toISOString(),
      status: 'active',
      diagnosis: newPrescription.diagnosis,
      symptoms: newPrescription.symptoms,
      instructions: newPrescription.instructions,
      refills: parseInt(newPrescription.refills) || 0,
      notes: newPrescription.notes,
      patientId: currentPatient.id,
      patient: {
        id: currentPatient.id,
        name: currentPatient.name,
        email: currentPatient.email
      },
      doctor: {
        id: doctorId,
        name: doctorName,
        specialization: userData?.specialization || currentUser?.specialization
      },
      medicines: newPrescription.medicines.filter(m => m.name.trim() !== ''),
      appointmentId: appointmentData.appointment?.id,
      appointmentDate: currentPatient.appointmentDate,
      appointmentTime: currentPatient.appointmentTime
    };

    const updated = [...prescriptions, prescription];
    savePrescriptions(updated);
    
    // Reset form and close modal
    setNewPrescription({
      diagnosis: '',
      symptoms: appointmentData.appointment?.symptoms || '',
      instructions: '',
      refills: 0,
      medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
      notes: ''
    });
    setShowCreateModal(false);
    
    // Show success toast
    alert('✅ Prescription created successfully!');
  };

  const handleDeletePrescription = (id) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      const updated = prescriptions.filter(p => p.id !== id);
      savePrescriptions(updated);
      setShowUndoToast(true);
      setTimeout(() => setShowUndoToast(false), 3000);
    }
  };

  // ENHANCED PDF DOWNLOAD FUNCTION (like PatientPrescriptions)
  const handleDownloadPDF = (prescription) => {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: `Prescription-${prescription.id}`,
      subject: 'Medical Prescription',
      author: prescription.doctor?.name || 'Doctor',
      creator: 'HealthAI'
    });

    // Add header background
    doc.setFillColor(15, 23, 42); // #0f172a
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    
    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('PRESCRIPTION', 20, 25);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('HealthAI Medical Center', 20, 35);
    
    // Prescription ID and Date (right side)
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFontSize(8);
    doc.text(`ID: ${prescription.id || 'N/A'}`, doc.internal.pageSize.width - 20, 25, { align: 'right' });
    doc.text(`Date: ${formatDate(prescription.date)}`, doc.internal.pageSize.width - 20, 32, { align: 'right' });
    if (prescription.appointmentTime) {
      doc.text(`Time: ${prescription.appointmentTime}`, doc.internal.pageSize.width - 20, 39, { align: 'right' });
    }

    // Patient Information Section
    doc.setTextColor(15, 23, 42); // #0f172a
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 20, 55);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${prescription.patient?.name || 'N/A'}`, 20, 65);
    doc.text(`Patient ID: ${prescription.patient?.id || 'N/A'}`, 20, 75);
    if (prescription.patient?.email) {
      doc.text(`Email: ${prescription.patient.email}`, 20, 85);
    }

    // Doctor Information Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DOCTOR INFORMATION', 120, 55);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${prescription.doctor?.name || 'N/A'}`, 120, 65);
    doc.text(`Doctor ID: ${prescription.doctor?.id || 'N/A'}`, 120, 75);
    if (prescription.doctor?.specialization) {
      doc.text(`Specialization: ${prescription.doctor.specialization}`, 120, 85);
    }

    // Line separator
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(20, 100, doc.internal.pageSize.width - 20, 100);
    
    // Diagnosis
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DIAGNOSIS', 20, 115);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(prescription.diagnosis || 'N/A', 20, 125);
    
    // Symptoms
    let yPosition = 135;
    if (prescription.symptoms) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Symptoms:', 20, yPosition);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105); // slate-600
      const symptomsLines = doc.splitTextToSize(prescription.symptoms, 170);
      doc.text(symptomsLines, 20, yPosition + 7);
      yPosition += 15 + (symptomsLines.length * 5);
    }

    // Medicines Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('PRESCRIBED MEDICINES', 20, yPosition);
    
    // Prepare table data
    const tableData = prescription.medicines?.map(med => [
      med.name || 'N/A',
      med.dosage || '-',
      med.frequency || '-',
      med.duration || '-',
      med.notes || '-'
    ]) || [];

    // Generate table
    doc.autoTable({
      startY: yPosition + 5,
      head: [['Medicine', 'Dosage', 'Frequency', 'Duration', 'Notes']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: { 
        fontSize: 8,
        textColor: [15, 23, 42]
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 25 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 'auto' }
      },
      margin: { left: 20, right: 20 }
    });

    // Instructions
    if (prescription.instructions) {
      const finalY = doc.lastAutoTable.finalY + 10;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('DOCTOR\'S INSTRUCTIONS', 20, finalY);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const instructionsLines = doc.splitTextToSize(prescription.instructions, 170);
      doc.text(instructionsLines, 20, finalY + 7);
    }

    // Additional Notes
    if (prescription.notes) {
      const notesY = (prescription.instructions ? doc.lastAutoTable.finalY + 30 : doc.lastAutoTable.finalY + 10);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Additional Notes:', 20, notesY);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const notesLines = doc.splitTextToSize(prescription.notes, 170);
      doc.text(notesLines, 20, notesY + 7);
    }

    // Refills
    if (prescription.refills > 0) {
      const refillsY = doc.lastAutoTable.finalY + 40;
      
      doc.setFillColor(254, 243, 199); // amber-100
      doc.rect(20, refillsY - 5, 170, 15, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(146, 64, 14); // amber-800
      doc.text(`REFILLS REMAINING: ${prescription.refills}`, doc.internal.pageSize.width / 2, refillsY + 3, { align: 'center' });
    }

    // Footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Generated by HealthAI • ${new Date().toLocaleString()}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    doc.save(`Prescription_${prescription.patient?.name || 'Patient'}_${formatDate(prescription.date)}.pdf`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] pb-20 overflow-x-hidden" style={{ fontFamily: '"Inter", sans-serif' }}>
      
      {/* Undo Toast */}
      <AnimatePresence>
        {showUndoToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className="bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
              <FaExclamationTriangle />
              <span className="font-bold">Prescription deleted</span>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-50 transition-all">
                Undo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="bg-[#001b38] pt-24 pb-40 px-6 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <FaArrowLeft size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
          </button>
          
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border border-cyan-500/30">
              Prescription Management
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none mb-6" style={{ fontFamily: '"Montserrat", sans-serif' }}>
            All <span className="text-cyan-400">Prescriptions</span>
          </h1>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-10">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <p className="text-cyan-400 text-xs font-bold uppercase mb-2">Total Prescriptions</p>
              <p className="text-4xl font-black text-white">{prescriptions.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <p className="text-cyan-400 text-xs font-bold uppercase mb-2">Active</p>
              <p className="text-4xl font-black text-green-400">{prescriptions.filter(p => p.status === 'active').length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <p className="text-cyan-400 text-xs font-bold uppercase mb-2">Completed</p>
              <p className="text-4xl font-black text-blue-400">{prescriptions.filter(p => p.status === 'completed').length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <p className="text-cyan-400 text-xs font-bold uppercase mb-2">Unique Patients</p>
              <p className="text-4xl font-black text-purple-400">{uniquePatients.length}</p>
            </div>
          </div>

          {/* Current Patient Card (if coming from appointment) */}
          {currentPatient.name && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-cyan-500/20 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-6 max-w-2xl mt-8"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
                  {currentPatient.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-cyan-400 font-bold mb-1">Selected Patient for New Prescription</p>
                  <h2 className="text-2xl font-black text-white">{currentPatient.name}</h2>
                  <div className="grid grid-cols-2 gap-4 mt-2 text-slate-300 text-sm">
                    <span className="flex items-center gap-1">
                      <FaIdCard size={14} className="text-cyan-400" /> 
                      Patient ID: {currentPatient.id}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaEnvelope size={14} className="text-cyan-400" /> 
                      Email: {currentPatient.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt size={14} className="text-cyan-400" /> 
                      Date: {formatDate(currentPatient.appointmentDate)}
                    </span>
                    {currentPatient.appointmentTime && (
                      <span className="flex items-center gap-1">
                        <Clock size={14} className="text-cyan-400" /> 
                        Time: {currentPatient.appointmentTime}
                      </span>
                    )}
                  </div>
                  {currentPatient.symptoms && (
                    <p className="text-xs text-cyan-300 mt-2">
                      Symptoms: {currentPatient.symptoms}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        <Activity className="absolute -bottom-20 -left-10 text-white/5 w-96 h-96" />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20">
        
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-[#001b38] uppercase tracking-tighter">
            All Prescriptions
            <span className="text-cyan-500 ml-2">({filteredPrescriptions.length})</span>
          </h2>
          
          <button
            onClick={() => {
              if (!currentPatient.id) {
                alert('Please select a patient first');
                return;
              }
              setShowCreateModal(true);
            }}
            className="bg-[#001b38] text-white px-8 py-4 rounded-2xl font-black text-xs tracking-widest uppercase flex items-center gap-3 hover:bg-cyan-600 transition-all shadow-xl"
          >
            <FaPlus size={16} />
            New Prescription
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-slate-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by patient name, patient ID, doctor name, doctor ID, diagnosis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-[#001b38] focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-slate-400 uppercase">Filter:</span>
              {['all', 'active', 'completed'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    filter === s 
                      ? s === 'active' ? 'bg-green-500 text-white' : 
                        s === 'completed' ? 'bg-blue-500 text-white' : 
                        'bg-[#001b38] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Patient Filter */}
          {uniquePatients.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                <span className="text-xs font-black text-slate-400 uppercase">Patient:</span>
                <button
                  onClick={() => setSelectedPatientId('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                    selectedPatientId === 'all' 
                      ? 'bg-[#001b38] text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Patients
                </button>
                {uniquePatients.map(patient => (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                      selectedPatientId === patient.id 
                        ? 'bg-cyan-500 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {patient.name} ({patient.id?.slice(-6)})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Prescriptions Grid */}
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence>
            {filteredPrescriptions.length > 0 ? (
              filteredPrescriptions.map((prescription) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  key={prescription.id}
                  className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all"
                >
                  <div className="p-6">
                    {/* Header with ID and Status */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-cyan-50 rounded-2xl">
                          <FaFilePrescription className="text-cyan-600" size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-[#001b38]">{prescription.id}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <FaCalendar /> {formatDate(prescription.date)}
                            </span>
                            {prescription.appointmentTime && (
                              <span className="flex items-center gap-1">
                                <Clock size={14} /> {prescription.appointmentTime}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-full text-xs font-black flex items-center gap-1 border ${getStatusColor(prescription.status)}`}>
                          {prescription.status === 'active' ? <FaCheckCircle /> : <FaClock />}
                          {prescription.status.toUpperCase()}
                        </span>
                        {prescription.refills > 0 && (
                          <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-xs font-black flex items-center gap-1">
                            <FaHourglassHalf />
                            Refills: {prescription.refills}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Patient and Doctor IDs Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Patient Info */}
                      <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                        <p className="text-[9px] font-black text-purple-600 uppercase mb-2 flex items-center gap-1">
                          <FaUser /> PATIENT
                        </p>
                        <p className="font-black text-[#001b38] text-lg">{prescription.patient.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <FaIdCard className="text-purple-600" size={14} />
                          <p className="text-sm font-bold text-purple-700">ID: {prescription.patient.id}</p>
                        </div>
                        {prescription.patient.email && (
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <FaEnvelope size={10} /> {prescription.patient.email}
                          </p>
                        )}
                      </div>

                      {/* Doctor Info */}
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-[9px] font-black text-blue-600 uppercase mb-2 flex items-center gap-1">
                          <FaUserMd /> DOCTOR
                        </p>
                        <p className="font-black text-[#001b38] text-lg">{prescription.doctor.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <FaIdBadge className="text-blue-600" size={14} />
                          <p className="text-sm font-bold text-blue-700">ID: {prescription.doctor.id}</p>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{prescription.doctor.specialization}</p>
                      </div>
                    </div>

                    {/* Diagnosis */}
                    <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Diagnosis</p>
                      <p className="text-lg font-bold text-[#001b38]">{prescription.diagnosis}</p>
                      {prescription.symptoms && (
                        <p className="text-sm text-slate-600 mt-2">
                          <span className="font-bold">Symptoms:</span> {prescription.symptoms}
                        </p>
                      )}
                    </div>

                    {/* Medicines */}
                    <div className="mb-4">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                        <FaPills className="text-cyan-500" />
                        Prescribed Medicines
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {prescription.medicines.map((medicine, idx) => (
                          <div key={idx} className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="font-black text-[#001b38]">{medicine.name}</p>
                            <p className="text-xs text-slate-600 mt-1">
                              {medicine.dosage} • {medicine.frequency} • {medicine.duration}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Instructions and Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {prescription.instructions && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                          <p className="text-[9px] font-black text-amber-600 uppercase mb-1">Instructions</p>
                          <p className="text-sm text-amber-800">{prescription.instructions}</p>
                        </div>
                      )}
                      {prescription.notes && (
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                          <p className="text-[9px] font-black text-purple-600 uppercase mb-1">Notes</p>
                          <p className="text-sm text-purple-800">{prescription.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <button 
                        onClick={() => {
                          setSelectedPrescription(prescription);
                          setShowViewModal(true);
                        }}
                        className="p-3 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all"
                        title="View"
                      >
                        <FaEye size={18} />
                      </button>
                      <button 
                        onClick={() => handleDownloadPDF(prescription)}
                        className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Download PDF"
                      >
                        <FaDownload size={18} />
                      </button>
                      <button 
                        className="p-3 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                        title="Print"
                        onClick={() => window.print()}
                      >
                        <FaPrint size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeletePrescription(prescription.id)}
                        className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl text-center"
              >
                <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaFilePrescription className="text-slate-400" size={48} />
                </div>
                <p className="text-lg font-black uppercase tracking-widest text-slate-400 mb-4">
                  No Prescriptions Found
                </p>
                <button
                  onClick={() => {
                    if (!currentPatient.id) {
                      alert('Please select a patient first');
                      return;
                    }
                    setShowCreateModal(true);
                  }}
                  className="px-8 py-4 bg-[#001b38] text-white rounded-full font-black text-xs tracking-widest uppercase hover:bg-cyan-600 transition-all"
                >
                  Create First Prescription
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Create Prescription Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-[#001b38]/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white w-full max-w-3xl rounded-[40px] overflow-hidden shadow-2xl my-8"
            >
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-8 text-white sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">New Prescription</h2>
                    <p className="text-cyan-100 text-sm mt-2">for {currentPatient.name}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-cyan-100 text-xs flex items-center gap-1">
                        <FaIdCard size={12} /> Patient ID: {currentPatient.id}
                      </p>
                      <p className="text-cyan-100 text-xs flex items-center gap-1">
                        <FaUserMd size={12} /> Doctor ID: {currentUser?.userId || userData?.userId}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="p-3 hover:bg-white/10 rounded-xl transition-all"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-8 overflow-y-auto max-h-[70vh]">
                <div className="space-y-6">
                  {/* Diagnosis */}
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">
                      Diagnosis <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newPrescription.diagnosis}
                      onChange={(e) => setNewPrescription({...newPrescription, diagnosis: e.target.value})}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-[#001b38] focus:border-cyan-500 outline-none"
                      placeholder="e.g. Acute Bronchitis"
                    />
                  </div>

                  {/* Symptoms */}
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">
                      Symptoms
                    </label>
                    <textarea
                      value={newPrescription.symptoms}
                      onChange={(e) => setNewPrescription({...newPrescription, symptoms: e.target.value})}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-[#001b38] focus:border-cyan-500 outline-none"
                      rows="3"
                      placeholder="Patient symptoms..."
                    />
                  </div>

                  {/* Medicines */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Medicines <span className="text-red-500">*</span>
                      </label>
                      <button
                        onClick={handleAddMedicine}
                        className="px-4 py-2 bg-cyan-50 text-cyan-600 rounded-xl text-xs font-black hover:bg-cyan-100 transition-all flex items-center gap-2"
                      >
                        <FaPlus size={12} /> Add Medicine
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {newPrescription.medicines.map((medicine, index) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                          <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-12 md:col-span-4">
                              <input
                                type="text"
                                placeholder="Medicine name"
                                value={medicine.name}
                                onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-[#001b38] focus:border-cyan-500 outline-none"
                              />
                            </div>
                            <div className="col-span-6 md:col-span-2">
                              <input
                                type="text"
                                placeholder="Dosage"
                                value={medicine.dosage}
                                onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-[#001b38] focus:border-cyan-500 outline-none"
                              />
                            </div>
                            <div className="col-span-6 md:col-span-3">
                              <input
                                type="text"
                                placeholder="Frequency"
                                value={medicine.frequency}
                                onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-[#001b38] focus:border-cyan-500 outline-none"
                              />
                            </div>
                            <div className="col-span-6 md:col-span-2">
                              <input
                                type="text"
                                placeholder="Duration"
                                value={medicine.duration}
                                onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-[#001b38] focus:border-cyan-500 outline-none"
                              />
                            </div>
                            <div className="col-span-6 md:col-span-1 flex items-center justify-end">
                              {newPrescription.medicines.length > 1 && (
                                <button
                                  onClick={() => handleRemoveMedicine(index)}
                                  className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                  <FaTrash size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">
                      Instructions
                    </label>
                    <textarea
                      value={newPrescription.instructions}
                      onChange={(e) => setNewPrescription({...newPrescription, instructions: e.target.value})}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-[#001b38] focus:border-cyan-500 outline-none"
                      rows="3"
                      placeholder="e.g. Take after meals, avoid alcohol..."
                    />
                  </div>

                  {/* Refills & Notes */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">
                        Refills
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newPrescription.refills}
                        onChange={(e) => setNewPrescription({...newPrescription, refills: e.target.value})}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-[#001b38] focus:border-cyan-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">
                        Additional Notes
                      </label>
                      <input
                        type="text"
                        value={newPrescription.notes}
                        onChange={(e) => setNewPrescription({...newPrescription, notes: e.target.value})}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-[#001b38] focus:border-cyan-500 outline-none"
                        placeholder="Any special notes..."
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 sticky bottom-0 bg-white pb-2">
                    <button
                      onClick={handleCreatePrescription}
                      className="flex-[2] bg-[#001b38] text-white py-6 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-cyan-600 transition-all flex items-center justify-center gap-3"
                    >
                      <FaSave size={16} />
                      Create Prescription
                    </button>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 bg-slate-100 text-slate-600 py-6 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Prescription Modal */}
      <AnimatePresence>
        {showViewModal && selectedPrescription && (
          <div className="fixed inset-0 bg-[#001b38]/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-8 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Prescription Details</h2>
                    <p className="text-cyan-100 text-sm mt-2">{selectedPrescription.id}</p>
                  </div>
                  <button 
                    onClick={() => setShowViewModal(false)}
                    className="p-3 hover:bg-white/10 rounded-xl transition-all"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-8 overflow-y-auto max-h-[70vh]">
                <div className="space-y-6">
                  {/* Patient & Doctor Info with IDs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 rounded-2xl">
                      <p className="text-[9px] font-black text-purple-600 uppercase mb-2 flex items-center gap-1">
                        <FaUser /> PATIENT
                      </p>
                      <p className="font-black text-[#001b38] text-lg">{selectedPrescription.patient.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <FaIdCard className="text-purple-600" size={14} />
                        <p className="text-sm font-bold text-purple-700">ID: {selectedPrescription.patient.id}</p>
                      </div>
                      {selectedPrescription.patient.email && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <FaEnvelope size={10} /> {selectedPrescription.patient.email}
                        </p>
                      )}
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl">
                      <p className="text-[9px] font-black text-blue-600 uppercase mb-2 flex items-center gap-1">
                        <FaUserMd /> DOCTOR
                      </p>
                      <p className="font-black text-[#001b38] text-lg">{selectedPrescription.doctor.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <FaIdBadge className="text-blue-600" size={14} />
                        <p className="text-sm font-bold text-blue-700">ID: {selectedPrescription.doctor.id}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{selectedPrescription.doctor.specialization}</p>
                    </div>
                  </div>

                  {/* Date & Time & Status */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Date</p>
                      <p className="font-black text-[#001b38]">{formatDate(selectedPrescription.date)}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Time</p>
                      <p className="font-black text-[#001b38]">{selectedPrescription.appointmentTime || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Status</p>
                      <span className={`px-4 py-2 rounded-full text-xs font-black inline-flex items-center gap-1 ${getStatusColor(selectedPrescription.status)}`}>
                        {selectedPrescription.status === 'active' ? <FaCheckCircle /> : <FaClock />}
                        {selectedPrescription.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <div className="p-6 bg-slate-50 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Diagnosis</p>
                    <p className="text-xl font-black text-[#001b38]">{selectedPrescription.diagnosis}</p>
                    {selectedPrescription.symptoms && (
                      <p className="text-sm text-slate-600 mt-2">
                        <span className="font-bold">Symptoms:</span> {selectedPrescription.symptoms}
                      </p>
                    )}
                  </div>

                  {/* Medicines */}
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-3">Medicines</p>
                    <div className="space-y-2">
                      {selectedPrescription.medicines.map((medicine, idx) => (
                        <div key={idx} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <div className="flex justify-between items-center">
                            <span className="font-black text-[#001b38]">{medicine.name}</span>
                            <span className="text-xs font-bold text-blue-700">{medicine.dosage}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            {medicine.frequency} • {medicine.duration}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  {selectedPrescription.instructions && (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <p className="text-[9px] font-black text-amber-600 uppercase mb-2">Instructions</p>
                      <p className="text-sm text-amber-800">{selectedPrescription.instructions}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedPrescription.notes && (
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                      <p className="text-[9px] font-black text-purple-600 uppercase mb-2">Additional Notes</p>
                      <p className="text-sm text-purple-800">{selectedPrescription.notes}</p>
                    </div>
                  )}

                  {/* Refills */}
                  {selectedPrescription.refills > 0 && (
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                      <p className="text-[9px] font-black text-green-600 uppercase mb-2">Refills Remaining</p>
                      <p className="text-2xl font-black text-green-700">{selectedPrescription.refills}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => handleDownloadPDF(selectedPrescription)}
                      className="flex-1 p-4 bg-cyan-50 text-cyan-600 rounded-2xl font-black text-xs hover:bg-cyan-100 transition-all flex items-center justify-center gap-2"
                    >
                      <FaDownload size={14} /> Download PDF
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="flex-1 p-4 bg-purple-50 text-purple-600 rounded-2xl font-black text-xs hover:bg-purple-100 transition-all flex items-center justify-center gap-2"
                    >
                      <FaPrint size={14} /> Print
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrescriptionManager;