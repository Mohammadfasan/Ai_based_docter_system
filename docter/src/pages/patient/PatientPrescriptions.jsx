import React, { useState, useEffect } from 'react'; 
import { 
  FaFilePrescription, FaCalendar, FaPills, FaUserMd,
  FaPrint, FaDownload, FaEye, FaSearch, FaFilter,
  FaTimes, FaClock, FaCheckCircle, FaTimesCircle,
  FaExclamationTriangle, FaFileMedicalAlt, FaHistory
} from 'react-icons/fa';

const PatientPrescriptions = ({ userType, userData }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Mock data - In real app, this would come from API
  const mockPrescriptions = [
    {
      id: 'PRES-001',
      patient: {
        id: 'PAT001',
        name: 'Alex Johnson',
        age: 32,
        gender: 'Male'
      },
      doctor: {
        id: 'DOC001',
        name: 'Dr. Sarah Johnson',
        specialization: 'General Physician'
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
      createdAt: '2024-12-15 10:30 AM',
      pharmacy: {
        name: 'City Medical Pharmacy',
        address: '123 Medical Street, Health City',
        phone: '+1-234-567-8900'
      }
    },
    {
      id: 'PRES-002',
      patient: {
        id: 'PAT001',
        name: 'Alex Johnson',
        age: 32,
        gender: 'Male'
      },
      doctor: {
        id: 'DOC002',
        name: 'Dr. Michael Chen',
        specialization: 'Cardiologist'
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
      createdAt: '2024-12-10 02:15 PM',
      pharmacy: {
        name: 'Wellness Pharmacy',
        address: '456 Wellness Blvd, Health City',
        phone: '+1-234-567-8901'
      }
    },
    {
      id: 'PRES-003',
      patient: {
        id: 'PAT001',
        name: 'Alex Johnson',
        age: 32,
        gender: 'Male'
      },
      doctor: {
        id: 'DOC003',
        name: 'Dr. Emily Rodriguez',
        specialization: 'Pulmonologist'
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
      createdAt: '2024-12-05 11:20 AM',
      pharmacy: {
        name: 'MediFast Pharmacy',
        address: '789 Quick St, Health City',
        phone: '+1-234-567-8902'
      }
    },
    {
      id: 'PRES-004',
      patient: {
        id: 'PAT001',
        name: 'Alex Johnson',
        age: 32,
        gender: 'Male'
      },
      doctor: {
        id: 'DOC004',
        name: 'Dr. David Wilson',
        specialization: 'Endocrinologist'
      },
      date: '2024-11-28',
      diagnosis: 'Type 2 Diabetes Management',
      medicines: [
        { name: 'Metformin', dosage: '1000mg', frequency: 'Twice daily', duration: '30 days', notes: 'With meals' },
        { name: 'Glimepiride', dosage: '2mg', frequency: 'Once daily', duration: '30 days', notes: 'Breakfast' }
      ],
      instructions: 'Monitor blood sugar daily, follow diabetic diet, regular exercise',
      followUpDate: '2024-12-28',
      doctorNotes: 'HbA1c at 7.2%, continue current regimen',
      status: 'expired',
      refills: 0,
      createdAt: '2024-11-28 09:45 AM',
      pharmacy: {
        name: 'HealthPlus Pharmacy',
        address: '101 Health Ave, Health City',
        phone: '+1-234-567-8903'
      }
    },
    {
      id: 'PRES-005',
      patient: {
        id: 'PAT001',
        name: 'Alex Johnson',
        age: 32,
        gender: 'Male'
      },
      doctor: {
        id: 'DOC001',
        name: 'Dr. Sarah Johnson',
        specialization: 'General Physician'
      },
      date: '2024-11-15',
      diagnosis: 'Seasonal Allergies',
      medicines: [
        { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '15 days', notes: 'At bedtime' },
        { name: 'Nasal Spray', dosage: '2 sprays', frequency: 'Twice daily', duration: '10 days', notes: 'Each nostril' }
      ],
      instructions: 'Avoid allergens, use nasal spray regularly',
      followUpDate: '2024-11-25',
      doctorNotes: 'Monitor allergy symptoms',
      status: 'completed',
      refills: 0,
      createdAt: '2024-11-15 03:30 PM',
      pharmacy: {
        name: 'Allergy Care Pharmacy',
        address: '202 Allergy Lane, Health City',
        phone: '+1-234-567-8904'
      }
    }
  ];

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        
        // In real app, fetch from API with patient ID
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Filter prescriptions for current patient
        const patientPrescriptions = mockPrescriptions.filter(
          p => p.patient.id === (userData?.userId || 'PAT001')
        );
        
        setPrescriptions(patientPrescriptions);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        alert('Failed to load prescriptions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [userData?.userId]);

  // Filter prescriptions
  const filteredPrescriptions = prescriptions.filter(pres => {
    const matchesSearch = 
      pres.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pres.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pres.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pres.doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  const handlePrint = () => {
    window.print();
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Prescriptions</h1>
            <p className="text-gray-600">View and manage your medical prescriptions</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                // In real app, this would generate a combined PDF
                alert('All prescriptions exported as PDF!');
              }}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              <FaDownload />
              <span>Export All</span>
            </button>
            <button
              onClick={() => {
                // In real app, this would show prescription history
                alert('Showing prescription history');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
            >
              <FaHistory />
              <span>View History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl p-6 text-white mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{userData?.name || 'Patient'}</h2>
            <div className="space-y-1">
              <p className="text-teal-100">Patient ID: {userData?.userId || 'PAT001'}</p>
              <p className="text-teal-100">Total Prescriptions: {prescriptions.length}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-teal-100">Last Updated</div>
            <div className="text-xl font-bold">Today</div>
            <button className="mt-3 px-4 py-2 bg-white text-teal-600 rounded-lg font-medium hover:bg-gray-100">
              Request Refill
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <div className="text-gray-600">Active Prescriptions</div>
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
                {new Set(prescriptions.map(p => p.doctor.id)).size}
              </div>
              <div className="text-gray-600">Doctors</div>
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
              placeholder="Search by doctor name, diagnosis, or specialty..."
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
        {filteredPrescriptions.map(prescription => (
          <div key={prescription.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <FaFileMedicalAlt className="text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Prescription #{prescription.id}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <FaCalendar className="mr-1" />
                        {formatDate(prescription.date)}
                      </span>
                      <span className="flex items-center">
                        <FaUserMd className="mr-1" />
                        {prescription.doctor.name}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <span className={`px-4 py-2 rounded-full font-medium flex items-center justify-center space-x-2 ${getStatusColor(prescription.status)}`}>
                    {getStatusIcon(prescription.status)}
                    <span>{prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}</span>
                  </span>
                  
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{prescription.doctor.name}</div>
                    <div className="text-sm text-gray-600">
                      {prescription.doctor.specialization}
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnosis and Medicines Preview */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Diagnosis</h4>
                  <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">{prescription.diagnosis}</p>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-gray-900">Follow-up Date</div>
                    <div className="text-gray-700">
                      {prescription.followUpDate ? formatDate(prescription.followUpDate) : 'Not specified'}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Medicines ({prescription.medicines.length})</h4>
                  <div className="space-y-2">
                    {prescription.medicines.slice(0, 2).map((medicine, index) => (
                      <div key={index} className="p-3 bg-green-50 rounded-lg">
                        <div className="font-medium text-gray-900">{medicine.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {medicine.dosage} • {medicine.frequency}
                        </div>
                      </div>
                    ))}
                    {prescription.medicines.length > 2 && (
                      <div className="text-center text-gray-500">
                        + {prescription.medicines.length - 2} more medicines
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pharmacy Info */}
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">Pharmacy Information</h4>
                    <div className="text-gray-700">
                      <div>{prescription.pharmacy.name}</div>
                      <div className="text-sm">{prescription.pharmacy.address}</div>
                      <div className="text-sm">Phone: {prescription.pharmacy.phone}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Refills Left</div>
                    <div className="text-2xl font-bold text-teal-600">{prescription.refills}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Prescribed on {formatDate(prescription.date)} • {prescription.refills} refills available
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setSelectedPrescription(prescription);
                      setShowViewModal(true);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <FaEye />
                    <span>View Details</span>
                  </button>
                  
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 flex items-center space-x-2"
                  >
                    <FaPrint />
                    <span>Print</span>
                  </button>
                  
                  {prescription.refills > 0 && (
                    <button
                      onClick={() => alert(`Refill requested for ${prescription.id}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <FaPills />
                      <span>Request Refill</span>
                    </button>
                  )}
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
                setSearchTerm('');
                setFilter('all');
                setDateRange({ start: '', end: '' });
              }}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

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
                >
                  <FaTimes />
                </button>
              </div>
              
              {/* Header */}
              <div className="mb-8 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900">HEALTHAI CLINIC</h4>
                    <p className="text-gray-600">Electronic Prescription</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">#{selectedPrescription.id}</div>
                    <div className="text-gray-600">
                      Date: {formatDate(selectedPrescription.date)}
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
                    <div><span className="font-medium">Patient ID:</span> {selectedPrescription.patient.id}</div>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h5 className="font-bold text-gray-800 mb-3">Prescribing Doctor</h5>
                  <div className="space-y-2">
                    <div><span className="font-medium">Name:</span> {selectedPrescription.doctor.name}</div>
                    <div><span className="font-medium">Specialization:</span> {selectedPrescription.doctor.specialization}</div>
                    <div><span className="font-medium">Doctor ID:</span> {selectedPrescription.doctor.id}</div>
                    <div><span className="font-medium">Date:</span> {formatDate(selectedPrescription.date)}</div>
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
                        <th className="border border-gray-300 px-4 py-3 text-left">Medicine</th>
                        <th className="border border-gray-300 px-4 py-3 text-left">Dosage</th>
                        <th className="border border-gray-300 px-4 py-3 text-left">Frequency</th>
                        <th className="border border-gray-300 px-4 py-3 text-left">Duration</th>
                        <th className="border border-gray-300 px-4 py-3 text-left">Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPrescription.medicines.map((medicine, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-3 font-medium">{medicine.name}</td>
                          <td className="border border-gray-300 px-4 py-3">{medicine.dosage}</td>
                          <td className="border border-gray-300 px-4 py-3">{medicine.frequency}</td>
                          <td className="border border-gray-300 px-4 py-3">{medicine.duration}</td>
                          <td className="border border-gray-300 px-4 py-3">{medicine.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Instructions and Pharmacy */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h5 className="font-bold text-gray-800 mb-3">Patient Instructions</h5>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    {selectedPrescription.instructions}
                  </div>
                  
                  <h5 className="font-bold text-gray-800 mt-6 mb-3">Follow-up Information</h5>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div><span className="font-medium">Next Appointment:</span> {selectedPrescription.followUpDate ? formatDate(selectedPrescription.followUpDate) : 'Not specified'}</div>
                    <div className="mt-2"><span className="font-medium">Refills Left:</span> {selectedPrescription.refills}</div>
                    <div className="mt-2"><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-sm ${getStatusColor(selectedPrescription.status)}`}>
                        {selectedPrescription.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-bold text-gray-800 mb-3">Pharmacy Information</h5>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="font-bold text-lg mb-2">{selectedPrescription.pharmacy.name}</div>
                    <div className="text-gray-700 mb-1">{selectedPrescription.pharmacy.address}</div>
                    <div className="text-gray-700 mb-3">Phone: {selectedPrescription.pharmacy.phone}</div>
                    <div className="text-sm text-gray-600">
                      This prescription can be filled at the above pharmacy or any other pharmacy of your choice.
                    </div>
                  </div>
                  
                  <h5 className="font-bold text-gray-800 mt-6 mb-3">Doctor's Notes</h5>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    {selectedPrescription.doctorNotes || 'No additional notes from the doctor.'}
                  </div>
                </div>
              </div>
              
              {/* Important Notes */}
              <div className="mb-8 p-4 bg-red-50 rounded-lg">
                <h5 className="font-bold text-red-800 mb-3 flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  Important Information
                </h5>
                <ul className="text-red-700 space-y-2 text-sm">
                  <li>• Take medications exactly as prescribed by your doctor</li>
                  <li>• Do not stop taking medication without consulting your doctor</li>
                  <li>• Report any side effects to your doctor immediately</li>
                  <li>• Keep medications out of reach of children</li>
                  <li>• Store medications as per instructions on the label</li>
                </ul>
              </div>
              
              {/* Footer */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <div className="font-bold">Doctor's Signature</div>
                    <div className="text-gray-600">{selectedPrescription.doctor.name}</div>
                    <div className="text-sm text-gray-500">Licensed Physician</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Prescription created on</div>
                    <div className="font-medium">{selectedPrescription.createdAt}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Valid Until</div>
                    <div className="font-medium">
                      {selectedPrescription.followUpDate ? formatDate(selectedPrescription.followUpDate) : 'Until refills exhausted'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 pt-6 mt-6 border-t border-gray-200">
                <button 
                  onClick={handlePrint}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center space-x-2"
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
                    a.download = `my_prescription_${selectedPrescription.id}.json`;
                    a.click();
                  }}
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 flex items-center justify-center space-x-2"
                >
                  <FaDownload />
                  <span>Download Details</span>
                </button>
                {selectedPrescription.refills > 0 && (
                  <button 
                    onClick={() => {
                      alert(`Refill requested for prescription ${selectedPrescription.id}`);
                      setShowViewModal(false);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center space-x-2"
                  >
                    <FaPills />
                    <span>Request Refill</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;