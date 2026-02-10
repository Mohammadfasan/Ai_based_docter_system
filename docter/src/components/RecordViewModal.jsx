import React from 'react';
import { 
  FaTimes, FaFileMedical, FaCalendar, FaUserMd, 
  FaDownload, FaPrint, FaShareAlt, FaNotesMedical,
  FaPrescription, FaFlask, FaHeartbeat, FaPills
} from 'react-icons/fa';

const RecordViewModal = ({ isOpen, onClose, record }) => {
  if (!isOpen || !record) return null;

  const getRecordTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'lab test': return 'bg-purple-100 text-purple-800';
      case 'prescription': return 'bg-green-100 text-green-800';
      case 'surgery': return 'bg-red-100 text-red-800';
      case 'checkup': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'serious': return 'bg-orange-100 text-orange-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'mild': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Medical Record</h2>
              <p className="text-gray-600">Complete medical record details</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              <FaTimes />
            </button>
          </div>

          {/* Record Header */}
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <FaFileMedical className="text-teal-600 text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{record.type}</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecordTypeColor(record.type)}`}>
                      {record.type}
                    </span>
                    {record.severity && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(record.severity)}`}>
                        {record.severity}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">Record ID</div>
                <div className="font-mono font-bold text-gray-900">{record.id}</div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Basic Information */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h4>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center text-gray-600 mb-2">
                    <FaCalendar className="mr-2" />
                    <span className="text-sm font-medium">Date & Time</span>
                  </div>
                  <div className="font-medium text-gray-900">
                    {new Date(record.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-sm text-gray-600">{record.time}</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center text-gray-600 mb-2">
                    <FaUserMd className="mr-2" />
                    <span className="text-sm font-medium">Doctor</span>
                  </div>
                  <div className="font-medium text-gray-900">{record.doctorName}</div>
                  <div className="text-sm text-teal-600">{record.doctorSpecialization}</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center text-gray-600 mb-2">
                    <FaHeartbeat className="mr-2" />
                    <span className="text-sm font-medium">Department</span>
                  </div>
                  <div className="font-medium text-gray-900">{record.department}</div>
                  <div className="text-sm text-gray-600">Hospital: {record.hospital}</div>
                </div>
              </div>
            </div>

            {/* Diagnosis Section */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">Diagnosis</h4>
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <FaNotesMedical className="text-blue-600 mr-3" />
                  <h5 className="font-bold text-gray-900">Primary Diagnosis</h5>
                </div>
                <p className="text-gray-900 text-lg font-medium mb-2">{record.diagnosis}</p>
                <p className="text-gray-700">{record.diagnosisDetails}</p>
                
                {record.icdCode && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-700 mb-1">ICD-10 Code</div>
                    <code className="bg-white px-3 py-1 rounded-lg font-mono text-gray-900">
                      {record.icdCode}
                    </code>
                  </div>
                )}
              </div>
            </div>

            {/* Symptoms & Examination */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Symptoms Reported</h4>
                <div className="bg-gray-50 rounded-xl p-6">
                  <ul className="space-y-2">
                    {record.symptoms?.map((symptom, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-teal-500 mr-2">•</span>
                        <span className="text-gray-900">{symptom}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {record.symptomDuration && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm font-medium text-gray-700">Duration</div>
                      <div className="text-gray-900">{record.symptomDuration}</div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Examination Findings</h4>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="space-y-4">
                    {record.vitals && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Vital Signs</div>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(record.vitals).map(([key, value]) => (
                            <div key={key} className="text-center bg-white p-3 rounded-lg">
                              <div className="text-sm text-gray-600 capitalize">{key}</div>
                              <div className="font-bold text-gray-900">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {record.examinationNotes && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Physical Examination</div>
                        <p className="text-gray-900">{record.examinationNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Prescription & Lab Results */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FaPrescription className="mr-2" />
                  Prescription
                </h4>
                <div className="bg-green-50 rounded-xl p-6">
                  <div className="space-y-4">
                    {record.medications?.map((med, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold text-gray-900">{med.name}</div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {med.type}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><span className="font-medium">Dosage:</span> {med.dosage}</div>
                          <div><span className="font-medium">Frequency:</span> {med.frequency}</div>
                          <div><span className="font-medium">Duration:</span> {med.duration}</div>
                          {med.instructions && (
                            <div><span className="font-medium">Instructions:</span> {med.instructions}</div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {record.additionalInstructions && (
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <div className="text-sm font-medium text-gray-700 mb-2">Additional Instructions</div>
                        <p className="text-gray-900">{record.additionalInstructions}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FaFlask className="mr-2" />
                  Lab Results
                </h4>
                <div className="bg-purple-50 rounded-xl p-6">
                  {record.labResults?.length > 0 ? (
                    <div className="space-y-4">
                      {record.labResults.map((test, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div className="font-bold text-gray-900">{test.testName}</div>
                            <div className={`px-2 py-1 text-xs rounded ${
                              test.status === 'normal' ? 'bg-green-100 text-green-800' :
                              test.status === 'abnormal' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {test.status.toUpperCase()}
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Result:</span>
                              <span className="font-medium text-gray-900">{test.result}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Reference Range:</span>
                              <span className="text-gray-900">{test.referenceRange}</span>
                            </div>
                            {test.notes && (
                              <div className="text-gray-600 italic">Note: {test.notes}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaFlask className="text-3xl text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No lab results available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Doctor's Notes */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">Doctor's Notes</h4>
              <div className="bg-yellow-50 rounded-xl p-6">
                <div className="prose max-w-none">
                  {record.notes?.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-900 mb-3">
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                {record.followUp && (
                  <div className="mt-6 pt-6 border-t border-yellow-200">
                    <h5 className="font-bold text-gray-900 mb-2">Follow-up Recommendations</h5>
                    <div className="space-y-2">
                      {record.followUp.map((item, index) => (
                        <div key={index} className="flex items-start">
                          <FaPills className="text-teal-600 mt-1 mr-3 flex-shrink-0" />
                          <span className="text-gray-900">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Attachments */}
            {record.attachments && record.attachments.length > 0 && (
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Attachments</h4>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    {record.attachments.map((file, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                            <FaFileMedical className="text-teal-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{file.name}</div>
                            <div className="text-sm text-gray-500">{file.type} • {file.size}</div>
                          </div>
                        </div>
                        <button className="w-full mt-3 px-3 py-2 bg-teal-600 text-white text-sm rounded hover:bg-teal-700">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-8 border-t border-gray-200">
              <button className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors">
                <FaDownload />
                <span>Download PDF</span>
              </button>
              <button className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                <FaPrint />
                <span>Print Record</span>
              </button>
              <button className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                <FaShareAlt />
                <span>Share with Doctor</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

RecordViewModal.defaultProps = {
  record: {
    id: 'MR-2024-001',
    type: 'General Consultation',
    date: '2024-12-15',
    time: '2:30 PM',
    doctorName: 'Dr. Sarah Johnson',
    doctorSpecialization: 'General Physician',
    department: 'General Medicine',
    hospital: 'City General Hospital',
    diagnosis: 'Acute Upper Respiratory Infection',
    diagnosisDetails: 'Patient presents with fever, sore throat, and cough for 3 days. No significant medical history.',
    icdCode: 'J06.9',
    symptoms: ['Fever (101°F)', 'Sore throat', 'Dry cough', 'Fatigue'],
    symptomDuration: '3 days',
    vitals: {
      'BP': '120/80',
      'HR': '88',
      'Temp': '101°F',
      'SpO2': '98%'
    },
    examinationNotes: 'Throat mildly erythematous, no exudates. Lungs clear to auscultation. No lymphadenopathy.',
    medications: [
      {
        name: 'Amoxicillin',
        type: 'Antibiotic',
        dosage: '500mg',
        frequency: 'Three times daily',
        duration: '7 days',
        instructions: 'Take with food'
      },
      {
        name: 'Acetaminophen',
        type: 'Analgesic',
        dosage: '500mg',
        frequency: 'As needed for fever',
        duration: '3 days',
        instructions: 'Every 6 hours'
      }
    ],
    additionalInstructions: 'Rest, plenty of fluids, avoid cold beverages. Follow up if symptoms worsen.',
    labResults: [
      {
        testName: 'Complete Blood Count',
        result: 'Normal',
        referenceRange: 'See report',
        status: 'normal',
        notes: 'All parameters within normal limits'
      },
      {
        testName: 'CRP',
        result: '12 mg/L',
        referenceRange: '0-5 mg/L',
        status: 'abnormal',
        notes: 'Elevated, suggests inflammation'
      }
    ],
    notes: 'Patient is otherwise healthy. No allergies reported. Advised symptomatic treatment and antibiotics. Expected recovery in 5-7 days. Return if symptoms persist beyond 1 week.',
    followUp: [
      'Follow-up appointment in 1 week',
      'Complete antibiotic course',
      'Return if fever persists beyond 3 days'
    ],
    attachments: [
      { name: 'Lab_Report_001.pdf', type: 'PDF', size: '2.4 MB' },
      { name: 'Prescription_001.pdf', type: 'PDF', size: '1.8 MB' }
    ]
  }
};

export default RecordViewModal;