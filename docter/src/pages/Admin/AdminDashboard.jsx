import React, { useState, useEffect } from 'react';
import { 
  FaUsers, FaUserMd, FaCalendarCheck, FaChartBar,
  FaDollarSign, FaBell, FaDownload, FaFilter,
  FaArrowUp, FaArrowDown, FaExclamationTriangle,
  FaCheckCircle, FaClock, FaHospital
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

const AdminDashboard = ({ userType, userData }) => {
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalUsers: 1542,
        totalDoctors: 48,
        totalAppointments: 324,
        revenue: 38450,
        pendingApprovals: 12,
        activePatients: 1234,
        appointmentRate: 24, // percentage
        revenueChange: 15, // percentage
        userGrowth: 8 // percentage
      });

      setRecentActivities([
        { id: 1, type: 'doctor_registration', title: 'New Doctor Registered', user: 'Dr. Robert Chen', time: '2 hours ago', status: 'pending' },
        { id: 2, type: 'appointment_booked', title: 'New Appointment Booked', user: 'John Smith', time: '3 hours ago', status: 'completed' },
        { id: 3, type: 'payment_received', title: 'Payment Received', amount: '$150', time: '5 hours ago', status: 'completed' },
        { id: 4, type: 'patient_registered', title: 'New Patient Registered', user: 'Emma Wilson', time: '1 day ago', status: 'completed' },
        { id: 5, type: 'doctor_approval', title: 'Doctor Approval Required', user: 'Dr. Lisa Garcia', time: '2 days ago', status: 'pending' },
        { id: 6, type: 'system_alert', title: 'System Maintenance', description: 'Scheduled for Sunday', time: '3 days ago', status: 'warning' }
      ]);

      setLoading(false);
    }, 1500);
  }, []);

  // Chart data
  const appointmentData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Appointments',
        data: [65, 59, 80, 81, 56, 55, 40, 70, 85, 90, 95, 120],
        borderColor: 'rgb(13, 148, 136)',
        backgroundColor: 'rgba(13, 148, 136, 0.1)',
        tension: 0.4
      }
    ]
  };

  const revenueData = {
    labels: ['Video', 'Clinic', 'Emergency', 'Follow-up', 'Checkup'],
    datasets: [
      {
        label: 'Revenue by Type',
        data: [12000, 18000, 5000, 8000, 4500],
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)',
          'rgba(13, 148, 136, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ]
      }
    ]
  };

  const userGrowthData = {
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {userData?.name || 'Admin'}. Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-gray-600">Total Users</div>
              <div className="flex items-center mt-2 text-sm">
                <FaArrowUp className="text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+{stats.userGrowth}%</span>
                <span className="text-gray-500 ml-2">from last month</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <FaUsers className="text-blue-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</div>
              <div className="text-gray-600">Active Doctors</div>
              <div className="flex items-center mt-2 text-sm">
                <span className="text-red-600 font-medium flex items-center">
                  <FaExclamationTriangle className="mr-1" />
                  {stats.pendingApprovals} pending
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <FaUserMd className="text-green-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</div>
              <div className="text-gray-600">This Month</div>
              <div className="flex items-center mt-2 text-sm">
                <FaArrowUp className="text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+{stats.appointmentRate}%</span>
                <span className="text-gray-500 ml-2">growth</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <FaCalendarCheck className="text-purple-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-2xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</div>
              <div className="text-gray-600">Monthly Revenue</div>
              <div className="flex items-center mt-2 text-sm">
                <FaArrowUp className="text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+{stats.revenueChange}%</span>
                <span className="text-gray-500 ml-2">from last month</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <FaDollarSign className="text-yellow-600 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Appointment Trends</h3>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <FaFilter className="inline mr-1" />
              Filter
            </button>
          </div>
          <div className="h-64">
            <Line data={appointmentData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Revenue Breakdown</h3>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <FaDownload className="inline mr-1" />
              Export
            </button>
          </div>
          <div className="h-64">
            <Pie data={revenueData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Additional Stats & Activities */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* User Growth */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">User Growth</h3>
          <div className="h-48">
            <Bar data={userGrowthData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Activities</h3>
            <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
              View All →
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="mr-3 mt-1">
                  {activity.status === 'pending' ? (
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <FaClock className="text-yellow-600" />
                    </div>
                  ) : activity.status === 'warning' ? (
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FaExclamationTriangle className="text-red-600" />
                    </div>
                  ) : (
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaCheckCircle className="text-green-600" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{activity.title}</div>
                  <div className="text-sm text-gray-600">
                    {activity.user && <span className="font-medium">{activity.user}</span>}
                    {activity.amount && <span className="font-medium">{activity.amount}</span>}
                    {activity.description && <span>{activity.description}</span>}
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">98%</div>
              <div className="text-sm text-gray-600">Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">2.4m</div>
              <div className="text-sm text-gray-600">Avg. Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="mt-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold">System Health</h3>
            <p className="opacity-90">All systems operational</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="font-medium">100% Uptime</span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="font-bold text-lg">API</div>
            <div className="text-sm opacity-90">Operational</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="font-bold text-lg">Database</div>
            <div className="text-sm opacity-90">Operational</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="font-bold text-lg">Video</div>
            <div className="text-sm opacity-90">Operational</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="font-bold text-lg">Payment</div>
            <div className="text-sm opacity-90">Operational</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;