// pages/AIDoctorRecommendation.jsx
import React, { useState } from 'react';
import { FaRobot, FaBrain, FaStethoscope, FaUserMd, FaMagic } from 'react-icons/fa';

const AIDoctorRecommendation = () => {
  const [symptoms, setSymptoms] = useState('');
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  
  const analyzeSymptoms = () => {
    // AI analysis logic
    const analysis = {
      predictedConditions: ['Common Cold', 'Throat Infection'],
      confidence: 92,
      severity: 'Mild',
      urgency: 'Low',
      recommendedSpecialties: ['General Physician', 'ENT Specialist']
    };
    setAiAnalysis(analysis);
    
    // Get recommended doctors based on AI analysis
    const doctors = [
      {
        id: 1,
        name: 'Dr. Sarah Johnson',
        specialization: 'General Physician & ENT Specialist',
        matchScore: 95,
        aiReason: 'Specialized in throat infections, high success rate',
        availability: 'Today, 3:00 PM'
      }
    ];
    setRecommendedDoctors(doctors);
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <FaRobot className="text-3xl text-teal-600" />
        <h1 className="text-2xl font-bold text-gray-900">AI Doctor Recommendation</h1>
      </div>
      
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center space-x-3">
          <FaBrain className="text-2xl" />
          <div>
            <h2 className="text-xl font-bold">Smart Symptom Analysis</h2>
            <p>Describe your symptoms and get AI-powered doctor recommendations</p>
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">Describe Your Symptoms</h3>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="E.g., Fever, cough, sore throat for 3 days..."
            rows="5"
            className="w-full p-4 border border-gray-300 rounded-lg"
          />
          <button
            onClick={analyzeSymptoms}
            className="mt-4 w-full py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 flex items-center justify-center space-x-2"
          >
            <FaMagic />
            <span>Analyze with AI</span>
          </button>
        </div>
        
        {aiAnalysis && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">AI Analysis Results</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Confidence Score:</span>
                <span className="font-bold text-green-600">{aiAnalysis.confidence}%</span>
              </div>
              <div className="flex justify-between">
                <span>Predicted Conditions:</span>
                <span>{aiAnalysis.predictedConditions.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Severity:</span>
                <span className={`px-2 py-1 rounded ${
                  aiAnalysis.severity === 'High' ? 'bg-red-100 text-red-800' :
                  aiAnalysis.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {aiAnalysis.severity}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ADD THIS LINE FOR DEFAULT EXPORT
export default AIDoctorRecommendation;