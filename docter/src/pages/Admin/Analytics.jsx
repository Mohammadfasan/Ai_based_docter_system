import React, { useState, useEffect } from 'react';
import {
  FaChartBar, FaChartLine, FaChartPie, FaUserMd, FaCalendarAlt,
  FaMoneyBillWave, FaStar, FaClock, FaUserFriends, FaArrowUp,
  FaArrowDown, FaCalendarCheck, FaVideo, FaStethoscope, FaFilter
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const Analytics = ({ userType, userData }) => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [loading, setLoading] = useState(true);

  // Appointment data for bar chart
  const appointmentData = [
    { month: 'Jan', video: 45, clinic: 32 },
    { month: 'Feb', video: 52, clinic: 38 },
    { month: 'Mar', video: 48, clinic: 41 },
    { month: 'Apr', video: 65, clinic: 45 },
    { month: 'May', video: 72, clinic: 52 },
    { month: 'Jun', video: 68, clinic: 48 },
    { month: 'Jul', video: 75, clinic: 55 },
    { month: 'Aug', video: 82, clinic: 61 },
    { month: 'Sep', video: 78, clinic: 58 },
    { month: 'Oct', video: 85, clinic: 64 },
    { month: 'Nov', video: 90, clinic: 68 },
    { month: 'Dec', video: 95, clinic: 72 },
  ];

  // Revenue data for line chart
  const revenueData = [
    { month: 'Jan', revenue: 8500 },
    { month: 'Feb', revenue: 9200 },
    { month: 'Mar', revenue: 8900 },
    { month: 'Apr', revenue: 11000 },
    { month: 'May', revenue: 12400 },
    { month: 'Jun', revenue: 11600 },
    { month: 'Jul', revenue: 13000 },
    { month: 'Aug', revenue: 14300 },
    { month: 'Sep', revenue: 13600 },
    { month: 'Oct', revenue: 14900 },
    { month: 'Nov', revenue: 15800 },
    { month: 'Dec', revenue: 16700 },
  ];

  // Patient age distribution for pie chart
  const ageData = [
    { name: '18-30', value: 25 },
    { name: '31-45', value: 35 },
    { name: '46-60', value: 25 },
    { name: '61+', value: 15 },
  ];

  // Consultation type distribution
  const consultationData = [
    { name: 'Video Consultation', value: 65 },
    { name: 'Clinic Visit', value: 35 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const CONSULTATION_COLORS = ['#8B5CF6', '#10B981'];

  const stats = [
    {
      label: 'Total Appointments',
      value: '167',
      change: '+12%',
      isPositive: true,
      icon: <FaCalendarCheck />,
      color: 'teal'
    },
    {
      label: 'Average Rating',
      value: '4.8',
      change: '+0.2',
      isPositive: true,
      icon: <FaStar />,
      color: 'yellow'
    },
    {
      label: 'Patient Satisfaction',
      value: '96%',
      change: '+3%',
      isPositive: true,
      icon: <FaUserFriends />,
      color: 'green'
    },
    {
      label: 'Avg Response Time',
      value: '15 min',
      change: '-5 min',
      isPositive: true,
      icon: <FaClock />,
      color: 'blue'
    },
  ];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive performance insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center space-x-2">
              <FaFilter />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600 text-sm mt-1">{stat.label}</div>
              </div>
              <div className="flex flex-col items-end">
                <div className={`p-3 rounded-xl bg-${stat.color}-100 mb-2`}>
                  <div className={`text-${stat.color}-600 text-lg`}>
                    {stat.icon}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${stat.isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {stat.isPositive ? <FaArrowUp className="inline mr-1" /> : <FaArrowDown className="inline mr-1" />}
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Appointments Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Appointments Overview</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Video</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-teal-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Clinic</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Bar dataKey="video" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clinic" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Revenue Trend</h3>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              +18% growth
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ stroke: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Patient Age Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Patient Age Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consultation Type Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Consultation Types</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={consultationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {consultationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CONSULTATION_COLORS[index % CONSULTATION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Metrics</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Appointment Completion</span>
                <span className="font-bold text-green-600">98%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Patient Satisfaction</span>
                <span className="font-bold text-green-600">96%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">On-time Appointments</span>
                <span className="font-bold text-blue-600">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Follow-up Rate</span>
                <span className="font-bold text-purple-600">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">4.8</div>
                <div className="text-gray-600">Overall Rating</div>
                <div className="flex justify-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar key={star} className="text-yellow-400 mx-0.5" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'Completed consultation', patient: 'John Smith', time: '2 hours ago', type: 'video' },
            { action: 'Added medical record', patient: 'Emma Wilson', time: '4 hours ago', type: 'record' },
            { action: 'Confirmed appointment', patient: 'Michael Chen', time: '1 day ago', type: 'appointment' },
            { action: 'Updated prescription', patient: 'Sarah Johnson', time: '2 days ago', type: 'prescription' },
            { action: 'Received 5-star review', patient: 'Robert Brown', time: '3 days ago', type: 'review' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${activity.type === 'video' ? 'bg-purple-100' : activity.type === 'record' ? 'bg-teal-100' : activity.type === 'appointment' ? 'bg-blue-100' : activity.type === 'prescription' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  {activity.type === 'video' && <FaVideo className="text-purple-600" />}
                  {activity.type === 'record' && <FaChartBar className="text-teal-600" />}
                  {activity.type === 'appointment' && <FaCalendarAlt className="text-blue-600" />}
                  {activity.type === 'prescription' && <FaStethoscope className="text-green-600" />}
                  {activity.type === 'review' && <FaStar className="text-yellow-600" />}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{activity.action}</div>
                  <div className="text-sm text-gray-600">with {activity.patient}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;