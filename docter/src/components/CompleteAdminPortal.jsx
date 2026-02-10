import React, { useState, useEffect } from 'react';
import { 
  FaUserMd, FaUsers, FaFilePrescription, FaCreditCard, 
  FaChartLine, FaSearch, FaFilter, FaEdit, FaTrash,
  FaEye, FaPlus, FaCalendar, FaDollarSign, FaPills,
  FaPrint, FaDownload, FaCheckCircle, FaTimesCircle, FaClock,
  FaBell, FaPaperPlane, FaComment, FaEnvelope,
  FaClipboardCheck, FaStethoscope, FaRegCalendarCheck,
  FaRegCalendarTimes, FaUserCheck, FaUserPlus,
  FaExclamationTriangle, FaRegChartBar, FaHome,
  FaHospital, FaGraduationCap, FaStar, FaCertificate,
  FaTimes, FaCheck, FaArrowUp, FaArrowDown,
  FaChartBar, FaChartPie, FaFileAlt, FaPrescriptionBottle,
  FaMoneyBillWave, FaWallet, FaReceipt, FaHistory,
  FaShieldAlt, FaLock, FaQrcode, FaHeartbeat,
  FaPhone, FaMapMarkerAlt, FaFacebook, FaTwitter,
  FaLinkedin, FaInstagram, FaUserShield, FaUserCircle,
  FaSignOutAlt, FaQuestionCircle, FaCog,
  FaCalendarAlt, FaFileMedical, FaCalendarCheck
} from 'react-icons/fa';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const CompleteAdminPortal = ({ userType = 'admin', userData = {} }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // All Data States
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  // Modals State
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Form States
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    qualification: '',
    licenseNumber: '',
    hospital: '',
    consultationFee: '',
    bio: '',
    status: 'pending',
    languages: [],
    specialties: []
  });
  
  const [newNotification, setNewNotification] = useState({
    recipientType: 'all',
    recipientId: '',
    title: '',
    message: '',
    type: 'general',
    priority: 'medium'
  });
  
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Chart Data
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    // Initialize all data
    setTimeout(() => {
      // Doctors Data
      setDoctors([
        {
          id: 1,
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@healthai.com',
          phone: '+1 (555) 123-4567',
          specialization: 'General Physician & ENT Specialist',
          experience: 12,
          qualification: 'MD in Internal Medicine',
          licenseNumber: 'MED123456',
          hospital: 'City General Hospital',
          consultationFee: 120,
          bio: 'Specialized in throat infections and respiratory diseases.',
          status: 'active',
          languages: ['English', 'Spanish'],
          specialties: ['Throat Infections', 'Respiratory Care'],
          patients: 245,
          rating: 4.8,
          reviews: 245,
          joinDate: '2023-01-15',
          lastActive: 'Today, 10:30 AM',
          avatarColor: 'bg-teal-500'
        },
        {
          id: 2,
          name: 'Dr. Michael Chen',
          email: 'michael.chen@healthai.com',
          phone: '+1 (555) 987-6543',
          specialization: 'Internal Medicine',
          experience: 8,
          qualification: 'MD',
          licenseNumber: 'MED789012',
          hospital: 'General Hospital',
          consultationFee: 140,
          bio: 'Expert in chronic disease management.',
          status: 'active',
          languages: ['English', 'Chinese'],
          specialties: ['Chronic Disease', 'Diabetes'],
          patients: 189,
          rating: 4.6,
          reviews: 189,
          joinDate: '2023-03-22',
          lastActive: 'Today, 09:15 AM',
          avatarColor: 'bg-blue-500'
        },
        {
          id: 3,
          name: 'Dr. Emily Rodriguez',
          email: 'emily.rodriguez@healthai.com',
          phone: '+1 (555) 456-7890',
          specialization: 'Pediatrician',
          experience: 15,
          qualification: 'MD in Pediatrics',
          licenseNumber: 'MED345678',
          hospital: 'Children\'s Hospital',
          consultationFee: 150,
          bio: 'Specialized in child healthcare.',
          status: 'pending',
          languages: ['English', 'Spanish'],
          specialties: ['Child Healthcare', 'Vaccinations'],
          patients: 0,
          rating: 0,
          reviews: 0,
          joinDate: '2024-01-10',
          lastActive: 'Yesterday',
          avatarColor: 'bg-purple-500'
        }
      ]);

      // Patients Data
      setPatients([
        {
          id: 'PAT001',
          name: 'John Smith',
          email: 'john@example.com',
          age: 32,
          gender: 'Male',
          totalAppointments: 5,
          lastVisit: '2024-12-15',
          status: 'active',
          phone: '+1 (555) 111-2233',
          address: '123 Main St, City',
          bloodGroup: 'O+',
          allergies: ['Penicillin']
        },
        {
          id: 'PAT002',
          name: 'Emma Wilson',
          email: 'emma@example.com',
          age: 45,
          gender: 'Female',
          totalAppointments: 8,
          lastVisit: '2024-12-10',
          status: 'active',
          phone: '+1 (555) 222-3344',
          address: '456 Oak Ave, Town',
          bloodGroup: 'A+',
          allergies: ['None']
        }
      ]);

      // Prescriptions Data
      setPrescriptions([
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
            { name: 'Vitamin C', dosage: '1000mg', frequency: 'Once daily', duration: '7 days', notes: 'Morning' }
          ],
          instructions: 'Take rest, drink plenty of fluids, avoid cold drinks',
          followUpDate: '2024-12-22',
          doctorNotes: 'Patient should rest completely for 2 days',
          status: 'active',
          refills: 2,
          createdAt: '2024-12-15 10:30 AM'
        }
      ]);

      // Invoices Data
      setInvoices([
        {
          id: 'INV-2024-001',
          appointmentId: 'APT-001',
          patientName: 'John Smith',
          doctorName: 'Dr. Sarah Johnson',
          date: '2024-12-15',
          dueDate: '2024-12-22',
          amount: 120,
          tax: 12,
          total: 132,
          status: 'paid',
          paymentDate: '2024-12-15',
          paymentMethod: 'credit_card',
          items: [
            { description: 'Video Consultation', amount: 100 },
            { description: 'Medical Certificate', amount: 20 }
          ]
        }
      ]);

      // Notifications Data
      setNotifications([
        {
          id: 1,
          title: 'New Doctor Registration',
          message: 'Dr. Emily Rodriguez has registered and is awaiting approval.',
          type: 'doctor_registration',
          status: 'unread',
          timestamp: '10 minutes ago'
        },
        {
          id: 2,
          title: 'Prescription Request',
          message: 'Patient John Smith has requested a prescription refill.',
          type: 'prescription_request',
          status: 'unread',
          timestamp: '25 minutes ago'
        }
      ]);

      // Appointments Data
      setAppointments([
        {
          id: 'APT-001',
          patientName: 'John Smith',
          doctorName: 'Dr. Sarah Johnson',
          date: '2024-12-15',
          time: '10:30 AM',
          type: 'Video Consultation',
          status: 'completed',
          symptoms: 'Fever and cough'
        }
      ]);

      // Chart Data
      setChartData({
        appointments: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Appointments',
            data: [65, 59, 80, 81, 56, 55, 40, 70, 85, 90, 95, 120],
            borderColor: 'rgb(13, 148, 136)',
            backgroundColor: 'rgba(13, 148, 136, 0.1)',
            tension: 0.4
          }]
        },
        revenue: {
          labels: ['Video', 'Clinic', 'Emergency', 'Follow-up', 'Checkup'],
          datasets: [{
            label: 'Revenue by Type',
            data: [12000, 18000, 5000, 8000, 4500],
            backgroundColor: [
              'rgba(147, 51, 234, 0.8)',
              'rgba(13, 148, 136, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(59, 130, 246, 0.8)'
            ]
          }]
        },
        userGrowth: {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [
            {
              label: 'New Patients',
              data: [120, 150, 180, 220],
              backgroundColor: 'rgba(13, 148, 136, 0.8)'
            },
            {
              label: 'New Doctors',
              data: [8, 12, 15, 18],
              backgroundColor: 'rgba(147, 51, 234, 0.8)'
            }
          ]
        }
      });

      setLoading(false);
    }, 1500);
  }, []);

  // Calculate Statistics
  const calculateStats = () => {
    const totalDoctors = doctors.length;
    const activeDoctors = doctors.filter(d => d.status === 'active').length;
    const pendingDoctors = doctors.filter(d => d.status === 'pending').length;
    const totalPatients = patients.length;
    const totalPrescriptions = prescriptions.length;
    const totalAppointments = appointments.length;
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
    const pendingRevenue = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.total, 0);
    const unreadNotifications = notifications.filter(n => n.status === 'unread').length;
    
    return {
      totalDoctors,
      activeDoctors,
      pendingDoctors,
      totalPatients,
      totalPrescriptions,
      totalAppointments,
      totalRevenue,
      pendingRevenue,
      unreadNotifications,
      totalNotifications: notifications.length
    };
  };

  const stats = calculateStats();

  // Doctor Functions
  const handleAddDoctor = () => {
    const doctor = {
      id: doctors.length + 1,
      ...newDoctor,
      patients: 0,
      rating: 0,
      reviews: 0,
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: 'Just now',
      avatarColor: 'bg-teal-500'
    };
    
    setDoctors([...doctors, doctor]);
    
    // Add notification
    const notification = {
      id: notifications.length + 1,
      title: 'New Doctor Added',
      message: `${newDoctor.name} has been added to the system.`,
      type: 'system_alert',
      status: 'unread',
      timestamp: 'Just now'
    };
    setNotifications([notification, ...notifications]);
    
    setNewDoctor({ 
      name: '', email: '', phone: '', specialization: '', experience: '',
      qualification: '', licenseNumber: '', hospital: '', consultationFee: '',
      bio: '', status: 'pending', languages: [], specialties: []
    });
    setShowDoctorModal(false);
    alert('Doctor added successfully!');
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setNewDoctor(doctor);
    setShowDoctorModal(true);
  };

  const handleUpdateDoctor = () => {
    setDoctors(doctors.map(d => d.id === editingDoctor.id ? newDoctor : d));
    
    // Add notification
    const notification = {
      id: notifications.length + 1,
      title: 'Doctor Profile Updated',
      message: `${newDoctor.name}'s profile has been updated.`,
      type: 'system_alert',
      status: 'unread',
      timestamp: 'Just now'
    };
    setNotifications([notification, ...notifications]);
    
    setShowDoctorModal(false);
    setEditingDoctor(null);
    alert('Doctor updated successfully!');
  };

  const handleDeleteDoctor = (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      const doctor = doctors.find(d => d.id === id);
      setDoctors(doctors.filter(d => d.id !== id));
      
      // Add notification
      const notification = {
        id: notifications.length + 1,
        title: 'Doctor Removed',
        message: `${doctor.name} has been removed from the system.`,
        type: 'system_alert',
        status: 'unread',
        timestamp: 'Just now'
      };
      setNotifications([notification, ...notifications]);
      
      alert('Doctor deleted successfully!');
    }
  };

  const handleApproveDoctor = (id) => {
    setDoctors(doctors.map(d => 
      d.id === id ? { ...d, status: 'active' } : d
    ));
    
    const doctor = doctors.find(d => d.id === id);
    
    // Add notification
    const notification = {
      id: notifications.length + 1,
      title: 'Doctor Approved',
      message: `${doctor.name} has been approved and is now active.`,
      type: 'doctor_approval',
      status: 'unread',
      timestamp: 'Just now'
    };
    setNotifications([notification, ...notifications]);
    
    alert('Doctor approved successfully!');
  };

  // Notification Functions
  const handleSendNotification = () => {
    const notification = {
      id: notifications.length + 1,
      title: newNotification.title,
      message: newNotification.message,
      type: newNotification.type,
      status: 'sent',
      timestamp: 'Just now',
      recipientType: newNotification.recipientType,
      recipientId: newNotification.recipientId
    };

    setNotifications([notification, ...notifications]);
    alert(`Notification sent successfully!`);
    setShowNotificationModal(false);
    setNewNotification({
      recipientType: 'all',
      recipientId: '',
      title: '',
      message: '',
      type: 'general',
      priority: 'medium'
    });
  };

  // Prescription Functions
  const handleDeletePrescription = (id) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      setPrescriptions(prescriptions.filter(p => p.id !== id));
      alert('Prescription deleted successfully!');
    }
  };

  // Invoice Functions
  const handlePayInvoice = (invoiceId) => {
    setInvoices(invoices.map(inv => 
      inv.id === invoiceId ? { ...inv, status: 'paid' } : inv
    ));
    alert('Invoice marked as paid!');
  };

  // Utility Functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'paid':
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'unread':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending Review';
      case 'inactive': return 'Inactive';
      case 'verified': return 'Verified';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-600 rounded-lg">
                <FaUserMd className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Health<span className="text-teal-600">AI</span> Admin
                </h1>
                <p className="text-sm text-gray-500">Complete System Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-full">
                <FaBell />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</div>
                <div className="text-gray-600">Total Doctors</div>
                <div className="text-sm text-teal-600 mt-1">
                  {stats.activeDoctors} active • {stats.pendingDoctors} pending
                </div>
              </div>
              <FaUserMd className="text-teal-600 text-2xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalPatients}</div>
                <div className="text-gray-600">Total Patients</div>
                <div className="text-sm text-blue-600 mt-1">
                  All patients active
                </div>
              </div>
              <FaUsers className="text-blue-600 text-2xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">${stats.totalRevenue}</div>
                <div className="text-gray-600">Total Revenue</div>
                <div className="text-sm text-green-600 mt-1">
                  ${stats.pendingRevenue} pending
                </div>
              </div>
              <FaDollarSign className="text-green-600 text-2xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</div>
                <div className="text-gray-600">Appointments</div>
                <div className="text-sm text-purple-600 mt-1">
                  This month
                </div>
              </div>
              <FaCalendar className="text-purple-600 text-2xl" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowDoctorModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              <FaUserPlus />
              <span>Add New Doctor</span>
            </button>
            
            <button
              onClick={() => setShowNotificationModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPaperPlane />
              <span>Send Notification</span>
            </button>
            
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <FaClipboardCheck />
              <span>Generate Report</span>
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FaRegChartBar />
              <span>View Analytics</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <FaHome /> },
            { id: 'doctors', label: 'Doctors', icon: <FaUserMd /> },
            { id: 'patients', label: 'Patients', icon: <FaUsers /> },
            { id: 'prescriptions', label: 'Prescriptions', icon: <FaFilePrescription /> },
            { id: 'billing', label: 'Billing', icon: <FaCreditCard /> },
            { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
            { id: 'analytics', label: 'Analytics', icon: <FaChartLine /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">System Overview</h2>
              
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Appointment Trends</h3>
                  <div className="h-64">
                    <Line data={chartData.appointments} options={chartOptions} />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Breakdown</h3>
                  <div className="h-64">
                    <Pie data={chartData.revenue} options={chartOptions} />
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">User Growth</h3>
                  <div className="h-48">
                    <Bar data={chartData.userGrowth} options={chartOptions} />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activities</h3>
                  <div className="space-y-4">
                    {notifications.slice(0, 3).map(notification => (
                      <div key={notification.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-900">{notification.title}</div>
                            <div className="text-sm text-gray-600">{notification.message}</div>
                          </div>
                          <div className="text-sm text-gray-500">{notification.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Doctors Tab */}
          {activeTab === 'doctors' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Doctors Management</h2>
                <div className="flex space-x-2">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search doctors..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => {
                      setEditingDoctor(null);
                      setNewDoctor({ 
                        name: '', email: '', phone: '', specialization: '', experience: '',
                        qualification: '', licenseNumber: '', hospital: '', consultationFee: '',
                        bio: '', status: 'pending', languages: [], specialties: []
                      });
                      setShowDoctorModal(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg"
                  >
                    <FaPlus />
                    <span>Add Doctor</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 font-medium text-gray-700">Doctor</th>
                      <th className="text-left py-3 font-medium text-gray-700">Specialization</th>
                      <th className="text-left py-3 font-medium text-gray-700">Experience</th>
                      <th className="text-left py-3 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 font-medium text-gray-700">Patients</th>
                      <th className="text-left py-3 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map(doctor => (
                      <tr key={doctor.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 ${doctor.avatarColor} rounded-full flex items-center justify-center text-white font-bold`}>
                              {doctor.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{doctor.name}</div>
                              <div className="text-sm text-gray-500">{doctor.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="text-gray-900">{doctor.specialization}</div>
                          <div className="text-sm text-gray-500">{doctor.hospital}</div>
                        </td>
                        <td className="py-4">
                          <div className="text-gray-900">{doctor.experience} years</div>
                          <div className="text-sm text-gray-500">{doctor.qualification}</div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(doctor.status)}`}>
                              {getStatusText(doctor.status)}
                            </span>
                            {doctor.status === 'pending' && (
                              <button
                                onClick={() => handleApproveDoctor(doctor.id)}
                                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Approve
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="text-gray-900 font-medium">{doctor.patients}</div>
                          <div className="text-sm text-gray-500">patients</div>
                        </td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditDoctor(doctor)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteDoctor(doctor.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(doctor);
                                setShowViewModal(true);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="View"
                            >
                              <FaEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Patients Tab */}
          {activeTab === 'patients' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Patients Management</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map(patient => (
                  <div key={patient.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaUsers className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-gray-500">{patient.email}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(patient.status)}`}>
                          {patient.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Age:</span>
                        <span className="font-medium">{patient.age} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gender:</span>
                        <span className="font-medium">{patient.gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{patient.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Appointments:</span>
                        <span className="font-medium">{patient.totalAppointments}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                        View Profile
                      </button>
                      <button className="flex-1 px-3 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700">
                        Medical History
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Prescriptions Management</h2>
                <button className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg">
                  <FaPlus />
                  <span>Create Prescription</span>
                </button>
              </div>

              <div className="space-y-4">
                {prescriptions.map(prescription => (
                  <div key={prescription.id} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FaFilePrescription className="text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{prescription.id}</h4>
                          <div className="text-sm text-gray-600">
                            {prescription.patient.name} • {prescription.doctor.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Date: {new Date(prescription.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(prescription.status)}`}>
                            {prescription.status}
                          </span>
                          <div className="text-sm text-gray-600 mt-1">
                            Refills: {prescription.refills}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View">
                            <FaEye />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Print">
                            <FaPrint />
                          </button>
                          <button
                            onClick={() => handleDeletePrescription(prescription.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Billing Management</h2>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <FaFilter />
                  <span>Filter</span>
                </button>
              </div>

              <div className="space-y-4">
                {invoices.map(invoice => (
                  <div key={invoice.id} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-teal-100 rounded-lg">
                          <FaCreditCard className="text-teal-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{invoice.id}</h4>
                          <div className="text-sm text-gray-600">
                            {invoice.patientName} • {invoice.doctorName}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Date: {new Date(invoice.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <div className="text-xl font-bold text-gray-900">${invoice.total}</div>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedItem(invoice);
                                setShowViewModal(true);
                              }}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                              title="View"
                            >
                              <FaEye />
                            </button>
                            {invoice.status !== 'paid' && (
                              <button
                                onClick={() => handlePayInvoice(invoice.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                              >
                                Mark Paid
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Notifications Management</h2>
                <button
                  onClick={() => setShowNotificationModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  <FaPaperPlane />
                  <span>Send Notification</span>
                </button>
              </div>

              <div className="space-y-4">
                {notifications.map(notification => (
                  <div key={notification.id} className={`p-4 border rounded-xl ${notification.status === 'unread' ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-gray-900">{notification.title}</h4>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <div className="flex items-center space-x-3 mt-2 text-sm text-gray-500">
                          <span>{notification.timestamp}</span>
                          <span className="capitalize">{notification.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {notification.status === 'unread' && (
                          <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">
                            Mark as Read
                          </button>
                        )}
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">System Analytics</h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl text-white">
                  <div className="text-3xl font-bold mb-2">{doctors.length}</div>
                  <div className="text-lg">Total Doctors</div>
                  <div className="text-sm opacity-90 mt-2">
                    {doctors.filter(d => d.status === 'active').length} active
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white">
                  <div className="text-3xl font-bold mb-2">{patients.length}</div>
                  <div className="text-lg">Total Patients</div>
                </div>
                
                <div className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl text-white">
                  <div className="text-3xl font-bold mb-2">${stats.totalRevenue}</div>
                  <div className="text-lg">Total Revenue</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-4">System Health</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="font-bold text-lg">API</div>
                    <div className="text-sm text-green-600">Operational</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="font-bold text-lg">Database</div>
                    <div className="text-sm text-green-600">Operational</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="font-bold text-lg">Video</div>
                    <div className="text-sm text-green-600">Operational</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="font-bold text-lg">Payment</div>
                    <div className="text-sm text-green-600">Operational</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Doctor Modal */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingDoctor ? 'Edit Doctor Profile' : 'Add New Doctor'}
                  </h2>
                  <p className="text-gray-600">
                    {editingDoctor ? 'Update doctor information' : 'Register a new doctor in the system'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDoctorModal(false);
                    setEditingDoctor(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  <FaTimes />
                </button>
              </div>

              <form className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={newDoctor.name}
                        onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="Dr. John Smith"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={newDoctor.email}
                        onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="doctor@hospital.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={newDoctor.phone}
                        onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={newDoctor.status}
                        onChange={(e) => setNewDoctor({...newDoctor, status: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="pending">Pending Review</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Professional Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization *
                      </label>
                      <select
                        value={newDoctor.specialization}
                        onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select Specialization</option>
                        <option value="General Physician">General Physician</option>
                        <option value="ENT Specialist">ENT Specialist</option>
                        <option value="Cardiologist">Cardiologist</option>
                        <option value="Dermatologist">Dermatologist</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience *
                      </label>
                      <input
                        type="number"
                        value={newDoctor.experience}
                        onChange={(e) => setNewDoctor({...newDoctor, experience: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="10"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Highest Qualification
                      </label>
                      <input
                        type="text"
                        value={newDoctor.qualification}
                        onChange={(e) => setNewDoctor({...newDoctor, qualification: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="MD, MBBS"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Consultation Fee ($)
                      </label>
                      <input
                        type="number"
                        value={newDoctor.consultationFee}
                        onChange={(e) => setNewDoctor({...newDoctor, consultationFee: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="120"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical License Number *
                    </label>
                    <input
                      type="text"
                      value={newDoctor.licenseNumber}
                      onChange={(e) => setNewDoctor({...newDoctor, licenseNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="MED12345678"
                      required
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Practice Details</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hospital/Clinic
                      </label>
                      <input
                        type="text"
                        value={newDoctor.hospital}
                        onChange={(e) => setNewDoctor({...newDoctor, hospital: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="City General Hospital"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Professional Biography</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      About the Doctor
                    </label>
                    <textarea
                      value={newDoctor.bio}
                      onChange={(e) => setNewDoctor({...newDoctor, bio: e.target.value})}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
                      placeholder="Describe the doctor's professional background, achievements, and approach to patient care..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDoctorModal(false);
                      setEditingDoctor(null);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={editingDoctor ? handleUpdateDoctor : handleAddDoctor}
                    className="px-8 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700"
                  >
                    {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Send Notification</h3>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient
                  </label>
                  <div className="flex space-x-4">
                    {['all', 'doctors', 'patients'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewNotification({...newNotification, recipientType: type})}
                        className={`px-4 py-2 rounded-lg font-medium capitalize ${
                          newNotification.recipientType === type
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Notification title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Type your notification message here..."
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNotificationModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendNotification}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FaPaperPlane className="inline mr-2" />
                    Send Notification
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Item Modal */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Render details based on item type */}
                {'specialization' in selectedItem ? (
                  // Doctor details
                  <>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-16 h-16 ${selectedItem.avatarColor} rounded-full flex items-center justify-center text-white text-2xl font-bold`}>
                        {selectedItem.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{selectedItem.name}</h4>
                        <p className="text-teal-600">{selectedItem.specialization}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600">Email</label>
                        <div className="font-medium">{selectedItem.email}</div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600">Phone</label>
                        <div className="font-medium">{selectedItem.phone}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600">Hospital</label>
                        <div className="font-medium">{selectedItem.hospital}</div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600">Experience</label>
                        <div className="font-medium">{selectedItem.experience} years</div>
                      </div>
                    </div>
                  </>
                ) : 'total' in selectedItem ? (
                  // Invoice details
                  <>
                    <div className="mb-4">
                      <h4 className="font-bold text-gray-900">{selectedItem.id}</h4>
                      <p className="text-gray-600">{selectedItem.patientName} • {selectedItem.doctorName}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600">Amount</label>
                        <div className="text-xl font-bold text-gray-900">${selectedItem.total}</div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600">Status</label>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedItem.status)}`}>
                          {selectedItem.status}
                        </span>
                      </div>
                    </div>
                  </>
                ) : null}
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompleteAdminPortal;