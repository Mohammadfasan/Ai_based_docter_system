import React, { useState, useEffect } from 'react'; 
import { 
  FileText, Search, X, Stethoscope, 
  ChevronRight, Download, Printer, 
  Calendar, Pill, User, Clock,
  CheckCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PatientPrescriptions = ({ userType, userData }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPatient, setCurrentPatient] = useState(null);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setLoading(true);
      
      // Get current logged in patient
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      setCurrentPatient(currentUser);
      
      // Get all prescriptions from localStorage
      const allPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
      
      // Filter prescriptions for this patient
      const patientPrescriptions = allPrescriptions.filter(pres => 
        pres.patient?.id === currentUser.userId || 
        pres.patientId === currentUser.userId ||
        pres.patient?.name === currentUser.name
      );
      
      // Sort by date (newest first)
      const sorted = patientPrescriptions.sort((a, b) => 
        new Date(b.dateTime || b.date) - new Date(a.dateTime || a.date)
      );
      
      setPrescriptions(sorted);
      setLoading(false);
    };
    
    fetchPrescriptions();
  }, []);

  const filteredPrescriptions = prescriptions.filter(pres => {
    const matchesSearch = pres.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pres.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pres.doctor?.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || pres.status === filter;
    return matchesSearch && matchesFilter;
  });

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

  // SIMPLE PDF Download Function - FIXED VERSION
  const handleDownloadPDF = (prescription) => {
    try {
      console.log('Starting PDF download for:', prescription.id);
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('MEDICAL PRESCRIPTION', 105, 20, { align: 'center' });
      
      // Add line
      doc.setLineWidth(0.5);
      doc.line(20, 25, 190, 25);
      
      // Prescription ID
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`ID: ${prescription.id || 'N/A'}`, 20, 35);
      doc.text(`Date: ${formatDate(prescription.date)}`, 150, 35);
      
      // Patient Info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Patient Information:', 20, 50);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${prescription.patient?.name || currentPatient?.name || 'N/A'}`, 20, 60);
      doc.text(`Patient ID: ${prescription.patient?.id || currentPatient?.userId || 'N/A'}`, 20, 70);
      
      // Doctor Info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Doctor Information:', 120, 50);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${prescription.doctor?.name || 'N/A'}`, 120, 60);
      doc.text(`Doctor ID: ${prescription.doctor?.id || 'N/A'}`, 120, 70);
      
      // Diagnosis
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Diagnosis:', 20, 90);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(prescription.diagnosis || 'N/A', 20, 100);
      
      // Symptoms
      let yPos = 115;
      if (prescription.symptoms) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Symptoms:', 20, yPos);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const symptomsLines = doc.splitTextToSize(prescription.symptoms, 170);
        doc.text(symptomsLines, 20, yPos + 7);
        yPos += 15 + (symptomsLines.length * 5);
      }
      
      // Medicines
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Prescribed Medicines:', 20, yPos);
      
      yPos += 10;
      if (prescription.medicines && prescription.medicines.length > 0) {
        prescription.medicines.forEach((med, index) => {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}. ${med.name || 'N/A'}`, 25, yPos);
          
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(`${med.dosage || '-'} | ${med.frequency || '-'} | ${med.duration || '-'}`, 30, yPos + 5);
          
          yPos += 15;
        });
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('No medicines prescribed', 25, yPos);
        yPos += 10;
      }
      
      // Instructions
      if (prescription.instructions) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Instructions:', 20, yPos);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const instructionsLines = doc.splitTextToSize(prescription.instructions, 170);
        doc.text(instructionsLines, 20, yPos + 7);
        yPos += 15 + (instructionsLines.length * 5);
      }
      
      // Notes
      if (prescription.notes) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Additional Notes:', 20, yPos);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const notesLines = doc.splitTextToSize(prescription.notes, 170);
        doc.text(notesLines, 20, yPos + 7);
        yPos += 15 + (notesLines.length * 5);
      }
      
      // Refills
      if (prescription.refills > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 0, 0);
        doc.text(`Refills Remaining: ${prescription.refills}`, 20, yPos);
      }
      
      // Footer
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Generated by HealthAI • ${new Date().toLocaleString()}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      
      // Save PDF
      const fileName = `Prescription_${prescription.patient?.name || currentPatient?.name || 'Patient'}_${formatDate(prescription.date)}.pdf`;
      doc.save(fileName);
      
      console.log('PDF downloaded successfully:', fileName);
      setDownloadError('');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setDownloadError('PDF பதிவிறக்கம் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.');
      alert('PDF பதிவிறக்கம் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.');
    }
  };

  // Alternative download method using Blob
  const handleAlternativeDownload = (prescription) => {
    try {
      // Create text content
      let content = `MEDICAL PRESCRIPTION\n`;
      content += `===================\n\n`;
      content += `ID: ${prescription.id || 'N/A'}\n`;
      content += `Date: ${formatDate(prescription.date)}\n\n`;
      
      content += `PATIENT INFORMATION\n`;
      content += `------------------\n`;
      content += `Name: ${prescription.patient?.name || currentPatient?.name || 'N/A'}\n`;
      content += `Patient ID: ${prescription.patient?.id || currentPatient?.userId || 'N/A'}\n\n`;
      
      content += `DOCTOR INFORMATION\n`;
      content += `------------------\n`;
      content += `Name: ${prescription.doctor?.name || 'N/A'}\n`;
      content += `Doctor ID: ${prescription.doctor?.id || 'N/A'}\n\n`;
      
      content += `DIAGNOSIS\n`;
      content += `---------\n`;
      content += `${prescription.diagnosis || 'N/A'}\n\n`;
      
      if (prescription.symptoms) {
        content += `SYMPTOMS\n`;
        content += `--------\n`;
        content += `${prescription.symptoms}\n\n`;
      }
      
      content += `PRESCRIBED MEDICINES\n`;
      content += `-------------------\n`;
      if (prescription.medicines && prescription.medicines.length > 0) {
        prescription.medicines.forEach((med, i) => {
          content += `${i+1}. ${med.name || 'N/A'} - ${med.dosage || '-'} | ${med.frequency || '-'} | ${med.duration || '-'}\n`;
        });
      } else {
        content += `No medicines prescribed\n`;
      }
      content += `\n`;
      
      if (prescription.instructions) {
        content += `INSTRUCTIONS\n`;
        content += `------------\n`;
        content += `${prescription.instructions}\n\n`;
      }
      
      if (prescription.notes) {
        content += `ADDITIONAL NOTES\n`;
        content += `----------------\n`;
        content += `${prescription.notes}\n\n`;
      }
      
      if (prescription.refills > 0) {
        content += `REFILLS REMAINING: ${prescription.refills}\n`;
      }
      
      content += `\nGenerated by HealthAI • ${new Date().toLocaleString()}`;
      
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
      
      console.log('Text file downloaded successfully');
      
    } catch (error) {
      console.error('Error downloading text file:', error);
      alert('பதிவிறக்கம் தோல்வியடைந்தது.');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-teal-400 font-black animate-pulse">LOADING PRESCRIPTIONS...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Plus_Jakarta_Sans'] pb-24">
      
      {/* Header - Navy Dark Theme */}
      <section className="bg-[#0f172a] pt-24 pb-44 px-6 lg:px-20 relative rounded-b-[4rem]">
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-5xl font-black text-white mb-6">My <span className="text-teal-400">Prescriptions</span></h1>
          
          {/* Patient Info Badge */}
          {currentPatient && (
            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 mb-6">
              <User className="text-teal-400" size={18} />
              <span className="text-white font-bold">{currentPatient.name}</span>
              <span className="text-teal-400 text-xs">ID: {currentPatient.userId}</span>
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-4 items-center mt-6">
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 flex flex-1 w-full">
              <Search className="text-teal-400 ml-4" size={22} />
              <input 
                type="text" 
                placeholder="Search by diagnosis or doctor name/ID..." 
                className="w-full bg-transparent border-none outline-none text-white px-4 py-3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="flex gap-2 mr-2">
                {['all', 'active', 'completed'].map((s) => (
                  <button 
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-6 py-3 rounded-[1.5rem] font-black text-xs uppercase transition-all ${
                      filter === s 
                        ? s === 'active' ? 'bg-green-500 text-white' : 
                          s === 'completed' ? 'bg-blue-500 text-white' : 
                          'bg-teal-400 text-[#0f172a]'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <p className="text-teal-400 text-xs font-bold uppercase mb-1">Total</p>
              <p className="text-3xl font-black text-white">{prescriptions.length}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <p className="text-teal-400 text-xs font-bold uppercase mb-1">Active</p>
              <p className="text-3xl font-black text-green-400">{prescriptions.filter(p => p.status === 'active').length}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <p className="text-teal-400 text-xs font-bold uppercase mb-1">Completed</p>
              <p className="text-3xl font-black text-blue-400">{prescriptions.filter(p => p.status === 'completed').length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Area - Grid Layout */}
      <main className="max-w-7xl mx-auto px-6 lg:px-20 -mt-24 relative z-20">
        {filteredPrescriptions.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-xl">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="text-slate-400" size={40} />
            </div>
            <h3 className="text-2xl font-black text-[#0f172a] mb-2">No Prescriptions Found</h3>
            <p className="text-slate-400 font-bold">
              {searchTerm ? 'Try a different search term' : 'You don\'t have any prescriptions yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrescriptions.map((pres) => (
              <div 
                key={pres.id} 
                onClick={() => { setSelectedPrescription(pres); setShowViewModal(true); }}
                className="group bg-white rounded-[3rem] p-8 border border-slate-100 hover:border-teal-400 transition-all shadow-xl shadow-slate-200/40 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                    <Pill className="text-teal-600" size={28} />
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase ${
                    pres.status === 'active' 
                      ? 'bg-green-100 text-green-600' 
                      : pres.status === 'completed'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {pres.status}
                  </span>
                </div>
                
                <h3 className="text-xl font-black text-[#0f172a] mb-2">{pres.diagnosis}</h3>
                
                {/* Doctor Info with Name and ID */}
                <div className="space-y-1 mb-4">
                  <p className="text-slate-400 font-bold text-sm flex items-center gap-2">
                    <Stethoscope size={14}/> {pres.doctor?.name || 'N/A'}
                  </p>
                  <p className="text-slate-400 font-bold text-[10px] flex items-center gap-2">
                    <span className="w-1 h-1 bg-teal-400 rounded-full"></span>
                    Doctor ID: {pres.doctor?.id || 'N/A'}
                  </p>
                </div>

                <p className="text-slate-400 font-bold text-[10px] mb-6 flex items-center gap-2">
                  <Calendar size={12}/> {formatDate(pres.date)}
                  {pres.appointmentTime && (
                    <>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <Clock size={12}/> {pres.appointmentTime}
                    </>
                  )}
                </p>

                <div className="pt-6 border-t border-dashed border-slate-100 flex justify-between items-center text-[10px] font-black text-teal-600 tracking-widest uppercase">
                  VIEW DETAILS <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {showViewModal && selectedPrescription && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-sm" onClick={() => setShowViewModal(false)}></div>
          
          <div className="bg-[#0f172a] w-full max-w-2xl rounded-[2.5rem] border border-teal-400/30 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-white/5 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-white">{selectedPrescription.diagnosis || 'N/A'}</h2>
                <p className="text-teal-400 text-sm font-bold">{selectedPrescription.id}</p>
                
                {/* Doctor Info with ID in Modal Header */}
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Stethoscope size={14} className="text-teal-400" />
                    <span className="text-white font-bold text-sm">{selectedPrescription.doctor?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-[10px] font-black uppercase">ID:</span>
                    <span className="text-teal-400 text-xs font-bold">{selectedPrescription.doctor?.id || 'N/A'}</span>
                  </div>
                </div>

                {/* Date and Time */}
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-white/50 text-xs flex items-center gap-1">
                    <Calendar size={12} /> {formatDate(selectedPrescription.date)}
                  </p>
                  {selectedPrescription.appointmentTime && (
                    <p className="text-white/50 text-xs flex items-center gap-1">
                      <Clock size={12} /> {selectedPrescription.appointmentTime}
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                <span className={`inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                  selectedPrescription.status === 'active' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {selectedPrescription.status === 'active' ? <CheckCircle size={10} /> : <Clock size={10} />}
                  {selectedPrescription.status || 'N/A'}
                </span>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-white hover:text-teal-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
              {/* Symptoms */}
              {selectedPrescription.symptoms && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-3">Symptoms</h4>
                  <p className="text-white font-bold text-sm leading-relaxed">{selectedPrescription.symptoms}</p>
                </div>
              )}

              {/* Medicines Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest">Prescribed Medicines</h4>
                {selectedPrescription.medicines && selectedPrescription.medicines.length > 0 ? (
                  selectedPrescription.medicines.map((m, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-black">
                            {m.name || 'N/A'} <span className="text-teal-400 ml-2">{m.dosage || ''}</span>
                          </p>
                          <p className="text-slate-400 text-xs font-bold mt-1">
                            {m.frequency || ''} {m.duration ? `• ${m.duration}` : ''}
                          </p>
                        </div>
                        {m.notes && (
                          <div className="text-[8px] font-black text-teal-400/50 italic bg-white/5 px-3 py-1 rounded-full">
                            {m.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-white/50 text-sm">No medicines prescribed</p>
                )}
              </div>

              {/* Instructions Section */}
              {selectedPrescription.instructions && (
                <div className="bg-teal-400/5 border border-teal-400/20 rounded-2xl p-6">
                  <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-3">Doctor's Instructions</h4>
                  <p className="text-white font-bold text-sm leading-relaxed">{selectedPrescription.instructions}</p>
                </div>
              )}

              {/* Additional Notes */}
              {selectedPrescription.notes && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-3">Additional Notes</h4>
                  <p className="text-white font-bold text-sm">{selectedPrescription.notes}</p>
                </div>
              )}

              {/* Refills */}
              {selectedPrescription.refills > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                  <p className="text-[8px] font-black text-amber-400 uppercase tracking-widest mb-1">Refills Remaining</p>
                  <p className="text-2xl font-black text-amber-400">{selectedPrescription.refills}</p>
                </div>
              )}
            </div>

            {/* Download Buttons - FIXED with both options */}
            <div className="p-8 border-t border-white/5 bg-slate-900/50 flex flex-col gap-3">
              <div className="flex gap-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadPDF(selectedPrescription);
                  }}
                  className="flex-1 py-4 bg-teal-400 text-[#0f172a] rounded-2xl font-black text-sm hover:bg-teal-300 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={18} /> PDF
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.print();
                  }}
                  className="flex-1 py-4 bg-purple-500/20 text-purple-400 rounded-2xl font-black text-sm hover:bg-purple-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Printer size={18} /> PRINT
                </button>
              </div>
              
              {/* Alternative download option if PDF fails */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleAlternativeDownload(selectedPrescription);
                }}
                className="w-full py-3 bg-white/5 text-white/70 rounded-xl font-black text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                <FileText size={14} /> Download as Text (Alternative)
              </button>
              
              {downloadError && (
                <p className="text-red-400 text-xs text-center">{downloadError}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;