// pages/HealthMonitor.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaHeartbeat, FaRunning, FaBed, FaAppleAlt, 
  FaFireAlt, FaTint, FaHeart, FaBrain, 
  FaChartLine, FaBell, FaSync, FaMobileAlt,
  FaBluetooth, FaClock, FaBatteryFull
} from 'react-icons/fa';

const HealthMonitor = () => {
  const [healthData, setHealthData] = useState({
    heartRate: 72,
    bloodPressure: '120/80',
    bloodOxygen: 98,
    steps: 8452,
    calories: 420,
    sleep: {
      deep: 3.5,
      light: 4.2,
      rem: 1.8,
      total: 9.5
    },
    ecg: 'Normal',
    stress: 42,
    hydration: 65,
    temperature: 98.6
  });

  const [connectedDevices, setConnectedDevices] = useState([
    { id: 1, name: 'Apple Watch Series 8', type: 'smartwatch', battery: 85, connected: true },
    { id: 2, name: 'Fitbit Charge 5', type: 'fitness-tracker', battery: 72, connected: true },
    { id: 3, name: 'Mi Band 7', type: 'band', battery: 90, connected: false }
  ]);

  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'Heart rate elevated for 10+ minutes', time: '10:30 AM' },
    { id: 2, type: 'info', message: 'Sleep quality improved by 15%', time: 'Yesterday' },
    { id: 3, type: 'alert', message: 'Low hydration level detected', time: 'Today, 9:00 AM' }
  ]);

  const [healthGoals, setHealthGoals] = useState({
    steps: 10000,
    sleep: 8,
    water: 2000,
    calories: 500
  });

  // Simulate real-time data updates
  useEffect(() => {
    if (realTimeUpdates) {
      const interval = setInterval(() => {
        setHealthData(prev => ({
          ...prev,
          heartRate: Math.floor(Math.random() * 20) + 65,
          steps: prev.steps + Math.floor(Math.random() * 50),
          bloodOxygen: 96 + Math.floor(Math.random() * 4)
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [realTimeUpdates]);

  const syncDevices = () => {
    alert('Syncing all connected devices...');
    // Simulate sync
    setTimeout(() => {
      alert('Sync completed!');
    }, 2000);
  };

  const getDeviceIcon = (type) => {
    switch(type) {
      case 'smartwatch': return '⌚';
      case 'fitness-tracker': return '🏃';
      case 'band': return '📱';
      default: return '📱';
    }
  };

  const getAlertColor = (type) => {
    switch(type) {
      case 'alert': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Health Monitor</h1>
        <p className="text-gray-600">Real-time tracking from your wearables</p>
      </div>

      {/* Connected Devices */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <FaBluetooth className="text-2xl" />
            <h2 className="text-xl font-bold">Connected Devices</h2>
          </div>
          <button
            onClick={syncDevices}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg"
          >
            <FaSync />
            <span>Sync Now</span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {connectedDevices.map(device => (
            <div key={device.id} className={`p-4 rounded-lg ${device.connected ? 'bg-white/20' : 'bg-white/10'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getDeviceIcon(device.type)}</span>
                  <div>
                    <div className="font-bold">{device.name}</div>
                    <div className="text-sm opacity-90">{device.type}</div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${device.connected ? 'bg-green-500' : 'bg-gray-500'}`}>
                  {device.connected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <FaBatteryFull />
                  <span>{device.battery}%</span>
                </div>
                <button className="text-sm hover:underline">
                  {device.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Health Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <FaHeartbeat className="text-red-500" />
              <span className="font-bold">Heart Rate</span>
            </div>
            <div className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
              Live
            </div>
          </div>
          <div className="text-3xl font-bold">{healthData.heartRate}</div>
          <div className="text-sm text-gray-600">BPM • Normal</div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 rounded-full" 
              style={{ width: `${(healthData.heartRate - 60) / 2}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center space-x-2 mb-2">
            <FaTint className="text-blue-500" />
            <span className="font-bold">Blood Oxygen</span>
          </div>
          <div className="text-3xl font-bold">{healthData.bloodOxygen}%</div>
          <div className="text-sm text-gray-600">SpO2 • Excellent</div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full" 
              style={{ width: `${healthData.bloodOxygen}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center space-x-2 mb-2">
            <FaRunning className="text-green-500" />
            <span className="font-bold">Steps</span>
          </div>
          <div className="text-3xl font-bold">{healthData.steps.toLocaleString()}</div>
          <div className="text-sm text-gray-600">
            {((healthData.steps / healthGoals.steps) * 100).toFixed(1)}% of goal
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full" 
              style={{ width: `${Math.min((healthData.steps / healthGoals.steps) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center space-x-2 mb-2">
            <FaFireAlt className="text-orange-500" />
            <span className="font-bold">Calories</span>
          </div>
          <div className="text-3xl font-bold">{healthData.calories}</div>
          <div className="text-sm text-gray-600">kcal burned</div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 rounded-full" 
              style={{ width: `${Math.min((healthData.calories / healthGoals.calories) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Sleep Tracking */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <FaBed className="text-2xl text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Sleep Analysis</h2>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{healthData.sleep.total}h</div>
            <div className="text-sm text-gray-600">Total Sleep</div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-indigo-50 rounded-lg">
            <div className="text-sm text-indigo-600 mb-1">Deep Sleep</div>
            <div className="text-2xl font-bold">{healthData.sleep.deep}h</div>
            <div className="text-xs text-gray-600">37% of total</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">Light Sleep</div>
            <div className="text-2xl font-bold">{healthData.sleep.light}h</div>
            <div className="text-xs text-gray-600">44% of total</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-purple-600 mb-1">REM Sleep</div>
            <div className="text-2xl font-bold">{healthData.sleep.rem}h</div>
            <div className="text-xs text-gray-600">19% of total</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Sleep Score</div>
            <div className="text-2xl font-bold">82</div>
            <div className="text-xs text-gray-600">/100 • Good</div>
          </div>
        </div>

        {/* Sleep Chart (Mock) */}
        <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <FaChartLine className="text-3xl text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Sleep pattern visualization</p>
            <p className="text-sm text-gray-500">8:00 PM - 6:30 AM</p>
          </div>
        </div>
      </div>

      {/* ECG & Advanced Metrics */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FaHeart className="text-2xl text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">ECG Monitoring</h2>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {healthData.ecg}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Last Reading</span>
              <span className="text-gray-600">Today, 8:30 AM</span>
            </div>
          </div>

          {/* ECG Graph Mock */}
          <div className="h-40 bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="relative h-full">
              {/* Simulated ECG line */}
              <div className="absolute inset-0">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 bg-red-500"
                    style={{
                      left: `${i * 4}%`,
                      height: `${20 + Math.sin(i * 0.5) * 15}%`,
                      top: `${40 + Math.sin(i * 0.3) * 30}%`
                    }}
                  ></div>
                ))}
              </div>
              <div className="absolute bottom-2 left-2 text-xs text-gray-500">Time</div>
              <div className="absolute top-2 right-2 text-xs text-gray-500">Amplitude</div>
            </div>
          </div>

          <button className="w-full mt-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Take ECG Reading
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FaBrain className="text-2xl text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Stress & Recovery</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium">Stress Level</span>
                <span className="font-bold">{healthData.stress}/100</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    healthData.stress < 30 ? 'bg-green-500' :
                    healthData.stress < 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${healthData.stress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {healthData.stress < 30 ? 'Low Stress' : 
                 healthData.stress < 70 ? 'Moderate Stress' : 'High Stress'}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium">Hydration</span>
                <span className="font-bold">{healthData.hydration}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${healthData.hydration}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {healthData.hydration < 50 ? 'Drink more water' : 'Good hydration'}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium">Body Temperature</span>
                <span className="font-bold">{healthData.temperature}°F</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    healthData.temperature > 99.5 ? 'bg-red-500' : 'bg-green-500'
                  } rounded-full`}
                  style={{ width: `${(healthData.temperature - 97) * 20}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {healthData.temperature > 99.5 ? 'Slightly elevated' : 'Normal'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Alerts */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <FaBell className="text-2xl text-yellow-600" />
            <h2 className="text-xl font-bold text-gray-900">Health Alerts</h2>
          </div>
          <label className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Real-time Updates</span>
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={realTimeUpdates}
                onChange={() => setRealTimeUpdates(!realTimeUpdates)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </div>
          </label>
        </div>

        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className={`p-4 border rounded-lg ${getAlertColor(alert.type)}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-sm opacity-80 mt-1">{alert.time}</p>
                </div>
                <button className="text-sm font-medium hover:underline">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="font-bold text-gray-900 mb-3">Health Goals</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FaRunning />
                <span className="font-medium">Daily Steps</span>
              </div>
              <div className="text-2xl font-bold">{healthGoals.steps.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Target</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FaBed />
                <span className="font-medium">Sleep</span>
              </div>
              <div className="text-2xl font-bold">{healthGoals.sleep}h</div>
              <div className="text-sm text-gray-600">Per night</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FaTint />
                <span className="font-medium">Water</span>
              </div>
              <div className="text-2xl font-bold">{healthGoals.water}ml</div>
              <div className="text-sm text-gray-600">Daily intake</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FaAppleAlt />
                <span className="font-medium">Calorie Burn</span>
              </div>
              <div className="text-2xl font-bold">{healthGoals.calories}</div>
              <div className="text-sm text-gray-600">Active calories</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthMonitor;