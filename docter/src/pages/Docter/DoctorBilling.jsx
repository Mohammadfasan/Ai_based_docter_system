import React, { useState } from 'react';
import { 
  FaMoneyBill, FaCalendarAlt, FaChartLine, FaCreditCard, 
  FaUserInjured, FaCheckCircle, FaClock, FaExclamationTriangle,
  FaDownload, FaPrint, FaFilter, FaSearch, FaDollarSign,
  FaArrowUp, FaArrowDown, FaCalendarCheck, FaFileInvoice,
  FaBolt, FaBell 
} from 'react-icons/fa';

const DoctorBilling = ({ userType, userData, darkMode }) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('month');

  // Doctor's billing data
  const [doctorEarnings, setDoctorEarnings] = useState({
    totalEarned: 520000.00,
    pendingPayments: 57000.00,
    thisMonthEarnings: 120000.00,
    lastMonthEarnings: 150000.00,
    yearToDate: 520000.00
  });

  const MONTHLY_GOAL = 800000.00;

  const [patientPayments, setPatientPayments] = useState([
    {
      id: 'PAY-001',
      patientId: 'PAT001',
      patientName: 'Alex Johnson',
      appointmentId: 'APT-001',
      service: 'General Consultation',
      date: '2024-12-15',
      amount: 3500.00,
      status: 'paid',
      method: 'Visa **** 4242'
    },
    {
      id: 'PAY-002',
      patientId: 'PAT002',
      patientName: 'Sarah Smith',
      appointmentId: 'APT-002',
      service: 'Cardiac Screening',
      date: '2024-12-16',
      amount: 15000.00,
      status: 'pending',
      method: null
    },
    {
      id: 'PAY-003',
      patientId: 'PAT003',
      patientName: 'Michael Brown',
      appointmentId: 'APT-003',
      service: 'MRI Consultation',
      date: '2024-12-10',
      amount: 8000.00,
      status: 'overdue',
      method: null
    }
  ]);

  const filteredPayments = patientPayments.filter(p => {
    const matchesSearch = p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && p.status === (activeTab === 'upcoming' ? 'pending' : activeTab);
  });

  const getStatusStyle = (status) => {
    switch(status) {
      case 'paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Earnings & Billing
            </h1>
            <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Track your revenue and patient payments
            </p>
          </div>
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all">
            <FaDownload /> Export Report
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Earnings Cards */}
          <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-teal-100 text-teal-600 rounded-xl"><FaChartLine size={20} /></div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-100 px-2 py-1 rounded-lg">+12.5%</span>
            </div>
            <p className="text-sm opacity-70 font-medium">Total Earned</p>
            <h2 className="text-2xl font-bold mt-1">Rs. {doctorEarnings.totalEarned.toLocaleString()}</h2>
          </div>

          <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><FaClock size={20} /></div>
            </div>
            <p className="text-sm opacity-70 font-medium">Pending Payments</p>
            <h2 className="text-2xl font-bold mt-1 text-amber-500">Rs. {doctorEarnings.pendingPayments.toLocaleString()}</h2>
          </div>

          <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><FaCalendarAlt size={20} /></div>
            </div>
            <p className="text-sm opacity-70 font-medium">This Month</p>
            <h2 className="text-2xl font-bold mt-1">Rs. {doctorEarnings.thisMonthEarnings.toLocaleString()}</h2>
          </div>

          <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><FaBolt size={20} /></div>
            </div>
            <p className="text-sm opacity-70 font-medium">Avg. Per Visit</p>
            <h2 className="text-2xl font-bold mt-1">Rs. 4,500</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Table Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`rounded-2xl shadow-sm border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                  {['upcoming', 'paid', 'all'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${
                        activeTab === tab ? 'bg-white dark:bg-gray-600 text-teal-600 shadow-sm' : 'text-gray-500'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="relative w-full sm:w-64">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search patients..."
                    className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className={`text-xs uppercase font-bold ${darkMode ? 'bg-gray-900/50 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                    <tr>
                      <th className="px-6 py-4">Patient</th>
                      <th className="px-6 py-4">Service</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredPayments.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm">{p.patientName}</p>
                          <p className="text-xs opacity-60">ID: {p.id}</p>
                        </td>
                        <td className="px-6 py-4 text-sm">{p.service}</td>
                        <td className="px-6 py-4 font-bold text-sm">Rs. {p.amount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border uppercase ${getStatusStyle(p.status)}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-teal-600 hover:text-teal-700"><FaPrint /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className="font-bold mb-4 flex items-center gap-2"><FaBell className="text-amber-500" /> Quick Actions</h3>
              <div className="space-y-3">
                <button className={`w-full p-4 rounded-xl border flex items-center justify-between group hover:border-teal-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <span>Send Overdue Reminders</span>
                  <FaExclamationTriangle className="text-red-500" />
                </button>
                <button className={`w-full p-4 rounded-xl border flex items-center justify-between group hover:border-teal-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <span>Add New Service Rate</span>
                  <FaMoneyBill />
                </button>
              </div>
            </div>

            {/* Earnings Goal */}
            <div className={`rounded-2xl p-6 shadow-sm bg-gradient-to-br from-teal-500 to-teal-600 text-white`}>
              <h3 className="font-bold mb-2">Monthly Earnings Goal</h3>
              <p className="text-sm opacity-90 mb-4">Target: Rs. {MONTHLY_GOAL.toLocaleString()}</p>
              
              <div className="w-full bg-white/30 rounded-full h-3 mb-2">
                <div 
                  className="bg-white h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((doctorEarnings.totalEarned / MONTHLY_GOAL) * 100, 100)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Rs. {doctorEarnings.totalEarned.toLocaleString()}</span>
                <span>{Math.round((doctorEarnings.totalEarned / MONTHLY_GOAL) * 100)}%</span>
                <span>Rs. 8L</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorBilling;