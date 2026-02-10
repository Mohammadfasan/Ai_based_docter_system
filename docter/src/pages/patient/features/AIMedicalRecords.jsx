// pages/AIMedicalRecords.jsx
import React, { useState } from 'react';
import { 
  FaFileMedical, FaChartLine, FaExclamationTriangle, 
  FaHeartbeat, FaThermometerHalf, FaWeight,
  FaTint, FaStethoscope, FaDownload, FaShareAlt 
} from 'react-icons/fa';

const AIMedicalRecords = () => {
  const [records, setRecords] = useState([
    {
      id: 1,
      type: 'Blood Test',
      date: '2024-12-15',
      aiInsights: 'Cholesterol slightly elevated, recommend follow-up in 3 months',
      riskLevel: 'Low',
      parameters: [
        { name: 'Hemoglobin', value: '14.2', unit: 'g/dL', normal: '13.5-17.5' },
        { name: 'Cholesterol', value: '210', unit: 'mg/dL', normal: '<200' },
        { name: 'Blood Sugar', value: '95', unit: 'mg/dL', normal: '70-100' }
      ]
    }
  ]);
  
  const [vitals, setVitals] = useState({
    bloodPressure: '120/80',
    heartRate: '72',
    temperature: '98.6°F',
    weight: '70kg',
    oxygenLevel: '98%'
  });
  
  const [aiTrends, setAiTrends] = useState([
    { metric: 'Blood Pressure', trend: 'Stable', change: '+2%', color: 'green' },
    { metric: 'Heart Rate', trend: 'Improving', change: '-5%', color: 'green' },
    { metric: 'Cholesterol', trend: 'Needs Attention', change: '+8%', color: 'yellow' }
  ]);
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical Records with AI Insights</h1>
          <p className="text-gray-600">AI-powered analysis of your health data</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg">
          <FaShareAlt />
          <span>Share with Doctor</span>
        </button>
      </div>
      
      {/* Vitals Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center space-x-2 mb-2">
            <FaHeartbeat className="text-red-500" />
            <span className="font-bold">Blood Pressure</span>
          </div>
          <div className="text-2xl font-bold">{vitals.bloodPressure}</div>
          <div className="text-sm text-gray-600">mmHg</div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center space-x-2 mb-2">
            <FaHeartbeat className="text-pink-500" />
            <span className="font-bold">Heart Rate</span>
          </div>
          <div className="text-2xl font-bold">{vitals.heartRate}</div>
          <div className="text-sm text-gray-600">BPM</div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center space-x-2 mb-2">
            <FaThermometerHalf className="text-orange-500" />
            <span className="font-bold">Temperature</span>
          </div>
          <div className="text-2xl font-bold">{vitals.temperature}</div>
          <div className="text-sm text-gray-600">°F</div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center space-x-2 mb-2">
            <FaWeight className="text-blue-500" />
            <span className="font-bold">Weight</span>
          </div>
          <div className="text-2xl font-bold">{vitals.weight}</div>
          <div className="text-sm text-gray-600">kg</div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center space-x-2 mb-2">
            <FaTint className="text-red-500" />
            <span className="font-bold">Oxygen</span>
          </div>
          <div className="text-2xl font-bold">{vitals.oxygenLevel}</div>
          <div className="text-sm text-gray-600">SpO2</div>
        </div>
      </div>
      
      {/* AI Trends Analysis */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FaChartLine className="text-2xl" />
            <h2 className="text-xl font-bold">AI Health Trends Analysis</h2>
          </div>
          <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
            Updated Today
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {aiTrends.map((trend, index) => (
            <div key={index} className="bg-white/20 p-4 rounded-lg">
              <div className="font-bold">{trend.metric}</div>
              <div className="flex items-center justify-between mt-2">
                <span>{trend.trend}</span>
                <span className={`font-bold ${
                  trend.color === 'green' ? 'text-green-300' :
                  trend.color === 'yellow' ? 'text-yellow-300' :
                  'text-red-300'
                }`}>
                  {trend.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Medical Records with AI Insights */}
      <div className="space-y-4">
        {records.map(record => (
          <div key={record.id} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-900">{record.type}</h3>
                <p className="text-gray-600">{record.date}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  record.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                  record.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {record.riskLevel} Risk
                </span>
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <FaDownload />
                </button>
              </div>
            </div>
            
            {/* AI Insights */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <FaStethoscope className="text-blue-600" />
                <span className="font-bold text-blue-800">AI Insights</span>
              </div>
              <p className="text-blue-700">{record.aiInsights}</p>
            </div>
            
            {/* Parameters */}
            <div className="grid md:grid-cols-3 gap-4">
              {record.parameters.map((param, index) => {
                const isNormal = param.name !== 'Cholesterol' || param.value <= 200;
                return (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{param.name}</span>
                      {!isNormal && (
                        <FaExclamationTriangle className="text-yellow-500" />
                      )}
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-2xl font-bold">{param.value}</div>
                        <div className="text-sm text-gray-600">{param.unit}</div>
                      </div>
                      <div className="text-sm text-gray-500">Normal: {param.normal}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ADD THIS LINE FOR DEFAULT EXPORT
export default AIMedicalRecords;