// pages/HealthInsurance.jsx
import React, { useState } from 'react';
import { 
  FaShieldAlt, FaFileInvoice, FaHospital, 
  FaCheckCircle, FaClock, FaMoneyBillWave,
  FaChartLine, FaDownload, FaShareSquare
} from 'react-icons/fa';

const HealthInsurance = () => {
  const [policies, setPolicies] = useState([
    {
      id: 1,
      provider: 'HealthGuard Insurance',
      policyNo: 'HG-2024-12345',
      coverage: '$50,000',
      premium: '$120/month',
      status: 'active',
      expiry: '2025-12-31'
    }
  ]);
  
  const [claims, setClaims] = useState([
    {
      id: 1,
      date: '2024-12-15',
      amount: '$1,200',
      status: 'approved',
      provider: 'City General Hospital',
      description: 'Hospitalization for fever'
    }
  ]);
  
  const [coverageDetails, setCoverageDetails] = useState({
    hospitalization: true,
    surgery: true,
    medication: true,
    diagnostics: true,
    emergency: true,
    maternity: false
  });
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Health Insurance</h1>
        <p className="text-gray-600">Manage your insurance policies and claims</p>
      </div>
      
      {/* Active Policy */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Active Insurance Policy</h2>
            <p className="opacity-90">Your current coverage details</p>
          </div>
          <div className="flex items-center space-x-2">
            <FaCheckCircle className="text-green-300" />
            <span className="font-bold">Active</span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm opacity-90">Provider</div>
            <div className="font-bold text-lg">{policies[0].provider}</div>
          </div>
          <div>
            <div className="text-sm opacity-90">Coverage Amount</div>
            <div className="font-bold text-lg">{policies[0].coverage}</div>
          </div>
          <div>
            <div className="text-sm opacity-90">Monthly Premium</div>
            <div className="font-bold text-lg">{policies[0].premium}</div>
          </div>
          <div>
            <div className="text-sm opacity-90">Policy Number</div>
            <div className="font-bold text-lg">{policies[0].policyNo}</div>
          </div>
        </div>
      </div>
      
      {/* Coverage Details */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Coverage Details</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(coverageDetails).map(([key, value]) => (
            <div key={key} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium capitalize">{key}</span>
                {value ? (
                  <FaCheckCircle className="text-green-500" />
                ) : (
                  <span className="text-red-500 text-sm">Not Covered</span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {value ? 'Covered under your policy' : 'Not included in coverage'}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Claims History */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Claim History</h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg">
            <FaFileInvoice />
            <span>File New Claim</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {claims.map(claim => (
            <div key={claim.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-bold text-gray-900">{claim.description}</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>{claim.date}</span>
                  <span>{claim.provider}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-gray-900">{claim.amount}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                    claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {claim.status}
                  </span>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <FaDownload />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default HealthInsurance;