import React, { useState, useEffect } from 'react'; 
import { 
  FaFilePrescription, FaUserMd, FaCalendar, FaPills,
  FaPrint, FaDownload, FaEye, FaEdit, FaTrash,
  FaPlus, FaSearch, FaFilter, FaFileMedicalAlt,
  FaCheckCircle, FaClock, FaTimesCircle, FaTimes,
  FaUndo, FaSave, FaExclamationTriangle
} from 'react-icons/fa';

const PrescriptionManager = ({ userType, userData }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletedItems, setDeletedItems] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [lastDeletedId, setLastDeletedId] = useState(null);

  const itemsPerPage = 5;

  const [newPrescription, setNewPrescription] = useState({
    patientId: '',
    patientName: '',
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    medicines: [
      { name: '', dosage: '', frequency: '', duration: '', notes: '' }
    ],
    instructions: '',
    followUpDate: '',
    doctorNotes: '',
    status: 'active'
  });

  // Initial load - localStorage + mock data
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        
        // Check localStorage first
        const savedPrescriptions = localStorage.getItem('prescriptions');
        if (savedPrescriptions) {
          setPrescriptions(JSON.parse(savedPrescriptions));
          setLoading(false);
          return;
        }

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const mockData = [
          {
            id: 'PRES-001',
            patient: {
              id: 'PAT001',
              name: 'John Smith',
              age: 32,
              gender: 'Male'
            },
            doctor: {
              id: 'DOC001',
              name: 'Dr. Sarah Johnson'
            },
            date: '2024-12-15',
            diagnosis: 'Common Cold with Fever',
            medicines: [
              { name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', duration: '3 days', notes: 'After meals' },
              { name: 'Vitamin C', dosage: '1000mg', frequency: 'Once daily', duration: '7 days', notes: 'Morning' },
              { name: 'Cough Syrup', dosage: '10ml', frequency: 'Thrice daily', duration: '5 days', notes: 'As needed' }
            ],
            instructions: 'Take rest, drink plenty of fluids, avoid cold drinks',
            followUpDate: '2024-12-22',
            doctorNotes: 'Patient should rest completely for 2 days',
            status: 'active',
            refills: 2,
            createdAt: '2024-12-15 10:30 AM'
          },
          {
            id: 'PRES-002',
            patient: {
              id: 'PAT002',
              name: 'Emma Wilson',
              age: 45,
              gender: 'Female'
            },
            doctor: {
              id: 'DOC001',
              name: 'Dr. Sarah Johnson'
            },
            date: '2024-12-10',
            diagnosis: 'Hypertension Management',
            medicines: [
              { name: 'Losartan', dosage: '50mg', frequency: 'Once daily', duration: '30 days', notes: 'Morning' },
              { name: 'Hydrochlorothiazide', dosage: '12.5mg', frequency: 'Once daily', duration: '30 days', notes: 'With food' }
            ],
            instructions: 'Monitor BP twice daily, reduce salt intake, regular exercise',
            followUpDate: '2025-01-10',
            doctorNotes: 'BP under control, continue medication',
            status: 'active',
            refills: 1,
            createdAt: '2024-12-10 02:15 PM'
          },
          {
            id: 'PRES-003',
            patient: {
              id: 'PAT003',
              name: 'Michael Chen',
              age: 28,
              gender: 'Male'
            },
            doctor: {
              id: 'DOC002',
              name: 'Dr. Michael Chen'
            },
            date: '2024-12-05',
            diagnosis: 'Acute Bronchitis',
            medicines: [
              { name: 'Amoxicillin', dosage: '500mg', frequency: 'Thrice daily', duration: '7 days', notes: 'Complete course' },
              { name: 'Inhaler', dosage: '2 puffs', frequency: 'Every 6 hours', duration: '10 days', notes: 'As needed for cough' }
            ],
            instructions: 'Complete antibiotic course, use inhaler as needed, steam inhalation',
            followUpDate: '2024-12-12',
            doctorNotes: 'Follow up if fever persists beyond 3 days',
            status: 'completed',
            refills: 0,
            createdAt: '2024-12-05 11:20 AM'
          },
          {
            id: 'PRES-004',
            patient: {
              id: 'PAT004',
              name: 'Sarah Johnson',
              age: 50,
              gender: 'Female'
            },
            doctor: {
              id: 'DOC003',
              name: 'Dr. Emily Rodriguez'
            },
            date: '2024-11-28',
            diagnosis: 'Type 2 Diabetes',
            medicines: [
              { name: 'Metformin', dosage: '1000mg', frequency: 'Twice daily', duration: '30 days', notes: 'With meals' },
              { name: 'Glimepiride', dosage: '2mg', frequency: 'Once daily', duration: '30 days', notes: 'Breakfast' }
            ],
            instructions: 'Monitor blood sugar daily, follow diabetic diet, regular exercise',
            followUpDate: '2024-12-28',
            doctorNotes: 'HbA1c at 7.2%, continue current regimen',
            status: 'expired',
            refills: 0,
            createdAt: '2024-11-28 09:45 AM'
          }
        ];

        setPrescriptions(mockData);
        localStorage.setItem('prescriptions', JSON.stringify(mockData));
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        alert('Failed to load prescriptions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  // Save to localStorage whenever prescriptions change
  useEffect(() => {
    if (prescriptions.length > 0) {
      localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
    }
  }, [prescriptions]);

  // Form validation
  const validateForm = () => {
    if (!newPrescription.patientName.trim()) {
      alert('Patient name is required');
      return false;
    }
    if (!newPrescription.diagnosis.trim()) {
      alert('Diagnosis is required');
      return false;
    }
    
    // Check if all medicines have names
    for (let i = 0; i < newPrescription.medicines.length; i++) {
      const medicine = newPrescription.medicines[i];
      if (!medicine.name.trim()) {
        alert(`Medicine name is required for medicine #${i + 1}`);
        return false;
      }
      if (!medicine.dosage.trim()) {
        alert(`Dosage is required for medicine #${i + 1}`);
        return false;
      }
      if (!medicine.frequency.trim()) {
        alert(`Frequency is required for medicine #${i + 1}`);
        return false;
      }
      if (!medicine.duration.trim()) {
        alert(`Duration is required for medicine #${i + 1}`);
        return false;
      }
    }
    
    return true;
  };

  // Filter prescriptions
  const filteredPrescriptions = prescriptions.filter(pres => {
    const matchesSearch = 
      pres.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pres.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pres.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || pres.status === filter;
    
    // Date range filter
    let matchesDateRange = true;
    if (dateRange.start && dateRange.end) {
      const prescriptionDate = new Date(pres.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDateRange = prescriptionDate >= startDate && prescriptionDate <= endDate;
    }
    
    return matchesSearch && matchesFilter && matchesDateRange;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);
  const paginatedPrescriptions = filteredPrescriptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddMedicine = () => {
    setNewPrescription({
      ...newPrescription,
      medicines: [...newPrescription.medicines, { name: '', dosage: '', frequency: '', duration: '', notes: '' }]
    });
  };

  const handleRemoveMedicine = (index) => {
    if (newPrescription.medicines.length === 1) {
      alert('At least one medicine is required');
      return;
    }
    const updatedMedicines = [...newPrescription.medicines];
    updatedMedicines.splice(index, 1);
    setNewPrescription({ ...newPrescription, medicines: updatedMedicines });
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...newPrescription.medicines];
    updatedMedicines[index][field] = value;
    setNewPrescription({ ...newPrescription, medicines: updatedMedicines });
  };

  const handleCreatePrescription = () => {
    if (!validateForm()) return;

    const prescription = {
      id: `PRES-${Date.now()}`,
      patient: {
        id: newPrescription.patientId || `PAT${Math.floor(Math.random() * 1000)}`,
        name: newPrescription.patientName,
        age: Math.floor(Math.random() * 50) + 18,
        gender: 'Male'
      },
      doctor: {
        id: userData?.userId || 'DOC001',
        name: userData?.name || 'Dr. Unknown'
      },
      date: newPrescription.date,
      diagnosis: newPrescription.diagnosis,
      medicines: newPrescription.medicines,
      instructions: newPrescription.instructions,
      followUpDate: newPrescription.followUpDate,
      doctorNotes: newPrescription.doctorNotes,
      status: newPrescription.status,
      refills: Math.floor(Math.random() * 4),
      createdAt: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setPrescriptions([prescription, ...prescriptions]);
    resetForm();
    setShowCreateModal(false);
    alert('Prescription created successfully!');
  };

  const handleEditClick = (prescription) => {
    setEditMode(true);
    setEditingId(prescription.id);
    setNewPrescription({
      patientId: prescription.patient.id,
      patientName: prescription.patient.name,
      date: prescription.date,
      diagnosis: prescription.diagnosis,
      medicines: prescription.medicines,
      instructions: prescription.instructions,
      followUpDate: prescription.followUpDate,
      doctorNotes: prescription.doctorNotes,
      status: prescription.status
    });
    setShowCreateModal(true);
  };

  const handleUpdatePrescription = () => {
    if (!validateForm()) return;

    const updatedPrescriptions = prescriptions.map(p => 
      p.id === editingId ? {
        ...p,
        patient: { 
          ...p.patient, 
          id: newPrescription.patientId || p.patient.id,
          name: newPrescription.patientName 
        },
        date: newPrescription.date,
        diagnosis: newPrescription.diagnosis,
        medicines: newPrescription.medicines,
        instructions: newPrescription.instructions,
        followUpDate: newPrescription.followUpDate,
        doctorNotes: newPrescription.doctorNotes,
        status: newPrescription.status
      } : p
    );

    setPrescriptions(updatedPrescriptions);
    resetForm();
    setShowCreateModal(false);
    setEditMode(false);
    setEditingId(null);
    alert('Prescription updated successfully!');
  };

  const handleDeleteClick = (id) => {
    const item = prescriptions.find(p => p.id === id);
    setDeletedItems([...deletedItems, item]);
    setLastDeletedId(id);
    
    // Show confirmation modal
    setSelectedPrescription(item);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    setPrescriptions(prescriptions.filter(p => p.id !== lastDeletedId));
    setShowConfirmModal(false);
    setSelectedPrescription(null);
    
    // Show undo toast
    setShowUndoToast(true);
    setTimeout(() => {
      setShowUndoToast(false);
    }, 5000);
  };

  const handleUndoDelete = () => {
    if (deletedItems.length > 0) {
      const lastDeleted = deletedItems[deletedItems.length - 1];
      setPrescriptions([lastDeleted, ...prescriptions]);
      setDeletedItems(deletedItems.slice(0, -1));
      setShowUndoToast(false);
      alert('Prescription restored successfully!');
    }
  };

  const resetForm = () => {
    setNewPrescription({
      patientId: '',
      patientName: '',
      date: new Date().toISOString().split('T')[0],
      diagnosis: '',
      medicines: [
        { name: '', dosage: '', frequency: '', duration: '', notes: '' }
      ],
      instructions: '',
      followUpDate: '',
      doctorNotes: '',
      status: 'active'
    });
    setEditMode(false);
    setEditingId(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Patient Name', 'Diagnosis', 'Date', 'Status', 'Medicines', 'Doctor'];
    const csvData = prescriptions.map(p => [
      p.id,
      p.patient.name,
      p.diagnosis,
      p.date,
      p.status,
      p.medicines.map(m => m.name).join('; '),
      p.doctor.name
    ]);
    
    const csv = [headers, ...csvData].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescriptions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert('CSV exported successfully!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <FaCheckCircle className="text-green-500" />;
      case 'completed': return <FaClock className="text-blue-500" />;
      case 'expired': return <FaTimesCircle className="text-red-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-2xl p-6 h-24"></div>
            ))}
          </div>
          <div className="bg-gray-200 rounded-2xl p-6 h-16"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-2xl p-6 h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Undo Toast */}
      {showUndoToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3">
            <FaExclamationTriangle />
            <span>Prescription deleted</span>
            <button
              onClick={handleUndoDelete}
              className="bg-white text-blue-500 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50"
            >
              <FaUndo className="inline mr-1" /> Undo
            </button>
            <button
              onClick={() => setShowUndoToast(false)}
              className="text-white hover:text-gray-200"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prescription Management</h1>
            <p className="text-gray-600">Create, view, and manage patient prescriptions</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              <FaDownload />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700"
            >
              <FaPlus />
              <span>Create New Prescription</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{prescriptions.length}</div>
              <div className="text-gray-600">Total Prescriptions</div>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <FaFilePrescription className="text-blue-600 text-2xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {prescriptions.filter(p => p.status === 'active').length}
              </div>
              <div className="text-gray-600">Active</div>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <FaCheckCircle className="text-green-600 text-2xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {prescriptions.reduce((total, p) => total + p.refills, 0)}
              </div>
              <div className="text-gray-600">Total Refills</div>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <FaPills className="text-purple-600 text-2xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {new Set(prescriptions.map(p => p.patient.id)).size}
              </div>
              <div className="text-gray-600">Unique Patients</div>
            </div>
            <div className="p-3 bg-teal-100 rounded-xl">
              <FaUserMd className="text-teal-600 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search prescriptions by patient name, diagnosis or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <span className="text-gray-700">Status:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'active', 'completed', 'expired'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize ${
                    filter === status
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">Date Range:</span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            {(dateRange.start || dateRange.end) && (
              <button
                onClick={() => setDateRange({ start: '', end: '' })}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-6">
        {paginatedPrescriptions.map(prescription => (
          <div key={prescription.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <FaFileMedicalAlt className="text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Prescription #{prescription.id}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <FaCalendar className="mr-1" />
                          {new Date(prescription.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <FaUserMd className="mr-1" />
                          {prescription.doctor.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`px-4 py-2 rounded-full font-medium flex items-center space-x-2 ${getStatusColor(prescription.status)}`}>
                    {getStatusIcon(prescription.status)}
                    <span>{prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}</span>
                  </span>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{prescription.patient.name}</div>
                    <div className="text-sm text-gray-600">
                      {prescription.patient.age}y • {prescription.patient.gender}
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnosis and Medicines */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Diagnosis</h4>
                  <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">{prescription.diagnosis}</p>
                  
                  <h4 className="font-bold text-gray-800 mt-4 mb-3">Instructions</h4>
                  <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">{prescription.instructions}</p>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Medicines</h4>
                  <div className="space-y-3">
                    {prescription.medicines.map((medicine, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium text-gray-900">{medicine.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {medicine.dosage} • {medicine.frequency} • {medicine.duration}
                        </div>
                        {medicine.notes && (
                          <div className="text-sm text-gray-500 mt-1">Note: {medicine.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <div className="font-medium text-gray-900">Follow-up Date</div>
                    <div className="text-gray-700">
                      {prescription.followUpDate ? new Date(prescription.followUpDate).toLocaleDateString() : 'Not specified'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Created: {prescription.createdAt} • Refills left: {prescription.refills}
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setSelectedPrescription(prescription);
                      setShowViewModal(true);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center space-x-2"
                    aria-label="View prescription details"
                  >
                    <FaEye />
                    <span>View Details</span>
                  </button>
                  
                  <button
                    onClick={() => handleEditClick(prescription)}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 flex items-center space-x-2"
                    aria-label="Edit prescription"
                  >
                    <FaEdit />
                    <span>Edit</span>
                  </button>
                  
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 flex items-center space-x-2"
                    aria-label="Print prescription"
                  >
                    <FaPrint />
                    <span>Print</span>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteClick(prescription.id)}
                    className="px-4 py-2 border border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 flex items-center space-x-2"
                    aria-label="Delete prescription"
                  >
                    <FaTrash />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredPrescriptions.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FaFilePrescription className="text-4xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No prescriptions found</h3>
            <p className="text-gray-500 mb-6">No prescriptions match your search criteria</p>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
            >
              <FaPlus />
              <span>Create New Prescription</span>
            </button>
          </div>
        )}

        {/* Pagination */}
        {filteredPrescriptions.length > itemsPerPage && (
          <div className="flex justify-center items-center space-x-4 pt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            
            <span className="text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Prescription Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editMode ? 'Edit Prescription' : 'Create New Prescription'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Patient Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient ID
                    </label>
                    <input
                      type="text"
                      value={newPrescription.patientId}
                      onChange={(e) => setNewPrescription({...newPrescription, patientId: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter patient ID"
                      aria-label="Patient ID"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Name *
                    </label>
                    <input
                      type="text"
                      value={newPrescription.patientName}
                      onChange={(e) => setNewPrescription({...newPrescription, patientName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter patient name"
                      required
                      aria-label="Patient name"
                    />
                  </div>
                </div>
                
                {/* Status and Date */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={newPrescription.status}
                      onChange={(e) => setNewPrescription({...newPrescription, status: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      aria-label="Prescription status"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newPrescription.date}
                      onChange={(e) => setNewPrescription({...newPrescription, date: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      aria-label="Prescription date"
                    />
                  </div>
                </div>
                
                {/* Diagnosis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis *
                  </label>
                  <textarea
                    value={newPrescription.diagnosis}
                    onChange={(e) => setNewPrescription({...newPrescription, diagnosis: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter diagnosis details..."
                    required
                    aria-label="Diagnosis"
                  />
                </div>
                
                {/* Medicines */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-800">Medicines *</h4>
                    <button
                      type="button"
                      onClick={handleAddMedicine}
                      className="px-3 py-1 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                      aria-label="Add medicine"
                    >
                      + Add Medicine
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {newPrescription.medicines.map((medicine, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-medium text-gray-700">Medicine #{index + 1}</span>
                          {newPrescription.medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMedicine(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                              aria-label="Remove medicine"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Medicine Name *
                            </label>
                            <input
                              type="text"
                              value={medicine.name}
                              onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500"
                              placeholder="e.g., Paracetamol"
                              required
                              aria-label="Medicine name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Dosage *
                            </label>
                            <input
                              type="text"
                              value={medicine.dosage}
                              onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500"
                              placeholder="e.g., 500mg"
                              required
                              aria-label="Medicine dosage"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Frequency *
                            </label>
                            <input
                              type="text"
                              value={medicine.frequency}
                              onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500"
                              placeholder="e.g., Twice daily"
                              required
                              aria-label="Medicine frequency"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Duration *
                            </label>
                            <input
                              type="text"
                              value={medicine.duration}
                              onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500"
                              placeholder="e.g., 3 days"
                              required
                              aria-label="Medicine duration"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Additional Notes
                            </label>
                            <input
                              type="text"
                              value={medicine.notes}
                              onChange={(e) => handleMedicineChange(index, 'notes', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500"
                              placeholder="e.g., After meals, With water"
                              aria-label="Medicine notes"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Instructions and Notes */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructions
                    </label>
                    <textarea
                      value={newPrescription.instructions}
                      onChange={(e) => setNewPrescription({...newPrescription, instructions: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter instructions for the patient..."
                      aria-label="Instructions"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Doctor's Notes
                    </label>
                    <textarea
                      value={newPrescription.doctorNotes}
                      onChange={(e) => setNewPrescription({...newPrescription, doctorNotes: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter private notes..."
                      aria-label="Doctor's notes"
                    />
                  </div>
                </div>
                
                {/* Follow-up Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={newPrescription.followUpDate}
                    onChange={(e) => setNewPrescription({...newPrescription, followUpDate: e.target.value})}
                    className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    aria-label="Follow-up date"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={editMode ? handleUpdatePrescription : handleCreatePrescription}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 flex items-center space-x-2"
                >
                  {editMode ? <FaSave /> : <FaPlus />}
                  <span>{editMode ? 'Update' : 'Create'} Prescription</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Confirm Delete</h3>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg mb-4">
                  <FaExclamationTriangle className="text-red-500" />
                  <p className="text-red-700">
                    Are you sure you want to delete this prescription?
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">Prescription #{selectedPrescription.id}</p>
                  <p className="text-gray-600">Patient: {selectedPrescription.patient.name}</p>
                  <p className="text-gray-600">Diagnosis: {selectedPrescription.diagnosis}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center space-x-2"
                >
                  <FaTrash />
                  <span>Delete Prescription</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Prescription Modal */}
      {showViewModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Prescription Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <FaTimes />
                </button>
              </div>
              
              {/* Prescription Header */}
              <div className="mb-8 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900">HEALTHAI CLINIC</h4>
                    <p className="text-gray-600">123 Medical Street, Health City</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">Prescription #{selectedPrescription.id}</div>
                    <div className="text-gray-600">
                      Date: {new Date(selectedPrescription.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Patient and Doctor Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h5 className="font-bold text-gray-800 mb-3">Patient Information</h5>
                  <div className="space-y-2">
                    <div><span className="font-medium">Name:</span> {selectedPrescription.patient.name}</div>
                    <div><span className="font-medium">Age:</span> {selectedPrescription.patient.age} years</div>
                    <div><span className="font-medium">Gender:</span> {selectedPrescription.patient.gender}</div>
                    <div><span className="font-medium">ID:</span> {selectedPrescription.patient.id}</div>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h5 className="font-bold text-gray-800 mb-3">Doctor Information</h5>
                  <div className="space-y-2">
                    <div><span className="font-medium">Name:</span> {selectedPrescription.doctor.name}</div>
                    <div><span className="font-medium">ID:</span> {selectedPrescription.doctor.id}</div>
                    <div><span className="font-medium">Date:</span> {new Date(selectedPrescription.date).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              
              {/* Diagnosis */}
              <div className="mb-8">
                <h5 className="font-bold text-gray-800 mb-3">Diagnosis</h5>
                <div className="p-4 bg-gray-50 rounded-lg">
                  {selectedPrescription.diagnosis}
                </div>
              </div>
              
              {/* Medicines */}
              <div className="mb-8">
                <h5 className="font-bold text-gray-800 mb-3">Prescribed Medicines</h5>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Medicine</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Dosage</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Frequency</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPrescription.medicines.map((medicine, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-2">{medicine.name}</td>
                          <td className="border border-gray-300 px-4 py-2">{medicine.dosage}</td>
                          <td className="border border-gray-300 px-4 py-2">{medicine.frequency}</td>
                          <td className="border border-gray-300 px-4 py-2">{medicine.duration}</td>
                          <td className="border border-gray-300 px-4 py-2">{medicine.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Instructions and Follow-up */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h5 className="font-bold text-gray-800 mb-3">Instructions</h5>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    {selectedPrescription.instructions}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-bold text-gray-800 mb-3">Follow-up</h5>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div><span className="font-medium">Next Appointment:</span> {selectedPrescription.followUpDate ? new Date(selectedPrescription.followUpDate).toLocaleDateString() : 'Not specified'}</div>
                    <div className="mt-2"><span className="font-medium">Refills Left:</span> {selectedPrescription.refills}</div>
                  </div>
                </div>
              </div>
              
              {/* Doctor's Notes */}
              <div className="mb-8">
                <h5 className="font-bold text-gray-800 mb-3">Doctor's Notes</h5>
                <div className="p-4 bg-blue-50 rounded-lg">
                  {selectedPrescription.doctorNotes || 'No additional notes.'}
                </div>
              </div>
              
              {/* Footer */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold">Doctor's Signature</div>
                    <div className="text-gray-600">{selectedPrescription.doctor.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Prescription created on</div>
                    <div className="font-medium">{selectedPrescription.createdAt}</div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-6 mt-6 border-t border-gray-200">
                <button 
                  onClick={handlePrint}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center space-x-2"
                >
                  <FaPrint />
                  <span>Print Prescription</span>
                </button>
                <button 
                  onClick={() => {
                    const dataStr = JSON.stringify(selectedPrescription, null, 2);
                    const blob = new Blob([dataStr], { type: 'application/json' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `prescription_${selectedPrescription.id}.json`;
                    a.click();
                  }}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 flex items-center space-x-2"
                >
                  <FaDownload />
                  <span>Download as JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionManager;