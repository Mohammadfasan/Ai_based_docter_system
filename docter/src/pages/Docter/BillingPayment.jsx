import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCreditCard, FaWallet, FaFileInvoice, FaDownload, FaEye, 
  FaHistory, FaCalendar, FaCheckCircle, FaClock, FaExclamationTriangle,
  FaSearch, FaFilter, FaShieldAlt, FaLock, FaChevronRight,
  FaDollarSign, FaArrowUp, FaArrowDown, FaUserMd, FaStar,
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaPrint, FaShareAlt,
  FaCreditCard as FaCard, FaBell, FaRegCalendarCheck
} from 'react-icons/fa';

const BillingPayment = ({ userType, userData, darkMode }) => {
  const [activeTab, setActiveTab] = useState('unpaid');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showReceipt, setShowReceipt] = useState(false);
  const [paidReceipt, setPaidReceipt] = useState(null);

  // Combined Data (Doctors with their invoices)
  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialization: 'General Physician',
      rating: 4.8,
      avatarColor: 'bg-teal-500',
      totalPaid: 13500.00,
      invoices: [
        {
          id: 'INV-2024-001',
          service: 'General Consultation',
          date: '2024-11-15',
          dueDate: '2024-11-20',
          amount: 3500.00,
          status: 'paid',
          method: 'Visa **** 4242',
          appointmentId: 'APT-001'
        },
        {
          id: 'INV-2024-004',
          service: 'Follow-up Consultation',
          date: '2024-12-10',
          dueDate: '2024-12-15',
          amount: 2500.00,
          status: 'pending',
          method: null,
          appointmentId: 'APT-004'
        }
      ]
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialization: 'Cardiologist',
      rating: 4.9,
      avatarColor: 'bg-blue-500',
      totalPaid: 37500.00,
      invoices: [
        {
          id: 'INV-2024-002',
          service: 'Cardiac Screening (ECG)',
          date: '2024-12-01',
          dueDate: '2024-12-05',
          amount: 15000.00,
          status: 'pending',
          method: null,
          appointmentId: 'APT-002'
        },
        {
          id: 'INV-2024-005',
          service: 'Echocardiogram',
          date: '2024-10-15',
          dueDate: '2024-10-20',
          amount: 24000.00,
          status: 'paid',
          method: 'MasterCard **** 5555',
          appointmentId: 'APT-005'
        }
      ]
    },
    {
      id: 3,
      name: 'Dr. Aravinda De Silva',
      specialization: 'Neurologist',
      rating: 4.7,
      avatarColor: 'bg-purple-500',
      totalPaid: 96000.00,
      invoices: [
        {
          id: 'INV-2024-003',
          service: 'MRI Scan - Brain',
          date: '2024-10-25',
          dueDate: '2024-10-30',
          amount: 36000.00,
          status: 'overdue',
          method: null,
          appointmentId: 'APT-003'
        },
        {
          id: 'INV-2024-006',
          service: 'Neurological Consultation',
          date: '2024-09-12',
          dueDate: '2024-09-17',
          amount: 60000.00,
          status: 'paid',
          method: 'Visa **** 4242',
          appointmentId: 'APT-006'
        }
      ]
    }
  ]);

  // Flatten invoices for calculations
  const allInvoices = doctors.flatMap(doctor => 
    doctor.invoices.map(invoice => ({
      ...invoice,
      doctor: doctor.name,
      doctorId: doctor.id,
      specialization: doctor.specialization,
      avatarColor: doctor.avatarColor,
      rating: doctor.rating
    }))
  );

  // Stats Calculation
  const totalDue = allInvoices
    .filter(i => i.status === 'pending' || i.status === 'overdue')
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const totalPaid = allInvoices
    .filter(i => i.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const overdueCount = allInvoices.filter(i => i.status === 'overdue').length;
  const pendingCount = allInvoices.filter(i => i.status === 'pending').length;

  // Filter Logic
  const filteredInvoices = allInvoices.filter(inv => {
    const matchesSearch = inv.doctor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'unpaid') return matchesSearch && (inv.status === 'pending' || inv.status === 'overdue');
    if (activeTab === 'paid') return matchesSearch && inv.status === 'paid';
    return matchesSearch;
  });

  const handlePayClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const processPayment = () => {
    setTimeout(() => {
      setDoctors(prevDoctors => 
        prevDoctors.map(doctor => {
          if (doctor.id === selectedInvoice.doctorId) {
            return {
              ...doctor,
              invoices: doctor.invoices.map(inv => 
                inv.id === selectedInvoice.id 
                  ? { 
                    ...inv, 
                    status: 'paid', 
                    method: paymentMethod === 'card' ? 'Visa **** 4242' : 'Digital Wallet',
                    paidDate: new Date().toISOString().split('T')[0]
                  } 
                  : inv
              ),
              totalPaid: doctor.totalPaid + selectedInvoice.amount
            };
          }
          return doctor;
        })
      );
      
      // Generate receipt
      const receipt = {
        ...selectedInvoice,
        paidDate: new Date().toISOString().split('T')[0],
        transactionId: `TXN-${Date.now()}`,
        paymentMethod: paymentMethod === 'card' ? 'Visa **** 4242' : 'Digital Wallet',
        patientName: userData?.name || 'Patient',
        patientId: userData?.userId || 'PAT001'
      };
      
      setPaidReceipt(receipt);
      setShowPaymentModal(false);
      setShowReceipt(true);
    }, 1500);
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return <FaCheckCircle className="text-emerald-500" />;
      case 'pending': return <FaClock className="text-amber-500" />;
      case 'overdue': return <FaExclamationTriangle className="text-red-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  // Get doctor stats
  const getDoctorStats = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return { totalInvoices: 0, unpaid: 0, paid: 0 };
    
    const unpaid = doctor.invoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue');
    const paid = doctor.invoices.filter(inv => inv.status === 'paid');
    
    return {
      totalInvoices: doctor.invoices.length,
      unpaid: unpaid.length,
      paid: paid.length,
      unpaidAmount: unpaid.reduce((acc, inv) => acc + inv.amount, 0)
    };
  };

  const printReceipt = () => {
    window.print();
  };

  const shareReceipt = () => {
    if (navigator.share) {
      navigator.share({
        title: `Payment Receipt - ${paidReceipt.id}`,
        text: `Payment of Rs. ${paidReceipt.amount.toLocaleString()} to ${paidReceipt.doctor} for ${paidReceipt.service}`,
      });
    } else {
      navigator.clipboard.writeText(`Payment Receipt: ${paidReceipt.id} - Rs. ${paidReceipt.amount.toLocaleString()}`);
      alert('Receipt copied to clipboard!');
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Billing & Payments
            </h1>
            <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your invoices and payment methods
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              darkMode 
                ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}>
              <FaHistory /> Payment History
            </button>
            <Link 
              to="/appointments" 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                darkMode 
                  ? 'bg-teal-600 text-white hover:bg-teal-700' 
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              }`}
            >
              <FaRegCalendarCheck /> My Appointments
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Left: Stats Cards */}
          <div className="lg:col-span-2 space-y-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Due Card */}
               <div className={`rounded-2xl p-6 shadow-lg relative overflow-hidden ${
                 darkMode ? 'bg-gradient-to-br from-red-900/80 to-pink-900/80' : 'bg-gradient-to-br from-red-500 to-pink-600'
               } text-white`}>
                  <div className="relative z-10">
                    <p className="text-red-100 font-medium text-sm mb-1">Total Outstanding</p>
                    <h2 className="text-3xl font-bold">Rs. {totalDue.toLocaleString()}</h2>
                    <div className="mt-4 flex items-center gap-2 text-sm bg-white/20 w-fit px-3 py-1 rounded-lg backdrop-blur-sm">
                      <FaExclamationTriangle /> {overdueCount} Overdue • {pendingCount} Pending
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 text-white/20 w-32 h-32 rotate-12 flex items-center justify-center font-bold text-6xl">Rs</div>
               </div>

               {/* Paid Card */}
               <div className={`rounded-2xl p-6 shadow-sm relative ${
                 darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-100'
               }`}>
                  <p className={`font-bold text-xs uppercase tracking-wider mb-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Total Paid (This Year)
                  </p>
                  <h2 className="text-3xl font-bold">Rs. {totalPaid.toLocaleString()}</h2>
                  <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 font-medium">
                    <FaArrowUp /> +12% from last month
                  </div>
               </div>
             </div>

             {/* Doctor Summary */}
             <div className={`rounded-2xl p-6 shadow-sm ${
               darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-100'
             }`}>
               <h3 className={`font-bold mb-4 flex items-center gap-2 ${
                 darkMode ? 'text-white' : 'text-gray-900'
               }`}>
                 <FaCalendar /> Doctors Summary
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {doctors.map(doctor => {
                   const stats = getDoctorStats(doctor.id);
                   return (
                     <div key={doctor.id} className={`p-4 rounded-xl transition-colors ${
                       darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                     }`}>
                       <div className="flex items-start justify-between">
                         <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 ${doctor.avatarColor} rounded-full flex items-center justify-center text-white font-bold`}>
                             {doctor.name.charAt(0)}
                           </div>
                           <div>
                             <h4 className="font-bold">{doctor.name}</h4>
                             <p className="text-xs opacity-80">{doctor.specialization}</p>
                           </div>
                         </div>
                         <span className={`text-xs px-2 py-1 rounded-full ${
                           darkMode ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                         }`}>
                           ★ {doctor.rating}
                         </span>
                       </div>
                       <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                         <div className="text-center">
                           <p className="font-bold">{stats.totalInvoices}</p>
                           <p className="opacity-80">Invoices</p>
                         </div>
                         <div className="text-center">
                           <p className="font-bold text-red-500">{stats.unpaid}</p>
                           <p className="opacity-80">Unpaid</p>
                         </div>
                         <div className="text-center">
                           <p className="font-bold text-emerald-500">{stats.paid}</p>
                           <p className="opacity-80">Paid</p>
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>

             {/* Controls */}
             <div className={`p-2 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 ${
               darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-100'
             }`}>
                <div className={`flex p-1 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  {['unpaid', 'paid', 'all'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2 rounded-md text-sm font-bold capitalize transition-all ${
                        activeTab === tab 
                          ? darkMode 
                            ? 'bg-teal-600 text-white' 
                            : 'bg-white text-teal-600 shadow-sm' 
                          : darkMode
                            ? 'text-gray-400 hover:text-gray-300'
                            : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="relative w-full sm:w-64">
                  <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input 
                    type="text" 
                    placeholder="Search invoices or doctors..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none text-sm ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-500'
                    }`}
                  />
                </div>
             </div>

             {/* Invoices List */}
             <div className="space-y-4">
                {filteredInvoices.length === 0 ? (
                  <div className={`text-center py-12 rounded-2xl border ${
                    darkMode 
                      ? 'bg-gray-800 border-dashed border-gray-700' 
                      : 'bg-white border-dashed border-gray-200'
                  }`}>
                    <FaFileInvoice className={`mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} size={40} />
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                      No invoices found.
                    </p>
                  </div>
                ) : (
                  filteredInvoices.map(inv => (
                    <div key={inv.id} className={`p-5 rounded-2xl shadow-sm transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 hover:border-teal-700' 
                        : 'bg-white border border-gray-100 hover:border-teal-200'
                    }`}>
                      
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          inv.status === 'paid' 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <FaFileInvoice size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold">{inv.service}</h3>
                          <p className="text-xs opacity-80">{inv.doctor} • {inv.date}</p>
                          <p className="text-xs font-medium opacity-60 mt-1">
                            ID: {inv.id} • {inv.specialization}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <p className="text-lg font-bold">Rs. {inv.amount.toLocaleString()}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(inv.status)}
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                              getStatusStyle(inv.status)
                            } ${darkMode ? 'border-opacity-50' : ''}`}>
                              {inv.status}
                            </span>
                          </div>
                        </div>
                        
                        {inv.status !== 'paid' ? (
                          <button 
                            onClick={() => handlePayClick(inv)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all ${
                              darkMode 
                                ? 'bg-teal-600 text-white hover:bg-teal-700' 
                                : 'bg-gray-900 text-white hover:bg-teal-600'
                            }`}
                          >
                            Pay Now
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button className={`p-2 border rounded-xl transition-colors ${
                              darkMode 
                                ? 'border-gray-600 text-gray-400 hover:text-teal-400' 
                                : 'border-gray-200 text-gray-400 hover:text-teal-600'
                            }`}>
                              <FaDownload />
                            </button>
                            <button className={`p-2 border rounded-xl transition-colors ${
                              darkMode 
                                ? 'border-gray-600 text-gray-400 hover:text-teal-400' 
                                : 'border-gray-200 text-gray-400 hover:text-teal-600'
                            }`}>
                              <FaEye />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>

          {/* Right: Payment Methods */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className={`rounded-2xl p-6 shadow-sm ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-100'
            }`}>
              <h3 className={`font-bold mb-4 flex items-center gap-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <FaWallet className="text-teal-500" /> Saved Cards
              </h3>
              
              {/* Virtual Card UI */}
              <div className={`p-6 rounded-2xl shadow-xl mb-4 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform ${
                darkMode 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
                  : 'bg-gradient-to-br from-gray-800 to-gray-900'
              } text-white`}>
                <div className="flex justify-between items-start mb-8">
                   <FaCreditCard size={24} className="opacity-80" />
                   <span className="font-bold italic text-lg opacity-50">VISA</span>
                </div>
                <div className="mb-4">
                  <p className="text-xs opacity-60 mb-1">Card Number</p>
                  <p className="font-mono text-xl tracking-widest">**** **** **** 4242</p>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-[10px] opacity-60">Card Holder</p>
                    <p className="text-sm font-medium">{userData?.name?.toUpperCase() || 'ALEX JOHNSON'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] opacity-60">Expires</p>
                    <p className="text-sm font-medium">12/25</p>
                  </div>
                </div>
                {/* Decoration */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
              </div>

              <button className={`w-full py-3 border border-dashed rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                darkMode 
                  ? 'border-gray-600 text-gray-400 hover:border-teal-500 hover:text-teal-400' 
                  : 'border-gray-300 text-gray-500 hover:border-teal-300 hover:text-teal-600'
              }`}>
                <div className={`p-1 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <FaCheckCircle size={12} />
                </div> 
                Add New Card
              </button>
            </div>

            {/* Doctor Payment Summary */}
            <div className={`rounded-2xl p-6 shadow-sm ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-100'
            }`}>
              <h3 className={`font-bold mb-4 flex items-center gap-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <FaFileInvoice className="text-amber-500" /> Top Paid Doctors
              </h3>
              <div className="space-y-3">
                {doctors
                  .sort((a, b) => b.totalPaid - a.totalPaid)
                  .map(doctor => (
                    <div key={doctor.id} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${doctor.avatarColor} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                          {doctor.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{doctor.name}</p>
                          <p className="text-xs opacity-80">{doctor.specialization}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-500">Rs. {doctor.totalPaid.toLocaleString()}</p>
                        <p className="text-xs opacity-80">
                          {doctor.invoices.filter(inv => inv.status === 'paid').length} paid
                        </p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-teal-900/30 border-teal-800' : 'bg-teal-50 border-teal-100'
            }`}>
              <h3 className={`font-bold mb-2 flex items-center gap-2 ${
                darkMode ? 'text-teal-300' : 'text-teal-900'
              }`}>
                <FaShieldAlt /> Secure Payments
              </h3>
              <p className={`text-xs leading-relaxed ${
                darkMode ? 'text-teal-200/70' : 'text-teal-800/70'
              }`}>
                All transactions are encrypted with 256-bit SSL security. We do not store your full card details.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-[2rem] max-w-md w-full shadow-2xl overflow-hidden ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            
            <div className={`p-6 border-b text-center ${
              darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'
            }`}>
              <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Total Amount
              </p>
              <h2 className="text-4xl font-bold">Rs. {selectedInvoice.amount.toLocaleString()}</h2>
              <p className={`text-sm font-medium mt-2 ${
                darkMode ? 'text-teal-400' : 'text-teal-600'
              }`}>
                {selectedInvoice.service}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                For: {selectedInvoice.doctor} ({selectedInvoice.specialization})
              </p>
            </div>

            <div className="p-6 space-y-4">
               {/* Payment Method Select */}
               <div>
                 <label className={`text-xs font-bold uppercase ml-1 ${
                   darkMode ? 'text-gray-400' : 'text-gray-500'
                 }`}>
                   Select Method
                 </label>
                 <div className="mt-2 flex gap-3">
                   <button 
                     onClick={() => setPaymentMethod('card')}
                     className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-bold flex items-center justify-center gap-2 ${
                       paymentMethod === 'card'
                         ? darkMode
                           ? 'border-teal-500 bg-teal-900/30 text-teal-400'
                           : 'border-teal-500 bg-teal-50 text-teal-700'
                         : darkMode
                           ? 'border-gray-700 text-gray-400 hover:bg-gray-700'
                           : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                     }`}
                   >
                     <FaCard /> Card
                   </button>
                   <button 
                     onClick={() => setPaymentMethod('wallet')}
                     className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 ${
                       paymentMethod === 'wallet'
                         ? darkMode
                           ? 'border-teal-500 bg-teal-900/30 text-teal-400'
                           : 'border-teal-500 bg-teal-50 text-teal-700'
                         : darkMode
                           ? 'border-gray-700 text-gray-400 hover:bg-gray-700'
                           : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                     }`}
                   >
                     <FaWallet /> Wallet
                   </button>
                 </div>
               </div>

               {/* Card Details (Mock) */}
               {paymentMethod === 'card' && (
                 <div className="space-y-3 pt-2">
                    <input 
                      type="text" 
                      placeholder="Card Number" 
                      className={`w-full p-3.5 rounded-xl text-sm border-none focus:ring-2 focus:ring-teal-500/20 outline-none ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'
                      }`} 
                      defaultValue="4242 4242 4242 4242" 
                    />
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        className={`flex-1 p-3.5 rounded-xl text-sm border-none focus:ring-2 focus:ring-teal-500/20 outline-none ${
                          darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'
                        }`} 
                        defaultValue="12/25" 
                      />
                      <input 
                        type="text" 
                        placeholder="CVC" 
                        className={`w-24 p-3.5 rounded-xl text-sm border-none focus:ring-2 focus:ring-teal-500/20 outline-none ${
                          darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'
                        }`} 
                      />
                    </div>
                 </div>
               )}

               {paymentMethod === 'wallet' && (
                 <div className={`p-4 rounded-xl text-center ${
                   darkMode ? 'bg-gray-700' : 'bg-100'
                 }`}>
                   <p className="text-sm font-medium">Pay with your digital wallet</p>
                   <p className="text-xs opacity-80 mt-1">Available balance: Rs. 125,000.00</p>
                 </div>
               )}

               <div className="flex items-center gap-2 text-[10px] justify-center pt-2">
                 <FaLock /> Encrypted & Secure
               </div>
            </div>

            <div className={`p-4 border-t flex gap-3 ${
              darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'
            }`}>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
                  darkMode 
                    ? 'text-gray-400 hover:bg-gray-700' 
                    : 'text-gray-500 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button 
                onClick={processPayment}
                className={`flex-1 py-3 rounded-xl font-bold shadow-lg transition-colors flex items-center justify-center gap-2 ${
                  darkMode 
                    ? 'bg-teal-600 text-white hover:bg-teal-700' 
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                Pay Now <FaArrowDown size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && paidReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-[2rem] max-w-md w-full shadow-2xl overflow-hidden ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            
            <div className={`p-6 border-b text-center ${
              darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'
            }`}>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-emerald-600 text-2xl" />
              </div>
              <h2 className="text-2xl font-bold">Payment Successful!</h2>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Transaction ID: {paidReceipt.transactionId}
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="opacity-80">Amount Paid:</span>
                  <span className="font-bold">Rs. {paidReceipt.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Service:</span>
                  <span className="font-medium">{paidReceipt.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Doctor:</span>
                  <span className="font-medium">{paidReceipt.doctor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Payment Date:</span>
                  <span className="font-medium">{paidReceipt.paidDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Payment Method:</span>
                  <span className="font-medium">{paidReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t flex justify-center gap-3">
                <button 
                  onClick={printReceipt}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaPrint /> Print
                </button>
                <button 
                  onClick={shareReceipt}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium ${
                    darkMode 
                      ? 'bg-teal-700 text-white hover:bg-teal-600' 
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  <FaShareAlt /> Share
                </button>
                <button 
                  onClick={() => setShowReceipt(false)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-300' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BillingPayment;